'use strict';

import { implicitSetter } from '../parseStyle.js';
// the valid border-styles:
var styles = [
  'none',
  'hidden',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
];

const isValid = function parse(v) {
  return typeof v === 'string' && (v === '' || styles.indexOf(v) !== -1);
};

var parser = function (v) {
  if (isValid(v)) {
    return v.toLowerCase();
  }
  return undefined;
};

const definition = {
  set: implicitSetter('border', 'style', isValid, parser),
  get: function () {
    return this.getPropertyValue('border-style');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};
export default definition;