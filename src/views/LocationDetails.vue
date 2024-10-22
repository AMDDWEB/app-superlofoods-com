<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="$router.go(-1)">
            <ion-icon slot="icon-only" color="primary" name="back-button" class="toolbar-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title v-if="locationData">{{ locationData.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="shareLocation">
            <ion-icon slot="icon-only" color="primary" name="share" class="toolbar-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="loading" class="app-loading-container">
        <ion-spinner name="crescent" class="app-loading-spinner"></ion-spinner>
      </div>

      <div v-else-if="locationData">
        <ion-item lines="none" class="ion-margin-top">
          <ion-label>
            <h1>{{ locationData.name }}</h1>
          </ion-label>
        </ion-item>

        <ion-item lines="none">
          <ion-label>
            <p class="" style="color: var(--ion-color-dark);">
              {{ locationData.street_number }} {{ locationData.street_name }}<br>
              {{ locationData.city }}, {{ locationData.state_short }} {{ locationData.post_code }}
            </p>
          </ion-label>
        </ion-item>


        <!-- Get Directions, Call Store, and Set as My Store buttons -->
        <ion-grid :fixed="true" class="ion-margin-top">
          <ion-row>
            <ion-col>
              <ion-button expand="block" size="small" @click="gotoStore">
                <ion-icon slot="start" name="get-directions"></ion-icon>
               Directions
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button expand="block" size="small" @click="callStore">
                <ion-icon slot="start" name="phone"></ion-icon>
                Call Store
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button
  expand="block" 
  size="small" 
  @click="setAsMyStore"
  :color="isSelectedLocation ? 'primary' : 'medium'"
>
  <ion-icon slot="start" name="my-store"></ion-icon>
  {{ isSelectedLocation ? 'My Store' : 'Set as Store' }}
</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Store Hours List -->
        <ion-list v-if="storeHours.length">
          <ion-list-header>
            <ion-label>
              Store Hours
              <ion-badge class="location-badge" :color="getLocationStatus(locationData).color">
                {{ getLocationStatus(locationData).text }}
              </ion-badge>
            </ion-label>
          </ion-list-header>
          <ion-item v-for="(hour, index) in storeHours" :key="index" :class="{ 'current-day': isCurrentDay(hour.day) }">
            <ion-label>
              <span class="location-day">{{ hour.day }}</span>
              <span class="location-hours" :class="{ 'current-day-hours': isCurrentDay(hour.day) }">
                {{ hour.opening }} to {{ hour.closing }}
              </span>
            </ion-label>
          </ion-item>
        </ion-list>
        <p v-else>No store hours available</p>

        <!-- Weekly Ads and Rewards -->
        <ion-grid :fixed="true" class="ion-margin-top-large">
          <ion-row>
            <ion-col v-if="hasWeeklyAd">
              <ion-button expand="block" size="small" @click="openWeeklyAd">
                <ion-icon slot="start" name="weekly-ad"></ion-icon>
                Weekly Ad
              </ion-button>
            </ion-col>
            <ion-col v-if="hasRewards">
              <ion-button expand="block" size="small" @click="openRewardsURL">
                <ion-icon slot="start" name="rewards"></ion-icon>
                Rewards
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>

    <!-- Add these modals at the end of the template -->
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
  </ion-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiLocations from '../axios/apiLocations';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { useDateFormat } from '../composables/useDateFormat';
import { IonPage, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonLabel, IonBadge, IonIcon, IonAlert, IonSpinner, IonRefresher, IonRefresherContent, IonButton, IonButtons, IonTitle, IonGrid, IonRow, IonCol } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';
import { alertController } from '@ionic/vue';

const route = useRoute();
const router = useRouter();
const props = defineProps(['id']);

const locationData = ref(null);
const loading = ref(true);
const storeHours = ref([]);
const { formatTime } = useDateFormat();

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

const fetchLocationById = async (id) => {
  loading.value = true;
  try {
    const locations = await apiLocations.getLocations();
    locationData.value = locations.find(loc => loc.id === parseInt(id));
    console.log('Fetched Location Object:', locationData.value);

    if (locationData.value) {
      const daysOpen = locationData.value.day_open;
      const openingHours = locationData.value.opening_hours.split(", ");
      const closingHours = locationData.value.closing_hours.split(", ");

      storeHours.value = daysOpen.split(", ").map((day, index) => ({
        day,
        opening: formatTime(openingHours[index]),
        closing: formatTime(closingHours[index]),
      }));

      console.log('Store Hours:', storeHours.value);
    }
  } catch (error) {
    console.error('Error fetching location:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadLocationData();
});

const loadLocationData = () => {
  const id = route.params.id || props.id;
  if (id) {
    fetchLocationById(id);
    checkIfSelectedLocation();
  } else {
    loading.value = false;
  }
};

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadLocationData();
  }
});

const shareLocation = async () => {
  const url = locationData.value?.location_url;
  if (url) {
    const modifiedUrl = url.replace('rameysmarketplace.allianceretailgroup.com', 'rameysmarketplace.com');
    await Share.share({
      title: locationData.value.name || 'Visit your nearest Ramey\'s location.',
      text: 'Visit your nearest Ramey\'s location.',
      url: modifiedUrl,
    });
  } else {
    console.log('No location URL to share.');
  }
};

const callStore = () => {
  const phoneNumber = locationData.value?.phone_number;

  if (phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
  } else {
    console.log('No phone number available to call.');
  }
};

// Get directions buttons for each mobile platform
const gotoStore = () => {
  const mapLocation = locationData.value?.address;

  if (mapLocation) {
    const encodedLocation = encodeURIComponent(mapLocation);
    let url;

    if (Capacitor.getPlatform() === 'ios') {
      // For iOS, use Apple Maps
      url = `https://maps.apple.com/?daddr=${encodedLocation}`;
    } else {
      // For Android and other platforms, use Google Maps
      url = `https://www.google.com/maps/dir/?destination=${encodedLocation}`;
    }

    // Open the URL in the default browser, which should redirect to the maps app
    window.open(url, '_system');
  } else {
    console.log('No map location to open.');
  }
};

const isCurrentDay = (day) => {
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return day.toLowerCase() === currentDay.toLowerCase();
};

const isSelectedLocation = ref(false);

const checkIfSelectedLocation = () => {
  const storedLocation = JSON.parse(localStorage.getItem('selectedLocation') || '{}');
  isSelectedLocation.value = storedLocation.id === parseInt(props.id);
};

const isPrimaryLocation = computed(() => {
  const storedLocation = JSON.parse(localStorage.getItem('selectedLocation') || '{}');
  return storedLocation.id === parseInt(props.id);
});



// Then modify the setAsMyStore function like this:
const setAsMyStore = async () => {
  if (locationData.value) {
    if (isPrimaryLocation.value) {
      // If it's already the primary location, show an alert and redirect to preferences
      const alert = await alertController.create({
        header: 'My Store',
        message: `${locationData.value.name} is already set as your primary store. To change your main location, please click the preferences button below.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: 'Preferences',
            handler: () => {
              // Redirect to the preferences tab
              router.push('/tabs/preferences');
            }
          }
        ]
      });

      await alert.present();
    } else {
      // If it's not the primary location, show the confirmation alert to set it as primary
      const alert = await alertController.create({
        header: 'Confirm Store Selection',
        message: `Are you sure you want to set the ${locationData.value.name} location as your primary store?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: 'OK',
            handler: () => {
              localStorage.setItem('selectedLocation', JSON.stringify(locationData.value));
              isSelectedLocation.value = true;
              isPrimaryLocation.value = true;

              window.dispatchEvent(new CustomEvent('locationChanged', {
                detail: locationData.value
              }));
            }
          }
        ]
      });

      await alert.present();
    }
  }
};

const hasWeeklyAd = computed(() => !!locationData.value?.weekly_ad_url);
const hasRewards = computed(() => !!locationData.value?.rewards_url);
const hasWeeklyAdOrRewards = computed(() => hasWeeklyAd.value || hasRewards.value);

const isWeeklyAdModalOpen = ref(false);
const isRewardsModalOpen = ref(false);

const openWeeklyAd = async () => {
  const weeklyAdUrl = locationData.value?.weekly_ad_url;
  if (weeklyAdUrl) {
    if (Capacitor.getPlatform() === 'android') {
      isWeeklyAdModalOpen.value = true;
    } else {
      await Browser.open({
        url: weeklyAdUrl,
        presentationStyle: 'popover'
      });
    }
  }
};

const openRewardsURL = async () => {
  const rewardsURL = locationData.value?.rewards_url;
  if (rewardsURL) {
    if (Capacitor.getPlatform() === 'android') {
      isRewardsModalOpen.value = true;
    } else {
      await Browser.open({
        url: rewardsURL,
        presentationStyle: 'popover'
      });
    }
  }
};

const wrappedWeeklyAdUrl = computed(() => {
  if (locationData.value?.weekly_ad_url) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(locationData.value.weekly_ad_url)}`;
  }
  return '';
});

const wrappedRewardsUrl = computed(() => {
  if (locationData.value?.rewards_url) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(locationData.value.rewards_url)}`;
  }
  return '';
});
</script>

<style scoped>
.app-width-2-3 {
  max-width: 67%;
}

.ion-margin-top-large {
  margin-top: 24px !important;
}

.location-day {
  font-weight: 600;
}

.location-hours {
  float: right;
}

.toolbar-icon {
  font-size: 20px !important;
}

.button-column {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  vertical-align: top !important;
}

.location-badge {
  font-size: 14px;
  color: var(--ion-color-light);
  display: flex;
  float: right;
  margin-right: 20px;
}

.current-day {
  position: relative;
}

.current-day::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--ion-color-primary);
  opacity: 0.1;
  pointer-events: none;
}

.current-day .location-day,
.current-day-hours {
  color: var(--ion-color-danger);
}

.location-hours {
  float: right;
}

ion-grid {
  --ion-grid-columns: 3 !important;
  --ion-grid-column-padding: 1px;
}

ion-button {
  --padding-start: 5px;
  --padding-end: 5px;
  font-size: 14px;
  /* --border-radius: 10px !important; */
}

ion-button ion-icon {
  font-size: 16px;
}

.set-my-store-grid {
  --ion-grid-column-padding: 1px;
}

.set-my-store-grid ion-button {
  --padding-start: 5px;
  --padding-end: 5px;
  font-size: 12px;
}

.set-my-store-grid ion-button ion-icon {
  font-size: 16px;
}

.button-container {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  margin-top: 20px;
}

.button-container ion-button {
  flex: 1;
  margin: 0 5px;
}
</style>