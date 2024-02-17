'use strict'

import parseStyleSheet from './parseStyleSheet.js'

class CSSStyleSheet {
	constructor(options) {
		this.parentStyleSheet = null;
		this.cssRules = [];		
	}

	insertRule(rule, index) {
		if (index < 0 || index > this.cssRules.length) {
			throw new RangeError('INDEX_SIZE_ERR');
		}
		var cssRule = parseStyleSheet(rule).cssRules[0];
		cssRule.parentStyleSheet = this;
		this.cssRules.splice(index, 0, cssRule);
		return index;
	}

	deleteRule(index) {
		if (index < 0 || index >= this.cssRules.length) {
			throw new RangeError('INDEX_SIZE_ERR');
		}
		this.cssRules.splice(index, 1);
	}

    replace(text) {}
    replaceSync(text) {}

	toString() {
		var result = '';
		var rules = this.cssRules;
		for (var i=0; i<rules.length; i++) {
			result += rules[i].cssText + '\n';
		}
		return result;
	}
}

export default CSSStyleSheet;