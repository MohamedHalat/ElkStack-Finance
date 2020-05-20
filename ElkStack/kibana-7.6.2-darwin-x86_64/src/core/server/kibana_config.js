"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = void 0;

var _configSchema = require("@kbn/config-schema");

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
const config = {
  path: 'kibana',
  schema: _configSchema.schema.object({
    enabled: _configSchema.schema.boolean({
      defaultValue: true
    }),
    defaultAppId: _configSchema.schema.string({
      defaultValue: 'home'
    }),
    index: _configSchema.schema.string({
      defaultValue: '.kibana'
    }),
    disableWelcomeScreen: _configSchema.schema.boolean({
      defaultValue: false
    }),
    autocompleteTerminateAfter: _configSchema.schema.duration({
      defaultValue: 100000
    }),
    autocompleteTimeout: _configSchema.schema.duration({
      defaultValue: 1000
    })
  })
};
exports.config = config;