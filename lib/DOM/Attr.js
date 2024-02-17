'use strict'

import Node from "./Node.js";
import { HTML_NS } from './NameSpace.js'

class Attr extends Node {
    nodeType = Node.ATTRIBUTE_NODE;
    namespaceURI = null;
	prefix = null;
	localName = '';
    // name = nodeName
    value = null;
    ownerElement = null;
    specified = true;

    constructor() {
        super()
        this.namespaceURI = null;

    }
    hasChildNodes() { return false; }

    // TODO
    get specified() {
        return false;
    }

    get nodeValue() { return this.value }
    set nodeValue(val) { this.value = val }

    get textContent() { return this.value }
    set textContent(val) { this.value = val }

    get name() { return this.nodeName }
    set name(v) {
        this.nodeName = this.namespaceURI === HTML_NS ? v.toLowerCase() : v
    }
}

export default Attr;
