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

export const withSearchComponent = (WrappedComponent: any, searchKey: string) => {
  const componentKey = `${searchKey}_${createRandomRenderKey()}`;
  return function SearchComponent({
    globalState = {
      updateSearchFilters: (searchKey: string, value: any) => undefined,
      getSearchFilters: (searchKey: string) => undefined,
    },
    loaded,
    loadData = () => undefined,
    searchTarget,
    forcedSearchMode,
    ...rest
  }: any) {
    const { searchIsActive, updateSearchFilters, getSearchFilters } = globalState;
    const searchFilters = getSearchFilters(searchKey);
    const [searchText, setSearchText] = useState(searchFilters?.text || '');
    const [searchTags, setSearchTags] = useState(searchFilters?.tags || []);
    const [isLoaded, setIsLoaded] = useState(true);
    const displaySearch = searchIsActive(searchKey);

    const mappedTags = useMemo(() => {
      const availableTags = Array.isArray(globalState?.tags) ? globalState.tags : [];
      if (searchTarget === 'playlists') return availableTags.filter((tag) => tag.isPlaylistTag);
      if (searchTarget === 'media') return availableTags.filter((tag) => tag.isMediaTag);
      return availableTags;
    }, []);
    
    useEffect(() => {
      if (displaySearch === false) {
        loadData().then();
      }
    }, [displaySearch])
    
    useEffect(() => {
      if (!loaded || !isLoaded) {
        loadData().then(() => setIsLoaded(true));
      }
    }, [loaded, isLoaded]);

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
              loading={!isLoaded}
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
      const searchValue = { text: searchText, tags: [...searchTags] };
      updateSearchFilters(searchKey, searchValue);
      setIsLoaded(false);
    }
  };
};
