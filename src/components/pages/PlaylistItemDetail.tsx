import React, { useMemo } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'mediashare/store';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { mapAvailableTags } from 'mediashare/store/modules/tags';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
// import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import { PageContainer, PageContent, PageProps, MediaCard, MediaList } from 'mediashare/components/layout';
import { AuthorProfileDto } from 'mediashare/rxjs-api';
import {
  useEditPlaylistItemById,
  useViewMediaItemById,
  useViewPlaylistItemById,
} from 'mediashare/hooks/navigation';
import {
  getPlaylistById,
  MappedPlaylistMediaItem,
  selectMappedPlaylistMediaItems,
} from 'mediashare/store/modules/playlist';
import { addPlaylistItem } from 'mediashare/store/modules/playlistItem';

// @ts-ignore
export const PlaylistItemDetail = ({ route, globalState = { tags: [] } }: PageProps) => {
  const dispatch = useDispatch();
  
  const { disableEdit = false } = route?.params || {};
  
  // const addToPlaylist = useRouteWithParams(routeNames.addSelectedToPlaylist);
  const viewMediaItemById = useViewMediaItemById();
  const viewPlaylistItemById = useViewPlaylistItemById();
  const editPlaylistItemById = useEditPlaylistItemById();
  // const goToShareWith = useRouteName(routeNames.shareWith);
  // const goToPlaylists = usePlaylists();
  // const playFromBeginning = useViewPlaylistItemById();
  
  const appUserId = useAppSelector((state) => state?.user?.entity?._id);
  const mediaItem = useAppSelector((state) => state?.playlistItem?.entity);
  
  const {
    _id,
    playlistId,
    title = '',
    authorProfile = {} as AuthorProfileDto,
    createdBy,
    description = '',
    image,
    uri,
    visibility,
    shareCount = 0,
    viewCount = 0,
    likesCount = 0,
  } = mediaItem || {};
  
  const allowEdit = createdBy === appUserId && !disableEdit;

  const { tags = [] } = globalState;
  const tagKeys = (mediaItem?.tags || []).map(({ key }) => key);
  const mappedTags = useMemo(() => mapAvailableTags(tags).filter((tag) => tag.isMediaTag), []);
  
  // These should already be loaded in state from whatever route referred us
  const { selected } = useAppSelector((state) => state?.playlist);
  const playlistMediaItems: MappedPlaylistMediaItem[] = selectMappedPlaylistMediaItems(selected) || [];
  
  const { width, height, scale } = useWindowDimensions();
  const isPortrait = height > width;
  
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
            image={image}
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
            {!isPortrait ? (
              <MediaList
                key={playlistId}
                list={playlistMediaItems}
                showImage={true}
                selectable={false}
                showActions={true}
                onViewDetail={activatePlaylistDetail}
              />
            ) : null}
          </MediaCard>
        </ScrollView>
      </PageContent>
    </PageContainer>
  );
  
  function hasPlaylistItemRecord(item) {
      return item._id === item.playlistItemId;
    }
  
  function activatePlaylistDetail(item) {
    console.log('activatePlaylistDetail');
    console.log(item);
    return allowEdit
      ? editPlaylistMediaItem({ playlistItemId: item.playlistItemId, mediaId: item.mediaItemId, uri: item.uri, playlistId })
      : hasPlaylistItemRecord(item)
        ? viewPlaylistMediaItem({ playlistItemId: item._id, uri: item.uri })
        : viewPlaylistMediaItem({ mediaId: item._id, uri: item.uri });
  }
  
  async function viewPlaylistMediaItem({ playlistItemId = undefined, mediaId = undefined, uri = undefined }) {
    console.log('viewPlaylistMediaItem');
    if (playlistItemId) {
      await viewPlaylistItemById({ playlistItemId, uri });
    } else if (mediaId) {
      await viewMediaItemById({ mediaId, uri });
    }
  }
  
  async function editPlaylistMediaItem({ playlistItemId = undefined, playlistId = undefined, mediaId = undefined, uri = undefined }) {
    console.log('editPlaylistMediaItem');
    let itemId = playlistItemId || mediaId;
    if (!playlistItemId) {
      // Create the playlist item
      console.log('creating playlist item');
      const { payload } = (await dispatch(addPlaylistItem({ playlistId, mediaId, sortIndex: 0 }))) as any;
      console.log('dumping payload');
      itemId = payload._id;
      console.log(payload);
      console.log('reload playlist');
      await dispatch(getPlaylistById(playlistId));
    }
    await editPlaylistItemById({ playlistItemId: itemId });
  }
};

export default withLoadingSpinner(undefined)(withGlobalStateConsumer(PlaylistItemDetail));
