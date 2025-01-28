<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>

        <ion-buttons slot="start">

          <ion-button @click="$router.push('/notifications')" v-if="notificationsAvailable"
            class="ion-padding-end-small">
            <ion-icon color="danger" name="notifications-regular" size="medium"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">

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
              :color="hasWeeklyAd ? 'primary' : 'medium'">
              <ion-icon slot="start" name="ads-regular"></ion-icon>
              Weekly Ad
            </ion-button>
          </ion-col>
          <ion-col v-if="hasRewards">
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
import { onIonViewDidEnter, onIonViewWillEnter } from '@ionic/vue';

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

// Add a watch for debugging
watch(selectedLocation, (newVal) => {
  console.log('selectedLocation changed:', newVal);
  console.log('weekly_ad_url:', newVal?.weekly_ad_url);
  console.log('rewards_url:', newVal?.rewards_url);
}, { deep: true });

// Update the computed properties
const hasWeeklyAd = computed(() => {
  const weeklyAd = selectedLocation.value?.ads?.find(ad =>
    ad.ad_type.some(type => type.type_name === "Weekly Ad")
  );
  return Boolean(weeklyAd);
});

const hasRewards = computed(() => {
  const rewardsAd = selectedLocation.value?.ads?.find(ad =>
    ad.ad_type.some(type => type.type_name === "Reward")
  );
  return Boolean(rewardsAd);
});

// Add event listener for force refresh
onMounted(async () => {
  await checkSelectedLocation();
  await fetchLocationData();
  await getData();
  window.addEventListener('locationChanged', handleLocationChange);
  window.addEventListener('forceAppRefresh', handleForceRefresh);
  await requestNotificationPermission();
});

onUnmounted(() => {
  // Remove event listeners on component unmount
  window.removeEventListener('locationChanged', handleLocationChange);
  window.removeEventListener('forceAppRefresh', handleForceRefresh);
});

// Add force refresh handler
async function handleForceRefresh() {
  await checkSelectedLocation();
  await fetchLocationData();
  await getData();
}

// Enhance location change handler
async function handleLocationChange(event) {
  if (event.detail?.id) {
    selectedLocation.value = event.detail;
    await fetchLocationData();
    await getData();
  }
}

// Enhance fetchLocationData
async function fetchLocationData() {
  console.log('Fetching location data for ID:', selectedLocation.value?.id);
  if (selectedLocation.value?.id) {
    try {
      const freshLocationData = await apiLocations.getLocationById(selectedLocation.value.id);
      console.log('API Response - Fresh location data:', freshLocationData);
      if (freshLocationData) {
        selectedLocation.value = freshLocationData;
        localStorage.setItem('selectedLocation', JSON.stringify(freshLocationData));
        console.log('Updated selectedLocation:', selectedLocation.value);
      } else {
        console.log('No location data returned from API');
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  } else {
    console.log('No selected location ID available');
  }
}

// Open location modal
function openLocationModal() {
  isLocationModalOpen.value = true;
}

// Handle location selection
async function handleLocationSelected(location) {
  console.log('Location selected:', location);
  selectedLocation.value = location;
  localStorage.setItem('selectedLocation', JSON.stringify(location));
  await fetchLocationData();
  await getData();
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

// PDF Modal handling
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
      const weeklyAd = selectedLocation.value.ads?.find(ad =>
        ad.ad_type.some(type => type.type_name === "Weekly Ad")
      );
      if (weeklyAd) {
        modalData.url = weeklyAd.file_url;
        modalData.type = "Weekly Ad";
        modalData.startDate = weeklyAd.ad_start_date;
      }
      break;
    case 'rewards':
      const rewardsAd = selectedLocation.value.ads?.find(ad =>
        ad.ad_type.some(type => type.type_name === "Reward")
      );
      if (rewardsAd) {
        modalData.url = rewardsAd.file_url;
        modalData.type = "Reward";
        modalData.startDate = rewardsAd.ad_start_date;
      }
      break;
  }

  pdfModalState.value = modalData;
};

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

// Update the click handlers
const handleWeeklyAdClick = () => {
  console.log('Weekly Ad Click - hasWeeklyAd:', hasWeeklyAd.value);
  if (hasWeeklyAd.value) {
    openPdfModal('weekly');
  } else if (selectedLocation.value) {
    // If we have a location but no weekly ad, we can show a message or handle differently
    console.log('No weekly ad available for this location');
  } else {
    openLocationModal();
  }
};

const handleRewardsClick = () => {
  console.log('Rewards Click - hasRewards:', hasRewards.value);
  if (hasRewards.value) {
    openPdfModal('rewards');
  }
};

const handleMyStoreClick = async () => {
  if (selectedLocation.value) {
    router.push(`/locations/${selectedLocation.value.id}`);
  } else {
    await openLocationModal();
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

// Add ionViewWillEnter hook at the top level of the script
onIonViewWillEnter(async () => {
  const storedLocation = localStorage.getItem('selectedLocation');
  if (storedLocation) {
    const parsedLocation = JSON.parse(storedLocation);
    if (parsedLocation?.id !== selectedLocation.value?.id) {
      selectedLocation.value = parsedLocation;
      await fetchLocationData();
      await getData();
    }
  }
});

</script>


<style scoped>
ion-grid {
  --ion-grid-columns: 3 !important;
  --ion-grid-column-padding: 1px;
}
</style>
