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
import LocationsApi from '../ApiCalls/LocationsApi';

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
    locations.value = await LocationsApi.getLocations();
    loadSelectedLocation();
  } catch (error) {
    console.error('Error fetching locations:', error);
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
  if (selectedLocation.value && selectedLocation.value.id === location.id) {
    selectedLocation.value = null;
  } else {
    selectedLocation.value = location;
  }
  emit('location-selected', selectedLocation.value);
  // The modal will not close here
}

// Close the modal
function closeModal() {
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