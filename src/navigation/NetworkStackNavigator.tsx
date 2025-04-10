import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import PlaylistDetail from 'mediashare/components/pages/PlaylistDetail'
import PlaylistItemDetail from 'mediashare/components/pages/PlaylistItemDetail'
import MediaItemDetail from 'mediashare/components/pages/MediaItemDetail'
import Shared from 'mediashare/components/pages/Shared'
import AccountEdit from 'mediashare/components/pages/AccountEdit'
import Contact from 'mediashare/components/pages/Contact'
import SharedWithContact from 'mediashare/components/pages/SharedWithContact'
import SharedByContact from 'mediashare/components/pages/SharedByContact'
import Invitation from 'mediashare/components/pages/Invitation'

import { routeConfig } from 'mediashare/routes'

const NetworkStackNavigator = createStackNavigator()
export const NetworkNavigation = () => {
  // const user = useUser()
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
  )
}
