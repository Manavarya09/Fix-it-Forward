(function(){
  if (typeof document === 'undefined') return;
  window.UI = {};
  UI.showToast = function(msg, timeout=3000){
    let t = document.getElementById('toast');
    if (!t){ t = document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
    t.textContent = msg; t.style.display='block'; t.style.opacity=1;
    clearTimeout(UI._toastTimer);
    UI._toastTimer = setTimeout(()=>{ t.style.opacity=0; setTimeout(()=>t.style.display='none',250); }, timeout);
  };

  // simple fade in helper
  UI.fadeIn = function(el){ el.style.opacity=0; el.style.display='block'; let v=0; const id=setInterval(()=>{ v+=0.08; el.style.opacity=v; if (v>=1){ clearInterval(id); } },16); };

  // debounce utility
  UI.debounce = function(fn, ms){ let t; return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), ms); }; };
})();
