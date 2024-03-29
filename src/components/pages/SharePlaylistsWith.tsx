import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { routeNames } from 'mediashare/routes';
import { useAppSelector } from 'mediashare/store';
import { shareUserPlaylist } from 'mediashare/store/modules/playlist';
import { clearPlaylists, getUserPlaylists } from 'mediashare/store/modules/playlists';
import { loadCurrentUserConnections } from 'mediashare/store/modules/userConnections';
import { useGoBack, useRouteName } from 'mediashare/hooks/navigation';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { PageContainer, PageContent, PageActions, PageProps, ActionButtons, ContactList } from 'mediashare/components/layout';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SharePlaylistsWith = ({}: PageProps) => {
  const dispatch = useDispatch();
  const [loaded, setIsLoaded] = useState(false);

  const goBack = useGoBack();
  const viewPlaylists = useRouteName(routeNames.playlists);

  const users = useAppSelector((state) => state?.userConnections?.entities);
  const playlists = useAppSelector((state) => state?.userPlaylists?.selected);
  const [selectedUsers, setSelectedUsers] = React.useState([]);

  useEffect(() => {
    if (!loaded) {
      dispatch(loadCurrentUserConnections());
      setIsLoaded(true);
    }
  }, [loaded, dispatch]);

  return (
    <PageContainer>
      <PageContent>
        <ContactList contacts={users} showGroups={true} selectable={true} onChecked={updateSelectedUsers} showAll={true} />
      </PageContent>
      <PageActions>
        <ActionButtons onSecondaryClicked={goBack} onPrimaryClicked={sharePlaylists} primaryLabel="Confirm" />
      </PageActions>
    </PageContainer>
  );
  
  function updateSelectedUsers(bool: boolean, userId: string) {
    const filtered = bool ? selectedUsers.concat([userId]) : selectedUsers.filter((id) => id !== userId);
    setSelectedUsers(filtered);
  }

  async function sharePlaylists() {
    await dispatch(
      shareUserPlaylist({
        userIds: selectedUsers,
        playlistIds: playlists.map((playlist) => playlist._id),
      })
    );
    await dispatch(clearPlaylists());
    setIsLoaded(false);
    viewPlaylists();
  }
};

export default withLoadingSpinner(undefined)(SharePlaylistsWith);
