'use strict'
import Node from './Node.js'


class EntityReference extends Node {
    nodeType = Node.ENTITY_REFERENCE_NODE;
    constructor() {
        super()
    }
}

export default EntityReference;