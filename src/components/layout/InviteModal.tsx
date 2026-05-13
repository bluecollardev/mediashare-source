import React, { useState } from 'react';
import { Button, Dialog, IconButton, Portal, Text } from 'react-native-paper';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useAppSelector } from 'mediashare/store';
import { theme } from 'mediashare/styles';

interface AccountCardProps {
  userId: string;
  showDialog: boolean;
  onDismiss: () => void;
  onSubmit: (data: any) => any;
}

interface IFromInput {
  email: string;
}

type Mode = 'email' | 'qr' | 'scan';

// Fetch the QR PNG and offer it as a browser download — the QR
// service we use doesn't send Content-Disposition, so a bare anchor
// would just open the image. Web only; native should use Share /
// expo-media-library in a follow-up.
async function downloadQrImageWeb(qrSrc: string, filename: string) {
  try {
    const res = await fetch(qrSrc);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  } catch (err) {
    console.log('[QR] download failed', err);
  }
}

export default function ModalSheet({
  showDialog,
  onDismiss,
  onSubmit = (data) => undefined,
}: AccountCardProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
  });
  const [mode, setMode] = useState<Mode>('email');

  // The QR code encodes a sharable invite URL. The recipient scans
  // it with their device camera to land on the signup page with the
  // inviter pre-attached. For now we use a public chart API as the
  // image source — swap to a local QR generator later.
  const inviterSub = useAppSelector(
    (state: any) => state?.user?.entity?.sub
  );
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://pocketpt.afehrpt.com';
  const inviteUrl = `${origin}/invite${inviterSub ? `?from=${encodeURIComponent(inviterSub)}` : ''}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
    inviteUrl
  )}`;

  const submitForm: SubmitHandler<IFromInput> = async (data) => {
    if (!data.email) return;
    onSubmit(data);
    reset();
    onDismiss();
  };

  const dismiss = () => {
    reset();
    setMode('email');
    onDismiss();
  };

  return (
    <SafeAreaView>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={dismiss}
          style={{ borderRadius: 10 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            enabled
          >
            <Dialog.Content>
              <Text style={styles.title}>Invite</Text>

              {/* Mode toggle — pill-shaped buttons; active fills
                  with the primary color. Three ways to invite:
                  email, show MY QR, or pick a QR file someone else
                  has saved on this device. */}
              <View style={styles.tabs}>
                {(
                  [
                    { id: 'email', icon: 'email', label: 'Email' },
                    { id: 'qr', icon: 'qr-code-2', label: 'My QR' },
                    { id: 'scan', icon: 'image-search', label: 'Scan QR' },
                  ] as Array<{ id: Mode; icon: string; label: string }>
                ).map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    accessibilityRole="button"
                    onPress={() => setMode(opt.id)}
                    style={[
                      styles.tab,
                      mode === opt.id ? styles.tabActive : null,
                    ]}
                  >
                    <MaterialIcons
                      name={opt.icon}
                      size={16}
                      color={
                        mode === opt.id ? '#ffffff' : theme.colors.text
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        mode === opt.id ? styles.tabTextActive : null,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {mode === 'scan' ? (
                <ScanQrFromFile onDismiss={dismiss} />
              ) : mode === 'email' ? (
                <View>
                  <Controller
                    control={control}
                    rules={{
                      required: 'Required',
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        autoCapitalize="none"
                        style={styles.input}
                        placeholderTextColor={theme.colors.text}
                        placeholder="Enter email"
                        value={value}
                        onChangeText={(value) => onChange(value)}
                      />
                    )}
                    name="email"
                  />
                  <View style={{ height: 30 }}>
                    {errors.email?.message ? (
                      <Text style={{ color: theme.colors.error }}>
                        {errors.email.message}
                      </Text>
                    ) : null}
                  </View>
                  <Button
                    mode="contained"
                    dark
                    color={theme.colors.white}
                    buttonColor={theme.colors.primary}
                    onPress={handleSubmit(submitForm)}
                  >
                    confirm
                  </Button>
                </View>
              ) : (
                <View style={styles.qrWrap}>
                  <View style={styles.qrBox}>
                    <Image
                      source={{ uri: qrSrc }}
                      style={styles.qrImage}
                      resizeMode="contain"
                      accessibilityLabel="Invite QR code"
                    />
                    {Platform.OS === 'web' ? (
                      <IconButton
                        icon="cloud-download"
                        iconColor={theme.colors.text}
                        size={20}
                        onPress={() =>
                          downloadQrImageWeb(qrSrc, 'invite-qr.png')
                        }
                        style={styles.qrDownloadBtn}
                        accessibilityLabel="Download QR code"
                      />
                    ) : null}
                  </View>
                  <Text style={styles.qrHelp}>
                    Have the person scan this with their phone camera
                    to accept your invite.
                  </Text>
                  <Text style={styles.qrUrl} numberOfLines={2}>
                    {inviteUrl}
                  </Text>
                  <Button
                    mode="contained"
                    dark
                    color={theme.colors.white}
                    buttonColor={theme.colors.primary}
                    onPress={dismiss}
                  >
                    Done
                  </Button>
                </View>
              )}
            </Dialog.Content>
          </KeyboardAvoidingView>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

/**
 * Phone-storage file picker for scanning a saved QR image. Web
 * renders a hidden <input type="file"> via raw DOM so the user
 * gets the OS picker; the picked filename is surfaced as
 * confirmation. Actual QR decoding (jsQR or similar) will be
 * wired in a follow-up step — for now the user needs to share the
 * URL or use email if scan-from-image isn't enough.
 */
const ScanQrFromFile: React.FC<{ onDismiss: () => void }> = ({
  onDismiss,
}) => {
  const [pickedName, setPickedName] = useState<string | null>(null);
  const inputRef = React.useRef<any>(null);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.qrWrap}>
        <MaterialIcons
          name="image-search"
          size={56}
          color={theme.colors.default}
          style={{ marginBottom: 12 }}
        />
        <Text style={styles.qrHelp}>
          Pick a saved QR image from your phone to invite that
          person. (Coming soon on native — use the Email tab for
          now.)
        </Text>
        <Button
          mode="contained"
          dark
          color={theme.colors.white}
          buttonColor={theme.colors.primary}
          onPress={onDismiss}
        >
          Done
        </Button>
      </View>
    );
  }

  // Web path: trigger the OS file picker via a hidden input.
  const triggerPick = () => {
    if (inputRef.current && typeof inputRef.current.click === 'function') {
      inputRef.current.click();
    }
  };

  return (
    <View style={styles.qrWrap}>
      <MaterialIcons
        name="image-search"
        size={56}
        color={theme.colors.default}
        style={{ marginBottom: 12 }}
      />
      <Text style={styles.qrHelp}>
        Pick a saved QR image from your device to invite that
        person.
      </Text>
      {/* Hidden native file input; the button below trips its
          click() handler. */}
      {React.createElement('input', {
        ref: inputRef,
        type: 'file',
        accept: 'image/*',
        style: { display: 'none' },
        onChange: (e: any) => {
          const f = e?.target?.files?.[0];
          setPickedName(f?.name || null);
        },
      })}
      {pickedName ? (
        <Text style={styles.qrUrl} numberOfLines={2}>
          Selected: {pickedName}
        </Text>
      ) : null}
      <Button
        mode="contained"
        dark
        color={theme.colors.white}
        buttonColor={theme.colors.primary}
        onPress={triggerPick}
        style={{ marginBottom: 8 }}
      >
        {pickedName ? 'Pick a different image' : 'Choose image'}
      </Button>
      <Button
        mode="outlined"
        textColor={theme.colors.text}
        onPress={onDismiss}
      >
        Done
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  tabs: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    borderColor: theme.colors.text,
    color: theme.colors.text,
  },
  qrWrap: {
    alignItems: 'center',
  },
  qrBox: {
    width: 240,
    height: 240,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 12,
  },
  qrImage: {
    width: 240,
    height: 240,
  },
  qrDownloadBtn: {
    position: 'absolute',
    right: -4,
    top: -4,
    margin: 0,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  qrHelp: {
    color: theme.colors.text,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  qrUrl: {
    color: theme.colors.textDarker,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
  },
});
