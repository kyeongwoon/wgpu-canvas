'use strict'

class NodeIterator {
    constructor(root, whatToShow, filter) {
        this._root = root;
        this._referenceNode = root;
        this._pointerBeforeReferenceNode = true;
        this._whatToShow = Number(whatToShow) || 0;
        this._filter = filter || null;
        this._active = false;
        // Record active node iterators in the document, in order to perform
        // "node iterator pre-removal steps".
        root.doc._attachNodeIterator(this);
    }
    get root() {return this._root}
    get referenceNode() {return this._referenceNode}
    get pointerBeforeReferenceNode() { return this._pointerBeforeReferenceNode}
    get whatToShow() {return this._whatToShow}
    get filter() {return this._filter}
    
    _internalFilter(node) {
        var result, filter;
        if (this._active) {
          utils.InvalidStateError();
        }
    
        // Maps nodeType to whatToShow
        if (!(((1 << (node.nodeType - 1)) & this._whatToShow))) {
          return NodeFilter.FILTER_SKIP;
        }
    
        filter = this._filter;
        if (filter === null) {
          result = NodeFilter.FILTER_ACCEPT;
        } else {
          this._active = true;
          try {
            if (typeof filter === 'function') {
              result = filter(node);
            } else {
              result = filter.acceptNode(node);
            }
          } finally {
            this._active = false;
          }
        }
    
        // Note that coercing to a number means that
        //  `true` becomes `1` (which is NodeFilter.FILTER_ACCEPT)
        //  `false` becomes `0` (neither accept, reject, or skip)
        return (+result);
    }
    _preremove(toBeRemovedNode) {
        if (isInclusiveAncestor(toBeRemovedNode, this._root)) { return; }
        if (!isInclusiveAncestor(toBeRemovedNode, this._referenceNode)) { return; }
        if (this._pointerBeforeReferenceNode) {
          var next = toBeRemovedNode;
          while (next.lastChild) {
            next = next.lastChild;
          }
          next = NodeTraversal.next(next, this.root);
          if (next) {
            this._referenceNode = next;
            return;
          }
          this._pointerBeforeReferenceNode = false;
          // fall through
        }
        if (toBeRemovedNode.previousSibling === null) {
          this._referenceNode = toBeRemovedNode.parentNode;
        } else {
          this._referenceNode = toBeRemovedNode.previousSibling;
          var lastChild;
          for (lastChild = this._referenceNode.lastChild;
               lastChild;
               lastChild = this._referenceNode.lastChild) {
            this._referenceNode = lastChild;
          }
        }
    }

    detach() {

    }
    nextNode() { 
        return traverse(this, true);
    }
    previousNode() { 
        return traverse(this, false);
    }
}

// Iterator
function move(node, stayWithin, directionIsNext) {
    if (directionIsNext) {
        return NodeTraversal.next(node, stayWithin);
    } else {
        if (node === stayWithin) {
            return null;
        }
        return NodeTraversal.previous(node, null);
    }
}

function isInclusiveAncestor(node, possibleChild) {
    for (; possibleChild; possibleChild = possibleChild.parentNode) {
        if (node === possibleChild) { return true; }
    }
    return false;
}

function traverse(ni, directionIsNext) {
    var node, beforeNode;
    node = ni._referenceNode;
    beforeNode = ni._pointerBeforeReferenceNode;
    while (true) {
        if (beforeNode === directionIsNext) {
            beforeNode = !beforeNode;
        } else {
            node = move(node, ni._root, directionIsNext);
            if (node === null) {
                return null;
            }
        }
        var result = ni._internalFilter(node);
        if (result === NodeFilter.FILTER_ACCEPT) {
            break;
        }
    }
    ni._referenceNode = node;
    ni._pointerBeforeReferenceNode = beforeNode;
    return node;
}

// Node Traversal

function nextSkippingChildren(node, stayWithin) {
    if (node === stayWithin) {
        return null;
    }
    if (node.nextSibling !== null) {
        return node.nextSibling;
    }
    return nextAncestorSibling(node, stayWithin);
}


function nextAncestorSibling(node, stayWithin) {
    for (node = node.parentNode; node !== null; node = node.parentNode) {
        if (node === stayWithin) {
            return null;
        }
        if (node.nextSibling !== null) {
            return node.nextSibling;
        }
    }
    return null;
}


function next(node, stayWithin) {
    let n = node.firstChild;
    if (n !== null) {
        return n;
    }
    if (node === stayWithin) {
        return null;
    }
    n = node.nextSibling;
    if (n !== null) {
        return n;
    }
    return nextAncestorSibling(node, stayWithin);
}


function deepLastChild(node) {
    while (node.lastChild) {
        node = node.lastChild;
    }
    return node;
}


function previous(node, stayWithin) {
    let p = node.previousSibling;
    if (p !== null) {
        return deepLastChild(p);
    }
    p = node.parentNode;
    if (p === stayWithin) {
        return null;
    }
    return p;
}


export default NodeIterator;