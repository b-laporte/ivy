
export interface VdRenderer {
    /**
     * Process the changes associated to a given node
     */
    processChanges: (changes: VdChangeInstruction[]) => void;
}

export interface VdClassCpt {
    (): void;
    $isClassCpt: true;
}

export interface VdClassCptInstance {
    $node?: VdCptNode;
    $renderer?: VdRenderer;
    props?: Object;
    init?(): void;
    shouldUpdate?(): boolean;
    render(): void;
}

export interface VdTemplate {
    (...args: any[]): void;
    $isClassCpt?: false;
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
    changes: VdChangeInstruction[] | null;    // list of change instructions
    childChanges: VdChangeContainer[] | null; // list of child change containers that contain changes
    $lastRefresh: number;                     // value of the iv refresh counter when the last refresh occured (set after the refresh)
    $lastChange: number;                      // value of the iv refresh counter when the last change occured (<= $lastRefresh)
}

export interface VdGroupNode extends VdContainer, VdChangeContainer {
    kind: VdNodeKind.Group;
    cm: 0 | 1;                               // creation mode
    parent: VdContainer | null;
}

export interface VdCptNode extends VdGroupNode {
    cpt: VdClassCptInstance | null;
    render: VdTemplate | null;
    sdGroup: VdCptNode | null;               // shadow group = group containing the shadow dom or null if there is no light dom
    ltGroup: VdCptNode | null;               // light group = group containing the light dom or null if there is not light dom
}

export interface VdFuncCptNode extends VdCptNode {
    cpt: null;
    render: VdTemplate;
}

export interface VdTextNode extends VdNode {
    kind: VdNodeKind.Text;
    value: string;               // the text value of the node
}

export interface VdElementNode extends VdContainer {
    name: string;               // element tag name
}

export interface VdDataNode extends VdContainer, VdChangeContainer {
    kind: VdNodeKind.Data;
    name: string;               // element tag name
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
    UpdatePropMap = "UM",
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

export interface VdUpdatePropMap extends VdChangeInstruction {
    kind: VdChangeKind.UpdatePropMap;
    name: string | null;
    names: (string | 0)[] | null;
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
