"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detectCURL = detectCURL;
exports.parseCURL = parseCURL;

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
function detectCURLinLine(line) {
  // returns true if text matches a curl request
  return line.match(/^\s*?curl\s+(-X[A-Z]+)?\s*['"]?.*?['"]?(\s*$|\s+?-d\s*?['"])/);
}

function detectCURL(text) {
  // returns true if text matches a curl request
  if (!text) return false;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = text.split('\n')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var line = _step.value;

      if (detectCURLinLine(line)) {
        return true;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return false;
}

function parseCURL(text) {
  var state = 'NONE';
  var out = [];
  var body = [];
  var line = '';
  var lines = text.trim().split('\n');
  var matches;
  var EmptyLine = /^\s*$/;
  var Comment = /^\s*(?:#|\/{2,})(.*)\n?$/;
  var ExecutionComment = /^\s*#!/;
  var ClosingSingleQuote = /^([^']*)'/;
  var ClosingDoubleQuote = /^((?:[^\\"]|\\.)*)"/;
  var EscapedQuotes = /^((?:[^\\"']|\\.)+)/;
  var LooksLikeCurl = /^\s*curl\s+/;
  var CurlVerb = /-X ?(GET|HEAD|POST|PUT|DELETE)/;
  var HasProtocol = /[\s"']https?:\/\//;
  var CurlRequestWithProto = /[\s"']https?:\/\/[^\/ ]+\/+([^\s"']+)/;
  var CurlRequestWithoutProto = /[\s"'][^\/ ]+\/+([^\s"']+)/;
  var CurlData = /^.+\s(--data|-d)\s*/;
  var SenseLine = /^\s*(GET|HEAD|POST|PUT|DELETE)\s+\/?(.+)/;

  if (lines.length > 0 && ExecutionComment.test(lines[0])) {
    lines.shift();
  }

  function nextLine() {
    if (line.length > 0) {
      return true;
    }

    if (lines.length === 0) {
      return false;
    }

    line = lines.shift().replace(/[\r\n]+/g, '\n') + '\n';
    return true;
  }

  function unescapeLastBodyEl() {
    var str = body.pop().replace(/\\([\\"'])/g, '$1');
    body.push(str);
  } // Is the next char a single or double quote?
  // If so remove it


  function detectQuote() {
    if (line.substr(0, 1) === "'") {
      line = line.substr(1);
      state = 'SINGLE_QUOTE';
    } else if (line.substr(0, 1) === '"') {
      line = line.substr(1);
      state = 'DOUBLE_QUOTE';
    } else {
      state = 'UNQUOTED';
    }
  } // Body is finished - append to output with final LF


  function addBodyToOut() {
    if (body.length > 0) {
      out.push(body.join(''));
      body = [];
    }

    state = 'LF';
    out.push('\n');
  } // If the pattern matches, then the state is about to change,
  // so add the capture to the body and detect the next state
  // Otherwise add the whole line


  function consumeMatching(pattern) {
    var result = line.match(pattern);

    if (result) {
      body.push(result[1]);
      line = line.substr(result[0].length);
      detectQuote();
    } else {
      body.push(line);
      line = '';
    }
  }

  function parseCurlLine() {
    var verb = 'GET';
    var request = '';
    var result;

    if (result = line.match(CurlVerb)) {
      verb = result[1];
    } // JS regexen don't support possessive quantifiers, so
    // we need two distinct patterns


    var pattern = HasProtocol.test(line) ? CurlRequestWithProto : CurlRequestWithoutProto;

    if (result = line.match(pattern)) {
      request = result[1];
    }

    out.push(verb + ' /' + request + '\n');

    if (result = line.match(CurlData)) {
      line = line.substr(result[0].length);
      detectQuote();

      if (EmptyLine.test(line)) {
        line = '';
      }
    } else {
      state = 'NONE';
      line = '';
      out.push('');
    }
  }

  while (nextLine()) {
    if (state === 'SINGLE_QUOTE') {
      consumeMatching(ClosingSingleQuote);
    } else if (state === 'DOUBLE_QUOTE') {
      consumeMatching(ClosingDoubleQuote);
      unescapeLastBodyEl();
    } else if (state === 'UNQUOTED') {
      consumeMatching(EscapedQuotes);

      if (body.length) {
        unescapeLastBodyEl();
      }

      if (state === 'UNQUOTED') {
        addBodyToOut();
        line = '';
      }
    } // the BODY state (used to match the body of a Sense request)
    // can be terminated early if it encounters
    // a comment or an empty line
    else if (state === 'BODY') {
        if (Comment.test(line) || EmptyLine.test(line)) {
          addBodyToOut();
        } else {
          body.push(line);
          line = '';
        }
      } else if (EmptyLine.test(line)) {
        if (state !== 'LF') {
          out.push('\n');
          state = 'LF';
        }

        line = '';
      } else if (matches = line.match(Comment)) {
        out.push('#' + matches[1] + '\n');
        state = 'NONE';
        line = '';
      } else if (LooksLikeCurl.test(line)) {
        parseCurlLine();
      } else if (matches = line.match(SenseLine)) {
        out.push(matches[1] + ' /' + matches[2] + '\n');
        line = '';
        state = 'BODY';
      } // Nothing else matches, so output with a prefix of ### for debugging purposes
      else {
          out.push('### ' + line);
          line = '';
        }
  }

  addBodyToOut();
  return out.join('').trim();
}