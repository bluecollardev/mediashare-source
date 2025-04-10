import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import MediaItemAdd from 'mediashare/components/pages/MediaItemAdd'
import AddFromFeed from 'mediashare/components/pages/AddFromFeed'
import Playlists from 'mediashare/components/pages/Playlists'
import PlaylistAdd from 'mediashare/components/pages/PlaylistAdd'
import PlaylistEdit from 'mediashare/components/pages/PlaylistEdit'
import PlaylistDetail from 'mediashare/components/pages/PlaylistDetail'
import PlaylistItemEdit from 'mediashare/components/pages/PlaylistItemEdit'
import ChooseMediaForPlaylist from 'mediashare/components/pages/ChooseMediaForPlaylist'
import Media from 'mediashare/components/pages/Media'
import MediaItemDetail from 'mediashare/components/pages/MediaItemDetail'
import MediaItemEdit from 'mediashare/components/pages/MediaItemEdit'
import SharePlaylistsWith from 'mediashare/components/pages/SharePlaylistsWith'

import { routeConfig } from 'mediashare/routes'

const LibraryStackNavigator = createStackNavigator()
export const LibraryNavigation = () => {
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
  )
}
