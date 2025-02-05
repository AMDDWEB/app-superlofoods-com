<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { TokenStorage } from './utils/tokenStorage';
import CustomerApi from './axios/apiCustomer';

const { getAccessTokenSilently, isAuthenticated } = useAuth0();

// Check and refresh authentication on app start
onMounted(async () => {
  const hasMidaxCoupons = import.meta.env.VITE_HAS_MIDAX_COUPONS === "true";
  
  if (hasMidaxCoupons && isAuthenticated.value) {
    try {
      // Get fresh access token
      const accessToken = await getAccessTokenSilently();
      TokenStorage.setTokens(accessToken, ''); // Store access token, no refresh token for Auth0
      
      // Check for existing user and store card number
      const storeId = localStorage.getItem('storeId');
      if (storeId) {
        const response = await CustomerApi.checkForExistingUser(accessToken, storeId);
        if (response.data && response.data.card_number) {
          localStorage.setItem('cardNumber', response.data.card_number);
        }
      }
    } catch (error) {
      console.error('Error refreshing authentication:', error);
    }
  }
});
</script>
