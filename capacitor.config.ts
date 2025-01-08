import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iproweb.app',
  appName: 'Market Place',
  webDir: 'dist',
  plugins: { 
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 1500,
      backgroundColor: '#0067B3D9',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    App: {
      enabled: true
    }
  }
};

export default config;
