import { withSearchComponent } from 'mediashare/components/hoc/withSearchComponent';
import { MediaItemDto } from 'mediashare/apis/media-svc/rxjs-api';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FlatList, View } from 'react-native';
import { useAppSelector } from 'mediashare/store';
import { getFeedMediaItems, saveFeedMediaItems } from 'mediashare/store/modules/mediaItem';
import { AwsMediaItem } from 'mediashare/core/aws/aws-media-item.model';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { withGlobalStateConsumer } from 'mediashare/core/globalState';
import { PageContainer, PageContent, PageActions, PageProps, ActionButtons, MediaListItem, NoContent } from 'mediashare/components/layout';
import { useMediaItems } from 'mediashare/hooks/navigation';


export const AddFromFeedComponent = ({
  list = [],
  selectable,
  showActions = true,
  onViewDetail,
  onChecked = () => undefined,
}: {
  navigation: any;
  list: MediaItemDto[];
  onViewDetail: any;
  selectable: boolean;
  showActions?: boolean;
  onChecked?: (checked: boolean, item?: any) => void;
}) => {
  const sortedList = list.map((item) => item) || [];
  sortedList.sort((dtoA, dtoB) => (dtoA.title > dtoB.title ? 1 : -1));
  
  return (
    <View>
      <FlatList data={sortedList} renderItem={({ item }) => renderVirtualizedListItem(item)} keyExtractor={({ _id }) => `media_item_${_id}`} />
    </View>
  );
  
  function renderVirtualizedListItem(item) {
    const { key, size, lastModified } = item;
    return (
      <MediaListItem
        key={`s3_item_${key}`}
        showActions={false}
        showPlayableIcon={false}
        title={key}
        description={`${size} - ${lastModified}`}
        checked={false}
        onChecked={(v) => (v ? addItem(item) : removeItem(item))}
      />
    );
  }
  
  function addItem(item: AwsMediaItem) {
    // selectedItems.add(item);
  }
  
  function removeItem(item: AwsMediaItem) {
    // selectedItems.delete(item);
  }
};

const AddFromFeedComponentWithSearch = withSearchComponent(AddFromFeedComponent, 'addFromFeed');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const AddFromFeed = ({ navigation, globalState }: PageProps) => {
  const dispatch = useDispatch();

  const goToMediaItems = useMediaItems();
  const selectedItems = new Set<AwsMediaItem>();
  
  const { entities, loaded, loading } = useAppSelector((state) => state?.mediaItem?.feed);
  
  // const [clearSelectionKey, setClearSelectionKey] = useState(createRandomRenderKey());
  useEffect(() => {
    // clearCheckboxSelection();
    loadData().then();
  }, []);

  return (
    <PageContainer>
      <PageContent>
        <AddFromFeedComponentWithSearch
          globalState={globalState}
          loaded={(!loaded && !loading) || (loaded && entities.length > 0)}
          loadData={loadData}
          defaultSearchTarget="media"
          // key={clearSelectionKey}
          navigation={navigation}
          list={entities}
          // showActions={!isSelectable}
          // selectable={isSelectable}
          // onViewDetail={onEditItem}
          // onChecked={updateSelection}
        />
        {loaded && entities.length === 0 ? (
          <NoContent
            messageButtonText="There are no items in your S3 bucket to import. Please choose another bucket or add files to this bucket to continue."
            icon="cloud-download"
          />
        ) : null}
      </PageContent>
      <PageActions>
        <ActionButtons onPrimaryClicked={saveItems} primaryLabel="Add Media" onSecondaryClicked={goToMediaItems} />
      </PageActions>
    </PageContainer>
  );

  

  async function loadData() {
    const search = globalState?.getSearchFilters('addFromFeed');
    const args = {
      text: search?.text ? search.text : '',
      tags: search?.tags || [],
    };

    if (args.text || args.tags.length > 0) {
      await dispatch(getFeedMediaItems());
    } else {
      await dispatch(getFeedMediaItems());
    }
  }

  async function saveItems() {
    if (selectedItems.size < 1) {
      return;
    }
    const items = Array.from(selectedItems.values());
    await dispatch(saveFeedMediaItems({ items }));
    goToMediaItems();
  }
};

export default withLoadingSpinner((state) => {
  return !!state?.mediaItems?.feed?.loading || false;
})(withGlobalStateConsumer(AddFromFeed));
