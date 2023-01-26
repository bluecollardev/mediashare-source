import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { useAppSelector } from 'mediashare/store';
import {
  getPlaylistById,
  removeUserPlaylist,
  selectMappedPlaylistMediaItems,
  updateUserPlaylist,
  MappedPlaylistMediaItem,
} from 'mediashare/store/modules/playlist';
import { getUserPlaylists } from 'mediashare/store/modules/playlists';
import { mapAvailableTags, mapSelectedTagKeysToTagKeyValue } from 'mediashare/store/modules/tags';
import { usePlaylists, useRouteWithParams, useViewMediaItemById } from 'mediashare/hooks/navigation';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { View, Text, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
// import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import {
  PageContainer,
  KeyboardAvoidingPageContent,
  PageActions,
  PageProps,
  ActionButtons,
  ExpoUploader,
  MediaList,
  MediaCard,
  UploadPlaceholder,
  AppDialog,
} from 'mediashare/components/layout';
import { routeNames } from 'mediashare/routes';
import { createRandomRenderKey } from 'mediashare/core/utils/uuid';
import { PlaylistVisibilityType } from 'mediashare/rxjs-api';
import styles, { theme } from 'mediashare/styles';

const actionModes = { delete: 'delete', default: 'default' };

// @ts-ignore
const PlaylistEdit = ({ navigation, route, globalState = { tags: [] } }: PageProps) => {
  const dispatch = useDispatch();

  const addToPlaylist = useRouteWithParams(routeNames.chooseMediaForPlaylist);
  const viewMediaItem = useViewMediaItemById();
  const goToPlaylists = usePlaylists();

  const { playlistId } = route.params;

  // TODO: Can we rename 'selected' in state to 'entity'?
  const { loaded, selected } = useAppSelector((state) => state?.playlist);
  const [isLoaded, setIsLoaded] = useState(loaded);
  const [isSaved, setIsSaved] = useState(false);

  const [title, setTitle] = useState(selected?.title);
  const [description, setDescription] = useState(selected?.description);
  const [visibility, setVisibility] = useState(selected?.visibility as string);
  const [imageSrc, setImageSrc] = useState(selected?.imageSrc);

  const { tags = [] } = globalState;
  const availableTags = useMemo(() => mapAvailableTags(tags).filter((tag) => tag.isPlaylistTag), []);
  const initialPlaylistTags = getInitialPlaylistTags();
  const [selectedTagKeys, setSelectedTagKeys] = useState(initialPlaylistTags);

  const [actionMode, setActionMode] = useState(actionModes.default);
  const [isSelectable, setIsSelectable] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteItemsDialog, setShowDeleteItemsDialog] = useState(false);
  
  const playlistMediaItems: MappedPlaylistMediaItem[] = selectMappedPlaylistMediaItems(selected) || [];
  
  const options = [];
  for (const value in PlaylistVisibilityType) {
    options.push(value);
  }
  
  useEffect(() => {
    if (!isLoaded) {
      loadData().then();
    }
  }, [isLoaded]);

  const [clearSelectionKey, setClearSelectionKey] = useState(createRandomRenderKey());

  useEffect(() => {
    clearCheckboxSelection();
  }, []);
  
  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <AppDialog
          leftActionLabel="Cancel"
          rightActionLabel="Delete"
          leftActionCb={() => setShowDeleteDialog(false)}
          rightActionCb={() => deletePlaylist()}
          onDismiss={() => setShowDeleteDialog(false)}
          showDialog={showDeleteDialog}
          title="Delete Playlist"
          subtitle="Are you sure you want to do this? This action is final and cannot be undone."
          color={theme.colors.white}
          buttonColor={theme.colors.error}
        />
        <AppDialog
          leftActionLabel="Cancel"
          rightActionLabel="Delete"
          leftActionCb={() => setShowDeleteItemsDialog(false)}
          rightActionCb={async () => {
            setShowDeleteItemsDialog(false);
            await confirmDeletePlaylistItems();
          }}
          onDismiss={() => setShowDeleteItemsDialog(false)}
          showDialog={showDeleteItemsDialog}
          title="Delete Playlist Items"
          subtitle="Are you sure you want to do this? This action is final and cannot be undone."
          color={theme.colors.white}
          buttonColor={theme.colors.error}
        />
        <ScrollView>
          <MediaCard
            title={title}
            description={description}
            showImage={true}
            image={imageSrc}
            imageStyle={{
              // TODO: Can we do this automatically from video metadata?
              aspectRatio: 16 / 9,
            }}
            visibility={visibility}
            visibilityOptions={options}
            onVisibilityChange={(value: string | string[]) => {
              if (Array.isArray(value)) {
                setVisibility(value[0]);
              } else {
                setVisibility(value);
              }
            }}
            availableTags={availableTags}
            tags={selectedTagKeys}
            tagOptions={options}
            onTagChange={(values: any) => {
              setSelectedTagKeys(values);
            }}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            isEdit={true}
            isReadOnly={selectedItems && selectedItems.length > 0}
            topDrawer={() =>
              imageSrc ? (
                <View style={styles.itemControls}>
                  <View style={{ flex: 0, width: 54 }}>
                    <Button
                      icon="delete-forever"
                      mode="outlined"
                      dark
                      compact
                      textColor={theme.colors.white}
                      buttonColor={theme.colors.error}
                      style={styles.deleteItemButton}
                      onPress={() => setShowDeleteDialog(true)}
                    >
                      {' '}
                    </Button>
                  </View>
                  <View style={{ flex: 4 }}>
                    <ExpoUploader uploadMode="photo" onUploadComplete={onUploadComplete}>
                      <Button
                        icon="cloud-upload"
                        mode="outlined"
                        dark
                        textColor={theme.colors.white}
                        buttonColor={theme.colors.surface}
                        compact
                        uppercase={false}
                        style={styles.changeImageButton}
                        labelStyle={styles.changeImageButtonLabel}
                      >
                        <Text>Change Cover Photo</Text>
                      </Button>
                    </ExpoUploader>
                  </View>
                </View>
              ) : (
                <View style={styles.itemControls}>
                  <View style={{ flex: 1 }}>
                    <ExpoUploader uploadMode="photo" onUploadComplete={onUploadComplete}>
                      <UploadPlaceholder buttonText="Add Cover Photo" />
                    </ExpoUploader>
                  </View>
                </View>
              )
            }
          >
            <ActionButtons
              containerStyles={{ marginHorizontal: 0, marginBottom: 15 }}
              showSecondary={Array.isArray(playlistMediaItems) && playlistMediaItems.length > 0}
              secondaryIcon="remove"
              onSecondaryClicked={() => (!isSelectable ? activateDeleteMode() : cancelDeletePlaylistItems())}
              secondaryIconColor={isSelectable ? theme.colors.primary : theme.colors.disabled}
              disablePrimary={actionMode === actionModes.delete}
              primaryLabel="Add Playlist Items"
              primaryIcon={!(Array.isArray(playlistMediaItems) && playlistMediaItems.length > 0) ? 'playlist-add' : 'playlist-add'}
              onPrimaryClicked={() => addToPlaylist({ playlistId })}
            />
            <MediaList
              key={clearSelectionKey}
              list={playlistMediaItems}
              showImage={true}
              selectable={isSelectable}
              showActions={!isSelectable}
              onViewDetail={(item) => viewMediaItem({ mediaId: item._id, uri: item.uri })}
              addItem={onAddItem}
              removeItem={onRemoveItem}
            />
          </MediaCard>
        </ScrollView>
      </KeyboardAvoidingPageContent>
      <PageActions>
        {!isSelectable ? <ActionButtons loading={isSaved} onPrimaryClicked={savePlaylist} onSecondaryClicked={clearAndGoBack} primaryLabel="Save" /> : null}
        {isSelectable ? (
          <ActionButtons
            onPrimaryClicked={confirmDeletePlaylistItems}
            onSecondaryClicked={cancelDeletePlaylistItems}
            primaryLabel="Remove"
            primaryIconColor={theme.colors.error}
            primaryButtonStyles={{ backgroundColor: theme.colors.error }}
          />
        ) : null}
      </PageActions>
    </PageContainer>
  );

  function getInitialPlaylistTags() {
    return (
      selected?.tags
        ?.map((tag) => {
          return tag ? tag?.key : undefined;
        })
        .filter((tag) => !!tag) || []
    );
  }

  async function loadData() {
    await dispatch(getPlaylistById(playlistId));
    setIsLoaded(true);
  }

  function onUploadComplete(uri: string) {
    setImageSrc(uri);
  }

  async function savePlaylist() {
    setIsSaved(true);
    // @ts-ignore
    const mediaIds: string[] = selected.mediaItems.map((item) => item._id as string) || [];
    if (isSelectable) {
      const filtered = mediaIds.filter((id) => !selectedItems.includes(id));
      await saveWithIds(filtered);
    } else {
      await saveWithIds(mediaIds);
    }

    setIsLoaded(false);
    setIsSaved(false);
    // await loadData();
    goToPlaylists();
  }

  async function savePlaylistItems() {
    // We manage by mediaItemId, as the _id can be either a playlistItemId or a mediaItemId
    const mediaIds = playlistMediaItems.map((item) => item.mediaItemId) || [];
    if (isSelectable) {
      const filtered = mediaIds.filter((id) => !selectedItems.includes(id));
      await saveWithIds(filtered);
    } else {
      await saveWithIds(mediaIds);
    }

    setIsLoaded(false);
    await loadData();
  }

  async function saveWithIds(mediaIds: string[]) {
    // We only keep track of the tag key, we need to provide a { key, value } pair to to the API
    // Map keys using our tag keys in state... ideally at some point maybe we do this on the server
    const selectedTags = mapSelectedTagKeysToTagKeyValue(selectedTagKeys, availableTags);

    await dispatch(
      updateUserPlaylist({
        _id: selected._id,
        title,
        description,
        mediaIds,
        visibility: visibility as PlaylistVisibilityType,
        tags: (selectedTags || []) as any[],
        imageSrc,
      })
    );
  }
  
  function onAddItem(selected: MappedPlaylistMediaItem) {
    console.log(`onAddItem`);
    console.log(selected);
    const updatedItems = selectedItems.concat([selected.mediaItemId]);
    setSelectedItems(updatedItems);
  }
  
  function onRemoveItem(selected: MappedPlaylistMediaItem) {
    console.log(`onRemoveItem`);
    console.log(selected);
    const updatedItems = selectedItems.filter((item) => item !== selected.mediaItemId);
    setSelectedItems(updatedItems);
  }

  function clearCheckboxSelection() {
    const randomKey = createRandomRenderKey();
    setClearSelectionKey(randomKey);
  }

  function activateDeleteMode() {
    setActionMode(actionModes.delete);
    setIsSelectable(true);
  }

  async function deletePlaylist() {
    await dispatch(removeUserPlaylist(playlistId));
    await dispatch(getUserPlaylists());
    await goToPlaylists();
  }
  
  async function confirmDeletePlaylistItems() {
    await savePlaylistItems();
    setActionMode(actionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
    resetData();
  }
  
  function cancelDeletePlaylistItems() {
    setActionMode(actionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
    resetData();
  }

  function resetData() {
    setSelectedItems([]);
  }

  function clearAndGoBack() {
    navigation.goBack();
    resetData();
  }
};

export default withLoadingSpinner(undefined)(withGlobalStateConsumer(PlaylistEdit));
