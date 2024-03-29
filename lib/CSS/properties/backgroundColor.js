'use strict';

import parsers from '../parseStyle.js'

var parse = function parse(v) {
  var parsed = parsers.parseColor(v);
  if (parsed !== undefined) {
    return parsed;
  }
  if (
    parsers.valueType(v) === parsers.TYPES.KEYWORD &&
    (v.toLowerCase() === 'transparent' || v.toLowerCase() === 'inherit')
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
    var parsed = parse(v);
    if (parsed === undefined) {
      return;
    }
    this._setProperty('background-color', parsed);
  },
  get: function () {
    return this.getPropertyValue('background-color');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;