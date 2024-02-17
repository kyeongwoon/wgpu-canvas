'use strict'

import Node, {
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
} from "./Node.js";
import elementAccess from './mixins/elementAccess.js'
import NonDocumentTypeChildNode from './mixins/NodDocumentTypeChildNode.js'
import ChildNode from './mixins/ChildNode.js';
import ParentNode from './mixins/ParentNode.js';
import InnerHTML from './mixins/innerHTML.js';
import NamedNodeMap from './NamedNodeMap.js';
import { HTML_NS } from './NameSpace.js'
import DOMException, { NOT_SUPPORTED_ERR, SYNTAX_ERR} from './DOMException.js';
import DOMTokenList from './DOMTokenList.js';
import select, {matches} from './select.simple.js'

class Element extends Node {
	nodeType = Node.ELEMENT_NODE;

	namespaceURI = null;
	prefix = null;
	localName = null;
	// tagName
	// id
	// className
	//#classList = new DOMTokenList(); // DOMTokenList // getter?
	#classList = null; // DOMTokenList // getter?
	// slot
	attributes = new NamedNodeMap();
	state = 'undefined'; //"undefined", "failed", "uncustomized", "precustomized", or "custom"

	constructor() {
		super()
		this.attributes._ownerElement = this;
	}
	// Returns the HTML-uppercased qualified name. qualifiedName = element . tagName
	get tagName() { 
		//if(this.namespaceURI === HTML_NS)
		//	return this.nodeName.toUpperCase();
		//else 
			return this.nodeName 
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
	// for HTML, SVG
	get id() {
		return this.getAttribute('id') || ''
	}

	set id(id) {
		return this.setAttribute('id', id)
	}

	get className() {
		return this.getAttribute('class')
	}

	set className(c) {
		this.setAttribute('class', c)
		this.classList.add(c);
	}

	get classList() {
		if(!this.#classList) {
			this.#classList = new DOMTokenList();
			this.#classList.add(this.className)
		}
		return this.#classList;
	}
	
	get slot() { }
	set slot(v) { }

	get shadowRoot() { return null }


	// method
	hasAttributes() {
		return this.attributes.length > 0;
	}
	getAttributeNames() {
		const result = [];
		this.attributes.forEach(attr => {
			result.push(attr.name)
		})
		return result;
	}

	getAttribute(qualifiedName) {
		const attr = this.getAttributeNode(qualifiedName);
		return attr ? attr.value : null;
	}

	getAttributeNS(namespace, localName) {
		const attr = this.getAttributeNodeNS(namespace, localName);
		return attr ? attr.value : null;
	}

	setAttribute(qualifiedName, value) {
		if (this.namespaceURI === HTML_NS) {
			qualifiedName = qualifiedName.toLowerCase();
		}
		let attr = this.getAttributeNode(qualifiedName);
		if (attr) {
			attr.value = attr.nodeValue = '' + value;
		} else {
			attr = this.ownerDocument.createAttribute(qualifiedName);
			attr.value = attr.nodeValue = '' + value;
			this.setAttributeNode(attr);
		}
	}

	setAttributeNS(namespace, qualifiedName, value) {
		const validated = validateAndExtract(namespace, qualifiedName);
		const localName = validated[2];
		const attr = this.getAttributeNodeNS(namespace, localName);
		if (attr) {
			attr.value = attr.nodeValue = '' + value;
		} else {
			attr = this.ownerDocument.createAttributeNS(namespace, qualifiedName);
			attr.value = attr.nodeValue = '' + value;
			this.setAttributeNode(attr);
		}
	}

	removeAttribute(qualifiedName) {
		const attr = this.getAttributeNode(qualifiedName);
		attr && this.removeAttributeNode(attr);
	}

	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS(namespace, localName) {
		const old = this.getAttributeNodeNS(namespace, localName);
		old && this.removeAttributeNode(old);
	}

	hasAttribute(qualifiedName) {
		const attr = this.getAttributeNode(qualifiedName)
		return !!attr
	}

	hasAttributeNS(namespace, localName) {
		const attr = this.getAttributeNodeNS(namespace, localName)
		return !!attr
	}

	getAttributeNode(qualifiedName) {
		if (this.namespaceURI === HTML_NS) {
			qualifiedName = qualifiedName.toLowerCase();
		}
		return this.attributes.getNamedItem(qualifiedName);
	}

	getAttributeNodeNS(namespace, localName) {
		return this.attributes.getNamedItemNS(namespace, localName);
	}

	setAttributeNode(attr) {
		return this.attributes.setNamedItem(attr);
	}
	setAttributeNodeNS(attr) {
		return this.attributes.setNamedItemNS(attr);
	}

	removeAttributeNode(attr) {
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.attr);
	}

	attachShadow(init) {
		throw new DOMException(NOT_SUPPORTED_ERR);
	}

	closest(selectors) {
		let el = this;
		while (el.matches && !el.matches(selectors))
			el = el.parentNode;
		return el.matches ? el : null;
	}
	matches(selectors) {
		// return boolean...
		//return select.matches(this, selectors);
		return matches(this, selectors);
	}

	webkitMatchedSelector(selectors) {
		return select.matches(this, selectors);
	}

	insertAdjacentElement(where, element) {
		if (element.nodeType !== ELEMENT_NODE) {
			throw new TypeError('not an element');
		}
		where = where.toLowerCase();
		let first = false;
		switch (where) {
			case 'beforebegin':
				first = true;
			/* falls through */
			case 'afterend':
				const parent = this.parentNode;
				if (parent === null) { return null; }
				return parent.insertBefore(element, first ? this : this.nextSibling);
			case 'afterbegin':
				first = true;
			/* falls through */
			case 'beforeend':
				return this.insertBefore(element, first ? this.firstChild : null);
			default:
				throw new DOMException(SYNTAX_ERR);
		}
	}

	insertAdjacentText(where, data) {
		const textNode = this.ownerDocument.createTextNode(data);
		where = where.toLowerCase();
		let first = false;
		switch (where) {
			case 'beforebegin':
				first = true;
			/* falls through */
			case 'afterend':
				const parent = this.parentNode;
				if (parent === null) { return null; }
				return parent.insertBefore(textNode, first ? this : this.nextSibling);
			case 'afterbegin':
				first = true;
			/* falls through */
			case 'beforeend':
				return this.insertBefore(textNode, first ? this.firstChild : null);
			default:
				throw new DOMException(SYNTAX_ERR);
		}
	}

	get innerText() {
		return this.textContent;
	}
	
	set innerText(v) {
		this.removeChildren();
		this.innerHTML = v.replace(/\n/g, '<br />');
	}

	get outerText() {
		return this.textContent;
	}
	set outerText(v) {
		this.removeChildren();
		this.outerHTML = v.replace(/\n/g, '<br />');
	}

	////
	// no spec
	insertAdjacentHTML(position, html) {
		let node,
			element = this,
			container = element.ownerDocument.createElement('_'),
			parent = element.parentNode,
			nodeFrag = document.createDocumentFragment();

		// Make position lowercase
		position = position.toLowerCase();

		//console.log('>>>>>> insertAdjacentHTML ' + html)
		// Insert the container HTML and append the resulting nodes to nodeFrag
		container.innerHTML = html;

		/*
		//node = container.firstChild;
		while (node == container.firstChild){
			nodeFrag.appendChild(node);
			//node = node.nextSibling;
		}
		*/
		node = container.firstChild;
		while (node) {
			nodeFrag.appendChild(node);
			node = node.nextSibling;
		}
		//dump_tree(nodeFrag, '***')

		// Add nodes to DOM
		if (position === 'beforeend') {
			element.appendChild(nodeFrag);
		} else if (position === 'afterbegin') {
			element.insertBefore(nodeFrag, element.firstChild);
		} else if (position === 'beforebegin') {
			parent.insertBefore(nodeFrag, element);
		} else if (position === 'afterend') {
			parent.insertBefore(nodeFrag, element.nextElementSibling);
		}
	}
}

Object.assign(Element.prototype, elementAccess)

// mixin = assign + defineProperties
Object.assign(Element.prototype, NonDocumentTypeChildNode)
Object.defineProperties(Element.prototype, Object.getOwnPropertyDescriptors(NonDocumentTypeChildNode))

Object.assign(Element.prototype, ChildNode)

Object.assign(Element.prototype, ParentNode)
Object.defineProperties(Element.prototype, Object.getOwnPropertyDescriptors(ParentNode))

Object.defineProperties(Element.prototype, Object.getOwnPropertyDescriptors(InnerHTML))


export default Element;