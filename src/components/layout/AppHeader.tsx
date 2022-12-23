import { logout } from 'mediashare/store/modules/user'
import React, { useState } from 'react';
import { Appbar } from 'react-native-paper';
import { withGlobalStateConsumer, GlobalStateProps } from 'mediashare/core/globalState';
import { useGoToAccount } from 'mediashare/hooks/navigation';
import { theme } from 'mediashare/styles';
import { useDispatch } from 'react-redux'

export interface AppHeaderProps {
  options?: any;
  back?: any;
  navigation?: any;
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
  searchTarget = undefined,
  globalState = {
    openSearchConsole: () => undefined,
    closeSearchConsole: () => undefined,
    displayMode: 'list',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setDisplayMode: (value) => undefined,
    tags: [],
  },
}: AppHeaderProps) => {
  const dispatch = useDispatch();
  
  const { openSearchConsole, closeSearchConsole, searchIsActive } = globalState;

  const goToAccount = useGoToAccount();

  const title = options?.headerTitle !== undefined ? options?.headerTitle : options?.title !== undefined ? options?.title : '';

  const searchIsFiltering = globalState?.search?.filters?.text !== '' || globalState?.search?.filters?.tags?.length > 0;

  const [displayMode, setDisplayMode] = useState(globalState?.displayMode);
  const [unreadNofifications, setUnreadNofifications] = useState(true);

  let searchIcon = hideSearchIcon ? (searchIsFiltering ? 'filter-list' : '') : !searchIsActive ? 'search' : searchIsActive ? 'filter-list' : 'filter-list';
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
      {searchable ? <Appbar.Action icon={searchIcon} color={searchIsFiltering ? theme.colors.success : '#ffffff'} onPress={() => toggleSearchConsole()} /> : null}
      {showNotifications ? <Appbar.Action icon={notificationsIcon} color={unreadNofifications ? theme.colors.text : theme.colors.secondary} onPress={notificationsClickHandler} /> : null}
      {showAccount ? <Appbar.Action icon="account-circle" onPress={() => goToAccount()} /> : null}
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

  function toggleSearchConsole() {
    searchIsActive ? closeSearchConsole() : openSearchConsole();
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
