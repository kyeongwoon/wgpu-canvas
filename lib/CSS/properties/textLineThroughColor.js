'use strict';

import { parseColor } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('text-line-through-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('text-line-through-color');
  },
  enumerable: true,
  configurable: true,
};

export default definition;