
export interface TraxImport {
    kind: "import";
    insertPos: number;              // position after the Data import
    values: { [key: string]: 1 };   // list of identifiers defined in the import statement
}

export interface DataObject {
    kind: "data";
    pos: number;
    decoPos: number;                // position of the @Data decorator object
    log: boolean;
    className: string;
    classNameEnd: number;
    members: (DataProperty | ComputedProperty)[];
    // constructor: xxx - tbd: shall we support constructor?
    // validator: xxx - tbd: validator function?
}

export interface DataMember {
    name: string;
    type?: DataType;
    shallowRef?: boolean;
    defaultValue?: CodeFragment;
}

export interface DataProperty extends DataMember {
    kind: "property",
    name: string;
    namePos: number;
    end: number,
    type: DataType | undefined;
    shallowRef: boolean;
    defaultValue: CodeFragment | undefined;
}

export interface ComputedProperty {
    kind: "computedProperty",
    name: string;
    code: CodeFragment;
}

interface CodeFragment {
    pos: number;
    end: number;
    text: string;
}

export type DataType = BaseType | RefType | CollectionType;

interface BaseType {
    kind: "string" | "number" | "boolean" | "any";
    canBeNull?: boolean;
    canBeUndefined?: boolean;
}

interface RefType {
    kind: "reference";
    identifier: string;        // e.g. "Foo"
    canBeNull?: boolean;
    canBeUndefined?: boolean;
}

interface CollectionType {
    kind: "array" | "map" | "dictionary";
    itemType: DataType;
    canBeNull?: boolean;
    canBeUndefined?: boolean;
}
