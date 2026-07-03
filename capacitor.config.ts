import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor — native iOS/Android shells around the same web build.
 *
 *   npm run build && npx cap sync     # copy dist/ into the native projects
 *   npx cap open android              # open in Android Studio
 *   npx cap open ios                  # open in Xcode (macOS)
 */
const config: CapacitorConfig = {
  appId: 'com.adaline.beingcamp',
  appName: 'BeingCamp',
  webDir: 'dist',
  backgroundColor: '#0b0b0c',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#0b0b0c',
  },
  android: {
    backgroundColor: '#0b0b0c',
  },
};

export default config;
