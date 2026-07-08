(function () {
  'use strict';

  function initMarameSignupPage(root) {
    if (!root || root.dataset.mspInit === 'true') return;
    root.dataset.mspInit = 'true';

    initPreAccessHeader();
    initScrollReveal(root);
    initTermsModal(root);
    initKlaviyoEmbed(root);
    initSignupForm(root);
  }

  var preAccessHeaderInit = false;
  var preAccessScrollBound = false;

  var LOGO_STYLE_CLASSES = ['header--msp-logo-white', 'header--msp-logo-black', 'header--msp-logo-hidden'];

  var sampleCanvas = null;
  var sampleCtx = null;
  var corsImageCache = Object.create(null);
  var preAccessSyncRef = null;
  var cachedAutoLogoStyle = null;
  var lastBrightnessSampleAt = 0;
  var lastAutoSampleScrollY = 0;
  var AUTO_SAMPLE_INTERVAL_MS = 180;
  var AUTO_SCROLL_DELTA_PX = 16;
  var LOGO_STYLE_STABLE_SAMPLES = 2;

  function isShopifyDesignMode() {
    return !!(window.Shopify && Shopify.designMode);
  }

  function isCollectionHeaderContext() {
    return (
      document.documentElement.hasAttribute('data-marame-collection') ||
      document.documentElement.getAttribute('data-template') === 'collection' ||
      document.body.classList.contains('template-collection')
    );
  }

  function isAdaptiveHeaderPage() {
    if (isCollectionHeaderContext()) return false;
    return (
      document.body.classList.contains('template-pre-access') ||
      document.body.classList.contains('template-index') ||
      !!document.querySelector('[data-msp-header-config]')
    );
  }

  function isPreAccessPage() {
    return isAdaptiveHeaderPage();
  }

  function isMobileViewport() {
    return window.matchMedia('(max-width: 989px)').matches;
  }

  function getZoneLogoStyle(zone, isMobile) {
    if (!zone) return 'auto';
    if (isMobile) {
      return zone.styleMobile || zone.style || 'auto';
    }
    return zone.styleDesktop || zone.style || 'auto';
  }

  function buildStyleByKey(zones, isMobile) {
    var styleByKey = {};
    zones.forEach(function (zone) {
      if (!zone || !zone.zoneKey) return;
      styleByKey[zone.zoneKey] = getZoneLogoStyle(zone, isMobile);
    });
    return styleByKey;
  }

  function imageSourceKey(img) {
    return img.currentSrc || img.src || '';
  }

  function getSampleSourceImage(img) {
    var key = imageSourceKey(img);
    if (key && corsImageCache[key]) return corsImageCache[key];
    return img;
  }

  function resetSampleCanvas() {
    sampleCanvas = null;
    sampleCtx = null;
  }

  function getSampleCanvas() {
    if (!sampleCanvas) {
      sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 1;
      sampleCanvas.height = 1;
      sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    }
    return sampleCtx;
  }

  function parseCssRgb(color) {
    if (!color || color === 'transparent') return null;
    var match = color.match(/rgba?\(([^)]+)\)/i);
    if (!match) return null;
    var parts = match[1].split(',').map(function (p) {
      return parseFloat(p.trim());
    });
    if (parts.length < 3) return null;
    if (parts.length >= 4 && parts[3] < 0.08) return null;
    return { r: parts[0], g: parts[1], b: parts[2] };
  }

  function pixelBrightness(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  function isElementVisible(el) {
    if (!el) return false;
    var style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0.01;
  }

  function shouldSkipForLogoSampling(el) {
    if (!el) return false;
    if (el.tagName === 'IMG' && el.getAttribute('data-msp-video-poster')) return false;
    if (el.tagName === 'VIDEO') return true;
    return !!el.closest('.msp-hero__video-wrap, .mhp-hero__video-wrap');
  }

  function getVideoPosterSampleImage(video) {
    if (!video) return null;
    var posterUrl = video.getAttribute('poster');
    if (!posterUrl) return null;

    if (corsImageCache[posterUrl]) return corsImageCache[posterUrl];

    var proxy = new Image();
    proxy.crossOrigin = 'anonymous';
    proxy.src = posterUrl;
    corsImageCache[posterUrl] = proxy;
    return proxy;
  }

  function getVisibleHeroBaseImage(heroRoot) {
    if (!heroRoot) return null;
    var useMobile = window.matchMedia('(max-width: 989px)').matches;

    var activeSlide = heroRoot.querySelector('.mhp-hero__slide.is-active');
    if (activeSlide) {
      var slideWrap = activeSlide.querySelector(
        useMobile ? '.mhp-hero__slide-media--mobile' : '.mhp-hero__slide-media--desktop'
      );
      if (!isElementVisible(slideWrap)) {
        slideWrap = activeSlide.querySelector('.mhp-hero__slide-media--desktop, .mhp-hero__slide-media--mobile');
      }
      if (slideWrap) {
        var slideImg = slideWrap.querySelector('img');
        if (slideImg) return slideImg;
      }
    }

    var wrap = heroRoot.querySelector(useMobile ? '.msp-hero__image--mobile' : '.msp-hero__image--desktop');
    if (!isElementVisible(wrap)) {
      wrap = heroRoot.querySelector('.msp-hero__image--desktop, .msp-hero__image--mobile');
    }
    if (!wrap) return null;
    return wrap.querySelector('.msp-media__img, img');
  }

  function readPreAccessHeaderConfig() {
    var configEl = document.querySelector('[data-msp-header-config]');
    var zones = [];
    var enabled = true;
    var isMobile = isMobileViewport();

    if (configEl) {
      enabled = configEl.dataset.enabled !== 'false';

      var jsonEl = configEl.querySelector('[data-msp-header-zones-json]');
      if (jsonEl && jsonEl.textContent) {
        try {
          zones = JSON.parse(jsonEl.textContent);
        } catch (error) {
          zones = [];
        }
      }
    }

    function readNum(el, mobileKey, desktopKey, legacyKey, fallback) {
      if (!el) return fallback;
      var mobileVal = el.dataset[mobileKey];
      var desktopVal = el.dataset[desktopKey];
      var legacyVal = legacyKey ? el.dataset[legacyKey] : null;
      var raw = isMobile
        ? mobileVal || legacyVal || desktopVal
        : desktopVal || legacyVal || mobileVal;
      var parsed = parseFloat(raw);
      return isNaN(parsed) ? fallback : parsed;
    }

    var pixelDarkMax = Math.round(
      readNum(configEl, 'pixelDarkMaxMobile', 'pixelDarkMaxDesktop', 'pixelDarkMax', 165)
    );
    var darkRatioThreshold = readNum(
      configEl,
      'darkRatioThresholdMobile',
      'darkRatioThresholdDesktop',
      'darkRatioThreshold',
      0.5
    );
    var switchOffset = Math.round(
      readNum(configEl, 'switchOffsetMobile', 'switchOffsetDesktop', 'switchOffset', 0)
    );

    return {
      enabled: enabled,
      isMobile: isMobile,
      switchOffset: switchOffset,
      darkRatioThreshold: darkRatioThreshold,
      pixelDarkMax: pixelDarkMax,
      pixelLightMin: pixelDarkMax + 48,
      hysteresisPad: 18,
      styleByKey: buildStyleByKey(zones, isMobile),
      zones: zones,
    };
  }

  function buildZoneEntries(zoneNodes, config) {
    var entries = zoneNodes
      .map(function (node) {
        var key = node.getAttribute('data-msp-logo-zone');
        if (!key) return null;

        return {
          node: node,
          key: key,
          style: config.styleByKey[key] || 'auto',
        };
      })
      .filter(Boolean);

    // Avoid "sticky hidden" states when some sections are display:none (height 0):
    // if we keep those in the list, fallback selection can pick an invisible zone.
    var visibleEntries = entries.filter(function (entry) {
      var rect = entry.node.getBoundingClientRect();
      return rect && rect.height >= 1;
    });

    (visibleEntries.length ? visibleEntries : entries).sort(function (a, b) {
      return a.node.getBoundingClientRect().top - b.node.getBoundingClientRect().top;
    });

    return visibleEntries.length ? visibleEntries : entries;
  }

  function resolveBrightnessToLogoStyle(avgBrightness, darkRatio, config, currentStyle) {
    var darkCutoff = config.pixelDarkMax;
    var lightCutoff = config.pixelLightMin;
    var pad = config.hysteresisPad;

    if (avgBrightness >= lightCutoff) return 'black';
    if (avgBrightness < darkCutoff) return 'white';

    if (currentStyle === 'white') {
      if (avgBrightness >= lightCutoff - pad) return 'black';
      if (avgBrightness >= darkCutoff + pad && darkRatio < config.darkRatioThreshold) return 'black';
      return 'white';
    }

    if (currentStyle === 'black') {
      if (avgBrightness < darkCutoff + pad) return 'white';
      if (darkRatio >= config.darkRatioThreshold && avgBrightness < lightCutoff - pad) return 'white';
      return 'black';
    }

    if (darkRatio >= config.darkRatioThreshold) return 'white';
    var mid = (darkCutoff + lightCutoff) * 0.5;
    return avgBrightness < mid ? 'white' : 'black';
  }

  function isHeaderElement(el, header) {
    if (!el) return true;
    if (header && (el === header || header.contains(el))) return true;
    return !!el.closest('.shopify-section-group-header-group, .header, .section-header');
  }

  function withHeaderPassThrough(header, fn) {
    var headerGroup = document.querySelector('.shopify-section-group-header-group');
    var targets = [];
    if (headerGroup) targets.push(headerGroup);
    if (header) targets.push(header);

    var saved = targets.map(function (el) {
      return el.style.pointerEvents;
    });

    targets.forEach(function (el) {
      el.style.pointerEvents = 'none';
    });

    var result = fn();

    targets.forEach(function (el, index) {
      el.style.pointerEvents = saved[index] || '';
    });

    return result;
  }

  function luminanceFromElement(el, clientX, clientY) {
    if (!el || el.tagName === 'HTML' || el.tagName === 'BODY') return null;

    if (el.tagName === 'IMG') {
      return sampleCoverImage(el, clientX, clientY);
    }

    if (el.tagName === 'VIDEO') {
      return null;
    }

    var node = el;
    while (node && node !== document.body) {
      var rgb = parseCssRgb(window.getComputedStyle(node).backgroundColor);
      if (rgb) {
        return pixelBrightness(rgb.r, rgb.g, rgb.b);
      }
      node = node.parentElement;
    }

    return null;
  }

  function sampleCoverImage(img, clientX, clientY, rectOverride) {
    var source = getSampleSourceImage(img);
    if (!source || !source.complete || !source.naturalWidth) return null;

    var rect = rectOverride || img.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;

    var nw = source.naturalWidth;
    var nh = source.naturalHeight;
    var scale = Math.max(rect.width / nw, rect.height / nh);
    var sw = nw * scale;
    var sh = nh * scale;
    var offsetX = (rect.width - sw) * 0.5;
    var offsetY = (rect.height - sh) * 0.5;
    var px = (clientX - rect.left - offsetX) / scale;
    var py = (clientY - rect.top - offsetY) / scale;

    if (px < 0 || py < 0 || px >= nw || py >= nh) return null;

    var ctx = getSampleCanvas();
    if (!ctx) return null;

    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.drawImage(source, px, py, 1, 1, 0, 0, 1, 1);
      var data = ctx.getImageData(0, 0, 1, 1).data;
      if (data[3] < 8) return null;
      return pixelBrightness(data[0], data[1], data[2]);
    } catch (error) {
      resetSampleCanvas();
      return null;
    }
  }

  function luminanceAtPoint(clientX, clientY, header) {
    var stack = document.elementsFromPoint(clientX, clientY);
    var heroSection = null;
    var i;
    var brightness;

    for (i = 0; i < stack.length; i += 1) {
      if (isHeaderElement(stack[i], header)) continue;

      if (shouldSkipForLogoSampling(stack[i])) {
        if (!heroSection) {
          heroSection = stack[i].closest('.msp-section--hero, .mhp-section--hero, .mhp-hero__stage');
        }
        continue;
      }

      brightness = luminanceFromElement(stack[i], clientX, clientY);
      if (brightness !== null) return brightness;
    }

    if (heroSection) {
      var baseImg = getVisibleHeroBaseImage(heroSection);
      if (baseImg) {
        brightness = sampleCoverImage(baseImg, clientX, clientY);
        if (brightness !== null) return brightness;
      }
    }

    return null;
  }

  function detectLogoStyleFromSectionOnly(section, config) {
    if (!section) return null;
    var node = section;
    while (node && node !== document.body) {
      var rgb = parseCssRgb(window.getComputedStyle(node).backgroundColor);
      if (rgb) {
        var brightness = pixelBrightness(rgb.r, rgb.g, rgb.b);
        return brightness < config.pixelDarkMax ? 'white' : 'black';
      }
      node = node.parentElement;
    }
    return null;
  }

  function shouldRunAutoBrightnessSample(force) {
    if (force) return true;
    var now = Date.now();
    if (now - lastBrightnessSampleAt < AUTO_SAMPLE_INTERVAL_MS) return false;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    return Math.abs(scrollY - lastAutoSampleScrollY) >= AUTO_SCROLL_DELTA_PX;
  }

  function preloadCorsImages(done) {
    var imgs = document.querySelectorAll('.msp img, .msp-section img, .msp-hero img, .mhp img, .mhp-section img');
    var pending = 0;
    var finished = false;

    function complete() {
      if (finished) return;
      finished = true;
      if (done) done();
      if (preAccessSyncRef) {
        lastBrightnessSampleAt = 0;
        preAccessSyncRef(true);
      }
    }

    imgs.forEach(function (img) {
      var key = imageSourceKey(img);
      if (!key || corsImageCache[key]) return;

      if (!img.getAttribute('crossorigin')) {
        img.setAttribute('crossorigin', 'anonymous');
      }

      pending += 1;
      var proxy = new Image();
      proxy.crossOrigin = 'anonymous';
      proxy.onload = function () {
        corsImageCache[key] = proxy;
        pending -= 1;
        if (pending <= 0) complete();
      };
      proxy.onerror = function () {
        pending -= 1;
        if (pending <= 0) complete();
      };
      proxy.src = key;
    });

    if (pending === 0) complete();
  }

  function getZoneSampleImages(section) {
    if (!section) return [];

    var images = [];
    var heroImg = getVisibleHeroBaseImage(section);
    if (heroImg) images.push(heroImg);

    section
      .querySelectorAll(
        'img.msp-media__img, .msp-hero__image img, .mhp-hero__slide-media img, .mhp-categories__image img, img.msp-running-video__el, img[data-msp-video-poster]'
      )
      .forEach(function (img) {
        if (images.indexOf(img) >= 0) return;
        if (!isElementVisible(img)) return;
        if (img.closest('.msp-hero__video-wrap')) return;
        images.push(img);
      });

    section.querySelectorAll('video.msp-running-video__el, video.msp-media__video, video').forEach(
      function (video) {
        if (!isElementVisible(video)) return;
        if (video.closest('.msp-hero__video-wrap')) return;

        var posterImg = section.querySelector('[data-msp-video-poster]');
        if (posterImg && images.indexOf(posterImg) < 0) {
          images.push(posterImg);
          return;
        }

        var cachedPoster = getVideoPosterSampleImage(video);
        if (cachedPoster && images.indexOf(cachedPoster) < 0) {
          images.push(cachedPoster);
        }
      }
    );

    return images;
  }

  function detectLogoStyleFromZoneImages(logoRect, section, config, currentStyle) {
    var images = getZoneSampleImages(section);
    if (!images.length) return null;

    var sampleYs = [
      logoRect.top + logoRect.height * 0.25,
      logoRect.top + logoRect.height * 0.5,
      logoRect.top + logoRect.height * 0.75,
    ];
    var xFracs = [0.2, 0.35, 0.5, 0.65, 0.8];
    var darkCount = 0;
    var sampleCount = 0;
    var brightnessTotal = 0;

    var zoneVideo = section.querySelector('video.msp-running-video__el, video.msp-media__video, video');

    images.forEach(function (img) {
      var rectOverride = null;
      if (zoneVideo) {
        rectOverride = zoneVideo.getBoundingClientRect();
      } else {
        rectOverride = null;
      }

      var rect = rectOverride || img.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      if (logoRect.right < rect.left || logoRect.left > rect.right) return;
      if (rect.bottom < logoRect.top - 8 || rect.top > logoRect.bottom + 8) return;

      xFracs.forEach(function (fx) {
        var sampleX = logoRect.left + logoRect.width * fx;
        if (sampleX < rect.left - 2 || sampleX > rect.right + 2) return;

        sampleYs.forEach(function (sampleY) {
          if (sampleY < rect.top - 2 || sampleY > rect.bottom + 2) return;

          var brightness = sampleCoverImage(img, sampleX, sampleY, rectOverride);
          if (brightness === null) return;

          sampleCount += 1;
          brightnessTotal += brightness;
          if (brightness < config.pixelDarkMax) {
            darkCount += 1;
          }
        });
      });
    });

    if (!sampleCount) return null;

    var avgBrightness = brightnessTotal / sampleCount;
    var darkRatio = darkCount / sampleCount;
    return resolveBrightnessToLogoStyle(avgBrightness, darkRatio, config, currentStyle);
  }

  function detectLogoStyleFromBrightness(logoRect, header, config, force, fallbackSection, currentStyle) {
    if (!shouldRunAutoBrightnessSample(force)) {
      return cachedAutoLogoStyle || currentStyle || 'black';
    }

    lastBrightnessSampleAt = Date.now();
    lastAutoSampleScrollY = window.scrollY || window.pageYOffset || 0;

    if (fallbackSection) {
      var zoneResult = detectLogoStyleFromZoneImages(
        logoRect,
        fallbackSection,
        config,
        currentStyle || cachedAutoLogoStyle
      );
      if (zoneResult) {
        cachedAutoLogoStyle = zoneResult;
        return cachedAutoLogoStyle;
      }
    }

    var samplePoints = [
      { x: 0.2, y: 0.35 },
      { x: 0.35, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: 0.65, y: 0.5 },
      { x: 0.8, y: 0.65 },
    ];
    var darkCount = 0;
    var sampleCount = 0;
    var brightnessTotal = 0;

    withHeaderPassThrough(header, function () {
      var i;
      var point;
      var brightness;

      for (i = 0; i < samplePoints.length; i += 1) {
        point = samplePoints[i];
        var sampleX = logoRect.left + logoRect.width * point.x;
        var sampleY = logoRect.top + logoRect.height * point.y;
        brightness = luminanceAtPoint(sampleX, sampleY, header);

        if (brightness === null) continue;

        sampleCount += 1;
        brightnessTotal += brightness;
        if (brightness < config.pixelDarkMax) {
          darkCount += 1;
        }
      }

      if (!sampleCount) return;

      var avgBrightness = brightnessTotal / sampleCount;
      var darkRatio = darkCount / sampleCount;
      cachedAutoLogoStyle = resolveBrightnessToLogoStyle(
        avgBrightness,
        darkRatio,
        config,
        currentStyle || cachedAutoLogoStyle
      );
    });

    return cachedAutoLogoStyle || currentStyle || 'black';
  }

  function resolveLogoStyle(zoneStyle, logoRect, header, config, forceDetect, fallbackSection, currentStyle) {
    if (zoneStyle === 'hidden') return 'hidden';
    if (zoneStyle === 'white' || zoneStyle === 'black') return zoneStyle;
    return detectLogoStyleFromBrightness(
      logoRect,
      header,
      config,
      forceDetect,
      fallbackSection,
      currentStyle
    );
  }

  function clearChromeInlineStyles(header) {
    header
      .querySelectorAll(
        '.searchbar__btn, .header__right__bag__cart, .menu-btn, .account, .wishlist, .cart-count'
      )
      .forEach(function (el) {
        el.style.removeProperty('color');
        el.style.removeProperty('opacity');
        el.style.pointerEvents = '';
      });
    header.querySelectorAll('.searchbar__btn svg *, .header__right__bag__cart svg *, .account svg *, .wishlist svg *').forEach(
      function (node) {
        node.style.removeProperty('stroke');
        node.style.removeProperty('fill');
        node.style.removeProperty('color');
      }
    );
  }

  function applyLogoStyle(header, style) {
    /* Menu open: always black chrome on white bar (ignore zone/auto white). */
    if (document.body.classList.contains('marame-drawer-open')) {
      style = 'black';
    }

    var logo = header.querySelector('.header__logo');
    var fillColor = style === 'black' ? '#2a2a2d' : '#fff';

    [
      'header--msp-logo-white',
      'header--msp-logo-black',
      'header--msp-logo-hidden',
      'header--msp-chrome-white',
      'header--msp-chrome-black',
    ].forEach(function (cls) {
      header.classList.remove(cls);
    });
    document.body.classList.remove(
      'msp-header-style-white',
      'msp-header-style-black',
      'msp-header-style-hidden'
    );

    if (style === 'hidden') {
      header.classList.add('header--msp-logo-hidden', 'header--msp-chrome-hidden');
      document.body.classList.add('msp-header-style-hidden');
      if (logo) {
        logo.style.setProperty('opacity', '0', 'important');
        logo.style.pointerEvents = 'none';
      }
      return;
    }

    document.body.classList.remove('msp-header-style-hidden');

    if (style === 'black') {
      header.classList.add('header--msp-logo-black', 'header--msp-chrome-black');
      document.body.classList.add('msp-header-style-black');
    } else {
      header.classList.add('header--msp-logo-white', 'header--msp-chrome-white');
      document.body.classList.add('msp-header-style-white');
    }

    clearChromeInlineStyles(header);

    if (logo) {
      var fillTargets = logo.querySelectorAll('svg, svg path, svg g, svg use, svg *');
      fillTargets.forEach(function (node) {
        node.style.setProperty('stroke', 'none', 'important');
        node.style.setProperty('fill', fillColor, 'important');
      });
      logo.style.setProperty('opacity', '1', 'important');
      logo.style.pointerEvents = '';
      logo.style.setProperty('color', fillColor, 'important');
    }
  }

  function bindPreAccessHeaderScroll(syncLogoForScroll) {
    if (preAccessScrollBound) return;
    preAccessScrollBound = true;

    var scrollScheduled = false;

    function onScroll() {
      if (scrollScheduled) return;
      scrollScheduled = true;
      window.requestAnimationFrame(function () {
        scrollScheduled = false;
        syncLogoForScroll();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      syncLogoForScroll(true);
    });

    var mobileMq = window.matchMedia('(max-width: 989px)');
    function onViewportModeChange() {
      syncLogoForScroll(true);
    }
    if (mobileMq.addEventListener) {
      mobileMq.addEventListener('change', onViewportModeChange);
    } else if (mobileMq.addListener) {
      mobileMq.addListener(onViewportModeChange);
    }
  }

  function applyHeaderBarStyle(header) {
    header = header || document.querySelector('.header');
    if (!document.body.classList.contains('template-index')) return;

    var configEl = document.querySelector('[data-msp-header-config]');
    var style = configEl ? configEl.getAttribute('data-header-bar-style') : null;
    if (!style || ['transparent', 'white', 'black', 'blur'].indexOf(style) < 0) {
      style = document.body.getAttribute('data-msp-header-bar') || 'transparent';
    }

    document.documentElement.setAttribute('data-msp-header-bar', style);
    document.body.setAttribute('data-msp-header-bar', style);

    if (!header) return;

    ['transparent', 'white', 'black', 'blur'].forEach(function (name) {
      header.classList.remove('header--msp-bar-' + name);
    });
    header.classList.add('header--msp-bar-' + style);
  }

  function initPreAccessHeader() {
    if (preAccessHeaderInit) return;
    if (!isPreAccessPage()) return;
    if (isCollectionHeaderContext()) return;

    var header = document.querySelector('.header');
    if (!header) return;

    applyHeaderBarStyle(header);

    var zoneNodes = Array.prototype.slice.call(
      document.querySelectorAll('[data-msp-logo-zone]')
    );

    if (!zoneNodes.length) return;

    preAccessHeaderInit = true;
    header.classList.add('header--msp-adaptive');
    header.classList.remove('header--dark');
    preloadCorsImages();
    lastBrightnessSampleAt = 0;
    lastAutoSampleScrollY = window.scrollY || window.pageYOffset || 0;
    cachedAutoLogoStyle = null;

    var currentLogoStyle = null;
    var currentZoneKey = null;
    var lastViewportMobile = null;
    var pendingLogoStyle = null;
    var pendingLogoStyleCount = 0;

    function commitLogoStyle(style, immediate) {
      if (!style || style === currentLogoStyle) {
        pendingLogoStyle = null;
        pendingLogoStyleCount = 0;
        return;
      }

      if (!immediate) {
        if (style === pendingLogoStyle) {
          pendingLogoStyleCount += 1;
        } else {
          pendingLogoStyle = style;
          pendingLogoStyleCount = 1;
        }
        if (pendingLogoStyleCount < LOGO_STYLE_STABLE_SAMPLES) return;
      }

      pendingLogoStyle = null;
      pendingLogoStyleCount = 0;
      currentLogoStyle = style;
      // Never cache "hidden" as the auto fallback; otherwise returning to an "auto"
      // zone can keep the logo invisible even when the chrome is still shown.
      if (style !== 'hidden') {
        cachedAutoLogoStyle = style;
      }
      applyLogoStyle(header, style);
    }

    function syncLogoForScroll(forceSample) {
      if (isCollectionHeaderContext()) return;
      if (document.body.classList.contains('marame-drawer-open')) {
        applyLogoStyle(header, 'black');
        return;
      }

      var config = readPreAccessHeaderConfig();
      if (!config.enabled) return;

      if (lastViewportMobile !== null && lastViewportMobile !== config.isMobile) {
        currentLogoStyle = null;
        currentZoneKey = null;
        lastBrightnessSampleAt = 0;
        cachedAutoLogoStyle = null;
        pendingLogoStyle = null;
        pendingLogoStyleCount = 0;
      }
      lastViewportMobile = config.isMobile;

      var zoneEntries = buildZoneEntries(zoneNodes, config);

      header.classList.remove('header--dark');
      var headerRect = header.getBoundingClientRect();
      var probeY = headerRect.top + headerRect.height * 0.5 + config.switchOffset;
      var matched = null;

      zoneEntries.forEach(function (entry) {
        var rect = entry.node.getBoundingClientRect();
        if (rect.height < 1) return;
        if (rect.top <= probeY && rect.bottom > probeY) {
          matched = entry;
        }
      });

      if (!matched) {
        zoneEntries.forEach(function (entry) {
          var rect = entry.node.getBoundingClientRect();
          if (rect.height < 1) return;
          if (rect.top <= probeY) {
            matched = entry;
          }
        });
      }

      var zoneStyle = matched ? matched.style : zoneEntries[0].style;
      var zoneKey = matched ? matched.key : zoneEntries[0].key;
      var logoEl = header.querySelector('.header__logo');
      if (!logoEl) return;
      var logoRect = logoEl.getBoundingClientRect();
      var zoneChanged = zoneKey !== currentZoneKey;
      var forceDetect = !!forceSample || zoneChanged;
      var resolvedStyle = resolveLogoStyle(
        zoneStyle,
        logoRect,
        header,
        config,
        forceDetect,
        matched ? matched.node : null,
        currentLogoStyle
      );

      currentZoneKey = zoneKey;

      if (zoneStyle !== 'auto') {
        commitLogoStyle(resolvedStyle, true);
        return;
      }

      commitLogoStyle(resolvedStyle, zoneChanged || !!forceSample);
    }

    preAccessSyncRef = syncLogoForScroll;
    bindPreAccessHeaderScroll(syncLogoForScroll);
    syncLogoForScroll(true);

    window.addEventListener(
      'load',
      function onImagesReady() {
        preloadCorsImages();
      },
      { once: true }
    );
  }

  function bootPreAccessHeader(retries) {
    retries = retries || 0;
    applyHeaderBarStyle();
    initPreAccessHeader();

    if (!preAccessHeaderInit && retries < 40) {
      window.setTimeout(function () {
        bootPreAccessHeader(retries + 1);
      }, 100);
    }
  }

  window.__marameBootAdaptiveHeader = function () {
    preAccessHeaderInit = false;
    preAccessScrollBound = false;
    lastBrightnessSampleAt = 0;
    bootPreAccessHeader();
  };

  function initScrollReveal(root) {
    var targets = root.querySelectorAll('.msp-reveal');
    if (!targets.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    targets.forEach(function (el, index) {
      if (!el.style.getPropertyValue('--msp-reveal-delay')) {
        el.style.setProperty('--msp-reveal-delay', String(Math.min(index % 6, 5) * 70) + 'ms');
      }
      observer.observe(el);
    });
  }

  function setFormActive(container, active) {
    if (!container) return;
    container.classList.toggle('is-email-active', active);
  }

  function bindEmailActive(embedOrForm, input, submitButton) {
    if (!embedOrForm || !input) return;

    function syncActive() {
      var hasValue = input.value.trim().length > 0;
      setFormActive(embedOrForm, hasValue);
      if (submitButton) submitButton.disabled = !hasValue;
    }

    input.addEventListener('input', syncActive);
    input.addEventListener('change', syncActive);
    input.addEventListener('keyup', syncActive);
    syncActive();
  }

  function syncToKlaviyoInput(overlay, klaviyoInput) {
    if (!overlay || !klaviyoInput) return;
    klaviyoInput.value = overlay.value;
    klaviyoInput.dispatchEvent(new Event('input', { bubbles: true }));
    klaviyoInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function initKlaviyoEmbed(root) {
    var embed = root.querySelector('[data-msp-klaviyo-embed]');
    if (!embed) return;

    var formId = embed.dataset.klaviyoFormId;
    if (!formId) return;

    var overlay = embed.querySelector('[data-msp-email-overlay]');
    var customSubmit = embed.querySelector('[data-msp-klaviyo-submit]');
    var message = embed.querySelector('[data-msp-klaviyo-message]');
    var successMessage =
      embed.dataset.successMessage ||
      root.dataset.successMessage ||
      'Thank you for registering.';

    if (!overlay || !customSubmit) return;

    bindEmailActive(embed, overlay, customSubmit);

    var mount =
      embed.querySelector('[data-msp-klaviyo-mount]') ||
      embed.querySelector('.klaviyo-form-' + formId);
    var attempts = 0;
    var maxAttempts = 80;
    var klaviyoInput = null;
    var nativeSubmit = null;

    function wireKlaviyo() {
      if (!mount) return;
      klaviyoInput = mount.querySelector('input[type="email"]');
      nativeSubmit =
        mount.querySelector('[data-testid="submit-button"] button') ||
        mount.querySelector('[data-testid="submit-button"]') ||
        mount.querySelector('button[type="submit"]') ||
        mount.querySelector('form button[type="button"]') ||
        mount.querySelector('form button');
    }

    var poll = window.setInterval(function () {
      attempts += 1;
      wireKlaviyo();
      if (!klaviyoInput && attempts < maxAttempts) return;
      window.clearInterval(poll);
      embed.classList.add('is-ready');
    }, 250);

    overlay.addEventListener('input', function () {
      wireKlaviyo();
      if (klaviyoInput) syncToKlaviyoInput(overlay, klaviyoInput);
    });

    customSubmit.addEventListener('click', function (event) {
      event.preventDefault();
      var email = overlay.value.trim();

      if (!email || !isValidEmail(email)) {
        showMessage(message, 'Please enter a valid email address.', 'error');
        return;
      }

      wireKlaviyo();
      if (klaviyoInput) syncToKlaviyoInput(overlay, klaviyoInput);

      showMessage(message, '', '');
      customSubmit.disabled = true;

      function finishSuccess() {
        showMessage(message, successMessage, 'success');
        overlay.value = '';
        if (klaviyoInput) {
          klaviyoInput.value = '';
          klaviyoInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setFormActive(embed, false);
        customSubmit.disabled = false;
      }

      var klaviyoForm = mount.querySelector('form');

      if (nativeSubmit) {
        nativeSubmit.click();
      } else if (klaviyoForm && typeof klaviyoForm.requestSubmit === 'function') {
        klaviyoForm.requestSubmit();
      } else if (klaviyoForm) {
        klaviyoForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }

      window.setTimeout(finishSuccess, 800);
    });
  }

  function initSignupForm(root) {
    var form = root.querySelector('[data-msp-signup-form]');
    if (!form) return;

    var input = form.querySelector('[data-msp-email]');
    var submit = form.querySelector('[data-msp-submit]');
    var message = root.querySelector('[data-msp-message]');
    var companyId = root.dataset.klaviyoCompany || '';
    var listId = root.dataset.klaviyoList || '';

    if (!input || !submit) return;

    bindEmailActive(form, input, submit);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = input.value.trim();
      if (!email || !isValidEmail(email)) {
        showMessage(message, 'Please enter a valid email address.', 'error');
        return;
      }

      if (!companyId || !listId) {
        showMessage(message, 'Signup is not configured yet. Please try again later.', 'error');
        return;
      }

      submit.disabled = true;
      showMessage(message, '', '');

      fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + encodeURIComponent(companyId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          revision: '2024-07-15',
        },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              custom_source: 'Marame pre-access signup page',
              profile: {
                data: {
                  type: 'profile',
                  attributes: { email: email },
                },
              },
            },
            relationships: {
              list: {
                data: { type: 'list', id: listId },
              },
            },
          },
        }),
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Subscription failed');
          showMessage(
            message,
            root.dataset.successMessage || "You're registered. We'll be in touch soon.",
            'success'
          );
          input.value = '';
          setFormActive(form, false);
        })
        .catch(function () {
          showMessage(message, 'Something went wrong. Please try again.', 'error');
        })
        .finally(function () {
          submit.disabled = false;
        });
    });
  }

  function initTermsModal(root) {
    var modal = root.querySelector('[data-msp-terms-modal]');
    if (!modal) return;

    var openers = root.querySelectorAll('[data-msp-terms-open]');
    var closers = modal.querySelectorAll('[data-msp-terms-close]');

    function openModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    openers.forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        openModal();
      });
    });

    closers.forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', function (event) {
      if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove('msp-signup__message--error', 'msp-signup__message--success');
    if (type) el.classList.add('msp-signup__message--' + type);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function initSection(root) {
    if (!root || root.dataset.mspInit === 'true') return;
    if (root.hasAttribute('data-marame-signup-page')) {
      initMarameSignupPage(root);
      return;
    }
    root.dataset.mspInit = 'true';
    initScrollReveal(root);
  }

  document.querySelectorAll('[data-marame-signup-section]').forEach(initSection);

  document.addEventListener('marame:menu-open', function () {
    document.querySelectorAll('.header').forEach(function (header) {
      if (header.classList.contains('header--msp-adaptive')) {
        applyLogoStyle(header, 'black');
        requestAnimationFrame(function () {
          applyLogoStyle(header, 'black');
        });
        return;
      }
      var logo = header.querySelector('.header__logo');
      if (!logo) return;
      logo.querySelectorAll('svg, svg path, svg *').forEach(function (node) {
        node.style.setProperty('fill', '#2a2a2d', 'important');
        node.style.setProperty('color', '#2a2a2d', 'important');
        node.style.setProperty('stroke', 'none', 'important');
      });
      logo.style.setProperty('color', '#2a2a2d', 'important');
    });
  });

  document.addEventListener('marame:menu-close', function () {
    if (preAccessSyncRef) preAccessSyncRef(true);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bootPreAccessHeader();
    });
  } else {
    bootPreAccessHeader();
  }

  document.addEventListener('shopify:section:load', function (event) {
    if (event.target.querySelector('[data-msp-header-config]')) {
      preAccessHeaderInit = false;
      lastBrightnessSampleAt = 0;
      bootPreAccessHeader();
      return;
    }

    if (isPreAccessPage() && event.target.querySelector('video, [data-msp-video-poster]')) {
      preloadCorsImages();
      lastBrightnessSampleAt = 0;
      if (preAccessSyncRef) preAccessSyncRef(true);
    }

    var root =
      event.target.querySelector('[data-marame-signup-page]') ||
      event.target.querySelector('[data-marame-signup-section]');
    if (root) initSection(root);
  });
})();
