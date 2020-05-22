"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildNodeParams = buildNodeParams;
exports.toElasticsearchQuery = toElasticsearchQuery;

var _lodash = _interopRequireDefault(require("lodash"));

var _node_types = require("../node_types");

var ast = _interopRequireWildcard(require("../ast"));

var _filters = require("../../filters");

var _get_fields = require("./utils/get_fields");

var _utils = require("../../utils");

var _get_full_field_name_node = require("./utils/get_full_field_name_node");

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
function buildNodeParams(fieldName, params) {
  params = _lodash.default.pick(params, 'gt', 'lt', 'gte', 'lte', 'format');
  const fieldNameArg = typeof fieldName === 'string' ? ast.fromLiteralExpression(fieldName) : _node_types.nodeTypes.literal.buildNode(fieldName);

  const args = _lodash.default.map(params, (value, key) => {
    return _node_types.nodeTypes.namedArg.buildNode(key, value);
  });

  return {
    arguments: [fieldNameArg, ...args]
  };
}

function toElasticsearchQuery(node, indexPattern = null, config = {}, context = {}) {
  const [fieldNameArg, ...args] = node.arguments;
  const fullFieldNameArg = (0, _get_full_field_name_node.getFullFieldNameNode)(fieldNameArg, indexPattern, context.nested ? context.nested.path : undefined);
  const fields = indexPattern ? (0, _get_fields.getFields)(fullFieldNameArg, indexPattern) : [];
  const namedArgs = extractArguments(args);

  const queryParams = _lodash.default.mapValues(namedArgs, ast.toElasticsearchQuery); // If no fields are found in the index pattern we send through the given field name as-is. We do this to preserve
  // the behaviour of lucene on dashboards where there are panels based on different index patterns that have different
  // fields. If a user queries on a field that exists in one pattern but not the other, the index pattern without the
  // field should return no results. It's debatable whether this is desirable, but it's been that way forever, so we'll
  // keep things familiar for now.


  if (fields && fields.length === 0) {
    fields.push({
      name: ast.toElasticsearchQuery(fullFieldNameArg),
      scripted: false
    });
  }

  const queries = fields.map(field => {
    const wrapWithNestedQuery = query => {
      // Wildcards can easily include nested and non-nested fields. There isn't a good way to let
      // users handle this themselves so we automatically add nested queries in this scenario.
      if (!fullFieldNameArg.type === 'wildcard' || !_lodash.default.get(field, 'subType.nested') || context.nested) {
        return query;
      } else {
        return {
          nested: {
            path: field.subType.nested.path,
            query,
            score_mode: 'none'
          }
        };
      }
    };

    if (field.scripted) {
      return {
        script: (0, _filters.getRangeScript)(field, queryParams)
      };
    } else if (field.type === 'date') {
      const timeZoneParam = config.dateFormatTZ ? {
        time_zone: (0, _utils.getTimeZoneFromSettings)(config.dateFormatTZ)
      } : {};
      return wrapWithNestedQuery({
        range: {
          [field.name]: { ...queryParams,
            ...timeZoneParam
          }
        }
      });
    }

    return wrapWithNestedQuery({
      range: {
        [field.name]: queryParams
      }
    });
  });
  return {
    bool: {
      should: queries,
      minimum_should_match: 1
    }
  };
}

function extractArguments(args) {
  if (args.gt && args.gte || args.lt && args.lte) {
    throw new Error('range ends cannot be both inclusive and exclusive');
  }

  const unnamedArgOrder = ['gte', 'lte', 'format'];
  return args.reduce((acc, arg, index) => {
    if (arg.type === 'namedArg') {
      acc[arg.name] = arg.value;
    } else {
      acc[unnamedArgOrder[index]] = arg;
    }

    return acc;
  }, {});
}