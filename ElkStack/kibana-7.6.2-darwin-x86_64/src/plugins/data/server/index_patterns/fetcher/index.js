"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  shouldReadFieldFromDocValues: true
};
Object.defineProperty(exports, "shouldReadFieldFromDocValues", {
  enumerable: true,
  get: function () {
    return _lib.shouldReadFieldFromDocValues;
  }
});

var _index_patterns_fetcher = require("./index_patterns_fetcher");

Object.keys(_index_patterns_fetcher).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index_patterns_fetcher[key];
    }
  });
});

var _lib = require("./lib");