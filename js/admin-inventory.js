(function(){
  if (typeof document === 'undefined') return;

  function showToast(msg){ const t = document.getElementById('toast'); if(!t) return; t.textContent = msg; t.style.display='block'; setTimeout(()=>t.style.display='none',3000); }

  async function getMe(){ try{ const r = await fetch('/api/me', { credentials: 'include' }); return await r.json(); }catch(e){return { user: null } } }

  async function loadProducts(){ const r = await fetch('/api/products'); if(!r.ok) return []; return await r.json(); }
  async function loadInventory(){ const r = await fetch('/api/inventory'); if(!r.ok) return []; return await r.json(); }

  function renderTable(products, inventory){
    const tbody = document.querySelector('#inventory-table tbody'); tbody.innerHTML = '';
    const prodMap = {};
    (products||[]).forEach(p=>prodMap[p.id]=p);
    (inventory||[]).forEach(row=>{
      const tr = document.createElement('tr');
      const name = (prodMap[row.product_id] && prodMap[row.product_id].name) || '';
      tr.innerHTML = `
        <td>${row.product_id}</td>
        <td>${escapeHtml(name)}</td>
        <td><input type="number" min="0" class="form-control qty-input" value="${row.quantity||0}" data-product-id="${row.product_id}"></td>
        <td><button class="site-btn save-inv" data-product-id="${row.product_id}">Save</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

  async function init(){
    const me = await getMe();
    const userStatus = document.getElementById('user-status');
    if (!me || !me.user){ userStatus.textContent = 'Not signed in'; document.getElementById('not-auth').style.display='block'; return; }
    userStatus.textContent = 'Signed in as ' + (me.user.name || me.user.email || 'user');
    document.getElementById('admin-area').style.display = 'block';

    async function refresh(){
      try{
        const [products, inventory] = await Promise.all([loadProducts(), loadInventory()]);
        renderTable(products, inventory);
      }catch(e){ showToast('Failed loading inventory'); }
    }

    document.getElementById('refresh-inv').addEventListener('click', function(){ refresh(); });

    document.addEventListener('click', async function(e){
      const btn = e.target.closest && e.target.closest('.save-inv'); if (!btn) return;
      const pid = btn.getAttribute('data-product-id');
      const input = document.querySelector('.qty-input[data-product-id="'+pid+'"]');
      if (!input) return;
      const q = parseInt(input.value||0,10);
      btn.disabled = true; btn.textContent = 'Saving...';
      try{
        const res = await fetch('/api/inventory', { method: 'POST', credentials: 'include', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ product_id: pid, quantity: q }) });
        if (!res.ok) { const err = await res.json().catch(()=>({})); showToast('Save failed: ' + (err.error||res.status)); }
        else { showToast('Saved ' + pid + ' = ' + q); }
      }catch(err){ console.warn(err); showToast('Network error'); }
      btn.disabled = false; btn.textContent = 'Save';
    });

    // initial load
    refresh();
  }

  init();
})();
