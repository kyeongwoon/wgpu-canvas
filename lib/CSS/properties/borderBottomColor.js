'use strict';

import { isValid } from './borderColor.js';

const definition = {
  set: function (v) {
    if (isValid(v)) {
      this._setProperty('border-bottom-color', v);
    }
  },
  get: function () {
    return this.getPropertyValue('border-bottom-color');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;