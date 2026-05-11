import { Platform } from 'react-native';
import { Storage } from 'aws-amplify';
import * as VideoThumbnails from 'expo-video-thumbnails';

import { KeyFactory, KeyFactoryProps, mediaRoot, uploadRoot, videoRoot } from './key-factory';

// Common video and image formats
export const validVideoFormats = ['mp4', 'mov', 'wmv', 'flv', 'avi', 'webm', 'mkv'];
export const validImageFormats = ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp'];

export const videoImageDefaultOptions = {
  quality: 0.6,
  width: 720,
};

export interface StorageOptions {
  title?: string;
  description?: string;
  summary?: string;
  contentType?: string;
  completeCallback?: (event) => void;
  progressCallback?: (progress) => void;
  errorCallback?: (err) => void;
  resumable?: boolean;
}

export interface PutStorageParams {
  file: any;
  key: string;
  options?: StorageOptions;
}

export function getFileExtension(filePath: string) {
  const basename = filePath.split(/[\\/]/).pop();
  const pos = basename.lastIndexOf('.');
  if (basename === '' || pos < 1) {
    // `.` not found (-1) or comes first (0)
    return '';
  }
  return basename.slice(pos + 1);
}

export function getFilenameWithoutExtension(filePath: string) {
  const basename = filePath.split(/[\\/]/).pop();
  const pos = basename.lastIndexOf('.');
  if (basename === '' || pos < 1) {
    // `.` not found (-1) or comes first (0)
    return '';
  }
  return basename.slice(0, pos);
}

export function getFileBasePath(filePath: string) {
  // Split on slashes in the file path
  const pathParts = filePath.split(/[\\/]/);
  // Pop off the last part, that's the fileName
  pathParts.pop();
  // Join the parts with slashes and return
  return pathParts.join('/');
}

export function validateExtension(ext, validFormats) {
  return RegExp('(' + validFormats.join('|') + ')').test(ext);
}

export function titleFromKey(key: string) {
  // TODO: Decode all entities?
  return key.replace(/(\.(mp4|avi|mov))$/, '');
}

/**
 * Generates safe S3 storage keys for each file using a given key (eg. a fileName).
 * S3 object key rules allow for spaces and certain special characters in a key.
 * However, in our case this is not desirable.
 *
 * Scenario:
 * When importing files from a user's 'upload' bucket to the 'videos'
 * we generate a image preview for the source file in the 'thumbnails' bucket and
 * copy the source file to the 'videos' bucket.
 *
 * When a user (likely the admin) uploads a file like 'My Sample Video.mp4'
 * directly to their S3 'uploads' bucket, the S3 object that is created will
 * have an object key ending in the string 'My Sample Video.mp4' corresponding
 * to the exact name of the uploaded file. The S3 object's URI and ARN will
 * also contain the exact name.
 *
 * However, the object URL, which is what we use to access the file over the web,
 * contains '+' characters instead of spaces in the fileName, eg. 'My+Sample+Video.mp4'.
 * Normal URI encoding for the web would expect the spaces to be encoded as %20,
 * but this is not the case, so simply encoding string using encodeURIComponent
 * will not work for various reasons including that the '+' in a URL would be
 * encoded as %2B...
 *
 * As S3 object keys are used in our application for a variety of purposes
 * including generating fileNames, titles, video URLs, and image URLs, it
 * is is critical that we sanitize our object keys before we use them.
 *
 * This simple tool removes non-alphanumeric characters from our S3 keys,
 * replacing them with dashes, ignoring the file extension.
 * @param dirtyKeyString
 */
export function sanitizeKey(dirtyKeyString: string) {
  const ext = getFileExtension(dirtyKeyString);
  if (ext && !validateExtension(ext, [].concat(validVideoFormats, validImageFormats))) {
    throw new Error('Cannot sanitize key: file extension not supported');
  }

  if (ext) {
    const fileName = getFilenameWithoutExtension(dirtyKeyString.toLowerCase());
    const basePath = getFileBasePath(dirtyKeyString);
    return `${basePath}${fileName.replace(/[\W_]+/g, '-')}.${ext}`;
  }

  return dirtyKeyString.replace(/[\W_]+/g, '-');
}

export function sanitizeFolderName(key: string, folder: string) {
  return key.replace(new RegExp(folder), '');
}

export function getFromStorage(key: string) {
  return Storage.get(key);
}

export function downloadFromStorage(key: string): Promise<Object> {
  return Storage.get(key);
}

export function deleteFromStorage(key: string) {
  return Storage.remove(key);
}

export function listStorage(key: string) {
  // @ts-ignore
  return Storage.list(key, { download: true });
}

function copyStorageFactory({ root, uploadRoot, videoRoot }: Pick<KeyFactoryProps, 'root' | 'uploadRoot' | 'videoRoot'>) {
  return async (key: string) => {
    const from = root + uploadRoot + key;
    // We want to eliminate spaces (and possibly other things) from our fileNames
    const to = root + videoRoot + sanitizeKey(key);
    try {
      return await Storage.copy({ key: from }, { key: to });
    } catch (err) {
      console.log(`[copyStorageFactory] Storage.copy from (${from}) to (${to}) failed`);
      console.log(err);
    }
  };
}

export const copyStorage = copyStorageFactory({ root: mediaRoot, uploadRoot, videoRoot });

export async function putToS3({ key, file, options = {} }: PutStorageParams): Promise<any> {
  const { title = '', description = '', summary = '', contentType = 'video/mp4', progressCallback } = options;
  const result = await Storage.put(key, file, {
    contentType,
    metadata: { summary, description },
    contentDisposition: title,
    progressCallback,
  } as StorageOptions);
  console.log('[putToS3] PUT to S3 storage');
  console.log(result);
  return result;
}

export async function fetchMediaFromFileUri(fileUri: string) {
  console.log(`[fetchMedia] fetch ${fileUri}`);
  let response;
  try {
    response = await fetch(fileUri);
  } catch (err) {
    console.log(`[fetchMedia] fetch(${fileUri}) failed`);
  }

  if (response) {
    const blob = await response.blob();
    if (!blob) {
      console.log(`[fetchMedia] no blob in storage.service/${fileUri}`);
    }
    return blob;
  }
}

export async function fetchAndPutToS3({
  fileUri,
  key,
  options
}: {
  fileUri: string;
  key: string;
  options?: StorageOptions
}): Promise<any> {
  try {
    const file = await fetchMediaFromFileUri(fileUri);
    return await putToS3({ key, file, options });
  } catch (err) {
    console.log('[fetchAndPutToS3] fetchAndPutToS3 failed');
    console.log(err);
  }
}

// expo-video-thumbnails has no web implementation, so on web we draw the
// first decoded video frame to a canvas and return a blob URL.
async function getWebVideoThumbnail(
  fileUri: string
): Promise<{ uri: string } | undefined> {
  if (typeof document === 'undefined') return undefined;
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = fileUri;
    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };
    const fail = (err: any) => {
      console.log('[getWebVideoThumbnail] failed', err);
      cleanup();
      resolve(undefined);
    };
    video.addEventListener('loadedmetadata', () => {
      try {
        video.currentTime = Math.min(1, (video.duration || 1) / 2);
      } catch (err) {
        fail(err);
      }
    });
    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 405;
        const ctx = canvas.getContext('2d');
        if (!ctx) return fail(new Error('canvas 2d unavailable'));
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob) return resolve(undefined);
            resolve({ uri: URL.createObjectURL(blob) });
          },
          'image/jpeg',
          videoImageDefaultOptions.quality
        );
      } catch (err) {
        fail(err);
      }
    });
    video.addEventListener('error', () => fail(video.error));
  });
}

async function getVideoImageFromUri(fileUri) {
  if (Platform.OS === 'web') {
    const result = await getWebVideoThumbnail(fileUri);
    if (!result) {
      console.log(
        '[getVideoImageFromUri] web thumbnail generation returned no result'
      );
    }
    return result;
  }
  try {
    return await VideoThumbnails.getThumbnailAsync(
      fileUri,
      videoImageDefaultOptions
    );
  } catch (err) {
    console.log(
      '[getVideoImageFromUri] Error getting image, getImageAsync failed'
    );
    console.log(
      '[getVideoImageFromUri] Make sure the file at [$fileUri] exists'
    );
    console.log(
      '[getVideoImageFromUri] You may need to manually link the expo modules'
    );
    console.log(err);
    return undefined;
  }
}

/**
 * @param fileUri The URI of the video file
 * @param key The ID key
 * @return string URL for uploaded AWS file
 */
export async function uploadImageToS3({ fileUri, key }): Promise<string> {
  const thumbnail = await getVideoImageFromUri(fileUri);
  if (!thumbnail?.uri) {
    // Caller (uploadMediaToS3) treats a falsy image response as "no
    // thumbnail" — the video upload still proceeds and the consumer
    // shows the default placeholder.
    console.log('[uploadImageToS3] skipping — no thumbnail available');
    return undefined;
  }
  const { imageKey } = KeyFactory(key);
  const payload = {
    key: imageKey,
    fileUri: thumbnail.uri,
    options: { contentType: 'image/jpeg' },
  };
  console.log(`[uploadImageToS3] ${JSON.stringify(payload, null, 2)}`);
  const uploadResponse = await fetchAndPutToS3(payload);
  console.log(`[uploadImageToS3] uploadResponse: ${JSON.stringify(uploadResponse, null, 2)}`);
  const storageKey = await getFromStorage(uploadResponse.key);
  console.log(`[uploadImageToS3] storageKey: ${storageKey}`);
  return storageKey;
}

// TODO: The image response returns a string and video response returns an object like { key: my-key }
//  Standardize the returns!
export async function uploadMediaToS3({ fileUri, key, options }: { fileUri: string; key: string; options: StorageOptions }) {
  const imageResponse = await uploadImageToS3({ fileUri, key });
  const videoResponse = await fetchAndPutToS3({ fileUri, key, options });
  return { image: imageResponse, video: videoResponse };
}
