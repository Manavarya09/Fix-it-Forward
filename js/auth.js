(function(){
  if (typeof $ === 'undefined') return;

  async function apiCall(path, opts){
    opts = opts || {};
    const headers = opts.headers || {};
    let body = opts.body;
    if (body && typeof body !== 'string') {
      body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(path, { method: opts.method || 'POST', headers, body, credentials: 'include' });
    const json = await res.json().catch(()=>null);
    return { ok: res.ok, status: res.status, data: json };
  }

  $(document).on('submit', '.register-form', async function(e){
    e.preventDefault();
    const $f = $(this);
    const name = $f.find('input').eq(0).val().trim();
    const email = $f.find('input').eq(1).val().trim().toLowerCase();
    const pass = $f.find('input').eq(2).val();
    const pass2 = $f.find('input').eq(3).val();
    if (!name||!email||!pass) return alert('Please fill all fields');
    if (pass !== pass2) return alert('Passwords do not match');
    const res = await apiCall('/api/auth/register', { body: { name, email, password: pass } });
    if (!res.ok) return alert('Registration failed: ' + (res.data && res.data.error ? res.data.error : res.status));
    alert('Registration successful');
    window.location.href = 'index.html';
  });

  $(document).on('submit', '.login-form', async function(e){
    e.preventDefault();
    const $f = $(this);
    const email = $f.find('input').eq(0).val().trim().toLowerCase();
    const pass = $f.find('input').eq(1).val();
    if (!email||!pass) return alert('Please enter credentials');
    const res = await apiCall('/api/auth/login', { body: { email, password: pass } });
    if (!res.ok) return alert('Login failed: ' + (res.data && res.data.error ? res.data.error : res.status));
    // Merge local cart into server cart
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      // fetch server cart
      const srv = await fetch('/api/cart', { credentials: 'include' }).then(r=>r.ok? r.json() : null).catch(()=>null);
      const serverItems = (srv && Array.isArray(srv.items)) ? srv.items : [];

      // if there are local items, try to map them to product_id (if missing)
      const toMergeLocal = [];
      if (localCart && localCart.length > 0) {
        // fetch product list for mapping by name if needed
        const products = await fetch('/api/products').then(r=>r.json()).catch(()=>[]);
        const nameToId = {};
        (products||[]).forEach(p=>{ if (p && p.name) nameToId[(p.name||'').toLowerCase()] = p.id; });

        localCart.forEach(item=>{
          const pid = item.product_id || item.id || nameToId[(item.name||'').toLowerCase()];
          if (!pid) return; // skip unmapped
          toMergeLocal.push({ product_id: pid, quantity: Number(item.quantity||1) });
        });
      }

      // build merged map
      const map = new Map();
      (serverItems||[]).forEach(it=>{ map.set(it.product_id, (map.get(it.product_id)||0) + Number(it.quantity||0)); });
      toMergeLocal.forEach(it=>{ map.set(it.product_id, (map.get(it.product_id)||0) + Number(it.quantity||0)); });

      const merged = Array.from(map.entries()).map(([product_id, quantity])=>({ product_id, quantity }));
      if (merged.length) {
        await fetch('/api/cart', { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ items: merged }) }).catch(()=>{});
      }
      // clear local cart after merge
      localStorage.removeItem('cart');
    } catch (err) {
      console.warn('cart merge failed', err);
    }

    alert('Logged in');
    window.location.href = 'index.html';
  });

  // Logout link support
  $(document).on('click', '.logout-link', async function(e){
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(()=>{});
    alert('Logged out');
    window.location.href = 'index.html';
  });

})();