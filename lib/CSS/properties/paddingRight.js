'use strict';

import {isValid, parser} from './padding.js';
import parsers from '../parseStyle.js'

const definition = {
  set: parsers.subImplicitSetter('padding', 'right', isValid, parser),
  get: function () {
    return this.getPropertyValue('padding-right');
  },
  enumerable: true,
  configurable: true,
};

export {
  isValid,
  definition
};

export default definition;