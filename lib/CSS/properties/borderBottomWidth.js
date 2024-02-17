'use strict';

import { isValid } from './borderWidth.js';

const definition = {
  set: function (v) {
    if (isValid(v)) {
      this._setProperty('border-bottom-width', v);
    }
  },
  get: function () {
    return this.getPropertyValue('border-bottom-width');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
}
export default definition;