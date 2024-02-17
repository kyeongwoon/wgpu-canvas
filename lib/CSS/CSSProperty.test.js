'use strict'
import assert from 'assert';
//import CSSProperty from './CSSProperty.js'

function objectsHaveSameOwnProperties(obj1, obj2) {
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (let key of keys1) {
		if (obj1[key] !== obj2[key]) {
			return false;
		}
	}
	return true;
}

describe('CSSProperty', function () {
	test('letter-spacing: -0.1em !important', function () {
		const cssText = 'letter-spacing: -0.1em !important'
		//var property = new CSSProperty;
		const property = {}
		property.name = 'letter-spacing';
		property.value = '-0.1em';
		property.important = true;
		/*
		assert.deepEqual(property, {
			name: 'letter-spacing',
			value: '-0.1em',
			important: true,
			__original: ''
		})
		*/
		//expect(property.toString()).toBe('letter-spacing: -0.1em !important');
		expect(objectsHaveSameOwnProperties(property, {
			name: 'letter-spacing',
			value: '-0.1em',
			important: true,
			__original: ''
		})).toBe(true);
	});
});
