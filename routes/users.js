"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const {
  ensureCorrectUserOrAdmin,
  ensureAdmin,
  ensureLoggedIn,
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const Recipe = require("../models/recipe");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is only for admin users to add new users. The new user being added can be an admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

router.get(
  "/:username/favorites",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      const user_id = user.id;
      const favorites = await User.getFavoritesDetails(user_id);
      return res.json({ favorites });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET  /:username/:recipe_id
 *
 * Returns list of users favorite_recipe_ids
 *
 *  * Authorization required: loggin in user or admin
 */
router.get(
  "/:username/:recipe_id",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      const user_id = user.id;
      const favorites = await User.getFavorites(user_id, req.params.recipe_id);
      return res.status(201).json({ favorites });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST  /:username/:recipe_id
 *
 * Add a favorite recipe
 *
 *  * Authorization required: logged in user or admin
 */
router.post(
  "/:username/:recipe_id",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      const user_id = user.id;
      const favorite = await User.addFavorite(user_id, req.params.recipe_id);
      return res
        .status(201)
        .json({ Added: `Recipe id: ${req.params.recipe_id}` });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE  /:user_id/:recipe_id
 *
 * Remove a favorite recipe
 *
 *  * Authorization required: logged in user or admin
 */
router.delete(
  "/:username/:recipe_id",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      const user_id = user.id;
      const removed = await User.removeFavorite(user_id, req.params.recipe_id);
      return res.status(201).json({ Removed: req.params.recipe_id });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { user }
 *
 * Returns { id, username, firstName, lastName, isAdmin }
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
