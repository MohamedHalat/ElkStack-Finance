"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showNewVisModal = showNewVisModal;

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _react2 = require("@kbn/i18n/react");

var _new_vis_modal = require("./new_vis_modal");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function showNewVisModal(visTypeRegistry) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$editorParams = _ref.editorParams,
      editorParams = _ref$editorParams === void 0 ? [] : _ref$editorParams;

  var addBasePath = arguments.length > 2 ? arguments[2] : undefined;
  var uiSettings = arguments.length > 3 ? arguments[3] : undefined;
  var savedObjects = arguments.length > 4 ? arguments[4] : undefined;
  var usageCollection = arguments.length > 5 ? arguments[5] : undefined;
  var container = document.createElement('div');

  var onClose = function onClose() {
    _reactDom.default.unmountComponentAtNode(container);

    document.body.removeChild(container);
  };

  document.body.appendChild(container);

  var element = _react.default.createElement(_react2.I18nProvider, null, _react.default.createElement(_new_vis_modal.NewVisModal, {
    isOpen: true,
    onClose: onClose,
    visTypesRegistry: visTypeRegistry,
    editorParams: editorParams,
    addBasePath: addBasePath,
    uiSettings: uiSettings,
    savedObjects: savedObjects,
    usageCollection: usageCollection
  }));

  _reactDom.default.render(element, container);
}