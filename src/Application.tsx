// https://github.com/reduxjs/redux-thunk/issues/333

// TODO: https://react-redux.js.org/tutorials/typescript-quick-start#define-typed-hooks
import type {} from 'redux-thunk/extend-redux';

import React, { useEffect, useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// TODO: Replace this when we're ready
// import { createMaterialBottomTabNavigator as createBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createMaterialBottomTabNavigator as createBottomTabNavigator } from 'mediashare/lib/material-bottom-tabs';
import { Provider as PaperProvider, Text, Card } from 'react-native-paper';
import { View, ActivityIndicator, Linking } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Amplify, { Hub } from 'aws-amplify';
import awsmobile from './aws-exports';
import { store, useAppSelector } from './store';
import { routeConfig } from './routes'
import { loginAction, setIsAcceptingInvitationAction } from './store/modules/user';
import { useUser } from 'mediashare/hooks/useUser';
import { theme } from './styles';
import { useFonts } from 'expo-font';
import { createBottomTabListeners } from './screenListeners';
import { GlobalStateProps, withGlobalStateProvider } from './core/globalState';

import { PageContainer, PageContent } from 'mediashare/components/layout';
import Login from './components/pages/Login';
import SignUp from './components/pages/authentication/SignUp';
import Confirm from './components/pages/authentication/ConfirmCode';
import ResetPassword from './components/pages/authentication/ResetPassword';
import Feed from './components/pages/Feed';
import FeedSharedWithMe from './components/pages/SharedWithMe';
import MediaItemAdd from './components/pages/MediaItemAdd';
import AddFromFeed from './components/pages/AddFromFeed';
import Search from './components/pages/Search';
import Playlists from './components/pages/Playlists';
import PlaylistAdd from './components/pages/PlaylistAdd';
import PlaylistEdit from './components/pages/PlaylistEdit';
import PlaylistDetail from './components/pages/PlaylistDetail';
import PlaylistItemDetail from './components/pages/PlaylistItemDetail';
import PlaylistItemEdit from './components/pages/PlaylistItemEdit';
import ChooseMediaForPlaylist from './components/pages/ChooseMediaForPlaylist';
import ChoosePlaylistForSelected from './components/pages/ChoosePlaylistForSelected';
import Media from './components/pages/Media';
import MediaItemDetail from './components/pages/MediaItemDetail';
import MediaItemEdit from './components/pages/MediaItemEdit';
import SharePlaylistsWith from './components/pages/SharePlaylistsWith';
import Shared from './components/pages/Shared';
import AccountEdit from './components/pages/AccountEdit';
import Contact from './components/pages/Contact';
import SharedWithContact from './components/pages/SharedWithContact';
import SharedByContact from './components/pages/SharedByContact';
import Invitation from 'mediashare/components/pages/Invitation';
import { Auth } from 'aws-amplify';

// Map route names to icons
export const tabNavigationIconsMap = {
  Search: 'search',
  Network: 'share',
  Library: 'subscriptions',
};

const FeedStackNavigator = createStackNavigator();
const FeedNavigation = () => {
  return (
    <FeedStackNavigator.Navigator>
      <FeedStackNavigator.Screen {...routeConfig.feed} component={Feed} />
      <FeedStackNavigator.Screen {...routeConfig.feedSharedWithMe} component={FeedSharedWithMe} />
      <FeedStackNavigator.Screen {...routeConfig.playlistDetail} component={PlaylistDetail} />
      <FeedStackNavigator.Screen {...routeConfig.playlistItemDetail} component={PlaylistItemDetail} />
      <FeedStackNavigator.Screen {...routeConfig.mediaItemDetail} component={MediaItemDetail} />
      <FeedStackNavigator.Screen {...routeConfig.sharePlaylistsWith} component={SharePlaylistsWith} />
    </FeedStackNavigator.Navigator>
  );
};

const SearchStackNavigator = createStackNavigator();
const SearchNavigation = () => {
  return (
    <SearchStackNavigator.Navigator>
      <SearchStackNavigator.Screen {...routeConfig.search} component={Search} />
      <SearchStackNavigator.Screen {...routeConfig.playlistDetail} component={PlaylistDetail} />
      <SearchStackNavigator.Screen {...routeConfig.mediaItemDetail} component={MediaItemDetail} />
      <SearchStackNavigator.Screen {...routeConfig.playlistItemDetail} component={PlaylistItemDetail} />
      <SearchStackNavigator.Screen {...routeConfig.playlistItemEdit} component={PlaylistItemEdit} />
      <SearchStackNavigator.Screen {...routeConfig.chooseMediaForPlaylist} component={ChooseMediaForPlaylist} />
      <SearchStackNavigator.Screen {...routeConfig.choosePlaylistForSelected} component={ChoosePlaylistForSelected} />
      <SearchStackNavigator.Screen {...routeConfig.sharePlaylistsWith} component={SharePlaylistsWith} />
    </SearchStackNavigator.Navigator>
  );
};

const LibraryStackNavigator = createStackNavigator();
const LibraryNavigation = () => {
  return (
    <LibraryStackNavigator.Navigator initialRouteName={'playlists'}>
      <LibraryStackNavigator.Screen {...routeConfig.sharePlaylistsWith} component={SharePlaylistsWith} />
      <LibraryStackNavigator.Screen {...routeConfig.playlists} component={Playlists} />
      <LibraryStackNavigator.Screen {...routeConfig.playlistDetail} component={PlaylistDetail} />
      <LibraryStackNavigator.Screen {...routeConfig.playlistAdd} component={PlaylistAdd} />
      <LibraryStackNavigator.Screen {...routeConfig.playlistEdit} component={PlaylistEdit} />
      <LibraryStackNavigator.Screen {...routeConfig.playlistItemEdit} component={PlaylistItemEdit} />
      <LibraryStackNavigator.Screen {...routeConfig.chooseMediaForPlaylist} component={ChooseMediaForPlaylist} />
      <LibraryStackNavigator.Screen {...routeConfig.media} component={Media} />
      <LibraryStackNavigator.Screen {...routeConfig.mediaItemDetail} component={MediaItemDetail} />
      <LibraryStackNavigator.Screen {...routeConfig.mediaItemEdit} component={MediaItemEdit} />
      <LibraryStackNavigator.Screen {...routeConfig.mediaItemAdd} component={MediaItemAdd} />
      <LibraryStackNavigator.Screen {...routeConfig.addFromFeed} component={AddFromFeed} />
    </LibraryStackNavigator.Navigator>
  );
};

const AccountStackNavigator = createStackNavigator();
const AccountNavigation = () => {
  // const user = useUser();
  return (
    <AccountStackNavigator.Navigator initialRouteName={'accountEdit'}>
      <AccountStackNavigator.Screen {...routeConfig.accountEdit} component={AccountEdit} initialParams={{ userId: null }} />
      <NetworkStackNavigator.Screen {...routeConfig.invitation} component={Invitation} />
    </AccountStackNavigator.Navigator>
  );
};

const NetworkStackNavigator = createStackNavigator();
const NetworkNavigation = () => {
  // const user = useUser();
  return (
    <NetworkStackNavigator.Navigator initialRouteName={'account'}>
      <NetworkStackNavigator.Screen {...routeConfig.account} component={Shared} />
      <NetworkStackNavigator.Screen {...routeConfig.accountEdit} component={AccountEdit} initialParams={{ userId: null }} />
      <NetworkStackNavigator.Screen {...routeConfig.contact} component={Contact} />
      <NetworkStackNavigator.Screen {...routeConfig.sharedByContact} component={SharedByContact} />
      <NetworkStackNavigator.Screen {...routeConfig.sharedWithContact} component={SharedWithContact} />
      <NetworkStackNavigator.Screen {...routeConfig.invitation} component={Invitation} />
      <NetworkStackNavigator.Screen {...routeConfig.playlistDetail} component={PlaylistDetail} />
      <NetworkStackNavigator.Screen {...routeConfig.playlistItemDetail} component={PlaylistItemDetail} />
      <NetworkStackNavigator.Screen {...routeConfig.mediaItemDetail} component={MediaItemDetail} />
    </NetworkStackNavigator.Navigator>
  );
};

/* Public and Private navigation routes are split here */
const PublicStackNavigator = createStackNavigator();
const PublicMainNavigation = () => {
  return (
    <PublicStackNavigator.Navigator initialRouteName="login">
      <PublicStackNavigator.Screen {...routeConfig.login} component={Login} />
      <PublicStackNavigator.Screen {...routeConfig.signUp} component={SignUp} />
      <PublicStackNavigator.Screen {...routeConfig.confirm} component={Confirm} />
      <PublicStackNavigator.Screen {...routeConfig.resetPassword} component={ResetPassword} />
    </PublicStackNavigator.Navigator>
  );
};

const PrivateNavigator = createBottomTabNavigator();
interface PrivateMainNavigationProps {
  globalState: GlobalStateProps;
}
const PrivateMainNavigation = ({ globalState }: PrivateMainNavigationProps) => {
  const { build, isAcceptingInvitationFrom, openInvitation = () => {} } = globalState;
  const navigationTabListeners = createBottomTabListeners(globalState);
  if (isAcceptingInvitationFrom) {
    openInvitation();
  }
  return (
    <PrivateNavigator.Navigator
      initialRouteName="Search"
      activeColor={theme.colors.text}
      inactiveColor={theme.colors.primary}
      barStyle={{ backgroundColor: theme.colors.background }}
      labeled={true}
      shifting={false}
      screenOptions={({ route }) => ({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        tabBarIcon:
          route.name !== 'login'
            ? ({ focused, color }) => {
                return <MaterialIcons name={tabNavigationIconsMap[route.name]} color={color} size={20} style={{ marginBottom: 5 }} />;
                // <Icon name={tabNavigationIconsMap[route.name]} color={color} />;
              }
            : undefined,
      })}
    >
      <>
        {(build.forFreeUser || build.forSubscriber || build.forAdmin) ? (
          <PrivateNavigator.Screen name="Search" component={SearchNavigation} listeners={navigationTabListeners} />
        ) : null}
        {(build.forSubscriber || build.forAdmin) ? (
          <PrivateNavigator.Screen name="Library" component={LibraryNavigation} listeners={navigationTabListeners} />
        ) : null}
        <PrivateNavigator.Screen name="Network" component={NetworkNavigation} listeners={navigationTabListeners} />
      </>
    </PrivateNavigator.Navigator>
  );
};

const PublicMainNavigationWithGlobalState = withGlobalStateProvider(PublicMainNavigation);
const PrivateMainNavigationWithGlobalState = withGlobalStateProvider(PrivateMainNavigation);
const AccountNavigationWithGlobalState = withGlobalStateProvider(AccountNavigation);

const RootNavigator = createStackNavigator();
const RootNavigation = ({ isCurrentUser = undefined, isLoggedIn = false }) => {
  if (isCurrentUser === undefined && !isLoggedIn) {
    return (
      <PageContainer>
        <PageContent>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              height: '100%',
              justifyContent: 'flex-start',
            }}
          >
            <View style={{ flex: 1, justifyContent: 'flex-start' }}>
              <Card elevation={0}>
                <Card.Cover
                  resizeMode="contain"
                  source={require('mediashare/assets/splash.png')}
                  style={{ height: 300, width: '100%', marginHorizontal: 'auto', marginVertical: 15, marginBottom: 50, backgroundColor: theme.colors.background }}
                />
              </Card>
              <ActivityIndicator />
            </View>
          </ScrollView>
        </PageContent>
      </PageContainer>
    );
  }
  
  return (
    <RootNavigator.Navigator>
      {isCurrentUser ? (
        <>
          <RootNavigator.Screen name="Private" component={PrivateMainNavigationWithGlobalState} options={{ headerShown: false }} />
          <RootNavigator.Screen name="Account" component={AccountNavigationWithGlobalState} options={{ headerShown: false, presentation: 'modal' }} />
        </>
      ) : (
        <>
          <RootNavigator.Screen name="Public" component={PublicMainNavigationWithGlobalState} options={{ headerShown: false }} />
        </>
      )}
    </RootNavigator.Navigator>
  );
};

const RootNavigationWithGlobalState = withGlobalStateProvider(RootNavigation);

Amplify.configure({
  ...awsmobile,
  ...(Platform.OS === 'web' ? { Auth: {
    cookieStorage: {
      // - Cookie domain (only required if cookieStorage is provided)
      domain: 'localhost',
      // (optional) - Cookie path
      path: '/',
      // (optional) - Cookie expiration in days
      // expires: 365,
      // (optional) - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
      sameSite: 'lax',
      // (optional) - Cookie secure flag
      // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
      secure: true
    },
  } } : {}),
  // Fix AWS Pinpoint connection issues
  Analytics: {
    disabled: true,
  },
});

function App() {
  const [fontsLoaded] = useFonts({
    'CircularStd-Black': require('./assets/fonts/CircularStd-Black.otf'),
    'CircularStd-Bold': require('./assets/fonts/CircularStd-Bold.otf'),
    'CircularStd-Medium': require('./assets/fonts/CircularStd-Medium.otf'),
    'CircularStd-Book': require('./assets/fonts/CircularStd-Book.otf'),
    'CircularStd-Light': require('./assets/fonts/CircularStd-Light.otf'),
  });

  const loading = useAppSelector((state) => state?.app?.loading);
  
  const { isLoggedIn } = useUser();
  const [isCurrentUser, setIsCurrentUser] = useState(undefined);
  const dispatch = useDispatch();

  const fetchData = async () => {
    const authUser = await Auth.currentUserPoolUser({ bypassCache: true });
    await dispatch(loginAction({ accessToken: authUser.signInUserSession.accessToken.jwtToken, idToken: authUser.signInUserSession.idToken.jwtToken }));
    setIsCurrentUser(authUser);
  };
  
  useEffect(() => {
    let mount = true;
  
    if (!isLoggedIn) {
      Linking.addEventListener('url', ({ url }) => {
        console.log(`incoming link from: ${url}`);
        const connectionId = url.split('/').pop();
        dispatch(setIsAcceptingInvitationAction(connectionId));
      });
    } else {
      // Clean up listeners
      Linking.removeAllListeners('url');
    }
    
    fetchData().catch(() => {
      if (mount) {
        setIsCurrentUser(null);
      }
    });
    return () => {
      Linking.removeAllListeners('url');
      setIsCurrentUser(null);
      mount = false;
    };
  }, []);

  useEffect(() => {
    Hub.listen('auth', (data) => {
      if (data.payload.event === 'signIn' || data.payload.event === 'signOut') {
        fetchData().catch((error) => {
          setIsCurrentUser(null);
        });
      }
    });
    return () => {
      // @ts-ignore
      Hub.remove('auth');
    };
  }, []);

  const customTheme = { ...theme };
  if (!fontsLoaded) {
    return <ActivityIndicator />;
  } else {
    return (
      <Provider store={store}>
        <Spinner visible={loading} />
        <PaperProvider
          theme={customTheme}
          settings={{
            icon: (props) => <MaterialIcons {...props} />,
          }}
        >
          <NavigationContainer>
            <RootNavigationWithGlobalState isCurrentUser={isCurrentUser} isLoggedIn={isLoggedIn} />
          </NavigationContainer>
        </PaperProvider>
      </Provider>
    );
  }
}

export default App;
