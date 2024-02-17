'use strict';

import { parseMeasurement } from '../parseStyle.js';

const definition = {
  set: function (v) {
    this._setProperty('bottom', parseMeasurement(v));
  },
  get: function () {
    return this.getPropertyValue('bottom');
  },
  enumerable: true,
  configurable: true,
};

export default definition;