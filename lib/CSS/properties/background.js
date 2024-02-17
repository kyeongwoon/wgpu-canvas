'use strict';

import { shorthandGetter, shorthandSetter } from '../parseStyle.js';

import * as backgroundColor from './backgroundColor.js';
import * as backgroundImage from './backgroundImage.js';
import * as backgroundRepeat from './backgroundRepeat.js';
import * as backgroundAttachment from './backgroundAttachment.js';
import * as backgroundPosition from './backgroundPosition.js';

var shorthand_for = {
  'background-color': backgroundColor,
  'background-image': backgroundImage,
  'background-repeat': backgroundRepeat,
  'background-attachment': backgroundAttachment,
  'background-position': backgroundPosition,
};

const definition = {
  set: shorthandSetter('background', shorthand_for),
  get: shorthandGetter('background', shorthand_for),
  enumerable: true,
  configurable: true,
};

export default definition;