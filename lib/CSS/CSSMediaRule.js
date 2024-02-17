'use strict'

import CSSRule from "./CSSRule.js";

class CSSMediaRule extends CSSRule {
	type = 4;
	constructor() {
		super();
		this.media = new MediaList();
		this.cssRules = [];
	}
	  get cssText() {
	    var cssTexts = [];
	    for (var i=0, length=this.cssRules.length; i < length; i++) {
	      cssTexts.push(this.cssRules[i].cssText);
	    }
	    return '@media ' + this.media.mediaText + ' {' + cssTexts.join('') + '}';
	  }

    get conditionText() {
        return this.media.mediaText;
    }
    set conditionText(value) {
        this.media.mediaText = value;
    }
}

export default CSSMediaRule