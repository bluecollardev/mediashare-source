import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ScrollView, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { useRouteWithParams } from 'mediashare/hooks/navigation';
import { UploadResult } from 'mediashare/hooks/useUploader';
import { routeNames } from 'mediashare/routes';
import { useAppSelector } from 'mediashare/store';
import { getPlaylistById, addUserPlaylist } from 'mediashare/store/modules/playlist';
import { getUserPlaylists } from 'mediashare/store/modules/playlists';
import { mapAvailableTags, mapSelectedTagKeysToTagKeyValue } from 'mediashare/store/modules/tags';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { titleValidator, descriptionValidator, visibilityValidator } from 'mediashare/core/utils/validators';
// import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import {
  PageContainer,
  KeyboardAvoidingPageContent,
  PageActions,
  PageProps,
  ActionButtons,
  MediaCard,
  ExpoUploader,
  UploadPlaceholder,
} from 'mediashare/components/layout';
import { CreatePlaylistDto, PlaylistVisibilityType } from 'mediashare/rxjs-api';
import styles, { theme } from 'mediashare/styles';

// @ts-ignore
const PlaylistAdd = ({ navigation, globalState = { tags: [] } }: PageProps) => {
  const dispatch = useDispatch();

  const author = useAppSelector((state) => state?.user?.entity?.username);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState();
  const [visibility, setVisibility] = useState(PlaylistVisibilityType.Private);
  const [isSaved, setIsSaved] = useState(false);

  const { tags = [] } = globalState;
  const availableTags = useMemo(() => mapAvailableTags(tags).filter((tag) => tag.isPlaylistTag), []);
  const initialTagKeys = [];
  const [selectedTagKeys, setSelectedTagKeys] = useState(initialTagKeys);
  
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const edit = useRouteWithParams(routeNames.playlistEdit);

  const isValid = function () {
    return !titleValidator(title) && !descriptionValidator(description) && !visibilityValidator(visibility);
  };

  const options = [];

  for (const value in PlaylistVisibilityType) {
    options.push(value);
  }

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <ScrollView>
          <MediaCard
            title={title}
            description={description}
            showImage={!!image}
            image={image}
            visibility={visibility}
            visibilityOptions={options}
            onVisibilityChange={setVisibility as any}
            availableTags={availableTags}
            tags={selectedTagKeys}
            tagOptions={options}
            onTagChange={(e: any) => {
              setSelectedTagKeys(e);
            }}
            onTitleChange={setTitle as any}
            onDescriptionChange={setDescription as any}
            isEdit={true}
            topDrawer={() =>
              !image ? (
                <ExpoUploader uploadMode="photo" onUploadStart={onUploadStart} onUploadComplete={onUploadComplete}>
                  <UploadPlaceholder uploading={uploading} uploaded={!!image} buttonText="Add Cover Photo" />
                </ExpoUploader>
              ) : (
                <ExpoUploader uploadMode="photo" onUploadStart={onUploadStart} onUploadComplete={onUploadComplete}>
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
              )
            }
          />
        </ScrollView>
      </KeyboardAvoidingPageContent>
      <PageActions>
        <ActionButtons loading={isSaved} onPrimaryClicked={savePlaylist} onSecondaryClicked={clearAndGoBack} primaryLabel="Save" disablePrimary={!isValid()} />
      </PageActions>
    </PageContainer>
  );
  
  async function onUploadStart() {
    setUploading(true);
    setImage('');
  }
  
  async function onUploadComplete({ uri }: UploadResult) {
    setUploading(false);
    setImage(uri);
  }

  async function savePlaylist() {
    setIsSaved(true);
    // We only keep track of the tag key, we need to provide a { key, value } pair to to the API
    // Map keys using our tag keys in state... ideally at some point maybe we do this on the server
    const selectedTags = mapSelectedTagKeysToTagKeyValue(selectedTagKeys, availableTags);

    const dto: CreatePlaylistDto = {
      cloneOf: undefined,
      title,
      description,
      imageSrc: image,
      visibility: visibility,
      tags: selectedTags || [],
      mediaIds: [],
    };

    // @ts-ignore TODO: Fix types on dispatch?
    const { payload } = await dispatch(addUserPlaylist(dto)) as any;
    const playlistId = payload._id;
    await dispatch(getUserPlaylists());
    await dispatch(getPlaylistById(playlistId));
    setIsSaved(false);
    await editPlaylist(playlistId);
  }

  async function editPlaylist(playlistId) {
    edit({ playlistId });
  }

  function resetData() {
    setTitle('');
    setVisibility(PlaylistVisibilityType.Private);
    setSelectedTagKeys([]);
    // @ts-ignore
    setDescription('');
  }

  function clearAndGoBack() {
    navigation.goBack();
    resetData();
  }
};

export default withLoadingSpinner(undefined)(withGlobalStateConsumer(PlaylistAdd));
