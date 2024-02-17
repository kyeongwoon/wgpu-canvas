'use strict'

import Node from '../Node.js'

const NonDocumentTypeChildNode = {}

Object.defineProperties(NonDocumentTypeChildNode, {
  previousElementSibling: {
    get () {
      /*
      let kid = this.previousSibling;
      while (kid) {
        if (kid.nodeType === Node.ELEMENT_NODE) return kid;
        kid = kid.previousSibling;
      }
      return null;
      */
      let node = this;
      while (node = node.previousSibling) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return node
        }
      }
      return null
    }
  },

  nextElementSibling: {
    get () {
      /*
      let kid = this.nextSibling;
      while (kid) {
        if (kid.nodeType === Node.ELEMENT_NODE) return kid;
        kid = kid.nextSibling;
      }
      return null;
      */
      let node = this;
      while (node = node.nextSibling) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return node
        }
      }
      return null;
    }
  }
})

export default NonDocumentTypeChildNode;