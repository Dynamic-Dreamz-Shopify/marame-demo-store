/**
 * MARAME dynamic size guide modal.
 * Expects JSON from #SizeGuideData-{sectionId} and markup from size-guide-modal.liquid.
 */
(function () {
  'use strict';

  var CM_PER_IN = 2.54;
  var REGION_ORDER = ['UK', 'US', 'EU', 'IT', 'FR', 'AU', 'INT'];
  var REGION_LABELS = {
    UK: 'UK',
    US: 'US',
    EU: 'EU',
    IT: 'IT',
    FR: 'FR',
    AU: 'AU',
    INT: 'International'
  };

  var FOCUSABLE =
    'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  var ss26BundleCache = null;

  function setupGlobalTriggerDelegation() {
    if (setupGlobalTriggerDelegation.done) return;
    setupGlobalTriggerDelegation.done = true;

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-size-guide-open]');
      if (!trigger) return;

      var controlsId = trigger.getAttribute('aria-controls');
      if (!controlsId) return;

      var dialog = document.getElementById(controlsId);
      if (!dialog) return;

      var root = dialog.closest('[data-size-guide]');
      var instance = root && root.__marameSizeGuide;
      if (!instance || !instance.data) return;

      instance.pendingTab = trigger.getAttribute('data-size-guide-tab-target') || 'chart';
      instance.open();
    });
  }

  function parseData(sectionId) {
    var node = document.getElementById('SizeGuideData-' + sectionId);
    if (!node) return null;
    try {
      return normalizeGuideData(JSON.parse(node.textContent));
    } catch (e) {
      return null;
    }
  }

  function normalizeGuideData(raw) {
    if (!raw || typeof raw !== 'object') return null;

    var data = Object.assign({}, raw);
    data.measurementRows = raw.measurementRows || raw.measurement_rows || [];
    data.regionSizeMapping = raw.regionSizeMapping || raw.region_size_mapping || {};
    data.availableRegions = raw.availableRegions || raw.available_regions;
    data.defaultRegion = raw.defaultRegion || raw.default_region;
    data.garmentType = raw.garmentType || raw.garment_type;
    data.introHtml = raw.introHtml || raw.how_to_measure_steps || raw.intro_html;
    data.notesHtml = raw.notesHtml || raw.measurement_notes || raw.notes_html;
    if (raw.finder && typeof raw.finder === 'object') {
      data.finder = Object.assign({}, raw.finder);
      if (raw.finder.length_profile && !data.finder.lengthProfile) {
        data.finder.lengthProfile = raw.finder.length_profile;
      }
    }
    return data;
  }

  function loadSs26Guide(handle, bundleUrl) {
    if (!bundleUrl || !handle) return Promise.resolve(null);

    var loadBundle = ss26BundleCache
      ? Promise.resolve(ss26BundleCache)
      : fetch(bundleUrl)
          .then(function (res) {
            if (!res.ok) throw new Error('SS26 bundle load failed');
            return res.json();
          })
          .then(function (bundle) {
            ss26BundleCache = bundle;
            return bundle;
          });

    return loadBundle.then(function (bundle) {
      var entry = bundle && bundle.by_handle ? bundle.by_handle[handle] : null;
      var data = normalizeGuideData(entry);
      if (data && bundle.finder_v3) data.finder_v3 = bundle.finder_v3;
      return data;
    });
  }

  function formatNumber(value) {
    if (value == null || value === '') return '—';
    var num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return Number.isInteger(num) ? String(num) : num.toFixed(1).replace(/\.0$/, '');
  }

  function convertCmToIn(cm) {
    return cm / CM_PER_IN;
  }

  function convertInToCm(inches) {
    return inches * CM_PER_IN;
  }

  function resolveMeasurementValue(cell, unit) {
    if (!cell || typeof cell !== 'object') return null;

    var cm = cell.cm != null ? Number(cell.cm) : null;
    var inches = cell.in != null ? Number(cell.in) : cell.inch != null ? Number(cell.inch) : null;

    if (unit === 'cm') {
      if (cm != null && !Number.isNaN(cm)) return cm;
      if (inches != null && !Number.isNaN(inches)) return convertInToCm(inches);
      return null;
    }

    if (inches != null && !Number.isNaN(inches)) return inches;
    if (cm != null && !Number.isNaN(cm)) return convertCmToIn(cm);
    return null;
  }

  function normalizeRegions(data) {
    var mapping = data.regionSizeMapping || {};
    var regions = mapping.regions || mapping;
    var available = Array.isArray(data.availableRegions) ? data.availableRegions.slice() : [];
    var keys = [];

    if (available.length) {
      keys = available.map(function (r) {
        return String(r).toUpperCase();
      });
    } else if (regions && typeof regions === 'object') {
      keys = Object.keys(regions);
    }

    keys = keys.filter(function (key, index) {
      return keys.indexOf(key) === index;
    });

    keys.sort(function (a, b) {
      var ai = REGION_ORDER.indexOf(a);
      var bi = REGION_ORDER.indexOf(b);
      if (ai === -1) ai = 999;
      if (bi === -1) bi = 999;
      return ai - bi;
    });

    if (!keys.length) keys = ['UK'];

    var defaultRegion = (data.defaultRegion || mapping.default_region || 'UK').toUpperCase();
    if (keys.indexOf(defaultRegion) === -1) defaultRegion = keys[0];

    return { regions: regions, keys: keys, defaultRegion: defaultRegion };
  }

  function getRegionSizes(regions, regionKey) {
    var entry = regions && regions[regionKey];
    if (!entry) return [];
    if (Array.isArray(entry)) return entry;
    if (Array.isArray(entry.sizes)) return entry.sizes;
    return [];
  }

  function getRegionLabel(regionKey, regions) {
    var entry = regions && regions[regionKey];
    if (entry && entry.label) return entry.label;
    return REGION_LABELS[regionKey] || regionKey;
  }

  function sortRows(rows) {
    return (rows || [])
      .slice()
      .sort(function (a, b) {
        var ao = a.order != null ? a.order : a.display_order != null ? a.display_order : 999;
        var bo = b.order != null ? b.order : b.display_order != null ? b.display_order : 999;
        return ao - bo;
      });
  }

  function SizeGuide(root) {
    this.root = root;
    this.sectionId = root.getAttribute('data-section-id');
    this.dialog = root.querySelector('.size-guide__dialog');
    this.overlay = root.querySelector('[data-size-guide-overlay]');
    this.closeBtn = root.querySelector('[data-size-guide-close]');
    this.chartPanel = root.querySelector('[data-size-guide-panel="chart"]');
    this.finderPanel = root.querySelector('[data-size-guide-panel="finder"]');
    this.tabButtons = root.querySelectorAll('[data-size-guide-tab]');
    this.regionSelect = root.querySelector('[data-size-guide-region]');
    this.unitButtons = root.querySelectorAll('[data-size-guide-unit]');
    this.thead = root.querySelector('[data-size-guide-thead]');
    this.tbody = root.querySelector('[data-size-guide-tbody]');
    this.titleEl = root.querySelector('[data-size-guide-title]');
    this.introEl = root.querySelector('[data-size-guide-intro]');
    this.notesEl = root.querySelector('[data-size-guide-notes]');
    this.imageWrap = root.querySelector('[data-size-guide-image-wrap]');
    this.lastFocus = null;
    this.activeTab = 'chart';
    this.pendingTab = 'chart';
    this.unit = 'cm';
    this.data = null;
    this.regionMeta = { regions: {}, keys: ['UK'], defaultRegion: 'UK' };
    this.currentRegion = 'UK';
    this.finder = null;

    if (!this.dialog) return;

    var self = this;
    var bundleUrl = root.getAttribute('data-ss26-bundle-url');
    var handle = root.getAttribute('data-product-handle');
    var dataPromise = bundleUrl
      ? loadSs26Guide(handle, bundleUrl)
      : Promise.resolve(parseData(this.sectionId));

    dataPromise.then(function (data) {
      if (!data) return;
      var productTitle = root.getAttribute('data-product-title');
      if (productTitle) data.title = productTitle;
      self.data = data;
      self.regionMeta = normalizeRegions(self.data);
      self.currentRegion = self.regionMeta.defaultRegion;
      self.bind();
      self.populateStatic();
      self.populateRegions();
      self.renderTable();
      self.setTab('chart', true);

      if (self.data.finder && self.data.finder.enabled && window.MarameSizeFinder) {
        self.finder = window.MarameSizeFinder.create(self);
      }

      root.__marameSizeGuide = self;
      setupGlobalTriggerDelegation();
    });
  }

  SizeGuide.prototype.bind = function () {
    var self = this;

    if (this.root.hasAttribute('data-size-guide-bound')) return;
    this.root.setAttribute('data-size-guide-bound', 'true');

    this.closeBtn.addEventListener('click', function () {
      self.close();
    });

    this.overlay.addEventListener('click', function () {
      self.close();
    });

    this.regionSelect.addEventListener('change', function () {
      self.currentRegion = self.regionSelect.value;
      self.renderTable();
    });

    this.unitButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.setUnit(btn.getAttribute('data-size-guide-unit'));
      });
    });

    this.tabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.setTab(btn.getAttribute('data-size-guide-tab'));
      });
    });

    this.dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        self.close();
        return;
      }
      if (event.key === 'Tab') self.trapFocus(event);
    });
  };

  SizeGuide.prototype.setTab = function (tab, silent) {
    if (!tab) tab = 'chart';
    if (tab === 'finder' && (!this.data.finder || !this.data.finder.enabled)) tab = 'chart';

    this.activeTab = tab;
    var self = this;

    this.tabButtons.forEach(function (btn) {
      var isActive = btn.getAttribute('data-size-guide-tab') === tab;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (this.chartPanel) {
      var chartActive = tab === 'chart';
      this.chartPanel.classList.toggle('is-active', chartActive);
      this.chartPanel.hidden = !chartActive;
    }

    if (this.finderPanel) {
      var finderActive = tab === 'finder';
      this.finderPanel.classList.toggle('is-active', finderActive);
      this.finderPanel.hidden = !finderActive;
    }

    if (!silent && this.titleEl) {
      this.titleEl.textContent = tab === 'finder' ? 'Find your size' : this.data.title || 'Size guide';
    } else if (this.titleEl && tab === 'chart') {
      this.titleEl.textContent = this.data.title || 'Size guide';
    }
  };

  SizeGuide.prototype.populateStatic = function () {
    if (this.titleEl && this.data.title) {
      this.titleEl.textContent = this.data.title;
    }

    if (this.introEl) {
      if (this.data.introHtml) {
        this.introEl.innerHTML = this.data.introHtml;
        this.introEl.hidden = false;
      } else {
        this.introEl.hidden = true;
      }
    }

    if (this.notesEl) {
      if (this.data.notesHtml) {
        this.notesEl.innerHTML = this.data.notesHtml;
        this.notesEl.hidden = false;
      } else {
        this.notesEl.hidden = true;
      }
    }

    if (this.imageWrap) {
      var image = this.data.image || {};
      if (image.url) {
        this.imageWrap.innerHTML =
          '<img src="' +
          image.url +
          '" alt="' +
          (image.alt || 'How to measure') +
          '" class="size-guide__image" loading="lazy" width="' +
          (image.width || '') +
          '" height="' +
          (image.height || '') +
          '">';
        this.imageWrap.hidden = false;
      } else {
        this.imageWrap.hidden = true;
        this.imageWrap.innerHTML = '';
      }
    }
  };

  SizeGuide.prototype.populateRegions = function () {
    var self = this;
    this.regionSelect.innerHTML = '';

    this.regionMeta.keys.forEach(function (key) {
      var option = document.createElement('option');
      option.value = key;
      option.textContent = getRegionLabel(key, self.regionMeta.regions);
      if (key === self.currentRegion) option.selected = true;
      self.regionSelect.appendChild(option);
    });
  };

  SizeGuide.prototype.setUnit = function (unit) {
    var self = this;
    this.unit = unit === 'in' ? 'in' : 'cm';
    this.unitButtons.forEach(function (btn) {
      var active = btn.getAttribute('data-size-guide-unit') === self.unit;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    this.renderTable();
  };

  SizeGuide.prototype.renderTable = function () {
    var sizes = getRegionSizes(this.regionMeta.regions, this.currentRegion);
    var rows = sortRows(this.data.measurementRows);

    this.thead.innerHTML = '';
    this.tbody.innerHTML = '';

    if (!sizes.length || !rows.length) {
      var emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="2" class="size-guide__empty">Size chart unavailable.</td>';
      this.tbody.appendChild(emptyRow);
      return;
    }

    var headRow = document.createElement('tr');
    var measureTh = document.createElement('th');
    measureTh.scope = 'col';
    measureTh.className = 'size-guide__th size-guide__th--measure';
    measureTh.textContent = 'Measurement';
    headRow.appendChild(measureTh);

    sizes.forEach(function (size) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.className = 'size-guide__th';
      th.textContent = size;
      headRow.appendChild(th);
    });
    this.thead.appendChild(headRow);

    var self = this;
    rows.forEach(function (row) {
      var tr = document.createElement('tr');
      var name = row.name || row.measurement_name || '—';
      var help = row.help || row.help_text || '';

      var nameTd = document.createElement('th');
      nameTd.scope = 'row';
      nameTd.className = 'size-guide__td size-guide__td--measure';

      if (help) {
        nameTd.innerHTML =
          '<span class="size-guide__measure-name">' +
          name +
          '</span><button type="button" class="size-guide__help" aria-label="' +
          help.replace(/"/g, '&quot;') +
          '" title="' +
          help.replace(/"/g, '&quot;') +
          '">?</button>';
      } else {
        nameTd.textContent = name;
      }

      tr.appendChild(nameTd);

      var values = row.values || row.values_by_size || [];
      sizes.forEach(function (_size, index) {
        var td = document.createElement('td');
        td.className = 'size-guide__td';
        var cell = Array.isArray(values) ? values[index] : values[_size] || values['size_' + index];
        var resolved = resolveMeasurementValue(cell, self.unit);
        td.textContent = formatNumber(resolved);
        tr.appendChild(td);
      });

      self.tbody.appendChild(tr);
    });
  };

  SizeGuide.prototype.getFocusable = function () {
    return Array.prototype.slice.call(this.dialog.querySelectorAll(FOCUSABLE)).filter(function (el) {
      return !el.hidden && (el.offsetParent !== null || el === this.closeBtn);
    }, this);
  };

  SizeGuide.prototype.trapFocus = function (event) {
    var focusable = this.getFocusable();
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  SizeGuide.prototype.open = function () {
    this.lastFocus = document.activeElement;
    this.root.hidden = false;
    document.body.classList.add('size-guide-open');
    document.body.setAttribute('data-lenis-prevent', 'true');
    document.documentElement.setAttribute('data-lenis-prevent', 'true');

    var self = this;
    requestAnimationFrame(function () {
      self.root.classList.add('is-open');
      self.setTab(self.pendingTab || 'chart');
      self.dialog.focus();
    });
  };

  SizeGuide.prototype.close = function () {
    var self = this;
    this.root.classList.remove('is-open');
    document.body.classList.remove('size-guide-open');
    document.body.removeAttribute('data-lenis-prevent');
    document.documentElement.removeAttribute('data-lenis-prevent');

    window.setTimeout(function () {
      self.root.hidden = true;
      self.setTab('chart', true);
      if (self.lastFocus && typeof self.lastFocus.focus === 'function') {
        self.lastFocus.focus();
      }
    }, 220);
  };

  function init() {
    setupGlobalTriggerDelegation();
    document.querySelectorAll('[data-size-guide]').forEach(function (root) {
      new SizeGuide(root);
    });
  }

  window.MarameSizeGuide = window.MarameSizeGuide || {};
  window.MarameSizeGuide.refresh = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
