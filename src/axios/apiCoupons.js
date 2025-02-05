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
    limit = 60,
    offset = 0,
    category = null,
    sortBy = 'expires'
  } = {}) {
    const hasMidaxCoupons = import.meta.env.VITE_HAS_MIDAX_COUPONS === "true";
    const params = {
      limit: '60',
      sort_by: 'expires'
    };

    if (hasMidaxCoupons) {
      // For Midax system
      params.location_id = localStorage.getItem('storeId');
      
      // Only add card number if authenticated
      const cardNumber = localStorage.getItem('cardNumber');
      if (cardNumber) {
        params.card_number = cardNumber;
      }
    } else {
      // For AppCard system
      params.merchant_id = import.meta.env.VITE_COUPONS_MERCHANT_ID;
      
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

    return response.data;
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

  async clipCoupon(offerId) {
    const hasMidaxCoupons = import.meta.env.VITE_HAS_MIDAX_COUPONS === "true";
    const params = { offer_id: offerId };

    if (hasMidaxCoupons) {
      const cardNumber = localStorage.getItem('cardNumber');
      const storeId = localStorage.getItem('storeId');
      
      if (!cardNumber || !storeId) {
        throw new Error('Missing required Midax parameters');
      }
      
      // For Midax, send data in the request body instead of params
      return await couponsInstance({
        url: '/clip-coupon',
        method: 'PUT',
        data: {
          offer_id: offerId,
          card_number: cardNumber,
          location_id: storeId
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
    } else {
      params.merchant_id = import.meta.env.VITE_COUPONS_MERCHANT_ID;
      params.refresh_token = TokenStorage.getRefreshToken();
      
      return await couponsInstance({
        url: '/clip-coupon',
        method: 'PUT',
        params
      });
    }
  }

  async getCouponById(id) {
    const refreshToken = TokenStorage.getRefreshToken();

    return await couponsInstance({
      url: '/get-offer-by-id',
      method: 'GET',
      params: {
        merchant_id: import.meta.env.VITE_COUPONS_MERCHANT_ID,
        refresh_token: refreshToken,
        offer_id: id
      }
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
