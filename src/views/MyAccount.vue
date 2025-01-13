<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <!-- Back button to navigate back one page -->
                    <ion-button @click="$router.go(-1)">
                        <ion-icon slot="icon-only" color="primary" name="back-button" class="toolbar-icon"></ion-icon>
                    </ion-button>
                </ion-buttons>
                <ion-title>My Account</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <!-- Display loyalty number if it exists -->
            <div class="loyalty-card" v-if="loyaltyNumber">
                <div class="loyalty-label">My Loyalty Number</div>
                <div class="loyalty-number">{{ formatPhone(loyaltyNumber) }}</div>
            </div>

            <!-- Display card number if it exists -->
            <div class="loyalty-card" v-if="cardNumber">
                <div class="loyalty-label">My Card Number</div>
                <div class="loyalty-number">{{ cardNumber }}</div>
                <div class="barcode-container ion-margin-top">
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
            </div>

            <!-- Button to open the contact form, visible only if loyalty number exists -->
            <ion-button @click="openContactForm" expand="block" fill="outline" color="danger"
                class="close-account-button" v-if="loyaltyNumber">Close My Account</ion-button>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { Browser } from '@capacitor/browser';
import { useSignupModal } from '@/composables/useSignupModal';
import VueBarcode from '@chenfengyuan/vue-barcode';

// Importing method to fetch loyalty number from a composable
const { getLoyaltyNumber, getCardNumber } = useSignupModal();
const loyaltyNumber = ref('');
const cardNumber = ref('');

// Set loyalty number on component mount and add event listener
onMounted(() => {
    loyaltyNumber.value = getLoyaltyNumber();
    cardNumber.value = getCardNumber();
    
    console.log('Initial Card Number:', cardNumber.value);

    // Update loyalty number if a 'userSignedUp' event is emitted
    window.addEventListener('userSignedUp', (event) => {
        loyaltyNumber.value = event.detail.loyaltyNumber;
        cardNumber.value = event.detail.cardNumber;
        console.log('Updated Card Number:', cardNumber.value);
    });
});

// Clean up event listener on component unmount
onUnmounted(() => {
    window.removeEventListener('userSignedUp', (event) => {
        loyaltyNumber.value = event.detail.loyaltyNumber;
        cardNumber.value = event.detail.cardNumber;
    });
});

// Function to open the contact form URL in a browser popover
const openContactForm = async () => {
    await Browser.open({
        url: import.meta.env.VITE_CONTACT_URL,
        presentationStyle: 'popover'
    });
};

// Function to format phone numbers to a standard format
const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
};

const isBarcodeDisplayed = ref(false);

const showBarcode = () => {
    console.log('Opening barcode');
    isBarcodeDisplayed.value = true;
};

const closeBarcode = () => {
    isBarcodeDisplayed.value = false;
};

const onBarcodeRender = () => {
    console.log('Barcode rendered successfully');
};

// Register the component
defineOptions({
    components: {
        VueBarcode
    }
});
</script>

<style scoped>
/* Styling for the back button icon */
.toolbar-icon {
    font-size: 20px !important;
}

/* Styling for the loyalty card */
.loyalty-card {
    background: var(--ion-color-light);
    margin: 16px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--ion-color-light-shade);
}

/* Styling for the loyalty label text */
.loyalty-label {
    color: var(--ion-color-medium);
    font-size: 14px;
    margin-bottom: 4px;
}

/* Styling for the loyalty number text */
.loyalty-number {
    color: var(--ion-color-dark);
    font-size: 18px;
    font-weight: 600;
}

/* Styling for the close account button */
.close-account-button {
    margin-top: 65px;
    max-width: 95%;
    margin: 65px auto 0 auto;
}

/* Add some spacing between the cards */
.loyalty-card + .loyalty-card {
    margin-top: 8px;
}

.barcode-container {
    background: white;
    padding: 10px;
    border-radius: 8px;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Make sure the barcode SVG is visible */
::v-deep svg {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
}
</style>