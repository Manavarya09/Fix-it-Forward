(function(){
  if (typeof document === 'undefined') return;

  const PROMOS = {
    'SAVE10': { type: 'percent', value: 10, title: '10% off' },
    'SAVE25': { type: 'fixed', value: 25, title: 'AED 25 off' },
    'FREESHIP': { type: 'fixed', value: 10, title: 'AED 10 shipping credit' }
  };

  function readCart(){ try{ return JSON.parse(localStorage.getItem('cart')||'[]'); }catch(e){return []} }
  function cartSubtotal(){ return readCart().reduce((s,i)=>s + (parseFloat(i.price)||0) * (i.quantity||1),0); }

  function formatAED(n){ return 'AED ' + Number(n||0).toFixed(2); }

  function getApplied(){ try{ return JSON.parse(localStorage.getItem('promo')||'null'); }catch(e){return null} }
  function setApplied(p){ if (p) localStorage.setItem('promo', JSON.stringify(p)); else localStorage.removeItem('promo'); updateAll(); }

  function calculateDiscount(subtotal, promo){
    if (!promo) return 0;
    const def = PROMOS[promo.code];
    if (!def) return 0;
    if (def.type === 'percent') return subtotal * (def.value/100);
    if (def.type === 'fixed') return def.value;
    return 0;
  }

  function updateCartTotals(){
    const subtotal = cartSubtotal();
    const applied = getApplied();
    const discount = calculateDiscount(subtotal, applied||{});
    const total = Math.max(0, subtotal - discount);
    const subEl = document.querySelector('.cart-subtotal');
    const totEl = document.querySelector('.cart-total');
    if (subEl) subEl.textContent = formatAED(subtotal);
    if (totEl) totEl.textContent = formatAED(total);
    // update coupon UI
    const clearBtn = document.getElementById('clear-coupon');
    const msg = document.getElementById('coupon-msg');
    if (applied && msg){ msg.style.display='block'; msg.textContent = `${applied.code} — ${PROMOS[applied.code] ? PROMOS[applied.code].title : '' } (-${formatAED(discount)})`; }
    if (clearBtn) clearBtn.style.display = applied ? 'inline-block' : 'none';
  }

  function updateCheckoutTotals(){
    const subtotal = cartSubtotal();
    const applied = getApplied();
    const discount = calculateDiscount(subtotal, applied||{});
    const total = Math.max(0, subtotal - discount);
    const subEl = document.getElementById('checkout-subtotal');
    const discEl = document.getElementById('checkout-discount');
    const totEl = document.getElementById('checkout-total');
    if (subEl) subEl.textContent = formatAED(subtotal);
    if (discEl) discEl.textContent = formatAED(discount);
    if (totEl) totEl.textContent = formatAED(total);
    const couponBox = document.getElementById('checkout-coupon');
    const couponCode = document.getElementById('checkout-coupon-code');
    if (applied && couponBox){ couponBox.style.display='block'; couponCode.textContent = applied.code; }
    if (!applied && couponBox) couponBox.style.display='none';
  }

  function updateAll(){ updateCartTotals(); updateCheckoutTotals(); }

  // apply handler on shop-cart
  const discForm = document.getElementById('discount-form');
  if (discForm){
    discForm.addEventListener('submit', function(e){ e.preventDefault(); const code = (document.getElementById('coupon-code').value||'').trim().toUpperCase(); if(!code){ alert('Enter a coupon code'); return; }
      if (!PROMOS[code]){ alert('Coupon not found'); return; }
      setApplied({ code });
      alert('Coupon applied: '+code);
    });
    const clearBtn = document.getElementById('clear-coupon');
    if (clearBtn) clearBtn.addEventListener('click', function(){ setApplied(null); document.getElementById('coupon-code').value=''; });
  }

  // checkout clear button
  const coClear = document.getElementById('checkout-clear-coupon');
  if (coClear) coClear.addEventListener('click', function(){ setApplied(null); });

  // observe cart changes in localStorage
  window.addEventListener('storage', function(e){ if (e.key === 'cart' || e.key === 'promo') updateAll(); });

  // initial update
  updateAll();

  // export small API for other scripts
  window.__promo = { getApplied, setApplied, PROMOS };
})();
