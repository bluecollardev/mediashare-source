import { awsUrl } from 'mediashare/core/aws/key-factory';

// Hard-coded fallback in case `awsUrl` is undefined (Constants.expoConfig.extra
// is empty in this repo's app.json). Without it, the default image URL
// resolves to "undefinedassets/no-image.png" and breaks.
const DEFAULT_AWS_URL =
  'https://mediashare0079445c24114369af875159b71aee1c04439-dev.s3.us-west-2.amazonaws.com/public/';
const DEFAULT_IMAGE = (awsUrl || DEFAULT_AWS_URL) + `assets/no-image.png`;

export function usePreviewImage(imageSrc) {
  const isDefaultImage = !imageSrc;
  return { imageSrc: imageSrc || DEFAULT_IMAGE, isDefaultImage };
}
