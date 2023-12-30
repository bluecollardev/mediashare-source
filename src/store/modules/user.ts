import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { makeActions } from 'mediashare/store/factory';
import { ApiService } from 'mediashare/store/apis';
import {
  reduceFulfilledState,
  reducePendingState,
  reduceRejectedState,
  thunkApiWithState,
} from 'mediashare/store/helpers'
import { signOut } from 'mediashare/core/aws/auth';
import { ProfileDto, UpdateUserDto, BcRolesType, UserDto } from 'mediashare/apis/user-svc/rxjs-api'
import { pick, clone } from 'remeda';

// Define these in snake case or our converter won't work... we need to fix that
const userActionNames = ['login', 'logout', 'load_user', 'update_account', 'set_is_accepting_invitation'] as const;

export const userActions = makeActions(userActionNames);

export const setIsAcceptingInvitationAction = createAsyncThunk(userActions.setIsAcceptingInvitation.type, async (connectionId: string) => {
  console.log(`setIsAcceptingInvitationAction for user: ${connectionId}`);
  return connectionId;
});

// TODO: Rework user sessions if we want the User API backend to maintain session state (store Cognito token in Redis?)
//  Otherwise we can deprecate this!
/**
 * @deprecated
 */
export const loginAction = createAsyncThunk(userActions.login.type, async (opts = undefined, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).user.userControllerAuthorize().toPromise();
});

// TODO: Rework user sessions if we want the User API backend to maintain session state (store Cognito token in Redis?)
//  Otherwise we can deprecate this!
/**
 * @deprecated
 */
export const logout = createAsyncThunk(userActions.logout.type, async (opts = undefined, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  await (api as ApiService).user.userControllerLogout().toPromise();
  // await setKeyPair('token', ''); // TODO: Not compatible with react-native-web [https://github.com/expo/expo/issues/7744]
  await signOut();
});

export const loadUser = createAsyncThunk(userActions.loadUser.type, async (opts = undefined, thunkApi) => {
  const { api } = thunkApiWithState(thunkApi);
  return await (api as ApiService).user.userControllerGetCurrentUser().toPromise();
});

export const updateAccount = createAsyncThunk(
  userActions.updateAccount.type,
  async ({ updateUserDto, userId }: { updateUserDto: UpdateUserDto; userId?: string }, thunkApi) => {
    
    const { api } = thunkApiWithState(thunkApi);
    // TODO: If no userId, that means we're updating the account owner's account? Or was that for our previous hardcoded user?
    return userId
      ? await (api as ApiService).user.userControllerUpdateUser({ userId, updateUserDto }).toPromise()
      : await (api as ApiService).user.userControllerUpdateCurrentUser({ updateUserDto }).toPromise();
  }
);

export const defaultUserProfile: Pick<
  UserDto,
  // 'sub' | 'username' | 'firstName' | 'lastName' | '_id' | 'phoneNumber' | 'imageSrc' | 'email' | 'role' | 'sharedCount' | 'sharesCount' | 'likesCount' | 'sharedItems' |'transactionId'|'transactionDate'|'transactionEndDate'
  'sub' | 'username' | 'firstName' | 'lastName' | '_id' | 'phoneNumber' | 'imageSrc' | 'email' | 'role' | 'transactionId'|'transactionDate'|'transactionEndDate'
> = {
  sub: '',
  username: '',
  firstName: '',
  lastName: '',
  _id: '',
  phoneNumber: '',
  imageSrc: '',
  email: '',
  role: BcRolesType.Guest,
  sharedCount: 0,
  likesCount: 0,
  sharesCount: 0,
  sharedItems: [],
  // TODO: Fix this typing!
  // @ts-ignore
  transactionId: 0,
  transactionDate:'',
  transactionEndDate:''
};

interface UserState {
  isAcceptingInvitationFrom?: string;
  entity: Partial<typeof defaultUserProfile> | undefined;
  loading: boolean;
  loaded: boolean;
}

export const userInitialState: UserState = {
  isAcceptingInvitationFrom: undefined,
  entity: clone(defaultUserProfile),
  loading: false,
  loaded: false,
};

// TODO: Double check these fields, do we even have roles?
const pickUser = (user: Partial<ProfileDto & UserDto>) =>
  pick(user, [
    'sub',
    'username',
    'email',
    '_id',
    'firstName',
    'lastName',
    'phoneNumber',
    'imageSrc',
    'role',
    'sharedCount',
    'likesCount',
    'sharesCount',
    'sharedItems',
    'transactionId',
    'transactionDate',
    'transactionEndDate'
  ]);

const userSlice = createSlice({
  name: 'user',
  initialState: userInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setIsAcceptingInvitationAction.pending, reducePendingState())
      .addCase(setIsAcceptingInvitationAction.rejected, reduceRejectedState())
      .addCase(setIsAcceptingInvitationAction.fulfilled, (state, action) => {
        const newState = {
          ...state,
          isAcceptingInvitationFrom: action.payload,
          loading: false,
          loaded: true,
        };
        console.log(newState);
        return newState;
      })
      .addCase(loginAction.pending, reducePendingState())
      .addCase(loginAction.rejected, reduceRejectedState())
      .addCase(loginAction.fulfilled, (state, action) => ({
        ...state,
        entity: { ...(pickUser(action?.payload as ProfileDto & UserDto)) },
        loading: false,
        loaded: true,
      }))
      .addCase(logout.pending, reducePendingState())
      .addCase(logout.rejected, reduceRejectedState())
      .addCase(
        logout.fulfilled,
        reduceFulfilledState(() => ({
          ...userInitialState,
        }))
      )
      .addCase(loadUser.pending, reducePendingState())
      .addCase(loadUser.rejected, reduceRejectedState())
      .addCase(loadUser.fulfilled, (state, action) => ({
        ...state,
        // TODO: Fix typing!
        entity: { ...pickUser(action.payload as unknown as Partial<ProfileDto & UserDto>) },
        loading: false,
        loaded: true,
      }))
      .addCase(updateAccount.pending, reducePendingState())
      .addCase(updateAccount.rejected, reduceRejectedState())
      .addCase(updateAccount.fulfilled, (state, action) => ({
        ...state,
        // TODO: Fix typing!
        entity: { ...pickUser(action.payload as unknown as Partial<ProfileDto & UserDto>) },
        loading: false,
        loaded: true,
      }));
  },
});

export default userSlice;
export const reducer = userSlice.reducer;
