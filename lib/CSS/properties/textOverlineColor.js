'use strict';

import { parseColor } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('text-overline-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('text-overline-color');
  },
  enumerable: true,
  configurable: true,
};

export default definition;
