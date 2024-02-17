'use strict';

import { TYPES, valueType, shorthandParser, shorthandSetter, shorthandGetter } from '../parseStyle.js'
import * as fontFamily from './fontFamily.js'
import * as fontSize from './fontSize.js'
import * as fontStyle from './fontStyle.js'
import * as fontVariant from './fontVariant.js'
import * as fontWeight from './fontWeight.js'
import * as lineHeight from './lineHeight.js'

var shorthand_for = {
  'font-family': fontFamily,
  'font-size': fontSize,
  'font-style': fontStyle,
  'font-variant': fontVariant,
  'font-weight': fontWeight,
  'line-height': lineHeight,
};

var static_fonts = [
  'caption',
  'icon',
  'menu',
  'message-box',
  'small-caption',
  'status-bar',
  'inherit',
];

var setter = shorthandSetter('font', shorthand_for);

const definition = {
  set: function (v) {
    var short = shorthandParser(v, shorthand_for);
    if (short !== undefined) {
      return setter.call(this, v);
    }
    if (valueType(v) === TYPES.KEYWORD && static_fonts.indexOf(v.toLowerCase()) !== -1) {
      this._setProperty('font', v);
    }
  },
  get: shorthandGetter('font', shorthand_for),
  enumerable: true,
  configurable: true,
};

export default definition;