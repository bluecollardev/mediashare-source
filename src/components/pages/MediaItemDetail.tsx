import React, { useMemo } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { mapAvailableTags } from 'mediashare/store/modules/tags';
import { useAppSelector } from 'mediashare/store';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import {
  PageContainer,
  PageContent,
  PageProps,
  MediaCard,
  MediaList,
} from 'mediashare/components/layout';
import { AuthorProfile } from 'mediashare/models/AuthorProfile';
import {
  selectMappedPlaylistMediaItems,
  MappedPlaylistMediaItem,
} from 'mediashare/store/modules/playlist';
import {
  useViewMediaItemById,
  useViewPlaylistById,
} from 'mediashare/hooks/navigation';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from 'mediashare/styles';

// @ts-ignore
export const MediaItemDetail = ({ globalState = { tags: [] } }: PageProps) => {
  const mediaItem = useAppSelector((state) => state?.mediaItem?.entity);
  const {
    _id,
    title = '',
    authorProfile = {} as AuthorProfile,
    createdBy,
    description = '',
    imageSrc,
    uri,
    visibility,
    shareCount = 0,
    viewCount = 0,
    likesCount = 0,
  } = mediaItem || {};

  const { tags = [] } = globalState;
  const tagKeys = (mediaItem?.tags || []).map(({ key }) => key);
  const mappedTags = useMemo(() => mapAvailableTags(tags).filter((tag) => tag.isMediaTag), []);

  // If the user navigated here from a playlist context, the playlist's
  // selected state still holds its mediaItems/playlistItems — render those
  // in the right column on tablet/desktop, same as PlaylistItemDetail.
  const dispatch = useDispatch();
  const viewMediaItemById = useViewMediaItemById();
  const viewPlaylist = useViewPlaylistById();
  const { selected: selectedPlaylist } = useAppSelector((state) => state?.playlist) || ({} as any);
  const playlistMediaItems: MappedPlaylistMediaItem[] =
    selectMappedPlaylistMediaItems(selectedPlaylist) || [];
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  const hasPlaylistContext = !!selectedPlaylist && playlistMediaItems.length > 0;

  const activateMediaItem = (item: any) => {
    if (item?._id) {
      viewMediaItemById({ mediaId: item.mediaItemId || item._id, uri: item.uri });
    }
  };

  const renderPlaylistHeader = () =>
    !selectedPlaylist ? null : (
      <TouchableOpacity
        onPress={() =>
          selectedPlaylist?._id
            ? viewPlaylist({ playlistId: String(selectedPlaylist._id) })
            : undefined
        }
        activeOpacity={0.7}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: theme.colors.surface,
          borderRadius: 4,
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 11,
            opacity: 0.7,
            marginBottom: 2,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Playlist
        </Text>
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 14,
            fontFamily: theme.fonts.medium.fontFamily,
          }}
          numberOfLines={2}
        >
          {selectedPlaylist?.title || 'Untitled'}
        </Text>
        {selectedPlaylist?.authorProfile?.authorName ? (
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 11,
              opacity: 0.65,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            by {selectedPlaylist.authorProfile.authorName}
          </Text>
        ) : null}
      </TouchableOpacity>
    );

  return (
    <PageContainer>
      <PageContent>
        <ScrollView>
          <MediaCard
            key={_id}
            title={title}
            authorProfile={authorProfile}
            description={description}
            mediaSrc={uri}
            showImage={true}
            image={imageSrc}
            imageStyle={{
              // TODO: Can we do this automatically from video metadata?
              aspectRatio: 1 / 1,
            }}
            visibility={visibility}
            availableTags={mappedTags}
            tags={tagKeys}
            showSocial={true}
            showActions={false}
            isPlayable={true}
            likes={likesCount}
            shares={shareCount}
            views={viewCount}
          >
            {!isPortrait && hasPlaylistContext ? (
              <View>
                {renderPlaylistHeader()}
                <MediaList
                  key={selectedPlaylist?._id || _id}
                  list={playlistMediaItems}
                  showImage={true}
                  selectable={false}
                  showActions={true}
                  onViewDetail={activateMediaItem}
                />
              </View>
            ) : null}
          </MediaCard>
          {isPortrait && hasPlaylistContext ? (
            <View>
              {renderPlaylistHeader()}
              <MediaList
                key={selectedPlaylist?._id || _id}
                list={playlistMediaItems}
                showImage={true}
                selectable={false}
                showActions={true}
                onViewDetail={activateMediaItem}
              />
            </View>
          ) : null}
        </ScrollView>
      </PageContent>
    </PageContainer>
  );
};

export default withLoadingSpinner(undefined)(withGlobalStateConsumer(MediaItemDetail));
