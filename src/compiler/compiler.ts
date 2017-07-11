import * as ts from "typescript";
import { parse } from "./parser";
import { NacNode, NacNodeType, NacAttributeNature } from "./nac";

const CR = "\n", VD_RENDERER_TYPE = "VdRenderer", ATT_NS = "attr";

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
            if (p0.type && p0.type.getText() === VD_RENDERER_TYPE && fnd.body) {
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
                        let str = ch[0].getText(), sm = str.match(/`\s*\n(\s+)/);

                        if (sm) {
                            // the template string starts with a CR and we use the indent that follows
                            tfn.rootIndent = sm[1];
                            let em = str.match(/(\s*)\`\s*$/);
                            if (em) {
                                tfn.lastIndent = em[1];
                            }
                        } else {
                            // use the indent of template string
                            let im = expr.getFullText().match(/(\s*\n)*(\s*)\`/);
                            if (im) {
                                tfn.rootIndent = im[2];
                            }
                        }

                        // extract function declaration start before the parameter parens
                        let fndText = fnd.getFullText(), ds = fndText.match(/^[^\(]*/);
                        if (ds && ds.length) {
                            tfn.declarationStart = ds[0]
                        }
                        // extract function declaratin end after the last `
                        let de = fndText.match(/[^\`]*$/);
                        if (de && de.length) {
                            tfn.declarationEnd = de[0]
                        }

                        tfn.tplString = str.slice(1, - 1).replace(/(^---)|(---$)/g, "");
                        tfn.pos = fnd.pos; // ch[0].pos;
                        tfn.end = fnd.end; // ch[0].end;
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
    lastIndent: string;  // indent to use for the function end
    declarationStart: string; // beginning of the function declaration up to the first parameter parens
    declarationEnd: string;   // end of the function declaration (i.e. everything after the last `)
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
        let res = this.src, pos = 0, chunks: string[] = [], param: string;
        for (let fn of this.tplFunctions) {
            chunks.push(this.src.substring(pos, fn.pos));
            chunks.push(fn.declarationStart);
            param = (fn.params && fn.params.length) ? ", $d: any" : "";
            chunks.push(`(${fn.rendererNm}: ${VD_RENDERER_TYPE}${param}) \{`);
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
            chunks.push(fn.lastIndent);
            chunks.push(fn.declarationEnd);
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
        lastIndent: "",
        pos: -1,
        end: -1,
        fnHead: "",
        fnBody: "",
        rendererNm: "",
        declarationStart: "",
        declarationEnd: "",
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
                params: tf.params,
                constAliases: {},
                maxShiftIdx: -1,
                maxTextIdx: -1,
                maxFuncIdx: -1
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
            rendererNm: tf.rendererNm,
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
        params = fc.headDeclarations.params,
        aliases = fc.headDeclarations.constAliases,
        maxShiftIdx = fc.headDeclarations.maxShiftIdx,
        maxFuncIdx = fc.headDeclarations.maxFuncIdx,
        elRefs: string[] = [],
        idxRefs: string[] = [];

    if (fc.maxLevel > 0) {
        for (let i = 0; fc.maxLevel > i; i++) {
            elRefs.push(", $a" + (i + 1));
        }
    }
    for (let i = 0; maxShiftIdx >= i; i++) {
        if (i === 0) {
            idxRefs.push(", $i0 = 0");
        } else {
            idxRefs.push(", $i" + i);
        }
    }
    for (let i = 0; maxFuncIdx >= i; i++) {
        idxRefs.push(", $f" + i);
    }
    let fh: string[] = [`${tf.rootIndent}let $a0: any = ${tf.rendererNm}.parent${elRefs.join("")}${idxRefs.join("")};`];

    for (let k in aliases) {
        if (aliases.hasOwnProperty(k)) {
            constBuf.push(k + " = " + aliases[k]);
        }
    }
    if (constBuf.length) {
        fh.push(tf.rootIndent + "const $ = r.rt, " + constBuf.join(", ") + ";");
    }
    if (params && params.length) {
        let pbuf: string[] = [];
        for (let p of params) {
            pbuf.push(p.name + " = $d[\"" + p.name + "\"]");
        }
        fh.push(`${tf.rootIndent}let ${pbuf.join(", ")};`);
    }
    tf.fnHead = fh.join(CR);
}

/**
 * Generate a block list from the
 * @param b
 */
function scanBlocks(nac: NacNode, b: JsBlock, shifts: CodeShift[] = []) {
    let nd = nac,
        nacPath: NacNode[] = [], // list of ancestor nodes in the nac tree
        nodeBlock: NodeBlock,
        jsExprBuffer: CodeLine[] = [],
        nextSiblingOnly: boolean,
        currentBlock: CodeBlock | null = null; // current block being processed
    if (nd) {
        shifts.push({ nbrOfCreations: 0, relative: false, generated: false });
    }
    // always start with a node block
    appendNodeBlock();
    while (nd) {
        nextSiblingOnly = false;
        if (nd.nodeType === NacNodeType.JS_EXPRESSION) {
            let isOK = false, jse: ClJsExpression;
            if (!currentBlock || currentBlock.kind === CodeBlockKind.JsBlock) {
                // we are at the beginning of a block list or after a jsblock
                isOK = true;
                jse = {
                    kind: CodeLineKind.JsExpression,
                    expr: ("" + nd.nodeValue).trim()
                }
                jsExprBuffer.push(jse);
            } else if (currentBlock && currentBlock.kind === CodeBlockKind.NodeBlock) {
                let nb = currentBlock as NodeBlock;
                if (nb.cmLines.length === 0) {
                    // this block is still empty
                    isOK = true;
                    nb.initLines.push(<ClJsExpression>{
                        kind: CodeLineKind.JsExpression,
                        expr: ("" + nd.nodeValue).trim()
                    });
                }
            }
            if (!isOK) {
                // not supported yet
                console.error("Js expressions are only supported at the beginning of a node block: " + nd.nodeValue);
            }
            nextSiblingOnly = true;
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
                deleteGroups(jsb.initLines, currentLevel());
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
            checkMaxShiftIndex(b.functionCtxt, cg.parentLevel);
            shifts[cg.parentLevel].nbrOfCreations += 1;
            shifts[cg.parentLevel].generated = true;
            jsb.initLines.push(cg);
            let ii: ClIncrementIdx = {
                kind: CodeLineKind.IncrementIdx,
                idxLevel: currentLevel()
            }
            jsb.initLines.push(ii);
            let ri: ClResetIdx = {
                kind: CodeLineKind.ResetIdx,
                idxLevel: currentLevel() + 1
            }
            jsb.initLines.push(ri);

            // recursively scan child blocks
            if (nd.firstChild) {
                scanBlocks(nd.firstChild, jsb, shifts);
            }
            nextSiblingOnly = true;
        } else if (nd.nodeType === NacNodeType.ELEMENT || nd.nodeType === NacNodeType.TEXT || nd.nodeType === NacNodeType.INSERT) {
            // normal node
            // check that current block is a NodeBlock or create a new block
            if (!currentBlock || currentBlock.kind !== CodeBlockKind.NodeBlock) {
                appendNodeBlock();
            } else {
                // use current block
                currentBlock.endLevel = currentLevel();
            }
            nodeBlock = currentBlock as NodeBlock;

            if (jsExprBuffer.length) {
                // some single lines expression have been found before the block
                nodeBlock.initLines = nodeBlock.initLines.concat(jsExprBuffer);
                jsExprBuffer = [];
            }

            if (nd.nodeType === NacNodeType.TEXT || nd.nodeType === NacNodeType.INSERT) {
                let tn: NacNode | null = nd, tnList: NacNode[] = [], lastValidNd: NacNode = nd;
                while (tn) {
                    tnList.push(tn);
                    tn = tn.nextSibling;
                    if (tn && (tn.nodeType === NacNodeType.TEXT || tn.nodeType === NacNodeType.INSERT)) {
                        lastValidNd = tn;
                    } else {
                        tn = null;
                    }
                }
                nd = lastValidNd;
                generateTextNodeCodeLines(currentBlock as NodeBlock, tnList, currentLevel(), shifts);
            } else {
                // create instructions for this node
                generateNodeBlockCodeLines(currentBlock as NodeBlock, nd, currentLevel(), shifts);
            }

            // move next node
        } else if (nd.nodeType === NacNodeType.COMMENT || nd.nodeType === NacNodeType.COMMENT_ML) {
            // ignore comments for the time being
        } else {
            console.error("Unsupported node type: " + nd.nodeType);
        }
        nd = nextNode(nd, nextSiblingOnly);
    }

    // ensure that last block is a node block
    if (b.blocks.length && b.blocks[b.blocks.length - 1].kind !== CodeBlockKind.NodeBlock) {
        // create a last block
        appendNodeBlock();
    }

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
            umLines: [],
            initLines: []
        }
        // if not first block, generate a delete groups instruction
        deleteGroups(nodeBlock.umLines, startLevel);

        b.blocks.push(nodeBlock);
        currentBlock = nodeBlock;
        updateShifts();

        if (jsExprBuffer.length) {
            // some single lines expression have been found before the block
            nodeBlock.initLines = nodeBlock.initLines.concat(jsExprBuffer);
            jsExprBuffer = [];
        }
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

    function deleteGroups(lines: CodeLine[], level: number) {
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
        let cl: ClCreateNode, cc: ClCreateComponent | null = null, el: ClCreateElement | null = null;

        if (nd.nodeNameSpace === "c") {
            // create component
            cc = {
                kind: CodeLineKind.CreateComponent,
                eltName: nd.nodeName,
                nodeIdx: nb.functionCtxt.nextNodeIdx(),
                parentLevel: level,
                needRef: false,
                rendererNm: nb.functionCtxt.rendererNm,
                props: []
            };
            nb.cmLines.push(cc);
            cl = cc;
        } else {
            // create element
            // e.g. $a1 = $el($a0, 1, "div", 1);
            el = {
                kind: CodeLineKind.CreateElement,
                eltName: nd.nodeName,
                nodeIdx: nb.functionCtxt.nextNodeIdx(),
                parentLevel: level,
                needRef: false
            };
            nb.cmLines.push(el);
            cl = el;
        }

        shifts[level].nbrOfCreations += 1;
        shifts[level].generated = false;

        // then set properties
        // e.g. $a2.props = { "class": "one", "title": "blah", "foo": nbr+4 };
        let att = nd.firstAttribute, propsBuf: string[] = [], attsBuf: string[] = [], upBuf: string[] = [];
        while (att) {
            if (att.nature === NacAttributeNature.DEFERRED_EXPRESSION) {
                let params = att.parameters ? att.parameters.join(",") : "",
                    hd = nb.functionCtxt.headDeclarations,
                    idx = ++hd.maxFuncIdx,
                    identifier = "$f" + idx;

                nb.initLines.push(<ClFuncDef>{
                    kind: CodeLineKind.FuncDef,
                    index: idx,
                    expr: ["function(", params, ") {", att.value, "}"].join("")
                });

                att.value = identifier;
                upBuf.push(att);
            }
            if (att.ns === ATT_NS) {
                // this is an att
                attsBuf.push(att.name);
                attsBuf.push(att.value);
            } else {
                // this is a prop
                propsBuf.push(att.name);
                propsBuf.push(att.value);
            }
            if (att.nature === NacAttributeNature.BOUND1WAY || att.nature === NacAttributeNature.BOUND2WAYS) {
                upBuf.push(att);
                cl.needRef = true;
            }
            att = att.nextSibling;
        }
        if (propsBuf.length) {
            if (cc) {
                cc.props = propsBuf;
            } else {
                let sp: ClSetProps = {
                    kind: CodeLineKind.SetProps,
                    eltLevel: cl.parentLevel + 1,
                    props: propsBuf
                }
                nb.cmLines.push(sp);
            }
        }
        if (attsBuf.length) {
            let sp: ClSetAtts = {
                kind: CodeLineKind.SetAtts,
                eltLevel: cl.parentLevel + 1,
                atts: attsBuf
            }
            nb.cmLines.push(sp);
        }

        // update mode
        if (upBuf.length) {
            // set node refs
            generateNodeBlockRefsLine(nb, shifts);
            for (att of upBuf) {
                if (cc) {
                    nb.umLines.push(<ClUpdateCptProp>{
                        kind: CodeLineKind.UpdateCptProp,
                        eltLevel: cc.parentLevel + 1,
                        propName: att.name,
                        expr: att.value
                    });
                    // todo raise error if attribute is used on component
                } else {
                    if (att.ns === ATT_NS) {
                        nb.umLines.push(<ClUpdateAtt>{
                            kind: CodeLineKind.UpdateAtt,
                            eltLevel: cl.parentLevel + 1,
                            attName: att.name,
                            expr: att.value,
                            changeGroupLevel: nb.changeGroupIdx
                        });
                    } else {
                        nb.umLines.push(<ClUpdateProp>{
                            kind: CodeLineKind.UpdateProp,
                            eltLevel: cl.parentLevel + 1,
                            propName: att.name,
                            expr: att.value,
                            changeGroupLevel: nb.changeGroupIdx
                        });
                    }
                }
            }
            if (cc) {
                // generate refresh cpt instruction
                nb.umLines.push(<ClRefreshCpt>{
                    kind: CodeLineKind.RefreshCpt,
                    rendererNm: nb.functionCtxt.rendererNm,
                    cptLevel: cc.parentLevel + 1,
                    changeGroupLevel: nb.changeGroupIdx
                });
            }
        }

    } else {
        console.log("[iv compiler] Unsupported node type: " + nd.nodeType);
    }
}

function generateTextNodeCodeLines(nb: NodeBlock, ndList: NacNode[], level: number, shifts: CodeShift[]) {
    let len = ndList.length;
    if (!len) return;
    if (len === 1 && ndList[0].nodeType === NacNodeType.TEXT) {
        let cl: ClCreateTextNode = {
            kind: CodeLineKind.CreateTextNode,
            nodeIdx: nb.functionCtxt.nextNodeIdx(),
            parentLevel: level,
            text: encodeTextString(ndList[0].nodeValue)
        }
        shifts[level].nbrOfCreations += 1;
        shifts[level].generated = false;
        nb.cmLines.push(cl);
    } else {
        // there are dynamic parts
        let nd: NacNode, hd = nb.functionCtxt.headDeclarations, tIdx: number, exprs: string[] = [];
        for (let i = 0; len > i; i++) {
            nd = ndList[i];
            if (nd.nodeType === NacNodeType.TEXT) {
                // add text as function const
                tIdx = ++hd.maxTextIdx;
                hd.constAliases["$t" + tIdx] = '"' + encodeTextString(nd.nodeValue) + '"';
                exprs.push("$t" + tIdx);
            } else if (nd.nodeType === NacNodeType.INSERT) {
                if (exprs.length === 0) {
                    exprs.push('""'); // to ensure string concatenation
                }
                exprs.push("(" + nd.nodeValue + ")");
            }
        }
        let cl: ClCreateDynTextNode = {
            kind: CodeLineKind.CreateDynText,
            nodeIdx: nb.functionCtxt.nextNodeIdx(),
            parentLevel: level,
            fragments: exprs
        }
        shifts[level].nbrOfCreations += 1;
        shifts[level].generated = false;
        nb.cmLines.push(cl);

        // push update mode instruction
        generateNodeBlockRefsLine(nb, shifts);
        nb.umLines.push(<ClUpdateText>{
            kind: CodeLineKind.UpdateText,
            fragments: exprs,
            eltLevel: cl.parentLevel + 1,
            changeGroupLevel: nb.changeGroupIdx
        });
    }
}

function encodeTextString(s: string): string {
    return s.replace(/\"/gi, '\\"').replace(/\n/gi, "\\n");
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
            if (sh.relative) {
                checkMaxShiftIndex(nb.functionCtxt, i);
            }
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
    let blockIdx = 0, fc = parentBlock.functionCtxt;
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
            if (b.initLines.length) {
                for (let ln of b.initLines) {
                    lines.push(stringifyCodeLine(ln, b.baseIndent, fc));
                }
            }
            if (b.cmLines.length || isLast) {
                lines.push(`${b.baseIndent}if ($a${b.parentGroupIdx}.cm) \{`);
                for (let cln of b.cmLines) {
                    lines.push(stringifyCodeLine(cln, b.baseIndent + "    ", fc));
                }
                // if last block, set cm to false
                if (isLast) {
                    lines.push(`${b.baseIndent}    $a${b.parentGroupIdx}.cm = 0;`);
                }
                if (b.umLines.length) {
                    lines.push(`${b.baseIndent}} else \{`);
                    for (let uln of b.umLines) {
                        lines.push(stringifyCodeLine(uln, b.baseIndent + "    ", fc));
                    }
                }
                lines.push(`${b.baseIndent}}`);

                // push shifts - e.g. $i1 = 1;
                let shiftExprs: string[] = [], sh;
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
                if (!isLast) {
                    let idxNext = b.shifts.length;
                    // make sure next potential level is reset
                    if (idxNext <= fc.headDeclarations.maxShiftIdx) {
                        checkMaxShiftIndex(fc, idxNext);
                    }
                } else {
                    checkMaxShiftIndex(fc, b.shifts.length - 1);
                }

                if (shiftExprs.length) {
                    lines.push(b.baseIndent + shiftExprs.join(" "));
                }
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

/**
 * Check that max $i index is greater or equal to max
 * @param fc 
 * @param max 
 */
function checkMaxShiftIndex(fc, max) {
    if (fc.headDeclarations.maxShiftIdx < max) {
        // to ensure shift variables (e.g. $i1) to be declared
        fc.headDeclarations.maxShiftIdx = max;
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
    initLines: CodeLine[];     // code lines corresponding to the block initialization (e.g. js expressions)
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
    headDeclarations: { constAliases: {}; maxShiftIdx: number; maxTextIdx: number; maxFuncIdx: number; params: { name: string; type: string }[]; };
    maxLevel: number;
    rendererNm: string;         // renderer identifier (e.g. "r")
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
    CreateComponent = 1,
    CreateTextNode = 2,
    CreateDynText = 3,
    CheckGroup = 4,
    SetProps = 5,
    SetAtts =6,
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
    FuncDef = 17
}

interface ClCreateNode extends CodeLine {
    // e.g. $a1 = $el($a0, 3, "div", 1); -> for a create element
    eltName: string;            // "div" in this example
    nodeIdx: number;            // 3 in this example
    parentLevel: number;        // 0 in this example ($a1 is deduced from $a0)
    needRef: boolean;           // true in this example (last 1)
}

interface ClCreateElement extends ClCreateNode {
    // e.g. $a1 = $el($a0, 3, "div", 1);
    kind: CodeLineKind.CreateElement;
}

interface ClCreateComponent extends ClCreateNode {
    // e.g. $a2 = $cc($a1, 4, { "value": v + 1, "msg": ("m1:" + v) }, 1, r, bar);
    kind: CodeLineKind.CreateComponent;
    props: string[];            // ["value", "v + 1", "msg", '("m1:" + v)']
    rendererNm: string;         // "r" in this example
}

interface ClSetProps extends CodeLine {
    // e.g. $a1.props = { "class": "hello", "foo": 123 };
    kind: CodeLineKind.SetProps;
    eltLevel: number;           // 1 in this example
    props: string[];            // ["class",'"hello"',"foo","123"] in this example
}

interface ClSetAtts extends CodeLine {
    // e.g. $a1.atts = { "aria-disabled": "false" };
    kind: CodeLineKind.SetAtts;
    eltLevel: number;           // 1 in this example
    atts: string[];             // ["aria-disabled", "false"] in this example
}

interface ClUpdateProp extends CodeLine {
    // e.g. $up("baz", nbr + 3, $a2, $a0)
    kind: CodeLineKind.UpdateProp;
    propName: string;           // "baz" in this example
    expr: string;               // "nbr + 3" in this example
    eltLevel: number;           // 2 in this example
    changeGroupLevel: number;   // 0 in this example
}

interface ClUpdateAtt extends CodeLine {
    // e.g. $ua("aria-disabled", nbr + 3, $a2, $a0)
    kind: CodeLineKind.UpdateAtt;
    attName: string;            // "aria-disabled" in this example
    expr: string;               // "nbr + 3" in this example
    eltLevel: number;           // 2 in this example
    changeGroupLevel: number;   // 0 in this example
}

interface ClUpdateCptProp extends CodeLine {
    // e.g. $uc("baz", nbr + 3, $a2)
    kind: CodeLineKind.UpdateCptProp;
    propName: string;           // "baz" in this example
    expr: string;               // "nbr + 3" in this example
    eltLevel: number;           // 2 in this example
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

interface ClCreateDynTextNode extends CodeLine {
    // e.g. $dt($a1, 2, " nbr " + (nbr+1) + "! ");
    kind: CodeLineKind.CreateDynText;
    nodeIdx: number;            // 3 in this example
    parentLevel: number;        // 2 in this example ($a1 is deduced from $a0)
    fragments: string[];        // ['" nbr "', '(nbr+1)', '"! "']
}

interface ClUpdateText extends CodeLine {
    // e.g. $ut($t0 + (nbr+1) + $t1, $a2, $a0);
    kind: CodeLineKind.UpdateText;
    fragments: string[];        // ["$t0", "(nbr+1)", "$t1"]
    eltLevel: number;           // 2 in this example
    changeGroupLevel: number;   // 0 in this example
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

interface ClResetIdx extends CodeLine {
    // e.g. $i1 = 0;
    kind: CodeLineKind.ResetIdx;
    idxLevel: number;           // 1 in this example
}

interface ClJsExpression extends CodeLine {
    // e.g. let x = 123;
    kind: CodeLineKind.JsExpression;
    expr: string;               // "let x = 123;" in this example
}

interface ClRefreshCpt extends CodeLine {
    // e.g. $rc(r, $a2, $a0);
    kind: CodeLineKind.RefreshCpt;
    rendererNm: string;         // "r" in this example
    cptLevel: number;           // 2 in this example
    changeGroupLevel: number;   // 0 in this example
}

interface ClFuncDef extends CodeLine {
    // e.g. $f2=function() {doSomething()};
    kind: CodeLineKind.FuncDef;
    index: number;              // 2 in this example
    expr: string;                // function() {doSomething()} in this example
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
        case CodeLineKind.CreateComponent:
            let cc = cl as ClCreateComponent, pbuf: string[] = [];
            // e.g. $a2 = $cc($a1, 4, { "value": v + 1, "msg": ("m1:" + v) }, 1, r, bar);
            fc.headDeclarations.constAliases["$cc"] = "$.createCpt";
            if (fc.maxLevel < cc.parentLevel + 1) {
                fc.maxLevel = cc.parentLevel + 1;
            }
            for (let i = 0; cc.props.length > i; i += 2) {
                pbuf.push(`"${cc.props[i]}": ${cc.props[i + 1]}`);
            }
            return `${indent}$a${cc.parentLevel + 1} = $cc($a${cc.parentLevel}, ${cc.nodeIdx}, { ${pbuf.join(", ")} }, ${cc.needRef ? 1 : 0}, ${cc.rendererNm}, ${cc.eltName});`;
        case CodeLineKind.CreateTextNode:
            let tx = cl as ClCreateTextNode;
            // e.g. $tx($a2, 3, " Hello ");
            fc.headDeclarations.constAliases["$tx"] = "$.createTxtNode";
            return `${indent}$tx($a${tx.parentLevel}, ${tx.nodeIdx}, "${tx.text}");`;
        case CodeLineKind.CreateDynText:
            let dt = cl as ClCreateDynTextNode;
            // e.g. $dt($a1, 2, " nbr " + (nbr+1) + "! ");
            fc.headDeclarations.constAliases["$dt"] = "$.dynTxtNode";
            if (fc.maxLevel < dt.parentLevel + 1) {
                fc.maxLevel = dt.parentLevel + 1;
            }
            return `${indent}$dt($a${dt.parentLevel}, ${dt.nodeIdx}, ${dt.fragments.join(" + ")});`;
        case CodeLineKind.SetProps:
            let sp = cl as ClSetProps, propsBuf: string[] = [];
            // $a1.props = { "class": "hello", "foo": 123 };
            for (let i = 0; sp.props.length > i; i += 2) {
                propsBuf.push(`"${sp.props[i]}": ${sp.props[i + 1]}`);
            }
            return `${indent}$a${sp.eltLevel}.props = { ${propsBuf.join(", ")} };`;
        case CodeLineKind.SetAtts:
            let sa = cl as ClSetAtts, attsBuf: string[] = [];
            // $a1.props = { "class": "hello", "foo": 123 };
            for (let i = 0; sa.atts.length > i; i += 2) {
                attsBuf.push(`"${sa.atts[i]}": ${sa.atts[i + 1]}`);
            }
            return `${indent}$a${sa.eltLevel}.atts = { ${attsBuf.join(", ")} };`;            
        case CodeLineKind.UpdateProp:
            let up = cl as ClUpdateProp;
            // e.g. $up("baz", nbr + 3, $a2, $a0)
            fc.headDeclarations.constAliases["$up"] = "$.updateProp";
            return `${indent}$up("${up.propName}", ${up.expr}, $a${up.eltLevel}, $a${up.changeGroupLevel});`;
        case CodeLineKind.UpdateAtt:
            let ua = cl as ClUpdateAtt;
            // e.g. $up("baz", nbr + 3, $a2, $a0)
            fc.headDeclarations.constAliases["$ua"] = "$.updateAtt";
            return `${indent}$ua("${ua.attName}", ${ua.expr}, $a${ua.eltLevel}, $a${ua.changeGroupLevel});`;
        case CodeLineKind.UpdateText:
            let ut = cl as ClUpdateText;
            // e.g. $ut($t0 + (nbr+1) + $t1, $a2, $a0);
            fc.headDeclarations.constAliases["$ut"] = "$.updateText";
            return `${indent}$ut(${ut.fragments.join(" + ")}, $a${ut.eltLevel}, $a${ut.changeGroupLevel});`;
        case CodeLineKind.UpdateCptProp:
            let uc = cl as ClUpdateCptProp;
            // e.g. $uc("baz", nbr + 3, $a2)
            fc.headDeclarations.constAliases["$uc"] = "$.updateCptProp";
            return `${indent}$uc("${uc.propName}", ${uc.expr}, $a${uc.eltLevel});`;
        case CodeLineKind.RefreshCpt:
            let rc = cl as ClRefreshCpt;
            // e.g. $rc(r, $a2, $a0);
            fc.headDeclarations.constAliases["$rc"] = "$.refreshCpt";
            return `${indent}$rc(${rc.rendererNm}, $a${rc.cptLevel}, $a${rc.changeGroupLevel});`;
        case CodeLineKind.SetNodeRef:
            let sr = cl as ClSetNodeRef;
            // e.g. $a2 = $a1.children[0];
            return `${indent}$a${sr.parentLevel + 1} = $a${sr.parentLevel}.children[${sr.childRef}];`;
        case CodeLineKind.CheckGroup:
            let cg = cl as ClCheckGroup;
            // e.g. $a2 = $cg($i1, $a1, $a0, $a0, 3);
            fc.headDeclarations.constAliases["$cg"] = "$.checkGroup";
            if (fc.maxLevel < cg.parentLevel + 1) {
                fc.maxLevel = cg.parentLevel + 1;
            }
            return `${indent}$a${cg.parentLevel + 1} = $cg($i${cg.parentLevel}, $a${cg.parentLevel}, $a${cg.changeGroupLevel}, $a${cg.parentGroupLevel}, ${cg.groupIdx});`;
        case CodeLineKind.DeleteGroups:
            let dg = cl as ClDeleteGroups;
            // e.g. $dg($i1, $a1, $a0, 8);
            fc.headDeclarations.constAliases["$dg"] = "$.deleteGroups";
            return `${indent}$dg($i${dg.parentLevel}, $a${dg.parentLevel}, $a${dg.changeGroupLevel}, ${dg.targetIdx});`;
        case CodeLineKind.IncrementIdx:
            let ii = cl as ClIncrementIdx;
            // e.g. $i1++;
            if (fc.headDeclarations.maxShiftIdx < ii.idxLevel) {
                fc.headDeclarations.maxShiftIdx = ii.idxLevel
            }
            return `${indent}$i${ii.idxLevel}++;`;
        case CodeLineKind.ResetIdx:
            let ri = cl as ClResetIdx;
            // e.g. $i1 = 0+;
            if (fc.headDeclarations.maxShiftIdx < ri.idxLevel) {
                fc.headDeclarations.maxShiftIdx = ri.idxLevel
            }
            return `${indent}$i${ri.idxLevel} = 0;`;
        case CodeLineKind.JsExpression:
            let jse = cl as ClJsExpression;
            // e.g. let x = 123;
            return `${indent}${jse.expr}`;
        case CodeLineKind.FuncDef:
            let fd = cl as ClFuncDef;
            // e.g. $f2=function() {doSomething()};
            return `${indent}$f${fd.index}=${fd.expr};`;
    }
    return "// invalid code kind: " + cl.kind;
}