"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = require("fs");

var _os = _interopRequireDefault(require("os"));

var _boom = _interopRequireDefault(require("boom"));

var _miniCssExtractPlugin = _interopRequireDefault(require("mini-css-extract-plugin"));

var _terserWebpackPlugin = _interopRequireDefault(require("terser-webpack-plugin"));

var _webpack = _interopRequireDefault(require("webpack"));

var _Stats = _interopRequireDefault(require("webpack/lib/Stats"));

var threadLoader = _interopRequireWildcard(require("thread-loader"));

var _webpackMerge = _interopRequireDefault(require("webpack-merge"));

var UiSharedDeps = _interopRequireWildcard(require("@kbn/ui-shared-deps"));

var _dynamic_dll_plugin = require("./dynamic_dll_plugin");

var _utils = require("../legacy/utils");

var _utils2 = require("../core/server/utils");

var _public_path_placeholder = require("./public_path_placeholder");

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
const POSTCSS_CONFIG_PATH = require.resolve('./postcss.config');

const BABEL_PRESET_PATH = require.resolve('@kbn/babel-preset/webpack_preset');

const BABEL_EXCLUDE_RE = [/[\/\\](webpackShims|node_modules|bower_components)[\/\\]/];
const STATS_WARNINGS_FILTER = new RegExp(['(export .* was not found in)', '|(chunk .* \\[mini-css-extract-plugin\\]\\\nConflicting order between:)'].join(''));

function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if (m.name) {
    return m.name;
  } else {
    return false;
  }
}

class BaseOptimizer {
  constructor(opts) {
    this.logWithMetadata = opts.logWithMetadata || (() => null);

    this.uiBundles = opts.uiBundles;
    this.newPlatformPluginInfo = opts.newPlatformPluginInfo;
    this.profile = opts.profile || false;
    this.workers = opts.workers;

    switch (opts.sourceMaps) {
      case true:
        this.sourceMaps = 'source-map';
        break;

      case 'fast':
        this.sourceMaps = 'cheap-module-eval-source-map';
        break;

      default:
        this.sourceMaps = opts.sourceMaps || false;
        break;
    } // Run some pre loading in order to prevent
    // high delay when booting thread loader workers


    this.warmupThreadLoaderPool();
  }

  async init() {
    if (this.compiler) {
      return this;
    }

    const compilerConfig = this.getConfig();
    this.compiler = (0, _webpack.default)(compilerConfig); // register the webpack compiler hooks
    // for the base optimizer

    this.registerCompilerHooks();
    return this;
  }

  registerCompilerHooks() {
    this.registerCompilerDoneHook();
  }

  registerCompilerDoneHook() {
    this.compiler.hooks.done.tap('base_optimizer-done', stats => {
      // We are not done while we have an additional
      // compilation pass to run
      // We also don't need to emit the stats if we don't have
      // the profile option set
      if (!this.profile || stats.compilation.needAdditionalPass) {
        return;
      }

      const path = this.uiBundles.resolvePath('stats.json');
      const content = JSON.stringify(stats.toJson());
      (0, _fs.writeFile)(path, content, function (err) {
        if (err) throw err;
      });
    });
  }

  warmupThreadLoaderPool() {
    const baseModules = ['babel-loader', BABEL_PRESET_PATH];
    threadLoader.warmup( // pool options, like passed to loader options
    // must match loader options to boot the correct pool
    this.getThreadLoaderPoolConfig(), [// modules to load on the pool
    ...baseModules]);
  }

  getThreadPoolCpuCount() {
    if (this.workers) {
      return this.workers;
    }

    const cpus = _os.default.cpus();

    if (!cpus) {
      // sometimes this call returns undefined so we fall back to 1: https://github.com/nodejs/node/issues/19022
      return 1;
    }

    return Math.max(1, Math.min(cpus.length - 1, 7));
  }

  getThreadLoaderPoolConfig() {
    // Calculate the node options from the NODE_OPTIONS env var
    const parsedNodeOptions = process.env.NODE_OPTIONS ? // thread-loader could not receive empty string as options
    // or it would break that's why we need to filter here
    process.env.NODE_OPTIONS.split(/\s/).filter(opt => !!opt) : [];
    return {
      name: 'optimizer-thread-loader-main-pool',
      workers: this.getThreadPoolCpuCount(),
      workerParallelJobs: 20,
      // This is a safe check in order to set
      // the parent node options applied from
      // the NODE_OPTIONS env var for every launched worker.
      // Otherwise, if the user sets max_old_space_size, as they
      // are used to, into NODE_OPTIONS, it won't affect the workers.
      workerNodeArgs: parsedNodeOptions,
      poolParallelJobs: this.getThreadPoolCpuCount() * 20,
      poolTimeout: this.uiBundles.isDevMode() ? Infinity : 2000
    };
  }

  getConfig() {
    function getStyleLoaderExtractor() {
      return [_miniCssExtractPlugin.default.loader];
    }

    function getStyleLoaders(preProcessors = [], postProcessors = []) {
      return [...postProcessors, {
        loader: 'css-loader',
        options: {
          // importLoaders needs to know the number of loaders that follow this one,
          // so we add 1 (for the postcss-loader) to the length of the preProcessors
          // array that we merge into this array
          importLoaders: 1 + preProcessors.length
        }
      }, {
        loader: 'postcss-loader',
        options: {
          config: {
            path: POSTCSS_CONFIG_PATH
          }
        }
      }, ...preProcessors];
    }
    /**
     * Adds a cache loader if we're running in dev mode. The reason we're not adding
     * the cache-loader when running in production mode is that it creates cache
     * files in optimize/.cache that are not necessary for distributable versions
     * of Kibana and just make compressing and extracting it more difficult.
     */


    const maybeAddCacheLoader = (cacheName, loaders) => {
      return [{
        loader: 'cache-loader',
        options: {
          cacheContext: (0, _utils2.fromRoot)('.'),
          cacheDirectory: this.uiBundles.getCacheDirectory(cacheName),
          readOnly: process.env.KBN_CACHE_LOADER_WRITABLE ? false : _utils.IS_KIBANA_DISTRIBUTABLE
        }
      }, ...loaders];
    };
    /**
     * Creates the selection rules for a loader that will only pass for
     * source files that are eligible for automatic transpilation.
     */


    const createSourceFileResourceSelector = test => {
      return [{
        test,
        exclude: BABEL_EXCLUDE_RE.concat(this.uiBundles.getWebpackNoParseRules())
      }, {
        test,
        include: /[\/\\]node_modules[\/\\]x-pack[\/\\]/,
        exclude: /[\/\\]node_modules[\/\\]x-pack[\/\\](.+?[\/\\])*node_modules[\/\\]/
      }];
    };

    const commonConfig = {
      mode: 'development',
      node: {
        fs: 'empty'
      },
      context: (0, _utils2.fromRoot)('.'),
      cache: true,
      entry: { ...this.uiBundles.toWebpackEntries(),
        ...this._getDiscoveredPluginEntryPoints(),
        light_theme: [require.resolve('../legacy/ui/public/styles/bootstrap_light.less')],
        dark_theme: [require.resolve('../legacy/ui/public/styles/bootstrap_dark.less')]
      },
      devtool: this.sourceMaps,
      profile: this.profile || false,
      output: {
        futureEmitAssets: true,
        // TODO: remove on webpack 5
        path: this.uiBundles.getWorkingDir(),
        filename: '[name].bundle.js',
        sourceMapFilename: '[file].map',
        publicPath: _public_path_placeholder.PUBLIC_PATH_PLACEHOLDER,
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        // When the entry point is loaded, assign it's exported `plugin`
        // value to a key on the global `__kbnBundles__` object.
        // NOTE: Only actually used by new platform plugins
        library: ['__kbnBundles__', '[name]'],
        libraryExport: 'plugin'
      },
      optimization: {
        splitChunks: {
          cacheGroups: {
            commons: {
              name: 'commons',
              chunks: chunk => chunk.canBeInitial() && chunk.name !== 'light_theme' && chunk.name !== 'dark_theme',
              minChunks: 2,
              reuseExistingChunk: true
            },
            light_theme: {
              name: 'light_theme',
              test: m => m.constructor.name === 'CssModule' && recursiveIssuer(m) === 'light_theme',
              chunks: 'all',
              enforce: true
            },
            dark_theme: {
              name: 'dark_theme',
              test: m => m.constructor.name === 'CssModule' && recursiveIssuer(m) === 'dark_theme',
              chunks: 'all',
              enforce: true
            }
          }
        },
        noEmitOnErrors: true
      },
      plugins: [new _dynamic_dll_plugin.DynamicDllPlugin({
        uiBundles: this.uiBundles,
        threadLoaderPoolConfig: this.getThreadLoaderPoolConfig(),
        logWithMetadata: this.logWithMetadata
      }), new _miniCssExtractPlugin.default({
        filename: '[name].style.css'
      }), // replace imports for `uiExports/*` modules with a synthetic module
      // created by create_ui_exports_module.js
      new _webpack.default.NormalModuleReplacementPlugin(/^uiExports\//, resource => {
        // the map of uiExport types to module ids
        const extensions = this.uiBundles.getAppExtensions(); // everything following the first / in the request is
        // treated as a type of appExtension

        const type = resource.request.slice(resource.request.indexOf('/') + 1);
        resource.request = [// the "val-loader" is used to execute create_ui_exports_module
        // and use its return value as the source for the module in the
        // bundle. This allows us to bypass writing to the file system
        require.resolve('val-loader'), '!', require.resolve('./create_ui_exports_module'), '?', // this JSON is parsed by create_ui_exports_module and determines
        // what require() calls it will execute within the bundle
        JSON.stringify({
          type,
          modules: extensions[type] || []
        })].join('');
      }), ...this.uiBundles.getWebpackPluginProviders().map(provider => provider(_webpack.default))],
      module: {
        rules: [{
          test: /\.less$/,
          use: [...getStyleLoaderExtractor(), ...getStyleLoaders(['less-loader'], maybeAddCacheLoader('less', []))]
        }, {
          test: /\.css$/,
          use: [...getStyleLoaderExtractor(), ...getStyleLoaders([], maybeAddCacheLoader('css', []))]
        }, {
          test: /\.(html|tmpl)$/,
          loader: 'raw-loader'
        }, {
          test: /\.(woff|woff2|ttf|eot|svg|ico|png|jpg|gif|jpeg)(\?|$)/,
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }, {
          resource: createSourceFileResourceSelector(/\.(js|tsx?)$/),
          use: maybeAddCacheLoader('babel', [{
            loader: 'thread-loader',
            options: this.getThreadLoaderPoolConfig()
          }, {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [BABEL_PRESET_PATH]
            }
          }])
        }, ...this.uiBundles.getPostLoaders().map(loader => ({
          enforce: 'post',
          ...loader
        }))],
        noParse: this.uiBundles.getWebpackNoParseRules()
      },
      resolve: {
        extensions: ['.js', '.ts', '.tsx', '.json'],
        mainFields: ['browser', 'browserify', 'main'],
        modules: ['webpackShims', (0, _utils2.fromRoot)('webpackShims'), 'node_modules', (0, _utils2.fromRoot)('node_modules')],
        alias: this.uiBundles.getAliases()
      },
      performance: {
        // NOTE: we are disabling this as those hints
        // are more tailored for the final bundles result
        // and not for the webpack compilations performance itself
        hints: false
      },
      externals: { ...UiSharedDeps.externals
      }
    }; // when running from the distributable define an environment variable we can use
    // to exclude chunks of code, modules, etc.

    const isDistributableConfig = {
      plugins: [new _webpack.default.DefinePlugin({
        'process.env': {
          IS_KIBANA_DISTRIBUTABLE: `"true"`
        }
      })]
    };
    const watchingConfig = {
      plugins: [new _webpack.default.WatchIgnorePlugin([// When our bundle entry files are fresh they cause webpack
      // to think they might have changed since the watcher was
      // initialized, which triggers a second compilation on startup.
      // Since we can't reliably update these files anyway, we can
      // just ignore them in the watcher and prevent the extra compilation
      /bundles[\/\\].+\.entry\.js/])]
    }; // in production we set the process.env.NODE_ENV and run
    // the terser minimizer over our bundles

    const productionConfig = {
      mode: 'production',
      optimization: {
        minimizer: [new _terserWebpackPlugin.default({
          parallel: false,
          sourceMap: false,
          cache: false,
          extractComments: false,
          terserOptions: {
            compress: false,
            mangle: false
          }
        })]
      }
    };
    return this.uiBundles.getExtendedConfig((0, _webpackMerge.default)(commonConfig, _utils.IS_KIBANA_DISTRIBUTABLE ? isDistributableConfig : {}, this.uiBundles.isDevMode() ? watchingConfig : productionConfig));
  }

  isFailure(stats) {
    if (stats.hasErrors()) {
      return true;
    }

    const {
      warnings
    } = stats.toJson({
      all: false,
      warnings: true
    }); // 1 - when typescript doesn't do a full type check, as we have the ts-loader
    // configured here, it does not have enough information to determine
    // whether an imported name is a type or not, so when the name is then
    // exported, typescript has no choice but to emit the export. Fortunately,
    // the extraneous export should not be harmful, so we just suppress these warnings
    // https://github.com/TypeStrong/ts-loader#transpileonly-boolean-defaultfalse
    //
    // 2 - Mini Css Extract plugin tracks the order for each css import we have
    // through the project (and it's successive imports) since version 0.4.2.
    // In case we have the same imports more than one time with different
    // sequences, this plugin will throw a warning. This should not be harmful,
    // but the an issue was opened and can be followed on:
    // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250#issuecomment-415345126

    const filteredWarnings = _Stats.default.filterWarnings(warnings, STATS_WARNINGS_FILTER);

    return filteredWarnings.length > 0;
  }

  failedStatsToError(stats) {
    const details = stats.toString({ ..._Stats.default.presetToOptions('minimal'),
      colors: true,
      warningsFilter: STATS_WARNINGS_FILTER
    });
    return _boom.default.internal(`Optimizations failure.\n${details.split('\n').join('\n    ')}\n`, stats.toJson({
      warningsFilter: STATS_WARNINGS_FILTER,
      ..._Stats.default.presetToOptions('detailed')
    }));
  }

  _getDiscoveredPluginEntryPoints() {
    // New platform plugin entry points
    return [...this.newPlatformPluginInfo.entries()].reduce((entryPoints, [pluginId, pluginInfo]) => {
      entryPoints[`plugin/${pluginId}`] = pluginInfo.entryPointPath;
      return entryPoints;
    }, {});
  }

}

exports.default = BaseOptimizer;
module.exports = exports.default;