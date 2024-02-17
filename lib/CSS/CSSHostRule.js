'use strict'

import CSSRule from "./CSSRule.js";

class CSSHostRule extends CSSRule {
	type = 1001;
	constructor() {
		this.cssRules = [];
	}
	get cssText() {
		var cssTexts = [];
		for (var i=0, length=this.cssRules.length; i < length; i++) {
			cssTexts.push(this.cssRules[i].cssText);
		}
		return '@host {' + cssTexts.join('') + '}';
	}
	set cssText(v) {}
}

export default CSSHostRule