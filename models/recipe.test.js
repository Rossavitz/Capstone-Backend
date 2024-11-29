"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Recipe = require("./recipe.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newRecipe = {
    data: {
      details: {
        title: "New Title",
        tag: "New Tag",
        description: "New Description",
        instructions: "New Instructions",
      },
      ingredients: [
        { name: "New Ingredient 1", quantity: 1, unit: "cup" },
        { name: "New Ingredient 2", quantity: 2, unit: "cups" },
        { name: "New Ingredient 3", quantity: 1, unit: "cups" },
      ],
    },
  };

  test("works", async function () {
    let recipe = await Recipe.addRecipe(newRecipe);
    expect(recipe).toEqual("Recipe Added");

    const result = await db.query(
      `SELECT title, tag, description, instructions
           FROM recipe
           WHERE title = 'New Title';`
    );
    expect(result.rows).toEqual([
      {
        title: "New Title",
        tag: "New Tag",
        description: "New Description",
        instructions: "New Instructions",
      },
    ]);
  });
  test("bad request with dupe", async function () {
    try {
      await Recipe.addRecipe(newRecipe);
      await Recipe.addRecipe(newRecipe);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** findAll */

describe("findAll", function () {
  test("works: all", async function () {
    let recipes = await Recipe.findAll();
    expect(recipes).toEqual([
      {
        title: "T1",
        tag: "Tag1",
        description: "D1",
        instructions: "Instructions1",
        id: expect.any(Number),
      },
      {
        title: "T2",
        tag: "Tag2",
        description: "D2",
        instructions: "Instructions2",
        id: expect.any(Number),
      },
      {
        title: "T3",
        tag: "Tag3",
        description: "D3",
        instructions: "Instructions3",
        id: expect.any(Number),
      },
    ]);
  });

  test("works: tag", async function () {
    let recipes = await Recipe.findAllByTag("Tag1");
    expect(recipes).toEqual([
      {
        title: "T1",
        tag: "Tag1",
        description: "D1",
        id: expect.any(Number),
      },
    ]);
  });

  test("works: empty list on nothing found", async function () {
    let recipes = await Recipe.findAll({ tag: "nope" });
    expect(recipes).toEqual([]);
  });
});

// /************************************** get */

describe("getbyId", function () {
  test("works", async function () {
    let recipe = await Recipe.getById(1);
    expect(recipe).toEqual({
      recipe_title: "T1",
      recipe_tag: "Tag1",
      recipe_description: "D1",
      recipe_instructions: "Instructions1",
      ingredient_list: "1 cup of i1",
      recipe_id: expect.any(Number),
    });
  });

  test("not found if no such Recipe", async function () {
    try {
      await Recipe.getById(798);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    details: {
      title: "T1",
      description: "New Description",
      instructions: "New Instructions",
      tag: "New Tag",
    },
    ingredientList: [{ name: "i1", quantity: 1, unit: "cup" }],
  };

  test("works", async function () {
    let recipe = await Recipe.update(1, updateData);
    expect(recipe).toEqual("Recipe Updated");

    const result = await db.query(
      `SELECT title, description, tag, instructions
           FROM recipe
           WHERE title = 'T1'`
    );
    expect(result.rows).toEqual([
      {
        title: "T1",
        description: "New Description",
        instructions: "New Instructions",
        tag: "New Tag",
      },
    ]);
  });

  test("not found if no such Recipe", async function () {
    try {
      await Recipe.update(907, updateData);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Recipe.update(1, {});
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Recipe.remove(1);
    const res = await db.query(`SELECT title FROM recipe WHERE title='T1';`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such Recipe", async function () {
    try {
      await Recipe.remove(48);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
