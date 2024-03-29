'use strict';

import parsers from '../parseStyle.js'

var parse = function parse(v) {
  if (
    parsers.valueType(v) === parsers.TYPES.KEYWORD &&
    (v.toLowerCase() === 'collapse' ||
      v.toLowerCase() === 'separate' ||
      v.toLowerCase() === 'inherit')
  ) {
    return v;
  }
  return undefined;
};

const definition = {
  set: function (v) {
    this._setProperty('border-collapse', parse(v));
  },
  get: function () {
    return this.getPropertyValue('border-collapse');
  },
  enumerable: true,
  configurable: true,
};

export default definition;