const express = require('express');
const path = require('path');
const bodyParser = require('express').json;
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { db, init } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const PORT = process.env.PORT || 3000;

init();

const app = express();
app.use(morgan('dev'));
app.use(bodyParser());
app.use(cookieParser());

// serve static frontend from project root
app.use(express.static(path.resolve(__dirname, '..')));

function authMiddleware(req, res, next) {
  const token = req.cookies['fif_token'];
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function optionalAuthMiddleware(req, res, next) {
  const token = req.cookies && req.cookies['fif_token'];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch (err) {
    // ignore invalid token for optional flow
  }
  return next();
}

/* Products */
app.get('/api/products', (req, res) => {
  const q = (req.query.q || req.query.search || '').trim().toLowerCase();
  let rows;
  if (q) {
    rows = db.prepare('SELECT * FROM products WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?').all('%' + q + '%', '%' + q + '%');
  } else {
    rows = db.prepare('SELECT * FROM products').all();
  }
  rows = rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]') }));
  res.json(rows);
});

app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'not found' });
  row.images = JSON.parse(row.images || '[]');
  const inv = db.prepare('SELECT quantity FROM inventory WHERE product_id = ?').get(id);
  row.inventory = inv ? inv.quantity : 0;
  res.json(row);
});

/* Auth */
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(400).json({ error: 'exists' });
  const hash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,name,email,password_hash) VALUES (?,?,?,?)').run(id, name || '', email.toLowerCase(), hash);
  const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('fif_token', token, { httpOnly: true });
  res.json({ id, name, email });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing' });
  const row = db.prepare('SELECT id,name,email,password_hash FROM users WHERE email = ?').get(email.toLowerCase());
  if (!row) return res.status(400).json({ error: 'invalid' });
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(400).json({ error: 'invalid' });
  const token = jwt.sign({ id: row.id, email: row.email, name: row.name }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('fif_token', token, { httpOnly: true });
  res.json({ id: row.id, name: row.name, email: row.email });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('fif_token');
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const token = req.cookies['fif_token'];
  if (!token) return res.json({ user: null });
  try { const payload = jwt.verify(token, JWT_SECRET); return res.json({ user: payload }); } catch(e){ return res.json({ user: null }); }
});

/* Cart - persisted per user */
app.get('/api/cart', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT items FROM carts WHERE user_id = ?').get(req.user.id);
  const items = row ? JSON.parse(row.items || '[]') : [];
  res.json({ items });
});

app.post('/api/cart', authMiddleware, (req, res) => {
  const items = req.body.items || [];
  const str = JSON.stringify(items);
  db.prepare('INSERT OR REPLACE INTO carts (user_id,items) VALUES (?,?)').run(req.user.id, str);
  res.json({ ok: true });
});

/* Orders */
app.post('/api/orders', optionalAuthMiddleware, (req, res) => {
  const items = req.body.items || [];
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'no_items' });

  // If guest (no req.user), require contact info
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    const contact = req.body.contact || {};
    if (!contact.name || !contact.email) return res.status(400).json({ error: 'guest_contact_required' });
  }

  // Compute server-side total and validate products + inventory, then insert order atomically
  try {
    const now = Date.now();
    const orderId = uuidv4();

    // calculate server total and verify products exist
    let serverTotal = 0;
    for (const it of items) {
      if (!it.product_id || !it.quantity) return res.status(400).json({ error: 'invalid_item' });
      const prod = db.prepare('SELECT price FROM products WHERE id = ?').get(it.product_id);
      if (!prod) return res.status(400).json({ error: 'product_not_found', product_id: it.product_id });
      serverTotal += (parseFloat(prod.price) || 0) * Number(it.quantity || 0);
    }

    const txn = db.transaction((items, orderId, userId, total, ts) => {
      // check and decrement inventory
      for (const it of items) {
        const inv = db.prepare('SELECT quantity FROM inventory WHERE product_id = ?').get(it.product_id);
        const have = inv ? inv.quantity : 0;
        if (have < it.quantity) {
          throw new Error('out_of_stock:' + it.product_id);
        }
        db.prepare('UPDATE inventory SET quantity = quantity - ? WHERE product_id = ?').run(it.quantity, it.product_id);
      }

      // insert order (user_id can be null for guest)
      db.prepare('INSERT INTO orders (id,user_id,items,total,status,created_at) VALUES (?,?,?,?,?,?)')
        .run(orderId, userId, JSON.stringify(items), total, 'pending', ts);

      // clear cart for authenticated users
      if (userId) db.prepare('DELETE FROM carts WHERE user_id = ?').run(userId);
    });

    txn(items, orderId, userId, serverTotal, now);
    res.json({ id: orderId, status: 'pending', total: serverTotal });
  } catch (err) {
    if (err && typeof err.message === 'string' && err.message.indexOf('out_of_stock:') === 0) {
      const pid = err.message.split(':')[1];
      return res.status(400).json({ error: 'out_of_stock', product_id: pid });
    }
    console.error('order error', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'order_failed' });
  }
});

app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const row = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  row.items = JSON.parse(row.items || '[]');
  res.json(row);
});

/* Inventory (admin) */
app.get('/api/inventory', (req, res) => {
  const rows = db.prepare('SELECT * FROM inventory').all();
  res.json(rows);
});

app.post('/api/inventory', (req, res) => {
  const { product_id, quantity } = req.body || {};
  if (!product_id) return res.status(400).json({ error: 'missing' });
  db.prepare('INSERT OR REPLACE INTO inventory (product_id,quantity) VALUES (?,?)').run(product_id, parseInt(quantity||0));
  res.json({ ok: true });
});

/* Promotions (simple) */
app.get('/api/promotions', (req, res) => {
  const rows = db.prepare('SELECT * FROM promotions').all();
  res.json(rows);
});

/* Events (analytics) */
app.post('/api/events', (req, res) => {
  const name = req.body.name || 'event';
  const payload = req.body.payload || {};
  const id = uuidv4();
  db.prepare('INSERT INTO events (id,name,payload,created_at) VALUES (?,?,?,?)').run(id, name, JSON.stringify(payload), Date.now());
  res.json({ ok: true });
});

// fallback API health
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log('Fix-It-Forward API running at http://localhost:' + PORT);
});
