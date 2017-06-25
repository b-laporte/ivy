
/**
 * Main object to store the general context of a function compilation
 */
interface FunctionContext {
    headDeclarations: any;
    blocks: CodeBlock[]; // must always start and end with a NodeBlock (even if there is no node to Generate)
    indexCount: number;
}

const enum BlockKind {
    Unknown = 0,
    NodeBlock = 1,
    JsBlock = 2,
    JsStatements = 3
}

interface CodeBlock {
    kind: BlockKind;
    functionCtxt: FunctionContext;
    baseIndent: string;       // e.g. "    " - string to prefix every line
    startLevel: number;       // e.g. 0 when the current parent node is at depth 0
    endLevel : number;        // e.g. 1 when the block leaves a node element open at depth 1
    parentGroupIdx : number;  // depth level of the block's parent group (may not be the direct parent)
    changeGroupIdx: number;   // depth level of the block's change group (usually 0)
}

interface NodeBlock extends CodeBlock {
    kind: BlockKind.NodeBlock;
}

interface JsBlock extends CodeBlock {
    kind: BlockKind.JsBlock;
    startStatement: string;   // e.g. "if (foo===bar) {"
    endStatemnet: string;     // e.g. "}" - can be empty if followed by another JsBlock - e.g. if/else
}

interface JsStatements extends CodeBlock {
    kind: BlockKind.JsStatements;
    statements: string[];     // e.g. ["let x=123;", "let y=234;"]
}
