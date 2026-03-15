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
    if (phone && !phone.value) phone.value = '';
    if (address && !address.value) address.value = '';
  }

  function renderOrderSummary(orders){
    var wrap = document.querySelector('.contact__form');
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

  fetch('/api/me', { credentials: 'include' })
    .then(function(r){ return r.json(); })
    .then(function(res){
      var user = res && res.user ? res.user : null;
      if (!user) {
        text('.contact__form h5', 'PROFILE INFORMATION (Guest)');
      }

      fillFromUser(user || {});

      if (user && user.id) {
        var profiles = loadProfiles();
        var saved = profiles[user.id] || {};
        if (saved.phone) profileForm.querySelectorAll('input')[3].value = saved.phone;
        if (saved.address) profileForm.querySelector('textarea').value = saved.address;
      }

      return fetch('/api/orders', { credentials: 'include' }).then(function(r){ return r.ok ? r.json() : []; });
    })
    .then(function(orders){
      renderOrderSummary(Array.isArray(orders) ? orders : []);
    })
    .catch(function(){
      renderOrderSummary([]);
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
        }
        showToast('Profile updated');
      })
      .catch(function(){ showToast('Profile updated'); });
  });
})();
