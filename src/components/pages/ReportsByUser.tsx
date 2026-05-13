import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  Avatar,
  Divider,
  IconButton,
  Searchbar,
  Text,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'mediashare/store';
import {
  listReportsByUser,
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

const severityBg = (count: number) => {
  if (count > 3) return theme.colors.error;
  if (count >= 1) return '#facc15'; // yellow
  return theme.colors.surface;
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

interface ReporterGroup {
  reporterSub: string;
  reportCount: number;
  reports: Array<{
    itemId: string;
    title?: string;
    imageSrc?: string;
    contentType: 'mediaItem' | 'playlistItem';
    reason?: string;
    comment?: string;
    reportedAt?: string;
    uri?: string;
    uploader?: any;
    isSuspended?: boolean;
  }>;
  user?: any;
}

const displayNameOf = (u: any, fallback?: string) => {
  if (!u) return fallback || 'Unknown';
  return (
    [u.firstName, u.lastName].filter(Boolean).join(' ').trim() ||
    u.username ||
    u.email ||
    fallback ||
    'Unknown'
  );
};

const ReporterRow: React.FC<{
  group: ReporterGroup;
  expanded: boolean;
  onToggle: () => void;
  onItemPress: (entry: ReporterGroup['reports'][number]) => void;
  onToggleSuspend: (target: any, isSuspended: boolean) => void;
  onToggleContentSuspend: (
    entry: ReporterGroup['reports'][number]
  ) => void;
}> = ({
  group,
  expanded,
  onToggle,
  onItemPress,
  onToggleSuspend,
  onToggleContentSuspend,
}) => {
  const u = group.user;
  const name = displayNameOf(u, group.reporterSub.slice(0, 8) + '…');
  const count = group.reportCount || 0;
  const isSuspended = !!u?.isDisabled;
  // Admins can't be suspended server-side; lock the icon if so.
  const isProtected = !!u?.isAdmin || !u?._id;
  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.7}
        onPress={onToggle}
        style={styles.row}
      >
        {u?.imageSrc ? (
          <Avatar.Image
            size={40}
            source={{ uri: u.imageSrc }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons name="person" size={22} color={theme.colors.text} />
          </View>
        )}
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.meta}>{u?.email || group.reporterSub}</Text>
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
          </View>
        </View>
        <IconButton
          icon={isSuspended ? 'lock-open' : 'block'}
          iconColor={
            isProtected
              ? theme.colors.default
              : isSuspended
              ? theme.colors.success
              : theme.colors.accent
          }
          disabled={isProtected}
          onPress={() => onToggleSuspend(u, isSuspended)}
        />
        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={24}
          color={theme.colors.default}
        />
      </TouchableOpacity>
      {expanded ? (
        <View style={styles.expandedWrap}>
          {(group.reports || []).map((entry, idx) => {
            const up = entry.uploader || null;
            const uploaderName = up
              ? displayNameOf(up)
              : entry.uploaderSub
              ? 'Unknown uploader'
              : null;
            const uploaderIsSuspended = !!up?.isDisabled;
            // Same self-protection as elsewhere: server refuses on
            // admin accounts and missing _id; lock the button.
            const uploaderProtected = !up?._id;
            return (
              <View
                key={`${group.reporterSub}_${entry.itemId}_${idx}`}
                style={styles.entryRow}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.7}
                  onPress={() => onItemPress(entry)}
                  style={styles.entryMain}
                >
                  {entry.imageSrc ? (
                    <Avatar.Image
                      size={40}
                      source={{ uri: entry.imageSrc }}
                      style={styles.entryThumb}
                    />
                  ) : (
                    <View style={styles.entryThumbPlaceholder}>
                      <MaterialIcons
                        name={
                          entry.contentType === 'mediaItem'
                            ? 'play-arrow'
                            : 'queue-music'
                        }
                        size={20}
                        color={theme.colors.text}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={styles.entryTitleRow}>
                      <Text style={styles.entryTitle} numberOfLines={1}>
                        {entry.title || '(untitled)'}
                      </Text>
                      {entry.isSuspended ? (
                        <View style={styles.entrySuspendedBadge}>
                          <MaterialIcons
                            name="block"
                            size={10}
                            color="#ffffff"
                            style={{ marginRight: 3 }}
                          />
                          <Text style={styles.entrySuspendedBadgeText}>
                            Suspended
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    {uploaderName ? (
                      <Text style={styles.entryUploader} numberOfLines={1}>
                        by {uploaderName}
                        {up?.email ? `  ·  ${up.email}` : ''}
                        {uploaderIsSuspended ? '  ·  Suspended' : ''}
                      </Text>
                    ) : null}
                    <Text style={styles.entryMeta}>
                      {entry.reason || 'unspecified'}
                      {entry.comment ? `  ·  ${entry.comment}` : ''}
                    </Text>
                    <Text style={styles.entryDate}>
                      {formatDate(entry.reportedAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.entryActions}>
                  <IconButton
                    icon={
                      entry.isSuspended ? 'visibility' : 'visibility-off'
                    }
                    iconColor={
                      entry.isSuspended
                        ? theme.colors.success
                        : theme.colors.accent
                    }
                    onPress={() => onToggleContentSuspend(entry)}
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
                      onPress={() =>
                        onToggleSuspend(up, uploaderIsSuspended)
                      }
                      size={20}
                    />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
      <Divider />
    </>
  );
};

const ReportsByUser = (_props: PageProps) => {
  const dispatch = useDispatch();
  const viewMediaItem = useViewMediaItemById();
  const viewPlaylistItem = useViewPlaylistItemById();
  const { element: snack, onToggleSnackBar, setMessage } = useSnack();
  const { byUser = [] as any[], byUserLoaded } = useAppSelector(
    (state: any) => state?.reportedContent || {}
  );

  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  useEffect(() => {
    dispatch(listReportsByUser() as any);
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(listReportsByUser() as any);
    }, [dispatch])
  );

  const onToggleContentSuspend = async (
    entry: ReporterGroup['reports'][number]
  ) => {
    const wasSuspended = !!entry?.isSuspended;
    const result: any = await (dispatch as any)(
      wasSuspended
        ? unsuspendContent({
            contentType: entry.contentType,
            itemId: entry.itemId,
          })
        : suspendContent({
            contentType: entry.contentType,
            itemId: entry.itemId,
          })
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
    setMessage(
      wasSuspended ? 'Content unsuspended' : 'Content suspended'
    );
    onToggleSnackBar(true);
    await (dispatch as any)(listReportsByUser());
  };

  const onToggleSuspend = async (target: any, isSuspended: boolean) => {
    if (!target?._id) return;
    // createAsyncThunk-dispatched actions never throw — they resolve
    // to either a fulfilled or rejected action. Check requestStatus
    // and surface the server message (e.g. the AdminGuard's 403:
    // "Admin accounts cannot be suspended.").
    const result: any = await (dispatch as any)(
      isSuspended
        ? unsuspendAdminUser(target._id)
        : suspendAdminUser(target._id)
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
        ? `Unsuspended ${displayNameOf(target)}`
        : `Suspended ${displayNameOf(target)}`
    );
    onToggleSnackBar(true);
    // Refetch so the badge + button state on every row reflects
    // the new isDisabled status (the same user may appear as
    // both a reporter and an uploader).
    await (dispatch as any)(listReportsByUser());
  };

  const safe: ReporterGroup[] = Array.isArray(byUser) ? byUser : [];

  const [searchText, setSearchText] = useState('');
  // Match on reporter name/username/email AND every entry's title /
  // reason / comment. Auto-expand a row when it matches via its
  // entries so the hit is visible without an extra tap.
  const { filtered, autoExpandSubs } = useMemo(() => {
    const needle = (searchText || '').trim().toLowerCase();
    if (!needle) {
      return { filtered: safe, autoExpandSubs: new Set<string>() };
    }
    const matchedByEntry = new Set<string>();
    const filtered = safe.filter((g: ReporterGroup) => {
      const u = g.user || ({} as any);
      const reporterHay = [u?.firstName, u?.lastName, u?.username, u?.email]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (reporterHay.includes(needle)) return true;
      const entryHay = (g.reports || [])
        .map(
          (r: any) =>
            `${r?.title || ''} ${r?.reason || ''} ${r?.comment || ''}`
        )
        .join(' ')
        .toLowerCase();
      if (entryHay.includes(needle)) {
        matchedByEntry.add(g.reporterSub);
        return true;
      }
      return false;
    });
    return { filtered, autoExpandSubs: matchedByEntry };
  }, [safe, searchText]);

  const openEntry = (entry: ReporterGroup['reports'][number]) => {
    if (entry.contentType === 'mediaItem') {
      viewMediaItem({ mediaId: entry.itemId, uri: entry.uri });
    } else {
      viewPlaylistItem({ playlistItemId: entry.itemId, uri: entry.uri });
    }
  };

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <View style={styles.searchWrap}>
          <Searchbar
            placeholder="Search reporters, items, or reasons"
            value={searchText}
            onChangeText={setSearchText}
            inputStyle={{ fontSize: 15 }}
            style={styles.searchbar}
            autoCapitalize="none"
            clearIcon="clear"
          />
        </View>
        <Text style={styles.countLabel}>
          {filtered.length === safe.length
            ? safe.length === 1
              ? '1 reporter'
              : `${safe.length} reporters`
            : `${filtered.length} of ${safe.length} reporters`}
        </Text>
        {byUserLoaded && safe.length === 0 ? (
          <NoContent
            messageButtonText="No reports filed yet."
            icon="check-circle"
          />
        ) : filtered.length === 0 ? (
          <NoContent messageButtonText="No matching reporters." icon="info" />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(g: ReporterGroup) => `reporter_${g.reporterSub}`}
            renderItem={({ item }) => (
              <ReporterRow
                group={item}
                expanded={
                  expandedSub === item.reporterSub ||
                  autoExpandSubs.has(item.reporterSub)
                }
                onToggle={() =>
                  setExpandedSub(
                    expandedSub === item.reporterSub ? null : item.reporterSub
                  )
                }
                onItemPress={openEntry}
                onToggleSuspend={onToggleSuspend}
                onToggleContentSuspend={onToggleContentSuspend}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    marginRight: 12,
    backgroundColor: theme.colors.surface,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  name: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.fonts.medium.fontFamily,
    marginRight: 8,
  },
  meta: {
    color: theme.colors.textDarker,
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  badge: {
    // The badge must hug its content — without this it stretches
    // to fill the parent column.
    alignSelf: 'flex-start',
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
  expandedWrap: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  entryMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryUploader: {
    color: theme.colors.textDarker,
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  entrySuspendedBadge: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  entrySuspendedBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryThumb: {
    marginRight: 10,
    backgroundColor: theme.colors.background,
  },
  entryThumbPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  entryTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontFamily: theme.fonts.medium.fontFamily,
  },
  entryMeta: {
    color: theme.colors.text,
    fontSize: 12,
    marginTop: 2,
  },
  entryDate: {
    color: theme.colors.textDarker,
    fontSize: 11,
    marginTop: 2,
  },
});

export default withLoadingSpinner(
  (state: any) => !!state?.reportedContent?.byUserLoading
)(ReportsByUser);
