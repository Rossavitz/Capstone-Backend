const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM ingredient");
  await db.query("DELETE FROM recipe");
  await db.query("DELETE FROM recipe_ingredient");
  await db.query(
    `
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );

  await db.query(`
    INSERT INTO recipe (id, title, description, tag, instructions)
    VALUES 
    (1, 'T1', 'D1', 'Tag1', 'Instructions1'),
    (2, 'T2', 'D2', 'Tag2', 'Instructions2'),
    (3, 'T3', 'D3', 'Tag3', 'Instructions3')
    `);

  await db.query(`
      INSERT INTO ingredient (id, name)
      VALUES
      (1, 'i1'),
      (2, 'i2'),
      (3, 'i3'),
      (4, 'i4')
      `);

  await db.query(`
      INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit)
      VALUES
      (1, 1, 1, 'cup'),
      (2, 1, 1, 'cup'),
      (2, 2, 2, 'cups'),
      (3, 1, 1, 'cup'),
      (3, 2, 2, 'cups'),
      (3, 3, 3, 'cups')
      `);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.query("DELETE FROM users;");
  await db.query("DELETE FROM ingredient;");
  await db.query("DELETE FROM recipe;");
  await db.query("DELETE FROM recipe_ingredient;");
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
