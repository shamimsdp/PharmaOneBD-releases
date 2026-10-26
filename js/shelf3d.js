/* 3D pharmacy shelf (Three.js). Two modes:
   - ambient: non-interactive hero backdrop with pointer parallax
   - interactive: drag to rotate, hover or tap a bin for its details,
     legend chips filter by expiry state.
   Colours are the expiry heatmap the app uses: green fresh, amber under 90
   days, rose under 30 days, dark rose expired. Batch and expiry values are
   generated sample data, and the page says so. */
(function () {
  'use strict';
  if (!window.THREE) return;

  var STATES = [
    { id: 'fresh', color: '#34d399', weight: 0.6, en: 'Fresh', bn: 'ঠিক আছে' },
    { id: 'd90', color: '#f5b342', weight: 0.2, en: 'Under 90 days', bn: '৯০ দিনের কম' },
    { id: 'd30', color: '#fb7185', weight: 0.13, en: 'Under 30 days', bn: '৩০ দিনের কম' },
    { id: 'expired', color: '#9f1239', weight: 0.07, en: 'Expired', bn: 'মেয়াদোত্তীর্ণ' },
  ];
  window.PH_SHELF_STATES = STATES;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function buildData(racks, levels, bins) {
    var rand = rng(20260112), meds = (window.PH && PH.shelfMedicines) || [['Napa 500 mg', 'Paracetamol']];
    var out = [];
    for (var r = 0; r < racks; r++) for (var l = 0; l < levels; l++) for (var b = 0; b < bins; b++) {
      var p = rand(), acc = 0, st = STATES[0];
      for (var i = 0; i < STATES.length; i++) { acc += STATES[i].weight; if (p <= acc) { st = STATES[i]; break; } }
      var days = st.id === 'fresh' ? 120 + Math.floor(rand() * 580)
        : st.id === 'd90' ? 31 + Math.floor(rand() * 58)
        : st.id === 'd30' ? 2 + Math.floor(rand() * 27)
        : -(1 + Math.floor(rand() * 40));
      var m = meds[Math.floor(rand() * meds.length)];
      out.push({
        rack: r, level: l, bin: b, state: st, days: days, med: m,
        batch: 'B' + (1000 + Math.floor(rand() * 8999)),
        h: 0.2 + rand() * 0.14, tilt: (rand() - 0.5) * 0.05,
      });
    }
    return out;
  }

  function mount(canvas, opts) {
    opts = opts || {};
    var interactive = !!opts.interactive;
    var racks = opts.racks || 3, levels = opts.levels || 4, bins = opts.bins || 7;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var data = buildData(racks, levels, bins);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 0.5, opts.cameraZ || 8.2);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    var key = new THREE.DirectionalLight(0xffffff, 0.95); key.position.set(3, 5, 5); scene.add(key);
    var rim = new THREE.DirectionalLight(0x34d399, 0.5); rim.position.set(-5, 2, -3); scene.add(rim);

    var group = new THREE.Group();
    scene.add(group);

    var W = bins * 0.28, H = levels * 0.62, D = 0.42, GAP = 0.5;
    var totalW = racks * W + (racks - 1) * GAP;
    var frameMat = new THREE.MeshStandardMaterial({ color: css('--shelf') || '#2c4a3d', roughness: 0.7, metalness: 0.1 });

    // frame: posts and shelf boards per rack
    var postGeo = new THREE.BoxGeometry(0.05, H + 0.1, D);
    var boardGeo = new THREE.BoxGeometry(W + 0.05, 0.04, D);
    for (var r = 0; r < racks; r++) {
      var x0 = -totalW / 2 + r * (W + GAP);
      [0, W].forEach(function (dx) {
        var post = new THREE.Mesh(postGeo, frameMat);
        post.position.set(x0 + dx, H / 2 - 0.02, 0); group.add(post);
      });
      for (var l = 0; l <= levels; l++) {
        var board = new THREE.Mesh(boardGeo, frameMat);
        board.position.set(x0 + W / 2, l * 0.62 - 0.02, 0); group.add(board);
      }
    }
    group.position.y = -H / 2;

    // medicine boxes as one instanced mesh
    var geo = new THREE.BoxGeometry(0.21, 1, 0.3);
    var mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
    var boxes = new THREE.InstancedMesh(geo, mat, data.length);
    var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3(), eul = new THREE.Euler();
    data.forEach(function (d, i) {
      var x0 = -totalW / 2 + d.rack * (W + GAP);
      pos.set(x0 + 0.17 + d.bin * 0.28, d.level * 0.62 + 0.02 + d.h / 2, 0);
      eul.set(0, d.tilt, 0); q.setFromEuler(eul);
      scl.set(1, d.h, 1);
      m4.compose(pos, q, scl);
      boxes.setMatrixAt(i, m4);
      boxes.setColorAt(i, new THREE.Color(d.state.color));
    });
    boxes.instanceMatrix.needsUpdate = true;
    group.add(boxes);

    // filtering
    var active = {}; STATES.forEach(function (s) { active[s.id] = true; });
    var dim = new THREE.Color('#33473e'), tmp = new THREE.Color();
    function paint() {
      data.forEach(function (d, i) {
        tmp.set(d.state.color);
        if (!active[d.state.id]) tmp.lerp(dim, 0.88);
        boxes.setColorAt(i, tmp);
      });
      boxes.instanceColor.needsUpdate = true;
      draw();
    }

    // sizing
    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      if (interactive) {
        // distance at which the full shelf width fits, plus a margin for rotation
        var halfV = Math.tan((camera.fov * Math.PI) / 360);
        camera.position.z = Math.max(opts.cameraZ || 8, (totalW / 2) / (halfV * camera.aspect) * 1.02 + 0.2);
      }
      camera.updateProjectionMatrix();
      draw();
    }
    var ro = new ResizeObserver(resize); ro.observe(canvas);

    // rotation state
    var rotY = opts.startRot != null ? opts.startRot : -0.45, rotX = 0.06, vel = 0, dragging = false, lastX = 0, lastY = 0;
    var px = 0, py = 0, tpx = 0, tpy = 0;
    var visible = true, raf = 0, running = false;

    function draw() {
      group.rotation.y = rotY + px * 0.25;
      group.rotation.x = rotX + py * 0.08;
      renderer.render(scene, camera);
    }
    function loop() {
      raf = 0;
      if (!visible) { running = false; return; }
      if (!reduce) {
        if (!dragging) { rotY += vel; vel *= 0.94; if (Math.abs(vel) < 0.0004) rotY += opts.spin == null ? 0.0016 : opts.spin; }
        px += (tpx - px) * 0.06; py += (tpy - py) * 0.06;
      }
      draw();
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } else if (reduce) draw(); }

    var io = new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) start();
    }, { threshold: 0.05 });
    io.observe(canvas);

    // pointer
    var tip = opts.tip, ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), hovered = -1;
    function ndc(e) {
      var r = canvas.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      return r;
    }
    function pick(e) {
      var rect = ndc(e);
      ray.setFromCamera(mouse, camera);
      var hit = ray.intersectObject(boxes)[0];
      var id = hit ? hit.instanceId : -1;
      if (id >= 0 && !active[data[id].state.id]) id = -1;
      if (!tip) return;
      if (id < 0) { tip.classList.remove('is-on'); hovered = -1; return; }
      var d = data[id], T = window.PHI ? PHI.t : function (a) { return a; };
      var when = d.days >= 0 ? T('Expires in ' + d.days + ' days', 'মেয়াদ শেষ হবে ' + d.days + ' দিনে')
                             : T('Expired ' + (-d.days) + ' days ago', (-d.days) + ' দিন আগে মেয়াদ শেষ');
      var zone = String.fromCharCode(65 + d.rack);
      tip.innerHTML = '<b></b><span></span><span></span><span></span>';
      tip.children[0].textContent = d.med[0];
      tip.children[1].textContent = d.med[1];
      tip.children[2].textContent = T('Batch ', 'ব্যাচ ') + d.batch + ', ' + when;
      tip.children[3].textContent = T('Zone ' + zone + ', Aisle ' + (d.rack + 1) + ', Shelf ' + (d.level + 1) + ', Bin ' + (d.bin + 1),
        'জোন ' + zone + ', আইল ' + (d.rack + 1) + ', শেলফ ' + (d.level + 1) + ', বিন ' + (d.bin + 1));
      tip.style.left = Math.min(e.clientX - rect.left + 14, rect.width - 210) + 'px';
      tip.style.top = Math.max(e.clientY - rect.top - 90, 8) + 'px';
      tip.classList.add('is-on');
      hovered = id;
    }

    if (interactive) {
      canvas.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; lastY = e.clientY; vel = 0; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener('pointermove', function (e) {
        if (dragging) {
          var dx = e.clientX - lastX; lastX = e.clientX; lastY = e.clientY;
          rotY += dx * 0.006; vel = dx * 0.0006;
          if (tip) tip.classList.remove('is-on');
          if (reduce) draw();
        } else if (e.pointerType === 'mouse') pick(e);
      });
      function end(e) { if (dragging) { dragging = false; if (e.pointerType !== 'mouse' && Math.abs(vel) < 0.0008) pick(e); } }
      canvas.addEventListener('pointerup', end);
      canvas.addEventListener('pointercancel', end);
      canvas.addEventListener('pointerleave', function () { if (tip) tip.classList.remove('is-on'); });
    } else if (!reduce) {
      window.addEventListener('pointermove', function (e) {
        tpx = (e.clientX / window.innerWidth - 0.5) * 2; tpy = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });
    }

    document.addEventListener('ph:theme', function () {
      frameMat.color.set(css('--shelf') || '#2c4a3d'); draw();
    });

    resize(); start();
    return {
      group: group, camera: camera, draw: draw,
      setActive: function (id, on) { active[id] = on; paint(); },
      dispose: function () { ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); renderer.dispose(); },
    };
  }

  window.PHShelf = { mount: mount };
})();
