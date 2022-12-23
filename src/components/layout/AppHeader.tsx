import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { NavigationScreenProp } from 'react-navigation';
import { useRoute } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native';
import { Appbar, Avatar } from 'react-native-paper';
import { withGlobalStateConsumer, GlobalStateProps } from 'mediashare/core/globalState';
import { useGoToAccount } from 'mediashare/hooks/navigation';
import { logout } from 'mediashare/store/modules/user'
import { theme } from 'mediashare/styles';

export interface AppHeaderProps {
  options?: any;
  back?: any;
  navigation?: NavigationScreenProp<any, any>;
  searchable?: boolean;
  searchTarget?: 'playlists' | 'media' | undefined;
  hideSearchIcon?: boolean;
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
  hideSearchIcon = false,
  searchable = false,
  globalState = {
    displayMode: 'list',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setDisplayMode: (value) => undefined,
    tags: [],
  },
}: AppHeaderProps) => {
  const dispatch = useDispatch();
  const route = useRoute();
  const goToAccount = useGoToAccount();
  
  const { searchIsActive, setSearchIsActive, clearSearchFilters } = globalState;
  const displaySearch = searchIsActive(route?.name);
  
  const avatar = globalState?.user?.imageSrc;
  const title = options?.headerTitle !== undefined ? options?.headerTitle : options?.title !== undefined ? options?.title : '';

  const [displayMode, setDisplayMode] = useState(globalState?.displayMode);
  const [unreadNofifications, setUnreadNofifications] = useState(true);

  let searchIcon = hideSearchIcon && displaySearch
    ? 'filter-list' : hideSearchIcon && !displaySearch
      ? '' : displaySearch
        ? 'filter-list' : 'search';
  
  let notificationsIcon = unreadNofifications ? 'notification-important' : 'notifications-off';
  
  const notificationsClickHandler = () => {
    if (unreadNofifications) {
      setUnreadNofifications(false);
    }
  };

  return (
    <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
      {back ? <Appbar.BackAction color="#ffffff" onPress={navigation.goBack} /> : null}
      <Appbar.Content
        title={title}
        titleStyle={{
          fontSize: 20,
          fontFamily: theme.fonts.medium.fontFamily,
        }}
      />
      {showDisplayControls ? renderDisplayControls() : null}
      {searchable ? <Appbar.Action icon={searchIcon} color={displaySearch ? theme.colors.success : '#ffffff'} onPress={() => toggleSearch()} /> : null}
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
    await dispatch(logout({}));
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
};

export const AppHeader = withGlobalStateConsumer(AppHeaderComponent);
