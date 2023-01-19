import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper'
import { AuthorProfileDto } from 'mediashare/rxjs-api';
import { shortenText } from 'mediashare/utils';
import { theme } from 'mediashare/styles';

interface MediaListItemDescriptionData {
  authorProfile?: AuthorProfileDto;
  description?: string;
  visibility?: string;
  itemCount?: string | number;
}

interface MediaListItemDescriptionProps {
  showAuthor?: boolean;
  showUsername?: boolean;
  showDescription?: boolean;
  showItemCount?: boolean;
  maxChars?: number;
  data: MediaListItemDescriptionData;
}

// mediaIds?.length || mediaItems?.length || 0
export const MediaListItemDescription = ({
  data,
  showAuthor = true,
  showUsername = true,
  showDescription = false,
  showItemCount = false,
  maxChars = 25,
}: MediaListItemDescriptionProps) => {
  const { authorProfile, description = '', itemCount = 0, visibility } = data;
  return (
    <View style={styles.line1}>
      {(showAuthor || showUsername) ? (
        <View style={styles.createdBy}>
          {showAuthor ? <Text style={styles.author}>{authorProfile?.authorName}</Text> : null}
          {showUsername ? <Text style={styles.username}>@{authorProfile?.authorUsername}</Text> : null}
        </View>
      ) : null}
      <View style={styles.line2}>
        {visibility ?
          <Button
            compact
            mode="contained"
            style={styles.visibilityButton}
            disabled={false}
            textColor={theme.colors.white}
            buttonColor={theme.colors.secondary}>
            {visibility}
          </Button> : null}
        {showItemCount ? <Text style={styles.videoCount}>{itemCount} videos</Text> : null}
      </View>
      {showDescription ? <Text style={styles.description}>{shortenText(description || '', maxChars)}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  line1: {
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
  },
  username: {
    color: theme.colors.textDarker,
    fontFamily: theme.fonts.thin.fontFamily,
    fontSize: 13,
    marginLeft: 2,
  },
  line2: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  visibilityButton: {
    fontSize: 11,
    fontWeight: 'normal',
    justifyContent: 'center',
    borderColor: theme.colors.primary,
    transform: [{ scale: 0.6 }, { translateX: -30 }], // Match videoCount translateX
  },
  videoCount: {
    color: theme.colors.textDarker,
    fontFamily: theme.fonts.thin.fontFamily,
    fontSize: 12,
    fontWeight: 'bold',
    transform: [{ translateX: -30 + 5 }], // Match visibilityButton translateX + 5
  },
  description: {
    flex: 0,
    width: '100%',
    color: theme.colors.text,
    fontFamily: theme.fonts.thin.fontFamily,
    fontSize: 13,
    marginBottom: 4,
  },
});
