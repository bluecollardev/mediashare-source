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

// Localhost-on-web uses the `local` environment (talks to API on 3000/3001).
// Everything else defaults to `staging`. EAS Updates' `releaseChannel`
// integration is intentionally not used here — `expo-updates` isn't in the
// wrapper's dependency graph, and webpack errors at module load if it's imported.
const isLocalhostWeb =
  typeof window !== 'undefined' &&
  !!window.location &&
  /^(localhost|127\.0\.0\.1|\[?::1\]?)$/.test(window.location.hostname);
const env: keyof typeof environments = isLocalhostWeb ? 'local' : 'staging';
console.log(`Building using release channel [${env}]: ${JSON.stringify(environments[env])}`);

export default {
  ...commonConfigs,
  ...environments[env],
};
