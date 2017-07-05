
import { NacNodeType } from '../compiler/nac';
import {
    VdRenderer, VdRuntime, VdNode, VdNodeKind, VdGroupNode, VdElementNode, VdTextNode,
    VdChangeInstruction, VdChangeKind, VdCreateGroup, VdUpdateProp, VdDeleteGroup, VdUpdateText
} from '../vdom';
import { ivRuntime } from '../iv';

const CR = "\n";

export const assert = {
    equal(actual: any, expected: any, message?: string): void {
        if (actual !== expected) {
            let line = 1, col = 1, char: string = "";

            if (typeof actual === "string" && typeof expected === "string") {
                let keepGoing = true, idx = 0, ln1 = actual.length, ln2 = expected.length;
                while (keepGoing) {
                    if (idx < ln1 && idx < ln2) {
                        char = actual.charAt(idx);
                        if (char !== expected.charAt(idx)) {
                            keepGoing = false;
                            if (char === CR) {
                                char = "\\n";
                            }
                            break;
                        } else if (char === CR) {
                            line++;
                            col = 0;
                        }
                        idx++;
                        col++;
                    } else {
                        keepGoing = false;
                        char = "EOF";
                    }
                }
            }

            let m = message || "no description";

            console.log(`Assertion failed [${message}]: different character [${char}] at line ${line} / col ${col}:`);
            console.log("Actual:");
            console.log(actual);
            console.log("Expected:");
            console.log(expected);

            message = message ? ": " + message : "";
            throw new Error(`Assertion failed ${message}`);
        }
    }
}

export function expect(actual: any): ExpectContext {
    return new ExpectContext(actual);
}

export class ExpectContext {
    constructor(public actual) { }

    toEqual(expected: any) {
        if (this.actual !== expected) {
            throw new Error(`Assertion failed: ${this.actual} !== ${expected}`);
        }
    }

    toBe(expected: any) {
        this.toEqual(expected);
    }
}

/**
 * Recursively compare 2 NAC trees
 * @param nac1 the first nac tree
 * @param nac2 the second nac tree
 * @returns {string} null if ok, or a string describing the error
 */
export function compare(actual, expected) {
    if (!actual || !expected) {
        return "Compare arguments cannot be null";
    }
    let n1 = actual.firstSibling, n2 = expected.firstSibling;
    try {
        while (n1 || n2) {
            compareNodes(n1, n2);
            n1 = n1.nextSibling;
            n2 = n2.nextSibling;
            if ((n1 && !n2) || (!n1 && n2)) {
                //noinspection ExceptionCaughtLocallyJS
                throw "Different number of root nodes";
            }
        }
    } catch (ex) {
        return ex;
    }

    return '';
}

function compareNodes(n1, n2) {
    if (!n1 && !n2) {
        return;
    }
    if (!n1 && n2) {
        //debugger
        throw "Node1 not found: " + n2.nodeName;
    }
    if (n1 && !n2) {
        throw "Node2 not found: " + n1.nodeName;
    }
    if (n1.nodeType !== n2.nodeType) {
        throw "Different node types found: " + n1.nodeType + " vs. " + n2.nodeType + " for " + n1.nodeName + " node";
    }
    if (n1.nodeValue !== n2.nodeValue) {
        if (n1.nodeValue && n1.nodeValue.startBlockExpression) {
            let a = n1.nodeValue.startBlockExpression, b = n2.nodeValue.startBlockExpression;
            if (a !== b) {
                throw "Different JS start block expression found: \n" + a + "\n" + b;
            }
            a = n1.nodeValue.endBlockExpression;
            b = n2.nodeValue.endBlockExpression;
            if (a !== b) {
                throw "Different JS end block expression found: '" + a + "' vs '" + b + "'";
            }
        } else {
            if (n1.nodeValue !== n2.nodeValue) {
                throw `Different node values found:\n ${n1.nodeValue} vs. ${n2.nodeValue}`;
            }
        }
    }
    if (n1.nodeType === NacNodeType.ELEMENT && n1.nodeName !== n2.nodeName) {
        //debugger
        throw "Different node names found: " + n1.nodeName + " vs. " + n2.nodeName;
    }
    if (n1.firstChild || n2.firstChild) {
        // compare children
        let nd1 = n1.firstChild, nd2 = n2.firstChild;
        while (nd1 || nd2) {
            compareNodes(nd1, nd2);
            nd1 = nd1.nextSibling;
            nd2 = nd2.nextSibling;
            if ((nd1 && !nd2) || (!nd1 && nd2)) {
                //debugger
                throw "Different number of child nodes in " + n1.nodeName;
            }
        }
    }
    // compare attributes
    let att1 = n1.firstAttribute, att2 = n2.firstAttribute;
    while (att1 || att2) {
        if (!att1) {
            throw "Missing attribute in first node: " + att2.name;
        }
        if (!att2) {
            throw "Missing attribute in second node: " + att1.name;
        }
        checkProperty("name", att1, att2);
        checkProperty("value", att1, att2);
        checkProperty("nature", att1, att2);
        checkProperty("typeRef", att1, att2);
        checkArrayProperty("typeParameters", att1, att2);
        checkArrayProperty("parameters", att1, att2);

        att1 = att1.nextSibling;
        att2 = att2.nextSibling;
    }
}

function checkProperty(name, att1, att2) {
    if (att1[name] !== att2[name]) {
        throw "Different attribute " + name + ": " + att1[name] + " vs " + att2[name];
    }
}

function checkArrayProperty(name, att1, att2) {
    if (att1[name] || att2[name]) {
        let p1 = att1[name] ? att1[name].join(",") : "",
            p2 = att2[name] ? att2[name].join(",") : "";
        if (p1 !== p2) {
            throw "Different attribute " + name + " found: [" + p1 + "] vs [" + p2 + "]";
        }
    }
}

interface TestRenderer extends VdRenderer {
    root?: VdGroupNode;
    func: (r: VdRenderer, ...any) => void;
    vdom: () => string;
    changes: () => string;
    refresh: (data?: {}) => void;
}

export function createTestRenderer(func: (r: VdRenderer, ...any) => void, options?: { baseIndent: string }): TestRenderer {
    // override ivRuntime to always start ref at 0
    ivRuntime.refCount = 0;

    let rootGroup: VdGroupNode = {
        kind: VdNodeKind.Group,
        index: 0,
        ref: -1,
        cm: 1,
        changes: null,
        children: [],
        domNode: null,
        parent: null
    }

    let r: TestRenderer = {
        func: func,
        rt: ivRuntime,
        parent: rootGroup,
        root: undefined,
        vdom: () => serializeGroup(rootGroup, options ? options.baseIndent : "    "),
        changes: () => serializeChanges(rootGroup, options ? options.baseIndent : "    "),
        refresh: function ($d) {
            if (!this.root) {
                this.root = rootGroup;
            } else {
                this.root.changes = null;
            }
            this.parent = this.root;
            this.func(this, $d);
        }
    }

    let cg: VdCreateGroup = {
        kind: VdChangeKind.CreateGroup,
        node: rootGroup,
        parent: null,
        position: -1,
        nextSibling: null
    }
    rootGroup.changes = [cg];

    return r;
}

function serializeGroup(nd: VdGroupNode, indent: string) {
    let lines = [];
    serializeNode(nd, lines, indent + "    ");
    return CR + lines.join("\n") + CR + indent;
}

function serializeNode(nd: VdNode, lines: string[], indent: string) {
    let children: VdNode[] | null = null, endLine = "";
    switch (nd.kind) {
        case VdNodeKind.Group:
            let g = <VdGroupNode>nd;
            children = g.children;
            lines.push(`${indent}<#group ${stringifyIdxAndRef(g)}${stringifyProps(g.props)}${children && children.length ? "" : "/"}>`);
            endLine = `${indent}</#group>`;
            break;
        case VdNodeKind.Element:
            let e = <VdElementNode>nd;
            children = e.children;
            lines.push(`${indent}<${e.name} ${stringifyIdxAndRef(e)}${stringifyProps(e.props)}${children && children.length ? "" : "/"}>`);
            endLine = `${indent}</${e.name}>`;
            break;
        case VdNodeKind.Text:
            let t = <VdTextNode>nd;
            lines.push(`${indent}<#text ${stringifyIdxAndRef(t)} "${t.value}">`);
            break;
    }
    if (children && children.length) {
        for (let ch of children) {
            serializeNode(ch, lines, indent + "    ");
        }
        lines.push(endLine);
    }
}

function stringifyProps(props, namePrefix = "") {
    let propList: string[][] = [], buffer: string[] = [], val;
    // sort the attributes by name to avoid x-browser discrepancies
    for (let k in props) {
        if (props.hasOwnProperty(k)) {
            propList.push([namePrefix + k, stringifyValue(props[k])]);
        }
    }
    if (propList.length > 0) {
        propList.sort();
        for (let i = 0; propList.length > i; i++) {
            buffer.push([" ", propList[i][0], "=", propList[i][1]].join(""));
        }
    }
    return buffer.join("");
}

function stringifyValue(val: any): string {
    let v: string;
    if (val === undefined) {
        v = "undefined";
    } if (val === null) {
        v = "null";
    } else if (typeof val === "string") {
        v = '"' + val + '"';
    } else if (val.kind) {
        v = "IvNode";
    } else if (typeof val === "object") {
        v = "Object";
    } else {
        v = "" + val;
    }
    return v;
}

function stringifyIdxAndRef(nd: VdNode) {
    let res = '' + nd.index;
    if (nd.ref) {
        res += ' ref="' + nd.ref + '"'
    }
    return res;
}

function serializeChanges(nd: VdGroupNode, indent: string) {
    let lines: string[] = [];
    if (!nd.changes || nd.changes.length === 0) {
        return CR + indent;;
    } else {
        for (let chge of nd.changes) {
            switch (chge.kind) {
                case VdChangeKind.CreateGroup:
                    let cg = chge as VdCreateGroup,
                        parent = cg.parent ? " in #" + cg.parent.ref : "",
                        position = cg.position > -1 ? " at position " + cg.position : "";
                    lines.push(`${indent}    CreateGroup #${cg.node.ref}${parent}${position}`);
                    break;
                case VdChangeKind.DeleteGroup:
                    let dg = chge as VdDeleteGroup,
                        parent2 = dg.parent ? " in #" + dg.parent.ref : "",
                        position2 = dg.position > -1 ? " at position " + dg.position : "";
                    lines.push(`${indent}    DeleteGroup #${dg.node.ref}${parent2}${position2}`);
                    break;
                case VdChangeKind.UpdateProp:
                    let up = chge as VdUpdateProp, buf: string[] = [];
                    lines.push(`${indent}    UpdateProp "${up.name}"=${stringifyValue(up.value)} in #${up.node.ref}`);
                    break;
                case VdChangeKind.UpdateText:
                    let ut = chge as VdUpdateText;
                    lines.push(`${indent}    UpdateText "${ut.value}" in #${ut.node.ref}`);
                    break;
            }
        }
        return CR + lines.join("\n") + CR + indent;
    }
}

export const doc = {
    createDocFragment: function () {
        return new DocFragment();
    },
    createTextNode: function (data: string) {
        return new TextNode(data);
    },
    createElement: function (name: string) {
        return new ElementNode(name);
    }
}

class TextNode {
    constructor(public textContent: string) { }

    stringify(indent = ""): string {
        return `${indent}<#text>${this.textContent}</#text>`;
    }
}

class ElementNode {
    childNodes: any[] = [];

    constructor(public nodeName: string) { }

    setAttribute(key: string, value: string) {
        this[key] = value;
    }

    appendChild(node) {
        if (node.nodeName && node.nodeName === "#doc-fragment") {
            this.childNodes = this.childNodes.concat(node.childNodes);
            node.childNodes = [];
        } else {
            this.childNodes.push(node);
        }
    }

    removeChild(node) {
        // brute force... but simple and safe
        let ch2: any[] = [];
        for (let nd of this.childNodes) {
            if (nd !== node) {
                ch2.push(nd);
            }
        }
        this.childNodes = ch2;
    }

    insertBefore(node, nodeRef) {
        // find nodeRef index
        let idx = -1;
        for (let i = 0; this.childNodes.length > i; i++) {
            if (nodeRef === this.childNodes[i]) {
                idx = i;
                break;
            }
        }
        if (idx < 0 || !node) {
            return;
        }
        if (node.nodeName && node.nodeName === "#doc-fragment") {
            let nch = node.childNodes;
            for (let i = nch.length - 1; i > -1; i--) {
                this.childNodes.splice(idx, 0, nch[i]);
            }
            node.childNodes = [];
        } else {
            this.childNodes.splice(idx, 0, node);
        }
    }

    stringify(indent = "", isRoot = false): string {
        let lines: string[] = [], indent2 = isRoot ? indent + "    " : indent, atts: string[] = [], att = "";

        for (let k in this) {
            if (this.hasOwnProperty(k) && k !== "nodeName" && k !== "childNodes") {
                if (k === "className") {
                    if (this["className"]) {
                        atts.push(`class="${this[k]}"`);
                    }
                } else {
                    atts.push(`${k}="${this[k]}"`);
                }
            }
        }
        if (atts.length) {
            att = " " + atts.join(" ");
        }

        if (this.childNodes.length) {
            lines.push(`${indent2}<${this.nodeName}${att}>`);
            for (let ch of this.childNodes) {
                lines.push(ch.stringify(indent2 + "    "));
            }
            lines.push(`${indent2}</${this.nodeName}>`);
        } else {
            lines.push(`${indent2}<${this.nodeName}${att}/>`);
        }

        if (isRoot) {
            return CR + lines.join(CR) + CR + indent;
        } else {
            return lines.join(CR);
        }
    }
}

class DocFragment extends ElementNode {
    constructor() {
        super("#doc-fragment");
    }
}
