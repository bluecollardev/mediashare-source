import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper'
import { AuthorProfile } from 'mediashare/models/AuthorProfile';
import { shortenText } from 'mediashare/utils';
import { theme } from 'mediashare/styles';

interface MediaListItemDescriptionData {
  authorProfile?: AuthorProfile;
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
          {showAuthor ? <Text style={styles.author}>by {authorProfile?.authorName}</Text> : null}
          {showUsername ? <Text style={styles.username}> ({authorProfile?.authorUsername})</Text> : null}
        </View>
      ) : null}
      <View style={styles.line2}>
        {visibility ?
          <Button
            compact
            mode="contained"
            style={styles.visibilityButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
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
    fontSize: 12,
  },
  username: {
    color: theme.colors.textDarker,
    fontFamily: theme.fonts.thin.fontFamily,
    fontSize: 12,
    marginLeft: 2,
  },
  line2: {
    marginTop: 5,
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
  videoCount: {
    color: theme.colors.textDarker,
    fontFamily: theme.fonts.thin.fontFamily,
    fontSize: 12,
    fontWeight: 'bold',
    // transform: [{ translateX: -30 + 5 }], // Match visibilityButton translateX + 5
  },
  description: {
    flex: 1,
    width: '100%',
    color: theme.colors.text,
    fontFamily: theme.fonts.thin.fontFamily,
    fontSize: 12,
    marginBottom: 4,
  },
});
