<template>
  <div class="ion-margin-bottom">
    <ion-list lines="none">
      <ion-item @click="goToCouponsArchive">
        <ion-text>
          <h3 class="app-list-heading">
            Clip & Save Coupons
            <ion-icon style="font-size: 16px;" name="chevron-right" color="medium"></ion-icon>
          </h3>
          <p class="app-list-subheading">Unlock exclusive savings – limited time only!</p>
        </ion-text>
      </ion-item>
    </ion-list>

    <div v-if="!loading">
      <swiper @swiper="onSwiper" :slides-per-view="2.5" :space-between="1" loop>
        <swiper-slide v-for="coupon in displayCoupons" :key="coupon.id">
          <CouponCard :coupon="coupon" @click="goToCouponDetails(coupon.id)" @clip="handleClipCoupon(coupon.id)" />
        </swiper-slide>
      </swiper>
    </div>
    <div v-else>
      <CouponsSkeleton :count="1" />
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useRouter } from 'vue-router';
import { useCouponDetails } from '@/composables/useCouponDetails';
import { useClippedCoupons } from '@/composables/useClippedCoupons';
import CouponCard from './CouponCard.vue';
import CouponsSkeleton from './CouponsSkeleton.vue';
import 'swiper/css';
import { TokenStorage } from '@/utils/tokenStorage';
import CouponsApi from '@/axios/apiCoupons';

const props = defineProps({
  limit: {
    type: Number,
    default: 10
  }
});

const router = useRouter();
const { coupons, loading, fetchCoupons } = useCouponDetails();
const { addClippedCoupon } = useClippedCoupons();

// Only display up to the limit
const displayCoupons = computed(() => coupons.value.slice(0, props.limit));

// Watch for location changes
watch(() => localStorage.getItem('selectedLocation'), async (newLocation) => {
  if (newLocation) {
    await fetchCoupons({ limit: props.limit, offset: 0 });
  }
});

// Add a watch for authentication events
watch(() => TokenStorage.hasTokens(), async (isAuthenticated) => {
  if (isAuthenticated) {
    // Refresh coupons when user becomes authenticated
    await fetchCoupons({ limit: props.limit, offset: 0 });
  }
});

// Handle coupon clipping result
const handleClipCoupon = async (couponId) => {
  if (!TokenStorage.hasTokens()) {
    return;
  }

  try {
    await CouponsApi.clipCoupon(couponId);
    addClippedCoupon(couponId);

    // Find and update the coupon directly without creating a new array
    const coupon = coupons.value.find(coupon => coupon.id === couponId);
    if (coupon) {
      // Use direct property assignment to maintain reactivity
      coupon.clipped = true;
    }
  } catch (error) {
    console.error('Error clipping coupon:', error);
  }
};

const goToCouponDetails = (couponId) => {
  router.push(`/coupons/${couponId}`);
};

const goToCouponsArchive = () => {
  router.push({ name: 'Coupons' });
};

onMounted(async () => {
  const hasMidaxCoupons = import.meta.env.VITE_HAS_MIDAX_COUPONS === "true";
  
  if (hasMidaxCoupons) {
    // Only check for location if using Midax system
    const selectedLocation = localStorage.getItem('selectedLocation');
    if (selectedLocation) {
      await fetchCoupons({ limit: props.limit, offset: 0 });
    }
  } else {
    // For AppCard, fetch coupons immediately
    await fetchCoupons({ limit: props.limit, offset: 0 });
  }
  
  // Listen for location change events
  window.addEventListener('locationChanged', async () => {
    await fetchCoupons({ limit: props.limit, offset: 0 });
  });
});
</script>

<style scoped>
.swiper {
  padding-left: 12px;
  padding-right: 0px;
}

.swiper-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
}

h3.app-list-heading {
  font-size: 22px !important;
  font-weight: bold;
  margin-bottom: 0px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-list-subheading {
  margin-top: 0px;
  color: var(--ion-color-medium);
  font-size: 14px;
  line-height: 1.4;
}

ion-note {
  color: #000;
  font-weight: bold;
}

@media (max-width: 600px) {
  ion-text {
    font-size: 12px;
  }
}
</style>