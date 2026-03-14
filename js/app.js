/* global app entry for smooth scroll, page transitions, custom cursor */
const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion)').matches;
if (isReducedMotion) document.documentElement.classList.add('reduce-motion');

// ====== Smooth scroll (Lenis) ======
let lenis;
function initLenis() {
  if (isReducedMotion) return;
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => t < 0.5 ? (2*t*t) : (1 - Math.pow(-2*t + 2, 2)/2),
    smooth: true,
    direction: 'vertical',
    gestureDirection: 'vertical',
    infinite: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ====== GSAP ScrollTrigger integration ======
function initScrollTrigger() {
  if (isReducedMotion) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || !lenis) return;

  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, {duration: 0, immediate: true});
      }
      return lenis.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
    },
    pinType: document.documentElement.style.transform ? 'transform' : 'fixed'
  });

  lenis.on('scroll', ScrollTrigger.update);
  ScrollTrigger.addEventListener('refresh', () => lenis.update());
  ScrollTrigger.refresh();
}


// ====== Barba page transition ======
let appInitialized = false;

function initGlobal() {
  if (appInitialized) return;
  appInitialized = true;
  initLenis();
  initScrollTrigger();
  initBarba();
}

function initPage() {
  // page-specific initializations (run on each new page load)
  // - refresh ScrollTrigger when content changes
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }

  // Initialize optional enhancements when libraries are available
  initVanillaTilt();
  initSwipers();

  // Initialize UI for product pages, cart, and other dynamic components
  if (typeof window.initAppUI === 'function') {
    window.initAppUI();
  }
}

function initVanillaTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  document.querySelectorAll('.product__item, .card, .tilt').forEach((el) => {
    VanillaTilt.init(el, {
      max: 12,
      speed: 400,
      glare: true,
      "max-glare": 0.18,
      scale: 1.02
    });
  });
}

function initSwipers() {
  if (typeof Swiper === 'undefined') return;
  document.querySelectorAll('.swiper').forEach((container) => {
    if (container.swiper) return;
    new Swiper(container, {
      slidesPerView: 'auto',
      spaceBetween: 20,
      centeredSlides: true,
      grabCursor: true,
      loop: true,
      speed: 800,
      autoplay: {
        delay: 4500,
        disableOnInteraction: false,
      },
      pagination: {
        el: container.querySelector('.swiper-pagination'),
        clickable: true,
      },
      navigation: {
        nextEl: container.querySelector('.swiper-button-next'),
        prevEl: container.querySelector('.swiper-button-prev'),
      },
    });
  });
}

function initBarba() {
  if (typeof barba === 'undefined') return;

  barba.init({
    sync: true,
    prevent: ({el}) => el && el.closest('.no-barba'),
    transitions: [{
      name: 'fade-slide',
      once({next}) {
        animateIn(next.container);
      },
      leave({current}) {
        return gsap.to(current.container, {opacity: 0, scale: 0.98, duration: 0.55, ease: 'power2.inOut'});
      },
      enter({next}) {
        animateIn(next.container);
      }
    }]
  });
}

function animateIn(container) {
  gsap.set(container, {opacity: 0, y: 20});
  gsap.to(container, {opacity: 1, y: 0, duration: 0.75, ease: 'power2.out'});
  initPage();
}

// allow calling from inline <script> on initial load
window.appInit = initGlobal;

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobal);
} else {
  initGlobal();
}
