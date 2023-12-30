import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { makeActions } from 'mediashare/store/factory';
import { ApiService } from 'mediashare/store/apis';
import { ProfileDto } from 'mediashare/apis/user-svc/rxjs-api';
import { thunkApiWithState } from 'mediashare/store/helpers';

// Define these in snake case or our converter won't work... we need to fix that
const profileActionNames = [
  'get_user_by_id',
] as const;

export const profileActions = makeActions(profileActionNames);

export const loadProfile = createAsyncThunk(profileActions.getUserById.type, async (userId: string | undefined, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return userId ?
    await (api as ApiService).user.userControllerGetUser({ userId }).toPromise() :
    await (api as ApiService).user.userControllerGetCurrentUser().toPromise();
});

interface ProfileState {
  entity: Partial<ProfileDto>;
  loading: boolean;
  loaded: boolean;
}

export const profileInitialState: ProfileState = {
  entity: {
    sharedItems: [],
  } as Partial<ProfileDto>,
  loading: false,
  loaded: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState: profileInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadProfile.fulfilled, (state, action) => ({
        ...state, entity: action.payload, loading: false, loaded: true
      }));
  },
});

export default profileSlice;
export const reducer = profileSlice.reducer;
