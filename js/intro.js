if (sessionStorage.getItem('introSeen')) {
  location.href = 'index.html';
}

const skip = document.querySelector('.skip-intro');
if (skip) skip.addEventListener('click', () => { sessionStorage.setItem('introSeen', '1'); location.href = 'index.html'; });

const enter = document.querySelector('.intro-enter');
enter.addEventListener('click', (e) => {
  e.preventDefault();
  sessionStorage.setItem('introSeen', '1');
  // simple curtain wipe
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.left = 0; overlay.style.top = 0; overlay.style.width = '100%'; overlay.style.height = '0%';
  overlay.style.background = 'var(--clr-primary)';
  overlay.style.zIndex = 9999; document.body.appendChild(overlay);
  gsap.to(overlay, {height: '100%', duration: 0.9, ease: 'power2.inOut', onComplete: () => { location.href = 'index.html'; }});
});

// GSAP SplitText reveal (using SplitText from GSAP bonus; fallback simple split)
const title = document.querySelector('[data-split]');
if (title) {
  try {
    const split = new SplitText(title, {type: 'chars'});
    gsap.set(split.chars, {y: 60, opacity: 0, transformOrigin: '50% 50%'});
    gsap.to(split.chars, {y:0, opacity:1, stagger:0.04, duration:0.9, ease: 'power3.out', delay:0.2});
  } catch (e) {
    // fallback: simple fade
    gsap.fromTo(title, {y: 20, opacity: 0}, {y:0, opacity:1, duration:1});
  }

  // Hide title+tagline after 5 seconds
  setTimeout(() => {
    const tagline = document.querySelector('.intro-tagline');
    gsap.to([title, tagline].filter(Boolean), {opacity: 0, y: -20, duration: 0.7, ease: 'power2.out'});
  }, 5000);
}

// Logo draw placeholder (if an inline SVG with id #logo exists)
const logo = document.querySelector('#logo');
if (logo) {
  try {
    const paths = logo.querySelectorAll('path, line, circle');
    paths.forEach(p => { const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.style.stroke = 'var(--clr-text)'; });
    gsap.to(logo.querySelectorAll('path, line, circle'), {strokeDashoffset:0, duration:1.6, stagger:0.06, ease:'power2.out', onComplete: () => { gsap.to(logo, {opacity:1, duration:0.6}); }});
  } catch (e){}
}

// Magnetic button cursor effect
const magnetic = (btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width/2;
    const y = e.clientY - rect.top - rect.height/2;
    gsap.to(btn, {x: x*0.15, y: y*0.15, duration:0.3});
  });
  btn.addEventListener('mouseleave', () => gsap.to(btn, {x:0,y:0,duration:0.6, ease:'elastic.out(1,0.6)'}));
};
if (enter) magnetic(enter);

// accessibility: if user prefers reduced motion, kill animations
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion)').matches) {
  gsap.killTweensOf('*');
}
