<template>
  <ion-modal :is-open="isOpen" @didDismiss="hasMidaxCoupons ? null : closeModal" :swipe-to-close="!hasMidaxCoupons" :backdropDismiss="!hasMidaxCoupons">
    <ion-header>
      <ion-toolbar>
        <ion-title>Select My Store</ion-title>
        <ion-buttons slot="end" v-if="!hasMidaxCoupons">
          <ion-button @click="closeModal">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item v-for="location in locations" :key="location.id">
          <ion-icon name="location-dot" color="primary" slot="start"></ion-icon>
          <ion-label>
            <h2>{{ location.title }}</h2>
            <p class="app-text-overflow">{{ location.address?.address }}</p>
          </ion-label>
          <ion-toggle slot="end" :checked="isLocationSelected(location)"
            @ionChange="() => toggleLocation(location)"></ion-toggle>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle, IonButtons, IonButton } from '@ionic/vue';
import apiLocations from '../axios/apiLocations';

const hasMidaxCoupons = import.meta.env.VITE_HAS_MIDAX_COUPONS === 'true';
const props = defineProps({
  isOpen: Boolean,
  currentLocation: Object
});

const emit = defineEmits(['update:is-open', 'location-selected']);

const locations = ref([]);
const selectedLocation = ref(null);

// Initialize on mount
onMounted(async () => {
  await fetchLocations();
  await initializeSelectedLocation();
  
  if (hasMidaxCoupons && !localStorage.getItem('selectedLocation')) {
    emit('update:is-open', true);
  }
});

// Watch for modal opening
watch(() => props.isOpen, async (newIsOpen) => {
  if (newIsOpen) {
    await fetchLocations();
    await initializeSelectedLocation();
  }
});

// Watch for current location changes
watch(() => props.currentLocation, async (newLocation) => {
  if (newLocation) {
    selectedLocation.value = newLocation;
  } else {
    await initializeSelectedLocation();
  }
}, { deep: true });

async function initializeSelectedLocation() {
  // First check props
  if (props.currentLocation) {
    selectedLocation.value = props.currentLocation;
  } else {
    // Then check localStorage
    const storedLocation = localStorage.getItem('selectedLocation');
    if (storedLocation) {
      const parsedLocation = JSON.parse(storedLocation);
      // Verify the location still exists in our list
      const locationExists = locations.value.some(loc => loc.id === parsedLocation.id);
      if (locationExists) {
        selectedLocation.value = parsedLocation;
      }
    }
  }
}

async function fetchLocations() {
  try {
    const response = await apiLocations.getLocations();
    locations.value = response;
  } catch (error) {
    locations.value = [];
  }
}

function isLocationSelected(location) {
  return selectedLocation.value?.id === location.id;
}

async function toggleLocation(location) {
  if (!location) return;
  
  try {
    // Get fresh location data before storing
    const freshLocation = await apiLocations.getLocationById(location.id);
    if (freshLocation) {
      // Update both the selected location and localStorage with fresh data
      selectedLocation.value = freshLocation;
      localStorage.setItem('selectedLocation', JSON.stringify(freshLocation));
      // Store the store ID for coupons
      localStorage.setItem('storeId', freshLocation.coupon_id || null);
      
      // Emit events with fresh location data
      emit('location-selected', freshLocation);
      window.dispatchEvent(new CustomEvent('locationChanged', {
        detail: freshLocation
      }));
    } else {
      // Fallback to original location if fresh data fetch fails
      selectedLocation.value = location;
      localStorage.setItem('selectedLocation', JSON.stringify(location));
      localStorage.setItem('storeId', location.coupon_id || null);
      emit('location-selected', location);
      window.dispatchEvent(new CustomEvent('locationChanged', {
        detail: location
      }));
    }
  } catch (error) {
    // Fallback to original location if API call fails
    selectedLocation.value = location;
    localStorage.setItem('selectedLocation', JSON.stringify(location));
    localStorage.setItem('storeId', location.coupon_id || null);
    emit('location-selected', location);
    window.dispatchEvent(new CustomEvent('locationChanged', {
      detail: location
    }));
  }
  
  // Small delay to ensure events are processed before closing
  setTimeout(() => {
    closeModal();
  }, 100);
}

function closeModal() {
  // Only prevent closing if Midax coupons is enabled AND no location is selected
  if (hasMidaxCoupons && !localStorage.getItem('selectedLocation')) return;
  
  // Ensure one final check of selected location before closing
  const storedLocation = localStorage.getItem('selectedLocation');
  if (storedLocation) {
    const parsedLocation = JSON.parse(storedLocation);
    selectedLocation.value = parsedLocation;
    // Ensure storeId is set
    localStorage.setItem('storeId', parsedLocation.coupon_id || null);
  }
  
  emit('update:is-open', false);
}
</script>

<style scoped>
.app-text-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap !important;
}
</style>