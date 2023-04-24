-- Active: 1681646039003@@127.0.0.1@3306

CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
);

CREATE TABLE products (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL
);


CREATE TABLE purchases (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  buyer TEXT NOT NULL REFERENCES users(id),
  total_price REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
  paid INTEGER NOT NULL DEFAULT 0
);


CREATE TABLE purchases_products (
  purchase_id TEXT NOT NULL REFERENCES purchases(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (purchase_id, product_id)
);


-- insert data 
INSERT INTO users (id, name, email, password, created_at)
VALUES
  ('1', 'Kamylla', 'kamylla@email.com', 'passwordkamylla', DATETIME('now')),
  ('2', 'Luisa', 'luisa@email.com', 'passwordluisa', DATETIME('now')),
  ('3', 'Fred', 'fred@email.com', 'passwordfred', DATETIME('now')),
  ('4', 'Pudim', 'pudim@email.com', 'passwordpudim', DATETIME('now')),
  ('5', 'Jimi', 'jimi@email.com', 'passwordjimi', DATETIME('now'));

INSERT INTO products (id, name, price, description, image_url)
VALUES
  ('1', 'Product A', 9.99, 'This is Product A', 'https://example.com/product_a.jpg'),
  ('2', 'Product B', 19.99, 'This is Product B', 'https://example.com/product_b.jpg'),
  ('3', 'Product C', 29.99, 'This is Product C', 'https://example.com/product_c.jpg');


BEGIN TRANSACTION;
INSERT INTO purchases (id, buyer, total_price, created_at, paid)
VALUES ('1', '1', 9.99, DATETIME('now'), 0),
('2', '2', 19.99, DATETIME('now'), 1),
('3', '3', 29.99, DATETIME('now'), 1);

INSERT INTO purchases_products (purchase_id, product_id, quantity)
VALUES (1,1,2), (2,2,1);

SELECT * FROM purchases