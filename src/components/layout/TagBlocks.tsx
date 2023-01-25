import React from 'react';
import { Dimensions, View } from 'react-native';
import { MediaListItem, SectionHeader } from 'mediashare/components/layout/index';
import styles from 'mediashare/styles';

export interface TagBlocksProps {
  list: any[];
  onViewDetailClicked?: Function;
}

export const TagBlocks = ({ list = [], onViewDetailClicked = () => undefined }: TagBlocksProps) => {
  // TODO: Make this configurable, or use the most popular tags ONLY!
  const tagsToDisplay = ['ankle', 'elbow', 'foot-and-ankle', 'hand', 'hip', 'knee', 'lower-back', 'neck', 'shoulder', 'upper-back', 'wrist'];
  const sortedList = list.map((tag) => tag).filter((tag) => tagsToDisplay.includes(tag.key));
  sortedList.sort((dtoA, dtoB) => (dtoA.title > dtoB.title ? 1 : -1));
  const displayTags = sortedList.slice(0, 6);

  const dimensions = {
    w: Dimensions.get('window').width
  };

  return (
    <View style={{ marginTop: 20, marginBottom: 15 }}>
      <SectionHeader title={`Popular Tags`} />
      {displayTags && displayTags.length > 0 ? (
        <>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: dimensions.w, marginBottom: 10 }}>
            {displayTags.map((tag) => renderVirtualizedListItem(tag))}
          </View>
        </>
      ) : null}
    </View>
  );

  function renderVirtualizedListItem(item) {
    // TODO: Can we have just one or the other, either mediaIds or mediaItems?
    const { key = '', value = '', imageSrc = '' } = item;
    const dimensions = {
      w: Dimensions.get('window').width / 2
    };

    return (
      <View key={key} style={{ width: dimensions.w }}>
        <MediaListItem
          key={`tag_${key}`}
          title={value}
          titleStyle={styles.titleText}
          // description={`0 playlists`}
          showImage={true}
          image={imageSrc}
          showPlayableIcon={false}
          showActions={false}
          selectable={false}
          onViewDetail={() => onViewDetailClicked(item)}
        />
      </View>
    );
  }
};
