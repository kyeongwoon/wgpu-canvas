'use strict';

import { shorthandGetter, shorthandSetter } from '../parseStyle.js';
import * as borderTopWidth from './borderTopWidth.js'
import * as borderTopStyle from './borderTopStyle.js'
import * as borderTopColor from './borderTopColor.js'


var shorthand_for = {
  'border-top-width': borderTopWidth,
  'border-top-style':borderTopStyle,
  'border-top-color': borderTopColor,
};

const definition = {
  set: shorthandSetter('border-top', shorthand_for),
  get: shorthandGetter('border-top', shorthand_for),
  enumerable: true,
  configurable: true,
};
export default definition;