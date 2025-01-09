export const TokenStorage = {
  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  },

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
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
  }
}; 