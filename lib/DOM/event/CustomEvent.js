'use strict'

class CustomEvent extends Event {
    constructor(type, eventInitDict = {}) {
        super(type, eventInitDict);
    }
    initCustomEvent(type,  bubbles = false, cancelable = false, detail = null) {
        this.initEvent(type, bubbles, cancelable);
        this.detail = detail;    }
}

export default CustomEvent;