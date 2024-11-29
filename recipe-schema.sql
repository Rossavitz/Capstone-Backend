CREATE TABLE recipe (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    tag TEXT NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25),
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
  );

CREATE TABLE user_favorites(
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  PRIMARY KEY(user_id, recipe_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(recipe_id) REFERENCES recipe(id) ON DELETE CASCADE
); 

CREATE TABLE ingredient (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE recipe_ingredient (
  recipe_id INT,
  ingredient_id INT,
  quantity NUMERIC,
  unit TEXT,
  PRIMARY KEY(recipe_id, ingredient_id),
  FOREIGN KEY(recipe_id) REFERENCES recipe(id) ON DELETE CASCADE,
  FOREIGN KEY(ingredient_id) REFERENCES ingredient(id) ON DELETE CASCADE
);
