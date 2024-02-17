'use strict'

import {TEXT_NODE} from "./Node.js";
import CharacterData from "./CharacterData.js";

class Text extends CharacterData {
	nodeName = '#text';
	nodeType = TEXT_NODE;
	constructor(data = '') {
		super()
		this.data = data;
	}

	splitText(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if (this.parentNode) {
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
	
	get wholeText() {
	    let result = this.textContent;
	    for (let next = this.nextSibling; next; next = next.nextSibling) {
	      if (next.nodeType !== Node.TEXT_NODE) break;
	      result += next.textContent;
	    }
	    return result;		
	}
}


export default Text;