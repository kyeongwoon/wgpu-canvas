'use strict';

import { shorthandGetter, shorthandSetter } from '../parseStyle.js';
import * as borderRightWidth from './borderRightWidth.js'
import * as borderRightStyle from './borderRightStyle.js'
import * as borderRightColor from './borderRightColor.js'


var shorthand_for = {
  'border-right-width': borderRightWidth,
  'border-right-style': borderRightStyle,
  'border-right-color': borderRightColor,
};

const definition = {
  set: shorthandSetter('border-right', shorthand_for),
  get: shorthandGetter('border-right', shorthand_for),
  enumerable: true,
  configurable: true,
};

export default definition;