'use strict';

import { parseColor } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('-webkit-column-rule-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-column-rule-color');
  },
  enumerable: true,
  configurable: true,
};

export default definition;