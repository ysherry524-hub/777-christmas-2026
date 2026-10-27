(function () {
  var E = window.EVENT;
  // never let "777" wrap away from the word after it
  Object.keys(E).forEach(function (k) {
    if (typeof E[k] === "string" && k !== "invitationUrl") E[k] = E[k].replace(/777 /g, "777\u00a0");
  });
  E.body = E.body.map(function (t) { return t.replace(/777 /g, "777\u00a0"); });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var app = $("#app");
  var stage = $(".stage"), wrap = $(".env-wrap"), env = $(".env"), envShadow = $(".env-shadow");
  var cord = $(".cord"), seal = $(".seal"), flap = $(".flap"), letter = $(".letter");
  var back = $(".env__back"), pocket = $(".env__pocket");
  var wine = $(".backdrop--wine"), snowCanvas = $(".snow");
  var invitation = $(".invitation"), card = $(".card");
  var menuToggle = $(".menu-toggle"), menu = $("#menu");
  var params = new URLSearchParams(location.search);
  var capture = params.get("capture");
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var snow = window.Snowfall(snowCanvas);

  /* ---------- content from config ---------- */
  document.querySelectorAll("[data-text]").forEach(function (el) {
    el.textContent = E[el.dataset.text];
  });
  $(".stage__hint").textContent = matchMedia("(hover: none)").matches ? E.envelopeHintTouch : E.envelopeHint;

  var cut = E.title.lastIndexOf(" ");
  $(".card__title").innerHTML = '<span class="t1"></span><span class="t2 foil"></span>';
  $(".card__title .t1").textContent = E.title.slice(0, cut);
  $(".card__title .t2").textContent = E.title.slice(cut + 1);

  E.body.forEach(function (text) {
    var p = document.createElement("p");
    p.textContent = text;
    $(".card__body").appendChild(p);
  });

  var dateParts = E.displayDate.split(", ");
  $(".card__weekday").textContent = dateParts[0];
  $(".card__date").textContent = dateParts.slice(1).join(", ");
  $(".card__time").textContent = E.displayTime;

  document.querySelectorAll("[data-menu]").forEach(function (box) {
    var sections = E[box.dataset.menu];
    if (!sections || !sections.length) {
      var p = document.createElement("p");
      p.className = "menu__pending";
      p.textContent = E[box.dataset.pending];
      box.appendChild(p);
      return;
    }
    sections.forEach(function (sec) {
      var wrap = document.createElement("div");
      wrap.className = "menu__section";
      var h = document.createElement("h4");
      h.textContent = sec.title;
      var ul = document.createElement("ul");
      (sec.items || []).forEach(function (item) {
        var li = document.createElement("li");
        var n = document.createElement("span");
        n.className = "menu__item-name";
        n.textContent = item.name;
        li.appendChild(n);
        if (item.description) {
          var d = document.createElement("span");
          d.className = "menu__item-desc";
          d.textContent = item.description;
          li.appendChild(d);
        }
        ul.appendChild(li);
      });
      wrap.append(h, ul);
      box.appendChild(wrap);
    });
  });



  /* ---------- hanging ornaments ---------- */
  // x: % from left, len: thread length (px), kind: gold | wine | green | star, r: radius, a: first swing angle
  var HANGERS = {
    invitation: [
      { x: 3.5, len: 300, kind: "wine", r: 20, a: 4 },
      { x: 7.5, len: 150, kind: "gold", r: 15, a: -5 },
      { x: 92, len: 210, kind: "green", r: 17, a: -4 },
      { x: 96.5, len: 340, kind: "star", r: 14, a: 5 }
    ]
  };
  function ornament(o, i) {
    var r = o.r, w = r * 2 + 8, top = o.len + 4, cy = top + r * .34 + r - 1, h = cy + r + 4;
    var body = o.kind === "star"
      ? '<use href="#star" x="' + -r + '" y="' + (o.len + 1) + '" width="' + 2 * r + '" height="' + 2 * r + '" fill="url(#foil)"/>'
      : '<rect x="' + -r * .3 + '" y="' + top + '" width="' + r * .6 + '" height="' + r * .34 + '" rx="1" fill="url(#bCap)"/>'
        + '<circle cy="' + cy + '" r="' + r + '" fill="url(#b' + o.kind[0].toUpperCase() + o.kind.slice(1) + ')"/>'
        + '<ellipse cx="' + -r * .36 + '" cy="' + (cy - r * .42) + '" rx="' + r * .3 + '" ry="' + r * .17 + '" transform="rotate(-35 ' + -r * .36 + ' ' + (cy - r * .42) + ')" fill="url(#bShine)" opacity=".75"/>'
        + '<path d="M' + r * .55 + ' ' + (cy + r * .62) + 'A' + r + ' ' + r + ' 0 0 0 ' + r * .86 + ' ' + (cy + r * .1) + '" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.2"/>';
    return '<div class="hang"' + (o.wide ? " data-wide" : "") + ' style="left:' + o.x + '%;margin-left:' + -w / 2 + 'px;--a:' + o.a + 'deg;--d:' + (.5 + i * .18) + 's">'
      + '<svg width="' + w + '" height="' + h + '" viewBox="' + -w / 2 + ' 0 ' + w + ' ' + h + '">'
      + '<line x1="0" y1="0" x2="0" y2="' + (o.len + 2) + '" stroke="#B89561" stroke-width="1" stroke-opacity=".85"/>'
      + body + "</svg></div>";
  }
  document.querySelectorAll(".hangers").forEach(function (box) {
    box.innerHTML = HANGERS[box.dataset.set].map(ornament).join("");
  });

  /* ---------- evergreen sprig (procedural fir needles) ---------- */
  function rng(seed) {
    return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }
  var NEEDLE = ["#1f3129", "#283B32", "#2e4639", "#355243", "#3f5e4c"];
  // x0,y0 start, len, ang (radians, SVG y-down), k = scale
  function sprig(x0, y0, len, ang, seed, k) {
    var r = rng(seed), N = 34, bend = (r() - .5) * .5;
    var pts = [], x = x0, y = y0;
    for (var i = 0; i <= N; i++) {
      var a = ang + bend * (i / N);
      pts.push([x, y, a]);
      x += Math.cos(a) * len / N;
      y += Math.sin(a) * len / N;
    }
    var stem = "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("L");
    var under = "", over = "";
    for (var j = 2; j <= N; j++) {
      var p = pts[j], t = j / N;
      for (var side = -1; side <= 1; side += 2) {
        var na = p[2] + side * (.72 + r() * .3);
        var nl = (17 - 9 * t) * k * (.8 + r() * .35);
        var ex = p[0] + Math.cos(na) * nl, ey = p[1] + Math.sin(na) * nl;
        // needles curve slightly toward the tip
        var cx = p[0] + Math.cos(na - side * .25) * nl * .55, cy = p[1] + Math.sin(na - side * .25) * nl * .55;
        var d = "M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + "Q" + cx.toFixed(1) + " " + cy.toFixed(1) + " " + ex.toFixed(1) + " " + ey.toFixed(1);
        var col = NEEDLE[Math.floor(r() * NEEDLE.length)];
        under += '<path d="' + d + '" stroke="' + col + '" stroke-width="' + (2.3 * k).toFixed(2) + '"/>';
        if (r() < .55) over += '<path d="' + d + '" stroke="#86a592" stroke-opacity="' + (.18 + r() * .25).toFixed(2) + '" stroke-width="' + (.7 * k).toFixed(2) + '"/>';
      }
      if (j % 2 === 0) { // a few needles lying along the top of the twig, for fullness
        var fa = p[2] + (r() - .5) * .7, fl = (12 - 6 * t) * k;
        under += '<path d="M' + p[0].toFixed(1) + " " + p[1].toFixed(1) + "L" + (p[0] + Math.cos(fa) * fl).toFixed(1) + " " + (p[1] + Math.sin(fa) * fl).toFixed(1) + '" stroke="' + NEEDLE[2 + Math.floor(r() * 3)] + '" stroke-width="' + (2 * k).toFixed(2) + '"/>';
      }
    }
    return '<g fill="none" stroke-linecap="round">'
      + '<path d="' + stem + '" stroke="#4a3526" stroke-width="' + (2.4 * k).toFixed(2) + '"/>'
      + under + over + "</g>";
  }

  /* ---------- wax seal ---------- */
  // Irregular hand-poured outline: a circle with a few low harmonics and two overflow lobes.
  function sealOutline(R) {
    var pts = [], n = 90;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var r = R * (1
        + .022 * Math.sin(3 * a + 1.1)
        + .016 * Math.sin(5 * a + 2.3)
        + .009 * Math.sin(11 * a + .4)
        + .055 * Math.exp(-Math.pow((a - .7) / .32, 2))
        + .04 * Math.exp(-Math.pow((a - 3.5) / .4, 2))
        + .03 * Math.exp(-Math.pow((a - 5.2) / .25, 2)));
      pts.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    // closed Catmull-Rom → cubic Bézier
    var d = "M" + pts[0][0].toFixed(2) + " " + pts[0][1].toFixed(2);
    for (var j = 0; j < n; j++) {
      var p0 = pts[(j - 1 + n) % n], p1 = pts[j], p2 = pts[(j + 1) % n], p3 = pts[(j + 2) % n];
      d += "C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(2) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(2) + " "
        + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(2) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(2) + " "
        + p2[0].toFixed(2) + " " + p2[1].toFixed(2);
    }
    return d + "Z";
  }

  // The seal is drawn as a greyscale height map (lighter = higher) and lit by an SVG lighting filter,
  // so the bevels, the pressed rim and the raised 777 catch light like real wax.
  function sealSVG(id, shimmer) {
    var anim = shimmer
      ? '<animate attributeName="azimuth" values="235;160;235" keyTimes="0;.5;1" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1" dur="2.4s" begin="2s;' + id + 'sh.end+7s" id="' + id + 'sh"/>'
      : "";
    return '<svg viewBox="-100 -100 200 200">'
      + '<defs>'
      + '<radialGradient id="' + id + 'h" cx="0" cy="0" r="96" gradientUnits="userSpaceOnUse">'
      + '<stop offset=".58" stop-color="#bdbdbd"/><stop offset=".68" stop-color="#f7f7f7"/>'
      + '<stop offset=".8" stop-color="#e2e2e2"/><stop offset=".93" stop-color="#a6a6a6"/><stop offset="1" stop-color="#6a6a6a"/>'
      + '</radialGradient>'
      + '<path id="' + id + 'ring" d="M0 -46.5A46.5 46.5 0 1 1 -.01 -46.5"/>'
      + '<filter id="' + id + 'f" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">'
      + '<feGaussianBlur in="SourceGraphic" stdDeviation="1.3" result="soft"/>'
      + '<feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="8" result="ripple"/>'
      + '<feColorMatrix in="ripple" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .06 0 0 0 0" result="rippleA"/>'
      + '<feColorMatrix in="soft" type="luminanceToAlpha" result="hRaw"/>'
      + '<feComposite in="rippleA" in2="hRaw" operator="arithmetic" k2="1" k3="1" result="h"/>'
      + '<feDiffuseLighting in="h" surfaceScale="7" diffuseConstant="1.2" lighting-color="#fff" result="diff">'
      + '<feDistantLight azimuth="235" elevation="46"/></feDiffuseLighting>'
      + '<feSpecularLighting in="h" surfaceScale="7" specularConstant=".75" specularExponent="24" lighting-color="#ffe7d9" result="spec">'
      + '<feDistantLight azimuth="235" elevation="34">' + anim + '</feDistantLight></feSpecularLighting>'
      + '<feFlood flood-color="#5e1a28"/>'
      + '<feComposite in2="diff" operator="arithmetic" k1="1.12" result="body"/>'
      + '<feComposite in="spec" in2="SourceGraphic" operator="in" result="gloss"/>'
      + '<feComposite in="gloss" in2="body" operator="arithmetic" k2=".55" k3="1" result="lit"/>'
      + '<feComposite in="lit" in2="SourceGraphic" operator="in"/>'
      + '</filter>'
      + '<filter id="' + id + 'ss" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#14050a" flood-opacity=".55"/></filter>'
      + '</defs>'
      // evergreen tucked under the wax, fanning out asymmetrically
      + '<g filter="url(#' + id + 'ss)">'
      + sprig(-10, -6, 200, -2.62, 7, 1.35) + sprig(-6, -14, 150, -2.1, 19, 1.2) + sprig(12, 8, 150, .42, 31, 1.25) + sprig(-14, 10, 105, 2.75, 43, 1.05)
      + '</g>'
      + '<g filter="url(#' + id + 'f)">'
      + '<path d="' + sealOutline(86) + '" fill="url(#' + id + 'h)"/>'
      + '<circle r="57" fill="#8e8e8e"/>'
      + '<circle r="54" fill="none" stroke="#c9c9c9" stroke-width="2.4"/>'
      + '<circle r="39" fill="none" stroke="#b4b4b4" stroke-width="1.1"/>'
      + '<text font-family="Jost, sans-serif" font-weight="500" font-size="8.2" letter-spacing="3.1" fill="#c4c4c4">'
      + '<textPath href="#' + id + 'ring" startOffset="0">777 TOWER · LOS ANGELES · MMXXVI ·</textPath></text>'
      + '<text y="14" text-anchor="middle" font-family="Cormorant Garamond, serif" font-weight="600" font-size="43" letter-spacing="-1.5" fill="#e6e6e6">777</text>'
      + '</g></svg>';
  }
  seal.innerHTML = sealSVG("s1", !capture);

  /* ---------- email capture mode (used by tools/render-email.mjs) ---------- */
  if (capture) {
    document.documentElement.classList.add("capture");
    $(".stage__kicker").textContent = E.building;
    $(".stage__heading").innerHTML = E.title.slice(0, cut) + " <em>" + E.title.slice(cut + 1) + "</em>";
    $(".stage__hint").textContent = "Your Holiday Invitation Awaits";
    var cta = document.createElement("p");
    cta.className = "stage__cta";
    cta.textContent = "Click to Open";
    stage.appendChild(cta);
    var az = params.get("az");
    if (az) seal.querySelectorAll("feDistantLight")[1].setAttribute("azimuth", az);
    return;
  }

  /* ---------- state machine ----------
     idle → openingSeal → openingEnvelope → revealingLetter → snowfallTransition (letter unfolds) → invitationVisible
     Each step awaits the previous animation's `finished`; `run` invalidates a sequence on skip/replay. */
  var state = "idle", run = 0, started = [];
  function setState(s) { state = s; app.dataset.state = s; }
  function play(el, frames, opts) {
    var a = el.animate(frames, Object.assign({ fill: "forwards", easing: "cubic-bezier(.4,0,.2,1)" }, opts));
    started.push(a);
    return a;
  }
  function clearAnimations() {
    started.forEach(function (a) { a.cancel(); });
    started = [];
  }

  async function openEnvelope() {
    if (state !== "idle") return;
    var id = ++run;
    var alive = function () { return id === run; };
    env.setAttribute("aria-disabled", "true");

    // 0.00–0.20 seal pressed
    setState("openingSeal");
    [".stage__kicker", ".stage__heading", ".stage__hint", ".skip"].forEach(function (s) {
      play($(s), [{ opacity: 1 }, { opacity: 0 }], { duration: 450 });
    });
    await play(seal, [{ transform: "scale(1)" }, { transform: "scale(.955)" }], { duration: 200, easing: "ease-out" }).finished;
    if (!alive()) return;

    // 0.20–0.55 seal lifts away · 0.45–1.25 flap folds back on its crease
    setState("openingEnvelope");
    // lower the envelope a little so the letter has room to come up and out
    play(wrap, [{ transform: "translateY(0)" }, { transform: "translateY(" + Math.round(env.offsetHeight * .42) + "px)" }],
      { duration: 1300, easing: "cubic-bezier(.45,0,.25,1)" });
    play(seal, [
      { transform: "scale(.955)", opacity: 1 },
      { transform: "translate(6%, -38%) rotate(-16deg) scale(.8)", opacity: 0 }
    ], { duration: 350, easing: "cubic-bezier(.4,0,.6,1)" });
    play(cord, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(10px) scaleX(1.04)" }], { duration: 380 });
    await play(flap, [
      { transform: "perspective(1400px) rotateX(0deg)" },
      { transform: "perspective(1400px) rotateX(-90deg)" }
    ], { duration: 380, delay: 250, easing: "cubic-bezier(.45,0,.75,.4)" }).finished;
    if (!alive()) return;
    flap.classList.add("is-open"); // edge-on: swap to the lined inside face, drop behind the letter
    play(flap, [
      { transform: "perspective(1400px) rotateX(-90deg)" },
      { transform: "perspective(1400px) rotateX(-180deg)" }
    ], { duration: 420, easing: "cubic-bezier(.2,.6,.35,1)" });

    // 1.0–2.0 letter drawn up out of the pocket
    setState("revealingLetter");
    var H = env.offsetHeight;
    var out = -H * 0.97;
    await play(letter, [
      { transform: "translateY(0)" },
      { transform: "translateY(" + out + "px)" }
    ], { duration: 1000, delay: 150, easing: "cubic-bezier(.45,.05,.25,1)" }).finished;
    if (!alive()) return;

    // 2.0– the letter comes forward, the room turns to wine and the snow begins —
    // then the letter opens straight out into the full invitation. No second click, no pause.
    letter.style.zIndex = 6;
    setState("snowfallTransition");
    var r = letter.getBoundingClientRect();
    var dy = window.innerHeight / 2 - (r.top + r.height / 2);
    var fit = Math.min(1.08, (window.innerWidth - 32) / r.width);
    [back, pocket, envShadow, cord].forEach(function (el) {
      play(el, [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(22px)" }], { duration: 650 });
    });
    play(flap, [{ opacity: 1 }, { opacity: 0 }], { duration: 450 });
    play(wine, [{ opacity: 0 }, { opacity: 1 }], { duration: 800 });
    document.body.style.background = "#391923";
    snow.setLevel(1);
    snow.burst(3200); // heavy fall as the envelope opens; stops shortly after the card is up
    play(snowCanvas, [{ opacity: 0 }, { opacity: 1 }], { duration: 600 });
    await play(letter, [
      { transform: "translateY(" + out + "px)" },
      { transform: "translateY(" + (out + dy) + "px) scale(" + fit + ")" }
    ], { duration: 650 }).finished;
    if (!alive()) return;

    // the paper unfolds to the size of the invitation card underneath, then hands over to it
    stage.classList.add("is-leaving");
    card.style.opacity = 0;
    invitation.hidden = false;
    window.scrollTo(0, 0);
    var c = card.getBoundingClientRect();
    var th = Math.min(c.height, window.innerHeight - c.top);
    var bw = letter.offsetWidth, bh = letter.offsetHeight;
    var now = letter.getBoundingClientRect();
    var baseCx = now.left + now.width / 2, baseCy = now.top + now.height / 2 - (out + dy);
    play(letter.firstElementChild, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 });
    await play(letter, [
      { transform: "translateY(" + (out + dy) + "px) scale(" + fit + ")" },
      { transform: "translate(" + (c.left + c.width / 2 - baseCx) + "px," + (c.top + th / 2 - baseCy) + "px) scale(" + c.width / bw + "," + th / bh + ")" }
    ], { duration: 720, easing: "cubic-bezier(.5,0,.2,1)" }).finished;
    if (!alive()) return;
    // the card now sits exactly under the blank paper; fading the paper reveals the printing
    card.style.opacity = "";
    await play(letter, [{ opacity: 1 }, { opacity: 0 }], { duration: 550, easing: "ease-out" }).finished;
    if (!alive()) return;
    showInvitation();
  }

  function showInvitation() {
    clearAnimations();
    stage.classList.remove("is-leaving");
    invitation.hidden = false;
    card.style.opacity = "";
    document.body.style.background = "";
    setState("invitationVisible");
    if (!snow.running()) snow.burst(2200); // Skip gets the same short flurry
    snow.setLevel(menu.hidden ? 1 : .4);
    $("#inv-title").focus({ preventScroll: true });
  }

  function skip() {
    run++;
    showInvitation();
    window.scrollTo(0, 0);
  }

  function replay() {
    run++;
    clearAnimations();
    snow.stop();
    flap.classList.remove("is-open");
    letter.style.zIndex = "";
    closeMenu(true);
    invitation.hidden = true;
    env.removeAttribute("aria-disabled");
    setState("idle");
    window.scrollTo(0, 0);
    env.focus({ preventScroll: true });
  }

  /* ---------- menu ---------- */
  function openMenu() {
    menu.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    snow.setLevel(.4);
    $(".menu__card").animate([
      { opacity: 0, transform: "translateY(-16px) scaleY(.97)" },
      { opacity: 1, transform: "none" }
    ], { duration: 520, easing: "cubic-bezier(.22,.61,.36,1)" });
    menu.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "nearest" });
  }
  function closeMenu(instant) {
    menuToggle.setAttribute("aria-expanded", "false");
    if (state === "invitationVisible") snow.setLevel(1);
    if (instant || menu.hidden) { menu.hidden = true; return; }
    $(".menu__card").animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-10px)" }], { duration: 260 })
      .finished.then(function () { menu.hidden = true; });
  }

  // foil catches the light as the pointer moves across the card
  card.addEventListener("pointermove", function (e) {
    var r = card.getBoundingClientRect();
    card.style.setProperty("--foil-x", Math.round(-120 * (e.clientX - r.left) / r.width + 40) + "px");
  });

  env.addEventListener("click", function () {
    // skip/replay cancel running animations, which rejects their `finished` promise — expected
    openEnvelope().catch(function () {});
  });
  $(".skip").addEventListener("click", skip);
  menuToggle.addEventListener("click", function () {
    menu.hidden ? openMenu() : closeMenu();
  });
  $('[data-action="replay"]').addEventListener("click", replay);
  $('[data-action="print"]').addEventListener("click", function () { window.print(); });
})();
