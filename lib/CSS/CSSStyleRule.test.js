'use strict'
import assert from 'assert'
import CSSStyleRule from './CSSStyleRule.js'

describe('test', () => {
    test('test1', () => {
        let cssText = 'h1:first-of-type {\n\tfont-size: 3em\n}'
        const rule = new CSSStyleRule;
		rule.cssText = cssText;
        assert.deepEqual(rule.cssText, 'h1:first-of-type {font-size: 3em;}')
        assert.deepEqual(rule.selectorText, 'h1:first-of-type')

        rule.selectorText = 'h1.title';
        assert.deepEqual(rule.cssText, 'h1.title {font-size: 3em;}')
    })
})