"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValidationTelemetryService = void 0;

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
class ValidationTelemetryService {
  constructor() {
    _defineProperty(this, "kibanaIndex", '');
  }

  async setup(core, {
    usageCollection,
    globalConfig$
  }) {
    globalConfig$.subscribe(config => {
      this.kibanaIndex = config.kibana.index;
    });

    if (usageCollection) {
      usageCollection.registerCollector(usageCollection.makeUsageCollector({
        type: 'tsvb-validation',
        isReady: () => this.kibanaIndex !== '',
        fetch: async callCluster => {
          try {
            var _response$_source, _response$_source$tsv;

            const response = await callCluster('get', {
              index: this.kibanaIndex,
              id: 'tsvb-validation-telemetry:tsvb-validation-telemetry',
              ignore: [404]
            });
            return {
              failed_validations: (response === null || response === void 0 ? void 0 : (_response$_source = response._source) === null || _response$_source === void 0 ? void 0 : (_response$_source$tsv = _response$_source['tsvb-validation-telemetry']) === null || _response$_source$tsv === void 0 ? void 0 : _response$_source$tsv.failedRequests) || 0
            };
          } catch (err) {
            return {
              failed_validations: 0
            };
          }
        }
      }));
    }

    const internalRepository = core.savedObjects.createInternalRepository();
    return {
      logFailedValidation: async () => {
        try {
          await internalRepository.incrementCounter('tsvb-validation-telemetry', 'tsvb-validation-telemetry', 'failedRequests');
        } catch (e) {// swallow error, validation telemetry shouldn't fail anything else
        }
      }
    };
  }

  start() {}

}

exports.ValidationTelemetryService = ValidationTelemetryService;