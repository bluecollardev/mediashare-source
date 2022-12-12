import React, { useEffect, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import * as R from 'remeda';
import Config from 'mediashare/config';
import { routeNames } from 'mediashare/routes';
import { useAppSelector } from 'mediashare/store';
import { thumbnailRoot } from 'mediashare/core/aws/key-factory';
import { fetchAndPutToS3 } from 'mediashare/core/aws/storage';
import { logout } from 'mediashare/store/modules/user';
import { loadUserConnections, removeUserConnections } from 'mediashare/store/modules/userConnections'
import { loadProfile } from 'mediashare/store/modules/profile';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { useWindowDimensions, ScrollView, StyleSheet } from 'react-native';
import { FAB, Divider, Card, IconButton } from 'react-native-paper';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { useRouteWithParams, useViewProfileById } from 'mediashare/hooks/navigation';
import { useUser } from 'mediashare/hooks/useUser';
import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import { PageContainer, PageActions, PageProps, ContactList, ActionButtons, AccountCard, AppDialog } from 'mediashare/components/layout';
import { createRandomRenderKey } from 'mediashare/core/utils/uuid';
import { theme } from 'mediashare/styles';
import ModalSheet from '../layout/InviteModal';

const actionModes = { delete: 'delete', default: 'default' };
const awsUrl = Config.AWS_URL;

export const Network = ({ globalState }: PageProps) => {
  const dispatch = useDispatch();
  
  const editProfile = useRouteWithParams(routeNames.accountEdit);
  const viewProfileById = useViewProfileById();
  const layout = useWindowDimensions();
  const [isLoaded, setIsLoaded] = useState(false);
  const [openInvite, setInvite] = React.useState(false);

  const user = useUser();
  const userId = user?._id || null;
  const { username, firstName, lastName, email, phoneNumber, likesCount, sharesCount, sharedCount, build } = user;
  const fullName = firstName || lastName ? `${firstName} ${lastName}` : 'Unnamed User';
  const [state, setState] = useState(R.pick(user, ['firstName', 'email', 'lastName', 'phoneNumber', 'imageSrc']));

  const contacts = useAppSelector((state) => state?.userConnections?.entities).filter((e) => e._id != userId);
  const [actionMode, setActionMode] = useState(actionModes.default);
  const [isSelectable, setIsSelectable] = useState(false);
  const [selectedConnections, setSelectedConnections] = React.useState([]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      loadData().then();
    }
  }, [isLoaded]);

  const [clearSelectionKey, setClearSelectionKey] = useState(createRandomRenderKey());
  useEffect(() => {
    clearCheckboxSelection();
  }, []);

  const [fabState, setFabState] = useState({ open: false });
  let fabActions = [];
  if (build.forFreeUser) {
    fabActions = [
      { icon: 'logout', onPress: () => accountLogout(), color: theme.colors.text, style: { backgroundColor: theme.colors.primary } },
      { icon: 'edit', onPress: () => editProfile({ userId: user._id }), color: theme.colors.text, style: { backgroundColor: theme.colors.accent } },
    ];
  } else if (build.forSubscriber) {
    fabActions = [
      { icon: 'logout', onPress: () => accountLogout(), color: theme.colors.text, style: { backgroundColor: theme.colors.primary } },
      { icon: 'person-remove', onPress: () => activateDeleteMode(), color: theme.colors.text, style: { backgroundColor: theme.colors.error } },
      { icon: 'edit', onPress: () => editProfile({ userId: user._id }), color: theme.colors.text, style: { backgroundColor: theme.colors.accent } },
    ];
  } else if (build.forAdmin) {
    fabActions = [
      { icon: 'logout', onPress: () => accountLogout(), color: theme.colors.text, style: { backgroundColor: theme.colors.primary } },
      { icon: 'person-remove', onPress: () => activateDeleteMode(), color: theme.colors.text, style: { backgroundColor: theme.colors.error } },
      { icon: 'edit', onPress: () => editProfile({ userId: user._id }), color: theme.colors.text, style: { backgroundColor: theme.colors.accent } },
    ];
  }
  return (
    <PageContainer>
      <ModalSheet userId={user._id} showDialog={openInvite} onDismiss={() => setInvite(false)} />
      <AppDialog
        key={showDeleteDialog as unknown as string}
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
      <AccountCard
        title={fullName}
        username={username}
        email={email}
        phoneNumber={phoneNumber}
        image={user.imageSrc}
        likes={likesCount}
        shared={sharedCount}
        shares={sharesCount}
        showSocial={false}
        showActions={false}
        isCurrentUser={true}
        onProfileImageClicked={() => getDocument()}
      />
      <Divider />
      <Card elevation={0} style={styles.sectionHeader}>
        <Card.Title
          titleStyle={styles.sectionHeaderTitle}
          title="My Connections"
          right={(props) => (
            <IconButton iconColor={theme.colors.success} {...props} style={{ marginRight: 15 }} icon="person-add" onPress={() => setInvite(true)} />
          )}
        />
      </Card>
      {/* <Highlights highlights={state.highlights} /> */}
      {!build.forFreeUser ? (
        <ScrollView style={{ width: layout.width, height: layout.height }}>
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
      ) : null}
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
      {!isSelectable ? (
        <FAB.Group
          visible={true}
          open={fabState.open}
          icon={fabState.open ? 'close' : 'more-vert'}
          actions={fabActions}
          color={theme.colors.text}
          fabStyle={{ backgroundColor: fabState.open ? theme.colors.default : theme.colors.primary }}
          onStateChange={(open) => {
            // open && setOpen(!open);
            setFabState(open);
          }}
        />
      ) : null}
    </PageContainer>
  );

  async function loadData() {
    await dispatch(loadUserConnections());
    // @ts-ignore
    const profile = (await dispatch(loadProfile(userId))) as any;
    setState(profile.payload);
    setIsLoaded(true);
  }

  async function getDocument() {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5, maxWidth: 400, maxHeight: 400 }, function (res) {
      if (!res.assets) {
        return;
      }
      const image = res.assets[0];
      const thumbnailKey = thumbnailRoot + image.fileName;
      fetchAndPutToS3({ key: thumbnailKey, fileUri: image.uri, options: { contentType: image.type } }).then((res: { key: string }) => {
        // eslint-disable-next-line no-shadow
        const image = awsUrl + res.key;
        setState({ ...state, imageSrc: image });
      });
    });
  }

  /* function save() {
    const updateUserDto = state;
    // @ts-ignore
    from(dispatch(updateAccount({ updateUserDto, userId })))
      .pipe(
        // @ts-ignore
        switchMap(() => dispatch(loadProfile(userId))),
        // @ts-ignore
        switchMap(() => dispatch(loadUser())),
        take(1)
      )
      .subscribe(() => viewAccount({ userId }));
  } */

  async function accountLogout() {
    await dispatch(logout());
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
    await dispatch(removeUserConnections({ userId, connectionIds: selectedConnections }));
    setSelectedConnections([]);
    await dispatch(loadUserConnections());
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

export default withLoadingSpinner(undefined)(withGlobalStateConsumer(Network));

const styles = StyleSheet.create({
  sectionHeader: {
    borderColor: 'transparent',
    marginTop: 5,
  },
  sectionHeaderTitle: {
    textAlign: 'center',
    fontWeight: 'normal',
    fontSize: 16,
    marginLeft: 60,
  },
  deleteActionButton: {
    backgroundColor: theme.colors.error,
  },
});
