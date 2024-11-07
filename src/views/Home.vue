<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-img class="app-toolbar-image" :src="logoUrl"></ion-img>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Removed ion-refresher -->

      <!-- Display promos -->
      <PromosCarousel :promos="promos.map(promo => promo.promo_url)" />

      <!-- Weekly ads, rewards and my store buttons -->
      <ion-grid :fixed="true">
        <ion-row>
          <ion-col>
            <ion-button expand="block" size="small" @click="handleWeeklyAdClick"
              :color="selectedLocation && selectedLocation.weekly_ad_url ? 'primary' : 'medium'">
              <ion-icon slot="start" name="weekly-ad"></ion-icon>
              Weekly Ad
            </ion-button>
          </ion-col>
          <ion-col v-if="selectedLocation && selectedLocation.rewards_url">
            <ion-button expand="block" size="small" @click="handleRewardsClick" color="primary">
              <ion-icon slot="start" name="rewards"></ion-icon>
              Rewards
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" size="small" @click="handleMyStoreClick"
              :color="selectedLocation ? 'primary' : 'medium'">
              <ion-icon slot="start" name="my-store"></ion-icon>
              {{ selectedLocation ? 'My Store' : 'Set My Store' }}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Featured Items Carousel -->
      <FeaturedItemsCarousel :featuredItems="featuredItems" />

      <!-- Featured Recipes Carousel -->
      <RecipeCarousel :recipes="recipes" />

      <!-- Location Modal -->
      <SetLocationModal :is-open="isLocationModalOpen" @update:is-open="isLocationModalOpen = $event"
        @location-selected="handleLocationSelected" />

      <!-- Weekly Ad Modal for Android -->
      <ion-modal :is-open="isWeeklyAdModalOpen" @didDismiss="isWeeklyAdModalOpen = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Weekly Ad</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isWeeklyAdModalOpen = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <iframe :src="wrappedWeeklyAdUrl" width="100%" height="100%" frameborder="0"></iframe>
        </ion-content>
      </ion-modal>

      <!-- Rewards Modal for Android -->
      <ion-modal :is-open="isRewardsModalOpen" @didDismiss="isRewardsModalOpen = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Rewards</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isRewardsModalOpen = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <iframe :src="wrappedRewardsUrl" width="100%" height="100%" frameborder="0"></iframe>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import { Browser } from '@capacitor/browser';
import { SplashScreen } from '@capacitor/splash-screen';
import apiPromos from '../axios/apiPromos.js';
import apiRecipes from '../axios/apiRecipes.js';
import apiFeaturedItems from '../axios/apiFeaturedItems.js';
import apiLocations from '../axios/apiLocations.js'; // Import the API for locations
import PromosCarousel from '@/components/PromosCarousel.vue';
import RecipeCarousel from '@/components/RecipeCarousel.vue';
import FeaturedItemsCarousel from '@/components/FeaturedItemsCarousel.vue';
import SetLocationModal from '@/components/SetLocationModal.vue';
import { IonPage, IonHeader, IonToolbar, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';

// Reactive references
const promos = ref([]);
const recipes = ref([]);
const featuredItems = ref([]);
const selectedLocation = ref(null);
const locationData = ref(null); // Initialize locationData
const isLocationModalOpen = ref(false);
const router = useRouter();
const logoUrl = ref(import.meta.env.VITE_PRIMARY_LOGO);

// New refs for Android modals
const isWeeklyAdModalOpen = ref(false);
const isRewardsModalOpen = ref(false);

// Add a loading state
const isLoading = ref(false);

// Lifecycle hooks
onMounted(async () => {
  await checkSelectedLocation();
  await fetchLocationData(); // Fetch location data on mount
  getData();
  window.addEventListener('locationChanged', handleLocationChange);
  await requestNotificationPermission();
});

onUnmounted(() => {
  // Remove event listener on component unmount
  window.removeEventListener('locationChanged', handleLocationChange);
});

// Watch for changes in selected location
watch(selectedLocation, async (newLocation) => {
  if (newLocation) {
    isLoading.value = true; // Set loading state
    await fetchLocationData(); // Fetch latest location data
    isLoading.value = false; // Reset loading state
  }
});

// Handle location change event
function handleLocationChange(event) {
  selectedLocation.value = event.detail;
  getData(); // Refresh data with the new location
}

// Check for selected location in localStorage
async function checkSelectedLocation() {
  const storedLocation = localStorage.getItem('selectedLocation');
  if (storedLocation) {
    selectedLocation.value = JSON.parse(storedLocation);
  }
}

// Fetch location data
async function fetchLocationData() {
  if (selectedLocation.value) {
    try {
      const locations = await apiLocations.getLocations();
      locationData.value = locations.find(loc => loc.id === selectedLocation.value.id);
      // Update selectedLocation with the latest data
      if (locationData.value) {
        selectedLocation.value = { ...selectedLocation.value, ...locationData.value };
        localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation.value));
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  }
}

// Open location modal
function openLocationModal() {
  isLocationModalOpen.value = true;
}

// Handle location selection
function handleLocationSelected(location) {
  selectedLocation.value = location;
  localStorage.setItem('selectedLocation', JSON.stringify(location));
  getData();
}

// Fetch data from APIs
async function getData() {
  promos.value = [];
  recipes.value = [];
  featuredItems.value = [];

  try {
    const [promosResponse, recipesResponse, featuredItemsResponse] = await Promise.all([
      apiPromos.getPromos(),
      apiRecipes.getRecipes(),
      apiFeaturedItems.getFeaturedItems()
    ]);

    promos.value = promosResponse;
    recipes.value = Array.isArray(recipesResponse) ? recipesResponse : [];
    featuredItems.value = Array.isArray(featuredItemsResponse) ? featuredItemsResponse : [];
  } catch (err) {
    console.error('[Home] Error fetching data:', err);
  }
}

// Open the Weekly Ad
async function handleWeeklyAdClick() {
  if (locationData.value && locationData.value.weekly_ad_url) {
    if (Capacitor.getPlatform() === 'android') {
      isWeeklyAdModalOpen.value = true;
    } else {
      await Browser.open({
        url: locationData.value.weekly_ad_url,
        presentationStyle: 'popover'
      });
    }
  } else {
    await openLocationModal();
  }
}

// Open the Rewards URL
async function handleRewardsClick() {
  if (locationData.value && locationData.value.rewards_url) {
    if (Capacitor.getPlatform() === 'android') {
      isRewardsModalOpen.value = true;
    } else {
      await Browser.open({
        url: locationData.value.rewards_url,
        presentationStyle: 'popover'
      });
    }
  } else {
    await openLocationModal();
  }
}

// Open my store location
async function handleMyStoreClick() {
  if (selectedLocation.value) {
    // Navigate to the LocationSingle page using the location's ID
    router.push({ name: 'LocationDetails', params: { id: selectedLocation.value.id } });
  } else {
    await openLocationModal();
  }
}

// New computed properties for Android modals
const wrappedWeeklyAdUrl = computed(() => {
  if (locationData.value && locationData.value.weekly_ad_url) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(locationData.value.weekly_ad_url)}`;
  }
  return '';
});

const wrappedRewardsUrl = computed(() => {
  if (locationData.value && locationData.value.rewards_url) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(locationData.value.rewards_url)}`;
  }
  return '';
});

async function requestNotificationPermission() {
  if (Capacitor.getPlatform() === 'web') {
    console.log('Push notifications are not available on web');
    return;
  }

  try {
    // Check if permission is already granted
    const permissionStatus = await PushNotifications.checkPermissions();
    
    if (permissionStatus.receive === 'granted') {
      console.log('Permission is already granted');
      await registerNotifications();
    } else {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive === 'granted') {
        console.log('Permission granted');
        await registerNotifications();
      } else {
        console.log('Permission denied');
      }
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
}

async function registerNotifications() {
  try {
    await PushNotifications.register();
    console.log('Push notification register success');

    // Add listeners after successful registration
    addNotificationListeners();
  } catch (error) {
    console.error('Error registering for push notifications', error);
  }
}

function addNotificationListeners() {
  // Show push notifications when app is in foreground
  PushNotifications.addListener('pushNotificationReceived',
    (notification) => {
      console.log('Push notification received: ', notification);
      // You can add custom logic here to handle the notification
    }
  );

  // Method called when tapping on a notification
  PushNotifications.addListener('pushNotificationActionPerformed',
    (notification) => {
      console.log('Push notification action performed', notification);
      // You can add custom logic here to handle the action
    }
  );
}

</script>

<style scoped>
ion-grid {
  --ion-grid-columns: 3 !important;
  --ion-grid-column-padding: 1px;
}
</style>
