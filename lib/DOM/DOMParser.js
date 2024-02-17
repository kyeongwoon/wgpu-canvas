'use strict';

import conventions from './conventions.js'
import impl from './DOMImplementation.js';
import entities from './entities.js'
import { XMLReader } from './XMLReader.js'
import { HTML_NS, SVG_NS, XML_NS, XMLNS_NS } from './NameSpace.js'
import MIME_TYPE from './MimeType.js'

var hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
var isHTMLMimeType = conventions.isHTMLMimeType;
var isValidMimeType = conventions.isValidMimeType;
var ParseError = conventions.ParseError;


function normalizeLineEndings(input) {
	return input.replace(/\r[\n\u0085]/g, '\n').replace(/[\r\u0085\u2028]/g, '\n');
}

class DOMParser {
	constructor(options) {
		options = { locator: true };
		this.assign = options.assign || conventions.assign;
		this.domHandler = DOMHandler;
		this.onError = options.onError;

		this.normalizeLineEndings = normalizeLineEndings;
		this.locator = true;
		this.xmlns = {};

	}
	parseFromString(source, mimeType) {
		if (!isValidMimeType(mimeType)) {
			throw new TypeError('DOMParser.parseFromString: the provided mimeType "' + mimeType + '" is not valid.');
		}
		var defaultNSMap = this.assign({}, this.xmlns);
		let entityMap = entities.XML_ENTITIES;
		var defaultNamespace = defaultNSMap[''] || null;
		if (hasDefaultHTMLNamespace(mimeType)) {
			entityMap = entities.HTML_ENTITIES;
			defaultNamespace = HTML_NS;
		} else if (mimeType === MIME_TYPE.XML_SVG_IMAGE) {
			defaultNamespace = SVG_NS;
		}
		defaultNSMap[''] = defaultNamespace;
		defaultNSMap.xml = defaultNSMap.xml || XML_NS;

		const domBuilder = new this.domHandler({
			mimeType: mimeType,
			defaultNamespace: defaultNamespace,
			onError: this.onError,
		});
		var locator = this.locator ? {} : undefined;
		if (this.locator) {
			domBuilder.setDocumentLocator(locator);
		}

		const sax = new XMLReader();
		sax.errorHandler = domBuilder;
		sax.domBuilder = domBuilder;
		const isXml = !conventions.isHTMLMimeType(mimeType);
		if (isXml && typeof source !== 'string') {
			sax.errorHandler.fatalError('source is not a string');
		}
		sax.parse(this.normalizeLineEndings(String(source)), defaultNSMap, entityMap);
		if (!domBuilder.doc.documentElement) {
			sax.errorHandler.fatalError('missing root element');
		}
		return domBuilder.doc;
	}
}

function position(locator, node) {
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}

class DOMHandler {
	constructor(options) {
		var opt = options || {};
		this.mimeType = opt.mimeType || MIME_TYPE.XML_APPLICATION;
		this.defaultNamespace = opt.defaultNamespace || null;
		this.cdata = false;
		this.currentElement = undefined;
		this.doc = undefined;
		this.locator = undefined;
		this.onError = opt.onError;
	}
	startDocument() {
		//var impl = new DOMImplementation();
		this.doc = isHTMLMimeType(this.mimeType) ? impl.createHTMLDocument(false) : impl.createDocument(this.defaultNamespace, '');
	}
	startElement(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
		var el = doc.createElementNS(namespaceURI, qName || localName);
		var len = attrs.length;
		appendElement(this, el);
		this.currentElement = el;

		this.locator && position(this.locator, el);
		for (var i = 0; i < len; i++) {
			var namespaceURI = attrs.getURI(i);
			var value = attrs.getValue(i);
			var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator && position(attrs.getLocator(i), attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr);
		}
	}
	endElement(namespaceURI, localName, qName) {
		this.currentElement = this.currentElement.parentNode;
	}
	startPrefixMapping(prefix, uri) { }
	endPrefixMapping(prefix) { }
	processingInstruction(target, data) {
		var ins = this.doc.createProcessingInstruction(target, data);
		this.locator && position(this.locator, ins);
		appendElement(this, ins);
	}
	ignorableWhitespace(ch, start, length) { }
	characters(chars, start, length) {
		chars = _toString.apply(this, arguments);
		//console.log(chars)
		if (chars) {
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if (this.currentElement) {
				this.currentElement.appendChild(charNode);
			} else if (/^\s*$/.test(chars)) {
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator, charNode);
		}
	}
	skippedEntity(name) { }
	endDocument() {
		this.doc.normalize();
	}
	setDocumentLocator(locator) {
		if (locator) {
			locator.lineNumber = 0;
		}
		this.locator = locator;
	}
	comment(chars, start, length) {
		chars = _toString.apply(this, arguments);
		var comm = this.doc.createComment(chars);
		this.locator && position(this.locator, comm);
		appendElement(this, comm);
	}

	startCDATA() {
		//used in characters() methods
		this.cdata = true;
	}
	endCDATA() {
		this.cdata = false;
	}

	startDTD(name, publicId, systemId, internalSubset) {
		var impl = this.doc.implementation;
		if (impl && impl.createDocumentType) {
			var dt = impl.createDocumentType(name, publicId, systemId, internalSubset);
			this.locator && position(this.locator, dt);
			appendElement(this, dt);
			this.doc.doctype = dt;
		}
	}
	reportError(level, message) {
		if (typeof this.onError === 'function') {
			try {
				this.onError(level, message, this);
			} catch (e) {
				throw new ParseError('Reporting ' + level + ' "' + message + '" caused ' + e, this.locator);
			}
		} else {
			console.error('[xmldom ' + level + ']\t' + message, _locator(this.locator));
		}
	}

	warning(message) {
		this.reportError('warning', message);
	}
	error(message) {
		this.reportError('error', message);
	}
	fatalError(message) {
		this.reportError('fatalError', message);
		throw new ParseError(message, this.locator);
	}
}

function _locator(l) {
	if (l) {
		return '\n@#[line:' + l.lineNumber + ',col:' + l.columnNumber + ']';
	}
}

function _toString(chars, start, length) {
	if (typeof chars == 'string') {
		return chars.substr(start, length);
	} else {
		//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if (chars.length >= start + length || start) {
			return new java.lang.String(chars, start, length) + '';
		}
		return chars;
	}
}


'endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl'.replace(
	/\w+/g,
	function (key) {
		DOMHandler.prototype[key] = function () {
			return null;
		};
	}
);

/* Private static helpers treated below as private instance methods, 
// so don't need to add these to the public API;
// we might use a Relator to also get rid of non-standard public properties */
function appendElement(handler, node) {
	if (!handler.currentElement) {
		handler.doc.appendChild(node);
	} else {
		handler.currentElement.appendChild(node);
	}
}


export default DOMParser;
