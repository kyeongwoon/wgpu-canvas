'use strict'

import CSSStyleDeclaration from './CSSStyleDeclaration.js'

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


describe('CSSStyleDeclaration', function () {

	test('setProperty, removeProperty, cssText, getPropertyValue, getPropertyPriority', function () {
		var d = new CSSStyleDeclaration;

		d.setProperty('color', 'purple');
		expect(objectsHaveSameOwnProperties(d, {
			0: 'color',
			length: 1,
			parentRule: null,
			color: 'purple',
			_importants: {
				color: undefined
			}
		})).toBe(true);


		d.setProperty('width', '128px', 'important');
		expect(objectsHaveSameOwnProperties(d, {
			0: 'color',
			1: 'width',
			length: 2,
			parentRule: null,
			color: 'purple',
			width: '128px',
			_importants: {
				color: undefined,
				width: 'important'
			}
		})).toBe(true);


		d.setProperty('opacity', 0);

		expect(d.cssText).toBe('color: purple; width: 128px !important; opacity: 0;');

		expect(d.getPropertyValue('color')).toBe('purple');
		expect(d.getPropertyValue('width')).toBe('128px');
		expect(d.getPropertyValue('opacity')).toBe('0');
		expect(d.getPropertyValue('position')).toBe('');

		expect(d.getPropertyPriority('color')).toBe('');
		expect(d.getPropertyPriority('width')).toBe('important');
		expect(d.getPropertyPriority('position')).toBe('');

		d.setProperty('color', 'green');
		d.removeProperty('width');
		d.removeProperty('opacity');

		expect(d.cssText).toBe('color: green;');
	});

	test('color: pink; outline: 2px solid red;', function () {
		const cssText = 'color: pink; outline: 2px solid red;'
		var d = new CSSStyleDeclaration;
		d.cssText = cssText;
		expect(d.cssText).toBe(cssText);
	});

});

