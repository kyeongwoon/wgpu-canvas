'use strict';

import parsers from '../parseStyle.js'

var parse = function parse(v) {
  if (
    parsers.valueType(v) === parsers.TYPES.KEYWORD &&
    (v.toLowerCase() === 'repeat' ||
      v.toLowerCase() === 'repeat-x' ||
      v.toLowerCase() === 'repeat-y' ||
      v.toLowerCase() === 'no-repeat' ||
      v.toLowerCase() === 'inherit')
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
    this._setProperty('background-repeat', parse(v));
  },
  get: function () {
    return this.getPropertyValue('background-repeat');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;