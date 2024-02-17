import  Element  from '../Element.js'
import { CSSStyleDeclaration } from 'cssstyle'
import { HTML_NS, SVG_NS, XML_NS, XMLNS_NS } from '../NameSpace.js'

//https://github.com/Financial-Times/polyfill-library/tree/master/polyfills/Element/prototype
//https://html.spec.whatwg.org/multipage/dom.html#elements

class HTMLElement extends Element {
	lang = '';
	translate = false;
	dir = '';
	hidden = false;
	inert = false;
	popover = '';
	#style = null;

	constructor() {
		super();
		// only for linkedelemnt
		//this.sheet = cssom.parseStylesheet(null);
		this.namespaceURI = HTML_NS;
	}
	get title() {
		const elt = this.getElementsByTagName('title').item(0) || null;
		const value = elt ? elt.textContent : '';
		return value.replace(/[ \t\n\r\f]+/g, ' ').replace(/(^ )|( $)/g, '');
	}
	set title(value) {
		const elt = this.getElementsByTagName('title').item(0) || null;
		const head = this.head;
		if (!elt && !head) { return;}
		if (!elt) {
			elt = this.createElement('title');
			head.appendChild(elt);
		}
		elt.textContent = value;
	}
	get style() {
		if(this.#style) {
			return this.#style;
		}
		const style = new CSSStyleDeclaration();
		const cssText = this.getAttribute('style');
		if (cssText) {
			style.cssText = cssText;
		}
		this.#style = style;
		return this.#style;

	}
	set style(v) {
		if(!v) v = '';
		this.setAttribute('style', v)
	}
	/*
	// 2020
	get computedStyleMap() {

	}
	get specifiedStyle() {
		return this.#specifiedStyle;
	}
	get defaultStyle() {
		return this.#defaultStyle;
	}

	// https://stackoverflow.com/questions/27745438/how-to-compute-getboundingclientrect-without-considering-transforms
	//  getComputedStyle(el).transform;
	get currentStyle() {
		if (!this.#computedStyle) 
		  this.#computedStyle = new CSSStyleDeclaration(this, 'computedStyle');
		return this.#computedStyle;
	}


		get src() {return this.#src;}
	set src(v) {
		console.log('element src');
		this.#src = v;

		const fs = require('fs');
			const path = require('path');
			let a = path.resolve(this.ownerDocument.baseURI, v);
			console.log('path is ' + a);

			if(this.type === 'text/javascript') {
				let buf = fs.readFileSync(a).toString();
				this.innerText = buf; 			
			}
	}

	

	getContext(contextType, contextAttributes) {
		// 2d, webgl
		let window = this.ownerDocument?.defaultView;
		if(contextType === '2d')
			return window?.cavas?.ctx;
		else if(contextType === 'webgl')
			return null;
	}

	//////////////////////
	*/

	getClientRects() {
		// DOMRectList 리턴
		// 인라인의 Rect 리스트 반환
		throw new Error('getClientRects not yet implemented');
	}

	getBoundingClientRect() {
		if(!this.layout) {
			throw new Error('not yet computed')
		}
		// DOMRect return 
		return this.layout.box;
	}

	// 2020
	// https://stackoverflow.com/questions/27745438/how-to-compute-getboundingclientrect-without-considering-transforms
	//  getComputedStyle(el).transform;
	get offsetHeight() {
		return this.layout.box.height;
	}
	get offsetWidth() {
		return this.layout.box.width;
	}
	get offsetTop() {
		return this.layout.box.top;
	}
	get offsetLeft() {
		return this.layout.box.left;
	}
	get offsetParent() {}


	////////////////////////////////////////////////////////////
	// methods

	// 2020
	click() { // HTMLElement
	}
	attachInternals() {}
	showPopover() {}
	hidePopover() {}
	togglePopover(force) {}

}

export {HTMLElement}
export default HTMLElement;