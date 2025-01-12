<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-img class="app-toolbar-image" :src="logoUrl"></ion-img>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="loyalty-card" v-if="loyaltyNumber">
        <div class="loyalty-label">My Loyalty Number</div>
        <div class="loyalty-number">{{ formatPhone(loyaltyNumber) }}</div>
      </div>

      <ion-list>
        <ion-list-header>
          <ion-label>
            Preferences
          </ion-label>
        </ion-list-header>
        <ion-item button @click="openGeneralNotificationSettings">
          <ion-icon color="primary" name="notifications-settings-regular" slot="start"></ion-icon>
          <ion-label>
            Notification Settings
          </ion-label>
        </ion-item>
        <ion-item button @click="openLocationModal">
          <ion-icon name="my-location-regular" slot="start" color="primary"></ion-icon>
          <ion-label>
            Select My Location
          </ion-label>
        </ion-item>
        <ion-item button @click="$router.push('/notifications')">
          <ion-icon name="my-notifications-regular" slot="start" color="primary"></ion-icon>
          <ion-label>
            My Notifications
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
          <ion-icon name="website-regular" color="primary" slot="start"></ion-icon>
          <ion-label>
            Visit Our Website
          </ion-label>
        </ion-item>
        <ion-item button @click="openMyPoints">
          <ion-icon name="rewards-regular" color="primary" slot="start"></ion-icon>
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
      <div class="preferences-footer">
        &copy; {{ new Date().getFullYear() }} {{ storeName }}<br>
        <span @click="handleVersionClick">{{ storeName }} v.{{ appVersion }}</span>
      </div>
    </ion-content>

    <!-- Location Modal -->
    <SetLocationModal :is-open="isLocationModalOpen" @update:is-open="isLocationModalOpen = $event"
      @location-selected="handleLocationSelected" />
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonIcon, IonImg } from '@ionic/vue';
import { Browser } from '@capacitor/browser';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import SetLocationModal from '@/components/SetLocationModal.vue';
import { Capacitor } from '@capacitor/core';
import { useSignupModal } from '@/composables/useSignupModal';

// Store environment variables in reactive variables
const storeName = import.meta.env.VITE_STORE_NAME; // Store name from .env
const appVersion = import.meta.env.VITE_APP_VERSION; // Store name from .env
const facebookPageID = import.meta.env.VITE_FACEBOOK_PAGE_ID; // Store name from .env
const facebookURL = import.meta.env.VITE_FACEBOOK_URL; // Store name from .env


// Reactive references
const isLocationModalOpen = ref(false);
const currentLocation = ref(null);
const logoUrl = ref(import.meta.env.VITE_PRIMARY_LOGO);
const clickCount = ref(0);
const clickTimer = ref(null);
const { getLoyaltyNumber } = useSignupModal();
const loyaltyNumber = ref('');

// Lifecycle hooks
onMounted(() => {
  // Load stored location on component mount
  const storedLocation = localStorage.getItem('selectedLocation');
  if (storedLocation) {
    currentLocation.value = JSON.parse(storedLocation);
  }
  
  // Set initial loyalty number
  loyaltyNumber.value = getLoyaltyNumber();
  
  // Listen for signup event
  window.addEventListener('userSignedUp', (event) => {
    loyaltyNumber.value = event.detail.loyaltyNumber;
  });
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

// Add the handler function
const handleVersionClick = () => {
  clickCount.value++;
  
  // Clear existing timer if it exists
  if (clickTimer.value) {
    clearTimeout(clickTimer.value);
  }

  // Set new timer to reset clicks after 2 seconds
  clickTimer.value = setTimeout(() => {
    clickCount.value = 0;
  }, 2000);

  // Only proceed if we've reached 5 clicks
  if (clickCount.value === 5) {
    try {
      // Reset click count
      clickCount.value = 0;
      
      // Clear the timer
      clearTimeout(clickTimer.value);

      // 1. Log what's in storage before clearing
      console.log('Before clearing:', { ...localStorage });

      // 2. Clear everything in localStorage
      window.localStorage.clear();

      // 3. Double check specific items are removed
      window.localStorage.removeItem('selectedLocation');
      window.localStorage.removeItem('currentLocation');
      window.localStorage.removeItem('refresh_token');

      // 4. Reset the reactive ref
      currentLocation.value = null;

      // 5. Log storage after clearing
      console.log('After clearing:', { ...localStorage });

      // 6. Force a complete page reload
      window.location.href = '/';

    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};

// Add cleanup
onUnmounted(() => {
  if (clickTimer.value) {
    clearTimeout(clickTimer.value);
  }
  // Remove event listener
  window.removeEventListener('userSignedUp', (event) => {
    loyaltyNumber.value = event.detail.loyaltyNumber;
  });
});

const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
};

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

.loyalty-card {
  background: var(--ion-color-light);
  margin-top: 16px;
  margin-right: 16px;
  margin-left: 16px;
  padding: 16px;
  border-radius: 12px;
  border-style: solid;
  border-width: 1px;
  border-color: var(--ion-color-light-shade);
  /* box-shadow: 0 2px 4px rgba(0,0,0,0.1); */
}

.loyalty-label {
  color: var(--ion-color-medium);
  font-size: 14px;
  margin-bottom: 4px;
}

.loyalty-number {
  color: var(--ion-color-dark);
  font-size: 18px;
  font-weight: 600;
}
</style>
