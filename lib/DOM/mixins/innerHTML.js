'use strict'

import XMLSerializer from '../XMLSerializer.js'
//import DOMParser from '../DOMParser.js'

const InnerHTML = {}

Object.defineProperties(InnerHTML, {
  innerHTML: {
    get () {
        // serialize
		return ''
    },
    set() {
        // parse
    }
  }
})
/*
	get innerHTML() {
	    return this.serialize();
	}
	set innerHTML(v) {
	    var tmpdoc = HTMLParser.parseFragment(v === null ? '' : String(v));
	    console.log('innerHTML parseFragment OK');

	    //var root = tmpdoc.firstChild;
	    var root = tmpdoc;
	    var target = this;
	    //dump_tree(tmpdoc, '');

	    // Remove any existing children of this node
	    while (target.hasChildNodes())
	      target.removeChild(target.firstChild);

	  	this.firstChild = this.lastChild = null;

	    // Now copy newly parsed children from the root to this node
	    //target.doc.adoptNode(root);
	    this.ownerDocument.adoptNode(root);
	    if(root.firstChild.tagName === 'body') {
	    	root = root.firstChild;
	    }

	    while (root.hasChildNodes()) {
	      target.appendChild(root.firstChild);
	    }	
	    //this.print_tree();
	}
	get outerHTML() {
	    return this.serializeOne({ nodeType: 0 });
	}
	set outerHTML(v) {
	    var parent = this.parentNode;
	    if (parent === null) { return; }
	    if (parent.nodeType === Node.DOCUMENT_NODE) {
	      throw new DOMException(ERR.NO_MODIFICATION_ALLOWED_ERR);
	    }
	    if (parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
	      parent = parent.ownerDocument.createElement('body');
	    }
	    var tmpdoc = HTMLParser.parseFragment(v === null ? '' : String(v));
	    	    console.log('outerHTML parseFragment OK');


	    var root = tmpdoc;
	    this.ownerDocument.adoptNode(root);
	    if(root.hasChildNodes) {
	    	let childNodes = root.childNodes;
		   	this.replaceWith(...childNodes);
	    }
	}



	serialize() {
		let s = '';
		for (let kid = this.firstChild; kid; kid = kid.nextSibling) {
			s += kid.serializeOne(kid);
		}
		return s;
	}

	serializeOne(kid) {
		let s = '';
		switch (kid.nodeType) {
			case ELEMENT_NODE: //ELEMENT_NODE
				{
					s += '<' + kid.tagName;
					for (var j = 0, k = kid.attributes.length; j < k; j++) {
						const a = kid.attributes[j];
						s += ' ' + a.name;
						if (a.value !== undefined) s += '="' + escapeAttr(a.value) + '"';
					}
					s += '>';
					s += '\n';
					if (!['area', 'base', 'basefont', 'bgsound', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'keygen',
						'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(kid.tagName)) {
						const ss = kid.serialize();
						s += ss;
						s += '</' + kid.tagName + '>';
					}
				}
				break;
			case TEXT_NODE: //TEXT_NODE 
				{
					s += escape(kid.data);
				}
				break;
			case COMMENT_NODE: //COMMENT_NODE
				s += '<!--' + kid.data + '-->';
				break;
			default:
				break;
		}
		s += '\n';
		return s;
	}

*/

export default InnerHTML;