import { XjsEvtListener } from './../xjs/parser/types';
import { IvTemplate, BlockNodes, IvContext, IvDocument, IvElement, IvNode, IvParentNode, IvText, IvFragment, IvContainer, IvComponent, IvExpressionData, IvContentData, IvEltListener } from './types';
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

    notifyChange(d: any) {
        this.refresh();
    }

    disconnectObserver() {
        let p = this.params;
        if (p && p["$kind"] === PARAM) {
            p["$observer"] = null;
        }
    }

    refresh(data?: any) {
        let p = this.params;
        if (p && data) {
            if (p["$kind"] === PARAM) {
                p["$observer"] = null;
            }
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
            cleanInstructions(this.context.nodes);
            this.refreshFn(this.context.nodes, p);
            if (p && p["$kind"] === PARAM) {
                p["$reset"]();
                p["$observer"] = this;
            }
            this.forceRefresh = false;
        } else if (p && p["$kind"] === PARAM) {
            p["$observer"] = this;
        }
        return this;
    }
}

function createContext(parentCtxt: IvContext | null, isTemplateRoot: boolean, containerIdx): IvContext {
    let ctxt: IvContext = {
        kind: "#context",
        uid: "ctxt" + (++uidCount),
        cm: true,
        nodes: [], // new Array(containerIdx ? 15 : 20),
        isTemplateRoot: isTemplateRoot,
        doc: null as any,
        rootDomNode: undefined,
        lastRefresh: 0, // count for child contexts
        anchorNode: undefined,
        expressions: undefined,
        oExpressions: undefined,
        parentCtxt: parentCtxt,
        containerIdx: 0,
        initialized: false,
        containsInstructions: false
    }
    ctxt.nodes[0] = ctxt;
    if (parentCtxt) {
        ctxt.rootDomNode = parentCtxt.rootDomNode;
        ctxt.doc = parentCtxt.doc;
        ctxt.containerIdx = containerIdx;
    } else {
        ctxt.doc = (typeof document !== "undefined") ? document as any : null as any;
    }
    return ctxt;
}

function setParentCtxt(ctxt: IvContext, parentCtxt: IvContext, containerIdx: number) {
    ctxt.parentCtxt = parentCtxt;
    ctxt.doc = parentCtxt.doc;
    ctxt.containerIdx = containerIdx;
    ctxt.rootDomNode = parentCtxt.rootDomNode;
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
export function ζfrag(c: BlockNodes, idx: number, parentIdx: number, instHolderIdx: number = 0, type: number = 0) {
    if (!instHolderIdx) { // || type
        // we must create the fragment if is a container as it will hold the sub-block nodes used in the sub-instructions
        // this occurs when a js block is used in content -> the js block context will try to access his container to hold the sub-context 
        // (unless we pass the parent instruction holder - e.g. ζ1 = ζcc(ζ, 6, 4, ++ζi1); ---> 4 would be instHolderIdx)
        createFrag(c, idx, parentIdx, type, instHolderIdx === 0);
        // if (instHolderIdx) {
        //     addInstruction(true, c, idx, instHolderIdx, connectChild, [c, c[idx], idx, true]);
        // }
    } else {
        addInstruction(true, c, idx, instHolderIdx, createFrag, [c, idx, parentIdx, type, true]);
    }
}

function createFrag(c: BlockNodes, idx: number, parentIdx: number, type: number, setChildPosition = true) {
    // containerType: 0=group, 1=js block container 2=component container, 3=async container
    let nd: IvFragment | IvContainer;
    if (!type) {
        nd = <IvFragment>{
            kind: "#fragment",
            uid: "frag" + (++uidCount),
            isContainer: false,
            domNode: undefined,
            attached: false,
            idx: idx,
            parentIdx: parentIdx,
            ns: "",
            nextSibling: undefined, // will be determined after first render
            firstChild: undefined,
            lastChild: undefined,
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
            nextSibling: undefined, // will be determined after first render
            firstChild: undefined,
            lastChild: undefined,
            lastRefresh: 0,
            contentBlocks: [],
            blockPool: [],
            contentLength: 0,
            cptTemplate: undefined,
            cptParams: undefined,
            cptContent: undefined,
            instructions: undefined,
            contentData: undefined,
            exprData: undefined,
            isAsyncHost: (type === 3),
            asyncPriority: 0
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
export function ζcc(c: BlockNodes, idx: number, instanceIdx: number, instHolderIdx: number = 0, keyExpr?: any): any {
    if (!instHolderIdx) {
        return checkContext(c, idx, instanceIdx);
    } else {
        let f = c[idx] as IvContainer;
        if (!f) {
            // first-time call
            let ctxt = createContext(null, false, idx);
            addInstruction(true, c, idx, instHolderIdx, checkContext, [c, idx, instanceIdx, false, ctxt]);
            return ctxt.nodes;
        } else {
            let nodes = checkContext(c, idx, instanceIdx, true);
            addInstruction(true, c, idx, instHolderIdx, checkContext, [c, idx, instanceIdx, false]);
            return nodes;
        }

    }
}

function checkContext(c: BlockNodes, idx: number, instanceIdx: number, firstRun = true, subContext?: IvContext) {
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
            let ctxt = subContext;
            if (!ctxt) {
                ctxt = createContext(pCtxt, false, idx);
            } else {
                setParentCtxt(ctxt, pCtxt, idx);
            }
            nodes = f.contentBlocks[instanceIdx - 1] = ctxt.nodes;
        }
    }
    if (firstRun) {
        f.lastRefresh = (nodes[0] as IvContext).lastRefresh = pCtxt.lastRefresh;
        //cleanInstructions(nodes);
    }
    // logNodes(nodes, "cc result")
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
        } else if (f.firstChild) {
            let nd = f.firstChild;
            while (nd) {
                removeFromDom(c, nd);
                nd = nd.nextSibling!;
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

function appendToDom(c: BlockNodes, nd: IvNode, projectRoot = false, parentDomNode = null) {
    // console.log("appendToDom ", nd ? nd.uid : "XX", "in", c[0].uid, "attached:", nd ? nd.attached : false)
    if (!nd || (nd.kind !== "#container" && nd.attached) || (!projectRoot && nd.contentData)) return;
    runInstructions(nd, "appendToDom");

    let pdn: any, domNode = nd.domNode;
    if (nd.contentData) {
        let cd = nd.contentData;
        pdn = getParentDomNd(cd.contentHostNodes!, cd.contentHost!)
    } else {
        pdn = parentDomNode || getParentDomNd(c, nd);
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
    }

    if (nd.kind === "#element") {
        if ((nd as IvElement).firstChild) {
            let ch = (nd as IvElement).firstChild, pdn = nd.domNode;
            while (ch) {
                appendToDom(c, ch, false, pdn);
                ch = ch.nextSibling!;
            }
        } else {
            projectHostContent(c, nd as IvParentNode, nd.domNode);
        }
    } else if (nd.kind === "#fragment") {
        nd.domNode = pdn;
        nd.attached = true;
        if ((nd as IvFragment).firstChild) {
            let ch = (nd as IvFragment).firstChild;
            while (ch) {
                appendToDom(c, ch, false, pdn);
                ch = ch.nextSibling!;
            }
        } else {
            projectHostContent(c, nd as IvParentNode, pdn);
        }
    } else if (nd.kind === "#container") {
        nd.domNode = pdn;
        nd.attached = true;
        let container = nd as IvContainer, tpl = container.cptTemplate as Template;
        if (tpl) {
            // attach root node of the sub-template
            let nodes = tpl.context.nodes;
            appendToDom(nodes, nodes[1] as IvNode, false, pdn);
        } else {
            let blocks = container.contentBlocks, len = blocks.length;
            for (let i = 0; len > i; i++) {
                appendToDom(blocks[i], blocks[i][1] as IvNode, false, pdn);
            }
        }
    }
}

function projectHostContent(c: BlockNodes, host: IvParentNode, parentDomNode = null) {
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
                    appendToDom(cd.rootNodes, content, true, parentDomNode);
                }
                content.attached = true;
            } else if (content.kind === "#fragment") {
                let f = content as IvFragment;
                f.domNode = host.domNode;
                content.attached = true;
                let ch = f.firstChild, rootNodes = cd.rootNodes!;
                while (ch) {
                    appendToDom(rootNodes, ch, false, parentDomNode);
                    ch = ch.nextSibling!;
                }
            } else {
                console.log("TODO: unsupported content kind: ", content.kind, "in", host.uid)
            }
        }
    }
}

function detachContentFromHost(c: BlockNodes, host: IvParentNode) {
    if (host.contentRoot) {
        let content = host.contentRoot!, cd = content.contentData!;
        if (content.attached) {
            removeFromDom(cd.rootNodes, content);
            content.attached = false;
        }
        cd.contentHost = undefined;
        cd.contentHostNodes = undefined;
    }
}

function insertInDomBefore(c: BlockNodes, parentDomNd: any, nd: IvNode, nextDomNd: any, projectRoot = false) {
    // if (nd) console.log("insertInDomBefore - test", nd.uid, nd.attached, !parentDomNd, (!projectRoot && nd.contentData))
    if (!nd || (nd.kind !== "#container" && nd.attached) || !parentDomNd || (!projectRoot && nd.contentData)) return;
    // console.log("insertInDomBefore", nd.uid, "parent", parentDomNd.$uid, "before", nextDomNd.$uid)
    runInstructions(nd, "insertInDomBefore");

    let domNode = nd.domNode;
    if (domNode && domNode !== parentDomNd) {
        // console.log("-> insert", domNode.$uid, "before", nextDomNd.$uid);
        parentDomNd.insertBefore(domNode, nextDomNd);
        nd.attached = true;
    }

    // add children / or project content
    if (nd.kind === "#element") {
        projectHostContent(c, nd as IvParentNode);
    } else if (nd.kind === "#fragment") {
        nd.domNode = parentDomNd;
        nd.attached = true;
        if ((nd as IvFragment).firstChild) {
            let ch = (nd as IvFragment).firstChild;
            while (ch) {
                insertInDomBefore(c, parentDomNd, ch, nextDomNd);
                ch = ch.nextSibling!;
            }
        } else {
            projectHostContent(c, nd as IvParentNode);
        }
    } else if (nd.kind === "#container") {
        nd.domNode = parentDomNd;
        nd.attached = true;
        let container = nd as IvContainer, tpl = container.cptTemplate as Template;
        if (tpl) {
            let nodes = tpl.context.nodes;
            insertInDomBefore(nodes, parentDomNd, nodes[1] as IvNode, nextDomNd);
        } else {
            let blocks = container.contentBlocks, len = blocks.length, chNd: IvNode;
            for (let i = 0; len > i; i++) {
                chNd = blocks[i][1] as IvNode;
                if (chNd) {
                    insertInDomBefore(blocks[i], parentDomNd, chNd, nextDomNd);
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

export function ζend(c: BlockNodes, useInstructions: number, containerIndexes?: (number[] | 0), isAsyncBlock?: 1) {
    // close the creation mode to avoid running it multiple times
    (c[0] as IvContext).cm = false;
    if (!useInstructions) {
        endBlock(c, containerIndexes, isAsyncBlock);
    } else {
        addInstruction(false, c, 0, 1, endBlock, [c, containerIndexes]);
    }
}

export function endBlock(c: BlockNodes, containerIndexes?: (number[] | 0), isAsyncBlock?: 1) {
    let ctxt = c[0] as IvContext;
    // console.log("endBlock", ctxt.uid, containerIndexes, ctxt.initialized);
    if (containerIndexes) {
        let len = containerIndexes.length;
        for (let i = 0; len > i; i += 2) {
            checkContainer(c, containerIndexes[i], !ctxt.initialized); // containerIndexes[i + 1] is instruction holder
        }
    }
    if (isAsyncBlock && ctxt.initialized && ctxt.parentCtxt) {
        // ensure root is attached
        attachRootNode(c, (ctxt.parentCtxt as IvContext).nodes[ctxt.containerIdx] as IvContainer);
    }
    if (ctxt.initialized) return;
    ctxt.initialized = true;

    let len = c.length, root = c[1] as IvNode, hostDomNd = ctxt.parentCtxt ? null : ctxt.rootDomNode;
    if (!root || (ctxt.isTemplateRoot && root.contentData)) return;

    // if root node is fragment, we need to define its domNode first
    if (hostDomNd && (root.kind === "#fragment")) {
        root.domNode = hostDomNd;
        root.attached = true;
    }
    // append all child nodes to the root node
    for (let i = 2; len > i; i++) {
        appendToDom(c, c[i] as IvNode, false);
    }

    // insert root node for root template
    // sub-root nodes (i.e. in containers) will have already been inserted through checkContainer
    if (!ctxt.parentCtxt) {
        // root node, attach to parent container
        insertInDomBefore(c, ctxt.rootDomNode, root, ctxt.anchorNode);
    } else if (isAsyncBlock) {
        // we need to attach to the parent element
        appendToDom(c, root, false);
    }
}

/**
 * Delete or attach container content
 */
function checkContainer(c: BlockNodes, idx: number, firstTime: boolean) {
    let container = c[idx] as IvContainer;
    if (!container || container.isAsyncHost) return; // happens when block condition has never been true
    let lastRefresh = container.lastRefresh;
    // console.log("checkContainer", container.uid, "in=", c[0].uid, idx, "container.lastRefresh=", lastRefresh, "ctxt.lastRefresh=", (c[0] as IvContext).lastRefresh, "firstTime:", firstTime);
    if (!firstTime && lastRefresh !== (c[0] as IvContext).lastRefresh) {
        // remove all nodes from DOM
        removeFromDom(c, container as IvNode);
    } else {
        let tpl = container.cptTemplate as Template;
        if (tpl) {
            console.log("Todo: checkContainer / runInstructions for sub-templates")
        } else {
            let blocks = container.contentBlocks, nbrOfBlocks = blocks.length, nodes: BlockNodes;
            if (firstTime) {
                for (let i = 0; nbrOfBlocks > i; i++) {
                    runInstructions(blocks[i][1] as IvNode, "checkContainer 1");
                }
            } else {
                // on first refresh this code should not be run as nodes will be added in the end method
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
                runInstructions(nodes[1] as IvNode, "checkContainer 2");
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
    // console.log("findNextSiblingDomNd, node:", node.uid, "in", c[0].uid)
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
        if (nd.nextSibling) {
            // console.log("> is not last")
            let sdp = findFirstDomNd(c, nd.nextSibling, pdn);
            if (sdp) return sdp;
            // if not found (e.g. node not attached) we shift by 1
            nd = nd.nextSibling;
        } else {
            // console.log("> is last - parent is", parent.kind)
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
            let sdp: SiblingDomPosition | null, ch = (nd as IvParentNode).firstChild;
            while (ch) {
                sdp = findFirstDomNd(c, ch, parentDomNd);
                if (sdp) {
                    return sdp;
                }
                ch = ch.nextSibling!;
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
    // console.log("addInstruction", func.name, "ctxt=", c[0].uid, "targetIdx=", targetIdx, "instHolderIdx=", instHolderIdx);
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
            if (parent) {
                parent.cptContent = contentRoot;
            }
        }
    } else {
        if (!c[instHolderIdx]) {
            // logNodes(c, "addInstruction: no holder in " + c[0].uid + " at " + instHolderIdx);
        }
        let nd = c[instHolderIdx] as IvNode, instructions = nd.instructions;
        if (!instructions) {
            instructions = nd.instructions = [creation, func, args];
            (c[0] as IvContext).containsInstructions = true;
        } else {
            instructions.push(creation); // true if the instruction corresponds to a creation (false = update)
            instructions.push(func);
            instructions.push(args);
        }
    }
}

function runInstructions(nd: IvNode, src: string) {
    // console.log("runInstructions", "(" + src + ")", nd.uid, "instructions count = ", nd.instructions ? nd.instructions.length / 3 : 0)
    if (nd.instructions) {
        let instr = nd.instructions, len = instr.length;
        for (let i = 0; len > i; i += 3) {
            // console.log("run instruction #" + (i / 3), instr[i + 1].name, instr[i + 2][1])
            instr[i + 1].apply(null, instr[i + 2]);
        }
        // console.log("empty instructions in", nd.uid);
        nd.instructions = undefined;
    }
}

function cleanInstructions(c: BlockNodes) {
    // remove all update instructions - must be run before a context is updated
    // (i.e. during cc or before refresh)
    // console.log("cleanInstructions", c[0].uid, (!(c[0] as IvContext).containsInstructions));
    if (!(c[0] as IvContext).containsInstructions) return;
    let len = c.length, nbr = 0;
    for (let i = 1; len > i; i++) {
        nbr += removeUpdateInstructions(c[i] as IvNode);
    }
    (c[0] as IvContext).containsInstructions = (nbr === 0);
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
            // console.log("removeUpdateInstructions in", nd.uid, "previous count=", instr.length, "new count=", newInstructions.length);
            return nd.instructions.length;
        }
        return len;
    }
    return 0;
}

/**
 * Element node creation
 */
export function ζelt(c: BlockNodes, idx: number, parentIdx: number, instHolderIdx: number, name: string, staticAttributes?: any[], staticProperties?: any[]) {
    if (instHolderIdx === 0) {
        createElt(c, idx, parentIdx, name, staticAttributes, staticProperties);
    } else {
        addInstruction(true, c, idx, instHolderIdx, createElt, [c, idx, parentIdx, name, staticAttributes, staticProperties]);
    }
}

function createElt(c: BlockNodes, idx: number, parentIdx: number, name: string, staticAttributes?: any[], staticProperties?: any[]) {
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
        nextSibling: undefined,   // will be determined after first render
        firstChild: undefined,
        lastChild: undefined,
        instructions: undefined,
        contentData: undefined,
        contentRoot: undefined,
        exprData: undefined
    }
    connectChild(c, nd, idx);
}

function connectChild(c: BlockNodes, child: IvNode, childIdx: number, setChildPosition = true) {
    c[childIdx] = child;
    if (child.parentIdx === childIdx || !setChildPosition) return; // root node
    let p = c[child.parentIdx] as IvParentNode;
    if (!p) return;
    if (!p.firstChild) {
        p.firstChild = p.lastChild = child;
        child.nextSibling = undefined;
    } else {
        p.lastChild!.nextSibling = child
        p.lastChild = child;
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
        nextSibling: undefined,
        pieces: pieces,
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
        console.log("updateText: nd undefined - context:", c[0].uid, "text node:", idx, "inst holder:", instHolderIdx)
    }
    // console.log("updateText", nd.uid, "in", c[0].uid);
    for (let i = 0; nbrOfValues > i; i++) {
        v = getExprValue(c, instHolderIdx, values[i]);
        if (v !== ζu) {
            changed = true;
            if (!pieces) {
                pieces = nd.pieces;
            }
            pieces![1 + i * 2] = (v === null || v === undefined) ? "" : v;
        }
    }
    if (!changed) return;
    nd.pieces = pieces;
    // console.log("updateText in", c[0].uid, "idx=", idx, "value=" + pieces!.join(""), "first=", nd.domNode === undefined)
    if (!nd.domNode) {
        nd.domNode = (c[0] as IvContext).doc.createTextNode(pieces!.join(""));
        if ((c[0] as IvContext).initialized) {
            // on first refresh (i.e. initialized = false) this code should not be run as nodes will be added in the end method

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
export function ζprop(c: BlockNodes, eltIdx: number, instHolderIdx: number, name: string, exprValue: any) {
    if (exprValue === ζu) return;
    if (instHolderIdx === 0) {
        setProperty(c, eltIdx, instHolderIdx, name, exprValue);
    } else {
        addInstruction(false, c, eltIdx, instHolderIdx, setProperty, [c, eltIdx, instHolderIdx, name, exprValue]);
    }
}

function setProperty(c: BlockNodes, eltIdx: number, instHolderIdx: number, name: string, exprValue: any) {
    let v = getExprValue(c, instHolderIdx, exprValue);
    if (v !== ζu) {
        // (c[eltIdx] as IvNode).domNode[name] = v;
        changeProperty(c[eltIdx] as IvNode, name, v)
    }
}

function changeProperty(nd: IvNode, name: string, v: any) {
    nd.domNode[name] = v;
}

/**
 * Dynamic param update
 */
export function ζparam(c: BlockNodes, cptIdx: number, instHolderIdx: number, name: string, exprValue: any) {
    if (exprValue === ζu) return;
    if (instHolderIdx === 0) {
        setParam(c, cptIdx, instHolderIdx, name, exprValue);
    } else {
        addInstruction(false, c, cptIdx, instHolderIdx, setParam, [c, cptIdx, instHolderIdx, name, exprValue]);
    }
}

function setParam(c: BlockNodes, cptIdx: number, instHolderIdx: number, name: string, exprValue: any) {
    let v = getExprValue(c, instHolderIdx, exprValue);
    if (v !== ζu) {
        let p = (c[cptIdx] as IvContainer).cptParams;
        if (p) {
            p[name] = v;
        }
    }
}

/**
 * Dynamic component creation / update
 */
export function ζcpt(c: BlockNodes, idx: number, instHolderIdx: number, exprCptRef: any, contentIdx?: number, hasParamNodes?: number, staticParams?: any[]) {
    if (contentIdx) {
        removeUpdateInstructions(c[contentIdx] as IvNode);
    }
    if (!instHolderIdx) {
        checkCpt(c, idx, instHolderIdx, exprCptRef, contentIdx, hasParamNodes, staticParams);
    } else {
        addInstruction(false, c, idx, instHolderIdx, checkCpt, [c, idx, instHolderIdx, exprCptRef, contentIdx, hasParamNodes, staticParams]);
    }
}

function checkCpt(c: BlockNodes, idx: number, instHolderIdx: number, exprCptRef: any, contentIdx?: number, hasParamNodes?: number, staticParams?: any[]) {
    let container = c[idx] as IvContainer, cptRef = getExprValue(c, instHolderIdx, exprCptRef)
    // contentIdx = 0 if no content
    if (cptRef !== ζu) {
        if (container.cptTemplate) {
            console.log("[iv] Component cannot be changed dynamically (yet)")
        } else {
            let tpl: Template = container.cptTemplate = cptRef()!;
            setParentCtxt(tpl.context, c[0] as IvContext, idx);
            tpl.disconnectObserver();
            let p = container.cptParams = tpl.params;
            if (staticParams) {
                let len = staticParams.length;
                for (let i = 0; len > i; i += 2) {
                    p[staticParams[i]] = staticParams[i + 1];
                }
            }
            if (contentIdx) {
                let contentNode = c[contentIdx] as IvNode
                container.cptContent = contentNode;
                //removeUpdateInstructions(contentNode);
            }
        }
    } else {
        (container.cptTemplate as Template).disconnectObserver();
    }
}

/**
 * Call a component or a decorator once all params & content are set
 */
export function ζcall(c: BlockNodes, idx: number, instHolderIdx?: number) {
    if (!instHolderIdx) {
        callCpt(c, idx);
    } else {
        addInstruction(false, c, idx, instHolderIdx, callCpt, [c, idx]);
    }
}

function callCpt(c: BlockNodes, idx: number) {
    // console.log("callCpt", idx, "in", c[0].uid)
    let container = c[idx] as IvContainer, tpl = container ? container.cptTemplate as Template : null;
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
        if ((c[0] as IvContext).initialized) {
            // on first refresh (i.e. initialized = false) this code should not be run as nodes will be added in the end method
            attachRootNode(tpl.context.nodes, container);
        }
    }
}

function attachRootNode(c: BlockNodes, container: IvContainer) {
    // similar logic as checkContainer
    let root = c[1] as IvNode;

    if (root && !root.attached) {
        let { position, nextDomNd, parentDomNd } = findNextSiblingDomNd(c, container);
        // console.log(">> C next sibling result for", childRoot.uid, "in", tpl.context.nodes[0].uid, "position=", position, "nextDomNd=", nextDomNd ? nextDomNd.$uid : "XX", "parentDomNd=", parentDomNd ? parentDomNd.$uid : "XX")

        if (parentDomNd) {
            // insert sub root nodes as other nodes have been attached in block end
            if (position === "beforeChild") {
                insertInDomBefore(c, parentDomNd, root, nextDomNd);
            } else if (position === "lastChild") {
                appendToDom(c, root);
            } else if (position === "lastOnRoot") {
                insertInDomBefore(c, parentDomNd, root, nextDomNd);
            }
        }
    }
}

/**
 * Content insertion (cf. @content)
 */
export function ζcont(c: BlockNodes, idx: number, instHolderIdx: number, exprContentRoot: any) {
    // console.log("ζcont", idx, "in", c[0].uid)
    if (!instHolderIdx) {
        projectContent(c, idx, instHolderIdx, exprContentRoot);
    } else {
        addInstruction(false, c, idx, instHolderIdx, projectContent, [c, idx, instHolderIdx, exprContentRoot]);
    }
}

function projectContent(c: BlockNodes, idx: number, instHolderIdx: number, exprContentRoot: any) {
    let contentHost = c[idx] as IvParentNode, contentRoot = getExprValue(c, instHolderIdx, exprContentRoot), changed = false;

    if (contentRoot !== ζu && contentRoot) {
        changed = true;
    } else {
        contentRoot = contentHost.contentRoot!
    }

    let cd = contentRoot.contentData! as IvContentData;
    if (cd.contentHost && cd.contentHost !== contentHost) {
        // node was already projected
        detachContentFromHost(cd.contentHostNodes!, cd.contentHost);
    }
    // retrieve contentRoot
    runInstructions(contentRoot, "projectContent");

    if (changed) {
        // store contentRoot in content data
        cd.contentHost = contentHost;
        contentHost.contentRoot = contentRoot;
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
export function ζasync(c: BlockNodes, containerIdx: number, priorityExpr: number, instHolderIdx: number, fn: () => any) {
    if (!instHolderIdx) {
        processAsyncBlock(c, containerIdx, priorityExpr, instHolderIdx, fn);
    } else {
        addInstruction(false, c, -1, instHolderIdx, processAsyncBlock, [c, containerIdx, priorityExpr, instHolderIdx, fn]);
    }
}

function processAsyncBlock(c: BlockNodes, containerIdx: number, priorityExpr: number, instHolderIdx: number, fn: () => any) {
    let container = c[containerIdx] as IvContainer, priority = typeof priorityExpr === "number" ? priorityExpr : getExprValue(c, instHolderIdx, priorityExpr);
    // console.log("processAsyncBlock")
    if (priority !== ζu) {
        container.asyncPriority = priority;
    } else {
        priority = container.asyncPriority;
    }
    if (priority === 0) {
        fn();
    } else {
        if (!ASYNC_QUEUE) {
            ASYNC_QUEUE = [];
        }
        ASYNC_QUEUE.push(fn);
        createAsyncProcessor();
    }
}

let ASYNC_PROCESSOR: Promise<void> | null = null, ASYNC_QUEUE: (() => any)[] | null;

async function createAsyncProcessor() {
    if (!ASYNC_PROCESSOR) {
        if (typeof setTimeout !== "undefined") {
            // requestAnimation frame may run in the same frame!
            ASYNC_PROCESSOR = new Promise(function (resolve) {
                setTimeout(function () {
                    processQueue();
                    resolve();
                }, 1)
            })
        } else {
            ASYNC_PROCESSOR = Promise.resolve().then(function () {
                processQueue();
            })
        }
    }

    return ASYNC_PROCESSOR;

    function processQueue() {
        // console.log("processQueue: ", ASYNC_QUEUE ? ASYNC_QUEUE.length : 0);
        if (ASYNC_QUEUE) {
            let len = ASYNC_QUEUE.length;
            for (let i = 0; len > i; i++) {
                ASYNC_QUEUE[i]();
            }
        }
        ASYNC_QUEUE = null;
        ASYNC_PROCESSOR = null;
    }
}

export async function asyncComplete() {
    return createAsyncProcessor();
}

/**
 * Define an event listener node (creation mode only)
 * e.g. ζlistener(ζ, 2, 1, 0, "click");
 */
export function ζlistener(c: BlockNodes, idx: number, parentIdx: number, instHolderIdx: number, eventName: string) {
    if (!instHolderIdx) {
        createListener(c, idx, parentIdx, eventName);
    } else {
        addInstruction(true, c, idx, instHolderIdx, createListener, [c, idx, parentIdx, eventName]);
    }
}

function createListener(c: BlockNodes, idx: number, parentIdx: number, eventName: string) {
    let parent = c[parentIdx] as IvNode, nd: IvEltListener = {
        kind: "#listener",
        uid: "lsnr" + (++uidCount),
        domNode: parent!.domNode,
        attached: true,
        idx: idx,
        parentIdx: parentIdx,
        nextSibling: undefined,
        instructions: undefined,
        contentData: undefined,
        exprData: undefined,
        callback: undefined
    }
    c[idx] = nd;

    parent.domNode!.addEventListener(eventName, function (evt: any) {
        if (nd.callback) {
            nd.callback(evt);
        }
    });
}

/**
 * Update an event handler function
 * e.g. ζhandler(ζ, 2, 0, function (e) { doSomething(e.name); });
 */
export function ζhandler(c: BlockNodes, idx: number, instHolderIdx: number, handler: (e: any) => void) {
    if (!instHolderIdx) {
        setEvtHandlerCb(c, idx, handler);
    } else {
        addInstruction(false, c, idx, instHolderIdx, setEvtHandlerCb, [c, idx, handler]);
    }
}

function setEvtHandlerCb(c: BlockNodes, idx: number, handler: (e: any) => void) {
    (c[idx] as IvEltListener).callback = handler;
}

// ----------------------------------------------------------------------------------------------
// Param class

const PARAM = "PARAM";
let CHANGED_DATA: any[] | null = null, NOTIFIER: Promise<void> | null = null;

interface ParamObject {
    $kind: "PARAM"
    $changed: boolean;
    $reset: () => void;
}

interface DataObserver {
    notifyChange(d: any): void;
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
        set: function (v) { setDataProperty(this, $$key, v) },
        enumerable: true,
        configurable: true
    });
}

function addPropertyInfo(proto: any, propName: string, isDataNode: boolean, desc: PropertyDescriptor | undefined) {
    if (desc && delete proto[propName]) {
        Object.defineProperty(proto, propName, desc);
    }
}

function setDataProperty(d: any, $$key: string, v: any) {
    if (d[$$key] !== v) {
        d[$$key] = v;
        if (!d.$changed) {
            d.$changed = true;
            queueNotification(d, d.$observer);
        }
    }
}

function queueNotification(d: any, o: DataObserver) {
    if (o) {
        if (!CHANGED_DATA) {
            CHANGED_DATA = [d];
            createNotifier();
        } else {
            CHANGED_DATA.push(d);
        }
    }
}

async function createNotifier() {
    if (!NOTIFIER) {
        NOTIFIER = Promise.resolve().then(function () {
            if (!CHANGED_DATA) return;
            let len = CHANGED_DATA.length, d: any, o: DataObserver;
            for (let i = 0; len > i; i++) {
                d = CHANGED_DATA[i];
                o = d.$observer;
                if (o) {
                    o.notifyChange(d);
                }
                d.$changed = false;
            }
            CHANGED_DATA = null;
            NOTIFIER = null;
        })
    }
    return NOTIFIER;
}

export async function changeComplete() {
    return createNotifier();
}

// ----------------------------------------------------------------------------------------------
// Debug function

const SEP = "-------------------------------------------------------------------------------";

function logNodes(c: BlockNodes, label = "", rootId?: string) {
    if (!rootId || (c[0] && c[0].uid === rootId)) {
        console.log("");
        console.log(SEP);
        if (label) {
            console.log(label + ":")
        }
        logBlockNodes(c);
    }
}

export function logBlockNodes(list: BlockNodes, indent: string = "") {
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
            console.log(`${indent}[${i}] ${nd.uid} ${dn} parent:${nd.parentIdx} attached:${nd.attached ? 1 : 0} nextSibling:${nd.nextSibling ? nd.nextSibling.uid : "X"}`);
            if (cont.cptTemplate) {
                let tpl = cont.cptTemplate as Template;
                console.log(`${indent + "  "}- light DOM first Child: [${cont.firstChild ? cont.firstChild!.uid : "XX"}]`);
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
            let dn = nd.domNode ? nd.domNode.$uid : "XX", lastArg = "";
            if (nd.domNode && nd.kind === "#text") {
                lastArg = " #" + nd.domNode["_textContent"] + "#";
            }
            if (nd.instructions) {
                lastArg += " instructions:" + nd.instructions.length;
            }
            console.log(`${indent}[${nd.idx}] ${nd.uid} ${dn} parent:${nd.parentIdx} attached:${nd.attached ? 1 : 0} nextSibling:${nd.nextSibling ? nd.nextSibling.uid : "X"}${lastArg}`);
        }
    }
}