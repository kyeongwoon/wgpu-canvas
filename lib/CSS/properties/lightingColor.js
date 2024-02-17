'use strict';

import { parseColor } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('lighting-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('lighting-color');
  },
  enumerable: true,
  configurable: true,
};

export default definition;