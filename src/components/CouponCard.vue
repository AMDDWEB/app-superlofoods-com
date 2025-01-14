<template>
  <ion-card @click="handleCardClick">
    <!-- Image Container -->
    <ion-img v-if="coupon.encoded_img" class="coupon-image-container" :src="coupon.encoded_img"></ion-img>
    <div v-else class="coupon-image-container">
      <ion-spinner name="lines"></ion-spinner>
    </div>

    <!-- Text Content -->
    <span class="coupon-brand truncate">{{ coupon.subtitle }}</span>
    <ion-card-title class="coupon-value ion-text-center truncate">{{ coupon.title }}</ion-card-title>
    <span class="coupon-description truncate-multiline">{{ coupon.description }}</span>
    <span class="coupon-expiration ion-text-center">Expires {{ formatExpDate(coupon.to_date) }}</span>

    <!-- Button -->
    <ion-button size="small" :color="isCouponClipped(coupon.id) ? 'success' : 'danger'" fill="solid"
      style="display: flex; align-items: center; width: 90%;" :disabled="isCouponClipped(coupon.id)"
      @click.stop="handleClipClick">
      <ion-icon slot="start" name="coupons-regular"></ion-icon>
      {{ isCouponClipped(coupon.id) ? 'Clipped' : 'Clip Coupon' }}
    </ion-button>
  </ion-card>


  <!-- Coupon Modal -->
  <ion-modal :is-open="showCouponModal" @didDismiss="closeCouponModal" :presenting-element="presentingElement"
    :initial-breakpoint="1" :breakpoints="[0, 1]">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button @click="closeCouponModal">Close</ion-button>
        </ion-buttons>
        <ion-title>Coupon Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-segment class="coupon-details-segment" v-model="selectedSegment">
        <ion-segment-button value="details">
          <ion-label>Details</ion-label>
        </ion-segment-button>
        <ion-segment-button value="terms">
          <ion-label>Terms</ion-label>
        </ion-segment-button>
      </ion-segment>

      
      <div class="coupon-details-card" v-if="selectedSegment === 'details'">
        <span class="coupon-details-label">{{ coupon.title }} on {{ coupon.subtitle }}</span><br>
        <span class="coupon-details-text">{{ coupon.description }}</span>
      </div>
      <ion-img v-if="coupon.encoded_img, selectedSegment === 'details'" class="coupon-details-image" :src="coupon.encoded_img"></ion-img>

      <div class="coupon-details-card" v-if="selectedSegment === 'terms'">
        <span class="coupon-details-label">Coupon Expires on {{ formatExpDate(coupon.to_date) }}</span><br>
        <span class="coupon-details-text">{{ coupon.disclaimer }}</span>
      </div>
    </ion-content>
  </ion-modal>

  <!-- Signup Modal -->
  <SignupModal />
</template>

<script setup>
import { ref } from 'vue';
import { format } from 'date-fns';
import { IonCard, IonImg, IonIcon, IonButton, IonText, IonSpinner, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue';
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

//const presentingElement = ref(document.querySelector('ion-router-outlet'));
const emit = defineEmits(['clip']);
const { openSignupModal, SignupModal } = useSignupModal();
const { isCouponClipped, addClippedCoupon } = useClippedCoupons();
const isClipping = ref(false);
const showCouponModal = ref(false);
const selectedSegment = ref('details');

const formatExpDate = (date) => format(new Date(date), 'MM/dd/yyyy');

const handleCardClick = () => {
  showCouponModal.value = true;
};

const closeCouponModal = () => {
  showCouponModal.value = false;  // Resets the modal state properly after close
};

const handleClipClick = async (event) => {
  event.stopPropagation(); // Prevent the card click event

  if (!TokenStorage.hasTokens()) {
    openSignupModal({ presentationStyle: 'popover' });
    return;
  }

  if (isClipping.value || isCouponClipped(props.coupon.id)) return;

  isClipping.value = true;
  try {
    await CouponsApi.clipCoupon(props.coupon.id);
    addClippedCoupon(props.coupon.id);
    emit('clip');
  } catch (error) {
    console.error('Error clipping coupon:', error);
  } finally {
    isClipping.value = false;
  }
};
</script>

<style scoped>
/* Styles maintained as requested */
ion-card {
  padding-top: 10px;
  margin: 0 4px;
  border: 2px dashed var(--ion-color-light-shade);
  box-shadow: none;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
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
  color: var(--ion-color-medium-shade);
}

.coupon-value {
  font-weight: bold;
  font-size: 16px;
  color: var(--ion-color-danger);
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

.coupon-details-segment {
  margin-left: auto;
  margin-right: auto;
  width: 60%;
  margin-top: 20px;
  align-items: center;
}

.coupon-details-card {
  background: var(--ion-color-light);
  margin: 16px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.coupon-details-label {
  color: var(--ion-color-medium);
  font-size: 14px;
  margin-bottom: 4px;
}

.coupon-details-text {
  color: var(--ion-color-dark);
  font-size: 16px;
  font-weight: 600;
}

.coupon-details-image {
  height: auto;
  width: 65%;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 25px;
}
</style>