/* Shared behaviour: nav + footer, language, theme, reveal, latest release. */
(function () {
  'use strict';

  var REPO = 'shamimsdp/PharmaOneBD-releases';
  var WHATSAPP = 'https://wa.me/8801729730106';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  /* ---------- theme (set early to avoid a flash) ---------- */
  var root = document.documentElement;
  var theme = store.get('ph-theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  root.setAttribute('data-theme', theme);

  var lang = store.get('ph-lang') || 'en';
  root.setAttribute('lang', lang);

  /* ---------- i18n ---------- */
  function applyLang() {
    root.setAttribute('lang', lang);
    document.querySelectorAll('[data-en]').forEach(function (el) {
      var v = el.getAttribute('data-' + lang) || el.getAttribute('data-en');
      if (el.hasAttribute('data-attr')) el.setAttribute(el.getAttribute('data-attr'), v);
      else el.textContent = v;
    });
    var btn = document.getElementById('lang-btn');
    if (btn) btn.querySelector('span').textContent = lang === 'en' ? 'বাংলা' : 'English';
    document.dispatchEvent(new CustomEvent('ph:lang', { detail: lang }));
  }
  function t(en, bn) { return lang === 'bn' ? bn : en; }
  window.PHI = { t: t, lang: function () { return lang; }, apply: applyLang, reveal: function (n) { reveal(n); } };

  /* ---------- chrome ---------- */
  function link(href, en, bn, page, current) {
    return '<a href="' + href + '"' + (page === current ? ' aria-current="page"' : '') +
      ' data-en="' + en + '" data-bn="' + bn + '">' + en + '</a>';
  }

  function mountChrome() {
    var page = document.body.getAttribute('data-page') || 'home';
    var home = page === 'home' ? '' : 'index.html';
    var nav = document.createElement('header');
    nav.className = 'nav';
    nav.id = 'nav';
    nav.innerHTML =
      '<div class="wrap nav__in">' +
        '<a class="brand" href="index.html" aria-label="PharmaOneBD home"><img src="favicon.svg" alt="" width="30" height="30"><span>Pharma<b>OneBD</b></span></a>' +
        '<nav class="nav__links" id="nav-links" aria-label="Primary">' +
          link(home + '#experience', 'Experience', 'অভিজ্ঞতা', 'x', page) +
          link('features.html', 'Features', 'ফিচার', 'features', page) +
          link('reports.html', 'Reports', 'রিপোর্ট', 'reports', page) +
          link(home + '#shelves', 'Shelves', 'শেলফ', 'x', page) +
          link(home + '#pricing', 'Pricing', 'মূল্য', 'x', page) +
          link(home + '#download', 'Download', 'ডাউনলোড', 'x', page) +
        '</nav>' +
        '<div class="nav__tools">' +
          '<button class="chip" id="lang-btn" type="button" aria-label="Switch language"><i class="ph ph-translate" aria-hidden="true"></i><span>বাংলা</span></button>' +
          '<button class="chip chip--icon" id="theme-btn" type="button" aria-label="Toggle light and dark theme"><i class="ph ph-circle-half" aria-hidden="true"></i></button>' +
          '<button class="chip chip--icon menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Menu"><i class="ph ph-list" aria-hidden="true"></i></button>' +
        '</div>' +
      '</div>';
    document.body.prepend(nav);

    var skip = document.createElement('a');
    skip.className = 'skip';
    skip.href = '#main';
    skip.textContent = 'Skip to content';
    document.body.prepend(skip);

    var foot = document.createElement('footer');
    foot.className = 'foot';
    foot.innerHTML =
      '<div class="wrap">' +
        '<div class="foot__grid">' +
          '<div><a class="brand" href="index.html"><img src="favicon.svg" alt="" width="30" height="30"><span>Pharma<b>OneBD</b></span></a>' +
          '<p style="margin-top:.8rem;max-width:36ch" data-en="Pharmacy POS built for Bangladesh. Works offline, syncs when it can." data-bn="বাংলাদেশের জন্য তৈরি ফার্মেসি পিওএস। অফলাইনে চলে, সুযোগ পেলে সিঙ্ক করে।">Pharmacy POS built for Bangladesh. Works offline, syncs when it can.</p></div>' +
          '<nav aria-label="Footer">' +
            link('features.html', 'Features', 'ফিচার', 'f', page) +
            link('reports.html', 'Reports', 'রিপোর্ট', 'r', page) +
            '<a href="https://github.com/' + REPO + '/releases" data-en="All releases" data-bn="সব রিলিজ">All releases</a>' +
            '<a href="' + WHATSAPP + '" data-en="WhatsApp" data-bn="হোয়াটসঅ্যাপ">WhatsApp</a>' +
            '<a href="tel:+8801729730106" data-en="Call us" data-bn="কল করুন">Call us</a>' +
          '</nav>' +
        '</div>' +
        '<small>&copy; 2026 PharmaOneBD</small>' +
      '</div>';
    document.body.appendChild(foot);

    document.getElementById('lang-btn').addEventListener('click', function () {
      lang = lang === 'en' ? 'bn' : 'en';
      store.set('ph-lang', lang);
      applyLang();
    });
    document.getElementById('theme-btn').addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      store.set('ph-theme', theme);
      document.dispatchEvent(new CustomEvent('ph:theme', { detail: theme }));
    });
    var menu = document.getElementById('menu-btn');
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('.nav__links a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- reveal ---------- */
  function mountReveal() {
    var items = document.querySelectorAll('.rv');
    if (!items.length) return;
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
      root.classList.add('is-static');
      return;
    }
    window.PHI.reveal(items);
  }

  /* IntersectionObserver rather than scroll triggers: it also fires for
     anything already on screen (reloads that restore scroll, anchor jumps). */
  function reveal(items) {
    if (reduceMotion || !window.gsap) { items.forEach(function (n) { n.style.opacity = 1; n.style.transform = 'none'; }); return; }
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        gsap.to(e.target, { opacity: 1, y: 0, duration: 0.8, delay: (i++ % 6) * 0.06, ease: 'power3.out', overwrite: true });
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- latest release ---------- */
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return iso.slice(0, 10); }
  }
  function mountRelease() {
    var box = document.getElementById('release');
    if (!box) return;
    fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rel) {
        var apk = (rel.assets || []).filter(function (a) { return /\.apk$/i.test(a.name); })[0];
        var set = function (k, v) { box.querySelectorAll('[data-rel="' + k + '"]').forEach(function (el) { el.textContent = v; }); };
        set('tag', rel.tag_name);
        set('date', fmtDate(rel.published_at));
        if (apk) {
          set('size', (apk.size / 1048576).toFixed(1) + ' MB');
          box.querySelectorAll('[data-rel="apk"]').forEach(function (a) { a.href = apk.browser_download_url; a.removeAttribute('aria-disabled'); });
        }
        var body = rel.body || '';
        var sha = body.match(/SHA-256:\s*([a-f0-9]{64})/i);
        set('sha', sha ? sha[1] : 'see release page');
        var notes = box.querySelector('[data-rel="notes"]');
        if (notes) {
          var lines = body.split('\n').filter(function (l) { return /^\s*[-*]\s+/.test(l); }).slice(0, 6);
          notes.innerHTML = lines.map(function () {
            return '<li><i class="ph ph-check" aria-hidden="true"></i><span></span></li>';
          }).join('');
          notes.querySelectorAll('span').forEach(function (s, i) { s.textContent = lines[i].replace(/^\s*[-*]\s+/, ''); });
        }
      })
      .catch(function () {
        box.querySelectorAll('.skeleton').forEach(function (s) { s.replaceWith(document.createTextNode('see releases')); });
        box.querySelectorAll('[data-rel="apk"]').forEach(function (a) { a.href = 'https://github.com/' + REPO + '/releases/latest'; a.removeAttribute('aria-disabled'); });
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    mountChrome();
    applyLang();
    mountReveal();
    mountRelease();
  });
})();
