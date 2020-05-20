"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderApp = renderApp;

var _angular = _interopRequireDefault(require("angular"));

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

/**
 * Here's where Discover's inner angular is mounted and rendered
 */
function renderApp(moduleName, element) {
  var $injector;
  return regeneratorRuntime.async(function renderApp$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(import('./angular'));

        case 2:
          $injector = mountDiscoverApp(moduleName, element);
          return _context.abrupt("return", function () {
            return $injector.get('$rootScope').$destroy();
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}

function mountDiscoverApp(moduleName, element) {
  var mountpoint = document.createElement('div');
  var appWrapper = document.createElement('div');
  appWrapper.setAttribute('ng-view', '');
  mountpoint.appendChild(appWrapper); // bootstrap angular into detached element and attach it later to
  // make angular-within-angular possible

  var $injector = _angular.default.bootstrap(mountpoint, [moduleName]); // initialize global state handler


  $injector.get('globalState');
  element.appendChild(mountpoint);
  return $injector;
}