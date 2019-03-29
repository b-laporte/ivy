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

export interface IvContext {
    kind: "#context";
    uid: string;                     // unique id (debug)
    cm: boolean;                     // creation mode
    nodes: BlockNodes;               // list of nodes associated to this context (note: nodes[0] = this)
    isTemplateRoot: boolean;         // true if the context is associated to the template root (will be false for sub js blocks)
    doc: IvDocument;
    domNode: any;                    // associated domNode
    lastRefresh: number;
    anchorNode: any;                 // dom node used as anchor in the domNode (content will be inserted before this anchor)
    expressions: any[] | undefined;  // array of expression values
    oExpressions: 1[] | undefined;   // array of one-time expression flags
    parentCtxt: IvContext | null;    // parent context
    containerIdx: number;            // container idx in the parent context - 0 if parentCtxt===null
}

export interface IvNode {
    kind: "#container" | "#fragment" | "#element" | "#component" | "#decorator" | "#text";
    uid: string;            // unique id (debug)
    idx: number;            // node index in the template function
    parentIdx: number;      // parent index in the template function
    attached: boolean;      // true if domNode is attached to its parent
    domNode: any;           // associated domNode
    childPos: number;       // -1 if not part of a children list, index in the parent children otherwise
    lastRefresh: number;    // used for js block container elements. 0 if not used, last refresh count otherwise (starts at 1)
    // instruction list
    // key -> if part of a collection
}

/**
 * Iv vDOM text node
 */
export interface IvText extends IvNode {
    kind: "#text";
    pieces: string[] | undefined;
}

export interface IvParentNode extends IvNode {
    ns: string;                                  // namespace, default: ""
    children: number[] | undefined;              // undefined if no children, list of child indexes otherwise
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
