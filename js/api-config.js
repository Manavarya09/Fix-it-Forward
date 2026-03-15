(function(){
  // Frontend-only API shim for prototype: intercepts fetch calls to /api/*
  if (typeof window === 'undefined') return;

  const STORAGE_KEYS = {
    USERS: 'fif_users',
    SESSION: 'fif_session',
    GUEST: 'fif_guest',
    CARTS: 'fif_carts',
    ORDERS: 'fif_orders'
  };

  function load(key, def){ try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); } catch(e){ return def; } }
  function save(key, val){ try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} }

  function usersMap(){ return load(STORAGE_KEYS.USERS, {}); }
  function saveUsers(m){ save(STORAGE_KEYS.USERS, m); }

  function cartsMap(){ return load(STORAGE_KEYS.CARTS, {}); }
  function saveCarts(m){ save(STORAGE_KEYS.CARTS, m); }

  function ordersMap(){ return load(STORAGE_KEYS.ORDERS, {}); }
  function saveOrders(m){ save(STORAGE_KEYS.ORDERS, m); }

  function mergeItemsByProduct(existing, incoming){
    const merged = Array.isArray(existing) ? existing.slice() : [];
    (Array.isArray(incoming) ? incoming : []).forEach(function(item){
      const pid = item && (item.product_id || item.id);
      const name = item && item.name;
      const qty = Number(item && item.quantity || 0);
      if (!qty) return;
      const hit = merged.find(function(m){
        if (pid && (m.product_id === pid || m.id === pid)) return true;
        return !!(name && m.name === name);
      });
      if (hit) {
        hit.quantity = Number(hit.quantity || 0) + qty;
      } else {
        merged.push(Object.assign({}, item, { quantity: qty }));
      }
    });
    return merged;
  }

  function moveGuestDataToUser(userId, carts, orders){
    if (!userId) return;
    const gKey = 'guest:' + guestId();
    const userCart = carts[userId] || [];
    const guestCart = carts[gKey] || [];
    carts[userId] = mergeItemsByProduct(userCart, guestCart);
    if (guestCart.length) delete carts[gKey];
    saveCarts(carts);

    const userOrders = orders[userId] || [];
    const guestOrders = orders[gKey] || [];
    if (guestOrders.length) {
      orders[userId] = userOrders.concat(guestOrders);
      delete orders[gKey];
      saveOrders(orders);
    }
  }

  function session(){ return load(STORAGE_KEYS.SESSION, null); }
  function setSession(s){ save(STORAGE_KEYS.SESSION, s); }
  function clearSession(){ localStorage.removeItem(STORAGE_KEYS.SESSION); }

  function guestId(){
    let g = load(STORAGE_KEYS.GUEST, null);
    if (!g) {
      g = 'g' + Date.now() + '-' + Math.floor(Math.random()*1000000);
      save(STORAGE_KEYS.GUEST, g);
    }
    return g;
  }

  function currentSessionKey(){
    const s = session();
    if (s && s.userId) return s.userId;
    return 'guest:' + guestId();
  }

  function jsonResponse(obj, status=200){ return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } }); }

  function normalizeProduct(p, index){
    const fallbackInventory = 10 + ((index || 0) % 7);
    const inv = Number(p && p.inventory);
    const inventory = Number.isFinite(inv) ? inv : fallbackInventory;
    return Object.assign({}, p, { inventory: Math.max(0, inventory) });
  }

  const origFetch = window.fetch.bind(window);

  window.fetch = async function(input, init){
    try {
      let url = typeof input === 'string' ? input : (input && input.url) || '';
      const method = (init && init.method) || (typeof input === 'object' && input.method) || 'GET';

      // Normalize full-origin urls to path
      if (url.indexOf(location.origin) === 0) url = url.slice(location.origin.length) || '/';

      // Only intercept API calls
      if (!url.startsWith('/api')) return origFetch(input, init);

      // Parse body if JSON
      let body = null;
      try {
        if (init && init.body) body = (typeof init.body === 'string') ? JSON.parse(init.body) : init.body;
        else if (typeof input === 'object' && input.body) body = JSON.parse(input.body || null);
      } catch(e) { body = null; }

      // Basic routing
      const parts = url.replace(/^\/api\/?/, '').split('/').filter(Boolean);

      // Helpers
      const users = usersMap();
      const carts = cartsMap();
      const orders = ordersMap();
      const sess = session();
      const currentUserId = sess && sess.userId ? sess.userId : null;
      const currentKey = currentUserId || ('guest:' + guestId());

      // GET /api/me
      if (url === '/api/me' && method.toUpperCase() === 'GET'){
        if (!currentUserId || !users[currentUserId]) return jsonResponse({}, 200);
        const u = users[currentUserId];
        return jsonResponse({ user: { id: u.id, name: u.name, email: u.email } }, 200);
      }

      // AUTH: register/login/logout
      if (url === '/api/auth/register' && method.toUpperCase() === 'POST'){
        const email = (body && body.email || '').toLowerCase();
        const name = (body && body.name) || 'User';
        const password = (body && body.password) || '';
        if (!email || !password) return jsonResponse({ error: 'Missing fields' }, 400);
        // check existing
        for (const k in users) if (users[k].email === email) return jsonResponse({ error: 'Email already registered' }, 400);
        const id = 'u' + Date.now();
        users[id] = { id, name, email, password };
        saveUsers(users);
        setSession({ userId: id });
        moveGuestDataToUser(id, carts, orders);
        return jsonResponse({ id, name, email }, 200);
      }

      if (url === '/api/auth/login' && method.toUpperCase() === 'POST'){
        const email = (body && body.email || '').toLowerCase();
        const password = (body && body.password) || '';
        for (const k in users){
          const u = users[k];
          if (u.email === email && u.password === password){
            setSession({ userId: u.id });
            moveGuestDataToUser(u.id, carts, orders);
            return jsonResponse({ id: u.id, name: u.name, email: u.email }, 200);
          }
        }
        return jsonResponse({ error: 'Invalid credentials' }, 401);
      }

      if (url === '/api/auth/logout' && method.toUpperCase() === 'POST'){
        clearSession();
        return jsonResponse({ ok: true }, 200);
      }

      // CART endpoints
      if (url === '/api/cart' && method.toUpperCase() === 'GET'){
        return jsonResponse({ items: carts[currentKey] || [] }, 200);
      }
      if (url === '/api/cart' && method.toUpperCase() === 'POST'){
        carts[currentKey] = Array.isArray(body && body.items) ? body.items : [];
        saveCarts(carts);
        return jsonResponse({ ok: true }, 200);
      }

      // ORDERS
      if (url === '/api/orders' && method.toUpperCase() === 'GET'){
        return jsonResponse((orders[currentKey] || []), 200);
      }
      if (url === '/api/orders' && method.toUpperCase() === 'POST'){
        const id = 'o' + Date.now();
        const order = Object.assign({ id, created_at: new Date().toISOString() }, body || {});
        orders[currentKey] = orders[currentKey] || [];
        orders[currentKey].push(order);
        saveOrders(orders);
        return jsonResponse({ id: order.id }, 200);
      }
      if (parts[0] === 'orders' && parts[1] && method.toUpperCase() === 'GET'){
        const userOrders = orders[currentKey] || [];
        const found = userOrders.find(o=>o.id === parts[1]);
        if (!found) return jsonResponse({ error: 'Not found' }, 404);
        return jsonResponse(found, 200);
      }

      // PRODUCTS: read from global PRODUCT_DATA if available
      if (parts[0] === 'products'){
        const all = (window.PRODUCT_DATA && Object.keys(window.PRODUCT_DATA).length)
          ? Object.values(window.PRODUCT_DATA).map(normalizeProduct)
          : [];
        // GET /api/products or /api/products?q=...
        if (!parts[1] && method.toUpperCase() === 'GET'){
          try {
            const urlObj = new URL(url, location.origin);
            const q = (urlObj.searchParams.get('q') || '').toLowerCase();
            if (q) return jsonResponse(all.filter(p=> (p.name||'').toLowerCase().includes(q) || (p.brand||'').toLowerCase().includes(q)), 200);
            return jsonResponse(all, 200);
          } catch(e){ return jsonResponse(all, 200); }
        }
        // GET /api/products/:id
        if (parts[1] && method.toUpperCase() === 'GET'){
          const id = decodeURIComponent(parts[1]);
          const prod = all.find(p=> String(p.id) === String(id));
          if (!prod) return jsonResponse({ error: 'Not found' }, 404);
          return jsonResponse(prod, 200);
        }
      }

      // events/logging etc. Accept but ignore
      if (parts[0] === 'events' && method.toUpperCase() === 'POST'){
        return jsonResponse({ ok: true }, 200);
      }

      // Fallback: return 404 JSON
      return jsonResponse({ error: 'Not implemented in frontend shim', path: url }, 404);

    } catch (err) {
      return new Response('Internal frontend API error', { status: 500 });
    }
  };

  // Ensure api-config global marker
  window.__API_BASE = window.__API_BASE || '/api';

})();
