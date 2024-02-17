'use strict';

var valid_variants = ['normal', 'small-caps', 'inherit'];

const isValid = function isValid(v) {
  return valid_variants.indexOf(v.toLowerCase()) !== -1;
};

const definition = {
  set: function (v) {
    this._setProperty('font-variant', v);
  },
  get: function () {
    return this.getPropertyValue('font-variant');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;