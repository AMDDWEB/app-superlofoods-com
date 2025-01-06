import axios from 'axios';

let spotlights;

class SpotlightsApi {
  constructor() {
    const base = axios.create({
      baseURL: import.meta.env.VITE_DEV_URL,
      withCredentials: false,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    spotlights = base;
  }

  async getSpotlights() {
    try {
      const response = await spotlights.get('/wp-json/iproweb/v1/spotlights');
      // Verify we have a valid response
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching spotlights:', error);
      return [];
    }
  }
}

export default new SpotlightsApi(); 