import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

const environments = {
  local: {
    EnvName: 'local',
    CookieDomain: 'localhost',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: parseInt(Constants.expoConfig.extra?.apiServer || 0),
    AwsRoot: 'temp/',
    VideoRoot: 'videos/',
    UploadRoot: 'uploads/',
    ImageRoot: 'thumbnails/',
    AwsUrl: Constants.expoConfig.extra?.awsUrl,
    MaxUpload: 104857600,
  },
  development: {
    EnvName: 'development',
    CookieDomain: 'localhost',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: parseInt(Constants.expoConfig.extra?.apiServer || 1),
    AwsRoot: 'temp/',
    VideoRoot: 'videos/',
    UploadRoot: 'uploads/',
    ImageRoot: 'thumbnails/',
    AwsUrl: Constants.expoConfig.extra?.awsUrl,
    MaxUpload: 104857600,
  },
  staging: {
    EnvName: 'staging',
    CookieDomain: 'pocketpt.afehrpt.com',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: parseInt(Constants.expoConfig.extra?.apiServer || 1),
    AwsRoot: 'temp/',
    VideoRoot: 'videos/',
    UploadRoot: 'uploads/',
    ImageRoot: 'thumbnails/',
    AwsUrl: Constants.expoConfig.extra?.awsUrl,
    MaxUpload: 104857600,
  },
  production: {
    EnvName: 'production',
    CookieDomain: 'pocketpt.afehrpt.com',
    IsRunningInExpoGo: Constants.appOwnership === 'expo',
    ApiServer: parseInt(Constants.expoConfig.extra?.apiServer || 2),
    AwsRoot: 'temp/',
    VideoRoot: 'videos/',
    UploadRoot: 'uploads/',
    ImageRoot: 'thumbnails/',
    AwsUrl: Constants.expoConfig.extra?.awsUrl,
    MaxUpload: 104857600,
  }
};

const commonConfigs = {
  googleKey: '189foo-bar',
  facebookAppId: '189foo bar884439',
}

// TODO: Fix / implement releaseChannel
const env = 'development'; // Updates.releaseChannel || 'development';
console.log(`Building using release channel [${env}]: ${JSON.stringify(environments[env])}`);

export default {
  ...commonConfigs,
  ...environments[env],
};
