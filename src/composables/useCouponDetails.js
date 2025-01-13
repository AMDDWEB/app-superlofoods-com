import { ref, computed } from 'vue'
import CouponsApi from '@/axios/apiCoupons'
import { TokenStorage } from '../utils/tokenStorage'

const coupons = ref([]);
const loading = ref(false);
const categories = ref([]);
const selectedSort = ref('newest');
const allCoupons = ref([]);

export function useCouponDetails() {
  // Helper function to load all coupons
  const loadAllCoupons = async () => {
    try {
      loading.value = true;
      let allLoaded = false;
      let currentOffset = 0;
      const batchSize = 100;
      const tempCoupons = [];

      while (!allLoaded) {
        const response = await CouponsApi.getCoupons({
          limit: batchSize,
          offset: currentOffset,
          sortBy: selectedSort.value
        });

        tempCoupons.push(...response.items);

        if (response.items.length < batchSize) {
          allLoaded = true;
        } else {
          currentOffset += batchSize;
        }
      }

      return tempCoupons;
    } catch (error) {
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async () => {
    try {
      // Load all coupons first
      const allLoadedCoupons = await loadAllCoupons();

      // Store all coupons for filtering
      allCoupons.value = allLoadedCoupons.map(coupon => ({
        ...coupon,
        category: coupon.category || 'Uncategorized'
      }));

      // Extract unique categories from coupons that have at least one coupon
      const categoryCounts = allCoupons.value.reduce((acc, coupon) => {
        const category = coupon.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Only include categories that have coupons
      const uniqueCategories = Object.entries(categoryCounts)
        .filter(([_, count]) => count > 0)
        .map(([category]) => category)
        .sort();

      categories.value = ['All Coupons', ...uniqueCategories];

      // Initialize coupons with all available coupons
      coupons.value = allCoupons.value;
    } catch (error) {
      categories.value = ['All Coupons'];
    }
  };

  const fetchCoupons = async ({
    limit = 1000,
    offset = 0,
    category = null
  } = {}) => {
    loading.value = true;
    try {
      // Get all coupons at once if they haven't been loaded yet
      if (allCoupons.value.length === 0) {
        const loadedCoupons = await loadAllCoupons();
        allCoupons.value = loadedCoupons.map(coupon => ({
          ...coupon,
          category: coupon.category || 'Uncategorized'
        }));
      }

      if (category && category !== 'All Coupons') {
        // Filter from allCoupons if category is selected
        const filteredCoupons = allCoupons.value.filter(
          coupon => coupon.category === category
        );
        coupons.value = filteredCoupons;
        return filteredCoupons.length;
      } else {
        // Use all coupons for 'All Coupons'
        coupons.value = allCoupons.value;
        return allCoupons.value.length;
      }
    } catch (error) {
      return 0;
    } finally {
      loading.value = false;
    }
  };

  const availableCategories = computed(() => categories.value);

  return {
    coupons,
    loading,
    fetchCoupons,
    fetchCategories,
    availableCategories,
    changeSort: async (newSort) => {
      selectedSort.value = newSort;
      await loadAllCoupons(); // Reload all coupons with new sort
      return fetchCoupons({ limit: 100, offset: 0 });
    }
  };
} 