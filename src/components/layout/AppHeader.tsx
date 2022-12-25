import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { NavigationScreenProp } from 'react-navigation';
import { useRoute } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native';
import { Appbar, Avatar } from 'react-native-paper';
import { withGlobalStateConsumer, GlobalStateProps, INITIAL_SEARCH_FILTERS } from 'mediashare/core/globalState'
import { useGoToAccount } from 'mediashare/hooks/navigation';
import { logout } from 'mediashare/store/modules/user'
import { theme } from 'mediashare/styles';

export interface AppHeaderProps {
  options?: any;
  back?: any;
  navigation?: NavigationScreenProp<any, any>;
  searchable?: boolean;
  searchTarget?: 'playlists' | 'media' | undefined;
  showLogout?: boolean;
  showAccount?: boolean;
  showNotifications?: boolean;
  showDisplayControls?: boolean;
  globalState?: GlobalStateProps;
}

const AppHeaderComponent = ({
  options,
  back,
  navigation,
  showAccount = false,
  showLogout = false,
  showNotifications = false,
  showDisplayControls = false,
  searchable = false,
  globalState = {
    displayMode: 'list',
    tags: [],
    setDisplayMode: (value) => undefined,
  },
}: AppHeaderProps) => {
  const dispatch = useDispatch();
  const route = useRoute();
  const goToAccount = useGoToAccount();
  
  const { forcedSearchMode, searchIsActive, setSearchIsActive, clearSearchFilters, forcedSearchActive, searchFiltersActive, searchFilters } = globalState;
  const displaySearch = searchIsActive(route?.name);
  const forceSearchDisplay = forcedSearchMode(route?.name);
  
  const avatar = globalState?.user?.imageSrc;
  const title = options?.headerTitle !== undefined ? options?.headerTitle : options?.title !== undefined ? options?.title : '';

  const [displayMode, setDisplayMode] = useState(globalState?.displayMode);
  const [unreadNofifications, setUnreadNofifications] = useState(true);

  let searchIcon;
  if (forceSearchDisplay) {
    // TODO: searchFiltersActive has no entries, it probably should...
    //  but as we're forcing search mode, it might be more work than it's worth
    //  to change the behavior of the search filters...
    //  Use searchFilters as a [temporary(?)] workaround...
    const routeFilters = searchFilters.get(route.name);
    searchIcon = routeFilters ? 'filter-list' : '';
  }
  
  if (!forceSearchDisplay) {
    searchIcon = displaySearch ? 'filter-list' : 'search';
  }
  
  let notificationsIcon = unreadNofifications ? 'notification-important' : 'notifications-off';
  
  const notificationsClickHandler = () => {
    if (unreadNofifications) {
      setUnreadNofifications(false);
    }
  };

  
  return (
    <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
      {/* @ts-ignore */}
      {back ? <Appbar.BackAction color="#ffffff" onPress={handleBackAction} /> : null}
      <Appbar.Content
        title={title}
        titleStyle={{
          fontSize: 20,
          fontFamily: theme.fonts.medium.fontFamily,
        }}
      />
      {showDisplayControls ? renderDisplayControls() : null}
      {searchable ? <Appbar.Action icon={searchIcon} color={searchIcon === 'filter-list' ? theme.colors.success : '#ffffff'} onPress={() => toggleSearch()} /> : null}
      {showNotifications ? <Appbar.Action icon={notificationsIcon} color={unreadNofifications ? theme.colors.text : theme.colors.secondary} onPress={notificationsClickHandler} /> : null}
      {showAccount ? (
        <TouchableWithoutFeedback onPress={() => goToAccount()}>
          <Avatar.Image style={{ marginHorizontal: 15 }} source={avatar ? { uri: avatar } : undefined} size={36}  />
        </TouchableWithoutFeedback>
      ) : null}
      {showLogout ? <Appbar.Action icon="logout" onPress={() => accountLogout()} /> : null}
    </Appbar.Header>
  );
  
  async function accountLogout() {
    await dispatch(logout());
  }

  function viewAsList() {
    setDisplayMode('list');
    globalState?.setDisplayMode('list');
  }

  function viewAsArticles() {
    setDisplayMode('article');
    globalState?.setDisplayMode('article');
  }
  
  function toggleSearch() {
    if (displaySearch) {
      clearSearchFilters(route.name);
    } else {
      setSearchIsActive(route?.name, true);
    }
  }

  function renderDisplayControls() {
    return (
      <>
        {displayMode === 'article' ? <Appbar.Action icon="view-list" color="#ffffff" onPress={() => viewAsList()} /> : null}
        {displayMode === 'list' ? <Appbar.Action icon="article" color="#ffffff" onPress={() => viewAsArticles()} /> : null}
      </>
    );
  }
  
  function handleBackAction(e) {
    if (route.name === 'addSelectedToPlaylist') {
      globalState?.updateSearchFilters (route.name, INITIAL_SEARCH_FILTERS);
      globalState?.setSearchIsActive(route.name, false);
    }
    navigation.goBack(e);
  }
};

export const AppHeader = withGlobalStateConsumer(AppHeaderComponent);
