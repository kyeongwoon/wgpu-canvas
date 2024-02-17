'use strict';

import { parseColor } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('-webkit-border-after-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-border-after-color');
  },
  enumerable: true,
  configurable: true,
};

export default definition;