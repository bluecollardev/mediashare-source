import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { MediaListItem, SectionHeader } from 'mediashare/components/layout/index';
import styles from 'mediashare/styles';

export interface TagBlocksProps {
  list: any[];
  onViewDetailClicked?: Function;
}

// Breakpoints: phone < 768 → 2up; tablet 768–1024 → 3up; desktop ≥ 1024 → 4up.
function columnsForWidth(width: number) {
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  return 2;
}

export const TagBlocks = ({ list = [], onViewDetailClicked = () => undefined }: TagBlocksProps) => {
  // TODO: Make this configurable, or use the most popular tags ONLY!
  const tagsToDisplay = ['ankle', 'elbow', 'foot-and-ankle', 'hand', 'hip', 'knee', 'lower-back', 'neck', 'shoulder', 'upper-back', 'wrist'];
  const sortedList = list.map((tag) => tag).filter((tag) => tagsToDisplay.includes(tag.key));
  sortedList.sort((dtoA, dtoB) => (dtoA.title > dtoB.title ? 1 : -1));

  const { width } = useWindowDimensions();
  const columns = columnsForWidth(width);
  // Slice to fill an even grid: 2 full rows on whichever layout (2/3/4 up).
  const displayTags = sortedList.slice(0, columns * 2);
  // Use percentages so the grid hugs its parent's content width rather than
  // the viewport width — avoids overflow when the parent has padding/margin
  // (e.g., desktop layouts with side gutters).
  const cellWidthPct = `${100 / columns}%`;

  return (
    <View style={{ marginTop: 20, marginBottom: 15 }}>
      <SectionHeader title={`Popular Tags`} />
      {displayTags && displayTags.length > 0 ? (
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%', marginBottom: 10 }}>
          {displayTags.map((tag) => renderTag(tag, cellWidthPct))}
        </View>
      ) : null}
    </View>
  );

  function renderTag(item: any, cellWidth: string) {
    const { key = '', value = '', imageSrc = '' } = item;
    return (
      <View key={key} style={{ width: cellWidth as any }}>
        <MediaListItem
          key={`tag_${key}`}
          title={value}
          titleStyle={styles.titleText}
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
