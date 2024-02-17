'use strict';

import { isValid, parser } from './margin.js'
import parsers from '../parseStyle.js'

const definition = {
  set: parsers.subImplicitSetter('margin', 'top', isValid, parser),
  get: function () {
    return this.getPropertyValue('margin-top');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;