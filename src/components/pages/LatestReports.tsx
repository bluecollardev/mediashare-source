import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Avatar, Divider, IconButton, Searchbar, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'mediashare/store';
import {
  listReportedContent,
  suspendContent,
  unsuspendContent,
} from 'mediashare/store/modules/reportedContent';
import {
  suspendAdminUser,
  unsuspendAdminUser,
} from 'mediashare/store/modules/adminUsers';
import { useSnack } from 'mediashare/hooks/useSnack';
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
  isSuspended?: boolean;
  reportedCount?: number;
  reports?: any[];
  reporters?: any[];
  uploader?: any;
}

const displayNameOf = (u: any, fallback = 'Unknown') => {
  if (!u) return fallback;
  return (
    [u.firstName, u.lastName].filter(Boolean).join(' ').trim() ||
    u.username ||
    u.email ||
    fallback
  );
};

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
  onToggleContentSuspend: (row: ReportedRow) => void;
  onToggleUploaderSuspend: (uploader: any, isSuspended: boolean) => void;
}> = ({ row, onPress, onToggleContentSuspend, onToggleUploaderSuspend }) => {
  const count = row.reportedCount || 0;
  const up = row.uploader || null;
  const uploaderIsSuspended = !!up?.isDisabled;
  const uploaderProtected = !up?._id;
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
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onPress}
          activeOpacity={0.7}
          style={styles.rowMain}
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
          <Text style={styles.title} numberOfLines={1}>
            {row.title || '(untitled)'}
          </Text>
          <Text style={styles.meta}>
            {row.contentType === 'mediaItem' ? 'Media Item' : 'Playlist Item'}
            {up
              ? `  ·  by ${displayNameOf(up)}${
                  up?.email ? `, ${up.email}` : ''
                }`
              : ''}
            {row.isSuspended ? '  ·  Content suspended' : ''}
          </Text>
          <View style={styles.badgeRow}>
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
            {row.isSuspended ? (
              <View style={styles.suspendedBadge}>
                <MaterialIcons
                  name="block"
                  size={11}
                  color="#ffffff"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.suspendedBadgeText}>Suspended</Text>
              </View>
            ) : null}
          </View>
          {mostRecent ? (
            <View style={styles.reportBlock}>
              <Text style={styles.reportLine}>
                <Text style={styles.reportLineLabel}>Reported By:</Text>{' '}
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
        <View style={styles.rowActions}>
          <IconButton
            icon={row.isSuspended ? 'visibility' : 'visibility-off'}
            iconColor={
              row.isSuspended ? theme.colors.success : theme.colors.accent
            }
            onPress={() => onToggleContentSuspend(row)}
            size={20}
          />
          {up?._id ? (
            <IconButton
              icon={uploaderIsSuspended ? 'lock-open' : 'block'}
              iconColor={
                uploaderProtected
                  ? theme.colors.default
                  : uploaderIsSuspended
                  ? theme.colors.success
                  : theme.colors.accent
              }
              disabled={uploaderProtected}
              onPress={() => onToggleUploaderSuspend(up, uploaderIsSuspended)}
              size={20}
            />
          ) : null}
        </View>
      </View>
      <Divider />
    </>
  );
};

const LatestReports = (_props: PageProps) => {
  const dispatch = useDispatch();
  const viewMediaItem = useViewMediaItemById();
  const viewPlaylistItem = useViewPlaylistItemById();
  const { element: snack, onToggleSnackBar, setMessage } = useSnack();
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

  const refresh = () => (dispatch as any)(listReportedContent());

  const onToggleContentSuspend = async (row: ReportedRow) => {
    const wasSuspended = !!row.isSuspended;
    const result: any = await (dispatch as any)(
      wasSuspended
        ? unsuspendContent({ contentType: row.contentType, itemId: row._id })
        : suspendContent({ contentType: row.contentType, itemId: row._id })
    );
    if (result?.meta?.requestStatus === 'rejected') {
      setMessage(
        result?.payload?.message ||
          result?.error?.message ||
          'Failed to update content'
      );
      onToggleSnackBar(false);
      return;
    }
    setMessage(wasSuspended ? 'Content unsuspended' : 'Content suspended');
    onToggleSnackBar(true);
    await refresh();
  };

  const onToggleUploaderSuspend = async (
    uploader: any,
    isSuspended: boolean
  ) => {
    if (!uploader?._id) return;
    const result: any = await (dispatch as any)(
      isSuspended
        ? unsuspendAdminUser(uploader._id)
        : suspendAdminUser(uploader._id)
    );
    if (result?.meta?.requestStatus === 'rejected') {
      setMessage(
        result?.payload?.message ||
          result?.error?.message ||
          'Failed to update user'
      );
      onToggleSnackBar(false);
      return;
    }
    setMessage(
      isSuspended
        ? `Unsuspended ${displayNameOf(uploader)}`
        : `Suspended ${displayNameOf(uploader)}`
    );
    onToggleSnackBar(true);
    await refresh();
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
              <ReportRow
                row={item}
                onPress={() => openItem(item)}
                onToggleContentSuspend={onToggleContentSuspend}
                onToggleUploaderSuspend={onToggleUploaderSuspend}
              />
            )}
          />
        )}
        {snack}
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  badge: {
    // Hug the content — without alignSelf it stretches to fill the
    // parent column.
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  suspendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 6,
  },
  suspendedBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
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
