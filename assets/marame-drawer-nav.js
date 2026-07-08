/**
 * Mobile menu → collection: fetch next page HTML and swap #MainContent.
 * Full reload kept the menu visible or flashed the old grid; this updates
 * the collection view as soon as the HTML response arrives.
 */
(function marameDrawerNav() {
  var MOBILE_MQ = "(max-width: 1231px)";
  var DRAWER_LINK =
    ".header__nav .header-drawer a[href], .header__nav .header__nav__item__dropdown a[href]";

  function isMobile() {
    return window.matchMedia(MOBILE_MQ).matches;
  }

  function findLink(target) {
    return target && target.closest && target.closest(DRAWER_LINK);
  }

  function resolveUrl(link) {
    var href = (link.getAttribute("href") || "").trim();
    if (!href || href === "#") return "";
    try {
      return new URL(href, window.location.href).href.split("#")[0];
    } catch (err) {
      return (link.href || "").split("#")[0];
    }
  }

  function isDestLink(link) {
    if (!link) return false;
    var href = link.getAttribute("href");
    if (!href || href === "#" || href.indexOf("javascript:") === 0) return false;
    if (link.classList.contains("header__nav__item__dropdown__back")) return false;
    if (
      link.classList.contains("header__nav__item__trigger") &&
      link.closest(".header__nav__item:not(.no_submenu_added)")
    ) {
      return false;
    }
    return true;
  }

  function isCollectionUrl(url) {
    if (!url) return false;
    try {
      return new URL(url).pathname.indexOf("/collections/") === 0;
    } catch (err) {
      return url.indexOf("/collections/") !== -1;
    }
  }

  function shouldSwapNav(link) {
    if (!isMobile() || !isDestLink(link)) return false;
    var url = resolveUrl(link);
    if (!url || url === window.location.href.split("#")[0]) return false;
    return isCollectionUrl(url);
  }

  function warmUrl(url) {
    if (!url) return;
    window.__marameWarmUrls = window.__marameWarmUrls || {};
    if (window.__marameWarmUrls[url]) return;
    window.__marameWarmUrls[url] = true;
    fetch(url, {
      credentials: "same-origin",
      headers: { Accept: "text/html" },
    }).catch(function () {});
  }

  function warmDrawerLinks() {
    document.querySelectorAll(DRAWER_LINK).forEach(function (link) {
      if (!isDestLink(link)) return;
      var url = resolveUrl(link);
      if (isCollectionUrl(url)) warmUrl(url);
    });
  }

  function closeDrawer() {
    document.documentElement.classList.remove("marame-menu-nav-pending");
    document.body.classList.remove("marame-drawer-open");
    document.documentElement.classList.remove("lenis-stopped");
    document.body.style.overflow = "";
    var headerEl = document.querySelector(".header");
    if (headerEl) headerEl.classList.remove("header--active");
    var navEl = document.querySelector(".header__nav");
    if (navEl) navEl.classList.remove("header__nav--active");
    document.querySelectorAll(".header__nav__item--active").forEach(function (item) {
      item.classList.remove("header__nav__item--active");
    });
    document.querySelectorAll(".header .menu-btn").forEach(function (btn) {
      var isPrimary = isMobile()
        ? btn.closest(".header__right")
        : btn.matches(".header__nav > .menu-btn");
      if (isPrimary) btn.classList.remove("menu-btn--active");
    });
  }

  function setLeaving(active) {
    document.documentElement.classList.toggle("marame-nav-leaving", active);
  }

  function storeCollectionHandle(url) {
    var parts = url.split("/collections/");
    if (parts.length < 2) return;
    var handle = parts[1].split(/[/?#]/)[0].split("-")[0];
    if (handle) {
      try {
        localStorage.setItem("collection", handle);
      } catch (err) {
        /* ignore */
      }
    }
  }

  function reinitCollectionScripts() {
    document.dispatchEvent(new CustomEvent("marame:collection-nav"));
    document.dispatchEvent(new CustomEvent("marame:collection-ready"));
  }

  function resetCollectionHeaderChrome() {
    var header = document.querySelector(".header");
    if (!header) return;

    [
      "header--msp-adaptive",
      "header--msp-logo-white",
      "header--msp-logo-black",
      "header--msp-logo-hidden",
      "header--msp-chrome-white",
      "header--msp-chrome-black",
      "header--msp-chrome-hidden",
      "header--msp-bar-transparent",
      "header--msp-bar-white",
      "header--msp-bar-black",
      "header--msp-bar-blur",
    ].forEach(function (cls) {
      header.classList.remove(cls);
    });

    header.classList.add("header--dark");

    header.style.removeProperty("background");
    header.style.removeProperty("background-color");
    header.style.removeProperty("backdrop-filter");
    header.style.removeProperty("-webkit-backdrop-filter");

    var logo = header.querySelector(".header__logo");
    if (logo) {
      logo.style.removeProperty("color");
      logo.style.removeProperty("opacity");
      logo.style.removeProperty("pointer-events");
      logo.querySelectorAll("svg, svg *").forEach(function (node) {
        node.style.removeProperty("fill");
        node.style.removeProperty("stroke");
        node.style.removeProperty("color");
      });
    }

    header
      .querySelectorAll(
        ".searchbar__btn, .header__right__bag__cart, .menu-btn span, .account, .wishlist, .cart-count"
      )
      .forEach(function (el) {
        el.style.removeProperty("color");
        el.style.removeProperty("opacity");
      });

    header.querySelectorAll(".searchbar__btn svg *, .header__right__bag__cart svg *").forEach(function (node) {
      node.style.removeProperty("stroke");
      node.style.removeProperty("fill");
      node.style.removeProperty("color");
    });

    document.body.classList.remove(
      "msp-header-style-white",
      "msp-header-style-black",
      "msp-header-style-hidden"
    );
  }

  function applyCollectionDocumentContext(url) {
    document.body.classList.remove("template-index", "template-pre-access");
    document.body.classList.add("template-collection");
    document.documentElement.setAttribute("data-template", "collection");
    document.documentElement.setAttribute("data-marame-collection", "true");
    if (url) storeCollectionHandle(url);
    resetCollectionHeaderChrome();
  }

  function swapMainFromDoc(doc, url, options) {
    options = options || {};
    var newMain = doc.getElementById("MainContent");
    var curMain = document.getElementById("MainContent");
    if (!newMain || !curMain) return false;

    curMain.replaceWith(document.importNode(newMain, true));

    if (doc.title) document.title = doc.title;

    if (options.push !== false) {
      history.pushState({ marameCollectionNav: true }, "", url);
    }

    applyCollectionDocumentContext(url);
    window.scrollTo(0, 0);
    reinitCollectionScripts();
    return true;
  }

  function fetchCollectionHtml(url) {
    return fetch(url, {
      credentials: "same-origin",
      headers: { Accept: "text/html" },
    }).then(function (res) {
      if (!res.ok) throw new Error("fetch failed");
      return res.text();
    });
  }

  function replaceMainFromUrl(url, options) {
    if (window.__marameNavInFlight) return window.__marameNavInFlight;

    var job = fetchCollectionHtml(url)
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        if (!swapMainFromDoc(doc, url, options)) {
          window.location.assign(url);
        }
      })
      .catch(function () {
        window.location.assign(url);
      })
      .finally(function () {
        setLeaving(false);
        window.__marameNavInFlight = null;
      });

    window.__marameNavInFlight = job;
    return job;
  }

  function navigateCollection(url) {
    setLeaving(true);
    closeDrawer();
    return replaceMainFromUrl(url, { push: true });
  }

  function onDrawerLinkClick(e) {
    var link = findLink(e.target);
    if (!isDestLink(link)) return;

    if (shouldSwapNav(link)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      navigateCollection(resolveUrl(link));
      return;
    }

    closeDrawer();
  }

  document.addEventListener("click", onDrawerLinkClick, true);
  document.addEventListener("marame:menu-open", warmDrawerLinks);

  window.addEventListener("popstate", function () {
    if (!isMobile() || !isCollectionUrl(window.location.href)) return;
    if (!document.getElementById("MainContent")) return;
    setLeaving(true);
    replaceMainFromUrl(window.location.href, { push: false });
  });
})();
