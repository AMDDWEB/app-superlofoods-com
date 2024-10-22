<template>
    <div>
      <ion-card class="ion-padding" inset>
        <ion-item lines="none" class="ion-text-center">
          <ion-label color="primary">
            <h2>
              <b> There are currently no featured items. </b>
            </h2>
            <p>
              <ion-text color="medium"> Please Select Another Store </ion-text>
            </p>
          </ion-label>
        </ion-item>
      </ion-card>
    </div>
  </template>
  
  <script setup>
  import { IonCard, IonItem, IonLabel, IonText } from '@ionic/vue'
  </script>
  
  <style scoped>
  ion-card {
    border: 2px dashed var(--ion-color-light-shade);
  }
  </style>