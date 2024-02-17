'use strict';

const definition = {
  set: function (v) {
    this._setProperty('float', v);
  },
  get: function () {
    return this.getPropertyValue('float');
  },
  enumerable: true,
  configurable: true,
};

export default definition;