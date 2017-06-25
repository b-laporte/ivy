import * as ts from "typescript";
import { parse } from "./parser";
import { NacNode, NacNodeType } from "./nac";

const CR = "\n";

export function compile(source: string, id: string): CompilationCtxt {
    let srcFile = ts.createSourceFile(id, source, ts.ScriptTarget.ES2015, /*setParentNodes */ true),
        cc = new CompilationCtxt(source, id);
    scan(srcFile);
    for (let tf of cc.tplFunctions) {
        compileTemplateFunction(tf, cc);
    }
    return cc;

    function scan(node: ts.Node) {
        checkNode(node, cc);
        ts.forEachChild(node, scan);
    }
}

/**
 * Check if a node corresponds to a template function and add it to the compilation context
 * @param node 
 * @param cc 
 */
function checkNode(node: ts.Node, cc: CompilationCtxt) {
    //console.log(node.kind + "  " + node.pos + "  " + node.end);

    if (node.kind === ts.SyntaxKind.FunctionDeclaration || node.kind === ts.SyntaxKind.MethodDeclaration) {
        let fnd = <ts.FunctionDeclaration>node, p0;
        if (fnd.parameters.length > 0 && fnd.parameters[0]) {
            p0 = fnd.parameters[0];
            if (p0.type && p0.type.getText() === "VdRenderer" && fnd.body) {
                if (fnd.body.statements.length > 0 && fnd.body.statements[0].kind === ts.SyntaxKind.ExpressionStatement) {
                    let expr = fnd.body.statements[0], ch = expr.getChildren();
                    if (ch && ch.length > 0 && ch[0].kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
                        // this is a template function: it has
                        // - a first parameter of type VdRenderer
                        // - a body containing a NoSustitutionTemplate as first element

                        if (ch.length > 1) {
                            console.error("TODO: template function body should only contain template string");
                        }

                        let tfn = addTemplateFunction(cc);
                        // extract indent and template string
                        let str = ch[0].getText(), im = expr.getFullText().match(/(\s*\n)*(\s*)\`/);
                        if (im) {
                            tfn.rootIndent = im[2];
                        }
                        tfn.tplString = str.slice(1, - 1);
                        tfn.pos = ch[0].pos;
                        tfn.end = ch[0].end;
                        tfn.rendererNm = p0.name.getText();
                        for (let i = 1; fnd.parameters.length > i; i++) {
                            let pi = fnd.parameters[i];
                            tfn.params.push({
                                name: pi.name.getText(),
                                type: pi.type ? pi.type.getText() : ""
                            });
                        }
                    }
                }
            }
        }
    }
}

const CARRIAGE_RETURN = "\n";

interface TplFunction {
    tplString: string;   // template string content
    rootIndent: string;  // main indentation = string of empty spaces to use at the beginning of each line
    pos: number;         // original position in the TS file
    end: number;         // original end position in the TS file
    fnHead: string;      // function code to put at the beginning of the function body (usually local variable declaration)
    fnBody: string;      // main function code
    rendererNm: string;  // identifier name for the VdRenderer parameter - usually "r"
    params: { name: string; type: string }[];   // function parameters
}

interface CompilationError {
    description: string;
    lineNbr: number;
    columnNbr: number;
    fileName: string;
}

class CompilationCtxt {
    tplFunctions: TplFunction[] = [];
    errors: CompilationError[] | null = null;

    constructor(public src: string, public fileName: string) { }

    getOutput(): string {
        let res = this.src, pos = 0, chunks: string[] = [];
        for (let fn of this.tplFunctions) {
            chunks.push(this.src.substring(pos, fn.pos));
            chunks.push(CARRIAGE_RETURN);
            if (fn.fnHead) {
                chunks.push(fn.fnHead);
            }
            if (fn.fnHead && fn.fnBody) {
                chunks.push(CARRIAGE_RETURN);
            }
            if (fn.fnBody) {
                chunks.push(fn.fnBody);
            }
            pos = fn.end;
        }
        if (chunks.length) {
            chunks.push(this.src.substring(pos, this.src.length));
            res = chunks.join("");
        }
        return res;
    }
}

function addTemplateFunction(cc: CompilationCtxt): TplFunction {
    let tf = {
        tplString: "",
        rootIndent: "",
        pos: -1,
        end: -1,
        fnHead: "",
        fnBody: "",
        rendererNm: "",
        params: []
    }
    cc.tplFunctions.push(tf);
    return tf;
}

function addError(cc: CompilationCtxt, description: string, line: number, col: number) {
    if (!cc.errors) {
        cc.errors = [];
    }
    cc.errors.push({
        description: description,
        lineNbr: line,
        columnNbr: col,
        fileName: cc.fileName
    });
}

function compileTemplateFunction(tf: TplFunction, cc: CompilationCtxt) {
    let r = parse([tf.tplString], []), nac;
    if (r.error) {
        let err = r.error;
        // todo calculate line nbr shift
        addError(cc, err.description, err.lineNbr, err.columnNbr);
    } else if ((nac = r.nac) !== null) {

        //console.log(nac.toString());
        let nodeCount = 0;

        let fc: any = {
            kind: CodeBlockKind.FunctionBlock,
            headDeclarations: {},
            baseIndent: tf.rootIndent,
            startStatement: "",
            endStatemnet: "",
            blocks: [],
            startLevel: 0,
            endLevel: 0,
            parentGroupIdx: 0,
            changeGroupIdx: 0,
            nextNodeIdx: () => ++nodeCount,
            functionCtxt: null
        }
        fc.functionCtxt = fc;
        scanBlocks(nac, fc);
        let lines: string[] = [];
        generateCode(fc.blocks, lines);
        tf.fnBody = lines.join(CR);
    }
}

/**
 * Generate a block list from the
 * @param b
 */
function scanBlocks(nac: NacNode, b: JsBlock) {
    let nd = nac,
        nacPath: NacNode[] = [], // list of ancestor nodes in the nac tree
        shifts: { shift: number, relative: boolean }[] = [], // index shift for each level, if level has been created in this block relative=false
        nodeBlock: NodeBlock,
        currentBlock: CodeBlock | null = null; // current block being processed

    while (nd) {
        if (nd.nodeType === NacNodeType.JS_EXPRESSION) {
            // todo
            nd = nextNode(nd, true);
            console.log("todo: js expressions")
        } else if (nd.nodeType === NacNodeType.JS_BLOCK) {
            // todo
            nd = nextNode(nd, true);
            console.log("todo: js block")
        } else {
            // normal node
            // check that current block is a NodeBlock or create a new block
            if (!currentBlock || currentBlock.kind !== CodeBlockKind.NodeBlock) {
                // create new block
                resetShifts();
                nodeBlock = {
                    kind: CodeBlockKind.NodeBlock,
                    functionCtxt: b.functionCtxt,
                    baseIndent: b.baseIndent,
                    startLevel: currentLevel(),
                    endLevel: currentLevel(),
                    parentGroupIdx: b.startLevel,
                    changeGroupIdx: b.changeGroupIdx,
                    shifts: [],
                    cmLines: [],
                    umLines: []
                }
                b.blocks.push(nodeBlock);
                currentBlock = nodeBlock;
            } else {
                // use current block
                currentBlock.endLevel = currentLevel();
            }
            nodeBlock = currentBlock as NodeBlock;

            // create instructions for this node
            createCodeLines(currentBlock as NodeBlock, nd, currentLevel());

            // update shifts
            nodeBlock.shifts = shifts.slice(0); // clone shifts array
            // move next node
            nd = nextNode(nd);
        }
    }

    // ensure first and last block are NodeBlock
    // todo

    // helper function to find next node
    function nextNode(nd, noChild = false) {
        if (!noChild && nd.firstChild) {
            shifts.push({ shift: 1, relative: false });
            nacPath.push(nd);
            return nd.firstChild;
        } else if (nd.nextSibling) {
            shifts[shifts.length - 1].shift++;
            return nd.nextSibling;
        } else {
            shifts.pop();
            nd = nacPath.pop();
            return nd ? nextNode(nd, true) : null;
        }
    }

    function currentLevel() {
        return nacPath.length + b.startLevel;
    }

    function resetShifts() {
        for (let i = 0; shifts.length > i; i++) {
            shifts[i] = { shift: 0, relative: true }; // create new objects to avoid impact on previous copies
        }
    }
}

function createCodeLines(nb: NodeBlock, nd: NacNode, level: number) {
    if (nd.nodeType === NacNodeType.ELEMENT) {
        // creation mode
        // e.g. $a1 = $el($a0, 1, "div", 1);
        let cl: ClCreateElement = {
            kind: CodeLineKind.CreateElement,
            eltName: nd.nodeName,
            nodeIdx: nb.functionCtxt.nextNodeIdx(),
            parentLevel: level,
            needRef: false
        };
        nb.cmLines.push(cl);

        // update mode
        // todo
    } else if (nd.nodeType === NacNodeType.TEXT) {
        let cl: ClCreateTextNode = {
            kind: CodeLineKind.CreateTextNode,
            nodeIdx: nb.functionCtxt.nextNodeIdx(),
            parentLevel: level,
            text: nd.nodeValue
        }
        nb.cmLines.push(cl);
    } else {
        console.log("[iv compiler] Unsupported node type: " + nd.nodeType);
    }
}

function generateCode(blocks: CodeBlock[], lines: string[]): void {
    let blockIdx = 0;
    for (let block of blocks) {
        if (block.kind === CodeBlockKind.NodeBlock) {
            // we have to generate code such as
            // if ($a0.cm) {
            //     $a1 = $el($a0, 1, "div", 1);
            //     $tx($a1, 2, " ABC ");
            // } else {
            //     $a1 = $a0.children[0];
            // }
            // $i1 = 1;

            let b = block as NodeBlock;
            if (b.cmLines.length) {
                lines.push(`${b.baseIndent}if ($a${b.parentGroupIdx}.cm) {`);
                for (let cln of b.cmLines) {
                    lines.push(stringifyCodeLine(cln, b.baseIndent + "    "));
                }
                if (b.umLines.length) {
                    lines.push(`${b.baseIndent}} else {`);
                    for (let uln of b.umLines) {
                        lines.push(stringifyCodeLine(uln, b.baseIndent + "    "));
                    }
                } else {
                    lines.push(`${b.baseIndent}}`);
                }
                // push shifts
                let shiftExprs: string[] = [], sh;
                for (let i = 0; b.shifts.length > i; i++) {
                    sh = b.shifts[i];
                    if (!sh.relative || sh.shift > 0) {
                        shiftExprs.push(`$i${b.startLevel + i} ${sh.relative ? "+=" : "="} ${sh.shift};`)
                    }
                }
                if (shiftExprs.length) {
                    lines.push(b.baseIndent + shiftExprs.join(""));
                }
            } else {
                // this case is only possible in the last block of the list
                // todo create delete node 
            }
        }
        blockIdx++;
    }
}

// Block interfaces

const enum CodeBlockKind {
    Unknown = 0,
    FunctionBlock = 1,
    NodeBlock = 2,
    JsBlock = 3,
    JsStatements = 4
}

interface CodeBlock {
    kind: CodeBlockKind;
    functionCtxt: FunctionBlock;
    baseIndent: string;       // e.g. "    " - string to prefix every line
    startLevel: number;       // e.g. 0 when the current parent node is at depth 0
    endLevel: number;         // e.g. 1 when the block leaves a node element open at depth 1
    parentGroupIdx: number;   // depth level of the block's parent group (may not be the direct parent)
    changeGroupIdx: number;   // depth level of the block's change group (usually 0)
}

interface NodeBlock extends CodeBlock {
    kind: CodeBlockKind.NodeBlock;
    shifts: { shift: number, relative: boolean }[]; // index shift for each level, if level has been created in this block relative=false
    cmLines: CodeLine[];        // code lines corresponding to the creation mode
    umLines: CodeLine[];        // code lines correponding to the update mode
}

interface JsBlock extends CodeBlock {
    kind: CodeBlockKind.JsBlock | CodeBlockKind.FunctionBlock;
    startStatement: string;   // e.g. "if (foo===bar) {"
    endStatemnet: string;     // e.g. "}" - can be empty if followed by another JsBlock - e.g. if/else
    blocks: CodeBlock[]; // must always start and end with a NodeBlock (even if there is no node to Generate)
}

interface FunctionBlock extends JsBlock {
    kind: CodeBlockKind.FunctionBlock;
    headDeclarations: any;
    nextNodeIdx: () => number;// create a new incremental node index
}

interface JsStatements extends CodeBlock {
    kind: CodeBlockKind.JsStatements;
    statements: string[];     // e.g. ["let x=123;", "let y=234;"]
}

// CodeLine types

interface CodeLine {
    kind: CodeLineKind
}

const enum CodeLineKind {
    CreateElement = 0,
    CreateTextNode = 1
}

interface ClCreateElement extends CodeLine {
    // e.g. $a1 = $el($a0, 3, "div", 1);
    kind: CodeLineKind.CreateElement;
    eltName: string;      // "div" in this example
    nodeIdx: number;      // 3 in this example
    parentLevel: number;  // 0 in this example ($a1 is deduced from $a0)
    needRef: boolean;     // true in this example (last 1)
}

interface ClCreateTextNode extends CodeLine {
    // e.g. $tx($a2, 3, " Hello ");
    kind: CodeLineKind.CreateTextNode;
    nodeIdx: number;       // 3 in this example
    parentLevel: number;  // 2 in this example ($a1 is deduced from $a0)
    text: string;          // " Hello " in this example
}

function stringifyCodeLine(cl: CodeLine, indent: string): string {
    switch (cl.kind) {
        case CodeLineKind.CreateElement:
            let el = cl as ClCreateElement;
            // e.g. $a1 = $el($a0, 3, "div", 1);
            return `${indent}$a${el.parentLevel + 1} = $el($a${el.parentLevel}, ${el.nodeIdx}, "${el.eltName}", ${el.needRef ? 1 : 0});`;
        case CodeLineKind.CreateTextNode:
            let tx = cl as ClCreateTextNode;
            // e.g. $tx($a2, 3, " Hello ");
            return `${indent}$tx($a${tx.parentLevel}, ${tx.nodeIdx}, "${tx.text}");`;
    }
    return "// invalid code";
}