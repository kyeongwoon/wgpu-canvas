'use strict';

import { parseNumber } from '../parseStyle.js';

const POSITION_AT_SHORTHAND = {
  first: 0,
  second: 1,
};


const isValid = function isValid(v, positionAtFlexShorthand) {
  return parseNumber(v) !== undefined && positionAtFlexShorthand === POSITION_AT_SHORTHAND.first;
};

const definition = {
  set: function (v) {
    this._setProperty('flex-grow', parseNumber(v));
  },
  get: function () {
    return this.getPropertyValue('flex-grow');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;