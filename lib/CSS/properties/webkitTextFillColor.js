'use strict';

import { parseColor } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('-webkit-text-fill-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-text-fill-color');
  },
  enumerable: true,
  configurable: true,
};

export default definition;