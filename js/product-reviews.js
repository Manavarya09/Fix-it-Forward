(function(){
  function qParam(name){
    const p = new URLSearchParams(window.location.search);
    return p.get(name);
  }

  function formatDate(ts){
    try{
      const d = ts ? new Date(ts) : new Date();
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }catch(e){ return '' + ts; }
  }

  function starsHtml(rating){
    rating = Math.max(0, Math.min(5, Math.round(rating||0)));
    let out = '';
    for(let i=0;i<5;i++){
      out += '<i class="fa ' + (i<rating ? 'fa-star' : 'fa-star-o') + '"></i>';
    }
    return out;
  }

  function renderReviewsInto(container, reviews){
    container.innerHTML = '';
    if(!reviews || !reviews.length){
      const el = document.createElement('p');
      el.className = 'no-reviews';
      el.textContent = 'No reviews yet. Be the first to review this product.';
      container.appendChild(el);
      return;
    }

    const list = document.createElement('div');
    list.className = 'reviews-list';

    reviews.forEach(function(r){
      const item = document.createElement('div');
      item.className = 'review-item';
      const author = r.author || r.name || 'Anonymous';
      const date = formatDate(r.date || r.created_at || r.timestamp);
      const rating = r.rating || 0;
      const body = r.text || r.comment || '';

      item.innerHTML = `
        <div class="review-head">
          <div class="review-avatar"><span>${(author[0]||'?').toUpperCase()}</span></div>
          <div class="review-meta">
            <strong class="review-author">${escapeHtml(author)}</strong>
            <div class="review-rating">${starsHtml(rating)} <span class="review-date">${escapeHtml(date)}</span></div>
          </div>
        </div>
        <div class="review-body">${escapeHtml(body)}</div>
      `;
      list.appendChild(item);
    });

    container.appendChild(list);
  }

  function escapeHtml(s){
    if(!s && s!==0) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function updateHeading(count){
    const h = document.getElementById('reviews-heading');
    if(h) h.textContent = 'Reviews ( ' + (count||0) + ' )';
  }

  function tryRenderFromProduct(product){
    const container = document.getElementById('product-reviews');
    if(!container) return false;
    const serverReviews = product && (product.reviews || product.review || product.comments) ? (product.reviews || product.review || product.comments) : [];
    const pid = (product && (product.id || product.product_id || product._id)) || null;
    const local = pid ? getLocalReviews(pid) : [];
    let combined = (serverReviews || []).slice().concat(local || []);
    if(!combined || combined.length === 0){
      combined = generateMockReviews(product, 3);
    }
    renderReviewsInto(container, combined);
    updateHeading(combined.length);
    return true;
  }

  function storageKeyFor(id){ return 'fif:reviews:' + id; }
  function getLocalReviews(id){
    try{
      const raw = localStorage.getItem(storageKeyFor(id));
      if(!raw) return [];
      return JSON.parse(raw);
    }catch(e){ return []; }
  }
  function saveLocalReview(id, review){
    if(!id) return;
    const arr = getLocalReviews(id);
    arr.unshift(review);
    try{ localStorage.setItem(storageKeyFor(id), JSON.stringify(arr)); }catch(e){}
  }

  function generateMockReviews(product, count){
    const name = (product && (product.name || product.title)) || 'This product';
    const samples = [
      'Really enjoyed this — quality is excellent and fits as expected.',
      'Good value for money. Would recommend to a friend.',
      'Decent product but shipping took longer than expected.',
      'Loved the fabric and color. Sizing was perfect.',
      'Not what I expected; returns were straightforward though.'
    ];
    const out = [];
    for(let i=0;i<count;i++){
      out.push({
        author: ['Sam','Alex','Jordan','Taylor','Casey'][i%5],
        rating: 5 - (i%3),
        text: samples[i % samples.length],
        date: new Date(Date.now() - (i*86400000)).toISOString()
      });
    }
    return out;
  }

  function renderReviewForm(pid){
    const form = document.getElementById('product-review-form');
    if(!form) return;
    form.addEventListener('submit', function(evt){
      evt.preventDefault();
      const name = (document.getElementById('reviewer-name')||{}).value || 'Anonymous';
      const rating = parseInt((document.getElementById('reviewer-rating')||{}).value) || 5;
      const comment = (document.getElementById('reviewer-comment')||{}).value || '';
      const review = { author: name, rating: rating, text: comment, date: new Date().toISOString() };
      if(pid) saveLocalReview(pid, review);
      // re-render
      const container = document.getElementById('product-reviews');
      const existing = container ? (container._lastRendered || []) : [];
      const combined = [review].concat(existing);
      renderReviewsInto(container, combined);
      updateHeading(combined.length);
      // clear form
      form.reset();
      try { showToast('Thanks — your review was added locally.'); } catch(e){}
    });
  }

  function fetchAndRender(id){
    fetch('/api/products/' + encodeURIComponent(id)).then(r=>{
      if(!r.ok) throw new Error('not found');
      return r.json();
    }).then(prod=>{
      tryRenderFromProduct(prod);
    }).catch(()=>{
      const container = document.getElementById('product-reviews');
      if(container){
        container.innerHTML = '<p class="no-reviews">Unable to load reviews.</p>';
      }
    });
  }

  // wait for window.currentProduct (set by product-details-populate.js)
  const maxWait = 3000; // ms
  let waited = 0;
  const id = qParam('id');
  function tick(){
    if(window.currentProduct){
      tryRenderFromProduct(window.currentProduct);
      return;
    }
    if(id && waited >= maxWait){
      // try fetching directly
      fetchAndRender(id);
      return;
    }
    if(id && !window.currentProduct){
      waited += 200;
      setTimeout(tick, 200);
    }
  }
  // small CSS injection for review styles
  (function injectStyles(){
    const css = `
      .review-list{margin-top:12px}
      .reviews-list{display:block}
      .review-item{border-bottom:1px solid #eee;padding:12px 0}
      .review-head{display:flex;gap:12px;align-items:center}
      .review-avatar{width:44px;height:44px;border-radius:50%;background:#f1f1f1;color:#333;display:flex;align-items:center;justify-content:center;font-weight:700}
      .review-meta{font-size:14px}
      .review-author{display:block}
      .review-rating{i{margin-right:2px}} .review-rating .fa{color:#f6b026;margin-right:2px}
      .review-date{color:#888;font-size:12px;margin-left:8px}
      .review-body{margin-top:8px;color:#444}
      .no-reviews{color:#666;font-style:italic}
    `;
    const s = document.createElement('style'); s.type = 'text/css'; s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  })();

  // start
  setTimeout(function(){
    tick();
    // attempt to attach form handler after product is available
    setTimeout(function(){
      const pid = (window.currentProduct && (window.currentProduct.id || window.currentProduct.product_id)) || qParam('id');
      renderReviewForm(pid);
    }, 200);
  }, 80);
})();
