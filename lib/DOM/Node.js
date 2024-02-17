'use strict'

import NodeList from './NodeList.js';
import DOMException, { NOT_SUPPORTED_ERR } from './DOMException.js';
import { HTML_NS } from './NameSpace.js'

class Node extends EventTarget {
	nodeType = null;
	nodeName = null;
	baseURI = null;
	ownerDocument = null;
	parentNode = null;
	//parentElement = null;
	childNodes = new NodeList();
	// firstChild
	// lastChild
	// previousSibling
	// nextSibling
	// textContent
	// nodeValue

	constructor() {
		super();
	}
	get isConnected() { return true }
	get parentElement() {
		return (this.parentNode && this.parentNode.nodeType === ELEMENT_NODE) ? this.parentNode : null;
	}

	get nextSibling() {
		const child = this.parentNode && this.parentNode.childNodes[this.parentNode.childNodes.indexOf(this) + 1]
		return child || null
	}

	get previousSibling() {
		const child = this.parentNode && this.parentNode.childNodes[this.parentNode.childNodes.indexOf(this) - 1]
		return child || null
	}

	get lastChild() {
		return this.childNodes.at(-1) || null
	}

	get firstChild() {
		return this.childNodes[0] || null
	}
	get nodeValue() { return null }
	set nodeValue(v) { }

	get textContent() { return null }
	set textContent(text) { }

	// method
	getRootNode(composed = false) {
		if (composed) {
			// shadow-including root
			throw new DOMException(NOT_SUPPORTED_ERR);
		} else {
			if (!this.parentNode || this.nodeType === DOCUMENT_NODE) return this
			return this.parentNode.getRootNode()
		}
	}

	hasChildNodes() {
		return this.firstChild !== null;
	}

	normalize() {
		let child = this.firstChild;
		while (child) {
			const next = child.nextSibling;
			if (next && next.nodeType === TEXT_NODE && child.nodeType === TEXT_NODE) {
				this.removeChild(next);
				child.appendData(next.data);
			} else {
				child.normalize();
				child = next;
			}
		}
	}

	cloneNode(deep) {
		const doc = this.ownerDocument || this;
		const node = this;

		const node2 = new node.constructor();
		node2.ownerDocument = doc;

		for (const prop in node) {
			if (Object.prototype.hasOwnProperty.call(node, prop)) {
				const v = node[prop];
				if (typeof v !== 'object') {
					if (v !== node2[prop]) {
						node2[prop] = v;
					}
				}
			}
		}
		switch (node2.nodeType) {
			case ELEMENT_NODE:
				for (let i = 0; i < node.attributes.length; i++) {
					const attr = node.attributes.item(i).cloneNode(true);
					node2.setAttributeNode(attr);
				}
				break;
			case ATTRIBUTE_NODE:
				deep = true;
				break;
		}
		if (deep) {
			let child = node.firstChild;
			while (child) {
				node2.appendChild(child.cloneNode(deep));
				child = child.nextSibling;
			}
		}
		return node2;
	}

	isEqualNode(node) {
		this.normalize()
		node.normalize()

		let bool = this.nodeName === node.nodeName
		bool = bool && this.localName === node.localName
		bool = bool && this.namespaceURI === node.namespaceURI
		bool = bool && this.prefix === node.prefix
		bool = bool && this.nodeValue === node.nodeValue

		bool = bool && this.childNodes.length === node.childNodes.length

		// dont check children recursively when the count doesnt event add up
		if (!bool) return false

		bool = bool && !this.childNodes.reduce((last, curr, index) => {
			return last && curr.isEqualNode(node.childNodes[index])
		}, true)

		if (this.nodeType === DOCUMENT_TYPE_NODE && node.nodeType === DOCUMENT_TYPE_NODE) {
			bool = bool && this.publicId === node.publicId
			bool = bool && this.systemId === node.systemId
			bool = bool && this.internalSubset === node.internalSubset
		}
		return bool
	}

	isSameNode(node) {
		return this === node
	}

	compareDocumentPosition(other) {
		if (this === other) return 0;
		var node1 = other;
		var node2 = this;
		var attr1 = null;
		var attr2 = null;
		if (node1 instanceof Attr) {
			attr1 = node1;
			node1 = attr1.ownerElement;
		}
		if (node2 instanceof Attr) {
			attr2 = node2;
			node2 = attr2.ownerElement;
			if (attr1 && node1 && node2 === node1) {
				for (var i = 0, attr; (attr = node2.attributes[i]); i++) {
					if (attr === attr1) return DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + DOCUMENT_POSITION_PRECEDING;
					if (attr === attr2) return DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + DOCUMENT_POSITION_FOLLOWING;
				}
			}
		}
		if (!node1 || !node2 || node2.ownerDocument !== node1.ownerDocument) {
			return (
				DOCUMENT_POSITION_DISCONNECTED +
				DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC +
				(docGUID(node2.ownerDocument) > docGUID(node1.ownerDocument) ? DOCUMENT_POSITION_FOLLOWING : DOCUMENT_POSITION_PRECEDING)
			);
		}
		var chain1 = parentChain(node1);
		var chain2 = parentChain(node2);
		if ((!attr1 && chain2.indexOf(node1) >= 0) || (attr2 && node1 === node2)) {
			return DOCUMENT_POSITION_CONTAINS + DOCUMENT_POSITION_PRECEDING;
		}
		if ((!attr2 && chain1.indexOf(node2) >= 0) || (attr1 && node1 === node2)) {
			return DOCUMENT_POSITION_CONTAINED_BY + DOCUMENT_POSITION_FOLLOWING;
		}
		var ca = commonAncestor(chain2, chain1);
		for (const n in ca.childNodes) {
			var child = ca.childNodes[n];
			if (child === node2) return DOCUMENT_POSITION_FOLLOWING;
			if (child === node1) return DOCUMENT_POSITION_PRECEDING;
			if (chain2.indexOf(child) >= 0) return DOCUMENT_POSITION_FOLLOWING;
			if (chain1.indexOf(child) >= 0) return DOCUMENT_POSITION_PRECEDING;
		}
		return 0;
	}

	contains(node) {
		if (node === this) return false
		while (node.parentNode) {
			if (node === this) return true
			node = node.parentNode
		}
		return false
	}

	lookupPrefix(namespaceURI) {
		if (!namespaceURI) {
			return null
		}

		const type = this.nodeType

		switch (type) {
			case Node.ELEMENT_NODE:
				return this._lookupNamespacePrefix(namespaceURI, this)
			case Node.DOCUMENT_NODE:
				return this.documentElement._lookupNamespacePrefix(namespaceURI)
			case Node.ENTITY_NODE:
			case Node.NOTATION_NODE:
			case Node.DOCUMENT_FRAGMENT_NODE:
			case Node.DOCUMENT_TYPE_NODE:
				return null // type is unknown
			case Node.ATTRIBUTE_NODE:
				if (this.ownerElement) {
					return this.ownerElement._lookupNamespacePrefix(namespaceURI)
				}
				return null
			default:
				// EntityReferences may have to be skipped to get to it
				if (this.parentNode) {
					return this.parentNode._lookupNamespacePrefix(namespaceURI)
				}
				return null
		}
	}


	lookupNamespaceURI(prefix) {
		switch (this.nodeType) {
			case Node.ELEMENT_NODE:
				if (this.namespaceURI != null && this.prefix === prefix) {
					// Note: prefix could be "null" in this case we are looking for default namespace
					return this.namespaceURI
				}

				for (const [key, val] of this.attrs.entries()) {
					if (!key.includes(':')) continue

					const [attrPrefix, name] = key.split(':')
					if (attrPrefix === 'xmlns' && name === prefix) {
						if (val != null) {
							return val
						}
						return null
						// FIXME: Look up if prefix or attrPrefix
					} else if (name === 'xmlns' && prefix == null) {
						if (val != null) {
							return val
						}
						return null
					}
				}

				// EntityReferences may have to be skipped to get to it
				if (this.parentNode) {
					return this.parentNode.lookupNamespaceURI(prefix)
				}
				return null
			case Node.DOCUMENT_NODE:
				return this.documentElement.lookupNamespaceURI(prefix)
			case Node.ENTITY_NODE:
			case Node.NOTATION_NODE:
			case Node.DOCUMENT_TYPE_NODE:
			case Node.DOCUMENT_FRAGMENT_NODE:
				return null
			case Node.ATTRIBUTE_NODE:
				if (this.ownerElement) {
					return this.ownerElement.lookupNamespaceURI(prefix)
				}
				return null
			default:
				// EntityReferences may have to be skipped to get to it
				if (this.parentNode) {
					return this.parentNode.lookupNamespaceURI(prefix)
				}
				return null
		}
	}

	isDefaultNamespace(namespaceURI) {
		switch (this.nodeType) {
			case Node.ELEMENT_NODE:
				if (!this.prefix) {
					return this.namespaceURI === namespaceURI
				}

				if (this.hasAttribute('xmlns')) {
					return this.getAttribute('xmlns')
				}

				// EntityReferences may have to be skipped to get to it
				if (this.parentNode) {
					return this.parentNode.isDefaultNamespace(namespaceURI)
				}

				return false
			case Node.DOCUMENT_NODE:
				return this.documentElement.isDefaultNamespace(namespaceURI)
			case Node.ENTITY_NODE:
			case Node.NOTATION_NODE:
			case Node.DOCUMENT_TYPE_NODE:
			case Node.DOCUMENT_FRAGMENT_NODE:
				return false
			case Node.ATTRIBUTE_NODE:
				if (this.ownerElement) {
					return this.ownerElement.isDefaultNamespace(namespaceURI)
				}
				return false
			default:
				// EntityReferences may have to be skipped to get to it
				if (this.parentNode) {
					return this.parentNode.isDefaultNamespace(namespaceURI)
				}
				return false
		}
	}

	insertBefore(node, before) {
		let index = this.childNodes.indexOf(before);
		if (index === -1) {
			index = this.childNodes.length;
		}

		if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
			let child;
			let oldChild = before;
			while ((child = node.childNodes.pop())) {
				this.insertBefore(child, oldChild)
				oldChild = child;
			}
			return node;
		}

		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}

		node.parentNode = this;
		this.childNodes.splice(index, 0, node)
		return node;
	}

	appendChild(newChild) {
		// last
		return this.insertBefore(newChild, null);
	}

	replaceChild(newChild, oldChild) {
		const before = oldChild.nextSibling;
		this.removeChild(oldChild);
		this.insertBefore(newChild, before);
		return oldChild;
	}

	removeChild(node) {
		if (this !== node.parentNode) {
			throw new DOMException(NOT_FOUND_ERR, "child's parent is not parent");
		}
		node.parentNode = null;
		// Object.setPrototypeOf(node, null)
		const index = this.childNodes.indexOf(node);
		if (index === -1) return node;
		this.childNodes.splice(index, 1);
		return node;
	}

	// SPEC 외의 함수...

	// deprecated, do not use
	isSupported(feature, version) {
		return true;
	}


	_lookupNamespacePrefix(namespaceURI, originalElement) {
		if (this.namespaceURI && this.namespaceURI === namespaceURI && this.prefix
			&& originalElement.lookupNamespaceURI(this.prefix) === namespaceURI) {
			return this.prefix
		}

		for (const [key, val] of this.attrs.entries()) {
			if (!key.includes(':')) continue

			const [attrPrefix, name] = key.split(':')
			if (attrPrefix === 'xmlns' && val === namespaceURI && originalElement.lookupNamespaceURI(name) === namespaceURI) {
				return name
			}
		}

		// EntityReferences may have to be skipped to get to it
		if (this.parentNode) {
			return this.parentNode.lookupNamespacePrefix(namespaceURI, originalElement)
		}
		return null
	}

}

const ELEMENT_NODE = 1;
const ATTRIBUTE_NODE = 2;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const ENTITY_REFERENCE_NODE = 5;
const ENTITY_NODE = 6;
const PROCESSING_INSTRUCTION_NODE = 7;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
const DOCUMENT_TYPE_NODE = 10;
const DOCUMENT_FRAGMENT_NODE = 11;
const NOTATION_NODE = 12;

const type = {
	ELEMENT_NODE,
	ATTRIBUTE_NODE,
	TEXT_NODE,
	CDATA_SECTION_NODE,
	ENTITY_REFERENCE_NODE,
	ENTITY_NODE,
	PROCESSING_INSTRUCTION_NODE,
	COMMENT_NODE,
	DOCUMENT_NODE,
	DOCUMENT_TYPE_NODE,
	DOCUMENT_FRAGMENT_NODE,
	NOTATION_NODE
};

Object.assign(Node.prototype, type)
Object.assign(Node, type)

const DOCUMENT_POSITION_DISCONNECTED = 0x01;
const DOCUMENT_POSITION_PRECEDING = 0x02;
const DOCUMENT_POSITION_FOLLOWING = 0x04;
const DOCUMENT_POSITION_CONTAINS = 0x08;
const DOCUMENT_POSITION_CONTAINED_BY = 0x10;
const DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 0x20;

const position = {
	DOCUMENT_POSITION_DISCONNECTED,
	DOCUMENT_POSITION_PRECEDING,
	DOCUMENT_POSITION_FOLLOWING,
	DOCUMENT_POSITION_CONTAINS,
	DOCUMENT_POSITION_CONTAINED_BY,
	DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
}

Object.assign(Node.prototype, position)
Object.assign(Node, position)

export {
	ELEMENT_NODE,
	ATTRIBUTE_NODE,
	TEXT_NODE,
	CDATA_SECTION_NODE,
	ENTITY_REFERENCE_NODE,
	ENTITY_NODE,
	PROCESSING_INSTRUCTION_NODE,
	COMMENT_NODE,
	DOCUMENT_NODE,
	DOCUMENT_TYPE_NODE,
	DOCUMENT_FRAGMENT_NODE,
	NOTATION_NODE
}
export default Node;