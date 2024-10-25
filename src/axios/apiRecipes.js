// src/axios/apiRecipes.js

import axios from 'axios';

const baseURL = import.meta.env.VITE_WORDPRESS_API; // Accessing the environment variable

const RecipesApi = {
  async getRecipes({ page = 1, perPage = 100, limit, fetchAll = false } = {}) {
    try {
      let allRecipes = [];

      const response = await axios.get(
        `${baseURL}/recipes`, // Use baseURL directly
        {
          params: { page, per_page: perPage },
        }
      );
      allRecipes = response.data; // Assign the fetched recipes to allRecipes

      // Process the response and map it to your required format
      return allRecipes.map((recipe) => ({
        id: recipe.id, // Include the id for key prop
        slug: recipe.slug,
        recipe_url: recipe.link || 'Link Unavailable',
        name: recipe.title.rendered,
        image_url:
          recipe.acf?.recipe_hero_section?.arg_api_recipe_hero_image_url,
        recipe_difficulty_level:
          recipe.acf?.recipe_hero_section?.[
            'arg-recipe_difficulty_level'
          ],
        recipe_serving_size:
          recipe.acf?.recipe_hero_section?.['arg-recipe_serving_size'],
        recipe_total_cook_time:
          recipe.acf?.recipe_hero_section?.['arg-recipe_total_cook_time'],
        recipe_total_prep_time:
          recipe.acf?.recipe_hero_section?.['arg-recipe_total_prep_time'],
        recipe_total_time:
          recipe.acf?.recipe_hero_section?.['arg-recipe_total_time'],
        // Add the new field for recipe source URL
        recipe_source_url:
          recipe.acf?.recipe_hero_section?.arg_recipe_source_url || '',
        // Add the new field for recipe ingredients
        recipe_ingredients:
          recipe.acf?.['arg-recipe_ingredient_details']?.['arg-recipe_ingredients']?.map(
            (ingredient) => ({
              name: ingredient['arg-recipe_ingredient'],
              serving: ingredient['arg-recipe_ingredient_serving'],
            })
          ) || [],
        recipe_steps:
          recipe.acf?.['arg-recipe_step_details']?.['arg-recipe_steps']?.map(
            (step) => ({
              method: step['recipe_step'],
            })
          ) || [],
      }));
    } catch (error) {
      console.error('Error fetching recipes:', error); // Log the error to the console
      throw error; // Rethrow the error to handle it in the component
    }
  },
};

export default RecipesApi;
