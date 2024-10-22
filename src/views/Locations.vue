<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-img
          slot="start"
          class="app-toolbar-image"
          src="https://iprosystems-website-media-files.s3.us-east-2.amazonaws.com/wp-content/uploads/rameysmarketplace/2024/03/primary-logo.svg"
        ></ion-img>
      </ion-toolbar>
      <ion-toolbar>
        <div class="app-search-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="app-custom-search-icon">
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM288 176c0-44.2-35.8-80-80-80s-80 35.8-80 80c0 48.8 46.5 111.6 68.6 138.6c6 7.3 16.8 7.3 22.7 0c22.1-27 68.6-89.8 68.6-138.6zm-112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
          </svg>
          <input
            v-model="searchQuery"
            placeholder="Search locations..."
            @input="handleSearch"
            class="app-search-input"
          />
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Display loading spinner while data is being fetched -->
      <div v-if="loading" class="app-loading-container">
        <ion-spinner name="crescent" class="app-loading-spinner"></ion-spinner>
      </div>

      <!-- Display the locations once loaded -->
      <ion-list v-else lines="full">
        <ion-item
          v-for="location in filteredLocations"
          :key="location.id"
          button
          @click="goToLocationsSingle(location.id)"
        >
          <ion-label>
            <h3 class="location-heading">
              {{ location.name }}
              <ion-badge 
                class="location-badge"
                :color="getLocationStatus(location).color"
              >
                {{ getLocationStatus(location).text }}
              </ion-badge>
            </h3>
            <p class="app-text-overflow">
              <ion-icon name="location-dot" class="app-icon-list-margin" />
              {{ location.address }}
            </p>
            <p>
              <ion-icon name="phone" class="app-icon-list-margin" />
              {{ location.phone_number }}
            </p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiLocations from '../axios/apiLocations';
import { IonPage, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonLabel, IonBadge, IonIcon, IonImg, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/vue';

const loading = ref(true);
const locations = ref([]);
const router = useRouter();
const searchQuery = ref('');

const fetchLocations = async (isRefreshing = false) => {
  if (!isRefreshing) {
    loading.value = true;
  }
  try {
    const newLocations = await apiLocations.getLocations();
    locations.value = Array.isArray(newLocations) ? newLocations : [];
    console.log('Fetched locations:', locations.value);
  } catch (error) {
    console.error('Error fetching locations:', error);
  } finally {
    loading.value = false;
  }
};

const goToLocationsSingle = (id) => {
  router.push({ name: 'LocationSingle', params: { id } });
};

const getLocationStatus = (location) => {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  const days = location.day_open.toLowerCase().split(', ');
  const openingHours = location.opening_hours.split(', ');
  const closingHours = location.closing_hours.split(', ');

  const todayIndex = days.indexOf(currentDay);

  if (todayIndex === -1) {
    return { text: 'Closed', color: 'danger' };
  }

  const openTime = openingHours[todayIndex];
  const closeTime = closingHours[todayIndex];

  if (!openTime || !closeTime) {
    return { text: 'Hours N/A', color: 'warning' };
  }

  if (currentTime >= openTime && currentTime < closeTime) {
    return { text: 'Now Open', color: 'success' };
  } else {
    return { text: 'Closed', color: 'danger' };
  }
};

onMounted(() => {
  fetchLocations();
});

const filteredLocations = computed(() => {
  if (!searchQuery.value) return locations.value;
  const query = searchQuery.value.toLowerCase();
  return locations.value.filter(location => 
    location.name.toLowerCase().includes(query) ||
    location.address.toLowerCase().includes(query) ||
    location.phone_number.includes(query)
  );
});

const handleSearch = () => {
  // The filtering is handled by the computed property
};

const doRefresh = async (event) => {
  await fetchLocations(true);
  event.target.complete();
};
</script>

<style scoped>
.app-text-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap !important;
}

.app-icon-list-margin {
  margin-right: 5px;
}

.location-heading {
  font-weight: bold;
  color: var(--ion-color-primary);
}

.location-badge {
  font-size: 12px;
  color: var(--ion-color-light);
  position: absolute;
  right: 32px;
  top: 0px;
}

.ion-item {
  position: relative;
}

ion-icon {
  color: var(--ion-color-medium);
  font-size: 14px;
}

ion-list {
  padding: 0;
}

ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
}

ion-item:last-of-type {
  --border-width: 0;
}

ion-label {
  margin: 0;
}

ion-label h3 {
  margin-bottom: 4px;
}

ion-label p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}
</style>
