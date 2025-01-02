export function useSliderDetails() {
    const transformSliderData = (slider = {}) => {
      return {
        imageUrl: slider.slider_image_url || '',
        hasWebsiteLink: slider.website_link,
        websiteUrl: slider.website_url || null,
      };
    };
  
    const transformAllSliders = (sliders = []) => {
      return sliders.map(transformSliderData);
    };
  
    return {
      transformSliderData,
      transformAllSliders,
    };
  }