
import { VdRenderer, VdGroupNode, VdNodeKind, VdFunctionCpt, VdCreateGroup, VdChangeKind, VdChangeInstruction, VdNode, VdTextNode, VdElementNode, VdContainer, VdUpdateText, VdUpdateProp, VdDeleteGroup, VdUpdateAtt, VdDataNode, VdReplaceGroup } from "./vdom";
import { getDataNode, getDataNodes, $nextRef } from './iv';

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
    node: VdGroupNode;
    vdom: VdGroupNode;
    doc: HtmlDoc;

    constructor(public htmlElement, public vdFunction: VdFunctionCpt, doc?: HtmlDoc) {
        // create the root group and its create instruction
        let vdom = this.vdom = <VdGroupNode>{
            kind: VdNodeKind.Group,
            index: 0,
            ref: $nextRef(),
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

    getDataNodes(nodeName: string, parent?: VdContainer) {
        return getDataNodes(<VdGroupNode>(this.node), nodeName, parent);
    }

    getDataNode(nodeName: string, parent?: VdContainer) {
        return getDataNode(<VdGroupNode>(this.node), nodeName, parent);
    }

    refresh($d) {
        // refresh the virtual dom
        this.node = this.vdom;
        this.vdFunction(this, $d);
        this.processChanges(this.vdom);
    }

    processChanges(vdNode: VdGroupNode) {
        // update the HTML DOM from the change list
        processChanges(vdNode, this.htmlElement, this.doc);
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
                createDomNode(cg.node, df, doc, null);
                rootDomContainer.appendChild(df);
                replaceDomNode(df, rootDomContainer, cg.node);
            } else {
                insertGroupContent(cg.node, cg.parent.domNode, cg.nextSibling, doc);
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
            let dg = <VdDeleteGroup>chge;
            removeGroupFromDom(dg.node, true, dg.position === 0 && dg.nbrOfNextSiblings === 0);
        } else if (chge.kind === VdChangeKind.UpdateAtt) {
            let ua = chge as VdUpdateAtt;
            ua.node.domNode.setAttribute(ua.name, ua.value);
        } else if (chge.kind === VdChangeKind.ReplaceGroup) {
            let rg = chge as VdReplaceGroup;
            // delete current content
            removeGroupFromDom(rg.oldNode, true, rg.position === 0 && rg.nextSibling === null);
            // inject new content
            insertGroupContent(rg.newNode, rg.parent ? rg.parent.domNode : null, rg.nextSibling, doc);
        } else {
            console.error("[iv html renderer] Unsupported change kind: " + chge.kind);
        }
    }
    vdom.changes = null;
}

function insertGroupContent(groupNd, domNode, nextSibling, doc: HtmlDoc) {
    let df = doc.createDocFragment(), ns: string | null = null;
    if (domNode) {
        ns = domNode.namespaceURI;
        if (ns && ns.match(RX_HTML)) {
            ns = null;
        }
    }
    createDomNode(groupNd, df, doc, ns);

    // look for the previous sibling
    if (domNode) {
        let done = false;
        if (nextSibling) {
            if (nextSibling.domNode) {
                domNode.insertBefore(df, nextSibling.domNode);
                done = true;
            }
        } else {
            domNode.appendChild(df);
            done = true;
        }
        if (done) {
            replaceDomNode(df, domNode, groupNd);
        }
    }
}

function createDomNode(nd: VdNode, domParent, doc: HtmlDoc, ns: string | null) {
    if (nd.domNode) {
        // node has already been projected, so we have to disconnect them from their current parent
        let dnd = nd.domNode;
        if (dnd.parentNode) {
            dnd.parentNode.removeChild(dnd);
        }
        domParent.appendChild(dnd);
        return;
    }
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
        case VdNodeKind.Data:
            // ignore
            break;
        default:
            console.error("[iv html renderer] Invalid node kind: " + nd.kind);
    }
}

function processChildNodes(nd: VdContainer, domParent, doc: HtmlDoc, ns: string | null) {
    let ch = nd.children, len = ch.length;
    for (let i = 0; len > i; i++) {
        createDomNode(ch[i], domParent, doc, ns);
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

function removeGroupFromDom(group: VdGroupNode, removeInDom: boolean, checkForFastDelete: boolean) {
    let ch = group.children, nd, parentDomNd = group.domNode;
    if (ch) {
        let len = ch.length;

        if (removeInDom && checkForFastDelete) {
            // group may contain data nodes, so we have to count visible elememnts
            if (countGroupDomChildren(group) === parentDomNd.childNodes.length) {
                // if group is the only child of the parent dom nd, use DOM node through the fast track
                // cf. https://github.com/krausest/js-framework-benchmark/blob/85a6d94f31c79c75eb2d4d9bc7ce997e3dfde938/vanillajs-non-keyed/src/Main.js#L262-L284

                parentDomNd.textContent = "";
                removeInDom = false;
            }
        }

        // recursively clean child nodes
        for (let i = 0; len > i; i++) {
            nd = ch[i];
            if (nd.kind === VdNodeKind.Group) {
                removeGroupFromDom(nd, removeInDom, false);
            } else if (nd.kind === VdNodeKind.Text || nd.kind === VdNodeKind.Element) {
                if (removeInDom && nd.domNode && nd.domNode.parentNode === parentDomNd) {
                    // we have to test that the node in in parentDomNd as it may have been already removed
                    // and re-injected in another parent (cf. ReplaceGroup instruction)
                    parentDomNd.removeChild(nd.domNode);
                }
            }
        }
    }
    group.domNode = null;
}

function countGroupDomChildren(group: VdGroupNode): number {
    let r = 0, ch = group.children, len = ch.length, c, k;
    for (let i = 0; len > i; i++) {
        c = ch[i];
        k = c.kind;
        if (k === VdNodeKind.Group) {
            r += countGroupDomChildren(c);
        } else if (k !== VdNodeKind.Data) {
            r++;
        }
    }
    return r;
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
