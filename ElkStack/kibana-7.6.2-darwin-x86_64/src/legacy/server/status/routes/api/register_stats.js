"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerStatsApi = registerStatsApi;

var _joi = _interopRequireDefault(require("joi"));

var _boom = _interopRequireDefault(require("boom"));

var _i18n = require("@kbn/i18n");

var _wrap_auth_config = require("../../wrap_auth_config");

var _constants = require("../../constants");

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
const STATS_NOT_READY_MESSAGE = _i18n.i18n.translate('server.stats.notReadyMessage', {
  defaultMessage: 'Stats are not ready yet. Please try again later.'
});
/*
 * API for Kibana meta info and accumulated operations stats
 * Including ?extended in the query string fetches Elasticsearch cluster_uuid and usageCollection data
 *   - Requests to set isExtended = true
 *       GET /api/stats?extended=true
 *       GET /api/stats?extended
 *   - No value or 'false' is isExtended = false
 *   - Any other value causes a statusCode 400 response (Bad Request)
 * Including ?exclude_usage in the query string excludes the usage stats from the response. Same value semantics as ?extended
 */


function registerStatsApi(usageCollection, server, config) {
  const wrapAuth = (0, _wrap_auth_config.wrapAuthConfig)(config.get('status.allowAnonymous'));

  const getClusterUuid = async callCluster => {
    const {
      cluster_uuid: uuid
    } = await callCluster('info', {
      filterPath: 'cluster_uuid'
    });
    return uuid;
  };

  const getUsage = async callCluster => {
    const usage = await usageCollection.bulkFetchUsage(callCluster);
    return usageCollection.toObject(usage);
  };

  server.route(wrapAuth({
    method: 'GET',
    path: '/api/stats',
    config: {
      validate: {
        query: _joi.default.object({
          extended: _joi.default.string().valid('', 'true', 'false'),
          legacy: _joi.default.string().valid('', 'true', 'false'),
          exclude_usage: _joi.default.string().valid('', 'true', 'false')
        })
      },
      tags: ['api']
    },

    async handler(req) {
      const isExtended = req.query.extended !== undefined && req.query.extended !== 'false';
      const isLegacy = req.query.legacy !== undefined && req.query.legacy !== 'false';
      const shouldGetUsage = req.query.exclude_usage === undefined || req.query.exclude_usage === 'false';
      let extended;

      if (isExtended) {
        const {
          callWithRequest
        } = req.server.plugins.elasticsearch.getCluster('admin');

        const callCluster = (...args) => callWithRequest(req, ...args);

        const collectorsReady = await usageCollection.areAllCollectorsReady();

        if (shouldGetUsage && !collectorsReady) {
          return _boom.default.serverUnavailable(STATS_NOT_READY_MESSAGE);
        }

        const usagePromise = shouldGetUsage ? getUsage(callCluster) : Promise.resolve({});

        try {
          const [usage, clusterUuid] = await Promise.all([usagePromise, getClusterUuid(callCluster)]);
          let modifiedUsage = usage;

          if (isLegacy) {
            // In an effort to make telemetry more easily augmented, we need to ensure
            // we can passthrough the data without every part of the process needing
            // to know about the change; however, to support legacy use cases where this
            // wasn't true, we need to be backwards compatible with how the legacy data
            // looked and support those use cases here.
            modifiedUsage = Object.keys(usage).reduce((accum, usageKey) => {
              if (usageKey === 'kibana') {
                accum = { ...accum,
                  ...usage[usageKey]
                };
              } else if (usageKey === 'reporting') {
                accum = { ...accum,
                  xpack: { ...accum.xpack,
                    reporting: usage[usageKey]
                  }
                };
              } else {
                accum = { ...accum,
                  [usageKey]: usage[usageKey]
                };
              }

              return accum;
            }, {});
            extended = {
              usage: modifiedUsage,
              clusterUuid
            };
          } else {
            extended = usageCollection.toApiFieldNames({
              usage: modifiedUsage,
              clusterUuid
            });
          }
        } catch (e) {
          throw _boom.default.boomify(e);
        }
      }
      /* kibana_stats gets singled out from the collector set as it is used
       * for health-checking Kibana and fetch does not rely on fetching data
       * from ES */


      const kibanaStatsCollector = usageCollection.getCollectorByType(_constants.KIBANA_STATS_TYPE);

      if (!(await kibanaStatsCollector.isReady())) {
        return _boom.default.serverUnavailable(STATS_NOT_READY_MESSAGE);
      }

      let kibanaStats = await kibanaStatsCollector.fetch();
      kibanaStats = usageCollection.toApiFieldNames(kibanaStats);
      return { ...kibanaStats,
        ...extended
      };
    }

  }));
}