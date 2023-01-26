import Config from 'mediashare/config';

const mediaRoot = Config.AwsRoot;

const videoRoot = Config.VideoRoot;
const imageRoot = Config.ImageRoot;
const uploadRoot = Config.UploadRoot;
const awsUrl = Config.AwsUrl;

export interface KeyFactoryProps {
  root: string;
  imageRoot: string;
  videoRoot: string;
  uploadRoot: string;
}

// eslint-disable-next-line no-shadow
function createKeyFactory({ root, imageRoot, videoRoot, uploadRoot }: KeyFactoryProps) {
  return function (sanitizedKey: string) {
    const makeKey = <K extends string>(pathTo: K) => `${root}${pathTo}${sanitizedKey}`;

    const videoKey = makeKey(videoRoot);
    const imageKey = makeKey(imageRoot) + '.jpeg';
    const uploadKey = makeKey(uploadRoot);

    return {
      videoKey,
      imageKey,
      uploadKey,
    };
  };
}

export const KeyFactory = createKeyFactory({ root: mediaRoot, videoRoot, imageRoot, uploadRoot });

export { mediaRoot, videoRoot, imageRoot, uploadRoot, awsUrl };

export const getVideoPath = (key = '') => mediaRoot + videoRoot + key;
export const getImagePath = (key = '') => mediaRoot + imageRoot + key;
export const getUploadPath = (key = '') => mediaRoot + uploadRoot + key;
