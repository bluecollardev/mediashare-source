import { AppHeader } from 'mediashare/components/layout';
import React from 'react';

const routeConfig = {
  // ======= route for navigate custom sign up and login
  login: {
    name: 'login',
    options: { title: '', header: () => null },
  },
  signUp: {
    name: 'signUp',
    options: { title: '', header: () => null },
  },
  confirm: {
    name: 'confirm',
    options: { title: '', header: () => null },
  },
  resetPassword: {
    name: 'resetPassword',
    options: { title: '', header: () => null },
  },
  // =================================================

  search: {
    name: 'search',
    options: {
      title: 'Search',
      header: (props) => <AppHeader {...props} searchable={true} defaultSearchTarget="playlists" showAccount={true} />,
    },
  },
  playlists: {
    name: 'playlists',
    options: {
      title: 'My Playlists',
      header: (props) => <AppHeader {...props} searchable={true} defaultSearchTarget="playlists" showAccount={true} />,
    },
  },
  playlistAdd: {
    name: 'playlistAdd',
    options: { title: 'Create Playlist', header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  playlistDetail: {
    name: 'playlistDetail',
    options: { title: 'Playlist', header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  playlistEdit: {
    name: 'playlistEdit',
    options: { title: 'Edit Playlist', header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  playlistItemDetail: {
    name: 'playlistItemDetail',
    options: { title: 'Playlist Item', header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  playlistItemEdit: {
    name: 'playlistItemEdit',
    options: { title: 'Edit Playlist Item', header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  media: {
    name: 'media',
    options: {
      title: 'Media Library',
      header: (props) => <AppHeader {...props} searchable={true} defaultSearchTarget="media" showAccount={true} />,
    },
  },
  mediaItemAdd: {
    name: 'addMediaItem',
    options: { title: 'Upload', header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  mediaItemDetail: {
    name: 'mediaItemDetail',
    options: { title: 'File Details', header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  mediaItemEdit: {
    name: 'mediaItemEdit',
    options: { title: 'Edit Media', header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  addFromFeed: {
    name: 'addFromFeed',
    options: { title: 'Import From S3 Bucket', header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  chooseMediaForPlaylist: {
    name: 'chooseMediaForPlaylist',
    options: {
      title: 'Add Playlist Items',
      header: (props) => <AppHeader {...props} searchable={true} defaultSearchTarget="playlists" showAccount={true} />,
    },
  },
  choosePlaylistForSelected: {
    name: 'choosePlaylistForSelected',
    options: {
      title: 'Choose Playlist',
      header: (props) => <AppHeader {...props} searchable={true} defaultSearchTarget="playlists" showAccount={true} />,
    },
  },
  sharePlaylistsWith: {
    name: 'sharePlaylistsWith',
    options: {
      title: 'Share With',
      header: (props) => <AppHeader {...props} searchable={true} showAccount={true} />,
    },
  },
  account: {
    name: 'account',
    options: {
      title: 'Shared Items',
      header: (props) => <AppHeader {...props} showAccount={true} showNotifications={true} />,
    },
  },
  accountEdit: {
    name: 'accountEdit',
    options: { title: 'Manage Account', header: (props) => <AppHeader {...props} showAccount={false} showLogout={true} /> },
  },
  contact: {
    name: 'contact',
    options: {
      title: 'Contact Info',
      header: (props) => <AppHeader {...props} showAccount={true} showNotifications={false} />,
    },
  },
  invitation: {
    name: 'invitation',
    options: {
      title: 'Invitation',
      header: (props) => <AppHeader {...props} showAccount={false} showNotifications={false} />,
    },
  },
  sharedWithContact: {
    name: 'sharedWithContact',
    options: { title: `Items You're Sharing`, header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  sharedByContact: {
    name: 'sharedByContact',
    options: { title: `Items They're Sharing`, header: (props) => <AppHeader {...props} showAccount={true} /> },
  },
  feed: {
    name: 'feed',
    options: {
      title: 'My Feed',
      header: (props) => <AppHeader {...props} searchable={true} showDisplayControls={false} showAccount={true} />,
    },
  },
  feedSharedWithMe: {
    name: 'feedSharedWithMe',
    options: {
      title: 'Shared With Me',
      header: (props) => <AppHeader {...props} searchable={false} showDisplayControls={true} showAccount={true} />,
    },
  },
} as const;

type RouteEnumKeys = keyof typeof routeConfig;
type RouteEnumType<Key extends RouteEnumKeys> = typeof routeConfig[Key]['name'];
type MappedRouteEnum = { [P in RouteEnumKeys]: RouteEnumType<P> };

function mapRouteNames(config: typeof routeConfig): MappedRouteEnum {
  const obj = Object.create({});
  for (let key in config) {
    if (config.hasOwnProperty(key)) {
      Object.assign(obj, { [key]: config[key].name });
    }
  }
  return obj;
}

const routeNames = mapRouteNames(routeConfig);
export { routeConfig, routeNames };
