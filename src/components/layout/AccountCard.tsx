import React, { useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { View, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import { Avatar, Caption, Title, Subheading, Card, Menu, IconButton, Text } from 'react-native-paper';
import { useProfile } from 'mediashare/hooks/useProfile';
import { theme } from 'mediashare/styles';
import * as R from 'remeda';

interface AccountCardProps {
  image?: string;
  likes?: number;
  shares?: number;
  shared?: number;
  title?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  text?: string;
  showSocial?: boolean;
  showActions?: boolean;
  onUpdateAvatarClicked?: () => void;
  isCurrentUser?: boolean;
}

export const AccountCard = ({
  title = null,
  username = null,
  email = null,
  phoneNumber = null,
  text = null,
  image = null,
  showActions = false,
  isCurrentUser = false,
  onUpdateAvatarClicked = () => {},
}: AccountCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const profile = useProfile();
  const withoutName = () => state?.firstName?.length < 1 || state?.lastName?.length < 1;
  const [state] = useState(R.pick(profile, ['username', 'email', 'firstName', 'lastName', 'phoneNumber', 'imageSrc']));
  
  return (
    <>
      <Card elevation={0} style={defaultStyles.card}>
        <Card.Content>
          <View style={defaultStyles.cardContent}>
            <View style={defaultStyles.info}>
              {title ? (<Title style={defaultStyles.titleText}>{title}</Title>) : null}
              {username ? (<Subheading style={{ ...defaultStyles.subtitleTextPrimary }}>{username}</Subheading>) : null}
              {email ? (<Subheading style={{ ...defaultStyles.subtitleTextSecondary }}>{email}</Subheading>) : null}
              {phoneNumber ? (<Subheading style={{ ...defaultStyles.subtitleTextSecondary }}>{phoneNumber}</Subheading>) : null}
              {text ? (<Text style={{ ...defaultStyles.subtitleTextPrimary }} numberOfLines={5}>{text}</Text>) : null}
            </View>
            <View style={defaultStyles.avatar}>
              {showActions ? (
                <Menu
                  visible={showMenu}
                  onDismiss={() => setShowMenu(false)}
                  anchor={
                    image ? (
                      <TouchableWithoutFeedback onPress={() => setShowMenu(true)}>
                        <Avatar.Image size={108} source={{ uri: image }} />
                      </TouchableWithoutFeedback>
                    ) : (
                      <TouchableWithoutFeedback onPress={() => setShowMenu(true)}>
                        <Avatar.Icon size={108} icon="person" />
                      </TouchableWithoutFeedback>
                    )
                  }
                >
                  {isCurrentUser ? <Menu.Item onPress={() => onUpdateAvatarClicked()} title="Change Photo" /> : null}
                  {isCurrentUser ? <Menu.Item onPress={() => {}} title="Deactivate Account" /> : null}
                  {isCurrentUser ? <Menu.Item onPress={() => {}} title="Delete Account" /> : null}
                </Menu>
              ) : image ? (
                <TouchableWithoutFeedback onPress={() => setShowMenu(true)}>
                  <Avatar.Image size={108} source={{ uri: image }} />
                </TouchableWithoutFeedback>
              ) : (
                <TouchableWithoutFeedback onPress={() => setShowMenu(true)}>
                  <Avatar.Icon size={108} icon="person" />
                </TouchableWithoutFeedback>
              )}
            </View>
          </View>
          {withoutName() ? (
            <Card>
              <Card.Title
                title="A name is required"
                left={(props) => <MaterialIcons {...props} name="warning" color={theme.colors.error} size={30} />}
                // right={(props) => <IconButton {...props} icon="more-vert" onPress={() => {}} />}
              />
            </Card>
          ) : null}
        </Card.Content>
      </Card>
    </>
  );
};

const defaultStyles = StyleSheet.create({
  card: {
    paddingBottom: 15,
    marginBottom: 15,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'row',
  },
  info: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  avatar: {
    flex: 1,
    marginLeft: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  subtitle: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  // TODO: Fix Typography line height on Android vs iOS
  titleText: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.medium.fontFamily,
    lineHeight: Platform.OS === 'android' ? 28 : 24,
    includeFontPadding: false,
    textAlignVertical: 'top',
  },
  subtitleTextPrimary: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.fonts.thin.fontFamily,
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: 'top',
    minHeight: 'auto',
    maxWidth: 250
  },
  subtitleTextSecondary: {
    fontSize: 13,
    color: theme.colors.textDarker,
    fontFamily: theme.fonts.thin.fontFamily,
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: 'top',
    minHeight: 'auto',
  },
});
