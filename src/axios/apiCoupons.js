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
    sortBy = 'newest'
  } = {}) {
    const params = {
      merchant_id: import.meta.env.VITE_COUPONS_MERCHANT_ID,
      limit: limit.toString(),
      offset: offset.toString(),
      sort_by: sortBy
    };

    if (category) {
      params.category_id = category;
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
    const refreshToken = TokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    return await couponsInstance({
      url: '/clip-coupon',
      method: 'PUT',
      params: {
        merchant_id: import.meta.env.VITE_COUPONS_MERCHANT_ID,
        refresh_token: refreshToken,
        offer_id: offerId
      }
    });
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

  isAuthenticated() {
    return TokenStorage.hasTokens();
  }
}

export default new CouponsApi();
