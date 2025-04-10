// TODO: https://react-redux.js.org/tutorials/typescript-quick-start#define-typed-hooks
import type {} from 'redux-thunk/extend-redux'

import React, { useEffect, useState } from 'react'
import { Platform, ScrollView } from 'react-native'
import { Provider, useDispatch } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Provider as PaperProvider, Text, Card } from 'react-native-paper'
import { View, ActivityIndicator, Linking } from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import Amplify, { Hub } from 'aws-amplify'
import awsmobile from './aws-exports'
import { store, useAppSelector } from './store'
import { loadUser, setIsAcceptingInvitationAction } from './store/modules/user'
import { useUser } from 'mediashare/hooks/useUser'
import { storeAuthTokens } from 'mediashare/store/modules/auth'
import { theme } from './styles'
import { useFonts } from 'expo-font'
import { withGlobalStateProvider } from './core/globalState'

import { PageContainer, PageContent } from 'mediashare/components/layout'
import Config from 'mediashare/config'
import { AccountNavigation } from 'mediashare/navigation/AccountStackNavigator'
import { PublicMainNavigation } from 'mediashare/navigation/PublicStackNavigator'
import { PrivateMainNavigation } from 'mediashare/navigation/PrivateNavigator'
import { Auth } from 'aws-amplify'

const PublicMainNavigationWithGlobalState = withGlobalStateProvider(PublicMainNavigation)
const PrivateMainNavigationWithGlobalState = withGlobalStateProvider(PrivateMainNavigation)
const AccountNavigationWithGlobalState = withGlobalStateProvider(AccountNavigation)

const RootNavigator = createStackNavigator()
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
    )
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
  )
}

const RootNavigationWithGlobalState = withGlobalStateProvider(RootNavigation)

const amplifyConfig = {
  ...awsmobile,
  ...(Platform.OS === 'web' ? { Auth: {
      cookieStorage: {
        // - Cookie domain (only required if cookieStorage is provided)
        // TODO: Set this to localhost when running locally
        // domain: 'localhost',
        domain: Config.CookieDomain || 'localhost',
        // (optional) - Cookie path
        path: '/',
        // (optional) - Cookie expiration in days
        // expires: 365,
        // (optional) - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
        sameSite: 'lax',
        // (optional) - Cookie secure flag
        // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
        // TODO: Enable https, this should only be set to false when running locally!
        secure: false
      },
    } } : {}),
  // Fix AWS Pinpoint connection issues
  Analytics: {
    disabled: true,
  },
}
console.log(amplifyConfig)
Amplify.configure(amplifyConfig)

function App() {
  const [fontsLoaded] = useFonts({
    'CircularStd-Black': require('./assets/fonts/CircularStd-Black.otf'),
    'CircularStd-Bold': require('./assets/fonts/CircularStd-Bold.otf'),
    'CircularStd-Medium': require('./assets/fonts/CircularStd-Medium.otf'),
    'CircularStd-Book': require('./assets/fonts/CircularStd-Book.otf'),
    'CircularStd-Light': require('./assets/fonts/CircularStd-Light.otf'),
  })

  const loading = useAppSelector((state) => state?.app?.loading)
  const auth = useAppSelector((state) => state?.auth)
  // console.log(`auth: ${JSON.stringify(auth, null, 2)}`)
  
  const { isLoggedIn } = useUser()
  const [isCurrentUser, setIsCurrentUser] = useState(undefined)
  const dispatch = useDispatch()

  const fetchData = async () => {
    const authUser = await Auth.currentUserPoolUser({ bypassCache: true })
    const { signInUserSession } = authUser
    const { accessToken, idToken } = signInUserSession
    dispatch(storeAuthTokens({
      accessToken: accessToken?.['jwtToken'],
      idToken: idToken?.['jwtToken'],
    }))
    dispatch(loadUser())
    setIsCurrentUser(authUser)
  }
  
  useEffect(() => {
    let mount = true
  
    if (!isLoggedIn) {
      Linking.addEventListener('url', ({ url }) => {
        console.log(`incoming link from: ${url}`)
        const connectionId = url.split('/').pop()
        dispatch(setIsAcceptingInvitationAction(connectionId))
      })
    } else {
      // Clean up listeners
      Linking.removeAllListeners('url')
    }
    
    fetchData().catch(() => {
      if (mount) {
        setIsCurrentUser(null)
      }
    })
    return () => {
      Linking.removeAllListeners('url')
      setIsCurrentUser(null)
      mount = false
    }
  }, [])

  useEffect(() => {
    Hub.listen('auth', (data) => {
      if (data.payload.event === 'signIn' || data.payload.event === 'signOut') {
        fetchData().catch((error) => {
          setIsCurrentUser(null)
        })
      }
    })
    return () => {
      // @ts-ignore
      Hub.remove('auth')
    }
  }, [])

  const customTheme = { ...theme }
  if (!fontsLoaded) {
    return <ActivityIndicator />
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
    )
  }
}

export default App
