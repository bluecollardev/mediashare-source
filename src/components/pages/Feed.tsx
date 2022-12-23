import React, { useEffect } from 'react';
import { Divider } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { ScrollView } from 'react-native';
import { useAppSelector } from 'mediashare/store';
import { findItemsSharedWithMe } from 'mediashare/store/modules/shareItems';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { filterUnique } from 'mediashare/utils';
import { withSearchComponent } from 'mediashare/components/hoc/withSearchComponent';
import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import { NoContent, PageContainer, PageContent, PageProps } from 'mediashare/components/layout';
import { TagBlocks, RecentlyPlayed, RecentlyAdded } from 'mediashare/components/feed';

const FeedComponent = ({ list, tags }) => {
  return (
    <>
    </>
  );
};

const FeedComponentWithSearch = withSearchComponent(FeedComponent, 'feed');

export const Feed = ({
  globalState = {
    displayMode: 'list',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setDisplayMode: (value) => undefined,
  },
}: PageProps) => {
  const dispatch = useDispatch();
  const ShowMyShare = false;

  const { tags = [] } = globalState;
  const { entities, loaded, loading } = useAppSelector((state) => state?.shareItems?.sharedWithMe);
  const list = filterUnique(entities, '_id').filter((e) => (ShowMyShare ? e : e.sharedWith != e.sharedBy)) || [];

  async function loadData() {
    await dispatch(findItemsSharedWithMe());
  }

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData().catch(console.error);
  }, []);

  return (
    <PageContainer>
      <PageContent>
        <ScrollView>
          {(!loaded && !loading) ||
          (loaded && list.length > 0 ? (
            <FeedComponentWithSearch
              globalState={globalState}
              loaded={(!loaded && !loading) || (loaded && entities.length > 0)}
              loadData={loadData}
              searchTarget="playlists"
              list={list}
              tags={tags}
            />
          ) : null)}
          {list.length === 0 ? <NoContent messageButtonText="Items that are shared with you will show up in your feed." icon="view-list" /> : null}
        </ScrollView>
      </PageContent>
    </PageContainer>
  );
};

export default withLoadingSpinner(undefined)(withGlobalStateConsumer(Feed));
