
export interface VdRuntime {
    /**
     * Create a VdElementNode node and append it to the parent children list 
     * Used in creation mode only
     */
    createEltNode: (parent: VdContainer, index: number, name: string, needRef?: 0 | 1) => VdElementNode;

    /**
     * Create a VdGroupNode associated to component, append it to the parent children list 
     * and call the component function
     * Use in creation mode only
     */
    createCpt: (parent: VdContainer, index: number, props: {}, needRef: 0 | 1, r:VdRenderer, f:VdFunction) => VdGroupNode;

    /**
     * Create a VdTextNode node and append it to the parent children list
     * Used in creation mode only
     */
    createTxtNode: (parent: VdContainer, index: number, value: string) => void;

    /**
     * Create a dynamic text node and append it to the parent children list
     */
    dynTxtNode: (parent: VdContainer, index: number, value: string) => void;

    /**
     * Check that a group with the right index exists in the parent children at childPosition and create it if not
     * Used in creation and update mode
     * @return the group note
     */
    checkGroup: (childPosition: number, parent: VdContainer, changeGroup: VdGroupNode, parentGroup: VdGroupNode, index: number) => VdGroupNode;

    /**
     * Delete group nodes in the parent children list at childPosition until group index becomes greater or equal to the targetIndex
     * Used in upadte mode only
     */
    deleteGroups: (childPosition: number, parent: VdContainer, changeGroup: VdGroupNode, targetIndex: number) => void;

    /**
     * Update the given property on the element passed as argument
     * Update instructions will be stored on changeGroup
     * Used in update mode only
     */
    updateProp: (name:string, value:any, element: VdElementWithProps, changeGroup: VdGroupNode) => void;

    /**
     * Update the given attribute on the element passed as argument
     * An Update attribute instruction will be created and stored on changeGroup if the att value has changed
     */
    updateAtt: (name:string, value:any, element: VdElementWithAtts, changeGroup: VdGroupNode) => void;

    /**
     * Update a text node with a new value
     * Used in update mode only
     */
    updateText: (value:string, textNode: VdTextNode, changeGroup: VdGroupNode) => void;

    /**
     * Update a component argument property
     * Used in update mode only
     */
    updateCptProp: (name:string, value:any, element: VdElementWithProps) => void;

    /**
     * Refresh a sub-component
     * Used in update mode only
     */
    refreshCpt: (r:VdRenderer, cptGroup: VdGroupNode, changeGroup: VdGroupNode) => void;
}

export interface VdFunction {
    (r:VdRenderer, $d?:{}): void;
}

export interface VdRenderer {
    rt: VdRuntime;
    parent: VdGroupNode;
}

export const enum VdNodeKind {
    Group = 0,
    Element = 1,
    Text = 2,
    Data = 3
};

export interface VdNode {
    kind: VdNodeKind;
    index: number;              // integer identifying the node type in the node template
    ref: number;               // non-static nodes may have a unique ref to be easily updated by their renderer   
    domNode: any;
}

export interface VdContainer extends VdNode {
    props?: {};                 // key-value map of node properties
    atts?: {};                  // key-value map of node attributes
    children: VdNode[];         // list of child nodes
}

export interface VdGroupNode extends VdContainer {
    kind: VdNodeKind.Group;
    cm: 0 | 1;                               // creation mode
    changes: VdChangeInstruction[] | null;   // list of change instructions
    parent: VdContainer | null;
}

export interface VdCptNode extends VdGroupNode {
    vdFunction: VdFunction;
}

export interface VdTextNode extends VdNode {
    kind: VdNodeKind.Text;
    value: string;               // the text value of the node
}

export interface VdElementNode extends VdContainer {
    name: string;               // element tag name
}

export interface VdElementWithProps extends VdElementNode {
    props: {};
}

export interface VdElementWithAtts extends VdElementNode {
    atts: {};
}

export const enum VdChangeKind {
    Unknown = 0,
    CreateGroup = 1,
    DeleteGroup = 2,
    UpdateProp = 3,
    UpdateAtt = 4,
    UpdateText = 5
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
    position: number
}
