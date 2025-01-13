<template>
  <ion-content class="ion-padding">
    <div class="barcode-container">
      <h2>My Card</h2>
      <vue-barcode
        :value="cardNumber"
        :options="{
          format: 'UPC',
          width: 2,
          height: 100,
          displayValue: true,
          background: '#ffffff',
          lineColor: '#000000',
          margin: 10
        }"
        @render="onBarcodeRender"
      ></vue-barcode>
    </div>
  </ion-content>
</template>

<script setup>
import { IonContent } from '@ionic/vue';
import VueBarcode from '@chenfengyuan/vue-barcode';
import { useSignupModal } from '@/composables/useSignupModal';

const { getCardNumber } = useSignupModal();
const cardNumber = getCardNumber();

const onBarcodeRender = () => {
  console.log('Barcode rendered successfully');
};

defineOptions({
  components: {
    VueBarcode
  }
});
</script>

<style scoped>
.barcode-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

h2 {
  margin-bottom: 20px;
  color: var(--ion-color-dark);
}
</style> 