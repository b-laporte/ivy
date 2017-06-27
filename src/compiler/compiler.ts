import * as ts from "typescript";
import { parse } from "./parser";
import { NacNode, NacNodeType, NacAttributeNature } from "./nac";

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
            headDeclarations: {
                constAliases: {},
                maxShiftIdx: -1
            },
            baseIndent: tf.rootIndent,
            startStatement: "",
            endStatemnet: "",
            blocks: [],
            startLevel: 0,
            endLevel: 0,
            parentGroupIdx: 0,
            changeGroupIdx: 0,
            nextNodeIdx: () => ++nodeCount,
            lastNodeIdx: () => nodeCount,
            functionCtxt: null,
            maxLevel: 0
        }
        fc.functionCtxt = fc;
        scanBlocks(nac, fc);
        let lines: string[] = [];
        generateCode(fc, lines);
        generateTplFunctionDeclarations(tf, fc);
        tf.fnBody = lines.join(CR);
    }
}

function generateTplFunctionDeclarations(tf: TplFunction, fc: FunctionBlock) {
    let constBuf: string[] = [],
        aliases = fc.headDeclarations.constAliases,
        maxShiftIdx = fc.headDeclarations.maxShiftIdx,
        elRefs: string[] = [],
        idxRefs: string[] = [];
    if (fc.maxLevel > 0) {
        for (let i = 0; fc.maxLevel > i; i++) {
            elRefs.push(", $a" + (i + 1));
        }
    }
    for (let i = 0; maxShiftIdx >= i; i++) {
        idxRefs.push(", $i" + i);
    }

    let fh = `${tf.rootIndent}let $a0: any = ${tf.rendererNm}.parent${elRefs.join("")}${idxRefs.join("")};`;

    for (let k in aliases) {
        if (aliases.hasOwnProperty(k)) {
            constBuf.push(k + " = " + aliases[k]);
        }
    }
    if (constBuf.length) {
        fh += CR + tf.rootIndent + "const $ = r.rt, " + constBuf.join(", ") + ";";
    }
    tf.fnHead = fh;
}

/**
 * Generate a block list from the
 * @param b
 */
function scanBlocks(nac: NacNode, b: JsBlock, shifts: CodeShift[] = []) {
    let nd = nac,
        nacPath: NacNode[] = [], // list of ancestor nodes in the nac tree
        nodeBlock: NodeBlock,
        currentBlock: CodeBlock | null = null; // current block being processed
    if (nd) {
        shifts.push({ nbrOfCreations: 0, relative: false, generated: false });
    }
    while (nd) {
        if (nd.nodeType === NacNodeType.JS_EXPRESSION) {
            // todo
            nd = nextNode(nd, true);
            console.log("todo: js expressions")
        } else if (nd.nodeType === NacNodeType.JS_BLOCK) {
            if (currentBlock && currentBlock.kind === CodeBlockKind.NodeBlock) {
                let nb = <NodeBlock>currentBlock, sh = nb.shifts;
                generateNodeBlockRefsLine(nb, shifts, currentLevel());

                // ensure that parent node is created with a reference
                let level = currentLevel(), cl: CodeLine;
                // find last CreateElement code line that matches this level
                for (let i = nb.cmLines.length - 1; i > -1; i--) {
                    cl = nb.cmLines[i];
                    if (cl.kind === CodeLineKind.CreateElement && (level === (<ClCreateElement>cl).parentLevel + 1)) {
                        (<ClCreateElement>cl).needRef = true;
                    }
                }
            }
            if (b.blocks.length > 0) {
                resetShifts();
            }

            let jsb: JsBlock = {
                kind: CodeBlockKind.JsBlock,
                functionCtxt: b.functionCtxt,
                baseIndent: b.baseIndent + "    ",
                startLevel: currentLevel() + 1,
                endLevel: currentLevel(),
                blocks: [],
                startStatement: ("" + nd.nodeValue.startBlockExpression).trim(),
                endStatement: ("" + nd.nodeValue.endBlockExpression).trim(),
                parentGroupIdx: currentLevel() + 1,
                changeGroupIdx: b.changeGroupIdx,
                initLines: []
            }
            if (currentBlock && currentBlock.kind === CodeBlockKind.JsBlock) {
                checkGroup(jsb.initLines, currentLevel());
            }
            b.blocks.push(jsb);
            currentBlock = jsb;
            // init lines
            let cg: ClCheckGroup = {
                kind: CodeLineKind.CheckGroup,
                groupIdx: b.functionCtxt.nextNodeIdx(),
                parentLevel: currentLevel(),
                changeGroupLevel: b.changeGroupIdx,
                parentGroupLevel: b.parentGroupIdx
            }
            shifts[cg.parentLevel].nbrOfCreations += 1;
            jsb.initLines.push(cg);
            let ii: ClIncrementIdx = {
                kind: CodeLineKind.IncrementIdx,
                idxLevel: currentLevel()
            }
            jsb.initLines.push(ii);

            // recursively scan child blocks
            if (nd.firstChild) {
                scanBlocks(nd.firstChild, jsb, shifts);
            }
            nd = nextNode(nd, true);
        } else {
            // normal node
            // check that current block is a NodeBlock or create a new block
            if (!currentBlock || currentBlock.kind !== CodeBlockKind.NodeBlock) {
                appendNodeBlock();
            } else {
                // use current block
                currentBlock.endLevel = currentLevel();
            }
            nodeBlock = currentBlock as NodeBlock;

            // create instructions for this node
            generateNodeBlockCodeLines(currentBlock as NodeBlock, nd, currentLevel(), shifts);

            // move next node
            nd = nextNode(nd);
        }
    }

    // ensure that last block is a node block
    if (b.blocks.length && b.blocks[b.blocks.length - 1].kind !== CodeBlockKind.NodeBlock) {
        // create a last block
        appendNodeBlock();
    }

    // ensure first and last block are NodeBlock
    // todo

    function appendNodeBlock() {
        // create new block
        let startLevel = currentLevel();
        if (b.blocks.length > 0) {
            resetShifts();  // reset all shifts to 0
            startLevel = b.blocks[b.blocks.length - 1].endLevel;
        }
        nodeBlock = {
            kind: CodeBlockKind.NodeBlock,
            functionCtxt: b.functionCtxt,
            baseIndent: b.baseIndent,
            startLevel: startLevel,
            endLevel: currentLevel(),
            parentGroupIdx: b.startLevel,
            changeGroupIdx: b.changeGroupIdx,
            shifts: [],
            cmLines: [],
            umLines: []
        }
        // if not first block, generate a delete groups instruction
        checkGroup(nodeBlock.umLines, startLevel);

        b.blocks.push(nodeBlock);
        currentBlock = nodeBlock;
        updateShifts();
    }

    // helper function to find next node
    function nextNode(nd, noChild = false) {
        if (!noChild && nd.firstChild) {
            shifts.push({ nbrOfCreations: 0, relative: false, generated: false });
            updateShifts();
            nacPath.push(nd);
            return nd.firstChild;
        } else if (nd.nextSibling) {
            return nd.nextSibling;
        } else {
            shifts.pop();
            updateShifts();
            nd = nacPath.pop();
            return nd ? nextNode(nd, true) : null;
        }
    }

    function currentLevel() {
        return nacPath.length + b.startLevel;
    }

    function updateShifts() {
        if (currentBlock && currentBlock.kind === CodeBlockKind.NodeBlock) {
            (<NodeBlock>currentBlock).shifts = shifts.slice(0); // clone shifts array
        }
    }

    function resetShifts() {
        let sh;
        for (let i = 0; shifts.length > i; i++) {
            sh = shifts[i];
            shifts[i] = { nbrOfCreations: 0, relative: true, generated: sh.generated === true }; // create new objects to avoid impact on previous copies
        }
    }

    function checkGroup(lines: CodeLine[], level: number) {
        if (b.blocks.length > 0) {
            let dg: ClDeleteGroups = {
                kind: CodeLineKind.DeleteGroups,
                targetIdx: b.functionCtxt.lastNodeIdx() + 1,
                parentLevel: level,
                changeGroupLevel: b.changeGroupIdx
            }
            lines.push(dg);
        }
    }
}

function generateNodeBlockCodeLines(nb: NodeBlock, nd: NacNode, level: number, shifts: CodeShift[]) {
    if (nd.nodeType === NacNodeType.ELEMENT) {
        // creation mode

        // create element
        // e.g. $a1 = $el($a0, 1, "div", 1);
        let cl: ClCreateElement = {
            kind: CodeLineKind.CreateElement,
            eltName: nd.nodeName,
            nodeIdx: nb.functionCtxt.nextNodeIdx(),
            parentLevel: level,
            needRef: false
        };
        nb.cmLines.push(cl);
        shifts[level].nbrOfCreations += 1;
        shifts[level].generated = false;

        // then set properties
        // e.g. $a2.props = { "class": "one", "title": "blah", "foo": nbr+4 };
        let att = nd.firstAttribute, propsBuf: string[] = [], upBuf: string[] = [];
        while (att) {
            propsBuf.push(att.name);
            propsBuf.push(att.value);
            if (att.nature === NacAttributeNature.BOUND1WAY || att.nature === NacAttributeNature.BOUND2WAYS) {
                upBuf.push(att);
                cl.needRef = true;
            }
            att = att.nextSibling;
        }
        if (propsBuf.length) {
            let sp: ClSetProps = {
                kind: CodeLineKind.SetProps,
                eltLevel: cl.parentLevel + 1,
                props: propsBuf
            }
            nb.cmLines.push(sp);
        }

        // update mode
        if (upBuf.length) {
            // set node refs
            generateNodeBlockRefsLine(nb, shifts);
            for (att of upBuf) {
                let up: ClUpdateProp = {
                    kind: CodeLineKind.UpdateProp,
                    eltLevel: cl.parentLevel + 1,
                    propName: att.name,
                    expr: att.value,
                    changeGroupLevel: nb.changeGroupIdx
                }
                nb.umLines.push(up);
            }
        }


    } else if (nd.nodeType === NacNodeType.TEXT) {
        let cl: ClCreateTextNode = {
            kind: CodeLineKind.CreateTextNode,
            nodeIdx: nb.functionCtxt.nextNodeIdx(),
            parentLevel: level,
            text: nd.nodeValue
        }
        shifts[level].nbrOfCreations += 1;
        shifts[level].generated = false;
        nb.cmLines.push(cl);
    } else {
        console.log("[iv compiler] Unsupported node type: " + nd.nodeType);
    }
}

function generateNodeBlockRefsLine(nb: NodeBlock, shifts: CodeShift[], max: number = -1) {
    let sh, sn: ClSetNodeRef, val;
    if (max < 0) {
        max = nb.shifts.length;
    }
    for (let i = 0; max > i; i++) {
        sh = nb.shifts[i];
        val = sh.nbrOfCreations - 1;
        if (!sh.generated) {
            let childRef: any;
            if (val === 0) {
                childRef = sh.relative ? `$i${i}` : "0";
            } else if (val > 0) {
                childRef = sh.relative ? `$i${i}+${val}` : "" + val;
            } else if (val < 0) {
                // this should not happen on non-generated references
                console.error("Invalid shift reference");
            }
            // e.g. $a2 = $a1.children[0]
            sn = {
                kind: CodeLineKind.SetNodeRef,
                parentLevel: i,
                childRef: childRef
            };
            nb.umLines.push(sn);
            sh.generated = true;
            if (shifts[i]) {
                // push the generated information to the main shifts array
                // as nb stores a clone
                shifts[i].generated = true;
            }
        }
    }
}

function generateCode(parentBlock: JsBlock, lines: string[]): void {
    let blockIdx = 0, fc = parentBlock.functionCtxt;;
    for (let block of parentBlock.blocks) {
        if (block.kind === CodeBlockKind.NodeBlock) {
            // we have to generate code such as
            // if ($a0.cm) {
            //     $a1 = $el($a0, 1, "div", 1);
            //     $tx($a1, 2, " ABC ");
            // } else {
            //     $a1 = $a0.children[0];
            // }
            // $i1 = 1;

            let b = block as NodeBlock, isLast = (blockIdx === parentBlock.blocks.length - 1);
            if (b.cmLines.length || isLast) {
                lines.push(`${b.baseIndent}if ($a${b.parentGroupIdx}.cm) {`);
                for (let cln of b.cmLines) {
                    lines.push(stringifyCodeLine(cln, b.baseIndent + "    ", fc));
                }
                // if last block, set cm to false
                if (isLast) {
                    lines.push(`${b.baseIndent}    $a${b.parentGroupIdx}.cm = 0;`);
                }
                if (b.umLines.length) {
                    lines.push(`${b.baseIndent}} else {`);
                    for (let uln of b.umLines) {
                        lines.push(stringifyCodeLine(uln, b.baseIndent + "    ", fc));
                    }
                }
                lines.push(`${b.baseIndent}}`);

                // push shifts - e.g. $i1 = 1;
                let shiftExprs: string[] = [], sh;
                debugger
                for (let i = 0; b.shifts.length > i; i++) {
                    sh = b.shifts[i];
                    if (i >= b.startLevel && (!sh.relative || sh.nbrOfCreations > 0)) {
                        if (sh.relative) {
                            shiftExprs.push(`$i${i} += ${sh.nbrOfCreations};`);
                        } else {
                            shiftExprs.push(`$i${i} = ${sh.nbrOfCreations};`);
                        }
                    }
                }
                if (fc.headDeclarations.maxShiftIdx < b.shifts.length - 1) {
                    fc.headDeclarations.maxShiftIdx = b.shifts.length - 1;
                }
                if (shiftExprs.length) {
                    lines.push(b.baseIndent + shiftExprs.join(" "));
                }
            } else {
                // this case is only possible in the last block of the list
                // todo create delete node 
            }
        } else if (block.kind === CodeBlockKind.JsBlock) {
            let jsb = block as JsBlock;
            lines.push(`${parentBlock.baseIndent}${jsb.startStatement}`);
            for (let cl of jsb.initLines) {
                lines.push(stringifyCodeLine(cl, jsb.baseIndent, fc));
            }
            generateCode(jsb, lines);
            lines.push(`${parentBlock.baseIndent}${jsb.endStatement}`);
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
    baseIndent: string;        // e.g. "    " - string to prefix every line
    startLevel: number;        // e.g. 0 when the current parent node is at depth 0
    endLevel: number;          // e.g. 1 when the block leaves a node element open at depth 1
    parentGroupIdx: number;    // depth level of the block's parent group (may not be the direct parent)
    changeGroupIdx: number;    // depth level of the block's change group (usually 0)
}

interface CodeShift {
    // structure to store index shift information when new nodes are created
    nbrOfCreations: number,    // nbr of nodes created at this level
    relative: boolean,         // tells if the shift is absolute (e.g. as long as no js block is met) or relative
    generated: boolean         // tells is the node reference has already been generated in the code (in which case it must not be regenarated)
}

interface NodeBlock extends CodeBlock {
    kind: CodeBlockKind.NodeBlock;
    shifts: CodeShift[];       // index shift for each level, if level has been created in this block relative=false
    cmLines: CodeLine[];       // code lines corresponding to the creation mode
    umLines: CodeLine[];       // code lines correponding to the update mode
}

interface JsBlock extends CodeBlock {
    kind: CodeBlockKind.JsBlock | CodeBlockKind.FunctionBlock;
    startStatement: string;     // e.g. "if (foo===bar) {"
    endStatement: string;       // e.g. "}" - can be empty if followed by another JsBlock - e.g. if/else
    blocks: CodeBlock[];        // must always start and end with a NodeBlock (even if there is no node to Generate)
    initLines: CodeLine[];      // code lines corresponding to the block initialization (group check, etc.)
}

interface FunctionBlock extends JsBlock {
    kind: CodeBlockKind.FunctionBlock;
    headDeclarations: { constAliases: {}; maxShiftIdx: number; };
    maxLevel: number;
    nextNodeIdx: () => number;  // create a new incremental node index
    lastNodeIdx: () => number;  // return the last index that was given
}

interface JsStatements extends CodeBlock {
    kind: CodeBlockKind.JsStatements;
    statements: string[];       // e.g. ["let x=123;", "let y=234;"]
}

// CodeLine types
interface CodeLine {
    kind: CodeLineKind
}

const enum CodeLineKind {
    CreateElement = 0,
    SetProps = 1,
    UpdateProp = 2,
    CreateTextNode = 3,
    SetNodeRef = 4,
    CheckGroup = 5,
    DeleteGroups = 6,
    IncrementIdx = 7
}

interface ClCreateElement extends CodeLine {
    // e.g. $a1 = $el($a0, 3, "div", 1);
    kind: CodeLineKind.CreateElement;
    eltName: string;            // "div" in this example
    nodeIdx: number;            // 3 in this example
    parentLevel: number;        // 0 in this example ($a1 is deduced from $a0)
    needRef: boolean;           // true in this example (last 1)
}

interface ClSetProps extends CodeLine {
    // e.g. $a1.props = { "class": "hello", "foo": 123 };
    kind: CodeLineKind.SetProps;
    eltLevel: number;           // 1 in this example
    props: string[];            // ["class",'"hello"',"foo","123"] in this example
}

interface ClUpdateProp extends CodeLine {
    // e.g. $up("baz", nbr + 3, $a2, $a0)
    kind: CodeLineKind.UpdateProp;
    propName: string;           // "baz" in this example
    expr: string;               // "nbr + 3" in this example
    eltLevel: number;           // 2 in this example
    changeGroupLevel: number;   // 0 in this example
}

interface ClSetNodeRef extends CodeLine {
    // e.g. $a2 = $a1.children[0]
    kind: CodeLineKind.SetNodeRef;
    parentLevel: number;        // 1 in this example
    childRef: string;           // "0" in this example but could also be "$i0+3"
}

interface ClCreateTextNode extends CodeLine {
    // e.g. $tx($a2, 3, " Hello ");
    kind: CodeLineKind.CreateTextNode;
    nodeIdx: number;            // 3 in this example
    parentLevel: number;        // 2 in this example ($a1 is deduced from $a0)
    text: string;               // " Hello " in this example
}

interface ClCheckGroup extends CodeLine {
    // e.g. $a2 = $cg($i1, $a1, $a0, $a0, 3);
    kind: CodeLineKind.CheckGroup;
    groupIdx: number;           // 3 in this example
    parentLevel: number;        // 1 in this case
    changeGroupLevel: number;   // 0 in this case (3rd position)
    parentGroupLevel: number;   // 0 in this case (4th position)
}

interface ClDeleteGroups extends CodeLine {
    // e.g. $dg($i1, $a1, $a0, 8);
    kind: CodeLineKind.DeleteGroups;
    targetIdx: number;          // 8 in this example
    parentLevel: number;        // 1 in this example (for $i1 and $a1)
    changeGroupLevel: number;   // 0 in this example (for $a0)
}

interface ClIncrementIdx extends CodeLine {
    // e.g. $i1++;
    kind: CodeLineKind.IncrementIdx;
    idxLevel: number;           // 1 in this example
}

function stringifyCodeLine(cl: CodeLine, indent: string, fc: FunctionBlock): string {
    switch (cl.kind) {
        case CodeLineKind.CreateElement:
            let el = cl as ClCreateElement;
            // e.g. $a1 = $el($a0, 3, "div", 1);
            fc.headDeclarations.constAliases["$el"] = "$.createEltNode";
            if (fc.maxLevel < el.parentLevel + 1) {
                fc.maxLevel = el.parentLevel + 1;
            }
            return `${indent}$a${el.parentLevel + 1} = $el($a${el.parentLevel}, ${el.nodeIdx}, "${el.eltName}", ${el.needRef ? 1 : 0});`;
        case CodeLineKind.CreateTextNode:
            let tx = cl as ClCreateTextNode;
            // e.g. $tx($a2, 3, " Hello ");
            fc.headDeclarations.constAliases["$tx"] = "$.createTxtNode";
            return `${indent}$tx($a${tx.parentLevel}, ${tx.nodeIdx}, "${tx.text}");`;
        case CodeLineKind.SetProps:
            let sp = cl as ClSetProps, propsBuf: string[] = [];
            // $a1.props = { "class": "hello", "foo": 123 };
            for (let i = 0; sp.props.length > i; i += 2) {
                propsBuf.push(`"${sp.props[i]}": ${sp.props[i + 1]}`);
            }
            return `${indent}$a${sp.eltLevel}.props = { ${propsBuf.join(", ")} };`;
        case CodeLineKind.UpdateProp:
            let up = cl as ClUpdateProp;
            // e.g. $up("baz", nbr + 3, $a2, $a0)
            fc.headDeclarations.constAliases["$up"] = "$.updateProp";
            return `${indent}$up("${up.propName}", ${up.expr}, $a${up.eltLevel}, $a${up.changeGroupLevel});`;
        case CodeLineKind.SetNodeRef:
            let sr = cl as ClSetNodeRef;
            // e.g. $a2 = $a1.children[0];
            return `${indent}$a${sr.parentLevel + 1} = $a${sr.parentLevel}.children[${sr.childRef}];`;
        case CodeLineKind.CheckGroup:
            let cg = cl as ClCheckGroup;
            // e.g. $a2 = $cg($i1, $a1, $a0, $a0, 3);
            return `${indent}$a${cg.parentLevel + 1} = $cg($i${cg.parentLevel}, $a${cg.parentLevel}, $a${cg.changeGroupLevel}, $a${cg.parentGroupLevel}, ${cg.groupIdx});`;
        case CodeLineKind.DeleteGroups:
            let dg = cl as ClDeleteGroups;
            // e.g. $dg($i1, $a1, $a0, 8);
            return `${indent}$dg($i${dg.parentLevel}, $a${dg.parentLevel}, $a${dg.changeGroupLevel}, ${dg.targetIdx});`;
        case CodeLineKind.IncrementIdx:
            let ii = cl as ClIncrementIdx;
            // e.g. $i1++;
            if (fc.headDeclarations.maxShiftIdx < ii.idxLevel) {
                fc.headDeclarations.maxShiftIdx = ii.idxLevel
            }
            return `${indent}$i${ii.idxLevel}++;`;
    }
    return "// invalid code kind: " + cl.kind;
}