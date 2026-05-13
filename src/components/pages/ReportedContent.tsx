import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Text } from 'react-native-paper';
import { useRouteName } from 'mediashare/hooks/navigation';
import { routeNames } from 'mediashare/routes';
import {
  KeyboardAvoidingPageContent,
  PageContainer,
  PageProps,
} from 'mediashare/components/layout';
import { theme } from 'mediashare/styles';

/**
 * Admin hub for moderation. Reporting itself is fair game from any
 * user, but a single account flagging multiple items can be its own
 * form of harassment — surface both views (latest reports + per-user
 * roll-up) so an admin can spot abuse-of-flag patterns.
 */
interface MenuOption {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

const ReportedContent = (_props: PageProps) => {
  const goToLatestReports = useRouteName(routeNames.latestReports);
  const goToReportsByUser = useRouteName(routeNames.reportsByUser);

  const options: MenuOption[] = [
    {
      icon: 'flag',
      title: 'Latest Reports',
      description:
        'Media and playlist items flagged by users, sorted by report count.',
      onPress: () => goToLatestReports(),
    },
    {
      icon: 'report-problem',
      title: 'Reports by User',
      description:
        'See which users have filed the most reports — useful for spotting flag abuse.',
      onPress: () => goToReportsByUser(),
    },
  ];

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
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
              <Text style={styles.title}>{option.title}</Text>
              <Text style={styles.description}>{option.description}</Text>
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
  title: {
    fontSize: 14,
    fontFamily: theme.fonts.medium.fontFamily,
    color: theme.colors.text,
  },
  description: {
    fontSize: 12,
    color: theme.colors.textDarker,
    marginTop: 2,
  },
});

export default ReportedContent;
