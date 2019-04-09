import { XjsEvtListener } from './../xjs/parser/types';
import { IvTemplate, BlockNodes, IvContext, IvDocument, IvElement, IvNode, IvParentNode, IvText, IvFragment, IvContainer, IvComponent, IvExpressionData } from './types';
// import { Data, value, isMutating, commitMutations, latestVersion } from 'hibe';

export let uidCount = 0; // counter used for unique ids (debug only, can be reset)

function error(msg) {
    // temporary error management
    console.log("[iv error] " + msg);
}

/**
 * Template object created at runtime
 */
export class Template implements IvTemplate {
    context: IvContext;
    refreshArg: any = undefined;
    forceRefresh = false;

    constructor(public refreshFn: (ζ: BlockNodes, ζa?: any) => void | undefined, public argumentClass?: () => void, public hasHost = false) {
        // document is undefined in a node environment
        this.context = createContext(null, true, 0);
    }

    get document() {
        return this.context.doc;
    }

    set document(d: IvDocument) {
        this.context.doc = d;
    }

    get params(): any | undefined {
        if (!this.refreshArg && this.argumentClass) {
            this.refreshArg = new this.argumentClass();
        }
        return this.refreshArg;
    }

    setParentCtxt(parentCtxt: IvContext, containerIdx: number) {
        let ctxt = this.context;
        ctxt.parentCtxt = parentCtxt;
        ctxt.doc = parentCtxt.doc;
        ctxt.containerIdx = containerIdx;
        ctxt.rootDomNode = parentCtxt.rootDomNode;
    }

    attach(element: any) {
        if (!this.context.rootDomNode) {
            let ctxt = this.context;
            if (!ctxt.doc) throw new Error("[iv] Template.document must be defined before calling Template.attach()");
            ctxt.rootDomNode = element;
            ctxt.anchorNode = ctxt.doc.createComment("template anchor"); // used as anchor in the parent domNode
            element.appendChild(ctxt.anchorNode);
        } else {
            error("template host cannot be changed yet"); // todo
        }
        return this;
    }

    refresh(data?: any) {
        let p = this.params;
        if (p && data) {
            // inject data into params
            for (let k in data) if (data.hasOwnProperty(k)) {
                p[k] = data[k];
            }
        }
        let bypassRefresh = !this.forceRefresh, nodes = this.context.nodes;
        if (!nodes[1] || !(nodes[1] as IvNode).attached) {
            bypassRefresh = false; // internal blocks may have to be recreated if root is not attached
        }
        if (p && bypassRefresh && p["$kind"] === PARAM && p["$changed"] === true) {
            bypassRefresh = false;
        }
        // hibe
        // if (p && (!bypassRefresh || isMutating(p))) {
        //     commitMutations();
        //     p = this.refreshArg = latestVersion(p);
        //     bypassRefresh = false;
        // }
        if (!bypassRefresh) {
            // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> REFRESH", this.context.nodes[0].uid)
            this.context.lastRefresh++;
            if (p && p["$kind"] === PARAM) {
                p["$reset"]();
            }
            this.refreshFn(this.context.nodes, p);
            this.forceRefresh = false;
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
        rootDomNode: undefined,
        lastRefresh: 0,                // count for child contexts
        anchorNode: undefined,
        expressions: undefined,
        oExpressions: undefined,
        parentCtxt: parentCtxt,
        containerIdx: 0,
        initialized: false
    }
    ctxt.nodes[0] = ctxt;
    if (parentCtxt) {
        ctxt.rootDomNode = parentCtxt.rootDomNode;
        ctxt.doc = parentCtxt.doc;
        ctxt.containerIdx = containerIdx;
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
        return new Template(() => { })
    }
};

/**
 * Template runtime factory
 * cf. sample code generation in generator.spec
 * @param refreshFn 
 */
export function ζt(refreshFn: (ζ: any, ζa?: any) => void, hasHost?: number, argumentClass?): () => IvTemplate {
    return function () {
        return new Template(refreshFn, argumentClass || undefined, hasHost === 1);
    }
}

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
export function ζfrag(c: BlockNodes, idx: number, parentIdx: number, instHolderIdx: number = 0, isPlaceholder: number = 0) {
    if (!instHolderIdx || isPlaceholder) {
        // we must create the fragment if isPlaceholder as it will hold the sub-block nodes used in the sub-instructions
        createFrag(c, idx, parentIdx, isPlaceholder, instHolderIdx === 0);
        if (instHolderIdx) {
            addInstruction(true, c, idx, instHolderIdx, connectChild, [c, c[idx], idx, true]);
        }
    } else {
        addInstruction(true, c, idx, instHolderIdx, createFrag, [c, idx, parentIdx, isPlaceholder, true]);
    }
}

function createFrag(c: BlockNodes, idx: number, parentIdx: number, isContainer: number = 0, setChildPosition = true) {
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
            lastRefresh: 0,
            instructions: undefined,
            contentData: undefined,
            exprData: undefined,
            contentRoot: undefined
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
            contentLength: 0,
            cptTemplate: undefined,
            cptParams: undefined,
            cptContent: undefined,
            children: undefined,
            instructions: undefined,
            contentData: undefined,
            exprData: undefined
        }
    }
    connectChild(c, nd, idx, setChildPosition);
}

/**
 * Create or Check sub block context
 * @param c parent block context
 * @param idx index in parent - corresponds to a container fragment
 * @param instanceIdx instance index (if the block is run multiple times)
 * @param instHolderIdx index of the instruction holder (if any)
 * @param keyExpr value of the key expression (if any)
 */
export function ζcc(c: BlockNodes, idx: number, instanceIdx: number, keyExpr?: any): any {
    // f is a container fragment
    let f = c[idx] as IvContainer, pCtxt = c[0] as IvContext, nodes = f.contentBlocks[instanceIdx - 1];
    if (instanceIdx === 1 && f.contentBlocks.length > 1) {
        // previous content blocks are moved to the block pool to be re-used if necessary
        f.contentBlocks.shift();
        if (f.blockPool.length) {
            f.blockPool = f.contentBlocks.concat(f.blockPool);
        } else {
            f.blockPool = f.contentBlocks;
        }
        f.contentBlocks = [nodes];
    } else if (!nodes) {
        if (f.blockPool.length > 0) {
            nodes = f.contentBlocks[instanceIdx - 1] = f.blockPool.shift()!;
        } else {
            let ctxt = createContext(pCtxt, false, idx);
            nodes = f.contentBlocks[instanceIdx - 1] = ctxt.nodes;
        }
    }
    f.lastRefresh = nodes[0].lastRefresh = pCtxt.lastRefresh;
    return nodes;
}

function removeFromDom(c: BlockNodes, nd: IvNode) {
    if (!nd || !nd.attached) return;
    // console.log("removeFromDom", nd.uid);
    if (nd.kind === "#text" || nd.kind === "#element") {
        let pdn = getParentDomNd(c, nd);
        nd.attached = false;
        if (pdn) {
            // console.log(nd.uid, nd.attached, nd.domNode.$uid, "in=", pdn ? pdn.$uid : "XX")
            pdn.removeChild(nd.domNode);
        }
    } else if (nd.kind === "#container") {
        let container = nd as IvContainer, tpl = container.cptTemplate as Template;
        if (tpl) {
            let nodes = tpl.context.nodes, root = nodes[1] as IvNode;
            removeFromDom(nodes, root);
            root.attached = false;
        } else {
            let blocks = container.contentBlocks, len = blocks.length, root: IvNode;
            // remove all blocks from dom and put them in blockPool
            for (let i = 0; len > i; i++) {
                root = blocks[i][1] as IvNode;
                removeFromDom(blocks[i], root);
                root.attached = false;
            }
            // move previous nodes to blockPool
            container.contentBlocks = [];
            container.contentLength = 0;
            container.blockPool = blocks.concat(container.blockPool);
        }
        // note: we have to keep container attached
    } else if (nd.kind === "#fragment") {
        let f = nd as IvFragment;
        f.attached = false;
        if (f.contentRoot) {
            let content = f.contentRoot!, cd = content.contentData!;
            removeFromDom(cd.rootNodes, content);
        } else if (f.children) {
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
    // console.log("getParentDomNd", c[0].uid, nd.uid, nd.idx, nd.contentData !== undefined)
    if (nd.contentData) {
        // this node is a light-dom root node
        if (!nd.attached) return null;
        let cd = nd.contentData, parent = cd.contentHost;
        if (parent && parent.domNode !== nd.domNode) {
            return parent.domNode;
        } else {
            return getParentDomNd(cd.contentHostNodes!, parent!);
        }
    }
    if (nd.idx === 1) {
        // nd is a root node
        let ctxt = c[0] as IvContext;
        if (ctxt.parentCtxt) {
            let pNodes = ctxt.parentCtxt.nodes;
            if (!pNodes[ctxt.containerIdx]) return null;
            return getParentDomNd(pNodes, pNodes[ctxt.containerIdx] as IvNode);
        } else {
            return ctxt.rootDomNode;
        }
    }
    return (c[nd.parentIdx] as IvNode).domNode;
}

function getRootContext(ctxt: IvContext) {
    return ctxt.parentCtxt ? getRootContext(ctxt.parentCtxt) : ctxt;
}

function appendToDom(c: BlockNodes, nd: IvNode, projectRoot = false) {
    //console.log("appendToDom ", nd.uid, "in", c[0].uid)
    if (!nd || nd.attached || (!projectRoot && nd.contentData)) return;
    runInstructions(nd);

    let pdn = getParentDomNd(c, nd), domNode = nd.domNode, rCount = (c[0] as IvContext).lastRefresh;
    if (nd.contentData) {
        let cd = nd.contentData;
        pdn = getParentDomNd(cd.contentHostNodes!, cd.contentHost!)
    }
    if (!pdn) return;
    let ctxt = c[0] as IvContext;
    if (pdn === ctxt.rootDomNode) {
        let rc = getRootContext(ctxt);
        // nd is a fragment or a container during first render
        // we cannot append in the host dom node as we have to insert before the anchor node instead
        insertInDomBefore(c, rc.rootDomNode, nd, rc.anchorNode, projectRoot);
        return
    }
    if (domNode && domNode !== pdn) {
        // console.log("A appendChild", domNode.$uid, "to", pdn.$uid);
        pdn.appendChild(domNode);
        nd.attached = true;
        nd.lastRefresh = rCount;
    }

    if (nd.kind === "#element") {
        projectHostContent(c, nd as IvParentNode);
    } else if (nd.kind === "#fragment") {
        nd.domNode = pdn;
        nd.attached = true;
        nd.lastRefresh = rCount;
        if ((nd as IvFragment).children) {
            let f = nd as IvFragment, ch = f.children!, len = ch.length, chNd: IvNode;
            for (let i = 0; len > i; i++) {
                chNd = c[ch[i]] as IvNode;
                appendToDom(c, chNd);
                chNd.lastRefresh = rCount;
            }
        } else {
            projectHostContent(c, nd as IvParentNode);
        }
    } else if (nd.kind === "#container") {
        nd.domNode = pdn;
        nd.attached = true;
        nd.lastRefresh = rCount;
        let container = nd as IvContainer, tpl = container.cptTemplate as Template;
        if (tpl) {
            // attach root node of the sub-template
            let nodes = tpl.context.nodes, root = nodes[1] as IvNode;
            appendToDom(nodes, root);
            root.lastRefresh = rCount;
        } else {
            let blocks = container.contentBlocks, len = blocks.length, chNd: IvNode;
            for (let i = 0; len > i; i++) {
                chNd = blocks[i][1] as IvNode;
                appendToDom(blocks[i], chNd);
                chNd.lastRefresh = rCount;
            }
        }
    }
}

function projectHostContent(c: BlockNodes, host: IvParentNode) {
    if (host.contentRoot) {
        let content = host.contentRoot!;
        if (!content.attached) {
            let cd = content.contentData!;
            cd.contentHost = host;
            cd.contentHostNodes = c;

            // content is the node that will be projected
            // host is the host node: <div @content/> or <! @content/>
            if (content.kind === "#element" || content.kind === "#text") {
                if (host.kind === "#element") {
                    // console.log("B appendChild", content.domNode.$uid, "to", host.domNode.$uid);
                    host.domNode.appendChild(content.domNode)
                } else if (host.kind === "#fragment") {
                    appendToDom(cd.rootNodes, content, true);
                }
                content.attached = true;
            } else if (content.kind === "#fragment") {
                let f = content as IvFragment, ch = f.children!, len = ch.length, chNd: IvNode, rootNodes = cd.rootNodes!, rCount = (c[0] as IvContext).lastRefresh;
                f.domNode = host.domNode;
                content.attached = true;
                for (let i = 0; len > i; i++) {
                    chNd = rootNodes[ch[i]] as IvNode;
                    appendToDom(rootNodes, chNd);
                    chNd.lastRefresh = rCount;
                }
            } else {
                console.log("TODO: unsupported content kind: ", content.kind, "in", host.uid)
            }
        }
    }
}

function insertInDomBefore(c: BlockNodes, parentDomNd: any, nd: IvNode, nextDomNd: any, projectRoot = false) {
    // if (nd) console.log("insertInDomBefore - test", nd.uid, nd.attached, !parentDomNd, (!projectRoot && nd.contentData))
    if (!nd || (nd.kind !== "#container" && nd.attached) || !parentDomNd || (!projectRoot && nd.contentData)) return;
    // console.log("insertInDomBefore", nd.uid, "parent", parentDomNd.$uid, "before", nextDomNd.$uid)
    runInstructions(nd);

    let domNode = nd.domNode, rCount = (c[0] as IvContext).lastRefresh;
    if (domNode && domNode !== parentDomNd) {
        // console.log("-> insert", domNode.$uid, "before", nextDomNd.$uid);
        parentDomNd.insertBefore(domNode, nextDomNd);
        nd.attached = true;
        nd.lastRefresh = rCount;
    }

    // add children / or project content
    if (nd.kind === "#element") {
        projectHostContent(c, nd as IvParentNode);
    } else if (nd.kind === "#fragment") {
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
        } else {
            projectHostContent(c, nd as IvParentNode);
        }
    } else if (nd.kind === "#container") {
        nd.domNode = parentDomNd;
        nd.attached = true;
        nd.lastRefresh = rCount;
        let container = nd as IvContainer, tpl = container.cptTemplate as Template;
        if (tpl) {
            let nodes = tpl.context.nodes, root = nodes[1] as IvNode;
            insertInDomBefore(nodes, parentDomNd, root, nextDomNd);
        } else {
            let blocks = container.contentBlocks, len = blocks.length, chNd: IvNode;
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
}

/**
 * End of creation mode
 * @param c 
 * @param idx 
 */

export function ζend(c: BlockNodes, instHolderIdx: number, containerIndexes?: number[]) {
    // close the creation mode to avoid running it multiple times
    (c[0] as IvContext).cm = false;
    if (!instHolderIdx) {
        endBlock(c, containerIndexes);
    } else {
        addInstruction(false, c, 0, 1, endBlock, [c, containerIndexes]);
    }
}

export function endBlock(c: BlockNodes, containerIndexes?: number[]) {
    if (containerIndexes) {
        let len = containerIndexes.length;
        for (let i = 0; len > i; i += 2) {
            checkContainer(c, containerIndexes[i]); // containerIndexes[i + 1] is instruction holder
        }
    }
    let ctxt = c[0] as IvContext;
    if (ctxt.initialized) return;
    ctxt.initialized = true;

    let len = c.length, root = c[1] as IvNode, hostDomNd = ctxt.parentCtxt ? null : ctxt.rootDomNode;
    if (!root || (ctxt.isTemplateRoot && root.contentData)) return;

    // if root node is fragment, we need to define its domNode first
    if (hostDomNd && (root.kind === "#fragment")) {
        root.domNode = hostDomNd;
        root.attached = true;
        root.lastRefresh = ctxt.lastRefresh;
    }
    // append all child nodes to the root node
    for (let i = 2; len > i; i++) {
        appendToDom(c, c[i] as IvNode);
    }

    // insert root node for root template
    // sub-root nodes (i.e. in containers) will have already been inserted through checkContainer
    if (!ctxt.parentCtxt) {
        // root node, attach to parent container
        insertInDomBefore(c, ctxt.rootDomNode, root, ctxt.anchorNode);
    }
}

/**
 * Delete or attach container content
 */
function checkContainer(c: BlockNodes, idx: number) {
    let container = c[idx] as IvContainer;
    if (!container) return; // happens when block condition has never been true
    let lastRefresh = container.lastRefresh;
    // console.log("checkContainer", c[0].uid, idx, "lastRefresh:", lastRefresh)
    if (lastRefresh !== 0 && lastRefresh !== (c[0] as IvContext).lastRefresh) {
        // remove all nodes from DOM
        removeFromDom(c, container as IvNode);
    } else {
        let tpl = container.cptTemplate as Template;
        if (tpl) {
            console.log("Todo: checkContainer / runInstructions for sub-templates")
        } else {
            let blocks = container.contentBlocks, nbrOfBlocks = blocks.length, nodes: BlockNodes;
            if (lastRefresh > 1) {
                // on first refresh (i.e. lastRefresh === 1) this code should not be run as nodes will be added in the end method
                if (container.contentLength < nbrOfBlocks) {
                    // append new nodes
                    let { position, nextDomNd, parentDomNd } = findNextSiblingDomNd(c, container as IvNode);
                    // console.log(">> A next sibling result for", container.uid, "in", c[0].uid, "position=", position, "nextDomNd=", nextDomNd ? nextDomNd.$uid : "XX", "parentDomNd=", parentDomNd ? parentDomNd.$uid : "XX")
                    if (parentDomNd) {
                        // insert sub root nodes as other nodes have been attached in block end
                        if (position === "beforeChild") {
                            for (let i = container.contentLength; nbrOfBlocks > i; i++) {
                                nodes = blocks[i];
                                insertInDomBefore(nodes, parentDomNd, nodes[1] as IvNode, nextDomNd);
                            }
                        } else if (position === "lastChild") {
                            for (let i = container.contentLength; nbrOfBlocks > i; i++) {
                                nodes = blocks[i];
                                appendToDom(nodes, nodes[1] as IvNode);
                            }
                        } else if (position === "lastOnRoot") {
                            for (let i = container.contentLength; nbrOfBlocks > i; i++) {
                                nodes = blocks[i];
                                insertInDomBefore(nodes, parentDomNd, nodes[1] as IvNode, nextDomNd);
                            }
                        }
                    }
                } else if (nbrOfBlocks < container.contentLength) {
                    // disconnect the nodes that are still attached in the pool
                    let pool = container.blockPool, len = pool.length, nodes: BlockNodes;
                    for (let i = 0; len > i; i++) {
                        nodes = pool[i];
                        removeFromDom(nodes, nodes[1] as IvNode)
                    }
                }
            }
            container.contentLength = nbrOfBlocks;
            for (let i = 0; nbrOfBlocks > i; i++) {
                nodes = blocks[i];
                runInstructions(nodes[1] as IvNode);
            }
        }
    }
}

interface SiblingDomPosition {
    position: "lastChild" | "beforeChild" | "lastOnRoot" | "defer";
    nextDomNd?: any;
    parentDomNd: any;
}

function findNextSiblingDomNd(c: BlockNodes, node: IvNode): SiblingDomPosition {
    // console.log("findNextSiblingDomNd, c:", c[0].uid, "node", node.uid, node.idx)
    let nd = node, pos: number, parent: IvParentNode, pdn: any;
    while (true) {
        if (nd.contentData) {
            // nd is the root of a light-dom projection
            let cd = nd.contentData, host = cd.contentHost;
            // console.log("> has content data, host:", host ? host.uid : "XX")
            if (host) {
                if (host.kind === "#element") {
                    return { position: "lastChild", parentDomNd: host.domNode };
                } else {
                    return findNextSiblingDomNd(cd.contentHostNodes!, host);
                }
            } else {
                return { position: "defer", parentDomNd: undefined };
            }
        }
        parent = c[nd.parentIdx] as IvParentNode;
        pos = nd.childPos;
        pdn = getParentDomNd(c, nd);
        // console.log("-> getParentDomNd", c[0].uid, nd.uid, "result", pdn ? pdn.$uid : "XX")

        if (nd.idx === 1) {
            // console.log("> is root - is attached:", nd.attached)
            if (!nd.attached) {
                return { position: "defer", parentDomNd: undefined };
            }

            // root node has no sibling
            let ctxt = c[0] as IvContext, pCtxt = ctxt.parentCtxt;
            if (!pCtxt) {
                return { position: "lastOnRoot", parentDomNd: pdn, nextDomNd: ctxt.anchorNode };
            } else {
                let nodes = pCtxt.nodes;
                return findNextSiblingDomNd(nodes, nodes[ctxt.containerIdx] as IvNode)
            }
        }

        // find next node that is attached
        if (pos !== parent.children!.length - 1) {
            // console.log("> is not last")
            let nextNode = c[parent.children![pos + 1]] as IvNode,
                sdp = findFirstDomNd(c, nextNode, pdn);
            if (sdp) return sdp;
            // if not found (e.g. node not attached) we shift by 1
            nd = nextNode;
        } else {
            // console.log("> is last")
            // nd is last sibling
            if (parent.kind === "#element") {
                return { position: "lastChild", parentDomNd: pdn };
            }
            // parent is a fragment (or variant)
            return findNextSiblingDomNd(c, parent);
        }
    }

    function findFirstDomNd(c: BlockNodes, nd: IvNode, parentDomNd: any): SiblingDomPosition | null {
        if (!nd || !nd.attached) return null;
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
            let container = nd as IvContainer, tpl = container.cptTemplate as Template, sdp: SiblingDomPosition | null = null;
            if (tpl) {
                let nodes = tpl.context.nodes;
                sdp = findFirstDomNd(nodes, nodes[1] as IvNode, parentDomNd);
            } else {
                let blocks = container.contentBlocks, len = blocks.length;
                for (let i = 0; len > i; i++) {
                    sdp = findFirstDomNd(blocks[i], blocks[i][1] as IvNode, parentDomNd);
                }
            }
            // not found
            return sdp ? sdp : null;
        } else {
            throw new Error("TODO findFirstDomNd: " + nd.kind); // e.g. #decorator
        }
    }
}

function addInstruction(creation: boolean, c: BlockNodes, targetIdx: number, instHolderIdx: number, func: Function, args: any[]) {
    // console.log("addInstruction - creation=", creation, "ctxt=", c[0].uid, "targetIdx=", targetIdx, "instHolderIdx=", instHolderIdx);
    if (targetIdx === instHolderIdx && !c[instHolderIdx]) {
        // this node is a content root node that has to be created but that will be considered as deferred
        func.apply(null, args);
        if (targetIdx < 2) {
            // targetIdx = 0: container (cf. ζend)
            // targetIdx = 1: root node
            // this is the root of a block
        } else {
            // this is the light-dom root: instruction cannot be deferred
            let contentRoot = c[targetIdx] as IvNode;
            if (targetIdx !== 1 && !contentRoot.contentData) {
                contentRoot.contentData = {
                    contentHost: undefined,
                    contentHostNodes: undefined,
                    rootNodes: c
                }
            }
            let parent = c[contentRoot.parentIdx] as IvContainer;
            parent.cptContent = contentRoot;
        }
    } else {
        if (!c[instHolderIdx]) console.log("NO HOLDER!", c[0].uid, instHolderIdx)
        let nd = c[instHolderIdx] as IvNode, instructions = nd.instructions;
        if (!instructions) {
            instructions = nd.instructions = [creation, func, args];
        } else {
            instructions.push(creation); // true if the instruction corresponds to a creation (false = update)
            instructions.push(func);
            instructions.push(args);
        }
    }
}

function runInstructions(nd: IvNode) {
    // console.log("runInstructions", nd.uid, "hasInstructions=", nd.instructions !== undefined)
    if (nd.instructions) {
        let instr = nd.instructions, len = instr.length;
        for (let i = 0; len > i; i += 3) {
            instr[i + 1].apply(null, instr[i + 2]);
        }
        nd.instructions = undefined;
    }
}

function removeUpdateInstructions(nd: IvNode) {
    if (nd && nd.instructions) {
        let instr = nd.instructions, len = instr.length, hasUpdates = false;
        for (let i = 0; len > i; i += 3) {
            if (!instr[i]) {
                hasUpdates = true;
                break;
            }
        }
        if (hasUpdates) {
            let newInstructions: any[] = [];
            for (let i = 0; len > i; i += 3) {
                if (instr[i]) {
                    newInstructions.push(true);
                    newInstructions.push(instr[i + 1]);
                    newInstructions.push(instr[i + 2]);
                }
            }
            nd.instructions = newInstructions;
        }
    }
}

/**
 * Element node creation
 */
export function ζelt(c: BlockNodes, idx: number, parentIdx: number, instHolderIdx: number, name: string, staticAttributes?: any[], staticProperties?: any[]) {
    if (instHolderIdx === 0) {
        createElt(c, idx, parentIdx, instHolderIdx, name, staticAttributes, staticProperties);
    } else {
        addInstruction(true, c, idx, instHolderIdx, createElt, [c, idx, parentIdx, instHolderIdx, name, staticAttributes, staticProperties]);
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
        lastRefresh: 0,
        instructions: undefined,
        contentData: undefined,
        contentRoot: undefined,
        exprData: undefined
    }
    connectChild(c, nd, idx);
}

function connectChild(c: BlockNodes, child: IvNode, childIdx: number, setChildPosition = true) {
    c[childIdx] = child;
    if (child.parentIdx === childIdx) return; // root node
    if (!setChildPosition) return
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
export function ζtxt(c: BlockNodes, idx: number, parentIdx: number, instHolderIdx: number, statics: string | string[]) {
    if (instHolderIdx === 0) {
        createTxt(c, idx, parentIdx, statics);
    } else {
        addInstruction(true, c, idx, instHolderIdx, createTxt, [c, idx, parentIdx, statics]);
    }
}

function createTxt(c: BlockNodes, idx: number, parentIdx: number, statics: string | string[]) {
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
        lastRefresh: 0,
        instructions: undefined,
        contentData: undefined,
        exprData: undefined
    }
    connectChild(c, nd, idx);
}

/**
 * Dynamic text values update
 */
export function ζtxtval(c: BlockNodes, idx: number, instHolderIdx: number, statics: string[], nbrOfValues: number, ...values: any[]) {
    if (instHolderIdx === 0) {
        // console.log("IMMEDIATE updateText idx=", idx, "instHolderIdx=", instHolderIdx)
        updateText(c, idx, instHolderIdx, nbrOfValues, values);
    } else {
        // console.log("DEFER updateText in=", c[0].uid, " idx=", idx, "instHolderIdx=", instHolderIdx, "values=", values.join("*"))
        addInstruction(false, c, idx, instHolderIdx, updateText, [c, idx, instHolderIdx, nbrOfValues, values]);
    }
}

function updateText(c: BlockNodes, idx: number, instHolderIdx: number, nbrOfValues: number, values: any[]) {
    let nd = c[idx] as IvText, changed = false, v: any, pieces: string[] | undefined = undefined;
    if (nd === undefined) {
        console.log("nd undefined - context:", c[0].uid, "text node:", idx, "inst holder:", instHolderIdx)
    }
    for (let i = 0; nbrOfValues > i; i++) {
        v = getExprValue(c, instHolderIdx, values[i]);
        if (v !== ζu) {
            changed = true;
            if (!pieces) {
                pieces = nd.pieces;
            }
            pieces![1 + i * 2] = v || "";
        }
    }
    if (!changed) return;
    nd.pieces = pieces;
    // console.log("updateText in", c[0].uid, "idx=", idx, "value=" + pieces!.join(""), "first=", nd.domNode === undefined)
    if (!nd.domNode) {
        nd.domNode = (c[0] as IvContext).doc.createTextNode(pieces!.join(""));
        let lastRefresh = c[0].lastRefresh;
        if (lastRefresh > 1) {
            // console.log("create text node (updateText):", nd.domNode.$uid, "lastRefresh=", lastRefresh)
            // on first refresh (i.e. lastRefresh === 1) this code should not be run as nodes will be added in the end method

            // append new nodes
            let { position, nextDomNd, parentDomNd } = findNextSiblingDomNd(c, nd as IvNode), nodes: BlockNodes;
            // console.log(">> B next sibling result for", nd.uid, "in", c[0].uid, "position=", position, "nextDomNd=", nextDomNd ? nextDomNd.$uid : "XX", "parentDomNd=", parentDomNd ? parentDomNd.$uid : "XX")
            if (parentDomNd) {
                if (position === "beforeChild") {
                    insertInDomBefore(c, parentDomNd, nd, nextDomNd);
                } else if (position === "lastChild") {
                    appendToDom(c, nd);
                } else if (position === "lastOnRoot") {
                    insertInDomBefore(c, parentDomNd, nd, nextDomNd);
                }
            }
        }
    } else {
        nd.domNode.textContent = pieces!.join("");
    }
}

/**
 * Expression diffing
 * @param c the node array corresponding to the block context
 * @param idx the expression index in the context expressions list
 * @param value the new expression value
 */
export function ζe(c: BlockNodes, idx: number, value: any, instHolderIdx?: number) {
    let exprData: IvExpressionData;
    if (instHolderIdx) {
        let nd = c[instHolderIdx] as IvNode;
        if (!nd.exprData) {
            exprData = nd.exprData = {
                expressions: [],
                oExpressions: undefined
            }
        } else {
            exprData = nd.exprData;
        }
    } else {
        exprData = c[0] as IvContext;
    }
    if (!exprData.expressions) {
        // first time, expression is considered changed
        exprData.expressions = [];
        exprData.expressions[idx] = value;
    } else {
        let exp = exprData.expressions;
        if (exp.length > idx && exp[idx] === value) return ζu;
        exp[idx] = value;
    }
    return value;
}

function getExprValue(c: BlockNodes, instHolderIdx: number, exprValue: any) {
    // exprValue is an array if instHolderIdx>0 as expression was deferred
    if (instHolderIdx) {
        if (exprValue[2]) {
            let exprs = (c[0] as IvContext).oExpressions!;

            // one-time expression
            if (exprs[2 * exprValue[0]]) {
                // already read
                return ζu;
            }
            exprs[2 * exprValue[0]] = 1;
            return exprValue[1];
        }
        return ζe(c, exprValue[0], exprValue[1], instHolderIdx);
    }
    return exprValue;
}

/**
 * One-time expression flag. Returns true the first time it is called, and false afterwards
 * @param c the node array corresponding to the block context
 * @param idx the one-time expression index
 */
export function ζo(c: BlockNodes, idx: number, value: any, instHolderIdx?: number): any {
    let ctxt = c[0] as IvContext, exprs = ctxt.oExpressions;
    if (!exprs) {
        exprs = ctxt.oExpressions = [];
    }
    if (instHolderIdx) {
        if (!exprs[2 * idx]) {
            // list of read, result
            // where read = 0 | 1
            // and result = [idx, value, 1]
            let res = [idx, value, 1]
            exprs[2 * idx] = 0;
            exprs[1 + 2 * idx] = res;
            return res;
        } else {
            return exprs[1 + 2 * idx];
        }
    } else {
        if (!exprs[2 * idx]) {
            exprs[2 * idx] = 1;
            return value;
        }
        return ζu;
    }
}

/**
 * Dynamic attribute update
 */
export function ζatt(c: BlockNodes, eltIdx: number, instHolderIdx: number, name: string, expr: any) {
    if (expr === ζu) return;
    if (instHolderIdx === 0) {
        setAttribute(c, eltIdx, instHolderIdx, name, expr);
    } else {
        addInstruction(false, c, eltIdx, instHolderIdx, setAttribute, [c, eltIdx, instHolderIdx, name, expr]);
    }
}

function setAttribute(c: BlockNodes, eltIdx: number, instHolderIdx: number, name, expr: any) {
    let v = getExprValue(c, instHolderIdx, expr);
    if (v !== ζu) {
        (c[eltIdx] as IvNode).domNode.setAttribute(name, v);
    }
}

/**
 * Dynamic property update
 */
export function ζprop(c: BlockNodes, eltIdx: number, instHolderIdx: number, name: string, expr: any) {
    if (expr === ζu) return;
    if (instHolderIdx === 0) {
        setProperty(c, eltIdx, instHolderIdx, name, expr);
    } else {
        addInstruction(false, c, eltIdx, instHolderIdx, setProperty, [c, eltIdx, instHolderIdx, name, expr]);
    }
}

function setProperty(c: BlockNodes, eltIdx: number, instHolderIdx: number, name, expr: any) {
    let v = getExprValue(c, instHolderIdx, expr);
    if (v !== ζu) {
        (c[eltIdx] as IvNode).domNode[name] = v;
    }
}

/**
 * Dynamic param update
 */
export function ζparam(c: BlockNodes, cptIdx: number, instIdx: number, name: string, value: any) {
    if (value === ζu) return;
    if (instIdx === 0) {
        let container = c[cptIdx] as IvContainer, p = container.cptParams;
        if (p) {
            p[name] = value;
        }
    } else {
        console.log("TODO ζparam");
    }
}

/**
 * Dynamic component creation / update
 */
export function ζcpt(c: BlockNodes, idx: number, instIdx: number, cptRef, contentIdx?: number, hasParamNodes?: number, staticParams?: any[]) {
    let container = c[idx] as IvContainer;
    // contentIdx = 0 if no content
    if (cptRef !== ζu) {
        if (container.cptTemplate) {
            console.log("[iv] Component cannot be changed dynamically (yet)")
        } else {
            let tpl: Template = container.cptTemplate = cptRef()!;
            tpl.setParentCtxt(c[0] as IvContext, idx);
            let p = container.cptParams = tpl.params;
            if (staticParams) {
                let len = staticParams.length;
                for (let i = 0; len > i; i += 2) {
                    p[staticParams[i]] = staticParams[i + 1];
                }
            }
            let tCtxt = tpl.context;
            if (!tCtxt.rootDomNode && container.attached) {
                console.log("TODO?? HERE HERE HERE")
                //tCtxt.domNode = container.domNode;
            }
        }
    } else {
        // let tpl = container.cptTemplate as Template;
        // if hibe
        // container.cptParams = latestVersion(tpl.params);
    }
    if (contentIdx) {
        // reset instructions if any
        removeUpdateInstructions(c[contentIdx] as IvNode);
    }
}

/**
 * Call a component or a decorator once all params & content are set
 */
export function ζcall(c: BlockNodes, idx: number) {
    let container = c[idx] as IvContainer, tpl = container.cptTemplate as Template;
    if (tpl) {
        let ctxt = c[0] as IvContext;
        tpl.context.lastRefresh = ctxt.lastRefresh - 1; // will be incremented by refresh()
        if (container.cptContent) {
            tpl.params.$content = container.cptContent;
            let instr = container.cptContent.instructions;
            if (instr && instr.length) {
                tpl.forceRefresh = true;
            }
        }
        tpl.refresh();
        if (ctxt.lastRefresh > 1) {
            // on first refresh (i.e. lastRefresh === 1) this code should not be run as nodes will be added in the end method
            // similar logic as checkContainer

            // ensure root node is attached
            let childNodes = tpl.context.nodes, childRoot = childNodes[1] as IvNode;
            if (childRoot && !childRoot.attached) {
                let { position, nextDomNd, parentDomNd } = findNextSiblingDomNd(tpl.context.nodes, childRoot);
                if (parentDomNd) {
                    // insert sub root nodes as other nodes have been attached in block end
                    if (position === "beforeChild") {
                        insertInDomBefore(childNodes, parentDomNd, childRoot, nextDomNd);
                    } else if (position === "lastChild") {
                        appendToDom(childNodes, childRoot);
                    } else if (position === "lastOnRoot") {
                        insertInDomBefore(childNodes, parentDomNd, childRoot, nextDomNd);
                    }
                }
            }
        }
    }
}

/**
 * Content insertion (cf. @content)
 */
export function ζcont(c: BlockNodes, idx: number, instHolderIdx: number, contentRoot) {
    // console.log("ζcont", idx, "in", c[0].uid)
    if (!instHolderIdx) {
        projectContent(c, idx, instHolderIdx, contentRoot);
    } else {
        addInstruction(false, c, idx, instHolderIdx, projectContent, [c, idx, instHolderIdx, contentRoot]);
    }
}

function projectContent(c: BlockNodes, idx: number, instHolderIdx: number, exprContentRoot) {
    let contentHost = c[idx] as IvParentNode, contentRoot = getExprValue(c, instHolderIdx, exprContentRoot);
    if (contentRoot !== ζu && contentRoot) {
        // todo: if first time!?
        runInstructions(contentRoot);

        // store contentRoot in content data
        contentRoot.contentData!.contentHost = contentHost;
        contentHost.contentRoot = contentRoot;
    } else {
        // retrieve contentRoot
        runInstructions(contentHost.contentRoot!); // todo -> change + contentRef = undefined
    }
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

// ----------------------------------------------------------------------------------------------
// Param class

const PARAM = "PARAM";

interface ParamObject {
    $kind: "PARAM"
    $changed: boolean;
    $reset: () => void;
}

/**
 * Class decorator for the parameter class
 */
// export let ζd = Data();
export function ζd(c: any) {
    let proto = c.prototype
    proto.$kind = PARAM;
    proto.$changed = false;
    proto.$reset = $resetDataChanges;
}

function $resetDataChanges(this: ParamObject) {
    this.$changed = false;
}

/**
 * Class property decorator for the parameter class
 */
// export let ζv = value();
export function ζv(proto, key: string) {
    // proto = object prototype
    // key = the property name (e.g. "value")
    let $$key = "$$" + key;
    addPropertyInfo(proto, key, false, {
        get: function () { return this[$$key]; },
        set: function (v) {
            if (this[$$key] !== v) {
                this[$$key] = v;
                this["$changed"] = true;
            }
        },
        enumerable: true,
        configurable: true
    });
}

function addPropertyInfo(proto: any, propName: string, isDataNode: boolean, desc: PropertyDescriptor | undefined) {
    if (desc && delete proto[propName]) {
        Object.defineProperty(proto, propName, desc);
    }
}