import { ref, computed } from 'vue'
import CouponsApi from '../axios/apiCoupons'
import { TokenStorage } from '../utils/tokenStorage'

const transformCouponData = (coupon) => ({
  id: coupon.id,
  title: coupon.title,
  subtitle: coupon.subtitle,
  description: coupon.description,
  category: coupon.category,
  to_date: coupon.to_date,
  value: coupon.value,
  disclaimer: coupon.disclaimer,
  encoded_img: coupon.encoded_img,
})

export function useCouponDetails() {
  const coupons = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentCoupon = ref(null)

  // Fetch all coupons
  const fetchCoupons = async ({ limit, offset } = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await CouponsApi.getCoupons({ limit, offset })
      const newCoupons = (response.items || []).map(transformCouponData)
      
      if (offset > 0) {
        // Append new coupons to existing ones
        coupons.value = [...coupons.value, ...newCoupons]
      } else {
        // Reset coupons if it's the initial load (offset = 0)
        coupons.value = newCoupons
      }
    } catch (err) {
      error.value = err.message || 'Failed to fetch coupons'
    } finally {
      loading.value = false
    }
  }

  // Fetch single coupon by ID
  const fetchCouponById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      // Check if the coupon exists in our current coupons array
      const found = coupons.value.find(c => c.id === id);
      if (found) {
        currentCoupon.value = found;
        return currentCoupon.value;
      }
      
      throw new Error('Coupon not found');
    } catch (err) {
      console.error('Error in fetchCouponById:', err);
      error.value = err.message || 'Failed to fetch coupon details';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Clip/save a coupon
  const clipCoupon = async (offerId) => {
    loading.value = true
    error.value = null
    try {
      const response = await CouponsApi.clipCoupon(offerId)
      return response
    } catch (err) {
      error.value = err.message || 'Failed to clip coupon'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Authentication methods
  const startSignup = async (phoneNumber) => {
    loading.value = true
    error.value = null
    try {
      return await CouponsApi.startCouponSignup(phoneNumber)
    } catch (err) {
      error.value = err.message || 'Failed to start signup'
      throw err
    } finally {
      loading.value = false
    }
  }

  const verifyCode = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await CouponsApi.verifyCode(data)
      
      // Move token handling here
      if (response) {
        const tokens = {
          access: response.access_token || response.accessToken || response.token,
          refresh: response.refresh_token || response.refreshToken
        };

        if (tokens.access && tokens.refresh) {
          TokenStorage.setTokens(tokens.access, tokens.refresh);
        }
      }
      
      return response
    } catch (err) {
      error.value = err.message || 'Failed to verify code'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Move isAuthenticated logic entirely to composable
  const isAuthenticated = computed(() => TokenStorage.hasTokens())

  // Helper methods
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    coupons,
    loading,
    error,
    currentCoupon,
    
    // Methods
    fetchCoupons,
    fetchCouponById,
    clipCoupon,
    startSignup,
    verifyCode,
    clearError,
    
    // Computed
    isAuthenticated,
  }
} 