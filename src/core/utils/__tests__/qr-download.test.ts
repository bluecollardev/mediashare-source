import { downloadQrImageWeb } from '../qr-download';

const makeDeps = () => {
  const click = jest.fn();
  const remove = jest.fn();
  const appendChild = jest.fn();
  const anchor: any = {
    set href(v: string) {
      anchor._href = v;
    },
    get href() {
      return anchor._href;
    },
    download: '',
    click,
    remove,
  };
  const createElement = jest.fn(() => anchor);
  const documentMock: any = {
    createElement,
    body: { appendChild },
  };
  const blob: any = { type: 'image/png' };
  const fetchMock = jest.fn(async () => ({ blob: async () => blob } as any));
  const createObjectURL = jest.fn(() => 'blob:fake');
  const revokeObjectURL = jest.fn();
  const URLMock: any = { createObjectURL, revokeObjectURL };
  return {
    deps: { fetch: fetchMock, document: documentMock, URL: URLMock },
    anchor,
    fetchMock,
    appendChild,
    click,
    remove,
    createObjectURL,
    revokeObjectURL,
  };
};

describe('downloadQrImageWeb', () => {
  jest.useFakeTimers();

  it('fetches the URL, creates a blob anchor, and clicks it', async () => {
    const t = makeDeps();
    const ok = await downloadQrImageWeb(
      'https://example/qr.png',
      'invite-qr.png',
      t.deps as any
    );
    expect(ok).toBe(true);
    expect(t.fetchMock).toHaveBeenCalledWith('https://example/qr.png');
    expect(t.createObjectURL).toHaveBeenCalled();
    expect(t.anchor.href).toBe('blob:fake');
    expect(t.anchor.download).toBe('invite-qr.png');
    expect(t.appendChild).toHaveBeenCalledWith(t.anchor);
    expect(t.click).toHaveBeenCalled();
    expect(t.remove).toHaveBeenCalled();
  });

  it('revokes the object URL after a short delay', async () => {
    const t = makeDeps();
    await downloadQrImageWeb('https://example/qr.png', 'qr.png', t.deps as any);
    expect(t.revokeObjectURL).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(t.revokeObjectURL).toHaveBeenCalledWith('blob:fake');
  });

  it('returns false (and swallows) when fetch throws', async () => {
    const t = makeDeps();
    t.fetchMock.mockRejectedValueOnce(new Error('network'));
    const ok = await downloadQrImageWeb(
      'https://example/qr.png',
      'qr.png',
      t.deps as any
    );
    expect(ok).toBe(false);
    expect(t.click).not.toHaveBeenCalled();
  });

  it('returns false when running without a DOM (e.g. native)', async () => {
    const ok = await downloadQrImageWeb('x', 'y', {
      fetch: undefined,
      document: undefined,
      URL: undefined,
    });
    expect(ok).toBe(false);
  });
});
