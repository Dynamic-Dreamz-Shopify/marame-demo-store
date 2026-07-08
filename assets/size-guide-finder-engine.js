/**
 * MARAME Find Your Size — recommendation engine v2.
 * Compares customer body measurements to garment chart rows (flat → circumference).
 * See docs/SIZE-FINDER-ALGORITHM.md for full specification.
 */
(function (global) {
  'use strict';

  var ENGINE_VERSION = 2;

  var FIT_EASE_DELTA = { close: -4, regular: 0, relaxed: 4, oversized: 8 };

  var GARMENT_RULES = {
    tops: [
      { field: 'bust', rows: ['chest', 'upper chest'], circumference: true, weight: 1.0, baseEase: 8 },
      { field: 'waist', rows: ['hem width', 'waist'], circumference: true, weight: 0.45, baseEase: 6 }
    ],
    outerwear: [
      { field: 'bust', rows: ['chest'], circumference: true, weight: 1.0, baseEase: 10 },
      { field: 'waist', rows: ['waist', 'hem width'], circumference: true, weight: 0.55, baseEase: 8 }
    ],
    trousers: [
      { field: 'waist', rows: ['waist'], circumference: true, weight: 1.0, baseEase: 2 },
      { field: 'hip', rows: ['hip', 'thigh'], circumference: true, weight: 0.75, baseEase: 6 },
      {
        field: 'inside_leg',
        rows: ['inseam'],
        circumference: false,
        weight: 0.9,
        baseEase: 0,
        length: true
      }
    ],
    dresses: [
      { field: 'bust', rows: ['chest'], circumference: true, weight: 0.95, baseEase: 8 },
      { field: 'waist', rows: ['waist'], circumference: true, weight: 0.9, baseEase: 6 },
      { field: 'hip', rows: ['hip', 'hem'], circumference: true, weight: 0.7, baseEase: 8 }
    ],
    shoes: [{ field: 'foot_length', rows: ['foot', 'length'], circumference: false, weight: 1.0, baseEase: 0 }]
  };

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function normalizeGarmentType(type) {
    var t = String(type || '').toLowerCase().trim();
    if (GARMENT_RULES[t]) return t;
    if (t.indexOf('shoe') !== -1) return 'shoes';
    if (t.indexOf('trouser') !== -1 || t.indexOf('pant') !== -1 || t.indexOf('short') !== -1) return 'trousers';
    if (t.indexOf('dress') !== -1 || t.indexOf('jumpsuit') !== -1 || t.indexOf('skirt') !== -1) return 'dresses';
    if (t.indexOf('jacket') !== -1 || t.indexOf('coat') !== -1 || t.indexOf('blazer') !== -1) return 'outerwear';
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
    return sizes.findIndex(function (s) {
      return String(s).toLowerCase() === str.toLowerCase();
    });
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

  function getGarmentCm(rows, rule, sizeIndex) {
    var row = getMeasurementRow(rows, rule.rows);
    if (!row) return null;
    var values = row.values || [];
    var cell = values[sizeIndex];
    if (!cell) return null;
    if (cell.cm != null) return Number(cell.cm);
    if (cell.in != null) return Number(cell.in) * 2.54;
    return null;
  }

  function easeForRule(rule, fit, finder) {
    var fitKey = fit || 'regular';
    var delta = FIT_EASE_DELTA[fitKey] != null ? FIT_EASE_DELTA[fitKey] : 0;
    var overrideKey = 'ease_' + rule.field;
    var override = finder && finder[overrideKey] != null ? Number(finder[overrideKey]) : null;
    var base = override != null && !Number.isNaN(override) ? override : rule.baseEase;
    return base + delta;
  }

  function estimateInsideLeg(heightCm, weightKg, legPref) {
    var h = Number(heightCm);
    if (!h || Number.isNaN(h)) return null;
    var leg = h * 0.47;
    if (legPref === 'petite') leg -= 3;
    if (legPref === 'long') leg += 3;
    var w = Number(weightKg);
    if (w && !Number.isNaN(w) && w > 75) leg += 1;
    return Math.round(leg * 10) / 10;
  }

  function smallestSizeIndex(rows, rule, bodyCm, fit, sizeCount, finder) {
    var ease = easeForRule(rule, fit, finder);
    for (var i = 0; i < sizeCount; i++) {
      var garment = getGarmentCm(rows, rule, i);
      if (garment == null) continue;
      var capacity = rule.circumference ? garment * 2 : garment;
      if (rule.length) {
        if (capacity >= bodyCm - ease) return i;
      } else if (capacity >= bodyCm + ease) {
        return i;
      }
    }
    return sizeCount - 1;
  }

  function largestComfortableSizeIndex(rows, rule, bodyCm, fit, sizeCount, finder) {
    var ease = easeForRule(rule, fit, finder);
    var excessAllowance = rule.circumference ? 14 : 8;
    for (var i = sizeCount - 1; i >= 0; i--) {
      var garment = getGarmentCm(rows, rule, i);
      if (garment == null) continue;
      var capacity = rule.circumference ? garment * 2 : garment;
      var minNeeded = rule.length ? bodyCm - ease - 4 : bodyCm + ease;
      var maxNeeded = minNeeded + excessAllowance;
      if (capacity >= minNeeded && capacity <= maxNeeded) return i;
    }
    return -1;
  }

  function lengthTolerance(finder) {
    var profile = (finder && finder.lengthProfile) || 'regular';
    if (profile === 'cropped') return { short: 6, long: 2 };
    if (profile === 'long') return { short: 2, long: 8 };
    return { short: 4, long: 4 };
  }

  function lengthSizeIndex(rows, targetInseam, fit, sizeCount, finder) {
    var rule = { rows: ['inseam'], circumference: false };
    var tol = lengthTolerance(finder);
    var best = -1;
    var bestDiff = Infinity;

    for (var i = 0; i < sizeCount; i++) {
      var inseam = getGarmentCm(rows, rule, i);
      if (inseam == null) continue;
      var diff = inseam - targetInseam;
      if (diff < -tol.short) continue;
      var score = Math.abs(diff);
      if (score < bestDiff) {
        bestDiff = score;
        best = i;
      }
    }

    if (best === -1) {
      for (var j = 0; j < sizeCount; j++) {
        var inCm = getGarmentCm(rows, rule, j);
        if (inCm == null) continue;
        if (inCm >= targetInseam - tol.short) return j;
      }
      return sizeCount - 1;
    }

    return best;
  }

  function weightedIndex(signals) {
    var total = 0;
    var sum = 0;
    signals.forEach(function (s) {
      total += s.weight;
      sum += s.idx * s.weight;
    });
    if (!total) return 0;
    return sum / total;
  }

  function formatReason(rule, minIdx, maxIdx, usualIdx, bodyCm, estimated) {
    var label = rule.field.replace(/_/g, ' ');
    if (minIdx > usualIdx) {
      return (
        'Your ' +
        label +
        (estimated ? ' (estimated from height)' : '') +
        ' of ' +
        bodyCm +
        'cm needs more room than your usual size in this chart — we adjusted up.'
      );
    }
    if (maxIdx !== -1 && maxIdx < usualIdx) {
      return (
        'Your ' +
        label +
        ' of ' +
        bodyCm +
        'cm fits a smaller garment spec comfortably — we adjusted down.'
      );
    }
    return null;
  }

  function recommend(data, answers) {
    var mapping = data.regionSizeMapping || data.region_size_mapping || {};
    var regions = mapping.regions || mapping;
    var displayRegion = (data.defaultRegion || data.default_region || mapping.default_region || 'UK').toUpperCase();
    var customerRegion = (answers.region || displayRegion).toUpperCase();
    var customerSizes = getRegionSizes(regions, customerRegion);
    var displaySizes = getRegionSizes(regions, displayRegion);
    var usualIdx = findSizeIndex(customerSizes, answers.usual_size);
    var finder = data.finder || {};
    var garmentType = normalizeGarmentType(data.garmentType || data.garment_type);
    var rows = data.measurementRows || data.measurement_rows || [];
    var sizeCount = displaySizes.length;
    var reasons = [];
    var signals = [];
    var debug = { version: ENGINE_VERSION, signals: [], garmentType: garmentType };

    if (usualIdx === -1 || !sizeCount) {
      return {
        ok: false,
        confidence: 'low',
        message: 'We need a little more information to recommend your size confidently.',
        advice: 'Check your usual size and region, or use the size chart for guidance.',
        reasons: reasons,
        debug: debug
      };
    }

    signals.push({ idx: usualIdx, weight: 1.25, source: 'usual_size' });
    debug.signals.push({ source: 'usual_size', index: usualIdx, weight: 1.25 });

    var rules = GARMENT_RULES[garmentType] || GARMENT_RULES.tops;

    rules.forEach(function (rule) {
      var bodyCm = answers[rule.field] ? Number(answers[rule.field]) : null;
      var estimated = false;

      if ((bodyCm == null || Number.isNaN(bodyCm)) && rule.field === 'inside_leg' && answers.height) {
        bodyCm = estimateInsideLeg(answers.height, answers.weight, answers.leg_length);
        estimated = bodyCm != null;
        if (estimated) {
          reasons.push('Inside leg estimated at ~' + bodyCm + 'cm from your height.');
        }
      }

      if (bodyCm == null || Number.isNaN(bodyCm)) return;

      if (rule.length) {
        var lenIdx = lengthSizeIndex(rows, bodyCm, answers.fit, sizeCount, finder);
        signals.push({ idx: lenIdx, weight: rule.weight, source: rule.field });
        debug.signals.push({ source: rule.field, index: lenIdx, weight: rule.weight, length: true });
        if (lenIdx > usualIdx) {
          reasons.push(
            'For leg length, this style\'s inseam at larger sizes suits your height better — we sized up.'
          );
        } else if (lenIdx < usualIdx) {
          reasons.push('Your leg length suits a smaller size on this style\'s inseam chart.');
        }
        return;
      }

      var minIdx = smallestSizeIndex(rows, rule, bodyCm, answers.fit, sizeCount, finder);
      var maxIdx = largestComfortableSizeIndex(rows, rule, bodyCm, answers.fit, sizeCount, finder);

      signals.push({ idx: minIdx, weight: rule.weight, source: rule.field + '_min' });
      debug.signals.push({ source: rule.field + '_min', index: minIdx, weight: rule.weight });

      if (maxIdx !== -1 && maxIdx < usualIdx) {
        signals.push({ idx: maxIdx, weight: rule.weight * 0.65, source: rule.field + '_max' });
        debug.signals.push({ source: rule.field + '_max', index: maxIdx, weight: rule.weight * 0.65 });
      }

      var reasonText = formatReason(rule, minIdx, maxIdx, usualIdx, bodyCm, estimated);
      if (reasonText) reasons.push(reasonText);
    });

    var blended = weightedIndex(signals);
    debug.blendedIndex = blended;

    var adjustment = 0;
    var fitMap = { close: -0.6, regular: 0, relaxed: 0.6, oversized: 1.2 };
    adjustment += fitMap[answers.fit] || 0;
    if (finder.runsLargeSmall === 'runs_small') adjustment += 0.75;
    if (finder.runsLargeSmall === 'runs_large') adjustment -= 0.75;
    adjustment += Number(finder.recommendationAdjustment) || 0;
    debug.fitAdjustment = adjustment;

    var rawIdx = blended + adjustment;
    debug.rawIndex = rawIdx;

    var recommendedIdx = clamp(Math.round(rawIdx), 0, sizeCount - 1);
    var secondaryIdx = null;

    if (Math.abs(rawIdx - recommendedIdx) >= 0.35) {
      secondaryIdx = clamp(Math.round(rawIdx + (rawIdx > recommendedIdx ? 1 : -1)), 0, sizeCount - 1);
    } else {
      var spread = signals.map(function (s) {
        return s.idx;
      });
      var minS = Math.min.apply(null, spread);
      var maxS = Math.max.apply(null, spread);
      if (maxS - minS >= 1) {
        secondaryIdx = minS + maxS - recommendedIdx;
        secondaryIdx = clamp(secondaryIdx, 0, sizeCount - 1);
      }
    }

    if (secondaryIdx === recommendedIdx) secondaryIdx = null;

    var measurementSignals = signals.filter(function (s) {
      return s.source !== 'usual_size';
    }).length;
    var confidence = 'medium';
    if (measurementSignals >= 2) confidence = 'high';
    else if (!measurementSignals) confidence = 'low';
    if (Math.abs(usualIdx - recommendedIdx) >= 2) confidence = 'medium';

    var recommended = displaySizes[recommendedIdx];
    var secondary = secondaryIdx != null ? displaySizes[secondaryIdx] : null;
    var fitLabel = answers.fit || 'regular';
    var explanation =
      'We started from your usual ' +
      customerRegion +
      ' ' +
      answers.usual_size +
      ', compared your measurements to this garment\'s size chart, and allowed for a ' +
      fitLabel +
      ' fit.';

    var advice = 'Use the size chart to double-check garment measurements.';
    if (secondary) {
      advice =
        'You are between sizes. Size ' +
        recommended +
        ' is our first choice; size ' +
        secondary +
        ' is worth trying if you prefer a ' +
        (recommendedIdx < secondaryIdx ? 'roomier' : 'neater') +
        ' fit.';
    } else if (recommendedIdx > usualIdx) {
      advice = 'Your measurements suggest sizing up from your usual size for the best fit in this style.';
    } else if (recommendedIdx < usualIdx) {
      advice = 'Your measurements suggest you may prefer sizing down for a neater fit in this style.';
    }

    if (finder.runsLargeSmall === 'runs_small') advice += ' This style runs slightly small.';
    if (finder.runsLargeSmall === 'runs_large') advice += ' This style runs slightly large.';

    return {
      ok: true,
      recommended: recommended,
      secondary: secondary,
      confidence: confidence,
      explanation: explanation,
      advice: advice,
      reasons: reasons,
      displayRegion: displayRegion,
      debug: debug
    };
  }

  global.MarameSizeFinderEngine = {
    version: ENGINE_VERSION,
    recommend: recommend,
    estimateInsideLeg: estimateInsideLeg
  };
})(window);
