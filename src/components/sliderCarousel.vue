<template>
    <div class="ion-margin-bottom">
      <swiper
        v-if="sliders.length > 0"
        ref="mySwiper"
        :pagination="true"
        :modules="modules"
        :autoplay="autoplayOptions"
        slides-per-view="1"
        loop
        :onSwiper="onSwiper"
      >
      <swiper-slide v-for="(slider, index) in sliders.slice(0, 10)" :key="slider.slider_url">
    
      <img :src="slider.imageUrl">
      
    
  </swiper-slide>
      </swiper>
      <div v-else class="skeleton-container">
        <ion-skeleton-text :animated="true" class="skeleton-slider"></ion-skeleton-text>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { Autoplay, Pagination } from 'swiper/modules';
  import 'swiper/css';
  import apiSliders from '../axios/apiSliders';
  
  const sliders = ref([]);
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
  
  const fetchSliders = async () => {
    try {
      const response = await apiSliders.getSliders();
      if (Array.isArray(response)) {
        sliders.value = response;
      } else {
        console.error('Response is not an array');
      }
    } catch (err) {
      console.error('Error fetching sliders:', err);
    }
  };
  
  onMounted(async () => {
    await fetchSliders();
  });
  </script>
  
  <style scoped>
  .slider-card {
    width: 100%;
  }
  
  .skeleton-container {
    width: 100%;
    height: 170px;
    padding: 0 16px;
  }
  
  .skeleton-slider {
    width: 100%;
    height: 170px;
    --border-radius: 0;
  }
  </style>
  