'use strict'

import Node from "./Node.js";
import NonDocumentTypeChildNode from './mixins/NodDocumentTypeChildNode.js'
import ChildNode from './mixins/ChildNode.js'
import DOMException, { INDEX_SIZE_ERR } from './DOMException.js'

class CharacterData extends Node {
  data = ''
  constructor() {
    super();
  }
  get length() {
    return this.data.length;
  }
  get nodeValue() { return this.data }
  set nodeValue(val) { this.data = val }

  get textContent() { return this.data }
  set textContent(text) { this.data = text }

  substringData(offset, count) {
    if (arguments.length < 2) { throw new TypeError("Not enough arguments"); }
    offset = offset >>> 0;
    count = count >>> 0;
    if (offset > this.data.length || offset < 0 || count < 0) {
      throw new DOMException(INDEX_SIZE_ERR);
    }
    return this.data.substring(offset, offset + count);
  }

  appendData(data) {
    if (arguments.length < 1) { throw new TypeError("Not enough arguments"); }
    this.data += String(data);
  }

  insertData(offset, data) {
    this.replaceData(offset, 0, data);
  }

  deleteData(offset, count) {
    this.replaceData(offset, count, '');
  }

  replaceData(offset, count, data) {
    const curtext = this.data;
    const len = curtext.length;

    // Convert arguments to correct WebIDL type
    offset = offset >>> 0;
    count = count >>> 0;
    data = String(data);

    if (offset > len || offset < 0) {
      throw new DOMException(INDEX_SIZE_ERR);
    }

    if (offset + count > len)
      count = len - offset;

    const prefix = curtext.substring(0, offset);
    const suffix = curtext.substring(offset + count);

    this.data = prefix + data + suffix;
  }
}

Object.assign(CharacterData.prototype, ChildNode)
Object.assign(CharacterData.prototype, NonDocumentTypeChildNode)
Object.defineProperties(CharacterData.prototype, Object.getOwnPropertyDescriptors(NonDocumentTypeChildNode))


export default CharacterData;