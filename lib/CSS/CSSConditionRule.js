'use strict'

import CSSGroupingRule from "./CSSGroupingRule.js"

class CSSConditionRule extends CSSGroupingRule {
	constructor() {
		super();
        this.cssRules = [];
        this.conditionText = ''
        this.cssText = ''
	}
}


export default CSSConditionRule