'use strict'

import { DOMException } from './index.js'
import Parser from '../DOM/parse5/lib/parser/index.js'
import treeAdapter from '../DOM/treeAdapter.js'
import fs from 'fs'
import path from 'path'

class Location {
    _href = '';
    origin = '';
    ancestorOrigins = '';
    ownerWindow = null; // ownerWindow
    constructor() {
        this.hash = ''
    }
    get href() {
        return this._href;
    }
    set href(url) {
        console.log(`set href ${url}`)
        this._href = url;
        const win = this.ownerWindow;

        if (/^\s*https?:\/\//.test(url)) {
        } else {

        }

        if(!fs.existsSync(url)) {
            return;
        }
        const html = fs.readFileSync(url).toString();
        const parser = new Parser({ treeAdapter });

        // create document....
        //const doc = document.implementation.createHTMLDocument();
        const doc = parser.parse(html);
        doc.normalize();
        doc.defaultView = win;

        //const doc = parser(...);
        this.ownerWindow.document = doc;
        if (globalThis.win === win) {
            globalThis.document = win.document;
            vm.runInContext("globalThis.document = this.document", win);
        }
    }
    assign(url) {
        this.href = url;
    }
    replace(url) {

    }
    reload() {

    }
}

export default Location;