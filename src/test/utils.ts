import { Template } from './../iv/index';
import { CompilationResult } from '../compiler/generator';
import { compileTemplate } from '../compiler/generator';
import { IvTemplate, IvNode, BlockNodes, IvContext, IvContainer } from '../iv/types';

export let body = {
    async template(tpl: string, log = false) {
        let r = await compileTemplate(tpl, { body: true });
        if (log) {
            console.log(`body: '${r.body}'`)
        }
        return r.body;
    }
}

export let statics = {
    async template(tpl: string, log = false) {
        let r = await compileTemplate(tpl, { statics: true });
        if (log) {
            console.log(`statics: '${r.statics}'`)
        }
        return r.statics;
    }
}

export let test = {
    async template(tpl: string, importMap?: { [key: string]: 1 }): Promise<CompilationResult> {
        let r = await compileTemplate(tpl, { body: true, statics: true, function: true, imports: true, importMap: importMap });

        return r;
    }
}

export let error = {
    async template(tpl: string, log = false) {
        let err = "NO ERROR";
        try {
            await compileTemplate(tpl, { body: true });
        } catch (e) {
            err = e.message;
        }
        return err;
    }
}


// ------------------------------------------------------------------------------------------------
let o = { indent: '        ', showUid: true, isRoot: true };

export function reset() {
    resetIdCount();
    return doc.createElement("body");
}

export function getTemplate(f: () => IvTemplate, body: any) {
    let t = f();
    t.document = doc;
    t.attach(body);
    return t;
}

const SEP = "-------------------------------------------------------------------------------";

export function logNodes(t: IvTemplate, label = "") {
    let nodes: BlockNodes = t["context"]["nodes"];
    console.log("");
    console.log(SEP);
    if (!nodes || !nodes.length) {
        console.log(label + "\nEmpty template")
        return;
    }
    if (label) console.log(label)
    logBlockNodes(nodes, "");
    console.log(SEP);
}

function logBlockNodes(list: BlockNodes, indent: string) {
    let len = list.length, nd: IvNode | IvContext;
    for (let i = 0; len > i; i++) {
        nd = list[i];
        if (!nd) {
            console.log(`${indent}[${i}] XX`)
        } else if (nd.kind === "#context") {
            let dn = nd.rootDomNode ? nd.rootDomNode.$uid : "XX";
            console.log(`${indent}[${i}] ${nd.uid} ${dn} containerIdx:${nd.containerIdx}`)
        } else if (nd.kind === "#container") {
            let cont = nd as IvContainer;
            let dn = cont.domNode ? cont.domNode.$uid : "XX";
            console.log(`${indent}[${i}] ${nd.uid} ${dn} parent:${nd.parentIdx} attached:${nd.attached ? 1 : 0} childPos:${nd.childPos >= 0 ? nd.childPos : "X"} lastRefresh:${nd.lastRefresh}`)
            if (cont.cptTemplate) {
                let tpl = cont.cptTemplate as Template;
                console.log(`${indent + "  "}- light DOM children list: [${cont.children ? cont.children.join(",") : ""}]`);
                console.log(`${indent + "  "}- shadow DOM:`);
                logBlockNodes(tpl.context.nodes, "    " + indent);
            } else {
                let len2 = cont.contentBlocks.length;
                for (let j = 0; len2 > j; j++) {
                    if (!cont.contentBlocks[j]) {
                        console.log(`${indent + "  "}- block #${j} UNDEFINED`);
                        continue;
                    }
                    let childContext = cont.contentBlocks[j][0] as IvContext;
                    dn = childContext.rootDomNode ? childContext.rootDomNode.$uid : "XX";
                    console.log(`${indent + "  "}- block #${j}`);
                    if (!cont.contentBlocks[j]) {
                        console.log(`${indent + "    "}XX`);
                    } else {
                        logBlockNodes(cont.contentBlocks[j], "    " + indent);
                    }
                }
            }
        } else {
            let dn = nd.domNode ? nd.domNode.$uid : "XX";
            console.log(`${indent}[${nd.idx}] ${nd.uid} ${dn} parent:${nd.parentIdx} attached:${nd.attached ? 1 : 0} childPos:${nd.childPos >= 0 ? nd.childPos : "X"} lastRefresh:${nd.lastRefresh}`)
        }
    }
}

export function stringify(t: IvTemplate, log = false) {
    let r = t["context"].rootDomNode.stringify(o)
    if (log) {
        console.log(SEP);
        console.log(r);
        console.log(SEP);
    }
    return r;
}

// ------------------------------------------------------------------------------------------------
let UID_COUNT = 0;
const CR = "\n";

export function resetIdCount() {
    UID_COUNT = 0;
}

export const doc = {
    resetUid() {
        UID_COUNT = 0;
    },

    getLastUid() {
        return UID_COUNT;
    },

    traces: {
        wentThroughTextContentDelete: false,
        reset: function () {
            this.wentThroughTextContentDelete = false;
        }
    },

    createDocFragment() {
        return new DocFragment();
    },

    createTextNode(data: string) {
        return new TextNode(data);
    },

    createElement(name: string) {
        return new ElementNode(name);
    },

    createElementNS(ns: string, name: string): any {
        return new ElementNode(name, ns);
    },

    createComment(data: string) {
        return new CommentNode(data);
    }
}

interface StringOptions {
    indent?: string;
    isRoot?: boolean;
    showUid?: boolean;
}

class CommentNode {
    $uid: string;

    constructor(public data: string) {
        this.$uid = "C" + (++UID_COUNT);
    }

    stringify(options: StringOptions): string {
        let indent = options.indent || "",
            showUid = options.showUid === true,
            uid = showUid ? "::" + this.$uid : "";

        return `${indent}//${uid} ${this.data}`;
    }
}

class TextNode {
    $uid: string;
    parentNode = null;
    changeCount = 0;

    constructor(public _textContent: string) {
        this.$uid = "T" + (++UID_COUNT);
    }

    set textContent(v: string) {
        this._textContent = v;
        this.changeCount++;
    }

    stringify(options: StringOptions): string {
        let indent = options.indent || "",
            showUid = options.showUid === true,
            uid = showUid ? "::" + this.$uid : "",
            chg = this.changeCount === 0 ? "" : " (" + this.changeCount + ")";

        return `${indent}#${uid}${this._textContent}#${chg}`;
    }
}

class ElementClassList {
    constructor(public elt: any) { }

    add(name: string) {
        if (!this.elt.className) {
            this.elt.className = name;
        } else {
            var arr = this.elt.className.split(" "), found = false;
            for (let i = 0; arr.length > i; i++) if (arr[i] === name) {
                found = true;
                break;
            }
            if (!found) {
                this.elt.className += (this.elt.className === "") ? name : (" " + name);
            }
        }
    }

    remove(name: string) {
        if (this.elt.className) {
            var arr = this.elt.className.split(" "), arr2: string[] = [];
            for (let i = 0; arr.length > i; i++) if (arr[i] !== name) {
                arr2.push(arr[i]);
            }
            this.elt.className = arr2.join(" ");
        }
    }
}

function incrementChanges(e, name) {
    if (e.$changes[name] === undefined) {
        e.$changes[name] = 0;
    } else {
        e.$changes[name]++;
    }
}

export class ElementNode {
    $uid: string;
    childNodes: any[] = [];
    namespaceURI: string = "http://www.w3.org/1999/xhtml";
    parentNode = null;
    classList: ElementClassList;
    style = {};
    $changes: any = {}

    constructor(public nodeName: string, namespace?: string) {
        this.$uid = ((nodeName === "#doc-fragment") ? "F" : "E") + (++UID_COUNT);
        if (namespace) {
            this.namespaceURI = namespace;
        }
        this.classList = new ElementClassList(this);
    }

    setAttribute(key: string, value: string) {
        let k = "a:" + key
        this[k] = value; // toUpperCase: to test that value has been set through setAttribute
        incrementChanges(this, k);
    }

    set className(v: string) {
        this["$className"] = v;
        incrementChanges(this, "$className");
    }

    appendChild(node) {
        if (!node) return;
        if (node.nodeName && node.nodeName === "#doc-fragment") {
            let ch = node.childNodes;
            for (let i = 0; ch.length > i; i++) {
                ch[i].parentNode = this;
            }
            this.childNodes = this.childNodes.concat(node.childNodes);
            node.childNodes = [];
        } else {
            this.childNodes.push(node);
            node.parentNode = this;
        }
    }

    removeChild(node) {
        // brute force... but simple and safe
        let ch2: any[] = [], found = false;
        for (let nd of this.childNodes) {
            if (nd !== node) {
                ch2.push(nd);
            } else {
                node.parentNode = null;
                found = true;
            }
        }
        if (!found) {
            throw "Failed to execute 'removeChild' on 'Node': Child not found";
        }
        this.childNodes = ch2;
    }

    set textContent(value) {
        if (value === "") {
            // remove all child nodes
            for (let i = 0; this.childNodes.length > i; i++) {
                this.childNodes[i].parentNode = null;
            }
            this.childNodes = [];
            doc.traces.wentThroughTextContentDelete = true;
        } else {
            throw "Unsupported textContent: " + value;
        }
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
        if (idx < 0) {
            throw new Error("insertBefore: ref node not found");
        }
        if (!node) {
            throw new Error("insertBefore: invalid node");
        }
        if (node.nodeName && node.nodeName === "#doc-fragment") {
            let nch = node.childNodes;
            for (let i = nch.length - 1; i > -1; i--) {
                nch[i].parentNode = this;
                this.childNodes.splice(idx, 0, nch[i]);
            }
            node.childNodes = [];
        } else {
            node.parentNode = this;
            this.childNodes.splice(idx, 0, node);
        }
    }

    stringify(options: StringOptions): string {
        let indent = options.indent || "",
            isRoot = options.isRoot === true,
            showUid = options.showUid === true,
            uid = showUid ? "::" + this.$uid : "",
            styleBuf: string[] = [],
            lines: string[] = [], indent2 = isRoot ? indent + "    " : indent, atts: string[] = [], att = "";

        for (let k in this.style) {
            if (!this.style.hasOwnProperty(k)) continue;
            styleBuf.push(k + ":" + this.style[k]);
        }
        if (styleBuf.length) {
            atts.push('style="' + styleBuf.join(";") + '"');
        }

        for (let k in this) {
            if (this.hasOwnProperty(k) && k !== "nodeName" && k !== "childNodes"
                && k !== "namespaceURI" && k !== "$uid" && k !== "parentNode"
                && k !== "style" && k !== "classList" && k !== "$changes") {
                if (typeof this[k] === "function") {
                    atts.push(`on${k}=[function]`);
                } else {
                    let chge = "";
                    if (this.$changes[k]) {
                        chge = "(" + this.$changes[k] + ")";
                    }
                    if (k === "$className") {
                        atts.push(`className="${this[k]}"${chge}`);
                    } else {
                        atts.push(`${k}="${this[k]}"${chge}`);
                    }
                }
            }
        }
        if (atts.length) {
            att = " " + atts.join(" ");
        }

        if (this.childNodes.length) {
            let options2: StringOptions = { indent: indent2 + "    ", isRoot: false, showUid: showUid };
            lines.push(`${indent2}<${this.nodeName}${uid}${att}>`);
            for (let ch of this.childNodes) {
                lines.push(ch.stringify(options2));
            }
            lines.push(`${indent2}</${this.nodeName}>`);
        } else {
            lines.push(`${indent2}<${this.nodeName}${uid}${att}/>`);
        }

        if (isRoot) {
            return CR + lines.join(CR) + CR + indent;
        } else {
            return lines.join(CR);
        }
    }

    addEventListener(evtName, func) {
        this[evtName] = func;
    }
}

class DocFragment extends ElementNode {
    constructor() {
        super("#doc-fragment");
    }
}
