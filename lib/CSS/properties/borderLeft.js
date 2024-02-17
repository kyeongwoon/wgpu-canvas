'use strict';

import { shorthandGetter, shorthandSetter } from '../parseStyle.js';
import * as borderLeftWidth from './borderLeftWidth.js'
import * as borderLeftStyle from './borderLeftStyle.js'
import * as borderLeftColor from './borderLeftColor.js'

var shorthand_for = {
  'border-left-width': borderLeftWidth,
  'border-left-style': borderLeftStyle,
  'border-left-color': borderLeftColor,
};

const definition = {
  set: shorthandSetter('border-left', shorthand_for),
  get: shorthandGetter('border-left', shorthand_for),
  enumerable: true,
  configurable: true,
};

export default definition;