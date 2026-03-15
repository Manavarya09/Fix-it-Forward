(function(){
  if (typeof document === 'undefined') return;

  function byId(id){ return document.getElementById(id); }
  function text(selector, value){ var el = document.querySelector(selector); if (el) el.textContent = value; }
  function showToast(msg){
    var t = byId('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(function(){ t.style.display = 'none'; }, 2800);
  }

  var profileForm = document.querySelector('.contact-form');
  if (!profileForm) return;

  var accountWrap = document.querySelector('.contact__form');

  var PROFILE_KEY = 'fif_profiles';
  function loadProfiles(){
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); } catch(e){ return {}; }
  }
  function saveProfiles(v){
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(v)); } catch(e){}
  }

  function fillFromUser(user){
    var inputs = profileForm.querySelectorAll('input');
    var first = inputs[0];
    var last = inputs[1];
    var email = inputs[2];
    var phone = inputs[3];
    var address = profileForm.querySelector('textarea');

    var name = (user && user.name) ? String(user.name) : '';
    var parts = name.trim().split(/\s+/);
    var f = parts.shift() || '';
    var l = parts.join(' ');

    if (first) first.value = f;
    if (last) last.value = l;
    if (email) email.value = (user && user.email) || '';
    if (phone) phone.value = '';
    if (address) address.value = '';
  }

  function renderOrderSummary(orders){
    var wrap = accountWrap;
    if (!wrap) return;

    var existing = byId('account-order-summary');
    if (existing) existing.remove();

    var totalOrders = (orders || []).length;
    var totalSpent = (orders || []).reduce(function(sum, o){ return sum + Number(o.total || 0); }, 0);

    var box = document.createElement('div');
    box.id = 'account-order-summary';
    box.style.marginTop = '20px';
    box.innerHTML = '' +
      '<h5>ORDER SUMMARY</h5>' +
      '<p style="margin-bottom:6px;">Orders placed: <strong>' + totalOrders + '</strong></p>' +
      '<p style="margin-bottom:10px;">Total spent: <strong>AED ' + totalSpent.toFixed(2) + '</strong></p>' +
      '<a href="./orders.html" class="site-btn">View All Orders</a>';

    wrap.appendChild(box);
  }

  function fmtDate(value){
    try { return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch(e){ return ''; }
  }

  function daysUntil(value){
    try {
      var target = new Date(value).getTime();
      var now = Date.now();
      var diff = Math.max(0, target - now);
      return Math.ceil(diff / 86400000);
    } catch(e) {
      return 0;
    }
  }

  function renderProfileHeader(user, saved){
    if (!accountWrap) return;
    var existing = byId('account-profile-card');
    if (existing) existing.remove();

    var card = document.createElement('div');
    card.id = 'account-profile-card';
    card.style.marginBottom = '20px';
    card.style.padding = '16px';
    card.style.border = '1px solid #ececec';
    card.style.borderRadius = '8px';
    card.style.background = '#fff';

    var fullName = (saved && saved.name) || (user && user.name) || 'Guest User';
    var phone = (saved && saved.phone) || 'Not set';
    var address = (saved && saved.address) || 'Not set';
    var email = (saved && saved.email) || (user && user.email) || 'Not set';

    card.innerHTML = '' +
      '<h5 style="margin-bottom:10px;">ACCOUNT OVERVIEW</h5>' +
      '<p style="margin:4px 0;"><strong>Name:</strong> ' + fullName + '</p>' +
      '<p style="margin:4px 0;"><strong>Email:</strong> ' + email + '</p>' +
      '<p style="margin:4px 0;"><strong>Phone:</strong> ' + phone + '</p>' +
      '<p style="margin:4px 0;"><strong>Address:</strong> ' + address + '</p>';

    accountWrap.insertBefore(card, accountWrap.firstChild.nextSibling || accountWrap.firstChild);
  }

  function renderRecentOrders(orders){
    if (!accountWrap) return;
    var existing = byId('account-recent-orders');
    if (existing) existing.remove();

    var panel = document.createElement('div');
    panel.id = 'account-recent-orders';
    panel.style.marginTop = '18px';

    var items = Array.isArray(orders) ? orders.slice().sort(function(a, b){
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }) : [];

    panel.innerHTML = '<h5 style="margin-bottom:10px;">RECENT ORDERS</h5>';

    // Tabs: Open / Delivered / Cancelled
    var tabs = document.createElement('div');
    tabs.style.display = 'flex';
    tabs.style.gap = '8px';
    tabs.style.marginBottom = '12px';

    var tabNames = [
      { key: 'open', label: 'Open' },
      { key: 'delivered', label: 'Delivered' },
      { key: 'cancelled', label: 'Cancelled' }
    ];

    tabNames.forEach(function(t, idx){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'account-orders-tab';
      b.dataset.tab = t.key;
      b.textContent = t.label;
      b.style.padding = '8px 12px';
      b.style.border = '1px solid #ddd';
      b.style.background = idx === 0 ? '#222' : '#fff';
      b.style.color = idx === 0 ? '#fff' : '#222';
      b.style.borderRadius = '6px';
      b.style.cursor = 'pointer';
      tabs.appendChild(b);
    });

    panel.appendChild(tabs);

    var listWrap = document.createElement('div');
    listWrap.id = 'account-orders-list';
    panel.appendChild(listWrap);

    accountWrap.appendChild(panel);

    function statusBucket(o){
      var s = (o && o.status || '').toLowerCase();
      if (s.indexOf('deliver') !== -1 || s === 'delivered') return 'delivered';
      if (s.indexOf('cancel') !== -1 || s === 'cancelled') return 'cancelled';
      return 'open';
    }

    function buildOrderCard(order){
      var eta = fmtDate(order.expected_delivery);
      var etaDays = daysUntil(order.expected_delivery);
      var created = fmtDate(order.created_at);
      var status = order.status || 'Confirmed';
      var tracking = order.tracking_id || 'Pending';
      var total = Number(order.total || 0).toFixed(2);

      // Items thumbnails + details
      var itemsHtml = (order.items || []).map(function(it, idx){
        var img = it.image || 'img/product/product-1.jpg';
        var title = it.name || it.product_id || 'Item';
        var qty = Number(it.quantity || 1);
        var price = Number(it.price || 0).toFixed(2);
        return '' +
          '<div class="order-item" data-order="' + order.id + '" data-index="' + idx + '" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #f0f0f0;">' +
            '<img src="' + img + '" alt="' + title + '" style="width:56px;height:56px;object-fit:cover;border-radius:6px;">' +
            '<div style="flex:1;">' +
              '<div style="font-size:14px;margin-bottom:4px;">' + title + '</div>' +
              '<div style="font-size:13px;color:#666;">AED ' + price + ' &times; ' + qty + '</div>' +
            '</div>' +
            '<div>' +
              '<button class="buy-again-btn site-btn" data-order="' + order.id + '" data-idx="' + idx + '" type="button" style="padding:6px 10px;">Buy again</button>' +
            '</div>' +
          '</div>';
      }).join('');

      // Progress bar (3 steps)
      var step = 0; // 0: ordered, 1: shipped, 2: delivered
      var sLower = (status || '').toLowerCase();
      if (sLower.indexOf('ship') !== -1) step = 1;
      if (sLower.indexOf('deliver') !== -1 || sLower === 'delivered') step = 2;

      var progressHtml = '' +
        '<div style="margin-top:8px;">' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<div style="flex:1;height:8px;background:#eee;border-radius:8px;position:relative;overflow:hidden;">' +
              '<div class="progress-fill" style="position:absolute;left:0;top:0;height:100%;width:' + ( (step/2)*100 ) + '%;background:linear-gradient(90deg,#4caf50,#8bc34a);"></div>' +
            '</div>' +
            '<div style="min-width:120px;font-size:12px;color:#666;text-align:right;">' + status + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;margin-top:8px;font-size:12px;color:#666;">' +
            '<div style="flex:1;text-align:center;">Ordered</div>' +
            '<div style="flex:1;text-align:center;">Shipped</div>' +
            '<div style="flex:1;text-align:center;">Delivered</div>' +
          '</div>' +
        '</div>';

      return '' +
        '<div style="border:1px solid #ececec;border-radius:8px;padding:12px;margin-bottom:12px;background:#fff;">' +
          '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;">' +
            '<strong>Order #' + order.id + '</strong>' +
            '<span style="font-size:12px;padding:6px 10px;border-radius:999px;background:#f4f4f4;">' + tracking + '</span>' +
          '</div>' +
          '<p style="margin:8px 0 4px 0;">Placed: ' + created + '</p>' +
          progressHtml +
          '<p style="margin:8px 0 4px 0;"><strong>Arriving by:</strong> ' + eta + ' (in ' + etaDays + ' day' + (etaDays === 1 ? '' : 's') + ')</p>' +
          '<p style="margin:4px 0;"><strong>Total:</strong> AED ' + total + '</p>' +
          itemsHtml +
        '</div>';
    }

    function renderListForBucket(bucket){
      listWrap.innerHTML = '';
      var filtered = items.filter(function(o){ return statusBucket(o) === bucket; });
      if (!filtered.length) {
        listWrap.innerHTML = '<p>No orders in this category.</p>';
        return;
      }
      listWrap.innerHTML = filtered.map(buildOrderCard).join('');

      // Attach buy again handlers
      Array.prototype.slice.call(listWrap.querySelectorAll('.buy-again-btn')).forEach(function(btn){
        btn.addEventListener('click', function(ev){
          var ord = btn.dataset.order;
          var idx = Number(btn.dataset.idx || 0);
          var order = items.find(function(o){ return String(o.id) === String(ord); });
          if (!order) return showToast('Order not found');
          var item = order.items && order.items[idx];
          if (!item) return showToast('Item not found');
          // Add to cart: fetch current cart, merge, post
          fetch('/api/cart', { method: 'GET', credentials: 'include' }).then(function(r){ return r.json(); }).then(function(res){
            var current = (res && res.items) || [];
            // Try to find existing
            var found = current.find(function(ci){ return (ci.product_id && item.product_id && String(ci.product_id) === String(item.product_id)) || (ci.name && ci.name === item.name); });
            if (found) found.quantity = Number(found.quantity || 0) + Number(item.quantity || 1);
            else current.push({ product_id: item.product_id, name: item.name, quantity: item.quantity || 1, price: item.price, image: item.image });
            return fetch('/api/cart', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: current }) });
          }).then(function(){ showToast('Added to cart');
            try { if (window.updateCartCount) window.updateCartCount(); } catch(e){}
          }).catch(function(){ showToast('Could not add to cart'); });
        });
      });
    }

    // initialize with 'open'
    renderListForBucket('open');
    Array.prototype.slice.call(panel.querySelectorAll('.account-orders-tab')).forEach(function(b){
      b.addEventListener('click', function(){
        panel.querySelectorAll('.account-orders-tab').forEach(function(x){ x.style.background = '#fff'; x.style.color = '#222'; });
        b.style.background = '#222'; b.style.color = '#fff';
        renderListForBucket(b.dataset.tab);
      });
    });
  }

  function renderOrderHighlight(orders){
    if (!accountWrap) return;
    var params = new URLSearchParams(window.location.search);
    var targetId = params.get('order');
    var existing = byId('account-order-highlight');
    if (existing) existing.remove();
    if (!targetId) return;

    var order = (Array.isArray(orders) ? orders : []).find(function(o){ return String(o.id) === String(targetId); });
    if (!order) return;
    var days = daysUntil(order.expected_delivery);

    var banner = document.createElement('div');
    banner.id = 'account-order-highlight';
    banner.style.marginTop = '14px';
    banner.style.padding = '12px';
    banner.style.border = '1px solid #cde6d1';
    banner.style.borderRadius = '8px';
    banner.style.background = '#f1fbf3';
    banner.innerHTML = '<strong>Order #' + order.id + ' confirmed.</strong> It will arrive in ' + days + ' day' + (days === 1 ? '' : 's') + '.';
    accountWrap.appendChild(banner);
  }

  fetch('/api/me', { credentials: 'include' })
    .then(function(r){ return r.json(); })
    .then(function(res){
      var user = res && res.user ? res.user : null;
      if (!user) {
        text('.contact__form h5', 'PROFILE INFORMATION (Guest)');
        renderProfileHeader(null, null);
      }

      fillFromUser(user || {});

      var saved = null;
      if (user && user.id) {
        var profiles = loadProfiles();
        saved = profiles[user.id] || {};
        if (saved.phone) profileForm.querySelectorAll('input')[3].value = saved.phone;
        if (saved.address) profileForm.querySelector('textarea').value = saved.address;
      }

      renderProfileHeader(user, saved);

      return fetch('/api/orders', { credentials: 'include' }).then(function(r){ return r.ok ? r.json() : []; });
    })
    .then(function(orders){
      var normalized = Array.isArray(orders) ? orders : [];
      renderOrderSummary(normalized);
      renderRecentOrders(normalized);
      renderOrderHighlight(normalized);
    })
    .catch(function(){
      renderOrderSummary([]);
      renderRecentOrders([]);
      renderOrderHighlight([]);
    });

  profileForm.addEventListener('submit', function(e){
    e.preventDefault();
    var inputs = profileForm.querySelectorAll('input');
    var first = (inputs[0] && inputs[0].value || '').trim();
    var last = (inputs[1] && inputs[1].value || '').trim();
    var email = (inputs[2] && inputs[2].value || '').trim();
    var phone = (inputs[3] && inputs[3].value || '').trim();
    var address = (profileForm.querySelector('textarea') && profileForm.querySelector('textarea').value || '').trim();

    fetch('/api/me', { credentials: 'include' })
      .then(function(r){ return r.json(); })
      .then(function(res){
        var user = res && res.user ? res.user : null;
        if (user && user.id) {
          var profiles = loadProfiles();
          profiles[user.id] = {
            name: (first + ' ' + last).trim(),
            email: email,
            phone: phone,
            address: address
          };
          saveProfiles(profiles);
          renderProfileHeader(user, profiles[user.id]);
        }
        showToast('Profile updated');
      })
      .catch(function(){ showToast('Profile updated'); });
  });
})();
