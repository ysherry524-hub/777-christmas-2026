/* Snow on a 2D canvas: a heavy fall the moment the envelope opens, which then thins out and stops.
   Warm out-of-focus lights stay behind it, like a lit room seen through a window. */
window.Snowfall = function (canvas) {
  var ctx = canvas.getContext("2d");
  var flakes = [], lights = [], w = 0, h = 0, dpr = 1, raf = 0, last = 0, running = false;
  var spawning = true, stopTimer = 0;
  var level = 1, target = 1; // lights intensity (eased)

  function sprite(inner, mid, outer) {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, inner); g.addColorStop(.5, mid); g.addColorStop(1, outer);
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return c;
  }
  var flakeImg = sprite("rgba(255,252,248,1)", "rgba(255,250,244,.85)", "rgba(255,250,244,0)");
  var glowImg = sprite("rgba(232,196,140,1)", "rgba(214,170,110,.5)", "rgba(214,170,110,0)");

  function flake(y) {
    var bokeh = Math.random() < .08; // a few soft flakes close to the "lens"
    var r = bokeh ? 6 + Math.random() * 6 : 2.2 + Math.pow(Math.random(), 1.6) * 4.4;
    return {
      x: Math.random() * w, y: y, r: r,
      vy: bokeh ? 60 + Math.random() * 30 : 55 + r * 14 + Math.random() * 35,
      sway: 8 + Math.random() * 22,
      phase: Math.random() * 6.28,
      freq: .3 + Math.random() * .6,
      a: bokeh ? .2 + Math.random() * .14 : .7 + Math.random() * .3,
      bokeh: bokeh
    };
  }
  function light() {
    return {
      x: Math.random() * w, y: Math.random() * h,
      r: 28 + Math.random() * 60,
      vx: (Math.random() - .5) * 4, vy: -1 - Math.random() * 3,
      a: .07 + Math.random() * .09,
      phase: Math.random() * 6.28, freq: .15 + Math.random() * .2
    };
  }

  function flakeCount() { return Math.round(Math.max(110, Math.min(240, (w * h) / 5200))); }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    while (lights.length < (w < 640 ? 6 : 11)) lights.push(light());
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(.05, (t - (last || t)) / 1000);
    last = t;
    level += (target - level) * Math.min(1, dt * 1.6);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    for (var k = 0; k < lights.length; k++) {
      var L = lights[k];
      L.x += L.vx * dt; L.y += L.vy * dt; L.phase += L.freq * dt;
      if (L.y < -L.r * 2) { L.y = h + L.r; L.x = Math.random() * w; }
      ctx.globalAlpha = L.a * level * (.75 + .25 * Math.sin(L.phase));
      ctx.drawImage(glowImg, L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
    }

    for (var i = flakes.length - 1; i >= 0; i--) {
      var f = flakes[i];
      f.y += f.vy * dt;
      f.phase += f.freq * dt;
      if (f.y - f.r * 3 > h) {
        if (spawning) flakes[i] = flake(-f.r * 3);
        else flakes.splice(i, 1); // the fall thins out naturally once spawning stops
        continue;
      }
      var x = f.x + Math.sin(f.phase) * f.sway;
      var d = f.r * (f.bokeh ? 2.2 : 3);
      ctx.globalAlpha = f.a;
      if (f.bokeh) ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(flakeImg, x - d / 2, f.y - d / 2, d, d);
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // heavy snow, already filling the view, falling until `settleAfter` ms, then stopping
  function burst(settleAfter) {
    clearTimeout(stopTimer);
    if (!running) { running = true; resize(); last = 0; raf = requestAnimationFrame(frame); }
    spawning = true;
    var n = flakeCount();
    flakes = [];
    for (var i = 0; i < n; i++) flakes.push(flake(Math.random() * h * 1.1 - h * .1));
    stopTimer = setTimeout(function () { spawning = false; }, settleAfter);
  }
  function stop() {
    clearTimeout(stopTimer);
    running = false;
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    flakes = [];
    lights = [];
  }

  window.addEventListener("resize", function () { if (running) resize(); });
  document.addEventListener("visibilitychange", function () {
    if (!running) return;
    if (document.hidden) cancelAnimationFrame(raf);
    else { last = 0; raf = requestAnimationFrame(frame); }
  });

  return {
    burst: burst,
    stop: stop,
    running: function () { return running; },
    setLevel: function (v) { target = v; }
  };
};
