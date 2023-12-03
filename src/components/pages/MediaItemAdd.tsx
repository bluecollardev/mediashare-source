import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { addMediaItem } from 'mediashare/store/modules/mediaItem';
import { CreateMediaItemDto, MediaVisibilityType } from 'mediashare/apis/media-svc/rxjs-api';
import { UploadResult } from 'mediashare/hooks/useUploader';
import { useMediaItems } from 'mediashare/hooks/navigation';
import { mapAvailableTags, mapSelectedTagKeysToTagKeyValue } from 'mediashare/store/modules/tags';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import {
  KeyboardAvoidingPageContent,
  PageActions,
  PageContainer,
  PageProps,
  ActionButtons,
  MediaCard,
  ExpoUploader,
  UploadPlaceholder,
} from 'mediashare/components/layout';
import { minLength, titleValidator, descriptionValidator, visibilityValidator } from 'mediashare/core/utils/validators';
import { theme } from 'mediashare/styles';
import Loader from '../loader/Loader';

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
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  
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
      <Loader loading={uploading}/>
      <KeyboardAvoidingPageContent>
        <ScrollView>
          <MediaCard
            title={title}
            description={description}
            mediaSrc={mediaUri}
            showImage={!!mediaUri}
            image={image}
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
                <ExpoUploader uploadMode="video" onUploadStart={onUploadStart} onUploadComplete={onUploadComplete}>
                  <UploadPlaceholder uploading={uploading} uploaded={!!mediaUri} buttonText="Upload Media" />
                </ExpoUploader>
              ) : (
                <ExpoUploader uploadMode="video" onUploadStart={onUploadStart} onUploadComplete={onUploadComplete}>
                  <Button icon="cloud-upload" mode="outlined" dark color={theme.colors.default} compact>
                    Replace Media
                  </Button>
                </ExpoUploader>
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

  async function onUploadComplete({ uri, thumbnail }: UploadResult) {
    setUploading(false);
    setMediaUri(uri || '');
    setImage(thumbnail);
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
      imageSrc: image,
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
    setImage('');
    setIsSaved(false);
    setUploading(false);
    await goToMediaItems();
  }

  function resetData() {
    setTitle('');
    setVisibility(MediaVisibilityType.Private);
    setSelectedTagKeys([] as any[]);
    setDescription('');
    setImage('');
  }

  function clearAndGoBack() {
    goToMediaItems().then();
    resetData();
  }
};

export default withLoadingSpinner((state) => {
  return state?.mediaItem?.loading || false;
})(withGlobalStateConsumer(MediaItemAdd));
