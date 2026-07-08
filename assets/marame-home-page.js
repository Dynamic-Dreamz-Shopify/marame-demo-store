(function () {
  'use strict';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initHeroCarousel(root) {
    var carousel = root.querySelector('[data-mhp-hero-carousel]');
    if (!carousel) return;

    var track = carousel.querySelector('.mhp-hero__track');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-mhp-slide]'));
    if (!slides.length) return;

    var transition = carousel.getAttribute('data-transition') || 'push';
    var interval = parseInt(carousel.getAttribute('data-interval'), 10) || 5000;
    var index = 0;
    var timer = null;

    function setActive(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });

      if (transition === 'dissolve') return;

      track.style.transform = 'translate3d(' + -index * 100 + '%, 0, 0)';
    }

    function next() {
      setActive(index + 1);
    }

    function start() {
      stop();
      if (slides.length < 2 || prefersReducedMotion()) return;
      timer = window.setInterval(next, interval);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    setActive(0);
    start();

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
  }

  function initHeadlineAnimation(root) {
    var headline = root.querySelector('[data-mhp-headline]');
    if (!headline) return;

    function play() {
      headline.classList.remove('is-animated');
      void headline.offsetWidth;
      headline.classList.add('is-animated');
    }

    play();

    if (prefersReducedMotion()) {
      headline.querySelectorAll('.mhp-hero__headline-line').forEach(function (line) {
        line.style.opacity = '1';
      });
    }
  }

  function isShopifyDesignMode() {
    return !!(window.Shopify && Shopify.designMode);
  }

  function initPortugalHeadingAnimation(root) {
    var heading = root.querySelector('[data-mhp-portugal-heading]');
    if (!heading) return;

    var revealed = false;

    function reveal() {
      if (revealed) return;
      revealed = true;
      heading.classList.add('is-revealed');
    }

    function isInView() {
      var rect = heading.getBoundingClientRect();
      var viewH = window.innerHeight || document.documentElement.clientHeight || 0;
      return rect.top < viewH * 0.88 && rect.bottom > viewH * 0.05;
    }

    function check() {
      if (isInView()) reveal();
    }

    if (prefersReducedMotion()) {
      reveal();
      return;
    }

    check();

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) reveal();
          });
        },
        { threshold: 0, rootMargin: '0px 0px 0px 0px' }
      );
      observer.observe(heading);
    }

    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });

    var tickCount = 0;
    function tick() {
      check();
      tickCount += 1;
      if (!revealed && tickCount < 180) {
        window.requestAnimationFrame(tick);
      }
    }
    window.requestAnimationFrame(tick);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function findParallaxSection(root) {
    if (!root) return null;
    if (root.matches && root.matches('[data-mhp-parallax]')) return root;
    return root.querySelector('[data-mhp-parallax]');
  }

  function getActivePortugalVideo(player) {
    if (!player) return null;
    var videos = player.querySelectorAll('video');
    if (!videos.length) return null;
    if (videos.length === 1) return videos[0];

    var isDesktop = window.matchMedia('(min-width: 990px)').matches;
    var source = player.querySelector(
      isDesktop ? '.mhp-portugal__video-source--desktop' : '.mhp-portugal__video-source--mobile'
    );
    if (!source) {
      source = player.querySelector('.mhp-portugal__video-source--desktop, .mhp-portugal__video-source--mobile');
    }
    return source ? source.querySelector('video') : videos[0];
  }

  function initPortugalVideoPlayer(root) {
    var player = root.querySelector('[data-mhp-portugal-video-player]');
    if (!player || player.dataset.mhpVideoBound === 'true') return;

    var videos = Array.prototype.slice.call(player.querySelectorAll('video'));
    var controls = player.querySelector('[data-mhp-portugal-video-controls]');
    var hit = player.querySelector('[data-mhp-portugal-video-hit]');
    if (!videos.length || !controls) return;

    player.dataset.mhpVideoBound = 'true';

    var playPauseBtn = controls.querySelector('[data-mhp-portugal-video-action="play-pause"]');
    var muteBtn = controls.querySelector('[data-mhp-portugal-video-action="mute"]');
    var restartBtn = controls.querySelector('[data-mhp-portugal-video-action="restart"]');
    var activated = false;

    function activeVideo() {
      return getActivePortugalVideo(player);
    }

    function setControlsVisible(visible) {
      controls.setAttribute('aria-hidden', visible ? 'false' : 'true');
      player.classList.toggle('is-controls-visible', visible);
    }

    function forceMuted(videoEl) {
      if (!videoEl || activated) return;
      videoEl.muted = true;
      videoEl.setAttribute('muted', '');
      videoEl.volume = 0;
    }

    function forceMutedAll() {
      videos.forEach(forceMuted);
    }

    function syncInactiveVideos() {
      var current = activeVideo();
      videos.forEach(function (videoEl) {
        if (videoEl === current) {
          if (!activated) forceMuted(videoEl);
          var playPromise = videoEl.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
          return;
        }
        videoEl.pause();
        forceMuted(videoEl);
      });
      return current;
    }

    function syncPlayPauseUi() {
      var video = activeVideo();
      if (!playPauseBtn || !video) return;
      var paused = video.paused;
      playPauseBtn.setAttribute('data-state', paused ? 'paused' : 'playing');
      playPauseBtn.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
      var label = playPauseBtn.querySelector('.mhp-portugal__video-control-label');
      if (label) label.textContent = paused ? 'Play' : 'Pause';
    }

    function syncMuteUi() {
      var video = activeVideo();
      if (!muteBtn || !video) return;
      muteBtn.setAttribute('data-state', video.muted ? 'muted' : 'unmuted');
      muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
      var label = muteBtn.querySelector('.mhp-portugal__video-control-label');
      if (label) label.textContent = video.muted ? 'Unmute' : 'Mute';
    }

    function enableAudio() {
      var video = activeVideo();
      if (!video) return;
      video.muted = false;
      video.removeAttribute('muted');
      video.volume = 1;
      syncMuteUi();
    }

    function activate() {
      if (activated) return;
      activated = true;
      player.classList.add('is-activated');
      player.setAttribute('role', 'group');
      player.setAttribute('aria-label', 'Portugal video with playback controls');
      setControlsVisible(true);
      syncInactiveVideos();
      enableAudio();
      syncPlayPauseUi();
    }

    function togglePlay() {
      var video = activeVideo();
      if (!video) return;
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      } else {
        video.pause();
      }
      syncPlayPauseUi();
    }

    function onPlayerActivate(event) {
      if (event) {
        if (event.type === 'touchend') event.preventDefault();
        if (event.target && event.target.closest('[data-mhp-portugal-video-controls]')) return;
      }
      if (!activated) {
        activate();
        return;
      }
      togglePlay();
    }

    if (hit) {
      hit.addEventListener('click', onPlayerActivate);
      hit.addEventListener('touchend', onPlayerActivate, { passive: false });
    }

    videos.forEach(function (videoEl) {
      videoEl.addEventListener('click', onPlayerActivate);
    });

    player.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (event.target.closest('[data-mhp-portugal-video-controls]')) return;
      event.preventDefault();
      onPlayerActivate(event);
    });

    if (restartBtn) {
      restartBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        if (!activated) activate();
        var video = activeVideo();
        if (!video) return;
        video.currentTime = 0;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
        syncPlayPauseUi();
      });
    }

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        if (!activated) activate();
        togglePlay();
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        if (!activated) activate();
        var video = activeVideo();
        if (!video) return;
        video.muted = !video.muted;
        if (!video.muted) {
          video.volume = 1;
          video.removeAttribute('muted');
        } else {
          video.setAttribute('muted', '');
        }
        syncMuteUi();
      });
    }

    videos.forEach(function (videoEl) {
      videoEl.addEventListener('play', function () {
        if (!activated) forceMuted(videoEl);
        syncPlayPauseUi();
      });
      videoEl.addEventListener('pause', syncPlayPauseUi);
      videoEl.addEventListener('volumechange', function () {
        if (!activated && !videoEl.muted) forceMuted(videoEl);
        syncMuteUi();
      });
    });

    if (hit) {
      hit.setAttribute('type', 'button');
    }

    forceMutedAll();
    syncInactiveVideos();
    syncPlayPauseUi();
    syncMuteUi();
    setControlsVisible(false);

    window.addEventListener(
      'resize',
      function () {
        syncInactiveVideos();
        syncPlayPauseUi();
        syncMuteUi();
      },
      { passive: true }
    );
  }

  function initParallax(root) {
    var section = findParallaxSection(root);
    if (!section || prefersReducedMotion()) return;

    var gradientLayer = section.querySelector('[data-mhp-parallax-gradient]');
    var videoWrap = section.querySelector('[data-mhp-parallax-video]');

    if (!videoWrap && !gradientLayer) return;

    var videoStrength = parseFloat(section.getAttribute('data-parallax-video'));
    if (isNaN(videoStrength)) {
      videoStrength = parseFloat(section.getAttribute('data-parallax-strength')) || 140;
    }
    var gradientStrength = parseFloat(section.getAttribute('data-parallax-gradient')) || 20;

    var isDesktop = window.matchMedia('(min-width: 990px)').matches;
    var offsetX = 0;
    var baseOffsetY = 0;

    function readOffsets() {
      isDesktop = window.matchMedia('(min-width: 990px)').matches;
      var styles = getComputedStyle(section);
      offsetX = parseFloat(
        styles.getPropertyValue(
          isDesktop ? '--mhp-portugal-video-offset-x-desktop' : '--mhp-portugal-video-offset-x'
        )
      ) || 0;
      baseOffsetY = parseFloat(
        styles.getPropertyValue(
          isDesktop ? '--mhp-portugal-video-offset-y-desktop' : '--mhp-portugal-video-offset-y'
        )
      ) || 0;
    }

    readOffsets();

    var running = false;
    var rafId = null;

    function getScrollProgress() {
      var rect = section.getBoundingClientRect();
      var viewH = window.innerHeight || document.documentElement.clientHeight || 1;
      var sectionH = Math.max(rect.height, 1);
      var start = viewH * 0.92;
      var end = -sectionH * 0.15;
      return clamp(1 - (rect.top - end) / (start - end), 0, 1);
    }

    function update() {
      var progress = getScrollProgress();
      var videoLift = -progress * videoStrength;
      var gradientShift = (progress - 0.5) * gradientStrength;
      var scale = 1 + progress * 0.05;

      if (videoWrap) {
        videoWrap.style.setProperty('--mhp-parallax-y', videoLift + 'px');
        videoWrap.style.setProperty('--mhp-parallax-scale', String(scale));
        videoWrap.style.transform =
          'translate3d(' +
          offsetX +
          'px, calc(' +
          baseOffsetY +
          'px + var(--mhp-parallax-y, 0px)), 0) scale(var(--mhp-parallax-scale, 1))';
      }

      if (gradientLayer) {
        gradientLayer.style.transform =
          'translate3d(0, ' + gradientShift + 'px, 0) scale(1.08)';
      }
    }

    function tick() {
      if (!running) return;
      update();
      rafId = window.requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      tick();
    }

    function stop() {
      running = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              readOffsets();
              update();
              start();
            } else {
              stop();
            }
          });
        },
        { rootMargin: '40% 0px 40% 0px', threshold: 0 }
      );
      observer.observe(section);
    } else {
      start();
    }

    window.addEventListener(
      'resize',
      function () {
        readOffsets();
        update();
      },
      { passive: true }
    );
    window.addEventListener(
      'scroll',
      function () {
        if (running) update();
      },
      { passive: true }
    );
  }

  function initHomeSection(root) {
    if (!root || root.dataset.mhpInit === 'true') return;
    root.dataset.mhpInit = 'true';

    if (root.querySelector('[data-mhp-hero-carousel]')) {
      initHeroCarousel(root);
      initHeadlineAnimation(root);
    }

    var parallaxSection = findParallaxSection(root);
    if (parallaxSection) {
      initParallax(root);
      initPortugalHeadingAnimation(root);
    }

    if (root.querySelector('[data-mhp-portugal-video-player]')) {
      initPortugalVideoPlayer(root);
    }
  }

  function bootHomeSections() {
    document.querySelectorAll('[data-marame-home-section]').forEach(initHomeSection);
    document.querySelectorAll('[data-mhp-portugal-video-player]').forEach(function (player) {
      if (player.dataset.mhpVideoBound === 'true') return;
      var section = player.closest('[data-marame-home-section]');
      if (section) initPortugalVideoPlayer(section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootHomeSections);
  } else {
    bootHomeSections();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var root =
      event.target.matches && event.target.matches('[data-marame-home-section]')
        ? event.target
        : event.target.querySelector('[data-marame-home-section]');
    if (root) {
      root.dataset.mhpInit = 'false';
      initHomeSection(root);
    }

    event.target.querySelectorAll('[data-mhp-portugal-video-player]').forEach(function (player) {
      player.dataset.mhpVideoBound = '';
      var section = player.closest('[data-marame-home-section]');
      if (section) initPortugalVideoPlayer(section);
    });

    if (event.target.querySelector('[data-msp-header-config]')) {
      if (typeof window.__marameBootAdaptiveHeader === 'function') {
        window.__marameBootAdaptiveHeader();
      }
    }
  });
})();
