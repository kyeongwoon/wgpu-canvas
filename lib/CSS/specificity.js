'use strict'

// Calculate the specificity for a selector by dividing it into simple selectors and counting them
const calculate = function (input) {
	// Separate input by commas
	const selectors = input.split(',');
	const results = [];
	for (const selector of selectors) {
		if (selector.length > 0) {
			results.push(calculateSingle(selector));
		}
	}

	return results;
};

/**
 * Calculates the specificity of CSS selectors
 * http://www.w3.org/TR/css3-selectors/#specificity
 *
 * Returns an object with the following properties:
 *  - selector: the input
 *  - specificity: e.g. 0,1,0,0
 *  - parts: array with details about each part of the selector that counts towards the specificity
 *  - specificityArray: e.g. [0, 1, 0, 0]
 */
const calculateSingle = function (input) {
	let selector = input;
	const typeCount = {
		'a': 0,
		'b': 0,
		'c': 0
	};
	const parts = [];

	// The following regular expressions assume that selectors matching the preceding regular expressions have been removed
	const attributeRegex = /(\[[^\]]+\])/g;// []안에 [과 \이 안들어 있어야 함
	const idRegex = /(#[^\#\s\+>~\.\[:\)]+)/g; // #으로 시작하지만, 뒤에 다음 문자가 오면 안됨 # ' ' + > ~ . [ : )  
	const classRegex = /(\.[^\s\+>~\.\[:\)]+)/g; // .으로 시작하지만, 뒤에 다음 문자가 오면 안됨...
	const pseudoElementRegex = /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi;

	// A regex for pseudo classes with brackets - :nth-child(), :nth-last-child(), :nth-of-type(), :nth-last-type(), :lang()
	// The negation psuedo class (:not) is filtered out because specificity is calculated on its argument
	// :global and :local are filtered out - they look like psuedo classes but are an identifier for CSS Modules
	const pseudoClassWithBracketsRegex = /(:(?!not|global|local)[\w-]+\([^\)]*\))/gi;
	
	// A regex for other pseudo classes, which don't have brackets
	const pseudoClassRegex = /(:(?!not|global|local)[^\s\+>~\.\[:]+)/g;
	const elementRegex = /([^\s\+>~\.\[:]+)/g;

	// Find matches for a regular expression in a string and push their details to parts
	// Type is "a" for IDs, "b" for classes, attributes and pseudo-classes and "c" for elements and pseudo-elements
	const findMatch = function (regex, type) {
		if (regex.test(selector)) {
			const matches = selector.match(regex);
			for (const match of matches) {
				typeCount[type] += 1;
				const index = selector.indexOf(match);
				const length = match.length;
				parts.push({
					selector: input.substr(index, length),
					type,
					index,
					length
				});
				// Replace this simple selector with whitespace so it won't be counted in further simple selectors
				selector = selector.replace(match, ' '.repeat(length + 1));
			}
		}
	};

	// Replace escaped characters with plain text, using the "A" character
	// https://www.w3.org/TR/CSS21/syndata.html#characters
	(function () {
		const replaceWithPlainText = function (regex) {
			if (regex.test(selector)) {
				const matches = selector.match(regex);
				for (const match of matches) {
					selector = selector.replace(match, 'A'.repeat(match.length + 1));
				}
			}
		};
		// Matches a backslash followed by six hexadecimal digits followed by an optional single whitespace character
		const escapeHexadecimalRegex = /\\[0-9A-Fa-f]{6}\s?/g;
		// Matches a backslash followed by fewer than six hexadecimal digits followed by a mandatory single whitespace character
		const escapeHexadecimalRegex2 = /\\[0-9A-Fa-f]{1,5}\s/g;
		// Matches a backslash followed by any character
		const escapeSpecialCharacter = /\\./g;

		replaceWithPlainText(escapeHexadecimalRegex);
		replaceWithPlainText(escapeHexadecimalRegex2);
		replaceWithPlainText(escapeSpecialCharacter);
	}());

	// Remove anything after a left brace in case a user has pasted in a rule, not just a selector
	(function () {
		const regex = /{[^]*/gm;
		if (regex.test(selector)) {
			const matches = selector.match(regex);
			for (const match of matches) {
				selector = selector.replace(match, ' '.repeat(match.length + 1));
			}
		}
	}());

	// Add attribute selectors to parts collection (type b)
	findMatch(attributeRegex, 'b');

	// Add ID selectors to parts collection (type a)
	findMatch(idRegex, 'a');

	// Add class selectors to parts collection (type b)
	findMatch(classRegex, 'b');

	// Add pseudo-element selectors to parts collection (type c)
	findMatch(pseudoElementRegex, 'c');

	// Add pseudo-class selectors to parts collection (type b)
	findMatch(pseudoClassWithBracketsRegex, 'b');
	findMatch(pseudoClassRegex, 'b');

	// Remove universal selector and separator characters
	selector = selector.replace(/[\*\s\+>~]/g, ' ');

	// Remove any stray dots or hashes which aren't attached to words
	// These may be present if the user is live-editing this selector
	selector = selector.replace(/[#\.]/g, ' ');

	// Remove the negation psuedo-class (:not) but leave its argument because specificity is calculated on its argument
	// Remove non-standard :local and :global CSS Module identifiers because they do not effect the specificity
	selector = selector.replace(/:not/g, '    ');
	selector = selector.replace(/:local/g, '      ');
	selector = selector.replace(/:global/g, '       ');
	selector = selector.replace(/[\(\)]/g, ' ');

	// The only things left should be element selectors (type c)
	findMatch(elementRegex, 'c');

	// Order the parts in the order they appear in the original selector
	// This is neater for external apps to deal with
	parts.sort((a, b) => a.index - b.index);

	return {
		selector: input,
		specificity: '0,' + typeCount.a.toString() + ',' + typeCount.b.toString() + ',' + typeCount.c.toString(),
		specificityArray: [0, typeCount.a, typeCount.b, typeCount.c],
		parts: parts
	};
};

/**
 * Compares two CSS selectors for specificity
 * Alternatively you can replace one of the CSS selectors with a specificity array
 *
 *  - it returns -1 if a has a lower specificity than b
 *  - it returns 1 if a has a higher specificity than b
 *  - it returns 0 if a has the same specificity than b
 */
const compare = function (a, b) {
	let aSpecificity;
	let bSpecificity;

	if (typeof a === 'string') {
		if (a.indexOf(',') !== -1) {
			throw 'Invalid CSS selector';
		} else {
			aSpecificity = calculateSingle(a)['specificityArray'];
		}
	} else if (Array.isArray(a)) {
		if (a.filter(function (e) { return (typeof e === 'number'); }).length !== 4) {
			throw 'Invalid specificity array';
		} else {
			aSpecificity = a;
		}
	} else {
		throw 'Invalid CSS selector or specificity array';
	}

	if (typeof b === 'string') {
		if (b.indexOf(',') !== -1) {
			throw 'Invalid CSS selector';
		} else {
			bSpecificity = calculateSingle(b)['specificityArray'];
		}
	} else if (Array.isArray(b)) {
		if (b.filter(function (e) { return (typeof e === 'number'); }).length !== 4) {
			throw 'Invalid specificity array';
		} else {
			bSpecificity = b;
		}
	} else {
		throw 'Invalid CSS selector or specificity array';
	}

	for (let i = 0; i < 4; i += 1) {
		if (aSpecificity[i] < bSpecificity[i]) {
			return -1;
		} else if (aSpecificity[i] > bSpecificity[i]) {
			return 1;
		}
	}
	return 0;
};

export {
	calculate,
	compare
};