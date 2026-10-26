/* Renders the Features and Reports pages from window.PH (js/data.js). */
(function () {
  'use strict';
  var PH = window.PH;
  if (!PH) return;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function bi(en, bn, tag, cls) {
    return '<' + tag + (cls ? ' class="' + cls + '"' : '') + ' data-en="' + esc(en) + '" data-bn="' + esc(bn) + '">' + esc(en) + '</' + tag + '>';
  }
  function norm(s) { return String(s).toLowerCase(); }

  /* ---------------- features ---------------- */
  function features() {
    var host = document.getElementById('modules');
    var rail = document.getElementById('rail');
    var q = document.getElementById('q');
    var total = 0;
    PH.modules.forEach(function (m) { total += m.items.length; });
    var totalEl = document.getElementById('total-features');
    if (totalEl) { totalEl.setAttribute('data-count', total); totalEl.textContent = total; }

    PH.modules.forEach(function (m) {
      var sec = el('section', 'module');
      sec.id = m.id;
      var head = el('div', 'module__head',
        '<i class="ph ph-' + m.icon + '" aria-hidden="true"></i><div>' +
        bi(m.en, m.bn, 'h2') + bi(m.lead[0], m.lead[1], 'p') + '</div>');
      var list = el('div', 'feat-list');
      m.items.forEach(function (it) {
        var f = el('div', 'feat rv', bi(it[0], it[1], 'h3') + bi(it[2], it[3], 'p'));
        f.setAttribute('data-q', norm(it.join(' ')));
        list.appendChild(f);
      });
      sec.appendChild(head); sec.appendChild(list);
      host.appendChild(sec);

      var a = el('a', null, bi(m.en, m.bn, 'span') + '<em>' + m.items.length + '</em>');
      a.href = '#' + m.id; a.setAttribute('data-m', m.id);
      rail.appendChild(a);
    });
    var empty = el('p', 'empty', bi('No feature matches that search.', 'এই সার্চে কোনো ফিচার মেলেনি।', 'span'));
    empty.hidden = true; host.appendChild(empty);

    function filter() {
      var term = norm(q.value.trim()), any = false;
      PH.modules.forEach(function (m) {
        var sec = document.getElementById(m.id), shown = 0;
        sec.querySelectorAll('.feat').forEach(function (f) {
          var hit = !term || f.getAttribute('data-q').indexOf(term) !== -1;
          f.hidden = !hit; if (hit) shown++;
        });
        sec.hidden = shown === 0; any = any || shown > 0;
        var count = rail.querySelector('[data-m="' + m.id + '"] em');
        count.textContent = shown;
        rail.querySelector('[data-m="' + m.id + '"]').hidden = shown === 0;
      });
      empty.hidden = any;
    }
    q.addEventListener('input', filter);

    // rail highlight without scroll listeners
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          rail.querySelectorAll('a').forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('data-m') === e.target.id); });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    PH.modules.forEach(function (m) { io.observe(document.getElementById(m.id)); });
  }

  /* ---------------- reports ---------------- */
  var ICONS = ['chart-line-up', 'wallet', 'calendar-check', 'calendar-dots', 'trophy', 'coins', 'users-three', 'tag',
    'package', 'calendar-x', 'grid-four', 'warning-diamond', 'percent', 'archive', 'hourglass-medium', 'arrows-clockwise',
    'sliders-horizontal', 'warning', 'notebook', 'chat-circle-text', 'truck', 'chart-bar', 'clock', 'timer', 'shield-warning'];

  function reports() {
    var host = document.getElementById('reports');
    var tabs = document.getElementById('tabs');
    var q = document.getElementById('q');
    var cur = 'all';
    var totalEl = document.getElementById('total-reports');
    if (totalEl) totalEl.textContent = PH.reports.length;

    function tab(id, en, bn) {
      var b = el('button', null, bi(en, bn, 'span'));
      b.type = 'button'; b.setAttribute('data-c', id);
      b.setAttribute('aria-pressed', id === 'all' ? 'true' : 'false');
      b.addEventListener('click', function () {
        cur = id;
        tabs.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        filter();
      });
      tabs.appendChild(b);
    }
    tab('all', 'All reports', 'সব রিপোর্ট');
    PH.reportCats.forEach(function (c) { tab(c.id, c.en, c.bn); });

    PH.reportCats.forEach(function (c) {
      var sec = el('section'); sec.id = c.id; sec.setAttribute('data-cat', c.id);
      var n = PH.reports.filter(function (r) { return r[0] === c.id; }).length;
      sec.appendChild(el('h2', 'rep-cat', bi(c.en, c.bn, 'span') + '<span class="cnt">' + n + '</span>'));
      var grid = el('div', 'rep-grid');
      PH.reports.forEach(function (r, i) {
        if (r[0] !== c.id) return;
        var card = el('article', 'rep rv',
          '<h3><i class="ph ph-' + ICONS[i] + '" aria-hidden="true"></i>' + bi(r[1], r[2], 'span') + '</h3>' + bi(r[3], r[4], 'p'));
        card.setAttribute('data-q', norm(r.join(' ')));
        grid.appendChild(card);
      });
      sec.appendChild(grid); host.appendChild(sec);
    });
    var empty = el('p', 'empty', bi('No report matches that search.', 'এই সার্চে কোনো রিপোর্ট মেলেনি।', 'span'));
    empty.hidden = true; host.appendChild(empty);

    function filter() {
      var term = norm(q.value.trim()), any = false;
      host.querySelectorAll('section[data-cat]').forEach(function (sec) {
        var shown = 0;
        sec.querySelectorAll('.rep').forEach(function (card) {
          var hit = (!term || card.getAttribute('data-q').indexOf(term) !== -1);
          card.hidden = !hit; if (hit) shown++;
        });
        sec.querySelector('.cnt').textContent = shown;
        var inTab = cur === 'all' || cur === sec.getAttribute('data-cat');
        sec.hidden = !inTab || shown === 0; any = any || !sec.hidden;
      });
      empty.hidden = any;
    }
    q.addEventListener('input', filter);

    // phone: real report screens crossfade (static under reduced motion)
    var shots = document.querySelectorAll('.rep-phones img');
    if (shots.length) {
      var i = 0;
      shots[0].classList.add('is-on');
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setInterval(function () {
          shots[i].classList.remove('is-on'); i = (i + 1) % shots.length; shots[i].classList.add('is-on');
        }, 3800);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page');
    if (page === 'features') features();
    if (page === 'reports') reports();
    if (window.PHI) PHI.apply();
    if (window.PHI && window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      PHI.reveal(document.querySelectorAll('.rv'));
    } else {
      document.documentElement.classList.add('is-static');
    }
  });
})();
