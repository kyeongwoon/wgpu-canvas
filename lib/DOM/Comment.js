'use strict'

import {COMMENT_NODE} from "./Node.js"
import CharacterData from "./CharacterData.js";

class Comment extends CharacterData {
    nodeName=  '#comment';
	nodeType = COMMENT_NODE;
    constructor(data) {
        super()
        this.data = data;
    }
}

export default Comment;