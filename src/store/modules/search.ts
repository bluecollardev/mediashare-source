import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { makeActions } from 'mediashare/store/factory';
import { reduceFulfilledState, reducePendingState, reduceRejectedState } from 'mediashare/store/helpers';
import { ApiService } from 'mediashare/store/apis';
import { PlaylistResponseDto } from 'mediashare/rxjs-api';

// Define these in snake case or our converter won't work... we need to fix that
const searchActionNames = ['search', 'select', 'clear'] as const;

export const searchActions = makeActions(searchActionNames);

export const search = createAsyncThunk(searchActions.search.type, async (args: { target?: string; text?: string; tags?: string[] }, { extra }) => {
  const { api } = extra as { api: ApiService };
  const { target, text, tags = [] } = args;
  // console.log(`Search playlists args: ${JSON.stringify(args, null, 2)}`);
  // console.log(`Searching playlists for: text -> [${text}, tags -> [${JSON.stringify(tags)}]`);
  return await api.search.searchControllerFindAll({ target, text, tags }).toPromise();
});

export const select = createAction<{ isChecked: boolean; plist: PlaylistResponseDto }, typeof searchActions.select.type>(
  searchActions.select.type
);

export const clear = createAction(searchActions.clear.type);

// TODO: Update these types, we handle more than just playlists
export interface SearchState {
  entities: PlaylistResponseDto[];
  selected: PlaylistResponseDto[];
  loading: boolean;
  loaded: boolean;
}

export const searchInitialState: SearchState = {
  entities: [],
  selected: [],
  loading: false,
  loaded: false,
};

const searchSlice = createSlice({
  name: 'search',
  initialState: searchInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(search.pending, reducePendingState())
      .addCase(search.rejected, reduceRejectedState())
      .addCase(
        search.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          entities: action.payload,
          loading: false,
          loaded: true,
        }))
      )
      .addCase(select, (state, action) => {
        const updateSelection = (bool: boolean, item: PlaylistResponseDto) => {
          const { selected } = state;
          // @ts-ignore
          return bool ? selected.concat([item]) : selected.filter((plist) => plist._id !== item._id); // Is it filtered?
        };
        return { ...state, selected: updateSelection(action.payload.isChecked, action.payload.plist), loading: false, loaded: true };
      })
      .addCase(clear, (state) => ({
        ...state,
        selected: [],
        loading: false,
        loaded: true,
      }));
  },
});

export default searchSlice;
export const reducer = searchSlice.reducer;
