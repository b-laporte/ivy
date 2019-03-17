import { CompilationResult } from '../compiler/generator';
import { compileTemplate } from '../compiler/generator';

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
    }
}

interface StringOptions {
    indent?: string;
    isRoot?: boolean;
    showUid?: boolean;
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
            chg = this.changeCount === 0 ? "" : " (changes:" + this.changeCount + ")";

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

export class ElementNode {
    $uid: string;
    childNodes: any[] = [];
    namespaceURI: string = "http://www.w3.org/1999/xhtml";
    parentNode = null;
    classList: ElementClassList;
    style = {};

    constructor(public nodeName: string, namespace?: string) {
        this.$uid = ((nodeName === "#doc-fragment") ? "F" : "E") + (++UID_COUNT);
        if (namespace) {
            this.namespaceURI = namespace;
        }
        this.classList = new ElementClassList(this);
    }

    setAttribute(key: string, value: string) {
        this[key.toUpperCase()] = value; // toUpperCase: to test that value has been set through setAttribute
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
        if (idx < 0 || !node) {
            return;
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
                && k !== "style" && k !== "classList") {
                if (typeof this[k] === "function") {
                    atts.push(`on${k}=[function]`);
                } else if (k === "className") {
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
