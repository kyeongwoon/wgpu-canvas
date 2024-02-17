'use strict';

import { shorthandGetter, shorthandSetter } from '../parseStyle.js';

import * as borderBottomWidth from './borderBottomWidth.js'
import * as borderBottomStyle from './borderBottomStyle.js'
import * as borderBottomColor from './borderBottomColor.js'

var shorthand_for = {
  'border-bottom-width': borderBottomWidth,
  'border-bottom-style':borderBottomStyle,
  'border-bottom-color': borderBottomColor,
};

const definition = {
  set: shorthandSetter('border-bottom', shorthand_for),
  get: shorthandGetter('border-bottom', shorthand_for),
  enumerable: true,
  configurable: true,
};
export default definition;
