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