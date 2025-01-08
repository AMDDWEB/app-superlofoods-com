export function useRecipeDetails() {
    const transformRecipeData = (recipe = {}) => {
        return {
            recipe_title: recipe.recipe_title,
            recipe_hero_image: recipe.recipe_hero_image,
            recipe_import_image_url: recipe.recipe_import_image_url,
            recipe_additional_images: recipe.recipe_additional_images?.map(img => img.recipe_additional_image) || [],
            recipe_hero_copy: recipe.recipe_hero_copy,
            recipe_total_prep_time: recipe.recipe_total_prep_time,
            recipe_total_cook_time: recipe.recipe_total_cook_time,
            recipe_serving_size: recipe.recipe_serving_size,
            recipe_video_url: recipe.recipe_video_url,
            recipe_source_url: recipe.recipe_source_url,
            recipe_steps: recipe.recipe_steps?.map(step => step.recipe_step) || [],
            recipe_ingredients: recipe.recipe_ingredients?.map(ingredient => ({
                ingredient: ingredient.recipe_ingredient,
                serving: ingredient.recipe_ingredient_serving
            })) || []
        };
    };

    const transformAllRecipes = (recipes = []) => {
        return recipes.map(transformRecipeData);
    };

    return {
        transformRecipeData,
        transformAllRecipes
    };
}