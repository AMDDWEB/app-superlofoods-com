<template>
    <ion-modal :is-open="isOpen" @didDismiss="$emit('update:isOpen', false)" :presenting-element="presentingElement"
      :initial-breakpoint="1" :breakpoints="[0, 1]" :swipe-to-close="true" :backdropDismiss="false">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="end">
            <!-- Back button to navigate back one page -->
          </ion-buttons>
          <ion-title>My Account Details</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <form @submit.prevent="submitUserProfile">
          <ion-item>
            <ion-label position="stacked">First Name</ion-label>
            <ion-input v-model="userProfile.firstName" required></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Last Name</ion-label>
            <ion-input v-model="userProfile.lastName" required></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Birthday</ion-label>
            <ion-input type="date" v-model="userProfile.birthday"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Email</ion-label>
            <ion-input type="email" v-model="userProfile.email" required></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Zip Code</ion-label>
            <ion-input type="number" v-model="userProfile.zipCode" maxlength="5"></ion-input>
          </ion-item>
          <!-- Add more fields as needed -->
          <ion-button expand="full" type="submit" :disabled="isLoading">
            <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
            <span v-else>Update Profile</span>
          </ion-button>
        </form>
        <div v-if="errorMessage" class="error-container">
          <ion-icon :icon="alertCircleOutline" color="danger"></ion-icon>
          <p>{{ errorMessage }}</p>
        </div>
      </ion-content>
    </ion-modal>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { IonContent, IonModal, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonIcon } from '@ionic/vue';
  import { alertCircleOutline } from 'ionicons/icons';
  import CouponsApi from '@/axios/apiCoupons';
  import { TokenStorage } from '@/utils/tokenStorage';
  
  // Props and Events
  const props = defineProps({
    isOpen: Boolean
  });
  
  defineEmits(['update:isOpen']);
  
  const userProfile = ref({
    firstName: '',
    lastName: '',
    birthday: '',
    email: '',
    zipCode: ''
  });
  
  const isLoading = ref(false);
  const errorMessage = ref('');
  
  // Function to format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.replace(/\//g, '-');
  };
  
  const fetchUserProfile = async () => {
    try {
      const data = await CouponsApi.getCustomerInfo();
      if (!data) {
        throw new Error('No customer data found');
      }

      userProfile.value = {
        firstName: data.FirstName || '',
        lastName: data.LastName || '',
        birthday: formatDateForInput(data.Birthday) || '',
        email: data.Email || '',
        zipCode: data.Zip || ''
      };

      console.log('Mapped user profile:', userProfile.value); // Debugging line
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      errorMessage.value = 'Failed to retrieve customer information.';
    }
  };
  
  const submitUserProfile = async () => {
    isLoading.value = true;
    try {
      const refreshToken = TokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      await CouponsApi.updateUserProfile(userProfile.value, refreshToken);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      errorMessage.value = 'Failed to update profile. Please try again.';
    } finally {
      isLoading.value = false;
    }
  };
  
  onMounted(fetchUserProfile);
  </script>
  
  <style scoped>
  .error-container {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--ion-color-danger-tint);
    padding: 16px;
    border-radius: 12px;
    margin-top: 16px;
  }
  </style>