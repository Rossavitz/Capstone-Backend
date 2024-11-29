"use strict";

/** Routes for recipes. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureAdmin, ensureLoggedIn } = require("../middleware/auth.js");
const { BadRequestError } = require("../expressError.js");
const Recipe = require("../models/recipe.js");
const recipeNewSchema = require("../schemas/recipeNew.json");
const recipeUpdateSchema = require("../schemas/recipeUpdateSchema.json");
const ingredientSchema = require("../schemas/ingredientSchema.json");

const router = express.Router();

/** POST / { recipe }  => { recipe }
 *
 * Adds a new recipe.
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(
      req.body.data.details,
      recipeNewSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const ingredients = req.body.data.ingredients.map(
      ({ name, unit, quantity }) => ({ name, unit, quantity: +quantity })
    );
    for (const ingredient of ingredients) {
      const ingredientValidator = jsonschema.validate(
        ingredient,
        ingredientSchema
      );
      if (!ingredientValidator.valid) {
        const errs = ingredientValidator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }
    }
    const recipe = await Recipe.addRecipe(req.body);
    return res.status(201).json({ recipe });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { recipes: [ { id, title, description }, ...] }
 *
 * Can filter on provided search filters:
 * - tag
 * - nameLike tag (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;
  try {
    const recipes = await Recipe.findAll(q);
    return res.json({ recipes });
  } catch (err) {
    return next(err);
  }
});

/** GET /[tag] => { recipes }
 *
 * Returns { id, title, description }
 *
 * Authorization required: logged in
 **/

router.get("/tag/:tag", ensureLoggedIn, async function (req, res, next) {
  try {
    const recipes = await Recipe.findAllByTag(req.params.tag);
    return res.json({ recipes });
  } catch (err) {
    return next(err);
  }
});

/** GET /[tags] => { recipes }
 *
 * Returns list of tags
 *
 * Authorization required: admin or same user-as-:username
 **/
router.get("/tags", ensureLoggedIn, async function (req, res, next) {
  try {
    const tags = await Recipe.getTags();
    return res.json({ tags });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id] => { recipe }
 *
 * Returns { id, title, description, instructions, ingredients }
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get("/id/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const recipe = await Recipe.getById(req.params.id);
    return res.json({ recipe });
  } catch (err) {
    return next(err);
  }
});

/** GET /update/[id] => { recipes }
 *
 * Returns { id, title, description, instructions, tag, ingredient_name, ingredient_quantity, ingredient_unit }
 *
 * Authorization required: admin
 **/
router.get("/update/:id", ensureAdmin, async function (req, res, next) {
  try {
    const recipes = await Recipe.getAllIngredientsByRecipeId(req.params.id);
    return res.json({ recipes });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { recipe } => { recipe }
 *
 * Data can include:
 *   { title, description, instructions, tag, ingredients, quantity, unit }
 *
 * Returns { title, description, instructions, tag, ingredients, quantity, unit }
 *
 * Authorization required: admin
 **/

router.patch("/id/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body.details, recipeUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const ingredients = req.body.ingredientList.map(
      ({ name, unit, quantity }) => ({ name, unit, quantity: +quantity })
    );
    for (const ingredient of ingredients) {
      const ingredientValidator = jsonschema.validate(
        ingredient,
        ingredientSchema
      );
      if (!ingredientValidator.valid) {
        const errs = ingredientValidator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }
    }

    const recipe = await Recipe.update(req.params.id, req.body);
    return res.json({ recipe });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization required: admin
 **/

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Recipe.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]/ingredient
 *
 * deletes an ingredient from a recipe
 *
 * Authorization required: admin
 **/
router.delete("/:id/ingredient", ensureAdmin, async function (req, res, next) {
  try {
    await Recipe.removeIngredient(req.params.id, req.body);
    return res.json({ deleted: "ingredient" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
