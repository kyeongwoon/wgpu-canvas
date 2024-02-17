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
} from './Node.js'
import path from 'path'
import Attr from './Attr.js'
import Element from './Element.js';
import Text from './Text.js';
import Comment from './Comment.js';
import {
    HTMLElement,
    HTMLImageElement,
    HTMLLinkElement,
    HTMLScriptElement,
} from './html/index.js'
//import NamedNodeMap from './NamedNodeMap.js';
//import NodeList from './NodeList.js';
import NodeIterator from './NodeIterator.js';
import TreeWalker from './TreeWalker.js'
import NonElementParentNode from './mixins/NonElementParentNode.js'
import ParentNode from './mixins/ParentNode.js'
import elementAccess from './mixins/elementAccess.js';
import DOMParser from './DOMParser.js';
//import DOMImplementation from './DOMImplementation.js'
import { HTML_NS, SVG_NS, XML_NS, XMLNS_NS } from './NameSpace.js'
import MIME_TYPE from './MimeType.js'
import {
	SVGCircleElement,
	SVGElement,
	SVGEllipseElement,
	SVGForeignObjectElement,
	SVGGraphicsElement,
	SVGImageElement,
	SVGLineElement,
	SVGPathElement,
	SVGRectElement,
	SVGSVGElement,
	SVGTextContentElement,
} from './svg/index.js'

import {
	INDEX_SIZE_ERR,
	//DOMSTRING_SIZE_ERR,
	HIERARCHY_REQUEST_ERR,
	WRONG_DOCUMENT_ERR,
	INVALID_CHARACTER_ERR,
	//NO_DATA_ALLOWED_ERR,
	NO_MODIFICATION_ALLOWED_ERR,
	NOT_FOUND_ERR,
	NOT_SUPPORTED_ERR,
	//INUSE_ATTRIBUTE_ERR,
	INVALID_STATE_ERR,
	SYNTAX_ERR,
	INVALID_MODIFICATION_ERR,
	NAMESPACE_ERR,
	INVALID_ACCESS_ERR,
	//VALIDATION_ERR,
	TYPE_MISMATCH_ERR,
} from './DOMException.js'


/*
	exports.DOCUMENT_MODE = {
		NO_QUIRKS: 'no-quirks',
		QUIRKS: 'quirks',
		LIMITED_QUIRKS: 'limited-quirks'
	};
*/

const getSVGElementForName = (name) => {
	switch (name.toLowerCase()) {
		case 'svg':
			return SVGSVGElement
		case 'path':
			return SVGPathElement
		case 'circle':
			return SVGCircleElement
		case 'ellipse':
			return SVGEllipseElement
		case 'line':
			return SVGLineElement
		case 'rect':
			return SVGRectElement
		case 'foreignObject':
			return SVGForeignObjectElement
		case 'image':
			return SVGImageElement
		case 'text':
		case 'tspan':
		case 'tref':
		case 'altglyph':
		case 'textpath':
			return SVGTextContentElement
		default:
			return SVGGraphicsElement
	}
}

const getHTMLElementForName = (name) => {
	switch (name.toLowerCase()) {
		case 'img':
			return HTMLImageElement
		case 'link':
			return HTMLLinkElement
		case 'script':
			return HTMLScriptElement
		default:
			return HTMLElement
	}
}
const getElementForNamespace = (ns, name) => {
	switch (ns) {
		case SVG_NS:
			return getSVGElementForName(name)
		case HTML_NS:
			return getHTMLElementForName(name)
		case null:
		case '':
		default:
			return Element
	}
}


class Document extends Node {
	nodeName = '#document';
	nodeType = Node.DOCUMENT_NODE;

	implementation = null;
	//URL = '';
	documentURI =  "about:blank";
	compatMode = 'CSS1Compat'
	mode = 'no-quirks'
	type = 'html'
	origin = null; //https://html.spec.whatwg.org/multipage/browsers.html#concept-origin-opaque
	characterSet = 'UTF-8';
	charset = 'UTF-8';
	inputEncoding = 'UTF-8';
	contentType = 'text/html'; // 'text/html' : 'application/xml
	doctype = null;
	//documentElement = null;
	// body, head, title, all
	implementation = null;
	defaultView = null;

	//  DocumentOrShadowRoot 
	styleSheets = []; // array of CSSStyleSheet

	constructor() {
		super()
		this.ownerDocument = this;
	}


	// getter
	get documentElement() {
		//return this.lastChild
		for(let el = this.firstChild; el; el = el.nextSibling) {
			if(el.nodeType === ELEMENT_NODE) {
				return el;
			}
		}
		return null;
	}

	get body() {
		for (let child = this.documentElement.firstChild; child; child = child.nextSibling) {
			if (child.nodeType === Node.ELEMENT_NODE && child.nodeName === 'body') {
				return child
			}
		}
		return null;
	}

	get head() {
		for (let child = this.documentElement.firstChild; child; child = child.nextSibling) {
			if (child.nodeType === Node.ELEMENT_NODE && child.nodeName === 'head') {
				return child
			}
		}
		return null;
	}

	//
	get title() {
		const elt = this.getElementsByTagName('title').item(0) || null;
		const value = elt ? elt.textContent : '';
		return value.replace(/[ \t\n\r\f]+/g, ' ').replace(/(^ )|( $)/g, '');
	}
	set title(v) {
		let elt = this.getElementsByTagName('title').item(0) || null;
		let head = this.head;
		if (!elt && !head) { return; }
		if (!elt) {
			elt = this.createElement('title');
			head.appendChild(elt);
		}
		elt.textContent = value;
	}
	get all() {
		return this.childNodes;
	}
	get origin() { return null; }
	get location() { return this.defaultView ? this.defaultView.location : null; }
	get scrollingElement() { return this.quirksMode ? this.body : this.documentElement; }

	get URL() { return this.documentURI; }
	get scripts() {
		//console.log('doc get script')
		return this.documentElement.getElementsByTagName('script');
	}
	get currentScript() {
		return { src: '' };
	}

	// method
	createElement(localName, options = {}) {
		return this.createElementNS(this.namespaceURI, localName, options);
	}

	// Introduced in DOM Level 2:
	createElementNS(namespace, qualifiedName, options = {}) {
		const validated = validateAndExtract(namespace, qualifiedName);
		const Element = getElementForNamespace(namespace, qualifiedName)
		const node = new Element();
		node.ownerDocument = this; // Node
		if (this.doctype && this.doctype.nodeName === 'html') {
			qualifiedName = qualifiedName.toLowerCase();
		}
		//if (hasDefaultHTMLNamespace(this.contentType)) {
		//	node.namespaceURI = NAMESPACE.HTML;
		//}
		node.nodeName = qualifiedName; // Node
		node.namespaceURI = validated[0]; // Element
		node.prefix = validated[1]; // Element
		node.localName = validated[2]; // Element

		const attrs = node.attributes; // NamedNodeMap
		attrs._ownerElement = node; // private...
		return node;
	}

	createDocumentFragment() {
		const node = new DocumentFragment();
		node.ownerDocument = this; // Node
		//node.publicId = node.systemId = ''
		return node;
	}

	createTextNode(data) {
		const node = new Text(data);
		node.ownerDocument = this;
		//node.appendData(data);
		return node;
	}

	createCDATASection(data) {
		const node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data);
		return node;
	}
	createComment(data) {
		const node = new Comment(data);
		node.ownerDocument = this;
		//node.appendData(data);
		return node;
	}

	createProcessingInstruction(target, data) {
		const node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.nodeName = node.target = target;
		node.data = data;
		return node;
	}

	// Introduced in DOM Level 2:
	importNode(importedNode, deep) {
		let node2;
		switch (importedNode.nodeType) {
			case ELEMENT_NODE:
				node2 = importedNode.cloneNode(false);
			//node2.ownerDocument = doc;
			//var attrs = node2.attributes;
			//var len = attrs.length;
			//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
			//}
			case DOCUMENT_FRAGMENT_NODE:
				break;
			case ATTRIBUTE_NODE:
				deep = true;
				break;
			case ENTITY_REFERENCE_NODE:
			case PROCESSING_INSTRUCTION_NODE:
			case TEXT_NODE:
			case CDATA_SECTION_NODE:
			case COMMENT_NODE:
				deep = false;
				break;
			case DOCUMENT_NODE:
			case DOCUMENT_TYPE_NODE:
				break;
			//cannot be imported.
			case ENTITY_NODE:
			case NOTATION_NODE:
				//can not hit in level3
				//default:throw e;
				break;
		}
		if (!node2) {
			node2 = importedNode.cloneNode(false); //false
		}
		node2.ownerDocument = this;
		node2.parentNode = null;
		if (deep) {
			let child = importedNode.firstChild;
			while (child) {
				node2.appendChild(this.importNode(child, deep));
				child = child.nextSibling;
			}
		}
		return node2;
	}

	adoptNode(node) {
		if (node.nodeType === DOCUMENT_NODE) return;
		if (node.nodeType === ATTRIBUTE_NODE) { return node; }
		if (node.parentNode) node.parentNode.removeChild(node);
		node.parentNode = null;

		const callback = node => {
			node.ownerDocument = this;
		}

		function visit(node, callback) {
			callback(node);
			node = node.firstChild;
			if (node) {
				do {
					visit(node, callback);
				} while (node = node.nextSibling);
			}
		}
		visit(this, callback);
		return node;
	}

	createAttribute(localName) {
		if (this.namespaceURI === HTML_NS) {
			localName = localName.toLowerCase()
		}
		return this.createAttributeNS(null, localName)
	}

	// Introduced in DOM Level 2:
	createAttributeNS(namespace, qualifiedName) {
		const validated = validateAndExtract(namespace, qualifiedName);
		const node = new Attr();

		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.specified = true;
		node.namespaceURI = validated[0];
		node.prefix = validated[1];
		node.localName = validated[2];
		return node;
	}

	createEvent(itf) { }
	createRange() { }
	createNodeIterator() {
		const iter = new NodeIterator();
		return iter;
	}
	createTreeWalker() {
		const walker = new TreeWalker();
		return walker;
	}

	// return NodeList
	// https://www.w3schools.com/jsref/dom_obj_html_nodelist.asp
	getElementsByName(name) {
		const els = this.querySelectorAll(`[name="${name}"]`);
		return els;
	}

	/////////////////
	// for HTML
	open() {
		//this.documentElement = null;
	}
	close() {
		this.readyState = 'interactive';
	}

	write(args) {
		const target = this;

		// Remove any existing children of this node
		while (target.hasChildNodes()) {
			target.removeChild(target.firstChild);
		}

		const v = args;
		const parser = new DOMParser();
		//parser.impl = new DOMImplementation();
		parser.impl = this.implementation;
		const mime = 'text/html';
		if (!['.htm', '.html', '.smi'].includes(path.parse(this.documentURI).ext)) {
			mime = 'text/text';
		}
		parser.document = this;
		parser.parseFromString(v, mime);
	}

	writeln(args) {
		this.write(Array.prototype.join.call(args, '') + '\n');
	}
	///
	caretPositionFromPoint(x, y) { return null; }
	elementFromPoint(x, y) { return null; }
	elementsFromPoint(x, y) { return null; }
	getSelection() { return null; }
	hasFocus() { return true; }
}

function validateAndExtract(namespace, qualifiedName) {
	namespace = namespace || null;
	let prefix = null;
	let localName = qualifiedName;
	if (qualifiedName.indexOf(':') >= 0) {
		let splitResult = qualifiedName.split(':');
		prefix = splitResult[0];
		localName = splitResult[1];
	}
	if (prefix !== null && namespace === null) {
		throw new DOMException(NAMESPACE_ERR, 'prefix is non-null and namespace is null');
	}
	if (prefix === 'xml' && namespace !== XML_NS) {
		throw new DOMException(NAMESPACE_ERR, 'prefix is "xml" and namespace is not the XML namespace');
	}
	if ((prefix === 'xmlns' || qualifiedName === 'xmlns') && namespace !== XMLNS_NS) {
		throw new DOMException(NAMESPACE_ERR, 'either qualifiedName or prefix is "xmlns" and namespace is not the XMLNS namespace');
	}
	if (qualifiedName === 'svg' && namespace !== SVG_NS) {

	}
	if (XMLNS_NS && prefix !== 'xmlns' && qualifiedName !== 'xmlns') {
		//		throw new DOMException(NAMESPACE_ERR, 'namespace is the XMLNS namespace and neither qualifiedName nor prefix is "xmlns"');
	}
	return [namespace, prefix, localName];
}

Object.assign(Document.prototype, NonElementParentNode)
Object.assign(Document.prototype, ParentNode)
Object.defineProperties(Document.prototype, Object.getOwnPropertyDescriptors(ParentNode))
Object.assign(Document.prototype, elementAccess)

export default Document;