import CSSStyleSheet from "./CSSStyleSheet.js";
import CSSStyleDeclaration from './CSSStyleDeclaration.js'

function cloneSheet(stylesheet) {
	const cloned = new CSSStyleSheet();
	const rules = stylesheet.cssRules;
	if (!rules) {
		return cloned;
	}

	for (let i = 0, rulesLength = rules.length; i < rulesLength; i++) {
		const rule = rules[i];
		const ruleClone = cloned.cssRules[i] = new rule.constructor();

		const style = rule.style;
		if (style) {
			const styleClone = ruleClone.style = new CSSStyleDeclaration();
			for (let j = 0, styleLength = style.length; j < styleLength; j++) {
				const name = styleClone[j] = style[j];
				styleClone[name] = style[name];
				styleClone._importants[name] = style.getPropertyPriority(name);
			}
			styleClone.length = style.length;
		}

		if (rule.hasOwnProperty('keyText')) {
			ruleClone.keyText = rule.keyText;
		}

		if (rule.hasOwnProperty('selectorText')) {
			ruleClone.selectorText = rule.selectorText;
		}

		if (rule.hasOwnProperty('mediaText')) {
			ruleClone.mediaText = rule.mediaText;
		}

		if (rule.hasOwnProperty('conditionText')) {
			ruleClone.conditionText = rule.conditionText;
		}

		if (rule.hasOwnProperty('cssRules')) {
			ruleClone.cssRules = cloneSheet(rule).cssRules;
		}
	}
	return cloned;
};


export default cloneSheet;