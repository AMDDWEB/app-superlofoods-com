// src/axios/apiPromos.js

import axios from 'axios';

const baseURL = import.meta.env.VITE_WORDPRESS_API; // Accessing the environment variable

const PromosApi = {
  async getPromos() {
    try {
      const response = await axios.get(`${baseURL}/promos`); // Use baseURL directly

      console.log('Full API Response:', response.data); // Debugging line

      // Process the response and map it to your required format
      return response.data.map(promo => ({
        promo_image: promo.arg_promo_image_url || '', // Get the correct image URL
        promo_offer_url: promo.acf?.arg_promo_offer_url || '', // Ensure this is correctly mapped if needed
        promo_start_date: promo.acf?.arg_promo_start_date || '', // Optional, can be omitted if not needed
        promo_end_date: promo.acf?.arg_promo_end_date || '', // Optional, can be omitted if not needed
        promo_location: promo.title.rendered || '', // Use the rendered title for location
        promo_url: promo.link || '', // Use the promo link from the API
      }));
    } catch (error) {
      console.error('Error fetching promos:', error);
      throw error;
    }
  },
};

export default PromosApi;
