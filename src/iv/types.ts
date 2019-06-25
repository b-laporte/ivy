
export interface IvDocument {
    createTextNode(data: string): any;
    createElement(name: string): any;
    createElementNS(ns: string, name: string): any;
    createComment(data: string): any;
}

export interface IvTemplate {
    document: IvDocument;
    params: any | undefined;
    attach(element: any): IvTemplate;
    refresh(data?: any): IvTemplate;
}

export interface IvNode {
    kind: "#element" | "#text" | "#fragment" | "#container" | "#component" | "#listener" | "#param";
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
    hostNode: IvElement | IvFragment;
}

export interface IvView {
    kind: "#view";
    uid: string;                                                    // unique id (debug)
    nodes: IvNode[] | null;                                         // list of IvNodes associated to this view
    doc: IvDocument;                                                // for test / dependency injection
    parentView: IvView | null;                                      // parent view: null for the root view, parent view otherwise (can be in a different template)
    cm: boolean;                                                    // creation mode
    cmAppends: null | ((n: IvNode, domOnly: boolean) => void)[];    // array of append functions used at creation time
    lastRefresh: number;                                            // refresh count at last refresh
    container: IvContainer | IvElement | IvFragment | null;         // null if root view, container host otherwise
    projectionHost: IvProjectionHost | null;                        // defined when view corresponds to a projected light-dom 
    isTemplate: boolean;                                            // true if the VIEW is associated to a template root (will be false for sub js blocks)
    rootDomNode: any;                                               // domNode the view is attached to - only used by the root view
    anchorNode: any;                                                // dom node used as anchor in the domNode - only used by the root view (content will be inserted before this anchor)
    expressions: any[] | undefined;                                 // array of expression values
    oExpressions: any[] | undefined;                                // array of one-time expression flags
    instructions: any[] | undefined;
}

export interface IvText extends IvNode {
    kind: "#text";
    pieces: string[] | undefined;
}

export interface IvEltListener extends IvNode {
    kind: "#listener";
    callback: ((e: any) => void) | undefined;
}

export interface IvParamNode extends IvNode {
    kind: "#param";
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

export interface IvCptContainer extends IvContainer {
    subKind: "##cpt";
    cptTemplate: IvTemplate | null;      // current component template
    cptParams: any;                      // shortcut to cptTemplate.params
    contentView: IvView | null;          // light-dom / content view
}

export interface IvAsyncContainer extends IvContainer {
    subKind: "##async";
    priority: number;    // 0=immediate, >0=async
}

export interface IvElement extends IvParentNode {
    kind: "#element";
    contentView: IvView | null;          // set when the element is used to project a content view
}

export interface IvComponent extends IvParentNode {
    kind: "#component";
}
