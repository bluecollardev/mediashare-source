import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { makeActions } from 'mediashare/store/factory';
import { ApiService } from 'mediashare/store/apis';
import { reduceFulfilledState, reducePendingState, reduceRejectedState, thunkApiWithState } from 'mediashare/store/helpers';
import { CreateMediaItemDto, UpdateMediaItemDto, MediaItemDto, MediaVisibilityType } from 'mediashare/apis/media-svc/rxjs-api';
import { AwsMediaItem } from 'mediashare/core/aws/aws-media-item.model';
import { getVideoPath, getImagePath, getUploadPath, awsUrl, KeyFactory } from 'mediashare/core/aws/key-factory';
import {
  copyStorage,
  deleteFromStorage,
  getFileExtension,
  getFromStorage,
  listStorage,
  sanitizeFolderName,
  sanitizeKey,
  titleFromKey,
  uploadMediaToS3,
  uploadImageToS3,
} from 'mediashare/core/aws/storage';

import { forkJoin } from 'rxjs';

import Config from 'mediashare/config';

const s3Url = Config.AwsUrl;
const mediaPlaceholder = 'https://mediashare0079445c24114369af875159b71aee1c04439-dev.s3.us-west-2.amazonaws.com/public/temp/background-comp.jpg';

const createFeedItemImage = async (key) => {
  try {
    // AWS will replace spaces with a '+' in the actual Object URL
    const fileUri = s3Url + getUploadPath(key.replace(/\s/g, '+'));
    console.log(`[createFeedItemImage] Creating image for file at ${fileUri}`);
    const sanitizedKey = sanitizeKey(key);
    return await uploadImageToS3({ fileUri, key: sanitizedKey });
  } catch (err) {
    console.log('[createFeedItemImage] createFeedItemImage failed');
    console.log(err);
  }
};

// Define these in snake case or our converter won't work... we need to fix that
const mediaItemActionNames = [
  'get_media_item',
  'create_media_item_image',
  'add_media_item',
  'update_media_item',
  'share_media_item',
  'remove_media_item',
  'upload_media_item',
  'get_feed_media_items',
  'save_feed_media_items',
] as const;

export const mediaItemActions = makeActions(mediaItemActionNames);

export const getMediaItemById = createAsyncThunk(mediaItemActions.getMediaItem.type, async ({ uri, mediaId }: { uri: string; mediaId: string }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  const result = await forkJoin({
    mediaItem: api.mediaItems.mediaItemControllerFindOne({ mediaId }).toPromise(),
    src: getFromStorage(uri),
  }).toPromise();
  // api.views.viewsControllerCreateMediaView({ mediaId }).pipe(take(1)).subscribe();
  return { mediaItem: result.mediaItem as MediaItemDto, src: result.src };
});

export const createImage = createAsyncThunk(mediaItemActions.createMediaItemImage.type, async ({ fileUri, key }: { fileUri: string; key: string }) => {
  return await uploadImageToS3({ fileUri, key });
});

export const addMediaItem = createAsyncThunk(
  mediaItemActions.addMediaItem.type,
  async (dto: Pick<CreateMediaItemDto, 'key' | 'title' | 'description' | 'summary' | 'visibility' | 'tags' | 'uri'>, thunkApi) => {
    const { api } = thunkApiWithState(thunkApi);
    const { uri: fileUri, title, visibility, tags = [], summary, description } = dto;
    try {
      const options = { description: dto.description, summary: dto.summary, contentType: 'video/mp4' };
      const sanitizedKey = sanitizeKey(`${title}.${getFileExtension(fileUri)}`);
      const { video, image } = await uploadMediaToS3({ fileUri, key: sanitizedKey, options });
      if (!video) {
        throw new Error('[addMediaItem] video upload to S3 failed');
      }
      if (!image) {
        console.warn('[addMediaItem] image generation failed');
      }

      const { videoKey } = KeyFactory(sanitizedKey);
      const createMediaItemDto: CreateMediaItemDto = {
        key: videoKey,
        title,
        description,
        summary,
        visibility: visibility || MediaVisibilityType.Private,
        tags: tags || [],
        imageSrc: awsUrl + getImagePath(sanitizedKey) + '.jpeg',
        // video: awsUrl + getVideoPath(sanitizedKey),
        uri: awsUrl + getVideoPath(sanitizedKey),
        isPlayable: true,
        eTag: '',
      };

      return await (api as ApiService).mediaItems.mediaItemControllerCreate({ createMediaItemDto }).toPromise();
    } catch (err) {
      console.log(err);
    }
  }
);

export const updateMediaItem = createAsyncThunk(mediaItemActions.updateMediaItem.type, async (updateMediaItemDto: UpdateMediaItemDto, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).mediaItems
    .mediaItemControllerUpdate({
      mediaId: updateMediaItemDto._id,
      updateMediaItemDto,
    })
    .toPromise();
});

export const shareMediaItem = createAsyncThunk(mediaItemActions.shareMediaItem.type, async (args: { id: string; userSub: string }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).shareItems
    .shareItemControllerShareMediaItem({
      mediaId: args.id,
      userSub: args.userSub,
    })
    .toPromise();
});

export const deleteMediaItem = createAsyncThunk(mediaItemActions.removeMediaItem.type, async (args: { id: string; key: string }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  const { id, key } = args;
  await deleteFromStorage(key);
  return await (api as ApiService).mediaItems.mediaItemControllerRemove({ mediaId: id }).toPromise();
});

export const getFeedMediaItems = createAsyncThunk(mediaItemActions.getFeedMediaItems.type, async () => {
  // TODO: Non-overlapping types here!
  const feedMediaItems = (await listStorage(getUploadPath())) as unknown as AwsMediaItem[];
  return feedMediaItems
    .filter((item) => item.key !== getUploadPath())
    .map((item) => ({
      etag: item.etag,
      size: typeof item.size === 'number' ? `${(item.size / (1024 * 1024)).toFixed(2)} MB` : '',
      lastModified: new Date(Date.parse(item.lastModified)).toDateString(),
      key: sanitizeFolderName(item.key, getUploadPath()),
    }));
});

export const saveFeedMediaItems = createAsyncThunk(mediaItemActions.saveFeedMediaItems.type, async ({ items }: { items: AwsMediaItem[] }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);

  const dtoPromises = items
    .map((item) => {
      // Copy storage will sanitize the 'to' key automatically
      const s3KeyString = item.key;
      copyStorage(s3KeyString);
      return item;
    })
    .map(async (item) => {
      const sanitizedKey = sanitizeKey(item.key);
      // TODO: Is there a better way to set the title?
      const automaticTitle = titleFromKey(item.key);
      // TODO: Fix the image? We're doing this two ways...
      // const imageUrl = await createFeedItemImage(item.key);
      await createFeedItemImage(item.key);
      const { videoKey } = KeyFactory(sanitizedKey);
      const createMediaItemDto: CreateMediaItemDto = {
        key: videoKey,
        title: automaticTitle,
        description: `${item.size} - ${item.lastModified}`,
        summary: '',
        visibility: MediaVisibilityType.Private,
        tags: [],
        imageSrc: awsUrl + getImagePath(sanitizedKey) + '.jpeg',
        // video: awsUrl + getVideoPath(sanitizedKey),
        uri: awsUrl + getVideoPath(sanitizedKey),
        isPlayable: true,
        eTag: item.etag,
      };
      // await deleteFromStorage(dto.title)), // TODO: DON'T DELETE THE ITEM FROM S3 STORAGE UPLOAD BUCKET UNTIL WE ARE READY FOR PROD
      return await (api as ApiService).mediaItems.mediaItemControllerCreate({ createMediaItemDto }).toPromise();
    });

  return await Promise.all(dtoPromises);
});

export const setActiveMediaItem = createAction<MediaItemDto, 'setActiveMediaItem'>('setActiveMediaItem');

export const clearActiveMediaItem = createAction('clearActiveMediaItem');

export interface MediaItemState {
  getMediaItem: string;
  loading: boolean;
  file: any;
  entity: MediaItemDto | undefined;
  mediaSrc: string;
  feed: { entities: AwsMediaItem[]; loading: boolean; loaded: boolean };
  loaded: boolean;
  createState: 'submitting' | 'progress' | 'empty';
}

export const mediaItemInitialState: MediaItemState = {
  getMediaItem: null,
  entity: undefined,
  loading: false,
  file: null,
  mediaSrc: mediaPlaceholder,
  createState: 'empty',
  feed: { entities: [] as AwsMediaItem[], loading: false, loaded: false },
  loaded: false,
};

const mediaItemSlice = createSlice({
  name: 'mediaItem',
  initialState: mediaItemInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMediaItemById.pending, (state) => ({
        ...state,
        entity: undefined,
        mediaSrc: mediaPlaceholder,
        loading: true,
        loaded: false,
      }))
      .addCase(getMediaItemById.rejected, (state) => ({ ...state, entity: undefined }))
      .addCase(getMediaItemById.fulfilled, (state, action) => ({
        ...state,
        entity: action.payload.mediaItem,
        mediaSrc: action.payload.src as string,
        loading: false,
        loaded: true,
      }))
      .addCase(createImage.fulfilled, (state, action) => ({
        ...state,
        mediaSrc: action.payload as string,
      }))
      .addCase(addMediaItem.pending, reducePendingState())
      .addCase(addMediaItem.rejected, reduceRejectedState())
      .addCase(
        addMediaItem.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          getMediaItem: action.payload.uri,
          mediaSrc: mediaPlaceholder,
          loading: false,
          loaded: true,
        }))
      )
      // TODO: Finish implementing these!
      .addCase(updateMediaItem.pending, reducePendingState())
      .addCase(updateMediaItem.rejected, reduceRejectedState())
      .addCase(updateMediaItem.fulfilled, reduceFulfilledState())
      .addCase(shareMediaItem.pending, reducePendingState())
      .addCase(shareMediaItem.rejected, reduceRejectedState())
      .addCase(shareMediaItem.fulfilled, reduceFulfilledState())
      .addCase(deleteMediaItem.pending, reducePendingState())
      .addCase(deleteMediaItem.rejected, reduceRejectedState())
      .addCase(deleteMediaItem.fulfilled, reduceFulfilledState())
      .addCase(
        getFeedMediaItems.pending,
        reducePendingState((state) => ({
          ...state,
          feed: { entities: [], loading: true, loaded: false },
        }))
      )
      .addCase(
        getFeedMediaItems.rejected,
        reduceRejectedState((state) => ({
          ...state,
          feed: { entities: [], loading: false, loaded: true },
        }))
      )
      .addCase(
        getFeedMediaItems.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          feed: { entities: Array.isArray(action.payload) ? action.payload : [], loading: false, loaded: true },
        }))
      )
      .addCase(saveFeedMediaItems.pending, reducePendingState())
      .addCase(saveFeedMediaItems.rejected, reduceRejectedState())
      .addCase(saveFeedMediaItems.fulfilled, reduceFulfilledState())
      .addCase(setActiveMediaItem, (state, action) => ({
        ...state,
        entity: action.payload,
        loading: false,
        loaded: true,
      }))
      .addCase(clearActiveMediaItem, (state) => ({
        ...state,
        entity: undefined,
        createState: 'empty',
        loading: false,
        loaded: true,
      }));
  },
});

export default mediaItemSlice;
export const reducer = mediaItemSlice.reducer;
