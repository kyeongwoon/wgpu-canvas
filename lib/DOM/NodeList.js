'use strict';

class NodeList extends Array {
	constructor(a) {
        super((a && a.length) || 0);
        if (a) {
            for (let index in a) { 
            	this[index] = a[index]; 
            }
        }
    }
	item(index) {
		return this[index] || null;
	}    
}

if(NodeList.prototype[Symbol.iterator] === undefined) {
    NodeList.prototype[Symbol.iterator] = function () {
        let i = 0;
        return {
            next: () => {
                return { done: i >= this.length, value: this.item(i++) };
            }
        }
    };
}

export default NodeList;
