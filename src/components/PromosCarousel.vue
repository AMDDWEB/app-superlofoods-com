<template>
  <div class="ion-margin-bottom">
    <swiper
      v-if="promos.length > 0"
      ref="mySwiper"
      :pagination="true"
      :modules="modules"
      :autoplay="autoplayOptions"
      slides-per-view="1"
      loop
      :onSwiper="onSwiper"
    >
    <swiper-slide v-for="(promo, index) in promos.slice(0, 10)" :key="promo.promo_url">
  
    <img :src="promo.promo_image" alt="Promo Image">
    
  
</swiper-slide>
    </swiper>
    <div v-else class="skeleton-container">
      <ion-skeleton-text :animated="true" class="skeleton-promo"></ion-skeleton-text>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import PromosApi from '../ApiCalls/PromosApi';

const promos = ref([]);
const modules = [Autoplay, Pagination];
const autoplayOptions = {
  delay: 3000,
  disableOnInteraction: false,
};

const mySwiper = ref(null);

const onSwiper = (swiperInstance) => {
  mySwiper.value = swiperInstance;
  swiperInstance.autoplay.start();
};

const fetchPromos = async () => {
  try {
    const response = await PromosApi.getPromos();
    if (Array.isArray(response)) {
      promos.value = response;
    } else {
      console.error('Response is not an array');
    }
  } catch (err) {
    console.error('Error fetching promos:', err);
  }
};

onMounted(async () => {
  await fetchPromos();
});
</script>

<style scoped>
.promo-card {
  width: 100%;
}

.skeleton-container {
  width: 100%;
  height: 170px;
  padding: 0 16px;
}

.skeleton-promo {
  width: 100%;
  height: 170px;
  --border-radius: 0;
}
</style>
