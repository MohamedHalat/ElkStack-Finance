"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noOpSearchStrategy = void 0;

var _i18n = require("@kbn/i18n");

var _search_error = require("./search_error");

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
var noOpSearchStrategy = {
  id: 'noOp',
  search: function search() {
    var searchError = new _search_error.SearchError({
      status: '418',
      // "I'm a teapot" error
      title: _i18n.i18n.translate('data.search.searchSource.noSearchStrategyRegisteredErrorMessageTitle', {
        defaultMessage: 'No search strategy registered'
      }),
      message: _i18n.i18n.translate('data.search.searchSource.noSearchStrategyRegisteredErrorMessageDescription', {
        defaultMessage: "Couldn't find a search strategy for the search request"
      }),
      type: 'NO_OP_SEARCH_STRATEGY',
      path: ''
    });
    return {
      searching: Promise.reject(searchError),
      abort: function abort() {}
    };
  },
  isViable: function isViable() {
    return true;
  }
};
exports.noOpSearchStrategy = noOpSearchStrategy;