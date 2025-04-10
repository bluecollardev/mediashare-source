// TODO: https://react-redux.js.org/tutorials/typescript-quick-start#define-typed-hooks
import type {} from 'redux-thunk/extend-redux'

import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Login from 'mediashare/components/pages/Login'
import SignUp from 'mediashare/components/pages/authentication/SignUp'
import Confirm from 'mediashare/components/pages/authentication/ConfirmCode'
import ResetPassword from 'mediashare/components/pages/authentication/ResetPassword'

import { routeConfig } from 'mediashare/routes'

/* Public and Private navigation routes are split here */
const PublicStackNavigator = createStackNavigator()
export const PublicMainNavigation = () => {
  return (
    <PublicStackNavigator.Navigator initialRouteName="login">
      <PublicStackNavigator.Screen {...routeConfig.login} component={Login} />
      <PublicStackNavigator.Screen {...routeConfig.signUp} component={SignUp} />
      <PublicStackNavigator.Screen {...routeConfig.confirm} component={Confirm} />
      <PublicStackNavigator.Screen {...routeConfig.resetPassword} component={ResetPassword} />
    </PublicStackNavigator.Navigator>
  )
}
