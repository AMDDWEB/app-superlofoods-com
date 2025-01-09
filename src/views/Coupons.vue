<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-segment v-model="selectedView" style="margin: 0 auto; width: 200px;">
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="clipped">
            <ion-label>Clipped ({{ getClippedCount() }})</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="coupon-grid">
        <div v-if="loading" class="loading-container">
          <ion-spinner></ion-spinner>
        </div>
        
        <div v-else-if="displayedCoupons.length === 0" class="no-coupons">
          <h3>{{ selectedView === 'clipped' ? 'No Clipped Coupons' : 'No Coupons Available' }}</h3>
          <p>{{ selectedView === 'clipped' ? 'Clip some coupons to see them here!' : 'Check back later for new deals.' }}</p>
        </div>

        <div v-else class="coupon-container">
          <CouponCard
            v-for="coupon in displayedCoupons"
            :key="coupon.id"
            :coupon="coupon"
            @click="goToCouponDetails(coupon.id)"
          />
        </div>
      </div>

      <ion-infinite-scroll
        @ionInfinite="loadMore"
        :disabled="!hasMoreCoupons || selectedView === 'clipped'"
      >
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>

    <SignupModal />
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonBackButton,
  IonTitle
} from '@ionic/vue';
import { useCouponDetails } from '@/composables/useCouponDetails';
import { useSignupModal } from '@/composables/useSignupModal';
import { useClippedCoupons } from '@/composables/useClippedCoupons';
import { useRouter } from 'vue-router';
import CouponCard from '@/components/CouponCard.vue';

const router = useRouter();
const { coupons, loading, fetchCoupons } = useCouponDetails();
const { isAuthenticated, openSignupModal, SignupModal } = useSignupModal();
const { clippedCoupons, addClippedCoupon, isCouponClipped, getClippedCount } = useClippedCoupons();

const offset = ref(0);
const limit = 100;
const hasMoreCoupons = ref(true);
const selectedView = ref('all');

const displayedCoupons = computed(() => {
  if (selectedView.value === 'clipped') {
    return coupons.value.filter(coupon => isCouponClipped(coupon.id));
  }
  return coupons.value;
});

const loadMore = async (event) => {
  if (selectedView.value === 'clipped') {
    event.target.complete();
    return;
  }
  
  offset.value += limit;
  await fetchCoupons({ limit, offset: offset.value });
  event.target.complete();
  
  // Check if we've reached the end
  if (coupons.value.length < offset.value + limit) {
    hasMoreCoupons.value = false;
  }
};

const goToCouponDetails = (couponId) => {
  router.push(`/coupons/${couponId}`);
};

onMounted(async () => {
  await fetchCoupons({ limit, offset: offset.value });
  window.addEventListener('userSignedUp', () => fetchCoupons({ limit, offset: 0 }));
});

onUnmounted(() => {
  window.removeEventListener('userSignedUp', () => fetchCoupons({ limit, offset: 0 }));
});
</script>

<style scoped>
.coupon-grid {
  padding: 16px;
}

.coupon-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.no-coupons {
  text-align: center;
  padding: 32px;
  color: var(--ion-color-medium);
}

.segment-container {
  padding: 8px 16px;
}

@media (min-width: 768px) {
  .coupon-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .coupon-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 