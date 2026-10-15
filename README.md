# 🥭 Alphonso — Mango Shop Landing Page

A production-grade, single-page landing site for a fictional mango merchant, built in **HTML, CSS, vanilla JS and Framer Motion** (the `motion` DOM build). No framework, no build step, no other pages.

---

## The Prompt

This entire deliverable was produced from a single request:

> ```
> create a landing page using html, css, js, framer motion for a mango shop.
> create only landing page no other pages needed.
> ```

---

## Generation Report

| | |
|---|---|
| **Model** | DeepSeek V4.1 Flash Free |
| **Provider ID** | `opencode` |
| **Model ID** | `deepseek-v4.1-flash-free` |
| **Date** | 15 October 2026 |
| **Prompts used** | 1 build prompt + 1 follow-up asking for this README |
| **Context consumed** | 126,808 tokens — **63%** of a ~200,000 token window |
| **Files produced by the build prompt** | 3 (`index.html`, `styles.css`, `main.js`) |
| **Files produced by the follow-up** | 1 (`README.md` — this file) |
| **Build outcome** | Shipped without user-requested revisions — every defect was caught and fixed by self-verification |

### About the token figure

`126,808 / 200,000 (63%)` is the conversation context counter **as reported by the harness at the moment this README was requested**. It is a context-window measurement, not a metered API billing total, and it includes the full transcript — tool results, screenshots returned from the browser, and every file body read back for verification — not just the generated source. The three source files themselves are only ~1,740 lines / 73 KB.

The build prompt alone consumed the large majority of that figure; the browser verification loop (roughly a dozen headless-Chrome render, probe and interaction passes) is what pushed usage up, since each pass returned image data into the transcript.

### Verification performed

The page was not written blind. It was rendered and driven in headless Chrome via the DevTools Protocol across **two viewports (1500 px and 430 px)** and **two origins (`http://` and `file://`)**. That process found and fixed five real defects, all of which are absent from the shipped files:

1. **Invisible hero copy.** A stagger helper was invoked before Motion's module had resolved. The call threw inside an `IntersectionObserver` callback — asynchronously, so nothing surfaced in the console — leaving every reveal target stuck at `opacity: 0`.
2. **Stat counters rendering at 10 px.** An unscoped `.stat span` rule was also matching the `<b>` number.
3. **Chart note text splitting across the row.** An inline `<b>` inside a flex container becomes its own flex item.
4. **A CTA glow** that muddied the headline contrast.
5. **A footer descender** colliding with the bottom divider rule.

One wrong assumption is also worth recording. The first attempt believed Motion's DOM build omits `stagger` and hand-rolled the delay maths; a later probe proved `stagger` *is* exported. The hand-rolled version was kept anyway — it was already correct, and slightly more explicit than the library helper.

---

## Result

```
demo-project-no-github/
├── index.html    480 lines   25 KB   markup + inline SVG sprite
├── styles.css    981 lines   37 KB   design system + responsive layout
├── main.js       277 lines   11 KB   Motion animation layer
└── README.md     170 lines    9 KB   this file
```

**Source total:** ~1,740 lines / 73 KB across the three build files (1,908 lines / 82 KB including this README). Zero dependencies to install, zero build step, zero binary assets.

---

## Running It

Double-click `index.html`, or serve the folder:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Both paths are verified. The page is loaded as a **classic script that performs a dynamic `import()`** of Motion, rather than as `<script type="module">` — module scripts are blocked by CORS on `file://` URLs, so this choice is what lets the animations run when the file is opened directly from disk.

---

## Aesthetic Direction

A **sun-drenched editorial grocers** aesthetic — warm paper, ripe-mango ambers, deep forest greens, and high-contrast ink sections for rhythm.

| Token | Value | Role |
|---|---|---|
| `--paper` | `#FBF4E6` | Warm cream ground |
| `--mango` | `#F2A007` | Primary accent |
| `--mango-dp` | `#DF730E` | Emphasised / italic display |
| `--blush` | `#E9532B` | Sharp secondary accent |
| `--leaf` | `#3C6B37` | Organic counterweight |
| `--ink` | `#201810` | Warm near-black |

**Typography** — Fraunces (a variable serif, driven through its `SOFT` and `WONK` axes so the italic accents read as bouncy and slightly wonky) paired with Familjen Grotesk for UI and body. Both served from Google Fonts.

**Texture & depth** — a fixed `feTurbulence` grain overlay, dot-matrix texture, radial sun glows, and layered box-shadows. Atmosphere instead of flat fills.

---

## Sections

| # | Section | Notes |
|---|---|---|
| 1 | Marquee tape | CSS keyframe loop, `aria-hidden` |
| 2 | Sticky nav | Blurs and borders itself on scroll; full-screen menu under 1080 px |
| 3 | Hero | Mask-revealed headline, orbiting text badge, parallax sun, floating chips |
| 4 | Varieties | 6 cultivar cards, per-variety SVG tint, pointer-tracking glow, brix meters |
| 5 | Harvest calendar | Ink section, grid-positioned season bars |
| 6 | The 72-hour rule | 3-step ritual + mango cross-section panel |
| 7 | Stats band | Mango-gradient strip with count-up figures |
| 8 | Testimonials | Rotated "letter" cards |
| 9 | Newsletter CTA | Warm halo behind the headline, validated form |
| 10 | Footer | Outlined wordmark, sitemap columns, back-to-top |

---

## Motion Layer

All animation is Framer Motion via `motion@12.43.0`, imported at runtime from jsDelivr as `framer-motion/dom`.

| Effect | Implementation |
|---|---|
| Headline entrance | Per-word mask reveal (`overflow: hidden` + translate) |
| Section cascades | `inView()` per section, staggered per-element delays |
| Hero depth | `scroll()` linked to `animate()` — sun drifts and scales |
| Scroll progress | `scroll()` driving a `scaleX` rail |
| Count-up stats | `animate(0, target)` with `onUpdate` |
| Season chart | Staggered `scaleX` grow-in |
| Micro-interactions | Spring-scale on cart badge, squash on add buttons, shake on invalid input |

### Two deliberate safety nets

- **Content can never be trapped invisible.** Reveal targets are hidden by a `has-motion` class set before first paint. If Motion fails to load, that class is removed after 1.6 s and the page falls back to static, fully readable content.
- **Hover states survive the reveal.** On completion, each animated element has its `data-reveal` attribute and inline styles released back to CSS, so card lift, quote straightening and step hover transitions are never overridden by leftover inline transforms.

`prefers-reduced-motion` is respected throughout — animations are disabled and reduced-motion users get the complete static page.

---

## Functional Behaviour

- Mobile menu with `aria-expanded`, Escape-to-close, auto-close on link click and on resize past the breakpoint
- Add-to-cart: badge increments, button confirms for 1.5 s, toast announces the change via `role="status"`
- Newsletter: regex validation, inline success/error states, auto-resetting note
- Sticky nav state, scroll progress rail, smooth back-to-top
- Reduced-motion and fine-pointer detection

---

## Assets

**There are none.** Every visual is generated — six variety-tinted mangoes, a cross-section half, a sun emblem, arrows and stars are all hand-authored inline SVG in a `<symbol>` sprite tinted through CSS custom properties. The favicon is an inline SVG data URI.

This means the page has **no image requests, no broken-image states, and works fully offline** once fonts and the Motion module are cached.

---

## Accessibility

- Semantic landmarks, one `<h1>`, ordered heading levels
- Skip link, visible `:focus-visible` rings on every interactive element
- `aria-hidden` on all decorative SVG; `role="img"` + label on the hero mango
- Live regions for the toast and form feedback
- Full keyboard operability, no keyboard traps

---

## Notes & Caveats

- The shop copy is **placeholder** — varieties, prices, grower names and testimonial quotes are invented for the demo and should be replaced before any real use.
- Motion and Google Fonts load from CDNs, so first paint needs a network connection. Offline, the page degrades to a complete static layout with fallback fonts.
- Two CDN dependencies are pinned (`motion@12.43.0`) and two are not (Google Fonts CSS API); pin or self-host the latter for full reproducibility.
