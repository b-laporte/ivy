import { XtrChildElement, XtrCData } from '../xtr/ast';
import { XtrFragment, XtrElement, XtrParam, XtrText } from '../xtr/ast';
import { parse } from '../xtr/parser';
import { IvDocument, IvTemplate, IvView, IvNode, IvCptContainer } from './types';
import { hasProperty, create } from '../trax';
import { createView, ζtxtD, ζeltD, ζcptD, ζviewD, ζcallD, ζendD, ζpnode, API, required, IvElement, decorator, ζdeco, ζdecoEnd, createContainer, ζdecoD, ζdecoEndD, ζfraD } from '.';
import { IvEventEmitter } from './events';

interface RenderOptions {
    doc?: IvDocument;
    timeout?: number;
}

const U = undefined;

export async function renderXtr(xtr: string, htmlElement: any, resolver?: (ref: string) => Promise<any>, options?: RenderOptions) {
    return renderXtrFragment(await parse(xtr), htmlElement, resolver, options);
}

export async function renderXtrFragment(xf: XtrFragment, htmlElement: any, resolver?: (ref: string) => Promise<any>, options?: RenderOptions) {
    // console.log("xf", xf.toString());

    // get all dependencies in parallel
    let xfRefs = xf.refs,
        refs: { [key: string]: any } = {},
        doc = (options && options.doc) ? options.doc : document;

    if (xfRefs.length > 0) {
        if (resolver === U) {
            error("resolver must be provided when xtr references are defined")
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
    const rootView = createContentView(10);
    renderRootContent(xf.children, htmlElement);
    return;

    function error(msg: string) {
        throw "XTR Renderer: " + msg; // todo: error context
    }

    // render content that is not embedded in a template -> will be directly inserted in the DOM
    function renderRootContent(nodes: XtrChildElement[] | undefined, container: any) {
        if (nodes === U) return;
        let len = nodes.length, nd: XtrChildElement, nk: string, pk: string, decos: XtrParam[] | undefined;;
        for (let i = 0; len > i; i++) {
            decos = U;
            nd = nodes[i];
            nk = nd.kind;
            if (nk === "#text") {
                // create text node
                container.appendChild(doc.createTextNode((nd as XtrText).value));
            } else if (nk === "#cdata") {
                // create text node
                container.appendChild(doc.createTextNode((nd as XtrCData).content));
                checkCData(nd as XtrCData);
            } else if (nk === "#element") {
                let e = doc.createElement((nd as XtrElement).name!);
                container.appendChild(e);
                if (nd.params !== U) {
                    for (let p of nd.params) {
                        pk = p.kind;
                        if (pk === "#param") {
                            e.setAttribute(p.name, getParamValue(p));
                        } else if (pk === "#property") {
                            e[p.name] = getParamValue(p);
                        } else if (pk === "#decorator") {
                            if (decos === U) {
                                decos = [p];
                            } else {
                                decos.push(p);
                            }
                        } else {
                            error("Unsupported param: " + pk);
                        }
                    }
                }
                renderRootContent((nd as XtrElement).children, e);
                callDecorators(rootView, e, decos);
            } else if (nk === "#fragment") {
                renderRootContent((nd as XtrElement).children, container);
                checkFragment(nd as XtrFragment);
            } else if (nk === "#component") {
                let cpt: undefined | (() => IvTemplate);
                if ((nd as XtrElement).nameRef) {
                    cpt = refs[(nd as XtrElement).nameRef!] as () => IvTemplate;
                }
                if (cpt === U || typeof cpt !== "function") {
                    error("Invalid component reference: '" + (nd as XtrElement).nameRef + "'");
                } else {
                    let tpl = cpt(), api = tpl.api;
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
                            } else if (pk === "#decorator") {
                                if (decos === U) {
                                    decos = [p];
                                } else {
                                    decos.push(p);
                                }
                            } else {
                                error("Unsupported component param type: " + pk);
                            }
                        }
                    }
                    if ((nd as XtrElement).children) {
                        let v: IvView = createContentView(10, container); // todo: count nodes
                        renderCptContent((nd as XtrElement), v, 0, v, 0, api);
                        assignContent(api, v);
                    }
                    tpl.render();
                    if (decos !== U) {
                        let container = createContainer(-1, null, 2) as IvCptContainer;
                        container.template = tpl;
                        container.contentView = tpl["$content"];
                        callDecorators(rootView, container, decos);
                    }
                }
            }
        }
    }

    function callDecorators(v: IvView, parent: any | null, decorators?: XtrParam[], parentIdx = -1, deferred = false) {
        // parent can be either a domElt or a #container

        // ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2, 0, ζs1);
        // ζpar(ζ, ζc, 0, 1, "y", ζe(ζ, 1, exp1()));
        // ζpar(ζ, ζc, 0, 1, "z", ζe(ζ, 2, exp2()));
        // ζdecoEnd(ζ, ζc, 0, 1);
        const deco = deferred ? ζdecoD : ζdeco, decoEnd = deferred ? ζdecoEndD : ζdecoEnd;

        if (decorators !== U) {
            // paramMode: 0=no params, 1=default param, 2=multiple params
            let idx: number, paramMode: 0 | 1 | 2 = 0, defaultValue: any = 0, params: any[] | undefined;
            for (let d of decorators) {
                if (d.kind === "#decorator") {
                    if (parentIdx === -1) {
                        // register the parent (cannot be null in this case)
                        parentIdx = v.nodeCount!++;
                        v.nodes![parentIdx] = parent;
                        if (parent.kind === "#container") {
                            parent.idx = parentIdx;
                        }
                    }
                    params = U;
                    if (d.params === U || d.params.length === 0) {
                        if (d.holdsValue) {
                            defaultValue = getParamValue(d);
                            paramMode = 1;
                        }
                    } else {
                        paramMode = 2;
                        for (let p of d.params) {
                            if (p.kind === "#param") {
                                if (params === U) {
                                    params = [p.name, getParamValue(p)];
                                } else {
                                    params.push(p.name);
                                    params.push(getParamValue(p));
                                }
                            } else if (p.kind === "#decorator") {
                                error("Decorators are not support in decorators - check @" + p.name!);
                            }
                        }
                    }
                    idx = v.nodeCount!++;
                    deco(v, true, 0, idx, parentIdx, d.name!, refs[d.name!], paramMode, defaultValue, params);
                    if (paramMode === 2) {
                        decoEnd(v, true, 0, idx);
                    }
                }
            }
        }
    }

    function renderCptContent(node: XtrElement | XtrFragment, v: IvView, parentLevel: number, pnv: IvView, pnParentIdx: number, api?: any) {
        // pnv is the view that must be used for internal param nodes (will be identical to v otherwise)
        // pnParentLevel is also the parentLevel that must be used for param nodes
        // api is defined if node is the root component or if it is a param node connected to the root component

        // note: iFlag is used by child views to find the parent view that holds instructions (only js block views and async block views)
        // so it will always be 1 here
        let idx = -1, children = node.children, params: any[] | undefined, properties: any[] | undefined, decorators: any[] | undefined, len = 0;
        if (children === U || children.length === 0) return;
        for (let ch of children) {
            let labels: 0 = 0; // todo
            if (ch.kind === "#text") {
                // ζtxtD(v: IvView, cm: boolean, iFlag: number, idx: number, parentLevel: number, labels: any[] | 0, statics: string | string[], nbrOfValues: number, ...values: any[])
                ζtxtD(v, true, 1, v.nodeCount!++, parentLevel, labels, ch.value, 0);
            } else if (ch.kind === "#cdata") {
                // same as text nodes
                ζtxtD(v, true, 1, v.nodeCount!++, parentLevel, labels, ch.content, 0);
                checkCData(ch as XtrCData);
            } else if (ch.kind === "#element") {
                scanParams(ch); // all params are considered static for the time being
                // ζeltD(v: IvView, cm: boolean, idx: number, parentLevel: number, name: string, hasChildren: 0 | 1, labels?: any[] | 0, staticAttributes?: any[], staticProperties?: any[]) {
                idx = v.nodeCount!++;
                ζeltD(v, true, idx, parentLevel, ch.name!, ch.children ? 1 : 0, labels, params, properties);
                renderCptContent(ch, v, parentLevel + 1, v, parentLevel + 1);
                callDecorators(v, null, decorators, idx, true);
            } else if (ch.kind === "#fragment") {
                // ζfraD(v: IvView, cm: boolean, idx: number, parentLevel: number)
                checkFragment(ch);
                ζfraD(v, true, idx, parentLevel);
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
                        setParamNode(ch, pnd, api, ch.name);
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
                        scanParams(ch);
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
                if (decorators !== U) {
                    error("Decorators are not supported on param nodes - check @" + decorators[0].name);
                }
            } else if (ch.kind === "#component") {
                // here api is necessarily undefined as the root component is handled in renderRootContent
                let callImmediately = 0;
                scanParams(ch);
                // ζcptD(v: IvView, cm: boolean, iFlag: number, idx: number, parentLevel: number, exprCptRef: any, callImmediately: number, labels?: any[] | 0, staticParams?: any[] | 0, dynParamNames?: string[]) {
                idx = v.nodeCount!++;
                let eCount = v.expressions ? v.expressions.length : 0;
                ζcptD(v, true, 1, idx, parentLevel, [eCount, refs[ch.nameRef!]], callImmediately, labels, params);
                if (ch.children) {
                    // (pv: IvView, iFlag: number, containerIdx: number, nbrOfNodes: number, instanceIdx: number, view?: IvView) 
                    let v2 = ζviewD(v, 1, idx, 10, 0); // todo: nbr of nodes instead of 10
                    renderCptContent(ch, v2, 0, v, idx);
                    ζendD(v2, true);
                }

                // ζcallD(v: IvView, idx: number, container?: IvCptContainer | 0, labels?: any[] | 0, dynParamNames?: string[]) {
                ζcallD(v, idx, 0, labels);
                callDecorators(v, null, decorators, idx, true);
            } else if (ch.kind === "#decoratorNode") {
                error("Decorator nodes are not supported yet");
            }
        }

        return;

        function setParamNode(ch: XtrElement, paramNode: any, api?: any, name?: string) {
            let idx = v.nodeCount!++;
            scanParams(ch);
            v.nodes![idx] = paramNode;
            if (params !== U) {
                len = params.length;
                for (let i = 0; len > i; i++) {
                    paramNode[params[i]] = params[i + 1];
                }
            }
            if (ch.children !== U) {
                let pnContentView: IvView = createContentView(10); // todo: count nodes
                pnContentView.parentView = v;
                // ζviewD(v, 1, 0, 0, 0, pnView);
                renderCptContent(ch, pnContentView, 0, v, idx, paramNode);
                assignContent(paramNode, pnContentView, api, name);
            }
        }

        function scanParams(nd: XtrElement) {
            params = properties = decorators = U;
            if (nd.params !== U) {
                for (let p of nd.params) {
                    if (p.kind === "#param") {
                        if (params === U) {
                            params = [p.name, getParamValue(p)];
                        } else {
                            params.push(p.name);
                            params.push(getParamValue(p));
                        }
                    } else if (p.kind === "#decorator") {
                        if (decorators === U) {
                            decorators = [p];
                        } else {
                            decorators.push(p);
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

    function getParamValue(p: XtrParam) {
        if (p.holdsValue) {
            if (p.valueRef !== U) return refs[p.valueRef];
            return p.value;
        }
        return ""; // no-value attribute - cf. https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
    }

    function createContentView(nbrOfNodes: number, container?: any): IvView {
        let v = createView(null, null, 0);
        v.doc = doc;
        v.instructions = [];
        v.nodeCount = 0;
        v.nodes = nbrOfNodes === 0 ? [] : new Array(nbrOfNodes);
        if (container !== U) {
            v.cmAppends = [function (n: IvNode) {
                if (n.domNode) {
                    container.appendChild(n.domNode);
                }
            }];
        }
        return v;
    }

    function assignContent(holder: any, v: IvView, api?: any, name?: string) {
        if (v.nodeCount! > 0) {
            if (holder === null && api !== U && name !== U) {
                // we assume name refers to an IvContent property
                api[name] = v;
            } else {
                holder["$content"] = v;
            }
        }
    }

    function checkCData(cd: XtrCData) {
        if (cd.params !== U && cd.params.length) {
            error("Params, properties, decorators or labels are not supported on cdata sections - check " + getName(cd.params[0]));
        }
    }

    function checkFragment(f: XtrFragment) {
        if (f.params !== U && f.params.length) {
            error("Params, properties, decorators or labels are not supported on fragments - check " + getName(f.params[0]));
        }
    }

    function getName(p: XtrParam) {
        let k = p.kind, nm = "";
        if (k === "#decorator") {
            nm = "@";
        } else if (k === "#label") {
            nm = "#";
        } else if (k === "#property") {
            nm = "[";
        }
        nm += p.name;
        return (k === "#property") ? nm + "]" : nm;
    }
}

@API class XtrContent {
    xtr?: string;
    fragment?: any; // XtrFragment; -> non trax interfaces cannot be used in @API and @Data
    // todo: support timeout;
    resolver: (ref: string) => Promise<any>;
    doc?: IvDocument;
    @required $targetElt: IvElement;
    completeEmitter: IvEventEmitter;
}
export const xtrContent = decorator(XtrContent, ($api: XtrContent) => {
    let xtrMode = false, fragmentMode = false, firstRender = true, currentXtr = "", currentFragment: any = null;

    return {
        async $render() {
            if (firstRender) {
                firstRender = false;
                let f: XtrFragment;
                if ($api.xtr !== undefined) {
                    xtrMode = true;
                    currentXtr = $api.xtr;
                    f = await parse(currentXtr);
                } else if ($api.fragment !== undefined) {
                    fragmentMode = true;
                    f = await $api.fragment! as XtrFragment;
                    currentFragment = f;
                } else {
                    throw "Invalid arguments: either xtr or fragment params must be provided";
                }
                await renderFragment(f);
            } else {
                // TODO: dispose the previous elements!!!
                if (xtrMode) {
                    if (currentXtr !== $api.xtr) {
                        currentXtr = $api.xtr || "";
                        $api.$targetElt.innerHTML = "";
                        await renderFragment(await parse(currentXtr));
                    }
                } else if (fragmentMode) {
                    if (currentFragment !== $api.fragment) {
                        currentFragment = await $api.fragment! as XtrFragment;
                        $api.$targetElt.innerHTML = "";
                        if (currentFragment !== undefined) {
                            await renderFragment(currentFragment);
                        }
                    }
                }
            }
        }
    }

    async function renderFragment(f: XtrFragment) {
        await renderXtrFragment(f, $api.$targetElt, $api.resolver, { doc: $api.doc });
        $api.completeEmitter.emit();
    }
});
