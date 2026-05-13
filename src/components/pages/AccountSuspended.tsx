import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { logout } from 'mediashare/store/modules/user';
import {
  PageContainer,
  KeyboardAvoidingPageContent,
} from 'mediashare/components/layout';
import { theme } from 'mediashare/styles';

/**
 * Full-screen takeover shown to suspended users instead of the
 * regular navigation tree. The user can only sign out from here —
 * Application.tsx gates on state.user.entity.isDisabled and renders
 * exclusively this page when truthy.
 */
const AccountSuspended = () => {
  const dispatch = useDispatch();
  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <View style={styles.wrap}>
          <MaterialIcons
            name="block"
            size={64}
            color={theme.colors.error}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.title}>Account suspended</Text>
          <Text style={styles.body}>
            Your account has been suspended by an administrator. If you
            believe this is a mistake, please contact support.
          </Text>
          <Button
            mode="contained"
            onPress={() => dispatch(logout() as any)}
            style={styles.button}
            buttonColor={theme.colors.primary}
            textColor="#ffffff"
          >
            Sign out
          </Button>
        </View>
      </KeyboardAvoidingPageContent>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  title: {
    fontSize: 22,
    fontFamily: theme.fonts.medium.fontFamily,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: theme.colors.textDarker,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
});

export default AccountSuspended;
