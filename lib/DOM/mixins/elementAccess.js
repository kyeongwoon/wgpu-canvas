'use strict'

import Node from '../Node.js'
import HTMLCollection from '../HTMLCollection.js';

const elementAccess = {
	getElementsByTagName(qualifiedName) {
		qualifiedName = qualifiedName.toLowerCase();
		const array = new HTMLCollection();
		const callback = node => {
			if (node.nodeType === Node.ELEMENT_NODE && qualifiedName === '*' || node.tagName === qualifiedName) {
				array.push(node);
			}
		}

		visit(this, callback)
		return array;
	},

	getElementsByTagNameNS(namespaceURI, localName) {
		const array = new HTMLCollection();
		const callback = node => {
			if (node.nodeType === Node.ELEMENT_NODE &&
				(namespaceURI === '*' || node.namespaceURI === namespaceURI) &&
				(localName === '*' || node.localName === localName)) {
				array.push(node);
			}
		}

		visit(this, callback)
		return array;
	},

	getElementsByClassName(name) {
		let names = String(name).trim();
		names = names.split(/[ \t\r\n\f]+/);  // Split on ASCII whitespace
		//	return document.querySelectorAll("." + String(search).split(/\s+/).join('.'));

		const array = new HTMLCollection();
		const callback = node => {
			// DOMTokenList
			if (node.classList.contains(names)) { 
				array.push(node);
			}
		}

		visit(this, callback)
		return array;
	},
}

function visit(node, callback) {
	callback(node);
	node = node.firstElementChild;
	if (node) {
		do {
			visit(node, callback);
		} while (node = node.nextElementSibling);
	}
}
export default elementAccess;