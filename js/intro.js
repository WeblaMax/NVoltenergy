/* Intro: moneda cu logoul NVolt Energy cade, descărcările electrice o înconjoară, apoi "aterizează" în header. ~5s */
(function () {
  var root = document.documentElement, ov = document.getElementById('intro');
  if (!ov || !root.classList.contains('intro-on')) return;

  var cv = ov.querySelector('canvas'), ctx = cv.getContext('2d');
  var stage = ov.querySelector('.stage'), coin = ov.querySelector('.coin');
  var shadow = ov.querySelector('.shadow'), glow = ov.querySelector('.glow');
  var flashEl = ov.querySelector('.flash'), floor = ov.querySelector('.floor');
  var tint = ov.querySelector('.tint'), bg = ov.querySelector('.bg');
  var W, H, DPR, R, T, calm = root.classList.contains('intro-calm');
  /* pe telefoane: DPR mai mic și mai puține particule, ca să ruleze fluid */
  var lite = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || innerWidth < 760;
  var pf = lite ? 0.55 : 1;

  /* ---- fața monedei: ramă argintie + logoul real (fără număr de telefon) pe fond închis ---- */
  var IMG = 'assets/nvolt-coin.jpg';
  var SVG = '<svg viewBox="0 0 200 200" aria-hidden="true"><defs>' +
    '<linearGradient id="cr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#b4c0d4"/><stop offset="1" stop-color="#6f7d97"/></linearGradient>' +
    '<radialGradient id="cm" cx=".3" cy=".25" r=".95"><stop offset="0" stop-color="#fbfdff"/><stop offset=".55" stop-color="#cfd8e6"/><stop offset="1" stop-color="#7d8aa3"/></radialGradient>' +
    '<radialGradient id="vg" cx=".5" cy=".5" r=".5"><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>' +
    '<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<clipPath id="cc"><circle cx="100" cy="100" r="84"/></clipPath></defs>' +
    '<circle cx="100" cy="100" r="100" fill="url(#cr)"/>' +
    '<circle cx="100" cy="100" r="96.5" fill="none" stroke="#5f6e88" stroke-opacity=".55" stroke-width="5" stroke-dasharray="1.1 2.4"/>' +
    '<circle cx="100" cy="100" r="90.5" fill="url(#cm)"/>' +
    '<circle cx="100" cy="100" r="85" fill="#00020b"/>' +
    '<image href="' + IMG + '" xlink:href="' + IMG + '" x="14" y="14" width="172" height="172" clip-path="url(#cc)" preserveAspectRatio="xMidYMid slice"/>' +
    '<circle cx="100" cy="100" r="84" fill="url(#vg)"/>' +
    '<ellipse cx="100" cy="58" rx="72" ry="40" fill="url(#gl)" clip-path="url(#cc)"/>' +
    '<circle cx="100" cy="100" r="84.4" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="1.6"/>' +
    '<circle cx="100" cy="100" r="85.8" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>' +
    '</svg>';

  function buildCoin() {
    coin.innerHTML = '';
    coin.style.width = coin.style.height = R * 2 + 'px';
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
    b.innerHTML = SVG.replace(/id="/g, 'id="b_').replace(/url\(#/g, 'url(#b_') + '<div class="sheen"></div>';
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
    DPR = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
    W = innerWidth; H = innerHeight;
    R = Math.max(70, Math.min(124, W * .27, H * .2));
    cv.width = W * DPR; cv.height = H * DPR;
    buildCoin();
  }
  resize(); var lastW = innerWidth;
  addEventListener('resize', function () { if (innerWidth !== lastW) { lastW = innerWidth; resize(); } }); /* bara de adrese a telefonului schimbă doar înălțimea */

  /* ---- efecte: toate descărcările pornesc de pe margine, spre exterior ---- */
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
        var p = pts[Math.floor(rnd(pts.length * .3, pts.length * .8))], ang = Math.atan2(y2 - y1, x2 - x1) + rnd(-.9, .9), L = Math.hypot(x2 - x1, y2 - y1) * rnd(.2, .4);
        o.br.push(mkBolt(p[0], p[1], p[0] + Math.cos(ang) * L, p[1] + Math.sin(ang) * L, .7, w * .6, ttl, false));
      }
    }
    return o;
  }
  /* arc electric care "aleargă" pe exteriorul ramei */
  function rimArc(a1, a2, w, ttl) {
    var n = 10 + Math.round(Math.abs(a2 - a1) * 12), pts = [];
    for (var i = 0; i <= n; i++) {
      var a = a1 + (a2 - a1) * i / n, rr = R * (i && i < n ? rnd(1.04, 1.13) : 1.03);
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    return { pts: pts, w: w, born: now, ttl: ttl, br: [] };
  }
  function burstDir(x, y, n, spd, ang, spread) {
    for (var i = 0; i < n; i++) {
      var a = ang + (Math.random() - .5) * spread, v = spd * (.3 + Math.random());
      sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: rnd(450, 1100), w: rnd(1, 2.4) });
    }
  }
  function impact(power) {
    var n = Math.round(30 * power * pf), spd = R * 6 * power;
    burstDir(R * .2, R, Math.ceil(n / 2), spd, -.38, .75);                 /* scântei spre dreapta, jos pe podea */
    burstDir(-R * .2, R, Math.ceil(n / 2), spd, Math.PI + .38, .75);       /* și spre stânga */
    for (var i = 0; i < Math.max(2, Math.round((3 + 3 * power) * pf)); i++) {
      var side = i % 2 ? 1 : -1, a = side > 0 ? rnd(-.3, .1) : Math.PI + rnd(-.1, .3), L = R * rnd(.5, 1.1) * power, sx = side * R * rnd(.15, .35);
      bolts.push(mkBolt(sx, R + 2, sx + Math.cos(a) * L, R + 2 + Math.sin(a) * L, .5, 1.3, rnd(90, 170), true));
    }
    ripples.push({ t: now, p: power });
    shakeT = now; shakeA = calm ? 0 : 9 * power;
  }
  function arcs(c) {
    var n = Math.max(1, Math.round((2 + c * 4) * pf));
    for (var i = 0; i < n; i++) {
      var a = rnd(0, Math.PI * 2);
      if (Math.random() < .55) bolts.push(rimArc(a, a + rnd(.5, 1.3) * (Math.random() < .5 ? 1 : -1), rnd(.9, 1.4), rnd(70, 140)));
      else {
        var r2 = R * rnd(1.4, 1.6 + c * 1.1), a3 = a + rnd(-.35, .35);
        bolts.push(mkBolt(Math.cos(a) * R * 1.03, Math.sin(a) * R * 1.03, Math.cos(a3) * r2, Math.sin(a3) * r2, .5, rnd(.9, 1.5), rnd(70, 140), true));
      }
    }
    if (Math.random() < .5 + c * .4) {                                     /* descărcare în podea */
      var s = Math.random() < .5 ? -1 : 1, x1 = s * R * rnd(.3, .65), y1 = Math.sqrt(R * R - x1 * x1) * 1.02;
      bolts.push(mkBolt(x1, y1, s * R * rnd(1, 1.7), R + 5, .6, 1.2, 110, false));
    }
    if (c > .35 && Math.random() < .5) { var b = rnd(0, Math.PI * 2); burstDir(Math.cos(b) * R * 1.05, Math.sin(b) * R * 1.05, 3, R * 2, b, .9); }
  }
  function flashBurst() {
    var L = Math.max(W, H) * .5, nb = lite ? 12 : 16;
    for (var i = 0; i < nb; i++) {
      var a = (i / nb) * Math.PI * 2 + rnd(-.15, .15);
      bolts.push(mkBolt(Math.cos(a) * R * 1.05, Math.sin(a) * R * 1.05, Math.cos(a) * L * rnd(.5, 1), Math.sin(a) * L * rnd(.5, 1), .5, 2.1, rnd(160, 300), true));
    }
    for (var j = 0; j < Math.round(70 * pf); j++) {
      var b = Math.random() * Math.PI * 2, v = R * rnd(3, 9);
      sparks.push({ x: Math.cos(b) * R * 1.04, y: Math.sin(b) * R * 1.04, vx: Math.cos(b) * v, vy: Math.sin(b) * v, age: 0, life: rnd(500, 1200), w: rnd(1, 2.6) });
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
    ctx.shadowColor = '#1E6BFF';
    strokeP(b.pts, w * 5, '#1E6BFF', al * .3, 20);
    strokeP(b.pts, w * 2, '#3d8bff', al * .9, 8);
    ctx.shadowBlur = 0;
    strokeP(b.pts, w * .8, '#eaf4ff', al, 0);
    for (var i = 0; i < b.br.length; i++) drawBolt(b.br[i], kScale);
  }

  /* ---- timeline (ms) ---- */
  var T1 = 1250, B1 = 560, B2 = 260, T2 = T1 + B1, T3 = T2 + B2, CH0 = 2250, FL = 3850, FLY0 = 4150, FLY1 = 4850, END = 5100;
  var now = 0, t0 = 0, shakeT = -1e4, shakeA = 0, last = 0, nextArc = 0, ev = {}, done = false;
  var y0 = -(innerHeight / 2 + R * 2), tgt = null, noTarget = false;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(u) { return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }

  function pose(t) {
    var y = 0, rx = 0, ry = 0, rz = 0, h = 0;
    if (t < T1) {
      var u = t / T1; y = y0 * (1 - u * u); rx = -900 * (1 - u); ry = 28 * Math.sin(u * 7) * (1 - u); rz = 6 * (1 - u);
    } else if (t < T2) {
      var u1 = (t - T1) / B1; h = 105 * 4 * u1 * (1 - u1) * R / 110; y = -h; rx = 360 * ease(u1); ry = 10 * Math.sin(u1 * 6) * (1 - u1);
    } else if (t < T3) {
      var u2 = (t - T2) / B2; h = 26 * 4 * u2 * (1 - u2) * R / 110; y = -h; rx = -8 * Math.sin(u2 * Math.PI);
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
    if (now >= END) return finish();

    var p = pose(now), c = clamp((now - CH0) / (FL - CH0), 0, 1), flyU = clamp((now - FLY0) / (FLY1 - FLY0), 0, 1), fu = ease(flyU);
    var tx = 0, ty = 0, sc = 1, ryF = 0;
    if (flyU > 0) {
      if (!tgt && !noTarget) {               /* protecție: dacă #brandMark lipsește sau e ascuns, nu dăm eroare */
        var bm = document.getElementById('brandMark'), r = bm && bm.getBoundingClientRect();
        if (r && r.width > 1 && r.height > 1) tgt = { x: r.left + r.width / 2 - W / 2, y: r.top + r.height / 2 - H / 2, s: r.height / (2 * R) };
        else noTarget = true;                /* fără țintă → moneda doar se estompează pe loc */
      }
      if (tgt) { tx = tgt.x * fu; ty = tgt.y * fu; sc = 1 + (tgt.s - 1) * fu; ryF = 360 * fu; }
    }
    coin.style.transform = 'translate3d(' + tx + 'px,' + (p.y + ty) + 'px,0) scale(' + sc + ') rotateX(' + p.rx + 'deg) rotateY(' + (p.ry + ryF) + 'deg) rotateZ(' + p.rz + 'deg)';
    var sx = 50 - (p.ry + ryF) * 1.6 + Math.sin(p.rx * Math.PI / 180) * 30 + (c > 0 ? (Math.random() - .5) * 40 * c : 0);
    for (var i = 0; i < sheens.length; i++) sheens[i].style.setProperty('--sx', sx + '%');

    var lift = clamp(p.h / (R * 2.2), 0, 1), fl = flyU > 0 ? 1 - clamp(flyU * 3, 0, 1) : 1;
    shadow.style.opacity = (.95 - lift * .6) * (now < 150 ? 0 : 1) * fl;
    shadow.style.transform = 'scale(' + (1 - lift * .45) + ')';
    var fi = now > FL ? Math.max(0, 1 - (now - FL) / 650) : 0, gl = (.15 + c * c * .75 + fi * .5) * (1 - clamp((now - FLY0) / 500, 0, 1));
    glow.style.opacity = gl;
    glow.style.transform = 'translateY(' + p.y + 'px) scale(' + (1 + c * .15) + ')';
    tint.style.opacity = (c * .35) * (now > FL ? Math.max(0, 1 - (now - FL) / 300) : 1);
    flashEl.style.opacity = now > FL ? Math.max(0, 1 - (now - FL) / 420) * (calm ? .3 : .85) : 0;
    bg.style.opacity = now > 4300 ? 1 - clamp((now - 4300) / 650, 0, 1) : 1;
    floor.style.opacity = bg.style.opacity;
    coin.style.opacity = now > FLY1 - 180 ? 1 - clamp((now - (FLY1 - 180)) / 180, 0, 1) : 1;

    var sh = Math.exp(-(now - shakeT) / 110) * shakeA;
    stage.style.transform = canvasShake(sh);

    if (now > CH0 && now < FL && now >= nextArc) { arcs(c); nextArc = now + 85 - c * 45; }

    /* desen */
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2 + shx, H / 2 + shy); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (var q = ripples.length - 1; q >= 0; q--) {
      var ag = (now - ripples[q].t) / 700; if (ag >= 1) { ripples.splice(q, 1); continue; }
      var rx = R * .3 + ag * R * 2.4 * ripples[q].p;
      ctx.globalAlpha = (1 - ag) * .6; ctx.shadowBlur = 0; ctx.strokeStyle = '#3d8bff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, R + 4, rx, rx * .16, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (var b = bolts.length - 1; b >= 0; b--) { if (now - bolts[b].born > bolts[b].ttl) { bolts.splice(b, 1); continue; } drawBolt(bolts[b], 1 + c * .3); }
    for (var s = sparks.length - 1; s >= 0; s--) {
      var k = sparks[s]; k.age += dt * 1000; if (k.age > k.life) { sparks.splice(s, 1); continue; }
      k.vy += 1700 * dt; k.x += k.vx * dt; k.y += k.vy * dt; k.vx *= (1 - dt * .6);
      if (k.y > R + 4) { k.y = R + 4; k.vy *= -.38; k.vx *= .75; }
      var al = 1 - k.age / k.life;
      ctx.globalAlpha = al; ctx.shadowColor = '#1E6BFF'; ctx.shadowBlur = 8; ctx.strokeStyle = al > .5 ? '#fff' : '#5aa2ff'; ctx.lineWidth = k.w;
      ctx.beginPath(); ctx.moveTo(k.x, k.y); ctx.lineTo(k.x - k.vx * .028, k.y - k.vy * .028); ctx.stroke();
    }
    /* moneda acoperă tot ce trece prin spatele ei: nimic electric peste fața monedei */
    if (flyU === 0) {
      ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      var ex = R * Math.max(.04, Math.abs(Math.cos((p.ry) * Math.PI / 180))) * .98, ey = R * Math.max(.04, Math.abs(Math.cos(p.rx * Math.PI / 180))) * .98;
      ctx.beginPath(); ctx.ellipse(0, p.y, ex, ey, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
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

  requestAnimationFrame(function (ts) { t0 = 0; frame(ts); });
})();
