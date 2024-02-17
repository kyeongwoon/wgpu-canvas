'use strict'

import CSSRule from "./CSSRule.js";

class CSSKeyframesRule extends CSSRule {
	type = 7;
	constructor() {
		super();
		this.name = '';
		this.cssRules = [];
	}
  get cssText() {
    var cssTexts = [];
    for (var i=0, length=this.cssRules.length; i < length; i++) {
      cssTexts.push('  ' + this.cssRules[i].cssText);
    }
    return '@' + (this._vendorPrefix || '') + 'keyframes ' + this.name + ' { \n' + cssTexts.join('\n') + '\n}';
  }
	set cssText(v) {}
}

export default CSSKeyframesRule