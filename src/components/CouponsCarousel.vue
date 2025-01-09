<template>
  <div class="ion-margin-bottom">
    <ion-list lines="none">
      <ion-item @click="goToCouponsArchive">
        <ion-text>
          <h3 class="app-list-heading">
            Clip & Save Coupons
            <ion-icon
              style="font-size: 16px;"
              name="chevron-right"
              color="medium"
            ></ion-icon>
          </h3>
          <p class="app-list-subheading">Don't miss out on these amazing deals!</p>
        </ion-text>
      </ion-item>
    </ion-list>

    <div v-if="!loading">
      <swiper @swiper="onSwiper" :slides-per-view="2.5" :space-between="1" loop>
        <swiper-slide v-for="coupon in displayCoupons" :key="coupon.id">
          <CouponCard 
            :coupon="coupon"
            @click="goToCouponDetails(coupon.id)"
            @clip="handleClipCoupon(coupon.id)"
          />
        </swiper-slide>
      </swiper>
    </div>
    <div v-else>
      <CouponsSkeleton :count="3" />
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
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
    addClippedCoupon(couponId); // Add to clipped coupons
    // Refresh coupons after successful clip
    await fetchCoupons({ limit: props.limit, offset: 0 });
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

// Fetch coupons when component is mounted
fetchCoupons({ limit: props.limit, offset: 0 });
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