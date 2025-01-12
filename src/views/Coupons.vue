<template>
  <ion-page>
    <ion-header>
      <!-- All/Clipped Toggle First -->
      <ion-toolbar>
        <ion-segment class="coupon-toggle" v-model="selectedView" style="margin: 0 auto; width: 200px;">
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="clipped">
            <ion-label>Clipped ({{ getClippedCount() }})</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>

      <!-- Category Menu Second -->
      <ion-toolbar>
        <ion-segment
          mode="ios"
          scrollable
          class="ion-padding-start coupon-categories coupon-categories-ion-segment"
          :value="selectedCategory"
        >
          <ion-segment-button class="coupon-categories-ion-segment-button"
            v-for="category in sortedCategories"
            :key="category"
            :value="category"
            @click="setCategory(category)"
          >
            {{ category }}
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="coupon-grid">
        <div v-if="loading" class="loading-container">
          <ion-spinner name="crescent" class="app-loading-spinner"></ion-spinner>
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
        :disabled="true"
      >
        <ion-infinite-scroll-content></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>

    <SignupModal />
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useCouponDetails } from '@/composables/useCouponDetails';
import { useSignupModal } from '@/composables/useSignupModal';
import { useClippedCoupons } from '@/composables/useClippedCoupons';
import { useRouter } from 'vue-router';
import CouponCard from '@/components/CouponCard.vue';
import { IonPage, IonHeader, IonToolbar, IonContent, IonSegment, IonSegmentButton, 
         IonLabel, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue';

const router = useRouter();
const { coupons, loading, fetchCoupons, availableCategories, fetchCategories } = useCouponDetails();
const { isAuthenticated, openSignupModal, SignupModal } = useSignupModal();
const { clippedCoupons, isCouponClipped, getClippedCount } = useClippedCoupons();

const offset = ref(0);
const limit = 100;
const hasMoreCoupons = ref(true);
const selectedView = ref('all');
const selectedCategory = ref('All Coupons');

const sortedCategories = computed(() => {
  console.log('Available categories:', availableCategories.value);
  const filteredCategories = availableCategories.value
    .filter(category => category !== 'All Coupons')
    .sort((a, b) => a.localeCompare(b));
  
  const result = ['All Coupons', ...filteredCategories];
  console.log('Sorted categories:', result);
  return result;
});

const displayedCoupons = computed(() => {
  let filtered = coupons.value;
  
  // Filter by category if not "All Coupons"
  if (selectedCategory.value !== 'All Coupons') {
    filtered = filtered.filter(coupon => coupon.category === selectedCategory.value);
  }
  
  // Filter by clipped status
  if (selectedView.value === 'clipped') {
    filtered = filtered.filter(coupon => isCouponClipped(coupon.id));
  }
  
  return filtered;
});

const setCategory = async (category) => {
  selectedCategory.value = category;
  offset.value = 0;
  await fetchCoupons({ limit, offset: 0 });
};

const loadMore = async (event) => {
  if (selectedView.value === 'clipped') {
    event.target.complete();
    return;
  }
  
  offset.value += limit;
  await fetchCoupons({ limit, offset: offset.value });
  event.target.complete();
  
  if (coupons.value.length < offset.value + limit) {
    hasMoreCoupons.value = false;
  }
};

const goToCouponDetails = (couponId) => {
  router.push(`/coupons/${couponId}`);
};

onMounted(async () => {
  await fetchCategories();
  await fetchCoupons({ limit, offset: offset.value });
  window.addEventListener('userSignedUp', () => fetchCoupons({ limit, offset: 0 }));
});

onUnmounted(() => {
  window.removeEventListener('userSignedUp', () => fetchCoupons({ limit, offset: 0 }));
});
</script>

<style scoped>
.coupon-grid {
  padding-top: 20px;
  padding-left: 10px;
  padding-right: 10px;
}

.coupon-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: 14px;
  column-gap: 6px;
}

.coupon-categories-ion-segment {
  --background: var(--ion-color-light);
}
.coupon-categories-ion-segment-button::before {
  content: none;
}
.coupon-categories-ion-segment-button {
  border: none;
  text-transform: capitalize;
  margin-bottom: 8px;
}
.coupon-categories-ion-segment-button.segment-button-checked {
  background: var(--ion-color-primary) !important;
  color: #fff;
  /* height: 24px; */
  /* border-radius: 20px; */
}
.coupon-categories-ion-segment-button::part(indicator-background) {
  height: 0px;
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