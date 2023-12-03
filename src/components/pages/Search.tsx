import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { routeNames } from 'mediashare/routes';
import { useAppSelector } from 'mediashare/store';
import { makeEnum } from 'mediashare/core/utils/factory';
import { useSnack } from 'mediashare/hooks/useSnack';
import { addUserPlaylist } from 'mediashare/store/modules/playlist';
import { getUserPlaylists } from 'mediashare/store/modules/playlists';
import { search as searchContent, select } from 'mediashare/store/modules/search';
import { AuthorProfileDto, CreatePlaylistDto, PlaylistResponseDto } from 'src/apis/media-svc/rxjs-api';
import { GlobalStateProps, withGlobalStateConsumer } from 'mediashare/core/globalState';
import { useRouteName, useViewMediaItemById, useViewPlaylistById } from 'mediashare/hooks/navigation';
import { SupportedContentTypes, withSearchComponent } from 'mediashare/components/hoc/withSearchComponent';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { FAB, Divider } from 'react-native-paper';
import { FlatList, RefreshControl, ScrollView, StyleSheet } from 'react-native';
// import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import { PageActions, PageContainer, KeyboardAvoidingPageContent, PageProps, MediaListItem, ActionButtons, NoContent } from 'mediashare/components/layout';
// import { RecentlyAdded } from 'mediashare/components/layout/RecentlyAdded';
// import { RecentlyPlayed } from 'mediashare/components/layout/RecentlyPlayed';
import { TagBlocks } from 'mediashare/components/layout/TagBlocks';
import { createRandomRenderKey } from 'mediashare/core/utils/uuid';
import { theme, components } from 'mediashare/styles';

export interface SearchProps {
  list: PlaylistResponseDto[];
  selectable?: boolean;
  clearSelection?: boolean;
  showActions?: boolean;
  onViewDetailClicked?: Function;
  onChecked?: (checked: boolean, item?: any) => void;
  globalState?: GlobalStateProps;
}

export const searchKey = 'search';

export const SearchComponent = withSearchComponent(
  ({ list = [], onViewDetailClicked, selectable = false, showActions = true, onChecked = () => undefined }: SearchProps) => {
    const sortedList = list.map((item) => item);
    sortedList.sort((dtoA, dtoB) => (dtoA.title > dtoB.title ? 1 : -1));

    return <FlatList data={sortedList} renderItem={({ item }) => renderVirtualizedListItem(item)} keyExtractor={({ _id }) => `playlist_${_id}`} />;

    function renderVirtualizedListItem(item) {
      // TODO: Can we have just one or the other, either mediaIds or mediaItems?
      const { _id = '', title = '', authorProfile = {} as AuthorProfileDto, mediaIds = [], mediaItems = [], imageSrc = '', contentType = 'media' } = item;
      const renderKey = `${contentType}_${_id}`;
      return (
        <>
          <MediaListItem
            key={renderKey}
            title={title}
            titleStyle={styles.titleText}
            description={
              contentType === 'playlist'
                ? <MediaListItem.Description data={{ authorProfile, itemCount: mediaIds?.length || mediaItems?.length || 0 }} showItemCount={true} />
                : contentType === 'mediaItem' ? <MediaListItem.Description data={{ authorProfile }} showItemCount={false} /> : ''
            }
            showImage={true}
            image={imageSrc}
            showPlayableIcon={false}
            showActions={showActions}
            selectable={selectable}
            onViewDetail={() => onViewDetailClicked(item)}
            onChecked={(checked) => onChecked(checked, item)}
          />
          <Divider key={`${renderKey}_divider_${item._id}`} />
        </>
      );
    }
  }
, searchKey);

const searchActionModes = ['add_to_playlist', 'add_to_library', 'share', 'delete', 'default'] as const;
export const SearchActionModes = makeEnum(searchActionModes);

// TODO: Add updateSearchText / updateSearchTags to some interface for withSearchComponent
export const Search = ({ globalState }: PageProps & any) => {
  const { tags = [] } = globalState;
  
  const dispatch = useDispatch();

  const sharePlaylistsWith = useRouteName(routeNames.sharePlaylistsWith);
  const choosePlaylist = useRouteName(routeNames.choosePlaylistForSelected);
  const viewPlaylist = useViewPlaylistById();
  const viewMediaItemById = useViewMediaItemById();
  const { element, onToggleSnackBar, setMessage } = useSnack();

  const [isSelectable, setIsSelectable] = useState(false);
  const [actionMode, setActionMode] = useState(SearchActionModes.default as string);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(refresh, [dispatch]);

  const { entities = [] as any[], loaded } = useAppSelector((state) => state?.search);
  const searchResults = globalState?.searchIsFiltering(searchKey) ? entities : [];
  
  // const searchFilters = globalState?.getSearchFilters(searchKey);
  const selectedItems = useAppSelector((state) => state?.search)?.selected;

  const [clearSelectionKey, setClearSelectionKey] = useState(createRandomRenderKey());
  useEffect(() => {
    clearCheckboxSelection();
  }, []);

  const [fabState, setFabState] = useState({ open: false });
  const contentType = globalState?.getSearchFilters(searchKey)?.target;
  const fabActions =
    searchResults?.length > 0 ? [
      ...(contentType === SupportedContentTypes.playlists
        ? [{ icon: 'library-add', label: `Add to Library`, onPress: () => activateAddToLibraryMode(), color: theme.colors.text, style: { backgroundColor: theme.colors.success } }]
        : contentType === SupportedContentTypes.media
          ? [{ icon: 'playlist-add', label: `Add to Playlist`, onPress: () => activateAddToPlaylistMode(), color: theme.colors.text, style: { backgroundColor: theme.colors.accent } }]
          : []),
        { icon: 'share', label: `Share`, onPress: () => activateShareMode(), color: theme.colors.text, style: { backgroundColor: theme.colors.primary } },
      ] : [];
  
  return (
    <PageContainer>
      <KeyboardAvoidingPageContent refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <SearchComponent
          globalState={globalState}
          loaded={loaded}
          loadData={loadData}
          defaultSearchTarget={SupportedContentTypes.playlists}
          showSearchTargetField={true}
          forcedSearchMode={true}
          key={clearSelectionKey}
          list={searchResults}
          onViewDetailClicked={async (item) => {
            // TODO: This naming is weird.... we should just use SupportedContentTypes
            if (item?.contentType === 'playlist') {
              await viewPlaylist({ playlistId: item._id });
            }
            if (item?.contentType === 'mediaItem') {
              await viewMediaItemById({ mediaId: item._id, uri: item.uri });
            }
            
          }}
          selectable={isSelectable}
          showActions={!isSelectable}
          // TODO: Need separate update methods for media items and playlists
          onChecked={updateSelection}
        />
        {!globalState.searchIsFiltering(searchKey) && searchResults.length === 0
          ? (
            <ScrollView>
              <TagBlocks
                list={tags}
                onViewDetailClicked={async (item) => {
                  // Update global search filters
                  const searchValue = { text: '', tags: [item.key] };
                  globalState?.updateSearchFilters(searchKey, searchValue);
                  await loadData();
                }}
              />
              {/*<Divider style={{ marginTop: 10, marginBottom: 20 }} />
              <RecentlyAdded list={searchResults} />
              <Divider style={{ marginTop: 10, marginBottom: 20 }} />
              <RecentlyPlayed list={searchResults} />*/}
            </ScrollView>
          ) : globalState?.searchIsFiltering(searchKey) === true && searchResults?.length === 0 ? (
            <>
              <NoContent messageButtonText="No results were found." icon="info" />
            </>
          ) : null
        }
      </KeyboardAvoidingPageContent>
      {isSelectable && actionMode === SearchActionModes.share ? (
        <PageActions>
          <ActionButtons onPrimaryClicked={confirmPlaylistsToShare} onSecondaryClicked={cancelPlaylistsToShare} primaryLabel="Share With" primaryIcon="group" />
        </PageActions>
      ) : null}
      {isSelectable && actionMode === SearchActionModes.addToPlaylist ? (
        <PageActions>
          <ActionButtons onPrimaryClicked={confirmAddToPlaylist} onSecondaryClicked={cancelAddToPlaylist} primaryLabel="Choose Playlist" primaryIcon="library-books" />
        </PageActions>
      ) : null}
      {isSelectable && actionMode === SearchActionModes.addToLibrary ? (
        <PageActions>
          <ActionButtons onPrimaryClicked={confirmAddToLibrary} onSecondaryClicked={cancelAddToLibrary} primaryLabel="Add to Library" primaryIcon="video-library" />
        </PageActions>
      ) : null}
      {element}
      {!isSelectable && searchResults?.length > 0 ? (
        <FAB.Group
          visible={true}
          open={fabState.open}
          icon={fabState.open ? 'close' : 'more-vert'}
          actions={fabActions}
          color={theme.colors.text}
          fabStyle={{ backgroundColor: fabState.open ? theme.colors.default : theme.colors.primary, ...components.fab }}
          onStateChange={(open) => {
            setFabState(open);
          }}
        />
      ) : null}
    </PageContainer>
  );

  async function loadData() {
    const search = globalState?.getSearchFilters(searchKey);
    const args = {
      target: search?.target ? search.target : '',
      text: search?.text ? search.text : '',
      tags: search?.tags || [],
    };
    await dispatch(searchContent(args));
  }

  async function refresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }
  
  function activateAddToPlaylistMode() {
    setActionMode(SearchActionModes.addToPlaylist);
    setIsSelectable(true);
  }
  
  function confirmAddToPlaylist() {
    setActionMode(SearchActionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
    choosePlaylist();
  }
  
  function cancelAddToPlaylist() {
    setActionMode(SearchActionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
  }
  
  function activateAddToLibraryMode() {
    setActionMode(SearchActionModes.addToLibrary);
    setIsSelectable(true);
  }
  
  async function confirmAddToLibrary() {
    await clonePlaylists(selectedItems);
    setActionMode(SearchActionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
  }
  
  async function clonePlaylists(selectedItems: any[] = []) {
    try {
      const requests = selectedItems.map(async (selectedItem) => {
        return clonePlaylist(selectedItem);
      });
      await Promise.all(requests);
      setMessage(`Playlists added to library`);
      onToggleSnackBar(true);
      await dispatch(getUserPlaylists());
      await loadData();
    } catch (error) {
      setMessage(error.message);
      onToggleSnackBar(false);
    }
  }
  
  async function clonePlaylist(playlist) {
    const dto: CreatePlaylistDto = {
      ...playlist as CreatePlaylistDto,
      _id: undefined,
      cloneOf: playlist._id,
      mediaIds: playlist.mediaItems.map(item => item._id),
    } as CreatePlaylistDto;
    
    await dispatch(addUserPlaylist(dto));
  }
  
  function cancelAddToLibrary() {
    setActionMode(SearchActionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
  }

  function activateShareMode() {
    setActionMode(SearchActionModes.share);
    setIsSelectable(true);
  }

  function confirmPlaylistsToShare() {
    setActionMode(SearchActionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
    sharePlaylistsWith();
  }

  function cancelPlaylistsToShare() {
    setActionMode(SearchActionModes.default);
    clearCheckboxSelection();
    setIsSelectable(false);
  }

  function updateSelection(bool, item) {
    dispatch(select({ isChecked: bool, plist: item }));
  }

  function clearCheckboxSelection() {
    const randomKey = createRandomRenderKey();
    setClearSelectionKey(randomKey);
  }
};


// @ts-ignore
export default withLoadingSpinner((state) => {
  return !!state?.search?.loading || false;
})(withGlobalStateConsumer(Search));

// @ts-ignore
const styles = StyleSheet.create({
  titleText: {
    marginBottom: 4,
    fontFamily: theme.fonts.medium.fontFamily,
  },
  deleteActionButton: {
    backgroundColor: theme.colors.error,
  },
});
