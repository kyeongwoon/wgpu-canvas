'use strict'

import CSSRule from "./CSSRule.js"
import MatcherList from './MatcherList.js'

class CSSDocumentRule extends CSSRule {
	type = 10;
	constructor() {
		super();
	    this.matcher = new MatcherList();
	    this.cssRules = [];
	}
	get cssText() {
		var cssTexts = [];
		for (var i=0, length=this.cssRules.length; i < length; i++) {
		    cssTexts.push(this.cssRules[i].cssText);
		}
		return '@-moz-document ' + this.matcher.matcherText + ' {' + cssTexts.join('') + '}';
	}
	set cssText(v) {}
}

export default CSSDocumentRule;