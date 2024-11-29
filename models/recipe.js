"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

class Recipe {
  /** Find all recipes.
   *
   * Returns [{ id, title, description, tag}, ...]
   **/

  static async findAll(searchFilters = {}) {
    let query = `SELECT id, title, description, tag, instructions
                 FROM recipe`;
    let whereExpressions = [];
    let queryValues = [];

    const { tag } = searchFilters;

    if (tag) {
      queryValues.push(`%${tag}%`);
      whereExpressions.push(`tag ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY id";
    const recipeRes = await db.query(query, queryValues);
    return recipeRes.rows;
  }

  /** Given an id, return data about a recipe.
   *
   * Returns { id, title, description, instructions, ingredients list }
   *
   * Throws NotFoundError if id not found.
   **/

  static async getById(id) {
    const res = await db.query(
      `SELECT recipe.id AS recipe_id, recipe.title AS recipe_title, recipe.description AS recipe_description, recipe.instructions AS recipe_instructions, recipe.tag AS recipe_tag, STRING_AGG(CONCAT(recipe_ingredient.quantity, ' ', recipe_ingredient.unit, ' of ', ingredient.name), ', ' ORDER BY ingredient.name) AS ingredient_list FROM recipe JOIN recipe_ingredient ON recipe.id = recipe_ingredient.recipe_id JOIN ingredient ON recipe_ingredient.ingredient_id = ingredient.id WHERE recipe.id = $1 GROUP BY recipe.id, recipe.title;`,
      [id]
    );
    const recipe = res.rows[0];

    if (!id) throw new NotFoundError(`No recipe with ID of: ${id}`);

    return recipe;
  }

  static async getAllIngredientsByRecipeId(id) {
    const res = await db.query(
      `SELECT r.*, i.name as ingredient_name, ri.quantity as ingredient_quantity, ri.unit as ingredient_unit FROM recipe r JOIN recipe_ingredient ri ON ri.recipe_id = r.id JOIN ingredient i ON i.id = ri.ingredient_id WHERE ri.recipe_id = $1;`,
      [id]
    );

    const recipes = res.rows;

    if (!id) throw new NotFoundError(`No recipe with ID of: ${id}`);

    return recipes;
  }

  /** Given an ingredient_tag, return all recipes with that tag.
   *
   * Returns { id, title, description, tag}
   *
   * Throws NotFoundError if tag not found.
   **/

  static async findAllByTag(ingredient_tag) {
    const res = await db.query(
      `SELECT id, title, description, tag
      FROM recipe r
      WHERE tag = $1;`,
      [ingredient_tag]
    );
    const recipes = res.rows;

    if (!ingredient_tag)
      throw new NotFoundError(
        `No recipe with ingredient_tag of: ${ingredient_tag}`
      );

    return recipes;
  }

  /** Get list of tags
   *
   * Returns list of all tags
   **/

  static async getTags() {
    const res = await db.query(`SELECT tag FROM recipe GROUP BY tag`);

    return res.rows;
  }

  /** Add a recipe.
   *
   * Returns [{ id, title, description, instructions, ingredients}]
   **/

  static async addRecipe(data) {
    const recipeResult = await db.query(
      `INSERT INTO recipe (title, description, instructions, tag) VALUES ($1, $2, $3, $4) RETURNING id as recipe_id;`,
      [
        data.data.details.title,
        data.data.details.description,
        data.data.details.instructions,
        data.data.details.tag,
      ]
    );

    for (const ingredient of data.data.ingredients) {
      let ingredientName = ingredient.name;
      let ingredientQuantity = ingredient.quantity;
      let ingredientUnit = ingredient.unit;

      const checkIngredientResult = await db.query(
        `SELECT exists (SELECT 1 from ingredient where name ILIKE $1);`,
        [ingredientName]
      );

      if (checkIngredientResult.rows[0].exists === true) {
        let ingredientIdResult = await db.query(
          `SELECT id as ingredient_id FROM ingredient WHERE name ILIKE $1`,
          [ingredientName]
        );
        let ingredientId = ingredientIdResult.rows[0].ingredient_id;
        const recipeIngredientResult = await db.query(
          `INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit) VALUES ($1, $2, $3, $4);`,
          [
            recipeResult.rows[0].recipe_id,
            ingredientId,
            ingredientQuantity,
            ingredientUnit,
          ]
        );
      } else {
        const addIngredientResult = await db.query(
          `INSERT INTO ingredient (name) VALUES ($1) RETURNING id AS ingredient_id;`,
          [ingredientName]
        );
        let ingredientId = addIngredientResult.rows[0].ingredient_id;

        const recipeIngredientResult = await db.query(
          `INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit) VALUES ($1, $2, $3, $4);`,
          [
            recipeResult.rows[0].recipe_id,
            ingredientId,
            ingredientQuantity,
            ingredientUnit,
          ]
        );
      }
    }

    return "Recipe Added";
  }

  /** Update recipe with `data`.
   *
   * Data can include: {title, description, instructions, ingredients, quantity, unit, tag}
   *
   * Returns {title, description, instructions, ingredients, quantity, unit, tag}
   *
   * Throws NotFoundError if not found.
   */
  static async update(recipe_id, data) {
    if (!data.details || !data.ingredientList)
      throw new BadRequestError(`No data!`);

    //Upate title, description, instructions, tag
    const recipeResult = await db.query(
      `UPDATE recipe SET title = $1, description = $2, instructions = $3, tag = $4 WHERE id = $5 RETURNING title, description, instructions, tag, id;`,
      [
        data.details.title,
        data.details.description,
        data.details.instructions,
        data.details.tag,
        recipe_id,
      ]
    );
    const foundRecipe = recipeResult.rows[0];
    if (!foundRecipe)
      throw new NotFoundError(`No recipe with ID of: ${recipe_id}`);

    //loop through ingredient list
    for (const ingredient of data.ingredientList) {
      let ingredientName = ingredient.name;
      let ingredientQuantity = ingredient.quantity;
      let ingredientUnit = ingredient.unit;

      //does ingredient already exist in ingredient table?
      const checkIngredientResult = await db.query(
        `SELECT exists (SELECT 1 from ingredient where name ILIKE $1);`,
        [ingredientName]
      );

      //if ingredient exists, get the ingredient_id
      if (checkIngredientResult.rows[0].exists === true) {
        let ingredientIdResult = await db.query(
          `SELECT id as ingredient_id FROM ingredient WHERE name ILIKE $1`,
          [ingredientName]
        );

        let ingredientId = ingredientIdResult.rows[0].ingredient_id;

        //does this existing ingredient exist in this recipe?
        const checkIngredientInRecipe = await db.query(
          `SELECT exists(SELECT 1 from recipe_ingredient WHERE ingredient_id = $1 AND recipe_id = $2);`,
          [ingredientId, recipe_id]
        );

        //if ingredient exists in recipe, update the quantity, unit
        if (checkIngredientInRecipe.rows[0].exists === true) {
          let updateRecipeIngredient = await db.query(
            `UPDATE recipe_ingredient SET quantity = $1, unit = $2 WHERE recipe_id = $3 AND ingredient_id = $4;`,
            [ingredientQuantity, ingredientUnit, recipe_id, ingredientId]
          );
          //if ingredient does not exist in recipe, insert into recipe
        } else {
          let insertIntoRecipeIngredient = await db.query(
            `INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit) VALUES ($1, $2, $3, $4);`,
            [recipe_id, ingredientId, ingredientQuantity, ingredientUnit]
          );
        }
        //if ingredient doesn't exists, create ingredient
      } else {
        const newIngredientResult = await db.query(
          `INSERT INTO ingredient (name) VALUES ($1) RETURNING id AS new_ingredient_id;`,
          [ingredientName]
        );
        let newIngredientId = newIngredientResult.rows[0].new_ingredient_id;

        //Add new ingredient to this recipe w/ quantity, unit
        const addRecipeIngredientResult = await db.query(
          `INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit) VALUES ($1, $2, $3, $4);`,
          [recipe_id, newIngredientId, ingredientQuantity, ingredientUnit]
        );
      }
    }

    //loop through items to be deleted
    if (data.recipeIngredientsToRemove) {
      for (const value of data.recipeIngredientsToRemove) {
        //find ingredient_id
        const findIngredientId = await db.query(
          `SELECT id as ingredient_id FROM ingredient WHERE name ILIKE $1;`,
          [value]
        );

        let ingredientId = findIngredientId.rows[0].ingredient_id;

        //delete that ingredient from this recipe
        const deleteIngredientFromRecipe = await db.query(
          `DELETE FROM recipe_ingredient WHERE ingredient_id = $1 AND recipe_id = $2;`,
          [ingredientId, recipe_id]
        );

        //Is this ingredient found in other recipes?
        const ingredientInOtherRecipe = await db.query(
          `SELECT exists(SELECT 1 FROM recipe_ingredient WHERE ingredient_id = $1);`,
          [ingredientId]
        );
        //if it is not found in other recipes, remove ingredient from db
        if (ingredientInOtherRecipe.rows[0].exists === false) {
          const removeIngredient = await db.query(
            `DELETE FROM ingredient WHERE id = $1;`,
            [ingredientId]
          );
        }
      }
    }

    return "Recipe Updated";
  }

  /** Delete given recipe from database; returns undefined. */

  static async remove(id) {
    let result = await db.query(
      `DELETE
           FROM recipe
           WHERE id = $1
           RETURNING id`,
      [id]
    );

    if (!id) throw new NotFoundError(`No recipe with ID of: ${id}`);

    return result.rows[0];
  }

  static async removeIngredient(recipe_id, data) {
    let ingredient = data[data.index];

    let queryIngredientId = await db.query(
      `SELECT id FROM ingredient WHERE name ILIKE $1;`,
      [ingredient.name]
    );

    let ingredientId = queryIngredientId.rows[0].id;

    let result = await db.query(
      `DELETE FROM recipe_ingredient WHERE recipe_id = $1 AND ingredient_id = $2;`,
      [recipe_id, ingredientId]
    );

    if (!recipe_id) throw new NotFoundError(`No recipe with ID of: ${id}`);
    return "Ingredient removed from recipe";
  }
}

module.exports = Recipe;
