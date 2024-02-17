'use strict'

import CSSConditionRule from "./CSSConditionRule.js";

class CSSSupportsRule extends CSSConditionRule {
    type = 12;
	constructor() {
		super();
	}
    get cssText() {
        var cssTexts = [];

        for (var i = 0, length = this.cssRules.length; i < length; i++) {
          cssTexts.push(this.cssRules[i].cssText);
        }
    
        return "@supports " + this.conditionText + " {" + cssTexts.join("") + "}";
    }
}

export default CSSSupportsRule;