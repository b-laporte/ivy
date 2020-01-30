import { XjsTplFunction, XjsContentNode, XjsExpression, XjsElement, XjsParam, XjsNumber, XjsBoolean, XjsString, XjsProperty, XjsFragment, XjsJsStatements, XjsJsBlock, XjsComponent, XjsParamNode, XjsNode, XjsTplArgument, XjsText, XjsDecorator, XjsLabel } from '../../xjs/types';
import { parse } from '../../xjs/parser';

export interface CompilationOptions {
    templateName: string;
    filePath: string;                   // file name - used for error reporting
    body?: boolean;                     // if true, will output the template function body in the result
    statics?: boolean;                  // if true, the statics array will be in the result
    function?: boolean;                 // if true the js function will be in the result
    imports?: boolean;                  // if true the imports will be added as comment to the js function
    importMap?: { [key: string]: 1 };   // imports as a map to re-use the map from a previous compilation
    lineOffset?: number;                // shift error line count to report the line number of the file instead of the template
    columnOffset?: number;              // shift error column number on the first template line
}

export interface CompilationResult {
    body?: string;                      // template function body
    statics?: any[];                    // statics outside function body
    function?: string;                  // full result function as a string
    importMap?: { [key: string]: 1 },   // imports as a map
}

type BodyContent = string | XjsExpression | XjsJsStatements | XjsJsBlock;

const RX_DOUBLE_QUOTE = /\"/g,
    RX_START_CR = /^\n*/,
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
    MD_PARAM_CLASS = "$apiClassName",
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
        "#eventListener": "event listener",
        "#label": "label"
    },
    CR = "\n";

// Generic validation
const NO = 0,
    YES = 1,
    LATER = 2,
    SOMETIMES = 3,
    VALIDATION_NAMES = {
        "#textNode": "Text nodes",
        "#element": "Element nodes",
        "#component": "Component nodes",
        "#fragment": "Fragment nodes",
        "#paramNode": "Parameter nodes",
        "#decoratorNode": "Decorator nodes",
        "#{element}": "Dynamic element nodes",
        "#{paramNode}": "Dynamic parameter nodes",
        "#param": "Parameters",
        "#property": "Properties",
        "#label": "Labels",
        "##label": "Forward labels",
        "#decorator": "Decorators"
    }, SUPPORTED_NODE_ATTRIBUTES: {
        [type: string]: 2 | {
            "#param": 0 | 1 | 2, "#property": 0 | 1 | 2, "#label": 0 | 1 | 2, "##label": 0 | 1 | 2, "#decorator": 0 | 1 | 2 | 3 | 4, "@onevent": 0 | 1
        }
    } = {
        "#textNode": { "#param": NO, "#property": NO, "#label": YES, "##label": NO, "#decorator": LATER, "@onevent": 0 },
        "#element": { "#param": YES, "#property": YES, "#label": YES, "##label": NO, "#decorator": SOMETIMES, "@onevent": 1 },
        "#component": { "#param": YES, "#property": NO, "#label": YES, "##label": LATER, "#decorator": SOMETIMES, "@onevent": 1 },
        "#fragment": { "#param": NO, "#property": NO, "#label": NO, "##label": NO, "#decorator": SOMETIMES, "@onevent": 0 },
        "#paramNode": { "#param": YES, "#property": NO, "#label": NO, "##label": NO, "#decorator": SOMETIMES, "@onevent": 1 },
        "#decoratorNode": LATER,
        "#{element}": LATER,
        "#{paramNode}": LATER
    }, SUPPORTED_BUILT_IN_DECORATORS = {
        "paramValue": { "#textNode": NO, "#element": NO, "#component": NO, "#fragment": NO, "#paramNode": YES, "#decoratorNode": NO, "#{element}": NO, "#{paramNode}": NO },
        "xmlns": { "#textNode": NO, "#element": YES, "#component": YES, "#fragment": YES, "#paramNode": NO, "#decoratorNode": NO, "#{element}": NO, "#{paramNode}": NO },
        "content": { "#textNode": NO, "#element": YES, "#component": NO, "#fragment": YES, "#paramNode": NO, "#decoratorNode": NO, "#{element}": NO, "#{paramNode}": NO }
        // async
    };

export async function compileTemplate(template: string, options: CompilationOptions): Promise<CompilationResult> {
    options.lineOffset = options.lineOffset || 0;
    let log = false;
    if (template.match(RX_LOG)) {
        log = true;
        template = template.replace(RX_LOG, "");
    }
    let root = await parse(template, options.filePath || "", options.lineOffset || 0, options.columnOffset || 0);
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
    let root: ViewInstruction;

    return generateAll();

    function generateAll() {
        let gc = new GenerationCtxt(template, options), args = tf.arguments;
        if (args) {
            for (let i = 0; args.length > i; i++) {
                gc.templateArgs.push(args[i].name);
            }
        }

        if (tf.content) {
            root = new ViewInstruction("template", tf, 1, null, 0, gc, tf.indent);
            root.scan();
            root.pushCode(body);
        }

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
            } else if (part.kind === "#expression" || part.kind === "#jsStatements") {
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

export interface IvError {
    kind: "#Error";
    origin: "IVY" | "TS";
    message: string;
    line: number;
    column: number;
    lineExtract: string;
    file: string;
}

export class GenerationCtxt {
    indentIncrement = "    ";
    templateName = "";
    filePath = "";
    imports: { [key: string]: 1 };      // map of required imports
    statics: string[] = [];             // list of static resources
    localVars = {};                     // map of creation mode vars
    blockCount = 0;                     // number of js blocks - used to increment block variable suffixes
    templateArgs: string[] = [];        // name of template arguments
    paramCounter = 0;                   // counter used to create param instance variables

    constructor(public template: string, public options: CompilationOptions) {
        this.imports = options.importMap || {};
        this.templateName = options.templateName.replace(RX_DOUBLE_QUOTE, "");
        this.filePath = options.filePath.replace(RX_DOUBLE_QUOTE, "");
    }

    error(msg, nd: XjsNode) {
        let fileInfo = this.options.filePath || "",
            lineOffset = this.options.lineOffset || 0,
            lines = this.template.split(CR);

        throw {
            kind: "#Error",
            origin: "IVY",
            message: `Invalid ${NODE_NAMES[nd.kind]} - ${msg}`,
            line: nd.lineNumber + lineOffset,
            column: nd.colNumber,
            lineExtract: ("" + lines[nd.lineNumber - 1]).trim(),
            file: fileInfo
        } as IvError;
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
    return '"' + t.replace(RX_DOUBLE_QUOTE, '\\"') + '"';
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
                    if (ch.kind !== "#jsStatements" && ch.kind !== "#paramNode") {
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

    checkContentNode(nd: XjsContentNode) {
        let nk = getNodeKind(), attSupport = SUPPORTED_NODE_ATTRIBUTES[nk], gc = this.gc;
        if (attSupport) {
            if (attSupport === LATER) {
                gc.error(`${VALIDATION_NAMES[nk]} are not supported yet`, nd);
            } else {
                let f = nd as XjsFragment;
                if (f.params) {
                    checkAttribute(f, "#param", f.params[0]);
                }
                if (f.properties) {
                    checkAttribute(f, "#property", f.properties[0]);
                }
                if (f.decorators) {
                    checkAttribute(f, "#decorator", f.decorators[0]);
                }
                if (f.labels) {
                    let l: XjsLabel | undefined, fl: XjsLabel | undefined;
                    for (let lbl of f.labels) {
                        if (lbl.fwdLabel) {
                            if (!lbl.isOrphan && lbl.value!.kind !== "#string" && lbl.value!.kind !== "#expression") {
                                gc.error(`Forward labels values must be strings or expressions`, lbl);
                            }
                            fl = fl || lbl;
                        } else {
                            if (!lbl.isOrphan && lbl.value!.kind !== "#boolean" && lbl.value!.kind !== "#expression") {
                                gc.error(`Labels values must be expressions or booleans`, lbl);
                            }
                            l = l || lbl;
                        }
                    }
                    if (l) {
                        checkAttribute(f, "#label", l);
                    }
                    if (fl) {
                        checkAttribute(f, "##label", fl);
                    }
                }
                if (f.decorators) {
                    let codeRef: string;
                    for (let d of f.decorators) {
                        codeRef = d.ref.code;
                        let values = SUPPORTED_BUILT_IN_DECORATORS[d.ref.code];
                        if (nk === "#paramNode" && codeRef !== PARAM_VALUE && !codeRef.match(RX_EVT_HANDLER_DECORATOR)) {
                            gc.error(`Only @paramValue and event listener decorators can be used on Parameter nodes`, d);
                        } else if (values && values[nk] === NO) {
                            gc.error(`@${d.ref.code} is not supported on ${VALIDATION_NAMES[nk]}`, d);
                        } else if (codeRef.match(RX_EVT_HANDLER_DECORATOR)) {
                            if (!SUPPORTED_NODE_ATTRIBUTES[nk]["@onevent"]) {
                                gc.error(`Event handlers are not supported on ${VALIDATION_NAMES[nk]}`, d);
                            }
                        }
                    }
                }
            }
        }

        function getNodeKind() {
            let k = nd.kind;
            if (k === "#element" && (nd as XjsElement).nameExpression) return "#{element}";
            if (k === "#paramNode" && (nd as XjsParamNode).nameExpression) return "#{paramNode}";
            return k;
        }

        function checkAttribute(f: XjsFragment, attKind: string, errNd: XjsNode) {
            if (errNd) {
                switch (attSupport![attKind]) {
                    case NO:
                        gc.error(`${VALIDATION_NAMES[attKind]} are not supported on ${VALIDATION_NAMES[nk]}`, errNd);
                    case LATER:
                        gc.error(`${VALIDATION_NAMES[attKind]} are not yet supported on ${VALIDATION_NAMES[nk]}`, errNd);
                }
            }
        }
    }

    generateInstruction(siblings: XjsContentNode[], siblingIdx: number, parentLevel: number, iFlag: number, prevKind: string, nextKind: string) {
        let nd: XjsContentNode = siblings[siblingIdx], idx = this.nodeCount;
        if (nd.kind !== "#jsStatements" && nd.kind !== "#paramNode") {
            this.nodeCount++;
            this.hasChildNodes = true;
        }
        this.checkContentNode(nd);

        let stParams = "", i1 = -1, i2 = -1, containsParamExpr = false;
        if (nd.kind === "#element" || nd.kind === "#component" || nd.kind === "#paramNode") {
            [i1, containsParamExpr] = this.registerStatics(nd.params);
            [i2] = this.registerStatics(nd.properties);
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
                this.rejectAsyncDecorator(nd as XjsText);
                this.instructions.push(new TxtInstruction(nd as XjsText, idx, this, iFlag, parentLevel, this.generateLabelStatics(nd as XjsText)));
                const dis = this.generateDecoratorInstructions(nd, idx, iFlag);
                this.generateDynLabelInstructions(nd as XjsText, idx, iFlag, this);
                processDecoInstructions(this, dis);
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
                    let callImmediately = !containsParamExpr && (!nd.content || !nd.content.length) && !nd.decorators;
                    let ci = new CptInstruction(nd as XjsComponent, idx, this, iFlag, parentLevel, this.generateLabelStatics(nd as XjsComponent), callImmediately, i1)
                    this.instructions.push(ci);
                    if (containsParamExpr) {
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
                this.rejectAsyncDecorator(nd as XjsParamNode);

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
            case "#jsStatements":
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
                        if (!p.value || p.value.kind !== "#string") {
                            this.gc.error("xmlns value must be a string", p);
                        } else {
                            if (p.isOrphan || !p.value.value) {
                                this.gc.error("xmlns value cannot be empty", p);
                            }
                            xmlns = p.value.value;
                        }
                    }
                }
            }
        }
        let d = nd.decorators;
        if (d && d.length) {
            for (let deco of d) {
                if (deco.ref.code === XMLNS) {
                    if (xmlns) {
                        this.gc.error("xmlns cannot be defined twice", deco);
                    } else {
                        if (!deco.defaultPropValue || deco.defaultPropValue.kind !== "#string") {
                            this.gc.error("@xmlns value must be a string", deco);
                        } else {
                            let v = deco.defaultPropValue.value
                            if (XMLNS_VALUES[v]) {
                                xmlns = XMLNS_VALUES[v];
                            } else {
                                this.gc.error('Invalid @xmlns value: must be "html", "xhtml", "svg" or "mathml"', deco);
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

    registerStatics(params: XjsParam[] | XjsProperty[] | undefined): [number, boolean] {
        // return the index of the static resource or -1 if none
        // 2nd param is true if dynamic expressions are found
        if (!params || !params.length) return [-1, false];
        let v: XjsNumber | XjsBoolean | XjsString | XjsExpression | undefined,
            sIdx = -1, val: string[] | undefined = undefined,
            p: XjsParam | XjsProperty,
            sVal = "",
            containsExpr = false,
            statics = this.gc.statics;
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
            } else if (v && v.kind === "#expression") {
                containsExpr = true;
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
        return [sIdx, containsExpr];
    }

    /**
     * Parse the XJS node to look for labels - e.g. #foo or #bar[] or #baz[{expr()}]
     * @param nd 
     */
    generateLabelStatics(nd: XjsElement | XjsText | XjsComponent | XjsDecorator): string {
        if (nd.labels && nd.labels.length) {
            let lbl: XjsLabel, labels = nd.labels, len = labels.length, values: any[] = [];
            for (let i = 0; labels.length > i; i++) {
                lbl = labels[i];
                if (lbl.fwdLabel) {
                    this.gc.error("Forward labels (e.g. ##" + lbl.name + ") are not supported (yet)", lbl);
                }
                if (lbl.isOrphan) {
                    values.push(encodeText("#" + lbl.name));
                }
            }
            if (!values.length) return "0"; // no static labels
            let statics = this.gc.statics, sIdx = statics.length;
            statics[sIdx] = "ζs" + sIdx + " = [" + values!.join(", ") + "]";
            return "ζs" + sIdx;
        }
        return "0"; // no labels
    }

    generateParamInstructions(nd: XjsFragment | XjsDecorator, idx: number, iFlag: number, isAttribute: boolean, view: ViewInstruction) {
        // dynamic params / attributes
        if (nd.params && nd.params.length) {
            let len = nd.params.length, p: XjsParam, isParamNode = nd.kind === "#paramNode";
            for (let i = 0; len > i; i++) {
                p = nd.params[i];
                if (p.isSpread) {
                    this.gc.error("Spread operator is no supported yet", p);
                }
                if (p.value && p.value.kind === "#expression") {
                    this.instructions.push(new ParamInstruction(p, idx, view, iFlag, isAttribute, this.indent, isParamNode));
                }
            }
        }

        if (nd.kind === "#paramNode" && nd.decorators) {
            // look for @paramValue decorator
            for (let d of nd.decorators) {
                if (d.ref.code === PARAM_VALUE) {
                    if (nd.params) {
                        this.gc.error("@paramValue cannot be mixed with other parameters", d);
                    }
                    this.instructions.push(new ParamInstruction(d, idx, view, iFlag, false, this.indent, true));
                }
            }
        }
        // dynamic properties
        if (nd.kind !== "#decorator" && nd.properties && nd.properties.length) {
            let len = nd.properties.length, p: XjsProperty;
            for (let i = 0; len > i; i++) {
                p = nd.properties[i];
                if (p.isSpread) {
                    this.gc.error("Spread operator is no supported yet", p);
                }
                if (p.name === "innerHTML") {
                    this.gc.error("innerHTML is not authorized (security restriction)", p);
                }
                if (p.value && p.value.kind === "#expression") {
                    this.instructions.push(new ParamInstruction(p, idx, view, iFlag, isAttribute, this.indent));
                }
            }
        }
    }

    generateDynLabelInstructions(nd: XjsFragment | XjsText | XjsComponent | XjsDecorator, idx: number, iFlag: number, view: ViewInstruction) {
        // dynamic labels
        if (nd.labels && nd.labels.length) {
            let len = nd.labels.length, lbl: XjsLabel;
            for (let i = 0; len > i; i++) {
                lbl = nd.labels[i];
                if (!lbl.isOrphan && lbl.value) {
                    if (!lbl.fwdLabel) {
                        this.instructions.push(new LblInstruction(lbl, idx, view, iFlag, this.indent));
                    }
                }
            }
        }
    }

    processAsyncCase(nd: XjsElement | XjsFragment, idx: number, parentLevel: number, prevKind: string, nextKind: string): boolean {
        // generate async block if @async decorator is used
        let asyncValue: number | XjsExpression = 0;

        if (nd === this.node) {
            return false; // we are in the async block for this node
        }

        // determine if an async decorator is used
        let decorators = nd.decorators;
        if (decorators) {
            for (let d of decorators) {
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
                        if (dv.kind === "#number") {
                            asyncValue = dv.value;
                        } else if (d.defaultPropValue!.kind === "#expression") {
                            asyncValue = dv as XjsExpression;
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
        nd: XjsComponent | XjsElement | XjsFragment | XjsText,
        idx: number,
        iFlag: number,
        includeBuiltIn = true,
        includeCustomDecorators = true): DecoInstruction[] | undefined {
        let d = nd.decorators, result: DecoInstruction[] | undefined = undefined;
        if (d) {
            let len = d.length, deco: XjsDecorator, kind = nd.kind, decoRef = "";
            for (let i = 0; len > i; i++) {
                deco = d[i];
                decoRef = deco.ref ? deco.ref.code : "";
                if (decoRef === "content") {
                    if (includeBuiltIn) {
                        // todo: @content on components, param nodes and decorator nodes
                        if (kind === "#element" || kind === "#fragment") {
                            this.instructions.push(new InsInstruction(deco, nd as XjsElement | XjsFragment, idx, this, iFlag));
                        } else {
                            this.gc.error("@content can not be used on " + VALIDATION_NAMES[kind], nd);
                        }
                    }
                } else if (decoRef === "async" || decoRef === "key" || decoRef === PARAM_VALUE || decoRef === "xmlns" || decoRef.match(RX_EVT_HANDLER_DECORATOR)) {
                    // built-in decorators: @async, @key, @onXXX, @xmlns, @paramValue
                    continue;
                } else if (includeCustomDecorators) {
                    // custom decorator
                    let sIdx = -1, containsParamExpr = false;
                    [sIdx, containsParamExpr] = this.registerStatics(deco.params);
                    let decoIdx = this.nodeCount++,
                        decoInstr = new DecoInstruction(deco, decoIdx, idx, this, iFlag, this.indent, sIdx, this.generateLabelStatics(deco));
                    this.instructions.push(decoInstr);
                    if (containsParamExpr) {
                        this.generateParamInstructions(deco, decoIdx, iFlag, false, this);
                    }
                    this.generateDynLabelInstructions(deco, decoIdx, iFlag, this);
                    this.createListeners(deco, decoIdx, iFlag, this);
                    // if (nd.kind === "#textNode") {
                    //     if (decoInstr.paramMode === 2) {
                    //         this.instructions.push(new DecoCallInstruction(decoInstr));
                    //     }
                    // } else {
                        if (!result) {
                            result = [decoInstr];
                        } else {
                            result.push(decoInstr);
                        }
                    // }
                }
            }
        }
        return result;
    }

    // return true if some listeners have been created
    createListeners(nd: XjsElement | XjsComponent | XjsParamNode | XjsDecorator, parentIdx: number, iFlag: number, view: ViewInstruction): boolean {
        if (!nd.decorators) return false;
        let name: string, result = false;
        for (let d of nd.decorators) {
            name = d.ref.code;
            if (name.match(RX_EVT_HANDLER_DECORATOR)) {
                this.instructions.push(new EvtInstruction(d, RegExp.$1, view.nodeCount++, parentIdx, view, iFlag));
                result = true;
            }
        }
        return result;
    }

    rejectAsyncDecorator(nd: XjsText | XjsParamNode) {
        let decorators = nd.decorators;
        if (decorators) {
            for (let d of decorators) {
                if (d.ref.code === "async") {
                    this.gc.error("@async cannot be used in this context", d);
                }
            }
        }
    }

    pushCode(body: BodyContent[]) {
        // e.g. 
        // let ζc = ζinit(ζ, ζs0, 3);
        // ...
        // ζend(ζ);

        let isJsBlock = this.node.kind === "#jsBlock";
        if (isJsBlock) {
            let p = this.parentView!, nd = this.node as XjsJsBlock;
            body.push((this.prevKind !== "#jsBlock" && this.prevKind !== "#jsStatements") ? this.gc.decreaseIndent(this.indent) : " ");
            body.push(nd);
            if (!nd.startCode.match(/\n$/)) {
                body.push("\n");
            }
        } else if (this.kind === "asyncBlock") {
            // async block
            let p = this.parentView!;
            body.push((this.prevKind !== "#jsBlock" && this.prevKind !== "#jsStatements") ? this.gc.decreaseIndent(this.indent) : " ");
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
            if (!nd.endCode.match(/\n$/) && this.nextKind !== "#jsBlock" && this.nextKind !== "#jsStatements") {
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
    staticsExpr: string = '""'; // '" static string "' or "ζs1"

    constructor(public node: XjsText, public idx: number, public view: ViewInstruction, public iFlag: number, public parentLevel: number, public staticLabels: string) {
        this.view.gc.imports['ζtxt' + getIhSuffix(iFlag)] = 1;

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

    pushCode(body: BodyContent[]) {
        // e.g. ζtxt(ζ1, ζc1, 0, 2, 1, ζs0, 1, ζe(ζ, 0, 1, name));
        let v = this.view, eLength = this.node.expressions ? this.node.expressions.length : 0;

        body.push(`${v.indent}${funcStart("txt", this.iFlag)}${v.jsVarName}, ${v.cmVarName}, ${this.iFlag}, ${this.idx}, ${this.parentLevel}, ${this.staticLabels}, ${this.staticsExpr}, ${eLength}`);
        for (let i = 0; eLength > i; i++) {
            body.push(', ');
            generateExpression(body, this.node.expressions![i], this.view, this.iFlag);
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
        if (this.node.nameExpression) {
            v.gc.error("Name expressions are not yet supported", this.node);
        }
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
            name = '"' + this.node.name + '"';
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
            if (val && val.isBinding) {
                if (this.funcName === "att") {
                    v.gc.error("Binding expressions cannot be used on element attributes", this.node);
                } else {
                    v.gc.error("Binding expressions cannot be used on element properties", this.node);
                }
            }
            body.push(`${this.indent}ζ${this.funcName}${iSuffix}(${v.jsVarName}, ${this.iFlag ? 1 : 0}, ${this.idx}, ${name}, `);
        }
        if (generateLastExpressionArg) {
            if (this.node.kind === "#decorator") {
                // @paramValue decorator - in this case targetParamNode is true
                let dfp = this.node.defaultPropValue;
                if (!dfp) {
                    v.gc.error(`Incorrect value for @${this.node.ref.code}`, this.node);
                } else {
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
        } else if (this.node.params && this.node.params.length) {
            this.paramMode = 2;
        }
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2);
        let v = this.view, iSuffix = this.iFlag ? "D" : "", dfp = this.node.defaultPropValue, hasStaticLabels = (this.staticLabels !== "0"),
            isDfpBinding = (dfp && dfp.kind === "#expression" && dfp.isBinding);

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

function pushExpressionValue(body: BodyContent[], value: XjsNumber | XjsBoolean | XjsString | XjsExpression) {
    if (value.kind === "#expression") {
        body.push(value as XjsExpression);
    } else {
        if (value.kind === "#string") {
            body.push(encodeText(value.value));
        } else {
            body.push("" + value.value);
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
    constructor(public node: XjsJsStatements, public view: ViewInstruction, public iFlag: number, public prevKind: string) { }

    pushCode(body: BodyContent[]) {
        let v = this.view;
        body.push((this.prevKind !== "#jsBlock") ? v.indent : " ");
        body.push(this.node);
        if (!this.node.code.match(/\n$/)) {
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
        if (node.properties && node.properties.length) {
            view.gc.error("Properties cannot be used on components", node);
        }
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
        if (node.properties && node.properties.length) {
            view.gc.error("Properties cannot be used on param nodes", node);
        }
        if (node.nameExpression) {
            view.gc.error("Param nodes names cannot be defined through expressions (yet)", node);
        }
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
            if (d.defaultPropValue.kind !== "#expression") {
                v.gc.error('Event listeners must be function expressions - e.g. @onclick={e=>doSomething(e)}', d);
            } else {
                listener = d.defaultPropValue! as XjsExpression;
            }
        } else {
            for (let p of d.params!) {
                if (p.name === "listener") {
                    if (!p.value) {
                        v.gc.error("listener value cannot be empty", p);
                    } else if (p.value.kind !== "#expression") {
                        v.gc.error('listeners must be function expressions - e.g. listener={e=>doSomething(e)}', p);
                    } else {
                        listener = p.value;
                    }
                } else if (p.name === "options") {
                    if (!p.value) {
                        v.gc.error("options value cannot be empty", p);
                    } else if (p.value.kind !== "#expression") {
                        v.gc.error('options value must be an expression - e.g. options={{passive:true, once:true}}', p);
                    } else {
                        options = p.value;
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
        if (parent.kind !== "#element" && parent.kind !== "#fragment") {
            gc.error("@content can only be used on elements or fragments", node);
        }
        if (parent.content && parent.content.length) {
            gc.error("@content can only be used on empty elements or fragments", node);
        }
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζcont(ζ, 2, 0, ζe(ζ, 0, $content));
        let v = this.view, d = this.node, gc = this.view.gc;

        if (d.isOrphan || !d.defaultPropValue) {
            if (gc.templateArgs.indexOf("$") < 0 && gc.templateArgs.indexOf("$content") < 0) {
                gc.error("$ or $content must be defined as template arguments to use @content with no values", d);
            }
        } else if (this.node.defaultPropValue && this.node.defaultPropValue.kind !== "#expression") {
            gc.error("@content value cannot be a " + this.node.defaultPropValue.kind, d);
        } else if (this.node.defaultPropValue && this.node.defaultPropValue.kind === "#expression" && this.node.defaultPropValue.oneTime) {
            gc.error("@content expression cannot use one-time qualifier", d);
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
