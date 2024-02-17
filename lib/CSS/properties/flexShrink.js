'use strict';

import { parseNumber } from '../parseStyle.js';

const POSITION_AT_SHORTHAND = {
  first: 0,
  second: 1,
};

const isValid = function isValid(v, positionAtFlexShorthand) {
  return parseNumber(v) !== undefined && positionAtFlexShorthand === POSITION_AT_SHORTHAND.second;
};

const definition = {
  set: function (v) {
    this._setProperty('flex-shrink', parseNumber(v));
  },
  get: function () {
    return this.getPropertyValue('flex-shrink');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;