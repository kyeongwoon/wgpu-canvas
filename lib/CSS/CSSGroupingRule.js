'use strict'

import CSSRule from './CSSRule.js'

class CSSGroupingRule extends CSSRule {
	constructor() {
		super();
        this.cssRules = [];
	}
    insertRule(rule, index) {
        if (index < 0 || index > this.cssRules.length) {
            throw new RangeError("INDEX_SIZE_ERR");
        }
        var cssRule = CSSOM.parse(rule).cssRules[0];
        cssRule.parentRule = this;
        this.cssRules.splice(index, 0, cssRule);
        return index;
    }
    deleteRule(index) {
        if (index < 0 || index >= this.cssRules.length) {
            throw new RangeError("INDEX_SIZE_ERR");
        }
        this.cssRules.splice(index, 1)[0].parentRule = null;
    }
}

export default CSSGroupingRule;