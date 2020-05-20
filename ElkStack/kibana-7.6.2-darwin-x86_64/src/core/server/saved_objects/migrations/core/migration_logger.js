"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MigrationLogger = void 0;

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

/*
 * This file provides a helper class for ensuring that all logging
 * in the migration system is done in a fairly uniform way.
 */

/** @public */
class MigrationLogger {
  constructor(log) {
    _defineProperty(this, "logger", void 0);

    _defineProperty(this, "info", msg => this.logger.info(msg));

    _defineProperty(this, "debug", msg => this.logger.debug(msg));

    _defineProperty(this, "warning", msg => this.logger.warn(msg));

    this.logger = log;
  }

}

exports.MigrationLogger = MigrationLogger;