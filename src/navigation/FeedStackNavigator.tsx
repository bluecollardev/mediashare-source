import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Feed from 'mediashare/components/pages/Feed'
import FeedSharedWithMe from 'mediashare/components/pages/SharedWithMe'
import PlaylistDetail from 'mediashare/components/pages/PlaylistDetail'
import PlaylistItemDetail from 'mediashare/components/pages/PlaylistItemDetail'
import MediaItemDetail from 'mediashare/components/pages/MediaItemDetail'
import SharePlaylistsWith from 'mediashare/components/pages/SharePlaylistsWith'

import { routeConfig } from 'mediashare/routes'

const FeedStackNavigator = createStackNavigator()
export const FeedNavigation = () => {
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
