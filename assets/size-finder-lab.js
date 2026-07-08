/**
 * MARAME Size Finder Algorithm Lab — product picker, presets, debug panel.
 */
(function () {
  'use strict';

  var root = document.getElementById('MarameSizeFinderLab');
  if (!root) return;

  var bundleUrl = root.getAttribute('data-bundle-url');
  var testsUrl = root.getAttribute('data-tests-url');
  var engineVersion =
    (window.MarameSizeFinderEngineV3 && window.MarameSizeFinderEngineV3.version) ||
    (window.MarameSizeFinderEngine && window.MarameSizeFinderEngine.version) ||
    '?';

  var state = {
    bundle: null,
    tests: [],
    handle: '',
    labInputs: {},
    profileOverrides: {},
    lastResult: null,
    lastMeta: null
  };

  var FIT_OPTIONS = ['close', 'regular', 'relaxed', 'oversized'];
  var SHOULDER_OPTIONS = ['narrow', 'regular', 'broad'];
  var LEG_LENGTH_OPTIONS = ['petite', 'regular', 'long'];
  var TROUSER_LENGTH_OPTIONS = [
    { id: 'too_short', label: 'Too short' },
    { id: 'about_right', label: 'About right' },
    { id: 'too_long', label: 'Too long' }
  ];
  var WAIST_FIT_OPTIONS = [
    { id: 'tight', label: 'Tight' },
    { id: 'about_right', label: 'About right' },
    { id: 'loose', label: 'Loose' }
  ];

  var PARAM_HELP = {
    preset:
      'Pre-filled customer examples from our QA test suite. Pick one to load a product, customer measurements, and run the engine — useful for checking a known case (e.g. “large bra should size up on Arla”).',
    runs_large_small:
      'Style-level fit label from the product profile. If this garment generally runs small, the engine bumps the final size up one step; runs large bumps down. Applied after matching customer measurements to the size chart.',
    recommendation_adjustment:
      'A standing correction for this product only: −1 = always one size smaller, +1 = one size larger, 0 = none. Use when the style needs a fixed offset that measurement matching alone does not capture. Applied last, after runs large/small.',
    ease_bust:
      'Extra room (cm) added to the customer’s bust before comparing to chest × 2 on the size chart. Tops default ~8 cm for regular fit; fitted styles (e.g. bandeaus) use less. Higher = roomier recommendation.',
    ease_waist:
      'Extra room (cm) added to the customer’s waist before comparing to the flat waist measurement × 2. Trousers often use ~2–3 cm. “Waistband feel: tight” adds +2 cm automatically.',
    ease_hip:
      'Extra room (cm) added to the customer’s hip before comparing to flat hip/thigh × 2 on the chart. The engine uses hip or thigh rows — whichever is on the chart. Lounge trousers default 8 cm.',
    shoulder_narrow:
      'When the customer chose “narrow shoulders” and is between sizes, this can nudge down (or up). Only used where there is no shoulder-to-shoulder row on the chart.',
    shoulder_broad:
      'When the customer chose “broad shoulders” and is between sizes, this can nudge up. Structured blazers may always size up for broad shoulders.'
  };

  var els = {
    product: root.querySelector('[data-lab-product]'),
    preset: root.querySelector('[data-lab-preset]'),
    form: root.querySelector('[data-lab-form]'),
    sharedFields: root.querySelector('[data-lab-shared-fields]'),
    categoryFields: root.querySelector('[data-lab-category-fields]'),
    runBtn: root.querySelector('[data-lab-run]'),
    runAllBtn: root.querySelector('[data-lab-run-all]'),
    shareBtn: root.querySelector('[data-lab-share]'),
    result: root.querySelector('[data-lab-result]'),
    debug: root.querySelector('[data-lab-debug]'),
    testsPanel: root.querySelector('[data-lab-tests]'),
    engineBadge: root.querySelector('[data-lab-engine-version]'),
    chart: root.querySelector('[data-lab-chart]'),
    profileSummary: root.querySelector('[data-lab-profile-summary]'),
    overrides: root.querySelector('[data-lab-overrides]'),
    feedback: root.querySelector('[data-lab-feedback]'),
    feedbackLog: root.querySelector('[data-lab-feedback-log]'),
    exportFeedbackBtn: root.querySelector('[data-lab-export-feedback]'),
    status: root.querySelector('[data-lab-status]')
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setStatus(msg, isError) {
    if (!els.status) return;
    els.status.textContent = msg || '';
    els.status.classList.toggle('sflab__status--error', !!isError);
  }

  function getGuide(handle) {
    if (!state.bundle || !handle) return null;
    var raw = state.bundle.by_handle[handle];
    return window.MarameSizeFinderLabAdapter.normalizeGuideData(raw);
  }

  function getEngine() {
    return window.MarameSizeFinderEngineV3 || window.MarameSizeFinderEngine;
  }

  function infoHelp(key) {
    var text = PARAM_HELP[key] || '';
    if (!text) return '';
    return (
      '<span class="sflab__info-wrap">' +
      '<button type="button" class="sflab__info" data-lab-info="' +
      escapeHtml(key) +
      '" aria-label="Explain this field" title="Explain">' +
      '<svg class="sflab__info-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5C7.86 4.5 4.5 7.86 4.5 12S7.86 19.5 12 19.5 19.5 16.14 19.5 12 16.14 4.5 12 4.5Zm0 2.2a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM10.8 11v6.3h2.4V11H10.8Z"/></svg>' +
      '</button>' +
      '<span class="sflab__info-pop" data-lab-info-panel="' +
      escapeHtml(key) +
      '" hidden>' +
      escapeHtml(text) +
      '</span></span>'
    );
  }

  function labelWithHelp(text, helpKey) {
    return escapeHtml(text) + (helpKey ? infoHelp(helpKey) : '');
  }

  function isCircumferenceRow(name) {
    var n = String(name || '').toLowerCase();
    return (
      n.indexOf('chest') !== -1 ||
      n.indexOf('waist') !== -1 ||
      n.indexOf('hip') !== -1 ||
      n.indexOf('thigh') !== -1 ||
      n.indexOf('bust') !== -1
    );
  }

  function recommendWithOverrides(guide, answers) {
    guide.finder_v3 = state.bundle.finder_v3;
    var engine = getEngine();
    if (!engine) return null;
    var mergedOverrides = Object.assign({}, state.profileOverrides);
    var baseEase =
      guide.finder && guide.finder.profile && guide.finder.profile.ease_overrides
        ? guide.finder.profile.ease_overrides
        : null;
    if (mergedOverrides.ease_overrides && baseEase) {
      mergedOverrides.ease_overrides = Object.assign({}, baseEase, mergedOverrides.ease_overrides);
    }
    if (engine === window.MarameSizeFinderEngineV3) {
      return engine.recommend(guide, answers, {
        finderV3: state.bundle.finder_v3,
        profileOverrides: mergedOverrides
      });
    }
    return engine.recommend(guide, answers);
  }

  function readProfileOverrides() {
    var overrides = {};
    var easeOverrides = {};
    root.querySelectorAll('[data-lab-override]').forEach(function (el) {
      var key = el.getAttribute('data-lab-override');
      var val = el.value;
      if (val === '' || val == null) return;
      if (key === 'recommendation_adjustment') {
        overrides.recommendation_adjustment = Number(val);
      } else if (key.indexOf('ease_') === 0) {
        easeOverrides[key.replace('ease_', '')] = Number(val);
      } else if (key.indexOf('shoulder_') === 0) {
        if (!overrides.shoulder_fit_rule) {
          overrides.shoulder_fit_rule = { narrow: 'no_change', regular: 'no_change', broad: 'no_change' };
        }
        overrides.shoulder_fit_rule[key.replace('shoulder_', '')] = val;
      } else {
        overrides[key] = val;
      }
    });
    if (Object.keys(easeOverrides).length) overrides.ease_overrides = easeOverrides;
    state.profileOverrides = overrides;
    return overrides;
  }

  function profileUsesBustEase(p) {
    var priorities = p.priority_measurements || [];
    var ignored = (p.ignore_measurements || []).join(' ');
    return priorities.indexOf('bust') !== -1 && ignored.indexOf('bust') === -1;
  }

  function profileUsesWaistEase(p) {
    var gt = String(p.garment_type || '').toLowerCase();
    return (
      (p.priority_measurements || []).indexOf('waist') !== -1 ||
      gt === 'trouser' ||
      gt === 'trousers' ||
      gt === 'short' ||
      gt === 'jumpsuit' ||
      gt === 'dress' ||
      gt === 'skirt'
    );
  }

  function profileUsesHipEase(p) {
    var gt = String(p.garment_type || '').toLowerCase();
    return (
      (p.priority_measurements || []).indexOf('hip') !== -1 ||
      (p.priority_measurements || []).indexOf('hips') !== -1 ||
      gt === 'trouser' ||
      gt === 'trousers' ||
      gt === 'short' ||
      gt === 'jumpsuit' ||
      gt === 'dress' ||
      gt === 'skirt'
    );
  }

  function profileUsesShoulderRules(p) {
    var ignored = p.ignore_measurements || [];
    return ignored.indexOf('shoulders') === -1;
  }

  function renderSizeChartTable(handle) {
    if (!els.chart) return;
    var guide = getGuide(handle);
    if (!guide || !guide.measurement_rows || !guide.measurement_rows.length) {
      els.chart.innerHTML = '<p class="sflab__hint">No size chart rows for this product.</p>';
      return;
    }
    var sizes = window.MarameSizeFinderLabAdapter.getRegionSizes(guide, 'UK');
    var rows = guide.measurement_rows.slice().sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });
    var p = guide.finder && guide.finder.profile;
    var usedRows = (p && p.available_chart_rows) || rows.map(function (r) { return r.name; });

    els.chart.innerHTML =
      '<p class="sflab__hint">Flat garment cm from the SS26 size guide spreadsheet — the engine compares customer body measurements (+ ease) to these numbers (×2 for chest/waist/hip/thigh).</p>' +
      '<div class="sflab__chart-scroll"><table class="sflab__chart-table"><thead><tr><th>Measurement</th>' +
      sizes
        .map(function (s) {
          return '<th>' + escapeHtml(s) + '</th>';
        })
        .join('') +
      '</tr></thead><tbody>' +
      rows
        .map(function (row) {
          var isUsed =
            usedRows.some(function (u) {
              return String(u).toLowerCase() === String(row.name).toLowerCase();
            }) ||
            usedRows.some(function (u) {
              return String(row.name).toLowerCase().indexOf(String(u).toLowerCase()) !== -1;
            });
          var circ = isCircumferenceRow(row.name);
          return (
            '<tr class="' +
            (isUsed ? 'sflab__chart-row--used' : '') +
            '"><td>' +
            escapeHtml(row.name) +
            (isUsed ? ' <span class="sflab__chart-tag">used</span>' : '') +
            (circ ? ' <span class="sflab__chart-tag sflab__chart-tag--muted">×2</span>' : '') +
            '</td>' +
            (row.values || [])
              .map(function (v) {
                var cm = v && v.cm != null ? v.cm : '—';
                var extra =
                  circ && v && v.cm != null
                    ? '<span class="sflab__chart-circ">' + (v.cm * 2).toFixed(1) + '</span>'
                    : '';
                return '<td>' + escapeHtml(String(cm)) + extra + '</td>';
              })
              .join('') +
            '</tr>'
          );
        })
        .join('') +
      '</tbody></table></div>';
  }

  function renderProfileOverrides(handle) {
    if (!els.overrides) return;
    var guide = getGuide(handle);
    var p = guide && guide.finder && guide.finder.profile;
    if (!p) {
      els.overrides.innerHTML = '';
      return;
    }
    var rule = p.shoulder_fit_rule || {};
    var ease = p.ease_overrides || {};
    var html =
      '<fieldset class="sflab__fieldset sflab__fieldset--tweak">' +
      '<legend>Tweak product rules (test only)</legend>' +
      '<p class="sflab__hint">These change how the engine reads the size chart above — not the customer details below. Re-run after changing. If a tweak fixes a wrong result, save feedback so we can update the product profile permanently.</p>' +
      '<div class="sflab__row sflab__row--2">' +
      '<label class="sflab__label">' +
      labelWithHelp('Runs large / small', 'runs_large_small') +
      '<select class="sflab__input" data-lab-override="runs_large_small">' +
      ['true_to_size', 'runs_small', 'runs_large'].map(function (v) {
        return '<option value="' + v + '"' + (p.runs_large_small === v ? ' selected' : '') + '>' + v + '</option>';
      }).join('') +
      '</select></label>' +
      '<label class="sflab__label">' +
      labelWithHelp('Recommendation adjustment', 'recommendation_adjustment') +
      '<select class="sflab__input" data-lab-override="recommendation_adjustment">' +
      ['-1', '0', '1'].map(function (v) {
        var label = v === '-1' ? '−1 (size down)' : v === '1' ? '+1 (size up)' : '0 (none)';
        return (
          '<option value="' +
          v +
          '"' +
          (String(p.recommendation_adjustment || 0) === v ? ' selected' : '') +
          '>' +
          label +
          '</option>'
        );
      }).join('') +
      '</select></label></div>';

    var easeFields = [];
    if (profileUsesBustEase(p)) {
      easeFields.push({
        key: 'ease_bust',
        label: 'Bust ease (cm)',
        help: 'ease_bust',
        value: ease.bust != null ? ease.bust : ''
      });
    }
    if (profileUsesWaistEase(p)) {
      easeFields.push({
        key: 'ease_waist',
        label: 'Waist ease (cm)',
        help: 'ease_waist',
        value: ease.waist != null ? ease.waist : ''
      });
    }
    if (profileUsesHipEase(p)) {
      easeFields.push({
        key: 'ease_hip',
        label: 'Hip / thigh ease (cm)',
        help: 'ease_hip',
        value: ease.hip != null ? ease.hip : ease.hips != null ? ease.hips : ''
      });
    }

    if (easeFields.length) {
      html += '<div class="sflab__row sflab__row--2">';
      easeFields.forEach(function (field) {
        html +=
          '<label class="sflab__label">' +
          labelWithHelp(field.label, field.help) +
          '<input class="sflab__input" type="number" step="0.5" data-lab-override="' +
          field.key +
          '" value="' +
          escapeHtml(String(field.value)) +
          '" placeholder="from profile"></label>';
      });
      html += '</div>';
    }

    if (profileUsesShoulderRules(p)) {
      html +=
        '<div class="sflab__row sflab__row--2">' +
        '<label class="sflab__label">' +
        labelWithHelp('Shoulder rule — narrow', 'shoulder_narrow') +
        '<select class="sflab__input" data-lab-override="shoulder_narrow">' +
        ['no_change', 'size_up', 'size_down'].map(function (v) {
          return '<option value="' + v + '"' + (rule.narrow === v ? ' selected' : '') + '>' + v + '</option>';
        }).join('') +
        '</select></label>' +
        '<label class="sflab__label">' +
        labelWithHelp('Shoulder rule — broad', 'shoulder_broad') +
        '<select class="sflab__input" data-lab-override="shoulder_broad">' +
        ['no_change', 'size_up', 'size_down'].map(function (v) {
          return '<option value="' + v + '"' + (rule.broad === v ? ' selected' : '') + '>' + v + '</option>';
        }).join('') +
        '</select></label></div>';
    }

    html += '</fieldset>';
    els.overrides.innerHTML = html;
  }

  function getFeedbackVerdict() {
    var hidden = root.querySelector('[data-lab-feedback-verdict]');
    return hidden ? hidden.value : '';
  }

  function renderFeedbackForm() {
    if (!els.feedback) return;
    if (!state.lastResult || !state.lastResult.ok) {
      els.feedback.innerHTML =
        '<p class="sflab__hint">Run a recommendation first, then you can mark whether it looks right.</p>';
      return;
    }
    var sizes = window.MarameSizeFinderLabAdapter.getRegionSizes(getGuide(state.handle) || {}, 'UK');
    els.feedback.innerHTML =
      '<fieldset class="sflab__fieldset sflab__fieldset--feedback">' +
      '<legend>Stylist feedback</legend>' +
      '<p class="sflab__hint">This does <strong>not</strong> retrain the algorithm automatically. It saves a record (customer details, what the engine said, what you think it should be) so the dev team can update product rules. Export once at the end of a session — you do not need to export after every test.</p>' +
      '<p class="sflab__label">Is this recommendation correct?</p>' +
      '<input type="hidden" data-lab-feedback-verdict value="">' +
      '<div class="sflab__verdict-btns">' +
      '<button type="button" class="sflab__verdict-btn" data-lab-verdict="correct">Yes, looks right</button>' +
      '<button type="button" class="sflab__verdict-btn" data-lab-verdict="wrong">No — wrong size</button>' +
      '</div>' +
      '<label class="sflab__label">If wrong: what size would you recommend?' +
      '<select class="sflab__input" data-lab-feedback-size"><option value="">—</option>' +
      sizes.map(function (s) {
        return '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>';
      }).join('') +
      '</select></label>' +
      '<label class="sflab__label">Notes — what was wrong? (e.g. &ldquo;needs more room in shoulders&rdquo;, &ldquo;bust ease too low on this style&rdquo;)' +
      '<textarea class="sflab__input sflab__textarea" rows="3" data-lab-feedback-notes placeholder="Describe what should change in the rules for this product"></textarea></label>' +
      '<label class="sflab__label">Your name (optional)' +
      '<input class="sflab__input" data-lab-feedback-author placeholder="Stylist name"></label>' +
      '<div class="sflab__actions">' +
      '<button type="button" class="sflab__btn" data-lab-save-feedback>Save this feedback</button>' +
      '</div></fieldset>';
  }

  function renderFeedbackLog() {
    if (!els.feedbackLog || !window.MarameSizeFinderLabFeedback) return;
    var items = window.MarameSizeFinderLabFeedback.loadAll();
    if (!items.length) {
      els.feedbackLog.innerHTML = '<p class="sflab__hint">No feedback saved yet.</p>';
      return;
    }
    els.feedbackLog.innerHTML =
      '<table class="sflab__tests-table"><thead><tr><th>When</th><th>Product</th><th>Got</th><th>Should be</th><th>Notes</th></tr></thead><tbody>' +
      items.slice(0, 20).map(function (item) {
        return (
          '<tr><td>' + escapeHtml(item.timestamp.slice(0, 16).replace('T', ' ')) + '</td>' +
          '<td>' + escapeHtml(item.product_title || item.product_handle) + '</td>' +
          '<td>' + escapeHtml(item.engine_result && item.engine_result.recommended ? item.engine_result.recommended : '—') + '</td>' +
          '<td>' + escapeHtml(item.stylist_recommended_size || '—') + '</td>' +
          '<td>' + escapeHtml(item.notes || '') + '</td></tr>'
        );
      }).join('') +
      '</tbody></table>';
  }

  function saveFeedback() {
    if (!window.MarameSizeFinderLabFeedback || !state.lastResult) {
      setStatus('Run a recommendation before saving feedback.', true);
      return;
    }
    var verdict = getFeedbackVerdict();
    if (!verdict) {
      setStatus('Tap Yes or No above before saving.', true);
      return;
    }
    var stylistSize = (root.querySelector('[data-lab-feedback-size]') || {}).value || '';
    if (verdict === 'wrong' && !stylistSize) {
      setStatus('If the size is wrong, choose what size you would recommend.', true);
      return;
    }
    var guide = getGuide(state.handle);
    var entry = {
      id: 'fb_' + Date.now(),
      timestamp: new Date().toISOString(),
      author: (root.querySelector('[data-lab-feedback-author]') || {}).value || '',
      product_handle: state.handle,
      product_title: guide && guide.title,
      inputs: state.labInputs,
      profile_overrides: state.profileOverrides,
      engine_result: {
        recommended: state.lastResult.recommended,
        secondary: state.lastResult.secondary,
        confidence: state.lastResult.confidence
      },
      verdict: verdict,
      stylist_recommended_size: stylistSize,
      notes: (root.querySelector('[data-lab-feedback-notes]') || {}).value || '',
      page_url: window.location.href
    };
    window.MarameSizeFinderLabFeedback.addEntry(entry);
    renderFeedbackLog();
    renderFeedbackForm();
    setStatus(
      'Feedback saved (' +
        window.MarameSizeFinderLabFeedback.loadAll().length +
        ' saved in this browser). Export all when finished testing.'
    );
  }

  function exportFeedback() {
    if (!window.MarameSizeFinderLabFeedback) return;
    var json = window.MarameSizeFinderLabFeedback.exportJson(window.MarameSizeFinderLabFeedback.loadAll());
    window.MarameSizeFinderLabFeedback.downloadJson('marame-size-finder-feedback.json', json);
    setStatus('Feedback exported.');
  }

  function getBraConversion() {
    return (state.bundle && state.bundle.finder_v3 && state.bundle.finder_v3.bra_conversion) || null;
  }

  function isTopLike(garmentType) {
    var t = String(garmentType || '').toLowerCase();
    return t === 'top' || t === 'outerwear' || t === 'tops';
  }

  function isTrousersLike(garmentType) {
    var t = String(garmentType || '').toLowerCase();
    return t === 'trousers' || t === 'trouser' || t === 'jumpsuit';
  }

  function isDressLike(garmentType) {
    var t = String(garmentType || '').toLowerCase();
    return t === 'dress' || t === 'dresses' || t === 'skirt' || t === 'jumpsuit';
  }

  function readFormInputs() {
    var inputs = {};
    root.querySelectorAll('[data-lab-input]').forEach(function (el) {
      var key = el.getAttribute('data-lab-input');
      if (el.type === 'checkbox') {
        if (el.checked) inputs[key] = true;
      } else if (el.value !== '') {
        inputs[key] = el.value;
      }
    });
    return inputs;
  }

  function writeFormInputs(labInputs) {
    root.querySelectorAll('[data-lab-input]').forEach(function (el) {
      var key = el.getAttribute('data-lab-input');
      if (el.type === 'checkbox') {
        el.checked = !!labInputs[key];
      } else {
        el.value = labInputs[key] != null ? labInputs[key] : '';
      }
    });
  }

  function renderUsualSizeOptions(region) {
    var select = root.querySelector('[data-lab-input="usual_size"]');
    if (!select || !state.handle) return;
    var guide = getGuide(state.handle);
    if (!guide) return;
    var sizes = window.MarameSizeFinderLabAdapter.getRegionSizes(guide, region || 'UK');
    var current = select.value;
    select.innerHTML = sizes
      .map(function (s) {
        return '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + '</option>';
      })
      .join('');
    if (current && sizes.indexOf(current) !== -1) select.value = current;
  }

  function renderCategoryFields(garmentType) {
    if (!els.categoryFields) return;
    var t = String(garmentType || '').toLowerCase();
    var html = '';

    if (t === 'jumpsuit') {
      html +=
        '<fieldset class="sflab__fieldset"><legend>Jumpsuit</legend>' +
        '<label class="sflab__label">Bra size (UK) <span class="sflab__optional">optional</span>' +
        '<input class="sflab__input" data-lab-input="bra_size" placeholder="e.g. 34D"></label>' +
        '<label class="sflab__label">Bust (cm) <span class="sflab__optional">optional</span>' +
        '<input class="sflab__input" type="number" min="70" max="150" step="0.1" data-lab-input="bust_cm"></label>' +
        '<label class="sflab__label">Shoulder profile' +
        '<select class="sflab__input" data-lab-input="shoulder_profile">' +
        SHOULDER_OPTIONS.map(function (o) {
          return '<option value="' + o + '">' + o + '</option>';
        }).join('') +
        '</select></label>' +
        '<label class="sflab__label">Waist (cm)' +
        '<input class="sflab__input" type="number" min="50" max="130" step="0.1" data-lab-input="waist_cm"></label>' +
        '<label class="sflab__label">Hip (cm)' +
        '<input class="sflab__input" type="number" min="70" max="150" step="0.1" data-lab-input="hip_cm"></label>' +
        '<label class="sflab__label">Inside leg (cm) <span class="sflab__optional">optional</span>' +
        '<input class="sflab__input" type="number" min="60" max="100" step="0.1" data-lab-input="inside_leg_cm"></label>' +
        '<label class="sflab__label">Leg length preference' +
        '<select class="sflab__input" data-lab-input="leg_length">' +
        '<option value="">—</option>' +
        LEG_LENGTH_OPTIONS.map(function (o) {
          return '<option value="' + o + '">' + o + '</option>';
        }).join('') +
        '</select></label></fieldset>';
      els.categoryFields.innerHTML = html;
      return;
    }

    if (isTopLike(t)) {
      html +=
        '<fieldset class="sflab__fieldset"><legend>Tops / outerwear</legend>' +
        '<label class="sflab__label">Bra size (UK) <span class="sflab__optional">optional</span>' +
        '<input class="sflab__input" data-lab-input="bra_size" placeholder="e.g. 34D"></label>' +
        '<label class="sflab__label">Bust (cm) <span class="sflab__optional">optional</span>' +
        '<input class="sflab__input" type="number" min="70" max="150" step="0.1" data-lab-input="bust_cm" placeholder="e.g. 96"></label>' +
        '<label class="sflab__label">Shoulder profile' +
        '<select class="sflab__input" data-lab-input="shoulder_profile">' +
        SHOULDER_OPTIONS.map(function (o) {
          return '<option value="' + o + '">' + o + '</option>';
        }).join('') +
        '</select></label>' +
        '<p class="sflab__hint">Optional: bra size is converted to an estimated bust measurement. Shoulder profile can nudge the result on some styles (see parameter tweaks below).</p>' +
        '</fieldset>';
    }

    if (isTrousersLike(garmentType) || isDressLike(garmentType)) {
      html +=
        '<fieldset class="sflab__fieldset"><legend>Waist &amp; hip</legend>' +
        '<label class="sflab__label">Waist (cm)' +
        '<input class="sflab__input" type="number" min="50" max="130" step="0.1" data-lab-input="waist_cm"></label>' +
        '<label class="sflab__label">Hip (cm)' +
        '<input class="sflab__input" type="number" min="70" max="150" step="0.1" data-lab-input="hip_cm"></label>' +
        '</fieldset>';
    }

    if (isTrousersLike(t)) {
      html +=
        '<fieldset class="sflab__fieldset"><legend>Trousers / jumpsuit</legend>' +
        '<label class="sflab__label">Inside leg (cm) <span class="sflab__optional">optional</span>' +
        '<input class="sflab__input" type="number" min="60" max="100" step="0.1" data-lab-input="inside_leg_cm"></label>' +
        '<label class="sflab__label">Leg length preference' +
        '<select class="sflab__input" data-lab-input="leg_length">' +
        '<option value="">—</option>' +
        LEG_LENGTH_OPTIONS.map(function (o) {
          return '<option value="' + o + '">' + o + '</option>';
        }).join('') +
        '</select></label>' +
        '<label class="sflab__label">Trouser length issue' +
        '<select class="sflab__input" data-lab-input="trouser_length_issue">' +
        '<option value="">—</option>' +
        TROUSER_LENGTH_OPTIONS.map(function (o) {
          return '<option value="' + o.id + '">' + o.label + '</option>';
        }).join('') +
        '</select></label>' +
        '<label class="sflab__label">Waistband feel' +
        '<select class="sflab__input" data-lab-input="waist_fit">' +
        '<option value="">—</option>' +
        WAIST_FIT_OPTIONS.map(function (o) {
          return '<option value="' + o.id + '">' + o.label + '</option>';
        }).join('') +
        '</select></label></fieldset>';
    }

    if (isDressLike(t) && !isTrousersLike(t)) {
      html +=
        '<fieldset class="sflab__fieldset"><legend>Dress / skirt</legend>' +
        '<label class="sflab__label">Bra size (UK) <span class="sflab__optional">optional</span>' +
        '<input class="sflab__input" data-lab-input="bra_size" placeholder="e.g. 34D"></label>' +
        '<label class="sflab__label">Bust (cm) <span class="sflab__optional">optional</span>' +
        '<input class="sflab__input" type="number" min="70" max="150" step="0.1" data-lab-input="bust_cm"></label>' +
        '</fieldset>';
    }

    els.categoryFields.innerHTML = html || '<p class="sflab__hint">No category-specific fields for this garment type.</p>';
  }

  function renderProfileSummary(handle) {
    if (!els.profileSummary) return;
    var guide = getGuide(handle);
    if (!guide || !guide.finder || !guide.finder.profile) {
      els.profileSummary.innerHTML = '';
      return;
    }
    var p = guide.finder.profile;
    var ease = p.ease_overrides || {};
    var easeParts = [];
    if (ease.bust != null) easeParts.push('bust +' + ease.bust + ' cm');
    if (ease.waist != null) easeParts.push('waist +' + ease.waist + ' cm');
    if (ease.hip != null) easeParts.push('hip +' + ease.hip + ' cm');
    else if (ease.hips != null) easeParts.push('hip +' + ease.hips + ' cm');

    var combined = (p.hard_warnings || []).some(function (w) {
      return String(w).indexOf('combined') !== -1;
    });

    els.profileSummary.innerHTML =
      '<dl class="sflab__profile-dl">' +
      '<div><dt>Spreadsheet tab</dt><dd>' + escapeHtml(p.spreadsheet_tab || '—') + '</dd></div>' +
      '<div><dt>Garment</dt><dd>' + escapeHtml(p.garment_type || guide.garment_type || '—') + ' · ' + escapeHtml(p.fit_type || '—') + '</dd></div>' +
      '<div><dt>Engine uses first</dt><dd>' + escapeHtml((p.priority_measurements || []).join(', ') || '—') + '</dd></div>' +
      '<div><dt>Also considers</dt><dd>' + escapeHtml((p.secondary_measurements || []).join(', ') || '—') + '</dd></div>' +
      '<div><dt>Ease in profile</dt><dd>' + escapeHtml(easeParts.join(' · ') || 'defaults by category') + '</dd></div>' +
      (combined ? '<div><dt>Sizing</dt><dd>Combined size buckets (e.g. 8-10, 12-14)</dd></div>' : '') +
      '</dl>' +
      (p.fit_notes
        ? '<p class="sflab__profile-note"><strong>Stylist note:</strong> ' + escapeHtml(p.fit_notes) + '</p>'
        : '') +
      (p.algorithm_notes
        ? '<details class="sflab__profile-details"><summary>How the algorithm treats this style</summary><p>' +
          escapeHtml(p.algorithm_notes) +
          '</p></details>'
        : '');
  }

  function renderResult(result, meta, expected) {
    if (!els.result) return;

    if (!result) {
      els.result.innerHTML = '<p class="sflab__placeholder">Run a scenario to see the recommendation.</p>';
      return;
    }

    if (!result.ok) {
      els.result.innerHTML =
        '<div class="sflab__result-card sflab__result-card--muted">' +
        '<p class="sflab__result-message">' + escapeHtml(result.message) + '</p>' +
        '<p class="sflab__result-advice">' + escapeHtml(result.advice) + '</p></div>';
      return;
    }

    var compareHtml = '';
    if (expected) {
      var cmp = window.MarameSizeFinderLabAdapter.compareToExpected(result, expected);
      compareHtml =
        '<div class="sflab__expected ' + (cmp.pass ? 'sflab__expected--pass' : 'sflab__expected--fail') + '">' +
        '<strong>v3 test expectation:</strong> size ' + escapeHtml(expected.recommended_size) +
        (expected.secondary_size ? ' · also ' + escapeHtml(expected.secondary_size) : '') +
        ' · ' + escapeHtml(expected.confidence) + ' confidence' +
        (cmp.notes.length ? '<ul>' + cmp.notes.map(function (n) { return '<li>' + escapeHtml(n) + '</li>'; }).join('') + '</ul>' : '') +
        '</div>';
    }

    var reasonsHtml = '';
    if (result.reasons && result.reasons.length) {
      reasonsHtml =
        '<ul class="sflab__reasons">' +
        result.reasons.map(function (r) { return '<li>' + escapeHtml(r) + '</li>'; }).join('') +
        '</ul>';
    }

    els.result.innerHTML =
      '<div class="sflab__result-card">' +
      '<p class="sflab__result-kicker">' + escapeHtml(result.confidence) + ' confidence</p>' +
      '<p class="sflab__result-size">Size <span>' + escapeHtml(result.recommended) + '</span></p>' +
      (result.secondary ? '<p class="sflab__result-secondary">Also consider <strong>' + escapeHtml(result.secondary) + '</strong></p>' : '') +
      '<p class="sflab__result-message">' + escapeHtml(result.explanation) + '</p>' +
      '<p class="sflab__result-advice">' + escapeHtml(result.advice) + '</p>' +
      reasonsHtml +
      compareHtml +
      '</div>';
  }

  function renderDebug(result, meta, guide) {
    if (!els.debug) return;
    var lines = [];

    lines.push('Engine v' + engineVersion);

    if (result && result.debug && result.debug.steps && result.debug.steps.length) {
      lines.push('Steps:');
      result.debug.steps.forEach(function (step) {
        lines.push('  · ' + JSON.stringify(step));
      });
    }

    if (state.profileOverrides && Object.keys(state.profileOverrides).length) {
      lines.push('Profile overrides: ' + JSON.stringify(state.profileOverrides));
    }

    if (meta) {
      lines.push('Bra: ' + (meta.bra_size || '—') + (meta.bra_bust_cm != null ? ' → ' + meta.bra_bust_cm + ' cm bust' : ''));
      lines.push('Bust used: ' + (meta.bust_source || 'none'));
      if (meta.shoulder_profile) {
        lines.push('Shoulder profile: ' + meta.shoulder_profile + ' (v3 nudge only)');
        var rule = guide && guide.finder && guide.finder.profile && guide.finder.profile.shoulder_fit_rule;
        if (rule && meta.shoulder_profile !== 'regular') {
          lines.push('Profile shoulder_fit_rule.' + meta.shoulder_profile + ' = ' + (rule[meta.shoulder_profile] || '—'));
        }
      }
    }

    if (result && result.debug) {
      lines.push('Garment type (engine): ' + (result.debug.garmentType || '—'));
      lines.push('Blended index: ' + (result.debug.blendedIndex != null ? result.debug.blendedIndex.toFixed(3) : '—'));
      lines.push('Raw index: ' + (result.debug.rawIndex != null ? result.debug.rawIndex.toFixed(3) : '—'));
      if (result.debug.signals && result.debug.signals.length) {
        lines.push('Signals:');
        result.debug.signals.forEach(function (s) {
          lines.push('  · ' + s.source + ' → index ' + s.index + ' (weight ' + s.weight + ')');
        });
      }
    }

    els.debug.innerHTML = '<pre class="sflab__debug-pre">' + escapeHtml(lines.join('\n')) + '</pre>';
  }

  function runScenario(expected) {
    if (!state.handle) {
      setStatus('Choose a product first.', true);
      return;
    }
    if (!getEngine()) {
      setStatus('Engine not loaded.', true);
      return;
    }

    var guide = getGuide(state.handle);
    if (!guide) {
      setStatus('Product chart not found.', true);
      return;
    }

    state.labInputs = readFormInputs();
    readProfileOverrides();
    var converted = window.MarameSizeFinderLabAdapter.labInputsToEngineAnswers(state.labInputs, getBraConversion());
    var result = recommendWithOverrides(guide, converted.answers);

    state.lastResult = result;
    state.lastMeta = converted.meta;

    renderResult(result, converted.meta, expected);
    renderDebug(result, converted.meta, guide);
    renderFeedbackForm();
    setStatus('Recommendation updated.');
    updateShareUrl();
  }

  function populateProducts() {
    if (!els.product || !state.bundle) return;
    var handles = Object.keys(state.bundle.by_handle || {}).sort();
    els.product.innerHTML = handles
      .map(function (h) {
        var g = state.bundle.by_handle[h];
        var title = (g && g.title) || h;
        return '<option value="' + escapeHtml(h) + '">' + escapeHtml(title) + '</option>';
      })
      .join('');
  }

  function formatPresetLabel(test) {
    var label = String(test.id || '')
      .replace(/^T\d+_/, '')
      .replace(/_/g, ' ');
    if (test.why) {
      var short = test.why.length > 72 ? test.why.slice(0, 69) + '…' : test.why;
      return label + ' — ' + short;
    }
    return label;
  }

  function populatePresets() {
    if (!els.preset) return;
    var opts = ['<option value="">— Example test case (optional) —</option>'];
    state.tests.forEach(function (t) {
      opts.push('<option value="' + escapeHtml(t.id) + '">' + escapeHtml(formatPresetLabel(t)) + '</option>');
    });
    els.preset.innerHTML = opts.join('');
  }

  function loadPreset(id) {
    var test = state.tests.find(function (t) { return t.id === id; });
    if (!test) return;

    state.handle = test.product_handle;
    if (els.product) els.product.value = state.handle;

    var garmentType = window.MarameSizeFinderLabAdapter.getProfileGarmentType(getGuide(state.handle));
    renderCategoryFields(garmentType);
    renderProfileSummary(state.handle);
    renderSizeChartTable(state.handle);
    renderProfileOverrides(state.handle);
    writeFormInputs(test.inputs);
    renderUsualSizeOptions(test.inputs.region || 'UK');
    runScenario(test.expected);
  }

  function runAllTests() {
    if (!els.testsPanel || !getEngine()) return;
    var rows = [];
    var passCount = 0;

    state.tests.forEach(function (test) {
      var guide = getGuide(test.product_handle);
      if (!guide) {
        rows.push({ id: test.id, pass: false, got: '—', expected: test.expected.recommended_size, note: 'Missing chart' });
        return;
      }
      guide.finder_v3 = state.bundle.finder_v3;
      state.profileOverrides = {};
      var converted = window.MarameSizeFinderLabAdapter.labInputsToEngineAnswers(test.inputs, getBraConversion());
      var result = recommendWithOverrides(guide, converted.answers);
      var cmp = window.MarameSizeFinderLabAdapter.compareToExpected(result, test.expected);
      if (cmp.pass) passCount += 1;
      rows.push({
        id: test.id,
        pass: cmp.pass,
        got: result.ok ? result.recommended : '—',
        expected: test.expected.recommended_size,
        note: cmp.notes.join('; ')
      });
    });

    els.testsPanel.innerHTML =
      '<p class="sflab__tests-summary">' + passCount + ' / ' + rows.length + ' match v3 expected sizes (engine v' + engineVersion + ')</p>' +
      '<table class="sflab__tests-table"><thead><tr><th>Test</th><th>Expected</th><th>Got</th><th></th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr class="' + (r.pass ? 'sflab__tests-row--pass' : 'sflab__tests-row--fail') + '">' +
          '<td><button type="button" class="sflab__tests-load" data-test-id="' + escapeHtml(r.id) + '">' + escapeHtml(r.id) + '</button></td>' +
          '<td>' + escapeHtml(r.expected) + '</td>' +
          '<td>' + escapeHtml(String(r.got)) + '</td>' +
          '<td>' + escapeHtml(r.note) + '</td></tr>';
      }).join('') +
      '</tbody></table>';

    els.testsPanel.querySelectorAll('[data-test-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        loadPreset(btn.getAttribute('data-test-id'));
        if (els.preset) els.preset.value = btn.getAttribute('data-test-id');
      });
    });
  }

  function updateShareUrl() {
    try {
      var params = new URLSearchParams();
      params.set('product', state.handle);
      Object.keys(state.labInputs).forEach(function (k) {
        if (state.labInputs[k] != null && state.labInputs[k] !== '') {
          params.set(k, state.labInputs[k]);
        }
      });
      history.replaceState(null, '', '?' + params.toString());
    } catch (e) { /* ignore */ }
  }

  function readShareUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      var product = params.get('product');
      if (!product || !state.bundle.by_handle[product]) return;
      state.handle = product;
      if (els.product) els.product.value = product;
      var inputs = {};
      params.forEach(function (value, key) {
        if (key !== 'product') inputs[key] = value;
      });
      var garmentType = window.MarameSizeFinderLabAdapter.getProfileGarmentType(getGuide(state.handle));
      renderCategoryFields(garmentType);
      renderProfileSummary(state.handle);
      renderSizeChartTable(state.handle);
      renderProfileOverrides(state.handle);
      writeFormInputs(inputs);
      renderUsualSizeOptions(inputs.region || 'UK');
    } catch (e) { /* ignore */ }
  }

  function bindEvents() {
    if (els.product) {
      els.product.addEventListener('change', function () {
        state.handle = els.product.value;
        var garmentType = window.MarameSizeFinderLabAdapter.getProfileGarmentType(getGuide(state.handle));
        renderCategoryFields(garmentType);
        renderProfileSummary(state.handle);
        renderSizeChartTable(state.handle);
        renderProfileOverrides(state.handle);
        renderUsualSizeOptions(readFormInputs().region || 'UK');
      });
    }

    if (els.preset) {
      els.preset.addEventListener('change', function () {
        if (els.preset.value) loadPreset(els.preset.value);
      });
    }

    root.addEventListener('change', function (e) {
      if (e.target && e.target.getAttribute('data-lab-input') === 'region') {
        renderUsualSizeOptions(e.target.value);
      }
    });

    if (els.runBtn) els.runBtn.addEventListener('click', function () { runScenario(null); });
    if (els.runAllBtn) els.runAllBtn.addEventListener('click', runAllTests);

    if (els.shareBtn) {
      els.shareBtn.addEventListener('click', function () {
        updateShareUrl();
        navigator.clipboard.writeText(window.location.href).then(function () {
          setStatus('Link copied — send to your stylist.');
        }).catch(function () {
          setStatus('Copy this URL: ' + window.location.href);
        });
      });
    }

    if (els.form) {
      els.form.addEventListener('submit', function (e) {
        e.preventDefault();
        runScenario(null);
      });
    }

    root.addEventListener('click', function (e) {
      if (e.target && e.target.hasAttribute('data-lab-save-feedback')) {
        saveFeedback();
        return;
      }
      var infoBtn = e.target && e.target.closest ? e.target.closest('[data-lab-info]') : null;
      if (infoBtn) {
        var infoKey = infoBtn.getAttribute('data-lab-info');
        var panel = root.querySelector('[data-lab-info-panel="' + infoKey + '"]');
        root.querySelectorAll('.sflab__info-pop').forEach(function (pop) {
          if (pop !== panel) pop.hidden = true;
        });
        if (panel) panel.hidden = !panel.hidden;
        return;
      }
      var verdictBtn = e.target && e.target.closest ? e.target.closest('[data-lab-verdict]') : null;
      if (verdictBtn) {
        var val = verdictBtn.getAttribute('data-lab-verdict');
        var hidden = root.querySelector('[data-lab-feedback-verdict]');
        if (hidden) hidden.value = val;
        root.querySelectorAll('[data-lab-verdict]').forEach(function (btn) {
          btn.classList.toggle('is-selected', btn === verdictBtn);
        });
      }
    });

    if (els.exportFeedbackBtn) {
      els.exportFeedbackBtn.addEventListener('click', exportFeedback);
    }
  }

  function renderSharedFields() {
    if (!els.sharedFields) return;
    els.sharedFields.innerHTML =
      '<fieldset class="sflab__fieldset sflab__fieldset--customer"><legend>About this customer</legend>' +
      '<label class="sflab__label">Region' +
      '<select class="sflab__input" data-lab-input="region">' +
      ['UK', 'US', 'EU', 'IT', 'FR', 'AU', 'INT'].map(function (r) {
        return '<option value="' + r + '">' + r + '</option>';
      }).join('') +
      '</select></label>' +
      '<label class="sflab__label">Usual size' +
      '<select class="sflab__input" data-lab-input="usual_size"></select></label>' +
      '<label class="sflab__label">Height (cm)' +
      '<input class="sflab__input" type="number" min="120" max="220" data-lab-input="height_cm" value="168"></label>' +
      '<label class="sflab__label">Fit preference' +
      '<select class="sflab__input" data-lab-input="fit_preference">' +
      FIT_OPTIONS.map(function (f) {
        return '<option value="' + f + '">' + f + '</option>';
      }).join('') +
      '</select></label></fieldset>';
  }

  function init() {
    if (els.engineBadge) els.engineBadge.textContent = 'Engine v' + engineVersion;

    Promise.all([
      fetch(bundleUrl).then(function (r) { if (!r.ok) throw new Error('bundle'); return r.json(); }),
      fetch(testsUrl).then(function (r) { if (!r.ok) throw new Error('tests'); return r.json(); })
    ])
      .then(function (parts) {
        state.bundle = parts[0];
        state.tests = parts[1];
        renderSharedFields();
        populateProducts();
        populatePresets();

        var handles = Object.keys(state.bundle.by_handle || {});
        state.handle = handles[0] || '';
        if (els.product && state.handle) els.product.value = state.handle;

        readShareUrl();

        var garmentType = window.MarameSizeFinderLabAdapter.getProfileGarmentType(getGuide(state.handle));
        renderCategoryFields(garmentType);
        renderProfileSummary(state.handle);
        renderSizeChartTable(state.handle);
        renderProfileOverrides(state.handle);
        renderFeedbackLog();
        renderUsualSizeOptions(readFormInputs().region || 'UK');
        bindEvents();
        setStatus('Ready — pick a product, enter customer details, or load an example test case.');
      })
      .catch(function () {
        setStatus('Could not load size data. Use a local server (see preview/size-finder-lab.html).', true);
      });
  }

  init();
})();
