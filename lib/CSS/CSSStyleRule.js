'use strict'

import CSSRule from './CSSRule.js'
import CSSStyleDeclaration from './CSSStyleDeclaration.js'

class CSSStyleRule extends CSSRule {
	type = 1;
	constructor() {
		super();
		this.selectorText = '';
		this.style = new CSSStyleDeclaration();
		this.style.parentRule = this;
	}	
	get cssText() {
		var text;
		if (this.selectorText) {
			text = this.selectorText + ' {' + this.style.cssText + '}';
		} else {
			text = '';
		}
		return text;
	}
	set cssText(cssText) {
		var rule = this.parse(cssText);
		this.style = rule.style;
		this.selectorText = rule.selectorText;
	}

	parse(ruleText) {
		var i = 0;
		var state = 'selector';
		var index;
		var j = i;
		var buffer = '';

		var SIGNIFICANT_WHITESPACE = {
			'selector': true,
			'value': true
		};

		var styleRule = new CSSStyleRule();
		var name, priority='';

		for (var character; (character = ruleText.charAt(i)); i++) {

			switch (character) {

			case ' ':
			case '\t':
			case '\r':
			case '\n':
			case '\f':
				if (SIGNIFICANT_WHITESPACE[state]) {
					// Squash 2 or more white-spaces in the row into 1
					switch (ruleText.charAt(i - 1)) {
						case ' ':
						case '\t':
						case '\r':
						case '\n':
						case '\f':
							break;
						default:
							buffer += ' ';
							break;
					}
				}
				break;

			// String
			case '"':
				j = i + 1;
				index = ruleText.indexOf('"', j) + 1;
				if (!index) {
					throw '" is missing';
				}
				buffer += ruleText.slice(i, index);
				i = index - 1;
				break;

			case '\'':
				j = i + 1;
				index = ruleText.indexOf('\'', j) + 1;
				if (!index) {
					throw '\' is missing';
				}
				buffer += ruleText.slice(i, index);
				i = index - 1;
				break;

			// Comment
			case '/':
				if (ruleText.charAt(i + 1) === '*') {
					i += 2;
					index = ruleText.indexOf('*/', i);
					if (index === -1) {
						throw new SyntaxError('Missing */');
					} else {
						i = index + 1;
					}
				} else {
					buffer += character;
				}
				break;

			case '{':
				if (state === 'selector') {
					styleRule.selectorText = buffer.trim();
					buffer = '';
					state = 'name';
				}
				break;

			case ':':
				if (state === 'name') {
					name = buffer.trim();
					buffer = '';
					state = 'value';
				} else {
					buffer += character;
				}
				break;

			case '!':
				if (state === 'value' && ruleText.indexOf('!important', i) === i) {
					priority = 'important';
					i += 'important'.length;
				} else {
					buffer += character;
				}
				break;

			case ';':
				if (state === 'value') {
					styleRule.style.setProperty(name, buffer.trim(), priority);
					priority = '';
					buffer = '';
					state = 'name';
				} else {
					buffer += character;
				}
				break;

			case '}':
				if (state === 'value') {
					styleRule.style.setProperty(name, buffer.trim(), priority);
					priority = '';
					buffer = '';
				} else if (state === 'name') {
					break;
				} else {
					buffer += character;
				}
				state = 'selector';
				break;

			default:
				buffer += character;
				break;

			}
		}

		return styleRule;
	}

}

export default CSSStyleRule;