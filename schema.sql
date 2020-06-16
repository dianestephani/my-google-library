DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  authors VARCHAR(255),
  description VARCHAR(255),
  thumbnail VARCHAR(255) 
);