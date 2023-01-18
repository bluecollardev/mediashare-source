import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { addMediaItem } from 'mediashare/store/modules/mediaItem';
import { CreateMediaItemDto, MediaVisibilityType } from 'mediashare/rxjs-api';
import { useMediaItems } from 'mediashare/hooks/navigation';
import { mapAvailableTags, mapSelectedTagKeysToTagKeyValue } from 'mediashare/store/modules/tags';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import {
  KeyboardAvoidingPageContent,
  PageActions,
  PageContainer,
  PageProps,
  ActionButtons,
  MediaCard,
  AppUpload,
  UploadPlaceholder,
} from 'mediashare/components/layout';
import { minLength, titleValidator, descriptionValidator, visibilityValidator, tagValidator } from 'mediashare/core/utils/validators';
import { theme } from 'mediashare/styles';

// @ts-ignore
export const MediaItemAdd = ({ globalState = { tags: [] } }: PageProps) => {
  const dispatch = useDispatch();

  // const author = useAppSelector((state) => state?.user?.entity?.username);
  const [title, setTitle] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState(MediaVisibilityType.Private);

  const { tags = [] } = globalState;
  const availableTags = useMemo(() => mapAvailableTags(tags).filter((tag) => tag.isMediaTag), []);
  const initialTagKeys = [];
  const [selectedTagKeys, setSelectedTagKeys] = useState(initialTagKeys);

  const [mediaUri, setMediaUri] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  // const mediaSrc = useAppSelector((state) => state?.mediaItem?.mediaSrc);
  const isValid = function () {
    return !titleValidator(title) && !descriptionValidator(description) && !visibilityValidator(visibility) && !minLength(1)(mediaUri);
  };

  const options = [];
  for (const value in MediaVisibilityType) {
    options.push(value);
  }

  const goToMediaItems = useMediaItems();

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <ScrollView>
          <MediaCard
            title={title}
            description={description}
            mediaSrc={mediaUri}
            showThumbnail={!!mediaUri}
            thumbnail={thumbnail}
            visibility={visibility}
            visibilityOptions={options}
            onVisibilityChange={(e: any) => {
              setVisibility(e);
            }}
            availableTags={availableTags}
            tags={selectedTagKeys}
            tagOptions={options}
            onTagChange={(e: any) => {
              setSelectedTagKeys(e);
            }}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            isEdit={true}
            isPlayable={true}
            topDrawer={() =>
              !mediaUri ? (
                <AppUpload uploadMode="video" onUploadStart={onUploadStart} onUploadComplete={onUploadComplete}>
                  <UploadPlaceholder uploading={uploading} uploaded={!!mediaUri} buttonText="Upload Media" />
                </AppUpload>
              ) : (
                <AppUpload uploadMode="video" onUploadStart={onUploadStart} onUploadComplete={onUploadComplete}>
                  <Button icon="cloud-upload" mode="outlined" dark color={theme.colors.default} compact>
                    Replace Media
                  </Button>
                </AppUpload>
              )
            }
          />
        </ScrollView>
      </KeyboardAvoidingPageContent>
      <PageActions>
        <ActionButtons onPrimaryClicked={saveItem} loading={isSaved} onSecondaryClicked={clearAndGoBack} primaryLabel="Save" disablePrimary={!isValid()} />
      </PageActions>
    </PageContainer>
  );

  async function onUploadStart() {
    setUploading(true);
    setMediaUri('');
  }

  async function onUploadComplete(media) {
    setUploading(false);
    setMediaUri(media.uri || '');
  }

  async function saveItem() {
    setIsSaved(true);
    // We only keep track of the tag key, we need to provide a { key, value } pair to to the API
    // Map keys using our tag keys in state... ideally at some point maybe we do this on the server
    const selectedTags = mapSelectedTagKeysToTagKeyValue(selectedTagKeys, availableTags);

    const dto: CreateMediaItemDto = {
      key: title,
      title,
      description,
      summary: '',
      thumbnail: thumbnail,
      isPlayable: true,
      uri: mediaUri,
      visibility: MediaVisibilityType[visibility],
      tags: selectedTags || [],
      eTag: '',
    };

    await dispatch(addMediaItem(dto));

    setVisibility(MediaVisibilityType.Private);
    setSelectedTagKeys([]);
    setDescription('');
    setThumbnail('');
    setIsSaved(false);
    goToMediaItems();
  }

  function resetData() {
    setTitle('');
    setVisibility(MediaVisibilityType.Private);
    setSelectedTagKeys([] as any[]);
    setDescription('');
    setThumbnail('');
  }

  function clearAndGoBack() {
    goToMediaItems().then();
    resetData();
  }
};

export default withLoadingSpinner((state) => {
  return !!state?.mediaItem?.loading || false;
})(withGlobalStateConsumer(MediaItemAdd));
