'use strict'

import allProperties from "./allProperties.js";
import allExtraProperties from "./allExtraProperties.js";
import implementedProperties from "./implementedProperties.js";
import parseStyleSheet from './parseStyleSheet.js'
import properties from './Properties.js'

class CSSStyleDeclaration {
	#length = 0;
	#parentRule = null;

	constructor() {
		this.#length = 0;
		this.#parentRule = null;
		// NON-STANDARD
		this._importants = {};
		this._values = {};
		//this._onChange = () => { }
	}
	get parentRule() { return this.#parentRule }
	set parentRule(v) { this.#parentRule = v }
	get length() {
		return this.#length;
	}
	set length(value) {
		for (let i = value; i < this.#length; i++) {
			delete this[i];
		}
		this.#length = value;
	}

	getPropertyValue(name) {
		if (!this._values.hasOwnProperty(name)) {
			return '';
		}
		return this._values[name].toString();
	}

	setProperty(name, value, priority) {
		if (value === undefined) {
			return;
		}
		if (value === null || value === '') {
			this.removeProperty(name);
			return;
		}
		const isCustomProperty = name.indexOf('--') === 0;
		if (isCustomProperty) {
			this._setProperty(name, value, priority);
			return;
		}
		const lowercaseName = name.toLowerCase();
		if (!allProperties.has(lowercaseName) && !allExtraProperties.has(lowercaseName)) {
			return;
		}

		this[lowercaseName] = value;
		this._importants[lowercaseName] = priority;
	}
	_setProperty(name, value, priority) {
		if (value === undefined) {
			return;
		}
		if (value === null || value === '') {
			this.removeProperty(name);
			return;
		}
		if (this._values[name]) {
			// Property already exist. Overwrite it.
			const index = Array.prototype.indexOf.call(this, name);
			if (index < 0) {
				this[this.#length] = name;
				this.#length++;
			}
		} else {
			// New property.
			this[this.#length] = name;
			this.#length++;
		}
		this._values[name] = value;
		this._importants[name] = priority;
		//this._onChange(this.cssText);
	}

	removeProperty(name) {
		if (!this._values.hasOwnProperty(name)) {
			return '';
		}

		const prevValue = this._values[name];
		delete this._values[name];
		delete this._importants[name];

		const index = Array.prototype.indexOf.call(this, name);
		if (index < 0) {
			return prevValue;
		}

		// That's what WebKit and Opera do
		Array.prototype.splice.call(this, index, 1);

		// That's what Firefox does
		//this[index] = ""

		//this._onChange(this.cssText);
		return prevValue;
	}

	getPropertyCSSValue() {
		//FIXME
	}

	getPropertyPriority(name) {
		return this._importants[name] || '';
	}
	getPropertyShorthand() {
	}

	isPropertyImplicit() {
	}
	
	item(index) {
		index = parseInt(index, 10);
		if (index < 0 || index >= this.#length) {
			return '';
		}
		return this[index];
	}

	get cssText() {
		const properties = [];
		for (let i = 0; i < this.#length; i++) {
			const name = this[i];
			const value = this.getPropertyValue(name);
			let priority = this.getPropertyPriority(name);
			if (priority !== '') {
				priority = ' !' + priority;
			}
			properties.push([name, ': ', value, priority, ';'].join(''));
		}
		return properties.join(' ');
	}

	set cssText(value) {
		this._values = {};
		Array.prototype.splice.call(this, 0, this._length);
		this._importants = {};
		let dummyRule;
		try {
			dummyRule = parseStyleSheet('#bogus{' + value + '}').cssRules[0].style;
		} catch (err) {
			// malformed css, just return
			return;
		}
		// dummyRule is not iterative...
		for (let i = 0; i < dummyRule.length; ++i) {
			const name = dummyRule[i];
			this.setProperty(
				dummyRule[i],
				dummyRule.getPropertyValue(name),
				dummyRule.getPropertyPriority(name)
			);
		}
		//this._onChange(this.cssText);
	}
}

const dashedToCamelCase = function (dashed) {
	let camel = '';
	let nextCap = false;
	for (let i = 0; i < dashed.length; i++) {
		if (dashed[i] !== '-') {
			camel += nextCap ? dashed[i].toUpperCase() : dashed[i];
			nextCap = false;
		} else {
			nextCap = true;
		}
	}
	return camel;
};

function getBasicPropertyDescriptor(name) {
	return {
		set: function (v) {
			this._setProperty(name, v);
		},
		get: function () {
			return this.getPropertyValue(name);
		},
		enumerable: true,
		configurable: true,
	};
};

properties(CSSStyleDeclaration.prototype);

allProperties.forEach(property => {
	if (!implementedProperties.has(property)) {
		var declaration = getBasicPropertyDescriptor(property);

		Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
		Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
	}
})

allExtraProperties.forEach(property => {
	if (!implementedProperties.has(property)) {
		var declaration = getBasicPropertyDescriptor(property);

		Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
		Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
	}
})

export default CSSStyleDeclaration;