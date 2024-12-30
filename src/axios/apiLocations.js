// src/axios/apiLocations.js

import axios from 'axios';

let locations;

class LocationsApi {
  constructor() {
    const base = axios.create({
      baseURL: import.meta.env.VITE_WORDPRESS_API,
      withCredentials: false,
      headers: {
        'Content-type': 'application/json'
      }
    });
    locations = base;
  }

  async getLocations() {
    return locations.get('/locations');
  }

  async getLocationById(id) {
    const allLocations = await this.getLocations();
    return allLocations.data.find(location => location.id.toString() === id.toString());
  }
}

export default new LocationsApi();