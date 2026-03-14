/* Checkout form wiring: post orders to /api/orders when user is logged in */
(function(){
  if (typeof document === 'undefined') return;
  function showToast(msg){ const t = document.getElementById('toast'); if(!t) return; t.textContent = msg; t.style.display='block'; setTimeout(()=>t.style.display='none',3500); }

  // toggle password/note rows
  document.addEventListener('change', function(ev){
    const acc = document.getElementById('acc');
    if (ev.target === acc){
      const row = document.getElementById('password-row');
      if (!row) return;
      row.style.display = acc.checked ? 'block' : 'none';
      row.setAttribute('aria-hidden', !acc.checked);
    }
    const note = document.getElementById('note');
    if (ev.target === note){
      const row = document.getElementById('note-row');
      if (!row) return;
      row.style.display = note.checked ? 'block' : 'none';
      row.setAttribute('aria-hidden', !note.checked);
    }
  });

  document.addEventListener('submit', function(e){
    const form = e.target.closest && e.target.closest('.checkout__form');
    if (!form) return;
    e.preventDefault();
    // gather cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart || cart.length === 0) return alert('Your cart is empty');
    // compute total
    const total = cart.reduce((s,i)=>s + (parseFloat(i.price)||0) * (i.quantity||1), 0);

    // validate required inputs
    const requiredIds = ['first_name','last_name','country','address1','city','state','postcode','phone','email'];
    for (const id of requiredIds){
      const el = form.querySelector('#'+id);
      if (!el) continue;
      if (!el.checkValidity()){
        el.focus(); showToast(el.validationMessage || 'Please complete the required fields'); return;
      }
    }
    // email basic
    const emailEl = form.querySelector('#email');
    if (emailEl && !/^\S+@\S+\.\S+$/.test(emailEl.value)) { emailEl.focus(); showToast('Enter a valid email address'); return; }
    // phone basic
    const phoneEl = form.querySelector('#phone');
    if (phoneEl && phoneEl.value.length < 6) { phoneEl.focus(); showToast('Enter a valid phone number'); return; }

    // collect guest contact info if present in form
    const contact = {};
    try {
      contact.name = (form.querySelector('#first_name').value || '') + ' ' + (form.querySelector('#last_name').value || '');
      contact.email = form.querySelector('#email').value || '';
      contact.phone = form.querySelector('#phone').value || '';
      contact.address = {
        country: form.querySelector('#country').value || '',
        address1: form.querySelector('#address1') && form.querySelector('#address1').value || '',
        address2: form.querySelector('#address2') && form.querySelector('#address2').value || '',
        city: form.querySelector('#city') && form.querySelector('#city').value || '',
        state: form.querySelector('#state') && form.querySelector('#state').value || '',
        postcode: form.querySelector('#postcode') && form.querySelector('#postcode').value || ''
      };
    } catch(e){}

    // Determine selected payment method
    const methodEl = (form.querySelector('input[name="payment_method"]:checked') || { value: 'cheque' });
    const paymentMethod = methodEl.value;

    function placeOrderWithPayment(paymentInfo){
      // paymentInfo can be null for cheque or contain mock payment data
      fetch('/api/me', { credentials: 'include' }).then(r=>r.json()).then(d=>{
        const body = { items: cart, total };
        if (!d || !d.user) body.contact = { name: contact.name || 'Guest', email: contact.email || '', phone: contact.phone || '' };
        if (paymentInfo) body.payment = paymentInfo;
        fetch('/api/orders', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }).then(r=>r.json()).then(res=>{
          if (!res || !res.id) return showToast('Order failed 😿');
          localStorage.removeItem('cart');
          try { showToast('Order placed — ref: ' + res.id + ' 🎉'); } catch(e){}
          window.location.href = 'orders.html?order=' + res.id;
        }).catch(err=>{ console.warn(err); showToast('Order failed 😿'); });
      }).catch(()=>{ showToast('Could not verify login — placing as guest');
        fetch('/api/orders', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart, total, contact, payment: paymentInfo }) }).then(r=>r.json()).then(res=>{ if (res && res.id) { localStorage.removeItem('cart'); showToast('Order placed — ref: ' + res.id + ' 🎉'); window.location.href='orders.html?order='+res.id } else showToast('Order failed 😿'); }).catch(()=>showToast('Order failed 😿'));
      });
    }

    if (paymentMethod === 'card') {
      // show mock payment modal
      const modal = document.getElementById('mock-payment-modal');
      const payForm = document.getElementById('mock-payment-form');
      modal.style.display = 'flex';
      const cancelBtn = document.getElementById('mock-pay-cancel');
      cancelBtn.onclick = function(){ modal.style.display='none'; };
      payForm.onsubmit = function(ev){
        ev.preventDefault();
        const fd = new FormData(payForm);
        const card_name = (fd.get('card_name')||'').trim();
        const card_number = (fd.get('card_number')||'').replace(/\s+/g,'');
        const card_exp = (fd.get('card_exp')||'').trim();
        const card_cvc = (fd.get('card_cvc')||'').trim();
        if (!card_name || !card_number || card_number.length < 12) { showToast('Enter valid card details'); return; }
        if (!/^\d{12,19}$/.test(card_number)) { showToast('Card number looks invalid'); return; }
        if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(card_exp)) { showToast('Expiry must be MM/YY'); return; }
        if (!/^\d{3,4}$/.test(card_cvc)) { showToast('Enter a valid CVC'); return; }

        // switch to processing UI
        const statusRoot = document.getElementById('mock-pay-status');
        const processing = document.getElementById('mock-pay-processing');
        const success = document.getElementById('mock-pay-success');
        const failure = document.getElementById('mock-pay-failure');
        const successMsg = document.getElementById('mock-pay-success-msg');
        const failureMsg = document.getElementById('mock-pay-failure-msg');
        const retryBtn = document.getElementById('mock-pay-retry');
        document.getElementById('mock-pay-body').style.display = 'none';
        statusRoot.style.display = 'block';
        processing.style.display = 'block';
        success.style.display = 'none';
        failure.style.display = 'none';

        // small simulation: deterministic fail for cards starting with 4000, else 90% success
        const willFail = /^4000/.test(card_number) || Math.random() < 0.1;

        setTimeout(function(){
          processing.style.display = 'none';
          if (willFail){
            failure.style.display = 'block';
            failureMsg.textContent = 'The card was declined. Try another card or method.';
            showToast('Payment failed — card declined');
            // allow retry: restore form when retry pressed
            retryBtn.onclick = function(){
              statusRoot.style.display='none';
              document.getElementById('mock-pay-body').style.display='block';
            };
          } else {
            success.style.display = 'block';
            successMsg.textContent = 'Your payment was successful. Processing order…';
            showToast('Payment successful — placing order');
            const tx = 'mock-' + Date.now();
            // proceed to create order and redirect after short delay
            setTimeout(function(){
              placeOrderWithPayment({ method: 'card', status: 'paid', transaction_id: tx, card_last4: card_number.slice(-4) });
            }, 700);
          }
        }, 900);
      };
      // cancel/close handlers
      document.getElementById('mock-pay-close').onclick = function(){ modal.style.display='none'; };
      document.getElementById('mock-pay-cancel').onclick = function(){ modal.style.display='none'; };
    } else if (paymentMethod === 'paypal') {
      // mock paypal immediate success
      try { showToast('Redirecting to PayPal...'); } catch(e){}
      setTimeout(function(){ placeOrderWithPayment({ method: 'paypal', status: 'paid', transaction_id: 'paypal-mock-'+Date.now() }); }, 700);
    } else {
      // cheque / offline - place order with no payment info (pending)
      placeOrderWithPayment(null);
    }
  }, true);

})();
