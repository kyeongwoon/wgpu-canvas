'use strict';

import { parseColor } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('-webkit-text-emphasis-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-text-emphasis-color');
  },
  enumerable: true,
  configurable: true,
};

export default definition;