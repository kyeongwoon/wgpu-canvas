'use strict';

import {isValid, parser} from './padding.js';
import parsers from '../parseStyle.js'

const definition = {
  set: parsers.subImplicitSetter('padding', 'top', isValid, parser),
  get: function () {
    return this.getPropertyValue('padding-top');
  },
  enumerable: true,
  configurable: true,
};
export {
  isValid,
  definition
};
export default definition;
