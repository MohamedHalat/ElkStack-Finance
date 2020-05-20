"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRestoreRequestFromHistory = void 0;

var _react = require("react");

var _editor_registry = require("../../contexts/editor_context/editor_registry");

var _restore_request_from_history = require("./restore_request_from_history");

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
var useRestoreRequestFromHistory = function useRestoreRequestFromHistory() {
  return (0, _react.useCallback)(function (req) {
    var editor = _editor_registry.instance.getInputEditor();

    (0, _restore_request_from_history.restoreRequestFromHistory)(editor, req);
  }, []);
};

exports.useRestoreRequestFromHistory = useRestoreRequestFromHistory;