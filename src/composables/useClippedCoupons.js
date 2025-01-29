import { ref, watch } from 'vue';

// Initialize with stored coupons or empty set
const storedCoupons = localStorage.getItem('clippedCoupons');
const clippedCoupons = ref(new Set(storedCoupons ? JSON.parse(storedCoupons) : []));

// Persist changes to localStorage
watch(clippedCoupons, (newValue) => {
  localStorage.setItem('clippedCoupons', JSON.stringify([...newValue]));
}, { deep: true });

export function useClippedCoupons() {
  const addClippedCoupon = (couponId) => {
    if (!clippedCoupons.value.has(couponId)) {
      clippedCoupons.value = new Set([...clippedCoupons.value, couponId]);
    }
  };

  const isCouponClipped = (couponId) => {
    return clippedCoupons.value.has(couponId);
  };

  return {
    clippedCoupons,
    addClippedCoupon,
    isCouponClipped
  };
} 