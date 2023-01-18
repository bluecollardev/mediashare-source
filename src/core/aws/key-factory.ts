import Config from 'mediashare/config';

const mediaRoot = Config.AwsRoot;

const videoRoot = Config.VideoRoot;
const thumbnailRoot = Config.ThumbnailRoot;
const uploadRoot = Config.UploadRoot;
const awsUrl = Config.AwsUrl;

export interface KeyFactoryProps {
  root: string;
  thumbnailRoot: string;
  videoRoot: string;
  uploadRoot: string;
}

// eslint-disable-next-line no-shadow
function createKeyFactory({ root, thumbnailRoot, videoRoot, uploadRoot }: KeyFactoryProps) {
  return function (sanitizedKey: string) {
    const makeKey = <K extends string>(pathTo: K) => `${root}${pathTo}${sanitizedKey}`;

    const videoKey = makeKey(videoRoot);
    const thumbnailKey = makeKey(thumbnailRoot) + '.jpeg';
    const uploadKey = makeKey(uploadRoot);

    return {
      videoKey,
      thumbnailKey,
      uploadKey,
    };
  };
}

export const KeyFactory = createKeyFactory({ root: mediaRoot, videoRoot, thumbnailRoot, uploadRoot });

export { mediaRoot, videoRoot, thumbnailRoot, uploadRoot, awsUrl };

export const getVideoPath = (key = '') => mediaRoot + videoRoot + key;
export const getThumbnailPath = (key = '') => mediaRoot + thumbnailRoot + key;
export const getUploadPath = (key = '') => mediaRoot + uploadRoot + key;
