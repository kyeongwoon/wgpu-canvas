'use strict';

var valid_weights = [
  'normal',
  'bold',
  'bolder',
  'lighter',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  'inherit',
];

const isValid = function isValid(v) {
  return valid_weights.indexOf(v.toLowerCase()) !== -1;
};

const definition = {
  set: function (v) {
    this._setProperty('font-weight', v);
  },
  get: function () {
    return this.getPropertyValue('font-weight');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;