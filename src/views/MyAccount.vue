<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <!-- Back button to navigate back one page -->
                    <ion-button @click="$router.go(-1)">
                        <ion-icon color="primary" name="back-button" size="small"></ion-icon>
                    </ion-button>
                </ion-buttons>

                <ion-buttons slot="end">
                    <!-- Back button to navigate back one page -->
                    <ion-button @click="presentUserProfileModal" v-if="loyaltyNumber">
                        <ion-icon color="primary" name="my-account-regular" size="small"></ion-icon>
                    </ion-button>
                </ion-buttons>

                <ion-title><ion-img class="app-toolbar-image" :src="logoUrl"></ion-img></ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <h1 class="user-welcome-heading ion-padding">Hi, {{ formattedUserName }}!</h1>
            <!-- Display loyalty number if it exists -->
            <div class="loyalty-card" v-if="loyaltyNumber">
                <div class="loyalty-label">My Loyalty Number</div>
                <div class="loyalty-number">{{ formatPhone(loyaltyNumber) }}</div>
            </div>

            <!-- Display card number if it exists -->
            <div class="loyalty-card" v-if="cardNumber">
                <div class="loyalty-card-details"><!--{{ cardNumber }}-->Please present this card to the cashier to
                    redeem your coupons.</div>
                <div class="barcode-container ion-margin-top">
                    <vue-barcode :value="cardNumber" :options="{
                        format: 'CODE128',
                        width: 2.5,
                        height: 50,
                        displayValue: false,
                        background: '#f7f7f7',
                        lineColor: '#000000',
                        margin: 10
                    }" @render="onBarcodeRender"></vue-barcode>
                </div>
            </div>

            <!-- Button to open the contact form, visible only if loyalty number exists -->
            <ion-button @click="openContactForm" expand="block" color="danger" class="close-account-button"
                v-if="loyaltyNumber">Close My Account</ion-button>

            <UserProfileDetailsModal :isOpen="showUserProfileModal" @update:isOpen="showUserProfileModal = $event" />
        </ion-content>
    </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon, IonImg } from '@ionic/vue';
import { Browser } from '@capacitor/browser';
import { useSignupModal } from '@/composables/useSignupModal';
import UserProfileDetailsModal from '@/components/UserProfileDetailsModal.vue';
import VueBarcode from '@chenfengyuan/vue-barcode';
import CouponsApi from '@/axios/apiCoupons'; // Import CouponsApi

// Importing method to fetch loyalty number from a composable
const { getLoyaltyNumber, getCardNumber } = useSignupModal();
const loyaltyNumber = ref('');
const cardNumber = ref('');
const logoUrl = ref(import.meta.env.VITE_PRIMARY_LOGO);
const showUserProfileModal = ref(false);
const userName = ref(''); // Initialize as an empty string

// Computed property to capitalize the first letter of the user's name
const formattedUserName = computed(() => {
    if (!userName.value) return '';
    return userName.value.charAt(0).toUpperCase() + userName.value.slice(1);
});

const presentUserProfileModal = () => {
    showUserProfileModal.value = true;
};

// Set loyalty number on component mount and add event listener
onMounted(async () => {
    loyaltyNumber.value = getLoyaltyNumber();
    cardNumber.value = getCardNumber();

    console.log('Initial Card Number:', cardNumber.value);

    // Fetch customer info
    try {
        const customerInfo = await CouponsApi.getCustomerInfo();
        console.log('Customer Info:', customerInfo);
        userName.value = customerInfo.FirstName || ''; // Set userName after fetching
        console.log('User Name:', userName.value);
    } catch (error) {
        console.error('Failed to fetch customer info:', error);
    }

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

.loyalty-card-details {
    color: var(--ion-color-medium);
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
.loyalty-card+.loyalty-card {
    margin-top: 8px;
}

.barcode-container {
    /* background: white; */
    padding: 10px;
    border-radius: 8px;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.user-welcome-heading {
  font-weight: 800;
}
</style>