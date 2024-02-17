'use strict';

import parsers from '../parseStyle.js'

const isValid = (function isValid(v) {
  return (
    parsers.valueType(v) === parsers.TYPES.KEYWORD &&
    (v.toLowerCase() === 'scroll' || v.toLowerCase() === 'fixed' || v.toLowerCase() === 'inherit')
  );
});

const definition = {
  set: function (v) {
    if (!isValid(v)) {
      return;
    }
    this._setProperty('background-attachment', v);
  },
  get: function () {
    return this.getPropertyValue('background-attachment');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;