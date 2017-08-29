
export interface VdRuntime {
    /**
     * Create a VdElementNode node and append it to the parent children list 
     * Used in creation mode only
     */
    createEltNode: (parent: VdContainer, index: number, name: string, needRef?: 0 | 1) => VdElementNode;

    /**
     * Create a VdDataNode and append it to the parent children list (similar to createEltNode)
     * Used in creation mode only 
     */
    createDtNode: (parent: VdContainer | null, index: number, name: string, needRef?: 0 | 1) => VdDataNode;

    /**
     * Create a VdGroupNode associated to component, append it to the parent children list 
     * and call the component function
     * Use in creation mode only
     */
    createCpt: (parent: VdContainer, index: number, props: {}, r: VdRenderer, f: VdFunctionCpt | VdClassCpt, hasLightDom: 0 | 1, needRef: 0 | 1) => VdGroupNode;

    /**
     * Create an insert group and insert the content node or text passed as argument
     */
    insert: (parent: VdContainer, index: number, content: any, changeContainer: VdChangeContainer, append?: boolean) => VdGroupNode;

    /**
     * Create a VdTextNode node and append it to the parent children list
     * Used in creation mode only
     */
    createTxtNode: (parent: VdContainer, index: number, value: string) => void;

    /**
     * Create a dynamic text node and append it to the parent children list
     */
    dynTxtNode: (parent: VdContainer, index: number, value: string) => VdTextNode;

    /**
     * Check that a group with the right index exists in the parent children at childPosition and create it if not
     * Used in creation and update mode
     * @return the group note
     */
    checkGroup: (childPosition: number, parent: VdContainer, changeContainer: VdChangeContainer, parentGroup: VdGroupNode, index: number) => VdGroupNode;

    /**
     * Delete group nodes in the parent children list at childPosition until group index becomes greater or equal to the targetIndex
     * Used in upadte mode only
     */
    deleteGroups: (childPosition: number, parent: VdContainer, changeContainer: VdChangeContainer, targetIndex: number) => void;

    /**
     * Update the given property on the element passed as argument
     * Update instructions will be stored on changeGroup
     * Used in update mode only
     */
    updateProp: (name: string, value: any, element: VdElementWithProps, changeContainer: VdChangeContainer) => void;

    /**
     * Update the given attribute on the element passed as argument
     * An Update attribute instruction will be created and stored on changeGroup if the att value has changed
     */
    updateAtt: (name: string, value: any, element: VdElementWithAtts, changeContainer: VdChangeContainer) => void;

    /**
     * Update a text node with a new value
     * Used in update mode only
     */
    updateText: (value: string, textNode: VdTextNode, changeContainer: VdChangeContainer) => void;

    /**
     * Update a component argument property
     * Used in update mode only
     */
    updateCptProp: (name: string, value: any, element: VdElementWithProps) => void;

    /**
     * Refresh a sub-component
     * Used in update mode only
     */
    refreshCpt: (r: VdRenderer, cptGroup: VdGroupNode, changeContainer: VdChangeContainer) => void;

    /**
     * Refresh the content nodes associated to an insert group
     */
    refreshInsert: (parent: VdContainer, childPosition: number, content: any, changeContainer: VdChangeContainer) => void;

    /**
     * Return all the data nodes that are direct descendents of the parent container / or direct descendents of sub-groups
     * attached to the parent container (in other words: this function will recursively look in sub-groups - such as js blocks - but not in sub-elements)
     */
    getDataNodes: (fnGroup: VdGroupNode, nodeName: string, parent?: VdContainer) => VdDataNode[];

    /**
     * Same as getDataNodes() but will only return the first element (faster method when only one data node is expected)
     */
    getDataNode: (fnGroup: VdGroupNode, nodeName: string, parent?: VdContainer) => VdDataNode | null;

    /**
     * Clean a text expression: return '' for null or undefined expression
     */
    cleanTxt: (expr: any) => any;

}

export interface VdClassCpt {
    (): void;
    $isClassCpt: true;
}

export interface VdClassCptInstance {
    init?():void;
    shouldUpdate?():boolean;
    render(r: VdRenderer, $d?: {}): void;
}

export interface VdFunctionCpt {
    (r: VdRenderer, $d?: any): void;
    $isClassCpt?: false;
}

export interface VdRenderer {
    rt: VdRuntime;
    parent: VdGroupNode;
    /**
     * Return all the data nodes that are direct descendents of the parent container / or direct descendents of sub-groups
     * attached to the parent container (in other words: this function will recursively look in sub-groups - such as js blocks - but not in sub-elements)
     * (helper method redirecting to rt.getDataNodes)
     */
    getDataNodes: (nodeName: string, parent?: VdContainer) => VdDataNode[];

    /**
     * Same as getDataNodes() but will only return the first element (faster method when only one data node is expected)
     * (helper method redirecting to rt.getDataNode)
     */
    getDataNode: (nodeName: string, parent?: VdContainer) => VdDataNode | null;
}

export const enum VdNodeKind {
    Group = "G",
    Element = "E",
    Text = "T",
    Data = "D"
};

export interface VdNode {
    kind: VdNodeKind;
    index: number;              // integer identifying the node type in the node template
    ref: number;               // non-static nodes may have a unique ref to be easily updated by their renderer   
    domNode: any;
}

export interface VdParent {
    children: VdNode[];         // list of child nodes
}

export interface VdContainer extends VdNode {
    props?: {};                 // key-value map of node properties
    atts?: {};                  // key-value map of node attributes
    children: VdNode[];         // list of child nodes
}

export interface VdChangeContainer {
    changes: VdChangeInstruction[] | null;   // list of change instructions
}

export interface VdGroupNode extends VdContainer, VdChangeContainer {
    kind: VdNodeKind.Group;
    cm: 0 | 1;                               // creation mode
    parent: VdContainer | null;
}

export interface VdCptNode extends VdGroupNode {
    cpt: VdClassCptInstance | null;
    render: VdFunctionCpt | null;
    sdGroup: VdCptNode | null;               // shadow group = group containing the shadow dom or null if there is no light dom
    ltGroup: VdCptNode | null;               // light group = group containing the light dom or null if there is not light dom
}

export interface VdTextNode extends VdNode {
    kind: VdNodeKind.Text;
    value: string;               // the text value of the node
}

export interface VdElementNode extends VdContainer {
    name: string;               // element tag name
}

export interface VdDataNode extends VdContainer {
    kind: VdNodeKind.Data;
    name: string;               // element tag name
    changes: VdChangeInstruction[] | null;   // list of change instructions
    props: {};
}

export interface VdElementWithProps extends VdElementNode {
    props: {};
}

export interface VdElementWithAtts extends VdElementNode {
    atts: {};
}

export const enum VdChangeKind {
    Unknown = "?",
    CreateGroup = "CG",
    DeleteGroup = "DG",
    UpdateProp = "UP",
    UpdateAtt = "UA",
    UpdateText = "UT",
    ReplaceGroup = "RG"
};

export interface VdChangeInstruction {
    kind: VdChangeKind,
}

export interface VdUpdateProp extends VdChangeInstruction {
    kind: VdChangeKind.UpdateProp;
    name: string;
    value: any;
    node: VdElementNode;
}

export interface VdUpdateAtt extends VdChangeInstruction {
    kind: VdChangeKind.UpdateAtt;
    name: string;
    value: any;
    node: VdElementNode;
}

export interface VdUpdateText extends VdChangeInstruction {
    kind: VdChangeKind.UpdateText;
    value: string;
    node: VdTextNode;
}

export interface VdCreateGroup extends VdChangeInstruction {
    kind: VdChangeKind.CreateGroup;
    node: VdGroupNode;
    parent: VdContainer | null;
    position: number;
    nextSibling: VdTextNode | VdElementNode | null;
}

export interface VdDeleteGroup extends VdChangeInstruction {
    kind: VdChangeKind.DeleteGroup;
    node: VdGroupNode;
    parent: VdContainer | null;
    position: number,
    nbrOfNextSiblings: number
}

export interface VdReplaceGroup extends VdChangeInstruction {
    kind: VdChangeKind.ReplaceGroup;
    oldNode: VdGroupNode;
    newNode: VdGroupNode;
    parent: VdContainer | null;
    position: number;
    nextSibling: VdTextNode | VdElementNode | null;
}
