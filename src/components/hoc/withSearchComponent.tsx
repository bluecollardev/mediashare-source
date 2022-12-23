import { ActionButtons } from 'mediashare/components/layout';
import React, { useEffect, useMemo, useState } from 'react';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MultiSelectIcon } from 'mediashare/components/form';
import { GlobalStateProps } from 'mediashare/core/globalState';
import { Divider, Searchbar } from 'react-native-paper';
import { createRandomRenderKey } from 'mediashare/core/utils/uuid';
import { components, theme } from 'mediashare/styles';

export interface PlaylistSearchProps {
  globalState?: GlobalStateProps;
  loaded: boolean;
  loadData: () => Promise<void>;
  searchTarget: 'playlists' | 'media';
  forcedSearchMode?: boolean;
}

export const withSearchComponent = (WrappedComponent: any, historyKey) => {
  const componentKey = `${historyKey}_${createRandomRenderKey()}`;
  return function SearchComponent({
    globalState = {
      openSearchConsole: () => undefined,
      closeSearchConsole: () => undefined,
      setSearchFilters: () => undefined,
      searchIsActive: false,
    },
    loaded,
    loadData = () => undefined,
    searchTarget,
    forcedSearchMode,
    ...rest
  }: any) {
    const { searchIsActive, setSearchFilters } = globalState;
    // const searchIsFiltering = globalState?.search?.filters?.text !== '' || globalState?.search?.filters?.tags?.length > 0;
    // const [searchIsActive, setSearchIsActive] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchTags, setSearchTags] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const mappedTags = useMemo(() => {
      const availableTags = Array.isArray(globalState?.tags) ? globalState.tags : [];
      if (searchTarget === 'playlists') return availableTags.filter((tag) => tag.isPlaylistTag);
      if (searchTarget === 'media') return availableTags.filter((tag) => tag.isMediaTag);
      return availableTags;
    }, []);

    const searchFilters = globalState?.search?.filters || { text: '', tags: [] };
    const [prevSearchFilters, setPrevSearchFilters] = useState({ filters: { text: '', tags: [] } });
  
    const currentSearchFilters = globalState?.search;
    const searchFiltersUpdated = JSON.stringify(currentSearchFilters) !== JSON.stringify(prevSearchFilters)
    
    useEffect(() => {
      if (searchFiltersUpdated) {
        setPrevSearchFilters(currentSearchFilters);
        console.log(`[${componentKey}] Search filters have changed`);
        loadData().then();
      } else if (!loaded) {
        loadData().then();
      }
    }, [loaded, searchFiltersUpdated]);

    return (
      <>
        {(forcedSearchMode ? forcedSearchMode : searchIsActive) ? (
          <>
            <Searchbar
              style={{ width: '100%', marginTop: 15, backgroundColor: theme.colors.surface }}
              inputStyle={{ fontSize: 15 }}
              placeholder="Keywords"
              value={searchText}
              onChangeText={(text) => updateSearchText(text)}
              // onIconPress={() => closeSearchConsole()}
              icon=""
              // icon="arrow-back-ios"
              clearIcon="clear"
              autoCapitalize="none"
            />
            {/* <Appbar.Action icon="close" onPress={() => closeSearchConsole()} /> */}
            <SectionedMultiSelect
              colors={components.multiSelect.colors}
              styles={components.multiSelect.styles}
              items={mappedTags}
              IconRenderer={MultiSelectIcon}
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
            <ActionButtons
              loading={isLoaded}
              primaryLabel="Submit"
              primaryButtonStyles={{ backgroundColor: theme.colors.accent }}
              showSecondary={false}
              containerStyles={{ marginHorizontal: 0, marginTop: 15 }}
              onPrimaryClicked={() => submitSearch()}
            />
            <Divider />
          </>
        ) : null}
        <WrappedComponent globalState={globalState} {...rest} />
      </>
    );

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
      setIsLoaded(true);
      const searchValue = { text: searchText, tags: [...searchTags] };
      setSearchFilters(searchValue);
      globalState?.searchHistory.set(historyKey, searchValue);
      console.log(globalState.searchHistory);
      setIsLoaded(false);
      // closeSearchConsole(); // Close the search
    }
  };
};
