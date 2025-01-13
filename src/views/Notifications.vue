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
      <!-- Pull-to-Refresh -->
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Loading State -->
      <div v-if="loading" class="app-loading-container">
        <ion-spinner name="crescent" class="app-loading-spinner"></ion-spinner>
      </div>

      <!-- Notification List -->
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
      <ion-card v-else class="no-notifications-card">
        <span class="no-notifications-label">No New Notifications</span><br>
        <span class="no-notifications-message">You have no unread notifications.</span>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiNotifications from '../axios/apiNotifications';
import { IonPage, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonLabel, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, alertController } from '@ionic/vue';
import { useNotificationDetails } from '@/composables/useNotificationDetails';

const loading = ref(true);
const notifications = ref([]);
const { transformNotificationData } = useNotificationDetails();

const fetchNotifications = async (isRefreshing = false) => {
    if (!isRefreshing) loading.value = true;

    try {
        const response = await apiNotifications.getNotifications();
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];

        const updatedNotifications = response.data.map(notification => {
            const alreadyRead = readNotifications.includes(notification.id);
            const existingNotification = notifications.value.find(n => n.id === notification.id);
            return {
                ...transformNotificationData(notification),
                isRead: alreadyRead || existingNotification?.isRead || false
            };
        });

        if (isRefreshing) {
            notifications.value = [...updatedNotifications];
        } else {
            notifications.value = updatedNotifications;
        }

    } catch (error) {
        // Handle error silently or show user feedback
    } finally {
        loading.value = false;
    }
};

/**
 * ✅ Pull-to-Refresh Handler (Now Works Correctly)
 */
const doRefresh = async (event) => {
    await fetchNotifications(true);  // ✅ Preserves read state during refresh
    event.target.complete();
};

/**
 * ✅ Present Alert and Mark as Read
 */
const presentAlert = async (notification) => {
    let readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];

    if (!readNotifications.includes(notification.id)) {
        readNotifications.push(notification.id);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));

        // ✅ Directly update the reactive array for both pull-to-refresh and reload
        const notificationToUpdate = notifications.value.find(n => n.id === notification.id);
        if (notificationToUpdate) {
            notificationToUpdate.isRead = true;
        }
    }

    const alert = await alertController.create({
        header: notification.notification_title,
        message: notification.notification_details,
        buttons: ['Mark as Read']
    });
    await alert.present();
};

// ✅ Trigger Notifications on Page Load
onMounted(() => {
    fetchNotifications();  // Works for both page reload and revisit
});
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

.no-notifications-card {
  background: var(--ion-color-light);
  margin-top: 16px;
  margin-right: 16px;
  margin-left: 16px;
  padding: 16px;
  border-radius: 12px;
  border-style: solid;
  border-width: 1px;
  border-color: var(--ion-color-light-shade);
  /* box-shadow: 0 2px 4px rgba(0,0,0,0.1); */
}

.no-notifications-label {
  color: var(--ion-color-medium);
  font-size: 14px;
  margin-bottom: 4px;
}

.no-notifications-message {
  color: var(--ion-color-dark);
  font-size: 16px;
  font-weight: 600;
}
</style>