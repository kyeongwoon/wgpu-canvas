'use strict'

class UIEvent extends Event {
    constructor() {
        super();
        this.view = null;
        this.detail = null;
    }
    initUIEvent(type,  bubbles = false, cancelable = false, view, detail = null) {
        this.initEvent(type, bubbles, cancelable);
        this.view = view;
        this.detail = detail;
    }
 }

 export default UIEvent;