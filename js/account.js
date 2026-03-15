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
    }).slice(0, 5) : [];

    if (!items.length) {
      panel.innerHTML = '<h5>RECENT ORDERS</h5><p>You have no orders yet.</p>';
      accountWrap.appendChild(panel);
      return;
    }

    var cards = items.map(function(order){
      var eta = fmtDate(order.expected_delivery);
      var etaDays = daysUntil(order.expected_delivery);
      var created = fmtDate(order.created_at);
      var status = order.status || 'Confirmed';
      var tracking = order.tracking_id || 'Pending';
      var lines = (order.items || []).slice(0, 3).map(function(it){
        return '<li>' + (it.name || it.product_id || 'Item') + ' x ' + Number(it.quantity || 1) + '</li>';
      }).join('');
      return '' +
        '<div style="border:1px solid #ececec;border-radius:8px;padding:12px;margin-bottom:10px;background:#fff;">' +
          '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;">' +
            '<strong>Order #' + order.id + '</strong>' +
            '<span style="font-size:12px;padding:4px 8px;border-radius:999px;background:#f4f4f4;">' + status + '</span>' +
          '</div>' +
          '<p style="margin:8px 0 4px 0;">Placed: ' + created + '</p>' +
          '<p style="margin:4px 0;"><strong>Arriving by:</strong> ' + eta + ' (in ' + etaDays + ' day' + (etaDays === 1 ? '' : 's') + ')</p>' +
          '<p style="margin:4px 0;"><strong>Tracking:</strong> ' + tracking + '</p>' +
          '<p style="margin:4px 0;"><strong>Total:</strong> AED ' + Number(order.total || 0).toFixed(2) + '</p>' +
          '<ul style="margin:6px 0 0 18px;">' + lines + '</ul>' +
          '<div style="margin-top:8px;"><a href="./orders.html?order=' + order.id + '" class="site-btn" style="padding:8px 14px;line-height:1.2;">Track package</a></div>' +
        '</div>';
    }).join('');

    panel.innerHTML = '<h5>RECENT ORDERS</h5>' + cards;
    accountWrap.appendChild(panel);
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
