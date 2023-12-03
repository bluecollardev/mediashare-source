import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Divider } from 'react-native-paper';
import { MediaListItem } from './MediaListItem';
import { theme } from 'mediashare/styles';

interface ShareItemCardProps {
  date: string;
  title: string;
  authorProfile?: any;
  mediaIds?: any[];
  mediaItems?: any[];
  image: string;
  selectable?: boolean;
  showActions?: boolean | 'left' | 'right';
  read: boolean;
  onDelete: () => void;
  onView: () => void;
  onChecked?: (checked: boolean, item?: any) => void;
}

export function ShareItemCard({ date, title, authorProfile, mediaIds, mediaItems, onView, onChecked, image, read, selectable, showActions }: ShareItemCardProps) {
  // const [visible, setVisible] = useState(false);
  return (
    <View style={styles.sharedItem}>
      <MediaListItem
        key={title}
        title={title}
        titleStyle={styles.titleText}
        description={<MediaListItem.Description data={{ authorProfile, itemCount: mediaIds?.length || mediaItems?.length || 0 }} showItemCount={true} />}
        showImage={true}
        image={image}
        showPlayableIcon={false}
        showActions={showActions ? showActions : false}
        selectable={selectable}
        onViewDetail={onView}
        onChecked={onChecked}
        iconLeft="remove-circle"
        iconLeftColor={theme.colors.textDarker}
      />
      <Divider />
    </View>
  );
}

const styles = StyleSheet.create({
  titleText: {
    marginBottom: 4,
    color: theme.colors.text,
    fontSize: 13,
    fontFamily: theme.fonts.medium.fontFamily,
  },
  description: {
    marginTop: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    color: theme.colors.textDarker,
    fontFamily: theme.fonts.thin.fontFamily,
  },
  visibilityIcon: {
    flex: 0,
    width: 16,
    marginRight: 5,
    color: theme.colors.textDarker,
  },
  sharedItem: {
    margin: 0,
    padding: 0,
    // padding: 5,
    // alignContent: 'center',
    // justifyContent: 'space-between',
  },
});
