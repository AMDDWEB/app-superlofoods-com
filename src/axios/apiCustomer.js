import axios from 'axios';
import { TokenStorage } from '../utils/tokenStorage';

let customer;

class Customer {
  constructor() {
    const base = axios.create({
      baseURL: import.meta.env.VITE_COUPONS_API,
      withCredentials: false,
      headers: {
        'Content-type': 'application/json',
        'x-api-key': import.meta.env.VITE_COUPONS_API_KEY
      }
    });
    customer = base;
  }

  async checkForExistingUser(accessToken, storeId) {
    await TokenStorage.setAuthToken(accessToken, customer);
    return customer({
      url: '/check-user',
      method: 'GET',
      params: {
        location_id: storeId
      }
    });
  }

  async getProfile(customerId, appId) {
    return customer({
      url: '/customer',
      method: 'GET',
      params: {
        customer_id: customerId,
        app_id: appId
      }
    });
  }

  async updateProfile(profile) {
    return customer({
      url: '/customer',
      method: 'PUT',
      data: profile
    });
  }

  async deleteAccount(customerId, appId) {
    return customer({
      url: '/customer',
      method: 'DELETE',
      params: {
        customer_id: customerId,
        app_id: appId
      }
    });
  }
}

export default new Customer();
