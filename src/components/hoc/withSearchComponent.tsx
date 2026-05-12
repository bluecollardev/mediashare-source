import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MultiSelectIcon } from 'mediashare/components/form';
import { makeEnum } from 'mediashare/core/utils/factory';
import { useIsMounted } from 'mediashare/hooks/useIsMounted';
import { GlobalStateProps } from 'mediashare/core/globalState';
import { Divider, Searchbar, Switch } from 'react-native-paper';
import { components, theme } from 'mediashare/styles';

const supportedContentTypes = ['playlists', 'media', 'all'] as const;
export const SupportedContentTypes = makeEnum(supportedContentTypes);

export interface PlaylistSearchProps {
  globalState?: GlobalStateProps;
  loaded: boolean;
  loadData: () => Promise<void>;
  forcedSearchMode?: boolean;
  defaultSearchTarget: typeof SupportedContentTypes;
  showSearchTargetField?: boolean;
  networkContent?: boolean;
  showNetworkContentSwitch?: boolean;
}

export const withSearchComponent = (WrappedComponent: any, searchKey: string) => {
  return function SearchComponent({
    globalState = {
      updateSearchFilters: (searchKey: string, value: any) => undefined,
      setForcedSearchMode: (searchKey: string, value: any) => undefined,
      getSearchFilters: (searchKey: string) => undefined,
      setDisplayMode: (value: string) => undefined,
    },
    loaded,
    loadData = () => undefined,
    forcedSearchMode,
    defaultSearchTarget,
    // TODO: Set this to false!
    showSearchTargetField = false,
    networkContent = false,
    showNetworkContentSwitch = false,
    ...rest
  }: PlaylistSearchProps & any) {
    const isMountedRef = useIsMounted();
    
    const { searchIsActive, updateSearchFilters, getSearchFilters, setForcedSearchMode, filtersExpanded: gsFiltersExpanded, setFiltersExpanded: gsSetFiltersExpanded } = globalState;
    const searchFilters = getSearchFilters(searchKey);
    const [searchText, setSearchText] = useState(searchFilters?.text || '');
    const [searchTags, setSearchTags] = useState(searchFilters?.tags || []);
    const [isLoaded, setIsLoaded] = useState(forcedSearchMode);
    const searchActive = searchIsActive(searchKey);
    const [searchTarget, setSearchTarget] = useState([defaultSearchTarget]);
    const [includeNetworkContent, setIncludeNetworkContent] = useState(networkContent);
    // Filter panel visibility is driven by globalState so the AppHeader's
    // filter icon can flip it from outside this component. Defaults open
    // when there's no active search.
    const filtersExpanded =
      typeof gsFiltersExpanded === 'function'
        ? gsFiltersExpanded(searchKey)
        : !searchActive;
    const setFiltersExpanded = (value: boolean) => {
      if (typeof gsSetFiltersExpanded === 'function') {
        gsSetFiltersExpanded(searchKey, value);
      }
    };

    const mappedTags = useMemo(() => {
      const availableTags = Array.isArray(globalState?.tags) ? globalState.tags : [];
      let filtered = availableTags;
      if (searchTarget?.[0] === SupportedContentTypes.playlists)
        filtered = availableTags.filter((tag) => tag.isPlaylistTag);
      else if (searchTarget?.[0] === SupportedContentTypes.media)
        filtered = availableTags.filter((tag) => tag.isMediaTag);
      // De-duplicate by key — some tags (e.g. 'pricing', 'pain-relief')
      // exist as both a media-tag and a playlist-tag with the same key
      // string; the 'all' target unions both, which makes React /
      // SectionedMultiSelect complain about duplicate keys when the
      // dropdown opens.
      const seen = new Set<string>();
      return filtered.filter((tag: any) => {
        if (seen.has(tag.key)) return false;
        seen.add(tag.key);
        return true;
      });
    }, [globalState?.tags, searchTarget]);
    ``
    const shouldShowApplyButton = () => {
      const textChanged = searchFilters?.text != searchText;
      const tagsChanged = JSON.stringify(searchFilters?.tags) !== JSON.stringify(searchTags);
      const targetChanged = searchFilters?.target !== searchTarget?.[0];
      const networkContentChanged = searchFilters?.networkContent !== includeNetworkContent;
      return textChanged || tagsChanged || targetChanged || networkContentChanged;
    }
    
    useEffect(() => {
      if (forcedSearchMode) {
        setForcedSearchMode(searchKey, true);
      }
    }, [forcedSearchMode]);
    
    /* useEffect(() => {
      // Only update state if component is mounted
      console.log(`Search active? ${searchActive}`);
      if (searchActive === false) {
        setIsLoaded(false);
        console.log('withSearchComponent searchActive is false effect...');
        loadData().then(() => {
          if (!isMountedRef.current) return;
          updateSearchText('');
          updateSearchTags([]);
        });
      } else if (searchActive === true) {
        setIsLoaded(true);
      }
    }, [searchActive]) */
  
    useEffect(() => {
      if (loaded && !isLoaded) {
        console.log('withSearchComponent loadData...');
        loadData().then(() => {
          if (!isMountedRef.current) return;
          setIsLoaded(true);
        });
      }
    }, [loaded, isLoaded, isMountedRef]);
  
    useEffect(() => {
      if (searchFilters?.text) {
        updateSearchText(searchFilters.text);
      }
      if (Array.isArray(searchFilters?.tags)) {
        updateSearchTags(searchFilters.tags);
      }
    }, [searchFilters]);
    
    const onSelectedSearchTargetChange = (searchTarget) => {
      setSearchTarget(searchTarget);
    };
    
    const searchTargetOptions = [
      { key: SupportedContentTypes.playlists, value: `Playlists` },
      { key: SupportedContentTypes.media, value: `Media Items` },
      { key: SupportedContentTypes.all, value: `All Types` },
    ];
    
    // TODO: Fix hidden search results that can't be reached by scrolling...
    /* let wrappedComponentStyle = {};
    if ((forcedSearchMode && !searchActive && shouldShowApplyButton()) || (searchActive && shouldShowApplyButton())) {
      wrappedComponentStyle = { marginBottom: 100, height: showNetworkContentSwitch ? '50%' : '60%' };
    } else if (searchActive && !shouldShowApplyButton()) {
      wrappedComponentStyle = { marginBottom: 100, height: '75%' };
    } else {
      wrappedComponentStyle = { height: '100%' };
    }
    // console.log('wrapped component style');
    // console.log(wrappedComponentStyle); */
    
    // On web, pin the search/filter UI to the top of the scrolling
    // container so it stays visible as the user scrolls through
    // results. `position: 'sticky'` is web-only (react-native-web
    // passes it through). On native, fall back to default flow.
    const stickyHeaderStyle =
      Platform.OS === 'web'
        ? ({
            position: 'sticky' as any,
            top: 0,
            zIndex: 10,
            backgroundColor: theme.colors.background,
          } as any)
        : undefined;

    return (
      <>
        <View style={stickyHeaderStyle}>
          {(forcedSearchMode ? forcedSearchMode : searchActive) ? (
            <View style={{ marginBottom: 10 }}>
              <Searchbar
                style={{ width: '100%', marginTop: 15, backgroundColor: theme.colors.surface }}
                inputStyle={{ fontSize: 15 }}
                placeholder="Keywords"
                value={searchText}
                onChangeText={(text) => updateSearchText(text)}
                clearIcon="clear"
                // Tapping anywhere in the searchbar expands the filter panel —
                // single click, regardless of dirty-flag state.
                onFocus={() => setFiltersExpanded(true)}
                autoCapitalize="none"
              />
            </View>
          ) : null}
          {/* Read-only chip display of selected tags while the filter
              panel is collapsed — gives the user feedback about active
              tag filters without exposing the dropdown control. */}
          {!(filtersExpanded || shouldShowApplyButton()) &&
            (forcedSearchMode ? forcedSearchMode : searchActive) &&
            searchTags?.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: 4,
                marginBottom: 10,
              }}
            >
              {searchTags.map((tagKey) => {
                const label =
                  mappedTags.find((t) => t.key === tagKey)?.value || tagKey;
                return (
                  // Plain View+Text instead of <Chip> so there's no
                  // tappable area and no risk of a close-X glyph
                  // sneaking in via library defaults.
                  <View
                    key={`collapsed-tag-${tagKey}`}
                    style={{
                      margin: 4,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 14,
                      backgroundColor: theme.colors.surface,
                    }}
                  >
                    <Text
                      style={{ color: theme.colors.text, fontSize: 12 }}
                    >
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          {filtersExpanded || shouldShowApplyButton() ? (
            <>
              {showSearchTargetField ? (
                <View style={{ marginBottom: 0 }}>
                  <SectionedMultiSelect
                    colors={components.multiSelect.colors}
                    styles={components.multiSelect.styles}
                    items={searchTargetOptions}
                    IconRenderer={MultiSelectIcon as any}
                    uniqueKey="key"
                    displayKey="value"
                    subKey="children"
                    searchPlaceholderText="Enter Text"
                    selectText={searchTargetOptions.find((target) => target.key === searchTarget?.[0])?.value || 'Content Types'}
                    confirmText="Done"
                    onSelectedItemsChange={onSelectedSearchTargetChange}
                    selectedItems={searchTarget}
                    single={true}
                    hideSearch={true}
                    expandDropDowns={false}
                    readOnlyHeadings={false}
                    showDropDowns={false}
                    showChips={false}
                    parentChipsRemoveChildren={false}
                    showCancelButton={true}
                    modalWithTouchable={false}
                    modalWithSafeAreaView={true}
                  />
                </View>
              ) : null}
              <View style={{ marginBottom: 10 }}>
                <SectionedMultiSelect
                  colors={components.multiSelect.colors}
                  styles={components.multiSelect.styles}
                  items={mappedTags}
                  IconRenderer={MultiSelectIcon as any}
                  uniqueKey="key"
                  displayKey="value"
                  subKey="children"
                  searchPlaceholderText="Enter Text"
                  selectText="Select Tags"
                  confirmText="Done"
                  onSelectedItemsChange={updateSearchTags}
                  selectedItems={searchTags}
                  hideSearch={true}
                  showRemoveAll={false}
                  expandDropDowns={false}
                  readOnlyHeadings={false}
                  showDropDowns={true}
                  parentChipsRemoveChildren={true}
                  showCancelButton={true}
                  modalWithTouchable={false}
                  modalWithSafeAreaView={false}
                />
              </View>
              {showNetworkContentSwitch ? (
                <>
                  <Divider style={{ marginBottom: 10 }} />
                  <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ display: 'flex', flex: 3, paddingLeft: 15 }}>
                      <Text style={{ color: theme.colors.textDarker, fontSize: 13 }}>Include Network Content</Text>
                    </View>
                    <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 15 }}>
                      <Switch color={theme.colors.accent} value={includeNetworkContent} onValueChange={() => toggleNetworkContent()} />
                    </View>
                  </View>
                </>
              ) : null}

            </>
            ) : null}
          {filtersExpanded || shouldShowApplyButton() ? (
            <>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'stretch',
                  marginTop: showNetworkContentSwitch ? 15 : 0,
                }}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={!shouldShowApplyButton()}
                  onPress={() => submitSearch()}
                  style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: 0,
                    minWidth: 0,
                    minHeight: 48,
                    flexDirection: 'row',
                    backgroundColor: shouldShowApplyButton()
                      ? theme.colors.accent
                      : theme.colors.secondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 16,
                  }}
                >
                  <MaterialIcons
                    name="check-circle"
                    color="#ffffff"
                    size={18}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: '#ffffff',
                      fontSize: 13,
                      fontFamily: theme.fonts.medium.fontFamily,
                    }}
                  >
                    Apply
                  </Text>
                </TouchableOpacity>
                {hasActiveFilters() ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => clearSearch()}
                    style={{
                      width: 96,
                      flexGrow: 0,
                      flexShrink: 0,
                      flexBasis: 96,
                      minHeight: 48,
                      marginLeft: 8,
                      flexDirection: 'row',
                      backgroundColor: theme.colors.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcons
                      name="cancel"
                      color="#ffffff"
                      size={18}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 'bold',
                      }}
                    >
                      Clear
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <Divider style={{ marginTop: showNetworkContentSwitch ? 15 : 0 }} />
            </>
          ) : null}
        </View>
        <WrappedComponent
          globalState={globalState}
          {...rest}
          updateSearchText={updateSearchText}
          updateSearchTags={updateSearchTags}
        />
      </>
    );
    
    function toggleNetworkContent() {
      if (includeNetworkContent) {
        setIncludeNetworkContent(false);
      } else {
        setIncludeNetworkContent(true);
      }
    }

    function updateSearchText(value) {
      // Set the in-component state value
      setSearchText(value);
    }

    function updateSearchTags(values) {
      // Set the in-component state value
      setSearchTags(values);
    }

    function submitSearch() {
      // Update global search filters
      const searchValue = {
        target: searchTarget?.[0] || '',
        networkContent: includeNetworkContent,
        text: searchText,
        tags: [...searchTags]
      };
      console.log(`searching [${searchKey}] for ${JSON.stringify(searchValue, null, 2)}`);
      updateSearchFilters(searchKey, searchValue);
      setIsLoaded(false);
      // Collapse the filter panel once the search is committed.
      setFiltersExpanded(false);
    }

    function hasActiveFilters() {
      // Pending (in-component) text or tag edits count as active filters
      // immediately so Clear/Apply can act on them.
      const pendingFilters =
        !!searchText || (searchTags && searchTags.length > 0);
      // Pending network-content toggle differing from the page default.
      const pendingNetworkContent = includeNetworkContent !== networkContent;
      // Pending target differing from the page default.
      const pendingTarget = searchTarget?.[0] !== defaultSearchTarget;
      // Persisted filters: defer to globalState's route-aware predicate
      // so the Clear button visibility matches the AppHeader icon color.
      const persistedFilters =
        typeof globalState?.searchIsFiltering === 'function' &&
        globalState.searchIsFiltering(searchKey) === true;
      return (
        pendingFilters ||
        pendingNetworkContent ||
        pendingTarget ||
        persistedFilters
      );
    }

    function clearSearch() {
      setSearchText('');
      setSearchTags([]);
      // Reset toggle/target back to the page's defaults (passed as props)
      // so the filter icon flips back to white and the next Apply on Search
      // doesn't surface a hidden non-default networkContent value.
      setIncludeNetworkContent(networkContent);
      setSearchTarget([defaultSearchTarget]);
      updateSearchFilters(searchKey, {
        target: defaultSearchTarget,
        networkContent: networkContent,
        text: '',
        tags: [],
      });
      setIsLoaded(false);
    }
  };
};
