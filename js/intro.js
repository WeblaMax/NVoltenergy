/* Intro: o monedă cu logoul NVolt cade, scânteiază electric și "aterizează" în header. ~5s */
(function () {
  var root = document.documentElement, ov = document.getElementById('intro');
  if (!ov || !root.classList.contains('intro-on')) return;

  var cv = ov.querySelector('canvas'), ctx = cv.getContext('2d');
  var stage = ov.querySelector('.stage'), coin = ov.querySelector('.coin');
  var shadow = ov.querySelector('.shadow'), glow = ov.querySelector('.glow');
  var flashEl = ov.querySelector('.flash'), floor = ov.querySelector('.floor');
  var tint = ov.querySelector('.tint'), bg = ov.querySelector('.bg');
  var W, H, DPR, R, T, calm = root.classList.contains('intro-calm');

  /* ---- coin geometry ---- */
  var MARK = '<g id="mk"><path d="M36 176V52h30l60 76V52h30v124h-30L66 100v76z"/><path d="M146 6 112 74h22l-24 54 56-72h-24l26-50z"/></g>';
  var SVG = '<svg viewBox="0 0 200 200" aria-hidden="true"><defs>' +
    '<radialGradient id="cm" cx=".3" cy=".25" r=".95"><stop offset="0" stop-color="#fbfdff"/><stop offset=".55" stop-color="#d3dbe8"/><stop offset="1" stop-color="#8d9bb3"/></radialGradient>' +
    '<linearGradient id="cr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#b4c0d4"/><stop offset="1" stop-color="#6f7d97"/></linearGradient>' +
    '<linearGradient id="ci" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f4f8fe"/><stop offset="1" stop-color="#a5b2c8"/></linearGradient>' +
    '<linearGradient id="ng" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b8bff"/><stop offset="1" stop-color="#0a34c4"/></linearGradient>' +
    '<linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5e6ff"/><stop offset="1" stop-color="#1ea2ff"/></linearGradient>' + MARK + '</defs>' +
    '<circle cx="100" cy="100" r="100" fill="url(#cr)"/>' +
    '<circle cx="100" cy="100" r="96.500" fill="none" stroke="#5f6e88" stroke-opacity=".55" stroke-width="5" stroke-dasharray="1.100 2.400"/>' +
    '<circle cx="100" cy="100" r="91" fill="url(#cm)"/>' +
    '<circle cx="100" cy="100" r="73" fill="url(#ci)" stroke="#8a97ae" stroke-opacity=".7" stroke-width="1.200"/>' +
    '<circle cx="100" cy="100" r="74.200" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1" transform="translate(.6 .9)" clip-path="none" opacity=".7"/>' +
    '<g transform="translate(100 100) scale(.76) translate(-108 -91)">' +
      '<use href="#mk" fill="#fff" fill-opacity=".95" transform="translate(2.200 3)"/>' +
      '<use href="#mk" fill="#5d6f94" fill-opacity=".55" transform="translate(-1.600 -1.800)"/>' +
      '<path fill="url(#ng)" d="M36 176V52h30l60 76V52h30v124h-30L66 100v76z"/>' +
      '<path fill="url(#bg2)" stroke="#0a2a9c" stroke-width="2.500" stroke-linejoin="round" d="M146 6 112 74h22l-24 54 56-72h-24l26-50z"/>' +
    '</g></svg>';

  function buildCoin() {
    coin.innerHTML = '';
    var s = R * 2;
    coin.style.width = coin.style.height = s + 'px';
    coin.style.marginLeft = coin.style.marginTop = -R + 'px';
    T = R * .17;
    var layers = 9;
    for (var i = 0; i < layers; i++) {
      var e = document.createElement('div'); e.className = 'edge';
      e.style.transform = 'translateZ(' + (-T / 2 + T * i / (layers - 1)) + 'px)';
      coin.appendChild(e);
    }
    var f = document.createElement('div'); f.className = 'face';
    f.style.transform = 'translateZ(' + T / 2 + 'px)';
    f.innerHTML = SVG + '<div class="sheen"></div>';
    var b = document.createElement('div'); b.className = 'face';
    b.style.transform = 'rotateX(180deg) translateZ(' + T / 2 + 'px)';
    b.innerHTML = SVG.replace(/id="/g, 'id="b_').replace(/url\(#/g, 'url(#b_').replace('href="#mk"', 'href="#b_mk"').replace('href="#mk"', 'href="#b_mk"') + '<div class="sheen"></div>';
    coin.appendChild(b); coin.appendChild(f);
    sheens = coin.querySelectorAll('.sheen');
    var sz = R * 2.2;
    shadow.style.width = sz * 1.5 + 'px'; shadow.style.height = sz * .22 + 'px';
    shadow.style.marginLeft = -sz * .75 + 'px'; shadow.style.marginTop = R + 'px';
    var g = R * 5; glow.style.width = glow.style.height = g + 'px'; glow.style.marginLeft = glow.style.marginTop = -g / 2 + 'px';
    floor.style.top = (H / 2 + R) + 'px';
  }
  var sheens;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    R = Math.max(56, Math.min(118, W * .2, H * .2));
    cv.width = W * DPR; cv.height = H * DPR;
    buildCoin();
  }
  resize(); var lastW = innerWidth;
  addEventListener('resize', function () { if (innerWidth !== lastW) { lastW = innerWidth; resize(); } }); /* bara de adrese a telefonului schimbă doar înălțimea */

  /* ---- fx ---- */
  var sparks = [], bolts = [], ripples = [];
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function mkBolt(x1, y1, x2, y2, jag, w, ttl, branch) {
    var pts = [[x1, y1], [x2, y2]];
    for (var l = 0; l < 5; l++) {
      var np = [pts[0]];
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, off = (Math.random() - .5) * len * jag;
        np.push([(a[0] + b[0]) / 2 - dy / len * off, (a[1] + b[1]) / 2 + dx / len * off], b);
      }
      pts = np;
    }
    var o = { pts: pts, w: w, born: now, ttl: ttl, br: [] };
    if (branch) {
      var n = Math.random() < .6 ? 1 : 2;
      for (var k = 0; k < n; k++) {
        var p = pts[Math.floor(rnd(pts.length * .25, pts.length * .75))], ang = Math.atan2(y2 - y1, x2 - x1) + rnd(-1, 1), L = Math.hypot(x2 - x1, y2 - y1) * rnd(.2, .4);
        o.br.push(mkBolt(p[0], p[1], p[0] + Math.cos(ang) * L, p[1] + Math.sin(ang) * L, .7, w * .6, ttl, false));
      }
    }
    return o;
  }
  function burst(x, y, n, spd, spread) {
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (Math.random() - .5) * spread * Math.PI, v = spd * (.25 + Math.random());
      sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: rnd(450, 1100), w: rnd(1, 2.4) });
    }
  }
  function impact(power) {
    burst(0, R, Math.round(34 * power), R * 6.5 * power, 1.7);
    for (var i = 0; i < 3 + Math.round(3 * power); i++) {
      var a = -Math.PI / 2 + rnd(-1.35, 1.35), L = R * rnd(.45, 1.05) * power;
      bolts.push(mkBolt(0, R, Math.cos(a) * L, R + Math.sin(a) * L, .55, 1.3, rnd(90, 170), true));
    }
    ripples.push({ t: now, p: power });
    shakeT = now; shakeA = calm ? 0 : 9 * power;
  }
  function arcs(c) {
    var n = 2 + Math.floor(c * 5);
    for (var i = 0; i < n; i++) {
      var a = rnd(0, Math.PI * 2), r1 = R * rnd(.55, .98), x1 = Math.cos(a) * r1, y1 = Math.sin(a) * r1, x2, y2, r2;
      if (Math.random() < .5) { var a2 = a + rnd(.5, 1.4) * (Math.random() < .5 ? 1 : -1); r2 = R * rnd(.5, .95); x2 = Math.cos(a2) * r2; y2 = Math.sin(a2) * r2; }
      else { r2 = R * rnd(1.25, 1.35 + c * 1.1); var a3 = a + rnd(-.5, .5); x2 = Math.cos(a3) * r2; y2 = Math.sin(a3) * r2; }
      bolts.push(mkBolt(x1, y1, x2, y2, .5, rnd(.9, 1.5), rnd(70, 140), true));
    }
    if (Math.random() < .5 + c * .4) { var fx = rnd(-R * 1.4, R * 1.4); bolts.push(mkBolt(Math.max(-R * .7, Math.min(R * .7, fx * .5)), R * .98, fx, R + 5, .6, 1.2, 110, false)); }
    if (c > .35 && Math.random() < .5) burst(rnd(-R, R) * .8, rnd(-R, R) * .8, 3, R * 2, 2);
  }
  function flashBurst() {
    var L = Math.max(W, H) * .5;
    for (var i = 0; i < 16; i++) {
      var a = (i / 16) * Math.PI * 2 + rnd(-.15, .15);
      bolts.push(mkBolt(Math.cos(a) * R * .55, Math.sin(a) * R * .55, Math.cos(a) * L * rnd(.45, 1), Math.sin(a) * L * rnd(.45, 1), .5, 2.1, rnd(160, 300), true));
    }
    for (var j = 0; j < 70; j++) {
      var b = Math.random() * Math.PI * 2, v = R * rnd(3, 9);
      sparks.push({ x: Math.cos(b) * R * .7, y: Math.sin(b) * R * .7, vx: Math.cos(b) * v, vy: Math.sin(b) * v, age: 0, life: rnd(500, 1200), w: rnd(1, 2.6) });
    }
    ripples.push({ t: now, p: 2.4 });
    shakeT = now; shakeA = calm ? 0 : 14;
  }

  function strokeP(pts, w, col, al, blur) {
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]);
    ctx.globalAlpha = al; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.shadowBlur = blur; ctx.stroke();
  }
  function drawBolt(b, kScale) {
    var age = (now - b.born) / b.ttl; if (age >= 1) return;
    var al = (1 - age) * (.6 + Math.random() * .4), w = b.w * kScale;
    ctx.shadowColor = '#2f7bff';
    strokeP(b.pts, w * 4.5, '#2f7bff', al * .28, 18);
    strokeP(b.pts, w * 1.9, '#2f7bff', al * .9, 8);
    ctx.shadowBlur = 0;
    strokeP(b.pts, w * .8, '#ffffff', al, 0);
    for (var i = 0; i < b.br.length; i++) drawBolt(b.br[i], kScale);
  }

  /* ---- timeline (ms) ---- */
  var T1 = 1250, B1 = 560, B2 = 260, T2 = T1 + B1, T3 = T2 + B2, CH0 = 2250, FL = 3850, FLY0 = 4150, FLY1 = 4850, END = 5100;
  var now = 0, t0 = 0, shakeT = -1e4, shakeA = 0, last = 0, nextArc = 0, ev = {}, done = false;
  var y0 = -(innerHeight / 2 + R * 2), tgt = null;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(u) { return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }

  function pose(t) {
    var y = 0, rx = 0, ry = 0, rz = 0, h = 0;
    if (t < T1) {
      var u = t / T1; y = (y0) * (1 - u * u); rx = -900 * (1 - u); ry = 28 * Math.sin(u * 7) * (1 - u); rz = 6 * (1 - u);
    } else if (t < T2) {
      var u1 = (t - T1) / B1; h = 105 * 4 * u1 * (1 - u1) * R / 110; y = -h; rx = 360 * ease(u1); ry = 10 * Math.sin(u1 * 6) * (1 - u1);
    } else if (t < T3) {
      var u2 = (t - T2) / B2; h = 26 * 4 * u2 * (1 - u2) * R / 110; y = -h; rx = 8 * Math.sin(u2 * Math.PI) * -1;
    } else {
      var s = (t - T3) / 1000; ry = 15 * Math.exp(-s * 2.6) * Math.sin(s * 15); rx = 2.2 * Math.exp(-s * 3) * Math.sin(s * 18);
    }
    return { y: y, rx: rx, ry: ry, rz: rz, h: -y > 0 ? -y : 0 };
  }

  function frame(ts) {
    if (done) return;
    if (!t0) t0 = ts; now = ts - t0;
    var dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts;

    if (!ev.i1 && now >= T1) { ev.i1 = 1; impact(1); }
    if (!ev.i2 && now >= T2) { ev.i2 = 1; impact(.55); }
    if (!ev.i3 && now >= T3) { ev.i3 = 1; impact(.3); }
    if (!ev.fl && now >= FL) { ev.fl = 1; flashBurst(); }
    if (!ev.land && now >= FLY1 - 250) { ev.land = 1; root.classList.add('intro-land'); }
    if (!ev.out && now >= 4350) { ev.out = 1; }
    if (now >= END) return finish();

    var p = pose(now), c = clamp((now - CH0) / (FL - CH0), 0, 1), flyU = clamp((now - FLY0) / (FLY1 - FLY0), 0, 1), fu = ease(flyU);
    var tx = 0, ty = 0, sc = 1, ryF = 0;
    if (flyU > 0) {
      if (!tgt) { var r = document.getElementById('brandMark').getBoundingClientRect(); tgt = { x: r.left + r.width / 2 - W / 2, y: r.top + r.height / 2 - H / 2, s: r.width / (2 * R) }; }
      tx = tgt.x * fu; ty = tgt.y * fu; sc = 1 + (tgt.s - 1) * fu; ryF = 360 * fu;
    }
    coin.style.transform = 'translate3d(' + tx + 'px,' + (p.y + ty) + 'px,0) scale(' + sc + ') rotateX(' + p.rx + 'deg) rotateY(' + (p.ry + ryF) + 'deg) rotateZ(' + p.rz + 'deg)';
    var sx = 50 - (p.ry + ryF) * 1.6 + Math.sin(p.rx * Math.PI / 180) * 30 + (c > 0 ? (Math.random() - .5) * 40 * c : 0);
    for (var i = 0; i < sheens.length; i++) sheens[i].style.setProperty('--sx', sx + '%');

    var lift = clamp(p.h / (R * 2.2), 0, 1), fl = flyU > 0 ? 1 - clamp(flyU * 3, 0, 1) : 1;
    shadow.style.opacity = (.95 - lift * .6) * (now < 150 ? 0 : 1) * fl;
    shadow.style.transform = 'scale(' + (1 - lift * .45 + (now < T1 ? (now / T1) * .0 : 0)) + ')';
    var fi = now > FL ? Math.max(0, 1 - (now - FL) / 650) : 0, gl = (.1 + c * c * .75 + fi * .5) * (1 - clamp((now - FLY0) / 500, 0, 1));
    glow.style.opacity = gl;
    glow.style.transform = 'translateY(' + (p.y + ty * .0) + 'px) scale(' + (1 + c * .15) + ')';
    tint.style.opacity = (c * .32) * (now > FL ? Math.max(0, 1 - (now - FL) / 300) : 1);
    flashEl.style.opacity = now > FL ? Math.max(0, 1 - (now - FL) / 420) * (calm ? .3 : .95) : 0;
    bg.style.opacity = now > 4300 ? 1 - clamp((now - 4300) / 650, 0, 1) : 1;
    floor.style.opacity = bg.style.opacity;
    coin.style.opacity = now > FLY1 - 180 ? 1 - clamp((now - (FLY1 - 180)) / 180, 0, 1) : 1;

    var sh = Math.exp(-(now - shakeT) / 110) * shakeA;
    stage.style.transform = canvasShake(sh);

    if (now > CH0 && now < FL && now >= nextArc) { arcs(c); nextArc = now + 85 - c * 45; }

    /* draw */
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2 + shx, H / 2 + shy); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (var r = ripples.length - 1; r >= 0; r--) {
      var ag = (now - ripples[r].t) / 700; if (ag >= 1) { ripples.splice(r, 1); continue; }
      var rx = R * .3 + ag * R * 2.4 * ripples[r].p;
      ctx.globalAlpha = (1 - ag) * .55; ctx.shadowBlur = 0; ctx.strokeStyle = '#2f7bff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, R + 4, rx, rx * .16, 0, 0, Math.PI * 2); ctx.stroke();
    }
    var flyHide = flyU > 0 ? 1 - clamp(flyU * 2.5, 0, 1) : 1;
    ctx.translate(0, 0);
    for (var b = bolts.length - 1; b >= 0; b--) { if (now - bolts[b].born > bolts[b].ttl) { bolts.splice(b, 1); continue; } drawBolt(bolts[b], 1 + c * .3); }
    for (var s = sparks.length - 1; s >= 0; s--) {
      var q = sparks[s]; q.age += dt * 1000; if (q.age > q.life) { sparks.splice(s, 1); continue; }
      q.vy += 1700 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= (1 - dt * .6);
      if (q.y > R + 4) { q.y = R + 4; q.vy *= -.38; q.vx *= .75; }
      var al = 1 - q.age / q.life;
      ctx.globalAlpha = al; ctx.shadowColor = '#2f7bff'; ctx.shadowBlur = 8; ctx.strokeStyle = al > .5 ? '#fff' : '#4a92ff'; ctx.lineWidth = q.w;
      ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * .028, q.y - q.vy * .028); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }
  var shx = 0, shy = 0;
  function canvasShake(a) { shx = (Math.random() - .5) * a; shy = (Math.random() - .5) * a; return 'translate(' + shx + 'px,' + shy + 'px)'; }

  function finish(fast) {
    if (done) return; done = true;
    var end = function () { root.classList.remove('intro-on', 'intro-land', 'intro-calm'); ov.remove(); };
    root.classList.add('intro-land');
    if (fast) { ov.classList.add('out'); setTimeout(end, 450); } else end();
  }
  ov.querySelector('.skip').addEventListener('click', function () { finish(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(true); });

  /* fonturile nu trebuie să blocheze startul */
  requestAnimationFrame(function (ts) { t0 = 0; frame(ts); });
})();
