/**
 * Nac Node library
 * (aka. Node / Attributes / Content)
 */

/**
 * Create a NacNode instance
 * @param nodeName the node name for element nodes or "#text", "#comment" or "#js" for other node types
 * @param nodeValue the value of the text / comment or js insruction (ignored for element nodes)
 * @param value2 an optional value to describe the end block expression for js blocks
 */
export function n(nodeName, nodeValue = null, value2 = null)/*:NacNode*/ {
    let nd = new NacNode(NacNodeType.ELEMENT, nodeValue);

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
        } else if (nodeName === "#commentML") {
            nd.nodeType = NacNodeType.COMMENT_ML;
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
    FUNCTION: 2,        // function node e.g. <function #foo/>
    TEXT: 3,
    COMMENT: 8,
    COMMENT_ML: 9,      // multi-line comment
    INSERT: 12,         // e.g. {{foo.bar}}
    JS_EXPRESSION: 13,  // e.g. % let foo = 3;
    JS_BLOCK: 14,       // e.g. % let foo = 3;
    COMPONENT: 15,
    ATT_NODE: 16,       // attribute node e.g. <div @foo/>


    /**
     * Returns a friendly name for each type - useful for debug info
     * @param type {number}
     */
    getName(type) {
        switch (type) {
            case this.ELEMENT:
                return "#elt";
            case this.COMPONENT:
                return "#component";
            case this.COMMENT:
                return "#comment";
            case this.COMMENT_ML:
                return "#commentML";
            case this.INSERT:
                return "#insert";
            case this.JS_BLOCK:
                return "#jsblock";
            case this.JS_EXPRESSION:
                return "#js";
            case this.TEXT:
                return "#text";
            case this.ATT_NODE:
                return "@node";
            case this.FUNCTION:
                return "#function";
        }
        return "#invalidtype";
    }
};


export const NacAttributeNature = { // warning: keep incremental values as used to index an array in nac2js
    STANDARD: 0,            // e.g. foo="bar"
    BOUND1WAY: 1,           // e.g. [foo]=c.bar+3
    BOUND2WAYS: 2,          // e.g. [[foo]]=c.bar
    DEFERRED_EXPRESSION: 3  // e.g. (onclick)=c.doSomething()
};

export class NacNode {
    static defaultLogger;               // default logger if logger is not set (console by default - cf. below)
    static logger /*:{error:(m:string)=>void} */; // specific logger for this node
    nodeType /*:NacNodeType*/;
    nodeValue /*:string*/;
    nodeName;                           // node name for element nodes or optionally "#text", "#comment" or "#js" for other node types when created through n()
    nodeNameSpace;                      // namespace - or undefined
    nextSibling /*:NacNode*/;           // next sibling in the current linked list
    firstSibling /*:NacNode*/;		    // first sibling of the current node linked list
    firstAttribute /*:NacAttribute*/;	// reference to the first element of the attribute linked list
    lastAttribute /*:NacAttribute*/;	// reference to the last element of the attribute linked list
    firstChild /*:NacNode*/;			// first child node of the child node linked list (if any)
    _closeToLastChild /*:NacNode*/;     // node from which we should start looking for the last child
    id;                                 // node id or undefined if not found - id should not be changed once set
    attName;                            // node @name or undefined if not found - @name should not be changed once set
    lineNbr;                            // line number for error messages

    /**
     * NacNode constructor
     * @param nodeType the node type - cf. NacNodeType
     * @param nodeValue the value of the text / comment or js instruction (ignored for element nodes)
     */
    constructor(nodeType, nodeValue = null) {
        this.nodeType = nodeType;
        this.nodeName = "";
        this.nodeNameSpace = undefined;
        this.nodeValue = nodeValue;
        this.firstSibling = this;
        this.lineNbr = -1;
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
        return this.nextSibling = nd;
    }

    /**
     * Add attributes to the current node
     */
    a(attributeMap)/*:NacNode*/ {
        for (let k in attributeMap) {
            if (!attributeMap.hasOwnProperty(k)) continue;
            this.addAttribute(k, attributeMap[k]);
        }
        return this;
    };

    /**
     * Add a single attribute to the attribute list
     * @param name the attribute name
     * @param value the attribute value
     * @param nature the attribute nature (cf. NacAttributeNature)
     * @param typeRef the type associated to this attribute (e.g. "string" in foo:string)
     * @param params array of parameter names associated to this attribute (for function attributes)
     * @param typeParams array of parameters associated to the attribute type
     */
    addAttribute(name, value, nature, typeRef = null, params = null, typeParams = null) {
        if (!this.lastAttribute) {
            this.firstAttribute = this.lastAttribute = new NacAttribute(name, value, nature);
        } else {
            this.lastAttribute = this.lastAttribute.addSibling(name, value, nature);
        }
        if (typeRef) {
            this.lastAttribute.typeRef = typeRef;
        }
        if (params) {
            this.lastAttribute.parameters = params;
        }
        if (typeParams) {
            this.lastAttribute.typeParameters = typeParams;
        }
        // id and attName shortcuts used to simplify and accelerate the template compilation
        if (name === "id") {
            this.id = value; // nb: in theory this could be de-synchronized with the actual attribute but this case should not happen
        } else if (name === "@name") {
            this.attName = value; // nb: in theory this could be de-synchronized with the actual attribute but this case should not happen
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
        let nodeList = arguments;
        for (let i = 0; nodeList.length > i; i++) {
            let ndl = nodeList[i];
            if (!ndl) {
                continue;
            }
            if (!this.firstChild) {
                this.firstChild = ndl.firstSibling;
                this._closeToLastChild = ndl;
            } else {
                // find last child
                let nd = this._closeToLastChild;
                while (nd.nextSibling) {
                    nd = nd.nextSibling;
                }
                nd.nextSibling = ndl.firstSibling;
                let first = this.firstChild;
                do {
                    nd.firstSibling = first;
                    this._closeToLastChild = nd;
                    nd = nd.nextSibling;
                } while (nd)
            }
        }
        return this;
    };

    /**
     * Return the first element of the attribute linked list
     */
    attributes()/*:NacAttribute*/ {
        let last = this.lastAttribute;
        return (last) ? (last.firstSibling || null) : null;
    }

    /**
     * Return the first element of the child node linked list
     */
    childNodes()/*: NacNode*/ {
        return this.firstChild || null;
    }

    /**
     * Serialize the node in a pseudo-xml structure to ease debugging
     * @param indent
     */
    toString(indent = "    ") {
        let result = [];
        let hasChildren = (this.firstChild !== undefined),
            nm = this.nodeName || NacNodeType.getName(this.nodeType);

        let endSign = hasChildren ? ">" : "/>", nvalue = "", natts = "";

        if (this.nodeValue) {
            if (this.nodeName === "#group") {
                nvalue = " " + this.nodeValue;
            } else {
                if (typeof this.nodeValue === "string") {
                    nvalue = " \"" + this.nodeValue + "\"";
                } else {
                    nvalue = " " + this.nodeValue;
                }
            }
        }
        if (this.firstAttribute) {
            let att = this.firstAttribute, buffer = [];
            while (att) {
                buffer.push(" " + att.name);
                if (att.value) {
                    if (typeof att.value === "string") {
                        buffer.push("=\"" + att.value + "\"");
                    } else {
                        buffer.push("=" + att.value);
                    }
                }
                att = att.nextSibling;
            }
            natts = buffer.join("");
        }

        result.push([indent, "<", nm, nvalue, natts, endSign].join(""));
        if (hasChildren) {
            let ch = this.firstChild;
            while (ch) {
                result.push(ch.toString(indent + "    "));
                ch = ch.nextSibling;
            }
            result.push([indent, "</", nm, ">"].join(""));
        }

        return result.join("\n");
    }
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
    typeParameters/*string[]*/;
    parameters; // array of parameter names - for function attributes

    constructor(name, value, nature) {
        this.name = name;
        this.value = value;
        this.nature = nature || NacAttributeNature.STANDARD;
        this.firstSibling = this;
        this.typeRef = null;
        this.typeParameters = null;
        this.parameters = null;
    };

    addSibling(name, value, nature) {
        let na = new NacAttribute(name, value, nature);
        na.firstSibling = this.firstSibling;
        return this.nextSibling = na;
    };
}