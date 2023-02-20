import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Divider } from 'react-native-paper';
import { useAppSelector } from 'mediashare/store';
import { getPlaylistById, updateUserPlaylist } from 'mediashare/store/modules/playlist';
import { findMediaItems, searchMediaItems } from 'mediashare/store/modules/mediaItems';
import { AuthorProfileDto, UpdatePlaylistDto } from 'mediashare/rxjs-api';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { withSearchComponent } from 'mediashare/components/hoc/withSearchComponent';
import { useGoBack, useViewMediaItemById } from 'mediashare/hooks/navigation';
// import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import {
  PageContainer,
  PageActions,
  PageProps,
  ActionButtons,
  MediaListType,
  MediaListItem,
  NoContent,
  KeyboardAvoidingPageContent,
} from 'mediashare/components/layout';

import { theme } from 'mediashare/styles';

export const ChooseMediaForPlaylistComponent = ({ entities, viewMediaItem, addItem, removeItem }) => {
  return <FlatList data={entities} renderItem={({ item }) => renderVirtualizedListItem(item)} keyExtractor={({ _id }) => `playlist_${_id}`} />;

  function renderVirtualizedListItem(item) {
    const { _id = '', title = '', authorProfile = {} as AuthorProfileDto, imageSrc = '' } = item;
    return (
      <>
        <MediaListItem
          key={`add_to_playlist_${_id}`}
          title={title}
          titleStyle={styles.titleText}
          description={<MediaListItem.Description data={{ authorProfile }} />}
          showImage={true}
          showPlayableIcon={false}
          showActions={true}
          image={imageSrc}
          selectable={true}
          onViewDetail={() => {
            viewMediaItem({ mediaId: item._id, uri: item.uri }).then();
          }}
          onChecked={(v) => (v ? addItem(item) : removeItem(item))}
        />
        <Divider key={`playlist_divider_${item._id}`} />
      </>
    );
  }
};

const ChooseMediaForPlaylistComponentWithSearch = withSearchComponent(ChooseMediaForPlaylistComponent, 'chooseMediaForPlaylist');

export const ChooseMediaForPlaylist = ({ route, globalState }: PageProps) => {
  const { playlistId } = route.params;

  const dispatch = useDispatch();
  const viewMediaItem = useViewMediaItemById();
  const goBack = useGoBack();

  const playlist = useAppSelector((state) => state?.playlist?.selected);
  
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(refresh, [dispatch]);
  // @ts-ignore
  const [mediaItems, setMediaItems] = useState((playlist?.mediaItems as MediaListType[]) || []);

  const { loading, loaded, entities = [] as any[] } = useAppSelector((state) => state?.mediaItems);

  useEffect(() => {
    loadData().then();
  }, []);

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ChooseMediaForPlaylistComponentWithSearch
          globalState={globalState}
          loaded={(!loaded && !loading) || (loaded && entities.length > 0)}
          loadData={loadData}
          defaultSearchTarget="media"
          entities={entities}
          viewMediaItem={viewMediaItem}
          addItem={addItem}
          removeItem={removeItem}
          showNetworkContentSwitch={true}
        />
        {loaded && entities.length === 0 ? (
          <NoContent onPress={() => undefined} messageButtonText="There are no items in your media library to add. Try enabling the 'Search Network' option." icon="info" />
        ) : null}
      </KeyboardAvoidingPageContent>
      {entities.length > 0 ? (
        <PageActions>
          <ActionButtons onPrimaryClicked={saveItems} primaryLabel="Confirm Selection" onSecondaryClicked={cancel} disablePrimary={entities.length === 0} />
        </PageActions>
      ) : null}
    </PageContainer>
  );

  async function loadData() {
    const search = globalState?.getSearchFilters('chooseMediaForPlaylist');
    const args = {
      target: search?.target ? search.target : '',
      text: search?.text ? search.text : '',
      tags: search?.tags || [],
    };

    await dispatch(getPlaylistById(playlistId));
    const searchArgs = (args.text || args.tags.length > 0) ? args : {};
    if (search?.networkContent === true) {
      await dispatch(searchMediaItems(searchArgs));
    } else {
      await dispatch(findMediaItems(searchArgs));
    }
  }

  function addItem(e) {
    return updateMediaItemsList(true, e);
  }

  function removeItem(e) {
    return updateMediaItemsList(false, e);
  }

  function updateMediaItemsList(bool: boolean, mediaItem: MediaListType) {
    const filtered = bool ? mediaItems.concat([mediaItem]) : mediaItems.filter((item) => item._id !== mediaItem._id);
    setMediaItems(filtered);
  }

  async function saveItems() {
    const { visibility, tags } = playlist as any;
    const dto: UpdatePlaylistDto = {
      mediaIds: mediaItems.map((item) => item._id),
      description: playlist.description,
      title: playlist.title,
      visibility: visibility,
      tags: tags,
      _id: playlistId,
      // @ts-ignore
      imageSrc: playlist?.imageSrc,
    };
    await dispatch(updateUserPlaylist(dto));
    await dispatch(getPlaylistById(playlistId));
    goBack();
  }
  
  async function refresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function cancel() {
    goBack();
  }
};

const styles = StyleSheet.create({
  titleText: {
    marginBottom: 4,
    fontFamily: theme.fonts.medium.fontFamily,
  },
});

export default withLoadingSpinner((state) => {
  return !!state?.mediaItems?.loading || false;
})(withGlobalStateConsumer(ChooseMediaForPlaylist));
