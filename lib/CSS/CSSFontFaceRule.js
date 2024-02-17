'use strict'

import CSSRule from "./CSSRule.js";

class CSSFontFaceRule extends CSSRule {
	type = 5;
	constructor() {
		super();
		this.style = new CSSStyleDeclaration();
		this.style.parentRule = this;
	}
  get cssText() {
    return '@font-face {' + this.style.cssText + '}';
  }
	set cssText(v) {}
}

export default CSSFontFaceRule