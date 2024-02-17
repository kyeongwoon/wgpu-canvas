'use strict'

import Node from './Node.js'

class Entity extends Node {
    nodeType = Node.ENTITY_NODE;
    constructor() {
        super()
    }
}


export default Entity;