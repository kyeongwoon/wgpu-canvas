'use strict';

import { shorthandGetter, shorthandSetter } from '../parseStyle.js';
import * as borderWidth from './borderWidth.js'
import * as borderStyle from './borderStyle.js'
import * as borderColor from './borderColor.js'

var shorthand_for = {
  'border-width': borderWidth,
  'border-style': borderStyle,
  'border-color': borderColor,
};

var myShorthandSetter = shorthandSetter('border', shorthand_for);
var myShorthandGetter = shorthandGetter('border', shorthand_for);

const definition = {
  set: function (v) {
    if (v.toString().toLowerCase() === 'none') {
      v = '';
    }
    myShorthandSetter.call(this, v);
    this.removeProperty('border-top');
    this.removeProperty('border-left');
    this.removeProperty('border-right');
    this.removeProperty('border-bottom');
    this._values['border-top'] = this._values.border;
    this._values['border-left'] = this._values.border;
    this._values['border-right'] = this._values.border;
    this._values['border-bottom'] = this._values.border;
  },
  get: myShorthandGetter,
  enumerable: true,
  configurable: true,
};

export default definition;