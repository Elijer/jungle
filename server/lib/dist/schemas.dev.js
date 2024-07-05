"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stateSchema = void 0;

var _yup = _interopRequireDefault(require("yup"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// This is what an object inside of a state grid can look like
// Players, terrain, and whatever else may follow
var positionSchema = _yup["default"].object({
  x: _yup["default"].number().required(),
  y: _yup["default"].number().required()
});

var stateSchema = _yup["default"].object({
  id: _yup["default"].string().required(),
  position: positionSchema,
  geometry: _yup["default"].string().required(),
  color: _yup["default"].string(),
  layer: _yup["default"].string().required(),
  action: _yup["default"].string().required()
});

exports.stateSchema = stateSchema;