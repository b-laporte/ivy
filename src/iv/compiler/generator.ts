import { XjsTplFunction, XjsContentNode, XjsNodeParam, XjsExpression, XjsElement, XjsParam, XjsCData, XjsProperty, XjsFragment, XjsJsStatement, XjsJsBlock, XjsComponent, XjsParamNode, XjsNode, XjsTplArgument, XjsText, XjsDecorator, XjsLabel } from '../../xjs/types';
import { parse, XjsParserContext } from '../../xjs/parser';
import { validator } from './validator';
import { CompilationOptions, CompilationResult } from './types';

type BodyContent = string | XjsExpression | XjsJsStatement | XjsJsBlock;

const U = undefined,
    RX_DOUBLE_QUOTE = /\"/g,
    RX_START_CR = /^\n*/,
    RX_CR = /\n/g,
    RX_LOG = /\/\/\s*log\s*/,
    RX_EVT_HANDLER_DECORATOR = /^on(\w+)$/,
    PARAM_VALUE = "paramValue", // @paramValue reserved decorator
    API_ARG = "$",
    FULL_API_ARG = "$api",
    TPL_ARG = "$template",
    ASYNC = "async",
    SVG = "svg",
    XMLNS = "xmlns",
    XMLNS_VALUES = {
        "xhtml": "http://www.w3.org/1999/xhtml",
        "html": "http://www.w3.org/1999/xhtml",
        "svg": "http://www.w3.org/2000/svg",
        "mathml": "http://www.w3.org/1998/mathml"
    },
    MD_PARAM_CLASS = "$apiClassName";

export async function compileTemplate(template: string, options: CompilationOptions): Promise<CompilationResult> {
    options.lineOffset = options.lineOffset || 0;
    let log = false;
    if (template.match(RX_LOG)) {
        log = true;
        template = template.replace(RX_LOG, "");
    }
    const pc: XjsParserContext = {
        line1: options.lineOffset ? options.lineOffset + 1 : 1,
        col1: options.columnOffset ? options.columnOffset + 1 : 1,
        fileId: options.filePath || "",
        templateType: "$template",
        preProcessors: options ? options.preProcessors : undefined
    }
    const root = await parse(template, pc);
    if (root.kind !== "#tplFunction") {
        console.log("TODO: $content root")
        throw "todo"
    }
    let res = generate(root, template, options);
    if (log) {
        let importMap = res.importMap || options.importMap, imports: string[] = []
        for (let k in importMap) {
            if (importMap.hasOwnProperty(k)) {
                imports.push(k);
            }
        }
        const separator = "-------------------------------------------------------------------------------"
        console.log(separator);
        console.log("imports: ", imports.join(", "));
        console.log("template: " + res.function);
        console.log(separator);
    }
    return res;
}

function generate(tf: XjsTplFunction, template: string, options: CompilationOptions) {
    let body: BodyContent[] = []; // parts composing the function body (generated strings + included expressions/statements)

    return generateAll();

    function generateAll() {
        let gc = new GenerationCtxt(template, options), args = tf.arguments;
        if (args) {
            for (let i = 0; args.length > i; i++) {
                gc.templateArgs.push(args[i].name);
            }
        }

        const root = new ViewInstruction("template", tf, 1, null, 0, gc, tf.indent);
        root.scan();
        root.pushCode(body);

        let res: CompilationResult = {};
        if (options.function || options.body) {
            res.body = generateBody();
        }
        if (options.statics) {
            res.statics = gc.statics;
        }
        if (options.function) {
            res.function = templateStart(tf.indent, tf, gc) + res.body + templateEnd(tf);
        }
        if (options.imports) {
            res.importMap = gc.imports;
        }
        return res;
    }

    function generateBody(): string {
        let parts: string[] = [];
        for (let part of body) {
            if (typeof part === 'string') {
                parts.push(part);
            } else if (part.kind === "#expression" || part.kind === "#jsStatement") {
                parts.push(part.code);
            } else if (part.kind === "#jsBlock") {
                parts.push(part.startCode.replace(RX_START_CR, ""));
            }
        }

        return "\n" + parts.join("") + reduceIndent(tf.indent);
    }
}

function reduceIndent(indent: string) {
    if (indent.length > 3) {
        return indent.slice(0, -4);
    }
    return indent;
}

export class GenerationCtxt {
    indentIncrement = "    ";
    templateName = "";
    filePath = "";
    imports: { [key: string]: 1 };      // map of required imports
    statics: string[] = [];             // list of static resources
    localVars = {};                     // map of creation mode vars
    blockCount = 0;                     // number of js blocks - used to increment block variable suffixes
    eachCount = 0;                      // number of $each blocks
    templateArgs: string[] = [];        // name of template arguments
    paramCounter = 0;                   // counter used to create param instance variables
    acceptPreProcessors = false;

    constructor(public template: string, public options: CompilationOptions) {
        this.imports = options.importMap || {};
        this.templateName = options.templateName.replace(RX_DOUBLE_QUOTE, "");
        this.filePath = options.filePath.replace(RX_DOUBLE_QUOTE, "");
    }

    error(msg: string, nd: XjsNode) {
        let fileInfo = this.options.filePath || "",
            lineOffset = this.options.lineOffset || 0,
            colOffset = this.options.columnOffset || 0;

        validator.throwError(`Invalid ${validator.nodeName(nd.kind)} - ${msg}`, nd.pos, this.template, fileInfo, "IVY", lineOffset, colOffset)
    }

    decreaseIndent(indent: string) {
        let incLength = this.indentIncrement.length;
        if (indent.length > incLength) {
            return indent.substring(0, indent.length - incLength);
        } else {
            return indent;
        }
    }
}

enum ContainerType {
    Block = 1,
    Component = 2,
    Async = 3
}

function encodeText(t: string) {
    // todo replace double \\ with single \
    return '"' + t.replace(RX_DOUBLE_QUOTE, '\\"').replace(RX_CR, "\\n") + '"';
}



function templateStart(indent: string, tf: XjsTplFunction, gc: GenerationCtxt) {
    let lines: string[] = [], argNames = "", classDef = "", args = tf.arguments, argClassName = "", argInit: string[] = [], argType: string, ctlClass = "", injectTpl = false;
    indent = reduceIndent(indent);

    function addImport(symbol: string) {
        gc.imports[symbol] = 1;
    }

    if (args && args.length) {
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

    tf[MD_PARAM_CLASS] = argClassName;
    lines.push('(function () {');
    if (gc.statics.length) {
        lines.push(`${indent}const ${gc.statics.join(", ")};`);
    }
    if (classDef) {
        lines.push(classDef);
    }
    gc.imports["ζt"] = 1;
    if (ctlClass || injectTpl) {
        if (injectTpl) {
            argNames += ", $template";
        }
    }
    lines.push(`${indent}return ζt("${gc.templateName}", "${gc.filePath}", ζs0, function (ζ${argNames}) {`);
    if (argInit.length) {
        lines.push(`${indent + gc.indentIncrement}let ${argInit.join(", ")};`);
    }
    return lines.join("\n");
}

function templateEnd(tf: XjsTplFunction) {
    let argClassName = tf[MD_PARAM_CLASS];
    if (argClassName) {
        return `}, ${argClassName});\n${reduceIndent(tf.indent)}})()`;
    }
    return '});\n' + reduceIndent(tf.indent) + '})()';
}

// ---------------------------------------------------------------------------------

interface RuntimeInstruction {
    pushCode(body: BodyContent[]);
}

type ViewKind = "template" | "cptContent" | "paramContent" | "jsBlock" | "asyncBlock";

export class ViewInstruction implements RuntimeInstruction {
    gc: GenerationCtxt;
    nodeCount = 0;
    instructions: RuntimeInstruction[] = [];
    indent = '';
    prevKind = '';                          // kind of the previous sibling
    nextKind = '';                          // kind of the next sibling
    instanceCounterVar = '';                // e.g. ζi2 -> used to count sub-block instances
    blockIdx = 0;
    jsVarName = "ζ";                        // block variable name - e.g. ζ or ζ1
    cmVarName = "ζc";                       // creation mode var name - e.g. ζc or ζc1
    childBlockCreated: boolean[] = [];      // used to know if a block container has already been created
    childBlockIndexes: number[] = [];
    childViewIndexes: number[] = [];
    exprCount = 0;                          // binding expressions count
    expr1Count = 0;                         // one-time expressions count
    dExpressions: number[] = [];            // list of counters for deferred expressions (cf. ζexp)
    hasChildNodes = false;                  // true if the view has Child nodes
    hasParamNodes = false;
    asyncValue: number | XjsExpression = 0; // async priority
    cptIFlag: number = -1;                  // iFlag of the component associated with this view
    cpnParentLevel: number = -1;            // component or pnode parent level
    contentParentInstruction: CptInstruction | PndInstruction | undefined; // only defined for kind="cptContent" or "paramContent"
    paramInstanceVars: { [paramName: string]: string } | undefined = undefined;    // map of the param node instance variables
    bindingsCount = 0;                      // counter used by ParamInstruction to count the number of bindings on a component / decorator

    constructor(public kind: ViewKind, public node: XjsTplFunction | XjsJsBlock | XjsElement | XjsFragment | XjsComponent, public idx: number, public parentView: ViewInstruction | null, public iFlag: number, generationCtxt?: GenerationCtxt, indent?: string) {
        if (parentView) {
            this.gc = parentView.gc;
            this.blockIdx = this.gc.blockCount++;
            if (this.kind === "cptContent" || this.kind === "paramContent") {
                // no instance var, no indent
                this.indent = parentView.indent;
                this.instanceCounterVar = '';
            } else if (this.kind === "asyncBlock") {
                this.gc.imports['ζasync'] = 1;
                this.indent = parentView.indent + this.gc.indentIncrement;
                this.instanceCounterVar = '';
            } else if (this.kind === "jsBlock") {
                this.indent = parentView.indent + this.gc.indentIncrement;
                this.instanceCounterVar = 'ζi' + this.blockIdx;
                this.gc.localVars[`${this.instanceCounterVar} = 0`] = 1;
                parentView.childViewIndexes.push(this.blockIdx); // used to reset instanceVar counters
            }
        } else if (generationCtxt) {
            this.indent = indent || '';
            this.gc = generationCtxt;
            this.blockIdx = this.gc.blockCount++;
            this.gc.imports['ζinit'] = 1;
            this.gc.imports['ζend'] = 1;
            this.gc.statics[0] = "ζs0 = {}"; // static object to hold cached values
        } else {
            throw new Error("ViewInstruction: either parentBlock or generationCtxt must be provided");
        }
        if (this.blockIdx > 0) {
            this.jsVarName = "ζ" + this.blockIdx;
            this.cmVarName = "ζc" + this.blockIdx;
        }

        if (this.blockIdx > 0) {
            // root block (idx 1) is passed as function argument
            this.gc.localVars[this.jsVarName] = 1;
            this.gc.localVars[this.cmVarName] = 1;
        }
    }

    scan() {
        if (this.kind === "asyncBlock") {
            this.generateInstruction([(this.node as any)], 0, 0, this.iFlag, this.prevKind, this.nextKind);
        } else {
            let content = this.node.content, len = content ? content.length : 0, nd: XjsContentNode;
            if (len === 0) return;

            let pLevel = 0;
            // creation mode
            if (len > 1) {
                // need container fragment if child nodes are not pnodes nor statements
                let count = 0, ch: XjsContentNode;
                for (let i = 0; len > i; i++) {
                    ch = content![i];
                    if (ch.kind !== "#jsStatement" && ch.kind !== "#paramNode") {
                        count++;
                        if (count > 1) break;
                    }
                }
                if (count > 1) {
                    this.nodeCount = 1;
                    this.instructions.push(new FraInstruction(null, 0, this, this.iFlag, pLevel));
                    FraInstruction
                    pLevel = 1;
                }
            }

            this.scanContent(content, pLevel, this.iFlag);
        }
        if (this.parentView && this.hasChildNodes) {
            this.gc.imports['ζview' + getIhSuffix(this.iFlag)] = 1;
            this.gc.imports['ζend' + getIhSuffix(this.iFlag)] = 1;
        }
    }

    scanContent(content: XjsContentNode[] | undefined, parentLevel: number, iFlag: number) {
        let pKind = "", nKind = "", len = content ? content.length : 0;
        for (let i = 0; len > i; i++) {
            nKind = (i < len - 1) ? content![i + 1].kind : "";
            this.generateInstruction(content!, i, parentLevel, iFlag, pKind, nKind);
            pKind = content![i].kind;
        }
    }

    generateInstruction(siblings: XjsContentNode[], siblingIdx: number, parentLevel: number, iFlag: number, prevKind: string, nextKind: string) {
        let nd: XjsContentNode = siblings[siblingIdx], idx = this.nodeCount;
        if (nd.kind !== "#jsStatement" && nd.kind !== "#paramNode") {
            this.nodeCount++;
            this.hasChildNodes = true;
        }
        validator.validateXjsNode(nd, this.gc);

        let stParams = "", i1 = -1, i2 = -1, containsParamExprOrDecorators = false;
        if (nd.kind === "#element" || nd.kind === "#component" || nd.kind === "#paramNode") {
            [i1, i2, containsParamExprOrDecorators] = this.registerStatics(nd.params);
            if (i1 > -1 && i2 > -1) {
                stParams = `, ζs${i1}, ζs${i2}`;
            } else if (i1 > -1) {
                stParams = `, ζs${i1}`;
            } else if (i2 > -1) {
                stParams = `, 0, ζs${i2}`;
            }
        }

        let xmlns = "";

        switch (nd.kind) {
            case "#textNode":
            case "#cdata":
                this.instructions.push(new TxtInstruction(nd as XjsText | XjsCData, idx, this, iFlag, parentLevel, "0"));
                break;
            case "#fragment":
                if (!this.processAsyncCase(nd as XjsFragment, idx, parentLevel, prevKind, nextKind)) {
                    xmlns = this.retrieveXmlNs(nd as XjsFragment);
                    if (xmlns) {
                        this.instructions.push(new XmlNsInstruction(this, iFlag, true, xmlns));
                    }
                    this.instructions.push(new FraInstruction(nd, idx, this, iFlag, parentLevel));
                    const dis = this.generateDecoratorInstructions(nd, idx, iFlag);
                    processContent(this, nd.content);
                    processDecoInstructions(this, dis);
                }
                break;
            case "#element":
                if (!this.processAsyncCase(nd as XjsElement, idx, parentLevel, prevKind, nextKind)) {
                    xmlns = this.retrieveXmlNs(nd as XjsElement);
                    if (xmlns) {
                        this.instructions.push(new XmlNsInstruction(this, iFlag, true, xmlns));
                    }
                    this.instructions.push(new EltInstruction(nd as XjsElement, idx, this, iFlag, parentLevel, this.generateLabelStatics(nd as XjsElement), stParams));
                    this.generateParamInstructions(nd as XjsElement, idx, iFlag, true, this);
                    this.generateDynLabelInstructions(nd as XjsElement, idx, iFlag, this);
                    const dis = this.generateDecoratorInstructions(nd as XjsElement, idx, iFlag);
                    this.createListeners(nd as XjsElement, idx, iFlag, this);
                    processContent(this, nd.content);
                    processDecoInstructions(this, dis);
                }
                break;
            case "#component":
                if (!this.processAsyncCase(nd as XjsElement, idx, parentLevel, prevKind, nextKind)) {
                    // create a container block
                    let callImmediately = !containsParamExprOrDecorators && (!nd.content || !nd.content.length);
                    let ci = new CptInstruction(nd as XjsComponent, idx, this, iFlag, parentLevel, this.generateLabelStatics(nd as XjsComponent), callImmediately, i1)
                    this.instructions.push(ci);
                    if (containsParamExprOrDecorators) {
                        this.generateParamInstructions(nd as XjsComponent, idx, iFlag, false, this);
                    }
                    const dis = this.generateDecoratorInstructions(nd, idx, iFlag, false, true);
                    this.generateDynLabelInstructions(nd as XjsComponent, idx, iFlag, this);
                    if (nd.content && nd.content.length) {
                        let vi = new ViewInstruction("cptContent", nd as XjsComponent, idx, this, 1);
                        vi.contentParentInstruction = ci;
                        vi.cptIFlag = iFlag; // used by sub param Nodes to have the same value
                        vi.cpnParentLevel = parentLevel;
                        this.instructions.push(vi);
                        this.hasParamNodes = false;
                        vi.scan(); // will update this.hasParamNodes
                        if (!vi.hasChildNodes && !this.hasParamNodes) {
                            ci.callImmediately = callImmediately = true;
                        }
                        this.hasParamNodes = false;
                    }
                    if (this.createListeners(nd as XjsComponent, idx, iFlag, this)) {
                        ci.callImmediately = callImmediately = false;
                    }
                    if (!callImmediately) {
                        this.instructions.push(new CallInstruction(idx, this, iFlag, ci));
                    }
                    processDecoInstructions(this, dis);
                }
                break;
            case "#paramNode":
                // e.g. ζpnode(ζ, 3, 1, 0, "header");
                // logic close to #component

                // pickup the closest parent view that is not a js block
                if (!this.parentView) {
                    this.gc.error("Param nodes cannot be defined at root level", nd); // TODO: this could change
                }
                let v: ViewInstruction = this, cptIFlag = 0, cpnParentLevel = 0, name = (nd as XjsParamNode).name;
                while (v) {
                    if (v.cptIFlag > -1) {
                        cptIFlag = v.cptIFlag;
                    }
                    if (v.cpnParentLevel > -1) {
                        cpnParentLevel = v.cpnParentLevel;
                    }
                    if (v.kind === "asyncBlock") {
                        this.gc.error("Param nodes cannot be defined in @async blocks", nd);
                    } else if (v.kind === "jsBlock") {
                        v = v.parentView!;
                    } else if (v.kind === "cptContent" || v.kind === "paramContent") {
                        v = v.parentView!;
                        break;
                    } else if (v.kind === "template") {
                        break;
                    } else {
                        this.gc.error("Param nodes cannot be defined in " + v.kind + " views", nd);
                    }
                }
                let newIdx = v.nodeCount++;
                v.hasParamNodes = true;

                let v2: ViewInstruction | null = this, inJsBlock = false, contentParentView: ViewInstruction | null = null;
                while (v2) {
                    if (v2.kind === "jsBlock") {
                        inJsBlock = true;
                        v2 = v2.parentView;
                    } else if (v2.kind === "cptContent" || v2.kind === "paramContent") {
                        contentParentView = v2;
                        break;
                    } else {
                        break;
                    }
                }
                // add param name to contentParentInstruction.dynamicPNodeNames if in Js block
                if (!contentParentView) {
                    this.gc.error("Internal error: contentParentView should be defined", nd);
                }
                if (inJsBlock) {
                    let names = contentParentView!.contentParentInstruction!.dynamicPNodeNames;
                    if (names.indexOf(name) < 0) {
                        names.push(name);
                    }
                }
                if (!v.paramInstanceVars) {
                    v.paramInstanceVars = {};
                }
                let instanceVarName: string = v.paramInstanceVars[name];
                if (!instanceVarName) {
                    instanceVarName = 'ζp' + this.gc.paramCounter++;

                    this.gc.localVars[`${instanceVarName}`] = 1;
                    v.paramInstanceVars[name] = instanceVarName;
                }
                let parentIdx = contentParentView!.contentParentInstruction!.idx,
                    hasContent = nd.content !== undefined && nd.content.length > 0,
                    pi = new PndInstruction(nd as XjsParamNode, newIdx, v, cptIFlag, cpnParentLevel + 1, "0", i1, this.indent, parentIdx, instanceVarName, hasContent);
                this.instructions.push(pi);
                this.generateParamInstructions(nd as XjsParamNode, newIdx, cptIFlag, false, v);
                this.createListeners(nd as XjsParamNode, newIdx, cptIFlag, v);

                if (hasContent) {
                    let vi = new ViewInstruction("paramContent", nd as XjsParamNode, newIdx, v, 1);
                    vi.indent = this.indent;
                    vi.contentParentInstruction = pi;
                    vi.cpnParentLevel = cpnParentLevel + 1;
                    this.instructions.push(vi);
                    vi.scan();
                    this.instructions.push(new PndEndInstruction(nd as XjsParamNode, newIdx, v, cptIFlag, this.indent, pi));
                }
                break;
            case "#jsStatement":
                this.instructions.push(new JsStatementsInstruction(nd, this, iFlag, prevKind));
                break;
            case "#jsBlock":
                if (!this.childBlockCreated[idx]) {
                    // create all adjacent block containers at once
                    let siblingNd: XjsContentNode, count = 0;
                    for (let i = siblingIdx; siblings.length > i; i++) {
                        siblingNd = siblings[i];
                        if (siblingNd.kind === "#jsBlock") {
                            this.instructions.push(new CntInstruction(idx + count, this, this.iFlag, parentLevel, ContainerType.Block));
                            this.childBlockCreated[idx + count] = true;
                        } else {
                            break;
                        }
                        count++;
                    }
                }
                this.childBlockIndexes.push(idx);
                let jsb = new ViewInstruction("jsBlock", nd, idx, this, this.iFlag ? this.iFlag + 1 : 0);
                jsb.prevKind = prevKind;
                jsb.nextKind = nextKind;
                this.instructions.push(jsb);
                jsb.scan();
                break;
            case "#tplFunction":
                this.gc.error("$template statements are not supported yet", nd);
                break;
        }

        function processContent(vi: ViewInstruction, content?: XjsContentNode[]) {
            if (content) {
                vi.scanContent(content, parentLevel + 1, iFlag);
                if (xmlns) {
                    vi.instructions.push(new XmlNsInstruction(vi, iFlag, false, xmlns));
                }
            }
        }

        function processDecoInstructions(vi: ViewInstruction, dis?: DecoInstruction[]) {
            if (dis) {
                for (let i = 0; dis.length > i; i++) {
                    vi.instructions.push(new DecoCallInstruction(dis[i]));
                }
            }
        }
    }

    retrieveXmlNs(nd: XjsElement | XjsFragment) {
        let xmlns = "", params = nd.params;
        if (params && params.length) {
            for (let p of params) {
                if (p.kind === "#param" && p.name === XMLNS) {
                    if (xmlns) {
                        this.gc.error("xmlns cannot be defined twice", p);
                    } else {
                        if (p.value === U || typeof p.value !== "string") {
                            this.gc.error("xmlns value must be a string", p);
                        } else {
                            if (p.isOrphan || p.value === U) {
                                this.gc.error("xmlns value cannot be empty", p);
                            }
                            xmlns = p.value;
                        }
                    }
                } else if (p.kind === "#decorator") {
                    if (p.ref.code === XMLNS) {
                        if (xmlns) {
                            this.gc.error("xmlns cannot be defined twice", p);
                        } else {
                            if (p.defaultPropValue === U || typeof p.defaultPropValue !== "string") {
                                this.gc.error("@xmlns value must be a string", p);
                            } else {
                                let v = p.defaultPropValue;
                                if (XMLNS_VALUES[v]) {
                                    xmlns = XMLNS_VALUES[v];
                                } else {
                                    this.gc.error('Invalid @xmlns value: must be "html", "xhtml", "svg" or "mathml"', p);
                                }
                            }
                        }
                    }
                }
            }
        }
        if (xmlns === "" && nd.kind === "#element" && (nd as XjsElement).name.toLowerCase() === SVG) {
            xmlns = XMLNS_VALUES[SVG];
        }
        return xmlns;
    }

    registerStatics(params: XjsNodeParam[] | undefined): [number, number, boolean] {
        // return the index of the static resources for params and properties or -1 if none
        // 3rd param is true if dynamic expressions or decorators are found
        if (!params || !params.length) return [-1, -1, false];
        let v: number | boolean | string | XjsExpression | undefined,
            sParamIdx = -1,
            paramVal: string[] | undefined = U,
            sPropIdx = -1,
            propVal: string[] | undefined = U,
            p: XjsNodeParam,
            sVal = "",
            containsExprOrDeco = false,
            statics = this.gc.statics,
            nextStaticIdx = statics.length;
        for (let i = 0; params.length > i; i++) {
            p = params[i];
            sVal = "";
            if (p.kind === "#param" || p.kind === "#property") {
                v = p.value;
                if ((p as XjsParam).isOrphan) {
                    sVal = "true";
                } else if (typeof v === "object") {
                    containsExprOrDeco = true;
                } else if (typeof v === "string") {
                    sVal = encodeText(v);
                } else {
                    sVal = "" + v;
                }

                if (sVal) {
                    if (p.kind === "#param") {
                        paramVal = paramVal || [];
                        sParamIdx = addParam(p.name, sVal, sParamIdx, paramVal);
                    } else {
                        // prop
                        propVal = propVal || [];
                        sPropIdx = addParam(p.name, sVal, sPropIdx, propVal);
                    }
                }
            } else if (p.kind === "#decorator" || p.kind === "#decoratorNode") {
                containsExprOrDeco = true;
            }

        }

        appendStatics(sParamIdx, paramVal);
        appendStatics(sPropIdx, propVal);
        return [sParamIdx, sPropIdx, containsExprOrDeco];

        function addParam(name: string, sVal: string, staticIdx: number, staticArray: string[]): number {
            if (staticIdx < 0) {
                staticIdx = nextStaticIdx;
                nextStaticIdx++;
            }
            staticArray.push(encodeText(name));
            staticArray.push(sVal);
            return staticIdx;
        }

        function appendStatics(staticIdx: number, staticArray?: string[]) {
            if (staticArray) {
                statics[staticIdx] = "ζs" + staticIdx + " = [" + staticArray!.join(", ") + "]";
            }
        }
    }

    /**
     * Parse the XJS node to look for labels - e.g. #foo or #bar[] or #baz[{expr()}]
     * @param nd 
     */
    generateLabelStatics(nd: XjsElement | XjsComponent | XjsDecorator): string {
        if (nd.params === U) return "0";
        const values: any[] = [];
        for (let lbl of nd.params) if (lbl.kind === "#label") {
            if (lbl.isOrphan) {
                values.push(encodeText("#" + lbl.name));
            }
        }
        if (!values.length) return "0"; // no static labels
        const statics = this.gc.statics, sIdx = statics.length;
        statics[sIdx] = "ζs" + sIdx + " = [" + values!.join(", ") + "]";
        return "ζs" + sIdx;
    }

    generateParamInstructions(nd: XjsFragment | XjsDecorator, idx: number, iFlag: number, isAttribute: boolean, view: ViewInstruction) {
        // dynamic params / attributes
        const params = nd.params;
        if (params === U) return;
        const isParamNode = nd.kind === "#paramNode";
        for (let p of params) {
            if (p.kind === "#param" || p.kind === "#property") {
                if (p.value && (p.value as XjsExpression).kind === "#expression") {
                    this.instructions.push(new ParamInstruction(p, idx, view, iFlag, isAttribute, this.indent, isParamNode));
                }
            } else if (isParamNode && p.kind === "#decorator") {
                let d = p as XjsDecorator;
                if (d.ref.code === PARAM_VALUE) {
                    this.instructions.push(new ParamInstruction(d, idx, view, iFlag, false, this.indent, true));
                }
            }
        }
    }

    generateDynLabelInstructions(nd: XjsFragment | XjsComponent | XjsDecorator, idx: number, iFlag: number, view: ViewInstruction) {
        // dynamic labels
        if (nd.params !== U) {
            for (let lbl of nd.params) if (lbl.kind === "#label") {
                if (!lbl.isOrphan && lbl.value) {
                    if (!lbl.fwdLabel) {
                        this.instructions.push(new LblInstruction(lbl, idx, view, iFlag, this.indent));
                    }
                }
            }
        }
    }

    processAsyncCase(nd: XjsElement | XjsFragment, idx: number, parentLevel: number, prevKind: string, nextKind: string): boolean {
        // // generate async block if @async decorator is used
        let asyncValue: number | XjsExpression = 0;

        if (nd === this.node) {
            return false; // we are in the async block for this node
        }

        // determine if an async decorator is used
        if (nd.params) {
            for (let d of nd.params) if (d.kind === "#decorator") {
                if (d.ref.code === ASYNC) {
                    if (!d.hasDefaultPropValue) {
                        if (d.params) {
                            this.gc.error("Async decorator doesn't accept multiple params", d);
                        }
                        asyncValue = 1;
                        break;
                    } else {
                        let dv = d.defaultPropValue!;
                        // value can be number or expression
                        if (typeof dv === "object") {
                            asyncValue = dv as XjsExpression;
                        } else if (typeof dv === "number") {
                            asyncValue = dv;
                        } else {
                            this.gc.error("@async value must be either empty or a number or an expression", d);
                        }
                    }
                }
            }
        }

        if (asyncValue) {
            // create an async container
            this.instructions.push(new CntInstruction(idx, this, this.iFlag, parentLevel, ContainerType.Async));
            let av = new ViewInstruction("asyncBlock", nd, idx, this, this.iFlag ? this.iFlag + 1 : 0);
            av.setAsync(asyncValue);
            av.prevKind = prevKind;
            av.nextKind = nextKind;
            this.instructions.push(av);
            av.scan();
            return true
        }
        return false;
    }

    setAsync(asyncValue: number | XjsExpression) {
        this.asyncValue = asyncValue;
    }

    generateDecoratorInstructions(
        nd: XjsComponent | XjsElement | XjsFragment,
        idx: number,
        iFlag: number,
        includeBuiltIn = true,
        includeCustomDecorators = true): DecoInstruction[] | undefined {
        let result: DecoInstruction[] | undefined = undefined;
        if (nd.params !== U) {
            let kind = nd.kind, decoRef = "";
            for (let p of nd.params) if (p.kind === "#decorator") {
                decoRef = p.ref ? p.ref.code : "";
                if (decoRef === "content") {
                    if (includeBuiltIn) {
                        // @content
                        if (kind === "#element" || kind === "#fragment") {
                            this.instructions.push(new InsInstruction(p, nd as XjsElement | XjsFragment, idx, this, iFlag));
                        }
                    }
                } else if (decoRef === "async" || decoRef === "key" || decoRef === PARAM_VALUE || decoRef === "xmlns" || decoRef.match(RX_EVT_HANDLER_DECORATOR)) {
                    // built-in decorators: @async, @key, @onXXX, @xmlns, @paramValue
                    continue;
                } else if (includeCustomDecorators) {
                    // custom decorator
                    let sIdx = -1, sIdx2 = -1, containsParamExpr = false;
                    [sIdx, sIdx2, containsParamExpr] = this.registerStatics(p.params);
                    let decoIdx = this.nodeCount++,
                        decoInstr = new DecoInstruction(p, decoIdx, idx, this, iFlag, this.indent, sIdx, this.generateLabelStatics(p));
                    this.instructions.push(decoInstr);
                    if (containsParamExpr) {
                        this.generateParamInstructions(p, decoIdx, iFlag, false, this);
                    }
                    this.generateDynLabelInstructions(p, decoIdx, iFlag, this);
                    this.createListeners(p, decoIdx, iFlag, this);
                    if (!result) {
                        result = [decoInstr];
                    } else {
                        result.push(decoInstr);
                    }
                }
            }
        }
        return result;
    }

    // return true if some listeners have been created
    createListeners(nd: XjsElement | XjsComponent | XjsParamNode | XjsDecorator, parentIdx: number, iFlag: number, view: ViewInstruction): boolean {
        if (nd.params === U) return false;
        let name: string, result = false;
        for (let p of nd.params) if (p.kind === "#decorator") {
            name = p.ref.code;
            if (name.match(RX_EVT_HANDLER_DECORATOR)) {
                this.instructions.push(new EvtInstruction(p, RegExp.$1, view.nodeCount++, parentIdx, view, iFlag));
                result = true;
            }
        }
        return result;
    }

    pushCode(body: BodyContent[]) {
        // e.g. 
        // let ζc = ζinit(ζ, ζs0, 3);
        // ...
        // ζend(ζ);

        let isJsBlock = this.node.kind === "#jsBlock";
        if (isJsBlock) {
            let nd = this.node as XjsJsBlock;
            if (nd.name === "$each") {
                const args = nd.args!;

                // start - e.g.
                // let ζec1=items,ζl1=ζec1.length; // ec = each collection
                // for (let ζx1=0;ζl1>ζx1;ζx1++) {
                //     let item=ζec1[ζx1];
                let name: string;
                if (Array.isArray(args[0])) {
                    name = args[0].join(".");
                } else {
                    name = args[0];
                }
                const idx = ++this.gc.eachCount,
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
                nd.startCode = p1 + p2 + p3 + p4 + p5 + ";";

                // end
                nd.endCode = "}";
            }
            body.push(this.gc.decreaseIndent(this.indent));
            body.push(nd);
            if (!nd.startCode.match(/\n$/)) {
                body.push("\n");
            }
        } else if (this.kind === "asyncBlock") {
            // async block
            let p = this.parentView!;
            body.push(this.gc.decreaseIndent(this.indent));
            // body.push((this.prevKind !== "#jsBlock" && this.prevKind !== "#jsStatement") ? this.gc.decreaseIndent(this.indent) : " ");
            body.push(`${funcStart("async", this.iFlag)}${p.jsVarName}, ${this.iFlag}, ${this.idx}, `);
            if (typeof this.asyncValue === 'number') {
                body.push('' + this.asyncValue);
            } else {
                generateExpression(body, this.asyncValue as XjsExpression, p!, this.iFlag);
            }
            body.push(`, function () {\n`);
        }

        if (this.instructions.length) {
            let endArg = "";
            if (this.childBlockIndexes.length) {
                // block indexes need to be passed to the end statement
                let statics = this.gc.statics, csIdx = statics.length;
                statics.push("ζs" + csIdx + " = [" + this.childBlockIndexes.join(", ") + "]");
                endArg = ", ζs" + csIdx;
            }

            if (this.hasChildNodes) {
                let lastArgs = "", parentViewVarName = "ζ";
                if (!this.parentView) {
                    // root block: insert local variables
                    let arr: string[] = [], localVars = this.gc.localVars;
                    for (let k in localVars) if (localVars.hasOwnProperty(k)) {
                        arr.push(k);
                    }
                    arr.push(`ζc = ζinit(ζ, ζs0, ${this.nodeCount})`)
                    if (arr.length) {
                        body.push(`${this.indent}let ${arr.join(", ")};\n`);
                    }
                } else {
                    if (this.childViewIndexes.length) {
                        // reset child view indexes
                        body.push(`${this.indent}ζi${this.childViewIndexes.join(" = ζi")} = 0;\n`);
                    }
                    parentViewVarName = this.parentView.jsVarName;
                    lastArgs = this.instanceCounterVar ? ", ++" + this.instanceCounterVar : ", 0";
                }
                if (this.blockIdx > 0) {
                    // root block is initialized with ζinit
                    body.push(`${this.indent}${this.jsVarName} = ${funcStart("view", this.iFlag)}${parentViewVarName}, ${this.iFlag}, ${this.idx}, ${this.nodeCount}${lastArgs});\n`);
                    body.push(`${this.indent}${this.cmVarName} = ${this.jsVarName}.cm;\n`);

                }
            }
            if (this.paramInstanceVars !== undefined) {
                // reset the parameter instance counters
                let arr: string[] = [];
                for (let k in this.paramInstanceVars) {
                    if (this.paramInstanceVars.hasOwnProperty(k)) {
                        arr.push(this.paramInstanceVars[k]);
                    }
                }
                body.push(`${this.indent}${arr.join(" = ")} = 0;\n`);
            }

            for (let ins of this.instructions) {
                ins.pushCode(body);
            }

            if (this.hasChildNodes) {
                body.push(`${this.indent}${funcStart("end", this.iFlag)}${this.jsVarName}, ${this.cmVarName}${endArg});\n`);
            }
        }

        if (isJsBlock) {
            let nd = this.node as XjsJsBlock;
            body.push(this.gc.decreaseIndent(this.indent));
            body.push(nd.endCode);
            if (!nd.endCode.match(/\n$/)) {
                body.push("\n");
            }
        } else if (this.kind === "asyncBlock") {
            // end of async function
            body.push(`${this.parentView!.indent}});\n`);
        }
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

function getIhSuffix(iFlag) {
    return iFlag ? "D" : "";
}

class TxtInstruction implements RuntimeInstruction {
    isStatic = true;            // true when the text doesn't contain expressions
    isTextNode = true;
    staticsExpr: string = '""'; // '" static string "' or "ζs1"

    constructor(public node: XjsText | XjsCData, public idx: number, public view: ViewInstruction, public iFlag: number, public parentLevel: number, public staticLabels: string) {
        this.view.gc.imports['ζtxt' + getIhSuffix(iFlag)] = 1;

        if (node.kind === "#cdata") {
            this.staticsExpr = encodeText(node.text);
            this.isTextNode = false;
        } else {
            let eLength = node.expressions ? node.expressions.length : 0;
            if (node.textFragments.length <= 1 && eLength === 0) {
                // static version
                this.staticsExpr = encodeText(node.textFragments[0]);

            } else {
                this.isStatic = false;

                // create static resource
                let gc = this.view.gc, staticsIdx = gc.statics.length, pieces: string[] = [], fLength = node.textFragments.length, eCount = 0;
                for (let i = 0; fLength > i; i++) {
                    // todo eLength
                    pieces.push(encodeText(node.textFragments[i]));
                    if (eCount < eLength) {
                        pieces.push('""');
                        eCount++;
                    }
                }
                gc.statics.push("ζs" + staticsIdx + " = [" + pieces.join(", ") + "]");
                this.staticsExpr = 'ζs' + staticsIdx;
            }
        }
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζtxt(ζ1, ζc1, 0, 2, 1, ζs0, 1, ζe(ζ, 0, 1, name));
        let v = this.view, eLength = 0, n: XjsText | undefined;
        if (this.isTextNode) {
            n = this.node as XjsText;
            eLength = n!.expressions ? n!.expressions.length : 0;
        }

        body.push(`${v.indent}${funcStart("txt", this.iFlag)}${v.jsVarName}, ${v.cmVarName}, ${this.iFlag}, ${this.idx}, ${this.parentLevel}, ${this.staticLabels}, ${this.staticsExpr}, ${eLength}`);
        if (this.isTextNode) {
            for (let i = 0; eLength > i; i++) {
                body.push(', ');
                generateExpression(body, n!.expressions![i], this.view, this.iFlag);
            }
        }
        body.push(');\n');
    }
}

function funcStart(name: string, iFlag: number) {
    if (!iFlag) {
        return "ζ" + name + "(";
    } else {
        return "ζ" + name + "D(";
    }
}

class XmlNsInstruction implements RuntimeInstruction {
    constructor(public view: ViewInstruction, public iFlag: number, public startInstruction: boolean, public xmlns: string) {
        this.view.gc.imports['ζxmlns' + getIhSuffix(iFlag)] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζxmlns
        let v = this.view, lastArg = "";
        if (this.startInstruction) {
            lastArg = ', "' + this.xmlns + '"';
        }
        body.push(`${v.indent}${funcStart("xmlns", this.iFlag)}${v.jsVarName}, ${this.iFlag}${lastArg});\n`);
    }
}

class EltInstruction implements RuntimeInstruction {
    constructor(public node: XjsElement, public idx: number, public view: ViewInstruction, public iFlag: number, public parentLevel: number, public staticLabels: string, public staticArgs: string) {
        this.view.gc.imports['ζelt' + getIhSuffix(iFlag)] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζelt(ζ1, ζc1, 0, 2, 1, "div", 0, ζs0, ζs1);
        let v = this.view;
        let hasChildren = (this.node.content && this.node.content.length) ? 1 : 0,
            lastArgs = (this.staticLabels === "0" && !this.staticArgs) ? "" : ", " + this.staticLabels + this.staticArgs;
        body.push(`${v.indent}${funcStart("elt", this.iFlag)}${v.jsVarName}, ${v.cmVarName}, ${this.idx}, ${this.parentLevel}, "${this.node.name}", ${hasChildren}${lastArgs});\n`);
    }
}

class FraInstruction implements RuntimeInstruction {
    constructor(public node: XjsFragment | null, public idx: number, public view: ViewInstruction, public iFlag: number, public parentLevel: number) {
        let gc = this.view.gc;
        gc.imports['ζfra' + getIhSuffix(iFlag)] = 1;
    }

    pushCode(body: BodyContent[]) {
        let v = this.view;
        body.push(`${v.indent}${funcStart("fra", this.iFlag)}${v.jsVarName}, ${v.cmVarName}, ${this.idx}, ${this.parentLevel});\n`);
    }
}

class ParamInstruction implements RuntimeInstruction {
    funcName: "att" | "par" | "pro";

    constructor(public node: XjsParam | XjsProperty | XjsDecorator, public idx: number, public view: ViewInstruction, public iFlag: number, public isAttribute: boolean, public indent: string, public targetParamNode = false) {
        this.funcName = isAttribute ? "att" : "par"
        if (node && node.kind === "#property") {
            this.funcName = "pro";
        }
        this.view.gc.imports["ζ" + this.funcName + getIhSuffix(iFlag)] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζatt(ζ, 0, 1, "title", ζe(ζ, 0, exp()+123));
        let v = this.view, iSuffix = this.iFlag ? "D" : "", name = "0", generateLastExpressionArg = true;
        if (this.node.kind !== "#decorator") {
            name = '"' + (this.node as XjsParam | XjsProperty).name + '"';
        }
        let val = (this.node as XjsParam).value as XjsExpression;
        if (this.funcName === "par") {
            if (this.node.kind === "#decorator") {
                // @paramValue reserved decorator for param nodes
                let dfp = this.node.defaultPropValue;
                if (dfp) {
                    val = dfp as XjsExpression;
                }
            }
            if (val && val.isBinding) {
                // binding expression - e.g. param={=someData.someProperty}
                generateBinding(body, val.code, this.node, v, this.indent, this.iFlag, this.idx, v.bindingsCount, name);
                v.bindingsCount++;
                generateLastExpressionArg = false;
            } else {
                // par defers from att and pro as it takes the cm argument to raise validation errors
                body.push(`${this.indent}ζpar${iSuffix}(${v.jsVarName}, ${v.cmVarName}, ${this.iFlag ? 1 : 0}, ${this.idx}, ${name}, `);
            }
        } else {
            // attribute or property
            body.push(`${this.indent}ζ${this.funcName}${iSuffix}(${v.jsVarName}, ${this.iFlag ? 1 : 0}, ${this.idx}, ${name}, `);
        }
        if (generateLastExpressionArg) {
            if (this.node.kind === "#decorator") {
                // @paramValue decorator - in this case targetParamNode is true
                let dfp = this.node.defaultPropValue;
                if (dfp) {
                    pushExpressionValue(body, dfp);
                }
            } else if (this.targetParamNode) {
                // we don't use expressions in param nodes as we don't need them (trax objects will do the job)
                // besides expressions need to be re-evaluated when an object has been reset (so expression value cannot be cached)
                body.push(val);
            } else {
                generateExpression(body, val, this.view, this.iFlag);
            }
            body.push(');\n');
        }

    }
}

function generateBinding(body: BodyContent[], expressionCode: string, node: XjsNode, v: ViewInstruction, indent: string, iFlag: number, idx: number, bindingIdx: number, name: string | 0) {
    let iSuffix = iFlag ? "D" : "";
    let { hostExp, propExp, errorMsg } = parseBinding(expressionCode);
    if (errorMsg) {
        v.gc.error(errorMsg, node);
    } else {
        // ζbind(ζ, ζc, 0, 1, "param", someData, "someProperty");
        v.gc.imports["ζbind" + getIhSuffix(iFlag)] = 1;
        body.push(`${indent}ζbind${iSuffix}(${v.jsVarName}, ${v.cmVarName}, ${iFlag ? 1 : 0}, ${idx}, ${bindingIdx}, ${name}, ${hostExp}, ${propExp});\n`);
    }
}

class DecoInstruction implements RuntimeInstruction {
    paramMode: 0 | 1 | 2 = 0; // 0=no params, 1=default param, 2=multiple params

    constructor(public node: XjsDecorator, public idx: number, public parentIdx: number, public view: ViewInstruction, public iFlag: number, public indent: string, public staticsIdx: number, public staticLabels: string) {
        this.view.gc.imports["ζdeco" + getIhSuffix(iFlag)] = 1;

        if (node.defaultPropValue) {
            this.paramMode = 1; // default property value
        } else {
            if (this.node.params !== U) {
                for (let p of this.node.params) if (p.kind === "#param") {
                    this.paramMode = 2;
                    break;
                }
            }
        }
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2);
        let v = this.view, iSuffix = this.iFlag ? "D" : "", dfp = this.node.defaultPropValue, hasStaticLabels = (this.staticLabels !== "0"),
            isDfpBinding = (dfp && (dfp as XjsExpression).kind === "#expression" && (dfp as XjsExpression).isBinding);

        body.push(`${this.indent}ζdeco${iSuffix}(${v.jsVarName}, ${v.cmVarName}, ${this.iFlag ? 1 : 0}, ${this.idx}, ${this.parentIdx}, `);
        body.push(`${encodeText(this.node.ref.code)}, `); // decorator name as string (error handling)

        pushExpressionValue(body, this.node.ref); // decorator reference

        if (isDfpBinding) {
            body.push(", 2"); // we have to consider the default parameter as an explicit parameter in this case
        } else {
            v.bindingsCount = 0; // reset bindings count - cf. ParamInstruction
            body.push(", " + this.paramMode);
        }

        if (!isDfpBinding && (dfp || this.staticsIdx > -1 || hasStaticLabels)) {
            body.push(', ');
            if (dfp) {
                pushExpressionValue(body, dfp);
            } else {
                body.push('0');
            }
            if (this.staticsIdx > -1) {
                body.push(', ζs' + this.staticsIdx);
            } else if (hasStaticLabels) {
                body.push(', 0');
            }
            if (hasStaticLabels) {
                body.push(', ' + this.staticLabels);
            }
        }
        body.push(');\n');

        if (isDfpBinding) {
            // e.g. @deco={=a.b}
            // binding idx is always 0 in this case as there is only one expression
            generateBinding(body, (dfp! as XjsExpression).code, this.node, v, this.indent, this.iFlag, this.idx, 0, 0);

            // let decoCall = new DecoCallInstruction(this);
            // decoCall.pushCode(body);
        }
    }
}

class DecoCallInstruction implements RuntimeInstruction {
    constructor(public di: DecoInstruction) {
        di.view.gc.imports["ζdecoCall" + getIhSuffix(di.iFlag)] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζdecoCall(ζ, ζc, 0, 1);
        let di = this.di, v = di.view, iSuffix = di.iFlag ? "D" : "";

        body.push(`${di.indent}ζdecoCall${iSuffix}(${v.jsVarName}, ${v.cmVarName}, ${di.iFlag ? 1 : 0}, ${di.idx});\n`);
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

class LblInstruction implements RuntimeInstruction {
    constructor(public node: XjsLabel, public idx: number, public view: ViewInstruction, public iFlag: number, public indent: string) {
        this.view.gc.imports["ζlbl" + getIhSuffix(iFlag)] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζlbl(ζ, 0, 0, "divA", expr());
        let v = this.view, iSuffix = this.iFlag ? "D" : "", value = this.node.value!;
        body.push(`${this.indent}ζlbl${iSuffix}(${v.jsVarName}, ${this.iFlag ? 1 : 0}, ${this.idx}, "#${this.node.name}", `);
        pushExpressionValue(body, value);
        body.push(');\n');
    }
}

class JsStatementsInstruction implements RuntimeInstruction {
    constructor(public node: XjsJsStatement, public view: ViewInstruction, public iFlag: number, public prevKind: string) { }

    pushCode(body: BodyContent[]) {
        let v = this.view, nd = this.node;
        if (nd.name === "$log") {
            nd.code = "console." + nd.code;
        }
        body.push(v.indent);
        body.push(nd);
        if (!nd.code.match(/\n$/)) {
            body.push("\n");
        }
    }
}

class CntInstruction implements RuntimeInstruction {
    constructor(public idx: number, public view: ViewInstruction, public iFlag: number, public parentLevel: number, public type: ContainerType) {
        view.gc.imports['ζcnt' + getIhSuffix(iFlag)] = 1;
    }

    pushCode(body: BodyContent[]) {
        let v = this.view;
        body.push(`${v.indent}${funcStart("cnt", this.iFlag)}${v.jsVarName}, ${v.cmVarName}, ${this.idx}, ${this.parentLevel}, ${this.type});\n`);
    }
}

class CptInstruction implements RuntimeInstruction {
    dynamicPNodeNames: string[] = []; // name of child param nodes
    dynamicPNodeRef: string;

    constructor(public node: XjsComponent, public idx: number, public view: ViewInstruction, public iFlag: number, public parentLevel: number, public staticLabels: string, public callImmediately: boolean, public staticParamIdx: number) {
        view.gc.imports['ζcpt' + getIhSuffix(iFlag)] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζcpt(ζ, ζc, 2, 0, ζe(ζ, 0, alert), 1, ζs1);
        let v = this.view, lastArgs = processCptOptionalArgs(this.view, this, this.callImmediately ? this.staticLabels : "0");
        v.bindingsCount = 0; // reset bindings count - cf. ParamInstruction

        body.push(`${v.indent}${funcStart("cpt", this.iFlag)}${v.jsVarName}, ${v.cmVarName}, ${this.iFlag}, ${this.idx}, ${this.parentLevel}, `);
        generateExpression(body, this.node.ref as XjsExpression, this.view, this.iFlag);
        body.push(`, ${this.callImmediately ? 1 : 0}${lastArgs});\n`);
    }
}

class PndInstruction implements RuntimeInstruction {
    dynamicPNodeNames: string[] = []; // name of child param nodes
    dynamicPNodeRef: string;

    constructor(public node: XjsParamNode, public idx: number, public view: ViewInstruction, public iFlag: number, public parentLevel: number, public staticLabels: string, public staticParamIdx: number, public indent: string, public parentIndex: number, public instanceVarName: string, public hasEndInstruction: boolean) {
        view.gc.imports['ζpnode'] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζpnode(ζ, ζc, 2, 0, "header", ζs1);
        let v = this.view, lastArgs = processCptOptionalArgs(this.view, this, this.hasEndInstruction ? "0" : this.staticLabels);
        // unused: ${this.parentLevel}
        body.push(`${this.indent}ζpnode(${v.jsVarName}, ${v.cmVarName}, ${this.iFlag}, ${this.idx}, ${this.parentIndex}, "${this.node.name}", ${this.instanceVarName}++${lastArgs});\n`);
    }
}

class PndEndInstruction implements RuntimeInstruction {
    constructor(public node: XjsParamNode, public idx: number, public view: ViewInstruction, public iFlag: number, public indent: string, public pi: PndInstruction) {
        view.gc.imports['ζpnEnd'] = 1;
    }

    pushCode(body: BodyContent[]) {
        // ζpnEnd(v: IvView, cm: boolean, iFlag: number, idx: number, labels, dynParamNames: string[]) 

        // only create this instruction when there are dynamic parameter nodes
        let v = this.view, lastArg = "";
        if (this.pi.dynamicPNodeRef) {
            lastArg = `, ${this.pi.staticLabels}, ${this.pi.dynamicPNodeRef}`;
        } else if (this.pi.staticLabels !== "0") {
            lastArg = `, ${this.pi.staticLabels}`;
        }

        body.push(`${this.indent}ζpnEnd(${v.jsVarName}, ${v.cmVarName}, ${this.iFlag}, ${this.idx}${lastArg});\n`);
    }
}

function processCptOptionalArgs(view: ViewInstruction, ins: CptInstruction | PndInstruction, staticLabels: string): string {

    if (ins.dynamicPNodeNames && ins.dynamicPNodeNames.length) {
        let idx = view.gc.statics.length;
        for (let i = 0; ins.dynamicPNodeNames.length > i; i++) {
            ins.dynamicPNodeNames[i] = encodeText(ins.dynamicPNodeNames[i]);
        }
        ins.dynamicPNodeRef = "ζs" + idx;
        view.gc.statics[idx] = ins.dynamicPNodeRef + " = [" + ins.dynamicPNodeNames.join(", ") + "]";

        return `, ${staticLabels}, ${(ins.staticParamIdx > -1) ? 'ζs' + ins.staticParamIdx : '0'}, ζs${idx}`;
    } else if (ins.staticParamIdx > -1) {
        return `, ${staticLabels}, ζs${ins.staticParamIdx}`;
    } else if (staticLabels !== "0") {
        return `, ${staticLabels}`;
    }
    return '';
}

class CallInstruction implements RuntimeInstruction {
    constructor(public idx: number, public view: ViewInstruction, public iFlag: number, public ci: CptInstruction) {
        view.gc.imports['ζcall' + getIhSuffix(iFlag)] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζcall(ζ, 2);
        let v = this.view, lastArgs = "";

        if (this.ci.dynamicPNodeRef) {
            lastArgs = `, 0, ${this.ci.staticLabels}, ${this.ci.dynamicPNodeRef}`;
        } else if (this.ci.staticLabels !== "0") {
            lastArgs = `, 0, ${this.ci.staticLabels}`;
        }

        body.push(`${v.indent}${funcStart("call", this.iFlag)}${v.jsVarName}, ${this.idx}${lastArgs});\n`);
    }
}

class EvtInstruction implements RuntimeInstruction {
    constructor(public decorator: XjsDecorator, public name: string, public idx: number, public parentIdx, public view: ViewInstruction, public iFlag: number) {
        view.gc.imports['ζevt' + getIhSuffix(iFlag)] = 1;

        if (!decorator.hasDefaultPropValue && !decorator.params) {
            view.gc.error("Missing event handler value for @" + decorator.ref.code, decorator);
        }
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζevt(ζ, ζc, 1, 0, function (e) {doSomething()});
        let v = this.view, d = this.decorator;

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
            body.push(`${v.indent}${funcStart("evt", this.iFlag)}${v.jsVarName}, ${v.cmVarName}, ${this.idx}, ${this.parentIdx}, "${this.name}", `);
            pushExpressionValue(body, listener);
            body.push(`${passiveArg}${optionsArg});\n`);
        }
    }
}

class InsInstruction implements RuntimeInstruction {
    constructor(public node: XjsDecorator, parent: XjsComponent | XjsElement | XjsFragment, public idx: number, public view: ViewInstruction, public iFlag: number) {
        // manage @content built-in decorator
        let gc = this.view.gc;
        gc.imports['ζins' + getIhSuffix(iFlag)] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζcont(ζ, 2, 0, ζe(ζ, 0, $content));
        let v = this.view, d = this.node, gc = this.view.gc;

        if (d.isOrphan || !d.defaultPropValue) {
            if (gc.templateArgs.indexOf("$") < 0 && gc.templateArgs.indexOf("$content") < 0) {
                gc.error("$ or $content must be defined as template arguments to use @content with no values", d);
            }
        }

        body.push(`${v.indent}${funcStart("ins", this.iFlag)}${v.jsVarName}, ${this.iFlag}, ${this.idx}, `);
        if (d.isOrphan || !d.defaultPropValue) {
            body.push(`$, 1);\n`);
        } else {
            generateExpression(body, this.node.defaultPropValue as XjsExpression, this.view, this.iFlag);
            body.push(`);\n`);
        }

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
