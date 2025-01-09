// src/axios/apiLocations.js

import axios from 'axios';

let locations;

class LocationsApi {
  constructor() {
    const base = axios.create({
      baseURL: import.meta.env.VITE_DEV_URL,
      withCredentials: false,
      headers: {
        'Content-type': 'application/json'
      }
    });
    locations = base;
  }

  async getLocations({ page = 1, perPage = 150 } = {}) {
    try {
        const response = await locations.get('/wp-json/iproweb/v1/locations', {
            params: { page, perPage }
        });

        // Simplified: Filter and sort in one step
        return response.data
            .filter(location => location?.title) // Ensure title exists
            .sort((a, b) => a.title > b.title ? 1 : -1) // Basic alphabetical sorting
            .slice(0, 150); // Limit to 150 items
    } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
}

  async getLocationById(id) {
    const allLocations = await this.getLocations();
    return allLocations.data.find(location => location.id.toString() === id.toString());
  }
}

export default new LocationsApi();