import { NacNode, NacNodeType, NacAttributeNature } from "./nac";
import { ClCheckGroup, CodeLine, ClJsExpression, CodeLineKind, ClCreateElement, ClIncrementIdx, ClResetIdx, ClDeleteGroups, ClCreateNode, ClCreateComponent, ClInsert, ClRefreshInsert, ClFuncDef, ClSetProps, ClSetAtts, ClUpdateCptProp, ClUpdateAtt, ClUpdateProp, ClRefreshCpt, ClSwapLtGroup, ClSetIndexes, ClCreateTextNode, ClCreateDynTextNode, ClUpdateText, ClSetNodeRef, CodeBlockKind, FunctionBlock, JsBlock, LevelCtxt, NodeBlock, CodeBlock } from "./types";

const ATT_NS = "attr", XMLNS = "xmlns", RX_HTML = /html/i;

/**
 * Generate a block list from the
 * @param b
 */
export function scanBlocks(nac: NacNode, b: JsBlock, levels: LevelCtxt[] = []) {
    let nd = nac,
        nacPath: NacNode[] = [], // list of ancestor nodes in the nac tree
        nodeBlock: NodeBlock,
        jsExprBuffer: CodeLine[] = [],
        nextSiblingOnly: boolean,
        currentBlock: CodeBlock | null = null; // current block being processed
    if (nd) {
        let lastShift = levels[levels.length - 1];
        levels.push({ nbrOfCreations: 0, relative: false, refGenerated: false, idxGenerated: false, changeGroupIdx: b.changeGroupIdx, isHtmlNS: lastShift ? lastShift.isHtmlNS : true });
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
                let nb = <NodeBlock>currentBlock, sh = nb.levels;
                generateNodeBlockRefsLine(nb, levels, currentLevel());
                generateNodeBlockEndLines(nb, levels);

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
                startLevel: currentLevel() + 1, // increased by 1 to have the internal block nodes starting at this level
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
                changeGroupLevel: jsb.changeGroupIdx,
                parentGroupLevel: b.parentGroupIdx
            }
            checkMaxShiftIndex(b.functionCtxt, cg.parentLevel);
            levels[cg.parentLevel].nbrOfCreations += 1;
            levels[cg.parentLevel].refGenerated = true;
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
                scanBlocks(nd.firstChild, jsb, levels);
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
                generateTextNodeCodeLines(currentBlock as NodeBlock, tnList, currentLevel(), levels);
            } else {
                // create instructions for this node
                generateNodeBlockCodeLines(currentBlock as NodeBlock, nd, currentLevel(), levels);
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
            levels: [],
            cmLines: [],
            umLines: [],
            initLines: [],
            endLines: []
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
            incrementShift();
            nacPath.push(nd);
            return nd.firstChild;
        } else if (nd.nextSibling) {
            return nd.nextSibling;
        } else {
            decrementShift();
            nd = nacPath.pop();
            return nd ? nextNode(nd, true) : null;
        }
    }

    function currentLevel() {
        return nacPath.length + b.startLevel;
    }

    function incrementShift() {
        let lastShift = levels[levels.length - 1];
        levels.push({ nbrOfCreations: 0, relative: false, refGenerated: false, idxGenerated: false, isHtmlNS: lastShift ? lastShift.isHtmlNS : true, changeGroupIdx: lastShift.changeGroupIdx });
        updateShifts();
    }

    function decrementShift() {
        let lastShift = levels[levels.length - 1];
        if (lastShift && lastShift.ondelete) {
            lastShift.ondelete();
        }
        levels.pop();
        updateShifts();
    }

    function updateShifts() {
        if (currentBlock && currentBlock.kind === CodeBlockKind.NodeBlock) {
            (<NodeBlock>currentBlock).levels = levels.slice(0); // clone shifts array
        }
    }

    function resetShifts() {
        let sh;
        for (let i = 0; levels.length > i; i++) {
            sh = levels[i];
            levels[i] = { nbrOfCreations: 0, relative: true, refGenerated: sh.refGenerated === true, idxGenerated: sh.idxGenerated === true, isHtmlNS: sh.isHtmlNS, changeGroupIdx: sh.changeGroupIdx, ondelete: sh.ondelete }; // create new objects to avoid impact on previous copies
        }
    }

    function deleteGroups(lines: CodeLine[], level: number) {
        if (b.blocks.length > 0) {

            //b.changeGroupIdx
            let changeGroupLevel = b.changeGroupIdx;
            if (levels[level]) {
                // shifts[level] doesn't exist when we append a last js block that doesn't correspond to any node
                changeGroupLevel = levels[level].changeGroupIdx;
            }

            let dg: ClDeleteGroups = {
                kind: CodeLineKind.DeleteGroups,
                targetIdx: b.functionCtxt.lastNodeIdx() + 1,
                parentLevel: level,
                changeGroupLevel: changeGroupLevel
            }
            lines.push(dg);
        }
    }
}

function generateNodeBlockCodeLines(nb: NodeBlock, nd: NacNode, level: number, levels: LevelCtxt[]) {
    if (nd.nodeType === NacNodeType.ELEMENT) {
        // creation mode
        let cl: ClCreateNode,
            cc: ClCreateComponent | null = null,
            el: ClCreateElement | null = null,
            ins: ClInsert | null = null,
            isHtmlNS = levels[levels.length - 1].isHtmlNS;

        levels[level].nbrOfCreations += 1;
        levels[level].refGenerated = false;
        levels[level].idxGenerated = false;

        if (nd.nodeNameSpace === "c") {
            // create component
            cc = {
                kind: CodeLineKind.CreateComponent,
                eltName: nd.nodeName,
                nodeIdx: nb.functionCtxt.nextNodeIdx(),
                parentLevel: level,
                needRef: false,
                rendererNm: nb.functionCtxt.rendererNm,
                hasLightDom: nd.firstChild ? true : false,
                props: []
            };
            nb.cmLines.push(cc);
            cl = cc;
        } else if (nd.nodeNameSpace === "ins") {
            // insert statement
            ins = {
                kind: CodeLineKind.Insert,
                nodeIdx: nb.functionCtxt.nextNodeIdx(),
                parentLevel: level,
                expr: nd.nodeName
            }
            nb.cmLines.push(ins);

            // add refresh instruction
            generateNodeBlockRefsLine(nb, levels);
            nb.umLines.push(<ClRefreshInsert>{
                kind: CodeLineKind.RefreshInsert,
                groupLevel: level + 1,
                expr: nd.nodeName,
                changeGroupLevel: levels[level].changeGroupIdx
            });
            // no need to parse attributes
            return;
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

        // then set properties
        // e.g. $a2.props = { "class": "one", "title": "blah", "foo": nbr+4 };
        let att = nd.firstAttribute, propsBuf: string[] = [], attsBuf: string[] = [], upBuf: string[] = [];
        // check first if there is an xmlns
        while (att) {
            if (att.name === XMLNS) {
                if (!att.value.match(RX_HTML)) {
                    levels[levels.length - 1].isHtmlNS = isHtmlNS = false;
                    break;
                }
            }
            att = att.nextSibling;
        }
        att = nd.firstAttribute;
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
            if (!cc && (!isHtmlNS || att.ns === ATT_NS)) {
                // this is an att
                attsBuf.push(att.name);
                attsBuf.push(att.value);
            } else {
                // this is a prop or a cpt call
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
            generateNodeBlockRefsLine(nb, levels);
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
                    if (!isHtmlNS || att.ns === ATT_NS) {
                        nb.umLines.push(<ClUpdateAtt>{
                            kind: CodeLineKind.UpdateAtt,
                            eltLevel: cl.parentLevel + 1,
                            attName: att.name,
                            expr: att.value,
                            changeGroupLevel: levels[level].changeGroupIdx
                        });
                    } else {
                        nb.umLines.push(<ClUpdateProp>{
                            kind: CodeLineKind.UpdateProp,
                            eltLevel: cl.parentLevel + 1,
                            propName: att.name,
                            expr: att.value,
                            changeGroupLevel: levels[level].changeGroupIdx
                        });
                    }
                }
            }
            if (cc) {
                if (!cc.hasLightDom) {
                    // generate refresh cpt instruction
                    nb.umLines.push(<ClRefreshCpt>{
                        kind: CodeLineKind.RefreshCpt,
                        rendererNm: nb.functionCtxt.rendererNm,
                        cptLevel: level + 1,
                        changeGroupLevel: levels[level].changeGroupIdx
                    });
                }
            }
        }

        if (cc && cc.hasLightDom) {
            generateNodeBlockRefsLine(nb, levels);
            nb.umLines.push(<ClSwapLtGroup>{
                kind: CodeLineKind.SwapLtGroup,
                cptLevel: level + 1
            });

            let currentChangeGroupIdx = levels[level].changeGroupIdx;
            levels[level].changeGroupIdx = cc.parentLevel + 1;

            levels[level].ondelete = () => {
                // set back changeGroupIdx
                levels[level].changeGroupIdx = currentChangeGroupIdx;

                // add instructions once all child nodes have been handled
                nb.cmLines.push(<ClRefreshCpt>{
                    kind: CodeLineKind.RefreshCpt,
                    rendererNm: nb.functionCtxt.rendererNm,
                    cptLevel: level + 1,
                    changeGroupLevel: currentChangeGroupIdx
                });

                nb.umLines.push(<ClRefreshCpt>{
                    kind: CodeLineKind.RefreshCpt,
                    rendererNm: nb.functionCtxt.rendererNm,
                    cptLevel: level + 1,
                    changeGroupLevel: currentChangeGroupIdx
                });
            }
        }

    } else {
        console.log("[iv compiler] Unsupported node type: " + nd.nodeType);
    }
}

function generateNodeBlockEndLines(nb: NodeBlock, levels: LevelCtxt[]) {
    // generate end lines
    // push index changes - e.g. $i1 = 1;
    let shiftExprs: { level: number; relative: boolean; value: number }[] = [], sh;
    for (let i = 0; levels.length > i; i++) {
        sh = levels[i];
        if (!sh.idxGenerated && (!sh.relative || sh.nbrOfCreations > 0)) {
            shiftExprs.push({ level: i, relative: sh.relative, value: sh.nbrOfCreations });
            sh.idxGenerated = true;
        }
    }
    if (shiftExprs.length) {
        let si: ClSetIndexes = {
            kind: CodeLineKind.SetIndexes,
            indexes: shiftExprs
        }
        nb.endLines.push(si);
    }
}

function generateTextNodeCodeLines(nb: NodeBlock, ndList: NacNode[], level: number, levels: LevelCtxt[]) {
    let len = ndList.length;
    if (!len) return;
    if (len === 1 && ndList[0].nodeType === NacNodeType.TEXT) {
        let cl: ClCreateTextNode = {
            kind: CodeLineKind.CreateTextNode,
            nodeIdx: nb.functionCtxt.nextNodeIdx(),
            parentLevel: level,
            text: encodeTextString(ndList[0].nodeValue)
        }
        levels[level].nbrOfCreations += 1;
        levels[level].refGenerated = false;
        levels[level].idxGenerated = false;
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
        levels[level].nbrOfCreations += 1;
        levels[level].refGenerated = false;
        levels[level].idxGenerated = false;
        nb.cmLines.push(cl);

        // push update mode instruction
        generateNodeBlockRefsLine(nb, levels);
        nb.umLines.push(<ClUpdateText>{
            kind: CodeLineKind.UpdateText,
            fragments: exprs,
            eltLevel: cl.parentLevel + 1,
            changeGroupLevel: levels[level].changeGroupIdx
        });
    }
}

function encodeTextString(s: string): string {
    return s.replace(/\"/gi, '\\"').replace(/\n/gi, "\\n");
}

function generateNodeBlockRefsLine(nb: NodeBlock, levels: LevelCtxt[], max: number = -1) {
    let sh, sn: ClSetNodeRef, val;
    if (max < 0) {
        max = nb.levels.length;
    }

    for (let i = 0; max > i; i++) {
        sh = nb.levels[i];
        val = sh.nbrOfCreations - 1;
        if (!sh.refGenerated) {
            let childRef: any;
            if (sh.relative) {
                checkMaxShiftIndex(nb.functionCtxt, i);
            }
            if (val === 0) {
                childRef = sh.relative ? `$i${i}` : "0";
            } else if (val > 0) {
                childRef = sh.relative ? `$i${i}+${val}` : "" + val;
            } else if (val < 0) {
                // node has not been generated yet
                break;
            }
            // e.g. $a2 = $a1.children[0]
            sn = {
                kind: CodeLineKind.SetNodeRef,
                parentLevel: i,
                childRef: childRef
            };
            nb.umLines.push(sn);
            sh.refGenerated = true;
            if (levels[i]) {
                // push the generated information to the main shifts array
                // as nb stores a clone
                levels[i].refGenerated = true;
            }
        }
    }
}

/**
 * Check that max $i index is greater or equal to max
 * @param fc 
 * @param max 
 */
export function checkMaxShiftIndex(fc, max) {
    if (fc.headDeclarations.maxShiftIdx < max) {
        // to ensure shift variables (e.g. $i1) to be declared
        fc.headDeclarations.maxShiftIdx = max;
    }
}
