/**
 * Marame collection grid: layout, shuffle, load-more reinit.
 * Products are visible in HTML — this script only reorders layout and inits cards.
 */
(function marameCollectionGrid() {
  const LAYOUT_CHUNK = 8;
  let lastLayoutBp = window.innerWidth <= 1023 ? "mobile" : "desktop";

  function getList() {
    return document.querySelector(".listing__list[data-marame-shuffle='true']");
  }

  function getGridItems() {
    const list = getList();
    if (!list) return [];
    return [
      ...list.querySelectorAll(
        ":scope > li.listing__item:not(.marame-grid-editor-placeholder)"
      ),
    ];
  }

  function clearLegacyListingLimits() {
    const list = getList();
    if (!list) return;
    list.querySelectorAll(":scope > li.listing__item.hide").forEach((el) => {
      el.classList.remove("hide");
    });
  }

  function applyMagazineLayoutToItem(item, index) {
    const isMobile = window.innerWidth <= 1023;
    const cycleSize = isMobile ? 32 : 21;
    const desktopMap = {
      "has-metafield": [4, 8, 16],
      "has-metafield-3": [15],
    };
    const mobileMap = {
      "has-metafield--m": [3, 11, 19, 27],
      "has-metafield-3--m": [8, 16, 24, 32],
    };
    const activeMap = isMobile ? mobileMap : desktopMap;

    let cyclePosition = (index + 1) % cycleSize;
    if (cyclePosition === 0) cyclePosition = cycleSize;

    item.classList.remove(
      "has-metafield",
      "has-metafield-3",
      "has-metafield--m",
      "has-metafield-3--m"
    );

    Object.entries(activeMap).forEach(([className, positions]) => {
      if (positions.includes(cyclePosition)) {
        item.classList.add(className);
      }
    });
  }

  function applyMagazineLayoutRange(items, startIndex, onDone) {
    if (!items.length) {
      onDone?.();
      return;
    }

    let index = 0;
    function step() {
      const end = Math.min(index + LAYOUT_CHUNK, items.length);
      for (; index < end; index += 1) {
        applyMagazineLayoutToItem(items[index], startIndex + index);
      }
      if (index < items.length) {
        requestAnimationFrame(step);
      } else {
        onDone?.();
      }
    }
    requestAnimationFrame(step);
  }

  function applyMagazineLayout(items, onDone) {
    applyMagazineLayoutRange(items || getGridItems(), 0, onDone);
  }

  function shuffleRandom(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function appendItemsInOrder(items) {
    const list = getList();
    if (!list) return;
    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.appendChild(item));
    list.appendChild(fragment);
  }

  function runShuffle() {
    const list = getList();
    const items = getGridItems();
    if (!list || items.length < 2) return;
    const shuffled = shuffleRandom(items);
    appendItemsInOrder(shuffled);
    applyMagazineLayout(shuffled);
    list.dataset.marameShuffleCount = String(
      Number(list.dataset.marameShuffleCount || 0) + 1
    );
    list.dispatchEvent(new CustomEvent("marame:grid-shuffled", { bubbles: true }));
  }

  function finishNativeCollection(scope, onComplete) {
    const list = getList();
    clearLegacyListingLimits();
    list?.classList.add("marame-collection-loaded");

    if (typeof window.__marameFinishNativeCollection === "function") {
      const result = window.__marameFinishNativeCollection(scope);
      if (result && typeof result.then === "function") {
        result.then(() => onComplete?.());
      } else {
        onComplete?.();
      }
      return;
    }

    document.dispatchEvent(new CustomEvent("marame:collection-ready"));
    onComplete?.();
  }

  function relayoutOnly(onComplete) {
    const list = getList();
    if (!list) {
      onComplete?.();
      return;
    }
    list.dataset.marameShuffleDone = "true";
    clearLegacyListingLimits();
    applyMagazineLayout(getGridItems(), () => onComplete?.());
  }

  function urlHasFacetFilters() {
    return typeof window.marameUrlHasActiveFilters === "function"
      ? window.marameUrlHasActiveFilters()
      : false;
  }

  function runInitialLayout() {
    const list = getList();
    if (!list) return;

    if (urlHasFacetFilters()) {
      list.dataset.marameShuffleDone = "true";
      clearLegacyListingLimits();
      finishNativeCollection();
      return;
    }

    const shuffleMode = list.dataset.marameShuffleMode || "";
    const isOrdered = shuffleMode === "ordered";
    const isRandom = shuffleMode === "random";
    let items = getGridItems();

    clearLegacyListingLimits();

    if (items.length < 1) {
      finishNativeCollection();
      return;
    }

    const applyLayout = () => {
      if (isRandom && items.length >= 2) {
        appendItemsInOrder(shuffleRandom(items));
        items = getGridItems();
      } else if (
        !isOrdered &&
        items.length >= 2 &&
        list.dataset.marameShuffleDone !== "true"
      ) {
        const seed =
          list.dataset.marameShuffleSeed ||
          `${location.pathname}${location.search}`;

        function hashStr(str) {
          let h = 2166136261;
          for (let ci = 0; ci < str.length; ci += 1) {
            h ^= str.charCodeAt(ci);
            h = Math.imul(h, 16777619);
          }
          return h >>> 0;
        }

        function sortKey(item) {
          const productId = item.dataset.productId || "";
          const variantId = item.dataset.colorVariantId || "";
          return hashStr(`${seed}:${productId}:${variantId}`);
        }

        items.sort((a, b) => sortKey(a) - sortKey(b));
        appendItemsInOrder(items);
        list.dataset.marameShuffleDone = "true";
        items = getGridItems();
      }

      applyMagazineLayout(items, () => {
        requestAnimationFrame(() => finishNativeCollection());
      });
    };

    requestAnimationFrame(applyLayout);
  }

  function reinitAfterLoadMore(newItems, onComplete) {
    clearLegacyListingLimits();
    const allItems = getGridItems();
    const startIndex = newItems?.length
      ? Math.max(0, allItems.length - newItems.length)
      : 0;
    const itemsToLayout = newItems?.length ? newItems : allItems;

    applyMagazineLayoutRange(itemsToLayout, startIndex, () => {
      finishNativeCollection(newItems, onComplete);
    });
  }

  function bindResizeLayout() {
    if (window.__marameCollectionGridResizeBound) return;
    window.__marameCollectionGridResizeBound = true;

    let resizeTimer;
    window.addEventListener("resize", () => {
      if (
        document.documentElement.classList.contains(
          "marame-price-slider-active"
        )
      ) {
        return;
      }

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const bp = window.innerWidth <= 1023 ? "mobile" : "desktop";
        if (bp === lastLayoutBp) return;
        lastLayoutBp = bp;
        if (!getList()) return;
        applyMagazineLayout(getGridItems());
      }, 200);
    });
  }

  function boot() {
    const list = getList();
    if (!list) return;

    document.documentElement.setAttribute("data-marame-collection", "true");
    [...list.classList].forEach((cls) => {
      if (cls.toLowerCase().endsWith("loading")) list.classList.remove(cls);
    });
    list.classList.add("marame-collection-loaded");

    function unlockPageScroll() {
      if (document.querySelector(".color_drawer-main.active")) return;
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
      if (document.documentElement.hasAttribute("data-lenis-prevent")) {
        document.documentElement.removeAttribute("data-lenis-prevent");
        document.body.removeAttribute("data-lenis-prevent");
      }
    }

    unlockPageScroll();
    if (!window.__marameCollectionGridScrollUnlockBound) {
      window.__marameCollectionGridScrollUnlockBound = true;
      window.addEventListener("load", unlockPageScroll);
      document.addEventListener("marame:collection-ready", unlockPageScroll);
    }

    window.MarameCollectionGrid = {
      getGridItems,
      applyMagazineLayout,
      shuffleRandom,
      runShuffle,
      reinitAfterLoadMore,
      relayoutOnly,
    };

    runInitialLayout();
    initControls();
    bindResizeLayout();

    function initControls() {
      const wrap = document.querySelector("[data-marame-grid-controls]");
      if (!wrap) return;

      if (wrap.dataset.marameControlsBound === "true") return;
      wrap.dataset.marameControlsBound = "true";

      const btn = wrap.querySelector("[data-marame-shuffle-btn]");
      const note = wrap.querySelector("[data-marame-shuffle-note]");

      btn?.addEventListener("click", () => {
        runShuffle();
        if (note) {
          note.hidden = false;
          const isRandomMode = wrap.dataset.activeSet === "random";
          note.textContent = isRandomMode
            ? "New random order in preview. Customers get a fresh shuffle on every page load automatically."
            : "Shuffled in preview. To keep this order: drag Grid card blocks in the left sidebar to match, then Save.";
        }
      });
    }
  }

  boot();

  window.__marameRunCollectionGrid = boot;
  document.addEventListener("marame:collection-nav", boot);

  if (window.Shopify?.designMode) {
    const reb = () => setTimeout(boot, 0);
    document.addEventListener("shopify:section:load", reb);
    document.addEventListener("shopify:section:unload", reb);
    document.addEventListener("shopify:section:reorder", reb);
    document.addEventListener("shopify:block:select", reb);
    document.addEventListener("shopify:block:deselect", reb);
  }
})();
