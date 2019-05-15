import { IvTemplate, IvView, IvDocument, IvNode, IvContainer, IvBlockContainer, IvElement, IvParentNode, IvText, IvFragment, IvCptContainer, IvEltListener } from './types';

export let uidCount = 0; // counter used for unique ids (debug only, can be reset)

function error(msg) {
    // temporary error management
    console.log("[iv error] " + msg);
}

/**
 * Template object created at runtime
 */
export class Template implements IvTemplate {
    view: IvView;
    refreshArg: any = undefined;
    forceRefresh = false;

    constructor(public refreshFn: (ζ: IvView, ζa?: any) => void | undefined, public argumentClass?: () => void, public hasHost = false) {
        // document is undefined in a node environment
        this.view = createView(null, true, null);
    }

    get document() {
        return this.view.doc;
    }

    set document(d: IvDocument) {
        this.view.doc = d;
    }

    get params(): any | undefined {
        if (!this.refreshArg && this.argumentClass) {
            this.refreshArg = new this.argumentClass();
        }
        return this.refreshArg;
    }

    attach(element: any) {
        if (!this.view.rootDomNode) {
            let ctxt = this.view;
            if (!ctxt.doc) throw new Error("[iv] Template.document must be defined before calling Template.attach()");
            ctxt.rootDomNode = element;
            ctxt.anchorNode = ctxt.doc.createComment("template anchor"); // used as anchor in the parent domNode
            element.appendChild(ctxt.anchorNode);
            //appendChild(element, ctxt.anchorNode);
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
        let bypassRefresh = !this.forceRefresh, nodes = this.view.nodes;
        if (!nodes || !nodes[0] || !(nodes[0] as IvNode).attached) {
            bypassRefresh = false; // internal blocks may have to be recreated if root is not attached
        }
        if (p && bypassRefresh && p["$kind"] === PARAM && p["$changed"] === true) {
            bypassRefresh = false;
        }
        if (!bypassRefresh) {
            // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> REFRESH", this.context.nodes[0].uid)
            this.view.lastRefresh++;
            //cleanInstructions(this.view.nodes);
            this.refreshFn(this.view, p);
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

function createView(parentView: IvView | null, isTemplateRoot: boolean, container: IvContainer | null): IvView {
    let view: IvView = {
        kind: "#view",
        uid: "view" + (++uidCount),
        nodes: null,
        doc: null as any,
        parentView: parentView,
        cm: true,
        cmAppends: null,
        lastRefresh: 0,
        container: null,
        isTemplate: isTemplateRoot,
        rootDomNode: null,
        anchorNode: null,
        expressions: undefined,
        oExpressions: undefined
    }
    if (parentView) {
        view.rootDomNode = parentView.rootDomNode;
        view.doc = parentView.doc;
        view.container = container;
    } else {
        view.doc = (typeof document !== "undefined") ? document as any : null as any;
    }
    return view;
}

function setParentView(v: IvView, pv: IvView, container: IvContainer) {
    v.parentView = pv;
    v.doc = pv.doc;
    v.container = container;
    v.rootDomNode = pv.rootDomNode;
}

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

// ----------------------------------------------------------------------------------------------
// Runtime instructions

// Root view initialization
// e.g. let ζc = ζinit(ζ, ζs0, 2);
export function ζinit(v: IvView, staticCache: Object, nbrOfNodes: number): boolean {
    // staticCache is an object that can be used to hold class-level cached data
    let cm = v.cm;
    if (cm) {
        v.nodes = new Array(nbrOfNodes);
        if (!v.cmAppends) {
            // cmAppends is already defined when the template is called from another template
            v.cmAppends = [];
            if (v.anchorNode) {
                // this is the root template
                v.cmAppends[0] = function (n: IvNode, domOnly: boolean) {
                    if (n.domNode) {
                        v.rootDomNode.insertBefore(n.domNode, v.anchorNode);
                    } else {
                        n.domNode = v.rootDomNode;
                    }
                }
            }
        }
    } else {
        v.cmAppends = null;
    }
    return cm;
}

// Sub-view creation
// e.g. ζ1 = ζview(ζ, 0, 1, 2, ++ζi1);
export function ζview(pv: IvView, iHolder: number, containerIdx: number, nbrOfNodes: number, instanceIdx: number) {
    // retrieve container to get previous view
    // if doesn't exist, create one and register it on the container
    let cnt = pv.nodes![containerIdx] as IvBlockContainer, view: IvView, views = cnt.views;
    if (!cnt.attached) {
        console.log("[ERROR] Invalid ζview call: container must be attached (" + cnt.uid + ")");
    }
    if (instanceIdx === 1) {
        cnt.insertFn = null;
    }
    // console.log("ζview", cnt.uid, instanceIdx, cnt.domNode === undefined)
    if (instanceIdx === 1 && cnt.views.length > 1) {
        // previous views are moved to the view pool to be re-used if necessary
        cnt.previousNbrOfViews = views.length;
        view = views.shift()!;
        if (cnt.viewPool.length) {
            cnt.viewPool = views.concat(cnt.viewPool);
        } else {
            cnt.viewPool = views;
        }
        cnt.views = [view];
    } else {
        view = cnt.views[instanceIdx - 1];
        if (!view) {
            if (cnt.viewPool.length > 0) {
                // console.log("view: retrieve from pool: ", cnt.uid)
                if (!cnt.insertFn) {
                    cnt.insertFn = getViewInsertFunction(pv, cnt);
                }
                view = views[instanceIdx - 1] = cnt.viewPool.shift()!;
                insertInDom(view.nodes![0], cnt.insertFn);
            } else {
                view = views[instanceIdx - 1] = createView(pv, false, cnt);
                view.nodes = new Array(nbrOfNodes);
                if (pv.cm && cnt.cmAppend) {
                    view.cmAppends = [cnt.cmAppend];
                } else if (!pv.cm) {
                    view.cmAppends = [getViewInsertFunction(pv, cnt)];
                }
            }
        }
    }
    // return sth
    cnt.lastRefresh = view.lastRefresh = pv.lastRefresh;
    return view;
}

function getViewInsertFunction(pv: IvView, cnt: IvContainer) {
    // determine the append mode
    let { position, nextDomNd, parentDomNd } = findNextSiblingDomNd(pv, cnt);
    // console.log(`findNextSiblingDomNd: position=${position} nextDomNd=${nextDomNd ? nextDomNd.uid : "XX"} parentDomNd=${parentDomNd ? parentDomNd.uid : "XX"}`)
    if (position === "beforeChild" || position === "lastOnRoot") {
        return function (n: IvNode, domOnly: boolean) {
            if (n.domNode) {
                parentDomNd.insertBefore(n.domNode, nextDomNd);
            } else {
                n.domNode = parentDomNd;
            }
        };
    } else if (position === "lastChild") {
        return function (n: IvNode, domOnly: boolean) {
            if (n.domNode) {
                parentDomNd.appendChild(n.domNode);
                // appendChild(parentDomNd, n.domNode);
            } else {
                n.domNode = parentDomNd;
            }
        };
    } else {
        return function () {
            console.log("TODO: VIEW APPEND: ", position)
            logView(pv, "getViewInsertFunction for " + cnt.uid)
        }
    }
}

/**
 * Delete container content
 */
function checkContainer(v: IvView, idx: number, firstTime: boolean) {
    let container = v.nodes![idx] as IvContainer;
    if (!container || container.subKind !== "##block") return; // happens when block condition has never been true
    let bc = container as IvBlockContainer, lastRefresh = bc.lastRefresh;
    // console.log("checkContainer", container.uid, "in=", v.uid, idx, "container.lastRefresh=", lastRefresh, "v.lastRefresh=", v.lastRefresh, "firstTime:", firstTime);

    if (!firstTime && lastRefresh !== v.lastRefresh) {
        // remove all nodes from DOM
        removeFromDom(v, bc);
    } else {
        let views = bc.views, nbrOfViews = views.length;
        if (firstTime) {
            //     for (let i = 0; nbrOfBlocks > i; i++) {
            //         runInstructions(blocks[i][1] as IvNode, "checkContainer 1");
            //     }
        } else {
            // console.log("previousNbrOfViews", bc.previousNbrOfViews, "nbrOfViews", nbrOfViews);
            if (nbrOfViews !== bc.previousNbrOfViews) {
                // disconnect the nodes that are still attached in the pool
                let pool = bc.viewPool, len = pool.length, view: IvView;
                for (let i = 0; len > i; i++) {
                    view = pool[i];
                    removeFromDom(view, view.nodes![0]);
                }
            }
            bc.previousNbrOfViews = nbrOfViews; // all views are immediately inserted

            //   for (let i = 0; nbrOfBlocks > i; i++) {
            //         nodes = blocks[i];
            //         runInstructions(nodes[1] as IvNode, "checkContainer 2");
            //     }
        }
    }
}

function insertInDom(nd: IvNode, insertFn: (n: IvNode, domOnly: boolean) => void) {
    // this function can only be called when cm = false
    if (nd.attached) return;
    insertFn(nd, true);
    nd.attached = true;
    if (nd.kind === "#fragment") {
        let f = nd as IvFragment, ch = f.firstChild;
        while (ch) {
            insertInDom(ch, insertFn);
            ch = ch.nextSibling;
        }
    } else if (nd.kind === "#container") {
        let k = (nd as IvContainer).subKind;
        if (k === "##cpt") {
            let cc = nd as IvCptContainer, tpl = cc.cptTemplate as Template, root = tpl ? tpl.view.nodes![0] : null;
            if (tpl) tpl.forceRefresh = true;
            if (root) insertInDom(root, insertFn);
        } else if (k === "##block") {
            let cb = nd as IvBlockContainer, views = cb.views;
            for (let i = 0; views.length > i; i++) {
                insertInDom(views[i].nodes![0], insertFn);
            }
        }
    }
}

// End view
// e.g. ζend(ζ, ζc, 0)
export function ζend(v: IvView, cm: boolean, containerIndexes?: (number[] | 0)) {
    if (containerIndexes) {
        let len = containerIndexes.length;
        for (let i = 0; len > i; i++) {
            checkContainer(v, containerIndexes[i], v.cm);
        }
    }
    if (!v.cm) return;

    v.cm = false;
    v.cmAppends = null;
}

// Element creation function
// e.g. ζelt(ζ, ζc, 0, 0, 0, "div", 1);
export function ζelt(v: IvView, cm: boolean, idx: number, parentLevel: number, name: string, hasChildren: 0 | 1, staticAttributes?: any[], staticProperties?: any[]) {
    if (!cm) return;
    let e = v.doc.createElement(name);
    if (staticAttributes) {
        let len = staticAttributes.length;
        for (let i = 0; len > i; i += 2) {
            e.setAttribute(staticAttributes[i], staticAttributes[i + 1]);
            // setAttribute(e, staticAttributes[i], staticAttributes[i + 1]);
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
        uid: "elt" + (++uidCount),
        idx: idx,
        parentIdx: -1,
        ns: "",
        domNode: e,
        attached: true,            // always attached when created
        nextSibling: undefined,
        firstChild: undefined,
        lastChild: undefined
    }
    v.nodes![idx] = nd;
    v.cmAppends![parentLevel]!(nd, false); // append in the parent DOM
    if (hasChildren) {
        v.cmAppends![parentLevel + 1] = function (n: IvNode, domOnly: boolean) {
            if (n.domNode) {
                e.appendChild(n.domNode);
                // appendChild(e, n.domNode);
            } else {
                n.domNode = e;
            }
            if (!domOnly) {
                appendChildToNode(nd, n);
            }
        }
    }
}

function appendChildToNode(p: IvParentNode, child: IvNode) {
    if (!p.firstChild) {
        p.firstChild = p.lastChild = child;
        child.nextSibling = undefined;
    } else {
        p.lastChild!.nextSibling = child
        p.lastChild = child;
    }
    child.parentIdx = p.idx;
}

// Text creation function
// e.g. ζtxt(ζ, ζc, 0, 1, 1, " Hello World ", 0);
export function ζtxt(v: IvView, cm: boolean, idx: number, parentLevel: number, statics: string | string[], nbrOfValues: number, ...values: any[]) {
    let nd: IvText;
    if (!nbrOfValues) {
        // static node: nbrOfValues === 0
        if (!cm) return;
        nd = createNode(v.doc.createTextNode(statics as string), undefined);
    } else {
        // dynamic node
        let pieces: string[], val: any, changed = false;
        if (cm) {
            pieces = (statics as string[]).slice(0);
        } else {
            nd = v.nodes![idx] as IvText;
            pieces = nd.pieces!;
        }

        for (let i = 0; nbrOfValues > i; i++) {
            val = getExprValue(v, 0, values[i]);
            if (val !== ζu) {
                changed = true;
                pieces![1 + i * 2] = (val === null || val === undefined) ? "" : val;
            }
        }

        if (cm) {
            nd = createNode(v.doc.createTextNode(pieces.join("") as string), pieces);
        } else {
            if (changed) {
                nd!.domNode.textContent = pieces.join("");
            }
            return;
        }
    }

    v.nodes![idx] = nd;
    v.cmAppends![parentLevel]!(nd, false); // append in the parent DOM

    function createNode(domNode, pieces): IvText {
        return {
            kind: "#text",
            uid: "txt" + (++uidCount),
            domNode: domNode,
            attached: true,
            idx: idx,
            parentIdx: -1,
            pieces: pieces,
            nextSibling: undefined
        }
    }
}

// Expression binding
// e.g. ζe(ζ, 0, name)
export function ζe(v: IvView, idx: number, value: any, iHolder?: number) {
    let ev = v;
    if (iHolder) {
        console.log("TODO: iHolder expr");
    }
    if (!ev.expressions) {
        // first time, expression is considered changed
        ev.expressions = [];
        ev.expressions[idx] = value;
    } else {
        let exp = ev.expressions;
        if (exp.length > idx && exp[idx] === value) return ζu;
        exp[idx] = value;
    }
    return value;
}

function getExprValue(v: IvView, iHolder: number, exprValue: any) {
    // exprValue is an array if instHolderIdx>0 as expression was deferred
    if (iHolder) {
        if (exprValue[2]) {
            let exprs = v.oExpressions!;
            // one-time expression
            if (exprs[2 * exprValue[0]]) {
                // already read
                return ζu;
            }
            exprs[2 * exprValue[0]] = 1;
            return exprValue[1];
        }
        return ζe(v, exprValue[0], exprValue[1], iHolder);
    }
    return exprValue;
}

// One-time expression evaluation
// e.g. ζo(ζ, 0, ζc? name : ζu)
export function ζo(v: IvView, idx: number, value: any, iHolder?: number): any {
    let exprs = v.oExpressions;
    if (!exprs) {
        exprs = v.oExpressions = [];
    }
    if (iHolder) {
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

// Fragment creation function
// e.g. 
export function ζfra(v: IvView, cm: boolean, idx: number, parentLevel: number) {
    if (!cm) return;
    let nd: IvFragment = {
        kind: "#fragment",
        uid: "fra" + (++uidCount),
        idx: idx,
        parentIdx: -1,
        ns: "",
        domNode: undefined,
        attached: true,            // always attached when created
        nextSibling: undefined,
        firstChild: undefined,
        lastChild: undefined
    }
    v.nodes![idx] = nd;
    let parentCmAppend = v.cmAppends![parentLevel]!;
    parentCmAppend(nd, false);
    v.cmAppends![parentLevel + 1] = function (n: IvNode, domOnly: boolean) {
        parentCmAppend(n, true);
        if (!domOnly) {
            appendChildToNode(nd, n);
        }
    }
}

// Container creation
// e.g. ζcnt(ζ, ζc, 1, 1, 1);
export function ζcnt(v: IvView, cm: boolean, idx: number, parentLevel: number, type: number) {
    if (!cm) return;
    let nd: IvContainer,
        parentCmAppend = v.cmAppends![parentLevel]!,
        cmAppend = function (n: IvNode, domOnly: boolean) {
            parentCmAppend(n, true); // append container content
        };
    if (type === 1) {
        // block container
        nd = <IvBlockContainer>{
            kind: "#container",
            subKind: "##block",
            uid: "cnb" + (++uidCount),
            idx: idx,
            parentIdx: -1,
            ns: "",
            domNode: undefined,
            attached: true,            // always attached when created
            nextSibling: undefined,
            views: [],
            viewPool: [],
            cmAppend: cmAppend,
            lastRefresh: 0,
            previousNbrOfViews: 0,
            insertFn: null
        };
    } else if (type === 2) {
        // cpt container
        nd = <IvCptContainer>{
            kind: "#container",
            subKind: "##cpt",
            uid: "cnc" + (++uidCount),
            idx: idx,
            parentIdx: -1,
            ns: "",
            domNode: undefined,
            attached: true,            // always attached when created
            nextSibling: undefined,
            cmAppend: cmAppend,
            cptTemplate: null,         // current component template
            cptParams: null            // shortcut to cptTemplate.params
        }
    } else {
        console.log("TODO: new cnt type");
        return null;
    }
    v.nodes![idx] = nd;
    parentCmAppend(nd, false); // append container in parent view
    return nd;
}

// Component Definition (& call if no params and no content)
// e.g. ζcpt(ζ, ζc, 2, 0, ζe(ζ, 0, alert), 1, ζs1);
export function ζcpt(v: IvView, cm: boolean, idx: number, parentLevel: number, exprCptRef: any, callImmediately: number, staticParams?: any[], iHolder?: number) {
    let container: IvCptContainer;
    if (cm) {
        // creation mode
        iHolder = iHolder || 0;

        // create cpt container
        container = ζcnt(v, cm, idx, parentLevel, 2) as IvCptContainer;

        let cptRef = getExprValue(v, iHolder, exprCptRef);
        if (cptRef === ζu) {
            console.log("[iv] Invalid component ref")
            return;
        }
        let tpl: Template = container.cptTemplate = cptRef()!;
        setParentView(tpl.view, v, container);
        tpl.disconnectObserver();
        let p = container.cptParams = tpl.params;
        if (staticParams) {
            // initialize static params
            let len = staticParams.length;
            for (let i = 0; len > i; i += 2) {
                p[staticParams[i]] = staticParams[i + 1];
            }
        }
    } else {
        // update mode
        container = v.nodes![idx] as IvCptContainer;
    }
    if (callImmediately) {
        ζcall(v, idx, container);
    }
}

// Component call - used when a component has content, params or param nodes
export function ζcall(v: IvView, idx: number, container?: IvCptContainer) {
    container = container || v.nodes![idx] as IvCptContainer;
    let tpl = container ? container.cptTemplate as Template : null;
    if (tpl) {
        let cm = v.cm;
        tpl.view.lastRefresh = v.lastRefresh - 1; // will be incremented by refresh()
        // if (container.cptContent) {
        //     tpl.params.$content = container.cptContent;
        //     let instr = container.cptContent.instructions;
        //     if (instr && instr.length) {
        //         tpl.forceRefresh = true;
        //     }
        // }
        if (cm) {
            // define cmAppend
            tpl.view.cmAppends = [container!.cmAppend!];
        } else {
            let root = tpl.view.nodes![0];
            if (!root.attached) {
                tpl.forceRefresh = true;
                let insertFn = getViewInsertFunction(v, container!);
                insertInDom(root, insertFn);
            }
        }
        tpl.refresh();
    }
}

// Attribute setter
// e.g. ζatt(ζ, 0, 1, "title", ζe(ζ, 0, exp()+123));
export function ζatt(v: IvView, iHolder: number, eltIdx: number, name: string, expr: any) {
    if (expr === ζu) return;
    if (!iHolder) {
        updateAttribute(v, iHolder, eltIdx, name, expr);
    } else {
        console.log("todo att expr")
    }
}

function updateAttribute(v: IvView, iHolder: number, eltIdx: number, name: string, expr: any) {
    let val = getExprValue(v, iHolder, expr);
    if (val !== ζu) {
        (v.nodes![eltIdx] as IvNode).domNode.setAttribute(name, val);
        // setAttribute((v.nodes![eltIdx] as IvNode).domNode, name, val);
    }
}

// Property setter
// e.g. ζpro(ζ, 0, 1, "title", ζe(ζ, 0, exp()+123));
export function ζpro(v: IvView, iHolder: number, eltIdx: number, name: string, expr: any) {
    if (expr === ζu) return;
    if (!iHolder) {
        setProperty(v, iHolder, eltIdx, name, expr);
    } else {
        console.log("todo prop expr")
    }
}

function setProperty(v: IvView, iHolder: number, eltIdx: number, name: string, expr: any) {
    let val = getExprValue(v, iHolder, expr);
    if (val !== ζu) {
        (v.nodes![eltIdx] as IvNode).domNode[name] = val;
    }
}

// Param setter
// e.g. ζpar(ζ, 0, 1, "title", ζe(ζ, 0, exp()+123));
export function ζpar(v: IvView, iHolder: number, eltIdx: number, name: string, expr: any) {
    if (expr === ζu) return;
    if (!iHolder) {
        setParam(v, iHolder, eltIdx, name, expr);
    } else {
        console.log("todo att expr")
    }
}

function setParam(v: IvView, iHolder: number, cptIdx: number, name: string, expr: any) {
    let val = getExprValue(v, iHolder, expr);
    if (val !== ζu) {
        let p = (v.nodes![cptIdx] as IvCptContainer).cptParams;
        if (p) {
            p[name] = val;
        }
    }
}

// Event listener
// ζevt(ζ, ζc, 1, 0, function (e) {doSomething()});
export function ζevt(v: IvView, cm: boolean, idx: number, eltIdx: number, eventName: string, handler: (e: any) => void) {
    if (cm) {
        // get associated elt
        let domNode = v.nodes![eltIdx].domNode;
        if (!domNode) {
            console.log("[ERROR] Invalid ζevt call: parent element must have a DOM node");
            return;
        }
        // create and register event listener
        let nd: IvEltListener = {
            kind: "#listener",
            uid: "evt" + (++uidCount),
            idx: idx,
            parentIdx: eltIdx,
            nextSibling: undefined,
            domNode: domNode,
            attached: true,
            callback: handler
        }
        v.nodes![idx] = nd;
        domNode.addEventListener(eventName, function (evt: any) {
            if (nd.callback) {
                nd.callback(evt);
            }
        });
    } else {
        // update callback as it may contain different closure values
        (v.nodes![idx] as IvEltListener).callback = handler;
    }
}

interface SiblingDomPosition {
    position: "lastChild" | "beforeChild" | "lastOnRoot" | "defer";
    nextDomNd?: any;
    parentDomNd: any;
}

function findNextSiblingDomNd(v: IvView, nd: IvNode): SiblingDomPosition {
    while (true) {
        if (!nd) {
            console.log("nd is null!!")
        }
        // if (nd.contentData) {
        //     // nd is the root of a light-dom projection
        //     let cd = nd.contentData, host = cd.contentHost;
        //     // console.log("> has content data, host:", host ? host.uid : "XX")
        //     if (host) {
        //         if (host.kind === "#element") {
        //             return { position: "lastChild", parentDomNd: host.domNode };
        //         } else {
        //             return findNextSiblingDomNd(cd.contentHostNodes!, host);
        //         }
        //     } else {
        //         return { position: "defer", parentDomNd: undefined };
        //     }
        // }

        if (nd.idx === 0) {
            // console.log("> is root - is attached:", nd.attached)
            if (!nd.attached) {
                return { position: "defer", parentDomNd: undefined };
            }
            // root node has no sibling
            let pView = v.parentView;
            if (!pView) {
                return { position: "lastOnRoot", parentDomNd: v.rootDomNode, nextDomNd: v.anchorNode };
            } else {
                return findNextSiblingDomNd(pView, v.container as IvNode)
            }
        }

        // find next node that is attached
        if (nd.nextSibling) {
            // console.log("> is not last")
            let sdp = findFirstDomNd(v, nd.nextSibling, getParentDomNd(v, nd));
            if (sdp) return sdp;
            // if not found (e.g. node not attached) we shift by 1
            nd = nd.nextSibling;
        } else {
            // nd is last sibling
            let parent = v.nodes![nd.parentIdx] as IvParentNode;
            if (parent.kind === "#element") {
                return { position: "lastChild", parentDomNd: getParentDomNd(v, nd) };
            }
            // parent is a fragment (or variant)
            return findNextSiblingDomNd(v, parent);
        }
    }

    function findFirstDomNd(v: IvView, nd: IvNode, parentDomNd: any): SiblingDomPosition | null {
        if (!nd) return null;
        if (nd.kind === "#element" || nd.kind === "#text") {
            return { position: "beforeChild", nextDomNd: nd.domNode, parentDomNd: parentDomNd };
        } else if (nd.kind === "#fragment") {
            let sdp: SiblingDomPosition | null, ch = (nd as IvParentNode).firstChild;
            while (ch) {
                sdp = findFirstDomNd(v, ch, parentDomNd);
                if (sdp) {
                    return sdp;
                }
                ch = ch.nextSibling!;
            }
            // not found
            return null;
        } else if (nd.kind === "#container") {
            let container = nd as IvContainer, sdp: SiblingDomPosition | null = null;
            if (container.subKind === "##block") {
                let views = (container as IvBlockContainer).views, len = views.length;
                for (let i = 0; len > i; i++) {
                    sdp = findFirstDomNd(views[i], views[i].nodes![0] as IvNode, parentDomNd);
                    if (sdp) break;
                }
            } else if (container.subKind === "##cpt") {
                let tpl = (container as IvCptContainer).cptTemplate as Template, view = tpl.view;
                sdp = findFirstDomNd(view, view.nodes![0], parentDomNd);
            }
            return sdp ? sdp : null;
        } else {
            throw new Error("TODO findFirstDomNd: " + nd.kind); // e.g. #decorator
        }
    }
}

function getParentDomNd(v: IvView, nd: IvNode) {
    // console.log("getParentDomNd", c[0].uid, nd.uid, nd.idx, nd.contentData !== undefined)
    // if (nd.contentData) {
    //     // this node is a light-dom root node
    //     if (!nd.attached) return null;
    //     let cd = nd.contentData, parent = cd.contentHost;
    //     if (parent && parent.domNode !== nd.domNode) {
    //         return parent.domNode;
    //     } else {
    //         return getParentDomNd(cd.contentHostNodes!, parent!);
    //     }
    // }
    if (nd.idx === 0) {
        // nd is a root node
        if (v.parentView) {
            return getParentDomNd(v.parentView, v.container as IvNode);
        } else {
            return v.rootDomNode;
        }
    }
    return (v.nodes![nd.parentIdx] as IvNode).domNode;
}

function removeFromDom(v: IvView, nd: IvNode) {
    if (!nd || !nd.attached) return;
    // console.log("removeFromDom", nd.uid);
    if (nd.kind === "#text" || nd.kind === "#element") {
        let pdn = getParentDomNd(v, nd);
        nd.attached = false;
        if (pdn) {
            // console.log("removeChild:", nd.uid, "/", nd.domNode.uid, "in=", pdn ? pdn.uid : "XX")
            pdn.removeChild(nd.domNode);
        }
    } else if (nd.kind === "#container") {
        if (nd["subKind"] === "##block") {
            let container = nd as IvBlockContainer;
            let views = container.views, len = views.length, root: IvNode;
            // remove all blocks from dom and put them in blockPool
            for (let i = 0; len > i; i++) {
                root = views[i].nodes![0];
                removeFromDom(views[i], root);
                root.attached = false;
                if (root.kind === "#container" || root.kind === "#fragment") {
                    root.domNode = undefined;
                }
            }
            // move previous nodes to blockPool
            container.views = [];
            container.previousNbrOfViews = 0;
            container.viewPool = views.concat(container.viewPool);
        } else if (nd["subKind"] === "##cpt") {
            let tpl = (nd as IvCptContainer).cptTemplate as Template
            let nodes = tpl.view.nodes!, root = nodes[0];
            removeFromDom(tpl.view, root);
            root.attached = false;
            if (root.kind === "#container" || root.kind === "#fragment") {
                root.domNode = undefined;
            }
        }
        // note: we have to keep container attached (except if they are root)
    } else if (nd.kind === "#fragment") {
        let f = nd as IvFragment;
        f.attached = false;
        // if (f.contentRoot) {
        //     let content = f.contentRoot!, cd = content.contentData!;
        //     removeFromDom(cd.rootNodes, content);
        // } else 
        if (f.firstChild) {
            let nd = f.firstChild;
            while (nd) {
                removeFromDom(v, nd);
                nd = nd.nextSibling!;
            }
        }
        f.domNode = undefined;
    } else {
        console.log("TODO removeFromDom for " + nd.kind)
    }
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

function logView(v: IvView, label = "", rootId?: string) {
    if (!rootId || v.uid === rootId) {
        console.log("");
        console.log(SEP);
        if (label) {
            console.log(label + ":")
        }
        logViewNodes(v);
    }
}

export function logViewNodes(v: IvView, indent: string = "") {
    if (!v.nodes) {
        console.log(`${indent}${v.uid} - no nodes`);
        return;
    }
    let pv = v.parentView ? v.parentView.uid : "XX"
    console.log(`${indent}*${v.uid}* cm:${v.cm} isTemplate:${v.isTemplate} parentView:${pv}`);
    let len = v.nodes.length, nd: IvNode, space = "";
    for (let i = 0; len > i; i++) {
        nd = v.nodes[i];
        if (!nd) {
            console.log(`${indent}[${i}] XX`)
            continue;
        }

        if (nd.uid.length < 5) {
            space = ["     ", "    ", "   ", "  ", " "][nd.uid.length];
        } else {
            space = "";
        }
        if (nd.kind === "#container") {
            let cont = nd as IvContainer;
            let dn = cont.domNode ? cont.domNode.uid : "XX";
            console.log(`${indent}[${i}] ${nd.uid}${space} ${dn} attached:${nd.attached ? 1 : 0} parent:${nd.parentIdx} nextSibling:${nd.nextSibling ? nd.nextSibling.uid : "X"}`);
            if (cont.subKind === "##block") {
                let cb = cont as IvBlockContainer, len2 = cb.views.length;
                if (!len2) {
                    console.log(`${indent + "  "}- no child views`);
                } else {
                    for (let j = 0; len2 > j; j++) {
                        if (!cb.views[j]) {
                            console.log(`${indent + "  "}- view #${j} UNDEFINED`);
                            continue;
                        }
                        let childView = cb.views[j];
                        dn = childView.rootDomNode ? childView.rootDomNode.$uid : "XX";
                        console.log(`${indent + "  "}- view #${j}`);
                        logViewNodes(cb.views[j], "    " + indent);
                    }
                }
            } else if (cont.subKind === "##cpt") {
                let cc = cont as IvCptContainer, tpl = cc.cptTemplate;
                if (!tpl) {
                    console.log(`${indent + "  "}- no template`);
                } else {
                    // console.log(`${indent + "  "}- light DOM first Child: [${cont.firstChild ? cont.firstChild!.uid : "XX"}]`);
                    console.log(`${indent + "  "}- shadow DOM:`);
                    logViewNodes(tpl["view"], "    " + indent);
                }
            } else {
                console.log(`${indent + "  "}- ${cont.subKind} container`);
            }
        } else {
            let dn = nd.domNode ? nd.domNode.uid : "XX", lastArg = "";
            if (nd.domNode && nd.kind === "#text") {
                lastArg = " text=#" + nd.domNode["_textContent"] + "#";
            } else if (nd.kind === "#fragment" || nd.kind === "#element") {
                let children: string[] = [], ch = (nd as IvFragment).firstChild;
                while (ch) {
                    children.push(ch.uid);
                    ch = ch.nextSibling;
                }
                lastArg = " children:[" + children.join(", ") + "]";
            }
            console.log(`${indent}[${nd.idx}] ${nd.uid}${space} ${dn} attached:${nd.attached ? 1 : 0} parent:${nd.parentIdx} nextSibling:${nd.nextSibling ? nd.nextSibling.uid : "X"}${lastArg}`);
        }
    }
}