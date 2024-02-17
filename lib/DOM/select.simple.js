/* eslint-disable no-constant-condition */
/*eslint class-methods-use-this: "error"*/
/*eslint-env es6*/
'use strict';

import process from 'process'

/*
   .parser { margin: 0 5em 1em; width: 2em; height: 1em; error: \}; background: yellow; }  // unknow propname
   * html .parser {  background: gray; } // not match
   \.parser { padding: 2em; } // selector error
   .parser { m\argin: 2em; }; //unknow prop name
   .parser { height: 3em; }
   .parser { width: 200; } // invalid prop value
   .parser { border: 5em solid red ! error; } // invalid prop value
   .parser { background: red pink; } // invalid prop value

*/

// element.matches(selector)
function matches(el, selector) {
	return selector.replace(/\s+/g, ' ') // '   ' -> ' '
		.replace(/^\s+|\s+$/g, '') // ' str ' -> 'str'
		.split(/,\s*(?![^\[]*["'])/) // 'a,b' -> [a, b]
		.map(item => item.replace(/(^|\s|\$)(:|\[|\.|#)/g, '$1*$2')) // .test -> *.test
		.some(item => { if (match_one(el, item)) return true; });
}

function match_one(el, selector) {
	let arr = [];
	let ops = [];
	ops.push('noop');

	while (selector.length > 0) {
		var cap = /\s*(\$?(?:\w+|\*)(?:[.#:][^\s]+|\[[^\]]+\])*)\s*$/.exec(selector);
		if (cap === null) {
			//console.log(selector);
			return false;
		}
		arr.push(cap[1]);
		var len = selector.length - cap[0].length;
		var op = selector[len - 1];
		if (![' ', '>', '+', '~', '|'].includes(op)) {
			op = ' ';
		}
		if (op === '|') {
			op = '||';
			len--;
		}
		ops.push(op);
		selector = selector.substring(0, op !== ' ' ? len - 2 : len);
	}
	ops.pop();

	let target = el;

	for (let j = 0; j < arr.length; j++) {
		let op = ops[j];
		let sel = arr[j];
		if (op === 'noop') {
			if (!test(target, sel))
				return false;
		} else if (op === ' ') { // E F : 	Matches any F element that is a descendant of an E element.
			// avoid case of '* html .parser'
			//if(target.tagName === 'html') return false;
			let found = false;
			target = target.parentElement;
			while (target && target.nodeType === 1) {
				if (test(target, sel)) {
					found = true;
					break;
				}
				target = target.parentElement;
			}
			if (!found) return false;
		} else if (op === '>') { // E > F Matches any F element that is a child of an element E.
			// avoid case of '* > html .parser'
			//if(target.tagName === 'html') return false;
			target = target.parentElement;
			if (!target || !test(target, sel))
				return false;
		} else if (op === '+') { // 	Matches any F element immediately preceded by a sibling element E.
			//Adjacent sibling combinator
			target = target.previousElementSibling;
			if (!target || !test(target, sel))
				return false;
		} else if (op === '~') {
			//General sibling combinator
			let found = false;
			target = target.previousElementSibling;
			while (target) {
				if (test(target, sel)) {
					found = true;
					break;
				}
				target = target.previousElementSibling;
			}
			if (!found) return false;
		} else if (op === '||') {
			console.log('op is ||');
			process.exit(0);
		}
	}
	return true;
}

function test(el, selector) {
	let sub_arr = selector.split(/(?=[\[:.#])/);
	let tel = sub_arr.shift();
	if (tel !== '*') {
		if (el.tagName !== tel)
			return false;
	}

	for (let ss of sub_arr) {
		if (ss[0] === '#') {
			//console.log(tel + ' id')
			let name = ss.substring(1);
			let tid = el.getAttribute('id');
			if (name !== tid) return false;
			//console.log('id match ' + tid)

		} else if (ss[0] === '.') {
			let name = ss.substring(1);
			//console.log(tel + ' class ' + name)
			if (el.classList === null || el.classList === undefined) {
				console.log('classList is null');
				console.log(selector);
				//console.log(el);
			}
			if (!el.classList.contains(name)) {
				return false;
			}
		} else if (ss[0] === '[') {
			let cap = /^\[([\w-]+)(?:([^\w]?=)([^\]]+))?\]/.exec(ss);
			if (cap[2] === undefined) { //only has [attr]
				continue;
			}
			// cap3
			// second\ two
			// 'second two'
			// second two => ERROR
			if (cap[3].includes('\\')) {
				cap[3] = cap[3].replace('\\ ', ' ');
			} else if (cap[3].includes('\"')) {
				cap[3] = cap[3].replaceAll('\"', '');
			} else if (cap[3].includes(' ')) {
				return false;
			}

			let val = el.getAttribute(cap[1]);
			switch (cap[2]) {
				case '=':
					if (val !== cap[3]) return false;
					break;
				case '~=': //space-separated list of "words"
					{
						//class="module accordion expand"
						let arr = val.split(' ');
						if (!arr.includes(cap[3])) return false;
					}
					break;
				case '|=': //hyphen-separated list of "words", beginning with "val" or "val-"
					{
						let arr = val.split('-');
						if (arr[0] !== cap[3]) return false;
					}
					break;
				case '^=':
					if (!val.startsWith(cap[3])) return false;
					break;
				case '$=': // end with this
					if (!val.endsWith(cap[3])) return false;
					break;
				case '*=': // substring match
					if (!val.includes(cap[3])) return false;
					break;
			}
			//console.log(tel + ' attr ' + cap[1] + ' ' + cap[2] + ' ' + cap[3])
		} else if (ss[0] === ':') {
			let cap = /^:{1,2}([\w-]+)(?:\(([^)]+)\))?/.exec(ss);
			if (cap[2] !== undefined) {
			}
			// default.css a:link
			// acid2 :link, :visited :hover :after
			switch (cap[1]) {
				case 'after':
					break;
				case 'before':
					break;
				case 'first-letter':
					break;
				case 'first-line':
					break;
				case 'selection':
					break;

				case 'link':
					break;
				case 'first-child':
					break;
				case 'last-child':
					break;
				case 'only-child':
					break;
				case 'nth-child':
					break;
				case 'nth-last-child':
					break;
			}
		} else {
			// error
			console.log('unknown format ' + ss);
			process.exit(0);
		}
	}
	return true;
}

// for querySelectorAll
export default function (selector, el) {
	const res = [];
	const arr = el.getElementsByTagName('*');
	arr.forEach(item => {
		if (matches(item, selector)) {
			res.push(item);
		}
	});
	return res;
};
export { matches }

