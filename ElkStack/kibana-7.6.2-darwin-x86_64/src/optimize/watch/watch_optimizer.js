"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.STATUS = void 0;

var _base_optimizer = _interopRequireDefault(require("../base_optimizer"));

var _bundles_route = require("../bundles_route");

var _dynamic_dll_plugin = require("../dynamic_dll_plugin");

var _utils = require("../../core/server/utils");

var Rx = _interopRequireWildcard(require("rxjs"));

var _operators = require("rxjs/operators");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const STATUS = {
  RUNNING: 'optimizer running',
  SUCCESS: 'optimizer completed successfully',
  FAILURE: 'optimizer failed with stats',
  FATAL: 'optimizer failed without stats'
};
exports.STATUS = STATUS;

class WatchOptimizer extends _base_optimizer.default {
  constructor(opts) {
    super(opts);

    _defineProperty(this, "compilerWatchErrorHandler", error => {
      if (error) {
        this.status$.next({
          type: STATUS.FATAL,
          error
        });
      }
    });

    _defineProperty(this, "onStatusChangeHandler", ({
      type,
      seconds,
      error
    }) => {
      switch (type) {
        case STATUS.RUNNING:
          if (!this.initialBuildComplete) {
            this.logWithMetadata(['info', 'optimize'], `Optimization started`, {
              bundles: this.uiBundles.getIds()
            });
          }

          break;

        case STATUS.SUCCESS:
          this.logWithMetadata(['info', 'optimize'], `Optimization success in ${seconds} seconds`, {
            bundles: this.uiBundles.getIds(),
            status: 'success',
            seconds
          });
          break;

        case STATUS.FAILURE:
          // errors during initialization to the server, unlike the rest of the
          // errors produced here. Lets not muddy the console with extra errors
          if (!this.initializing) {
            this.logWithMetadata(['fatal', 'optimize'], `Optimization failed in ${seconds} seconds${error}`, {
              bundles: this.uiBundles.getIds(),
              status: 'failed',
              seconds,
              err: error
            });
          }

          break;

        case STATUS.FATAL:
          this.logWithMetadata('fatal', error);
          process.exit(1);
          break;
      }
    });

    this.prebuild = opts.prebuild || false;
    this.watchCache = opts.watchCache;
    this.status$ = new Rx.ReplaySubject(1);
  }

  async init() {
    this.initializing = true;
    this.initialBuildComplete = false; // try reset the watch optimizer cache

    await this.watchCache.tryReset(); // log status changes

    this.status$.subscribe(this.onStatusChangeHandler);
    await this.uiBundles.resetBundleDir();
    await super.init();
    this.compiler.watch({
      aggregateTimeout: 200
    }, this.compilerWatchErrorHandler);

    if (this.prebuild) {
      await this.onceBuildOutcome();
    }

    this.initializing = false;
  }
  /**
   *
   * Extends the base_optimizer registerCompilerHooks function
   * calling extended function also adding a new register function
   *
   * It gets called by super.init()
   */


  registerCompilerHooks() {
    super.registerCompilerHooks();
    this.registerCompilerWatchRunHook();
  }

  registerCompilerWatchRunHook() {
    this.compiler.hooks.watchRun.tap('watch_optimizer-watchRun', () => {
      this.status$.next({
        type: STATUS.RUNNING
      });
    });
  }

  registerCompilerDoneHook() {
    super.registerCompilerDoneHook();
    this.compiler.hooks.done.tap('watch_optimizer-done', stats => {
      if (stats.compilation.needAdditionalPass) {
        return;
      }

      this.initialBuildComplete = true;
      const seconds = parseFloat((stats.endTime - stats.startTime) / 1000).toFixed(2);

      if (this.isFailure(stats)) {
        this.status$.next({
          type: STATUS.FAILURE,
          seconds,
          error: this.failedStatsToError(stats)
        });
      } else {
        this.status$.next({
          type: STATUS.SUCCESS,
          seconds
        });
      }
    });
  }

  bindToServer(server, basePath) {
    // pause all requests received while the compiler is running
    // and continue once an outcome is reached (aborting the request
    // with an error if it was a failure).
    server.ext('onRequest', async (request, h) => {
      await this.onceBuildOutcome();
      return h.continue;
    });
    server.route((0, _bundles_route.createBundlesRoute)({
      regularBundlesPath: this.compiler.outputPath,
      dllBundlesPath: _dynamic_dll_plugin.DllCompiler.getRawDllConfig().outputPath,
      basePublicPath: basePath,
      builtCssPath: (0, _utils.fromRoot)('built_assets/css')
    }));
  }

  async onceBuildOutcome() {
    return await this.status$.pipe((0, _operators.mergeMap)(this.mapStatusToOutcomes), (0, _operators.take)(1)).toPromise();
  }

  mapStatusToOutcomes({
    type,
    error
  }) {
    switch (type) {
      case STATUS.RUNNING:
        return [];

      case STATUS.SUCCESS:
        return [true];

      case STATUS.FAILURE:
      case STATUS.FATAL:
        return Rx.throwError(error);
    }
  }

}

exports.default = WatchOptimizer;