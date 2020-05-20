"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeSampleDataUsageCollector = makeSampleDataUsageCollector;

var _operators = require("rxjs/operators");

var _collector_fetch = require("./collector_fetch");

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
async function makeSampleDataUsageCollector(usageCollection, context) {
  let index;

  try {
    const config = await context.config.legacy.globalConfig$.pipe((0, _operators.first)()).toPromise();
    index = config.kibana.index;
  } catch (err) {
    return; // kibana plugin is not enabled (test environment)
  }

  const collector = usageCollection.makeUsageCollector({
    type: 'sample-data',
    fetch: (0, _collector_fetch.fetchProvider)(index),
    isReady: () => true
  });
  usageCollection.registerCollector(collector);
}