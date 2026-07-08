/**
 * MARAME Find Your Size — step flow and rule-based recommendations.
 * Depends on size-guide.js data helpers and #SizeGuideData-{sectionId} JSON.
 */
(function (global) {
  'use strict';

  var STORAGE_PREFIX = 'marame-size-finder-';
  var FIT_OPTIONS = [
    { id: 'close', label: 'Close fit', hint: 'Neat and streamlined' },
    { id: 'regular', label: 'Regular fit', hint: 'Our standard shape' },
    { id: 'relaxed', label: 'Relaxed fit', hint: 'A little more room' },
    { id: 'oversized', label: 'Oversized fit', hint: 'Loose and laid-back' }
  ];
  var LEG_LENGTH_OPTIONS = [
    { id: 'petite', label: 'Petite' },
    { id: 'regular', label: 'Regular' },
    { id: 'long', label: 'Long' }
  ];
  var FOOT_WIDTH_OPTIONS = [
    { id: 'narrow', label: 'Narrow' },
    { id: 'standard', label: 'Standard' },
    { id: 'wide', label: 'Wide' }
  ];

  var GARMENT_OPTIONAL_FIELDS = {
    tops: ['bust', 'bra', 'waist'],
    dresses: ['bust', 'bra', 'waist', 'hip'],
    outerwear: ['bust', 'bra', 'waist', 'hip'],
    trousers: ['waist', 'hip', 'trouser_size', 'leg_length', 'inside_leg'],
    shoes: ['foot_length', 'foot_width'],
    accessories: []
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function normalizeGarmentType(type) {
    var t = String(type || '').toLowerCase().trim();
    if (GARMENT_OPTIONAL_FIELDS[t]) return t;
    if (t.indexOf('shoe') !== -1) return 'shoes';
    if (t.indexOf('trouser') !== -1 || t.indexOf('pant') !== -1 || t.indexOf('jean') !== -1) return 'trousers';
    if (t.indexOf('dress') !== -1) return 'dresses';
    if (t.indexOf('jacket') !== -1 || t.indexOf('coat') !== -1 || t.indexOf('blazer') !== -1) return 'outerwear';
    if (t.indexOf('accessor') !== -1) return 'accessories';
    return 'tops';
  }

  function getRegionSizes(regions, regionKey) {
    var entry = regions && regions[regionKey];
    if (!entry) return [];
    if (Array.isArray(entry)) return entry;
    if (Array.isArray(entry.sizes)) return entry.sizes;
    return [];
  }

  function findSizeIndex(sizes, value) {
    if (!value || !sizes.length) return -1;
    var str = String(value).trim();
    var idx = sizes.indexOf(str);
    if (idx !== -1) return idx;
    idx = sizes.findIndex(function (s) {
      return String(s).toLowerCase() === str.toLowerCase();
    });
    return idx;
  }

  function getMeasurementRow(rows, names) {
    var list = Array.isArray(names) ? names : [names];
    return (rows || []).find(function (row) {
      var name = (row.name || row.measurement_name || '').toLowerCase();
      return list.some(function (n) {
        return name.indexOf(n) !== -1;
      });
    });
  }

  function getMeasurementCm(row, index) {
    if (!row) return null;
    var values = row.values || row.values_by_size || [];
    var cell = Array.isArray(values) ? values[index] : null;
    if (!cell) return null;
    if (cell.cm != null) return Number(cell.cm);
    if (cell.in != null) return Number(cell.in) * 2.54;
    return null;
  }

  function findBestIndexForMeasurement(rows, names, targetCm) {
    var row = getMeasurementRow(rows, names);
    if (!row || targetCm == null || Number.isNaN(targetCm)) return -1;
    var values = row.values || [];
    var best = -1;
    var bestDiff = Infinity;
    values.forEach(function (cell, index) {
      var cm = getMeasurementCm({ values: [cell] }, 0);
      if (cm == null) return;
      var diff = Math.abs(cm - targetCm);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = index;
      }
    });
    return best;
  }

  function recommend(data, answers) {
    var useV3 =
      data.finder &&
      Number(data.finder.engineVersion) >= 3 &&
      global.MarameSizeFinderEngineV3 &&
      global.MarameSizeFinderEngineV3.recommend;
    if (useV3) {
      return global.MarameSizeFinderEngineV3.recommend(data, answers, {
        finderV3: data.finder_v3
      });
    }
    if (global.MarameSizeFinderEngine && global.MarameSizeFinderEngine.recommend) {
      return global.MarameSizeFinderEngine.recommend(data, answers);
    }
    return {
      ok: false,
      confidence: 'low',
      message: 'Size finder is unavailable.',
      advice: 'Please use the size chart.',
      reasons: []
    };
  }

  function isFinderDebug() {
    try {
      return /size_finder_debug=1/.test(global.location.search);
    } catch (e) {
      return false;
    }
  }

  function SizeFinder(instance) {
    this.instance = instance;
    this.data = instance.data;
    this.root = instance.root;
    this.panel = this.root.querySelector('[data-size-guide-panel="finder"]');
    this.productHandle = this.root.getAttribute('data-product-handle') || 'product';
    this.garmentType = normalizeGarmentType(this.data.garmentType);
    this.finder = this.data.finder || {};
    this.answers = this.loadAnswers();
    this.stepIndex = 0;
    this.showingResult = false;

    if (!this.panel || !this.finder.enabled) return;

    this.optionalFields = this.resolveOptionalFields();
    this.steps = this.buildSteps();
    this.renderShell();
    this.bind();
    this.renderStep();
  }

  SizeFinder.prototype.resolveOptionalFields = function () {
    if (Array.isArray(this.finder.optionalFields) && this.finder.optionalFields.length) {
      return this.finder.optionalFields;
    }
    return GARMENT_OPTIONAL_FIELDS[this.garmentType] || [];
  };

  SizeFinder.prototype.buildSteps = function () {
    var steps = ['usual', 'body', 'fit'];
    if (this.optionalFields.length) steps.push('optional');
    return steps;
  };

  SizeFinder.prototype.storageKey = function () {
    return STORAGE_PREFIX + this.productHandle;
  };

  SizeFinder.prototype.loadAnswers = function () {
    try {
      var raw = sessionStorage.getItem(this.storageKey());
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  SizeFinder.prototype.saveAnswers = function () {
    try {
      sessionStorage.setItem(this.storageKey(), JSON.stringify(this.answers));
    } catch (e) {
      /* ignore */
    }
  };

  SizeFinder.prototype.renderShell = function () {
    this.panel.innerHTML =
      '<div class="size-finder" data-size-finder-root>' +
      '<p class="size-finder__privacy">We only use this information to suggest your best size.</p>' +
      '<div class="size-finder__progress" data-size-finder-progress aria-live="polite"></div>' +
      '<div class="size-finder__step" data-size-finder-step></div>' +
      '<div class="size-finder__nav">' +
      '<button type="button" class="size-finder__btn size-finder__btn--ghost" data-size-finder-back hidden>Back</button>' +
      '<button type="button" class="size-finder__btn size-finder__btn--primary" data-size-finder-next>Continue</button>' +
      '</div>' +
      '<div class="size-finder__result" data-size-finder-result hidden></div>' +
      '</div>';

    this.stepEl = this.panel.querySelector('[data-size-finder-step]');
    this.progressEl = this.panel.querySelector('[data-size-finder-progress]');
    this.resultEl = this.panel.querySelector('[data-size-finder-result]');
    this.backBtn = this.panel.querySelector('[data-size-finder-back]');
    this.nextBtn = this.panel.querySelector('[data-size-finder-next]');
  };

  SizeFinder.prototype.bind = function () {
    var self = this;
    this.backBtn.addEventListener('click', function () {
      self.goBack();
    });
    this.nextBtn.addEventListener('click', function () {
      self.goNext();
    });
    this.panel.addEventListener('click', function (event) {
      var card = event.target.closest('[data-finder-value]');
      if (!card) return;
      var field = card.getAttribute('data-finder-field');
      var value = card.getAttribute('data-finder-value');
      self.answers[field] = value;
      self.panel.querySelectorAll('[data-finder-field="' + field + '"]').forEach(function (el) {
        el.classList.toggle('is-selected', el.getAttribute('data-finder-value') === value);
        el.setAttribute('aria-pressed', el.getAttribute('data-finder-value') === value ? 'true' : 'false');
      });
      if (field === 'region') self.renderStep();
      self.saveAnswers();
    });
    this.panel.addEventListener('input', function (event) {
      var input = event.target.closest('[data-finder-input]');
      if (!input) return;
      self.answers[input.getAttribute('data-finder-input')] = input.value;
      self.saveAnswers();
    });
  };

  SizeFinder.prototype.reset = function () {
    this.stepIndex = 0;
    this.showingResult = false;
    this.resultEl.hidden = true;
    this.stepEl.hidden = false;
    this.panel.querySelector('.size-finder__nav').hidden = false;
    this.renderStep();
  };

  SizeFinder.prototype.goBack = function () {
    if (this.showingResult) {
      this.showingResult = false;
      this.resultEl.hidden = true;
      this.stepEl.hidden = false;
      this.panel.querySelector('.size-finder__nav').hidden = false;
      this.stepIndex = this.steps.length - 1;
      this.renderStep();
      return;
    }
    if (this.stepIndex > 0) {
      this.stepIndex -= 1;
      this.renderStep();
    }
  };

  SizeFinder.prototype.goNext = function () {
    if (!this.validateCurrentStep()) return;
    this.saveAnswers();
    if (this.stepIndex < this.steps.length - 1) {
      this.stepIndex += 1;
      this.renderStep();
      return;
    }
    this.showResult();
  };

  SizeFinder.prototype.validateCurrentStep = function () {
    var step = this.steps[this.stepIndex];
    if (step === 'usual') {
      return !!(this.answers.region && this.answers.usual_size);
    }
    if (step === 'body') {
      return !!(this.answers.height && this.answers.weight);
    }
    if (step === 'fit') {
      return !!this.answers.fit;
    }
    return true;
  };

  SizeFinder.prototype.renderStep = function () {
    var step = this.steps[this.stepIndex];
    this.progressEl.textContent = 'Step ' + (this.stepIndex + 1) + ' of ' + this.steps.length;
    this.backBtn.hidden = this.stepIndex === 0 && !this.showingResult;
    this.nextBtn.textContent = step === 'optional' ? 'See my size' : 'Continue';

    if (step === 'usual') this.renderUsualStep();
    else if (step === 'body') this.renderBodyStep();
    else if (step === 'fit') this.renderFitStep();
    else if (step === 'optional') this.renderOptionalStep();
  };

  SizeFinder.prototype.renderPill = function (field, value, label, selected) {
    return (
      '<button type="button" class="size-finder__pill' +
      (selected ? ' is-selected' : '') +
      '" data-finder-field="' +
      field +
      '" data-finder-value="' +
      escapeHtml(value) +
      '" aria-pressed="' +
      (selected ? 'true' : 'false') +
      '"><small>' +
      escapeHtml(label) +
      '</small></button>'
    );
  };

  SizeFinder.prototype.renderUsualStep = function () {
    var self = this;
    var keys = this.instance.regionMeta.keys;
    var region = this.answers.region || this.instance.regionMeta.defaultRegion;
    var sizes = getRegionSizes(this.instance.regionMeta.regions, region);

    var regionCards = keys
      .map(function (key) {
        return self.renderPill('region', key, key, key === region);
      })
      .join('');

    var sizeCards = sizes
      .map(function (size) {
        return self.renderPill(
          'usual_size',
          size,
          size,
          String(size) === String(self.answers.usual_size)
        );
      })
      .join('');

    this.stepEl.innerHTML =
      '<h3 class="size-finder__heading">Your usual size</h3>' +
      '<p class="size-finder__lede">Tell us what you normally wear — no measuring tape needed.</p>' +
      '<fieldset class="size-finder__group"><legend class="size-guide__label">Sizing region</legend>' +
      '<div class="size-finder__pills">' +
      regionCards +
      '</div></fieldset>' +
      '<fieldset class="size-finder__group"><legend class="size-guide__label">Your usual size</legend>' +
      '<div class="size-finder__pills">' +
      sizeCards +
      '</div></fieldset>';
  };

  SizeFinder.prototype.renderBodyStep = function () {
    this.stepEl.innerHTML =
      '<h3 class="size-finder__heading">A little about you</h3>' +
      '<p class="size-finder__lede">This helps us fine-tune your recommendation.</p>' +
      '<div class="size-finder__fields">' +
      '<label class="size-finder__field"><span class="size-guide__label">Height (cm)</span>' +
      '<input type="number" min="120" max="220" step="1" class="size-finder__input" data-finder-input="height" value="' +
      escapeHtml(this.answers.height || '') +
      '" inputmode="numeric" placeholder="e.g. 168"></label>' +
      '<label class="size-finder__field"><span class="size-guide__label">Weight (kg)</span>' +
      '<input type="number" min="35" max="200" step="1" class="size-finder__input" data-finder-input="weight" value="' +
      escapeHtml(this.answers.weight || '') +
      '" inputmode="numeric" placeholder="e.g. 62"></label>' +
      '</div>';
  };

  SizeFinder.prototype.renderFitStep = function () {
    var cards = FIT_OPTIONS.map(function (opt) {
      var selected = opt.id === this.answers.fit;
      return (
        '<button type="button" class="size-finder__choice' +
        (selected ? ' is-selected' : '') +
        '" data-finder-field="fit" data-finder-value="' +
        opt.id +
        '" aria-pressed="' +
        (selected ? 'true' : 'false') +
        '"><span class="size-finder__choice-label">' +
        escapeHtml(opt.label) +
        '</span><span class="size-finder__choice-hint">' +
        escapeHtml(opt.hint) +
        '</span></button>'
      );
    }, this).join('');

    this.stepEl.innerHTML =
      '<h3 class="size-finder__heading">How do you like clothes to fit?</h3>' +
      '<p class="size-finder__lede">Choose the feel closest to what you prefer.</p>' +
      '<div class="size-finder__choices">' +
      cards +
      '</div>';
  };

  SizeFinder.prototype.renderOptionalStep = function () {
    var html =
      '<h3 class="size-finder__heading">Optional details</h3>' +
      '<p class="size-finder__lede">Add measurements only if you know them — skip anything you are unsure about.</p>' +
      '<div class="size-finder__fields">';

    var self = this;
    this.optionalFields.forEach(function (field) {
      if (field === 'leg_length') {
        html +=
          '<fieldset class="size-finder__group"><legend class="size-guide__label">Leg length preference</legend><div class="size-finder__pills">';
        LEG_LENGTH_OPTIONS.forEach(function (opt) {
          html += self.renderPill(
            'leg_length',
            opt.id,
            opt.label,
            opt.id === self.answers.leg_length
          );
        });
        html += '</div></fieldset>';
        return;
      }
      if (field === 'foot_width') {
        html +=
          '<fieldset class="size-finder__group"><legend class="size-guide__label">Foot width</legend><div class="size-finder__pills">';
        FOOT_WIDTH_OPTIONS.forEach(function (opt) {
          html += self.renderPill(
            'foot_width',
            opt.id,
            opt.label,
            opt.id === self.answers.foot_width
          );
        });
        html += '</div></fieldset>';
        return;
      }

      var labels = {
        bust: 'Bust (cm)',
        bra: 'Bra size',
        waist: 'Waist (cm)',
        hip: 'Hip (cm)',
        trouser_size: 'Usual trouser size',
        inside_leg: 'Inside leg (cm)',
        foot_length: 'Foot length (cm)'
      };
      var type = field === 'bra' || field === 'trouser_size' ? 'text' : 'number';
      html +=
        '<label class="size-finder__field"><span class="size-guide__label">' +
        escapeHtml(labels[field] || field) +
        '</span><input type="' +
        type +
        '" class="size-finder__input" data-finder-input="' +
        field +
        '" value="' +
        escapeHtml(self.answers[field] || '') +
        '" placeholder="Optional"></label>';
    });

    html += '</div>';
    this.stepEl.innerHTML = html;
  };

  SizeFinder.prototype.showResult = function () {
    var result = recommend(this.data, this.answers);
    if (isFinderDebug()) {
      global.__marameLastFinderResult = result;
    }
    this.showingResult = true;
    this.stepEl.hidden = true;
    this.panel.querySelector('.size-finder__nav').hidden = true;
    this.progressEl.textContent = 'Your recommendation';
    this.resultEl.hidden = false;

    if (!result.ok) {
      this.resultEl.innerHTML =
        '<div class="size-finder__result-card size-finder__result-card--muted">' +
        '<p class="size-finder__result-message">' +
        escapeHtml(result.message) +
        '</p>' +
        '<p class="size-finder__result-advice">' +
        escapeHtml(result.advice) +
        '</p>' +
        '<button type="button" class="size-finder__btn size-finder__btn--primary" data-size-finder-restart>Start again</button>' +
        '</div>';
    } else {
      var confidenceLabel = result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1) + ' confidence';
      var secondaryHtml = result.secondary
        ? '<p class="size-finder__result-secondary">Also consider size <strong>' +
          escapeHtml(result.secondary) +
          '</strong></p>'
        : '';

      var reasonsHtml = '';
      if (result.reasons && result.reasons.length) {
        reasonsHtml =
          '<div class="size-finder__result-reasons"><p class="size-finder__result-reasons-title">Why this size</p><ul>' +
          result.reasons
            .map(function (r) {
              return '<li>' + escapeHtml(r) + '</li>';
            })
            .join('') +
          '</ul></div>';
      }

      this.resultEl.innerHTML =
        '<div class="size-finder__result-card">' +
        '<p class="size-finder__result-kicker">' +
        escapeHtml(confidenceLabel) +
        '</p>' +
        '<p class="size-finder__result-size">Size <span>' +
        escapeHtml(result.recommended) +
        '</span></p>' +
        secondaryHtml +
        '<p class="size-finder__result-message">' +
        escapeHtml(result.explanation) +
        '</p>' +
        '<p class="size-finder__result-advice">' +
        escapeHtml(result.advice) +
        '</p>' +
        reasonsHtml +
        (this.finder.fitNotesHtml ? '<div class="size-finder__result-notes">' + this.finder.fitNotesHtml + '</div>' : '') +
        '<div class="size-finder__result-actions">' +
        '<button type="button" class="size-finder__btn size-finder__btn--ghost" data-size-finder-restart>Edit answers</button>' +
        '<button type="button" class="size-finder__btn size-finder__btn--primary" data-size-finder-view-chart>View size chart</button>' +
        '</div></div>';
    }

    var self = this;
    this.resultEl.querySelectorAll('[data-size-finder-restart]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.reset();
      });
    });
    var chartBtn = this.resultEl.querySelector('[data-size-finder-view-chart]');
    if (chartBtn) {
      chartBtn.addEventListener('click', function () {
        self.instance.setTab('chart');
      });
    }
  };

  global.MarameSizeFinder = {
    create: function (instance) {
      return new SizeFinder(instance);
    },
    recommend: recommend
  };
})(window);
