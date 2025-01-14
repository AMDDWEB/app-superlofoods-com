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

        
      </ion-content>
    </ion-modal>
  </template>
  
  <script setup>
  import { IonContent, IonModal } from '@ionic/vue';
  import { useSignupModal } from '@/composables/useSignupModal';
  import { ref, watchEffect } from 'vue';
  
  // Props and Events
  const props = defineProps({
    isOpen: Boolean
  });
  
  defineEmits(['update:isOpen']);
  
  </script>
  
  <style scoped>
  .barcode-card {
      background: var(--ion-color-light);
      margin: 0px;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--ion-color-light-shade);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .barcode-label {
      color: var(--ion-color-medium);
      font-size: 14px;
      margin-bottom: 4px;
  }
  
  .barcode-details {
      color: var(--ion-color-medium);
      font-size: 18px;
      font-weight: 600;
  }
  
  .barcode {
    margin-top: 24px;
  }
  
  .my-account-button {
    margin-top: 65px;
  }
  </style>