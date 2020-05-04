import { ViewInstruction, ContainerType, DecoInstruction, ViewKind, GenerationCtxt, CompilationOptions, CompilationResult } from './types';
import { XjsExpression, XjsJsStatement, XjsJsBlock, XjsCData, XjsText, XjsElement, XjsFragment, XjsParam, XjsProperty, XjsDecorator, XjsNode, XjsLabel, XjsComponent, XjsParamNode, XjsTplFunction, XjsTplArgument } from '../../xjs/types';
import { validator } from './validator';
import { ViewBlock } from './processor';
import { createGetAccessor } from 'typescript';


type BodyContent = string | XjsExpression | XjsJsStatement | XjsJsBlock;

const U = undefined,
    RX_DOUBLE_QUOTE = /\"/g,
    RX_BACKSLASH = /\\/g,
    RX_CR = /\n/g,
    RX_START_CR = /^\n*/,
    API_ARG = "$",
    FULL_API_ARG = "$api",
    TPL_ARG = "$template",
    MD_PARAM_CLASS = "$apiClassName";

export class CodeGenerator implements GenerationCtxt {
    template: string = "";
    options: CompilationOptions;
    indentIncrement = "    ";
    templateName = "";
    filePath = "";
    errorPath = "";
    imports: { [key: string]: 1 };          // map of required imports
    statics: string[] = [];                 // list of static resources
    localVars = {};                         // map of creation mode vars
    blockCount = 0;                         // number of js blocks - used to increment block variable suffixes
    eachCount = 0;                          // number of $each blocks
    templateArgs: string[] = [];            // name of template arguments
    paramCounter = 0;                       // counter used to create param instance variables
    acceptPreProcessors = false;
    fragmentMode = false;                   // true if generator is used for fragments
    expressionRoots: { [key: string]: 1 };  // root identifiers used in expressions (only in fragmentMode)

    init(template: string, options: CompilationOptions) {
        this.template = template;
        this.options = options;
        this.imports = options.importMap || {};
        this.templateName = options.templateName.replace(RX_DOUBLE_QUOTE, "");
        this.filePath = options.filePath.replace(RX_DOUBLE_QUOTE, "");
        this.errorPath = validator.getShortPath(this.filePath);
    }

    error(msg: string, nd: XjsNode) {
        let fileInfo = this.options.filePath || "",
            lineOffset = this.options.lineOffset || 0,
            colOffset = this.options.columnOffset || 0;

        validator.throwError(`Invalid ${validator.nodeName(nd.kind)} - ${msg}`, nd.pos, this.template, fileInfo, "IVY", lineOffset, colOffset)
    }

    decreaseIndent(indent: string): string {
        let incLength = this.indentIncrement.length;
        if (indent.length > incLength) {
            return indent.substring(0, indent.length - incLength);
        } else {
            return indent;
        }
    }

    process(root: XjsTplFunction | XjsFragment) {
        const fm = this.fragmentMode = root.kind !== "#tplFunction";
        let expressionRoots: { [key: string]: 1 };

        let tf: XjsTplFunction;
        if (this.fragmentMode) {
            tf = {
                kind: "#tplFunction",
                indent: "",
                content: (root as XjsFragment).content,
                name: "[$fragment template string]",
                pos: 0
            }
            expressionRoots = this.expressionRoots = {};
        } else {
            tf = root as XjsTplFunction;
        }

        let gc = this,
            options = this.options,
            body: BodyContent[] = []; // parts composing the function body (generated strings + included expressions/statements)

        return generateAll();

        function generateAll() {
            let args = tf.arguments;
            if (args) {
                for (let i = 0; args.length > i; i++) {
                    gc.templateArgs.push(args[i].name);
                }
            }

            const root = new ViewBlock(null, "template", tf, 1, null, 0, gc, tf.indent);
            root.scan();
            gc.processRoot(body);

            const res: CompilationResult = {};
            if (options.function || options.body) {
                res.body = generateBody();
            }
            if (options.statics) {
                res.statics = gc.statics;
            }
            let contextIdentifiers: string[] = [];
            for (let k in expressionRoots) if (expressionRoots.hasOwnProperty(k)) {
                contextIdentifiers.push(k);
            }
            if (options.function) {
                res.function = templateStart(tf.indent, tf, fm, gc, contextIdentifiers) + res.body + templateEnd(tf, fm, contextIdentifiers);
            }
            if (options.imports) {
                res.importMap = gc.imports;
            }
            if (fm && contextIdentifiers.length > 0) {
                res.contextIdentifiers = contextIdentifiers;
            }
            return res;
        }

        function generateBody(): string {
            let parts: string[] = [];
            for (let part of body) {
                if (typeof part === 'string') {
                    parts.push(part);
                } else if (part.kind === "#expression") {
                    if (fm) {
                        expressionRoots[getExpressionRoot(part.code)] = 1;
                    }
                    parts.push(part.code);
                } else if (part.kind === "#jsStatement") {
                    parts.push(part.code);
                } else if (part.kind === "#jsBlock") {
                    parts.push(part.startCode.replace(RX_START_CR, ""));
                }
            }
            return "\n" + parts.join("") + reduceIndent(tf.indent);
        }

    }

    processRoot: (body: BodyContent[]) => void | undefined;

    // ζtxt - for text and cdata
    addTxtInstruction(node: XjsText | XjsCData, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string) {
        let isStatic = true,            // true when the text doesn't contain expressions
            isTextNode = true,
            staticsExpr: string = '""'; // '" static string "' or "ζs1"

        view.gc.imports['ζtxt' + getIhSuffix(iFlag)] = 1;

        if (node.kind === "#cdata") {
            staticsExpr = encodeText(node.text);
            isTextNode = false;
        } else {
            let eLength = node.expressions ? node.expressions.length : 0;
            if (node.textFragments.length <= 1 && eLength === 0) {
                // static version
                staticsExpr = encodeText(node.textFragments[0]);

            } else {
                isStatic = false;

                // create static resource
                let gc = view.gc, staticsIdx = gc.statics.length, pieces: string[] = [], fLength = node.textFragments.length, eCount = 0;
                for (let i = 0; fLength > i; i++) {
                    // todo eLength
                    pieces.push(encodeText(node.textFragments[i]));
                    if (eCount < eLength) {
                        pieces.push('""');
                        eCount++;
                    }
                }
                gc.statics.push("ζs" + staticsIdx + " = [" + pieces.join(", ") + "]");
                staticsExpr = 'ζs' + staticsIdx;
            }
        }

        view.instructions.push((body: BodyContent[]) => {
            // e.g. ζtxt(ζ1, ζc1, 0, 2, 1, ζs0, 1, ζe(ζ, 0, 1, name));
            let v = view as ViewInstruction, eLength = 0, n: XjsText | undefined;
            if (isTextNode) {
                n = node as XjsText;
                eLength = n!.expressions ? n!.expressions.length : 0;
            }

            body.push(`${v.indent}${funcStart("txt", iFlag)}${v.jsVarName}, ${v.cmVarName}, ${iFlag}, ${idx}, ${parentLevel}, ${staticLabels}, ${staticsExpr}, ${eLength}`);
            if (isTextNode) {
                for (let i = 0; eLength > i; i++) {
                    body.push(', ');
                    generateExpression(body, n!.expressions![i], v, iFlag);
                }
            }
            body.push(');\n');
        });
    }

    // ζxmlns
    addXmlNsInstruction(view: ViewInstruction, iFlag: number, startInstruction: boolean, xmlns: string) {
        view.gc.imports['ζxmlns' + getIhSuffix(iFlag)] = 1;

        view.instructions.push((body: BodyContent[]) => {
            // e.g. ζxmlns
            let v = view as ViewInstruction, lastArg = "";
            if (startInstruction) {
                lastArg = ', "' + xmlns + '"';
            }
            body.push(`${v.indent}${funcStart("xmlns", iFlag)}${v.jsVarName}, ${iFlag}${lastArg});\n`);
        });
    }

    // ζelt
    addEltInstruction(node: XjsElement, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string, staticArgs: string) {
        view.gc.imports['ζelt' + getIhSuffix(iFlag)] = 1;

        view.instructions.push((body: BodyContent[]) => {
            // e.g. ζelt(ζ1, ζc1, 0, 2, 1, "div", 0, ζs0, ζs1);
            let v = view as ViewInstruction, hasChildren = (node.content && node.content.length) ? 1 : 0,
                lastArgs = (staticLabels === "0" && !staticArgs) ? "" : ", " + staticLabels + staticArgs;
            body.push(`${v.indent}${funcStart("elt", iFlag)}${v.jsVarName}, ${v.cmVarName}, ${idx}, ${parentLevel}, "${node.name}", ${hasChildren}${lastArgs});\n`);
        });
    }

    // ζfra
    addFraInstruction(node: XjsFragment | null, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number) {
        view.gc.imports['ζfra' + getIhSuffix(iFlag)] = 1;
        view.instructions.push((body: BodyContent[]) => {
            let v = view as ViewInstruction;
            body.push(`${v.indent}${funcStart("fra", iFlag)}${v.jsVarName}, ${v.cmVarName}, ${idx}, ${parentLevel});\n`);
        });
    }

    // ζatt, ζpar and ζpro
    addParamInstruction(instructionsView: ViewInstruction, node: XjsParam | XjsProperty | XjsDecorator, idx: number, view: ViewInstruction, iFlag: number, isAttribute: boolean, indent: string, targetParamNode = false) {
        let funcName: "att" | "par" | "pro";

        funcName = isAttribute ? "att" : "par"
        if (node && node.kind === "#property") {
            funcName = "pro";
        }
        view.gc.imports["ζ" + funcName + getIhSuffix(iFlag)] = 1;

        instructionsView.instructions.push((body: BodyContent[]) => {
            // e.g. ζatt(ζ, 0, 1, "title", ζe(ζ, 0, exp()+123));
            let v = view as ViewInstruction, iSuffix = iFlag ? "D" : "", name = "0", generateLastExpressionArg = true;
            if (node.kind !== "#decorator") {
                name = '"' + (node as XjsParam | XjsProperty).name + '"';
            }
            let val = (node as XjsParam).value as XjsExpression;
            if (funcName === "par") {
                if (node.kind === "#decorator") {
                    // @paramValue reserved decorator for param nodes
                    let dfp = node.defaultPropValue;
                    if (dfp) {
                        val = dfp as XjsExpression;
                    }
                }
                if (val && val.isBinding) {
                    // binding expression - e.g. param={=someData.someProperty}
                    generateBinding(body, val.code, node, v, indent, iFlag, idx, v.bindingsCount, name);
                    v.bindingsCount++;
                    generateLastExpressionArg = false;
                } else {
                    // par defers from att and pro as it takes the cm argument to raise validation errors
                    body.push(`${indent}ζpar${iSuffix}(${v.jsVarName}, ${v.cmVarName}, ${iFlag ? 1 : 0}, ${idx}, ${name}, `);
                }
            } else {
                // attribute or property
                body.push(`${indent}ζ${funcName}${iSuffix}(${v.jsVarName}, ${iFlag ? 1 : 0}, ${idx}, ${name}, `);
            }
            if (generateLastExpressionArg) {
                if (node.kind === "#decorator") {
                    // @paramValue decorator - in this case targetParamNode is true
                    let dfp = node.defaultPropValue;
                    if (dfp) {
                        pushExpressionValue(body, dfp);
                    }
                } else if (targetParamNode) {
                    // we don't use expressions in param nodes as we don't need them (trax objects will do the job)
                    // besides expressions need to be re-evaluated when an object has been reset (so expression value cannot be cached)
                    body.push(val);
                } else {
                    generateExpression(body, val, v, iFlag);
                }
                body.push(');\n');
            }

        });
    }

    // ζdeco and ζdecoCall
    addDecoInstruction(node: XjsDecorator, idx: number, parentIdx: number, view: ViewInstruction, iFlag: number, indent: string, staticsIdx: number, staticLabels: string): DecoInstruction {
        let paramMode: 0 | 1 | 2 = 0; // 0=no params, 1=default param, 2=multiple params
        const dSuffix = getIhSuffix(iFlag);
        view.gc.imports["ζdeco" + dSuffix] = 1;

        if (node.defaultPropValue) {
            paramMode = 1; // default property value
        } else {
            if (node.params !== U) {
                for (let p of node.params) if (p.kind === "#param") {
                    paramMode = 2;
                    break;
                }
            }
        }

        function process(body: BodyContent[]) {
            // e.g. ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2);
            let v = view as ViewInstruction, iSuffix = iFlag ? "D" : "", dfp = node.defaultPropValue, hasStaticLabels = (staticLabels !== "0"),
                isDfpBinding = (dfp && (dfp as XjsExpression).kind === "#expression" && (dfp as XjsExpression).isBinding);

            body.push(`${indent}ζdeco${iSuffix}(${v.jsVarName}, ${v.cmVarName}, ${iFlag ? 1 : 0}, ${idx}, ${parentIdx}, `);
            body.push(`${encodeText(node.ref.code)}, `); // decorator name as string (error handling)

            pushExpressionValue(body, node.ref); // decorator reference

            if (isDfpBinding) {
                body.push(", 2"); // we have to consider the default parameter as an explicit parameter in this case
            } else {
                v.bindingsCount = 0; // reset bindings count - cf. ParamInstruction
                body.push(", " + paramMode);
            }

            if (!isDfpBinding && (dfp || staticsIdx > -1 || hasStaticLabels)) {
                body.push(', ');
                if (dfp) {
                    pushExpressionValue(body, dfp);
                } else {
                    body.push('0');
                }
                if (staticsIdx > -1) {
                    body.push(', ζs' + staticsIdx);
                } else if (hasStaticLabels) {
                    body.push(', 0');
                }
                if (hasStaticLabels) {
                    body.push(', ' + staticLabels);
                }
            }
            body.push(');\n');

            if (isDfpBinding) {
                // e.g. @deco={=a.b}
                // binding idx is always 0 in this case as there is only one expression
                generateBinding(body, (dfp! as XjsExpression).code, node, v, indent, iFlag, idx, 0, 0);
            }
        }

        process.addEndInstruction = function () {
            view.gc.imports["ζdecoCall" + dSuffix] = 1;

            view.instructions.push((body: BodyContent[]) => {
                let v = view as ViewInstruction;
                body.push(`${v.indent}ζdecoCall${dSuffix}(${v.jsVarName}, ${v.cmVarName}, ${iFlag ? 1 : 0}, ${idx});\n`);
            });
        }

        view.instructions.push(process);
        return process;
    }

    // ζlbl
    addLblInstruction(node: XjsLabel, idx: number, view: ViewInstruction, iFlag: number, indent: string) {
        view.gc.imports["ζlbl" + getIhSuffix(iFlag)] = 1;
        view.instructions.push((body: BodyContent[]) => {
            // e.g. ζlbl(ζ, 0, 0, "divA", expr());
            const v = view as ViewInstruction, iSuffix = iFlag ? "D" : "", value = node.value!;
            body.push(`${indent}ζlbl${iSuffix}(${v.jsVarName}, ${iFlag ? 1 : 0}, ${idx}, "#${node.name}", `);
            pushExpressionValue(body, value);
            body.push(');\n');
        });
    }

    // $exec, $let and $log
    addJsStatementsInstruction(node: XjsJsStatement, view: ViewInstruction, iFlag: number, prevKind: string) {
        view.instructions.push((body: BodyContent[]) => {
            const v = view as ViewInstruction;
            if (node.name === "$log") {
                node.code = "console." + node.code;
            }
            body.push(v.indent);
            body.push(node);
            if (!node.code.match(/\n$/)) {
                body.push("\n");
            }
        });
    }

    // ζcnt
    addCntInstruction(idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, type: ContainerType) {
        view.gc.imports['ζcnt' + getIhSuffix(iFlag)] = 1;
        view.instructions.push((body: BodyContent[]) => {
            const v = view as ViewInstruction;
            body.push(`${v.indent}${funcStart("cnt", iFlag)}${v.jsVarName}, ${v.cmVarName}, ${idx}, ${parentLevel}, ${type});\n`);
        });
    }

    // ζcpt and ζcall
    addCptInstruction(node: XjsComponent, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string, callImmediately: boolean, staticParamIdx: number) {
        let dynamicPNodeNames = [], dynamicPNodeRef = "";
        view.gc.imports['ζcpt' + getIhSuffix(iFlag)] = 1;
        function process(body: BodyContent[]) {
            callImmediately = process.callImmediately;
            // e.g. ζcpt(ζ, ζc, 2, 0, ζe(ζ, 0, alert), 1, ζs1);
            let v = view as ViewInstruction, lastArgs = "";
            [lastArgs, dynamicPNodeRef] = processCptOptionalArgs(view, dynamicPNodeNames, staticParamIdx, callImmediately ? staticLabels : "0")
            v.bindingsCount = 0; // reset bindings count - cf. ParamInstruction

            body.push(`${v.indent}${funcStart("cpt", iFlag)}${v.jsVarName}, ${v.cmVarName}, ${iFlag}, ${idx}, ${parentLevel}, `);
            generateExpression(body, node.ref as XjsExpression, v, iFlag);
            body.push(`, ${callImmediately ? 1 : 0}${lastArgs});\n`);
        };

        process.idx = idx;
        process.dynamicPNodeNames = dynamicPNodeNames;
        process.callImmediately = callImmediately;
        process.addEndInstruction = function () {
            dynamicPNodeNames = process.dynamicPNodeNames as any;
            view.gc.imports['ζcall' + getIhSuffix(iFlag)] = 1;
            view.instructions.push((body: BodyContent[]) => {
                // e.g. ζcall(ζ, 2);
                let v = view as ViewInstruction, lastArgs = "";
                if (dynamicPNodeRef) {
                    lastArgs = `, 0, ${staticLabels}, ${dynamicPNodeRef}`;
                } else if (staticLabels !== "0") {
                    lastArgs = `, 0, ${staticLabels}`;
                }

                body.push(`${v.indent}${funcStart("call", iFlag)}${v.jsVarName}, ${this.idx}${lastArgs});\n`);
            });
        }
        view.instructions.push(process);
        return process;
    }

    // ζpnode and ζpnEnd
    addPndInstruction(instructionsView: ViewInstruction, node: XjsParamNode, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string, staticParamIdx: number, indent: string, parentIndex: number, instanceVarName: string, hasEndInstruction: boolean) {
        let dynamicPNodeNames: string[] = []; // name of child param nodes
        let dynamicPNodeRef: string;
        instructionsView.gc.imports['ζpnode'] = 1;

        function process(body: BodyContent[]) {
            // e.g. ζpnode(ζ, ζc, 2, 0, "header", ζs1);
            let v = view as ViewInstruction, lastArgs = "";
            [lastArgs, dynamicPNodeRef] = processCptOptionalArgs(view, dynamicPNodeNames, staticParamIdx, hasEndInstruction ? "0" : staticLabels);
            // unused: ${this.parentLevel}
            body.push(`${indent}ζpnode(${v.jsVarName}, ${v.cmVarName}, ${iFlag}, ${idx}, ${parentIndex}, "${node.name}", ${instanceVarName}++${lastArgs});\n`);
        }

        process.idx = idx;
        process.dynamicPNodeNames = dynamicPNodeNames; // read-only
        process.addEndInstruction = function () {
            instructionsView.gc.imports['ζpnEnd'] = 1;
            instructionsView.instructions.push((body: BodyContent[]) => {
                // ζpnEnd(v: IvView, cm: boolean, iFlag: number, idx: number, labels, dynParamNames: string[]) 

                // only create this instruction when there are dynamic parameter nodes
                let v = view as ViewInstruction, lastArg = "";
                if (dynamicPNodeRef) {
                    lastArg = `, ${staticLabels}, ${dynamicPNodeRef}`;
                } else if (staticLabels !== "0") {
                    lastArg = `, ${staticLabels}`;
                }

                body.push(`${indent}ζpnEnd(${v.jsVarName}, ${v.cmVarName}, ${iFlag}, ${this.idx}${lastArg});\n`);
            });
        }
        instructionsView.instructions.push(process);
        return process;
    }

    // ζevt
    addEvtInstruction(d: XjsDecorator, name: string, idx: number, parentIdx, view: ViewInstruction, iFlag: number) {
        view.gc.imports['ζevt' + getIhSuffix(iFlag)] = 1;

        if (!d.hasDefaultPropValue && !d.params) {
            view.gc.error("Missing event handler value for @" + d.ref.code, d);
        }

        view.instructions.push((body: BodyContent[]) => {
            // e.g. ζevt(ζ, ζc, 1, 0, function (e) {doSomething()});
            let v = view as ViewInstruction;

            let listener: XjsExpression | undefined, options: XjsExpression | undefined;

            if (d.defaultPropValue) {
                if ((d.defaultPropValue as XjsExpression).kind !== "#expression") {
                    v.gc.error('Event listeners must be function expressions - e.g. @onclick={e=>doSomething(e)}', d);
                } else {
                    listener = d.defaultPropValue! as XjsExpression;
                }
            } else {
                for (let p of d.params!) {
                    if (p.kind !== "#param") {
                        v.gc.error("Invalid param on event listener", p);
                        continue;
                    }
                    if (p.name === "listener") {
                        if (!p.value) {
                            v.gc.error("listener value cannot be empty", p);
                        } else if ((p.value as XjsExpression).kind !== "#expression") {
                            v.gc.error('listeners must be function expressions - e.g. listener={e=>doSomething(e)}', p);
                        } else {
                            listener = p.value as XjsExpression;
                        }
                    } else if (p.name === "options") {
                        if (!p.value) {
                            v.gc.error("options value cannot be empty", p);
                        } else if ((p.value as XjsExpression).kind !== "#expression") {
                            v.gc.error('options value must be an expression - e.g. options={{passive:true, once:true}}', p);
                        } else {
                            options = p.value as XjsExpression;
                        }
                    }
                }
            }

            if (!listener) {
                v.gc.error("Missing listener parameter", d);
            } else {
                let passiveArg = "", optionsArg = "";
                if (listener.code.match(/^\s*(\=\>)|(\(\s*\)\s*\=\>)/)) {
                    passiveArg = ", 1"
                }
                if (options) {
                    optionsArg = ", " + options.code;
                    passiveArg = passiveArg || ", 0";
                }
                body.push(`${v.indent}${funcStart("evt", iFlag)}${v.jsVarName}, ${v.cmVarName}, ${idx}, ${parentIdx}, "${name}", `);
                pushExpressionValue(body, listener);
                body.push(`${passiveArg}${optionsArg});\n`);
            }
        });
    }

    // ζins
    addInsInstruction(d: XjsDecorator, parent: XjsComponent | XjsElement | XjsFragment, idx: number, view: ViewInstruction, iFlag: number) {
        view.gc.imports['ζins' + getIhSuffix(iFlag)] = 1;
        view.instructions.push((body: BodyContent[]) => {
            let v = view as ViewInstruction, gc = view.gc;

            if (d.isOrphan || !d.defaultPropValue) {
                if (gc.templateArgs.indexOf("$") < 0 && gc.templateArgs.indexOf("$content") < 0) {
                    gc.error("$ or $content must be defined as template arguments to use @content with no values", d);
                }
            }

            body.push(`${v.indent}${funcStart("ins", iFlag)}${v.jsVarName}, ${iFlag}, ${idx}, `);
            if (d.isOrphan || !d.defaultPropValue) {
                body.push(`$, 1);\n`);
            } else {
                generateExpression(body, d.defaultPropValue as XjsExpression, v, iFlag);
                body.push(`);\n`);
            }

        });
    }

    // ζview
    addViewInstruction(instructionsView: ViewInstruction | null, kind: ViewKind, node: XjsTplFunction | XjsJsBlock | XjsElement | XjsFragment | XjsComponent, idx: number, parentView: ViewInstruction | null, iFlag: number, generationCtxt: GenerationCtxt, indent?: string): ViewInstruction {
        let gc: GenerationCtxt,
            instanceCounterVar = '',
            blockIdx = 0,
            idt = indent || "";

        if (parentView) {
            gc = parentView.gc;
            blockIdx = gc.blockCount++;
            if (kind === "cptContent" || kind === "paramContent") {
                // no instance var, no indent
                idt = parentView.indent;
                instanceCounterVar = '';
            } else if (kind === "asyncBlock") {
                gc.imports['ζasync'] = 1;
                idt = parentView.indent + gc.indentIncrement;
                instanceCounterVar = '';
            } else if (kind === "jsBlock") {
                idt = parentView.indent + gc.indentIncrement;
                instanceCounterVar = 'ζi' + blockIdx;
                gc.localVars[`${instanceCounterVar} = 0`] = 1;
                parentView.childViewIndexes.push(blockIdx); // used to reset instanceVar counters
            }
        } else if (generationCtxt) {
            gc = generationCtxt;
            blockIdx = gc.blockCount++;
            gc.imports['ζinit'] = 1;
            gc.imports['ζend'] = 1;
            gc.statics[0] = "ζs0 = {}"; // static object to hold cached values
        } else {
            throw new Error("ViewInstruction: either parentView or generationCtxt must be provided");
        }

        let vi: ViewInstruction = {
            gc: gc,
            indent: idt,
            instructions: [],
            nodeCount: 0,
            jsVarName: "ζ",         // block variable name - e.g. ζ or ζ1
            cmVarName: "ζc",         // creation mode var name - e.g. ζc or ζc1
            hasChildNodes: false,
            childBlockIndexes: [], // number[]
            childViewIndexes: [],  // number[]
            paramInstanceVars: undefined,
            asyncValue: 0,
            exprCount: 0,
            expr1Count: 0,
            dExpressions: [],
            bindingsCount: 0,
            update(indent: string, nodeCount: number, hasChildNodes: boolean, asyncValue: number | XjsExpression, exprCount: number, expr1Count: number, bindingsCount, paramInstanceVars?: { [paramName: string]: string }) {
                vi.indent = indent;
                vi.nodeCount = nodeCount;
                vi.hasChildNodes = hasChildNodes;
                vi.paramInstanceVars = paramInstanceVars;
                vi.asyncValue = asyncValue;
                vi.exprCount = exprCount;
                vi.expr1Count = expr1Count;
                vi.bindingsCount = bindingsCount;
                if (parentView && hasChildNodes) {
                    gc.imports['ζview' + getIhSuffix(iFlag)] = 1;
                    gc.imports['ζend' + getIhSuffix(iFlag)] = 1;
                }
            }
        };

        if (blockIdx > 0) {
            vi.jsVarName = "ζ" + blockIdx;
            vi.cmVarName = "ζc" + blockIdx;
            // root block (idx 1) is passed as function argument
            gc.localVars[vi.jsVarName] = 1;
            gc.localVars[vi.cmVarName] = 1;
        }

        const cg = this;

        function process(body: BodyContent[]) {
            // e.g. 
            // let ζc = ζinit(ζ, ζs0, 3);
            // ...
            // ζend(ζ);

            let isJsBlock = node.kind === "#jsBlock";
            if (isJsBlock) {
                let jsb = node as XjsJsBlock;
                const args = jsb.args!, name = jsb.name;
                if (name === "$each") {
                    // start - e.g.
                    // let ζec1=items,ζl1=ζec1.length; // ec = each collection
                    // for (let ζx1=0;ζl1>ζx1;ζx1++) {
                    //     let item=ζec1[ζx1];
                    let name: string;
                    if (Array.isArray(args[0])) {
                        if (cg.fragmentMode) {
                            cg.expressionRoots[args[0][0]] = 1;
                        }
                        name = args[0].join(".");
                    } else {
                        name = args[0];
                        if (cg.fragmentMode) {
                            cg.expressionRoots[name] = 1;
                        }
                    }
                    const idx = ++gc.eachCount,
                        p1 = `let ζec${idx}=${name}, ζl${idx}=ζec${idx}? ζec${idx}.length:0;`,
                        p2 = `for (let ζx${idx}=0;ζl${idx}>ζx${idx};ζx${idx}++) {`,
                        p3 = `let ${args[1]}=ζec${idx}[ζx${idx}]`;    // item name
                    let p4 = '', p5 = '';
                    if (args.length > 2) {
                        p4 = `, ${args[2]}=ζx${idx}`; // index
                    }
                    if (args.length > 3) {
                        p5 = `, ${args[3]}=ζx${idx}===ζl${idx}-1`; // isLast
                    }

                    jsb.startCode = p1 + p2 + p3 + p4 + p5 + ";";
                    // end
                    jsb.endCode = "}";
                } else if (cg.fragmentMode && (name === "$if" || name === "$elseif")) {
                    if (name === "$if") {
                        jsb.startCode = `if (${jsb.args![0].join(".")}) {`
                    } else if (name === "$elseif") {
                        jsb.startCode = `else if (${jsb.args![0].join(".")}) {`
                    }
                    cg.expressionRoots[args[0][0]] = 1;
                }
                body.push(gc.decreaseIndent(vi.indent));
                body.push(jsb);
                if (!jsb.startCode.match(/\n$/)) {
                    body.push("\n");
                }
            } else if (kind === "asyncBlock") {
                // async block
                let p = parentView!;
                body.push(gc.decreaseIndent(vi.indent));
                // body.push((this.prevKind !== "#jsBlock" && this.prevKind !== "#jsStatement") ? this.gc.decreaseIndent(this.indent) : " ");
                body.push(`${funcStart("async", iFlag)}${p.jsVarName}, ${iFlag}, ${idx}, `);
                if (typeof vi.asyncValue === 'number') {
                    body.push('' + vi.asyncValue);
                } else {
                    generateExpression(body, vi.asyncValue as XjsExpression, p! as ViewInstruction, iFlag);
                }
                body.push(`, function () {\n`);
            }

            if (vi.instructions.length) {
                let endArg = "";
                if (vi.childBlockIndexes.length) {
                    // block indexes need to be passed to the end statement
                    let statics = gc.statics, csIdx = statics.length;
                    statics.push("ζs" + csIdx + " = [" + vi.childBlockIndexes.join(", ") + "]");
                    endArg = ", ζs" + csIdx;
                }

                if (vi.hasChildNodes) {
                    let lastArgs = "", parentViewVarName = "ζ";
                    if (!parentView) {
                        // root block: insert local variables
                        let arr: string[] = [], localVars = gc.localVars;
                        for (let k in localVars) if (localVars.hasOwnProperty(k)) {
                            arr.push(k);
                        }
                        arr.push(`ζc = ζinit(ζ, ζs0, ${vi.nodeCount})`)
                        if (arr.length) {
                            body.push(`${vi.indent}let ${arr.join(", ")};\n`);
                        }
                    } else {
                        if (vi.childViewIndexes.length) {
                            // reset child view indexes
                            body.push(`${vi.indent}ζi${vi.childViewIndexes.join(" = ζi")} = 0;\n`);
                        }
                        parentViewVarName = parentView.jsVarName;
                        lastArgs = instanceCounterVar ? ", ++" + instanceCounterVar : ", 0";
                    }
                    if (blockIdx > 0) {
                        // root block is initialized with ζinit
                        body.push(`${vi.indent}${vi.jsVarName} = ${funcStart("view", iFlag)}${parentViewVarName}, ${iFlag}, ${idx}, ${vi.nodeCount}${lastArgs});\n`);
                        body.push(`${vi.indent}${vi.cmVarName} = ${vi.jsVarName}.cm;\n`);

                    }
                }
                if (vi.paramInstanceVars !== undefined) {
                    // reset the parameter instance counters
                    let arr: string[] = [];
                    for (let k in vi.paramInstanceVars) {
                        if (vi.paramInstanceVars.hasOwnProperty(k)) {
                            arr.push(vi.paramInstanceVars[k]);
                        }
                    }
                    body.push(`${vi.indent}${arr.join(" = ")} = 0;\n`);
                }

                for (let ins of vi.instructions) {
                    if (typeof ins === "function") {
                        (ins as Function)(body);
                    } else {
                        ins.pushCode(body);
                    }
                }

                if (vi.hasChildNodes) {
                    body.push(`${vi.indent}${funcStart("end", iFlag)}${vi.jsVarName}, ${vi.cmVarName}${endArg});\n`);
                }
            }

            if (isJsBlock) {
                let nd = node as XjsJsBlock;
                body.push(gc.decreaseIndent(vi.indent));
                body.push(nd.endCode);
                if (!nd.endCode.match(/\n$/)) {
                    body.push("\n");
                }
            } else if (kind === "asyncBlock") {
                // end of async function
                body.push(`${parentView!.indent}});\n`);
            }
        }

        if (instructionsView !== null) {
            instructionsView.instructions.push(process);
        } else {
            this.processRoot = process;
        }

        return vi;
    }
}

function getIhSuffix(iFlag: number) {
    return iFlag ? "D" : "";
}

function encodeText(t: string) {
    return '"' + t.replace(RX_BACKSLASH, "\\\\").replace(RX_DOUBLE_QUOTE, '\\"').replace(RX_CR, "\\n") + '"';
}

function funcStart(name: string, iFlag: number) {
    if (!iFlag) {
        return "ζ" + name + "(";
    } else {
        return "ζ" + name + "D(";
    }
}

function generateExpression(body: BodyContent[], exp: XjsExpression | string, view: ViewInstruction, iFlag: number) {
    if (typeof (exp) !== "string" && exp.oneTime) {
        let ih = iFlag ? ", 1" : "";
        // e.g. ζo(ζ1, 0, ζc1? exp() : ζu, 2)
        body.push(`ζo(${view.jsVarName}, ${view.expr1Count++}, ${view.cmVarName}? `);
        body.push(exp); // to generate source map
        body.push(` : ζu${ih})`);
        view.gc.imports['ζo'] = 1;
        view.gc.imports['ζu'] = 1;
    } else {
        // e.g. ζe(ζ1, 2, expr())
        if (iFlag === 0) {
            body.push(`ζe(${view.jsVarName}, ${view.exprCount++}, `);
            body.push(exp); // to generate source map
            body.push(')');
        } else {
            // expression has to be deferred and cannot be immediately processed
            // so will be passed as an array: [0, getTitle()]
            // note: context nodes and instruction holder are already passed to the function
            // where the expression is used, this is why they don't need to be passed in the expression array
            if (view.dExpressions[iFlag] === undefined) {
                view.dExpressions[iFlag] = 0;
            } else {
                view.dExpressions[iFlag]++;
            }
            body.push(`[${view.dExpressions[iFlag]}, `);
            body.push(exp); // to generate source map
            body.push(`]`);
        }
        view.gc.imports['ζe'] = 1;
    }
}

function pushExpressionValue(body: BodyContent[], value: number | boolean | string | XjsExpression) {
    if ((value as XjsExpression).kind === "#expression") {
        body.push(value as XjsExpression);
    } else {
        if (typeof value === "string") {
            body.push(encodeText(value));
        } else {
            body.push("" + value);
        }
    }
}

function generateBinding(body: BodyContent[], expressionCode: string, node: XjsNode, v: ViewInstruction, indent: string, iFlag: number, idx: number, bindingIdx: number, name: string | 0, expressionRoots?: { [key: string]: 1 }) {
    let iSuffix = iFlag ? "D" : "";
    let { hostExp, propExp, errorMsg } = parseBinding(expressionCode);
    if (expressionRoots !== undefined) {
        expressionRoots[getExpressionRoot(hostExp)] = 1;
    }
    if (errorMsg) {
        v.gc.error(errorMsg, node);
    } else {
        // ζbind(ζ, ζc, 0, 1, "param", someData, "someProperty");
        v.gc.imports["ζbind" + getIhSuffix(iFlag)] = 1;
        body.push(`${indent}ζbind${iSuffix}(${v.jsVarName}, ${v.cmVarName}, ${iFlag ? 1 : 0}, ${idx}, ${bindingIdx}, ${name}, ${hostExp}, ${propExp});\n`);
    }
}

export function parseBinding(code: string): { hostExp: string, propExp: string, errorMsg: string } {
    let hostExp = "", propExp = "", errorMsg = "";

    // todo: proper parsing
    if (code.match(/(.*)\.([a-zA-Z_][a-zA-Z_0-9]*)$/)) {
        hostExp = RegExp.$1;
        propExp = '"' + RegExp.$2 + '"';
    } else {
        errorMsg = "Invalid binding expression: {=" + code + "}";
    }
    return { hostExp, propExp, errorMsg };
}

function processCptOptionalArgs(view: ViewInstruction, dynamicPNodeNames: string[], staticParamIdx: number, staticLabels: string): [string, string] {
    let dynamicPNodeRef = "";
    if (dynamicPNodeNames && dynamicPNodeNames.length) {
        let idx = view.gc.statics.length;
        for (let i = 0; dynamicPNodeNames.length > i; i++) {
            dynamicPNodeNames[i] = encodeText(dynamicPNodeNames[i]);
        }
        dynamicPNodeRef = "ζs" + idx;
        view.gc.statics[idx] = dynamicPNodeRef + " = [" + dynamicPNodeNames.join(", ") + "]";

        return [`, ${staticLabels}, ${(staticParamIdx > -1) ? 'ζs' + staticParamIdx : '0'}, ζs${idx}`, dynamicPNodeRef];
    } else if (staticParamIdx > -1) {
        return [`, ${staticLabels}, ζs${staticParamIdx}`, ''];
    } else if (staticLabels !== "0") {
        return [`, ${staticLabels}`, ''];
    }
    return ['', ''];
}

function templateStart(indent: string, tf: XjsTplFunction, fragmentMode: boolean, gc: GenerationCtxt, contextIdentifiers: string[]) {
    let lines: string[] = [], argNames = "", classDef = "", args = tf.arguments, argClassName = "", argInit: string[] = [], argType: string, ctlClass = "", injectTpl = false;
    indent = reduceIndent(indent);

    function addImport(symbol: string) {
        gc.imports[symbol] = 1;
    }

    if (!fragmentMode && args && args.length) {
        let classProps: string[] = [], arg: XjsTplArgument, defaultValue = "";

        argNames = ", $, $api";
        for (let i = 0; args.length > i; i++) {
            defaultValue = "";
            arg = args[i];
            if (i === 0 && arg.name === API_ARG) {
                argClassName = arg.typeRef || "";
            }
            if (arg.name === API_ARG) {
                if (i > 0 && arg.typeRef) {
                    gc.error("Template param class must be defined as first argument", arg);
                }
            } else if (arg.name === TPL_ARG) {
                injectTpl = true;
            } else if (arg.name === FULL_API_ARG) {
                // $api injection - nothing to do as it is already in the argument list
            } else if (!argClassName) {
                argInit.push(arg.name + ' = $api["' + arg.name + '"]')
                switch (arg.typeRef) {
                    case "string":
                    case "number":
                    case "boolean":
                        argType = arg.typeRef;
                        break;
                    case "IvContent":
                        argType = "any"
                        break;
                    default:
                        if (arg.typeRef) {
                            argType = arg.typeRef;
                        } else {
                            argType = "any";
                        }
                        break;
                }
                if (arg.defaultValue) {
                    defaultValue = " = " + arg.defaultValue;
                }
                let optional = arg.optional ? "?" : "";
                classProps.push(`${indent + gc.indentIncrement}${arg.name}${optional}: ${argType}${defaultValue};`);
                //classProps.push((indent + gc.indentIncrement) + getPropertyDefinition({ name: arg.name, type: argType }, "ζ", addImport));
            } else if (i > 0) {
                // argClassName is defined (always in 1st position)
                argInit.push(arg.name + ' = $api["' + arg.name + '"]');
            }
        }
        if (!argClassName && classProps.length) {
            // default argument class definition
            argClassName = "ζParams";
            addImport("ζΔD")
            classDef = [indent, "@ζΔD", " class ζParams {\n", classProps.join("\n"), "\n", indent, "}"].join("");
        }
    }

    gc.imports["ζt"] = 1;
    tf[MD_PARAM_CLASS] = argClassName;
    if (fragmentMode) {
        argNames = ", $, $context";
        const imports = gc.imports, buf: string[] = [];
        for (let k in imports) if (imports.hasOwnProperty(k)) {
            buf.push(k + '=ζr.' + k);
        }
        lines.push('const ' + buf.join(",") + ";");
    } else {
        lines.push('(function () {');
    }

    if (gc.statics.length) {
        lines.push(`${indent}const ${gc.statics.join(", ")};`);
    }
    if (classDef) {
        lines.push(classDef);
    }
    if (ctlClass || injectTpl) {
        if (injectTpl) {
            argNames += ", $template";
        }
    }
    lines.push(`${indent}return ζt("${gc.templateName}", "${gc.errorPath}", ζs0, function (ζ${argNames}) {`);
    if (contextIdentifiers.length > 0) {
        const buf: string[] = [];
        let nm: string;
        for (let i = 0; contextIdentifiers.length > i; i++) {
            nm = contextIdentifiers[i];
            buf.push(nm + '=$context["' + nm + '"]');
        }
        lines.push(`let ${buf.join(", ")};`);
    }
    if (argInit.length) {
        lines.push(`${indent + gc.indentIncrement}let ${argInit.join(", ")};`);
    }
    return lines.join("\n");
}

function templateEnd(tf: XjsTplFunction, fragmentMode: boolean, contextIdentifiers: string[]) {
    if (fragmentMode) {
        let lastArgs = '';
        if (contextIdentifiers.length > 0) {
            lastArgs = ', undefined, ["' + contextIdentifiers.join('","') + '"]';
        }

        return '}' + lastArgs + ');\n' + reduceIndent(tf.indent);
    } else {
        let argClassName = tf[MD_PARAM_CLASS];
        if (argClassName) {
            return `}, ${argClassName});\n${reduceIndent(tf.indent)}})()`;
        }
        return '});\n' + reduceIndent(tf.indent) + '})()';
    }

}

function reduceIndent(indent: string) {
    if (indent.length > 3) {
        return indent.slice(0, -4);
    }
    return indent;
}

function getExpressionRoot(code: string) {
    let idx = code.indexOf(".");
    return (idx > -1) ? code.slice(0, idx) : code;
}