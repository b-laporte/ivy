import { logViewNodes } from './../iv/index';
import { CompilationResult, IvError } from '../iv/compiler/generator';
import { compileTemplate } from '../iv/compiler/generator';
import { IvTemplate, IvView } from '../iv/types';
import { process } from '../iv/compiler/compiler';

export let body = {
    async template(tpl: string, log = false) {
        let r = await compileTemplate(tpl, { templateName: "testTpl", filePath: "test.ts", body: true });
        if (log) {
            console.log(`body: '${r.body}'`)
        }
        return r.body;
    }
}

export let statics = {
    async template(tpl: string, log = false) {
        let r = await compileTemplate(tpl, { templateName: "testTpl", filePath: "test.ts", statics: true });
        if (log) {
            console.log(`statics: '${r.statics}'`)
        }
        return r.statics;
    }
}

export let test = {
    async template(tpl: string, importMap?: { [key: string]: 1 }): Promise<CompilationResult> {
        let r = await compileTemplate(tpl, { templateName: "testTpl", filePath: "test.ts", body: true, statics: true, function: true, imports: true, importMap: importMap });

        return r;
    }
}

export let testData: { lastEventListenerOptions: any } = {
    lastEventListenerOptions: undefined
}

export async function compilationError(src: string, lineOffset = 0) {
    let r: string;
    try {
        r = await process(src, { filePath: "file.ts", logErrors: false });
    } catch (e) {
        let err = e as IvError;
        if (err.kind === "#Error") {
            err.line += lineOffset;
            return formatError(err);
        }
        return " Non Ivy error: " + e.message;
    }
    return 'No Error';
}

export const error = {
    // this api allows to trigger the vs-code text mate completion
    async template(tpl: string) {
        return compilationError(`\
            import{ template } from "../iv";
            const t = template(\`${tpl}\`);
        `, -1); // offset -1 to remove the import line
    },
    template2: async function (s: string) { return '' }
}
error.template2 = error.template; // to avoid TextMate highlighting for some wrong templates


export function formatError(e?: IvError, indentLevel = 2) {
    if (!e) return "NO ERROR";
    const indents = ["", "    ", "        ", "            ", "                "], ls = "\n" + indents[indentLevel];
    if (e.kind === "#Error") {
        return `${ls}    ${e.origin}: ${e.message}`
            + `${ls}    File: ${e.file} - Line ${e.line} / Col ${e.column}`
            + `${ls}    Extract: >> ${e.lineExtract} <<`
            + `${ls}`;
    } else {
        const msg = e.message || "" + e;
        return msg.replace(/^|\n|$/g, ls);
    }
}

// ------------------------------------------------------------------------------------------------
let o = { indent: '        ', showUid: true, isRoot: true };

export function reset() {
    resetIdCount();
    return doc.createElement("body");
}

export function getTemplate(f: () => IvTemplate, body: any): IvTemplate {
    let t = f();
    (t as any).document = doc;
    t.attach(body);
    return t;
}

const SEP = "-------------------------------------------------------------------------------";

export function logNodes(t: IvTemplate, label = "") {
    let view: IvView = t["view"];
    console.log("");
    console.log(SEP);
    if (!view || !view.nodes || !view.nodes.length) {
        console.log(label + "\nEmpty template")
        return;
    }
    if (label) console.log(label)
    logViewNodes(t["view"], "");
    console.log(SEP);
}

export function stringify(t: IvTemplate, log = false) {
    let r = t["view"].rootDomNode.stringify(o)
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

    createDocumentFragment() {
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
    uid: string;

    constructor(public data: string) {
        this.uid = "C" + (++UID_COUNT);
    }

    stringify(options: StringOptions = o): string {
        let indent = options.indent || "",
            showUid = options.showUid === true,
            uid = showUid ? "::" + this.uid : "";

        return `${indent}//${uid} ${this.data}`;
    }
}

class TextNode {
    uid: string;
    parentNode = null;
    changeCount = 0;

    constructor(public _textContent: string) {
        this.uid = "T" + (++UID_COUNT);
    }

    set textContent(v: string) {
        this._textContent = v;
        this.changeCount++;
    }

    log(label = "") {
        console.log(SEP);
        if (label) console.log("LOG::" + label.toUpperCase());
        console.log(this.stringify({}));
    }

    stringify(options: StringOptions = o): string {
        let indent = options.indent || "",
            showUid = options.showUid === true,
            uid = showUid ? "::" + this.uid : "",
            chg = this.changeCount === 0 ? "" : " (" + this.changeCount + ")";

        return `${indent}#${uid}${this._textContent}#${chg}`;
    }

    get innerText() {
        return this._textContent;
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

const NS_SVG = "http://www.w3.org/2000/svg",
    NS_HTML = "http://www.w3.org/1999/xhtml"

export class ElementNode {
    uid: string;
    childNodes: any[] = [];
    namespaceURI: string = NS_HTML;
    nsSpecified = false;
    parentNode = null;
    classList: ElementClassList;
    style = {};
    $changes: any = {};
    eListeners: any[];

    constructor(public nodeName: string, namespace?: string) {
        this.uid = ((nodeName === "#doc-fragment") ? "F" : "E") + (++UID_COUNT);
        if (namespace) {
            this.namespaceURI = namespace;
            this.nsSpecified = true;
        }
        this.classList = new ElementClassList(this);
    }
    setAttribute(key: string, value: string) {
        let k = "a:" + key
        this[k] = value; // toUpperCase: to test that value has been set through setAttribute
        incrementChanges(this, k);
    }

    getAttribute(name: string) {
        let s = this["a:" + name];
        return s ? s : null;
    }

    removeAttribute(key: string) {
        let k = "a:" + key;
        delete this[k];
    }

    set value(v: any) {
        if (this.tagName === "SELECT") {
            const len = this.childNodes.length;
            let val: any, defaultVal = "";
            for (let i = 0; len > i; i++) {
                val = this.childNodes[i].value;
                if (i === 0) {
                    defaultVal = val || "";
                }
                if (val === v) {
                    this["a:value"] = "" + v;
                    return;
                }
            }
            this["a:value"] = defaultVal;
        }
        this["a:value"] = "" + v;
    }

    get value() {
        return this["a:value"];
    }

    set className(v: string) {
        this["$className"] = v;
        incrementChanges(this, "$className");
    }

    get tagName() {
        return this.nodeName.toUpperCase();
    }

    get nodeType() {
        if (this.nodeName === "#doc-fragment") return 11; // DOCUMENT_FRAGMENT_NODE
        return 1; // ELEMENT_NODE
    }

    set innerHTML(s: string) {
        // partial implementation: remove all child nodes and create a single text node instead
        for (let child of this.childNodes) {
            child.parentNode = null;
        }
        this.childNodes = [];
        if (s !== "") {
            this.appendChild(new TextNode(s));
        }
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
        // console.log("removeChild", node.uid)
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

    log(label = "") {
        console.log(SEP);
        if (label) console.log("LOG::" + label.toUpperCase());
        console.log(this.stringify({}));
    }

    stringify(options: StringOptions = o): string {
        let indent = options.indent || "",
            isRoot = options.isRoot === true,
            showUid = options.showUid === true,
            uid = showUid ? "::" + this.uid : "",
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
                && k !== "namespaceURI" && k !== "nsSpecified" && k !== "uid" && k !== "parentNode"
                && k !== "style" && k !== "classList" && k !== "$changes" && k !== "eListeners") {
                if (k === "value" && this["a:value"] !== undefined) {
                    continue;
                }
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

        let ns = "";
        if (this.nsSpecified) {
            if (this.namespaceURI === NS_HTML) {
                ns = " HTML";
            } else if (this.namespaceURI === NS_SVG) {
                ns = " SVG";
            } else {
                ns = " " + this.namespaceURI;
            }
        }
        if (this.childNodes.length) {
            let options2: StringOptions = { indent: indent2 + "    ", isRoot: false, showUid: showUid };
            lines.push(`${indent2}<${this.nodeName}${uid}${ns}${att}>`);
            for (let ch of this.childNodes) {
                if (ch === this) {
                    lines.push(`${indent2}CHILD=PARENT!`);
                    continue;
                }
                lines.push(ch.stringify(options2));
            }
            lines.push(`${indent2}</${this.nodeName}>`);
        } else {
            lines.push(`${indent2}<${this.nodeName}${uid}${ns}${att}/>`);
        }

        if (isRoot) {
            return CR + lines.join(CR) + CR + indent;
        } else {
            return lines.join(CR);
        }
    }

    addEventListener(evtName, func, options) {
        if (!this.eListeners) {
            this.eListeners = [];
        }
        this.eListeners.push({ name: evtName, func: func });
        testData.lastEventListenerOptions = options;
    }

    click() {
        raiseEvent("click", this);
    }
}

function raiseEvent(name: string, e: ElementNode) {
    if (e.eListeners) {
        for (let listener of e.eListeners) {
            if (listener.name === name) {
                try {
                    let evt = { type: name, target: e };
                    listener.func(evt);
                } catch (ex) {
                    console.log("ERROR in Event Listener: " + listener.name, ex);
                }
            }
        }
    }
}

export function focusElt(e: ElementNode) {
    raiseEvent("focus", e);
}

export function blurElt(e: ElementNode) {
    raiseEvent("blur", e);
}

export function editElt(e: ElementNode, value: string | boolean | number, append = true, focusAndBlur = false) {
    if (focusAndBlur) {
        focusElt(e);
    }
    // todo: check element tagName and type
    if (e.tagName === "TEXTAREA") {
        editText();
        return;
    } else if (e.tagName === "SELECT") {
        // todo
        let v1 = e.value;
        e.value = value;
        if (v1 !== e.value) {
            raiseEvent("change", e);
        }
    }
    if (e.tagName !== "INPUT") return;
    let type = e.getAttribute("type"), vStart: any = undefined, vEnd: any = undefined;
    if (type === "text" || type === "number") {
        editText();
    } else if (type === "checkbox") {
        vStart = e["checked"] || false;
        e["checked"] = value === true;
        vEnd = e["checked"] || false;
    } else if (type === "radio") {
        vStart = e["checked"] || false;
        e["checked"] = value === true;
        vEnd = e["checked"] || false;
    }
    if (focusAndBlur) {
        blurElt(e);
        if (vStart !== vEnd) {
            raiseEvent("change", e);
        }
    }

    function editText() {
        vStart = e["a:value"] || "";
        if (!append) {
            if (vStart !== "") {
                e["a:value"] = "";
                raiseEvent("input", e);
            }
        }

        for (let c of "" + value) {
            e["a:value"] = (e["a:value"] || "") + c;
            raiseEvent("input", e);
        }
        vEnd = e["a:value"];
    }
}

class DocFragment extends ElementNode {
    constructor() {
        super("#doc-fragment");
    }
}
