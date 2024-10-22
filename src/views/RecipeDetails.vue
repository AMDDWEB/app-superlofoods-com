<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="$router.go(-1)">
            <ion-icon slot="icon-only" color="primary" name="back-button" class="toolbar-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ recipe?.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="shareRecipe">
            <ion-icon slot="icon-only" color="primary" name="share" class="toolbar-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="loading" class="app-loading-container">
        <ion-spinner name="crescent" class="app-loading-spinner"></ion-spinner>
      </div>
<!-- Recipe image and title -->
      <div v-else-if="recipe">
        <div class="recipe-image-container">
          <img :src="recipe?.image_url" :alt="recipe?.name" />
          <div class="recipe-image-overlay"></div>
          <h1 class="recipe-title">{{ recipe?.name }}</h1>
        </div>
      </div>

      <div v-else class="error-message">
        Recipe not found.
      </div>

      <!-- Recipe details/overview -->

      <div>

  <ion-grid>
  <ion-row>
    <ion-col size="6">
      <ion-item color="primary" class="recipe-overview">
        <ion-icon name="serving-size" color="light" size="large" slot="start"></ion-icon>
        <ion-label>
          
          <div class="recipe-overview-heading">Servings</div>
          <div v-if="recipe" class="recipe-overview-subheading">{{ recipe.recipe_serving_size }}</div>
        </ion-label>
      </ion-item>
    </ion-col>
    <ion-col size="6">
      <ion-item color="secondary" class="recipe-overview">
        <ion-icon name="prep-time" color="light" size="large" slot="start"></ion-icon>
        <ion-label>
          
          <div class="recipe-overview-heading">Prep Time</div>
          <div v-if="recipe" class="recipe-overview-subheading">{{ recipe.recipe_total_prep_time }}</div>
        </ion-label>
      </ion-item>
    </ion-col>
  </ion-row>
  <ion-row>
    <ion-col size="6">
      <ion-item color="warning" class="recipe-overview">
        <ion-icon name="cook-time" color="light" size="large" slot="start"></ion-icon>
        <ion-label>
          
          <div class="recipe-overview-heading">Cook Time</div>
          <div v-if="recipe" class="recipe-overview-subheading">{{ recipe.recipe_total_cook_time }}</div>
        </ion-label>
      </ion-item>
    </ion-col>
    <ion-col size="6">
      <ion-item color="success" class="recipe-overview">
        <ion-icon name="total-time" color="light" size="large" slot="start"></ion-icon>
        <ion-label>
          
          <div class="recipe-overview-heading">Total Time</div>
          <div v-if="recipe" class="recipe-overview-subheading">{{ recipe.recipe_total_time }}</div>
        </ion-label>
      </ion-item>
    </ion-col>
  </ion-row>
</ion-grid>

</div>

  <!-- New section for ingredients -->
  <div>
    <ion-list lines="full">
      <ion-list-header>
        <ion-label>Ingredients</ion-label>
      </ion-list-header>
      <ion-item v-for="(ingredient, index) in recipe?.recipe_ingredients" :key="index">
        <ion-label>
          <span class="recipe-ingredients-start">{{ ingredient.name }}</span>
          <span class="recipe-ingredients-end">{{ ingredient.serving }}</span>
        </ion-label>
      </ion-item>
    </ion-list>
  </div>

    <!-- Method section - only show if there are steps with non-empty methods -->
    <template v-if="recipe?.recipe_steps?.some(step => step.method && step.method.trim() !== '')">
      <div class="recipe-steps">
        <ion-list lines="full">
          <ion-list-header>
            <ion-label>Instructions</ion-label>
          </ion-list-header>
          <ion-item v-for="(step, index) in recipe.recipe_steps" :key="index">
            <ion-label v-if="step.method && step.method.trim() !== ''">
              <span>{{ step.method }}</span>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </template>

      <!-- View More Details button - only show if there's a source URL -->
      <ion-button 
        v-if="recipe?.recipe_source_url" 
        expand="full" 
        color="secondary" 
        class="recipe-button"
        @click="openSourceUrl"
      >
        View More Details
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon, IonSpinner
} from '@ionic/vue';
import RecipesApi from '../ApiCalls/RecipesApi';

const route = useRoute();
const loading = ref(true);
const recipe = ref(null);
const error = ref(null);

const fetchRecipe = async (id) => {
  try {
    loading.value = true;
    error.value = null;
    const recipes = await RecipesApi.getRecipes();
    recipe.value = recipes.find((r) => r.id === Number(id));
    if (!recipe.value) {
      error.value = 'Recipe not found';
    }
  } catch (err) {
    console.error('Error fetching recipe:', err);
    error.value = 'Failed to fetch recipe';
  } finally {
    loading.value = false;
  }
};

const shareRecipe = async () => {
  const url = recipe.value?.recipe_url;
  if (url && url !== 'Link Unavailable') {
    const modifiedUrl = url.replace('rameysmarketplace.allianceretailgroup.com', 'rameysmarketplace.com');
    try {
      await Share.share({
        title: recipe.value?.name || 'Check out this recipe from Ramey\'s Marketplace.',
        text: 'Check out this recipe from Ramey\'s Marketplace.',
        url: modifiedUrl,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  } else {
    console.log('No valid recipe URL to share.');
  }
};

const openSourceUrl = async () => {
  if (recipe.value?.recipe_source_url) {
    try {
      await Browser.open({
        url: recipe.value.recipe_source_url,
        presentationStyle: 'popover'
      });
    } catch (error) {
      console.error('Error opening source URL:', error);
    }
  }
};

onMounted(() => {
  const { id } = route.params;
  fetchRecipe(id);
});
</script>

<style scoped>
.toolbar-icon {
  font-size: 20px !important;
}

.recipe-image-container {
  position: relative;
  width: 100%;
  height: 250px; /* Adjust as needed */
  overflow: hidden;
}

.recipe-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
}

.recipe-title {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: #fff;
  font-size: 30px;
  margin: 0;
  z-index: 2;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  width: 65%;
}

.recipe-overview {
  --border-radius: 10px;
  /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); */
  text-align: left;
  background-color: transparent !important;
  overflow: hidden;
}

.recipe-overview-heading {
  font-weight: 600;
  font-size: 16px;
}

.recipe-overview-subheading {
  text-transform: capitalize;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap !important;
}

.recipe-ingredients-start {
  font-weight: 500;
  text-transform: capitalize;
}

.recipe-ingredients-end {
  float: right;
  text-transform: capitalize;
}

.recipe-steps {
  margin-bottom: 36px;
}

.recipe-button {
  margin-bottom: 36px;
  margin-right: 0;
  margin-left: 0;
}
</style>
