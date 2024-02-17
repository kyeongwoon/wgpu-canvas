'use strict';

import { parseKeyword } from '../parseStyle.js';

var clear_keywords = ['none', 'left', 'right', 'both', 'inherit'];

const definition = {
  set: function (v) {
    this._setProperty('clear', parseKeyword(v, clear_keywords));
  },
  get: function () {
    return this.getPropertyValue('clear');
  },
  enumerable: true,
  configurable: true,
};

export default definition;