'use strict';

import parsers from '../parseStyle.js'
import { implicitSetter } from '../parseStyle.js';

const isValid = function parse(v) {
  if (typeof v !== 'string') {
    return false;
  }
  return (
    v === '' || v.toLowerCase() === 'transparent' || parsers.valueType(v) === parsers.TYPES.COLOR
  );
};

var parser = function (v) {
  if (isValid(v)) {
    return v.toLowerCase();
  }
  return undefined;
};

const definition = {
  set: implicitSetter('border', 'color', isValid, parser),
  get: function () {
    return this.getPropertyValue('border-color');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};
export default definition;