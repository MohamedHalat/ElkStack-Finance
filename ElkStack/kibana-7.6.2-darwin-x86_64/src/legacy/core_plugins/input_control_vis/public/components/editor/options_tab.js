"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OptionsTab = void 0;

var _react = _interopRequireWildcard(require("react"));

var _eui = require("@elastic/eui");

var _react2 = require("@kbn/i18n/react");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var OptionsTab =
/*#__PURE__*/
function (_PureComponent) {
  _inherits(OptionsTab, _PureComponent);

  function OptionsTab() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, OptionsTab);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(OptionsTab)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "handleUpdateFiltersChange", function (event) {
      _this.props.setValue('updateFiltersOnChange', event.target.checked);
    });

    _defineProperty(_assertThisInitialized(_this), "handleUseTimeFilter", function (event) {
      _this.props.setValue('useTimeFilter', event.target.checked);
    });

    _defineProperty(_assertThisInitialized(_this), "handlePinFilters", function (event) {
      _this.props.setValue('pinFilters', event.target.checked);
    });

    return _this;
  }

  _createClass(OptionsTab, [{
    key: "render",
    value: function render() {
      return _react.default.createElement(_eui.EuiForm, null, _react.default.createElement(_eui.EuiFormRow, {
        id: "updateFiltersOnChange"
      }, _react.default.createElement(_eui.EuiSwitch, {
        label: _react.default.createElement(_react2.FormattedMessage, {
          id: "inputControl.editor.optionsTab.updateFilterLabel",
          defaultMessage: "Update Kibana filters on each change"
        }),
        checked: this.props.stateParams.updateFiltersOnChange,
        onChange: this.handleUpdateFiltersChange,
        "data-test-subj": "inputControlEditorUpdateFiltersOnChangeCheckbox"
      })), _react.default.createElement(_eui.EuiFormRow, {
        id: "useTimeFilter"
      }, _react.default.createElement(_eui.EuiSwitch, {
        label: _react.default.createElement(_react2.FormattedMessage, {
          id: "inputControl.editor.optionsTab.useTimeFilterLabel",
          defaultMessage: "Use time filter"
        }),
        checked: this.props.stateParams.useTimeFilter,
        onChange: this.handleUseTimeFilter,
        "data-test-subj": "inputControlEditorUseTimeFilterCheckbox"
      })), _react.default.createElement(_eui.EuiFormRow, {
        id: "pinFilters"
      }, _react.default.createElement(_eui.EuiSwitch, {
        label: _react.default.createElement(_react2.FormattedMessage, {
          id: "inputControl.editor.optionsTab.pinFiltersLabel",
          defaultMessage: "Pin filters for all applications"
        }),
        checked: this.props.stateParams.pinFilters,
        onChange: this.handlePinFilters,
        "data-test-subj": "inputControlEditorPinFiltersCheckbox"
      })));
    }
  }]);

  return OptionsTab;
}(_react.PureComponent);

exports.OptionsTab = OptionsTab;