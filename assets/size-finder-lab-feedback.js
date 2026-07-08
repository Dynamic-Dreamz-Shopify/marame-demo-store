/**
 * MARAME Size Finder Lab — stylist feedback storage & export.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'marame-sflab-feedback-v1';

  function loadAll() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAll(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function uid() {
    return 'fb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function addEntry(entry) {
    var items = loadAll();
    items.unshift(entry);
    saveAll(items.slice(0, 200));
    return entry;
  }

  function removeEntry(id) {
    saveAll(loadAll().filter(function (item) {
      return item.id !== id;
    }));
  }

  function exportJson(items) {
    return JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        count: items.length,
        feedback: items
      },
      null,
      2
    );
  }

  function downloadJson(filename, json) {
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  global.MarameSizeFinderLabFeedback = {
    loadAll: loadAll,
    addEntry: addEntry,
    removeEntry: removeEntry,
    exportJson: exportJson,
    downloadJson: downloadJson
  };
})(window);
