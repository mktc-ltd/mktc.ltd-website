(() => {
  const scroller = document.querySelector('#snap-scroller');
  const sections = [...document.querySelectorAll('.snap-section')];
  const dots = [...document.querySelectorAll('.section-dot')];
  const header = document.querySelector('.site-header');

  let active = 0;
  let wheelAccumulator = 0;
  let wheelReset;
  let wheelLock = false;

  const setActive = (index) => {
    active = Math.max(0, Math.min(sections.length - 1, index));
    sections.forEach((s, i) => s.classList.toggle('is-active', i === active));
    dots.forEach((d, i) => {
      const isCurrent = i === active;
      d.classList.toggle('active', isCurrent);
      d.setAttribute('aria-current', isCurrent ? 'page' : 'false');
    });
    header.classList.toggle('header-hidden', active !== 0);
  };

  const detectActiveSection = () => {
    const scrollerRect = scroller.getBoundingClientRect();
    const viewportCenter = scrollerRect.top + scrollerRect.height / 2;
    let closest = 0;
    let distance = Infinity;

    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const d = Math.abs(sectionCenter - viewportCenter);
      if (d < distance) {
        distance = d;
        closest = i;
      }
    });

    if (closest !== active) setActive(closest);
  };

  const goTo = (index) => {
    const target = Math.max(0, Math.min(sections.length - 1, index));
    setActive(target);
    sections[target].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  sections.forEach((section, i) => {
    section.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      const target = sections.findIndex(s => s.id === id);
      if (target >= 0) {
        event.preventDefault();
        goTo(target);
      }
    });
    section.addEventListener('focusin', () => setActive(i));
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = sections.findIndex(s => s.id === dot.dataset.target);
      if (target >= 0) goTo(target);
    });
  });

  document.querySelectorAll('.main-nav a, .footer-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = sections.findIndex(s => s.id === id);
      if (target >= 0) {
        e.preventDefault();
        goTo(target);
      }
    });
  });

  scroller.addEventListener('scroll', detectActiveSection, { passive: true });

  scroller.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelLock) return;

    wheelAccumulator += e.deltaY;
    clearTimeout(wheelReset);
    wheelReset = setTimeout(() => wheelAccumulator = 0, 100);

    const threshold = 22;
    if (Math.abs(wheelAccumulator) >= threshold) {
      const direction = wheelAccumulator > 0 ? 1 : -1;
      wheelAccumulator = 0;
      wheelLock = true;
      goTo(active + direction);
      setTimeout(() => { wheelLock = false; detectActiveSection(); }, 650);
    }
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    const keys = ['ArrowDown','PageDown','ArrowUp','PageUp','Home','End',' '];
    if (!keys.includes(e.key)) return;
    if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName) && e.key === ' ') return;
    e.preventDefault();

    if (e.key === 'Home') return goTo(0);
    if (e.key === 'End') return goTo(sections.length - 1);
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') return goTo(active + 1);
    if (e.key === 'ArrowUp' || e.key === 'PageUp') return goTo(active - 1);
  }, { passive: false });

  let touchStartY = 0;
  scroller.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].clientY;
  }, {passive:true});
  scroller.addEventListener('touchend', e => {
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 45) goTo(active + (delta > 0 ? 1 : -1));
  }, {passive:true});

  const initial = sections.findIndex(s => s.id === location.hash.slice(1));
  setActive(initial >= 0 ? initial : 0);
  if (initial >= 0) {
    requestAnimationFrame(() => sections[initial].scrollIntoView({ block: 'start' }));
  }

  // Keep the URL hash in sync with the active section.
  let hashTimer;
  scroller.addEventListener('scroll', () => {
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => {
      const id = sections[active].id;
      if (location.hash.slice(1) !== id) history.replaceState(null, '', `#${id}`);
    }, 120);
  }, { passive: true });

  document.querySelector('.contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const button = e.currentTarget.querySelector('.submit-button');
    const original = button.innerHTML;
    button.innerHTML = 'Message ready <span>✓</span>';
    button.disabled = true;
    setTimeout(() => { button.innerHTML = original; button.disabled = false; }, 2600);
  });
})();
