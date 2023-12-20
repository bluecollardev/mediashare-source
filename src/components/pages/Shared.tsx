import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { routeNames } from 'mediashare/routes';
import { useAppSelector } from 'mediashare/store';
import { loadCurrentUserConnections, removeUserConnections } from 'mediashare/store/modules/userConnections'
import { loadProfile } from 'mediashare/store/modules/profile';
import { sendEmail } from 'mediashare/store/modules/userConnections';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { useWindowDimensions, ScrollView, StyleSheet } from 'react-native';
import { FAB, Divider, Card, IconButton } from 'react-native-paper';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { useRouteWithParams, useViewProfileById } from 'mediashare/hooks/navigation';
import { useUser } from 'mediashare/hooks/useUser';
import { useSnack } from 'mediashare/hooks/useSnack';
import {
  PageContainer,
  PageActions,
  PageProps,
  ContactList,
  ActionButtons,
  AppDialog,
  PageContent,
} from 'mediashare/components/layout'
import { createRandomRenderKey } from 'mediashare/core/utils/uuid';
import { theme, components } from 'mediashare/styles';
import InviteModal from '../layout/InviteModal';
import { Auth } from 'aws-amplify';
import { logout } from 'mediashare/store/modules/user';
import { useFocusEffect } from '@react-navigation/native';
const actionModes = { delete: 'delete', default: 'default' };

export const Shared = ({ globalState }: PageProps) => {
  const dispatch = useDispatch();
  
  const editProfile = useRouteWithParams(routeNames.accountEdit);
  const viewProfileById = useViewProfileById();
  const { element, onToggleSnackBar, setMessage } = useSnack();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [openInvite, setInvite] = React.useState(false);

  const user = useUser();
  const userSub = user?.sub || null;
  const { build } = user;
  
  const contacts = useAppSelector((state) => state?.userConnections?.entities).filter((e) => e.sub != userSub);
  console.log(contacts);
  const [actionMode, setActionMode] = useState(actionModes.default);
  const [isSelectable, setIsSelectable] = useState(false);
  const [selectedConnections, setSelectedConnections] = React.useState([]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      loadData().then();
    }
  }, [isLoaded]);

  useFocusEffect(
    React.useCallback(() => {
      checkIfAccountIsDeactivated().then();
    }, []),
  );


  const [clearSelectionKey, setClearSelectionKey] = useState(createRandomRenderKey());
  useEffect(() => {
    clearCheckboxSelection();
  }, []);

  const [fabState, setFabState] = useState({ open: false });
  let fabActions = [];
  if (build.forFreeUser) {
    fabActions = [
      { icon: 'edit', label: `Edit`, onPress: () => editProfile({ userId: user._id }), color: theme.colors.text, style: { backgroundColor: theme.colors.accent } },
    ];
  } else if (build.forSubscriber) {
    fabActions = [
      { icon: 'person-remove', label: `Delete Contact`, onPress: () => activateDeleteMode(), color: theme.colors.text, style: { backgroundColor: theme.colors.error } },
      { icon: 'person-add', label: `Invite Contact`, onPress: () => setInvite(true), color: theme.colors.text, style: { backgroundColor: theme.colors.success } },
    ];
  } else if (build.forAdmin) {
    fabActions = [
      { icon: 'person-remove', label: `Delete Contact`, onPress: () => activateDeleteMode(), color: theme.colors.text, style: { backgroundColor: theme.colors.error } },
      { icon: 'person-add', label: `Invite Contact`, onPress: () => setInvite(true), color: theme.colors.text, style: { backgroundColor: theme.colors.success } },
    ];
  }
  return (
    <PageContainer>
      <PageContent>
        <InviteModal
          userId={user._id}
          showDialog={openInvite}
          // @ts-ignore
          onSubmit={async (data) => {
            try {
              await dispatch(sendEmail({ userId: userSub, email: data?.email }));
              setMessage(`Invitation sent to ${data?.email}`);
              onToggleSnackBar();
            } catch (error) {
              setMessage(error.message);
              onToggleSnackBar();
            }
          }}
          onDismiss={() => setInvite(false)}
        />
        <AppDialog
          key={`AppDialog-display-${showDeleteDialog as unknown as string}`}
          leftActionLabel="Cancel"
          rightActionLabel="Delete Connection"
          buttonColor={theme.colors.error}
          leftActionCb={() => closeDeleteDialog}
          rightActionCb={() => confirmConnectionsToDelete()}
          onDismiss={closeDeleteDialog}
          showDialog={showDeleteDialog}
          title="Delete Connection"
          subtitle="Are you sure you want to do this? This action is final and cannot be undone."
        />
        <Card elevation={0} style={styles.sectionHeader}>
          <Card.Title
            titleStyle={styles.sectionHeaderTitle}
            title="Contacts"
            right={(props) => (
              <IconButton iconColor={theme.colors.success} {...props} style={{ marginRight: 15 }} icon="person-add" onPress={() => setInvite(true)} />
            )}
          />
        </Card>
        {/* <Highlights highlights={state.highlights} /> */}
        <ScrollView style={{ height: '100%' }}>
          <ContactList
            key={clearSelectionKey}
            contacts={contacts}
            showGroups={false}
            showActions={!isSelectable}
            onViewDetail={viewProfileById}
            selectable={isSelectable}
            onChecked={updateSelection}
          />
        </ScrollView>
      </PageContent>
      {isSelectable && actionMode === actionModes.delete ? (
        <PageActions>
          <ActionButtons
            onPrimaryClicked={() => openDeleteDialog()}
            onSecondaryClicked={() => cancelConnectionsToDelete()}
            primaryLabel="Delete Connections"
            primaryButtonStyles={styles.deleteActionButton}
          />
        </PageActions>
      ) : null}
      {element}
      {!isSelectable ? (
        <FAB.Group
          visible={true}
          open={fabState.open}
          icon={fabState.open ? 'close' : 'more-vert'}
          actions={fabActions}
          color={theme.colors.text}
          fabStyle={{ backgroundColor: fabState.open ? theme.colors.default : theme.colors.primary, ...components.fab }}
          onStateChange={(open) => {
            // open && setOpen(!open);
            setFabState(open);
          }}
        />
      ) : null}
    </PageContainer>
  );

  async function checkIfAccountIsDeactivated() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const attributes = await Auth.userAttributes(user);
      const isDeactivated = attributes.find(
        (attribute) => attribute.getName() === 'custom:isDeactivated'
      ).getValue();
      if (isDeactivated === 'true') {
        Alert.alert('Account Deactivated', 'Your account has been deactivated.', [
          
          {
            text: 'OK',
            onPress: () => {
              logOut()
            },
          },
        ]);
      }
    } catch (error) {
    }
  }
  async function logOut() {
    await dispatch(logout());
  }
  async function loadData() {
    // @ts-ignore
    await dispatch(loadProfile(userSub));
    await dispatch(loadCurrentUserConnections());
    setIsLoaded(true);
  }

  function activateDeleteMode() {
    setActionMode(actionModes.delete);
    setIsSelectable(true);
  }

  function openDeleteDialog() {
    setShowDeleteDialog(true);
  }

  function closeDeleteDialog() {
    cancelConnectionsToDelete();
    setShowDeleteDialog(false);
  }

  async function confirmConnectionsToDelete() {
    await deleteConnections();
    closeDeleteDialog();
    setActionMode(actionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
  }

  function cancelConnectionsToDelete() {
    setActionMode(actionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
  }

  async function deleteConnections() {
    console.log(selectedConnections);
    await dispatch(removeUserConnections({ userId: userSub, connectionIds: selectedConnections }));
    setSelectedConnections([]);
    await dispatch(loadCurrentUserConnections());
  }

  function updateSelection(bool: boolean, connectionId: string) {
    bool
      ? setSelectedConnections((prevState) => [...prevState, connectionId])
      : setSelectedConnections((prevState) => [...prevState.filter((item) => item !== connectionId)]);
  }

  function clearCheckboxSelection() {
    const randomKey = createRandomRenderKey();
    setClearSelectionKey(randomKey);
    setSelectedConnections([]);
  }
};

export default withLoadingSpinner(undefined)(withGlobalStateConsumer(Shared));

const styles = StyleSheet.create({
  sectionHeader: {
    borderColor: 'transparent',
    marginTop: 5,
  },
  sectionHeaderTitle: {
    textAlign: 'left',
    fontWeight: 'normal',
    fontSize: 16,
  },
  deleteActionButton: {
    backgroundColor: theme.colors.error,
  },
});
