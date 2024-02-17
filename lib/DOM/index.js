'use strict';

import DOMException from './DOMException.js';
import NodeList from './NodeList.js'
import Node from './Node.js'
import impl from './DOMImplementation.js';
import NamedNodeMap from './NamedNodeMap.js'
import Element from './Element.js';
import Attr from './Attr.js'
import CharacterData from './CharacterData.js'
import Text from './Text.js'
import Comment from './Comment.js'
import CDATASection from './CDATASection.js';
import XMLSerializer from './XMLSerializer.js';
import DOMParser from './DOMParser.js';
import { fileURLToPath } from "url";

global.__dirname = fileURLToPath(new URL(".", import.meta.url));
global.__filename = fileURLToPath(import.meta.url);

// Application...
if(!globalThis.document) {
    global.document = globalThis.document =  impl.createHTMLDocument();
}

export {
    DOMException,
    DOMParser,
}
