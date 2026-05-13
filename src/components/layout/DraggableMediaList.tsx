import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Divider } from 'react-native-paper';

import { MediaListItem } from './MediaListItem';
import { theme } from 'mediashare/styles';

// Generic "thing with an _id". The list items on the playlist edit
// surface have additional fields (mediaItemId, title, imageSrc, …)
// but for reorder all we need is identity + index.
type Item = { _id: string; title?: string; imageSrc?: string; [k: string]: any };

interface Props {
  list: Item[];
  showImage?: boolean;
  selectable?: boolean;
  showActions?: boolean;
  onViewDetail?: (item: Item) => void;
  addItem?: (item: Item) => void;
  removeItem?: (item: Item) => void;
  // Called with the new ordered array after a successful move.
  onReorder: (next: Item[]) => void;
}

/**
 * Lightweight reorderable list. On web we use HTML5 drag-and-drop
 * (no extra dep, plays nicely with react-native-web). On native we
 * render per-row up/down arrows — true gesture-based DnD would
 * require react-native-reanimated which isn't part of this Expo 47
 * setup.
 *
 * Visual contract matches the existing `MediaList` so swapping it
 * into PlaylistEdit is a 1:1 replacement plus the `onReorder` cb.
 */
export const DraggableMediaList: React.FC<Props> = ({
  list,
  showImage,
  selectable,
  showActions = true,
  onViewDetail = () => {},
  addItem = () => {},
  removeItem = () => {},
  onReorder,
}) => {
  // Track which web row is being dragged so we can render a visual
  // hint, and ignore drops on the source position.
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= list.length ||
      to >= list.length
    ) {
      return;
    }
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={{ marginBottom: 25 }}>
      {list.map((item, idx) => {
        const { _id, title, imageSrc } = item;
        const rowContents = (
          <View style={styles.row}>
            {/* Thin vertical "grip" indicator on the left edge.
                Three slim bars stacked vertically — a more discrete
                affordance than the wide MaterialIcons drag-handle
                and unambiguously vertical. */}
            <View style={styles.handle}>
              <View style={styles.gripBar} />
              <View style={styles.gripBar} />
              <View style={styles.gripBar} />
            </View>
            <View style={{ flex: 1 }}>
              <MediaListItem
                title={title}
                titleStyle={styles.titleText}
                image={imageSrc}
                selectable={selectable}
                showImage={showImage}
                showPlayableIcon={false}
                showActions={showActions}
                onChecked={(v) => (v ? addItem(item) : removeItem(item))}
                onViewDetail={() => onViewDetail(item)}
              />
            </View>
            {!isWeb ? (
              <View style={styles.arrows}>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={idx === 0}
                  onPress={() => move(idx, idx - 1)}
                  style={styles.arrowBtn}
                >
                  <MaterialIcons
                    name="arrow-upward"
                    size={20}
                    color={
                      idx === 0 ? theme.colors.default : theme.colors.text
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={idx === list.length - 1}
                  onPress={() => move(idx, idx + 1)}
                  style={styles.arrowBtn}
                >
                  <MaterialIcons
                    name="arrow-downward"
                    size={20}
                    color={
                      idx === list.length - 1
                        ? theme.colors.default
                        : theme.colors.text
                    }
                  />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        );

        if (isWeb) {
          // react-native-web renders View as a div, but draggable +
          // drag handlers aren't passed through. Wrap in a raw div
          // so HTML5 DnD works.
          return React.createElement(
            'div',
            {
              key: `dnd_${_id}`,
              draggable: true,
              onDragStart: (e: any) => {
                setDragIndex(idx);
                e.dataTransfer.effectAllowed = 'move';
                // Required to enable drag in some browsers.
                try {
                  e.dataTransfer.setData('text/plain', String(idx));
                } catch {}
              },
              onDragOver: (e: any) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              },
              onDrop: (e: any) => {
                e.preventDefault();
                const from =
                  dragIndex !== null
                    ? dragIndex
                    : parseInt(e.dataTransfer.getData('text/plain'), 10);
                if (!Number.isNaN(from)) move(from, idx);
                setDragIndex(null);
              },
              onDragEnd: () => setDragIndex(null),
              style: {
                opacity: dragIndex === idx ? 0.5 : 1,
                cursor: 'grab',
              },
            },
            rowContents,
            <Divider key={`div_${_id}`} />
          );
        }

        return (
          <View key={`dnd_${_id}`}>
            {rowContents}
            <Divider />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handle: {
    width: 22,
    minHeight: 48,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.default,
    borderRadius: 4,
    paddingVertical: 6,
  },
  gripBar: {
    width: 3,
    height: 4,
    borderRadius: 1,
    backgroundColor: theme.colors.default,
    marginVertical: 2,
  },
  arrows: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: theme.colors.text,
    fontSize: 13,
    fontFamily: theme.fonts.medium.fontFamily,
  },
});

export default DraggableMediaList;
