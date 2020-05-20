"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Headers", {
  enumerable: true,
  get: function () {
    return _router.Headers;
  }
});
exports.ScopedClusterClient = void 0;

var _lodash = require("lodash");

var _router = require("../http/router");

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

/** @public */

/**
 * {@inheritDoc IScopedClusterClient}
 * @public
 */
class ScopedClusterClient {
  constructor(internalAPICaller, scopedAPICaller, headers) {
    this.internalAPICaller = internalAPICaller;
    this.scopedAPICaller = scopedAPICaller;
    this.headers = headers;
    this.callAsCurrentUser = this.callAsCurrentUser.bind(this);
    this.callAsInternalUser = this.callAsInternalUser.bind(this);
  }
  /**
   * Calls specified `endpoint` with provided `clientParams` on behalf of the
   * Kibana internal user.
   * See {@link APICaller}.
   *
   * @param endpoint - String descriptor of the endpoint e.g. `cluster.getSettings` or `ping`.
   * @param clientParams - A dictionary of parameters that will be passed directly to the Elasticsearch JS client.
   * @param options - Options that affect the way we call the API and process the result.
   */


  callAsInternalUser(endpoint, clientParams = {}, options) {
    return this.internalAPICaller(endpoint, clientParams, options);
  }
  /**
   * Calls specified `endpoint` with provided `clientParams` on behalf of the
   * user initiated request to the Kibana server (via HTTP request headers).
   * See {@link APICaller}.
   *
   * @param endpoint - String descriptor of the endpoint e.g. `cluster.getSettings` or `ping`.
   * @param clientParams - A dictionary of parameters that will be passed directly to the Elasticsearch JS client.
   * @param options - Options that affect the way we call the API and process the result.
   */


  callAsCurrentUser(endpoint, clientParams = {}, options) {
    const defaultHeaders = this.headers;

    if (defaultHeaders !== undefined) {
      const customHeaders = clientParams.headers;

      if ((0, _lodash.isObject)(customHeaders)) {
        const duplicates = (0, _lodash.intersection)(Object.keys(defaultHeaders), Object.keys(customHeaders));
        duplicates.forEach(duplicate => {
          if (defaultHeaders[duplicate] !== customHeaders[duplicate]) {
            throw Error(`Cannot override default header ${duplicate}.`);
          }
        });
      }

      clientParams.headers = Object.assign({}, clientParams.headers, this.headers);
    }

    return this.scopedAPICaller(endpoint, clientParams, options);
  }

}

exports.ScopedClusterClient = ScopedClusterClient;