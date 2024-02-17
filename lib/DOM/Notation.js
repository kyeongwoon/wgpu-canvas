'use strict'
import Node from './Node.js'

class Notation extends Node {
    nodeType = Node.NOTATION_NODE;
    constructor() {
        super()
    }
}


export default Notation;