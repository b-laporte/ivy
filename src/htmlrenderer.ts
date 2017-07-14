
import { VdRenderer, VdRuntime, VdGroupNode, VdNodeKind, VdFunction, VdCreateGroup, VdChangeKind, VdChangeInstruction, VdNode, VdTextNode, VdElementNode, VdContainer, VdUpdateText, VdUpdateProp, VdDeleteGroup, VdUpdateAtt } from "./vdom";
import { ivRuntime } from './iv';

export function htmlRenderer(htmlElement, func, doc?: HtmlDoc): HtmlRenderer {
    return new Renderer(htmlElement, func, doc);
}

interface HtmlRenderer extends VdRenderer {
    refresh: (data?: {}) => void;
}

interface HtmlDoc {
    createTextNode(data: string): any;
    createDocFragment(): any;
    createElement(name: string): any;
    createElementNS(ns: string, name: string): any;
}

const RX_EVT_HANDLER = /^on/, RX_HTML = /html/i;

class Renderer implements HtmlRenderer {
    rt = ivRuntime;
    parent: VdGroupNode;
    vdom: VdGroupNode;
    doc: HtmlDoc;

    constructor(public htmlElement, public vdFunction: VdFunction, doc?: HtmlDoc) {
        // create the root group and its create instruction
        let vdom = this.vdom = <VdGroupNode>{
            kind: VdNodeKind.Group,
            index: 0,
            ref: ++ivRuntime.refCount,
            cm: 1,
            changes: null,
            children: [],
            domNode: null,
            parent: null
        }
        let cg: VdCreateGroup = {
            kind: VdChangeKind.CreateGroup,
            node: vdom,
            parent: null,
            position: -1,
            nextSibling: null
        }
        vdom.changes = [cg];

        this.doc = doc || {
            createDocFragment: function () {
                return document.createDocumentFragment();
            },
            createTextNode: function (data: string): any {
                return document.createTextNode(data);
            },
            createElement: function (name: string): any {
                return document.createElement(name);
            },
            createElementNS: function (ns: string, name: string): any {
                return document.createElementNS(ns, name);
            }
        }
    }

    refresh($d) {
        // refresh the virtual dom
        this.parent = this.vdom;
        this.vdFunction(this, $d);

        // update the HTML DOM from the change list
        processChanges(this.vdom, this.htmlElement, this.doc);
    }
}

/**
 * Process refresh instructions after each vdom refresh
 */
function processChanges(vdom, rootDomContainer, doc: HtmlDoc) {
    if (!vdom || !vdom.changes || !vdom.changes.length) {
        return;
    }

    for (let chge of vdom.changes as VdChangeInstruction[]) {
        if (chge.kind === VdChangeKind.CreateGroup) {
            let cg = chge as VdCreateGroup;
            if (!cg.parent) {
                // root node
                let df = doc.createDocFragment();
                processNode(cg.node, df, doc, null);
                rootDomContainer.appendChild(df);
                replaceDomNode(df, rootDomContainer, cg.node);
            } else {
                // create elements
                let df = doc.createDocFragment(), ns: string | null = null, pvnd = cg.parent;
                if (pvnd && pvnd.domNode) {
                    ns = pvnd.domNode.namespaceURI;
                    if (ns && ns.match(RX_HTML)) {
                        ns = null;
                    }
                }
                processNode(cg.node, df, doc, ns);

                // look for the previous sibling
                if (pvnd && pvnd.domNode) {
                    let done = false;
                    if (cg.nextSibling) {
                        if (cg.nextSibling.domNode) {
                            pvnd.domNode.insertBefore(df, cg.nextSibling.domNode);
                            done = true;
                        }
                    } else {
                        pvnd.domNode.appendChild(df);
                        done = true;
                    }
                    if (done) {
                        replaceDomNode(df, pvnd.domNode, cg.node);
                    }
                }
            }
        } else if (chge.kind === VdChangeKind.UpdateText) {
            let ut = chge as VdUpdateText, nd = ut.node;
            if (nd && nd.domNode) {
                nd.domNode.textContent = nd.value;
            }
        } else if (chge.kind === VdChangeKind.UpdateProp) {
            let up = chge as VdUpdateProp, nd = up.node, prop = up.name, ns;
            if (nd && nd.domNode) {
                ns = nd.domNode.namespaceURI;
                // when <:xmlns .../> is supported there will be no need for the following check:
                // as the compiler already transformed prop to atts if the node namespace is not HTML
                if (!ns.match(RX_HTML)) {
                    nd.domNode.setAttribute(prop, up.value);
                } else {
                    if (prop === "class" || prop === "className") {
                        nd.domNode.className = up.value;
                    } else {
                        nd.domNode[prop] = up.value;
                    }
                }
            }
        } else if (chge.kind === VdChangeKind.DeleteGroup) {
            removeGroupFromDom((<VdDeleteGroup>chge).node);
        } else if (chge.kind === VdChangeKind.UpdateAtt) {
            let ua = chge as VdUpdateAtt;
            ua.node.domNode.setAttribute(ua.name, ua.value);
        } else {
            console.error("[iv html renderer] Unsupported change kind: " + chge.kind);
        }
    }
    vdom.changes = null;
}

function processNode(nd: VdNode, domParent, doc: HtmlDoc, ns: string | null) {
    switch (nd.kind) {
        case VdNodeKind.Element:
            createElementDomNode(nd as VdElementNode, domParent, doc, ns);
            break;
        case VdNodeKind.Group:
            nd.domNode = domParent;
            processChildNodes(<VdGroupNode>nd, domParent, doc, ns);
            break;
        case VdNodeKind.Text:
            let domNd = doc.createTextNode((<VdTextNode>nd).value);
            nd.domNode = domNd;
            domParent.appendChild(domNd);
            break;
        default:
            console.error("[iv html renderer] Invalid node kind: " + nd.kind);
    }
}

function processChildNodes(nd: VdContainer, domParent, doc: HtmlDoc, ns: string | null) {
    let ch = nd.children, len = ch.length;
    for (let i = 0; len > i; i++) {
        processNode(ch[i], domParent, doc, ns);
    }
}

function createElementDomNode(nd: VdElementNode, domParent, doc: HtmlDoc, ns: string | null) {
    let props = nd.props, atts = nd.atts, val, domNd;
    if (atts && atts["xmlns"]) {
        ns = atts["xmlns"];
    }
    if (ns) {
        domNd = doc.createElementNS(ns, nd.name);
    } else {
        domNd = doc.createElement(nd.name)
    }

    if (props) {
        if (ns && !ns.match(RX_HTML)) {
            // remove this block when <:xmlns .../> is supported
            for (let k in props) {
                if (!props.hasOwnProperty(k)) continue;
                domNd.setAttribute(k, props[k]);
            }
        } else {
            for (let k in props) {
                if (!props.hasOwnProperty(k)) continue;
                // TODO support complex attributes such as class.foo
                // TODO support event handlers
                val = props[k];
                if (k === "class" || k === "className") {
                    domNd.className = val;
                } else if (k === "style") {
                    domNd.setAttribute(k, val);
                } else if (val.call) {
                    if (k.match(RX_EVT_HANDLER)) {
                        addEvtListener(domNd, nd, k);
                    }
                } else {
                    domNd[k] = val;
                }
            }
        }
    }
    if (atts) {
        for (let k in atts) {
            if (!atts.hasOwnProperty(k)) continue;
            domNd.setAttribute(k, atts[k]);
        }
    }
    nd.domNode = domNd;
    domParent.appendChild(domNd);
    processChildNodes(nd, domNd, doc, ns);
}

function addEvtListener(domNd, nd, propName) {
    domNd.addEventListener(propName.substring(2), function (evt) {
        nd.props[propName].call(nd, evt);
    });
}

function removeGroupFromDom(group: VdGroupNode) {
    let ch = group.children, nd, parentDomNd = group.domNode;
    if (ch) {
        let len = ch.length;
        for (let i = 0; len > i; i++) {
            nd = ch[i];
            if (nd.kind === VdNodeKind.Group) {
                removeGroupFromDom(nd);
            } else if (nd.kind === VdNodeKind.Element) {
                parentDomNd.removeChild(nd.domNode);
                nd.domNode = null;
                // todo recursively clean children vdom
            } else if (nd.kind === VdNodeKind.Text) {
                parentDomNd.removeChild(nd.domNode);
                nd.domNode = null;
            }
        }
    }
    group.domNode = null;
}

/**
 * Recursively replace domNd1 by domNd2 in all virtual dom nodes, starting at vnd
 * @param domNd1 
 * @param domNd2 
 * @param vnd 
 */
function replaceDomNode(domNd1, domNd2, vnd: VdNode) {
    if (domNd1 === domNd2) {
        return;
    }
    if (vnd.domNode === domNd1) {
        vnd.domNode = domNd2;
        if (vnd.kind === VdNodeKind.Group) {
            let g = <VdGroupNode>vnd, ch = g.children;
            for (let i = 0; ch.length > i; i++) {
                replaceDomNode(domNd1, domNd2, ch[i]);
            }
        }
    }
}
