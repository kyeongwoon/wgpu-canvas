'use strict';


function find(list, predicate, ac) {
	if (ac === undefined) {
		ac = Array.prototype;
	}
	if (list && typeof ac.find === 'function') {
		return ac.find.call(list, predicate);
	}
	for (var i = 0; i < list.length; i++) {
		if (Object.prototype.hasOwnProperty.call(list, i)) {
			var item = list[i];
			if (predicate.call(undefined, item, i, list)) {
				return item;
			}
		}
	}
}

function freeze(object, oc) {
	if (oc === undefined) {
		oc = Object;
	}
	return oc && typeof oc.freeze === 'function' ? oc.freeze(object) : object;
}


function assign(target, source) {
	if (target === null || typeof target !== 'object') {
		throw new TypeError('target is not an object');
	}
	for (var key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			target[key] = source[key];
		}
	}
	return target;
}

var HTML_BOOLEAN_ATTRIBUTES = freeze({
	allowfullscreen: true,
	async: true,
	autofocus: true,
	autoplay: true,
	checked: true,
	controls: true,
	default: true,
	defer: true,
	disabled: true,
	formnovalidate: true,
	hidden: true,
	ismap: true,
	itemscope: true,
	loop: true,
	multiple: true,
	muted: true,
	nomodule: true,
	novalidate: true,
	open: true,
	playsinline: true,
	readonly: true,
	required: true,
	reversed: true,
	selected: true,
});


function isHTMLBooleanAttribute(name) {
	return HTML_BOOLEAN_ATTRIBUTES.hasOwnProperty(name.toLowerCase());
}


var HTML_VOID_ELEMENTS = freeze({
	area: true,
	base: true,
	br: true,
	col: true,
	embed: true,
	hr: true,
	img: true,
	input: true,
	link: true,
	meta: true,
	param: true,
	source: true,
	track: true,
	wbr: true,
});


function isHTMLVoidElement(tagName) {
	return HTML_VOID_ELEMENTS.hasOwnProperty(tagName.toLowerCase());
}


var HTML_RAW_TEXT_ELEMENTS = freeze({
	script: false,
	style: false,
	textarea: true,
	title: true,
});


function isHTMLRawTextElement(tagName) {
	var key = tagName.toLowerCase();
	return HTML_RAW_TEXT_ELEMENTS.hasOwnProperty(key) && !HTML_RAW_TEXT_ELEMENTS[key];
}

function isHTMLEscapableRawTextElement(tagName) {
	var key = tagName.toLowerCase();
	return HTML_RAW_TEXT_ELEMENTS.hasOwnProperty(key) && HTML_RAW_TEXT_ELEMENTS[key];
}
/**
 * Only returns true if `value` matches MIME_TYPE.HTML, which indicates an HTML document.
 *
 * @param {string} mimeType
 * @returns {mimeType is 'text/html'}
 * @see https://www.iana.org/assignments/media-types/text/html
 * @see https://en.wikipedia.org/wiki/HTML
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
 */
function isHTMLMimeType(mimeType) {
	return mimeType === MIME_TYPE.HTML;
}
/**
 * For both the `text/html` and the `application/xhtml+xml` namespace the spec defines that the
 * HTML namespace is provided as the default.
 *
 * @param {string} mimeType
 * @returns {boolean}
 * @see https://dom.spec.whatwg.org/#dom-document-createelement
 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument
 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createhtmldocument
 */
function hasDefaultHTMLNamespace(mimeType) {
	return isHTMLMimeType(mimeType) || mimeType === MIME_TYPE.XML_XHTML_APPLICATION;
}

/**
 * All mime types that are allowed as input to `DOMParser.parseFromString`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#Argument02
 *      MDN
 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#domparsersupportedtype
 *      WHATWG HTML Spec
 * @see {@link DOMParser.prototype.parseFromString}
 */
var MIME_TYPE = freeze({
	/**
	 * `text/html`, the only mime type that triggers treating an XML document as HTML.
	 *
	 * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
	 * @see https://en.wikipedia.org/wiki/HTML Wikipedia
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
	 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
	 *      WHATWG HTML Spec
	 */
	HTML: 'text/html',
	XML_APPLICATION: 'application/xml',
	XML_TEXT: 'text/xml',
	XML_XHTML_APPLICATION: 'application/xhtml+xml',
	XML_SVG_IMAGE: 'image/svg+xml',
});

var _MIME_TYPES = Object.keys(MIME_TYPE).map(function (key) {
	return MIME_TYPE[key];
});

/**
 * Only returns true if `mimeType` is one of the allowed values for
 * `DOMParser.parseFromString`.
 *
 * @param {string} mimeType
 * @returns {mimeType is 'application/xhtml+xml' | 'application/xml' | 'image/svg+xml' |  'text/html' | 'text/xml'}
 *
 */
function isValidMimeType(mimeType) {
	return _MIME_TYPES.indexOf(mimeType) > -1;
}

var NAMESPACE = freeze({
	HTML: 'http://www.w3.org/1999/xhtml',
	SVG: 'http://www.w3.org/2000/svg',
	XML: 'http://www.w3.org/XML/1998/namespace',
	XMLNS: 'http://www.w3.org/2000/xmlns/',
});

/**
 * Creates an error that will not be caught by XMLReader aka the SAX parser.
 *
 * @class
 * @param {string} message
 * @param {any} [locator]
 * Optional, can provide details about the location in the source.
 */
function ParseError(message, locator) {
	this.message = message;
	this.locator = locator;
	if (Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
}
ParseError.prototype = new Error();
ParseError.prototype.name = ParseError.name;

export  {
	assign,
	find, 
	freeze,
	HTML_BOOLEAN_ATTRIBUTES,
	HTML_RAW_TEXT_ELEMENTS,
	HTML_VOID_ELEMENTS,
	hasDefaultHTMLNamespace,
	isHTMLBooleanAttribute,
	isHTMLRawTextElement,
	isHTMLEscapableRawTextElement,
	isHTMLMimeType,
	isHTMLVoidElement,
	isValidMimeType,
	MIME_TYPE,
	NAMESPACE,
	ParseError
}

export default {
	assign,
	find, 
	freeze,
	HTML_BOOLEAN_ATTRIBUTES,
	HTML_RAW_TEXT_ELEMENTS,
	HTML_VOID_ELEMENTS,
	hasDefaultHTMLNamespace,
	isHTMLBooleanAttribute,
	isHTMLRawTextElement,
	isHTMLEscapableRawTextElement,
	isHTMLMimeType,
	isHTMLVoidElement,
	isValidMimeType,
	MIME_TYPE,
	NAMESPACE,
	ParseError
}

