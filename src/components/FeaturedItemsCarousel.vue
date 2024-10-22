<template>
  <div class="ion-margin-bottom">
    <ion-list lines="none">
      <ion-item>
        <ion-text>
          <h3 class="app-list-heading">Featured Items</h3>
          <p class="app-list-subheading">Don't miss out on this week's top picks.</p>
        </ion-text>
      </ion-item>
    </ion-list>

    <div v-if="!loading">
      <swiper v-if="featuredItems.length > 0" @swiper="onSwiper" slides-per-view="1.5">
        <swiper-slide v-for="(item, index) in featuredItems.slice(0, 10)" :key="index">
          <div
            class="featured-item-card"
            :style="{ backgroundImage: 'url(' + item.image_url + ')' }"
          >
            <div class="overlay"></div>
            <h3>{{ item.price }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </swiper-slide>
      </swiper>
      <div v-else class="no-items-container">
        <div class="featured-item-card no-items-card">
          <div class="overlay"></div>
          <h3>No Featured Items Available</h3>
          <p>Check back later for new featured items.</p>
        </div>
      </div>
    </div>
    <div v-else class="skeleton-container">
      <ion-skeleton-text :animated="true" class="skeleton-featured-item"></ion-skeleton-text>
      <ion-skeleton-text :animated="true" class="skeleton-featured-item"></ion-skeleton-text>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import apiFeaturedItems from '../axios/apiFeaturedItems';

const featuredItems = ref([]);
const loading = ref(true);

const fetchFeaturedItems = async () => {
  loading.value = true;
  try {
    const response = await apiFeaturedItems.getFeaturedItems();
    if (Array.isArray(response)) {
      featuredItems.value = response;
      console.log('Featured Items:', featuredItems.value);
    } else {
      console.error('Featured Items response is not an array:', response);
    }
  } catch (error) {
    console.error('Error fetching featured items:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchFeaturedItems();
});

const onSwiper = (swiper) => {
  swiper.effect = 'fade';
};
</script>

<style scoped>
.swiper {
  padding-left: 16px;
  padding-right: 16px;
}

.featured-item-card {
    text-align: left;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  border-radius: 15px;
  color: white;
  height: 250px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 12px;
  margin-right: 10px;
}

.featured-item-card h3 {
  margin: 0;
  z-index: 10;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.featured-item-card p {
  margin: 0;
  z-index: 10;
  font-size: 16px;
  line-height: 1.4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3));
  border-radius: 15px;
}

.app-list-heading {
  font-weight: bold;
  margin-bottom: 0px;
}

.app-list-subheading {
  margin-top: 0px;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.skeleton-container {
  display: flex;
  overflow-x: scroll;
  padding: 0 16px;
}

.skeleton-featured-item {
  flex: 0 0 auto;
  width: 250px;
  height: 250px;
  margin-right: 10px;
  --border-radius: 15px;
}

.no-items-container {
  padding: 0 4px 0 16px;
}

.no-items-card {
  background-color: white;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 150px;
}

.no-items-card h3 {
  color: var(--ion-color-primary);
  font-size: 20px;
  font-weight: bold;
  z-index: 10;
  position: relative;
}

.no-items-card p {
  color: var(--ion-color-medium);
  font-size: 16px;
  z-index: 10;
  position: relative;
}

.no-items-card .overlay {
  background: #f7f7f7;
  border: 1px #eaeaea  solid;
}
</style>
