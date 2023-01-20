import { ActionButtons } from 'mediashare/components/layout';
import { useIsMounted } from 'mediashare/hooks/useIsMounted'
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native'
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MultiSelectIcon } from 'mediashare/components/form';
import { GlobalStateProps } from 'mediashare/core/globalState';
import { Divider, Searchbar, Switch } from 'react-native-paper'
import { components, theme } from 'mediashare/styles';

export interface PlaylistSearchProps {
  globalState?: GlobalStateProps;
  loaded: boolean;
  loadData: () => Promise<void>;
  searchTarget: 'playlists' | 'media';
  forcedSearchMode?: boolean;
  networkContent?: boolean;
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
    searchTarget,
    forcedSearchMode,
    networkContent = false,
    ...rest
  }: PlaylistSearchProps & any) {
    const isMountedRef = useIsMounted();
    
    const { searchIsActive, updateSearchFilters, getSearchFilters, setForcedSearchMode } = globalState;
    const searchFilters = getSearchFilters(searchKey);
    const [searchText, setSearchText] = useState(searchFilters?.text || '');
    const [searchTags, setSearchTags] = useState(searchFilters?.tags || []);
    const [isLoaded, setIsLoaded] = useState(true);
    const displaySearch = searchIsActive(searchKey);
    const [includeNetworkContent, setIncludeNetworkContent] = useState(false);

    const mappedTags = useMemo(() => {
      const availableTags = Array.isArray(globalState?.tags) ? globalState.tags : [];
      if (searchTarget === 'playlists') return availableTags.filter((tag) => tag.isPlaylistTag);
      if (searchTarget === 'media') return availableTags.filter((tag) => tag.isMediaTag);
      return availableTags;
    }, []);
    
    const shouldShowApplyButton = () => {
      return (searchFilters?.text != searchText)
      || (JSON.stringify(searchFilters?.tags) !== JSON.stringify(searchTags));
    }
    
    useEffect(() => {
      if (forcedSearchMode) {
        setForcedSearchMode(searchKey, true);
      }
    }, [forcedSearchMode]);
    
    useEffect(() => {
      // Only update state if component is mounted
      if (displaySearch === false) {
        loadData().then(() => {
          if (!isMountedRef.current) return;
          updateSearchText('');
          updateSearchTags([]);
        });
      }
    }, [displaySearch])
  
    useEffect(() => {
      if (!loaded || !isLoaded) {
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
    return (
      <>
        {(forcedSearchMode ? forcedSearchMode : displaySearch) ? (
          <>
            <Searchbar
              style={{ width: '100%', marginTop: 15, backgroundColor: theme.colors.surface }}
              inputStyle={{ fontSize: 15 }}
              placeholder="Keywords"
              value={searchText}
              onChangeText={(text) => updateSearchText(text)}
              clearIcon="clear"
              autoCapitalize="none"
            />
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
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ display: 'flex', flex: 3, paddingLeft: 15 }}>
                <Text style={{ color: theme.colors.textDarker, fontSize: 13 }}>Include Network Content</Text>
              </View>
              <View style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 15 }}>
                <Switch value={includeNetworkContent} onValueChange={() => toggleNetworkContent()} />
              </View>
              
            </View>
            {shouldShowApplyButton() && (
              <ActionButtons
                loading={!isLoaded}
                primaryLabel="Apply"
                primaryButtonStyles={{ backgroundColor: theme.colors.accent }}
                showSecondary={false}
                containerStyles={{ marginHorizontal: 0, marginTop: 15 }}
                onPrimaryClicked={() => submitSearch()}
              />
            )}
            <Divider style={{ marginTop: 15 }} />
          </>
        ) : null}
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
      const searchValue = { text: searchText, tags: [...searchTags] };
      updateSearchFilters(searchKey, searchValue);
      setIsLoaded(false);
    }
  };
};
