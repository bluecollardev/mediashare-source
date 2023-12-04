import { theme } from 'mediashare/styles'
import React from 'react';
import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'

export interface MediaCardTagsProps {
  tags?: any[]; // TODO: This should be a Tag[] but for some reason _id is missing from the Tag model... fix in the API
}

export const MediaCardTags: React.FC<MediaCardTagsProps> = ({ tags = [] as any[] }: MediaCardTagsProps) => {
  return (
    <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
      {Array.isArray(tags) &&
        tags.length > 0 &&
        tags.map((tag, idx) => {
          return (
            <View key={`${tag?._id}_${idx}`} style={{ flex: 0 }}>
              <Button
                compact
                mode="contained"
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonText}
                disabled={false}
                textColor={theme.colors.white}
                buttonColor={theme.colors.secondary}>
                {tag?.value || 'Unknown'}
              </Button>
            </View>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    fontSize: 11,
    fontWeight: 'normal',
    justifyContent: 'center',
    marginRight: 10,
  },
  buttonContent: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 8,
    marginHorizontal: 0,
    marginVertical: 0,
  },
});
