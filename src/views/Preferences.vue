<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-img slot="start" class="app-toolbar-image"
          src="https://iprosystems-website-media-files.s3.us-east-2.amazonaws.com/wp-content/uploads/rameysmarketplace/2024/03/primary-logo.svg"></ion-img>
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
      <div class="preferences-footer">&copy; 2024 Ramey's Marketplace<br>Ramey's Marketplace v.6.0</div>
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

// Reactive references
const isLocationModalOpen = ref(false);
const currentLocation = ref(null);

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
    url: 'https://rameysmarketplace.com',
    presentationStyle: 'popover'
  });
}

// Open rewards points checker in browser
async function openMyPoints() {
  await Browser.open({
    url: 'https://rameysmarketplace.com/points',
    presentationStyle: 'popover'
  });
}

// Open Facebook page in browser
async function openFacebook() {
  const facebookUrl = 'fb://page/100064721764871';  // Facebook app URL with your page ID
  const fallbackUrl = 'https://facebook.com/RameysMarketplace/';  // Fallback URL for browser

  // Try to open the Facebook app if installed, else open in browser
  window.open(facebookUrl, '_system');  // Opens in system app if available
  
  setTimeout(async () => {
    // If the app doesn't open, fallback to the browser popover
    await Browser.open({
      url: fallbackUrl,
      presentationStyle: 'popover'
    });
  }, 500);  // Delay to allow app to open, else fall back
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
