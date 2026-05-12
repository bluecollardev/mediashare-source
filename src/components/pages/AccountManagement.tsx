import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Text } from 'react-native-paper';
import { useAppSelector } from 'mediashare/store';
import { useRouteName } from 'mediashare/hooks/navigation';
import { routeNames } from 'mediashare/routes';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import {
  PageContainer,
  PageProps,
  KeyboardAvoidingPageContent,
} from 'mediashare/components/layout';
import { theme } from 'mediashare/styles';

interface MenuOption {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

// The new "Manage Account" landing — replaces the direct-to-form
// experience with a list of options. Admins see a "Manage Users"
// option above "Edit Account" and a badge in the header card.
const AccountManagement = (_props: PageProps) => {
  const isAdmin = useAppSelector(
    (state) => (state?.user?.entity as any)?.isAdmin === true
  );
  const firstName = useAppSelector(
    (state) => state?.user?.entity?.firstName || ''
  );
  const lastName = useAppSelector(
    (state) => state?.user?.entity?.lastName || ''
  );
  const goToManageUsers = useRouteName(routeNames.manageUsers);
  const goToEditAccount = useRouteName(routeNames.editAccount);

  const options: MenuOption[] = [
    ...(isAdmin
      ? [
          {
            icon: 'admin-panel-settings',
            title: 'Manage Users',
            description: 'View and manage every account on the platform.',
            onPress: () => goToManageUsers(),
          },
        ]
      : []),
    {
      icon: 'person',
      title: 'Edit Account',
      description: 'Update your profile photo, name, email, and phone.',
      onPress: () => goToEditAccount(),
    },
  ];

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {firstName ? `${firstName} ${lastName}`.trim() : 'Your account'}
            </Text>
            <Text style={styles.subtitle}>
              Manage your profile and platform settings.
            </Text>
          </View>
          {isAdmin ? (
            <View style={styles.adminBadge}>
              <MaterialIcons
                name="verified-user"
                color="#ffffff"
                size={14}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          ) : null}
        </View>
        {options.map((option) => (
          <TouchableOpacity
            key={option.title}
            accessibilityRole="button"
            onPress={option.onPress}
            style={styles.row}
          >
            <View style={styles.iconWrap}>
              <MaterialIcons
                name={option.icon}
                color={theme.colors.text}
                size={28}
              />
            </View>
            <View style={styles.copy}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              color={theme.colors.default}
              size={24}
            />
          </TouchableOpacity>
        ))}
      </KeyboardAvoidingPageContent>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.medium.fontFamily,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textDarker,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  copy: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.medium.fontFamily,
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: 12,
    color: theme.colors.textDarker,
    marginTop: 2,
  },
});

export default withLoadingSpinner(undefined)(AccountManagement);
