(function(){
  if (typeof document === 'undefined') return;
  function qParam(name){ const p = new URLSearchParams(window.location.search); return p.get(name); }
  function showToast(msg){ const t = document.getElementById('toast'); if(!t) return; t.textContent = msg; t.style.display='block'; setTimeout(()=>t.style.display='none',3000); }

  const tbody = document.querySelector('.shop__cart__table tbody');
  if (!tbody) return;
  const id = qParam('order');

  function renderOrderRow(order){
    const date = new Date(order.created_at || Date.now()).toLocaleString();
    const tr = document.createElement('tr');
    tr.setAttribute('data-order-id', order.id);
    tr.innerHTML = `
      <td class="cart__product__item"><h6>#${order.id}</h6></td>
      <td class="cart__price">${date}</td>
      <td class="cart__total">${order.status}</td>
      <td class="cart__price">AED ${parseFloat(order.total||0).toFixed(2)}</td>
      <td class="cart__close"><button class="site-btn details-btn" aria-expanded="false" aria-controls="details-${order.id}">Details</button></td>
    `;
    return tr;
  }

  function renderDetailsRow(order){
    const items = order.items || [];
    const tr = document.createElement('tr');
    tr.className = 'order-details-row';
    tr.id = `details-${order.id}`;
    const markup = items.length
      ? '<ul>' + items.map(function(it){
          const lineTotal = (parseFloat(it.price || 0) * Number(it.quantity || 1)).toFixed(2);
          return `<li>${it.name || it.product_id} x ${it.quantity} - AED ${lineTotal}</li>`;
        }).join('') + '</ul>'
      : '<p>No items</p>';
    tr.innerHTML = `<td colspan="5">${markup}</td>`;
    return tr;
  }

  if (id){
    fetch('/api/orders/' + encodeURIComponent(id), { credentials: 'include' }).then(async r=>{
      if (!r.ok) {
        tbody.innerHTML = '<tr><td colspan="5">Order not found or you are not authorized.</td></tr>';
        return;
      }
      const order = await r.json();
      tbody.innerHTML = '';
      tbody.appendChild(renderOrderRow(order));
      const detailsRow = renderDetailsRow(order);
      tbody.appendChild(detailsRow);
      document.querySelector('.details-btn').setAttribute('aria-expanded','true');
    }).catch(err=>{ console.warn(err); showToast('Failed loading order'); });
    return;
  }

  // List view
  fetch('/api/orders', { credentials: 'include' }).then(async r=>{
    if (!r.ok) {
      tbody.innerHTML = '<tr><td colspan="5">No orders found.</td></tr>';
      return;
    }
    const orders = await r.json();
    if (!Array.isArray(orders) || orders.length === 0){
      tbody.innerHTML = '<tr><td colspan="5">You have no orders yet.</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    orders.forEach(o=>{
      tbody.appendChild(renderOrderRow(o));
    });
  }).catch(err=>{ console.warn(err); tbody.innerHTML = '<tr><td colspan="5">Error loading orders.</td></tr>'; });

  // Delegate clicks for details toggles
  document.addEventListener('click', async function(e){
    const btn = e.target.closest && e.target.closest('.details-btn');
    if (!btn) return;
    const tr = btn.closest('tr');
    const oid = tr && tr.getAttribute('data-order-id');
    if (!oid) return;
    const detailsId = `details-${oid}`;
    const existing = document.getElementById(detailsId);
    if (existing){
      existing.remove();
      btn.setAttribute('aria-expanded','false');
      return;
    }
    btn.setAttribute('aria-expanded','true');
    // optimistic loading row
    const loader = document.createElement('tr'); loader.className='order-details-row'; loader.id=detailsId; loader.innerHTML='<td colspan="5">Loading items…</td>';
    tr.parentNode.insertBefore(loader, tr.nextSibling);
    try{
      const res = await fetch('/api/orders/' + encodeURIComponent(oid), { credentials: 'include' });
      if (!res.ok) { loader.innerHTML='<td colspan="5">Unable to load items.</td>'; return; }
      const order = await res.json();
      const newRow = renderDetailsRow(order);
      loader.replaceWith(newRow);
    }catch(err){ console.warn(err); loader.innerHTML='<td colspan="5">Error loading items.</td>'; }
  });

})();
