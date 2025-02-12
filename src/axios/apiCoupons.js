import axios from 'axios';
import { TokenStorage } from '../utils/tokenStorage';

let couponsInstance;

class CouponsApi {
  constructor() {
    const base = axios.create({
      baseURL: import.meta.env.VITE_COUPONS_API,
      headers: {
        'Content-type': 'application/json',
        'x-api-key': import.meta.env.VITE_COUPONS_API_KEY,
        'Accept': '*/*'
      }
    });
    couponsInstance = base;
  }

  async getCategories() {
    const response = await couponsInstance({
      url: '/categories',
      method: 'GET',
      params: {
        merchant_id: import.meta.env.VITE_COUPONS_MERCHANT_ID
      }
    });
    return response.data;
  }

  async getCoupons({
    limit = 1000,
    offset = 0,
    category = null,
    sortBy = 'expires'
  } = {}) {
    const hasMidaxCoupons = import.meta.env.VITE_HAS_MIDAX_COUPONS === "true";
    const params = {
      sort_by: 'expires'
    };

    if (hasMidaxCoupons) {
      // For Midax system - always use batch loading with fixed limit
      params.location_id = localStorage.getItem('storeId');
      params.limit = '20'; // Fixed limit for Midax
      params.offset = offset.toString();
      
      // Only add card number if authenticated
      const CardNumber = localStorage.getItem('CardNumber');
      if (CardNumber) {
        params.Card_number = CardNumber;
      }
    } else {
      // For AppCard system - load all at once
      params.merchant_id = import.meta.env.VITE_COUPONS_MERCHANT_ID;
      params.limit = limit.toString();
      
      // Only add refresh token if authenticated
      const refreshToken = TokenStorage.getRefreshToken();
      if (refreshToken) {
        params.refresh_token = refreshToken;
      }
    }

    const response = await couponsInstance({
      url: '/offers',
      method: 'GET',
      params
    });

    return {
      ...response.data,
      hasMidaxCoupons // Add this flag to response to handle pagination appropriately
    };
  }

  async startCouponSignup(phoneNumber) {
    return await couponsInstance({
      url: '/start',
      method: 'POST',
      data: {
        deliveryMethod: "text",
        phoneNumber: `+1${phoneNumber}`,
        IsoCountryCode: "US"
      }
    });
  }

  async verifyCode(data) {
    return await couponsInstance({
      url: '/verify',
      method: 'POST',
      data: {
        phoneNumber: data.phoneNumber,
        pinCode: data.pinCode,
        IsoCountryCode: "US",
        merchantId: import.meta.env.VITE_COUPONS_MERCHANT_ID
      }
    });
  }

  async clipCoupon(offerId, cardNumber) {
    const hasMidaxCoupons = import.meta.env.VITE_HAS_MIDAX_COUPONS === "true";
    const hasAppCardCoupons = import.meta.env.VITE_HAS_APPCARD_COUPONS === "true";

    if (hasMidaxCoupons) {
      const CardNumber = localStorage.getItem('cardNumber');
      const storeId = localStorage.getItem('storeId');
      
      if (!CardNumber || !storeId) {
        throw new Error('Missing required Midax parameters');
      }
      
      // For Midax, use the provided call structure
      const options = {
        method: 'PUT',
        url: '/clip-coupon',
        data: {
          offer_id: offerId.toString(),
          store_id: storeId.toString(),
          card_number: CardNumber.toString(),
          app_id: import.meta.env.VITE_APP_ID,
          provider: 'QUOT'
        }
      };

      console.log('Clipping coupon with data:', options.data);

      try {
        const response = await couponsInstance.request(options);
        return response.data;
      } catch (error) {
        console.error('Clip coupon error details:', error.response?.data);
        throw error;
      }
    } else if (hasAppCardCoupons) {
      // For AppCard system
      const params = {
        offer_id: offerId,
        merchant_id: import.meta.env.VITE_COUPONS_MERCHANT_ID,
        refresh_token: TokenStorage.getRefreshToken()
      };

      try {
        const response = await couponsInstance({
          url: '/clip-coupon',
          method: 'PUT',
          params
        });
        return response.data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    } else {
      throw new Error('No valid coupon system configuration found');
    }
  }

  async getCouponById(id) {
    const hasMidaxCoupons = import.meta.env.VITE_HAS_MIDAX_COUPONS === "true";

    const params = {
      offer_id: id
    };

    if (hasMidaxCoupons) {
      // Use store_id for Midax system
      const storeId = localStorage.getItem('storeId');
      if (!storeId) {
        throw new Error('Missing store ID for Midax system');
      }
      params.location_id = storeId;
    } else {
      // Use merchant_id for App Card system
      params.merchant_id = import.meta.env.VITE_COUPONS_MERCHANT_ID;
    }

    return await couponsInstance({
      url: '/get-offer-by-id',
      method: 'GET',
      params
    });
  }

  async getCustomerInfo() {
    const refreshToken = TokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await couponsInstance({
      url: '/customer',
      method: 'GET',
      params: {
        merchant_id: import.meta.env.VITE_COUPONS_MERCHANT_ID,
        refresh_token: refreshToken
      }
    });

    return response.data;
  }

  async updateUserProfile(userProfile, refreshToken) {
    const data = {
      mini_site_additional_data: {
        Name: {
          "First Name": userProfile.firstName || '',
          "Last Name": userProfile.lastName || ''
        },
        Email: userProfile.email || '',
        Birthday: userProfile.birthday || '',
        "Address (full)": {
          Country: userProfile.country || '',
          State: userProfile.state || '',
          City: userProfile.city || '',
          Zip: userProfile.zipCode || '',
          Address1: userProfile.address1 || '',
          Address2: userProfile.address2 || ''
        }
      },
      opt_out_promotion: userProfile.optOutPromotion || false,
      do_not_sell_my_data: userProfile.doNotSellMyData || false
    };

    const response = await couponsInstance({
      url: '/customer',
      method: 'PUT',
      data,
      params: {
        merchant_id: import.meta.env.VITE_COUPONS_MERCHANT_ID,
        refresh_token: refreshToken
      }
    });

    return response.data;
  }

  async getOfferDetails() {
    const refreshToken = TokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await couponsInstance({
      url: '/offer-details',
      method: 'GET',
      params: {
        refresh_token: refreshToken
      }
    });

    return response.data;
  }

  isAuthenticated() {
    return TokenStorage.hasTokens();
  }
}

export default new CouponsApi();
