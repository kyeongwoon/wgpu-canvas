'use strict'

import NodeList from "./NodeList.js";
import Node from "./Node.js";
import { HTML_NS, XML_NS } from './NameSpace.js'
import DOMException, { INUSE_ATTRIBUTE_ERR, NOT_FOUND_ERR } from './DOMException.js'

// Attr의 Array
class NamedNodeMap {
	length = 0;
	_ownerElement = null;

	constructor(element = null) {
		this._ownerElement = element;
	}

	item(index) {
		if (index > this.length) return null;
		const attr = this[index] || null;
		return attr;
	}
	getNamedItem(qualifiedName) {
		if (this._ownerElement && this._ownerElement.namespaceURI === HTML_NS) {
			qualifiedName = qualifiedName.toLowerCase();
		}
		let i = 0;
		while (i < this.length) {
			const attr = this[i];
			if (attr.nodeName === qualifiedName) {
				return attr;
			}
			i++;
		}
		return null;
	}

	getNamedItemNS(namespaceURI, localName) {
		let i = 0;
		while (i < this.length) {
			const attr = this[i];
			if (attr.localName === localName && attr.namespaceURI === namespaceURI) {
				return attr;
			}
			i++;
		}
		return null;
	}

	setNamedItem(attr) {
		let el = attr.ownerElement;
		if (el && el !== this._ownerElement) {
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		const oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
		if (oldAttr === attr) {
			return attr;
		}
		if (oldAttr) {
			let i = this.length;
			while (i--) {
				if (this[i] === oldAttr) {
					this[i] = attr;
					break;
				}
			}
		} else {
			this[this.length++] = attr;
		}

		if (el) {
			newAttr.ownerElement = el;
			const doc = el.ownerDocument;
			if (doc) {
				if (newAttr.namespaceURI === XML_NS) {
					//update namespace
					//el._nsMap[newAttr.prefix ? newAttr.localName : ''] = newAttr.value;
				}
			}
		}
		return oldAttr;
	}

	setNamedItemNS(attr) {
		return this.setNamedItem(attr);
	}

	removeNamedItem(qualifiedName) {
		const attr = this.getNamedItem(qualifiedName);
		if (!attr) {
			throw new DOMException(NOT_FOUND_ERR, qualifiedName);
		}
		const self = this;
		let el = attr.ownerElement;

		{
			let i = 0;
			while (i < self.length) {
				if (self[i] === attr) {
					return i;
				}
				i++;
			}

			if (i >= 0) {
				const lastIndex = self.length - 1;
				while (i <= lastIndex) {
					self[i] = self[++i];
				}
				self.length = lastIndex;
				if (el) {
					attr.ownerElement = null;
				}
			}
		}
		return attr;
	}

	removeNamedItemNS(namespaceURI, localName) {
		const attr = this.getNamedItemNS(namespaceURI, localName);
		if (!attr) {
			throw new DOMException(NOT_FOUND_ERR, namespaceURI ? `${namespaceURI} : ${localName}` : localName);
		}
		return this.removeNamedItem(localName);
	}
}

if (!NamedNodeMap.prototype.forEach) {
	NamedNodeMap.prototype.forEach = function (fn, scope) {
		for (let i = 0, len = this.length; i < len; ++i) {
			fn.call(scope, this[i], i, this);
		}
	}
}

if (NamedNodeMap.prototype[Symbol.iterator] === undefined) {
	NamedNodeMap.prototype[Symbol.iterator] = function () {
		let i = 0;
		return {
			next: () => {
				return { done: i >= this.length, value: this.item(i++) };
			}
		}
	};
}

export default NamedNodeMap;