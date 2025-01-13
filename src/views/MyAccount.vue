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

// Importing method to fetch loyalty number from a composable
const { getLoyaltyNumber } = useSignupModal();
const loyaltyNumber = ref('');

// Set loyalty number on component mount and add event listener
onMounted(() => {
    loyaltyNumber.value = getLoyaltyNumber();

    // Update loyalty number if a 'userSignedUp' event is emitted
    window.addEventListener('userSignedUp', (event) => {
        loyaltyNumber.value = event.detail.loyaltyNumber;
    });
});

// Clean up event listener on component unmount
onUnmounted(() => {
    window.removeEventListener('userSignedUp', (event) => {
        loyaltyNumber.value = event.detail.loyaltyNumber;
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
</style>