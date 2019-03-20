
export interface IvTemplate {
    document: IvDocument;
    attach(element: any): IvTemplate;
    refresh(data?: any): IvTemplate;
}

// IvContext will be at position 0
export type IvNodes = Array<IvContext | IvNode>;

export interface IvDocument {
    createTextNode(data: string): any;
    createDocFragment(): any;
    createElement(name: string): any;
    createElementNS(ns: string, name: string): any;
    createComment(data: string): any;
}

export interface IvContext {
    kind: "#context";
    doc: IvDocument;
    domNode: any;           // associated domNode
    refreshCount: number;
    anchorNode: any;        // dom node used as anchor in the domNode (content will be inserted before this anchor)
}

export interface IvNode {
    kind: "#fragment" | "#element" | "#component" | "#decorator" | "#text";
    idx: number;            // node index in the template function
    parentIdx: number;      // parent index in the template function
    attached: boolean;      // true if domNode is attached to its parent
    domNode: any;           // associated domNode
    childPos: number;       // -1 if not part of a children list, index in the parent children otherwise
    expressions: any[] | undefined;
    lastRefresh: number;    // used for js block container elements. 0 if not used, last refresh count otherwise (starts at 1)
    isContainer: boolean;   // only true for container fragments used by components and js blocks
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
    ns: string;                      // namespace, default: ""
    children: number[] | undefined;  // undefined if no children, list of child indexes otherwise
}

/**
 * Iv vDOM fragment
 */
export interface IvFragment extends IvParentNode {
    kind: "#fragment";
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
