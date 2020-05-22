"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCookieSessionStorageFactory = createCookieSessionStorageFactory;

var _hapiAuthCookie = _interopRequireDefault(require("hapi-auth-cookie"));

var _router = require("./router");

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
class ScopedCookieSessionStorage {
  constructor(log, server, request) {
    this.log = log;
    this.server = server;
    this.request = request;
  }

  async get() {
    try {
      const session = await this.server.auth.test('security-cookie', this.request); // A browser can send several cookies, if it's not an array, just return the session value

      if (!Array.isArray(session)) {
        return session;
      } // If we have an array with one value, we're good also


      if (session.length === 1) {
        return session[0];
      } // Otherwise, we have more than one and won't be authing the user because we don't
      // know which session identifies the actual user. There's potential to change this behavior
      // to ensure all valid sessions identify the same user, or choose one valid one, but this
      // is the safest option.


      this.log.warn(`Found ${session.length} auth sessions when we were only expecting 1.`);
      return null;
    } catch (error) {
      this.log.debug(String(error));
      return null;
    }
  }

  set(sessionValue) {
    return this.request.cookieAuth.set(sessionValue);
  }

  clear() {
    return this.request.cookieAuth.clear();
  }

}
/**
 * Creates SessionStorage factory, which abstract the way of
 * session storage implementation and scoping to the incoming requests.
 *
 * @param server - hapi server to create SessionStorage for
 * @param cookieOptions - cookies configuration
 */


async function createCookieSessionStorageFactory(log, server, cookieOptions, basePath) {
  function clearInvalidCookie(req, path = basePath || '/') {
    // if the cookie did not include the 'path' attribute in the session value, it is a legacy cookie
    // we will assume that the cookie was created with the current configuration
    log.debug(`Clearing invalid session cookie`); // need to use Hapi toolkit to clear cookie with defined options

    if (req) {
      req.cookieAuth.h.unstate(cookieOptions.name, {
        path
      });
    }
  }

  await server.register({
    plugin: _hapiAuthCookie.default
  });
  server.auth.strategy('security-cookie', 'cookie', {
    cookie: cookieOptions.name,
    password: cookieOptions.encryptionKey,
    validateFunc: async (req, session) => {
      const result = cookieOptions.validate(session);

      if (!result.isValid) {
        clearInvalidCookie(req, result.path);
      }

      return {
        valid: result.isValid
      };
    },
    isSecure: cookieOptions.isSecure,
    path: basePath,
    clearInvalid: false,
    isHttpOnly: true,
    isSameSite: false
  });
  return {
    asScoped(request) {
      return new ScopedCookieSessionStorage(log, server, (0, _router.ensureRawRequest)(request));
    }

  };
}