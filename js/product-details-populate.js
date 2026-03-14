(function(){
  if (typeof PRODUCT_DATA === 'undefined') return;

  function qParam(name){
    const p = new URLSearchParams(window.location.search);
    return p.get(name);
  }

  const id = qParam('id');
  const product = PRODUCT_DATA[id];
  if (!product) return;

  // update title, price, description
  const titleEl = document.querySelector('.product__details__text h3');
  if (titleEl) titleEl.textContent = product.name;

  const priceEl = document.querySelector('.product__details__price');
  if (priceEl) priceEl.textContent = (product.compareAt ? (product.price + '  ' + product.compareAt) : product.price) ? ('AED ' + parseFloat(product.price).toFixed(1)) : '';

  const pdesc = document.querySelector('.product__details__text p');
  if (pdesc) pdesc.textContent = product.description || '';

  // thumbnails and big images
  const thumbContainer = document.querySelector('.product__details__pic__left');
  const bigSlider = document.querySelector('.product__details__pic__slider');
  if (thumbContainer && bigSlider) {
    thumbContainer.innerHTML = '';
    bigSlider.innerHTML = '';
    product.images.forEach(function(src, idx){
      const hash = 'product-' + (idx+1);
      const a = document.createElement('a');
      a.className = 'pt' + (idx===0 ? ' active' : '');
      a.href = '#'+hash;
      const img = document.createElement('img');
      img.src = src;
      img.alt = product.name + ' thumb ' + (idx+1);
      a.appendChild(img);
      thumbContainer.appendChild(a);

      const big = document.createElement('img');
      big.dataset.hash = hash;
      big.className = 'product__big__img';
      big.src = src;
      big.alt = product.name + ' image ' + (idx+1);
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

  // change Add to cart behavior to include product correctly
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function(e){
      e.preventDefault();
      // try to call global addToCart
      if (typeof addToCart === 'function') {
        const qty = parseInt(document.querySelector('.pro-qty input').value) || 1;
        addToCart({ name: product.name, price: product.price, image: product.images[0], quantity: qty });
        alert('Added to cart: ' + product.name);
      } else {
        alert('Cart function unavailable');
      }
    });
  }
})();