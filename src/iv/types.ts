
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
}

export interface IvContext {
    kind: "#context";
    doc: IvDocument;
    domNode: any;           // associated domNode
}

export interface IvNode {
    kind: "#fragment" | "#element" | "#component" | "#decorator" | "#text";
    idx: number;            // node index in the template function
    parentIdx: number;      // parent index in the template function
    attached: boolean;      // true if domNode is attached to its parent
    domNode: any;           // associated domNode
    //childIdx: number;       // -1 if not part of a children list, index in the parent children otherwise
    nextSiblingIdx: number; // 0 if last child in its parent, 1 if undetermined or useless (e.g. for decorators or if the node is part of the content of block)
    expressions: any[] | undefined;
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
    isContainer: boolean;
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
