-- 001_init.sql: initial schema
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS migrations (
  id TEXT PRIMARY KEY,
  filename TEXT,
  applied_at INTEGER
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  brand TEXT,
  price REAL,
  compareAt REAL,
  description TEXT,
  images TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
  product_id TEXT PRIMARY KEY,
  quantity INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT
);

CREATE TABLE IF NOT EXISTS carts (
  user_id TEXT PRIMARY KEY,
  items TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  items TEXT,
  total REAL,
  status TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  code TEXT,
  description TEXT,
  type TEXT,
  value REAL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT,
  payload TEXT,
  created_at INTEGER
);

COMMIT;
