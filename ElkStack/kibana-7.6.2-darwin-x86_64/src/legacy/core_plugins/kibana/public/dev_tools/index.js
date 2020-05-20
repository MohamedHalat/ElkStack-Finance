"use strict";

require("uiExports/devTools");

var _new_platform = require("ui/new_platform");

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
// make sure all dev tools are loaded and registered.
if (_new_platform.npStart.plugins.dev_tools.getSortedDevTools().length === 0) {
  _new_platform.npStart.core.chrome.navLinks.update('kibana:dev_tools', {
    hidden: true
  });
}