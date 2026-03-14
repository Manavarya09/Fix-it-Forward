(function(){
  if (typeof PRODUCT_DATA === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const q = (params.get('search') || '').trim().toLowerCase();
  if (!q) return;

  // simple filter: hide product items that don't match name
  document.querySelectorAll('.product__item').forEach(function(item){
    const titleEl = item.querySelector('.product__item__text h6');
    const title = titleEl ? titleEl.textContent.trim().toLowerCase() : '';
    if (title.indexOf(q) === -1) {
      item.style.display = 'none';
    } else {
      item.style.display = '';
    }
  });
})();