(function(){
  if (typeof document === 'undefined') return;

  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('order');
  var idEl = document.getElementById('confirm-order-id');
  var deliveryEl = document.getElementById('confirm-delivery');
  var trackingEl = document.getElementById('confirm-tracking');
  var statusEl = document.getElementById('confirm-status');
  var subtitleEl = document.getElementById('confirm-subtitle');
  var countEl = document.getElementById('redirect-count');

  function setText(el, value){ if (el) el.textContent = value; }

  function daysUntil(value){
    try {
      var target = new Date(value).getTime();
      var now = Date.now();
      return Math.max(0, Math.ceil((target - now) / 86400000));
    } catch(e) {
      return 2;
    }
  }

  if (orderId) {
    setText(idEl, '#' + orderId);
    fetch('/api/orders/' + encodeURIComponent(orderId), { credentials: 'include' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(order){
        if (!order) return;
        var days = daysUntil(order.expected_delivery);
        setText(deliveryEl, 'In ' + days + ' day' + (days === 1 ? '' : 's'));
        setText(trackingEl, order.tracking_id || 'Pending');
        setText(statusEl, order.status || 'Confirmed');
        if (subtitleEl) {
          subtitleEl.textContent = 'Order #' + order.id + ' is confirmed and expected in ' + days + ' day' + (days === 1 ? '' : 's') + '.';
        }
      })
      .catch(function(){});
  }

  var counter = 5;
  setText(countEl, String(counter));
  var timer = setInterval(function(){
    counter -= 1;
    setText(countEl, String(Math.max(0, counter)));
    if (counter <= 0) {
      clearInterval(timer);
      window.location.href = 'account.html?order=' + encodeURIComponent(orderId || '');
    }
  }, 1000);
})();
