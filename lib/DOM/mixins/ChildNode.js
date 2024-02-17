'use strict'

// https://dom.spec.whatwg.org/#interface-childnode

const ChildNode = {
	// function
	before(...args) {
		const parentNode = this.parentNode;
		const prevSibling = this.previousSibling;
		if (parentNode === null) { return; }

		while (prevSibling && args.some(function (v) { return v === prevSibling; })) {
			prevSibling = prevSibling.previousSibling;
		}

		const docFrag = document.createDocumentFragment();
		for (const argItem of args) {
			const isNode = argItem instanceof Node;
			docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
		}

		const nextSibling = prevSibling ? prevSibling.nextSibling : parentNode.firstChild;
		parentNode.insertBefore(docFrag, nextSibling);
	},

	after(...args) {
		const parentNode = this.parentNode;
		const nextSibling = this.nextSibling;
		if (parentNode === null) { return; }

		while (nextSibling && args.some(function (v) { return v === nextSibling; })) {
			nextSibling = nextSibling.nextSibling;
		}

		const docFrag = document.createDocumentFragment();
		for (const argItem of args) {
			const isNode = argItem instanceof Node;
			docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
		}
		parentNode.insertBefore(docFrag, nextSibling);
	},

	replaceWith(...args) {
		//https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/replaceWith#Polyfill	
		let parent = this.parentNode;
		if (!parent) return;

		let i = args.length;
		if (!i) // if there are no arguments
			parent.removeChild(this);

		let currentNode;
		while (i--) { // i-- decrements i and returns the value of i before the decrement
			currentNode = args[i];
			if (typeof currentNode !== 'object') {
				currentNode = this.ownerDocument.createTextNode(currentNode);
			} else if (currentNode.parentNode) {
				currentNode.parentNode.removeChild(currentNode);
			}
			// the value of "i" below is after the decrement
			if (!i) // if currentNode is the first argument (currentNode === arguments[0])
				parent.replaceChild(currentNode, this);
			else {// if currentNode isn't the first 
				parent.insertBefore(currentNode, this.nextSibling);
			}
		}
	},

	remove() {
		if (this.parentNode === null) return;
		this.parentNode.removeChild(this);
	},
}

export default ChildNode;