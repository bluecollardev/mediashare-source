import Constants from 'expo-constants';

// Alternative using react-native-config https://medium.com/armenotech/configure-environment-variables-with-react-native-config-for-ios-and-android-7079c0842d8b
const environments = {
  local: {
    EnvName: process.env.EXPO_PUBLIC_ENV || 'EnvName',
    CookieDomain: process.env.EXPO_PUBLIC_COOKIE_DOMAIN || 'localhost',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: process.env.EXPO_PUBLIC_API_SERVER || 0,
    AwsRoot: process.env.EXPO_PUBLIC_AWS_ROOT || 'temp/',
    VideoRoot: process.env.EXPO_PUBLIC_VIDEO_ROOT || 'videos/',
    UploadRoot: process.env.EXPO_PUBLIC_UPLOAD_ROOT || 'uploads/',
    ImageRoot: process.env.EXPO_PUBLIC_IMAGE_ROOT || 'thumbnails/',
    AwsUrl: process.env.EXPO_PUBLIC_AWS_URL || 'https://mediashare0079445c24114369af875159b71aee1c04439-dev.s3.us-west-2.amazonaws.com/public/',
    MaxUpload: process.env.EXPO_PUBLIC_AWS_URL || 104857600,
  },
  development: {
    EnvName: process.env.EXPO_PUBLIC_ENV || 'development',
    CookieDomain: process.env.EXPO_PUBLIC_COOKIE_DOMAIN || 'localhost',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: process.env.EXPO_PUBLIC_API_SERVER || 1,
    AwsRoot: process.env.EXPO_PUBLIC_AWS_ROOT || 'temp/',
    VideoRoot: process.env.EXPO_PUBLIC_VIDEO_ROOT || 'videos/',
    UploadRoot: process.env.EXPO_PUBLIC_UPLOAD_ROOT || 'uploads/',
    ImageRoot: process.env.EXPO_PUBLIC_IMAGE_ROOT || 'thumbnails/',
    AwsUrl: process.env.EXPO_PUBLIC_AWS_URL || 'https://mediashare0079445c24114369af875159b71aee1c04439-dev.s3.us-west-2.amazonaws.com/public/',
    MaxUpload: process.env.EXPO_PUBLIC_AWS_URL || 104857600,
  },
  staging: {
    EnvName: process.env.EXPO_PUBLIC_ENV || 'staging',
    CookieDomain: process.env.EXPO_PUBLIC_COOKIE_DOMAIN || 'pocketpt.afehrpt.com',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: process.env.EXPO_PUBLIC_API_SERVER || 1,
    AwsRoot: process.env.EXPO_PUBLIC_AWS_ROOT || 'temp/',
    VideoRoot: process.env.EXPO_PUBLIC_VIDEO_ROOT || 'videos/',
    UploadRoot: process.env.EXPO_PUBLIC_UPLOAD_ROOT || 'uploads/',
    ImageRoot: process.env.EXPO_PUBLIC_IMAGE_ROOT || 'thumbnails/',
    AwsUrl: process.env.EXPO_PUBLIC_AWS_URL || 'https://mediashare0079445c24114369af875159b71aee1c04439-dev.s3.us-west-2.amazonaws.com/public/',
    MaxUpload: process.env.EXPO_PUBLIC_AWS_URL || 104857600,
  },
  production: {
    EnvName: process.env.EXPO_PUBLIC_ENV || 'production',
    CookieDomain: process.env.EXPO_PUBLIC_COOKIE_DOMAIN || 'pocketpt.afehrpt.com',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: process.env.EXPO_PUBLIC_API_SERVER || 2,
    AwsRoot: process.env.EXPO_PUBLIC_AWS_ROOT || 'temp/',
    VideoRoot: process.env.EXPO_PUBLIC_VIDEO_ROOT || 'videos/',
    UploadRoot: process.env.EXPO_PUBLIC_UPLOAD_ROOT || 'uploads/',
    ImageRoot: process.env.EXPO_PUBLIC_IMAGE_ROOT || 'thumbnails/',
    AwsUrl: process.env.EXPO_PUBLIC_AWS_URL || 'https://mediashare0079445c24114369af875159b71aee1c04439-dev.s3.us-west-2.amazonaws.com/public/',
    MaxUpload: process.env.EXPO_PUBLIC_AWS_URL || 104857600,
  }
};

const commonConfigs = {
  googleKey: '189foo-bar',
  facebookAppId: '189foo bar884439',
};

// TODO: Fix / implement releaseChannel for iOS? Expo env vars aren't working for web...
// const env = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
const env = process.env.NODE_ENV === 'development' ? 'local' : 'production';
console.info(`Environment vars`, process.env);
console.log(`Building using release channel [${env}]: ${JSON.stringify(environments[env])}`);

export default {
  ...commonConfigs,
  ...environments[env],
};
