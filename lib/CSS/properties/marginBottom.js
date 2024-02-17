'use strict';

import { isValid, parser } from './margin.js'
import parsers from '../parseStyle.js'

const definition = {
  set: parsers.subImplicitSetter('margin', 'bottom', isValid, parser),
  get: function () {
    return this.getPropertyValue('margin-bottom');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;
