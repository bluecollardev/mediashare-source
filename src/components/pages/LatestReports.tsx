import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Avatar, Divider, Searchbar, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'mediashare/store';
import { listReportedContent } from 'mediashare/store/modules/reportedContent';
import {
  useViewMediaItemById,
  useViewPlaylistItemById,
} from 'mediashare/hooks/navigation';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import {
  KeyboardAvoidingPageContent,
  NoContent,
  PageContainer,
  PageProps,
} from 'mediashare/components/layout';
import { theme } from 'mediashare/styles';

const severityColor = (count: number) => {
  if (count > 3) return theme.colors.error;
  if (count >= 1) return '#facc15'; // yellow
  return theme.colors.default;
};

const severityBg = (count: number) => {
  if (count > 3) return theme.colors.error;
  if (count >= 1) return '#facc15';
  return theme.colors.surface;
};

interface ReportedRow {
  _id: string;
  contentType: 'mediaItem' | 'playlistItem';
  title?: string;
  imageSrc?: string;
  uri?: string;
  reportedCount?: number;
  reports?: any[];
  reporters?: any[];
}

const formatDate = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const reporterLabel = (row: ReportedRow, sub?: string) => {
  if (!sub) return 'Anonymous';
  const u = (row.reporters || []).find((r: any) => r?.sub === sub);
  if (!u) return 'Unknown reporter';
  return (
    [u.firstName, u.lastName].filter(Boolean).join(' ').trim() ||
    u.username ||
    u.email ||
    'Unknown reporter'
  );
};

const ReportRow: React.FC<{
  row: ReportedRow;
  onPress: () => void;
}> = ({ row, onPress }) => {
  const count = row.reportedCount || 0;
  const mostRecent = useMemo(() => {
    const reports = row.reports || [];
    return [...reports].sort((a: any, b: any) => {
      const da = new Date(a?.reportedAt || 0).getTime();
      const db = new Date(b?.reportedAt || 0).getTime();
      return db - da;
    })[0];
  }, [row.reports]);

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.row}
      >
        {row.imageSrc ? (
          <Avatar.Image
            size={48}
            source={{ uri: row.imageSrc }}
            style={styles.thumb}
          />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <MaterialIcons
              name={row.contentType === 'mediaItem' ? 'play-arrow' : 'queue-music'}
              size={24}
              color={theme.colors.text}
            />
          </View>
        )}
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {row.title || '(untitled)'}
            </Text>
            <View
              style={[styles.badge, { backgroundColor: severityBg(count) }]}
            >
              <MaterialIcons
                name="flag"
                size={11}
                color="#000000"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.badgeText}>
                {count} {count === 1 ? 'report' : 'reports'}
              </Text>
            </View>
          </View>
          <Text style={styles.meta}>
            {row.contentType === 'mediaItem' ? 'Media Item' : 'Playlist Item'}
          </Text>
          {mostRecent ? (
            <View style={styles.reportBlock}>
              <Text style={styles.reportLine}>
                <Text style={styles.reportLineLabel}>By:</Text>{' '}
                {reporterLabel(row, mostRecent.reporterSub)}
              </Text>
              <Text style={styles.reportLine}>
                <Text style={styles.reportLineLabel}>Reason:</Text>{' '}
                {mostRecent.reason || '—'}
              </Text>
              {mostRecent.comment ? (
                <Text style={styles.reportLine}>
                  <Text style={styles.reportLineLabel}>Comment:</Text>{' '}
                  {mostRecent.comment}
                </Text>
              ) : null}
              <Text style={[styles.reportLine, styles.reportLineMuted]}>
                {formatDate(mostRecent.reportedAt)}
                {(row.reports || []).length > 1
                  ? `  ·  ${row.reports.length - 1} more`
                  : ''}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
      <Divider />
    </>
  );
};

const LatestReports = (_props: PageProps) => {
  const dispatch = useDispatch();
  const viewMediaItem = useViewMediaItemById();
  const viewPlaylistItem = useViewPlaylistItemById();
  const { entities = [] as any[], loaded } = useAppSelector(
    (state: any) => state?.reportedContent || {}
  );

  const openItem = (row: ReportedRow) => {
    if (row.contentType === 'mediaItem') {
      viewMediaItem({ mediaId: row._id, uri: row.uri });
    } else {
      viewPlaylistItem({ playlistItemId: row._id, uri: row.uri });
    }
  };

  useEffect(() => {
    dispatch(listReportedContent() as any);
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(listReportedContent() as any);
    }, [dispatch])
  );

  const safeEntities: ReportedRow[] = Array.isArray(entities) ? entities : [];

  const [searchText, setSearchText] = useState('');
  // Build a single lowercase haystack per row: item title, contentType,
  // reasons, comments, reporter names + emails. Matches feel obvious
  // to the user regardless of which field hits.
  const filteredEntities = useMemo(() => {
    const needle = (searchText || '').trim().toLowerCase();
    if (!needle) return safeEntities;
    return safeEntities.filter((row: any) => {
      const reports = Array.isArray(row?.reports) ? row.reports : [];
      const reporters = Array.isArray(row?.reporters) ? row.reporters : [];
      const reporterHay = reporters
        .map((u: any) =>
          [u?.firstName, u?.lastName, u?.username, u?.email]
            .filter(Boolean)
            .join(' ')
        )
        .join(' ');
      const reportHay = reports
        .map((r: any) => `${r?.reason || ''} ${r?.comment || ''}`)
        .join(' ');
      const hay = `${row?.title || ''} ${row?.contentType || ''} ${reporterHay} ${reportHay}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [safeEntities, searchText]);

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <View style={styles.searchWrap}>
          <Searchbar
            placeholder="Search items, reporters, or reasons"
            value={searchText}
            onChangeText={setSearchText}
            inputStyle={{ fontSize: 15 }}
            style={styles.searchbar}
            autoCapitalize="none"
            clearIcon="clear"
          />
        </View>
        <Text style={styles.countLabel}>
          {filteredEntities.length === safeEntities.length
            ? safeEntities.length === 1
              ? '1 reported item'
              : `${safeEntities.length} reported items`
            : `${filteredEntities.length} of ${safeEntities.length} reported items`}
        </Text>
        {loaded && safeEntities.length === 0 ? (
          <NoContent
            messageButtonText="No reported content. Nothing to review."
            icon="check-circle"
          />
        ) : filteredEntities.length === 0 ? (
          <NoContent
            messageButtonText="No matching reports."
            icon="info"
          />
        ) : (
          <FlatList
            data={filteredEntities}
            keyExtractor={(r: ReportedRow) =>
              `report_${r.contentType}_${r._id}`
            }
            renderItem={({ item }) => (
              <ReportRow row={item} onPress={() => openItem(item)} />
            )}
          />
        )}
      </KeyboardAvoidingPageContent>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  searchbar: {
    backgroundColor: theme.colors.surface,
  },
  countLabel: {
    color: theme.colors.text,
    opacity: 0.7,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  thumb: {
    marginRight: 12,
    backgroundColor: theme.colors.surface,
  },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  copy: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.fonts.medium.fontFamily,
    marginRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  meta: {
    color: theme.colors.textDarker,
    fontSize: 12,
    marginTop: 2,
  },
  reportBlock: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  reportLine: {
    color: theme.colors.text,
    fontSize: 12,
    marginTop: 2,
  },
  reportLineLabel: {
    color: theme.colors.textDarker,
    fontFamily: theme.fonts.medium.fontFamily,
  },
  reportLineMuted: {
    color: theme.colors.textDarker,
    marginTop: 4,
  },
});

export default withLoadingSpinner(
  (state: any) => !!state?.reportedContent?.loading
)(LatestReports);
