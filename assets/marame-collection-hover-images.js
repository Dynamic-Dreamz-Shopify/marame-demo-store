/**
 * Preload collection card hover (2nd) images before CSS swaps slides — avoids white flash.
 */
(function marameCollectionHoverImages() {
  const ROOT_SELECTOR =
    ".listing__list[data-marame-shuffle='true'] .product-card__img-new-slider:not(.swiper-initialized)";

  function getHoverImage(slider) {
    if (!slider) return null;
    if (typeof window.marameMarkHoverSlides === "function") {
      window.marameMarkHoverSlides(slider);
    }
    const hoverSlide = slider.querySelector(
      '.swiper-slide[data-marame-slide-role="hover"]'
    );
    return hoverSlide?.querySelector("img") || null;
  }

  const preloadPromises = new WeakMap();

  async function decodeHoverImage(imgEl) {
    if (!imgEl || imgEl.naturalWidth < 1) return;
    if (typeof imgEl.decode === "function") {
      try {
        await imgEl.decode();
      } catch (err) {
        /* decode failed — still show if loaded */
      }
    }
  }

  async function markReady(slider, imgEl) {
    if (!slider || slider.classList.contains("marame-hover-ready")) return;
    imgEl = imgEl || getHoverImage(slider);
    if (!imgEl || imgEl.naturalWidth < 1) return;
    await decodeHoverImage(imgEl);
    /* Cached only — visible swap waits for marame-hover-show on hover. */
    slider.classList.add("marame-hover-ready");
  }

  function preloadHoverImage(slider) {
    if (!slider || slider.classList.contains("marame-hover-ready")) {
      return Promise.resolve();
    }

    if (preloadPromises.has(slider)) {
      return preloadPromises.get(slider);
    }

    const job = (async () => {
      const imgEl = getHoverImage(slider);
      if (!imgEl) return;

      if (imgEl.loading === "lazy" && "loading" in imgEl) {
        imgEl.loading = "eager";
      }

      if (imgEl.complete && imgEl.naturalWidth > 0) {
        await markReady(slider, imgEl);
        return;
      }

      await new Promise((resolve) => {
        const loader = new Image();
        const done = () => resolve();
        loader.decoding = "async";
        loader.onload = done;
        loader.onerror = done;
        loader.src = imgEl.currentSrc || imgEl.src;
      });

      if (imgEl.complete && imgEl.naturalWidth > 0) {
        await markReady(slider, imgEl);
      }
    })().finally(() => {
      preloadPromises.delete(slider);
      slider.dataset.marameHoverPreloading = "";
    });

    slider.dataset.marameHoverPreloading = "true";
    preloadPromises.set(slider, job);
    return job;
  }

  function preloadVisibleSliders(limit) {
    const sliders = [...document.querySelectorAll(ROOT_SELECTOR)];
    const viewportSliders = sliders.filter((slider) => {
      const rect = slider.getBoundingClientRect();
      return rect.bottom > -120 && rect.top < window.innerHeight + 240;
    });

    const targets = (limit ? viewportSliders.slice(0, limit) : viewportSliders).slice(0, 16);
    targets.forEach((slider) => {
      preloadHoverImage(slider);
    });
  }

  function bindCards() {
    document.querySelectorAll(".listing__list[data-marame-shuffle='true'] .product-card").forEach((card) => {
      if (card.dataset.marameHoverBound === "true") return;
      card.dataset.marameHoverBound = "true";

      card.addEventListener(
        "mouseenter",
        () => {
          const slider = card.querySelector(
            ".product-card__img-new-slider:not(.swiper-initialized)"
          );
          if (typeof window.marameActivateCardHover === "function") {
            window.marameActivateCardHover(slider);
            return;
          }
          preloadHoverImage(slider);
        },
        { passive: true }
      );

      card.addEventListener(
        "focusin",
        () => {
          const slider = card.querySelector(".product-card__img-new-slider:not(.swiper-initialized)");
          preloadHoverImage(slider);
        },
        { passive: true }
      );
    });
  }

  function observeSliders() {
    if (!("IntersectionObserver" in window)) {
      preloadVisibleSliders();
      return;
    }

    const seen = new WeakSet();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          preloadHoverImage(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "280px 0px" }
    );

    document.querySelectorAll(ROOT_SELECTOR).forEach((slider) => observer.observe(slider));
  }

  function boot() {
    if (!document.querySelector(".listing__list[data-marame-shuffle='true']")) return;
    if (
      document.documentElement.classList.contains("marame-price-slider-active")
    ) {
      return;
    }
    preloadVisibleSliders(12);
    bindCards();
    observeSliders();

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => preloadVisibleSliders(), { timeout: 2000 });
    } else {
      setTimeout(() => preloadVisibleSliders(), 800);
    }
  }

  let hoverBootTimer;
  function scheduleBoot(immediate) {
    clearTimeout(hoverBootTimer);
    if (immediate) {
      boot();
      return;
    }
    hoverBootTimer = setTimeout(boot, 350);
  }

  window.marameBootCollectionHoverImages = scheduleBoot;

  document.addEventListener("marame:collection-ready", () => {
    scheduleBoot(false);
  });
  document.addEventListener("DOMContentLoaded", boot);

  if (window.Shopify?.designMode) {
    document.addEventListener("shopify:section:load", () => setTimeout(boot, 0));
  }

  window.maramePreloadCardHoverImage = preloadHoverImage;
})();
