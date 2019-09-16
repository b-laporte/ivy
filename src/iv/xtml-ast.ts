const U = undefined, NO_VALUE: XtmlRef = { kind: "#ref", identifier: "" };

// -------------------------------------------------------------------------------------
// types

export interface XtmlFragment {
    children: (XtmlElement | XtmlText)[];
    ref(value: string): XtmlRef;
    refs: XtmlRef[];
    toString(indent?: string): string;
}

export interface XtmlRef {
    kind: "#ref";
    identifier: string;
    target?: any;
}

export interface XtmlElement {
    kind: "#element" | "#component" | "#paramNode" | "#decoratorNode";
    name?: string;
    nameRef?: string;
    params?: XtmlParam[];
    children?: (XtmlElement | XtmlText)[];
}

export interface XtmlText {
    kind: "#text";
    value: string;
    params?: XtmlParam[];
}

export interface XtmlParam {
    kind: "#param" | "#property" | "#decorator" | "#label";
    name: string;
    holdsValue: boolean;
    value?: any;
    valueRef?: string;
    params?: XtmlParam[]; // for decorators
}

// -------------------------------------------------------------------------------------
// Tree API to dynamically create an XTML tree and bypass the XTML parser

export function createXtmlFragment() {
    return new XFragment();
}

export function addElement(parent: XtmlFragment | XtmlElement, name: string): XtmlElement {
    return pushChild(parent, new XElement("#element", name)) as XtmlElement;
}

export function addComponent(parent: XtmlFragment | XtmlElement, ref: XtmlRef): XtmlElement {
    return pushChild(parent, new XElement("#component", U, ref.identifier)) as XtmlElement;
}

export function addParamNode(parent: XtmlFragment | XtmlElement, name: string): XtmlElement {
    return pushChild(parent, new XElement("#paramNode", name)) as XtmlElement;
}

export function addText(parent: XtmlFragment | XtmlElement, text: string) {
    pushChild(parent, new XText(text));
}

export function addParam(parent: (XtmlElement | XtmlParam), name: string, value?: boolean | number | string | XtmlRef, isProperty?: boolean) {
    return pushParam(parent, new XParam(isProperty === true ? "#property" : "#param", name, value));
}

export function addDecorator(parent: (XtmlElement | XtmlParam), nameRef: XtmlRef, value: boolean | number | string | XtmlRef = NO_VALUE) {
    return pushParam(parent, new XParam("#decorator", nameRef.identifier, value));
}

export function addLabel(parent: (XtmlElement | XtmlParam), name: string, value?: string | XtmlRef) {
    return pushParam(parent, new XParam("#label", name, value));
}

class XFragment implements XtmlFragment {
    _refs: { [refName: string]: XtmlRef } = {};

    children: (XtmlElement | XtmlText)[] = [];
    ref(name: string): XtmlRef {
        let ref: XtmlRef = {
            kind: "#ref",
            identifier: name
        }
        this._refs[name] = ref;
        return ref;
    }

    get refs(): XtmlRef[] {
        let r: XtmlRef[] = [], refs = this._refs;
        for (let k in refs) {
            if (refs.hasOwnProperty(k)) {
                r.push(refs[k]);
            }
        }
        return r;
    }

    toString(indent?: string): string {
        return serialize(this.children, "", indent === U ? "  " : indent, true) + "\n";
    }
}

const PREFIXES = {
    "#component": "*",
    "#decoratorNode": "@",
    "#element": "",
    "#paramNode": ".",
    "#param": "",
    "#property": "[",
    "#decorator": "@",
    "#label": "#"
}, SUFFIXES = {
    "#param": "",
    "#property": "]",
    "#decorator": "",
    "#label": ""
}

function serialize(nodes: (XtmlElement | XtmlText)[], startIndent: string, indent: string, multiline: boolean) {
    if (!nodes.length) return "";
    let buf: string[] = [], start: string;
    for (let n of nodes) {
        if (multiline) {
            buf.push("\n" + startIndent);
        }
        if (n.kind === "#text") {
            buf.push(n.value);
        } else {
            start = "<" + PREFIXES[n.kind] + (n.name || n.nameRef) + serializeParams(n.params);
            buf.push(start);
            if (n.children) {
                buf.push(">");
                let mLine = (n.children.length > 1 || start.length > 25 || (n.children.length === 1 && n.children[0].kind !== "#text")); // multi line
                buf.push(serialize(n.children, startIndent + indent, indent, mLine));
                if (mLine) {
                    buf.push("\n" + startIndent + "</>"); // no need for name as we have indentation
                } else {
                    buf.push("</" + PREFIXES[n.kind] + (n.name || n.nameRef) + ">");
                }
            } else {
                buf.push("/>");
            }
        }
    }
    return buf.join("");
}

function serializeParams(params?: XtmlParam[], firstSeparator: string = " "): string {
    if (params === U || params.length === 0) return "";
    let buf: string[] = [];
    for (let p of params) {
        buf.push((buf.length === 0) ? firstSeparator : " ");
        buf.push(PREFIXES[p.kind] + p.name + SUFFIXES[p.kind]);
        if (p.holdsValue) {
            if (p.valueRef !== U) {
                buf.push("={" + p.valueRef + "}");
            } else if (typeof p.value === "boolean" || typeof p.value === "number") {
                buf.push("=" + p.value);
            } else {
                // string
                buf.push("='" + encodeText("" + p.value) + "'");
            }
        } else if (p.kind === "#decorator" && p.params) {
            let s = serializeParams(p.params, "");
            if (s.length) {
                buf.push("(" + s + ")");
            }
        }
    }
    return buf.join("");
}

function encodeText(t: string) {
    return t.replace(/\'/g, "\\'")
}

class XElement implements XtmlElement {
    params?: XtmlParam[];
    children?: (XtmlElement | XtmlText)[];
    constructor(public kind: "#element" | "#component" | "#paramNode" | "#decoratorNode", public name?: string, public nameRef?: string) { }
}

function pushChild(parent: XtmlFragment | XtmlElement, child: XtmlElement | XtmlText) {
    if (!parent.children) {
        parent.children = [child];
    } else {
        parent.children!.push(child);
    }
    return child;
}

class XText implements XtmlText {
    kind: "#text" = "#text";
    constructor(public value: string) { }
}

class XParam implements XtmlParam {
    params?: XtmlParam[];
    valueRef?: string;
    holdsValue: boolean = true;

    constructor(public kind: "#param" | "#property" | "#decorator" | "#label", public name: string, public value?: boolean | number | string | XtmlRef) {
        if (value === U || value === NO_VALUE) {
            this.holdsValue = false;
        } else if ((value as XtmlRef).kind === "#ref") {
            this.valueRef = (value as XtmlRef).identifier;
        }
    }
}

function pushParam(elt: XtmlElement | XtmlParam, param: XtmlParam): XtmlParam {
    if (!elt.params) {
        elt.params = [param];
    } else {
        elt.params.push(param);
    }
    return param;
}