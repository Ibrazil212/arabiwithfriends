import type { CapacitorConfig } from '@capacitor/cli';

// appId must be unique in the Google Play and the App Store and cannot change after publishing.
// Change it here before the first release if you prefer another identifier.
const config: CapacitorConfig = {
  appId: 'com.ibrahim.arabicwithfriends',
  appName: 'Arabic With Friends',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0f172a',
  },
  android: {
    backgroundColor: '#0f172a',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
