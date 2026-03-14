 (function(){
  function qParam(name){
    const p = new URLSearchParams(window.location.search);
    return p.get(name);
  }

  const id = qParam('id');
  if (!id) return;

  fetch('/api/products/' + encodeURIComponent(id)).then(r=>{
    if (!r.ok) throw new Error('Product not found');
    return r.json();
  }).then(product => {
    window.currentProduct = product;
    // update title, price, description
    const titleEl = document.querySelector('.product__details__text h3');
    if (titleEl) titleEl.textContent = product.name || '';

    const priceEl = document.querySelector('.product__details__price');
    if (priceEl) priceEl.textContent = 'AED ' + (parseFloat(product.price||0)).toFixed(1);

    const pdesc = document.querySelector('.product__details__text p');
    if (pdesc) pdesc.textContent = product.description || '';

    // thumbnails and big images
    const thumbContainer = document.querySelector('.product__details__pic__left');
    const bigSlider = document.querySelector('.product__details__pic__slider');
    if (thumbContainer && bigSlider) {
      thumbContainer.innerHTML = '';
      bigSlider.innerHTML = '';
      (product.images || []).forEach(function(src, idx){
        const hash = 'product-' + (idx+1);
        const a = document.createElement('a');
        a.className = 'pt' + (idx===0 ? ' active' : '');
        a.href = '#'+hash;
        const img = document.createElement('img');
        img.src = src;
        img.alt = (product.name || '') + ' thumb ' + (idx+1);
        a.appendChild(img);
        thumbContainer.appendChild(a);

        const big = document.createElement('img');
        big.dataset.hash = hash;
        big.className = 'product__big__img';
        big.src = src;
        big.alt = (product.name||'') + ' image ' + (idx+1);
        bigSlider.appendChild(big);
      });

      // re-init owl if present
      if (typeof $ !== 'undefined' && typeof jQuery !== 'undefined' && $(bigSlider).owlCarousel) {
        try { $(bigSlider).trigger('destroy.owl.carousel'); } catch(e){}
        $(bigSlider).owlCarousel({
          loop: false,
          margin: 0,
          items: 1,
          dots: false,
          nav: true,
          navText: ["<i class='arrow_carrot-left'></i>","<i class='arrow_carrot-right'></i>"],
          smartSpeed: 1200,
          autoHeight: false,
          autoplay: false,
          mouseDrag: false
        });
      }
    }

    // Add to cart button
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
      function updateInventoryUI() {
        // show inventory count
        const infoWrap = document.querySelector('.product__details__text');
        if (infoWrap) {
          let invEl = infoWrap.querySelector('.product-inventory');
          if (!invEl) {
            invEl = document.createElement('p');
            invEl.className = 'product-inventory';
            invEl.style.marginTop = '8px';
            infoWrap.appendChild(invEl);
          }
          const inv = Number(product.inventory || 0);
          if (inv > 0) {
            invEl.textContent = 'In stock: ' + inv;
            cartBtn.disabled = false;
            cartBtn.classList.remove('disabled');
            const qtyWrap = document.querySelector('.pro-qty'); if (qtyWrap) qtyWrap.style.display = '';
          } else {
            invEl.textContent = 'Out of stock';
            cartBtn.disabled = true;
            cartBtn.classList.add('disabled');
            const qtyWrap = document.querySelector('.pro-qty'); if (qtyWrap) qtyWrap.style.display = 'none';
          }
        }
      }

      updateInventoryUI();

      cartBtn.addEventListener('click', function(e){
        e.preventDefault();
        const qty = parseInt(document.querySelector('.pro-qty input').value) || 1;
        const inv = Number(product.inventory || 0);
        if (inv <= 0) {
          try { showToast('Sorry — this item is out of stock.'); } catch(e) { alert('Out of stock'); }
          return;
        }
        if (qty > inv) {
          try { showToast('Only ' + inv + ' left in stock.'); } catch(e) { alert('Not enough stock'); }
          return;
        }
        if (typeof addToCart === 'function') {
          addToCart({ product_id: product.id, name: product.name, price: product.price, image: (product.images||[])[0], quantity: qty });
          // fire analytics event
          fetch('/api/events', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'add_to_cart', payload: { product: product.id, qty } }) }).catch(()=>{});
        } else {
          alert('Cart function unavailable');
        }
      });
    }

  }).catch(err=>{
    console.warn('product load error', err);
  });
})();