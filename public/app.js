const sections = Array.from(document.querySelectorAll('[data-section]'));
const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
const backToTop = document.querySelector('.back-to-top');
let activeIndex = 0;

function isReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToSection(section) {
  if (!section) return;
  section.scrollIntoView({ behavior: isReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

function setActiveSection(index) {
  activeIndex = Math.max(0, Math.min(index, sections.length - 1));
  const activeId = sections[activeIndex]?.id;
  navLinks.forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${activeId}`;
    if (isCurrent) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

function moveFocusToSection(section) {
  if (!section) return;
  if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
  window.requestAnimationFrame(() => section.focus({ preventScroll: true }));
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (!hash || !hash.startsWith('#')) return;
    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, '', hash);
    scrollToSection(target);
    moveFocusToSection(target);
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveSection(sections.indexOf(visible.target));
  },
  { rootMargin: '-35% 0px -52% 0px', threshold: [0.05, 0.25, 0.5] }
);

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));

backToTop.addEventListener('click', () => {
  scrollToSection(sections[0]);
  moveFocusToSection(sections[0]);
});
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('is-visible', window.scrollY > 850);
}, { passive: true });

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const interactive = target.matches('input, textarea, select, button, a, video');
  if (interactive || event.altKey || event.ctrlKey || event.metaKey) return;

  const nextKeys = ['ArrowDown', 'PageDown'];
  const previousKeys = ['ArrowUp', 'PageUp'];

  if (nextKeys.includes(event.key)) {
    event.preventDefault();
    scrollToSection(sections[Math.min(activeIndex + 1, sections.length - 1)]);
  }

  if (previousKeys.includes(event.key)) {
    event.preventDefault();
    scrollToSection(sections[Math.max(activeIndex - 1, 0)]);
  }

  if (event.key === 'Home') {
    event.preventDefault();
    scrollToSection(sections[0]);
  }

  if (event.key === 'End') {
    event.preventDefault();
    scrollToSection(sections[sections.length - 1]);
  }
});

if (window.location.hash) {
  const initialSection = document.querySelector(window.location.hash);
  if (initialSection) {
    setActiveSection(sections.indexOf(initialSection));
    window.requestAnimationFrame(() => scrollToSection(initialSection));
  }
} else {
  setActiveSection(0);
}
