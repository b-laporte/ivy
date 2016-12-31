/**
 * Created by blaporte on 18/06/16.
 */

/**
 * IV Virtual Node - abstract base class
 * Sub-classed by Text, Element or Group node classes
 */
export class IvNode {
    isNode;             // true - indicates that this object is an IvNode
    index;              // integer identifying the node type in the node template
    ref;                // non-static nodes have a unique ref to be easily updated by their renderer
    nextSibling;        // next IvNode in a node list
    firstChange;        // first change of the change linked list - used during refresh process
    lastChange;         // last change of the change linked list
    propagateChanges;   // boolean telling if changes should be automatically propagated to parent node

    constructor(index) {
        this.isNode = true;
        this.index = index;
        this.nextSibling = this.ref = this.firstChange = this.lastChange = null;
        this.propagateChanges = true;
    }

    /**
     * Serialize the node in a pseudo-xml structure to ease debugging
     * @param options
     */
    toString(options = {indent: "", showRef: false}) {
        let result = [];
        this.stringify(result, options);
        return result.join("\n");
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param options {Object} optional, default: {indent: "", showRef: false}
     */
    stringify(buffer, options = {indent: "", showRef: false}) {
        /* Must be overridden by child classes */
    }
}

/**
 * Special class to differentiate nodes attributes that are used to reference the node content
 */
export class IvContent extends IvNode {

}

export class IvFunctionNode extends IvNode {
    static templateCount = 0;
    static createViewFn = null; // function used to create views -  injected by iv
    isFunctionNode;             // true - to easily identify text nodes
    templateData;
    uid;                        // unique identifier
    contentName;

    constructor(index, func, statics) {
        super(index);
        this.isFunctionNode = true;
        this.templateData = {
            templateFn: func,
            templateArgIdx: statics[0][4],
            templateStatics: statics,
            templateArgTypes: statics[0][5],
            //templateId: "foo",
            instanceCount: 0
        };
        this.uid = "T" + (IvFunctionNode.templateCount++);
        this.contentName = statics[0][6];
    }

    createView(argMap, context) {
        return IvFunctionNode.createViewFn(this, argMap, context);
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param options {Object} optional, default: {indent: "", showRef: false}
     */
    stringify(buffer, options = {indent: "", showRef: false}) {
        buffer.push([
                options.indent, "<#function ", this.index, "/>"
            ].join("")
        )
    }
}

export class IvTextNode extends IvNode {
    isTextNode;     // true - to easily identify text nodes
    value;          // string - text value

    constructor(index, textValue) {
        super(index);
        this.isTextNode = true;
        this.value = textValue;
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param options {Object} optional, default: {indent: "", showRef: false}
     */
    stringify(buffer, options = {indent: "", showRef: false}) {
        let v = this.value, nv;
        options = checkOptions(options);

        if (typeof v === "string") {
            nv = " \"" + v + "\"";
        } else {
            nv = " " + v;
        }

        buffer.push([
                options.indent, "<#text ", this.index, refAtt(this, options), nv, "/>"
            ].join("")
        )
    }
}

export class IvGroupNode extends IvNode {
    isGroupNode;        // true - to easily identify group nodes
    groupType;          // string identifying the type of group - e.g. "template", "insert" or "js"
    firstChild;         // first child node (linked list)
    data;               // meta-data associated to this node

    constructor(index, groupType) {
        super(index);
        this.isGroupNode = true;
        this.groupType = groupType;
        this.firstChild = null;
        this.data = {};
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param options {Object} optional, default: {indent: "", showRef: false}
     */
    stringify(buffer, options = {indent: "", showRef: false}) {
        let hasChildren = this.firstChild !== null,
            dataAtts = "",
            endSign = hasChildren ? ">" : "/>";
        options = checkOptions(options);

        if (this.data && this.data.attributes) {
            dataAtts = stringifyAttributes(this.data.attributes, "data-");
        }

        buffer.push([
                options.indent, "<#group ", this.index, " ", this.groupType, refAtt(this, options), dataAtts, endSign
            ].join("")
        );

        if (hasChildren) {
            stringifyChildNodes(buffer, options, this.firstChild);
            buffer.push([options.indent, "</#group>"].join(""));
        }
    }
}

/**
 * Attribute node - e.g. <:header important=true>Some Message</:header>
 */
export class IvDataNode extends IvNode {
    isDataNode;        // true - to easily identify data nodes
    firstChild;       // first child node (linked list)
    data;             // meta-data associated to this node

    constructor(index) {
        super(index);
        this.isDataNode = true;
        this.firstChild = null;
        this.data = {};
        this.propagateChanges = true;
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param options {Object} optional, default: {indent: "", showRef: false}
     */
    stringify(buffer, options = {indent: "", showRef: false}) {
        let hasChildren = this.firstChild !== null,
            endSign = hasChildren ? ">" : "/>";
        options = checkOptions(options);

        // if (this.data && this.data.attributes) {
        //     dataAtts = stringifyAttributes(this.data.attributes, "data-");
        // }

        buffer.push([
                options.indent, "<#data ", this.index, " ", endSign
            ].join("")
        );

        if (hasChildren) {
            stringifyChildNodes(buffer, options, this.firstChild);
            buffer.push([options.indent, "</#data>"].join(""));
        }
    }
}

export class IvEltNode extends IvNode {
    isElementNode;  // true - to easily identify element nodes
    name;           // element tag name - e.g. div
    attributes;     // key/value map of attributeName/value
    dynAttributes;  // array of the dynamic attribute names (null by default)
    firstChild;     // first child node (linked list)

    constructor(index, name) {
        super(index);
        this.name = name;
        this.isElementNode = true;
        this.attributes = {};
        this.firstChild = null;
        this.dynAttributes = null;
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param options {Object} optional, default: {indent: "", showRef: false}
     */
    stringify(buffer, options = {indent: "", showRef: false}) {
        let hasChildren = this.firstChild !== null,
            endSign = hasChildren ? ">" : "/>";
        options = checkOptions(options);

        let atts = stringifyAttributes(this.attributes);

        buffer.push([
                options.indent, "<", this.name, " ", this.index, refAtt(this, options), atts, endSign
            ].join("")
        );

        if (hasChildren) {
            stringifyChildNodes(buffer, options, this.firstChild);
            buffer.push([options.indent, "</", this.name, ">"].join(""));
        }
    }
}

function checkOptions(options) {
    if (!options.indent) {
        options.indent = "";
    }
    if (options.showRef === undefined) {
        options.showRef = false;
    }
    return options;
}

/**
 * Return the ref attribute string to be serialized according to the options
 * @param obj {IvNode}
 * @param options
 */
function refAtt(obj, options) {
    if (options.showRef && obj.ref) {
        return ' ref="' + obj.ref + '"';
    }
    return "";
}

function stringifyChildNodes(buffer, options, firstChild) {
    let options2 = {
        indent: options.indent + "    ",
        showRef: options.showRef
    }, ch = firstChild;

    while (ch) {
        ch.stringify(buffer, options2);
        ch = ch.nextSibling;
    }
}

function stringifyAttributes(atts, namePrefix = "") {
    let attList = [], buffer = [], val;
    // sort the attributes by name to avoid x-browser discrepancies
    for (let k in atts) {
        if (atts.hasOwnProperty(k)) {
            val = atts[k];
            if (typeof atts[k] === "string") {
                val = '"' + atts[k] + '"';
            } else if (val.isNode) {
                val = "IvNode";
            } else if (typeof val === "object") {
                val = "Object";
            }
            attList.push([namePrefix + k, val]);
        }
    }
    if (attList.length > 0) {
        attList.sort();
        for (let i = 0; attList.length > i; i++) {
            buffer.push([" ", attList[i][0], "=", attList[i][1]].join(""));
        }
    }
    return buffer.join("");
}

