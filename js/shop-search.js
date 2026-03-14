(function(){
  const params = new URLSearchParams(window.location.search);
  const q = (params.get('search') || '').trim();
  if (!q) return;

  // Fetch matching products from API and rebuild listing
  fetch('/api/products?q=' + encodeURIComponent(q)).then(r=>r.json()).then(products=>{
    if (!Array.isArray(products)) return;
    // find product listing container
    const listRow = document.querySelector('.shop .container .col-lg-9 .row');
    if (!listRow) return;
    listRow.innerHTML = '';
    products.forEach(function(p){
      const img = (p.images && p.images[0]) || 'img/shop/shop-1.jpg';
      const price = (typeof p.price !== 'undefined') ? ('AED ' + parseFloat(p.price).toFixed(1)) : '';
      const col = document.createElement('div');
      col.className = 'col-lg-4 col-md-6 mix';
      col.innerHTML = `
        <div class="product__item" data-product-id="${p.id}">
          <div class="product__item__pic set-bg" style="background-image:url('${img}')">
            <ul class="product__hover">
              <li><a href="${img}" class="image-popup"><span class="arrow_expand"></span></a></li>
              <li><a href="#"><span class="icon_heart_alt"></span></a></li>
              <li><a href="#"><span class="icon_bag_alt"></span></a></li>
            </ul>
          </div>
          <div class="product__item__text">
            <h6><a href="product-details.html?id=${p.id}">${p.name}</a></h6>
            <div class="rating">
              <i class="fa fa-star"></i>
              <i class="fa fa-star"></i>
              <i class="fa fa-star"></i>
              <i class="fa fa-star"></i>
              <i class="fa fa-star"></i>
            </div>
            <div class="product__price">${price}</div>
          </div>
        </div>`;
      listRow.appendChild(col);
    });
  }).catch(()=>{});
})();