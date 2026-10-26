/* Homepage motion. Each animation has a job:
   hero entrance (hierarchy), counters (emphasis on real numbers), chapter
   pinning (the phone shows what the text describes), day scroll (a story told
   in order), shelf dolly (depth), legend filtering (feedback). */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 1021px)');

  function locale() { return window.PHI && PHI.lang() === 'bn' ? 'bn-BD' : 'en-US'; }

  document.addEventListener('DOMContentLoaded', function () {
    var hasGsap = window.gsap && window.ScrollTrigger;
    if (hasGsap) gsap.registerPlugin(ScrollTrigger);

    /* ---------- 3D: hero backdrop + interactive shelf ---------- */
    var heroShelf = null;
    var heroCanvas = document.getElementById('hero-3d');
    if (heroCanvas && window.PHShelf) {
      try {
        heroShelf = PHShelf.mount(heroCanvas, { racks: 3, levels: 4, bins: 6, cameraZ: 11.5, startRot: -0.5, spin: 0.0012 });
        heroShelf.group.position.x = wide.matches ? 3.1 : 0;
      } catch (e) { heroCanvas.remove(); }
    }
    var viewCanvas = document.getElementById('shelf-3d');
    if (viewCanvas && window.PHShelf) {
      try {
        var shelf = PHShelf.mount(viewCanvas, {
          racks: 3, levels: 4, bins: 8, interactive: true, cameraZ: 8, startRot: -0.35, spin: 0.0014,
          tip: document.getElementById('shelf-tip'),
        });
        document.querySelectorAll('.legend button').forEach(function (b) {
          b.addEventListener('click', function () {
            var on = b.getAttribute('aria-pressed') !== 'true';
            b.setAttribute('aria-pressed', String(on));
            shelf.setActive(b.getAttribute('data-state'), on);
          });
        });
      } catch (e) {
        var v = document.querySelector('.shelf__view');
        if (v) v.innerHTML = '<p class="empty" style="padding:2rem">3D view needs WebGL.</p>';
      }
    }

    if (!hasGsap || reduce) {
      document.documentElement.classList.add('is-static');
      document.querySelectorAll('.fact b').forEach(function (b) {
        b.textContent = Number(b.getAttribute('data-count')).toLocaleString(locale());
      });
      initChapters(false);
      return;
    }

    /* ---------- hero entrance ---------- */
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero h1 .ln', { yPercent: 110, opacity: 0, duration: 1, stagger: 0.12 })
      .from('.hero .lede', { y: 18, opacity: 0, duration: 0.7 }, '-=0.5')
      .from('.hero__cta .btn', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.4')
      .from('.hero__phones .phone', { y: 60, opacity: 0, duration: 1, stagger: 0.14 }, '-=1.1');

    gsap.to('.hero__phones .phone--a', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__phones .phone--b', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (heroShelf) {
      gsap.to(heroShelf.group.position, { z: -3.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* ---------- counters ---------- */
    document.querySelectorAll('.fact b').forEach(function (b) {
      var target = Number(b.getAttribute('data-count')), o = { v: 0 };
      b.textContent = '0';
      ScrollTrigger.create({
        trigger: b, start: 'top 90%', once: true,
        onEnter: function () {
          gsap.to(o, {
            v: target, duration: 1.6, ease: 'power2.out',
            onUpdate: function () { b.textContent = Math.round(o.v).toLocaleString(locale()); },
          });
        },
      });
    });

    initChapters(true);

    /* ---------- a day at the pharmacy: pinned horizontal story ---------- */
    var pin = document.querySelector('.day__pin'), track = document.querySelector('.day__track');
    if (pin && track) {
      var mm = gsap.matchMedia();
      mm.add('(min-width: 721px)', function () {
        var distance = function () { return Math.max(track.scrollWidth - window.innerWidth, 0); };
        gsap.to(track, {
          x: function () { return -distance(); }, ease: 'none',
          scrollTrigger: { trigger: pin, start: 'top top', end: function () { return '+=' + distance(); }, pin: true, scrub: 1, invalidateOnRefresh: true },
        });
      });
      mm.add('(max-width: 720px)', function () {
        document.documentElement.classList.add('is-static-day');
        pin.style.height = 'auto'; pin.style.paddingBlock = '2.5rem 3.5rem';
        track.style.overflowX = 'auto'; track.style.scrollSnapType = 'x mandatory';
        track.querySelectorAll('.moment').forEach(function (m) { m.style.scrollSnapAlign = 'start'; });
      });
    }

    // Pin positions are measured once; web fonts and images change heights.
    var refresh = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);

    document.addEventListener('ph:lang', function () {
      setTimeout(refresh, 50);
      document.querySelectorAll('.fact b').forEach(function (b) {
        b.textContent = Number(b.getAttribute('data-count')).toLocaleString(locale());
      });
    });
  });

  /* Chapters: the sticky phone swaps screens as each chapter takes over. */
  function initChapters(animated) {
    var chapters = document.querySelectorAll('.chapter');
    var shots = document.querySelectorAll('.stage .phone img');
    if (!chapters.length || !shots.length) return;
    function show(i) {
      chapters.forEach(function (c, n) { c.classList.toggle('is-active', n === i); });
      shots.forEach(function (s, n) { s.classList.toggle('is-on', n === i); });
    }
    show(0);
    if (!animated || !window.ScrollTrigger) { chapters.forEach(function (c) { c.classList.add('is-active'); }); return; }
    chapters.forEach(function (c, i) {
      ScrollTrigger.create({ trigger: c, start: 'top 58%', end: 'bottom 58%', onToggle: function (self) { if (self.isActive) show(i); } });
    });
  }
})();
