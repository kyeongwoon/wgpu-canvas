'use strict'

import Document from "./Document.js";

class XMLDocument extends Document {
    type = 'xml';
    mode = 'no-quirks';
    constructor() {
        super();
    }
}

export default XMLDocument;