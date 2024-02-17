'use strict';

import { parseMeasurement } from '../parseStyle.js';

function parse(v) {
  if (String(v).toLowerCase() === 'auto') {
    return 'auto';
  }
  if (String(v).toLowerCase() === 'inherit') {
    return 'inherit';
  }
  return parseMeasurement(v);
}

const isValid = function isValid(v) {
  return parse(v) !== undefined;
};

const definition = {
  set: function (v) {
    this._setProperty('flex-basis', parse(v));
  },
  get: function () {
    return this.getPropertyValue('flex-basis');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;
