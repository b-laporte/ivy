import { XjsEvtListener } from './../xjs/parser/types';
import { loader } from 'webpack';
import { IvTemplate, BlockNodes, IvContext, IvDocument, IvElement, IvNode, IvParentNode, IvText, IvFragment, IvContainer, IvComponent } from './types';
import { Dataset, value } from 'hibe';

export let uidCount = 0; // counter used for unique ids (debug only, can be reset)

function error(msg) {
    // temporary error management
    console.log("[iv error] " + msg);
}

/**
 * Template object created at runtime
 */
class Template implements IvTemplate {
    hasHost = false;
    context: IvContext;
    refreshFn: (ζ: BlockNodes, ζa?: any) => void | undefined;

    constructor() {
        // document is undefined in a node environment
        this.context = createContext(null, true, 0);
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
        if (!this.context.domNode) {
            throw new Error("[iv] Template must be attached to a DOM node before begin refreshed");
        }
        if (this.refreshFn) {
            this.context.lastRefresh++;
            this.refreshFn(this.context.nodes, data);
        }
        return this;
    }
}

function createContext(parentCtxt: IvContext | null, isTemplateRoot: boolean, containerIdx): IvContext {
    let ctxt: IvContext = {
        kind: "#context",
        uid: "ctxt" + (++uidCount),
        cm: true,
        nodes: [],
        isTemplateRoot: isTemplateRoot,
        doc: (typeof document !== "undefined") ? document as any : null as any,
        domNode: undefined,
        lastRefresh: 0,                // count for child contexts
        anchorNode: undefined,
        expressions: undefined,
        oExpressions: undefined,
        parentCtxt: parentCtxt,
        containerIdx: containerIdx
    }
    ctxt.nodes[0] = ctxt;
    if (parentCtxt) {
        ctxt.doc = parentCtxt.doc;
    }
    return ctxt;
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
export function ζt(refreshFn: (ζ: any, ζa?: any) => void, hasHost?: number, argumentClass?): () => IvTemplate {
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
export function ζfrag(c: BlockNodes, idx: number, parentIdx: number, instIdx: number = 0, isPlaceholder: number = 0) {
    if (!instIdx) {
        createFrag(c, idx, parentIdx, instIdx, isPlaceholder);
    } else {
        console.log("TODO frag")
    }
}

function createFrag(c: BlockNodes, idx: number, parentIdx: number, instIdx: number, isContainer: number = 0) {
    let nd: IvFragment | IvContainer;
    if (!isContainer) {
        nd = <IvFragment>{
            kind: "#fragment",
            uid: "frag" + (++uidCount),
            isContainer: false,
            domNode: undefined,
            attached: false,
            idx: idx,
            parentIdx: parentIdx,
            ns: "",
            childPos: -1, // will be determined after first render
            children: undefined,
            lastRefresh: 0
        }
    } else {
        nd = <IvContainer>{
            kind: "#container",
            uid: "cont" + (++uidCount),
            domNode: undefined,
            attached: false,
            idx: idx,
            parentIdx: parentIdx,
            ns: "",
            childPos: -1, // will be determined after first render
            lastRefresh: 0,
            contentBlocks: [],
            blockPool: [],
            contentLength: 0
        }
    }
    connectChild(c, nd, idx);
}

/**
 * Create or Check sub block context
 * @param c parent block context
 * @param idx index in parent - corresponds to a container fragment
 * @param instanceIdx instance index (if the block is run multiple times)
 * @param keyExpr value of the key expression (if any)
 */
// ζcc(ζ1, 1, instanceIdx, 1, key?); (parentNodes, placeholderIndexInParent(or 1 if root), instanceIdx:number, instructionFlag?: 1 if delayed, 0 otherwise)
export function ζcc(c: BlockNodes, idx: number, instanceIdx: number, keyExpr?: any): any {
    // f is a container fragment
    let f = c[idx] as IvContainer, pCtxt = c[0] as IvContext, nodes = f.contentBlocks[instanceIdx - 1];
    if (!nodes) {
        if (f.blockPool.length > 0) {
            nodes = f.contentBlocks[instanceIdx - 1] = f.blockPool.shift()!;
        } else {
            nodes = f.contentBlocks[instanceIdx - 1] = [createContext(pCtxt, false, idx)];
        }
    }
    if (instanceIdx > 1) {
        console.log("TODO: support multiple block instances in container");
    }
    f.lastRefresh = nodes[0].lastRefresh = pCtxt.lastRefresh;
    return nodes;
}

function removeFromDom(c: BlockNodes, nd: IvNode) {
    if (!nd) return;
    if (nd.kind === "#text" || nd.kind === "#element") {
        nd.attached = false;

        let pdn = getParentDomNd(c, nd);
        // console.log("before remove", nd.domNode.$uid);
        if (pdn) {
            pdn.removeChild(nd.domNode);
        }
    } else if (nd.kind === "#container") {
        let container = nd as IvContainer, blocks = container.contentBlocks, len = blocks.length;
        // remove all blocks from dom and put them in blockPool
        for (let i = 0; len > i; i++) {
            removeFromDom(blocks[i], blocks[i][1] as IvNode);
        }
        // move previous nodes to blockPool
        container.contentBlocks = [];
        container.contentLength = 0;
        container.blockPool = container.blockPool.concat(blocks);
    } else if (nd.kind === "#fragment") {
        let f = nd as IvFragment;
        f.attached = false;
        if (f.children) {
            let ch = f.children, len = ch.length;
            for (let i = 0; len > i; i++) {
                removeFromDom(c, c[ch[i]] as IvNode);
            }
        }
        f.domNode = undefined;
    } else {
        console.log("TODO removeFromDom for " + nd.kind)
    }
}

function getParentDomNd(c: BlockNodes, nd: IvNode) {
    if (nd.idx === 1) {
        // nd is a root node
        let ctxt = c[0] as IvContext;
        // check if we are in the root context
        let domNode = ctxt.domNode;
        if (domNode) return domNode;
        // else: we are in a sub-context
        if (ctxt.parentCtxt && ctxt.containerIdx) {
            let nodes = ctxt.parentCtxt.nodes;
            return getParentDomNd(nodes, nodes[ctxt.containerIdx] as IvNode);
        } else {
            // invalid case
            throw new Error("[getParentDomNd] Invalid Context");
        }
    }
    return c[nd.parentIdx].domNode;
}

function appendToDom(c: BlockNodes, nd: IvNode, hostDomNd: any) {
    if (!nd || nd.attached) return;
    let pdn = getParentDomNd(c, nd), domNode = nd.domNode, rCount = (c[0] as IvContext).lastRefresh;
    if (!pdn) return;
    let ctxt = c[0] as IvContext;
    if (pdn === ctxt.domNode && ctxt.anchorNode) {
        // nd is a fragment or a container during first render
        // we cannot append in the host dom node as we have to insert before the anchor node instead
        insertInDomBefore(c, ctxt.domNode, nd, ctxt.anchorNode);
        return
    }
    if (domNode && domNode !== pdn) {
        // console.log("appendChild", domNode.$uid, "to", pdn.$uid);
        pdn.appendChild(domNode);
        nd.attached = true;
        nd.lastRefresh = rCount;
    }

    if (nd.kind === "#fragment") {
        nd.domNode = pdn;
        nd.attached = true;
        nd.lastRefresh = rCount;
        if ((nd as IvFragment).children) {
            let f = nd as IvFragment, ch = f.children!, len = ch.length, chNd: IvNode;
            for (let i = 0; len > i; i++) {
                chNd = c[ch[i]] as IvNode;
                appendToDom(c, chNd, hostDomNd);
                chNd.lastRefresh = rCount;
            }
        }
    } else if (nd.kind === "#container") {
        nd.domNode = pdn;
        nd.attached = true;
        nd.lastRefresh = rCount;
        let container = nd as IvContainer, blocks = container.contentBlocks, len = blocks.length, chNd: IvNode;
        for (let i = 0; len > i; i++) {
            chNd = blocks[i][1] as IvNode;
            appendToDom(blocks[i], chNd, hostDomNd);
            chNd.lastRefresh = rCount;
        }
    }
}

function insertInDomBefore(c: BlockNodes, parentDomNd: any, nd: IvNode, nextDomNd: any) {
    if (!nd) return;
    if (nd.attached || !parentDomNd) return;
    // console.log("insertInDomBefore", nd.uid, "parent", parentDomNd.$uid, "before", nextDomNd.$uid)
    let domNode = nd.domNode, rCount = (c[0] as IvContext).lastRefresh;
    if (domNode && domNode !== parentDomNd) {
        // console.log("-> insert", domNode.$uid, "before", nextDomNd.$uid);
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
                if (chNd) {
                    insertInDomBefore(c, parentDomNd, chNd, nextDomNd);
                    chNd.lastRefresh = rCount;
                } else {
                    console.log("fragment child should not be undefined: ", i)
                }
            }
        }
    } else if (nd.kind === "#container") { // todo: refactor with fragment
        nd.domNode = parentDomNd;
        nd.attached = true;
        nd.lastRefresh = rCount;
        let container = nd as IvContainer, blocks = container.contentBlocks, len = blocks.length, chNd: IvNode;
        for (let i = 0; len > i; i++) {
            chNd = blocks[i][1] as IvNode;
            if (chNd) {
                insertInDomBefore(blocks[i], parentDomNd, chNd, nextDomNd);
                chNd.lastRefresh = rCount;
            } else {
                console.log("container block should not be undefined:", i)
            }
        }
    }
}

/**
 * End of creation mode
 * @param c 
 * @param idx 
 */
export function ζend(c: BlockNodes, containerIndexes?: number[]) {
    if (containerIndexes) {
        let len = containerIndexes.length;
        for (let i = 0; len > i; i += 2) {
            checkContainer(c, containerIndexes[i], containerIndexes[i + 1]);
        }
    }
    let ctxt = c[0] as IvContext;
    if (!ctxt.cm) return;
    ctxt.cm = false;

    let len = c.length, root = c[1] as IvNode, hostDomNd = ctxt.domNode;
    if (!root) return;
    // if root node is fragment, we need to define its domNode first
    if (hostDomNd && (root.kind === "#fragment")) {
        root.domNode = hostDomNd;
        root.attached = true;
        root.lastRefresh = ctxt.lastRefresh;
    }
    // append all child nodes to the root node
    for (let i = 2; len > i; i++) {
        appendToDom(c, c[i] as IvNode, hostDomNd);
    }

    // insert root node for root template
    // sub-root nodes (i.e. in containers) will have already been inserted through checkContainer
    if (ctxt.isTemplateRoot) {
        // root node, attach to parent container
        insertInDomBefore(c, ctxt.domNode, root, ctxt.anchorNode);
    }
}

/**
 * Delete or attach container content
 */
function checkContainer(c: BlockNodes, idx: number, instIdx: number) {
    let container = c[idx] as IvContainer;
    if (!container) return; // happens when block condition has never been true
    let lastRefresh = container.lastRefresh;
    if (lastRefresh !== 0 && lastRefresh !== (c[0] as IvContext).lastRefresh) {
        removeFromDom(c, container as IvNode);
    } else {
        let blocks = container.contentBlocks, nbrOfBlocks = blocks.length;

        if (container.contentLength < nbrOfBlocks && lastRefresh > 1) {
            // on first refresh (i.e. lastRefresh === 1) this code should not be run as nodes will be added in the end() method

            let { position, nextDomNd, parentDomNd } = findNextSiblingDomNd(c, container as IvNode), nodes: BlockNodes;
            if (parentDomNd) {
                // insert sub root nodes as other nodes have been attached in block end()
                if (position === "beforeChild") {
                    for (let i = container.contentLength; nbrOfBlocks > i; i++) {
                        nodes = blocks[i];
                        insertInDomBefore(nodes, parentDomNd, nodes[1] as IvNode, nextDomNd);
                    }
                } else if (position === "lastChild") {
                    for (let i = container.contentLength; nbrOfBlocks > i; i++) {
                        nodes = blocks[i];
                        appendToDom(nodes, nodes[1] as IvNode, parentDomNd);
                    }
                } else if (position === "lastOnRoot") {
                    let ctxt = c[0] as IvContext;
                    for (let i = container.contentLength; nbrOfBlocks > i; i++) {
                        nodes = blocks[i];
                        insertInDomBefore(nodes, ctxt.domNode, nodes[1] as IvNode, ctxt.anchorNode);
                    }
                }
            }
        }
        container.contentLength = nbrOfBlocks;
    }
}

interface SiblingDomPosition {
    position: "lastChild" | "beforeChild" | "lastOnRoot";
    nextDomNd?: any;
    parentDomNd: any;
}

function findNextSiblingDomNd(c: BlockNodes, node: IvNode): SiblingDomPosition {
    let nd = node, pos: number, parent: IvParentNode, pdn: any;
    while (true) {
        parent = c[nd.parentIdx] as IvParentNode;
        pos = nd.childPos;
        pdn = getParentDomNd(c, node);

        if (nd.idx === 1) {
            return { position: "lastOnRoot", parentDomNd: pdn }; // root node has no sibling
        }

        if (pos !== parent.children!.length - 1) {
            let nextNode = c[parent.children![pos + 1]] as IvNode,
                sdp = findFirstDomNd(c, nextNode, pdn);
            if (sdp) return sdp;
            // if not found we shift by 1
            nd = nextNode;
        } else {
            // nd is last sibling
            if (parent.kind === "#element") {
                return { position: "lastChild", parentDomNd: pdn };
            }
            // nd is a fragment (or variant)
            nd = parent;
        }
    }

    function findFirstDomNd(c: BlockNodes, nd: IvNode, parentDomNd: any): SiblingDomPosition | null {
        if (!nd) return null;
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
        } else if (nd.kind === "#container") {
            let container = nd as IvContainer, blocks = container.contentBlocks, len = blocks.length, sdp: SiblingDomPosition | null;
            for (let i = 0; len > i; i++) {
                sdp = findFirstDomNd(blocks[i], blocks[i][1] as IvNode, parentDomNd);
                if (sdp) {
                    return sdp;
                }
            }
            // not found
            return null;
        } else {
            throw new Error("TODO findFirstDomNd: " + nd.kind);
        }
    }
}

/**
 * Element node creation
 */
export function ζelt(c: BlockNodes, idx: number, parentIdx: number, instIdx: number, name: string, staticAttributes?: any[], staticProperties?: any[]) {
    if (instIdx === 0) {
        createElt(c, idx, parentIdx, instIdx, name, staticAttributes, staticProperties);
    } else {
        console.log("TODO elt")
    }
}

function createElt(c: BlockNodes, idx: number, parentIdx: number, instIdx: number, name: string, staticAttributes?: any[], staticProperties?: any[]) {
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
        uid: "elem" + (++uidCount),
        domNode: e,
        attached: false,
        idx: idx,
        parentIdx: parentIdx,
        ns: "",
        childPos: -1,   // will be determined after first render
        children: undefined,
        lastRefresh: 0
    }
    connectChild(c, nd, idx);
}

function connectChild(c: BlockNodes, child: IvNode, childIdx: number) {
    c[childIdx] = child;
    if (child.parentIdx === childIdx) return; // root node
    let p = c[child.parentIdx] as IvParentNode;
    if (!p) return;
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
export function ζtxt(c: BlockNodes, idx: number, parentIdx: number, instIdx: number, statics: string | string[]) {
    if (instIdx === 0) {
        createTxt(c, idx, parentIdx, instIdx, statics);
    } else {
        console.log("TODO ζtxt")
    }
}

function createTxt(c: BlockNodes, idx: number, parentIdx: number, instIdx: number, statics: string | string[]) {
    let dnd = undefined, pieces: string[] | undefined = undefined;
    if (typeof (statics) === 'string') {
        dnd = (c[0] as IvContext).doc.createTextNode(statics);
    } else {
        pieces = statics.slice(0); // clone
    }

    let nd: IvText = {
        kind: "#text",
        uid: "text" + (++uidCount),
        domNode: dnd,
        attached: false,
        idx: idx,
        parentIdx: parentIdx,
        childPos: -1,
        pieces: pieces,
        lastRefresh: 0
    }
    connectChild(c, nd, idx);
}

/**
 * Dynamic text values update
 */
export function ζtxtval(c: BlockNodes, idx: number, instFlag: number, nbrOfValues: number, ...values: any[]) {
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
    if (instFlag === 0) {
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
 * @param c the node array corresponding to the block context
 * @param idx the expression index in the context expressions list
 * @param value the new expression value
 */
export function ζe(c: BlockNodes, idx: number, value: any, blockIdx?: number) {
    let ctxt = c[0] as IvContext;
    if (!ctxt.expressions) {
        // first time, expression is considered changed
        ctxt.expressions = [];
        ctxt.expressions[idx] = value;
    } else {
        let exp = ctxt.expressions;
        if (exp[idx] === value) return ζu;
        exp[idx] = value;
    }
    return value;
}

/**
 * One-time expression flag. Returns true the first time it is called, and false afterwards
 * @param c the node array corresponding to the block context
 * @param idx the one-time expression index
 */
export function ζo(c: BlockNodes, idx: number): boolean {
    let ctxt = c[0] as IvContext, flags = ctxt.oExpressions;
    if (!flags) {
        flags = ctxt.oExpressions = [];
    }
    if (!flags[idx]) {
        flags[idx] = 1;
        return true;
    }
    return false;
}

/**
 * Dynamic attribute update
 */
export function ζatt(c: BlockNodes, eltIdx: number, instIdx: number, name: string, value: any) {
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
export function ζprop(c: BlockNodes, eltIdx: number, instIdx: number, name: string, value: any) {
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
export function ζparam(c: BlockNodes, nodeIdx: number, instIdx: number, name: string, value: any) {

}

/**
 * Set index/key for container fragments used in js blocks
 */
export function ζkey(c: BlockNodes, fragmentIdx: number, colIndex: number, key?: any) {

}

/**
 * Dynamic component creation / update
 */
export function ζcpt(c: BlockNodes, fragIdx: number, instIdx: number, refExpr, contentIdx?: number, hasParamNodes?: number, staticParams?: any[]) {
    // contentIdx = 0 if no content
}

/**
 * Call a component or a decorator once all params & content are set
 */
export function ζcall(c: BlockNodes, idx: number, instIdx: number) {

}

/**
 * Param node
 */
export function ζpnode(c: BlockNodes, idx: number, parentIdx: number, instIdx: number, refExpr, staticParams?: any[]) {

}

/**
 * Dynamic decorator creation / update
 */
export function ζdeco(c: BlockNodes, idx: number, parentIdx: number, instIdx: number, refExpr, contentIdx?: number, hasParamNodes?: number, staticParams?: any[]) {

}

/**
 * Asynchronous block definition
 */
export function ζasync(c: BlockNodes, priority: number, fn: () => any) {

}

/**
 * Define and event listener node
 * e.g. ζlsnr(ζ, 2, 1, "click");
 */
export function ζhandler(c: BlockNodes, idx: number, parentIdx: number, instIdx: number, eventName: string) {

}

/**
 * Update an event handler function
 * e.g. ζevt(ζ, 2, 0, function (e) { doSomething(e.name); });
 */
export function ζlistener(c: BlockNodes, idx: number, instIdx: number, handler: Function) {

}
