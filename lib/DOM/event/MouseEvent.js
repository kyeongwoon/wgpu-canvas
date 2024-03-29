import UIEvent from "./UIEvent.js";

class MouseEvent extends UIEvent {
  constructor() {
    super();
    this.screenX = this.screenY = this.clientX = this.clientY = 0;
    this.ctrlKey = this.altKey = this.shiftKey = this.metaKey = false;
    this.button = 0;
    this.buttons = 1;
    this.relatedTarget = null;
  }

  initMouseEvent(type, bubbles, cancelable,
    view, detail,
    screenX, screenY, clientX, clientY,
    ctrlKey, altKey, shiftKey, metaKey,
    button, relatedTarget) {

    this.initEvent(type, bubbles, cancelable, view, detail);
    this.screenX = screenX;
    this.screenY = screenY;
    this.clientX = clientX;
    this.clientY = clientY;
    this.ctrlKey = ctrlKey;
    this.altKey = altKey;
    this.shiftKey = shiftKey;
    this.metaKey = metaKey;
    this.button = button;
    switch (button) {
      case 0: this.buttons = 1; break;
      case 1: this.buttons = 4; break;
      case 2: this.buttons = 2; break;
      default: this.buttons = 0; break;
    }
    this.relatedTarget = relatedTarget;
  }
  getModifierState(key) {
    switch (key) {
      case "Alt": return this.altKey;
      case "Control": return this.ctrlKey;
      case "Shift": return this.shiftKey;
      case "Meta": return this.metaKey;
      default: return false;
    }
  }
}

export default MouseEvent;