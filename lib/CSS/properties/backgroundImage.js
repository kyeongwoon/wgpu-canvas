'use strict';

import parsers from '../parseStyle.js'

var parse = function parse(v) {
  var parsed = parsers.parseUrl(v);
  if (parsed !== undefined) {
    return parsed;
  }
  if (
    parsers.valueType(v) === parsers.TYPES.KEYWORD &&
    (v.toLowerCase() === 'none' || v.toLowerCase() === 'inherit')
  ) {
    return v;
  }
  return undefined;
};

const isValid = function isValid(v) {
  return parse(v) !== undefined;
};

const definition = {
  set: function (v) {
    this._setProperty('background-image', parse(v));
  },
  get: function () {
    return this.getPropertyValue('background-image');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;