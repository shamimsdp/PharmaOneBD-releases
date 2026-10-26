(() => {
  const languageToggle = document.getElementById('language-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const tabs = [...document.querySelectorAll('.workflow-tab')];
  const panels = [...document.querySelectorAll('.workflow-panel')];
  const savedLanguage = (() => { try { return localStorage.getItem('pharmaone-language'); } catch { return null; } })();

  function setLanguage(language) {
    const bangla = language === 'bn';
    document.documentElement.lang = language;
    document.body.classList.toggle('lang-bn', bangla);
    document.querySelectorAll('[data-en][data-bn]').forEach(element => {
      element.textContent = element.dataset[language];
    });
    languageToggle.innerHTML = bangla ? 'English <span aria-hidden="true">↗</span>' : 'বাংলা <span aria-hidden="true">↗</span>';
    languageToggle.setAttribute('aria-label', bangla ? 'Switch to English' : 'Switch to Bangla');
    try { localStorage.setItem('pharmaone-language', language); } catch { /* Storage can be unavailable. */ }
  }
  setLanguage(savedLanguage === 'bn' ? 'bn' : 'en');
  languageToggle.addEventListener('click', () => setLanguage(document.documentElement.lang === 'en' ? 'bn' : 'en'));

  function closeMenu() {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  }
  menuToggle.addEventListener('click', () => {
    const opening = mobileMenu.hidden;
    mobileMenu.hidden = !opening;
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });

  function selectTab(tab, moveFocus = false) {
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      const active = panel.id === `panel-${tab.dataset.panel}`;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    if (moveFocus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
      if (!direction) return;
      event.preventDefault();
      selectTab(tabs[(index + direction + tabs.length) % tabs.length], true);
    });
  });
  selectTab(tabs[0]);
  document.getElementById('year').textContent = String(new Date().getFullYear());

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion && window.gsap) {
    const gsap = window.gsap;
    gsap.from('.hero-copy > *', { opacity: 0, y: 22, duration: .7, stagger: .105, ease: 'power2.out', delay: .08 });
    gsap.from('.app-device', { opacity: 0, y: 45, rotate: 2, duration: 1, ease: 'power3.out', delay: .3 });
    gsap.from('.floating-tag', { opacity: 0, y: 20, duration: .6, stagger: .15, delay: .75 });
    if (window.ScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
      gsap.utils.toArray('.section-intro, .feature-card, .plan, .faq-grid, .why-grid').forEach(element => {
        gsap.from(element, { opacity: 0, y: 34, duration: .72, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
      });
      gsap.to('.art-spark', { y: -28, scrollTrigger: { trigger: '.hero', scrub: 1, start: 'top top', end: 'bottom top' } });
    }
  }
})();
