// FeaturedItemsApi.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_WORDPRESS_API; // Accessing the environment variable

const FeaturedItemsApi = {
  async getFeaturedItems() {
    try {
      const response = await axios.get(
        `${baseURL}/featured_items` // Use baseURL directly
      );

      // Log the entire response for debugging
      console.log('Full API Response:', JSON.stringify(response.data, null, 2));

      // Process the response and map it to your required format
      const mappedData = response.data.flatMap((item) => {
        const imageUrls = item.arg_featured_item_image_urls || [];
        const featuredItems = item.acf?.arg_featured_items || [];

        // Map each featured item with its corresponding image URL
        return featuredItems.map((featuredItem, idx) => ({
          id: `${item.id}-${idx}`,
          image_url: imageUrls[idx] || '',
          price: featuredItem.arg_featured_item_price || '',
          description: featuredItem.arg_featured_item_desciption || '', // Note the typo
        }));
      });

      // Log the mapped data for debugging
      console.log('Mapped Featured Items:', JSON.stringify(mappedData, null, 2));

      return mappedData;
    } catch (error) {
      console.error('Error fetching featured items:', error);
      throw error;
    }
  },
};

export default FeaturedItemsApi;
