'use strict';

import { parseColor } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('-webkit-border-end-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-border-end-color');
  },
  enumerable: true,
  configurable: true,
};

export default definition;
