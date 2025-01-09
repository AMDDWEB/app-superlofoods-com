<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="closeModal"
    :swipe-to-close="false"
    :backdropDismiss="false"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Select My Store</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item v-for="location in locations" :key="location.id">
            <ion-icon name="location-dot" color="primary" slot="start"></ion-icon>
          <ion-label>
            <h2>{{ location.name }}</h2>
            <p class="app-text-overflow">{{ location.address }}</p>
          </ion-label>
          <ion-toggle
            slot="end"
            :checked="selectedLocation && selectedLocation.id === location.id"
            @ionChange="toggleLocation(location)"
          ></ion-toggle>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle, IonButtons, IonButton } from '@ionic/vue';
import apiLocations from '../axios/apiLocations';
import { useLocationDetails } from '@/composables/useLocationDetails';

// Props and emits
const props = defineProps(['isOpen']);
const emit = defineEmits(['update:is-open', 'location-selected']);

// Reactive references
const locations = ref([]);
const selectedLocation = ref(null);

// Lifecycle hooks
onMounted(async () => {
  await fetchLocations();
});

// Watch for changes in isOpen prop
watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await fetchLocations();
  }
});

// Fetch locations from API
async function fetchLocations() {
  try {
    const response = await apiLocations.getLocations();
    locations.value = response.map(transformLocationData);
    loadSelectedLocation();
  } catch (error) {
    // Error handling without logging
    locations.value = [];
  }
}

// Load previously selected location from localStorage
function loadSelectedLocation() {
  const storedLocation = localStorage.getItem('selectedLocation');
  if (storedLocation) {
    selectedLocation.value = JSON.parse(storedLocation);
  }
}

// Toggle location selection
function toggleLocation(location) {
  // If clicking the currently selected location, deselect it
  if (selectedLocation.value && selectedLocation.value.id === location.id) {
    selectedLocation.value = null;
    localStorage.removeItem('selectedLocation');
    emit('location-selected', null);
    
    // Dispatch the locationChanged event with null
    window.dispatchEvent(new CustomEvent('locationChanged', {
      detail: null
    }));
  } else {
    // Select the new location
    selectedLocation.value = location;
    localStorage.setItem('selectedLocation', JSON.stringify(location));
    emit('location-selected', location);
    
    // Dispatch the locationChanged event
    window.dispatchEvent(new CustomEvent('locationChanged', {
      detail: location
    }));
  }
  
  // Close the modal after selection/deselection
  closeModal();
}

// Close the modal
function closeModal() {
  emit('update:is-open', false);
}

const { transformLocationData } = useLocationDetails();
</script>

<style scoped>
.app-text-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap !important;
}
</style>