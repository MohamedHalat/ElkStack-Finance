"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _util = require("util");

var _migrations = require("./migrations");

var _import = require("./server/routes/api/import");

var _export = require("./server/routes/api/export");

var _home = require("./server/routes/api/home");

var _management = require("./server/routes/api/management");

var _register = require("./server/field_formats/register");

var _register2 = require("./server/tutorials/register");

var systemApi = _interopRequireWildcard(require("./server/lib/system_api"));

var _mappings = _interopRequireDefault(require("./mappings.json"));

var _ui_setting_defaults = require("./ui_setting_defaults");

var _csp_usage_collector = require("./server/lib/csp_usage_collector");

var _inject_vars = require("./inject_vars");

var _i18n = require("@kbn/i18n");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const mkdirAsync = (0, _util.promisify)(_fs.default.mkdir);

function _default(kibana) {
  const kbnBaseUrl = '/app/kibana';
  return new kibana.Plugin({
    id: 'kibana',
    config: function (Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        defaultAppId: Joi.string().default('home'),
        index: Joi.string().default('.kibana'),
        disableWelcomeScreen: Joi.boolean().default(false),
        autocompleteTerminateAfter: Joi.number().integer().min(1).default(100000),
        // TODO Also allow units here like in elasticsearch config once this is moved to the new platform
        autocompleteTimeout: Joi.number().integer().min(1).default(1000)
      }).default();
    },
    uiExports: {
      hacks: ['plugins/kibana/discover', 'plugins/kibana/dev_tools', 'plugins/kibana/visualize'],
      savedObjectTypes: ['plugins/kibana/visualize/saved_visualizations/saved_visualization_register', 'plugins/kibana/dashboard/saved_dashboard/saved_dashboard_register'],
      app: {
        id: 'kibana',
        title: 'Kibana',
        listed: false,
        main: 'plugins/kibana/kibana'
      },
      styleSheetPaths: (0, _path.resolve)(__dirname, 'public/index.scss'),
      links: [{
        id: 'kibana:discover',
        title: _i18n.i18n.translate('kbn.discoverTitle', {
          defaultMessage: 'Discover'
        }),
        order: -1003,
        url: `${kbnBaseUrl}#/discover`,
        euiIconType: 'discoverApp'
      }, {
        id: 'kibana:visualize',
        title: _i18n.i18n.translate('kbn.visualizeTitle', {
          defaultMessage: 'Visualize'
        }),
        order: -1002,
        url: `${kbnBaseUrl}#/visualize`,
        euiIconType: 'visualizeApp'
      }, {
        id: 'kibana:dashboard',
        title: _i18n.i18n.translate('kbn.dashboardTitle', {
          defaultMessage: 'Dashboard'
        }),
        order: -1001,
        url: `${kbnBaseUrl}#/dashboards`,
        // The subUrlBase is the common substring of all urls for this app. If not given, it defaults to the url
        // above. This app has to use a different subUrlBase, in addition to the url above, because "#/dashboard"
        // routes to a page that creates a new dashboard. When we introduced a landing page, we needed to change
        // the url above in order to preserve the original url for BWC. The subUrlBase helps the Chrome api nav
        // to determine what url to use for the app link.
        subUrlBase: `${kbnBaseUrl}#/dashboard`,
        euiIconType: 'dashboardApp'
      }, {
        id: 'kibana:dev_tools',
        title: _i18n.i18n.translate('kbn.devToolsTitle', {
          defaultMessage: 'Dev Tools'
        }),
        order: 9001,
        url: '/app/kibana#/dev_tools',
        euiIconType: 'devToolsApp'
      }, {
        id: 'kibana:management',
        title: _i18n.i18n.translate('kbn.managementTitle', {
          defaultMessage: 'Management'
        }),
        order: 9003,
        url: `${kbnBaseUrl}#/management`,
        euiIconType: 'managementApp',
        linkToLastSubUrl: false
      }],
      savedObjectsManagement: {
        'index-pattern': {
          icon: 'indexPatternApp',
          defaultSearchField: 'title',
          isImportableAndExportable: true,

          getTitle(obj) {
            return obj.attributes.title;
          },

          getEditUrl(obj) {
            return `/management/kibana/index_patterns/${encodeURIComponent(obj.id)}`;
          },

          getInAppUrl(obj) {
            return {
              path: `/app/kibana#/management/kibana/index_patterns/${encodeURIComponent(obj.id)}`,
              uiCapabilitiesPath: 'management.kibana.index_patterns'
            };
          }

        },
        visualization: {
          icon: 'visualizeApp',
          defaultSearchField: 'title',
          isImportableAndExportable: true,

          getTitle(obj) {
            return obj.attributes.title;
          },

          getEditUrl(obj) {
            return `/management/kibana/objects/savedVisualizations/${encodeURIComponent(obj.id)}`;
          },

          getInAppUrl(obj) {
            return {
              path: `/app/kibana#/visualize/edit/${encodeURIComponent(obj.id)}`,
              uiCapabilitiesPath: 'visualize.show'
            };
          }

        },
        search: {
          icon: 'discoverApp',
          defaultSearchField: 'title',
          isImportableAndExportable: true,

          getTitle(obj) {
            return obj.attributes.title;
          },

          getEditUrl(obj) {
            return `/management/kibana/objects/savedSearches/${encodeURIComponent(obj.id)}`;
          },

          getInAppUrl(obj) {
            return {
              path: `/app/kibana#/discover/${encodeURIComponent(obj.id)}`,
              uiCapabilitiesPath: 'discover.show'
            };
          }

        },
        dashboard: {
          icon: 'dashboardApp',
          defaultSearchField: 'title',
          isImportableAndExportable: true,

          getTitle(obj) {
            return obj.attributes.title;
          },

          getEditUrl(obj) {
            return `/management/kibana/objects/savedDashboards/${encodeURIComponent(obj.id)}`;
          },

          getInAppUrl(obj) {
            return {
              path: `/app/kibana#/dashboard/${encodeURIComponent(obj.id)}`,
              uiCapabilitiesPath: 'dashboard.show'
            };
          }

        },
        url: {
          defaultSearchField: 'url',
          isImportableAndExportable: true,

          getTitle(obj) {
            return `/goto/${encodeURIComponent(obj.id)}`;
          }

        },
        config: {
          isImportableAndExportable: true,

          getInAppUrl() {
            return {
              path: `/app/kibana#/management/kibana/settings`,
              uiCapabilitiesPath: 'advancedSettings.show'
            };
          },

          getTitle(obj) {
            return `Advanced Settings [${obj.id}]`;
          }

        }
      },
      savedObjectSchemas: {
        'sample-data-telemetry': {
          isNamespaceAgnostic: true
        },
        'kql-telemetry': {
          isNamespaceAgnostic: true
        }
      },

      injectDefaultVars(server, options) {
        const mapConfig = server.config().get('map');
        const tilemap = mapConfig.tilemap;
        return {
          kbnIndex: options.index,
          kbnBaseUrl,
          // required on all pages due to hacks that use these values
          mapConfig,
          tilemapsConfig: {
            deprecated: {
              // If url is set, old settings must be used for backward compatibility
              isOverridden: typeof tilemap.url === 'string' && tilemap.url !== '',
              config: tilemap
            }
          }
        };
      },

      mappings: _mappings.default,
      uiSettingDefaults: (0, _ui_setting_defaults.getUiSettingDefaults)(),
      migrations: _migrations.migrations
    },
    uiCapabilities: async function () {
      return {
        discover: {
          show: true,
          createShortUrl: true,
          save: true,
          saveQuery: true
        },
        visualize: {
          show: true,
          createShortUrl: true,
          delete: true,
          save: true,
          saveQuery: true
        },
        dashboard: {
          createNew: true,
          show: true,
          showWriteControls: true,
          saveQuery: true
        },
        catalogue: {
          discover: true,
          dashboard: true,
          visualize: true,
          console: true,
          advanced_settings: true,
          index_patterns: true
        },
        advancedSettings: {
          show: true,
          save: true
        },
        indexPatterns: {
          save: true
        },
        savedObjectsManagement: {
          delete: true,
          edit: true,
          read: true
        },
        management: {
          /*
           * Management settings correspond to management section/link ids, and should not be changed
           * without also updating those definitions.
           */
          kibana: {
            settings: true,
            index_patterns: true,
            objects: true
          }
        }
      };
    },
    preInit: async function (server) {
      try {
        // Create the data directory (recursively, if the a parent dir doesn't exist).
        // If it already exists, does nothing.
        await mkdirAsync(server.config().get('path.data'), {
          recursive: true
        });
      } catch (err) {
        server.log(['error', 'init'], err); // Stop the server startup with a fatal error

        throw err;
      }
    },
    init: async function (server) {
      const {
        usageCollection
      } = server.newPlatform.setup.plugins; // routes

      (0, _import.importApi)(server);
      (0, _export.exportApi)(server);
      (0, _home.homeApi)(server);
      (0, _management.managementApi)(server);
      (0, _register.registerFieldFormats)(server);
      (0, _register2.registerTutorials)(server);
      (0, _csp_usage_collector.registerCspCollector)(usageCollection, server);
      server.expose('systemApi', systemApi);
      server.injectUiAppVars('kibana', () => (0, _inject_vars.injectVars)(server));
    }
  });
}

module.exports = exports.default;