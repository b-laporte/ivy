import * as ts from "typescript";
import { parse } from "./parser";
import { CodeBlockKind, FunctionBlock, JsBlock, NodeBlock, CodeLine, CodeLineKind, ClCreateElement, ClInsert, ClCreateComponent, ClCreateTextNode, ClCreateDynTextNode, ClSetProps, ClSetAtts, ClUpdateProp, ClUpdateAtt, ClUpdateText, ClUpdateCptProp, ClRefreshCpt, ClRefreshInsert, ClSetNodeRef, ClCheckGroup, ClDeleteGroups, ClIncrementIdx, ClResetIdx, ClSetIndexes, ClJsExpression, ClFuncDef, ClSwapLtGroup, ClCreateDataNode, ClCreatePropMap, ClUpdatePropMap, ClRefreshDn } from "./types";
import { scanBlocks, checkMaxLevelIndex } from "./blocks";

const CR = "\n", VD_RENDERER_TYPE = "VdRenderer";

export function compile(source: string, filePath: string, ivPath: string): CompilationCtxt {
    let srcFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.ES2015, /*setParentNodes */ true),
        cc = new CompilationCtxt(source, filePath, ivPath);
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
                        tfn.isMethod = node.kind === ts.SyntaxKind.MethodDeclaration;

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
    isMethod: boolean;   // tell if the function is the method of a class
    params: { name: string; type: string }[];   // function parameters
}

interface CompilationError {
    description: string;
    lineNbr: number;
    columnNbr: number;
    fileName: string;
}

interface CompilateOptions {
    ivImports?: boolean;
}

class CompilationCtxt {
    ivImports = {};
    tplFunctions: TplFunction[] = [];
    errors: CompilationError[] | null = null;

    constructor(public src: string, public fileName: string, public ivPath: string) { }

    getOutput(options?: CompilateOptions): string {
        let res = this.src, pos = 0, chunks: string[] = [], param: string, buf: string[] = [], ivImports = true;
        if (options && options.ivImports === false) {
            ivImports = false;
        }

        if (ivImports) {
            // generate main import
            for (let k in this.ivImports) {
                if (this.ivImports.hasOwnProperty(k)) {
                    buf.push(k)
                }
            }
            if (buf.length) {
                let rx = this.src.match(/^\n*([ \t]*)/i), indent = "";
                if (rx && rx.length > 1) {
                    indent = rx[1];
                }
                chunks.push(indent + "import { " + buf.join(", ") + " } from \"" + this.ivPath + "\";" + CARRIAGE_RETURN);
            }
        }

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
        isMethod: false,
        params: []
    }
    cc.tplFunctions.push(tf);
    return tf;
}

function addError(cc: CompilationCtxt, description: string, line: number, col: number) {
    if (!cc.errors) {
        cc.errors = [];
    }
    let e;
    cc.errors.push(e = {
        description: description,
        lineNbr: line,
        columnNbr: col,
        fileName: cc.fileName
    });
    let d = e.description ? e.description : "[no description]";
    console.log("Compilation Error: ", d, " - line: " + e.lineNbr + " in " + cc.fileName);
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
                ivImports: cc.ivImports,
                maxLevelIdx: -1,
                maxTextIdx: -1,
                maxFuncIdx: -1
            },
            isMethod: tf.isMethod,
            baseIndent: tf.rootIndent,
            startStatement: "",
            endStatemnet: "",
            blocks: [],
            startLevel: 0,
            endLevel: 0,
            parentGroupIdx: 0,
            changeCtnIdx: 0,
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
        generateTplFunctionHead(tf, fc);
        tf.fnBody = lines.join(CR);
    }
}

function generateTplFunctionHead(tf: TplFunction, fc: FunctionBlock) {
    let constBuf: string[] = [],
        params = fc.headDeclarations.params,
        aliases = fc.headDeclarations.constAliases,
        maxLevelIdx = fc.headDeclarations.maxLevelIdx,
        maxFuncIdx = fc.headDeclarations.maxFuncIdx,
        elRefs: string[] = [],
        idxRefs: string[] = [];

    if (fc.maxLevel > 0) {
        for (let i = 0; fc.maxLevel > i; i++) {
            elRefs.push(", $a" + (i + 1));
        }
    }
    for (let i = 0; maxLevelIdx >= i; i++) {
        if (i === 0) {
            idxRefs.push(", $i0 = 0");
        } else {
            idxRefs.push(", $i" + i);
        }
    }
    for (let i = 0; maxFuncIdx >= i; i++) {
        idxRefs.push(", $f" + i);
    }
    let fh: string[] = [`${tf.rootIndent}let $a0: any = ${tf.rendererNm}.node${elRefs.join("")}${idxRefs.join("")};`];

    for (let k in aliases) {
        if (aliases.hasOwnProperty(k)) {
            constBuf.push(k + " = " + aliases[k]);
        }
    }
    if (constBuf.length) {
        fh.push(tf.rootIndent + "const " + constBuf.join(", ") + ";");
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

                if (!isLast) {
                    let idxNext = b.levels.length;
                    // make sure next potential level is reset
                    if (idxNext <= fc.headDeclarations.maxLevelIdx) {
                        checkMaxLevelIndex(fc, idxNext);
                    }

                    if (b.endLines.length) {
                        for (let el of b.endLines) {
                            lines.push(stringifyCodeLine(el, b.baseIndent, fc));
                        }
                    }
                } else {
                    checkMaxLevelIndex(fc, b.levels.length - 1);
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

function stringifyCodeLine(cl: CodeLine, indent: string, fc: FunctionBlock): string {
    switch (cl.kind) {
        case CodeLineKind.CreateElement:
            let el = cl as ClCreateElement;
            // e.g. $a1 = $el($a0, 3, "div", 1);
            fc.headDeclarations.ivImports["$el"] = 1;
            if (fc.maxLevel < el.parentLevel + 1) {
                fc.maxLevel = el.parentLevel + 1;
            }
            return `${indent}$a${el.parentLevel + 1} = $el($a${el.parentLevel}, ${el.nodeIdx}, "${el.eltName}", ${el.needRef ? 1 : 0});`;
        case CodeLineKind.CreateDataNode:
            // $dn($a1, 2, "title", 1);
            let dn = cl as ClCreateDataNode;
            fc.headDeclarations.ivImports["$dn"] = 1;
            if (fc.maxLevel < dn.parentLevel + 1) {
                fc.maxLevel = dn.parentLevel + 1;
            }
            return `${indent}$a${dn.parentLevel + 1} = $dn($a${dn.parentLevel}, ${dn.nodeIdx}, "${dn.eltName}", ${dn.needRef ? 1 : 0});`;
        case CodeLineKind.Insert:
            let ins = cl as ClInsert;
            // e.g. $a2 = $in($a1, 9, body);
            fc.headDeclarations.ivImports["$in"] = 1;
            if (fc.maxLevel < ins.parentLevel + 1) {
                fc.maxLevel = ins.parentLevel + 1;
            }
            return `${indent}$a${ins.parentLevel + 1} = $in($a${ins.parentLevel}, ${ins.nodeIdx}, ${ins.expr}, $a${ins.changeCtnIdx});`;
        case CodeLineKind.CreateComponent:
            let cc = cl as ClCreateComponent, pbuf: string[] = [];
            // e.g. $a2 = $cc($a1, 4, { "value": v + 1, "msg": ("m1:" + v) }, r, bar, 0 ,1);
            fc.headDeclarations.ivImports["$cc"] = 1;
            if (fc.maxLevel < cc.parentLevel + 1) {
                fc.maxLevel = cc.parentLevel + 1;
            }
            for (let i = 0; cc.props.length > i; i += 2) {
                pbuf.push(`"${cc.props[i]}": ${cc.props[i + 1]}`);
            }
            return `${indent}$a${cc.parentLevel + 1} = $cc($a${cc.parentLevel}, ${cc.nodeIdx}, { ${pbuf.join(", ")} }, ${cc.rendererNm}, ${cc.eltName}, ${cc.hasLightDom ? 1 : 0}, ${cc.needRef ? 1 : 0});`;
        case CodeLineKind.CreateTextNode:
            let tx = cl as ClCreateTextNode;
            // e.g. $tx($a2, 3, " Hello ");
            fc.headDeclarations.ivImports["$tx"] = 1;
            return `${indent}$tx($a${tx.parentLevel}, ${tx.nodeIdx}, "${tx.text}");`;
        case CodeLineKind.CreateDynText:
            let dt = cl as ClCreateDynTextNode;
            // e.g. $dt($a1, 2, " nbr " + (nbr+1) + "! ");
            fc.headDeclarations.ivImports["$dt"] = 1;
            fc.headDeclarations.ivImports["$ct"] = 1;
            if (fc.maxLevel < dt.parentLevel + 1) {
                fc.maxLevel = dt.parentLevel + 1;
            }
            return `${indent}$dt($a${dt.parentLevel}, ${dt.nodeIdx}, ${dt.fragments.join(" + ")});`;
        case CodeLineKind.UpdateText:
            let ut = cl as ClUpdateText;
            // e.g. $ut($t0 + (nbr+1) + $t1, $a2, $a0);
            fc.headDeclarations.ivImports["$ut"] = 1;
            return `${indent}$ut(${ut.fragments.join(" + ")}, $a${ut.eltLevel}, $a${ut.changeCtnIdx});`;
        case CodeLineKind.SetProps:
            let sp = cl as ClSetProps, propsBuf: string[] = [];
            // $a1.props = { "class": "hello", "foo": 123 };
            for (let i = 0; sp.props.length > i; i += 2) {
                propsBuf.push(`"${sp.props[i]}": ${sp.props[i + 1]}`);
            }
            return `${indent}$a${sp.eltLevel}.props = { ${propsBuf.join(", ")} };`;
        case CodeLineKind.CreatePropMap:
            let cm = cl as ClCreatePropMap, namesBuf: string[] = [];
            // e.g. $cm("class", "important", 0, 0, (highlight===true), $a1);
            fc.headDeclarations.ivImports["$cm"] = 1;
            for (let i = 0; 4 > i; i ++) {
                namesBuf.push(cm.names.length > i? `"${cm.names[i]}"` : '0');
            }
            return `${indent}$cm(${namesBuf.join(", ")}, ${cm.expr}, $a${cm.eltLevel});`;
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
            fc.headDeclarations.ivImports["$up"] = 1;
            return `${indent}$up("${up.propName}", ${up.expr}, $a${up.eltLevel}, $a${up.changeCtnIdx});`;
        case CodeLineKind.UpdatePropMap:
            let um = cl as ClUpdatePropMap, namesBuf2: string[] = [];
            // e.g. $um("class", "important", 0, 0, (highlight===true), $a1, $a0);
            fc.headDeclarations.ivImports["$um"] = 1;
            for (let i = 0; 4 > i; i ++) {
                namesBuf2.push(um.names.length > i? `"${um.names[i]}"` : '0');
            }
            return `${indent}$um(${namesBuf2.join(", ")}, ${um.expr}, $a${um.eltLevel}, $a${um.changeCtnIdx});`;
        case CodeLineKind.UpdateAtt:
            let ua = cl as ClUpdateAtt;
            // e.g. $up("baz", nbr + 3, $a2, $a0)
            fc.headDeclarations.ivImports["$ua"] = 1;
            return `${indent}$ua("${ua.attName}", ${ua.expr}, $a${ua.eltLevel}, $a${ua.changeCtnIdx});`;
        case CodeLineKind.UpdateCptProp:
            let uc = cl as ClUpdateCptProp;
            // e.g. $uc("baz", nbr + 3, $a2)
            fc.headDeclarations.ivImports["$uc"] = 1;
            return `${indent}$uc("${uc.propName}", ${uc.expr}, $a${uc.eltLevel});`;
        case CodeLineKind.RefreshCpt:
            let rc = cl as ClRefreshCpt;
            // e.g. $rc(r, $a2, $a0);
            fc.headDeclarations.ivImports["$rc"] = 1;
            return `${indent}$rc(${rc.rendererNm}, $a${rc.cptLevel}, $a${rc.changeCtnIdx});`;
        case CodeLineKind.RefreshDataNode:
            let rd = cl as ClRefreshDn;
            // e.g. $rd(r, $a2, $a0);
            fc.headDeclarations.ivImports["$rd"] = 1;
            return `${indent}$rd(${rd.rendererNm}, $a${rd.cptLevel}, $a${rd.changeCtnIdx});`;
        case CodeLineKind.RefreshInsert:
            let ri = cl as ClRefreshInsert;
            // e.g. $ri($a2, body, $a0);
            fc.headDeclarations.ivImports["$ri"] = 1;
            return `${indent}$ri($a${ri.parentLevel}, ${ri.idxExpr}, ${ri.expr}, $a${ri.changeCtnIdx});`;
        case CodeLineKind.SetNodeRef:
            let sr = cl as ClSetNodeRef;
            // e.g. $a2 = $a1.children[0];
            return `${indent}$a${sr.parentLevel + 1} = $a${sr.parentLevel}.children[${sr.childRef}];`;
        case CodeLineKind.CheckGroup:
            let cg = cl as ClCheckGroup;
            // e.g. $a2 = $cg($i1, $a1, $a0, $a0, 3);
            fc.headDeclarations.ivImports["$cg"] = 1;
            if (fc.maxLevel < cg.parentLevel + 1) {
                fc.maxLevel = cg.parentLevel + 1;
            }
            return `${indent}$a${cg.parentLevel + 1} = $cg($i${cg.parentLevel}, $a${cg.parentLevel}, $a${cg.changeCtnIdx}, $a${cg.parentGroupLevel}, ${cg.groupIdx});`;
        case CodeLineKind.DeleteGroups:
            let dg = cl as ClDeleteGroups;
            // e.g. $dg($i1, $a1, $a0, 8);
            fc.headDeclarations.ivImports["$dg"] = 1;
            return `${indent}$dg($i${dg.parentLevel}, $a${dg.parentLevel}, $a${dg.changeCtnIdx}, ${dg.targetIdx});`;
        case CodeLineKind.IncrementIdx:
            let ii = cl as ClIncrementIdx;
            // e.g. $i1++;
            if (fc.headDeclarations.maxLevelIdx < ii.idxLevel) {
                fc.headDeclarations.maxLevelIdx = ii.idxLevel
            }
            return `${indent}$i${ii.idxLevel}++;`;
        case CodeLineKind.ResetIdx:
            let ridx = cl as ClResetIdx;
            // e.g. $i1 = 0+;
            if (fc.headDeclarations.maxLevelIdx < ridx.idxLevel) {
                fc.headDeclarations.maxLevelIdx = ridx.idxLevel
            }
            return `${indent}$i${ridx.idxLevel} = 0;`;
        case CodeLineKind.SetIndexes:
            let sidx = cl as ClSetIndexes, siBuf: string[] = [];;
            // e.g. $i2 += 3;
            for (var si of sidx.indexes) {
                siBuf.push(`$i${si.level} ${si.relative ? '+' : ''}= ${si.value};`);
            }
            return `${indent}${siBuf.join(' ')}`;
        case CodeLineKind.JsExpression:
            let jse = cl as ClJsExpression;
            // e.g. let x = 123;
            return `${indent}${jse.expr}`;
        case CodeLineKind.FuncDef:
            let fd = cl as ClFuncDef;
            // e.g. $f2=function() {doSomething()};
            return `${indent}$f${fd.index}=${fd.expr};`;
        case CodeLineKind.SwapLtGroup:
            let sw = cl as ClSwapLtGroup;
            // $a2 = $a2.ltGroup;
            return `${indent}$a${sw.cptLevel} = $a${sw.cptLevel}.ltGroup;`;

    }
    return "// invalid code kind: " + cl.kind;
}
