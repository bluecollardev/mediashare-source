import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { makeActions } from 'mediashare/store/factory';
import { reducePendingState, reduceRejectedState, reduceFulfilledState, thunkApiWithState } from 'mediashare/store/helpers';
import { TagDto } from 'mediashare/apis/tags-svc/rxjs-api';

// Export tag utils
export * from '../../core/utils/tags';

// Define these in snake case or our converter won't work... we need to fix that
const tagActionNames = ['get_tags'] as const;

export const tagsActions = makeActions(tagActionNames);

export const getTags = createAsyncThunk(tagsActions.getTags.type, async (opts = undefined, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await api.tags.tagControllerFindAll().toPromise();
});

interface TagsState {
  entities: TagDto[];
  loading: boolean;
  loaded: boolean;
}

const tagsInitialState: TagsState = {
  entities: [],
  loading: false,
  loaded: false,
};

const tagsSlice = createSlice({
  name: 'tagsSlice',
  initialState: tagsInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTags.pending, reducePendingState())
      .addCase(getTags.rejected, reduceRejectedState())
      .addCase(
        getTags.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          entities: action.payload,
          loading: false,
          loaded: true,
        }))
      );
  },
});

export default tagsSlice;
export const reducer = tagsSlice.reducer;
