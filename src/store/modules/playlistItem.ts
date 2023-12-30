import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ApiService } from 'mediashare/store/apis';
import { makeActions } from 'mediashare/store/factory';
import { reduceFulfilledState, reducePendingState, reduceRejectedState, thunkApiWithState } from 'mediashare/store/helpers';
import { CreatePlaylistItemDto, UpdatePlaylistItemDto, PlaylistItemDto } from 'mediashare/apis/media-svc/rxjs-api';
import { deleteFromStorage, getFromStorage } from 'mediashare/core/aws/storage';
import { forkJoin } from 'rxjs';

const mediaPlaceholder = 'https://mediashare0079445c24114369af875159b71aee1c04439-dev.s3.us-west-2.amazonaws.com/public/temp/background-comp.jpg';

// Define these in snake case or our converter won't work... we need to fix that
const playlistItemActionNames = ['get_playlist_item', 'add_playlist_item', 'update_playlist_item', 'share_playlist_item', 'remove_playlist_item'] as const;

export const playlistItemActions = makeActions(playlistItemActionNames);

export const getPlaylistItemById = createAsyncThunk(
  playlistItemActions.getPlaylistItem.type,
  async ({ uri, playlistItemId }: { uri: string; playlistItemId: string }, thunkApi) => {
    const { api } = thunkApiWithState(thunkApi);
    const result = await forkJoin({
      playlistItem: api.playlistItems.playlistItemControllerFindOne({ playlistItemId }).toPromise(),
      src: getFromStorage(uri),
    }).toPromise();
    // TODO: Update views, we don't have anything that handles playlist items
    // api.views.viewsControllerCreateMediaView({ playlistItemId }).pipe(take(1)).subscribe();
    return { playlistItem: result.playlistItem as PlaylistItemDto, src: result.src };
  }
);

export const addPlaylistItem = createAsyncThunk(playlistItemActions.addPlaylistItem.type, async (createPlaylistItemDto: CreatePlaylistItemDto, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).playlistItems.playlistItemControllerCreate({ createPlaylistItemDto }).toPromise();
});

export const updatePlaylistItem = createAsyncThunk(
  playlistItemActions.updatePlaylistItem.type,
  async (updatePlaylistItemDto: UpdatePlaylistItemDto, thunkApi) => {
    const { api } = thunkApiWithState(thunkApi);
    return await (api as ApiService).playlistItems
      .playlistItemControllerUpdate({
        playlistItemId: updatePlaylistItemDto._id,
        updatePlaylistItemDto,
      })
      .toPromise();
  }
);

export const sharePlaylistItem = createAsyncThunk(playlistItemActions.sharePlaylistItem.type, async (args: { id: string; userSub: string }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).shareItems
    // TODO: Fix this!
    /* .shareItemControllerShareMediaItem({
      playlistItemId: args.id,
      userSub: args.userSub,
    })
    .toPromise(); */
});

export const deletePlaylistItem = createAsyncThunk(playlistItemActions.removePlaylistItem.type, async (args: { id: string; key: string }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  const { id, key } = args;
  await deleteFromStorage(key);
  return await (api as ApiService).playlistItems.playlistItemControllerRemove({ playlistItemId: id }).toPromise();
});

export const setActivePlaylistItem = createAction<PlaylistItemDto, 'setActivePlaylistItem'>('setActivePlaylistItem');

export const clearActivePlaylistItem = createAction('clearActivePlaylistItem');

export interface PlaylistItemState {
  getPlaylistItem: string;
  loading: boolean;
  file: any;
  entity: PlaylistItemDto | undefined;
  mediaSrc: string;
  loaded: boolean;
  createState: 'submitting' | 'progress' | 'empty';
}

export const playlistItemInitialState: PlaylistItemState = {
  getPlaylistItem: null,
  entity: undefined,
  loading: false,
  file: null,
  mediaSrc: mediaPlaceholder,
  createState: 'empty',
  loaded: false,
};

const playlistItemSlice = createSlice({
  name: 'playlistItem',
  initialState: playlistItemInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPlaylistItemById.pending, (state) => ({
        ...state,
        entity: undefined,
        mediaSrc: mediaPlaceholder,
        loading: true,
        loaded: false,
      }))
      .addCase(getPlaylistItemById.rejected, (state) => ({ ...state, entity: undefined }))
      .addCase(getPlaylistItemById.fulfilled, (state, action) => ({
        ...state,
        entity: action.payload.playlistItem,
        mediaSrc: action.payload.src as string,
        loading: false,
        loaded: true,
      }))
      .addCase(addPlaylistItem.pending, reducePendingState())
      .addCase(addPlaylistItem.rejected, reduceRejectedState())
      .addCase(
        addPlaylistItem.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          getPlaylistItem: action.payload.uri,
          mediaSrc: mediaPlaceholder,
          loading: false,
          loaded: true,
        }))
      )
      // TODO: Finish implementing these!
      .addCase(updatePlaylistItem.pending, reducePendingState())
      .addCase(updatePlaylistItem.rejected, reduceRejectedState())
      .addCase(updatePlaylistItem.fulfilled, reduceFulfilledState())
      .addCase(sharePlaylistItem.pending, reducePendingState())
      .addCase(sharePlaylistItem.rejected, reduceRejectedState())
      .addCase(sharePlaylistItem.fulfilled, reduceFulfilledState())
      .addCase(deletePlaylistItem.pending, reducePendingState())
      .addCase(deletePlaylistItem.rejected, reduceRejectedState())
      .addCase(deletePlaylistItem.fulfilled, reduceFulfilledState())
      .addCase(setActivePlaylistItem, (state, action) => ({
        ...state,
        entity: action.payload,
        loading: false,
        loaded: true,
      }))
      .addCase(clearActivePlaylistItem, (state) => ({
        ...state,
        entity: undefined,
        createState: 'empty',
        loading: false,
        loaded: true,
      }));
  },
});

export default playlistItemSlice;
export const reducer = playlistItemSlice.reducer;
