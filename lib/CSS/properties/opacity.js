'use strict';

import { parseNumber } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('opacity', parseNumber(v));
  },
  get: function () {
    return this.getPropertyValue('opacity');
  },
  enumerable: true,
  configurable: true,
};

export default definition;