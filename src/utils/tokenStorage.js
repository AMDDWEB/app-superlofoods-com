import CustomerApi from '../axios/apiCustomer';

export const TokenStorage = {
  // Local Storage Based Methods
  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  },

  async setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    
    // Get the current access token and storeId from localStorage
    const currentToken = localStorage.getItem('access_token');
    const storeId = localStorage.getItem('storeId');
    
    if (currentToken && storeId) {
      try {
        const response = await CustomerApi.checkForExistingUser(currentToken, storeId);
        if (import.meta.env.VITE_HAS_MIDAX_COUPONS === "true") {
          if (response.data && response.data[0] && response.data[0].CardNumber) {
            localStorage.setItem('cardNumber', response.data[0].CardNumber);
          }
        } else {
          localStorage.removeItem('cardNumber');
        }
      } catch (error) {
        console.error('Error checking for existing user:', error);
      }
    }

    // Dispatch an event to notify other components
    window.dispatchEvent(new Event('tokensUpdated'));
  },

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Dispatch an event to notify other components
    window.dispatchEvent(new Event('tokensUpdated'));
  },

  hasTokens() {
    return !!(this.getAccessToken() && this.getRefreshToken());
  },

  // Bearer Token Method
  setAuthToken: async (accessToken, request) => {
    if (request && request.defaults) {
      request.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      return request.defaults.headers.common['Authorization'];
    }
  }
}; 