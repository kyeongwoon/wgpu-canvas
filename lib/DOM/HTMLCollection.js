'use strict'

class HTMLCollection extends Array {
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
    namedItem(name) {
        for (let i = 0; i < this.length; i += 1) {
            if (this[i].id === name || this[i].name === name) {
                return this[i];
            }
        }
        return null;
    }
    // 'name'?
}

if (HTMLCollection.prototype[Symbol.iterator] === undefined) {
    HTMLCollection.prototype[Symbol.iterator] = function () {
        let i = 0;
        return {
            next: () => {
                return { done: i >= this.length, value: this.item(i++) };
            }
        }
    };
}
export default HTMLCollection;