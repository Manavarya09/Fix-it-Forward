const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.resolve(__dirname, 'fif.db');
const db = new Database(DB_PATH);

function init() {
  db.exec(`
    PRAGMA journal_mode = WAL;
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
  `);

  seedProducts();
}

function seedProducts() {
  const count = db.prepare('SELECT COUNT(1) as c FROM products').get().c;
  if (count > 0) return; // already seeded

  // Attempt to load product list from client-side file js/products.js
  try {
    const prodFile = path.resolve(__dirname, '..', 'js', 'products.js');
    const content = fs.readFileSync(prodFile, 'utf8');
    // Extract the object literal assigned to PRODUCT_DATA
    const match = content.match(/const\s+PRODUCT_DATA\s*=\s*(\{[\s\S]*\})\s*;?/m);
    if (match) {
      const objText = match[1];
      // evaluate safely (local file) to get object
      const vm = require('vm');
      const script = new vm.Script('result = ' + objText);
      const ctx = { result: null };
      script.runInNewContext(ctx);
      const products = ctx.result || {};
      const insert = db.prepare('INSERT INTO products (id,name,brand,price,compareAt,description,images) VALUES (?,?,?,?,?,?,?)');
      const invInsert = db.prepare('INSERT INTO inventory (product_id,quantity) VALUES (?,?)');
      for (const key of Object.keys(products)) {
        const p = products[key];
        insert.run(p.id || key, p.name || '', p.brand || '', p.price || 0, p.compareAt || null, p.description || '', JSON.stringify(p.images || []));
        invInsert.run(p.id || key, 20);
      }
      console.log('Seeded products from js/products.js');
      return;
    }
  } catch (err) {
    console.warn('Could not seed from products.js:', err.message);
  }

  // fallback minimal seed
  const insert = db.prepare('INSERT INTO products (id,name,brand,price,compareAt,description,images) VALUES (?,?,?,?,?,?,?)');
  const invInsert = db.prepare('INSERT INTO inventory (product_id,quantity) VALUES (?,?)');
  const fallback = [
    ['shop-1','Buttons tweed blazer','CozyCo',59.0,null,'A polished tweed blazer.',['img/product/product-1.jpg']],
    ['shop-2','Flowy striped skirt','Luna Threads',49.0,null,'Lightweight midi skirt.',['img/product/product-2.jpg']]
  ];
  for (const p of fallback) {
    insert.run(p[0], p[1], p[2], p[3], null, p[4], JSON.stringify(p[5]));
    invInsert.run(p[0], 20);
  }
  console.log('Seeded fallback products');
}

module.exports = { db, init };
