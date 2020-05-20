"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOSInfo = getOSInfo;

var _os = _interopRequireDefault(require("os"));

var _getos = _interopRequireDefault(require("getos"));

var _util = require("util");

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
 * Returns an object of OS information/
 */
async function getOSInfo() {
  const osInfo = {
    platform: _os.default.platform(),
    // Include the platform name in the release to avoid grouping unrelated platforms together.
    // release 1.0 across windows, linux, and darwin don't mean anything useful.
    platformRelease: `${_os.default.platform()}-${_os.default.release()}`
  }; // Get distribution information for linux

  if (_os.default.platform() === 'linux') {
    try {
      const distro = await (0, _util.promisify)(_getos.default)();
      osInfo.distro = distro.dist; // Include distro name in release for same reason as above.

      osInfo.distroRelease = `${distro.dist}-${distro.release}`;
    } catch (e) {// ignore errors
    }
  }

  return osInfo;
}