/* Checkout form wiring: post orders to /api/orders when user is logged in */
(function(){
  if (typeof document === 'undefined') return;

  document.addEventListener('submit', function(e){
    const form = e.target.closest && e.target.closest('.checkout__form');
    if (!form) return;
    e.preventDefault();
    // gather cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart || cart.length === 0) return alert('Your cart is empty');
    // compute total
    const total = cart.reduce((s,i)=>s + (parseFloat(i.price)||0) * (i.quantity||1), 0);

    // check auth
    fetch('/api/me', { credentials: 'include' }).then(r=>r.json()).then(d=>{
      if (!d || !d.user) {
        alert('Please log in to place an order');
        window.location.href = 'login.html';
        return;
      }
      // place order
      fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total })
      }).then(r=>r.json()).then(res=>{
        if (!res || !res.id) return alert('Order failed');
        // clear local cart and redirect to order confirmation
        localStorage.removeItem('cart');
        alert('Order placed — reference: ' + res.id);
        window.location.href = 'orders.html?order=' + res.id;
      }).catch(err=>{ console.warn(err); alert('Order failed'); });
    }).catch(()=>{ alert('Could not verify login'); window.location.href = 'login.html'; });
  }, true);

})();
