/**
 * MARAME Size Finder Lab — input adapter + chart helpers.
 * Maps v3-style lab / unit-test inputs onto the current storefront engine.
 */
(function (global) {
  'use strict';

  function normalizeGuideData(raw) {
    if (!raw || typeof raw !== 'object') return null;
    var data = Object.assign({}, raw);
    data.measurementRows = raw.measurementRows || raw.measurement_rows || [];
    data.regionSizeMapping = raw.regionSizeMapping || raw.region_size_mapping || {};
    data.availableRegions = raw.availableRegions || raw.available_regions;
    data.defaultRegion = raw.defaultRegion || raw.default_region;
    data.garmentType = raw.garmentType || raw.garment_type;
    if (raw.finder && typeof raw.finder === 'object') {
      data.finder = Object.assign({}, raw.finder);
      if (raw.finder.length_profile && !data.finder.lengthProfile) {
        data.finder.lengthProfile = raw.finder.length_profile;
      }
      if (raw.finder.garmentType && !data.finder.garmentType) {
        data.finder.garmentType = raw.finder.garmentType;
      }
    }
    return data;
  }

  function parseBraSize(value) {
    var str = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!str) return null;
    var match = str.match(/^(\d{2,3})([A-Z]+)$/);
    if (!match) return null;
    return { band: match[1], cup: match[2] };
  }

  function braToBustCm(braSize, braConversion) {
    var parsed = parseBraSize(braSize);
    if (!parsed || !braConversion) return null;

    var table = braConversion.common_band_table_cm || {};
    var bandRow = table[parsed.band];
    if (bandRow && bandRow[parsed.cup] != null) {
      return Number(bandRow[parsed.cup]);
    }

    var cupIncrements = braConversion.cup_increment_inches || {};
    var bandIn = Number(parsed.band);
    var cupIn = cupIncrements[parsed.cup];
    if (!bandIn || cupIn == null) return null;
    return Math.round((bandIn + cupIn) * 2.54 * 10) / 10;
  }

  function pickBustCm(labInputs, braConversion) {
    var bust = labInputs.bust_cm != null && labInputs.bust_cm !== '' ? Number(labInputs.bust_cm) : null;
    var braBust = labInputs.bra_size ? braToBustCm(labInputs.bra_size, braConversion) : null;

    if (bust != null && !Number.isNaN(bust) && braBust != null && !Number.isNaN(braBust)) {
      return { value: Math.max(bust, braBust), source: 'max(bust_cm, bra)' };
    }
    if (bust != null && !Number.isNaN(bust)) {
      return { value: bust, source: 'bust_cm' };
    }
    if (braBust != null && !Number.isNaN(braBust)) {
      return { value: braBust, source: 'bra_size' };
    }
    return { value: null, source: null };
  }

  function labInputsToEngineAnswers(labInputs, braConversion) {
    var answers = {
      region: labInputs.region || 'UK',
      usual_size: labInputs.usual_size || '',
      fit: labInputs.fit_preference || labInputs.fit || 'regular',
      height: labInputs.height_cm != null && labInputs.height_cm !== '' ? Number(labInputs.height_cm) : null,
      weight: labInputs.weight_kg != null && labInputs.weight_kg !== '' ? Number(labInputs.weight_kg) : null
    };

    var bustPick = pickBustCm(labInputs, braConversion);
    if (bustPick.value != null) answers.bust = bustPick.value;

    if (labInputs.waist_cm != null && labInputs.waist_cm !== '') {
      answers.waist = Number(labInputs.waist_cm);
    }
    if (labInputs.hip_cm != null && labInputs.hip_cm !== '') {
      answers.hip = Number(labInputs.hip_cm);
    }
    if (labInputs.inside_leg_cm != null && labInputs.inside_leg_cm !== '') {
      answers.inside_leg = Number(labInputs.inside_leg_cm);
    }
    if (labInputs.leg_length) {
      answers.leg_length = labInputs.leg_length;
    }
    if (labInputs.trouser_length_issue) {
      answers.trouser_length_issue = labInputs.trouser_length_issue;
    }
    if (labInputs.foot_length_cm != null && labInputs.foot_length_cm !== '') {
      answers.foot_length = Number(labInputs.foot_length_cm);
    }
    if (labInputs.foot_width) {
      answers.foot_width = labInputs.foot_width;
    }
    if (labInputs.shoulder_profile) {
      answers.shoulder_profile = labInputs.shoulder_profile;
    }
    if (labInputs.waist_fit) {
      answers.waist_fit = labInputs.waist_fit;
    }
    if (labInputs.hip_fit) {
      answers.hip_fit = labInputs.hip_fit;
    }
    if (labInputs.trouser_length_issue) {
      answers.trouser_length_issue = labInputs.trouser_length_issue;
    }
    if (labInputs.fit_preference) {
      answers.fit_preference = labInputs.fit_preference;
    }

    return {
      answers: answers,
      meta: {
        bra_size: labInputs.bra_size || null,
        bra_bust_cm: labInputs.bra_size ? braToBustCm(labInputs.bra_size, braConversion) : null,
        bust_source: bustPick.source,
        shoulder_profile: labInputs.shoulder_profile || null,
        waist_fit: labInputs.waist_fit || null
      }
    };
  }

  function getProfileGarmentType(guideData) {
    var profile = guideData && guideData.finder && guideData.finder.profile;
    if (profile && profile.garment_type) return profile.garment_type;
    return guideData && guideData.garmentType ? guideData.garmentType : 'top';
  }

  function getRegionSizes(guideData, regionKey) {
    var mapping = guideData.regionSizeMapping || {};
    var regions = mapping.regions || mapping;
    var entry = regions[regionKey];
    if (!entry) return [];
    if (Array.isArray(entry)) return entry;
    return entry.sizes || [];
  }

  function compareToExpected(result, expected) {
    if (!expected) return { pass: null, notes: [] };
    var notes = [];
    var pass = true;

    if (!result.ok) {
      return { pass: false, notes: ['Engine returned no recommendation'] };
    }

    if (expected.recommended_size && String(result.recommended) !== String(expected.recommended_size)) {
      pass = false;
      notes.push('Size: got ' + result.recommended + ', expected ' + expected.recommended_size);
    }
    if (expected.secondary_size != null && expected.secondary_size !== '') {
      var gotSec = result.secondary == null ? '' : String(result.secondary);
      if (gotSec !== String(expected.secondary_size)) {
        pass = false;
        notes.push('Secondary: got ' + (gotSec || '—') + ', expected ' + expected.secondary_size);
      }
    }
    if (expected.confidence && result.confidence !== expected.confidence) {
      notes.push('Confidence: got ' + result.confidence + ', expected ' + expected.confidence + ' (informational)');
    }

    return { pass: pass, notes: notes };
  }

  global.MarameSizeFinderLabAdapter = {
    normalizeGuideData: normalizeGuideData,
    parseBraSize: parseBraSize,
    braToBustCm: braToBustCm,
    labInputsToEngineAnswers: labInputsToEngineAnswers,
    getProfileGarmentType: getProfileGarmentType,
    getRegionSizes: getRegionSizes,
    compareToExpected: compareToExpected
  };
})(window);
