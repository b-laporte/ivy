/**
 * Nac Node library
 * (aka. Node / Attributes / Content)
 * Copyright Bertrand Laporte 2016
 */

/**
 * Create a NacNode instance
 * @param nodeName the node name for element nodes or "#text", "#comment" or "#js" for other node types
 * @param nodeValue the value of the text / comment or js insruction (ignored for element nodes)
 * @param value2 an optional value to describe the end block expression for js blocks
 */
export function n(nodeName, nodeValue = null, value2 = null)/*:NacNode*/ {
    var nd = new NacNode(NacNodeType.ELEMENT, nodeValue);

    nd.nodeName = nodeName;
    if (nodeName.charAt(0) === "#") {
        if (nodeName === "#text") {
            nd.nodeType = NacNodeType.TEXT;
        } else if (nodeName === "#insert") {
            nd.nodeType = NacNodeType.INSERT;
        } else if (nodeName === "#js") {
            nd.nodeType = NacNodeType.JS_EXPRESSION;
        } else if (nodeName === "#jsblock") {
            nd.nodeType = NacNodeType.JS_BLOCK;
            nd.nodeValue = {
                startBlockExpression: nodeValue,
                endBlockExpression: (value2 || "}")
            }
        } else if (nodeName === "#comment") {
            nd.nodeType = NacNodeType.COMMENT;
        } else if (nodeName === "#group") {
            nd.nodeType = NacNodeType.ELEMENT;
        } else {
            nd.nodeValue = "#error - invalid type: " + nodeName;
            NacNode.logger.error("Invalid node type: " + nodeName);
        }
    } else {
        nd.nodeValue = null;
    }

    return nd;
}

export const NacNodeType = {
    ELEMENT: 1,
    TEXT: 3,
    COMMENT: 8,
    INSERT: 12,         // e.g. {{foo.bar}}
    JS_EXPRESSION: 13,  // e.g. % let foo = 3;
    JS_BLOCK: 14,       // e.g. % let foo = 3;
    COMPONENT: 15
};

export const NacAttributeNature = { // warning: keep incremental values as used to index an array in nac2js
    STANDARD: 0,            // e.g. foo="bar"
    BOUND1WAY: 1,           // e.g. [foo]=c.bar+3
    BOUND2WAYS: 2,          // e.g. [[foo]]=c.bar
    DEFERRED_EXPRESSION: 3  // e.g. (onclick)=c.doSomething()
}

export class NacNode {
    static defaultLogger;               // default logger if logger is not set (console by default - cf. below)
    static logger /*:{error:(m:string)=>void} */; // specific logger for this node
    nodeType /*:NacNodeType*/;
    nodeValue /*:string*/;
    nodeName;                           // node name for element nodes or optionally "#text", "#comment" or "#js" for other node types when created through n()
    parentNode;
    nextSibling /*:NacNode*/;           // next sibling in the current linked list
    firstSibling /*:NacNode*/;		    // first sibling of the current node linked list
    firstAttribute /*:NacAttribute*/;	// reference to the first element of the attribute linked list
    lastAttribute /*:NacAttribute*/;	// reference to the last element of the attribute linked list
    firstChild /*:NacNode*/;			// first child node of the child node linked list (if any)
    _closeToLastChild /*:NacNode*/;     // node from which we should start looking for the last child
    id;                                 // node id or undefined if not found
    index;                              // node index - used in to identify the node type in the virtual dom - optional
    data;                               // meta data associated to this node - optional

    /**
     * NacNode constructor
     * @param nodeType the node type - cf. NacNodeType
     * @param nodeValue the value of the text / comment or js instruction (ignored for element nodes)
     */
    constructor(nodeType, nodeValue = null, parent = null) {
        this.nodeType = nodeType;
        this.nodeName = "";
        this.firstSibling = this;
        this.nodeValue = nodeValue;
        this.data = null;
        this.parentNode = parent;
    };

    /**
     * Create a sibling node after the current node
     * @param nodeName the node name for element nodes or "#text", "#comment" or "#js" for other node types
     * @param nodeValue the value of the text / comment or js insruction (ignored for element nodes)
     * @param value2 an optional value to describe the end block expression for js blocks
     */
    n(nodeName, nodeValue = null, value2 = null)/*:NacNode*/ {
        return this.addSibling(n(nodeName, nodeValue, value2));
    };

    /**
     * Add a node as next sibling
     * @param nd the node
     * @returns {NacNode} the node passed as argument
     */
    addSibling(nd) {
        nd.firstSibling = this.firstSibling;
        nd.nextSibling = this.nextSibling;
        nd.parentNode = this.parentNode;
        return this.nextSibling = nd;
    }

    /**
     * Add attributes to the current node
     */
    a(attributeMap)/*:NacNode*/ {
        for (var k in attributeMap) {
            if (!attributeMap.hasOwnProperty(k)) continue;
            this.addAttribute(k, attributeMap[k]);
        }
        return this;
    };

    /**
     * Add a single attribute to the attribute list
     * @param name
     * @param value
     * @param nature
     * @param typeRef
     */
    addAttribute(name, value, nature, typeRef = null) {
        if (!this.lastAttribute) {
            this.firstAttribute = this.lastAttribute = new NacAttribute(name, value, nature);
        } else {
            this.lastAttribute = this.lastAttribute.addSibling(name, value, nature);
        }
        if (typeRef) {
            this.lastAttribute.typeRef = typeRef;
        }
        if (name === "id") {
            this.id = value;
        }
        return this;
    }

    /**
     * Append a node list to the current node's childNodes linked list
     * @params list of NacNode elements passed as argument list
     */
    c(/*...nodeList: NacNode[]*/)/*: NacNode*/ {
        if (this.nodeType !== NacNodeType.ELEMENT && this.nodeType !== NacNodeType.JS_BLOCK) {
            return NacNode.logger.error("Child nodes are not authorized in nodes of type " + this.nodeType);
        }
        var nodeList = arguments;
        for (var i = 0; nodeList.length > i; i++) {
            var ndl = nodeList[i];
            if (!ndl) {
                continue;
            }
            if (!this.firstChild) {
                this.firstChild = ndl.firstSibling;
                this._closeToLastChild = ndl;
            } else {
                // find last child
                var nd = this._closeToLastChild;
                while (nd.nextSibling) {
                    nd = nd.nextSibling;
                }
                nd.nextSibling = ndl.firstSibling;
                var first = this.firstChild;
                do {
                    nd.firstSibling = first;
                    this._closeToLastChild = nd;
                    nd = nd.nextSibling;
                } while (nd)
            }
        }
        var nd = this.firstChild;
        while (nd) {
            nd.parentNode = this;
            nd = nd.nextSibling;
        }
        return this;
    };

    /**
     * Return the first element of the attribute linked list
     */
    attributes()/*:NacAttribute*/ {
        var last = this.lastAttribute;
        return (last) ? (last.firstSibling || null) : null;
    };

    /**
     * Return the first element of the child node linked list
     */
    childNodes()/*: NacNode*/ {
        return this.firstChild || null;
    };
}

NacNode.defaultLogger = console;
NacNode.logger = NacNode.defaultLogger;

class NacAttribute {
    firstSibling/*:NacAttribute*/;
    nextSibling/*:NacAttribute*/;
    name/*:string*/;
    value/*:any*/;
    nature/*:NacAttributeNature*/;
    typeRef/*:string*/;

    constructor(name, value, nature) {
        this.name = name;
        this.value = value;
        this.nature = nature || NacAttributeNature.STANDARD;
        this.firstSibling = this;
        this.typeRef = null;
    };

    addSibling(name, value, nature) {
        var na = new NacAttribute(name, value, nature);
        na.firstSibling = this.firstSibling;
        return this.nextSibling = na;
    };
}