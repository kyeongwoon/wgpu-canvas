'use strict';

class Screen extends EventTarget  {
  constructor(width, height) {
    super();

    this.colorDepth = this.pixelDepth = 32;
    this.height = this.availHeight = height;
    this.width = this.availWidth = width;
    this.left = this.availLeft = 0;
    this.top = this.availTop = 0;
    this.orientation = null; //ScreenOrientation
  }
  lockOrientation() {}
  unlockOrientation() {}

}

export default Screen;