import { XjsTplFunction, XjsContentNode, XjsExpression, XjsElement, XjsParam, XjsNumber, XjsBoolean, XjsString, XjsProperty, XjsFragment, XjsJsStatements, XjsJsBlock, XjsComponent, XjsEvtListener, XjsParamNode, XjsNode, XjsTplArgument } from '../xjs/parser/types';
import { parse } from '../xjs/parser/xjs-parser';

export interface CompilationOptions {
    body?: boolean;                     // if true, will output the template function body in the result
    statics?: boolean;                  // if true, the statics array will be in the result
    function?: boolean;                 // if true the js function will be in the result
    imports?: boolean;                  // if true the imports will be added as comment to the js function
    importMap?: { [key: string]: 1 };   // imports as a map to re-use the map from a previous compilation
    filePath?: string;                  // file name - used for error reporting
    lineOffset?: number;                // shift error line count to report the line number of the file instead of the template
}

export interface CompilationResult {
    body?: string;                      // template function body
    statics?: any[];                    // statics outside function body
    function?: string;                  // full result function as a string
    importMap?: { [key: string]: 1 },   // imports as a map
}

export async function compileTemplate(template: string, options: CompilationOptions): Promise<CompilationResult> {
    options.lineOffset = options.lineOffset || 0;
    let log = false;
    if (template.match(RX_LOG)) {
        log = true;
        template = template.replace(RX_LOG, "");
    }
    let root = await parse(template, options.filePath || "", options.lineOffset || 0);
    let res = generate(root, options);
    if (log) {
        const separator = "-------------------------------------------------------------------------------"
        console.log(separator + "\n" + "Generated template:\n" + res.function + "\n" + separator);
    }
    return res;
}

const RX_DOUBLE_QUOTE = /\"/g,
    RX_LOG = /\/\/\s*log\s*/,
    NODE_NAMES = {
        "#tplFunction": "template function",
        "#tplArgument": "template argument",
        "#jsStatements": "javascript statements",
        "#jsBlock": "javascript block",
        "#fragment": "fragment",
        "#element": "element",
        "#component": "component",
        "#paramNode": "param node",
        "#decoratorNode": "decorator node",
        "#textNode": "text node",
        "#param": "param",
        "#property": "property",
        "#decorator": "decorator",
        "#reference": "reference",
        "#expression": "expression",
        "#number": "number",
        "#boolean": "boolean",
        "#string": "string",
        "#eventListener": "event listener"
    }

function generate(tf: XjsTplFunction, options: CompilationOptions) {
    const INDENT = "    ";
    let nodes: XjsNode[] = [],             // list of nodes that have been processed (index = generated index)
        nodeCount = 0,                     // list of nodes that are generated (index 0 is reserved)
        statics: string[] = [],            // list of static resources
        imports: { [key: string]: 1 },     // map of required imports
        localVars = {},                    // map of creation mode vars
        exprCounts: number[] = [],         // array of expression counters
        nextNodeIsContainer = false,       // true when the next node to create will be a container (cf. blocks and fragments)
        body: (string | XjsExpression | XjsJsStatements | XjsJsBlock)[] = []; // parts composing the function body (generated strings + included expressions/statements)

    imports = options.importMap || {};

    return generateAll();

    function generateAll() {
        if (tf.content) {
            generateBlock(tf.content, 1, tf.indent, 0, "0");
        }
        insertLocalVars(0, tf.indent);

        let res: CompilationResult = {};
        if (options.function || options.body) {
            res.body = generateBody();
        }
        if (options.statics) {
            res.statics = statics;
        }
        if (options.function) {
            res.function = templateStart(tf.indent, tf) + res.body + templateEnd(tf);
        }
        if (options.imports) {
            res.importMap = imports;
        }
        return res;
    }

    function generateBody(): string {
        let parts: string[] = [];
        for (let part of body) {
            if (typeof part === 'string') {
                parts.push(part);
            } else if (part.kind === "#expression" || part.kind === "#jsStatements") {
                parts.push(part.code);
            } else if (part.kind === "#jsBlock") {
                parts.push(part.startCode);
            }
        }

        return "\n" + parts.join("") + reduceIndent(tf.indent);
    }

    function error(msg, nd: XjsNode) {
        let fileInfo = options.filePath ? " in " + options.filePath : "",
            lineOffset = options.lineOffset || 0;
        throw new Error(`Invalid ${NODE_NAMES[nd.kind]} - ${msg} at line #${nd.lineNumber + lineOffset}${fileInfo}`);
    }

    function generateBlock(xjsNodes: XjsContentNode[], parentIdx: number, indent: string, instructionContainer: number, blockInstance: string) {
        let len = xjsNodes.length, nd: XjsContentNode;
        if (len === 0) return;

        let initCount = nodeCount, startPos = body.length, blockIdx = initCount + 1;
        // creation mode
        let indent2 = indent + INDENT, idx: number;
        if (len > 1) {
            // need container fragment
            ++nodeCount;
            imports['ζfrag'] = 1;
            body.push(`${indent2}ζfrag(ζ, ${nodeCount}, ${parentIdx}, ${instructionContainer});\n`);
            parentIdx = nodeCount;
        }
        for (let i = 0; len > i; i++) {
            generateCmInstruction(xjsNodes[i], parentIdx, instructionContainer, indent2);
        }
        if (nodeCount !== initCount) {
            // creation mode instructions have been added, let's wrap them into an if block
            // e.g. if (ζc1 = ζcheck(ζ, 1, 0)) {
            localVars["ζc" + (blockIdx)] = 1;
            imports["ζcheck"] = 1;
            body.splice(startPos, 0, `${indent}if (ζc${blockIdx} = ζcheck(ζ, ${blockIdx}, ${blockInstance})) {\n`);
            body.push(`${indent}}\n`);
        }

        // update mode
        let pKind = "", nKind = "";
        for (let i = 0; len > i; i++) {
            nKind = (i < len - 1) ? xjsNodes[i + 1].kind : "";
            generateUpdateInstruction(xjsNodes[i], blockIdx, instructionContainer, indent, pKind, nKind);
            pKind = xjsNodes[i].kind;
        }
        generateCleanInstructions(xjsNodes, instructionContainer, indent);

        imports['ζend'] = 1;
        body.push(`${indent}ζend(ζ, ${blockIdx}, ζc${blockIdx});\n`);
    }

    function insertLocalVars(bodyPos: number, indent: string) {
        // creation mode vars
        let arr: string[] = [];
        for (let k in localVars) if (localVars.hasOwnProperty(k)) {
            arr.push(k);
        }
        body.splice(bodyPos, 0, `${indent}let ${arr.join(", ")};\n`);
    }

    function generateCmInstruction(nd: XjsContentNode, parentIdx: number, instructionContainer: number, indent: string) {
        let content: XjsContentNode[] | undefined = undefined, idx = nodeCount;
        if (nd.kind !== "#jsStatements") {
            idx = ++nodeCount;
        }
        nd["index"] = idx;
        nd["instructionContainer"] = instructionContainer;
        nodes[idx] = nd;

        let stParams = "", i1 = -1, i2 = -1;

        if (nd.kind === "#element" || nd.kind === "#component" || nd.kind === "#paramNode") {
            i1 = registerStatics(nd.params);
            i2 = registerStatics(nd.properties);
            if (i1 > -1 && i2 > -1) {
                stParams = `, ζs${i1}, ζs${i2}`;
            } else if (i1 > -1) {
                stParams = `, ζs${i1}`;
            } else if (i2 > -1) {
                stParams = `, ζu, ζs${i2}`;
            }
        }

        switch (nd.kind) {
            case "#textNode":
                // e.g. ζtxt(ζ, 5, 3, 0, " Hello World ");
                // or ζtxt(ζ, 5, 3, 0);
                let val = '', eLength = nd.expressions ? nd.expressions.length : 0;
                if (nd.textFragments.length <= 1 && eLength === 0) {
                    // static version
                    val = nd.textFragments.length === 0 ? ', ""' : ', ' + encodeText(nd.textFragments[0]);
                } else {
                    // create static resource
                    let staticsIdx = statics.length, pieces: string[] = [], fLength = nd.textFragments.length, eCount = 0;
                    for (let i = 0; fLength > i; i++) {
                        // todo eLength
                        pieces.push(encodeText(nd.textFragments[i]));
                        if (eCount < eLength) {
                            pieces.push('""');
                            eCount++;
                        }
                    }
                    statics.push("ζs" + staticsIdx + " = [" + pieces.join(", ") + "]");
                    val = ', ζs' + staticsIdx;
                }
                body.push(`${indent}ζtxt(ζ, ${idx}, ${parentIdx}, ${instructionContainer}${val});\n`);
                imports['ζtxt'] = 1;
                break;
            case "#fragment":
                if (nd.params && nd.params.length) {
                    error("Params cannot be used on fragments", nd);
                }
                if (nd.properties && nd.properties.length) {
                    error("Properties cannot be used on fragments", nd);
                }
                if (nd.listeners && nd.listeners.length) {
                    error("Event listeners cannot be used on fragments", nd);
                }

                body.push(`${indent}ζfrag(ζ, ${idx}, ${parentIdx}, ${instructionContainer});\n`);
                imports['ζfrag'] = 1;
                content = nd.content;
                break;
            case "#component":
                let c = nd as XjsComponent;
                if (c.properties && c.properties.length) {
                    error("Properties cannot be used on components", nd);
                }
                nd["staticParamsIdx"] = i1;
                body.push(`${indent}ζfrag(ζ, ${idx}, ${parentIdx}, ${instructionContainer}, 1);\n`);
                imports['ζfrag'] = 1;
                content = nd.content;
                createContentFragment(content, instructionContainer);
                break;
            case "#element":
                // e.g. ζelt(ζ, 3, 1, 0, "span");
                let e = nd as XjsElement;
                if (e.nameExpression) {
                    error("Name expressions are not yet supported", nd);
                }
                body.push(`${indent}ζelt(ζ, ${idx}, ${parentIdx}, ${instructionContainer}, "${e.name}"${stParams});\n`);
                imports['ζelt'] = 1;
                content = e.content;
                break;
            case "#paramNode":
                // e.g. ζpnode(ζ, 3, 1, 0, "header");
                let pn = nd as XjsParamNode;
                if (pn.nameExpression) {
                    error("Name expressions are not yet supported", nd);
                }
                // determine instruction container
                let parent = nodes[parentIdx], ic = parent ? parent["instructionContainer"] : instructionContainer;
                body.push(`${indent}ζpnode(ζ, ${idx}, ${parentIdx}, ${ic}, "${pn.name}"${stParams});\n`);
                imports['ζpnode'] = 1;
                content = nd.content;
                nd["instructionContainer"] = ic;
                createContentFragment(content, idx);
                break;
            case "#jsStatements":
                break;
            case "#jsBlock":
                // create a container block
                body.push(`${indent}ζfrag(ζ, ${idx}, ${parentIdx}, ${instructionContainer}, 1);\n`);
                imports['ζfrag'] = 1;
                break;
            default:
                error("Invalid node type: " + nd.kind, nd);
        }

        if (content) {
            let len = content.length,
                cNode = nd["contentNodeIdx"],
                pIdx = cNode ? cNode : idx;

            if (nextNodeIsContainer && len === 1) {
                // when length is 1 and node is not jsStatement we use the node as content (no need for extra fragment)
                nextNodeIsContainer = false;
                generateCmInstruction(content[0], nodeCount, nodeCount + 1, indent);
            } else {
                let ic = cNode ? cNode : instructionContainer;
                for (let i = 0; len > i; i++) {
                    generateCmInstruction(content[i], pIdx, ic, indent);
                }
            }
        }

        function createContentFragment(content: XjsContentNode[] | undefined, instructionContainer) {
            if (content && content.length) {
                // create a fragment if content has something more than jsStatements and 
                let len = content.length, count = 0;
                for (let i = 0; len > i; i++) {
                    if (content[i].kind !== "#jsStatements" && content[i].kind !== "#paramNode") {
                        count++;
                    }
                }

                if (count && len > 1) {
                    // create a fragment to hold content nodes
                    nodeCount++;
                    nodes[nodeCount] = {
                        kind: "#fragment",
                        index: nodeCount,
                        instructionContainer: instructionContainer,
                        isContentFragment: true
                    } as any;

                    body.push(`${indent}ζfrag(ζ, ${nodeCount}, ${idx}, ${nodeCount});\n`);
                    nd["contentNodeIdx"] = nodeCount;
                } else {
                    if (count && len === 1) {
                        nd["contentNodeIdx"] = nodeCount + 1;
                        nextNodeIsContainer = true;
                    } else {
                        nd["contentNodeIdx"] = 0;
                    }
                }
            } else {
                nd["contentNodeIdx"] = 0;
            }
        }
    }

    function generateUpdateInstruction(nd: XjsContentNode, expBlockIdx: number, instructionContainer: number, indent: string, prevKind: string, nextKind: string) {
        let idx = nd["index"];
        switch (nd.kind) {
            case "#textNode":
                if (nd.expressions && nd.expressions.length) {
                    // this text is dynamic
                    // e.g. ζtxtval(ζ, 6, 0, 2, ζe(ζ, 3, 1, expr(1)), ζe(ζ, 4, 1, expr(2)));
                    body.push(`${indent}ζtxtval(ζ, ${idx}, ${instructionContainer}, ${nd.expressions.length}, `);
                    imports['ζtxtval'] = 1;
                    let eLength = nd.expressions.length;
                    for (let i = 0; eLength > i; i++) {
                        generateExpression(nd.expressions[i], expBlockIdx);
                        if (i < eLength - 1) {
                            body.push(', ');
                        }
                    }
                    body.push(');\n');
                }
                break;
            case "#component":
                let c = nd as XjsComponent,
                    cNode = nd["contentNodeIdx"],
                    stParams = (nd["staticParamsIdx"] === -1) ? '' : ', ζs' + nd["staticParamsIdx"];
                imports['ζcpt'] = 1;
                body.push(`${indent}ζcpt(ζ, ${idx}, ${instructionContainer}, `);
                generateExpression(c.ref, expBlockIdx);
                body.push(`, ${cNode}, 0${stParams});\n`);
                generateContentUpdate(c, expBlockIdx, instructionContainer, false);
                imports['ζcall'] = 1;
                body.push(`${indent}ζcall(ζ, ${idx}, ${instructionContainer});\n`);
                break;
            case "#fragment":
                generateContentUpdate(nd as XjsFragment, expBlockIdx, instructionContainer, true);
                break;
            case "#element":
                // scan params and properties
                generateContentUpdate(nd as XjsElement, expBlockIdx, instructionContainer, true);
                break;
            case "#paramNode":
                generateContentUpdate(nd as XjsParamNode, expBlockIdx, instructionContainer, false);
                break;
            case "#jsStatements":
                body.push((prevKind !== "#jsBlock") ? indent : " ");
                body.push(nd);
                if (!nd.code.match(/\n$/)) {
                    body.push("\n");
                }
                nd["endPos"] = body.length;
                break;
            case "#jsBlock":
                body.push((prevKind !== "#jsBlock" && prevKind !== "#jsStatements") ? indent : " ");
                body.push(nd);
                if (!nd.startCode.match(/\n$/)) {
                    body.push("\n");
                }
                if (nd.content && nd.content.length) {
                    let instanceRef = 'ζi' + (nodeCount + 1);
                    nd["cleanIdx"] = nodeCount + 1;
                    body.push(`${indent + INDENT}${instanceRef}++;\n`);
                    localVars[`${instanceRef} = 0`] = 1;
                    generateBlock(nd.content, nd["index"], indent + INDENT, instructionContainer, instanceRef);
                }
                body.push(indent);
                body.push(nd.endCode);
                if (!nd.endCode.match(/\n$/) && nextKind !== "#jsBlock" && nextKind !== "#jsStatements") {
                    body.push("\n");
                }
                nd["endPos"] = body.length;
                break;
        }

        function generateContentUpdate(nd: XjsComponent | XjsElement | XjsFragment, blockIdx: number, instructionContainer: number, useAttributes: boolean) {
            generateParamUpdate(nd, expBlockIdx, instructionContainer, indent, useAttributes);
            let cNode = nd["contentNodeIdx"];
            if (cNode) {
                blockIdx = cNode;
                instructionContainer = cNode;
            }
            if (nd.content) {
                let len = nd.content.length, pKind = "", nKind = "";
                for (let i = 0; len > i; i++) {
                    nKind = (i < len - 1) ? nd.content[i + 1].kind : "";
                    generateUpdateInstruction(nd.content[i], blockIdx, instructionContainer, indent, pKind, nKind);
                    pKind = nd.content[i].kind;
                }
            }
        }
    }

    function generateCleanInstructions(xjsNodes: XjsContentNode[], instructionContainer: number, indent: string): number {
        let len = xjsNodes.length, nd: XjsContentNode, insert: { idx: number, endPos: number }[] | undefined = undefined, endPos = 0, shift = 0;
        for (let i = 0; len > i; i++) {
            nd = xjsNodes[i];
            if (insert && (nd.kind !== "#jsBlock" && nd.kind !== "#jsStatements")) {
                clean(nd["index"], endPos);
            }
            if (nd.kind === "#jsBlock" && nd["cleanIdx"]) {
                if (!insert) {
                    insert = [];
                }
                insert.push({ idx: nd["cleanIdx"], endPos: nd["endPos"] });
                endPos = nd["endPos"];
            } else if (nd["content"]) {
                shift += generateCleanInstructions(nd["content"] as XjsContentNode[], instructionContainer, indent);
            }
            if (insert && nd.kind === "#jsStatements") {
                endPos = nd["endPos"];
            }
            if (insert && i === len - 1) {
                clean(nd["index"], endPos);
            }
        }
        return shift;

        function clean(afterIdx: number, endPos: number) {
            if (insert && insert!.length) {
                let len = insert!.length;
                for (let j = 0; len > j; j++) {
                    body.splice(endPos + j + shift, 0, `${indent}ζclean(ζ, ${insert[j].idx}, ${instructionContainer});\n`)
                    imports['ζclean'] = 1;
                }
                shift += len; // insertions are shifting the nd["endPos"] values stored before before insertion
                insert = undefined;
            }
        }
    }

    function encodeText(t: string) {
        // todo replace double \\ with single \
        return '"' + t.replace(RX_DOUBLE_QUOTE, '\\"') + '"';
    }

    function generateExpression(exp: XjsExpression, blockIdx: number) {
        if (exp.oneTime) {
            // e.g. ζc1 ? expr(0) : ζu
            body.push(`ζc${blockIdx} ? `);
            body.push(exp); // to generate source map
            body.push(' : ζu');
            imports['ζu'] = 1;
        } else {
            // e.g. ζe(ζ, 2, 1, expr())
            if (exprCounts[blockIdx] === undefined) {
                exprCounts[blockIdx] = 0
            } else {
                exprCounts[blockIdx] += 1;
            }

            body.push(`ζe(ζ, ${exprCounts[blockIdx]}, ${blockIdx}, `);
            body.push(exp); // to generate source map
            body.push(')');
            imports['ζe'] = 1;
        }
    }

    function registerStatics(params: XjsParam[] | XjsProperty[] | undefined): number {
        // return the index of the static resource or -1 if none
        if (!params || !params.length) return -1;
        let v: XjsNumber | XjsBoolean | XjsString | XjsExpression | undefined,
            sIdx = -1, val: string[] | undefined = undefined,
            p: XjsParam | XjsProperty,
            sVal = "";
        for (let i = 0; params.length > i; i++) {
            p = params[i];
            v = p.value;
            sVal = ""
            if (p.kind === "#param" && p.isOrphan) {
                sVal = "true";
            } else if (v && v.kind !== "#expression") {
                if (v.kind === "#string") {
                    sVal = encodeText(v.value);
                } else {
                    sVal = "" + v.value;
                }
            }
            if (sVal) {
                if (sIdx < 0) {
                    sIdx = statics.length;
                    val = [];
                }
                val!.push(encodeText(p.name));
                val!.push(sVal);
            }
        }
        if (val) {
            statics[sIdx] = "ζs" + sIdx + " = [" + val!.join(", ") + "]";
        }
        return sIdx;
    }

    function generateParamUpdate(f: XjsFragment, blockIdx: number, instructionContainer: number, indent: string, isAttribute: boolean) {
        if (f.kind === "#paramNode") {
            instructionContainer = f["instructionContainer"];
        }

        // dynamic params / attributes
        if (f.params && f.params.length) {
            let len = f.params.length, p: XjsParam, funcName = isAttribute ? "ζatt" : "ζparam";
            for (let i = 0; len > i; i++) {
                p = f.params[i];
                if (p.value && p.value.kind === "#expression") {
                    // e.g. ζatt(ζ, 2, 0, "title", ζe(ζ, 0, 0, expr(x)));
                    body.push(`${indent}${funcName}(ζ, ${f["index"]}, ${instructionContainer}, "${p.name}", `);
                    generateExpression(p.value, blockIdx);
                    body.push(');\n');
                    imports[funcName] = 1;
                }
            }
        }
        // dynamic properties
        if (f.properties && f.properties.length) {
            let len = f.properties.length, p: XjsProperty;
            for (let i = 0; len > i; i++) {
                p = f.properties[i];
                if (p.value && p.value.kind === "#expression") {
                    body.push(`${indent}ζprop(ζ, ${f["index"]}, ${instructionContainer}, "${p.name}", `);
                    generateExpression(p.value, blockIdx);
                    body.push(');\n');
                    imports["ζprop"] = 1;
                }
            }
        }
    }

    function reduceIndent(indent: string) {
        if (indent.length > 3) {
            return indent.slice(0, -4);
        }
        return indent;
    }

    function templateStart(indent: string, tf: XjsTplFunction) {
        let lines: string[] = [], argNames = "", classDef = "", args = tf.arguments, argClassName = "", argInit: string[] = [];
        indent = reduceIndent(indent);

        if (args && args.length) {
            let classProps: string[] = [], arg: XjsTplArgument;
            imports["ζv"] = 1;
            argNames = ", $";
            for (let i = 0; args.length > i; i++) {
                arg = args[i];
                if (i === 0 && arg.name === "$") {
                    argClassName = arg.typeRef!;
                    if (!argClassName) {
                        error("Undefined $ argument type", arg);
                    }
                }
                if (!argClassName) {
                    argInit.push(arg.name + ' = $["' + arg.name + '"]')
                    classProps.push((indent + INDENT) + "@ζv " + arg.name + ";")
                    imports["ζv"] = 1;
                } else if (i > 0) {
                    argInit.push(arg.name + ' = $["' + arg.name + '"]');
                }
            }
            if (!argClassName) {
                // default argument class definition
                argClassName = "ζParams";
                imports["ζd"] = 1;
                // sample parameter class:
                // @ζd class ζParams { 
                //     @ζv options;
                // }
                classDef = [indent, "@ζd class ζParams {\n", classProps.join("\n"), "\n", indent, "}"].join("");
            }
        }

        tf["argClassName"] = argClassName;
        lines.push('(function () {');
        if (statics.length) {
            lines.push(`${indent}const ${statics.join(", ")};`);
        }
        if (classDef) {
            lines.push(classDef);
        }
        imports["ζt"] = 1;
        lines.push(`${indent}return ζt(function (ζ${argNames}) {`);
        if (argInit.length) {
            lines.push(`${indent + INDENT}let ${argInit.join(", ")};`);
        }
        return lines.join("\n");
    }

    function templateEnd(tf: XjsTplFunction) {
        let argClassName = tf["argClassName"];
        if (argClassName) {
            return '}, 0, ' + argClassName + ');\n' + reduceIndent(tf.indent) + '})()';
        }
        return '});\n' + reduceIndent(tf.indent) + '})()';
    }
}
