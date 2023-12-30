import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MultiSelectIcon } from 'mediashare/components/form';
import { ActionButtons } from 'mediashare/components/layout';
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
    
    const { searchIsActive, updateSearchFilters, getSearchFilters, setForcedSearchMode } = globalState;
    const searchFilters = getSearchFilters(searchKey);
    const [searchText, setSearchText] = useState(searchFilters?.text || '');
    const [searchTags, setSearchTags] = useState(searchFilters?.tags || []);
    const [isLoaded, setIsLoaded] = useState(false);
    const searchActive = searchIsActive(searchKey);
    const [searchTarget, setSearchTarget] = useState([defaultSearchTarget]);
    const [includeNetworkContent, setIncludeNetworkContent] = useState(networkContent);

    const mappedTags = useMemo(() => {
      const availableTags = Array.isArray(globalState?.tags) ? globalState.tags : [];
      if (searchTarget?.[0] === SupportedContentTypes.playlists) return availableTags.filter((tag) => tag.isPlaylistTag);
      if (searchTarget?.[0] === SupportedContentTypes.media) return availableTags.filter((tag) => tag.isMediaTag);
      return availableTags;
    }, []);
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
    
    // TODO: Fix this
    /* useEffect(() => {
      // Only update state if component is mounted
      console.log(`Search active? ${searchActive}`);
      if (searchActive === false) {
        console.log('withSearchComponent searchActive is false effect...');
        loadData().then(() => {
          if (!isMountedRef.current) return;
          updateSearchText('');
          updateSearchTags([]);
        });
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
    }, [isLoaded, isMountedRef]);
  
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
    
    return (
      <>
        <>
          {(forcedSearchMode ? forcedSearchMode : searchActive) ? (
            <View style={{ marginBottom: 10 }}>
              <Searchbar
                style={{ width: '100%', marginTop: 15, backgroundColor: theme.colors.surface }}
                inputStyle={{ fontSize: 15 }}
                placeholder="Keywords"
                value={searchText}
                onChangeText={(text) => updateSearchText(text)}
                clearIcon="clear"
                autoCapitalize="none"
              />
            </View>
          ) : null}
          {(forcedSearchMode && !searchActive && shouldShowApplyButton()) || (searchActive && shouldShowApplyButton()) ? (
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
                  showRemoveAll={true}
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
          {(forcedSearchMode && !searchActive && shouldShowApplyButton()) || (searchActive && shouldShowApplyButton()) ? (
            <>
              <ActionButtons
                loading={!isLoaded}
                primaryLabel="Apply"
                primaryButtonStyles={{ backgroundColor: theme.colors.accent }}
                showSecondary={false}
                containerStyles={{ marginHorizontal: 0, marginTop: showNetworkContentSwitch ? 15 : 0 }}
                onPrimaryClicked={() => submitSearch()}
              />
              <Divider style={{ marginTop: showNetworkContentSwitch ? 15 : 0 }} />
            </>
          ) : null}
        </>
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
    }
  };
};
