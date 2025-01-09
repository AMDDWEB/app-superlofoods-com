<template>
  <ion-card @click="handleCardClick">
    <!-- Image Container -->
    <ion-img 
      v-if="coupon.encoded_img" 
      class="coupon-image-container" 
      :src="coupon.encoded_img"
    ></ion-img>
    <div v-else class="coupon-image-container">
      <ion-spinner name="lines"></ion-spinner>
    </div>

    <!-- Text Content -->
    <span class="coupon-brand">{{ coupon.subtitle }}</span>
    <ion-card-title class="coupon-value ion-text-center">{{ coupon.title }}</ion-card-title>
    <span class="coupon-description truncate-multiline">{{ coupon.description }}</span>
    <span class="coupon-expiration ion-text-center">Expires {{ formatExpDate(coupon.to_date) }}</span>
    
    <!-- Button -->
    <ion-button 
      size="small" 
      color="danger" 
      fill="outline"
      style="display: flex; align-items: center;"
      @click.stop="handleClipClick"
      :disabled="isCouponClipped(coupon.id) || isClipping"
    >
      <ion-icon v-if="!isCouponClipped(coupon.id)" slot="start" :icon="cut"></ion-icon>
      {{ isCouponClipped(coupon.id) ? 'Clipped' : 'Clip Coupon' }}
    </ion-button>
  </ion-card>
  
  <SignupModal />
</template>

<script setup>
import { ref } from 'vue';
import { format } from 'date-fns';
import { IonCard, IonImg, IonIcon, IonButton, IonText, IonSpinner } from '@ionic/vue';
import { cut } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useSignupModal } from '@/composables/useSignupModal';
import { useClippedCoupons } from '@/composables/useClippedCoupons';
import CouponsApi from '@/axios/apiCoupons';
import { TokenStorage } from '@/utils/tokenStorage';

const router = useRouter();
const props = defineProps({
  coupon: {
    type: Object,
    required: true
  }
});

const handleCardClick = () => {
  router.push(`/coupons/${props.coupon.id}`);
};

const emit = defineEmits(['clip']);
const { openSignupModal, SignupModal } = useSignupModal();
const { isCouponClipped, addClippedCoupon } = useClippedCoupons();
const isClipping = ref(false);

const formatExpDate = (date) => format(new Date(date), 'MM/dd/yyyy');

const handleClipClick = async (event) => {
  event.stopPropagation(); // Prevent the card click event
  
  if (!TokenStorage.hasTokens()) {
    console.log('User not authenticated, opening signup modal');
    openSignupModal();
    return;
  }
  
  if (isClipping.value) return;
  
  isClipping.value = true;
  try {
    await CouponsApi.clipCoupon(props.coupon.id);
    addClippedCoupon(props.coupon.id); // Move this after successful API call
    emit('clip');
  } catch (error) {
    console.error('Error clipping coupon:', error);
  } finally {
    isClipping.value = false;
  }
};
</script>

<style scoped>
ion-card {
  padding-top: 10px;
  margin: 0 4px;
  border: 2px dashed var(--ion-color-light-shade);
  box-shadow: none;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.coupon-image-container {
  height: 100px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.coupon-brand {
  font-size: 12px;
  text-align: center;
  margin-top: 10px;
  color: var(--ion-color-dark);
}

.coupon-value {
  font-weight: bold;
  font-size: 16px;
  color: #ec0000;
  padding: 0;
  margin: 5px 0;
}

.coupon-description {
  font-size: 12px;
  margin: 0 10px;
  text-align: center;
  overflow: hidden;
}

.coupon-expiration {
  color: var(--ion-color-medium-shade);
  font-size: 12px;
  margin: 4px 0;
}

ion-button {
  margin: 5px 10px;
  height: 32px;
  --border-width: 1.5px;
}

ion-icon {
  margin-right: 4px;
  font-size: 12px;
}
</style> 