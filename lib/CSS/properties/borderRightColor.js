'use strict';

import { isValid } from './borderColor.js';

const definition = {
  set: function (v) {
    if (isValid(v)) {
      this._setProperty('border-right-color', v);
    }
  },
  get: function () {
    return this.getPropertyValue('border-right-color');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;