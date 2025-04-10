// TODO: https://react-redux.js.org/tutorials/typescript-quick-start#define-typed-hooks
import type {} from 'redux-thunk/extend-redux'

import React, { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import AccountEdit from 'mediashare/components/pages/AccountEdit'
import Invitation from 'mediashare/components/pages/Invitation'

import { routeConfig } from 'mediashare/routes'

const AccountStackNavigator = createStackNavigator()
export const AccountNavigation = ({ globalState }) => {
  const { loadUserData } = globalState
  useEffect(() => {
    loadUserData()
  }, [])
  return (
    <AccountStackNavigator.Navigator initialRouteName={'accountEdit'}>
      <AccountStackNavigator.Screen {...routeConfig.accountEdit} component={AccountEdit} initialParams={{ userId: null }} />
      <AccountStackNavigator.Screen {...routeConfig.invitation} component={Invitation} />
    </AccountStackNavigator.Navigator>
  )
}
