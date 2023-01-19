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
  onProfileImageClicked?: () => void;
  isCurrentUser?: boolean;
}

export const AccountCard = ({
  title = null,
  username = null,
  email = null,
  phoneNumber = null,
  text = null,
  image = null,
  likes = null,
  shares = null,
  shared = null,
  showSocial = false,
  showActions = false,
  isCurrentUser = false,
  onProfileImageClicked = () => {},
}: AccountCardProps) => {
  const [visible, setVisible] = useState(false);

  const profile = useProfile();
  const withoutName = () => state?.firstName?.length < 1 || state?.lastName?.length < 1;
  const [state] = useState(R.pick(profile, ['username', 'email', 'firstName', 'lastName', 'phoneNumber', 'imageSrc']));

  // <MaterialIcons name={read ? 'visibility' : 'visibility-off'} size={24} />
  // <View styles={defaultStyles.buttonContainer}>
  //   <IconButton icon="delete-outline" iconColor={theme.colors.text} size={20} onPress={onDelete} />
  //   <IconButton icon="play-circle-filled" iconColor={theme.colors.text} size={20} onPress={onView} />
  // </View>
  // <Menu.Item icon="play-circle-filled" onPress={() => {}} title="Watch" />
  return (
    <>
      <Card mode="elevated" style={defaultStyles.card}>
        {/* <View
          style={defaultStyles.header}
          leftStyle={defaultStyles.left}
          title={<Title style={defaultStyles.titleText}>{title}</Title>}
          titleStyle={defaultStyles.title}
          subtitle={
          
          }
          subtitleStyle={defaultStyles.subtitle}
          rightStyle={defaultStyles.right}
        /> */}
        <Card.Content>
          <View style={defaultStyles.cardContent}>
            <View style={defaultStyles.left}>
              {image ? (
                <TouchableWithoutFeedback onPress={onProfileImageClicked}>
                  <Avatar.Image size={108} source={{ uri: image }} />
                </TouchableWithoutFeedback>
              ) : (
                <TouchableWithoutFeedback onPress={onProfileImageClicked}>
                  <Avatar.Icon size={108} icon="person" />
                </TouchableWithoutFeedback>
              )}
            </View>
            <View style={defaultStyles.main}>
              {title ? (<Title style={defaultStyles.titleText}>{title}</Title>) : null}
              {username ? (<Subheading style={{ ...defaultStyles.subtitleTextPrimary }}>@{username}</Subheading>) : null}
              {email ? (<Subheading style={{ ...defaultStyles.subtitleTextSecondary }}>{email}</Subheading>) : null}
              {phoneNumber ? (<Subheading style={{ ...defaultStyles.subtitleTextSecondary }}>{phoneNumber}</Subheading>) : null}
              {text ? (<Text style={{ ...defaultStyles.subtitleTextPrimary }} numberOfLines={5}>{text}</Text>) : null}
            </View>
            <View style={defaultStyles.right}>
              {showActions ? (
                <Menu
                  visible={visible}
                  onDismiss={() => setVisible(false)}
                  anchor={
                    <IconButton icon="more-vert" onPress={() => setVisible(!visible)} />
                  }
                >
                  {isCurrentUser ? <Menu.Item onPress={() => {}} title="Deactive Account" /> : null}
                  {isCurrentUser ? <Menu.Item onPress={() => {}} title="Delete Account" /> : null}
                </Menu>
              ) : null}
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
        {showSocial ? (
          <View style={defaultStyles.social}>
            <View style={defaultStyles.labelledElement}>
              <Subheading>{likes}</Subheading>
              <Caption>Likes</Caption>
            </View>
            <View style={defaultStyles.labelledElement}>
              <Subheading>{shares}</Subheading>
              <Caption>Shares</Caption>
            </View>
            <View style={defaultStyles.labelledElement}>
              <Subheading>{shared}</Subheading>
              <Caption>Shared</Caption>
            </View>
          </View>
        ) : null}
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
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
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
  left: {
    flex: 0,
    width: 115,
    marginLeft: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    flex: 0,
    height: 92,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  social: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  labelledElement: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
  },
});
