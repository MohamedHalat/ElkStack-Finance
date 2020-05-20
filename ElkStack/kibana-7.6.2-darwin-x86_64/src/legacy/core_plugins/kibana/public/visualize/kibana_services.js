"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setServices = setServices;
exports.getServices = getServices;
exports.clearServices = clearServices;

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
var services = null;

function setServices(newServices) {
  services = newServices;
}

function getServices() {
  if (!services) {
    throw new Error('Kibana services not set - are you trying to import this module from outside of the visualize app?');
  }

  return services;
}

function clearServices() {
  services = null;
}