import { XtmlFragment, XtmlElement, XtmlParam, XtmlText } from './xtml-ast';
import { parse } from './xtml-parser';
import { IvDocument, IvTemplate, IvView, IvNode } from './types';
import { hasProperty, create } from '../trax/trax';
import { createView, ζtxtD, ζeltD, ζcptD, ζviewD, ζcallD, ζendD, ζpnode } from '.';

interface RenderOptions {
    doc?: IvDocument;
    timeout?: number;
}

const U = undefined;

export async function renderXtml(xtml: string, htmlElement: any, resolver?: (ref: string) => Promise<any>, options?: RenderOptions) {
    return renderXtmlFragment(parse(xtml), htmlElement, resolver, options);
}

export async function renderXtmlFragment(xf: XtmlFragment, htmlElement: any, resolver?: (ref: string) => Promise<any>, options?: RenderOptions) {
    // get all dependencies in parallel
    let xfRefs = xf.refs,
        refs: { [key: string]: any } = {},
        doc = (options && options.doc) ? options.doc : document;

    if (xfRefs.length > 0) {
        if (resolver === U) {
            error("resolver must be provided when xtml references are defined")
        } else {
            let promises: Promise<any>[] = [], len = xfRefs.length;
            for (let i = 0; len > i; i++) {
                promises.push(resolver(xfRefs[i].identifier));
            }
            // todo: global timeout? - cf. options.timeout
            let r = await Promise.all(promises);
            for (let i = 0; len > i; i++) {
                refs[xfRefs[i].identifier] = r[i];
            }
        }
    }
    renderRootContent(xf.children, htmlElement);
    return;

    function error(msg: string) {
        throw msg; // todo
    }

    // render content that is not embedded in a template -> will be directly inserted in the DOM
    function renderRootContent(nodes: (XtmlElement | XtmlText)[] | undefined, container: any) {
        if (nodes === U) return;
        let len = nodes.length, nd: XtmlElement | XtmlText, pk: string;
        for (let i = 0; len > i; i++) {
            nd = nodes[i];
            if (nd.kind === "#text") {
                // create text node
                container.appendChild(doc.createTextNode(nd.value));
            } else if (nd.kind === "#element") {
                let e = doc.createElement(nd.name!);
                container.appendChild(e);
                if (nd.params !== U) {
                    for (let p of nd.params) {
                        pk = p.kind;
                        if (pk === "#param") {
                            e.setAttribute(p.name, getParamValue(p));
                        } else if (pk === "#property") {
                            e[p.name] = getParamValue(p);
                        } else {
                            error("Unsupported param: " + pk);
                        }
                    }
                }
                renderRootContent(nd.children, e);
                // todo: call decorators after content has been rendered
            } else if (nd.kind === "#component") {
                let cpt: undefined | (() => IvTemplate);
                if (nd.nameRef) {
                    cpt = refs[nd.nameRef!] as () => IvTemplate;
                }
                if (cpt === U || typeof cpt !== "function") {
                    error("Invalid component reference: '" + nd.nameRef + "'");
                } else {
                    let tpl = cpt(), api = tpl.$api;
                    (tpl as any).document = doc;
                    tpl.attach(container);
                    if (nd.params) {
                        for (let p of nd.params) {
                            pk = p.kind;
                            if (pk === "#param") {
                                if (!hasProperty(api, p.name as string)) {
                                    error("Invalid parameter: " + p.name);
                                } else {
                                    api[p.name] = getParamValue(p);
                                }
                            } else {
                                error("Unsupported component param type: " + pk);
                            }
                        }
                    }
                    if (nd.children) {
                        let v: IvView = createContentView(container);
                        renderCptContent(nd, v, 0, v, 0, api);
                        assignContent(api, v);
                    }
                    tpl.render();
                }
            }
        }
    }

    function renderCptContent(node: XtmlElement, v: IvView, parentLevel: number, pnv: IvView, pnParentIdx: number, api?: any) {
        // pnv is the view that must be used for internal param nodes (will be identical to v otherwise)
        // pnParentLevel is also the parentLevel that must be used for param nodes
        // api is defined if node is the root component or if it is a param node connected to the root component

        // note: iFlag is used by child views to find the parent view that holds instructions (only js block views and async block views)
        // so it will always be 1 here
        let children = node.children, params: any[] | undefined, properties: any[] | undefined, len = 0;
        if (children === U || children.length === 0) return;
        for (let ch of children) {
            let labels: 0 = 0; // todo
            if (ch.kind === "#text") {
                // ζtxtD(v: IvView, cm: boolean, iFlag: number, idx: number, parentLevel: number, labels: any[] | 0, statics: string | string[], nbrOfValues: number, ...values: any[])
                ζtxtD(v, true, 1, v.nodeCount!++, parentLevel, labels, ch.value, 0);
            } else if (ch.kind === "#element") {
                updateParamsAndProperties(ch);
                // ζeltD(v: IvView, cm: boolean, idx: number, parentLevel: number, name: string, hasChildren: 0 | 1, labels?: any[] | 0, staticAttributes?: any[], staticProperties?: any[]) {
                ζeltD(v, true, v.nodeCount!++, parentLevel, ch.name!, ch.children ? 1 : 0, labels, params, properties);
                renderCptContent(ch, v, parentLevel + 1, v, parentLevel + 1);
            } else if (ch.kind === "#paramNode") {
                if (!ch.name) {
                    error("Invalid param node name");
                } else if (api !== U) {
                    // we are at root level
                    if (hasProperty(api, ch.name)) {
                        let pnd = api[ch.name];
                        if (!pnd) {
                            pnd = create(api, ch.name);
                        }
                        setParamNode(ch, pnd);
                    } else if (hasProperty(api, ch.name + "List")) {
                        // first ensure data list exists
                        let list = api[ch.name + "List"];
                        if (!list) {
                            list = create(api, ch.name + "List");
                        }
                        // then create item
                        let sz = list.length, pnd = list[sz];
                        if (!pnd) {
                            pnd = create(list, sz);
                        }
                        setParamNode(ch, pnd);
                    } else {
                        error("Invalid param node: " + ch.name);
                    }
                } else {
                    if (v === pnv) {
                        error("Invalid param node '" + ch.name + "': param nodes can only be children of components or other param nodes");
                    } else {
                        // ζpnode(v: IvView, cm: boolean, iFlag: number, idx: number, parentIndex: number, name: string, instanceIdx: number, labels?: any[] | 0, staticParams?: any[] | 0, dynParamNames?: string[]) {
                        updateParamsAndProperties(ch);
                        let idx = pnv.nodeCount!++;
                        ζpnode(pnv, true, 0, idx, pnParentIdx, ch.name!, 0, labels, params);

                        if (ch.children) {
                            let v2 = ζviewD(pnv, 1, idx, 10, 0);
                            renderCptContent(ch, v2, 0, pnv, idx);
                            ζendD(v2, true);
                        }
                        // ζpnEnd doesn't need to be called as the pnode instance will not be reused
                    }
                }
            } else if (ch.kind === "#component") {
                // here api is necessarily undefined as the root component is handled in renderRootContent
                let callImmediately = 0;
                updateParamsAndProperties(ch);
                // ζcptD(v: IvView, cm: boolean, iFlag: number, idx: number, parentLevel: number, exprCptRef: any, callImmediately: number, labels?: any[] | 0, staticParams?: any[] | 0, dynParamNames?: string[]) {
                let idx = v.nodeCount!++;
                ζcptD(v, true, 1, idx, parentLevel, [0, refs[ch.nameRef!]], callImmediately, labels, params);
                if (ch.children) {
                    // (pv: IvView, iFlag: number, containerIdx: number, nbrOfNodes: number, instanceIdx: number, view?: IvView) 
                    let v2 = ζviewD(v, 1, idx, 10, 0); // todo: nbr of nodes instead of 10
                    renderCptContent(ch, v2, 0, v, idx);
                    ζendD(v2, true);
                }

                // ζcallD(v: IvView, idx: number, container?: IvCptContainer | 0, labels?: any[] | 0, dynParamNames?: string[]) {
                ζcallD(v, idx, 0, labels);
            } else if (ch.kind === "#decoratorNode") {
                error("Decorator nodes are not supported yet");
            }
        }

        return;

        function setParamNode(ch: XtmlElement, paramNode: any) {
            let idx = v.nodeCount!++;
            updateParamsAndProperties(ch);
            v.nodes![idx] = paramNode;
            if (params !== U) {
                len = params.length;
                for (let i = 0; len > i; i++) {
                    paramNode[params[i]] = params[i + 1];
                }
            }
            if (ch.children !== U) {
                let pnContentView: IvView = createContentView();
                pnContentView.parentView = v;
                // ζviewD(v, 1, 0, 0, 0, pnView);
                renderCptContent(ch, pnContentView, 0, v, idx, paramNode);
                assignContent(paramNode, pnContentView);
            }
        }

        function updateParamsAndProperties(nd: XtmlElement) {
            params = properties = U;
            if (nd.params !== U) {
                for (let p of nd.params) {
                    if (p.kind === "#param") {
                        if (params === U) {
                            params = [p.name, getParamValue(p)];
                        } else {
                            params.push(p.name);
                            params.push(getParamValue(p));
                        }
                    } else if (p.kind === "#property") {
                        if (properties === U) {
                            properties = [p.name, getParamValue(p)];
                        } else {
                            properties.push(p.name);
                            properties.push(getParamValue(p));
                        }
                    } else {
                        console.log("TODO: element param ", p.kind)
                    }
                }
            }
        }
    }

    function getParamValue(p: XtmlParam) {
        if (p.holdsValue) {
            if (p.valueRef !== U) return refs[p.valueRef];
            return p.value;
        }
        return ""; // no-value attribute - cf. https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
    }

    function createContentView(container?: any): IvView {
        let v = createView(null, null, 0);
        v.doc = doc;
        v.instructions = [];
        v.nodeCount = 0;
        v.nodes = new Array(10); // todo: count actual number of nodes instead of 10
        if (container !== U) {
            v.cmAppends = [function (n: IvNode) {
                container.appendChild(n.domNode);
            }];
        }
        return v;
    }

    function assignContent(api: any, v: IvView) {
        if (v.nodeCount! > 0) {
            api["$content"] = v;
        }
    }

}