export function useSpotlightDetails() {
  const transformSpotlightData = (spotlight = {}, imageUrl = '', id) => {
    return {
      id,
      image_url: imageUrl || '',
      price: spotlight.arg_featured_item_price || '',
      description: spotlight.arg_featured_item_desciption || '', // Note: Keeping the typo as it matches API
    };
  };

  const transformAllSpotlights = (data = []) => {
    return data.flatMap((item) => {
      const imageUrls = item.arg_featured_item_image_urls || [];
      const spotlights = item.acf?.arg_featured_items || [];

      return spotlights.map((spotlight, idx) => 
        transformSpotlightData(spotlight, imageUrls[idx], `${item.id}-${idx}`)
      );
    });
  };

  return {
    transformSpotlightData,
    transformAllSpotlights,
  };
} 