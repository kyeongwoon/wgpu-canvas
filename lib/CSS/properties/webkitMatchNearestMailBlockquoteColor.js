'use strict';

import { parseColor } from '../parseStyle.js'

const definition = {
  set: function (v) {
    this._setProperty('-webkit-match-nearest-mail-blockquote-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-match-nearest-mail-blockquote-color');
  },
  enumerable: true,
  configurable: true,
};

export default definition;
