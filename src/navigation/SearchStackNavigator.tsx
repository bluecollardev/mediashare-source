import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
// TODO: Replace this when we're ready
import { routeConfig } from 'mediashare/routes'
import Search from 'mediashare/components/pages/Search'
import PlaylistDetail from 'mediashare/components/pages/PlaylistDetail'
import PlaylistItemDetail from 'mediashare/components/pages/PlaylistItemDetail'
import PlaylistItemEdit from 'mediashare/components/pages/PlaylistItemEdit'
import ChooseMediaForPlaylist from 'mediashare/components/pages/ChooseMediaForPlaylist'
import ChoosePlaylistForSelected from 'mediashare/components/pages/ChoosePlaylistForSelected'
import MediaItemDetail from 'mediashare/components/pages/MediaItemDetail'
import SharePlaylistsWith from 'mediashare/components/pages/SharePlaylistsWith'

const SearchStackNavigator = createStackNavigator()
export const SearchNavigation = () => {
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
  )
}
