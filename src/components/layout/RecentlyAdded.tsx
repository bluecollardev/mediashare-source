import React from 'react';
import { usePreviewImage } from 'mediashare/hooks/usePreviewImage';
import { useViewPlaylistById, useViewFeedSharedWithMe } from 'mediashare/hooks/navigation';
import { FlatList, View, Dimensions, TouchableHighlight } from 'react-native';
import { Button } from 'react-native-paper';
import { MediaCard, NoContent, SectionHeader } from 'mediashare/components/layout/index';
import { AuthorProfile } from 'mediashare/models/AuthorProfile';
import { PlaylistDto } from 'mediashare/apis/media-svc/rxjs-api';
import { theme } from 'mediashare/styles';

export interface RecentlyAddedProps {
  list: PlaylistDto[];
  selectable?: boolean;
  clearSelection?: boolean;
  showActions?: boolean;
  onViewDetailClicked?: Function;
  onChecked?: (checked: boolean, item?: any) => void;
  displayNoContent?: boolean;
}

export const RecentlyAdded = ({ list = [], displayNoContent = false }: RecentlyAddedProps) => {
  const viewFeedSharedWithMeAction = useViewFeedSharedWithMe();
  const viewFeedSharedWithMe = () => viewFeedSharedWithMeAction();
  const viewPlaylistAction = useViewPlaylistById();
  const viewPlaylist = (item) => viewPlaylistAction({ playlistId: item._id });

  const sortedList = list.map((item) => item);
  sortedList.sort((dtoA, dtoB) => (dtoA.title > dtoB.title ? 1 : -1));

  const noContentIsVisible = displayNoContent && sortedList && sortedList.length === 0;

  return (
    <View style={{ marginBottom: 15 }}>
      <SectionHeader title={`Recently Added`} />
      {sortedList && sortedList.length > 0 ? (
        <>
          <FlatList horizontal={true} data={sortedList} renderItem={({ item }) => renderVirtualizedListItem(item)} keyExtractor={({ _id }) => `playlist_${_id}`} />
          <Button
            icon="list"
            color={theme.colors.darkDefault}
            textColor={theme.colors.primary}
            uppercase={false}
            mode="outlined"
            compact
            dark
            onPress={() => viewFeedSharedWithMe()}
          >
            All Shared Playlists
          </Button>
        </>
      ) : null}
      {noContentIsVisible ? (
        <NoContent messageButtonText="Items that are shared with you will show up in your feed." icon="view-list" />
      ) : null}
    </View>
  );

  function renderVirtualizedListItem(item) {
    // TODO: Can we have just one or the other, either mediaIds or mediaItems?
    const { _id = '', title = '', authorProfile = {} as AuthorProfile, description = '', mediaIds = [], mediaItems = [], imageSrc = '' } = item;
    const dimensions = {
      w: Dimensions.get('window').width / 2,
      h: Dimensions.get('window').width / 2 + 100
    };

    console.log(`[DisplayPreviewOrVideo] image: ${imageSrc}`);
    const mediaPreview = usePreviewImage(imageSrc);

    return (
      <View style={{ width: dimensions.w, height: dimensions.h }}>
        <TouchableHighlight
          style={{ width: dimensions.w, height: dimensions.h, zIndex: 10 }}
          onPress={async () => {
            await viewPlaylist(item);
          }}
        >
          <MediaCard
            key={`playlist_${_id}`}
            title={title}
            // description={<MediaListItem.Description data={{ authorProfile, itemCount: mediaIds?.length || mediaItems?.length || 0 }} showItemCount={true} />}
            showImage={true}
            image={mediaPreview.imageSrc}
            imageStyle={{
              aspectRatio: 16 / 9,
              padding: 10,
              paddingBottom: 0
            }}
            showActions={false}
            showAvatar={false}
          />
        </TouchableHighlight>
      </View>
    );
  }
};
