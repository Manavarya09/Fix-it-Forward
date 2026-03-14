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
    if (!name||!email||!pass) { try { showToast('Please fill all fields'); } catch(e){ alert('Please fill all fields'); } return; }
    if (pass !== pass2) { try { showToast('Passwords do not match'); } catch(e){ alert('Passwords do not match'); } return; }
    const res = await apiCall('/api/auth/register', { body: { name, email, password: pass } });
    if (!res.ok) {
      const msg = (res.data && res.data.error) ? res.data.error : ('Status ' + res.status);
      try { showToast('Registration failed: ' + msg); } catch(e){ alert('Registration failed: ' + msg); }
      return;
    }
    try { showToast('Registration successful'); } catch(e){};
    window.location.href = 'index.html';
  });

  $(document).on('submit', '.login-form', async function(e){
    e.preventDefault();
    const $f = $(this);
    const email = $f.find('input').eq(0).val().trim().toLowerCase();
    const pass = $f.find('input').eq(1).val();
    if (!email||!pass) { try { showToast('Please enter credentials'); } catch(e){ alert('Please enter credentials'); } return; }
    const res = await apiCall('/api/auth/login', { body: { email, password: pass } });
    if (!res.ok) {
      const msg = (res.data && res.data.error) ? res.data.error : ('Status ' + res.status);
      try { showToast('Login failed: ' + msg); } catch(e){ alert('Login failed: ' + msg); }
      return;
    }
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
        try {
          const p = await fetch('/api/cart', { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ items: merged }) });
          if (!p.ok) console.warn('server cart merge failed', await p.text().catch(()=>null));
        } catch(e) { console.warn('server cart merge error', e); }
      }
      // clear local cart after merge (we'll let app re-sync on redirect)
      try { localStorage.removeItem('cart'); } catch(e){}
    } catch (err) {
      console.warn('cart merge failed', err);
    }
    try { showToast('Logged in'); } catch(e){}
    window.location.href = 'index.html';
  });

  // Logout link support
  $(document).on('click', '.logout-link', async function(e){
    e.preventDefault();
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch(e){}
    try { showToast('Logged out'); } catch(e){}
    window.location.href = 'index.html';
  });

})();