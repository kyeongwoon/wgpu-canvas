'use strict';

import { parseColor } from '../parseStyle.js';

const definition = {
  set: function (v) {
    this._setProperty('color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('color');
  },
  enumerable: true,
  configurable: true,
};
export default definition;