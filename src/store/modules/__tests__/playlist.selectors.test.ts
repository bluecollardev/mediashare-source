// Locks down the playlist merge semantics documented in
// `bcdev_mediashare-api/docs/ENTITIES.md` — specifically that mediaItems is the
// spine, playlistItem overrides win, orphan playlistItems are dropped, and the
// sort uses |sortIndex| with 0/missing falling to the bottom.

// The playlist module pulls in API/store wiring at import time that isn't
// available in a pure jest env. Stub the heavy module-load side effects;
// the selectors themselves don't use any of it at runtime.
jest.mock('mediashare/store/apis', () => ({ ApiService: class {} }));
jest.mock('mediashare/store/factory', () => ({
  makeActions: (names: readonly string[]) =>
    Object.fromEntries(
      names.map((n) => {
        const camel = n.replace(/_(.)/g, (_, c) => c.toUpperCase());
        return [camel, { type: camel }];
      })
    ),
}));
jest.mock('mediashare/store/helpers', () => ({
  reduceFulfilledState: (fn: any) => fn,
  reducePendingState: (fn: any) => fn,
  reduceRejectedState: (fn: any) => fn,
  thunkApiWithState: (thunkApi: any) => ({ api: {}, ...thunkApi }),
}));

import {
  selectPlaylistMediaItems,
  selectMappedPlaylistMediaItems,
} from '../playlist';

const makeMediaItem = (id: string, overrides: Record<string, any> = {}) => ({
  _id: id,
  title: `media-${id}-title`,
  description: `media-${id}-desc`,
  uri: `s3://media-${id}.mp4`,
  ...overrides,
});

const makePlaylistItem = (
  mediaId: string,
  id: string,
  overrides: Record<string, any> = {}
) => ({
  _id: id,
  mediaId,
  title: `pi-${id}-title`,
  description: `pi-${id}-desc`,
  uri: `s3://pi-${id}.mp4`,
  sortIndex: 0,
  ...overrides,
});

describe('selectPlaylistMediaItems', () => {
  test('returns one entry per mediaItem (mediaItems is the spine)', () => {
    const selected = {
      mediaItems: [makeMediaItem('m1'), makeMediaItem('m2'), makeMediaItem('m3')],
      playlistItems: [],
    };
    const result = selectPlaylistMediaItems(selected);
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.mediaItemId)).toEqual(['m1', 'm2', 'm3']);
  });

  test('pairs each mediaItem with its matching playlistItem (by mediaId)', () => {
    const selected = {
      mediaItems: [makeMediaItem('m1'), makeMediaItem('m2')],
      playlistItems: [makePlaylistItem('m2', 'pi-for-m2')],
    };
    const [a, b] = selectPlaylistMediaItems(selected);
    expect(a.playlistItem).toBeUndefined();
    expect(b.playlistItem?._id).toBe('pi-for-m2');
  });

  test('playlistItems with no matching mediaItem are dropped (no spine entry)', () => {
    const selected = {
      mediaItems: [makeMediaItem('m1')],
      playlistItems: [
        makePlaylistItem('m1', 'pi-for-m1'),
        // This points at m999, which has no mediaItem — should be invisible.
        makePlaylistItem('m999', 'pi-orphan'),
      ],
    };
    const result = selectPlaylistMediaItems(selected);
    expect(result).toHaveLength(1);
    expect(result[0].playlistItem?._id).toBe('pi-for-m1');
  });

  test('empty selected → empty array', () => {
    expect(selectPlaylistMediaItems({} as any)).toEqual([]);
    expect(selectPlaylistMediaItems(null as any)).toEqual([]);
  });
});

describe('selectMappedPlaylistMediaItems', () => {
  test('playlistItem fields win when present (override semantics)', () => {
    const selected = {
      mediaItems: [
        makeMediaItem('m1', { title: 'media-title', description: 'media-desc' }),
      ],
      playlistItems: [
        makePlaylistItem('m1', 'pi-1', {
          title: 'override-title',
          description: 'override-desc',
        }),
      ],
    };
    const [row] = selectMappedPlaylistMediaItems(selected);
    expect(row.title).toBe('override-title');
    expect(row.description).toBe('override-desc');
    expect(row._id).toBe('pi-1');
    expect(row.playlistItemId).toBe('pi-1');
    expect(row.mediaItemId).toBe('m1');
  });

  test('falls back to mediaItem when no matching playlistItem', () => {
    const selected = {
      mediaItems: [makeMediaItem('m1', { title: 'media-only' })],
      playlistItems: [],
    };
    const [row] = selectMappedPlaylistMediaItems(selected);
    expect(row.title).toBe('media-only');
    expect(row._id).toBe('m1');
    expect(row.playlistItemId).toBeUndefined();
    expect(row.mediaItemId).toBe('m1');
  });

  test('sorts ascending by |sortIndex|; 0/missing fall to the bottom', () => {
    const selected = {
      mediaItems: [
        makeMediaItem('m-a'),
        makeMediaItem('m-b'),
        makeMediaItem('m-c'),
        makeMediaItem('m-d'),
      ],
      playlistItems: [
        // Negative sortIndex should be treated as |value|, so -2 → 2.
        makePlaylistItem('m-a', 'pi-a', { sortIndex: -2 }),
        makePlaylistItem('m-b', 'pi-b', { sortIndex: 5 }),
        // m-c has no playlistItem → sortIndex defaults to 0 → bottom.
        makePlaylistItem('m-d', 'pi-d', { sortIndex: 1 }),
      ],
    };
    const ids = selectMappedPlaylistMediaItems(selected).map((r) => r.mediaItemId);
    expect(ids).toEqual(['m-d', 'm-a', 'm-b', 'm-c']);
  });
});
