'use strict'

class CSSValue {
    constructor() {
    }
    // @see: http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSValue
    set cssText(text) {
        const name = this._getConstructorName();
        throw new Error('DOMException: property "cssText" of "' + name + '" is readonly and can not be replaced with "' + text + '"!');
    }

    get cssText() {
        const name = this._getConstructorName();
        throw new Error('getter "cssText" of "' + name + '" is not implemented!');
    }

    _getConstructorName() {
        const s = this.toString();
        const c = s.match(/function\s([^\(]+)/);
        const name = c[1];

        return name;
    }
}

export default CSSValue;