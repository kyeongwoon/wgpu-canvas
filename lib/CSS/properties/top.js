'use strict';

import { parseMeasurement } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('top', parseMeasurement(v));
  },
  get: function () {
    return this.getPropertyValue('top');
  },
  enumerable: true,
  configurable: true,
};

export default definition;