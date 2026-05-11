import React from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'react-native';
import { SectionHeader } from 'mediashare/components/layout';
import { theme } from 'mediashare/styles';

export interface TrendingSectionProps {
  title: string;
  list: any[];
  max?: number;
  onItemPress?: (item: any) => void;
}

/**
 * Horizontal-scrolling row of cards. Used to surface trending playlists
 * and media items beneath the "Popular Tags" block on the Search page.
 */
export const TrendingSection = ({ title, list = [], max = 8, onItemPress = () => undefined }: TrendingSectionProps) => {
  const items = (list || []).slice(0, max);
  const cardWidth = Math.min(160, Dimensions.get('window').width * 0.42);
  if (items.length === 0) return null;
  return (
    <View style={{ marginTop: 16, marginBottom: 8 }}>
      <SectionHeader title={title} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
      >
        {items.map((item, idx) => {
          const key = item?._id ? String(item._id) : `${title}-${idx}`;
          const image = item?.imageSrc;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onItemPress(item)}
              activeOpacity={0.8}
              style={{
                width: cardWidth,
                marginRight: 10,
                backgroundColor: theme.colors.surface,
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: '100%', height: cardWidth * 0.66, backgroundColor: theme.colors.background }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: cardWidth * 0.66,
                    backgroundColor: theme.colors.background,
                  }}
                />
              )}
              <View style={{ padding: 8 }}>
                <Text
                  numberOfLines={2}
                  style={{
                    color: theme.colors.text,
                    fontSize: 12,
                    fontFamily: theme.fonts.medium.fontFamily,
                  }}
                >
                  {item?.title || ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
