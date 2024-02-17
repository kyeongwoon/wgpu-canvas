'use strict';

import { parseMeasurement } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('left', parseMeasurement(v));
  },
  get: function () {
    return this.getPropertyValue('left');
  },
  enumerable: true,
  configurable: true,
};

export default definition;