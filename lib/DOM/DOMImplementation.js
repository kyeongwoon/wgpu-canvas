'use strict'

import conventions from './conventions.js';
import DocumentType from './DocumentType.js';
import Document from "./Document.js";
import XMLDocument from './XMLDocument.js';
import NodeList from './NodeList.js';

import { HTML_NS, SVG_NS, XML_NS } from './NameSpace.js'

const MIME_TYPE = conventions.MIME_TYPE;

const supportedFeatures = {
	'xml': { '': true, '1.0': true, '2.0': true },   // DOM Core
	'core': { '': true, '2.0': true },               // DOM Core
	'html': { '': true, '1.0': true, '2.0': true },  // HTML
	'xhtml': { '': true, '1.0': true, '2.0': true }, // HTML
};

class DOMImplementation {
	constructor() { }
	hasFeature(feature, version) {
		let f = supportedFeatures[(feature || '').toLowerCase()];
		return (f && f[version || '']) || false;
	}

	createDocumentType(qualifiedName, publicId = '', systemId = '') {
		//validateQualifiedName(qualifiedName);
		const node = new DocumentType();
		node.nodeName = node.name = qualifiedName; // html, xml
		node.publicId = publicId; // '-//W3C//DTD XHTML 1.0 Strict//EN',
		node.systemId = systemId; // 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'
		return node;
	}

	createDocument(namespace, qualifiedName, doctype = null) {
		let contentType = MIME_TYPE.XML_APPLICATION;
		if (namespace === HTML_NS) {
			contentType = MIME_TYPE.XML_XHTML_APPLICATION;
		} else if (namespace === SVG_NS) {
			contentType = MIME_TYPE.XML_SVG_IMAGE;
		}
		const doc = new XMLDocument();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if (doctype) {
			doc.appendChild(doctype);
		}
		if (qualifiedName) {
			const root = doc.createElementNS(namespace, qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	}

	createHTMLDocument(title = '') {
		const doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		if (title !== '') {
			doc.doctype = this.createDocumentType('html');
			doc.doctype.ownerDocument = doc;
			doc.appendChild(doc.doctype);

			const htmlNode = doc.createElement('html');
			doc.appendChild(htmlNode);

			const headNode = doc.createElement('head');
			htmlNode.appendChild(headNode);
			if (typeof title === 'string') {
				const titleNode = doc.createElement('title');
				titleNode.appendChild(doc.createTextNode(title));
				headNode.appendChild(titleNode);
			}
			htmlNode.appendChild(doc.createElement('body'));
		}
		return doc;
	}
}

const implement = new DOMImplementation;

export default implement