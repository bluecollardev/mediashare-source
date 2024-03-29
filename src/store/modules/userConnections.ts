import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { UserConnectionDto, UserDto } from 'mediashare/apis/user-svc/rxjs-api';
import { makeActions } from 'mediashare/store/factory';
import { ApiService } from 'mediashare/store/apis';
import { reduceFulfilledState, reducePendingState, reduceRejectedState, thunkApiWithState } from 'mediashare/store/helpers';

// Define these in snake case or our converter won't work... we need to fix that
const userConnectionsActionNames = ['load_user_connections', 'user_send_mail', 'accept_invitation', 'remove_user_connection', 'remove_user_connections'] as const;
export const userConnectionsActions = makeActions(userConnectionsActionNames);

export const sendEmail = createAsyncThunk(userConnectionsActions.userSendMail.type, async ({ userId, email }: { userId: string; email: string }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).email.emailControllerSendEmail({ userId, email }).toPromise();
});

export const acceptInvitation = createAsyncThunk(userConnectionsActions.acceptInvitation.type, async ({ userId, connectionId }: { userId: string; connectionId: string }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  console.log(userId)
  console.log(connectionId)
  return await (api as ApiService).user.userControllerCreateUserConnection({ createUserConnectionDto: { userId, connectionId } }).toPromise();
});

export const loadCurrentUserConnections = createAsyncThunk(userConnectionsActions.loadUserConnections.type, async (opts = undefined, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).user.userControllerGetCurrentUserConnections().toPromise();
});

export const loadUserConnections = createAsyncThunk(userConnectionsActions.loadUserConnections.type, async ({ userId }: { userId: string }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).user.userControllerGetUserConnections({ userId }).toPromise();
});

export const removeUserConnection = createAsyncThunk(userConnectionsActions.removeUserConnections.type, async ({ userId, connectionId }: { userId: string; connectionId: string }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).user.userControllerRemoveUserConnection({ userConnectionDto: { userId, connectionId } }).toPromise();
});

export const removeUserConnections = createAsyncThunk(userConnectionsActions.removeUserConnections.type, async ({ userId, connectionIds }: { userId: string; connectionIds: string[] }, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  const userConnections = connectionIds.map((connectionId) => ({ userId, connectionId }));
  return await (api as ApiService).user.userControllerRemoveUserConnections({ userConnectionDto: userConnections }).toPromise();
});

export interface UserConnectionsState {
  entities: UserDto[];
  selected: UserDto[];
  loading: boolean;
  loaded: boolean;
}

export const userConnectionsInitialState: UserConnectionsState = {
  entities: [],
  selected: [],
  loading: false,
  loaded: false,
};

const userConnectionsSlice = createSlice({
  name: 'users',
  initialState: userConnectionsInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUserConnections.pending, reducePendingState())
      .addCase(loadUserConnections.rejected, reduceRejectedState())
      .addCase(
        loadUserConnections.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          entities: action.payload,
          loading: false,
          loaded: true,
        }))
      );
  },
});

export default userConnectionsSlice;
export const reducer = userConnectionsSlice.reducer;
