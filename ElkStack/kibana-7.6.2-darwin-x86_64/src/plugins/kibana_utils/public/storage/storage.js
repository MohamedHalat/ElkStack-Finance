"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Storage = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var Storage = function Storage(store) {
  var _this = this;

  _classCallCheck(this, Storage);

  _defineProperty(this, "store", void 0);

  _defineProperty(this, "get", function (key) {
    if (!_this.store) {
      return null;
    }

    var storageItem = _this.store.getItem(key);

    if (storageItem === null) {
      return null;
    }

    try {
      return JSON.parse(storageItem);
    } catch (error) {
      return null;
    }
  });

  _defineProperty(this, "set", function (key, value) {
    try {
      return _this.store.setItem(key, JSON.stringify(value));
    } catch (e) {
      return false;
    }
  });

  _defineProperty(this, "remove", function (key) {
    return _this.store.removeItem(key);
  });

  _defineProperty(this, "clear", function () {
    return _this.store.clear();
  });

  this.store = store;
};

exports.Storage = Storage;