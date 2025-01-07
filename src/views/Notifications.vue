<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-img class="app-toolbar-image" :src="logoUrl"></ion-img>
        </ion-toolbar>
      </ion-header>
  
      <ion-content>
        <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>
  
        <div v-if="loading" class="app-loading-container">
          <ion-spinner name="crescent" class="app-loading-spinner"></ion-spinner>
        </div>
  
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
  import { useLocationDetails } from '@/composables/useLocationDetails';
  
  const loading = ref(true);
  const locations = ref([]);
  const router = useRouter();
  const searchQuery = ref('');
  const logoUrl = ref(import.meta.env.VITE_PRIMARY_LOGO);
  const { transformLocationData } = useLocationDetails();
  
  const fetchLocations = async (isRefreshing = false) => {
    if (!isRefreshing) {
      loading.value = true;
    }
    try {
      const response = await apiLocations.getLocations();
      const transformedLocations = response.data.map(transformLocationData);
      locations.value = transformedLocations;
    } catch (error) {
      // Error handling without console.error
    } finally {
      loading.value = false;
    }
  };
  
  const goToLocationsSingle = (id) => {
    router.push({ name: 'LocationDetails', params: { id } });
  };
  
  const getLocationStatus = (location) => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
    const todayHours = location.hours?.find(hour => hour.day === currentDay);
  
    if (!todayHours) {
      return { text: 'Closed', color: 'danger' };
    }
  
    const openTime = convertTo24HourFormat(todayHours.opening);
    const closeTime = convertTo24HourFormat(todayHours.closing);
    const currentTime24 = convertTo24HourFormat(currentTime);
  
    if (currentTime24 >= openTime && currentTime24 < closeTime) {
      return { text: 'Now Open', color: 'success' };
    } else {
      return { text: 'Closed', color: 'danger' };
    }
  };
  
  const convertTo24HourFormat = (time) => {
    if (time.match(/^\d{2}:\d{2}$/)) {
      return time;
    }
  
    const [timePart, modifier] = time.split(' ');
    if (!timePart || !modifier) {
      return '00:00';
    }
  
    let [hours, minutes] = timePart.split(':');
    hours = String(hours);
    minutes = String(minutes);
  
    if (modifier === 'PM' && hours !== '12') {
      hours = String(parseInt(hours, 10) + 12);
    } else if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }
  
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
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
    padding-top: 4px;
    padding-bottom: 4px;
  }
  
  .ion-item {
    position: relative;
  }
  
  ion-icon {
    color: var(--ion-color-medium);
    font-size: 14px;
    vertical-align: middle;
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