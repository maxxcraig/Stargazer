import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Stargazer',
  slug: 'stargazer-ar',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#000014'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription: 'This app uses the camera to overlay star information on the night sky.',
      NSLocationWhenInUseUsageDescription: 'This app uses your location to accurately position stars and constellations.',
      NSMotionUsageDescription: 'This app uses device motion sensors to track your viewing direction.'
    },
    bundleIdentifier: 'com.stargazer.ar'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000014'
    },
    permissions: [
      'CAMERA',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'RECORD_AUDIO'
    ],
    package: 'com.stargazer.ar'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-camera',
    'expo-location',
    [
      'expo-sensors',
      {
        motionPermission: 'Allow Stargazer to access device motion sensors to track your viewing direction.'
      }
    ]
  ],
  extra: {
    apiTimeout: process.env.API_TIMEOUT || 10000,
    debugMode: process.env.DEBUG_MODE === 'true',
    starCatalogVersion: process.env.STAR_CATALOG_VERSION || '1.0.0',
    maxVisibleStars: parseInt(process.env.MAX_VISIBLE_STARS || '2000'),
    eas: {
      projectId: 'your-eas-project-id'
    }
  }
});