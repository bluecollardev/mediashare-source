// Web QR download helper. Fetches the QR image (api.qrserver.com
// doesn't set Content-Disposition, so a bare anchor would just
// open it), wraps it in a blob URL, and triggers the browser's
// save flow. Kept separate from React components so the DOM
// interactions can be exercised in a jest env with simple mocks.

export interface DownloadDeps {
  fetch?: typeof fetch;
  document?: Document;
  URL?: typeof URL;
}

export async function downloadQrImageWeb(
  qrSrc: string,
  filename: string,
  deps: DownloadDeps = {}
): Promise<boolean> {
  const _fetch = deps.fetch || (typeof fetch !== 'undefined' ? fetch : undefined);
  const _document =
    deps.document || (typeof document !== 'undefined' ? document : undefined);
  const _URL = deps.URL || (typeof URL !== 'undefined' ? URL : undefined);
  if (!_fetch || !_document || !_URL) return false;
  try {
    const res = await _fetch(qrSrc);
    const blob = await res.blob();
    const url = _URL.createObjectURL(blob);
    const a = _document.createElement('a') as HTMLAnchorElement;
    a.href = url;
    a.download = filename;
    _document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => _URL.revokeObjectURL(url), 500);
    return true;
  } catch (err) {
    return false;
  }
}
