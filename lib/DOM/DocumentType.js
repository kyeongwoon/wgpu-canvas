'use strict'

import Node, { DOCUMENT_TYPE_NODE } from './Node.js'
import ChildNode from './mixins/ChildNode.js';

class DocumentType extends Node {
	nodeType = DOCUMENT_TYPE_NODE;
	publicId = '';
	systemId = '';
	internalSubset = '';
	name = ''
	constructor() {
		super()
	}
}

Object.assign(DocumentType.prototype, ChildNode)

export default DocumentType;