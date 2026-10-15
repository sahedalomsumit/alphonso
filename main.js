/* ═══════════════════════════════════════════════════════════════════════
   ALPHONSO — landing page behaviour
   Motion (the framer-motion DOM build) drives the reveals, parallax,
   counters and micro-interactions. Everything degrades to a static,
   fully readable page if the library never arrives.

   NOTE: the `motion@12/+esm` entry re-exports `framer-motion/dom`, which
   ships `animate`, `inView` and `scroll`. Staggering still works (a
   per-element delay is used where a group needs to cascade).

   Loaded as a classic script with a dynamic `import()` so the page also
   boots from a `file://` URL, where module scripts are blocked by CORS.
   ═══════════════════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

/* Motion namespace, filled in once the module resolves. */
const M = { animate: null, inView: null, scroll: null, ready: false };

/* Reveal an element and hand it straight back to CSS, so :hover transforms
   (cards, quotes, steps) keep working instead of being overridden by inline
   styles left behind by the animation. */
function release(el) {
  el.removeAttribute("data-reveal");
  el.style.removeProperty("opacity");
  el.style.removeProperty("transform");
  el.style.removeProperty("will-change");
}

/* ── housekeeping that never depends on the animation library ───────── */
document.getElementById("year").textContent = new Date().getFullYear();

const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 12);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ── toast ──────────────────────────────────────────────────────────── */
const toastEl = document.getElementById("toast");
let toastTimer;
function toast(html) {
  toastEl.innerHTML = html;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2600);
}

/* ── mobile menu ────────────────────────────────────────────────────── */
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");
let menuOpen = false;
let menuTimer;

function setMenu(open) {
  menuOpen = open;
  burger.setAttribute("aria-expanded", String(open));
  clearTimeout(menuTimer);

  if (open) {
    menu.hidden = false;
    void menu.offsetHeight;                 // force reflow so the transition runs
    menu.classList.add("is-open");
    if (M.ready) {
      menu.querySelectorAll("nav a").forEach((link, i) => {
        M.animate(link, { opacity: [0, 1], y: [16, 0] }, { duration: 0.5, delay: i * 0.05, ease: EASE });
      });
    }
  } else {
    menu.classList.remove("is-open");
    menuTimer = setTimeout(() => { if (!menuOpen) menu.hidden = true; }, 420);
  }
}

burger.addEventListener("click", () => setMenu(!menuOpen));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
window.addEventListener("resize", () => { if (window.innerWidth > 1080 && menuOpen) setMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) { setMenu(false); burger.focus(); }
});

/* ── cart ───────────────────────────────────────────────────────────── */
const cartN = document.getElementById("cartN");
const cart = document.getElementById("cart");
let cartCount = 0;

document.querySelectorAll("[data-add]").forEach((btn) => {
  const label = btn.textContent;
  btn.addEventListener("click", () => {
    cartCount += 1;
    cartN.textContent = cartCount;
    cart.setAttribute("aria-label", `Cart, ${cartCount} box${cartCount === 1 ? "" : "es"}`);

    if (M.ready) {
      M.animate(cartN, { scale: [1, 1.6, 1] }, { duration: 0.55, ease: EASE });
      M.animate(btn, { scale: [1, 0.9, 1] }, { duration: 0.35, ease: EASE });
    }

    btn.classList.add("is-done");
    btn.textContent = "Added ✓";
    clearTimeout(btn._t);
    btn._t = setTimeout(() => {
      btn.classList.remove("is-done");
      btn.textContent = label;
    }, 1500);

    toast(`<b>${btn.dataset.add}</b> added · ${cartCount} box${cartCount === 1 ? "" : "es"} in your cart`);
  });
});

/* ── newsletter ─────────────────────────────────────────────────────── */
const signup = document.getElementById("signup");
const email = document.getElementById("email");
const signupNote = document.getElementById("signupNote");
const noteDefault = signupNote.textContent;

signup.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = email.value.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
    signupNote.textContent = "That address looks off — mind checking it?";
    signupNote.className = "signup__note is-bad";
    if (M.ready) M.animate(signup, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.45 });
    email.focus();
    return;
  }

  signupNote.textContent = "You're on the list. Watch for the next windfall letter.";
  signupNote.className = "signup__note is-ok";
  email.value = "";
  email.blur();
  toast("<b>Subscribed</b> · first pick is yours");

  setTimeout(() => {
    signupNote.textContent = noteDefault;
    signupNote.className = "signup__note";
  }, 5000);
});

/* ── card pointer glow ──────────────────────────────────────────────── */
if (finePointer) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });
}

/* ── back to top ────────────────────────────────────────────────────── */
document.getElementById("totop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
});

/* ═══════════════════════════════════════════════════════════════════════
   Motion layer
   ═══════════════════════════════════════════════════════════════════════ */
(async function boot() {
  let mod;
  try {
    mod = await import("https://cdn.jsdelivr.net/npm/motion@12.43.0/+esm");
  } catch (err) {
    console.warn("[alphonso] motion unavailable — serving the static page.", err);
    return;
  }

  if (typeof mod.animate !== "function" || typeof mod.inView !== "function") {
    console.warn("[alphonso] unexpected motion build — serving the static page.");
    return;
  }

  M.animate = mod.animate;
  M.inView = mod.inView;
  M.scroll = mod.scroll;
  M.ready = true;
  window.__motionReady = true;

  if (reduced) {
    document.querySelectorAll("[data-reveal]").forEach(release);
    return;
  }

  /* — cascade reveals, grouped per section — */
  try {
    const groups = new Map();
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      const container = el.closest("section, footer") || document.body;
      const list = groups.get(container) || [];
      list.push(el);
      groups.set(container, list);
    });

    groups.forEach((els, container) => {
      let stop = () => {};
      stop = M.inView(
        container,
        () => {
          els.forEach((el, i) => {
            M.animate(
              el,
              { opacity: 1, y: 0 },
              { duration: 0.85, delay: i * 0.055, ease: EASE, onComplete: () => release(el) }
            );
          });
          stop();
        },
        { amount: 0.06, margin: "0px 0px -6% 0px" }
      );
    });
  } catch (err) {
    console.warn("[alphonso] reveal setup failed — showing content.", err);
    document.querySelectorAll("[data-reveal]").forEach(release);
  }

  /* — scroll progress rail — */
  try {
    M.scroll(M.animate(".progress i", { scaleX: [0, 1] }, { ease: "linear" }));
  } catch (err) { /* non-critical */ }

  /* — hero parallax: the sun lags behind the page — */
  try {
    M.scroll(
      M.animate(".sun:not(.sun--cta)", { y: [0, 96], scale: [1, 1.07] }, { ease: "linear" }),
      { target: ".hero", offset: ["start start", "end start"] }
    );
    M.scroll(
      M.animate(".hero__art", { y: [0, 34] }, { ease: "linear" }),
      { target: ".hero", offset: ["start start", "end start"] }
    );
  } catch (err) { /* non-critical */ }

  /* — stats count up — */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    let stop = () => {};
    stop = M.inView(
      el,
      () => {
        M.animate(0, target, {
          duration: 1.5,
          ease: EASE,
          onUpdate: (v) => { el.textContent = Math.round(v).toLocaleString("en-US"); },
        });
        stop();
      },
      { amount: 0.85 }
    );
  });

  /* — season chart bars grow in — */
  const bars = document.querySelectorAll(".chart .bar");
  if (bars.length) {
    bars.forEach((b) => { b.style.transformOrigin = "0 50%"; });
    let stop = () => {};
    stop = M.inView(
      ".chart",
      () => {
        bars.forEach((bar, i) => {
          M.animate(
            bar,
            { scaleX: [0, 1], opacity: [0, 1] },
            { duration: 0.8, delay: i * 0.07, ease: EASE }
          );
        });
        stop();
      },
      { amount: 0.2 }
    );
  }
})();
