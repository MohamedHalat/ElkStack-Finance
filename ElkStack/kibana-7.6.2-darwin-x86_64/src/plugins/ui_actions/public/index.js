"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.plugin = plugin;
Object.defineProperty(exports, "IUiActionsSetup", {
  enumerable: true,
  get: function get() {
    return _plugin.IUiActionsSetup;
  }
});
Object.defineProperty(exports, "IUiActionsStart", {
  enumerable: true,
  get: function get() {
    return _plugin.IUiActionsStart;
  }
});
Object.defineProperty(exports, "IAction", {
  enumerable: true,
  get: function get() {
    return _types.IAction;
  }
});
Object.defineProperty(exports, "ITrigger", {
  enumerable: true,
  get: function get() {
    return _types.ITrigger;
  }
});
Object.defineProperty(exports, "IUiActionsApi", {
  enumerable: true,
  get: function get() {
    return _types.IUiActionsApi;
  }
});
Object.defineProperty(exports, "TGetActionsCompatibleWithTrigger", {
  enumerable: true,
  get: function get() {
    return _types.TGetActionsCompatibleWithTrigger;
  }
});
Object.defineProperty(exports, "TExecuteTriggerActions", {
  enumerable: true,
  get: function get() {
    return _types.TExecuteTriggerActions;
  }
});
Object.defineProperty(exports, "createAction", {
  enumerable: true,
  get: function get() {
    return _actions.createAction;
  }
});
Object.defineProperty(exports, "buildContextMenuForActions", {
  enumerable: true,
  get: function get() {
    return _context_menu.buildContextMenuForActions;
  }
});
Object.defineProperty(exports, "IncompatibleActionError", {
  enumerable: true,
  get: function get() {
    return _triggers.IncompatibleActionError;
  }
});

var _plugin = require("./plugin");

var _types = require("./types");

var _actions = require("./actions");

var _context_menu = require("./context_menu");

var _triggers = require("./triggers");

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
function plugin(initializerContext) {
  return new _plugin.UiActionsPlugin(initializerContext);
}