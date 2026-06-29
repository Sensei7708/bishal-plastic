/* ── FULL-PAGE 3D BACKGROUND (Canvas 2-D, zero dependencies) ─────── */
(function () {
  'use strict';

  var container = document.getElementById('full-bg-3d');
  if (!container) return;

  /* ── canvas ───────────────────────────────────────────────── */
  var cv  = document.createElement('canvas');
  var ctx = cv.getContext('2d');
  container.appendChild(cv);

  var W, H, cx, cy;

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    W  = window.innerWidth;
    H  = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
    cv.width  = W * dpr;
    cv.height = H * dpr;
    cv.style.width  = W + 'px';
    cv.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', function () { resize(); initStars(); });

  /* ── mouse ────────────────────────────────────────────────── */
  var mx = 0, my = 0;
  document.addEventListener('mousemove', function (e) {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ══════════════════════════════════════════
     1. STAR FIELD
  ══════════════════════════════════════════ */
  var STAR_COUNT = 500;
  var stars = [];

  function initStars() {
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      var hue = Math.random() < 0.6 ? 45 : (Math.random() < 0.5 ? 210 : 30);
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.3 + Math.random() * 2.0,
        alpha: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        hue:  hue,
        sat:  80 + Math.random() * 20,
        lit:  70 + Math.random() * 25,
      });
    }
  }

  function drawStars(t) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = s.alpha * (0.55 + 0.45 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x + mx * 8, s.y + my * 5, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + s.hue + ',' + s.sat + '%,' + s.lit + '%,' + tw + ')';
      ctx.fill();
      /* soft glow halo on brighter stars */
      if (s.r > 1.2) {
        var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
        g.addColorStop(0, 'hsla(' + s.hue + ',' + s.sat + '%,' + s.lit + '%,' + (tw * 0.25) + ')');
        g.addColorStop(1, 'hsla(' + s.hue + ',' + s.sat + '%,' + s.lit + '%,0)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    }
  }

  /* ══════════════════════════════════════════
     2. NEBULA BLOBS
  ══════════════════════════════════════════ */
  var NEBULAS = [
    { xf:0.50, yf:0.40, r:0.38, h:45,  s:90, l:55, a:0.18 },
    { xf:0.20, yf:0.65, r:0.30, h:215, s:85, l:60, a:0.14 },
    { xf:0.78, yf:0.30, r:0.25, h:270, s:80, l:55, a:0.12 },
    { xf:0.60, yf:0.75, r:0.28, h:25,  s:90, l:58, a:0.13 },
    { xf:0.15, yf:0.25, r:0.22, h:170, s:75, l:52, a:0.10 },
  ];

  function drawNebulas(t) {
    NEBULAS.forEach(function (nb, i) {
      var ox = nb.xf * W + Math.sin(t * 0.08 + i) * W * 0.04 + mx * 20;
      var oy = nb.yf * H + Math.cos(t * 0.07 + i) * H * 0.04 + my * 14;
      var r  = nb.r * Math.min(W, H);
      var a  = nb.a * (0.75 + 0.25 * Math.sin(t * 0.12 + i * 1.3));

      var g = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
      g.addColorStop(0,   'hsla(' + nb.h + ',' + nb.s + '%,' + nb.l + '%,' + a + ')');
      g.addColorStop(0.45,'hsla(' + nb.h + ',' + nb.s + '%,' + nb.l + '%,' + (a * 0.5) + ')');
      g.addColorStop(1,   'hsla(' + nb.h + ',' + nb.s + '%,' + nb.l + '%,0)');
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  /* ══════════════════════════════════════════
     3. ROTATING TORUS RINGS  (tilted ellipses)
  ══════════════════════════════════════════ */
  var RINGS = [
    { r:0.40, tilt:0.30, color:'200,164,92',  speed: 0.18,  phase:0.0, width:2.0, alpha:0.55 },
    { r:0.30, tilt:0.55, color:'74,144,217',  speed:-0.27,  phase:1.2, width:1.6, alpha:0.50 },
    { r:0.22, tilt:0.80, color:'255,107,53',  speed: 0.42,  phase:2.4, width:1.3, alpha:0.45 },
    { r:0.14, tilt:0.40, color:'180,100,220', speed:-0.60,  phase:3.7, width:1.0, alpha:0.40 },
  ];

  function drawRings(t) {
    RINGS.forEach(function (rg) {
      var R    = rg.r * Math.min(W, H);
      var rotA = t * rg.speed + rg.phase;
      var tiltFactor = Math.abs(Math.sin(rg.tilt + t * 0.06));
      var ry   = R * (0.12 + tiltFactor * 0.32);

      ctx.save();
      ctx.translate(cx + mx * 25, cy + my * 18);
      ctx.rotate(rotA);

      /* outer glow */
      ctx.beginPath();
      ctx.ellipse(0, 0, R + 6, ry + 3, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(' + rg.color + ',' + (rg.alpha * 0.25) + ')';
      ctx.lineWidth   = 12;
      ctx.stroke();

      /* main ring */
      ctx.beginPath();
      ctx.ellipse(0, 0, R, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(' + rg.color + ',' + rg.alpha + ')';
      ctx.lineWidth   = rg.width;
      ctx.stroke();

      /* inner bright line */
      ctx.beginPath();
      ctx.ellipse(0, 0, R, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,245,210,' + (rg.alpha * 0.4) + ')';
      ctx.lineWidth   = 0.8;
      ctx.stroke();

      ctx.restore();
    });
  }

  /* ══════════════════════════════════════════
     4. DNA DOUBLE HELIX
  ══════════════════════════════════════════ */
  function drawHelix(t) {
    var hx  = cx * 0.30;
    var hh  = H * 0.68;
    var hr  = Math.min(W, H) * 0.052;
    var top = cy - hh / 2;
    var STEPS = 64;

    ctx.save();
    ctx.translate(mx * 15, my * 10);

    /* draw cross-bridges */
    for (var i = 0; i < STEPS; i += 4) {
      var frac = i / STEPS;
      var y    = top + frac * hh;
      var a1   = frac * Math.PI * 6 + t * 0.6;
      var a2   = a1 + Math.PI;
      var x1   = hx + Math.cos(a1) * hr;
      var x2   = hx + Math.cos(a2) * hr;
      var dep  = (Math.sin(a1) + 1) * 0.5;

      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = 'rgba(224,200,120,' + (0.08 + dep * 0.14) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    /* strand 1 (gold) */
    ctx.beginPath();
    for (var i = 0; i <= STEPS; i++) {
      var frac = i / STEPS;
      var y    = top + frac * hh;
      var ang  = frac * Math.PI * 6 + t * 0.6;
      var xp   = hx + Math.cos(ang) * hr;
      if (i === 0) ctx.moveTo(xp, y); else ctx.lineTo(xp, y);
    }
    ctx.strokeStyle = 'rgba(200,164,92,0.70)';
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = 'rgba(200,164,92,0.6)';
    ctx.shadowBlur  = 8;
    ctx.stroke();

    /* strand 2 (blue) */
    ctx.beginPath();
    for (var i = 0; i <= STEPS; i++) {
      var frac = i / STEPS;
      var y    = top + frac * hh;
      var ang  = frac * Math.PI * 6 + t * 0.6 + Math.PI;
      var xp   = hx + Math.cos(ang) * hr;
      if (i === 0) ctx.moveTo(xp, y); else ctx.lineTo(xp, y);
    }
    ctx.strokeStyle = 'rgba(74,144,217,0.65)';
    ctx.shadowColor = 'rgba(74,144,217,0.6)';
    ctx.shadowBlur  = 8;
    ctx.stroke();

    ctx.shadowBlur = 0;

    /* node balls on strands */
    for (var i = 0; i <= STEPS; i += 2) {
      var frac = i / STEPS;
      var y    = top + frac * hh;
      for (var s = 0; s < 2; s++) {
        var ang = frac * Math.PI * 6 + t * 0.6 + s * Math.PI;
        var xp  = hx + Math.cos(ang) * hr;
        var dep = (Math.sin(ang) + 1) * 0.5;
        var r   = 2.5 + dep * 3;
        var col = s === 0 ? '200,164,92' : '74,144,217';
        var gn  = ctx.createRadialGradient(xp, y, 0, xp, y, r * 2.5);
        gn.addColorStop(0, 'rgba(' + col + ',' + (0.6 + dep * 0.4) + ')');
        gn.addColorStop(1, 'rgba(' + col + ',0)');
        ctx.beginPath();
        ctx.arc(xp, y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gn;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ══════════════════════════════════════════
     5. GLOWING ORBS  (6 floating spheres)
  ══════════════════════════════════════════ */
  var ORBS = [
    { xf:0.78, yf:0.22, r:30, col:'200,164,92',  speed:0.55, phase:0.0,  amp:0.08 },
    { xf:0.18, yf:0.58, r:22, col:'74,144,217',  speed:0.40, phase:2.1,  amp:0.06 },
    { xf:0.65, yf:0.76, r:18, col:'255,107,53',  speed:0.72, phase:4.2,  amp:0.05 },
    { xf:0.88, yf:0.62, r:24, col:'180,100,220', speed:0.48, phase:1.5,  amp:0.07 },
    { xf:0.42, yf:0.14, r:19, col:'80,200,130',  speed:0.62, phase:3.3,  amp:0.05 },
    { xf:0.07, yf:0.35, r:16, col:'220,180,40',  speed:0.80, phase:5.1,  amp:0.04 },
  ];

  function drawOrbs(t) {
    ORBS.forEach(function (o) {
      var ox = o.xf * W + mx * 22;
      var oy = o.yf * H + Math.sin(t * o.speed + o.phase) * o.amp * H + my * 16;

      /* large soft outer glow */
      var g1 = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r * 5.5);
      g1.addColorStop(0,   'rgba(' + o.col + ',0.22)');
      g1.addColorStop(0.5, 'rgba(' + o.col + ',0.08)');
      g1.addColorStop(1,   'rgba(' + o.col + ',0)');
      ctx.beginPath();
      ctx.arc(ox, oy, o.r * 5.5, 0, Math.PI * 2);
      ctx.fillStyle = g1;
      ctx.fill();

      /* mid glow */
      var g2 = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r * 2.5);
      g2.addColorStop(0,   'rgba(' + o.col + ',0.55)');
      g2.addColorStop(0.6, 'rgba(' + o.col + ',0.22)');
      g2.addColorStop(1,   'rgba(' + o.col + ',0)');
      ctx.beginPath();
      ctx.arc(ox, oy, o.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();

      /* solid core with specular */
      var g3 = ctx.createRadialGradient(
        ox - o.r * 0.3, oy - o.r * 0.3, 0,
        ox, oy, o.r
      );
      g3.addColorStop(0,   'rgba(255,255,255,0.95)');
      g3.addColorStop(0.25,'rgba(' + o.col + ',0.90)');
      g3.addColorStop(1,   'rgba(' + o.col + ',0.50)');
      ctx.beginPath();
      ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
      ctx.fillStyle = g3;
      ctx.fill();
    });
  }

  /* ══════════════════════════════════════════
     6. AURORA WAVE  (bottom third)
  ══════════════════════════════════════════ */
  function drawAurora(t) {
    var yBase = H * 0.70;
    var BANDS = 7;
    for (var band = 0; band < BANDS; band++) {
      var bf    = band / (BANDS - 1);
      var yOff  = bf * H * 0.28;
      var amp   = (1 - bf) * H * 0.055 + 6;
      var freq  = 0.007 + bf * 0.004;
      var speed = 1.0 + bf * 0.7;
      var alpha = (1 - bf) * 0.30 + 0.03;

      /* colour cycle per band */
      var hue = 140 + bf * 200; /* green → blue → purple → gold */

      ctx.beginPath();
      ctx.moveTo(0, yBase + yOff);
      for (var x = 0; x <= W; x += 3) {
        var y = yBase + yOff
          + Math.sin(x * freq + t * speed)         * amp
          + Math.sin(x * freq * 1.8 + t * speed * 0.7 + 1) * amp * 0.45
          + Math.cos(x * freq * 0.5 + t * speed * 1.2 + 2) * amp * 0.3;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();

      var gA = ctx.createLinearGradient(0, 0, W, 0);
      gA.addColorStop(0,    'hsla(' + (hue)       + ',85%,60%,' + alpha + ')');
      gA.addColorStop(0.33, 'hsla(' + (hue + 50)  + ',90%,65%,' + alpha + ')');
      gA.addColorStop(0.66, 'hsla(' + (hue + 100) + ',85%,60%,' + alpha + ')');
      gA.addColorStop(1,    'hsla(' + (hue)       + ',85%,60%,' + alpha + ')');
      ctx.fillStyle = gA;
      ctx.fill();
    }
  }

  /* ══════════════════════════════════════════
     7. PARTICLE STREAM  (ring of mini-orbs)
  ══════════════════════════════════════════ */
  function drawParticles(t) {
    var COUNT = 12;
    for (var i = 0; i < COUNT; i++) {
      var fi  = i / COUNT;
      var ang = fi * Math.PI * 2 + t * 0.22;
      var rad = Math.min(W, H) * (0.26 + 0.04 * Math.sin(t * 0.5 + fi * 4));
      var px  = cx + Math.cos(ang) * rad + mx * 18;
      var py  = cy + Math.sin(ang) * rad * 0.55 + my * 14;
      var hue = 30 + fi * 220;
      var sz  = 3 + 2 * Math.sin(t * 2 + fi * 5);

      var gp = ctx.createRadialGradient(px, py, 0, px, py, sz * 4);
      gp.addColorStop(0, 'hsla(' + hue + ',90%,75%,0.80)');
      gp.addColorStop(0.4,'hsla(' + hue + ',90%,65%,0.35)');
      gp.addColorStop(1, 'hsla(' + hue + ',90%,65%,0)');
      ctx.beginPath();
      ctx.arc(px, py, sz * 4, 0, Math.PI * 2);
      ctx.fillStyle = gp;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, sz, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + hue + ',95%,88%,0.9)';
      ctx.fill();
    }
  }

  /* ══════════════════════════════════════════
     MAIN LOOP
  ══════════════════════════════════════════ */
  var start = null;
  function loop(ts) {
    if (!start) start = ts;
    var t = (ts - start) / 1000;

    /* clear */
    ctx.clearRect(0, 0, W, H);

    /* vignette bg */
    var vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.72);
    vg.addColorStop(0, 'rgba(8,20,8,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    /* layers */
    drawNebulas(t);
    drawAurora(t);
    drawStars(t);
    drawRings(t);
    drawParticles(t);
    drawHelix(t);
    drawOrbs(t);

    requestAnimationFrame(loop);
  }

  /* ── start ───────────────────────────────────── */
  resize();
  initStars();
  requestAnimationFrame(loop);

}());
