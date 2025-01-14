<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="end">

          <ion-button @click="$router.push('/notifications')" v-if="notificationsAvailable" class="ion-padding-end-small">
            <ion-icon color="danger" name="notifications-regular" size="medium"></ion-icon>
          </ion-button>

          <ion-button @click="presentBarcodeModal" v-if="loyaltyNumber">
            <ion-icon color="primary" name="my-barcode-regular" size="medium"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title><ion-img class="app-toolbar-image" :src="logoUrl"></ion-img></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Removed ion-refresher -->

      <!-- Display Sliders -->
      <sliderCarousel :sliders="sliderImages" />

      <!-- Weekly ads, rewards and my store buttons -->
      <ion-grid :fixed="true">
        <ion-row>
          <ion-col>
            <ion-button expand="block" size="small" @click="handleWeeklyAdClick"
              :color="selectedLocation && selectedLocation.weekly_ad_url ? 'primary' : 'medium'">
              <ion-icon slot="start" name="ads-regular"></ion-icon>
              Weekly Ad
            </ion-button>
          </ion-col>
          <ion-col v-if="selectedLocation && selectedLocation.rewards_url">
            <ion-button expand="block" size="small" @click="handleRewardsClick" color="primary">
              <ion-icon slot="start" name="rewards-regular"></ion-icon>
              Rewards
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" size="small" @click="handleMyStoreClick"
              :color="selectedLocation ? 'primary' : 'medium'">
              <ion-icon slot="start" name="set-location-regular"></ion-icon>
              {{ selectedLocation ? 'My Store' : 'Set My Store' }}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Spotlights Carousel -->
      <SpotlightsCarousel :spotlights="spotlights" />
      <!-- Featured Coupons Carousel -->
      <CouponsCarousel :coupons="coupons" />

      <!-- Featured Recipes Carousel -->
      <RecipeCarousel :recipes="recipes" />

      <!-- Location Modal -->
      <SetLocationModal :is-open="isLocationModalOpen" @update:is-open="isLocationModalOpen = $event"
        @location-selected="handleLocationSelected" />

      <!-- Pdf Viewer Modal -->
      <PdfViewerModal :is-open="pdfModalState.isOpen" :pdf-url="pdfModalState.url" :ad-type="pdfModalState.type"
        :start-date="pdfModalState.startDate" @update:is-open="closePdfModal" />
      <BarcodeModal :isOpen="showBarcodeModal" @update:isOpen="showBarcodeModal = $event" />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed, inject } from 'vue';
import apiSliders from '../axios/apiSliders.js';
import { useSliderDetails } from '@/composables/useSliderDetails';
import sliderCarousel from '@/components/sliderCarousel.vue';
import apiRecipes from '../axios/apiRecipes.js';
import apiSpotlights from '../axios/apiSpotlights.js';
import apiLocations from '../axios/apiLocations.js'; // Import the API for locations
import RecipeCarousel from '@/components/RecipeCarousel.vue';
import SpotlightsCarousel from '@/components/SpotlightsCarousel.vue';
import SetLocationModal from '@/components/SetLocationModal.vue';
import PdfViewerModal from '@/components/PdfViewerModal.vue';
import CouponsCarousel from '@/components/CouponsCarousel.vue';
import { IonPage, IonHeader, IonToolbar, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { popoverController } from '@ionic/vue';
import { useSignupModal } from '@/composables/useSignupModal';
import BarcodeModal from '@/components/BarcodeModal.vue';
import apiNotifications from '../axios/apiNotifications.js'; // Import your API for notifactions
import { onIonViewDidEnter } from '@ionic/vue';

const showBarcodeModal = ref(false);

const presentBarcodeModal = () => {
  showBarcodeModal.value = true;
};

// Initialize all refs at the top
const sliders = ref([]);
const recipes = ref([]);
const spotlights = ref([]);
const selectedLocation = ref(null);
const locations = ref([]);
const loading = ref(true);
const logoUrl = ref(import.meta.env.VITE_PRIMARY_LOGO);
const { transformAllSliders } = useSliderDetails();
const { getLoyaltyNumber } = useSignupModal();
const loyaltyNumber = ref('');
const notificationsAvailable = ref(false);

// Add a loading state
const isLoading = ref(false);

// Add pdfModalState ref
const pdfModalState = ref({
  isOpen: false,
  url: '',
  type: '',
  startDate: ''
});

const requestNotificationPermission = inject('requestNotificationPermission');

// Add this with other refs at the top
const isLocationModalOpen = ref(false);

// Add router to imports if not already present
const router = useRouter();

// Add these to your existing setup
const { getCardNumber } = useSignupModal();

// Lifecycle hooks
onMounted(async () => {
  await checkSelectedLocation();
  await fetchLocationData(); // Fetch location data on mount
  await getData();
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
      const response = await apiLocations.getLocations();
      locations.value = response;
      const updatedLocation = locations.value.find(loc => loc.id === selectedLocation.value.id);
      // Update selectedLocation with the latest data
      if (updatedLocation) {
        selectedLocation.value = { ...selectedLocation.value, ...updatedLocation };
        localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation.value));
      }
    } catch (error) {
      // Handle error silently
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
  sliders.value = [];
  recipes.value = [];
  spotlights.value = [];

  try {
    const [slidersResponse, recipesResponse, spotlightsResponse] = await Promise.all([
      apiSliders.getSliders(),
      apiRecipes.getRecipes(),
      apiSpotlights.getSpotlights()
    ]);

    sliders.value = slidersResponse;
    recipes.value = Array.isArray(recipesResponse) ? recipesResponse : [];
    spotlights.value = Array.isArray(spotlightsResponse) ? spotlightsResponse : [];
  } catch (err) {
    // Handle error silently
  }
}

// Update handleWeeklyAdClick function
const handleWeeklyAdClick = () => {
  if (selectedLocation.value?.weekly_ad_url) {
    openPdfModal('weekly');
  } else {
    openLocationModal();
  }
};

// Update handleRewardsClick function
const handleRewardsClick = () => {
  if (selectedLocation.value?.rewards_url) {
    openPdfModal('rewards');
  } else {
    openLocationModal();
  }
};

// Open my store location
async function handleMyStoreClick() {
  if (selectedLocation.value) {
    // Close any open modals first
    pdfModalState.value = {
      isOpen: false,
      url: '',
      type: '',
      startDate: ''
    };
    // Then navigate
    router.push(`/locations/${selectedLocation.value.id}`);
  } else {
    await openLocationModal();
  }
}

// Add openPdfModal function
const openPdfModal = (type) => {
  if (!selectedLocation.value) return;

  let modalData = {
    isOpen: true,
    url: '',
    type: '',
    startDate: ''
  };

  switch (type) {
    case 'weekly':
      modalData.url = selectedLocation.value.weekly_ad_url;
      modalData.type = 'Weekly Ad';
      modalData.startDate = selectedLocation.value.weekly_ad_start_date;
      break;
    case 'rewards':
      modalData.url = selectedLocation.value.rewards_url;
      modalData.type = 'Rewards';
      modalData.startDate = selectedLocation.value.rewards_start_date;
      break;
  }

  pdfModalState.value = modalData;
};

// Add closePdfModal function
const closePdfModal = (isOpen) => {
  if (!isOpen) {
    pdfModalState.value = {
      isOpen: false,
      url: '',
      type: '',
      startDate: ''
    };
  }
};

// In your computed property or where you're mapping sliders
const sliderImages = computed(() => {
  return Array.isArray(sliders.value) ? sliders.value.map(slider => slider.imageUrl) : [];
});

// Update your location finding function
const findSelectedLocation = computed(() => {
  if (!selectedLocation.value || !Array.isArray(locations.value)) {
    return null;
  }
  return locations.value.find(loc => loc.id === selectedLocation.value.id) || null;
});

// Use it in your component
const handleNotificationRequest = async () => {
  if (requestNotificationPermission) {
    await requestNotificationPermission();
  }
};

// Set initial loyalty number
loyaltyNumber.value = getLoyaltyNumber();

// Listen for signup event
window.addEventListener('userSignedUp', (event) => {
  loyaltyNumber.value = event.detail.loyaltyNumber;
});

// Fetch notifications
const fetchNotifications = async () => {
  try {
    const response = await apiNotifications.getNotifications();
    notificationsAvailable.value = response.data.length > 0;  // Ensure `.data` is used here
  } catch (error) {
    notificationsAvailable.value = false;
    console.error('Error fetching notifications:', error);
  }
};

// Fetch notifications on component mount
onIonViewDidEnter(fetchNotifications);

</script>


<style scoped>
ion-grid {
  --ion-grid-columns: 3 !important;
  --ion-grid-column-padding: 1px;
}
</style>
