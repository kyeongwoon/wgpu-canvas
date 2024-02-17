'use strict';

import { isValid } from './borderWidth.js';

const definition = {
  set: function (v) {
    if (isValid(v)) {
      this._setProperty('border-left-width', v);
    }
  },
  get: function () {
    return this.getPropertyValue('border-left-width');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;