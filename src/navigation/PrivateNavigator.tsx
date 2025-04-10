// TODO: https://react-redux.js.org/tutorials/typescript-quick-start#define-typed-hooks
import type {} from 'redux-thunk/extend-redux'

import React from 'react'
import { createMaterialBottomTabNavigator as createBottomTabNavigator } from 'mediashare/lib/material-bottom-tabs'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { SearchNavigation } from 'mediashare/navigation/SearchStackNavigator'
import { LibraryNavigation } from 'mediashare/navigation/LibraryStackNavigator'
import { NetworkNavigation } from 'mediashare/navigation/NetworkStackNavigator'
import { theme } from 'mediashare/styles'
import { createBottomTabListeners } from 'mediashare/screenListeners'
import { GlobalStateProps } from 'mediashare/core/globalState'

const PrivateNavigator = createBottomTabNavigator()
interface PrivateMainNavigationProps {
  globalState: GlobalStateProps
}

// Map route names to icons
export const tabNavigationIconsMap = {
  Search: 'search',
  Network: 'share',
  Library: 'subscriptions',
}

export const PrivateMainNavigation = ({ globalState }: PrivateMainNavigationProps) => {
  const { build, isAcceptingInvitationFrom, openInvitation = () => {} } = globalState
  const navigationTabListeners = createBottomTabListeners(globalState)
  if (isAcceptingInvitationFrom) {
    openInvitation()
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
              return <MaterialIcons name={tabNavigationIconsMap[route.name]} color={color} size={20} style={{ marginBottom: 5 }} />
              // <Icon name={tabNavigationIconsMap[route.name]} color={color} />
            }
            : undefined,
      })}
    >
      {/* TODO: Fix this! */}
      <>
        {/*{(build.forFreeUser || build.forSubscriber || build.forAdmin) ? (
          <PrivateNavigator.Screen name="Search" component={SearchNavigation} listeners={navigationTabListeners} />
        ) : null}
        {(build.forSubscriber || build.forAdmin) ? (
          <PrivateNavigator.Screen name="Library" component={LibraryNavigation} listeners={navigationTabListeners} />
        ) : null}
        <PrivateNavigator.Screen name="Network" component={NetworkNavigation} listeners={navigationTabListeners} />*/}
        <PrivateNavigator.Screen name="Search" component={SearchNavigation} listeners={navigationTabListeners} />
        <PrivateNavigator.Screen name="Library" component={LibraryNavigation} listeners={navigationTabListeners} />
        <PrivateNavigator.Screen name="Network" component={NetworkNavigation} listeners={navigationTabListeners} />
      </>
    </PrivateNavigator.Navigator>
  )
}
