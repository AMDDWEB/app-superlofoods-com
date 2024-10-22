// src/axios/apiLocations.js

import axios from 'axios';

const baseURL = import.meta.env.VITE_WORDPRESS_API; // Accessing the environment variable

const LocationsApi = {
  async getLocations() {
    try {
      const response = await axios.get(`${baseURL}/locations/`, {
        params: {
          per_page: 100,
          orderby: 'title',
          order: 'asc',
        },
      });

      console.log('Raw API response:', response.data); // Debugging line

      // Process the response and map it to your required format
      return response.data.map(location => ({
        id: location.id,
        name: location.title?.rendered || 'Unnamed Location',
        address: location.acf?.arg_location_details?.arg_location_address?.address || 'Address not available',
        location_url: location.link || 'Link Unavailable',
        street_number: location.acf?.arg_location_details?.arg_location_address?.street_number || '',
        street_name: location.acf?.arg_location_details?.arg_location_address?.street_name || '',
        city: location.acf?.arg_location_details?.arg_location_address?.city || '',
        state: location.acf?.arg_location_details?.arg_location_address?.state || '',
        state_short: location.acf?.arg_location_details?.arg_location_address?.state_short || '',
        post_code: location.acf?.arg_location_details?.arg_location_address?.post_code || '',
        phone_number: location.acf?.arg_location_details?.arg_location_phone_number || '',
        day_open: location.acf?.arg_location_details?.arg_location_hours?.map(hours => hours['arg-location-hours-day_of_operation']).join(', ') || '',
        opening_hours: location.acf?.arg_location_details?.arg_location_hours?.map(hours => hours['arg-location-hours-opening_hours']).join(', ') || '',
        closing_hours: location.acf?.arg_location_details?.arg_location_hours?.map(hours => hours['arg-location-hours-closing_hours']).join(', ') || '',
        weekly_ad_url: location.arg_location_weekly_ad_url || '',
        rewards_url: location.arg_location_rewards_url || '',
      }));
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
};

export default LocationsApi;