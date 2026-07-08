/**
 * MARAME Find Your Size — recommendation engine v3.
 * Profile-driven logic: bra→bust, upper chest, combined sizes, Maya two-size, shoulder nudges.
 * See docs/marame_find_your_size_v3_cursor_spec.md
 */
(function (global) {
  'use strict';

  var ENGINE_VERSION = 3;
  var USUAL_SIZE_WEIGHT = 0.6;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function getRegionSizes(regions, regionKey) {
    var entry = regions && regions[regionKey];
    if (!entry) return [];
    if (Array.isArray(entry)) return entry;
    return entry.sizes || [];
  }

  function findSizeIndex(sizes, value) {
    if (value == null || value === '' || !sizes.length) return -1;
    var str = String(value).trim();
    var idx = sizes.indexOf(str);
    if (idx !== -1) return idx;
    return sizes.findIndex(function (s) {
      return String(s).toLowerCase() === str.toLowerCase();
    });
  }

  function getMeasurementRow(rows, names, opts) {
    opts = opts || {};
    var list = Array.isArray(names) ? names : [names];
    return (rows || []).find(function (row) {
      var name = (row.name || '').toLowerCase().trim();
      return list.some(function (n) {
        var needle = String(n).toLowerCase();
        if (needle === 'chest' && opts.chestOnly) {
          return name === 'chest' || (name.indexOf('chest') !== -1 && name.indexOf('upper') === -1);
        }
        if (needle === 'upper chest' || opts.upperChestOnly) {
          return name.indexOf('upper') !== -1 && name.indexOf('chest') !== -1;
        }
        return name.indexOf(needle) !== -1;
      });
    });
  }

  function getRowCm(rows, names, sizeIndex, opts) {
    var row = getMeasurementRow(rows, names, opts);
    if (!row) return null;
    var cell = (row.values || [])[sizeIndex];
    if (!cell) return null;
    if (cell.cm != null) return Number(cell.cm);
    if (cell.in != null) return Number(cell.in) * 2.54;
    return null;
  }

  function hasChartRow(profile, rowName) {
    var rows = profile.available_chart_rows || [];
    var target = String(rowName).toUpperCase();
    return rows.some(function (r) {
      var row = String(r).toUpperCase();
      if (target === 'SHOULDER') {
        return row.indexOf('SHOULDER TO SHOULDER') !== -1 || row === 'SHOULDER TO SHOULDER';
      }
      return row.indexOf(target) !== -1;
    });
  }

  function parseBraSize(value) {
    var str = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!str) return null;
    var match = str.match(/^(\d{2,3})([A-Z]+)$/);
    if (!match) return null;
    return { band: match[1], cup: match[2], bandCm: Number(match[1]) * 2.54 };
  }

  function braToBustCm(braSize, braConversion) {
    var parsed = parseBraSize(braSize);
    if (!parsed || !braConversion) return null;
    var table = (braConversion.common_band_table_cm || {})[parsed.band];
    if (table && table[parsed.cup] != null) return Number(table[parsed.cup]);
    var cupIncrements = braConversion.cup_increment_inches || {};
    var cupIn = cupIncrements[parsed.cup];
    if (cupIn == null) return null;
    return Math.round((Number(parsed.band) + cupIn) * 2.54 * 10) / 10;
  }

  function normalizeCustomer(answers, braConversion) {
    var fit = answers.fit || answers.fit_preference || 'regular';
    var customer = {
      region: (answers.region || 'UK').toUpperCase(),
      usualSize: answers.usual_size || answers.usualSize || '',
      heightCm: answers.height != null ? Number(answers.height) : answers.height_cm != null ? Number(answers.height_cm) : null,
      fit: fit,
      braSize: answers.bra_size || answers.bra || null,
      bustCm: answers.bust != null ? Number(answers.bust) : answers.bust_cm != null ? Number(answers.bust_cm) : null,
      waistCm: answers.waist != null ? Number(answers.waist) : answers.waist_cm != null ? Number(answers.waist_cm) : null,
      hipCm: answers.hip != null ? Number(answers.hip) : answers.hip_cm != null ? Number(answers.hip_cm) : null,
      insideLegCm: answers.inside_leg != null ? Number(answers.inside_leg) : answers.inside_leg_cm != null ? Number(answers.inside_leg_cm) : null,
      shoulderProfile: answers.shoulder_profile || answers.shoulderProfile || null,
      waistFit: answers.waist_fit || null,
      hipFit: answers.hip_fit || null,
      trouserLengthIssue: answers.trouser_length_issue || null,
      legLength: answers.leg_length || null
    };

    var braInfo = null;
    if (customer.braSize) {
      braInfo = {
        braSize: customer.braSize,
        estimatedBustCm: braToBustCm(customer.braSize, braConversion),
        parsed: parseBraSize(customer.braSize)
      };
    }

    var bustFromBra = braInfo && braInfo.estimatedBustCm != null ? braInfo.estimatedBustCm : null;
    var bustSource = null;
    var bustSourceLabel = null;

    if (customer.bustCm != null && !Number.isNaN(customer.bustCm) && bustFromBra != null) {
      bustSource = Math.max(customer.bustCm, bustFromBra);
      bustSourceLabel = bustSource === customer.bustCm ? 'bust_cm' : 'bra_size';
      if (customer.bustCm !== bustFromBra && bustFromBra > customer.bustCm) bustSourceLabel = 'bra_size';
    } else if (customer.bustCm != null && !Number.isNaN(customer.bustCm)) {
      bustSource = customer.bustCm;
      bustSourceLabel = 'bust_cm';
    } else if (bustFromBra != null) {
      bustSource = bustFromBra;
      bustSourceLabel = 'bra_size';
    }

    customer.bustSource = bustSource;
    customer.bustSourceLabel = bustSourceLabel;
    customer.braInfo = braInfo;
    return customer;
  }

  function getDefaultBustEase(profile) {
    if (profile.ease_overrides && profile.ease_overrides.bust != null) {
      return Number(profile.ease_overrides.bust);
    }
    if (profile.fit_type === 'close') return 3;
    if (profile.garment_type === 'outerwear' || profile.fit_type === 'structured') return 12;
    if (profile.fit_type === 'relaxed' || profile.fit_type === 'oversized') return 10;
    return 8;
  }

  function getFitEaseDelta(fit, profile) {
    if (profile.fit_type === 'oversized' || profile.garment_type === 'cover_up') {
      return { close: -4, regular: 0, relaxed: 2, oversized: 0 }[fit] || 0;
    }
    return { close: -3, regular: 0, relaxed: 2, oversized: 4 }[fit] || 0;
  }

  function getBustEase(profile, fit) {
    return getDefaultBustEase(profile) + getFitEaseDelta(fit, profile);
  }

  function smallestCircumferenceIndex(rows, rowNames, requiredCircumference, sizeCount, opts) {
    for (var i = 0; i < sizeCount; i++) {
      var flat = getRowCm(rows, rowNames, i, opts);
      if (flat != null && flat * 2 >= requiredCircumference) return i;
    }
    return sizeCount - 1;
  }

  function resolveChestIndex(profile, rows, customer, sizeCount, debug) {
    if (!customer.bustSource) return null;

    var ease = getBustEase(profile, customer.fit);
    var required = customer.bustSource + ease;
    var chestIdx = smallestCircumferenceIndex(rows, ['chest'], required, sizeCount, { chestOnly: true });

    debug.steps.push({
      type: 'chest',
      bustSource: customer.bustSource,
      ease: ease,
      requiredCircumference: required,
      index: chestIdx
    });

    if (!profile.upper_chest_check) return chestIdx;

    var bandCm = customer.braInfo && customer.braInfo.parsed ? customer.braInfo.parsed.bandCm : null;
    if (bandCm == null && customer.bustCm) bandCm = customer.bustCm / 2.54;
    var upperBody = Math.min(customer.bustSource - 8, (bandCm || 0) + 4);
    var upperIdx = smallestCircumferenceIndex(rows, ['upper chest'], upperBody, sizeCount, { upperChestOnly: true });

    debug.steps.push({
      type: 'upper_chest',
      upperBodyCircumference: upperBody,
      index: upperIdx
    });

    return Math.max(chestIdx, upperIdx);
  }

  function resolveWaistIndex(profile, rows, customer, sizeCount, debug) {
    if (customer.waistCm == null || Number.isNaN(customer.waistCm)) return null;
    var ease = profile.ease_overrides && profile.ease_overrides.waist != null ? Number(profile.ease_overrides.waist) : 2;
    if (customer.waistFit === 'tight') ease += 2;
    if (customer.waistFit === 'loose') ease -= 1;
    var required = customer.waistCm + ease;
    var idx = smallestCircumferenceIndex(rows, ['waist'], required, sizeCount);
    debug.steps.push({ type: 'waist', requiredCircumference: required, index: idx });
    return idx;
  }

  function resolveHipIndex(profile, rows, customer, sizeCount, debug) {
    if (customer.hipCm == null || Number.isNaN(customer.hipCm)) return null;
    if (!hasChartRow(profile, 'HIP') && !hasChartRow(profile, 'THIGH')) return null;
    var ease = 6;
    if (profile.ease_overrides) {
      if (profile.ease_overrides.hip != null) ease = Number(profile.ease_overrides.hip);
      else if (profile.ease_overrides.hips != null) ease = Number(profile.ease_overrides.hips);
    }
    if (profile.garment_type === 'dress' || profile.garment_type === 'jumpsuit') ease = 8;
    if (customer.hipFit === 'yes' || customer.hipFit === 'sometimes') ease += 2;
    var required = customer.hipCm + ease;
    var idx = smallestCircumferenceIndex(rows, ['hip', 'thigh'], required, sizeCount);
    debug.steps.push({ type: 'hip', requiredCircumference: required, index: idx });
    return idx;
  }

  function usesCombinedSizes(profile) {
    var tags = (profile.hard_warnings || []).concat(profile.size_up_if || []);
    return tags.some(function (t) {
      return String(t).indexOf('combined') !== -1;
    });
  }

  function isMayaProduct(profile, mayaRules) {
    return profile.handle === (mayaRules && mayaRules.product_handle);
  }

  function recommendMaya(profile, customer, displaySizes, mayaRules, debug) {
    var fit = customer.fit || 'regular';
    var thresholds = (mayaRules.chest_thresholds_cm || {})[fit] || mayaRules.chest_thresholds_cm.regular;
    var coverEase = { close: 6, regular: 10, relaxed: 14, oversized: 14 };
    var bustSource = customer.bustSource || 0;
    var usualUk = parseInt(String(customer.usualSize).replace(/\D/g, ''), 10);
    if (Number.isNaN(usualUk)) usualUk = 12;

    var recommended = (mayaRules.usual_uk_mapping || {})[String(usualUk)] || 'S/M';
    var tags = ['two_size_product'];

    if (usualUk >= 14 || bustSource > thresholds.S_M_max_bust) {
      recommended = 'L/XL';
    } else if (bustSource && bustSource + (coverEase[fit] || 10) > mayaRules.chart_cm['S/M'].chest_circ) {
      recommended = 'L/XL';
    }

    var secondary = recommended === 'S/M' ? 'L/XL' : 'S/M';
    var confidence = 'high';
    if (bustSource > thresholds.L_XL_max_bust) {
      confidence = 'low';
      tags.push('larger_bust');
    }

    debug.steps.push({ type: 'maya', bustSource: bustSource, recommended: recommended });

    return {
      ok: true,
      recommended: recommended,
      secondary: secondary,
      confidence: confidence,
      explanation:
        'This style comes in two flexible sizes. We recommend ' +
        recommended +
        ' based on your usual size and the chest measurement of this cover-up.',
      advice:
        'Choose ' +
        secondary +
        ' if you prefer a ' +
        (recommended === 'S/M' ? 'roomier' : 'more fitted') +
        ' cover-up silhouette.',
      reasons: customer.bustSourceLabel === 'bra_size' ? ['We used your bra size to estimate bust room for this cover-up.'] : [],
      tags: tags,
      debug: debug
    };
  }

  function recommendCombined(profile, rows, customer, displaySizes, v3Config, debug) {
    var mapping = v3Config.combined_size_mapping_uk || {};
    var usualKey = String(customer.usualSize).replace(/\D/g, '');
    var mappedBucket = mapping[usualKey] || displaySizes[Math.min(1, displaySizes.length - 1)];
    var mappedIdx = findSizeIndex(displaySizes, mappedBucket);
    if (mappedIdx === -1) mappedIdx = 0;

    var critIndices = [];
    var waistIdx = resolveWaistIndex(profile, rows, customer, displaySizes.length, debug);
    var hipIdx = resolveHipIndex(profile, rows, customer, displaySizes.length, debug);
    if (waistIdx != null) critIndices.push(waistIdx);
    if (hipIdx != null) critIndices.push(hipIdx);

    var measurementIdx = critIndices.length ? Math.max.apply(null, critIndices) : mappedIdx;
    var recommendedIdx = mappedIdx;
    var secondaryIdx = null;

    if (measurementIdx > mappedIdx) {
      secondaryIdx = measurementIdx;
    } else if (customer.trouserLengthIssue === 'too_short' && mappedIdx < displaySizes.length - 1) {
      secondaryIdx = mappedIdx + 1;
    } else if (measurementIdx < mappedIdx) {
      recommendedIdx = mappedIdx;
    }

    if (customer.trouserLengthIssue === 'too_short' && secondaryIdx == null && mappedIdx < displaySizes.length - 1) {
      secondaryIdx = mappedIdx + 1;
    }

    var confidence = critIndices.length >= 2 ? 'medium' : 'medium';
    if (secondaryIdx != null && secondaryIdx !== recommendedIdx) confidence = 'medium';

    return {
      recommendedIdx: recommendedIdx,
      secondaryIdx: secondaryIdx !== recommendedIdx ? secondaryIdx : null,
      confidence: confidence,
      tags: ['combined_sizes'],
      explanation:
        'This product uses combined sizes. Your usual UK ' +
        customer.usualSize +
        ' maps to ' +
        displaySizes[recommendedIdx] +
        ', and we checked your measurements against that size bucket.'
    };
  }

  function pickSecondary(recommendedIdx, usualIdx, criticalIdx, sizeCount) {
    if (recommendedIdx > usualIdx && recommendedIdx > 0) {
      return recommendedIdx - 1;
    }
    if (recommendedIdx < usualIdx && recommendedIdx < sizeCount - 1) {
      return recommendedIdx + 1;
    }
    if (criticalIdx != null && criticalIdx > recommendedIdx && recommendedIdx < sizeCount - 1) {
      return recommendedIdx + 1;
    }
    if (recommendedIdx > 0 && recommendedIdx < sizeCount - 1) {
      return recommendedIdx + 1;
    }
    if (recommendedIdx > 0) {
      return recommendedIdx - 1;
    }
    return null;
  }

  function applyShoulderNudge(recommendedIdx, secondaryIdx, customer, profile, sizeCount, reasons, tags, debug) {
    if (!customer.shoulderProfile || customer.shoulderProfile === 'regular') return { recommendedIdx: recommendedIdx, secondaryIdx: secondaryIdx };
    if (!profile.shoulder_fit_rule) return { recommendedIdx: recommendedIdx, secondaryIdx: secondaryIdx };

    var rule = profile.shoulder_fit_rule[customer.shoulderProfile];
    if (!rule || rule === 'no_change') return { recommendedIdx: recommendedIdx, secondaryIdx: secondaryIdx };

    var isBetween = secondaryIdx != null || Math.abs(recommendedIdx - findSizeIndex([], '')) >= 0;
    var hasShoulderRow = hasChartRow(profile, 'SHOULDER');

    if (hasShoulderRow) {
      tags.push(customer.shoulderProfile === 'broad' ? 'broad_shoulders' : 'narrow_shoulders');
      return { recommendedIdx: recommendedIdx, secondaryIdx: secondaryIdx };
    }

    var betweenSizes = secondaryIdx != null;
    if (!betweenSizes) return { recommendedIdx: recommendedIdx, secondaryIdx: secondaryIdx };

    if (rule === 'size_up' && recommendedIdx < sizeCount - 1) {
      recommendedIdx += 1;
      reasons.push(
        'You described your shoulders as ' +
          customer.shoulderProfile +
          '. For this style, MARAME recommends a little more room through the shoulder line.'
      );
      tags.push(customer.shoulderProfile === 'broad' ? 'broad_shoulders' : 'narrow_shoulders');
      debug.steps.push({ type: 'shoulder_nudge', action: 'size_up', index: recommendedIdx });
    } else if (rule === 'size_down' && recommendedIdx > 0) {
      recommendedIdx -= 1;
      reasons.push(
        'You described your shoulders as ' +
          customer.shoulderProfile +
          '. This style is designed to sit better with a slightly neater shoulder line.'
      );
      tags.push('narrow_shoulders');
      debug.steps.push({ type: 'shoulder_nudge', action: 'size_down', index: recommendedIdx });
    }

    return { recommendedIdx: recommendedIdx, secondaryIdx: secondaryIdx };
  }

  function computeConfidence(profile, customer, criticalIdx, usualIdx, recommendedIdx, hasBodyData, tags) {
    if (!hasBodyData) return 'low';
    if (tags.indexOf('no_hip_row') !== -1) return 'medium';
    if (Math.abs(usualIdx - recommendedIdx) >= 2 && criticalIdx != null && criticalIdx > usualIdx) return 'high';
    if (customer.bustSourceLabel === 'bra_size' && !customer.bustCm) {
      if (Math.abs(usualIdx - recommendedIdx) >= 2) return 'medium';
      return 'high';
    }
    if (profile.fit_type === 'close' && Math.abs(usualIdx - recommendedIdx) >= 1) return 'medium';
    if (criticalIdx != null && hasBodyData) return 'high';
    return 'medium';
  }

  function recommend(data, answers, options) {
    options = options || {};
    var profile = Object.assign({}, (data.finder && data.finder.profile) || {}, options.profileOverrides || {});
    var v3Config = options.finderV3 || data.finder_v3 || {};
    var braConversion = v3Config.bra_conversion || {};
    var mayaRules = v3Config.maya_beach_dress_rules || {};
    var customer = normalizeCustomer(answers, braConversion);

    var mapping = data.regionSizeMapping || data.region_size_mapping || {};
    var regions = mapping.regions || mapping;
    var displayRegion = (data.defaultRegion || data.default_region || mapping.default_region || 'UK').toUpperCase();
    var displaySizes = getRegionSizes(regions, displayRegion);
    var customerSizes = getRegionSizes(regions, customer.region);
    var rows = data.measurementRows || data.measurement_rows || [];
    var sizeCount = displaySizes.length;
    var reasons = [];
    var tags = [];
    var debug = { version: ENGINE_VERSION, steps: [], profile: profile.handle };

    if (!sizeCount) {
      return {
        ok: false,
        confidence: 'low',
        message: 'We need your usual size in this region to recommend confidently.',
        advice: 'Check your usual size and region, or use the size chart.',
        reasons: [],
        debug: debug
      };
    }

    if (isMayaProduct(profile, mayaRules)) {
      return recommendMaya(profile, customer, displaySizes, mayaRules, debug);
    }

    var usualIdx = findSizeIndex(displaySizes, customer.usualSize);
    if (usualIdx === -1) {
      var ukNum = String(customer.usualSize).replace(/\D/g, '');
      var combinedMap = v3Config.combined_size_mapping_uk || {};
      if (combinedMap[ukNum]) {
        usualIdx = findSizeIndex(displaySizes, combinedMap[ukNum]);
      }
    }
    if (usualIdx === -1) usualIdx = findSizeIndex(customerSizes, customer.usualSize);

    if (usualIdx === -1 && !usesCombinedSizes(profile)) {
      return {
        ok: false,
        confidence: 'low',
        message: 'We need your usual size in this region to recommend confidently.',
        advice: 'Check your usual size and region, or use the size chart.',
        reasons: [],
        debug: debug
      };
    }
    if (usualIdx === -1) usualIdx = 0;

    if (usesCombinedSizes(profile)) {
      var combined = recommendCombined(profile, rows, customer, displaySizes, v3Config, debug);
      return {
        ok: true,
        recommended: displaySizes[combined.recommendedIdx],
        secondary: combined.secondaryIdx != null ? displaySizes[combined.secondaryIdx] : null,
        confidence: combined.confidence,
        explanation: combined.explanation,
        advice: combined.secondaryIdx != null
          ? 'You are between size buckets. Size ' +
            displaySizes[combined.recommendedIdx] +
            ' is our first choice; ' +
            displaySizes[combined.secondaryIdx] +
            ' is worth trying for more room or length.'
          : 'Use the size chart to double-check garment measurements.',
        reasons: reasons,
        tags: combined.tags,
        debug: debug
      };
    }

    var criticalIndices = [];
    var garmentType = profile.garment_type || data.garmentType || 'top';
    var priorities = profile.priority_measurements || [];

    if (priorities.indexOf('bust') !== -1 || ['top', 'outerwear', 'dress', 'cover_up'].indexOf(garmentType) !== -1) {
      var chestIdx = resolveChestIndex(profile, rows, customer, sizeCount, debug);
      if (chestIdx != null) criticalIndices.push(chestIdx);
    }
    if (priorities.indexOf('waist') !== -1 || garmentType === 'trouser' || garmentType === 'short' || garmentType === 'skirt' || garmentType === 'jumpsuit' || garmentType === 'dress') {
      var wIdx = resolveWaistIndex(profile, rows, customer, sizeCount, debug);
      if (wIdx != null) criticalIndices.push(wIdx);
    }
    if (priorities.indexOf('hip') !== -1 || priorities.indexOf('hips') !== -1 || garmentType === 'trouser' || garmentType === 'short' || garmentType === 'jumpsuit' || garmentType === 'dress' || garmentType === 'skirt') {
      if (hasChartRow(profile, 'HIP') || getMeasurementRow(rows, ['hip'])) {
        var hIdx = resolveHipIndex(profile, rows, customer, sizeCount, debug);
        if (hIdx != null) {
          criticalIndices.push(hIdx);
          if (profile.garment_type === 'short' && customer.hipCm != null) {
            var hipEaseVal =
              profile.ease_overrides && profile.ease_overrides.hip != null
                ? Number(profile.ease_overrides.hip)
                : 6;
            var requiredHip = customer.hipCm + hipEaseVal;
            var hipFlatAtIdx = getRowCm(rows, ['hip'], hIdx);
            if (hipFlatAtIdx != null && requiredHip > hipFlatAtIdx * 2 - 4 && hIdx < sizeCount - 1) {
              criticalIndices.push(hIdx + 1);
              debug.steps.push({ type: 'hip_room_bump', index: hIdx + 1 });
            }
          }
        }
      } else if (customer.hipCm != null) {
        tags.push('no_hip_row');
        reasons.push('This style has no hip measurement on the chart, so we focused on waist fit.');
      }
    }

    var criticalIdx = criticalIndices.length ? Math.max.apply(null, criticalIndices) : null;
    var hasBodyData = criticalIdx != null;

    var recommendedIdx = usualIdx;
    if (criticalIdx != null) {
      if (criticalIdx > usualIdx) {
        recommendedIdx = criticalIdx;
        if (customer.bustSourceLabel === 'bra_size' && criticalIdx > usualIdx) {
          tags.push('larger_bust');
          reasons.push('Your bra size suggests you may need more room through the chest than your usual size in this style.');
        }
      } else if (criticalIdx < usualIdx) {
        if (customer.fit === 'close') {
          recommendedIdx = Math.max(criticalIdx, usualIdx - 1);
        } else {
          recommendedIdx = usualIdx;
        }
      }
    }

    if (profile.runs_large_small === 'runs_small') recommendedIdx = clamp(recommendedIdx + 1, 0, sizeCount - 1);
    if (profile.runs_large_small === 'runs_large') recommendedIdx = clamp(recommendedIdx - 1, 0, sizeCount - 1);
    recommendedIdx = clamp(recommendedIdx + (Number(profile.recommendation_adjustment) || 0), 0, sizeCount - 1);

    var secondaryIdx = pickSecondary(recommendedIdx, usualIdx, criticalIdx != null ? criticalIdx : usualIdx, sizeCount);

    if (customer.shoulderProfile === 'broad' && secondaryIdx == null && recommendedIdx < sizeCount - 1) {
      secondaryIdx = recommendedIdx + 1;
    }

    if (
      customer.shoulderProfile === 'broad' &&
      profile.shoulder_fit_rule &&
      profile.shoulder_fit_rule.broad === 'size_up' &&
      !hasChartRow(profile, 'SHOULDER') &&
      recommendedIdx < sizeCount - 1 &&
      criticalIdx != null &&
      recommendedIdx >= criticalIdx
    ) {
      secondaryIdx = recommendedIdx;
      recommendedIdx += 1;
      reasons.push(
        'You described your shoulders as broad. For this structured style, we recommend a little more room through the shoulder line.'
      );
      tags.push('broad_shoulders');
      debug.steps.push({ type: 'shoulder_nudge', action: 'size_up', index: recommendedIdx });
    }

    var shoulderResult = applyShoulderNudge(
      recommendedIdx,
      secondaryIdx,
      customer,
      profile,
      sizeCount,
      reasons,
      tags,
      debug
    );
    recommendedIdx = shoulderResult.recommendedIdx;
    secondaryIdx = shoulderResult.secondaryIdx;

    if (secondaryIdx === recommendedIdx) secondaryIdx = null;

    var confidence = computeConfidence(profile, customer, criticalIdx, usualIdx, recommendedIdx, hasBodyData, tags);
    if (!customer.braSize && !customer.bustCm && ['top', 'outerwear', 'dress', 'cover_up'].indexOf(garmentType) !== -1) {
      confidence = 'low';
      reasons.push('This recommendation is based mainly on your usual size and fit preference.');
    }
    if (profile.fit_type === 'close' && Math.abs(usualIdx - recommendedIdx) >= 1) confidence = 'medium';

    var maxChestIdx = sizeCount - 1;
    if (criticalIdx === maxChestIdx && criticalIndices.length === 1) {
      var maxFlat = getRowCm(rows, ['chest'], maxChestIdx);
      if (maxFlat && customer.bustSource && customer.bustSource + getBustEase(profile, customer.fit) > maxFlat * 2) {
        reasons.push('Your measurements exceed the largest chest on this chart — we recommend the largest available size.');
      }
    }

    var explanation =
      'We compared your answers to this garment\'s size chart and allowed for a ' +
      customer.fit +
      ' fit.';
    if (customer.bustSource && customer.bustCm && customer.braSize) {
      explanation = 'We used the larger of your bust measurement and bra-size estimate to avoid recommending a size that may feel tight through the chest.';
    }

    var advice = 'Use the size chart to double-check garment measurements.';
    if (secondaryIdx != null) {
      advice =
        'You are between sizes. Size ' +
        displaySizes[recommendedIdx] +
        ' is our first choice; size ' +
        displaySizes[secondaryIdx] +
        ' is worth trying if you prefer a ' +
        (secondaryIdx > recommendedIdx ? 'roomier' : 'neater') +
        ' fit.';
    }

    debug.criticalIdx = criticalIdx;
    debug.usualIdx = usualIdx;
    debug.recommendedIdx = recommendedIdx;

    return {
      ok: true,
      recommended: displaySizes[recommendedIdx],
      secondary: secondaryIdx != null ? displaySizes[secondaryIdx] : null,
      confidence: confidence,
      explanation: explanation,
      advice: advice,
      reasons: reasons,
      tags: tags,
      displayRegion: displayRegion,
      debug: debug
    };
  }

  global.MarameSizeFinderEngineV3 = {
    version: ENGINE_VERSION,
    recommend: recommend,
    braToBustCm: braToBustCm,
    normalizeCustomer: normalizeCustomer
  };

  global.MarameSizeFinderEngine = {
    version: ENGINE_VERSION,
    recommend: recommend,
    braToBustCm: braToBustCm
  };
})(window);
