import {
  buildInviteUrl,
  buildQrImageUrl,
  parseInviteUrl,
} from '../qr-invite';

describe('buildInviteUrl', () => {
  it('returns an /invite URL with the sub url-encoded', () => {
    expect(
      buildInviteUrl('5d8b7b90-83fd-4d04-a59c-589ab6bf71f2', 'https://app.test')
    ).toBe(
      'https://app.test/invite?from=5d8b7b90-83fd-4d04-a59c-589ab6bf71f2'
    );
  });

  it('omits the query when no sub is provided', () => {
    expect(buildInviteUrl(undefined, 'https://app.test')).toBe(
      'https://app.test/invite'
    );
    expect(buildInviteUrl('', 'https://app.test')).toBe('https://app.test/invite');
  });

  it('strips a trailing slash from origin', () => {
    expect(buildInviteUrl('abc', 'https://app.test/')).toBe(
      'https://app.test/invite?from=abc'
    );
  });

  it('encodes subs that contain reserved characters', () => {
    const sub = 'a b+c/d';
    const url = buildInviteUrl(sub, 'https://app.test');
    expect(url).toBe('https://app.test/invite?from=a%20b%2Bc%2Fd');
  });

  it('falls back to a default origin when none is given', () => {
    expect(buildInviteUrl('abc')).toMatch(/^https:\/\/.+\/invite\?from=abc$/);
  });
});

describe('buildQrImageUrl', () => {
  it('points at api.qrserver.com with url-encoded data', () => {
    const src = buildQrImageUrl('https://app.test/invite?from=abc');
    expect(src).toContain('https://api.qrserver.com/v1/create-qr-code/');
    expect(src).toContain(
      `data=${encodeURIComponent('https://app.test/invite?from=abc')}`
    );
  });

  it('defaults to a 240x240 square with margin 8', () => {
    const src = buildQrImageUrl('x');
    expect(src).toContain('size=240x240');
    expect(src).toContain('margin=8');
  });

  it('honors a custom size and clamps it to a sane range', () => {
    expect(buildQrImageUrl('x', 320)).toContain('size=320x320');
    expect(buildQrImageUrl('x', 5)).toContain('size=64x64');
    expect(buildQrImageUrl('x', 99999)).toContain('size=2048x2048');
  });
});

describe('parseInviteUrl', () => {
  it('extracts the sub from a built URL', () => {
    const url = buildInviteUrl('abc', 'https://app.test');
    expect(parseInviteUrl(url)).toEqual({ sub: 'abc' });
  });

  it('returns an empty object when no from is present', () => {
    expect(parseInviteUrl('https://app.test/invite')).toEqual({});
  });

  it('decodes percent-encoded subs', () => {
    expect(
      parseInviteUrl('https://app.test/invite?from=a%20b%2Bc')
    ).toEqual({ sub: 'a b+c' });
  });

  it('returns an empty object on malformed input', () => {
    expect(parseInviteUrl('not a url')).toEqual({});
    expect(parseInviteUrl('')).toEqual({});
  });
});
