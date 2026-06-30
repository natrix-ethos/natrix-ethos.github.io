/* Natrix Ethos — interactions
   Scroll reveals (staggered) + pipeline signal pulse. Reduced-motion aware. */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveals ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Stagger siblings that enter together for a choreographed feel.
        var siblings = Array.prototype.slice.call(
          el.parentElement ? el.parentElement.querySelectorAll(":scope > .reveal") : [el]
        );
        var idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 80, 480) + "ms";
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Pipeline signal pulse ---------- */
  var pulse = document.querySelector(".pipeline__pulse");
  var wire = document.querySelector(".pipeline__wire");
  var pipeEl = document.querySelector(".pipeline");

  if (pulse && wire && pipeEl && !reduce) {
    var nodesX = [150, 450, 750];
    var ripples = Array.prototype.slice.call(document.querySelectorAll(".pipeline__ripple"));
    var nodeEls = Array.prototype.slice.call(document.querySelectorAll(".pipeline__node"));
    var stepEls = Array.prototype.slice.call(document.querySelectorAll(".pipeline__steps li"));
    var x0 = 150, x1 = 750, dur = 2800;
    var running = false, start = null;
    var rippleAt = [-1e9, -1e9, -1e9];   // last time the pulse crossed each node
    var lastX = x0;

    function frame(ts) {
      if (start === null) start = ts;
      var t = ((ts - start) % dur) / dur;
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;  // ease-in-out
      var x = x0 + (x1 - x0) * e;
      pulse.setAttribute("cx", x.toFixed(1));

      nodesX.forEach(function (nx, i) {
        // crossing detection -> fire a ripple
        if ((lastX < nx && x >= nx) || (Math.abs(x - nx) < 4 && Math.abs(lastX - nx) >= 4)) {
          rippleAt[i] = ts;
        }
        // ripple expand + fade (700ms life)
        var age = ts - rippleAt[i];
        if (ripples[i]) {
          if (age >= 0 && age < 720) {
            var p = age / 720;
            ripples[i].setAttribute("r", (46 + p * 34).toFixed(1));
            ripples[i].style.opacity = (0.6 * (1 - p)).toFixed(3);
          } else {
            ripples[i].style.opacity = "0";
          }
        }
        // light node + step while the signal is at/under it
        var lit = Math.abs(x - nx) < 58;
        if (nodeEls[i]) nodeEls[i].classList.toggle("is-lit", lit);
        if (stepEls[i]) stepEls[i].classList.toggle("is-lit", lit);
      });

      pulse.style.opacity = nodesX.some(function (nx) { return Math.abs(x - nx) < 28; }) ? "1" : "0.55";
      lastX = x;
      if (running) requestAnimationFrame(frame);
    }

    if ("IntersectionObserver" in window) {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            pipeEl.classList.add("is-drawn");      // draw the wire once
            if (!running) { running = true; start = null; requestAnimationFrame(frame); }
          } else { running = false; }
        });
      }, { threshold: 0.2 });
      pio.observe(pipeEl);
    } else {
      pipeEl.classList.add("is-drawn");
      running = true; requestAnimationFrame(frame);
    }
  } else if (pipeEl) {
    pipeEl.classList.add("is-drawn");               // reduced motion: show finished state
  }

  /* ---------- Curriculum drawing path ---------- */
  var curriculum = document.querySelector(".curriculum");
  var fill = document.querySelector(".curriculum__fill");
  var rows = Array.prototype.slice.call(document.querySelectorAll(".curriculum__row"));

  if (curriculum && fill && rows.length) {
    if (reduce) {
      fill.style.transform = "scaleY(1)";
      rows.forEach(function (r) { r.classList.add("is-lit"); });
    } else {
      // Cache each row's offset within the list so the scroll loop reads layout once.
      var rowOffsets = [];
      var litState = [];
      function measure() {
        rowOffsets = rows.map(function (r) { return r.offsetTop + r.offsetHeight * 0.4; });
      }
      var ticking = false;
      function updatePath() {
        ticking = false;
        var r = curriculum.getBoundingClientRect();           // single layout read per frame
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var off = vh * 0.62 - r.top;                           // playhead position within the list
        var p = Math.max(0, Math.min(1, off / r.height));
        fill.style.transform = "scaleY(" + p.toFixed(4) + ")"; // GPU transform, no layout/paint
        for (var i = 0; i < rows.length; i++) {
          var lit = off >= rowOffsets[i];
          if (lit !== litState[i]) { rows[i].classList.toggle("is-lit", lit); litState[i] = lit; }
        }
      }
      function onScroll() {
        if (!ticking) { ticking = true; requestAnimationFrame(updatePath); }
      }
      measure();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", function () { measure(); onScroll(); }, { passive: true });
      updatePath();
    }
  }

  /* ---------- Story opener: Google search typewriter ---------- */
  var gsearch = document.querySelector(".gsearch");
  var gtyped = gsearch && gsearch.querySelector(".gsearch__typed");
  var gquery = "Whats the hardest job mentally?";

  if (gsearch && gtyped) {
    if (reduce || !("IntersectionObserver" in window)) {
      gtyped.textContent = gquery;
    } else {
      var gio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          gio.unobserve(gsearch);
          setTimeout(function type(i) {
            i = i || 0;
            gtyped.textContent = gquery.slice(0, i);
            if (i < gquery.length) {
              setTimeout(function () { type(i + 1); }, 45 + Math.random() * 70);
            }
          }, 450);
        });
      }, { threshold: 0.6 });
      gio.observe(gsearch);
    }
  }

  /* ---------- Trading calendar: deal the days in sequence ---------- */
  var calendar = document.querySelector(".calendar");
  var calDays = Array.prototype.slice.call(document.querySelectorAll(".calendar .cal-day"));

  if (calendar && calDays.length && !reduce && "IntersectionObserver" in window) {
    calendar.classList.add("calendar--anim");
    var dealt = false;
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !dealt) {
          dealt = true;
          calDays.forEach(function (d, i) {
            setTimeout(function () { d.classList.add("is-on"); }, 200 + i * 260);
          });
          cio.unobserve(calendar);
        }
      });
    }, { threshold: 0.35 });
    cio.observe(calendar);
  }

  /* ---------- System status window: draw the equity curve ---------- */
  var dash = document.querySelector(".dash");
  if (dash && !reduce && "IntersectionObserver" in window) {
    dash.classList.add("dash--anim");
    var dio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { dash.classList.add("is-drawn"); dio.unobserve(dash); }
      });
    }, { threshold: 0.4 });
    dio.observe(dash);
  }

  /* ---------- Hero dashboard: 3D tilt on hover (spring-smoothed) ---------- */
  var tiltWrap = document.querySelector(".hero__media");
  var tiltCard = tiltWrap && tiltWrap.querySelector(".dash");
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (tiltWrap && tiltCard && !reduce && finePointer) {
    var MAX = 7;                                  // max tilt in degrees
    var rx = 0, ry = 0, sc = 1;                   // current
    var txr = 0, tyr = 0, tsc = 1;                // targets
    var raf = null;

    function spring() {
      rx += (txr - rx) * 0.12;
      ry += (tyr - ry) * 0.12;
      sc += (tsc - sc) * 0.12;
      tiltCard.style.transform =
        "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";
      if (Math.abs(txr - rx) > 0.01 || Math.abs(tyr - ry) > 0.01 || Math.abs(tsc - sc) > 0.001) {
        raf = requestAnimationFrame(spring);
      } else { raf = null; }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(spring); }

    tiltWrap.addEventListener("pointermove", function (e) {
      var r = tiltWrap.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      var py = (e.clientY - r.top) / r.height - 0.5;
      tyr = px * MAX;            // rotateY follows horizontal
      txr = -py * MAX;           // rotateX follows vertical (inverted)
      tsc = 1.015;
      kick();
    });
    tiltWrap.addEventListener("pointerleave", function () {
      txr = 0; tyr = 0; tsc = 1; kick();
    });
  }

  /* ---------- Single-open FAQ (accordion behaviour) ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq__item"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });
})();
