import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'mediashare/store';
import { removeShareItem, readShareItem, removeAllShareItems, findItemsSharedByMe, findItemsSharedWithMe } from 'mediashare/store/modules/shareItems';
import { loadProfile } from 'mediashare/store/modules/profile';
import { useProfile } from 'mediashare/hooks/useProfile';
import { useViewPlaylistById } from 'mediashare/hooks/navigation';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { FAB, Divider } from 'react-native-paper';
import {
  PageActions,
  PageContainer,
  PageProps,
  AccountCard,
  SharedList,
  ActionButtons,
  AppDialog,
  PageContent,
} from 'mediashare/components/layout'
// import { filterUnique } from 'mediashare/utils';
import { createRandomRenderKey } from 'mediashare/core/utils/uuid';
import { theme, components } from 'mediashare/styles';

interface SharedWithContactProps extends PageProps {}

const actionModes = { delete: 'delete', default: 'default' };

const SharedWithContact = ({ route }: SharedWithContactProps) => {
  const { userId } = route.params;

  const dispatch = useDispatch();

  const viewPlaylist = useViewPlaylistById({ disableEdit: true, disableControls: true });

  const profile = useProfile();

  const { username, firstName, lastName, email, phoneNumber, imageSrc } = profile || {};
  const fullName = firstName || lastName ? `${firstName} ${lastName}` : 'Unnamed User';

  const [actionMode, setActionMode] = useState(actionModes.default);
  const [isSelectable, setIsSelectable] = useState(false);
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [showUnshareDialog, setShowUnshareDialog] = useState(false);
  const [showUnshareItemDialog, setShowUnshareItemDialog] = useState(false);
  const [itemToUnshare, setItemToUnshare] = useState(undefined as string);

  const itemsSharedWithContact = (useAppSelector((state) => state?.shareItems?.sharedByMe?.entities) || []).filter((item) => item.sharedWithUserId === userId);

  useEffect(() => {
    dispatch(loadProfile(userId));
    dispatch(findItemsSharedByMe());
    dispatch(findItemsSharedWithMe());
  }, [userId]);

  const [clearSelectionKey, setClearSelectionKey] = useState(createRandomRenderKey());
  useEffect(() => {
    clearCheckboxSelection();
  }, []);

  const [fabState, setFabState] = useState({ open: false });
  const fabActions = [{ icon: 'rule', onPress: () => activateUnshareMode(), color: theme.colors.text, style: { backgroundColor: theme.colors.error } }];

  // @ts-ignore
  return (
    <PageContainer>
      <PageContent>
        <AppDialog
          key={showUnshareDialog as unknown as string}
          leftActionLabel="Cancel"
          rightActionLabel="Confirm"
          buttonColor={theme.colors.error}
          leftActionCb={() => closeUnshareDialog()}
          rightActionCb={() => confirmItemsToUnshare()}
          onDismiss={closeUnshareDialog}
          showDialog={showUnshareDialog}
          title="Revoke Access to All Selected"
          subtitle="Are you sure you want to do this? This action is final and cannot be undone."
        />
        <AppDialog
          key={showUnshareItemDialog as unknown as string}
          leftActionLabel="Cancel"
          rightActionLabel="Confirm"
          buttonColor={theme.colors.error}
          leftActionCb={() => closeUnshareItemDialog()}
          rightActionCb={() => confirmItemToUnshare()}
          onDismiss={closeUnshareItemDialog}
          showDialog={showUnshareItemDialog}
          title="Revoke Access to All Selected"
          subtitle="Are you sure you want to do this? This action is final and cannot be undone."
        />
      
        <AccountCard
          title={fullName}
          username={username}
          email={email}
          phoneNumber={phoneNumber}
          image={imageSrc}
          showActions={false}
          isCurrentUser={false}
        />
        <Divider />
        <SharedList
          key={clearSelectionKey}
          selectable={isSelectable}
          showActions={!isSelectable}
          onDelete={openUnshareItemDialog}
          onView={viewItem}
          sharedItems={itemsSharedWithContact}
          onChecked={updateSelection}
        />
      </PageContent>
      {isSelectable && actionMode === actionModes.delete ? (
        <PageActions>
          <ActionButtons
            onPrimaryClicked={openUnshareDialog}
            onSecondaryClicked={cancelItemsToUnshare}
            primaryLabel="Revoke Access to All Selected"
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
          fabStyle={{ backgroundColor: fabState.open ? theme.colors.default : theme.colors.primary, ...components.fab }}
          onStateChange={(open) => {
            setFabState(open);
          }}
        />
      ) : null}
    </PageContainer>
  );

  async function viewItem(playlistId: string, shareItemId: string) {
    await dispatch(readShareItem(shareItemId));
    await viewPlaylist({ playlistId });
  }

  function openUnshareItemDialog(shareItemId: string) {
    setItemToUnshare(shareItemId);
    setShowUnshareItemDialog(true);
  }

  function closeUnshareItemDialog() {
    setItemToUnshare(undefined);
    setShowUnshareItemDialog(false);
  }

  async function confirmItemToUnshare() {
    await unshareItem(itemToUnshare);
    closeUnshareItemDialog();
  }

  async function unshareItem(shareItemId: string) {
    await dispatch(removeShareItem(shareItemId));
    await dispatch(loadProfile(userId));
    await dispatch(findItemsSharedByMe());
    await dispatch(findItemsSharedWithMe());
  }

  async function activateUnshareMode() {
    setActionMode(actionModes.delete);
    setIsSelectable(true);
  }

  function openUnshareDialog() {
    setShowUnshareDialog(true);
  }

  function closeUnshareDialog() {
    cancelItemsToUnshare();
    setShowUnshareDialog(false);
  }

  async function confirmItemsToUnshare() {
    await unshareItems();
    closeUnshareDialog();
    setActionMode(actionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
  }

  function cancelItemsToUnshare() {
    setActionMode(actionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
  }

  async function unshareItems() {
    await dispatch(removeAllShareItems(selectedItems));
    await dispatch(findItemsSharedByMe());
    await dispatch(findItemsSharedWithMe());
    setSelectedItems([]);
  }

  function updateSelection(bool: boolean, shareItemId: string) {
    bool
      ? setSelectedItems((prevState) => [...prevState, shareItemId])
      : setSelectedItems((prevState) => [...prevState.filter((item) => item !== shareItemId)]);
  }

  function clearCheckboxSelection() {
    const randomKey = createRandomRenderKey();
    setClearSelectionKey(randomKey);
    setSelectedItems([]);
  }
};

export default withLoadingSpinner(undefined)(SharedWithContact);

const styles = StyleSheet.create({
  deleteActionButton: {
    backgroundColor: theme.colors.error,
  },
});
