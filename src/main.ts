// Declare cordova on window object for TypeScript
declare global {
  interface Window {
    cordova: any;
  }
}

import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
/* import '@ionic/vue/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

/* Custom icons */
import { registerCustomIcons } from './composables/useCustomIcons';
import { useNotifications } from './composables/useNotifications';

registerCustomIcons(); // Call the registerCustomIcons function earlier

/* One Signal push notification integration  */
import OneSignal from 'onesignal-cordova-plugin'; // Import OneSignal

const app = createApp(App)
  .use(IonicVue)
  .use(router);

// Provide the notification permission function
const { requestNotificationPermission } = useNotifications();
app.provide('requestNotificationPermission', requestNotificationPermission);

router.isReady().then(() => {
  app.mount('#app');
  
  // Only initialize OneSignal in a Cordova environment
  if (window.cordova) {
    // Wait for the device to be ready before initializing OneSignal
    document.addEventListener('deviceready', () => {
      try {
        // Initialize OneSignal with the environment variable
        OneSignal.initialize(import.meta.env.VITE_ONESIGNAL_APP_ID);
      } catch (error) {
      }
    });
  }
});
