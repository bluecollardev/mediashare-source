import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

const environments = {
  default: {
    EnvName: 'development',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: parseInt(Constants.expoConfig.extra?.apiServer || 0),
    AwsRoot: 'temp/',
    VideoRoot: 'videos/',
    UploadRoot: 'uploads/',
    ThumbnailRoot: 'thumbnails/',
    AwsUrl: Constants.expoConfig.extra?.awsUrl,
    MaxUpload: 104857600,
  },
  staging: {
    EnvName: 'staging',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: parseInt(Constants.expoConfig.extra?.apiServer || 1),
    AwsRoot: 'temp/',
    VideoRoot: 'videos/',
    UploadRoot: 'uploads/',
    ThumbnailRoot: 'thumbnails/',
    AwsUrl: Constants.expoConfig.extra?.awsUrl,
    MaxUpload: 104857600,
  },
  production: {
    EnvName: 'production',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: parseInt(Constants.expoConfig.extra?.apiServer || 1),
    AwsRoot: 'temp/',
    VideoRoot: 'videos/',
    UploadRoot: 'uploads/',
    ThumbnailRoot: 'thumbnails/',
    AwsUrl: Constants.expoConfig.extra?.awsUrl,
    MaxUpload: 104857600,
  }
};

const commonConfigs = {
  googleKey: '189foo-bar',
  facebookAppId: '189foo bar884439',
}

const env = Updates.releaseChannel || 'production';
console.log(`Building using release channel [${env}]: ${JSON.stringify(environments[env])}`);

export default {
  ...commonConfigs,
  ...environments[env],
};
