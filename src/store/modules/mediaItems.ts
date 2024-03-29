import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { makeActions } from 'mediashare/store/factory';
import { ApiService } from 'mediashare/store/apis';
import { reduceFulfilledState, reducePendingState, reduceRejectedState, thunkApiWithState } from 'mediashare/store/helpers';
import { MediaItemDto } from 'mediashare/apis/media-svc/rxjs-api';

// Define these in snake case or our converter won't work... we need to fix that
const mediaItemsActionNames = ['find_media_items', 'search_media_items', 'load_user_media_items', 'select_media_item', 'clear_media_items'] as const;

export const mediaItemsActions = makeActions(mediaItemsActionNames);

export const loadUserMediaItems = createAsyncThunk(mediaItemsActions.loadUserMediaItems.type, async (opts = undefined, thunkApi) => {
  console.log('loadUserMediaItems...');
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).user.userControllerGetUserMediaItems().toPromise();
});

export const findMediaItems = createAsyncThunk(mediaItemsActions.findMediaItems.type, async (args: { text?: string; tags?: string[] }, thunkApi) => {
  console.log('findMediaItems...');
  const { api } = thunkApiWithState(thunkApi);
  const { text, tags = [] } = args;
  // console.log(`Search media items args: ${JSON.stringify(args, null, 2)}`);
  // console.log(`Searching media items for: text -> [${text}, tags -> [${JSON.stringify(tags)}]`);
  return await (api as ApiService).mediaItems.mediaItemControllerFindAll({ text, tags }).toPromise();
});

export const searchMediaItems = createAsyncThunk(mediaItemsActions.searchMediaItems.type, async (args: { text?: string; tags?: string[] }, thunkApi) => {
  console.log('searchMediaItems...');
  const { api } = thunkApiWithState(thunkApi);
  const { text, tags = [] } = args;
  // console.log(`Search media items args: ${JSON.stringify(args, null, 2)}`);
  // console.log(`Searching media items for: text -> [${text}, tags -> [${JSON.stringify(tags)}]`);
  // TODO: Use a const!
  return await (api as ApiService).search.searchControllerFindAll({ target: 'media', text, tags }).toPromise();
});


export const selectMediaItem = createAction<{ isChecked: boolean; item: MediaItemDto }, typeof mediaItemsActions.selectMediaItem.type>(
  mediaItemsActions.selectMediaItem.type
);

export const clearMediaItems = createAction(mediaItemsActions.clearMediaItems.type);

export interface MediaItemsState {
  selected: MediaItemDto[];
  entities: MediaItemDto[];
  mediaItems: MediaItemDto[];
  loading: boolean;
  loaded: boolean;
}

export const mediaItemsInitialState: MediaItemsState = {
  selected: [],
  entities: [],
  mediaItems: [],
  loading: false,
  loaded: false,
};

const mediaItemsSlice = createSlice({
  name: 'mediaItems',
  initialState: mediaItemsInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(findMediaItems.pending, reducePendingState())
      .addCase(findMediaItems.rejected, reduceRejectedState())
      .addCase(
        findMediaItems.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          entities: action.payload,
          loading: false,
          loaded: true,
        }))
      )
      .addCase(searchMediaItems.pending, reducePendingState())
      .addCase(searchMediaItems.rejected, reduceRejectedState())
      .addCase(
        searchMediaItems.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          entities: action.payload,
          loading: false,
          loaded: true,
        }))
      )
      .addCase(loadUserMediaItems.pending, reducePendingState())
      .addCase(loadUserMediaItems.rejected, reduceRejectedState())
      .addCase(
        loadUserMediaItems.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          mediaItems: action.payload,
          loading: false,
          loaded: true,
        }))
      )
      .addCase(selectMediaItem, (state, action) => {
        const updateSelection = function (bool: boolean, item: MediaItemDto) {
          const { selected } = state;
          // Is it filtered?
          // @ts-ignore
          return bool ? selected.concat([item]) : selected.filter((item) => item._id !== item._id);
        };
        return { ...state, selected: updateSelection(action.payload.isChecked, action.payload.item), loading: false, loaded: true };
      })
      .addCase(clearMediaItems, (state) => ({
        // TODO: Shouldn't we be clearing selected media items?
        ...state,
        selected: [],
        loading: false,
        loaded: true,
        // ...state, entities: [], loading: false, loaded: true
      }));
  },
});

export default mediaItemsSlice;
export const reducer = mediaItemsSlice.reducer;
