/**
 * Created by blaporte on 18/06/16.
 */

/**
 * IV Virtual Node - abstract base class
 * Sub-classed by Text, Element or Group node classes
 */
class IvNode {
    isNode;         // true - indicates that this object is an IvNode
    index;          // integer identifying the node type in the node template
    ref;            // non-static nodes have a unique ref to be easily updated
    nextSibling;    // next IvNode in a node list

    constructor(index) {
        this.isNode = true;
        this.index = index;
        this.ref = null;
        this.nextSibling = null;
    }

    /**
     * Serialize the node in a pseudo-xml structure to ease debugging
     * @param indent
     */
    toString(indent = "") {
        var result = [];
        this.stringify(result, indent);
        return result.join("\n");
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param indent {String} the indentation to use, empty by default
     */
    stringify(buffer, indent = "") {
        /* Must be overridden by child classes */
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
     * @param indent {String} the indentation to use, empty by default
     */
    stringify(buffer, indent = "") {
        var v = this.value, nv;

        if (typeof v === "string") {
            nv = " \"" + v + "\"";
        } else {
            nv = " " + v;
        }

        buffer.push([
                indent, "<#text ", this.index, nv, "/>"
            ].join("")
        )
    }
}

export class IvGroupNode extends IvNode {
    isGroupNode;    // true - to easily identify group nodes
    parent;         // parent node
    groupType;      // string identifying the type of group - e.g. "template", "insert" or "js"
    firstChild;     // first child node (linked list)
    data;           // meta-data associated to this node

    constructor(index, parent, groupType) {
        super(index);
        this.isGroupNode = true;
        this.parent = parent;
        this.groupType = groupType;
        this.firstChild = null;
        this.data = {};
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param indent {String} the indentation to use, empty by default
     */
    stringify(buffer, indent) {
        var hasChildren = this.firstChild !== null,
            dataAtts = "",
            endSign = hasChildren ? ">" : "/>";

        if (this.data && this.data.attributes) {
            dataAtts = stringifyAttributes(this.data.attributes, "data-");
        }

        buffer.push([
                indent, "<#group ", this.index, " ", this.groupType, dataAtts, endSign
            ].join("")
        );

        if (hasChildren) {
            stringifyChildNodes(buffer, indent, this.firstChild);
            buffer.push([indent, "</#group>"].join(""));
        }
    }
}

export class IvEltNode extends IvNode {
    isElementNode;  // true - to easily identify element nodes
    name;           // element tag name - e.g. div
    attributes;     // key/value map of attributeName/value
    firstChild;     // first child node (linked list)

    constructor(index, name) {
        super(index);
        this.name = name;
        this.isElementNode = true;
        this.attributes = {};
        this.firstChild = null;
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param indent {String} the indentation to use, empty by default
     */
    stringify(buffer, indent) {
        var hasChildren = this.firstChild !== null,
            endSign = hasChildren ? ">" : "/>";

        var atts = stringifyAttributes(this.attributes);

        buffer.push([
                indent, "<", this.name, " ", this.index, atts, endSign
            ].join("")
        );

        if (hasChildren) {
            stringifyChildNodes(buffer, indent, this.firstChild);
            buffer.push([indent, "</", this.name, ">"].join(""));
        }
    }
}

function stringifyChildNodes(buffer, indent, firstChild) {
    var indent2 = indent + "    ", ch = firstChild;
    while (ch) {
        ch.stringify(buffer, indent2);
        ch = ch.nextSibling;
    }
}

function stringifyAttributes(atts, namePrefix = "") {
    var attList = [], buffer = [], val;
    // sort the attributes by name to avoid x-browser discrepancies
    for (var k in atts) {
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
        attList.sort((a, b) => a[0] > b[0]);
        for (var i = 0; attList.length > i; i++) {
            buffer.push([" ", attList[i][0], "=", attList[i][1]].join(""));
        }
    }
    return buffer.join("");
}

