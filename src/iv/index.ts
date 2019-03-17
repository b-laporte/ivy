import { loader } from 'webpack';
import { IvTemplate, IvNodes, IvContext, IvDocument, IvElement, IvNode, IvParentNode, IvText, IvFragment } from './types';
import { Dataset, value } from 'hibe';


function error(msg) {
    // temporary error management
    console.log("[iv error] " + msg);
}

/**
 * Template object created at runtime
 */
class Template implements IvTemplate {
    hasHost = false;
    nodes: IvNodes;
    context: IvContext;
    refreshFn: (ζ: IvNodes, ζa?: any) => void | undefined;

    constructor() {
        // document is undefined in a node environment
        this.context = {
            kind: "#context",
            doc: (typeof document !== "undefined") ? document as any : null as any,
            domNode: undefined
        }
    }

    get document() {
        return this.context.doc;
    }

    set document(d: IvDocument) {
        this.context.doc = d;
    }

    attach(element: any) {
        if (!this.context.domNode) {
            this.context.domNode = element;
        } else {
            error("template host cannot be changed yet"); // todo
        }
        return this;
    }

    refresh(data?: any) {
        if (!this.nodes) {
            this.nodes = [this.context];
        }
        if (this.refreshFn) {
            this.refreshFn(this.nodes, data);
        }
        return this;
    }
}

/**
 * Template definition
 * (not called at runtime - cf. ζt)
 * @param template the template string
 */
export function template(template: string): () => IvTemplate {
    return function () {
        return new Template()
    }
};

/**
 * Template runtime factory
 * cf. sample code generation in generator.spec
 * @param refreshFn 
 */
export function ζt(refreshFn: (ζ: IvNodes, ζa?: any) => void, hasHost?: number, argumentClass?): () => IvTemplate {
    return function () {
        let t = new Template();
        t.refreshFn = refreshFn;
        t.hasHost = hasHost === 1;
        return t;
    }
}

/**
 * Class decorator for the parameter class
 */
export let ζd = Dataset();

/**
 * Class property decorator for the parameter class
 */
export let ζv = value();

/**
 * Unchanged symbol
 * Used as a return value for expressions (cf. ζe) to notify that a value hasn't changed
 */
export const ζu = []; // must be an array to be used for undefined statics

/**
 * Fragment creation
 * @param c the xjs context
 * @param idx the index in c.nodes 
 * @param parentIdx the parent index in c.nodes
 */
export function ζfrag(c: IvNodes, idx: number, parentIdx: number, instIdx: number, isPlaceholder: number = 0) {
    if (instIdx === 0) {
        createFrag(c, idx, parentIdx, instIdx, isPlaceholder);
    } else {
        console.log("TODO frag")
    }
}

function createFrag(c: IvNodes, idx: number, parentIdx: number, instIdx: number, isPlaceholder: number = 0) {
    let nd: IvFragment = {
        kind: "#fragment",
        isContainer: isPlaceholder === 1,
        domNode: undefined,
        attached: false,
        idx: idx,
        parentIdx: parentIdx,
        ns: "",
        nextSiblingIdx: -1,   // will be determined after first render
        children: undefined,
        expressions: undefined
    }
    connectChild(c, nd, idx);
}

/**
 * Tells if a node needs to be created or deleted
 * @param c 
 * @param idx 
 */
export function ζcheck(c: IvNodes, idx: number, pos: number, keyExpr?: any): number {
    if (pos > 0) {
        console.log("TODO: support block content")
    }
    if (keyExpr !== undefined) {
        console.log("TODO: support @key")
    }
    if (!c[idx]) return 1 // creation mode as the root object doesn't exist
    return 0;
}

/**
 * Second check to delete element if not previously checked (cf. if {...} block)
 */
export function ζclean(c: IvNodes, idx: number, instIdx: number): number {
    return 1;
}

/**
 * End of creation mode
 * @param c 
 * @param idx 
 */
export function ζend(c: IvNodes, idx: number, creationMode: number) {
    if (!creationMode) return;
    // go through all nodes and attach them together
    let len = c.length, nd: IvNode, startIdx = idx === 1 ? 2 : idx, domNode2: any;
    if (idx === 1) {
        let ctxt = c[0] as IvContext, nd = c[1] as IvNode;
        // if root node is fragment, we need to define its domNode first
        if (nd.kind === "#fragment") {
            nd.domNode = ctxt.domNode;
            nd.attached = true;
        }
    }
    for (let i = startIdx; len > i; i++) {
        nd = c[i] as IvNode;
        if (!nd.attached) {
            let p = (c[nd.parentIdx] as IvNode);
            domNode2 = nd.domNode;
            if (domNode2 !== p.domNode) {
                p.domNode.appendChild(domNode2);
            }
            nd.attached = true;
            if (nd.kind === "#fragment") {
                nd.domNode = p.domNode;
            }
        }
    }
    if (idx === 1) {
        // root node, attach to parent container
        let ctxt = c[0] as IvContext, nd = c[1] as IvNode;
        if (ctxt.domNode) {
            domNode2 = nd.domNode;
            if (ctxt.domNode !== domNode2) {
                ctxt.domNode.appendChild(domNode2);
            }
            nd.attached = true;
        }
    }
}

/**
 * Element node creation
 */
export function ζelt(c: IvNodes, idx: number, parentIdx: number, instIdx: number, name: string, staticAttributes?: any[], staticProperties?: any[]) {
    if (instIdx === 0) {
        createElt(c, idx, parentIdx, instIdx, name, staticAttributes, staticProperties);
    } else {
        console.log("TODO elt")
    }
}

function createElt(c: IvNodes, idx: number, parentIdx: number, instIdx: number, name: string, staticAttributes?: any[], staticProperties?: any[]) {
    let doc = (c[0] as IvContext).doc,
        e = doc.createElement(name);
    if (staticAttributes) {
        let len = staticAttributes.length;
        for (let i = 0; len > i; i += 2) {
            e.setAttribute(staticAttributes[i], staticAttributes[i + 1]);
        }
    }
    if (staticProperties) {
        let len = staticProperties.length;
        for (let j = 0; len > j; j += 2) {
            e.setAttribute(staticProperties[j], staticProperties[j + 1]);
        }
    }
    let nd: IvElement = {
        kind: "#element",
        domNode: e,
        attached: false,
        idx: idx,
        parentIdx: parentIdx,
        ns: "",
        nextSiblingIdx: -1,   // will be determined after first render
        children: undefined,
        expressions: undefined
    }
    connectChild(c, nd, idx);
}

function connectChild(c: IvNodes, child: IvNode, childIdx: number) {
    c[childIdx] = child;
    let p = c[child.parentIdx] as IvParentNode;
    if (!p) return; // will happen on root node as childIdx === parentIdx
    if (!p.children) {
        p.children = [childIdx];
    } else {
        p.children.push(childIdx);
    }
}

/**
 * Text node creation
 */
export function ζtxt(c: IvNodes, idx: number, parentIdx: number, instIdx: number, statics: string | string[]) {
    if (instIdx === 0) {
        createTxt(c, idx, parentIdx, instIdx, statics);
    } else {
        console.log("TODO ζtxt")
    }
}

function createTxt(c: IvNodes, idx: number, parentIdx: number, instIdx: number, statics: string | string[]) {
    let dnd = undefined, pieces: string[] | undefined = undefined;
    if (typeof (statics) === 'string') {
        dnd = (c[0] as IvContext).doc.createTextNode(statics);
    } else {
        pieces = statics.slice(0); // clone
    }

    let nd: IvText = {
        kind: "#text",
        domNode: dnd,
        attached: false,
        idx: idx,
        parentIdx: parentIdx,
        nextSiblingIdx: -1,
        pieces: pieces,
        expressions: undefined
    }
    connectChild(c, nd, idx);
}

/**
 * Dynamic text values update
 */
export function ζtxtval(c: IvNodes, idx: number, instIdx: number, nbrOfValues: number, ...values: any[]) {
    let nd = c[idx] as IvText, changed = false, v: any, pieces: string[] | undefined = undefined;
    for (let i = 0; nbrOfValues > i; i++) {
        v = values[i];
        if (v !== ζu) {
            changed = true;
            if (!pieces) {
                pieces = nd.pieces;
            }
            pieces![1 + i * 2] = v;
        }
    }
    if (!changed) return;
    if (instIdx === 0) {
        if (!nd.domNode) {
            nd.domNode = (c[0] as IvContext).doc.createTextNode(pieces!.join(""));
        } else {
            nd.domNode.textContent = pieces!.join("");
        }
    } else {
        console.log("TODO ζtxtval")
    }
}

/**
 * Expression diffing
 */
export function ζe(c: IvNodes, idx: number, blockIdx: number, value: any) {
    let nd = c[blockIdx] as IvNode;
    if (!nd.expressions) {
        // first time, expression is considered changed
        nd.expressions = [];
        nd.expressions[idx] = value;
    } else {
        let exp = nd.expressions;
        if (exp[idx] === value) return ζu;
        exp[idx] = value;
    }
    return value;
}

/**
 * Dynamic attribute update
 */
export function ζatt(c: IvNodes, eltIdx: number, instIdx: number, name: string, value: any) {

}

/**
 * Dynamic property update
 */
export function ζprop(c: IvNodes, eltIdx: number, instIdx: number, name: string, value: any) {

}

/**
 * Dynamic param update
 */
export function ζparam(c: IvNodes, nodeIdx: number, instIdx: number, name: string, value: any) {

}

/**
 * Set index/key for container fragments used in js blocks
 */
export function ζkey(c: IvNodes, fragmentIdx: number, colIndex: number, key?: any) {

}

/**
 * Dynamic component creation / update
 */
export function ζcpt(c: IvNodes, fragIdx: number, instIdx: number, refExpr, contentIdx?: number, hasParamNodes?: number, staticParams?: any[]) {
    // contentIdx = 0 if no content
}

/**
 * Call a component or a decorator once all params & content are set
 */
export function ζcall(c: IvNodes, idx: number, instIdx: number) {

}

/**
 * Param node
 */
export function ζpnode(c: IvNodes, idx: number, parentIdx: number, instIdx: number, refExpr, staticParams?: any[]) {

}

/**
 * Dynamic decorator creation / update
 */
export function ζdeco(c: IvNodes, idx: number, parentIdx: number, instIdx: number, refExpr, contentIdx?: number, hasParamNodes?: number, staticParams?: any[]) {

}

/**
 * Asynchronous block definition
 */
export function ζasync(c: IvNodes, priority: number, fn: () => any) {

}

/**
 * Define and event listener node
 * e.g. ζlsnr(ζ, 2, 1, "click");
 */
export function ζhandler(c: IvNodes, idx: number, parentIdx: number, instIdx: number, eventName: string) {

}

/**
 * Update an event handler function
 * e.g. ζevt(ζ, 2, 0, function (e) { doSomething(e.name); });
 */
export function ζlistener(c: IvNodes, idx: number, instIdx: number, handler: Function) {

}
