<template>
  <ion-page>
    <ion-tabs>
  <ion-router-outlet cache="false"></ion-router-outlet>
  <ion-tab-bar slot="bottom">
    <ion-tab-button tab="home" href="/tabs/home">
      <ion-icon name="home-regular"/>
      <ion-label>Home</ion-label>
    </ion-tab-button>
    <ion-tab-button tab="locations" href="/tabs/locations">
      <ion-icon name="locations-regular" />
      <ion-label>Locations</ion-label>
    </ion-tab-button>
    <ion-tab-button tab="recipes" href="/tabs/recipes">
      <ion-icon name="recipes-regular" />
      <ion-label>Recipes</ion-label>
    </ion-tab-button>
    <ion-tab-button tab="preferences" href="/tabs/preferences">
      <ion-icon name="more-regular" />
      <ion-label>More</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</ion-tabs>
  </ion-page>
</template>

<script>
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';

export default {
  components: {
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonLabel,
    IonIcon,
    IonPage,
    IonRouterOutlet
  }
};
</script>