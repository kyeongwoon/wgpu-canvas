'use strict'

import Node, {TEXT_NODE, CDATA_SECTION_NODE, COMMENT_NODE, DOCUMENT_FRAGMENT_NODE} from './Node.js'
import elementAccess from './mixins/elementAccess.js';
import ParentNode from './mixins/ParentNode.js';
import NonElementParentNode from './mixins/NonElementParentNode.js';

class DocumentFragment extends Node {
    nodeName = '#document-fragment';
    nodeType = DOCUMENT_FRAGMENT_NODE;
	//name = '';
	constructor() {
		super();
	}

	get textContent() {
		if (this.nodeType === TEXT_NODE) return this.data
		if (this.nodeType === CDATA_SECTION_NODE) return this.data
		if (this.nodeType === COMMENT_NODE) return this.data

		return this.childNodes.reduce(function (last, current) { return last + current.textContent }, '')
	}

	set textContent(text) {
		if (this.nodeType === TEXT_NODE || this.nodeType === CDATA_SECTION_NODE || this.nodeType === COMMENT_NODE) {
			this.data = text
			return
		}
		this.childNodes = []
		this.appendChild(this.ownerDocument.createTextNode(text))
	}
}

Object.assign(DocumentFragment.prototype, elementAccess)
Object.assign(DocumentFragment.prototype, ParentNode)
Object.defineProperties(DocumentFragment.prototype, Object.getOwnPropertyDescriptors(ParentNode))

Object.assign(DocumentFragment.prototype, NonElementParentNode)


export default DocumentFragment;