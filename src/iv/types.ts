import { IvDecoNode } from './types';

export interface IvDocument {
    createTextNode(data: string): any;
    createElement(name: string): any;
    createElementNS(ns: string, name: string): any;
    createComment(data: string): any;
}

export interface IvContent {
    // placeholder interface to describe content views
}

export interface IvTemplate {
    api: any | undefined;
    controller: any | undefined;
    attach(element: any): IvTemplate;
    render(data?: any): IvTemplate;

    query(label: string): any | null;
    query(label: string, all: true): any[] | null; // -> can query all nodes (default = false)
}

export interface IvLogger {
    log(message?: any, ...optionalParams: any[]): void;
    error(error?: any, ...optionalParams: any[]): void;
}

export interface IvNode {
    kind: "#element" | "#text" | "#fragment" | "#container" | "#component" | "#decorator" | "#listener" | "#param";
    uid: string;                      // unique id (debug)
    idx: number;                      // 0 for root nodes, etc.
    parentIdx: number;                // index for parent node - -1 if undefined
    nextSibling: IvNode | undefined;  // node linked list - needed for dynamic insert
    domNode: any;                     // associated DOM node - meaning depends on node kind (usually DOM host)
    attached: boolean;                // true if the domNode is attached to its parent domNode
}

export interface IvParentNode extends IvNode {
    ns: string;                       // namespace, default: ""
    firstChild: IvNode | undefined;   // node linked list - needed for dynamic insert
    lastChild: IvNode | undefined;
    // contentRoot: IvNode | undefined;  // defined if the current node is a host for a content node, in which case firstChild / lastChild refers to the light-dom
}

export interface IvFragment extends IvParentNode {
    kind: "#fragment";
    contentView: IvView | null;                                     // set when the fragment is used to project a content view
}

export interface IvProjectionHost {
    view: IvView;
    hostNode: IvEltNode | IvFragment;
}

export interface IvView {
    kind: "#view";
    uid: string;                                                           // unique id (debug)
    nodes: IvNode[] | null;                                                // list of IvNodes associated to this view
    namespaces: string[] | undefined;                                      // namespace stack - cf. @xmlns or xmlns attributes
    namespace: string | undefined;                                         // current namespace - cf. @xmlns or xmlns attributes
    doc: IvDocument;                                                       // for test / dependency injection
    parentView: IvView | null;                                             // parent view: null for the root view, parent view otherwise (can be in a different template)
    cm: boolean;                                                           // creation mode
    cmAppends: null | ((n: IvNode, domOnly: boolean) => void)[];           // array of append functions used at creation time
    lastRefresh: number;                                                   // refresh count at last refresh
    container: IvContainer | IvEltNode | IvFragment | null;                // null if root view, container host otherwise (i.e. where the view is projected)
    projectionHost: IvProjectionHost | null;                               // defined when view corresponds to a projected light-dom 
    template: IvTemplate | undefined;                                      // set if the VIEW is associated to a template root (will be undefined for sub js blocks)
    rootDomNode: any;                                                      // domNode the view is attached to - only used by the root view
    anchorNode: any;                                                       // dom node used as anchor in the domNode - only used by the root view (content will be inserted before this anchor)
    expressions: any[] | undefined;                                        // array of expression values
    oExpressions: any[] | undefined;                                       // array of one-time expression flags
    instructions: any[] | undefined;
    paramNode: IvParamNode | undefined;                                    // the param node the view is attached to (if any)
    createElement: (name: string, namespace?: string) => any;              // create an element on the current namespace if none is provided as default
    nodeCount?: number;                                                    // used by XTML renderer
}

interface ListMetaData {
    sizes: { [key: string]: number };       // dictionary of the current length for each list
    listNames: string[];                    // name of the lists managed by the object holding this meta data - e.g. ["list1", "list2"]
    listMap: { [key: string]: 1 }           // map of the list names - e.g. {list1: 1, list2: 1}
}

interface IvParamNodeParent {
    lists?: ListMetaData;
}

export interface IvText extends IvNode {
    kind: "#text";
    pieces: string[] | undefined;
}

export interface IvEltListener extends IvNode {
    kind: "#listener";
    callback: ((e: any) => void) | undefined;
}

export interface IvParamNode extends IvNode, IvParamNodeParent {
    kind: "#param";
    dataName: string;
    dataHolder: any;
    data: any;                                        // shortcut to parent api (api object or paramNode)
    dataIsList?: boolean;                             // true if data references a list
    contentView: IvView | undefined;
    dynamicParams: { [key: string]: 1 } | undefined;  // map of dynamic sub-params that have been found while refreshing the param content (aka. light-dom)
    viewPool: IvView[] | undefined;
    viewInstanceIdx: number;
    bindings?: IvBinding[];                           // binding expressions associated to this data node
}

export interface IvContainer extends IvNode {
    kind: "#container";
    subKind: "##block" | "##cpt" | "##async";
    cmAppend: null | ((n: IvNode, domOnly: boolean) => void);
}

export interface IvBlockContainer extends IvContainer {
    subKind: "##block";
    views: IvView[];
    viewPool: IvView[];
    lastRefresh: number;
    previousNbrOfViews: number;
    insertFn: null | ((n: IvNode, domOnly: boolean) => void);
}

export interface IvCptContainer extends IvContainer, IvParamNodeParent {
    subKind: "##cpt";
    template: IvTemplate | null;                      // current component template
    data: any;                                        // shortcut to cptTemplate.api
    contentView: IvView | null;                       // light-dom / content view
    dynamicParams: { [key: string]: 1 } | undefined;  // map of dynamic params that have been found while refreshing the component content (aka. light-dom)
    bindings?: IvBinding[];                           // binding expressions associated to this container
}

export interface IvBinding {
    propertyHolder: Object,
    propertyName: string | number;
    watchFn: (() => void) | null;
}

export interface IvAsyncContainer extends IvContainer {
    subKind: "##async";
    priority: number;    // 0=immediate, >0=async
}

export interface IvEltNode extends IvParentNode {
    kind: "#element";
    contentView: IvView | null;                  // set when the element is used to project a content view
}

export interface IvCptNode extends IvParentNode {
    kind: "#component";
}

export interface IvDecoNode extends IvNode {
    kind: "#decorator";
    instance: IvDecoratorInstance;
    api: any;
    refName: string; // e.g. @x.foo
    validProps: boolean;
    bindings?: IvBinding[];                           // binding expressions associated to this decorator
}

/**
 * Decorator interface
 */
export interface IvDecorator<ApiClass> {
    (api: ApiClass): IvDecoratorInstance;
    $isDecorator: true;
    $apiClass: { new(): ApiClass };
}

export interface IvDecoratorInstance {
    $init?: () => void;
    $render?: () => void;
    $dispose?: () => void;
}
