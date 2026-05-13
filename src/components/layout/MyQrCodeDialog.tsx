import React from 'react';
import { Image, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useAppSelector } from 'mediashare/store';
import { theme } from 'mediashare/styles';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Personal invite QR. Every user has a unique QR encoding a
 * deep-linked URL of the form `{origin}/invite?from={sub}`. Anyone
 * who scans it lands on signup with the inviter pre-attached.
 *
 * Uses a public QR-image API for now — swap to a local QR
 * generator (e.g. react-native-qrcode-svg) in a follow-up.
 */
export const MyQrCodeDialog: React.FC<Props> = ({ visible, onDismiss }) => {
  const sub = useAppSelector((state: any) => state?.user?.entity?.sub);
  const fullName = useAppSelector((state: any) => {
    const e = state?.user?.entity;
    return [e?.firstName, e?.lastName].filter(Boolean).join(' ').trim();
  });
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://pocketpt.afehrpt.com';
  const inviteUrl = `${origin}/invite${sub ? `?from=${encodeURIComponent(sub)}` : ''}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
    inviteUrl
  )}`;

  return (
    <SafeAreaView>
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={onDismiss}
          style={{ borderRadius: 10 }}
        >
          <Dialog.Content>
            <Text style={styles.title}>Your QR Code</Text>
            {fullName ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {fullName}
              </Text>
            ) : null}
            <View style={styles.qrWrap}>
              <View style={styles.qrBox}>
                <Image
                  source={{ uri: qrSrc }}
                  style={styles.qrImage}
                  resizeMode="contain"
                  accessibilityLabel="Your personal QR code"
                />
              </View>
              <Text style={styles.help}>
                Share this QR so others can connect with you.
              </Text>
              <Text style={styles.url} numberOfLines={2}>
                {inviteUrl}
              </Text>
              <Button
                mode="contained"
                dark
                color={theme.colors.white}
                buttonColor={theme.colors.primary}
                onPress={onDismiss}
              >
                Close
              </Button>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    color: theme.colors.textDarker,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
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
  help: {
    color: theme.colors.text,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  url: {
    color: theme.colors.textDarker,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default MyQrCodeDialog;
