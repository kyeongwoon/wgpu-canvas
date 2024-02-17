'use strict'
import NodeList from "../NodeList.js";
import HTMLCollection from "../HTMLCollection.js";
import Node from '../Node.js'
import select from '../select.simple.js'

const ParentNode = {
  prepend(...nodes) {
    const docFrag = document.createDocumentFragment();
    nodes.forEach(function (argItem) {
      const isNode = argItem instanceof Node;
      docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
    });
    this.insertBefore(docFrag, this.firstChild);
  },

  append(...nodes) {
    const docFrag = document.createDocumentFragment();
    nodes.forEach(function (argItem) {
      const isNode = argItem instanceof Node;
      docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
    });

    this.appendChild(docFrag);
  },

  replaceChildren(...nodes) {
    while (this.firstChild) {
      this.removeChild(this.firstChild)
    }
    this.append(...nodes)
  },

  querySelectorAll(selector) {
    // return NodeList
    let nodes = select(selector, this);
    return nodes.item ? nodes : new NodeList(nodes);
  },

  querySelector(selector) {
    //console.log('querySelector')
    return select(selector, this)[0];
  },
}


Object.defineProperties(ParentNode, {
  children: {
    // return HTMLCollection
    get() {
      const array = new HTMLCollection();
      for (let kid = this.firstChild; kid; kid = kid.nextSibling) {
        if (kid.nodeType === Node.ELEMENT_NODE)
          array.push(kid);
      }
      return array;
    },
    set(v) {
      // v is HTMLCollection, childNodes = new NodeList();

    }
  },

  firstElementChild: {
    get() {
      for (let kid = this.firstChild; kid; kid = kid.nextSibling) {
        if (kid.nodeType === Node.ELEMENT_NODE) return kid;
      }
      return null;
    }
  },

  lastElementChild: {
    get() {
      for (let kid = this.lastChild; kid; kid = kid.previousSibling) {
        if (kid.nodeType === Node.ELEMENT_NODE) return kid;
      }
      return null;
    }
  },

  childElementCount: {
    get() {
      return this.children.length;
    }
  }
})

export default ParentNode;