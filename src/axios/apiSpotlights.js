import axios from 'axios';

let spotlights;

class SpotlightsApi {
  constructor() {
    const base = axios.create({
      baseURL: import.meta.env.VITE_WORDPRESS_API,
      withCredentials: false,
      headers: {
        'Content-type': 'application/json'
      }
    });
    spotlights = base;
  }

  async getSpotlights() {
    try {
      const response = await spotlights.get('/spotlights');
      return response.data;
    } catch (error) {
      console.error('Error fetching spotlights:', error);
      throw error;
    }
  }
}

export default new SpotlightsApi(); 