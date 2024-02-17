'use strict'

import vm from 'vm'
import {
    ELEMENT_NODE,
    ATTRIBUTE_NODE,
    TEXT_NODE,
    CDATA_SECTION_NODE,
    ENTITY_REFERENCE_NODE,
    ENTITY_NODE,
    PROCESSING_INSTRUCTION_NODE,
    COMMENT_NODE,
    DOCUMENT_NODE,
    DOCUMENT_TYPE_NODE,
    DOCUMENT_FRAGMENT_NODE,
    NOTATION_NODE
} from './Node.js'
import Document from './Document.js'
import DocumentFragment from './DocumentFragment.js'
import DocumentType from './DocumentType.js'
import HTMLElement from './html/HTMLElement.js';
import Attr from './Attr.js'
import Comment from './Comment.js'
import Text from './Text.js'
import { HTML_NS } from './NameSpace.js'

class TreeAdapter {
    constructor() {
        this.doc = null;
        this.window = null;
    }

    createDocument() {
        const doc = new Document();
        doc.contentType = 'text/html';
        doc.namespaceURI = HTML_NS;
        this.doc = doc;
        //if(globalThis.window === window) 
        {
            window = globalThis.window;
            window.document = doc;
            globalThis.document = window.document;
            vm.runInContext("globalThis.document = this.document", window);
        }
        return doc;
    }

    createDocumentFragment() {
        //const node = new DocumentFragment();
        const node = this.doc.createDocumentFragment()
        return node;
    }

    createElement(tagName, namespaceURI, attrs = []) {
        //console.log(`createElement ${tagName}`)

        const node = this.doc.createElement(tagName);
        for (const item of attrs) {
            const attr = new Attr();
            // if HTML, attr name is lower case
            attr.nodeName = String(item.name).toLowerCase();
            attr.nodeValue = item.value;

            node.attributes.setNamedItem(attr);
        }
        return node;

        /*
        const doc = this.doc;
        const node = new HTMLElement();
        node.nodeName = tagName; // Node
        node.namespaceURI = namespaceURI; // Element
        node.prefix = ''; // Element
        node.localName = tagName; // Element

        for (const item of attrs) {
            const attr = new Attr();
            // if HTML, attr name is lower case
            attr.nodeName = String(item.name).toLowerCase();
            attr.nodeValue = item.value;

            node.attributes.setNamedItem(attr);
        }

        return node;
        */
    }

    createCommentNode(data) {
        //console.log(`createCommentNode ${data}`)
        //const node = new Comment(data);
        const node = this.doc.createComment(data);
        return node;
    }

    createTextNode(value) {
        //console.log(`createTextNode ${value}`)
        const node = this.doc.createTextNode(value);
        //const node = new Text(value);
        return node;
    }

    //Tree mutation
    appendChild(parentNode, newNode) {
        //console.log('appendChild')
        if (!parentNode) {
            console.log('~~~~ parentNode === null')
            return;
        }
        if (!parentNode.ownerDocument) {
            console.log('~~~~ parentNode.ownerDocument === null')
        }
        newNode.ownerDocument = parentNode.ownerDocument;
        if (newNode.nodeType === TEXT_NODE
            && parentNode.nodeType === ELEMENT_NODE && parentNode.tagName !== 'pre') {
            let text = newNode.textContent;
            text = text.replace(/\n/g, '').replace(/ +/g, ' ').trim();
            if (text.length === 0) {
                //console.log('text length is 0')
                return;
            }
        }


        parentNode.appendChild(newNode)
        if (newNode.nodeType === TEXT_NODE &&
            parentNode.nodeType === ELEMENT_NODE && parentNode.tagName === 'script') {
            console.log('run script....')

            const text = newNode.textContent;
            const script = vm.createScript(text);
            script.runInContext(window);
        }
    }

    insertBefore(parentNode, newNode, referenceNode) {
        //console.log('insertBefore')
        if (parentNode.ownerDocument === null) {
            console.log('~~~~ parentNode.ownerDocument === null')
        }
        newNode.ownerDocument = parentNode.ownerDocument;
        parentNode.insertBefore(newNode, referenceNode);
    }

    setTemplateContent(templateElement, contentElement) {
        console.log('setTemplateContent')
        templateElement.content = contentElement;
    }

    getTemplateContent(templateElement) {
        console.log('getTemplateContent')
        return templateElement.content;
    }

    setDocumentType(document, name, publicId, systemId) {
        // console.log('setDocumentType')
        let doctypeNode = null;

        for (let i = 0; i < document.childNodes.length; i++) {
            if (document.childNodes[i].nodeName === '#documentType') {
                doctypeNode = document.childNodes[i];
                break;
            }
        }

        if (doctypeNode) {
            doctypeNode.nodeName = doctypeNode.name = name;
            doctypeNode.publicId = publicId;
            doctypeNode.systemId = systemId;
        } else {
            doctypeNode = new DocumentType();
            doctypeNode.ownerDocument = document;

            doctypeNode.nodeName = doctypeNode.name = name;
            doctypeNode.publicId = publicId;
            doctypeNode.systemId = systemId;

            this.appendChild(document, doctypeNode)
        }
    }

    setDocumentMode(document, mode) {
        // console.log('setDocumentMode')
        // compadMode
        document.mode = mode;
    }

    getDocumentMode(document) {
        console.log('getDocumentMode')
        return document.mode;
    }

    detachNode(node) {
        console.log('detachNode')
        if (node.parentNode) {
            const idx = node.parentNode.childNodes.indexOf(node);

            node.parentNode.childNodes.splice(idx, 1);
            node.parentNode = null;
        }
    }

    insertText(parentNode, text) {
        //console.log('insertText')
        if (parentNode.childNodes.length) {
            const prevNode = parentNode.childNodes[parentNode.childNodes.length - 1];

            if (prevNode.nodeName === '#text') {
                //prevNode.value += text;
                prevNode.appendData(text);
                return;
            }
        }
        this.appendChild(parentNode, this.createTextNode(text));
    }

    insertTextBefore(parentNode, text, referenceNode) {
        //console.log('insertTextBefore')
        const prevNode = parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];

        if (prevNode && prevNode.nodeName === '#text') {
            prevNode.appendData(text);
            //prevNode.value += text;
        } else {
            //parentNode.insertBefore(parentNode, createTextNode(text), referenceNode)
            this.insertBefore(parentNode, this.createTextNode(text), referenceNode);
        }
    }

    adoptAttributes(recipient, attrs) {
        console.log('adoptAttributes')
        const recipientAttrsMap = [];

        for (let i = 0; i < recipient.attrs.length; i++) {
            recipientAttrsMap.push(recipient.attrs[i].name);
        }

        for (let j = 0; j < attrs.length; j++) {
            if (recipientAttrsMap.indexOf(attrs[j].name) === -1) {
                recipient.attrs.push(attrs[j]);
            }
        }
    }

    //Tree traversing
    getFirstChild(node) {
        //console.log('getFirstChild')
        return node.getFirstChild;
    }

    getChildNodes(node) {
        //console.log('getChildNodes')
        return node.childNodes; // NodeList
    }

    getParentNode(node) {
        //console.log('getParentNode')
        return node.parentNode; // Node
    }

    getAttrList(element) {
        //console.log('getAttrList')
        return element.attributes;
    }

    //Node data
    getTagName(element) {
        // console.log('getTagName')
        return element.tagName;
    }

    getNamespaceURI(element) {
        //console.log('getNamespaceURI')
        return element.namespaceURI;
    }

    getTextNodeContent(textNode) {
        //console.log('getTextNodeContent')
        return textNode.textContent;
    }

    getCommentNodeContent(commentNode) {
        //console.log('getCommentNodeContent')
        return commentNode.data;
    }

    getDocumentTypeNodeName(doctypeNode) {
        //console.log('getDocumentTypeNodeName')
        return doctypeNode.name;
    }

    getDocumentTypeNodePublicId(doctypeNode) {
        //console.log('getDocumentTypeNodePublicId')
        return doctypeNode.publicId;
    }

    getDocumentTypeNodeSystemId(doctypeNode) {
        //console.log('getDocumentTypeNodeSystemId')
        return doctypeNode.systemId;
    }

    //Node types
    isTextNode(node) {
        return node.nodeType === TEXT_NODE;
    }

    isCommentNode(node) {
        return node.nodeType === COMMENT_NODE;
    }

    isDocumentTypeNode(node) {
        return node.nodeType === DOCUMENT_TYPE_NODE;
    }

    isElementNode(node) {
        return node.nodeType === ELEMENT_NODE;
    }

    // Source code location
    setNodeSourceCodeLocation(node, location) {
        //console.log('setNodeSourceCodeLocation')
        node.sourceCodeLocation = location;
    }

    getNodeSourceCodeLocation(node) {
        //console.log('getNodeSourceCodeLocation')
        return node.sourceCodeLocation;
    }

    updateNodeSourceCodeLocation(node, endLocation) {
        //console.log('updateNodeSourceCodeLocation')
        node.sourceCodeLocation = Object.assign(node.sourceCodeLocation, endLocation);
    }
}

const treeAdapter = new TreeAdapter();

export default treeAdapter;