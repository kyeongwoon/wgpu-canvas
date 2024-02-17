'use strict';

import { parseMeasurement } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('right', parseMeasurement(v));
  },
  get: function () {
    return this.getPropertyValue('right');
  },
  enumerable: true,
  configurable: true,
};

export default definition;