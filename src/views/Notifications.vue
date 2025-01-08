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
  <ion-item 
    v-for="notification in notifications" 
    :key="notification.id" 
    @click="presentAlert(notification)"
  >
    <!-- Icon Changes Based on isRead -->
    <ion-icon 
      :color="notification.isRead ? 'medium' : 'danger'" 
      name="notifications-regular" 
      slot="start"
    ></ion-icon>

    <!-- Title and Details Change Based on isRead -->
    <ion-label>
      <h2 
        class="notification-heading" 
        :style="{ color: notification.isRead ? 'var(--ion-color-medium)' : 'var(--ion-color-primary)' }"
      >
        {{ notification.notification_title }}
      </h2>
      <p 
        class="app-text-overflow" 
        :style="{ color: notification.isRead ? 'var(--ion-color-medium)' : 'var(--ion-color-dark)' }"
      >
        {{ notification.notification_details }}
      </p>
    </ion-label>
  </ion-item>
</ion-list>

<!-- No Notifications Message -->
<div v-else class="no-notifications">
  <ion-icon name="mail-open-outline" size="large"></ion-icon>
  <p>No Unread Notifications</p>
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
        
        // Get read notifications from localStorage
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];

        // Ensure notifications load with correct read state
        notifications.value = response.data.map(notification => ({
            ...transformNotificationData(notification),
            isRead: readNotifications.includes(notification.id)
        }));
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
                text: 'Mark as Read',
                role: 'cancel',
                handler: () => {
                    let readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];

                    // Prevent duplicates and store the updated read list
                    if (!readNotifications.includes(notification.id)) {
                        readNotifications.push(notification.id);
                        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
                    }

                    // Update the reactive state directly using find
                    const notificationToUpdate = notifications.value.find(n => n.id === notification.id);
                    if (notificationToUpdate) {
                        notificationToUpdate.isRead = true;
                    }
                }
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

ion-label h2 {
  margin-bottom: 4px;
}

ion-label p {
  margin: 0;
  font-size:;
  line-height: 1.4;
}

.toolbar-icon {
  font-size: 20px !important;
}

.notification-heading {
  font-weight: bold;
  color: var(--ion-color-primary);
}

.no-notifications {
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