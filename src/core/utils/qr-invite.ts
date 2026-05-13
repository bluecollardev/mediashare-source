// Pure helpers for the QR-invite flow. Kept apart from the UI so
// they can be exercised in a plain jest env without dragging in
// react-native-paper, Portal, or the rest of the layout stack.

const DEFAULT_ORIGIN = 'https://pocketpt.afehrpt.com';

/**
 * Build the personal invite URL for a user. The recipient scans the
 * QR (or follows the link) and lands on /invite with `from` set to
 * the inviter's Cognito sub.
 */
export function buildInviteUrl(sub?: string, origin?: string): string {
  const base = (origin || DEFAULT_ORIGIN).replace(/\/$/, '');
  if (!sub) return `${base}/invite`;
  return `${base}/invite?from=${encodeURIComponent(sub)}`;
}

/**
 * Image URL for an api.qrserver.com QR that encodes the given URL.
 * Used as the `<Image src=…>` on the QR display until we install a
 * local QR generator.
 */
export function buildQrImageUrl(
  url: string,
  size = 240,
  margin = 8
): string {
  const sizeSafe = Math.max(64, Math.min(2048, Math.floor(size || 240)));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${sizeSafe}x${sizeSafe}&margin=${margin}&data=${encodeURIComponent(
    url
  )}`;
}

/**
 * Pulls a sub out of a previously-built invite URL. Returns
 * undefined if the URL doesn't carry one. Used by the (future)
 * /invite landing page to attach the inviter on signup.
 */
export function parseInviteUrl(url: string): { sub?: string } {
  try {
    const u = new URL(url);
    const sub = u.searchParams.get('from');
    return sub ? { sub } : {};
  } catch {
    return {};
  }
}
