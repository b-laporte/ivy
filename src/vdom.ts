
export interface VdRuntime {
    /**
     * Create a VdElementNode node and append it to the parent children list 
     * Used in creation mode only
     */
    createEltNode: (parent: VdContainer, index: number, name: string, needRef?: 0 | 1) => VdElementNode;

    /**
     * Create a VdGroupNode and append it to the parent children list 
     * Use in creation mode only
     */
    createGroupNode: (parent: VdContainer, index: number, props: {}, needRef?: 0 | 1) => VdGroupNode;

    /**
     * Create a VdTextNode node and append it to the parent children list
     * Used in creation mode only
     */
    createTxtNode: (parent: VdContainer, index: number, value: string) => VdTextNode;

    /**
     * Check that a group with the right index exists in the parent children at childPosition and create it if not
     * Used in creation and update mode
     * @return the group note
     */
    checkGroupNode: (childPosition: number, parent: VdContainer, changeGroup: VdGroupNode, parentGroup: VdGroupNode, index: number) => VdGroupNode;

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
     * Update a component argument property
     * Used in update mode only
     */
    updateCptProp: (name:string, value:any, element: VdElementWithProps) => void;

    /**
     * Remove changes from group1 and append them to group2 changes list
     */
    moveChanges: (group1: VdGroupNode, group2: VdGroupNode) => void;
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
    ref?: string;               // non-static nodes may have a unique ref to be easily updated by their renderer   
}

export interface VdContainer extends VdNode {
    props?: {};                 // key-value map of node properties
    children: VdNode[];         // list of child nodes
}

export interface VdGroupNode extends VdContainer {
    kind: VdNodeKind.Group;
    cm: 0 | 1;                               // creation mode
    changes: VdChangeInstruction[] | null;   // list of change instructions
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

export const enum VdChangeKind {
    Unknown = 0,
    CreateGroup = 1,
    DeleteGroup = 2,
    ReplaceGroup = 3,
    UpdateProp = 4,
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

export interface VdCreateGroup extends VdChangeInstruction {
    kind: VdChangeKind.CreateGroup;
    node: VdGroupNode;
    parent: VdContainer | null;
    position: number
}

export interface VdDeleteGroup extends VdChangeInstruction {
    kind: VdChangeKind.DeleteGroup;
    node: VdGroupNode;
    parent: VdContainer | null;
    position: number
}
