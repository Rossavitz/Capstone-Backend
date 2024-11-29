"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { id, username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT id, username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { id, username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    isAdmin,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
      [username, hashedPassword, firstName, lastName, email, isAdmin]
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ id, username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT id, username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { id, username, first_name, last_name, is_admin, jobs }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
      `SELECT id, username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** Given a single user_id return =>  username | favorites recipe_ids
      username | favorite_recipe_ids
     ----------+---------------------
     testadmin | {1,2,3,4,5}
     (1 row)
    */
  static async getFavorites(id) {
    // let result = await db.query(
    //   `SELECT username, array_to_string(array_agg(recipe_id), ',') AS favorite_recipe_ids FROM user_favorites JOIN users ON users.id = user_favorites.user_id WHERE user_id = $1 GROUP BY username`,
    //   [id]
    // );
    let result = await db.query(
      `SELECT username, (array_agg(recipe_id)) AS favorite_recipe_ids
      FROM user_favorites JOIN users ON users.id = user_favorites.user_id WHERE
      user_id = $1 GROUP BY username`,
      [id]
    );
    const favorites = result.rows[0];

    if (!favorites) throw new NotFoundError(`Couldnt find any favorites!`);

    return favorites;
  }

  static async getFavoritesDetails(id) {
    let result = await db.query(
      `SELECT users.username, user_favorites.recipe_id AS favorite_recipe_id, recipe.title, recipe.tag, recipe.description FROM user_favorites JOIN users ON users.id = user_favorites.user_id JOIN recipe ON recipe.id = user_favorites.recipe_id WHERE user_id = $1`,
      [id]
    );
    let favorites = result.rows;
    if (!favorites) throw new NotFoundError(`Couldnt find any favorites!`);
    return favorites;
  }

  /**Return list of username with favorite_recipe_ids
   username  | favorite_recipe_ids
  -----------+---------------------
  testadmin | 1
  a         | 1,2
  b         | 1,2,3
  (3 rows)
  */
  static async allUserFavorites() {
    let result = await db.query(
      `SELECT username, array_to_string(array_agg(recipe_id), ',') AS favorite_recipe_ids FROM user_favorites JOIN users ON users.id = user_favorites.user_id GROUP BY users.username, user_favorites.user_id ORDER BY user_id`
    );
    return result.rows;
  }

  /**Add recipe id to user favorites */
  static async addFavorite(user_id, recipe_id) {
    let result = await db.query(
      `INSERT INTO user_favorites(user_id, recipe_id)
      VALUES
      ($1, $2)`,
      [user_id, recipe_id]
    );
    if (!user_id) throw new NotFoundError(`No user found`);
    if (!recipe_id) throw new NotFoundError(`Favorite not found`);
  }

  static async removeFavorite(user_id, recipe_id) {
    let result = await db.query(
      `DELETE FROM user_favorites
      WHERE user_id = $1 AND recipe_id = $2`,
      [user_id, recipe_id]
    );
    if (!user_id) throw new NotFoundError(`No user found`);
    if (!recipe_id) throw new NotFoundError(`Favorite not found`);
  }
}

module.exports = User;
