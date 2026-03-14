(function(){
  if (typeof document === 'undefined') return;
  function qParam(name){ const p = new URLSearchParams(window.location.search); return p.get(name); }
  const id = qParam('order');
  if (!id) return;
  fetch('/api/orders/' + encodeURIComponent(id), { credentials: 'include' }).then(async r=>{
    if (!r.ok) {
      document.querySelector('.shop__cart__table tbody').innerHTML = '<tr><td colspan="5">Order not found or you are not authorized.</td></tr>';
      return;
    }
    const order = await r.json();
    const tbody = document.querySelector('.shop__cart__table tbody');
    if (!tbody) return;
    const date = new Date(order.created_at || Date.now()).toLocaleString();
    tbody.innerHTML = '';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="cart__product__item"><h6>#${order.id}</h6></td>
      <td class="cart__price">${date}</td>
      <td class="cart__total">${order.status}</td>
      <td class="cart__price">AED ${parseFloat(order.total||0).toFixed(1)}</td>
      <td class="cart__close"><a href="#" class="site-btn" id="view-items">Details</a></td>
    `;
    tbody.appendChild(row);

    document.getElementById('view-items').addEventListener('click', function(e){
      e.preventDefault();
      const items = order.items || [];
      let html = '<h4>Order items</h4><ul>' + items.map(it=>`<li>${it.product_id} × ${it.quantity}</li>`).join('') + '</ul>';
      const container = document.createElement('div'); container.className = 'order-items'; container.innerHTML = html;
      document.querySelector('.shop__cart__table').appendChild(container);
    });
  }).catch(err=>{ console.warn(err); });
})();
