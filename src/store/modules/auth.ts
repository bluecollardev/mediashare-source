import { createAction, createSlice } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export interface AuthTokens {
  accessToken?: string;
  idToken?: string;
}

export const storeAuthTokens = createAction<AuthTokens, 'storeAuthTokens'>('storeAuthTokens');

export const clearAuthTokens = createAction('clearAuthTokens');

export interface AuthTokens {
  accessToken?: string;
  idToken?: string;
}

interface AuthState {
  accessToken?: string;
  idToken?: string;
  loading: boolean;
  loaded: boolean;
}

export const authInitialState: AuthState = {
  idToken: undefined,
  accessToken: undefined,
  loading: false,
  loaded: false,
};

export const AccessTokenKey = 'accessToken';
export const IdTokenKey = 'idToken';

export const NativePlatforms = ['ios', 'android'];
export const WebPlatforms = ['web', 'macos', 'windows'];

export async function storeTokensWebAdapter({ accessToken, idToken }: AuthTokens): Promise<void> {
  if (!window && window.sessionStorage) return;
  window.sessionStorage.setItem(AccessTokenKey, accessToken);
  window.sessionStorage.setItem(IdTokenKey, idToken);
}

export async function storeTokensNativeAdapter({ accessToken, idToken }: AuthTokens): Promise<void> {
  if (!(await SecureStore.isAvailableAsync())) return;
  const fns = [
    async () => SecureStore.setItemAsync(AccessTokenKey, accessToken),
    async () => SecureStore.setItemAsync(IdTokenKey, idToken)
  ];
  await Promise.all(fns);
}

export function storeTokens(state: any, action: any) {
  // Set to sessionStorage
  const accessToken = (action?.payload as AuthTokens).accessToken || state.accessToken;
  const idToken = (action?.payload as AuthTokens).idToken || state.idToken;
  if (NativePlatforms.includes(Platform.OS)) {
    storeTokensNativeAdapter({ accessToken, idToken }).then()
  } else if (WebPlatforms.includes(Platform.OS)) {
    storeTokensWebAdapter({ accessToken, idToken }).then()
  }
  return ({
    ...state,
    accessToken,
    idToken,
    loading: false,
    loaded: true,
  })
}

export async function getTokensWebAdapter(): Promise<AuthTokens | undefined> {
  if (!window && window.sessionStorage) return;
  const accessToken = window.sessionStorage.getItem(AccessTokenKey);
  const idToken = window.sessionStorage.getItem(IdTokenKey);
  return { accessToken, idToken };
}

export async function getTokensNativeAdapter(): Promise<AuthTokens | undefined> {
  if (!(await SecureStore.isAvailableAsync())) return;
  const accessToken = await SecureStore.getItemAsync(AccessTokenKey);
  const idToken = await SecureStore.getItemAsync(IdTokenKey);
  return { accessToken, idToken };
}

export async function getTokens(): Promise<AuthTokens | undefined> {
  if (NativePlatforms.includes(Platform.OS)) {
    return getTokensNativeAdapter()
  } else if (WebPlatforms.includes(Platform.OS)) {
    return getTokensWebAdapter()
  }
}

export async function clearTokensWebAdapter(): Promise<void> {
  if (!window && window.sessionStorage) return;
  window.sessionStorage.removeItem(AccessTokenKey);
  window.sessionStorage.removeItem(IdTokenKey);
}

export async function clearTokensNativeAdapter(): Promise<void> {
  if (!(await SecureStore.isAvailableAsync())) return;
  const fns = [
    async () => SecureStore.deleteItemAsync(AccessTokenKey),
    async () => SecureStore.deleteItemAsync(IdTokenKey)
  ];
  await Promise.all(fns);
}

export async function clearTokens(): Promise<void> {
  if (NativePlatforms.includes(Platform.OS)) {
    return clearTokensNativeAdapter()
  } else if (WebPlatforms.includes(Platform.OS)) {
    return clearTokensWebAdapter()
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(storeAuthTokens, (state: any, action: any) => {
        return storeTokens(state, action);
      })
      .addCase(clearAuthTokens, () => {
        clearTokens().then();
        return ({
          ...authInitialState
        });
      })
  },
});

export default authSlice;
export const reducer = authSlice.reducer;
