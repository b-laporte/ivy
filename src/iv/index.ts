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
            domNode: undefined,
            refreshCount: 0,
            anchorNode: undefined
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
            let ctxt = this.context;
            if (!ctxt.doc) throw new Error("[iv] Template.document must be defined before calling Template.attach()");
            ctxt.domNode = element;
            ctxt.anchorNode = ctxt.doc.createComment("template anchor"); // used as anchor in the parent domNode
            element.appendChild(ctxt.anchorNode);
        } else {
            error("template host cannot be changed yet"); // todo
        }
        return this;
    }

    refresh(data?: any) {
        if (!this.nodes) {
            this.nodes = [this.context];
        }
        if (!this.context.domNode) {
            throw new Error("[iv] Template must be attached to a DOM node before begin refreshed");
        }
        if (this.refreshFn) {
            this.context.refreshCount++;
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
        childPos: -1, // will be determined after first render
        children: undefined,
        expressions: undefined,
        lastRefresh: 0
    }
    connectChild(c, nd, idx);
}

/**
 * Tells if a node needs to be created or deleted
 * @param c 
 * @param idx 
 */
export function ζcheck(c: IvNodes, idx: number, pos: number, keyExpr?: any): number {
    if (pos > 2) {
        console.log("TODO: support block content")
    }
    if (keyExpr !== undefined) {
        console.log("TODO: support @key")
    }
    let nd = c[idx] as IvNode;
    if (!nd) return 1 // creation mode as the root object doesn't exist
    nd.lastRefresh = (c[0] as IvContext).refreshCount;
    return 0;
}

/**
 * Second check to delete element if not previously checked (cf. if {...} block)
 */
export function ζclean(c: IvNodes, idx: number, instIdx: number) {
    let nd = c[idx] as IvNode;
    if (!nd) return; // happens when block condition has never been true
    let lastRefresh = nd.lastRefresh;
    if (lastRefresh !== 0 && lastRefresh !== (c[0] as IvContext).refreshCount) {
        deleteNode(c, nd as IvNode);
    }
}

function deleteNode(c: IvNodes, nd: IvNode) {
    if (nd.kind === "#text" || nd.kind === "#element") {
        nd.attached = false;
        let p = c[nd.parentIdx];
        // console.log("before remove", nd.domNode.$uid);
        if (p.domNode) {
            // console.log("remove", nd.domNode.$uid, "from", p.domNode.$uid)
            p.domNode.removeChild(nd.domNode);
        }
    } else if (nd.kind === "#fragment") {
        let f = nd as IvFragment;
        f.attached = false;
        if (f.children) {
            let ch = f.children, len = ch.length;
            for (let i = 0; len > i; i++) {
                deleteNode(c, c[ch[i]] as IvNode);
            }
        }
        // console.log("c["+f.idx+"].domNode = undefined")
        f.domNode = undefined;
    } else {
        console.log("TODO deleteNode")
    }
}

function appendChildren(c: IvNodes, nd: IvNode, hostDomNd: any) {
    if (!nd || nd.attached) return;
    let p = (c[nd.parentIdx] as IvNode), domNode = nd.domNode, rCount = (c[0] as IvContext).refreshCount;
    if (p.domNode === hostDomNd) {
        // we cannot append in the host dom node as we have to insert before the anchor node instead
        let ctxt = c[0] as IvContext;
        insertChildrenBefore(c, ctxt.domNode, nd, ctxt.anchorNode);
        return
    }
    if (p.domNode && domNode && domNode !== p.domNode) {
        // console.log("appendChild", domNode.$uid, "to", p.domNode.$uid);
        p.domNode.appendChild(domNode);
        nd.attached = true;
        nd.lastRefresh = rCount;
    }
    if (nd.kind === "#fragment" && p.domNode) {
        nd.domNode = p.domNode;
        nd.attached = true;
        
        nd.lastRefresh = rCount;
        if ((nd as IvFragment).children) {
            let f = nd as IvFragment, ch = f.children!, len = ch.length, chNd: IvNode;
            for (let i = 0; len > i; i++) {
                chNd = c[ch[i]] as IvNode;
                appendChildren(c, chNd, hostDomNd);
                chNd.lastRefresh = rCount;
            }
        }
    }
}

function insertChildrenBefore(c: IvNodes, parentDomNd: any, nd: IvNode, nextDomNd: any) {
    if (nd.attached) return;
    let domNode = nd.domNode, rCount = (c[0] as IvContext).refreshCount;
    if (domNode && domNode !== parentDomNd) {
        // console.log("insert", domNode.$uid, "before", nextDomNd.$uid);
        parentDomNd.insertBefore(domNode, nextDomNd);
        nd.attached = true;
        nd.lastRefresh = rCount;
    }
    if (nd.kind === "#fragment") {
        nd.domNode = parentDomNd;
        nd.attached = true;
        nd.lastRefresh = rCount;
        if ((nd as IvFragment).children) {
            let f = nd as IvFragment, ch = f.children!, len = ch.length, chNd: IvNode;
            for (let i = 0; len > i; i++) {
                chNd = c[ch[i]] as IvNode;
                insertChildrenBefore(c, parentDomNd, chNd, nextDomNd);
                chNd.lastRefresh = rCount;
            }
        }
    }
}

/**
 * End of creation mode
 * @param c 
 * @param idx 
 */
export function ζend(c: IvNodes, idx: number, creationMode: number) {
    // go through all nodes and attach them together
    if (!creationMode && (c[idx] as IvNode).attached) return;

    let len = c.length, nd = c[idx] as IvNode, startIdx = idx === 1 ? 2 : idx + 1, ctxt = c[0] as IvContext, hostDomNd = ctxt.domNode;
    if (idx === 1) {
        // if root node is fragment, we need to define its domNode first
        if (nd.kind === "#fragment") {
            nd.domNode = hostDomNd;
            nd.attached = true;
            nd.lastRefresh = ctxt.refreshCount;
        }
    }
    for (let i = startIdx; len > i; i++) {
        appendChildren(c, c[i] as IvNode, hostDomNd);
    }

    if (idx === 1) {
        // root node, attach to parent container
        insertChildrenBefore(c, ctxt.domNode, nd, ctxt.anchorNode);
    } else {
        // if we are running first refresh, simply append through ζend(ζ, 1, ζc1);
        // otherwise insert idx before next sibling
        if (ctxt.refreshCount > 1) {
            // if sub-block is displayed on first refresh, no need to insert before next sibling
            let { position, nextDomNd, parentDomNd } = findNextSiblingDomNd(c, c[idx] as IvNode);
            if (position === "beforeChild") {
                insertChildrenBefore(c, parentDomNd, nd, nextDomNd);
            } else if (position === "lastChild") {
                appendChildren(c, nd, hostDomNd);
            } else if (position === "lastOnRoot") {
                insertChildrenBefore(c, ctxt.domNode, nd, ctxt.anchorNode);
            }
        }
    }
}

interface SiblingDomPosition {
    position: "lastChild" | "beforeChild" | "lastOnRoot";
    nextDomNd?: any;
    parentDomNd: any;
}
function findNextSiblingDomNd(c: IvNodes, node: IvNode): SiblingDomPosition {
    let nd = node, pos: number, parent: IvParentNode;
    while (true) {
        parent = c[nd.parentIdx] as IvParentNode;
        pos = nd.childPos;

        if (nd.idx === 1) {
            return { position: "lastOnRoot", parentDomNd: c[0].domNode }; // root node has no sibling
        }

        if (pos !== parent.children!.length - 1) {
            let nextNode = c[parent.children![pos + 1]] as IvNode,
                sdp = findFirstDomNd(c, nextNode, parent.domNode);
            if (sdp) return sdp;
            // if not found we shift by 1
            nd = nextNode;
        } else {
            // nd is last sibling
            if (parent.kind === "#element") {
                return { position: "lastChild", parentDomNd: parent.domNode };
            }
            // nd is a fragment (or variant)
            nd = parent;
        }
    }

    function findFirstDomNd(c: IvNodes, nd: IvNode, parentDomNd: any): SiblingDomPosition | null {
        if (nd.kind === "#element" || nd.kind === "#text") {
            return { position: "beforeChild", nextDomNd: nd.domNode, parentDomNd: parentDomNd };
        } else if (nd.kind === "#fragment" || nd.kind === "#component") {
            let ch = (nd as IvParentNode).children, len = ch ? ch.length : 0, sdp: SiblingDomPosition | null;
            for (let i = 0; len > i; i++) {
                sdp = findFirstDomNd(c, c[ch![i]] as IvNode, parentDomNd);
                if (sdp) {
                    return sdp;
                }
            }
            // not found
            return null;
        } else {
            throw new Error("TODO findFirstDomNd");
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
            e[staticProperties[j]] = staticProperties[j + 1];
        }
    }
    let nd: IvElement = {
        kind: "#element",
        domNode: e,
        attached: false,
        idx: idx,
        parentIdx: parentIdx,
        ns: "",
        childPos: -1,   // will be determined after first render
        children: undefined,
        expressions: undefined,
        lastRefresh: 0,
        isContainer: false
    }
    connectChild(c, nd, idx);
}

function connectChild(c: IvNodes, child: IvNode, childIdx: number) {
    c[childIdx] = child;
    let p = c[child.parentIdx] as IvParentNode;
    if (!p) return; // will happen on root node as childIdx === parentIdx
    if (!p.children) {
        p.children = [childIdx];
        child.childPos = 0;
    } else {
        let len = p.children.length;
        p.children[len] = childIdx;
        child.childPos = len;
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
        childPos: -1,
        pieces: pieces,
        expressions: undefined,
        lastRefresh: 0,
        isContainer: false
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
    if (value === ζu) return;
    if (instIdx === 0) {
        (c[eltIdx] as IvNode)!.domNode.setAttribute(name, value);
    } else {
        console.log("TODO ζatt")
    }
}

/**
 * Dynamic property update
 */
export function ζprop(c: IvNodes, eltIdx: number, instIdx: number, name: string, value: any) {
    if (value === ζu) return;
    if (instIdx === 0) {
        (c[eltIdx] as IvNode)!.domNode[name] = value;
    } else {
        console.log("TODO ζprop")
    }
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
