import assert from 'assert';

import CSSValueExpression from './CSSValueExpression.js';

describe('CSSValueExpression', function () {
	const END = '__EOL__';
	const cssExpressionValue = [
		"(function(hash){",
		"	if (!hash.match(/#[0-9a-f]{3,6}/g)) {",
		"		hash = hash.substr(1);",
		"		if (!hash) {",
		"			hash = '#ccc';",
		"		}",
		"	}",

		"	var n1 = 4/5;",

		"	// hello line comment",

		"	var n2 = 5/6;",

		"	var r1 = /hello ( /img;",

		"	// hello line comment",

		"	/* hello block comment */",

		"	return hash;",
		"}(location.hash))",
		END
	].join('\n');

	test('cssExpressionValue', () => {
		const i = 0;
		const token = cssExpressionValue;
		const info = (new CSSValueExpression(token, i)).parse();

		expect(info.idx).toBeDefined();

		let end = token.substr(info.idx + 1);
		end = end.trim();
		expect(end).toBe(END);
	});
});
