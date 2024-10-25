<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-img class="app-toolbar-image" :src="logoUrl"></ion-img>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-list-header>
          <ion-label>
            Preferences
          </ion-label>
        </ion-list-header>
        <ion-item button @click="openGeneralNotificationSettings">
          <ion-icon color="primary" name="notifications" slot="start"></ion-icon>
          <ion-label>
            Notification Settings
          </ion-label>
        </ion-item>
        <ion-item button @click="openLocationModal">
          <ion-icon name="set-location" slot="start" color="primary"></ion-icon>
          <ion-label>
            Select My Location
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list>
        <ion-list-header>
          <ion-label>
            More
          </ion-label>
        </ion-list-header>
        <ion-item button @click="openWebsite">
          <ion-icon name="website" color="primary" slot="start"></ion-icon>
          <ion-label>
            Visit Our Website
          </ion-label>
        </ion-item>
        <ion-item button @click="openMyPoints">
          <ion-icon name="rewards" color="primary" slot="start"></ion-icon>
          <ion-label>
            Check My Points
          </ion-label>
        </ion-item>
        <ion-item button @click="openFacebook">
          <ion-icon name=facebook color="primary" slot="start"></ion-icon>
          <ion-label>
            Find Us on Facebook
          </ion-label>
        </ion-item>
      </ion-list>
      <div class="preferences-footer">&copy; {{ new Date().getFullYear() }} {{ storeName }}<br>{{ storeName }} v.{{ appVersion }}</div>
    </ion-content>

    <!-- Location Modal -->
    <SetLocationModal :is-open="isLocationModalOpen" @update:is-open="isLocationModalOpen = $event"
      @location-selected="handleLocationSelected" />
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonIcon, IonImg } from '@ionic/vue';
import { Browser } from '@capacitor/browser';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import SetLocationModal from '@/components/SetLocationModal.vue';
import { Capacitor } from '@capacitor/core';

// Store environment variables in reactive variables
const storeName = import.meta.env.VITE_STORE_NAME; // Store name from .env
const appVersion = import.meta.env.VITE_APP_VERSION; // Store name from .env
const facebookPageID = import.meta.env.VITE_FACEBOOK_PAGE_ID; // Store name from .env
const facebookURL = import.meta.env.VITE_FACEBOOK_URL; // Store name from .env


// Reactive references
const isLocationModalOpen = ref(false);
const currentLocation = ref(null);
const logoUrl = ref(import.meta.env.VITE_PRIMARY_LOGO);

// Lifecycle hooks
onMounted(() => {
  // Load stored location on component mount
  const storedLocation = localStorage.getItem('selectedLocation');
  if (storedLocation) {
    currentLocation.value = JSON.parse(storedLocation);
  }
});

// Open app general notification settings for testing
async function openGeneralNotificationSettings() {
  console.log('Attempting to open settings');
  try {
    if (Capacitor.getPlatform() === 'ios') {
      console.log('Detected iOS platform');
      await NativeSettings.openIOS({
        option: IOSSettings.App
      });
    } else if (Capacitor.getPlatform() === 'android') {
      console.log('Detected Android platform');
      await NativeSettings.openAndroid({
        option: AndroidSettings.ApplicationDetails
      });
    } else {
      console.warn('Settings are not available on this platform.');
    }
    console.log('Settings opened successfully');
  } catch (error) {
    console.error('Failed to open settings:', error);
    // Optionally, show a user-friendly error message
  }
}
// Open website in browser
async function openWebsite() {
  await Browser.open({
    url: import.meta.env.VITE_SITE_URL,
    presentationStyle: 'popover'
  });
}

// Open rewards points checker in browser
async function openMyPoints() {
  await Browser.open({
    url: import.meta.env.VITE_SITE_URL + '/points',
    presentationStyle: 'popover'
  });
}

// Open Facebook page in browser popover
async function openFacebook() {
  const facebookUrl = import.meta.env.VITE_FACEBOOK_URL;  // Facebook URL from .env

  try {
    await Browser.open({
      url: facebookUrl,
      presentationStyle: 'popover'
    });
  } catch (error) {
    console.error('Failed to open Facebook URL:', error);
    // Optionally, you can handle the error here (e.g., show an alert to the user)
  }
}

// Open location modal
function openLocationModal() {
  console.log('Opening location modal');
  isLocationModalOpen.value = true;
}

// Handle location selection
function handleLocationSelected(location) {
  console.log('Location selected:', location);
  localStorage.setItem('selectedLocation', JSON.stringify(location));
  currentLocation.value = location;

  // Emit a custom event to notify other components about the location change
  window.dispatchEvent(new CustomEvent('locationChanged', { detail: location }));
}

</script>

<style scoped>
.preferences-footer {
  text-align: center !important;
  font-size: 14px;
  margin-top: 32px;
  align-content: center;
  color: var(--ion-color-medium);
}

ion-icon {
  color: var(--ion-color-primary) !important;
}
</style>
