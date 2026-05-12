import {
  createAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';
import { makeActions } from 'mediashare/store/factory';
import { ApiService } from 'mediashare/store/apis';
import {
  reduceFulfilledState,
  reducePendingState,
  reduceRejectedState,
  thunkApiWithState,
} from 'mediashare/store/helpers';
import { UserDto } from 'mediashare/apis/user-svc/rxjs-api';

const adminUsersActionNames = [
  'list_admin_users',
  'delete_admin_user',
  'invite_admin_user',
  'suspend_admin_user',
  'unsuspend_admin_user',
  'select_admin_user',
  'clear_admin_user_selection',
] as const;
export const adminUsersActions = makeActions(adminUsersActionNames);

export const listAdminUsers = createAsyncThunk(
  adminUsersActions.listAdminUsers.type,
  async (_opts: undefined, thunkApi) => {
    const { api } = thunkApiWithState(thunkApi);
    return await (api as ApiService).user
      .userControllerListAdmin()
      .toPromise();
  }
);

export const deleteAdminUser = createAsyncThunk(
  adminUsersActions.deleteAdminUser.type,
  async (userId: string, thunkApi) => {
    const { api } = thunkApiWithState(thunkApi);
    await (api as ApiService).user
      .userControllerDeleteUser({ userId })
      .toPromise();
    return userId;
  }
);

export const inviteAdminUser = createAsyncThunk(
  adminUsersActions.inviteAdminUser.type,
  async (args: { email: string; username?: string }, thunkApi) => {
    const { api } = thunkApiWithState(thunkApi);
    const inviteDto: any = {
      email: args.email,
      username: args.username || args.email,
    };
    return await (api as ApiService).user
      .userControllerInvite({ inviteDto })
      .toPromise();
  }
);

export const suspendAdminUser = createAsyncThunk(
  adminUsersActions.suspendAdminUser.type,
  async (userId: string, thunkApi) => {
    const { api } = thunkApiWithState(thunkApi);
    await (api as ApiService).user
      .userControllerSuspendUser({ userId })
      .toPromise();
    return userId;
  }
);

export const unsuspendAdminUser = createAsyncThunk(
  adminUsersActions.unsuspendAdminUser.type,
  async (userId: string, thunkApi) => {
    const { api } = thunkApiWithState(thunkApi);
    await (api as ApiService).user
      .userControllerUnsuspendUser({ userId })
      .toPromise();
    return userId;
  }
);

export const selectAdminUser = createAction<{
  isChecked: boolean;
  user: UserDto;
}>(adminUsersActions.selectAdminUser.type);

export const clearAdminUserSelection = createAction(
  adminUsersActions.clearAdminUserSelection.type
);

export interface AdminUsersState {
  entities: UserDto[];
  selected: UserDto[];
  loading: boolean;
  loaded: boolean;
}

export const adminUsersInitialState: AdminUsersState = {
  entities: [],
  selected: [],
  loading: false,
  loaded: false,
};

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState: adminUsersInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listAdminUsers.pending, reducePendingState())
      .addCase(listAdminUsers.rejected, reduceRejectedState())
      .addCase(
        listAdminUsers.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          entities: action.payload,
          loading: false,
          loaded: true,
        }))
      )
      .addCase(deleteAdminUser.fulfilled, (state, action) => ({
        ...state,
        entities: state.entities.filter(
          (u: any) =>
            u?._id !== action.payload && u?.sub !== action.payload
        ),
        selected: state.selected.filter(
          (u: any) =>
            u?._id !== action.payload && u?.sub !== action.payload
        ),
      }))
      .addCase(suspendAdminUser.fulfilled, (state, action) => ({
        ...state,
        entities: state.entities.map((u: any) =>
          u?._id === action.payload ? { ...u, isDisabled: true } : u
        ),
      }))
      .addCase(unsuspendAdminUser.fulfilled, (state, action) => ({
        ...state,
        entities: state.entities.map((u: any) =>
          u?._id === action.payload ? { ...u, isDisabled: false } : u
        ),
      }))
      .addCase(selectAdminUser, (state, action) => ({
        ...state,
        selected: action.payload.isChecked
          ? [...state.selected, action.payload.user]
          : state.selected.filter(
              (u: any) => u?._id !== (action.payload.user as any)?._id
            ),
      }))
      .addCase(clearAdminUserSelection, (state) => ({
        ...state,
        selected: [],
      }));
  },
});

export default adminUsersSlice;
export const reducer = adminUsersSlice.reducer;
