'use strict';

import { isValid, parser } from './margin.js'
import parsers from '../parseStyle.js'

const definition = {
  set: parsers.subImplicitSetter('margin', 'right', isValid, parser),
  get: function () {
    return this.getPropertyValue('margin-right');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;