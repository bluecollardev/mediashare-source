import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Divider } from 'react-native-paper';
import { useAppSelector } from 'mediashare/store';
import { findUserPlaylists, getUserPlaylists } from 'mediashare/store/modules/playlists';
import { updateUserPlaylist } from 'mediashare/store/modules/playlist';
import { clear } from 'mediashare/store/modules/search';
import { AuthorProfileDto, UpdatePlaylistDto } from 'mediashare/apis/media-svc/rxjs-api';
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

export const ChoosePlaylistForSelectedComponent = ({ entities, viewMediaItem, addItem, removeItem }) => {
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

const ChoosePlaylistForSelectedWithSearch = withSearchComponent(ChoosePlaylistForSelectedComponent, 'choosePlaylistForSelected');

export const ChoosePlaylistForSelected = ({ route, globalState }: PageProps) => {
  const dispatch = useDispatch();
  const viewMediaItem = useViewMediaItemById();
  const goBack = useGoBack();
  
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(refresh, [dispatch]);
  
  const { entities = [] as any[], loaded, loading } = useAppSelector((state) => state?.userPlaylists);
  const selectedMediaItems = useAppSelector((state) => state?.search)?.selected;
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);

  useEffect(() => {
    loadData().then();
  }, []);

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ChoosePlaylistForSelectedWithSearch
          globalState={globalState}
          loaded={(!loaded && !loading) || (loaded && entities.length > 0)}
          loadData={loadData}
          defaultSearchTarget="media"
          entities={entities}
          viewMediaItem={viewMediaItem}
          addItem={addItem}
          removeItem={removeItem}
        />
        {/* TODO: Add to NEW playlist */}
        {loaded && entities.length === 0 ? (
          <NoContent onPress={() => undefined} messageButtonText="There are no playlists to add to." icon="info" />
        ) : null}
      </KeyboardAvoidingPageContent>
      <PageActions>
        <ActionButtons onPrimaryClicked={updatePlaylists} primaryLabel="Confirm Selection" onSecondaryClicked={cancel} />
      </PageActions>
    </PageContainer>
  );

  async function loadData() {
    const search = globalState?.getSearchFilters('choosePlaylistForSelected');
    const args = {
      text: search?.text ? search.text : '',
      tags: search?.tags || [],
    };
  
    if (args.text || args.tags.length > 0) {
      await dispatch(findUserPlaylists(args));
    } else {
      await dispatch(getUserPlaylists());
    }
  }

  function addItem(e) {
    return updateSelectedPlaylists(true, e);
  }

  function removeItem(e) {
    return updateSelectedPlaylists(false, e);
  }

  function updateSelectedPlaylists(bool: boolean, playlist: any) {
    const filtered = bool ? selectedPlaylists.concat([playlist]) : selectedPlaylists.filter((item) => item._id !== playlist._id);
    setSelectedPlaylists(filtered);
  }

  async function updatePlaylists() {
    const selectedMediaIds = selectedMediaItems.map((item) => item._id);
  
    const updatePlaylist = async (selectedPlaylist) => {
      const dto: UpdatePlaylistDto = {
        // TODO: Get rid of everthing other than _id and mediaIds
        //  To do that we need to make API update smarter...
        // description: '', imageSrc: '', tags: undefined, title: '',
        description: selectedPlaylist.description,
        imageSrc: selectedPlaylist.imageSrc,
        tags: selectedPlaylist.tags,
        title: selectedPlaylist.title,
        _id: selectedPlaylist._id,
        mediaIds: [...(selectedPlaylist.mediaItems || []).map((item) => item._id), ...selectedMediaIds]
      };
      return dispatch(updateUserPlaylist(dto));
    }
    
    const addSelectedItemsToPlaylists = selectedPlaylists.map(async (selectedPlaylist) => {
      return await updatePlaylist(selectedPlaylist);
    });
  
    await Promise.all(addSelectedItemsToPlaylists);
    await dispatch(clear());
    await refresh();
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
})(withGlobalStateConsumer(ChoosePlaylistForSelected));
