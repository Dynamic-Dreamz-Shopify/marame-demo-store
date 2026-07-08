
// import { inner as _, bp as f } from "./variables.js";

// const y = "header__nav--active",
//   u = "header__nav__item--active",
//   m = ".header__nav__item__dropdown__content > *:not(.header__nav__item__dropdown__bg)";

// const gsapNoop = {
//   set() {},
//   to() {},
//   fromTo() {},
//   killTweensOf() {},
// };

// let c = gsapNoop;
// let d = () => {};
// let r, s, n;

// function isMarameCollectionPage() {
//   return (
//     document.documentElement.dataset.template === "collection" ||
//     document.documentElement.hasAttribute("data-marame-collection")
//   );
// }

// function loadHeaderDependencies() {
//   if (isMarameCollectionPage()) {
//     return Promise.resolve();
//   }

//   return Promise.all([
//     import("./scroll.js"),
//     import("./parallax.js"),
//     import("./script.js"),
//     import("./functions.js"),
//   ])
//     .then(([, , scriptMod, fnMod]) => {
//       c = scriptMod.g;
//       d = fnMod.toggleScroll;
//       applySubmenuHiddenState();
//     })
//     .catch(err => {
//       console.error("[header] optional deps failed to load", err);
//     });
// }

// function applySubmenuHiddenState() {
//   if (isMarameCollectionPage() || !n?.length) return;
//   n.forEach(item => {
//     c.set(item.querySelectorAll(m), { opacity: 0 });
//   });
// }

// function prefetchDrawerNavLinks() {
//   if (!r || window.__marameMenuPrefetchDone) return;
//   window.__marameMenuPrefetchDone = true;
//   /* Collection URLs warmed on marame:menu-open in marame-drawer-nav.js */
// }

// function isMobileMenu() {
//   return _.w < f["x-large"];
// }

// let menuOffsetResizeBound = false;

// function syncMenuDrawerOffset() {
//   if (!r || !document.body.classList.contains("marame-drawer-open")) return;

//   const chromeSelectors = isMobileMenu()
//     ? [
//         ".header__logo",
//         ".header__nav > .searchbar",
//         ".header__right .menu-btn",
//         ".header__right__bag__cart",
//       ]
//     : [
//         ".header__logo",
//         ".header__nav > .searchbar",
//         ".header__nav > .menu-btn",
//         ".header__right__bag__cart",
//       ];

//   const headerTop = Math.round(r.getBoundingClientRect().top);
//   let bottomPx = headerTop;

//   chromeSelectors.forEach(sel => {
//     const el = r.querySelector(sel);
//     if (!el) return;
//     const rect = el.getBoundingClientRect();
//     if (rect.width < 1 || rect.height < 1) return;
//     bottomPx = Math.max(bottomPx, Math.round(rect.bottom));
//   });

//   const capped = Math.min(
//     bottomPx,
//     headerTop + (isMobileMenu() ? 96 : 120)
//   );
//   document.documentElement.style.setProperty(
//     "--marame-menu-top",
//     `${capped}px`
//   );
// }

// function bindMenuDrawerOffsetSync() {
//   if (menuOffsetResizeBound) return;
//   menuOffsetResizeBound = true;
//   window.addEventListener("resize", syncMenuDrawerOffset);
//   window.addEventListener("orientationchange", syncMenuDrawerOffset);
// }

// function unbindMenuDrawerOffsetSync() {
//   if (!menuOffsetResizeBound) return;
//   menuOffsetResizeBound = false;
//   window.removeEventListener("resize", syncMenuDrawerOffset);
//   window.removeEventListener("orientationchange", syncMenuDrawerOffset);
// }

// function setMenuOpen(open, options) {
//   options = options || {};
//   if (!r) return;

//   r.classList.toggle("header--active", open);
//   if (s) s.classList.toggle(y, open);
//   document.body.classList.toggle("marame-drawer-open", open);
//   document.documentElement.classList.toggle("lenis-stopped", open);

//   syncMenuButtons(open);

//   document.dispatchEvent(
//     new CustomEvent(open ? "marame:menu-open" : "marame:menu-close")
//   );

//   if (open) {
//     document.documentElement.classList.remove("marame-menu-nav-pending");
//     requestAnimationFrame(() => {
//       syncMenuDrawerOffset();
//       requestAnimationFrame(syncMenuDrawerOffset);
//     });
//     bindMenuDrawerOffsetSync();
//     prefetchDrawerNavLinks();
//   } else {
//     window.__marameMenuPrefetchDone = false;
//     document.documentElement.style.removeProperty("--marame-menu-top");
//     unbindMenuDrawerOffsetSync();
//   }

//   if (isMobileMenu()) {
//     document.body.style.overflow = open ? "hidden" : "";
//     if (!open) {
//       n?.forEach(item => item.classList.remove(u));
//     }
//     return;
//   }

//   if (open) {
//     d("disable");
//   } else {
//     d("enable");
//     n?.forEach(item => item.classList.remove(u));
//     const spacer = document.querySelector(".dynamic-height-div");
//     if (options.instant) {
//       E();
//       if (spacer) {
//         c.killTweensOf(spacer);
//         c.set(spacer, { height: 0, scaleY: 0 });
//       }
//     } else {
//       setTimeout(E, 500);
//       if (spacer) {
//         c.to(spacer, { height: 0, scaleY: 0, duration: 0.3, ease: "expo.out" });
//       }
//     }
//   }
// }

// function initHeaderCore(retries) {
//   retries = retries || 0;
//   if (window.__marameHeaderInitialized) return;

//   r = document.querySelector(".header");
//   s = document.querySelector(".header__nav");

//   if (!r) {
//     if (retries < 40) {
//       window.setTimeout(function () {
//         initHeaderCore(retries + 1);
//       }, 100);
//     }
//     return;
//   }

//   window.__marameHeaderInitialized = true;

//   n = s
//     ? s.querySelectorAll(".header__nav__item:not(.no_submenu_added)")
//     : [];

//   k();

//   window.addEventListener("scroll", () => {
//     window.scrollY > 10
//       ? r.classList.add("header--scrolled")
//       : r.classList.remove("header--scrolled");
//   });

//   window.addEventListener("resize", () => {
//     bindMenuButtonClicks();
//     if (document.body.classList.contains("marame-drawer-open")) {
//       syncMenuDrawerOffset();
//     }
//   });

//   bindMenuButtonClicks();
//   initHeaderNav();
// }

// function P(retries) {
//   if (window.__marameHeaderInitialized) return;
//   /* Bind burger + drawer first — never wait on GSAP/Lenis (homepage broke when we did). */
//   initHeaderCore(retries);
//   loadHeaderDependencies();
// }

// function initHeaderNav() {
//   B();
//   if (!s) return;
//   n = s.querySelectorAll(".header__nav__item:not(.no_submenu_added)");
//   T();
//   applySubmenuHiddenState();
// }

// function k() {
//   const bg = r.querySelector(".header__bg");
//   bg &&
//     bg.addEventListener("mouseenter", () => {
//       // intentionally empty
//     });
// }

// function closeSiblingSubmenus(activeItem) {
//   if (!n) return;
//   n.forEach(function (item) {
//     if (item === activeItem) return;
//     item.classList.remove(u);
//     if (!isMobileMenu() && !isMarameCollectionPage()) {
//       c.to(item.querySelectorAll(m), {
//         opacity: 0,
//         y: -3,
//         duration: 0.3,
//         stagger: 0.07,
//       });
//     }
//   });
// }

// function E() {
//   if (isMarameCollectionPage()) return;
//   n.forEach(e => {
//     c.to(e.querySelectorAll(m), {
//       opacity: 0,
//       y: -3,
//       duration: 0.3,
//       stagger: 0.07,
//     });
//   });
// }

// function getMenuButtons() {
//   if (isMobileMenu()) {
//     return document.querySelectorAll(".header__right .menu-btn");
//   }
//   return document.querySelectorAll(".header__nav > .menu-btn");
// }

// function syncMenuButtons(open) {
//   getMenuButtons().forEach(btn => {
//     btn.classList.add("menu-btn--init");
//     btn.classList.toggle("menu-btn--active", open);
//   });

//   document.querySelectorAll(".header .menu-btn").forEach(btn => {
//     const isPrimary = Array.from(getMenuButtons()).includes(btn);
//     if (!isPrimary) {
//       btn.classList.remove("menu-btn--active");
//     }
//   });
// }

// function menuButtonFromEvent(e) {
//   const btn = e.target.closest(".menu-btn");
//   if (!btn || !btn.closest(".header")) return null;
//   if (isMobileMenu()) {
//     if (!btn.closest(".header__right")) return null;
//   } else if (!btn.matches(".header__nav > .menu-btn")) {
//     return null;
//   }
//   return btn;
// }

// function bindMenuClickDelegation() {
//   if (window.__marameMenuClickDelegation) return;
//   window.__marameMenuClickDelegation = true;

//   function handleMenuActivate(e) {
//     if (e.type === "keydown") {
//       if (e.key !== "Enter" && e.key !== " ") return;
//     } else if (e.type !== "click") {
//       return;
//     }

//     if (!menuButtonFromEvent(e)) return;

//     if (!r) {
//       r = document.querySelector(".header");
//       s = document.querySelector(".header__nav");
//     }
//     if (!r) return;

//     e.preventDefault();
//     e.stopPropagation();
//     setMenuOpen(!r.classList.contains("header--active"));
//   }

//   document.addEventListener("click", handleMenuActivate, true);
//   document.addEventListener("keydown", handleMenuActivate, true);
// }

// function bindMenuButtonClicks() {
//   bindMenuClickDelegation();

//   document.querySelectorAll(".header .menu-btn").forEach(btn => {
//     if (!btn.hasAttribute("role")) btn.setAttribute("role", "button");
//     if (!btn.hasAttribute("tabindex")) btn.setAttribute("tabindex", "0");
//   });
// }

// function B() {
//   document
//     .querySelectorAll(".header__nav__item__dropdown__back")
//     .forEach(btn => {
//       btn.addEventListener("click", e => {
//         if (isMobileMenu()) {
//           e.preventDefault();
//           n?.forEach(v => v.classList.remove(u));
//           return;
//         }
//         isMobileMenu() && e.preventDefault();
//         E();
//         n.forEach(v => v.classList.remove(u));
//       });
//     });
// }

// function T() {
//   if (!s) return;
//   n = s.querySelectorAll(".header__nav__item:not(.no_submenu_added)");

//   n.forEach(e => {
//     const t = e.querySelector(".header__nav__item__trigger");
//     if (!t) return;

//     t.addEventListener("click", o => {
//       o.preventDefault();
//       if (!r.classList.contains("header--active")) {
//         setMenuOpen(true);
//       }
//       closeSiblingSubmenus(e);
//       e.classList.toggle(u);
//       requestAnimationFrame(syncMenuDrawerOffset);
//     });
//   });
// }

// export default P;

// if (!window.__marameHeaderAutoBoot) {
//   window.__marameHeaderAutoBoot = true;
//   if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", () => P());
//   } else {
//     P();
//   }
// }



import { g as c } from "./script.js";
import { toggleScroll as d } from "./functions.js";
import { inner as _, bp as f } from "./variables.js";
import "./scroll.js";
import "./parallax.js";
import "./_commonjsHelpers.js";

let r, s, n;
const y = "header__nav--active",
  u = "header__nav__item--active",
  m = ".header__nav__item__dropdown__content > *:not(.header__nav__item__dropdown__bg)";

function P() {
  r = document.querySelector(".header");
  s = document.querySelector(".header__nav");

  if (!r) return;

  k();

  window.addEventListener("scroll", () => {
    window.scrollY > 10
      ? r.classList.add("header--scrolled")
      : r.classList.remove("header--scrolled");
  });

  D();
  B();
  s && T();
  H();
}

function k() {
  const bg = r.querySelector(".header__bg");
  bg &&
    bg.addEventListener("mouseenter", () => {
      // intentionally empty
    });
}

function H() {
  n = s.querySelectorAll(".header__nav__item");

  n.forEach(t => {
    c.set(t.querySelectorAll(m), { opacity: 0 });
  });
}

function w(e) {
  if (!e.classList.contains("no_submenu_added")) {
    s.classList.add(y);
    q();
    r.classList.add("header--active");
    e.classList.add(u);
    x(e);
  } else {
    r.classList.remove("header--active");
    s.classList.remove("header__nav--active");
    document.documentElement.classList.remove("lenis-stopped");
  }
}

function x(e) {
  const t = e.querySelectorAll(m);
  const i = Array.from(t).sort(
    (a, b) =>
      parseInt(getComputedStyle(a).order) -
      parseInt(getComputedStyle(b).order)
  );

  c.fromTo(
    i,
    { opacity: 0, y: -5 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, delay: 0.3 }
  );
}

function p() {
  s.classList.remove(y);
  q();
  d("enable");
}

function q() {
  n.forEach(e => {
    r.classList.remove("header--active");
    e.classList.remove(u);
    c.to(e.querySelectorAll(m), {
      opacity: 0,
      y: -3,
      duration: 0.3,
      stagger: 0.07
    });
  });
}

function E() {
  n.forEach(e => {
    c.to(e.querySelectorAll(m), {
      opacity: 0,
      y: -3,
      duration: 0.3,
      stagger: 0.07
    });
  });
}

/* =========================
   MENU BUTTON FIX (CORE)
========================= */
function D() {
  const buttons = document.querySelectorAll(".menu-btn");

  buttons.forEach(btn => {
    btn.removeEventListener("click", S);
    btn.addEventListener("click", S);
  });
}

function S(e) {
  e.preventDefault();
 
  const btn = e.currentTarget;
  btn.classList.add("menu-btn--init");
  btn.classList.toggle("menu-btn--active");

  r.classList.toggle("header--active");

  if (r.classList.contains("header--active")) {
    d("disable");
    n.forEach(t => h(t));
  } else {
    d("enable");
    setTimeout(E, 500);
    n.forEach(t => h(t, true));
  }

  // sync all buttons state
  document.querySelectorAll(".menu-btn").forEach(b => {
    if (b !== btn) {
      b.classList.toggle("menu-btn--active", btn.classList.contains("menu-btn--active"));
    }
  });
}

function B() {
  document
    .querySelectorAll(".header__nav__item__dropdown__back")
    .forEach(btn => {
      btn.addEventListener("click", e => {
        _.w < f["xxx-large"] && e.preventDefault();
        E();
        n.forEach(v => v.classList.remove(u));
      });
    });
}

function T() {
  n = s.querySelectorAll(".header__nav__item:not(.no_submenu_added)");

  n.forEach(e => {
    c.set(e.querySelectorAll(m), { opacity: 0 });

    const t = e.querySelector(".header__nav__item__trigger");
    if (!t) return;

    let active = false;

    t.addEventListener("click", o => {
      _.w < f["xxx-large"] && o.preventDefault();
      active = true;

      setTimeout(() => {
        active && w(e);
      }, 100);

      d("disable");

      if (s.classList.contains(y) && e.classList.contains(u)) {
        p();
        active = false;
      }
    });
  });
}

function h(e, close = false) {
  let i = document.querySelector(".dynamic-height-div");

  if (!i) {
    i = document.createElement("div");
    i.className = "dynamic-height-div";
    document.querySelector("main")?.prepend(i);
  }

  const o = e.querySelector(".header__nav__item__dropdown");
  const l = document.querySelector(".header__nav__cta");

  const height =
    (o?.offsetHeight || 0) +
    (l?.offsetHeight || 0) +
    (r?.offsetHeight || 0);

  c.to(i, {
    height: close ? 0 : height,
    scaleY: close ? 0 : 1,
    duration: 0.8,
    ease: "expo.out"
  });
}

export default P;
