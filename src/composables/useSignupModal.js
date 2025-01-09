import { ref, computed, h } from 'vue';
import CouponsApi from '../axios/apiCoupons';
import { TokenStorage } from '../utils/tokenStorage';
import { 
  IonModal,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/vue';
import { closeOutline, alertCircleOutline } from 'ionicons/icons';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export function useSignupModal() {
  const showModal = ref(false);
  const currentStep = ref(1);
  const phoneNumber = ref('');
  const pinCode = ref('');
  const isLoading = ref(false);
  const errorMessage = ref('');
  const isAuthenticated = ref(CouponsApi.isAuthenticated());
  const router = useRouter();
  
  const stepTitle = computed(() => {
    switch(currentStep.value) {
      case 1:
        return 'Enter Your Phone Number';
      case 2:
        return 'Verify Your Number';
      case 3:
        return 'Welcome Aboard! 🎉';
      default:
        return '';
    }
  });

  const stepDescription = computed(() => {
    switch(currentStep.value) {
      case 1:
        return "We'll send you a text message with your verification code.";
      case 2:
        return `Enter the 4-digit code sent to ${formatPhone(phoneNumber.value)}`;
      case 3:
        return "You're all set to start saving! Your account has been created successfully.";
      default:
        return '';
    }
  });

  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
  };

  const validatePhoneNumber = (value) => {
    return value.match(/^\d{10}$/);
  };

  const validatePinCode = (value) => {
    return value.match(/^\d{4}$/);
  };

  const openSignupModal = () => {
    showModal.value = true;
    currentStep.value = 1;
    phoneNumber.value = '';
    pinCode.value = '';
    errorMessage.value = '';
  };

  const closeSignupModal = () => {
    showModal.value = false;
    currentStep.value = 1;
    phoneNumber.value = '';
    pinCode.value = '';
    errorMessage.value = '';
  };

  const handlePhoneInput = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    phoneNumber.value = value;
    errorMessage.value = '';
  };

  const handlePinInput = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      pinCode.value = value;
      errorMessage.value = '';
    }
  };

  const submitPhoneNumber = async () => {
    const cleanPhone = phoneNumber.value.replace(/\D/g, '');
    
    if (!validatePhoneNumber(cleanPhone)) {
      errorMessage.value = 'Please enter a valid phone number';
      return;
    }

    isLoading.value = true;
    try {
      const { status } = await CouponsApi.startCouponSignup(cleanPhone);
      if (status === 200) {
        currentStep.value = 2;
        errorMessage.value = '';
      }
    } catch (err) {
      errorMessage.value = 'Failed to send code. Please try again.';
      console.error('Signup error:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const submitVerification = async () => {
    if (!validatePinCode(pinCode.value)) {
      errorMessage.value = 'Please enter a valid 4-digit code';
      return;
    }

    isLoading.value = true;
    try {
      const response = await CouponsApi.verifyCode({
        phoneNumber: `+1${phoneNumber.value}`,
        pinCode: pinCode.value,
        IsoCountryCode: "US",
        merchantId: import.meta.env.VITE_COUPONS_MERCHANT_ID
      });
      
      // The tokens are nested inside response.data
      const tokens = {
        access: response.data.access_token,
        refresh: response.data.refresh_token
      };

      if (tokens.access && tokens.refresh) {
        // Store tokens
        TokenStorage.setTokens(tokens.access, tokens.refresh);
        console.log('Tokens stored successfully');

        // Update authentication state
        isAuthenticated.value = true;
        
        // Move to next step
        currentStep.value = 3;
        errorMessage.value = '';

        // Notify other components
        window.dispatchEvent(new Event('userSignedUp'));
      } else {
        throw new Error('Missing tokens in response');
      }
    } catch (err) {
      console.error('Verification Error:', err);
      errorMessage.value = 'Invalid code. Please try again.';
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuthStatus = () => {
    isAuthenticated.value = CouponsApi.isAuthenticated();
    if (isAuthenticated.value) {
      console.log('User is authenticated');
      CouponsApi.logStoredTokens(); // Log the stored tokens
    } else {
      console.log('User is not authenticated');
    }
    return isAuthenticated.value;
  };

  const clipCoupon = async (offerId) => {
    if (!TokenStorage.hasTokens()) {
      openSignupModal();
      return false;
    }

    try {
      const response = await CouponsApi.clipCoupon(offerId);
      return response.status === 200;
    } catch (error) {
      console.error('Error clipping coupon:', error);
      return false;
    }
  };

  // Create the modal component within the composable
  const SignupModal = defineComponent({
    setup() {
      return () => h(IonModal, {
        isOpen: showModal.value,
        onDidDismiss: closeSignupModal,
        class: 'auth-modal'
      }, [
        h(IonContent, { class: 'ion-padding modal-content-wrapper' }, [
          h('div', { class: 'modal-content' }, [
            // Progress Steps
            h('div', { class: 'progress-steps' }, [
              h('div', { 
                class: `step ${currentStep.value === 1 ? 'active' : currentStep.value > 1 ? 'completed' : ''}`,
              }, '1'),
              h('div', { class: 'step-line' }),
              h('div', { 
                class: `step ${currentStep.value === 2 ? 'active' : currentStep.value > 2 ? 'completed' : ''}`,
              }, '2'),
              h('div', { class: 'step-line' }),
              h('div', { 
                class: `step ${currentStep.value === 3 ? 'active' : ''}`,
              }, '3')
            ]),

            // Close Button (only show on steps 1 and 2)
            currentStep.value < 3 && h(IonButton, {
              fill: 'clear',
              class: 'close-button',
              onClick: closeSignupModal
            }, () => h(IonIcon, { icon: closeOutline })),

            // Header with contextual emoji
            h('div', { class: 'header-section' }, [
              h('div', { class: 'emoji-wrapper' }, 
                currentStep.value === 1 ? '👋' : 
                currentStep.value === 2 ? '📱' : 
                '🎉'
              ),
              h('h1', stepTitle.value),
              h('p', { class: 'subtitle' }, stepDescription.value)
            ]),

            // Phone Input Step
            currentStep.value === 1 && h('div', { class: 'form-section fade-in' }, [
              h(IonItem, { class: 'custom-input' }, [
                h(IonLabel, { position: 'stacked' }, 'Phone Number'),
                h(IonInput, {
                  type: 'tel',
                  value: phoneNumber.value,
                  onIonInput: handlePhoneInput,
                  placeholder: '(555) 555-5555',
                  disabled: isLoading.value,
                  class: 'phone-input'
                })
              ]),
              h(IonButton, {
                expand: 'block',
                class: 'submit-button',
                onClick: submitPhoneNumber,
                disabled: isLoading.value || !phoneNumber.value
              }, () => isLoading.value ? h(IonSpinner, { name: 'crescent' }) : 'Continue')
            ]),

            // Verification Step
            currentStep.value === 2 && h('div', { class: 'form-section fade-in' }, [
              h(IonItem, { class: 'custom-input' }, [
                h(IonLabel, { position: 'stacked' }, 'Verification Code'),
                h(IonInput, {
                  type: 'tel',
                  value: pinCode.value,
                  onIonInput: handlePinInput,
                  placeholder: 'Enter 4-digit code',
                  disabled: isLoading.value,
                  maxlength: 4,
                  class: 'verification-input'
                })
              ]),
              h(IonButton, {
                expand: 'block',
                class: 'submit-button',
                onClick: submitVerification,
                disabled: isLoading.value || !pinCode.value
              }, () => isLoading.value ? h(IonSpinner, { name: 'crescent' }) : 'Verify')
            ]),

            // Success Step
            currentStep.value === 3 && h('div', { class: 'form-section fade-in success-section' }, [
              h('div', { class: 'success-actions' }, [
                h(IonButton, {
                  expand: 'block',
                  class: 'action-button primary',
                  onClick: () => {
                    closeSignupModal();
                    router.push('/tabs/coupons');
                  }
                }, 'View Coupons'),
                
                h(IonButton, {
                  expand: 'block',
                  fill: 'outline',
                  class: 'action-button secondary',
                  onClick: () => {
                    closeSignupModal();
                    router.push('/tabs/preferences');
                  }
                }, 'Manage Preferences')
              ]),
              
              h('p', { class: 'preferences-note' }, [
                'Want to update your preferences or unsubscribe? ',
                h('a', { 
                  href: '#',
                  onClick: (e) => {
                    e.preventDefault();
                    closeSignupModal();
                    router.push('/tabs/preferences');
                  }
                }, 'Visit your account settings')
              ])
            ]),

            // Error Message
            errorMessage.value && h('div', { class: 'error-container' }, [
              h(IonIcon, { icon: alertCircleOutline, color: 'danger' }),
              h('p', errorMessage.value)
            ]),

            // Footer
            h('div', { class: 'footer-section' }, [
              h('p', { class: 'terms-text' }, [
                'By continuing, you agree to our ',
                h('a', { href: '#' }, 'Terms'),
                ' and ',
                h('a', { href: '#' }, 'Privacy Policy')
              ])
            ])
          ])
        ])
      ])
    }
  });

  // Enhanced styles
  const style = document.createElement('style');
  style.textContent = `
    .auth-modal {
      --height: 100%;
      --border-radius: 24px;
      --background: #ffffff;
    }

    .modal-content-wrapper {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    }

    .modal-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 24px;
      max-width: 400px;
      margin: 0 auto;
      position: relative;
    }

    .progress-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
      margin-top: 16px;
    }

    .step {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--ion-color-medium-tint);
      color: var(--ion-color-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .step.active {
      background: var(--ion-color-primary);
      color: white;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
    }

    .step-line {
      height: 2px;
      width: 60px;
      background: var(--ion-color-medium-tint);
      margin: 0 8px;
    }

    .close-button {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 1;
      --padding-start: 8px;
      --padding-end: 8px;
      --color: var(--ion-color-medium);
    }

    .header-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .emoji-wrapper {
      font-size: 48px;
      margin-bottom: 16px;
      animation: bounce 0.6s ease;
    }

    .header-section h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--ion-color-dark);
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 16px;
      color: var(--ion-color-medium);
      line-height: 1.6;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .custom-input {
      --background: transparent;
      --border-color: var(--ion-color-medium-shade);
      --border-radius: 12px;
      --border-width: 1px;
      margin-bottom: 24px;
      --highlight-height: 2px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .custom-input.ion-valid {
      --border-color: var(--ion-color-success);
    }

    .phone-input {
      font-size: 18px;
      --padding: 12px;
    }

    .verification-input {
      letter-spacing: 8px;
      font-size: 32px !important;
      text-align: center;
      font-weight: 600;
    }

    .submit-button {
      --background: var(--ion-color-primary);
      --border-radius: 12px;
      margin-top: 24px;
      height: 52px;
      font-size: 16px;
      font-weight: 600;
      text-transform: none;
      --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
    }

    .submit-button:hover {
      --background: var(--ion-color-primary-shade);
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }

    .error-container {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--ion-color-danger-tint);
      padding: 16px;
      border-radius: 12px;
      margin-top: 16px;
      animation: shake 0.4s ease-in-out;
    }

    .footer-section {
      margin-top: auto;
      text-align: center;
      padding-bottom: 24px;
    }

    .terms-text {
      font-size: 13px;
      color: var(--ion-color-medium);
      line-height: 1.4;
    }

    .terms-text a {
      color: var(--ion-color-primary);
      text-decoration: none;
    }

    .fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-20px);
      }
      60% {
        transform: translateY(-10px);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }

    .step.completed {
      background: var(--ion-color-success);
      color: white;
    }

    .success-section {
      text-align: center;
    }

    .success-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 32px;
    }

    .action-button {
      height: 52px;
      font-size: 16px;
      font-weight: 600;
      text-transform: none;
    }

    .action-button.primary {
      --background: var(--ion-color-primary);
      --border-radius: 12px;
      --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.2);
    }

    .action-button.secondary {
      --border-radius: 12px;
      --border-color: var(--ion-color-primary);
      --color: var(--ion-color-primary);
    }

    .preferences-note {
      margin-top: 32px;
      font-size: 14px;
      color: var(--ion-color-medium);
      line-height: 1.6;
    }

    .preferences-note a {
      color: var(--ion-color-primary);
      text-decoration: none;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);

  return {
    showModal,
    isAuthenticated,
    openSignupModal,
    closeSignupModal,
    clipCoupon,
    SignupModal
  };
} 