'use strict'
import CSSImportRule from "./CSSImportRule.js";

describe('CSSImportRule', function () {

	test('@import url(button.css);', function () {
		const cssText = '@import url(button.css);'
		var rule = new CSSImportRule;
		rule.cssText = cssText;
		expect(rule.href).toBe('button.css');
		expect([].join.call(rule.media, ', ')).toBe('');
	});

	test('@import url("button.css");', function () {
		const cssText = '@import url("button.css");'
		var rule = new CSSImportRule;
		rule.cssText = cssText;
		expect(rule.href).toBe('button.css');
		expect([].join.call(rule.media, ', ')).toBe('');
	});

	test("@import url('button.css');", function () {
		const cssText = "@import url('button.css');"
		var rule = new CSSImportRule;
		rule.cssText = cssText;
		expect(rule.href).toBe('button.css');
		expect([].join.call(rule.media, ', ')).toBe('');
	});

	test('@import "button.css";', function () {
		const cssText = '@import "button.css";'
		var rule = new CSSImportRule;
		rule.cssText = cssText;
		expect(rule.href).toBe('button.css');
		expect([].join.call(rule.media, ', ')).toBe('');
	});

	test("@import 'button.css';", function () {
		const cssText = "@import 'button.css';"
		var rule = new CSSImportRule;
		rule.cssText = cssText;
		expect(rule.href).toBe('button.css');
		expect([].join.call(rule.media, ', ')).toBe('');
	});

	test('@import url(size/medium.css) all;', function () {
		const cssText= '@import url(size/medium.css) all;';
		var rule = new CSSImportRule;
		rule.cssText = '@import url(size/medium.css) all;';
		expect(rule.href).toBe('size/medium.css');
		expect([].join.call(rule.media, ', ')).toBe("all");
		expect(rule.media.mediaText).toBe("all");
	});

	test('@import url(old.css) screen and (color), projection and (min-color: 256);', function () {
		const cssText = '@import url(old.css) screen and (color), projection and (min-color: 256);'
		var rule = new CSSImportRule;
		rule.cssText = '@import url(old.css) screen and (color), projection and (min-color: 256);';
		expect(rule.href).toBe('old.css');
		expect([].join.call(rule.media, ', ')).toBe('screen and (color), projection and (min-color: 256)');
		expect(rule.media.mediaText).toBe('screen and (color), projection and (min-color: 256)');
	});
});
