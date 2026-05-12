import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Avatar, Divider, FAB, IconButton, Searchbar, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'mediashare/store';
import {
  clearAdminUserSelection,
  deleteAdminUser,
  inviteAdminUser,
  listAdminUsers,
  selectAdminUser,
  suspendAdminUser,
  unsuspendAdminUser,
} from 'mediashare/store/modules/adminUsers';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { useRouteWithParams } from 'mediashare/hooks/navigation';
import { routeNames } from 'mediashare/routes';
import {
  ActionButtons,
  AppDialog,
  KeyboardAvoidingPageContent,
  NoContent,
  PageActions,
  PageContainer,
  PageProps,
} from 'mediashare/components/layout';
import InviteModal from 'mediashare/components/layout/InviteModal';
import { useSnack } from 'mediashare/hooks/useSnack';
import { components, theme } from 'mediashare/styles';

const actionModes = {
  delete: 'delete',
  suspend: 'suspend',
  default: 'default',
};

// Admin-only roster. Mirrors the Media / Playlists pattern: FAB menu
// for global actions (Add User / Delete), per-row Edit icon, bulk
// selection with a confirmation dialog. The DELETE/PUT/POST routes
// are all AdminGuard'd server-side as defence in depth.
const ManageUsers = (_props: PageProps) => {
  const dispatch = useDispatch();
  const editUser = useRouteWithParams(routeNames.editAccount);
  const { element: snackbar, onToggleSnackBar, setMessage } = useSnack();

  const { entities = [] as any[], selected = [] as any[] } = useAppSelector(
    (state: any) => state?.adminUsers || {}
  );
  // searchText must be declared before the useMemo below that reads it —
  // `const` is in the temporal dead zone before its declaration.
  const [searchText, setSearchText] = useState('');
  // Coerce upstream value to an array once — any non-array (null,
  // string, undefined) is treated as empty.
  const safeEntities: any[] = Array.isArray(entities) ? entities : [];
  // Filter (by name OR email substring, case-insensitive) then sort:
  // admins first, then alpha by display name. Filter+sort happen in
  // the component so the cached entity list stays untouched.
  const sortedEntities = React.useMemo(() => {
    const nameOf = (u: any) =>
      (
        [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim() ||
        u?.username ||
        u?.email ||
        ''
      ).toLowerCase();
    const needle = (searchText || '').trim().toLowerCase();
    const filtered = needle
      ? safeEntities.filter((u: any) => {
          const hay = [
            u?.firstName,
            u?.lastName,
            u?.username,
            u?.email,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return hay.includes(needle);
        })
      : safeEntities;
    return [...filtered].sort((a: any, b: any) => {
      const adminDelta = (b?.isAdmin ? 1 : 0) - (a?.isAdmin ? 1 : 0);
      if (adminDelta !== 0) return adminDelta;
      return nameOf(a).localeCompare(nameOf(b));
    });
  }, [entities, searchText]);
  const currentUserId = useAppSelector(
    (state: any) => state?.user?.entity?._id
  );

  const [isSelectable, setIsSelectable] = useState(false);
  const [actionMode, setActionMode] = useState(actionModes.default);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [fabState, setFabState] = useState({ open: false });

  useEffect(() => {
    dispatch(clearAdminUserSelection());
  }, [dispatch]);

  // Refetch on focus so deletes / invites elsewhere are reflected.
  useFocusEffect(
    React.useCallback(() => {
      dispatch(listAdminUsers() as any);
    }, [dispatch])
  );

  const fabActions = [
    {
      icon: 'delete-forever',
      label: 'Delete',
      onPress: activateDeleteMode,
      color: theme.colors.text,
      style: { backgroundColor: theme.colors.error },
    },
    {
      icon: 'block',
      label: 'Suspend',
      onPress: activateSuspendMode,
      color: theme.colors.text,
      style: { backgroundColor: theme.colors.accent },
    },
    {
      icon: 'person-add',
      label: 'Add User',
      onPress: () => setShowInviteDialog(true),
      color: theme.colors.text,
      style: { backgroundColor: theme.colors.success },
    },
  ];

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <AppDialog
          leftActionLabel="Cancel"
          rightActionLabel="Delete"
          leftActionCb={closeDeleteDialog}
          rightActionCb={confirmDelete}
          onDismiss={closeDeleteDialog}
          showDialog={showDeleteDialog}
          title="Delete Users"
          subtitle={`Delete ${selected.length} ${
            selected.length === 1 ? 'user' : 'users'
          }? This action is final and cannot be undone.`}
          color={theme.colors.white}
          buttonColor={theme.colors.error}
        />
        <AppDialog
          leftActionLabel="Cancel"
          rightActionLabel="Suspend"
          leftActionCb={closeSuspendDialog}
          rightActionCb={confirmSuspend}
          onDismiss={closeSuspendDialog}
          showDialog={showSuspendDialog}
          title="Suspend Users"
          subtitle={`Suspend ${selected.length} ${
            selected.length === 1 ? 'user' : 'users'
          }? They won't be able to use the app until you unsuspend them.`}
          color={theme.colors.white}
          buttonColor={theme.colors.accent}
        />
        <InviteModal
          showDialog={showInviteDialog}
          onDismiss={() => setShowInviteDialog(false)}
          onSubmit={async ({ email }: { email: string }) => {
            try {
              await (dispatch as any)(inviteAdminUser({ email }));
              await (dispatch as any)(listAdminUsers());
              setMessage(`Invited ${email}`);
              onToggleSnackBar(true);
            } catch (err: any) {
              setMessage(err?.message || 'Failed to invite user');
              onToggleSnackBar(false);
            }
          }}
          userId={undefined as any}
        />
        <View style={styles.searchWrap}>
          <Searchbar
            placeholder="Search users by name or email"
            value={searchText}
            onChangeText={setSearchText}
            inputStyle={{ fontSize: 15 }}
            style={styles.searchbar}
            autoCapitalize="none"
            clearIcon="clear"
          />
        </View>
        <Text style={styles.countLabel}>
          {sortedEntities.length === safeEntities.length
            ? safeEntities.length === 1
              ? '1 user'
              : `${safeEntities.length} users`
            : `${sortedEntities.length} of ${safeEntities.length} users`}
          {isSelectable && selected.length > 0
            ? `  ·  ${selected.length} selected`
            : ''}
        </Text>
        {safeEntities.length === 0 ? (
          <NoContent messageButtonText="No users yet." icon="info" />
        ) : sortedEntities.length === 0 ? (
          <NoContent messageButtonText="No matching users." icon="info" />
        ) : (
          <FlatList
            data={sortedEntities}
            keyExtractor={(u: any) =>
              `admin_user_${u?._id || u?.sub || u?.email}`
            }
            renderItem={({ item }) => (
              <UserRow
                user={item}
                selectable={isSelectable}
                isSelf={
                  !!currentUserId &&
                  (item?._id === currentUserId || item?.sub === currentUserId)
                }
                checked={selected.some(
                  (s: any) => s?._id === item?._id
                )}
                onChecked={(checked) =>
                  dispatch(
                    selectAdminUser({ isChecked: checked, user: item })
                  )
                }
                onEdit={() => editUser({ userId: item?._id })}
                onToggleSuspend={async () => {
                  if (item?._id === currentUserId || item?.isAdmin) return;
                  try {
                    const action = item?.isDisabled
                      ? unsuspendAdminUser(item._id)
                      : suspendAdminUser(item._id);
                    await (dispatch as any)(action);
                    setMessage(
                      item?.isDisabled
                        ? 'User unsuspended'
                        : 'User suspended'
                    );
                    onToggleSnackBar(true);
                  } catch (err: any) {
                    setMessage(
                      err?.message || 'Failed to update user'
                    );
                    onToggleSnackBar(false);
                  }
                }}
              />
            )}
          />
        )}
        {snackbar}
      </KeyboardAvoidingPageContent>
      {isSelectable && actionMode === actionModes.delete ? (
        <PageActions>
          <ActionButtons
            onPrimaryClicked={openDeleteDialog}
            onSecondaryClicked={cancelBulkMode}
            primaryLabel="Delete"
            primaryIcon="delete"
            primaryButtonStyles={styles.deleteActionButton}
            disablePrimary={selected.length === 0}
          />
        </PageActions>
      ) : null}
      {isSelectable && actionMode === actionModes.suspend ? (
        <PageActions>
          <ActionButtons
            onPrimaryClicked={openSuspendDialog}
            onSecondaryClicked={cancelBulkMode}
            primaryLabel="Suspend"
            primaryIcon="block"
            primaryButtonStyles={styles.suspendActionButton}
            disablePrimary={selected.length === 0}
          />
        </PageActions>
      ) : null}
      {!isSelectable ? (
        <FAB.Group
          visible={true}
          open={fabState.open}
          icon={fabState.open ? 'close' : 'more-vert'}
          actions={fabActions}
          color={theme.colors.text}
          fabStyle={{
            backgroundColor: fabState.open
              ? theme.colors.default
              : theme.colors.primary,
            ...components.fab,
          }}
          onStateChange={(open) => setFabState(open)}
        />
      ) : null}
    </PageContainer>
  );

  function activateDeleteMode() {
    setActionMode(actionModes.delete);
    setIsSelectable(true);
  }

  function activateSuspendMode() {
    setActionMode(actionModes.suspend);
    setIsSelectable(true);
  }

  function openDeleteDialog() {
    setShowDeleteDialog(true);
  }

  function closeDeleteDialog() {
    setShowDeleteDialog(false);
  }

  function openSuspendDialog() {
    setShowSuspendDialog(true);
  }

  function closeSuspendDialog() {
    setShowSuspendDialog(false);
  }

  async function confirmSuspend() {
    const targets = selected.filter(
      (u: any) =>
        u?._id && u?._id !== currentUserId && !u?.isAdmin
    );
    if (targets.length === 0) {
      setShowSuspendDialog(false);
      return;
    }
    try {
      await Promise.all(
        targets.map((u: any) =>
          (dispatch as any)(suspendAdminUser(u._id))
        )
      );
      setMessage(
        targets.length === 1
          ? 'User suspended'
          : `${targets.length} users suspended`
      );
      onToggleSnackBar(true);
    } catch (err: any) {
      setMessage(err?.message || 'Failed to suspend users');
      onToggleSnackBar(false);
    }
    setShowSuspendDialog(false);
    cancelBulkMode();
  }

  function cancelBulkMode() {
    setActionMode(actionModes.default);
    dispatch(clearAdminUserSelection());
    setIsSelectable(false);
  }

  async function confirmDelete() {
    const targets = selected.filter(
      (u: any) =>
        u?._id && u?._id !== currentUserId && !u?.isAdmin
    );
    if (targets.length === 0) {
      setShowDeleteDialog(false);
      return;
    }
    try {
      await Promise.all(
        targets.map((u: any) =>
          (dispatch as any)(deleteAdminUser(u._id))
        )
      );
      setMessage(
        targets.length === 1
          ? 'User deleted'
          : `${targets.length} users deleted`
      );
      onToggleSnackBar(true);
    } catch (err: any) {
      setMessage(err?.message || 'Failed to delete users');
      onToggleSnackBar(false);
    }
    setShowDeleteDialog(false);
    cancelBulkMode();
  }
};

const UserRow = ({
  user,
  selectable,
  checked,
  onChecked,
  onEdit,
  onToggleSuspend,
  isSelf,
}: {
  user: any;
  selectable: boolean;
  checked: boolean;
  onChecked: (next: boolean) => void;
  onEdit: () => void;
  onToggleSuspend: () => void;
  isSelf: boolean;
}) => {
  const isSuspended = !!user?.isDisabled;
  // Admins (whitelisted emails) are protected from suspend/delete by
  // the backend; lock the per-row toggle and checkbox so the UI
  // matches the policy.
  const isProtected = isSelf || !!user?.isAdmin;
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.username ||
    user?.email ||
    'Unnamed';
  return (
    <>
      <View
        style={[styles.row, isSuspended ? styles.rowSuspended : null]}
      >
        {selectable ? (
          <TouchableOpacity
            accessibilityRole="checkbox"
            disabled={isProtected}
            onPress={() => !isProtected && onChecked(!checked)}
            style={styles.checkbox}
          >
            <MaterialIcons
              name={
                isProtected
                  ? 'block'
                  : checked
                  ? 'check-box'
                  : 'check-box-outline-blank'
              }
              size={24}
              color={
                isProtected
                  ? theme.colors.default
                  : checked
                  ? theme.colors.accent
                  : theme.colors.text
              }
            />
          </TouchableOpacity>
        ) : user?.imageSrc ? (
          <Avatar.Image
            size={36}
            source={{ uri: user.imageSrc }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatar}>
            <MaterialIcons
              name="person"
              color={theme.colors.text}
              size={24}
            />
          </View>
        )}
        <View style={styles.copy}>
          <Text style={styles.name}>
            {fullName}
            {isSelf ? '  (you)' : ''}
          </Text>
          <Text style={styles.meta}>
            {user?.email || '—'}
            {user?.role
              ? `  ·  ${user.role === 'admin' ? 'System' : user.role}`
              : ''}
          </Text>
          {user?.isAdmin || isSuspended ? (
            <View style={styles.badgeRow}>
              {user?.isAdmin ? (
                <View style={styles.badgeInline}>
                  <MaterialIcons
                    name="verified-user"
                    color={theme.colors.accent}
                    size={12}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[styles.badgeText, { color: theme.colors.accent }]}
                  >
                    Admin
                  </Text>
                </View>
              ) : null}
              {isSuspended ? (
                <View style={styles.badgeInline}>
                  <MaterialIcons
                    name="block"
                    color={theme.colors.error}
                    size={12}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[styles.badgeText, { color: theme.colors.error }]}
                  >
                    Suspended
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
        {!selectable ? (
          <>
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
              onPress={onToggleSuspend}
            />
            <IconButton
              icon="edit"
              iconColor={theme.colors.default}
              onPress={onEdit}
            />
          </>
        ) : null}
      </View>
      <Divider />
    </>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    marginRight: 12,
    backgroundColor: theme.colors.surface,
  },
  checkbox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  copy: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium.fontFamily,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  badgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  rowSuspended: {
    opacity: 0.55,
  },
  meta: {
    fontSize: 12,
    color: theme.colors.textDarker,
    marginTop: 2,
  },
  deleteActionButton: {
    backgroundColor: theme.colors.error,
  },
  suspendActionButton: {
    backgroundColor: theme.colors.accent,
  },
});

export default withLoadingSpinner(
  (state: any) => !!state?.adminUsers?.loading
)(ManageUsers);
