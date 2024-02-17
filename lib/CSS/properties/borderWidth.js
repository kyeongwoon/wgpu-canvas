'use strict';

import parsers from '../parseStyle.js'
import { implicitSetter } from '../parseStyle.js';

// the valid border-widths:
var widths = ['thin', 'medium', 'thick'];

const isValid = function parse(v) {
  var length = parsers.parseLength(v);
  if (length !== undefined) {
    return true;
  }
  if (typeof v !== 'string') {
    return false;
  }
  if (v === '') {
    return true;
  }
  v = v.toLowerCase();
  if (widths.indexOf(v) === -1) {
    return false;
  }
  return true;
};

var parser = function (v) {
  var length = parsers.parseLength(v);
  if (length !== undefined) {
    return length;
  }
  if (isValid(v)) {
    return v.toLowerCase();
  }
  return undefined;
};

const definition = {
  set: implicitSetter('border', 'width', isValid, parser),
  get: function () {
    return this.getPropertyValue('border-width');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};
export default definition;