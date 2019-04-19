import { IvComponent } from './types';

export interface IvTemplate {
    document: IvDocument;
    params: any | undefined;
    attach(element: any): IvTemplate;
    refresh(data?: any): IvTemplate;
}

// IvContext will be at position 0
export type BlockNodes = Array<IvContext | IvNode>;

export interface IvDocument {
    createTextNode(data: string): any;
    createDocFragment(): any;
    createElement(name: string): any;
    createElementNS(ns: string, name: string): any;
    createComment(data: string): any;
}

export interface IvContext extends IvExpressionData {
    kind: "#context";
    uid: string;                     // unique id (debug)
    cm: boolean;                     // creation mode
    nodes: BlockNodes;               // list of nodes associated to this context (note: nodes[0] = this)
    isTemplateRoot: boolean;         // true if the context is associated to the template root (will be false for sub js blocks)
    doc: IvDocument;
    rootDomNode: any;                // associated domNode (same for all contexts in a given template instance)
    lastRefresh: number;
    anchorNode: any;                 // dom node used as anchor in the domNode (content will be inserted before this anchor)
    parentCtxt: IvContext | null;    // parent context
    containerIdx: number;            // container idx in the parent context - 0 if parentCtxt===null
    initialized: boolean;            // true when all end() has been run once
}

export interface IvNode {
    kind: "#container" | "#fragment" | "#element" | "#component" | "#decorator" | "#text" | "#listener";
    uid: string;                             // unique id (debug)
    idx: number;                             // node index in the template function
    parentIdx: number;                       // parent index in the template function
    attached: boolean;                       // true if domNode is attached to its parent
    domNode: any;                            // associated domNode
    childPos: number;                        // -1 if not part of a children list, index in the parent children otherwise
    lastRefresh: number;                     // used for js block container elements. 0 if not used, last refresh count otherwise (starts at 1)
    instructions: any[] | undefined;         // list of update instructions (used to delay component or param/decorator node content interpretation)
    exprData: IvExpressionData | undefined;  // only used if the node holds expression information (node will be a root, but not necessarily a content node - e.g. a jsblock root)
    contentData: IvContentData | undefined;  // only for content (root) nodes (i.e. light dom) that will be projected in a host
    // key -> if part of a collection
}

export interface IvExpressionData {
    expressions: any[] | undefined;             // array of expression values
    oExpressions: any[] | undefined;            // array of one-time expression flags
}

export interface IvContentData {
    contentHost: IvParentNode | undefined;      // reference the host node where the node is projected (host is <xxx @content/> or <! @content/>) - host is a IvParentNode
    contentHostNodes: BlockNodes | undefined;   // nodes associated to contentHost
    rootNodes: BlockNodes;                      // nodes associated to the node that holds contentData
}

export interface IvEltListener extends IvNode {
    kind: "#listener";
    callback: ((e: any) => void) | undefined;
}

/**
 * Iv vDOM text node
 */
export interface IvText extends IvNode {
    kind: "#text";
    pieces: string[] | undefined;
}

export interface IvParentNode extends IvNode {
    ns: string;                                // namespace, default: ""
    children: number[] | undefined;            // undefined if no children, list of child indexes otherwise
    contentRoot: IvNode | undefined;           // defined if the current parent node is a host for a content node
}

/**
 * Iv vDOM fragment
 */
export interface IvFragment extends IvParentNode {
    kind: "#fragment";
}

export interface IvContainer extends IvNode {
    kind: "#container";
    contentBlocks: BlockNodes[];                 // list of js blocks currently displayed
    blockPool: BlockNodes[];                     // list of js blocks previously displayed but temporarily detached
    contentLength: number;                       // number of items in contentBlocks after last refresh

    // component properties - only used when the container is used to display a component
    cptTemplate: IvTemplate | undefined;         // current component template
    cptParams: any | undefined;                  // shortcut to cptTemplate.params
    cptContent: IvNode | undefined;              // reference to root content element (if any)
    children: number[] | undefined;              // light-dom children
}

/**
 * Iv vDOM element
 */
export interface IvElement extends IvParentNode {
    kind: "#element";
}

/**
 * Iv vDOM component
 */
export interface IvComponent extends IvParentNode {
    kind: "#component";
    // contentIdx
}

/**
 * Iv vDOM decorator
 */
export interface IvDecorator extends IvParentNode {
    kind: "#decorator";
}
