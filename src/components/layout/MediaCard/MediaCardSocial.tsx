import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { theme } from 'mediashare/styles';

export interface MediaCardSocialProps {
  likes: number;
  shares: number;
  views: number;
}

export const MediaCardSocial: React.FC<MediaCardSocialProps> = ({ likes = 0, views = 0, shares = 0 }: MediaCardSocialProps) => {
  return (
    <View style={defaultStyles.container}>
      <View style={defaultStyles.row}>
        <View style={defaultStyles.wrapper}>
          <Button icon="visibility" mode="text" textColor={theme.colors.textDarker} labelStyle={defaultStyles.buttonLabel}>
            <Text style={defaultStyles.buttonText}>{views} Views</Text>
          </Button>
        </View>
        <View style={defaultStyles.wrapper}>
          <Button icon="share" mode="text" textColor={theme.colors.textDarker} labelStyle={defaultStyles.buttonLabel}>
            <Text style={defaultStyles.buttonText}>{shares} Shares</Text>
          </Button>
        </View>
        <View style={defaultStyles.wrapper}>
          <Button icon="favorite" mode="text" textColor={theme.colors.textDarker} labelStyle={defaultStyles.buttonLabel}>
            <Text style={defaultStyles.buttonText}>{likes} Likes</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: '100%',
    marginBottom: 0,
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  wrapper: {
    flex: 1,
  },
  button: {
    marginHorizontal: 8,
  },
  buttonLabel: {
    marginHorizontal: 8,
  },
  buttonText: {
    fontSize: 8,
  }
});
