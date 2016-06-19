/**
 * Created by blaporte on 18/06/16.
 */

/**
 * IV Virtual Node - abstract base class
 * Sub-classed by Text, Element or Group node classes
 */
class IvNode {
    index;          // integer identifying the node type in the node template
    ref;            // non-static nodes have a unique ref to be easily updated

    constructor(index) {
        this.index = index;
        this.ref = null;
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
    isText;         // true - to easily identify text nodes
    value;          // string - text value

    constructor(index, textValue) {
        super(index);
        this.isText = true;
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
    isGroup;        // true - to easily identify group nodes
    parent;         // parent node
    groupType;      // string identifying the type of group - e.g. "template", "insert" or "js"
    children;       // array of child nodes
    childCursor;    // number - used by the refresh algorithm to detect where sub-group should be created

    constructor(index, parent, groupType) {
        super(index);
        this.isGroup = true;
        this.parent = parent;
        this.groupType = groupType;
        this.children = [];
        this.childCursor = 0;
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param indent {String} the indentation to use, empty by default
     */
    stringify(buffer, indent) {
        var hasChildren = this.children.length > 0,
            endSign = hasChildren ? ">" : "/>";

        buffer.push([
                indent, "<#group ", this.index, " ", this.groupType, endSign
            ].join("")
        );

        if (hasChildren) {
            stringifyChildNodes(buffer, indent, this.children);
            buffer.push([indent, "</#group>"].join(""));
        }
    }
}

export class IvEltNode extends IvNode {
    isElement;      // true - to easily identify element nodes
    name;           // element tag name - e.g. div
    attributes;     // key/value map of attributeName/value
    children;       // array of child nodes
    childCursor;    // number - used by the refresh algorithm to detect where sub-group should be created

    constructor(index, name) {
        super(index);
        this.name = name;
        this.isElement = true;
        this.attributes = {};
        this.children = [];
        this.childCursor = 0;
    }

    /**
     * Serialize the node into line-based strings pushed in the buffer passed as argument
     * @param buffer {Array} array where the string will be pushed
     * @param indent {String} the indentation to use, empty by default
     */
    stringify(buffer, indent) {
        var hasChildren = this.children.length > 0,
            endSign = hasChildren ? ">" : "/>", atts = this.attributes, batts = [], tmp;

        for (var k in atts) {
            if (atts.hasOwnProperty(k)) {
                tmp = (typeof atts[k] === "string")? '"'+atts[k]+'"' : atts[k];
                batts.push([" ", k, "=", tmp].join(""));
            }
        }

        buffer.push([
                indent, "<", this.name, " ", this.index, batts.join(""), endSign
            ].join("")
        );

        if (hasChildren) {
            stringifyChildNodes(buffer, indent, this.children);
            buffer.push([indent, "</", this.name, ">"].join(""));
        }
    }
}

function stringifyChildNodes(buffer, indent, children) {
    var indent2 = indent + "    ";
    for (var i = 0; children.length > i; i++) {
        children[i].stringify(buffer, indent2);
    }
}
