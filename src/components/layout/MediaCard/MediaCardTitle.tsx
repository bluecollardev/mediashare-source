import { MediaCardSocial } from 'mediashare/components/layout/MediaCard/MediaCardSocial'
import React from 'react';
import { Avatar, Card, IconButton, Title, Text, Button } from 'react-native-paper'
import { View, StyleSheet, Platform } from 'react-native';

import { getAuthorText } from 'mediashare/utils';
import { theme } from 'mediashare/styles';

import { AuthorProfileDto } from 'mediashare/rxjs-api';

export const DEFAULT_AVATAR = 'https://i.pinimg.com/originals/db/fa/08/dbfa0875b8925919a3f16d53d9989738.png';

export interface MediaCardTitleProps {
  title?: string;
  // TODO: Use an enum
  visibility?: string;
  authorProfile?: AuthorProfileDto;
  showThumbnail?: boolean;
  showActions?: boolean;
  showSocial?: boolean;
  likes?: number;
  shares?: number;
  views?: number;
  onActionsClicked?: () => void;
  style?: any;
}

export const MediaCardTitle: React.FC<MediaCardTitleProps> = ({
  title = '',
  visibility,
  authorProfile = {} as AuthorProfileDto,
  showThumbnail = true,
  showActions = false,
  showSocial = false,
  likes = undefined,
  shares = undefined,
  views = undefined,
  onActionsClicked = () => {},
  style = {},
}: MediaCardTitleProps) => {
  return authorProfile ? (
    <Card.Title
      style={{ ...defaultStyles.component, ...style }}
      title={
        <>
          <Title style={defaultStyles.titleText}>
            {title} {authorProfile?.authorName ? <Text style={defaultStyles.author}>{"\n"}by {authorProfile?.authorName}</Text> : null}
            {authorProfile?.authorUsername ? <Text style={defaultStyles.username}> ({authorProfile?.authorUsername})</Text> : null}
          </Title>
        </>
        
      }
      titleStyle={defaultStyles.title}
      titleNumberOfLines={3}
      // TODO: Stupid component doesn't render right on Android if we use a View to wrap, but then the whole f*cking thing appears on a single line!
      subtitle={
        <View style={defaultStyles.subtitle}>
          <View style={defaultStyles.line2}>
            {visibility ?
              <Button
                compact
                mode="contained"
                style={defaultStyles.visibilityButton}
                contentStyle={defaultStyles.buttonContent}
                labelStyle={defaultStyles.buttonText}
                disabled={false}
                textColor={theme.colors.white}
                buttonColor={theme.colors.secondary}>
                {visibility}
              </Button> : null}
            {showSocial ? <MediaCardSocial likes={likes} shares={shares} views={views} /> : null}
          </View>
        </View>
      }
      subtitleStyle={defaultStyles.subtitle}
      right={(buttonProps: any) => {
        // showActions ? <IconButton {...buttonProps} icon="more-vert" onPress={onActionsClicked} /> : null
        return showThumbnail && authorProfile?.authorImage ? (
          <View style={defaultStyles.avatar}>
            <Avatar.Image source={{ uri: authorProfile?.authorImage || DEFAULT_AVATAR }} size={defaultStyles.avatar.width} />
          </View>
        ) : null;
      }}
      rightStyle={showThumbnail ? defaultStyles.right : undefined}
    />
  ) : null;
};

const defaultStyles = StyleSheet.create({
  component: {
    marginTop: 25,
    marginBottom: 25,
  },
  right: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  avatar: {
    width: 52,
    marginRight: 16,
  },
  title: {},
  titleText: {
    color: theme.colors.text,
    fontSize: 17,
    fontFamily: theme.fonts.medium.fontFamily,
    lineHeight: Platform.OS === 'android' ? 24 : 20,
  },
  subtitle: {
    display: 'flex',
    flexDirection: 'column',
  },
  createdBy: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  author: {
    color: theme.colors.text,
    fontFamily: theme.fonts.thin.fontFamily,
    fontSize: 13,
    marginBottom: 2,
  },
  username: {
    color: theme.colors.textDarker,
    fontFamily: theme.fonts.thin.fontFamily,
    fontSize: 13,
    marginBottom: 2,
  },
  line2: {
    marginTop: 5,
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visibilityButton: {
    flex: 0,
    fontSize: 11,
    fontWeight: 'normal',
    justifyContent: 'center',
    borderColor: theme.colors.primary,
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
