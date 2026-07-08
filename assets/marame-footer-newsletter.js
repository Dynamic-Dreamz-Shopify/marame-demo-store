(function () {
  'use strict';

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function findEmailInput(root) {
    if (!root) return null;
    return (
      root.querySelector('input[type="email"]') ||
      root.querySelector('input[autocomplete="email"]') ||
      root.querySelector('input[inputmode="email"]') ||
      root.querySelector('input[name*="email" i]') ||
      root.querySelector('input[placeholder*="email" i]')
    );
  }

  function findNativeSubmit(mount) {
    if (!mount) return null;
    return (
      mount.querySelector('[data-testid="submit-button"] button') ||
      mount.querySelector('[data-testid="submit-button"]') ||
      mount.querySelector('div[data-testid="form-row"]:last-child button[type="submit"]') ||
      mount.querySelector('div[data-testid="form-row"]:last-child button[type="button"]') ||
      mount.querySelector('form button[type="submit"]') ||
      mount.querySelector('form button[type="button"]')
    );
  }

  function setActive(section, formBar, active) {
    section.classList.toggle('is-email-active', active);
    formBar.classList.toggle('is-email-active', active);
  }

  function initFooterNewsletter(section) {
    if (!section || section.dataset.footerNewsletterBound === 'true') return;

    var formBar = section.querySelector('.footer-newsletter__form-bar');
    var customSubmit = section.querySelector('[data-fn-newsletter-submit]');
    if (!formBar || !customSubmit) return;

    var formId = formBar.dataset.klaviyoFormId;
    var mount = formBar.querySelector('.footer-newsletter__klaviyo-mount') || formBar.querySelector('.klaviyo-form-' + formId);
    if (!mount) return;

    section.dataset.footerNewsletterBound = 'true';

    var klaviyoInput = null;
    var nativeSubmit = null;

    function wireKlaviyo() {
      klaviyoInput = findEmailInput(mount) || findEmailInput(formBar);
      nativeSubmit = findNativeSubmit(mount);
    }

    function syncActive() {
      wireKlaviyo();
      var hasValue = !!(klaviyoInput && klaviyoInput.value && klaviyoInput.value.trim().length > 0);
      setActive(section, formBar, hasValue);
      customSubmit.disabled = !hasValue;
    }

    function onFieldChange(event) {
      if (!event.target || !event.target.matches('input, textarea')) return;
      syncActive();
    }

    formBar.addEventListener('input', onFieldChange, true);
    formBar.addEventListener('change', onFieldChange, true);
    formBar.addEventListener('keyup', onFieldChange, true);
    formBar.addEventListener('paste', onFieldChange, true);

    customSubmit.addEventListener('click', function (event) {
      event.preventDefault();
      wireKlaviyo();

      var email = klaviyoInput ? klaviyoInput.value.trim() : '';
      if (!email || !isValidEmail(email)) return;

      customSubmit.disabled = true;

      if (nativeSubmit) {
        nativeSubmit.click();
      } else {
        var klaviyoForm = mount.querySelector('form');
        if (klaviyoForm && typeof klaviyoForm.requestSubmit === 'function') {
          klaviyoForm.requestSubmit();
        } else if (klaviyoForm) {
          klaviyoForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }

      window.setTimeout(function () {
        syncActive();
      }, 600);
    });

    var observer = new MutationObserver(function (mutations) {
      if (mutations.some(function (m) { return m.type === 'childList'; })) {
        syncActive();
      }
    });
    observer.observe(mount, { childList: true, subtree: true });

    var attempts = 0;
    var poll = window.setInterval(function () {
      attempts += 1;
      wireKlaviyo();
      syncActive();
      if (klaviyoInput && nativeSubmit) {
        window.clearInterval(poll);
      }
      if (attempts >= 80) {
        window.clearInterval(poll);
      }
    }, 250);

    syncActive();
  }

  function initAll() {
    document.querySelectorAll('.footer-newsletter-section[data-footer-newsletter]').forEach(initFooterNewsletter);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var section =
      event.target && event.target.matches && event.target.matches('.footer-newsletter-section[data-footer-newsletter]')
        ? event.target
        : event.target && event.target.querySelector
          ? event.target.querySelector('.footer-newsletter-section[data-footer-newsletter]')
          : null;
    if (!section) return;
    section.dataset.footerNewsletterBound = '';
    initFooterNewsletter(section);
  });
})();
