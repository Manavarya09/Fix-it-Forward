(function(){
  if (typeof document === 'undefined') return;
  const container = document.querySelector('.product-list') || document.querySelector('.shop__product__list') || document.body;
  // create search + filters UI
  function createSearchBar(){
    const box = document.createElement('div'); box.className='search-bar mb-3';
    box.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input id="site-search" placeholder="Search products" style="flex:1;padding:8px;border-radius:8px;border:1px solid #e5e7eb">
        <select id="filter-sort" aria-label="Sort">
          <option value="">Sort</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
        <div id="search-pager" style="margin-left:auto"></div>
      </div>
    `;
    const target = document.querySelector('.shop__product__sidebar') || document.querySelector('.container .row');
    if (target) target.parentNode.insertBefore(box, target);
    else document.body.insertBefore(box, document.body.firstChild);
  }

  function renderProducts(items){
    // try to find product grid
    let grid = document.querySelector('.product-grid');
    if (!grid){
      grid = document.createElement('div'); grid.className='product-grid';
      // find insertion point
      const list = document.querySelector('.shop__product__list') || document.querySelector('.shop__product__item') || document.querySelector('.product-list');
      if (list && list.parentNode) list.parentNode.insertBefore(grid, list);
      else document.body.appendChild(grid);
    }
    grid.innerHTML = '';
    items.forEach(p=>{
      const card = document.createElement('article'); card.className='product-card';
      const mainImg = (p.images && p.images[0]) || 'img/placeholder.png';
      const splashImg = (p.images && p.images[1]) || mainImg;
      const avg = (function(){ try{ if (p.reviews && p.reviews.length){ return (p.reviews.reduce((s,r)=>s+(r.rating||0),0)/p.reviews.length); } }catch(e){} return null; })();
      const reviews = p.reviews && p.reviews.length ? p.reviews.length : (Math.floor(Math.random()*4)+1);
      const stars = function(r){ if (!r) r = Math.floor(3 + Math.random()*2); let s=''; for(let i=1;i<=5;i++){ s += i<=Math.round(r) ? '★' : '☆'; } return s; }(avg);
      card.innerHTML = `
        <div class="image-wrap">
          <div class="splash" style="position:absolute;inset:0;background-image:url(${splashImg});background-size:cover;filter:blur(12px) saturate(110%);opacity:0.22"></div>
          <img src="${mainImg}" alt="${(p.name||'Product')}">
          <div class="overlay" data-product-id="${p.id}">
            <button class="overlay-btn" data-action="zoom" aria-label="View larger">🔍</button>
            <button class="overlay-btn" data-action="wishlist" aria-label="Add to wishlist">♡</button>
            <button class="overlay-btn" data-action="cart" aria-label="Add to cart">🛍️</button>
          </div>
        </div>
        <div class="card-body">
          <strong>${p.name||''}</strong>
          <div class="muted">${p.brand||''}</div>
          <div class="reviews" style="margin-top:6px;color:#fbbf24">${stars} <small class="muted">(${reviews})</small></div>
          <div class="price">AED ${Number(p.price||0).toFixed(2)}</div>
          <div style="margin-top:8px"><a class="site-btn" href="product-details.html?id=${p.id}">View</a></div>
        </div>
      `;
      grid.appendChild(card);
    });
    // attach overlay handlers
    grid.querySelectorAll('.overlay').forEach(o=>{
      o.addEventListener('click', function(e){
        const btn = e.target.closest && e.target.closest('button');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const pid = o.getAttribute('data-product-id');
        const article = o.closest('.product-card');
        const imgEl = article.querySelector('img');
        if (action === 'zoom'){
          openImageModal(imgEl.src);
        } else if (action === 'wishlist'){
          toggleWishlist(pid, btn);
        } else if (action === 'cart'){
          addToCart(pid, 1, article);
        }
      });
    });
    // ensure modal element exists
    ensureImageModal();
  }

  // pagination controls
  function renderPager(page, totalPages, onGoto){
    const pager = document.getElementById('search-pager'); if (!pager) return;
    pager.innerHTML = '';
    const ul = document.createElement('ul'); ul.className='pagination';
    const makeBtn = (label,p)=>{ const li=document.createElement('li'); const btn=document.createElement('button'); btn.textContent=label; if(p===page) btn.className='active'; btn.onclick=()=>onGoto(p); li.appendChild(btn); return li; };
    if (page>1) ul.appendChild(makeBtn('Prev', page-1));
    for (let i=Math.max(1,page-2); i<=Math.min(totalPages,page+2); i++){ ul.appendChild(makeBtn(''+i, i)); }
    if (page<totalPages) ul.appendChild(makeBtn('Next', page+1));
    pager.appendChild(ul);
  }

  // fetch page
  async function fetchPage(q,page,sort){
    const url = new URL('/api/products', location.origin);
    if (q) url.searchParams.set('q', q);
    // our API doesn't implement page yet; we'll do client-side pagination for prototype
    const r = await fetch(url);
    if (!r.ok) return { items: [], totalPages: 1 };
    let items = await r.json();
    // client-side sort
    if (sort==='price_asc') items.sort((a,b)=>(a.price||0)-(b.price||0));
    if (sort==='price_desc') items.sort((a,b)=>(b.price||0)-(a.price||0));
    const pageSize = 12;
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const start = (page-1)*pageSize; const pageItems = items.slice(start, start+pageSize);
    return { items: pageItems, totalPages };
  }

  async function init(){
    createSearchBar();
    const input = document.getElementById('site-search');
    const sort = document.getElementById('filter-sort');
    let page = 1; let q=''; let s = '';
    const doFetch = UI.debounce(async ()=>{
      const res = await fetchPage(q,page,s);
      renderProducts(res.items);
      renderPager(page, res.totalPages, (p)=>{ page=p; doFetch(); });
    }, 250);
    input.addEventListener('input', function(e){ q = input.value.trim(); page=1; doFetch(); });
    sort.addEventListener('change', function(){ s = sort.value; page=1; doFetch(); });
    // initial
    doFetch();
  }

  // start when DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// helpers: modal, wishlist, cart
function ensureImageModal(){ if (document.getElementById('image-modal')) return; const m = document.createElement('div'); m.id='image-modal'; m.style.display='none'; m.style.position='fixed'; m.style.inset='0'; m.style.alignItems='center'; m.style.justifyContent='center'; m.style.background='rgba(2,6,23,0.6)'; m.style.zIndex='10000'; m.innerHTML = '<div class="inner"><img src="" alt="Preview"></div>'; m.addEventListener('click', function(){ m.style.display='none'; }); document.body.appendChild(m); }
function openImageModal(src){ ensureImageModal(); const m = document.getElementById('image-modal'); m.querySelector('img').src = src; m.style.display='flex'; }
function toggleWishlist(pid, btn){ try{ const w = JSON.parse(localStorage.getItem('wishlist')||'[]'); const idx = w.indexOf(pid); if (idx===-1){ w.push(pid); localStorage.setItem('wishlist', JSON.stringify(w)); btn.classList.add('active'); UI.showToast('Added to wishlist'); } else { w.splice(idx,1); localStorage.setItem('wishlist', JSON.stringify(w)); btn.classList.remove('active'); UI.showToast('Removed from wishlist'); } }catch(e){console.warn(e);} }
function addToCart(pid, qty, article){ try{ const cart = JSON.parse(localStorage.getItem('cart')||'[]'); const existing = cart.find(i=>i.product_id===pid); if (existing){ existing.quantity = (existing.quantity||0) + qty; } else { const priceText = (article && article.querySelector('.price') && article.querySelector('.price').textContent) || '0'; const price = parseFloat(priceText.replace(/[^0-9\.]/g,'')) || 0; cart.push({ product_id: pid, quantity: qty, price: price }); } localStorage.setItem('cart', JSON.stringify(cart)); UI.showToast('Added to cart'); }catch(e){console.warn(e);} }
