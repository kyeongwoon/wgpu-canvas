'use strict'

import Node from './Node.js'

class ProcessingInstruction extends Node {
    nodeType = Node.PROCESSING_INSTRUCTION_NODE;
    target = '';
    data = '';
    constructor() {
        super()
    }
}


export default ProcessingInstruction;