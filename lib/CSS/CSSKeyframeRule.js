'use strict'

import CSSRule from "./CSSRule.js";

class CSSKeyframeRule extends CSSRule {
	type = 8;
	constructor() {
		super();
		this.keyText = '';
		this.style = new CSSStyleDeclaration();
		this.style.parentRule = this;
	}
  get cssText() {
    return this.keyText + ' {' + this.style.cssText + '} ';
  }
	set cssText(v) {}

}

export default CSSKeyframeRule;