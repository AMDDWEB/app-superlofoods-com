<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="$router.go(-1)">
            <ion-icon slot="icon-only" color="primary" name="back-button" class="toolbar-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Notifications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div v-if="loading" class="app-loading-container">
        <ion-spinner name="crescent" class="app-loading-spinner"></ion-spinner>
      </div>

      <ion-list v-if="notifications.length > 0" lines="full">
  <ion-item v-for="notification in notifications" :key="notification.id" @click="presentAlert(notification)">
    <ion-icon color="danger" name="notifications-regular" slot="start"></ion-icon>
    <ion-label>
      <h3 class="notification-heading">
        {{ notification.notification_title }}
      </h3>
      <p class="app-text-overflow">
        {{ notification.notification_details }}
      </p>
    </ion-label>
  </ion-item>
</ion-list>

<!-- Message for No Notifications -->
<div v-else class="no-notifications">
  <ion-icon name="no-notifications-regular" size="large"></ion-icon>
  <p class="no-notifications">No Unread Notifications</p>
</div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiNotifications from '../axios/apiNotifications';
import { IonPage, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonLabel, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, alertController } from '@ionic/vue';
import { useNotificationDetails } from '@/composables/useNotificationDetails';

const loading = ref(true);
const notifications = ref([]);
const router = useRouter();
const { transformNotificationData } = useNotificationDetails();

const fetchNotifications = async (isRefreshing = false) => {
    if (!isRefreshing) {
        loading.value = true;
    }
    try {
        const response = await apiNotifications.getNotifications();
        
        // Retrieve discarded notifications from localStorage
        const discarded = JSON.parse(localStorage.getItem('discardedNotifications')) || [];
        
        // Filter out discarded notifications based on their IDs
        const transformedNotifications = response.data
            .map(transformNotificationData)
            .filter(notification => !discarded.includes(notification.id));
        
        notifications.value = transformedNotifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
  fetchNotifications();
});

const doRefresh = async (event) => {
  await fetchNotifications(true);
  event.target.complete();
};

const presentAlert = async (notification) => {
    const alert = await alertController.create({
        header: notification.notification_title,
        message: notification.notification_details,
        buttons: [
            {
                text: 'Discard',
                role: 'destructive',
                handler: () => {
                    // Fetch discarded notifications from localStorage
                    let discarded = JSON.parse(localStorage.getItem('discardedNotifications')) || [];
                    
                    // Prevent duplicate entries
                    if (!discarded.includes(notification.id)) {
                        discarded.push(notification.id);
                        localStorage.setItem('discardedNotifications', JSON.stringify(discarded));
                    }

                    // Remove from current notifications array
                    notifications.value = notifications.value.filter(n => n.id !== notification.id);
                }
            },
            {
                text: 'Keep',
                role: 'cancel'  // No action taken
            }
        ]
    });
    await alert.present();
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

.notification-heading {
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

.toolbar-icon {
  font-size: 20px !important;
}

.no-notifications{
    text-align: center;
    font-size: 18px;
    color: var(--ion-color-medium);
}

.no-notifications ion-icon {
    font-size: 48px;
    color: var(--ion-color-primary);
    padding-top: 80px;
}
</style>