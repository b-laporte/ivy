
// Block interfaces
export const enum CodeBlockKind {
    Unknown = 0,
    FunctionBlock = 1,
    NodeBlock = 2,
    JsBlock = 3,
    JsStatements = 4
}

export interface CodeBlock {
    kind: CodeBlockKind;
    functionCtxt: FunctionBlock;
    baseIndent: string;        // e.g. "    " - string to prefix every line
    startLevel: number;        // e.g. 0 when the current parent node is at depth 0
    endLevel: number;          // e.g. 1 when the block leaves a node element open at depth 1
    parentGroupIdx: number;    // depth level of the block's parent group (may not be the direct parent)
    changeCtnIdx: number;      // depth level of the block's change group (usually 0)
}

export interface LevelCtxt {
    // structure to store index shift information when new nodes are created
    nbrOfCreations: number;    // nbr of nodes created at this level
    relative: boolean;         // tells if the shift is absolute (e.g. as long as no js block is met) or relative
    refGenerated: boolean;     // tells is the node reference has already been generated in the code (in which case it must not be regenarated)
    idxGenerated: boolean;     // tells if the level index (e.g. $i1) has been generated
    isHtmlNS: boolean;         // true if level is associated to HTML namespace
    ondelete?: (currentBlock: CodeBlock, nextNodeBlock: NodeBlock) => void;
    changeCtnIdx: number;
}

export interface NodeBlock extends CodeBlock {
    kind: CodeBlockKind.NodeBlock;
    levels: LevelCtxt[];       // index shift for each level, if level has been created in this block relative=false
    cmLines: CodeLine[];       // code lines corresponding to the creation mode
    umLines: CodeLine[];       // code lines correponding to the update mode
    initLines: CodeLine[];     // code lines corresponding to the block initialization (e.g. js expressions)
    endLines: CodeLine[];      // code the lines at the end of the code block (e.g. index update)
}

export interface JsBlock extends CodeBlock {
    kind: CodeBlockKind.JsBlock | CodeBlockKind.FunctionBlock;
    startStatement: string;     // e.g. "if (foo===bar) {"
    endStatement: string;       // e.g. "}" - can be empty if followed by another JsBlock - e.g. if/else
    blocks: CodeBlock[];        // must always start and end with a NodeBlock (even if there is no node to Generate)
    initLines: CodeLine[];      // code lines corresponding to the block initialization (group check, etc.)
}

export interface FunctionBlock extends JsBlock {
    kind: CodeBlockKind.FunctionBlock;
    isMethod: boolean;          // true if the function is a method of a class
    headDeclarations: { ivImports: {}; constAliases: {}; maxLevelIdx: number; maxTextIdx: number; maxFuncIdx: number; params: { name: string; type: string }[]; };
    maxLevel: number;
    rendererNm: string;         // renderer identifier (e.g. "r")
    nextNodeIdx: () => number;  // create a new incremental node index
    lastNodeIdx: () => number;  // return the last index that was given
}

export interface JsStatements extends CodeBlock {
    kind: CodeBlockKind.JsStatements;
    statements: string[];       // e.g. ["let x=123;", "let y=234;"]
}

// CodeLine types
export interface CodeLine {
    kind: CodeLineKind
}

export const enum CodeLineKind {
    CreateElement = 0,
    CreateComponent = 1,
    CreateTextNode = 2,
    CreateDynText = 3,
    CheckGroup = 4,
    SetProps = 5,
    SetAtts = 6,
    SetNodeRef = 7,
    UpdateProp = 8,
    UpdateCptProp = 9,
    UpdateText = 10,
    UpdateAtt = 11,
    RefreshCpt = 12,
    DeleteGroups = 13,
    IncrementIdx = 14,
    ResetIdx = 15,
    JsExpression = 16,
    FuncDef = 17,
    SwapLtGroup = 18,
    Insert = 19,
    RefreshInsert = 20,
    SetIndexes = 21,
    CreateDataNode = 22
}

export interface ClCreateNode extends CodeLine {
    // e.g. $a1 = $el($a0, 3, "div", 1); -> for a create element
    eltName: string;            // "div" in this example
    nodeIdx: number;            // 3 in this example
    parentLevel: number;        // 0 in this example ($a1 is deduced from $a0)
    needRef: boolean;           // true in this example (last 1)
}

export interface ClCreateElement extends ClCreateNode {
    // e.g. $a1 = $el($a0, 3, "div", 1);
    kind: CodeLineKind.CreateElement;
}

export interface ClCreateDataNode extends ClCreateNode {
    // e.g. $a1 = $dn($a1, 2, "title", 1);
    kind: CodeLineKind.CreateDataNode;
}

export interface ClCreateComponent extends ClCreateNode {
    // e.g. $a2 = $cc($a1, 4, { "value": v + 1, "msg": ("m1:" + v) }, r, bar, 0 ,1);
    kind: CodeLineKind.CreateComponent;
    props: string[];            // ["value", "v + 1", "msg", '("m1:" + v)']
    rendererNm: string;         // "r" in this example
    hasLightDom: boolean;       // 0 in this example
}

export interface ClSetProps extends CodeLine {
    // e.g. $a1.props = { "class": "hello", "foo": 123 };
    kind: CodeLineKind.SetProps;
    eltLevel: number;           // 1 in this example
    props: string[];            // ["class",'"hello"',"foo","123"] in this example
}

export interface ClSetAtts extends CodeLine {
    // e.g. $a1.atts = { "aria-disabled": "false" };
    kind: CodeLineKind.SetAtts;
    eltLevel: number;           // 1 in this example
    atts: string[];             // ["aria-disabled", "false"] in this example
}

export interface ClUpdateProp extends CodeLine {
    // e.g. $up("baz", nbr + 3, $a2, $a0)
    kind: CodeLineKind.UpdateProp;
    propName: string;           // "baz" in this example
    expr: string;               // "nbr + 3" in this example
    eltLevel: number;           // 2 in this example
    changeCtnIdx: number;       // 0 in this example
}

export interface ClUpdateAtt extends CodeLine {
    // e.g. $ua("aria-disabled", nbr + 3, $a2, $a0)
    kind: CodeLineKind.UpdateAtt;
    attName: string;            // "aria-disabled" in this example
    expr: string;               // "nbr + 3" in this example
    eltLevel: number;           // 2 in this example
    changeCtnIdx: number;       // 0 in this example
}

export interface ClUpdateCptProp extends CodeLine {
    // e.g. $uc("baz", nbr + 3, $a2)
    kind: CodeLineKind.UpdateCptProp;
    propName: string;           // "baz" in this example
    expr: string;               // "nbr + 3" in this example
    eltLevel: number;           // 2 in this example
}

export interface ClSetNodeRef extends CodeLine {
    // e.g. $a2 = $a1.children[0]
    kind: CodeLineKind.SetNodeRef;
    parentLevel: number;        // 1 in this example
    childRef: string;           // "0" in this example but could also be "$i0+3"
}

export interface ClCreateTextNode extends CodeLine {
    // e.g. $tx($a2, 3, " Hello ");
    kind: CodeLineKind.CreateTextNode;
    nodeIdx: number;            // 3 in this example
    parentLevel: number;        // 2 in this example ($a1 is deduced from $a0)
    text: string;               // " Hello " in this example
}

export interface ClCreateDynTextNode extends CodeLine {
    // e.g. $dt($a1, 2, " nbr " + $ct(nbr+1) + "! ");
    kind: CodeLineKind.CreateDynText;
    nodeIdx: number;            // 3 in this example
    parentLevel: number;        // 2 in this example ($a1 is deduced from $a0)
    fragments: string[];        // ['" nbr "', '$ct(nbr+1)', '"! "']
}

export interface ClUpdateText extends CodeLine {
    // e.g. $ut($a1, 2, " nbr " + $ct(nbr+1) + "! ");
    kind: CodeLineKind.UpdateText;
    fragments: string[];        // ['" nbr "', '$ct(nbr+1)', '"! "']
    eltLevel: number;           // 2 in this example
    changeCtnIdx: number;       // 0 in this example
}

export interface ClCheckGroup extends CodeLine {
    // e.g. $a2 = $cg($i1, $a1, $a0, $a0, 3);
    kind: CodeLineKind.CheckGroup;
    groupIdx: number;           // 3 in this example
    parentLevel: number;        // 1 in this case
    changeCtnIdx: number;       // 0 in this case (3rd position)
    parentGroupLevel: number;   // 0 in this case (4th position)
}

export interface ClDeleteGroups extends CodeLine {
    // e.g. $dg($i1, $a1, $a0, 8);
    kind: CodeLineKind.DeleteGroups;
    targetIdx: number;          // 8 in this example
    parentLevel: number;        // 1 in this example (for $i1 and $a1)
    changeCtnIdx: number;       // 0 in this example (for $a0)
}

export interface ClIncrementIdx extends CodeLine {
    // e.g. $i1++;
    kind: CodeLineKind.IncrementIdx;
    idxLevel: number;           // 1 in this example
}

export interface ClResetIdx extends CodeLine {
    // e.g. $i1 = 0;
    kind: CodeLineKind.ResetIdx;
    idxLevel: number;           // 1 in this example
}

export interface ClSetIndexes extends CodeLine {
    // e.g. $i2 += 3;
    kind: CodeLineKind.SetIndexes;
    indexes: { level: number, relative: boolean, value: number }[];   // in this example: level=2, relative=true, value=3
}

export interface ClJsExpression extends CodeLine {
    // e.g. let x = 123;
    kind: CodeLineKind.JsExpression;
    expr: string;               // "let x = 123;" in this example
}

export interface ClRefreshCpt extends CodeLine {
    // e.g. $rc(r, $a2, $a0);
    kind: CodeLineKind.RefreshCpt;
    rendererNm: string;         // "r" in this example
    cptLevel: number;           // 2 in this example
    changeCtnIdx: number;       // 0 in this example
}

export interface ClInsert extends CodeLine {
    // e.g. $a2 = $in($a1, 9, body, $a0);
    kind: CodeLineKind.Insert;
    nodeIdx: number;            // 9 in this example
    parentLevel: number;        // 1 in this example
    expr: string;               // body in this example
    changeCtnIdx: number;       // 0 in this example
}

export interface ClRefreshInsert extends CodeLine {
    // e.g. $ri($a1, $i1+1, body, $a0);
    kind: CodeLineKind.RefreshInsert;
    parentLevel: number;        // 1 in this example
    idxExpr: string;            // "$i1+1" in this example
    expr: string;               // body in this example
    changeCtnIdx: number;       // 0 in this example
}

export interface ClSwapLtGroup extends CodeLine {
    // $a2 = $a2.ltGroup;
    kind: CodeLineKind.SwapLtGroup;
    cptLevel: number;           // 2 in this example
}

export interface ClFuncDef extends CodeLine {
    // e.g. $f2=function() {doSomething()};
    kind: CodeLineKind.FuncDef;
    index: number;              // 2 in this example
    expr: string;               // function() {doSomething()} in this example
}
