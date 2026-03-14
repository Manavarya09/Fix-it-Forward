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

    // collect guest contact info if present in form
    const contact = {};
    try {
      const form = form || document.querySelector('.checkout__form');
      if (form) {
        contact.name = form.querySelector('input[type=text]') && form.querySelector('input[type=text]').value || '';
        // try to find email/phone fields more robustly
        const inputs = Array.from(form.querySelectorAll('input'));
        inputs.forEach(i=>{
          const n = (i.previousElementSibling && i.previousElementSibling.textContent||'').toLowerCase();
          if (n.indexOf('email') !== -1) contact.email = i.value;
          if (n.indexOf('phone') !== -1) contact.phone = i.value;
        });
      }
    } catch(e){}

    // try to place order as authenticated user first, otherwise send guest contact info
    fetch('/api/me', { credentials: 'include' }).then(r=>r.json()).then(d=>{
      const body = { items: cart, total };
      if (!d || !d.user) {
        // include contact info for guest order
        body.contact = { name: contact.name || 'Guest', email: contact.email || '', phone: contact.phone || '' };
      }
      fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(r=>r.json()).then(res=>{
        if (!res || !res.id) return showToast('Order failed 😿');
        // clear local cart and redirect to order confirmation
        localStorage.removeItem('cart');
        try { showToast('Order placed — ref: ' + res.id + ' 🎉'); } catch(e){}
        window.location.href = 'orders.html?order=' + res.id;
      }).catch(err=>{ console.warn(err); showToast('Order failed 😿'); });
    }).catch(()=>{ showToast('Could not verify login — placing as guest');
      // fallback: post as guest
      fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total, contact })
      }).then(r=>r.json()).then(res=>{ if (res && res.id) { localStorage.removeItem('cart'); showToast('Order placed — ref: ' + res.id + ' 🎉'); window.location.href='orders.html?order='+res.id } else showToast('Order failed 😿'); }).catch(()=>showToast('Order failed 😿'));
    });
  }, true);

})();
