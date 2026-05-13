import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { routeNames } from 'mediashare/routes';
import { useAppSelector } from 'mediashare/store';
import { makeEnum } from 'mediashare/core/utils/factory';
import { useSnack } from 'mediashare/hooks/useSnack';
import { addUserPlaylist } from 'mediashare/store/modules/playlist';
import { getUserPlaylists } from 'mediashare/store/modules/playlists';
import { search as searchContent, select } from 'mediashare/store/modules/search';
import { AuthorProfile } from 'mediashare/models/AuthorProfile';
import { CreatePlaylistDto, PlaylistDto } from 'mediashare/apis/media-svc/rxjs-api';
import { GlobalStateProps, withGlobalStateConsumer } from 'mediashare/core/globalState';
import { useRouteName, useViewMediaItemById, useViewPlaylistById } from 'mediashare/hooks/navigation';
import { SupportedContentTypes, withSearchComponent } from 'mediashare/components/hoc/withSearchComponent';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { FAB, Divider } from 'react-native-paper';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// Paper's Text — the bare `import { Text } from 'react-native'` got
// resolved to the DOM Text constructor under our webpack setup
// (React rendered it as a string tag → "Failed to construct 'Text'").
import { Text } from 'react-native-paper';
import { PageActions, PageContainer, KeyboardAvoidingPageContent, PageProps, MediaListItem, ActionButtons, NoContent, TrendingSection } from 'mediashare/components/layout';
// import { RecentlyAdded } from 'mediashare/components/layout/RecentlyAdded';
// import { RecentlyPlayed } from 'mediashare/components/layout/RecentlyPlayed';
import { TagBlocks } from 'mediashare/components/layout/TagBlocks';
import { getPopularPlaylists } from 'mediashare/store/modules/playlists';
import { getPopularMediaItems } from 'mediashare/store/modules/mediaItems';
import { createRandomRenderKey } from 'mediashare/core/utils/uuid';
import { theme, components } from 'mediashare/styles';

export interface SearchProps {
  list: PlaylistDto[];
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

    // Phone keeps the existing list. Tablet (≥768) → 3-up cards,
    // desktop (≥1024) → 4-up. Selection mode falls back to list so
    // the checkbox / bulk flows keep working untouched.
    const { width } = useWindowDimensions();
    const columns = selectable
      ? 1
      : width >= 1024
      ? 4
      : width >= 768
      ? 3
      : 1;

    if (columns > 1) {
      return (
        <View style={styles.cardGrid}>
          {sortedList.map((item) => renderCard(item))}
        </View>
      );
    }
    return (
      <FlatList
        data={sortedList}
        renderItem={({ item }) => renderVirtualizedListItem(item)}
        keyExtractor={({ _id }) => `playlist_${_id}`}
      />
    );

    function renderCard(item) {
      const {
        _id = '',
        title = '',
        authorProfile = {} as AuthorProfile,
        mediaIds = [],
        mediaItems = [],
        imageSrc = '',
        contentType = 'media',
      } = item;
      const itemCount = mediaIds?.length || mediaItems?.length || 0;
      const authorName = authorProfile?.authorName;
      const typeLabel =
        contentType === 'playlist'
          ? 'Playlist'
          : contentType === 'mediaItem'
          ? 'Media'
          : '';
      const cellWidthPct = `${100 / columns}%` as any;
      return (
        <View
          key={`search_card_${contentType}_${_id}`}
          style={[styles.cardCell, { width: cellWidthPct }]}
        >
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => onViewDetailClicked(item)}
            activeOpacity={0.85}
            style={styles.card}
          >
            <View style={styles.cardImageWrap}>
              {imageSrc ? (
                <Image
                  source={{ uri: imageSrc }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <MaterialIcons
                    name={
                      contentType === 'playlist'
                        ? 'queue-music'
                        : 'play-arrow'
                    }
                    size={40}
                    color={theme.colors.text}
                  />
                </View>
              )}
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {typeLabel}
                {contentType === 'playlist'
                  ? `  ·  ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
                  : ''}
                {authorName ? `  ·  by ${authorName}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    function renderVirtualizedListItem(item) {
      // TODO: Can we have just one or the other, either mediaIds or mediaItems?
      const { _id = '', title = '', authorProfile = {} as AuthorProfile, mediaIds = [], mediaItems = [], imageSrc = '', contentType = 'media' } = item;
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

  const { entities = [] as any[], loaded, loading } = useAppSelector((state) => state?.search);
  const searchResults = globalState?.searchIsFiltering(searchKey) ? entities : [];
  const popularPlaylists = useAppSelector((state) => state?.playlists?.popular) || [];
  const popularMediaItems = useAppSelector((state) => state?.mediaItems?.popular) || [];

  // Trending content for the empty/no-results state. Re-fetched on mount.
  useEffect(() => {
    dispatch(getPopularPlaylists());
    dispatch(getPopularMediaItems());
  }, [dispatch]);
  
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
          loaded={!loading}
          loadData={loadData}
          defaultSearchTarget={SupportedContentTypes.all}
          showSearchTargetField={true}
          // Search always includes network content; hide the toggle.
          showNetworkContentSwitch={false}
          networkContent={true}
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
        {searchResults.length === 0 ? (
          <ScrollView>
            {/* If the user has tags filtering and still no results, "no results".
                Otherwise show Popular Tags so they can pick one to refine. */}
            {globalState?.getSearchFilters(searchKey)?.tags?.length > 0 ? (
              <NoContent messageButtonText="No results were found." icon="info" />
            ) : (
              <TagBlocks
                list={tags}
                onViewDetailClicked={async (item) => {
                  // Update global search filters
                  const searchValue = { text: '', tags: [item.key] };
                  globalState?.updateSearchFilters(searchKey, searchValue);
                  await loadData();
                }}
              />
            )}
            {/* Trending sections respect the search target: all → both,
                playlists → only playlists, media → only media. */}
            {(contentType !== SupportedContentTypes.media) ? (
              <TrendingSection
                title="Trending Playlists"
                list={popularPlaylists}
                max={10}
                onItemPress={(item) => viewPlaylist({ playlistId: item._id })}
              />
            ) : null}
            {(contentType !== SupportedContentTypes.playlists) ? (
              <TrendingSection
                title="Trending Media"
                list={popularMediaItems}
                max={10}
                onItemPress={(item) =>
                  viewMediaItemById({ mediaId: item._id, uri: item.uri })
                }
              />
            ) : null}
          </ScrollView>
        ) : null}
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
    console.log('Search loadData...');
    const search = globalState?.getSearchFilters(searchKey);
    const args = {
      target: search?.target ? search.target : '',
      text: search?.text ? search.text : '',
      tags: search?.tags || [],
    };
    await dispatch(searchContent(args));
  }

  async function refresh() {
    console.log('refresh...');
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
  // Card grid is only rendered on tablet+ (width ≥ 768). Matches the
  // My Playlists treatment.
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  cardCell: {
    padding: 8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.default,
    overflow: 'hidden',
  },
  cardImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: theme.colors.background,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.fonts.medium.fontFamily,
  },
  cardMeta: {
    color: theme.colors.textDarker,
    fontSize: 12,
    marginTop: 4,
  },
});
