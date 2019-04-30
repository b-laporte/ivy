import { XjsTplFunction, XjsContentNode, XjsExpression, XjsElement, XjsParam, XjsNumber, XjsBoolean, XjsString, XjsProperty, XjsFragment, XjsJsStatements, XjsJsBlock, XjsComponent, XjsEvtListener, XjsParamNode, XjsNode, XjsTplArgument, XjsText, XjsDecorator } from '../xjs/parser/types';
import { parse } from '../xjs/parser/xjs-parser';
import { before } from 'mocha';

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

type BodyContent = string | XjsExpression | XjsJsStatements | XjsJsBlock | XjsEvtListener;
type InstructionsHolder = XjsComponent | XjsParamNode | XjsJsBlock | XjsElement | XjsFragment | null;

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
    },
    $INDEX = "$index",
    $ASYNC = "$async",
    $FRAGMENT_INDEX = "$fragmentIndex",
    $FRAGMENT_INS_HOLDER = "$fragmentIHolder",
    $STATIC_PARAMS_IDX = "$staticParamsIdx",
    $PARENT_IDX = "$parentIdx",
    $CONTENT_NODE_IDX = "$contentNodeIdx",
    $PARENT_INS_HOLDER = "$parentIHolder";

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

function generate(tf: XjsTplFunction, options: CompilationOptions) {
    let body: BodyContent[] = []; // parts composing the function body (generated strings + included expressions/statements)
    let root: JsBlockUpdate;

    return generateAll();

    function generateAll() {
        let gc = new GenerationCtxt(options), args = tf.arguments;
        if (args) {
            for (let i = 0; args.length > i; i++) {
                gc.templateArgs.push(args[i].name);
            }
        }

        if (tf.content) {
            root = new JsBlockUpdate(tf, 1, null, null, gc, tf.indent);
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
            } else if (part.kind === "#expression" || part.kind === "#jsStatements" || part.kind === "#eventListener") {
                parts.push(part.code);
            } else if (part.kind === "#jsBlock") {
                parts.push(part.startCode);
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

interface CreationInstruction {
    pushCode(body: BodyContent[]);
}

interface UpdateInstruction {
    isJsBlock?: true;
    idx?: number;
    pushCode(body: BodyContent[]);
}

export interface CompilationOptions {
    body?: boolean;                     // if true, will output the template function body in the result
    statics?: boolean;                  // if true, the statics array will be in the result
    function?: boolean;                 // if true the js function will be in the result
    imports?: boolean;                  // if true the imports will be added as comment to the js function
    importMap?: { [key: string]: 1 };   // imports as a map to re-use the map from a previous compilation
    filePath?: string;                  // file name - used for error reporting
    lineOffset?: number;                // shift error line count to report the line number of the file instead of the template
}

export class GenerationCtxt {
    indentIncrement = "    ";
    imports: { [key: string]: 1 };      // map of required imports
    statics: string[] = [];             // list of static resources
    localVars = {};                     // map of creation mode vars
    blockCount = 0;                     // number of js blocks - used to increment block variable suffixes
    templateArgs: string[] = [];        // name of template arguments

    constructor(public options: CompilationOptions) {
        this.imports = options.importMap || {};
    }

    error(msg, nd: XjsNode) {
        let fileInfo = this.options.filePath ? " in " + this.options.filePath : "",
            lineOffset = this.options.lineOffset || 0;
        throw new Error(`Invalid ${NODE_NAMES[nd.kind]} - ${msg} (line #${nd.lineNumber + lineOffset}${fileInfo})`);
    }
}

export class JsBlockUpdate implements UpdateInstruction {
    gc: GenerationCtxt;
    isJsBlock: (true | undefined) = true;
    instructionFlag = false;
    createInstructions: CreationInstruction[] = [];
    updateInstructions: UpdateInstruction[] = [];
    cleanIndexes: number[] = [];    // clean
    nodeCount = 0;
    exprCount = 0;                  // binding expressions count
    expr1Count = 0;                 // one-time expressions count
    blockIdx = 0;
    jsVarName = "ζ";                // block variable name - e.g. ζ or ζ1
    indent = '';
    indent2 = '';                   // 2nd level of indentation
    nextNodeIsContainer = false;    // true when the next node to create will be a container (cf. blocks and fragments)
    prevKind = '';                  // kind of the previous sibling
    nextKind = '';                  // kind of the next sibling
    instanceCounterVar = '';        // e.g. ζi2 -> used to count sub-block instances
    dExpressions: number[] = [];    // list of counters for deferred expressions (cf. ζexp)
    childBlockIndexes: number[] = [];
    asyncValue: number | XjsExpression = 0;
    asyncInsHolder: InstructionsHolder = null;

    constructor(public node: XjsTplFunction | XjsJsBlock | XjsElement | XjsFragment | XjsComponent, public idx: number, public parentBlock: JsBlockUpdate | null, public iHolder: InstructionsHolder, generationCtxt?: GenerationCtxt, indent?: string) {
        if (parentBlock) {
            this.gc = parentBlock.gc;
            this.indent = parentBlock.indent;
            this.instructionFlag = parentBlock.instructionFlag;
            this.blockIdx = this.gc.blockCount++;
            this.instanceCounterVar = 'ζi' + this.blockIdx;
            this.gc.localVars[`${this.instanceCounterVar} = 0`] = 1;
            parentBlock.childBlockIndexes.push(this.blockIdx);
        } else if (generationCtxt) {
            this.indent = indent || '';
            this.gc = generationCtxt;
            this.blockIdx = this.gc.blockCount++;
        } else {
            throw new Error("JsBlockUpdate: either parentBlock or generationCtxt must be provided");
        }
        if (this.blockIdx > 0) {
            this.jsVarName = "ζ" + this.blockIdx;
        }

        if (iHolder && node.kind === "#jsBlock") {
            this.iHolder = node;
        }

        let gc = this.gc;
        gc.imports['ζcc'] = 1;
        gc.imports['ζend'] = 1;
        if (this.blockIdx > 0) {
            // root block (idx 1) is passed as function argument
            gc.localVars[this.jsVarName] = 1;
        }

        this.indent2 = this.indent + this.gc.indentIncrement;
    }

    scan() {
        if (this.node.kind === "#element" || this.node.kind === "#fragment" || this.node.kind === "#component") {
            this.generateCmInstruction(this.node, 1, this.iHolder);
            this.generateUpdateInstruction(this.node, this.iHolder, "", "");
        } else {
            let content = this.node.content, len = content ? content.length : 0, nd: XjsContentNode;
            if (len === 0) return;

            // creation mode
            if (len > 1) {
                // need container fragment
                this.nodeCount = 1;
                this.createInstructions.push(new FragmentCreation(null, 1, 1, this, this.iHolder, ContainerType.Group)); // root fragment -> parentIdx = 1
            }
            for (let i = 0; len > i; i++) {
                this.generateCmInstruction(content![i], 1, this.iHolder);
            }

            // update mode
            let pKind = "", nKind = "";
            for (let i = 0; len > i; i++) {
                nKind = (i < len - 1) ? content![i + 1].kind : "";
                this.generateUpdateInstruction(content![i], this.iHolder, pKind, nKind);
                pKind = content![i].kind;
            }
        }

        // clean instructions
        let uInstructions = this.updateInstructions, ui: UpdateInstruction, len = uInstructions.length;
        for (let i = 0; len > i; i++) {
            ui = this.updateInstructions[i];
            if (ui.isJsBlock) {
                this.updateInstructions.push(new CleanUpdate(ui.idx!, this, this.iHolder));
            }
        }
    }

    generateCmInstruction(nd: XjsContentNode, parentIdx: number, iHolder: InstructionsHolder) {
        let content: XjsContentNode[] | undefined = undefined, idx = this.nodeCount;
        if (nd.kind !== "#jsStatements") {
            idx = ++this.nodeCount;
        }
        nd[$INDEX] = idx;

        let stParams = "", i1 = -1, i2 = -1;
        if (nd.kind === "#element" || nd.kind === "#component" || nd.kind === "#paramNode") {
            i1 = this.registerStatics(nd.params);
            i2 = this.registerStatics(nd.properties);
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
                this.rejectAsyncDecorator(nd as XjsText);
                this.createInstructions.push(new TextCreation(nd, idx, parentIdx, this, iHolder));
                break;
            case "#fragment":
                if (!this.processAsyncCase(nd as XjsFragment, idx, parentIdx, iHolder)) {
                    this.createInstructions.push(new FragmentCreation(nd, idx, parentIdx, this, iHolder, ContainerType.Group));
                    content = nd.content;
                }
                break;
            case "#component":
                if (!this.processAsyncCase(nd as XjsComponent, idx, parentIdx, iHolder)) {
                    // create a container block
                    this.createInstructions.push(new FragmentCreation(null, idx, parentIdx, this, iHolder, ContainerType.Component));
                    nd[$FRAGMENT_INDEX] = idx;
                    nd[$STATIC_PARAMS_IDX] = i1;
                    nd[$PARENT_IDX] = parentIdx;
                    nd[$PARENT_INS_HOLDER] = iHolder;
                    content = nd.content;
                    this.createContentFragment(nd as XjsComponent, nd as XjsComponent);
                    if (nd.listeners && nd.listeners.length) {
                        this.gc.error("Event listeners are not supported on components (yet)", nd);
                    }
                }
                break;
            case "#element":
                if (!this.processAsyncCase(nd as XjsElement, idx, parentIdx, iHolder)) {
                    this.createInstructions.push(new EltCreation(nd as XjsElement, idx, parentIdx, this, iHolder, stParams));
                    this.createListeners(nd as XjsElement, idx, iHolder);
                    content = nd.content;
                }
                break;
            case "#paramNode":
                // e.g. ζpnode(ζ, 3, 1, 0, "header");
                this.rejectAsyncDecorator(nd as XjsParamNode);
                this.createInstructions.push(new PNodeCreation(nd as XjsParamNode, idx, parentIdx, this, iHolder, stParams));
                nd[$PARENT_INS_HOLDER] = iHolder;
                content = nd.content;
                this.createContentFragment(nd as XjsParamNode, nd as XjsParamNode);
                break;
            case "#jsStatements":
                break;
            case "#jsBlock":
                // create a container block
                this.createInstructions.push(new FragmentCreation(null, idx, parentIdx, this, iHolder, ContainerType.Block));
                nd[$FRAGMENT_INDEX] = idx;
                nd[$FRAGMENT_INS_HOLDER] = iHolder;
                break;
            default:
                this.gc.error("Invalid node type: " + nd.kind, nd);
        }

        if (content) {
            let len = content.length,
                cNode = nd[$CONTENT_NODE_IDX],
                pIdx = cNode ? cNode : idx;

            if (nd.kind === "#component") {
                iHolder = nd as XjsComponent;
            } else if (nd.kind === "#paramNode") {
                iHolder = nd as XjsParamNode;
            }

            if (this.nextNodeIsContainer && len === 1) {
                // when length is 1 and node is not jsStatement we use the node as content (no need for extra fragment)
                this.nextNodeIsContainer = false;
                this.generateCmInstruction(content[0], this.nodeCount, iHolder);
            } else {
                for (let i = 0; len > i; i++) {
                    this.generateCmInstruction(content[i], pIdx, iHolder);
                }
            }
        }
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

    processAsyncCase(nd: XjsElement | XjsFragment, idx: number, parentIdx: number, iHolder: InstructionsHolder): boolean {
        // generate async block if @async decorator is used
        let asyncValue: number | XjsExpression = 0;
        if (!nd[$ASYNC]) {
            let decorators = nd.decorators;
            if (decorators) {
                for (let d of decorators) {
                    if (d.ref.code === "async") {
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
        }
        if (asyncValue) {
            this.createInstructions.push(new FragmentCreation(null, idx, parentIdx, this, iHolder, ContainerType.Async));
            nd[$ASYNC] = asyncValue;
            nd[$FRAGMENT_INDEX] = idx;
            nd[$FRAGMENT_INS_HOLDER] = iHolder;
            return true
        } else {
            if (nd[$ASYNC]) {
                this.asyncValue = nd[$ASYNC];
                this.gc.imports['ζasync'] = 1;
            }
            nd[$ASYNC] = 0;
            return false;
        }
    }

    createContentFragment(nd: XjsComponent | XjsParamNode, iHolder: InstructionsHolder) {
        let content = nd.content;
        if (content && content.length) {
            // create a fragment if content has something more than jsStatements and 
            let len = content.length, count = 0, asyncRoot = false;
            for (let i = 0; len > i; i++) {
                if (content[i].kind !== "#jsStatements" && content[i].kind !== "#paramNode") {
                    if (count === 0) {
                        // check if content[i] is @async
                        let nd = content[i];
                        if (nd.kind === "#fragment" || nd.kind === "#element" || nd.kind === "#component") {
                            nd = nd as XjsFragment;
                            if (nd.decorators) {
                                for (let d of nd.decorators) {
                                    if (d.ref.code === "async") {
                                        asyncRoot = true;
                                    }
                                }
                            }
                        }
                    }
                    count++;
                }
            }
            if (asyncRoot || (count && len > 1)) {
                // create a fragment to hold content nodes
                let parentIdx = this.nodeCount, newIdx = ++this.nodeCount;
                nd[$CONTENT_NODE_IDX] = newIdx;
                this.createInstructions.push(new FragmentCreation(null, newIdx, parentIdx, this, iHolder, ContainerType.Group));
            } else {
                if (count && len === 1) {
                    nd[$CONTENT_NODE_IDX] = this.nodeCount + 1;
                    this.nextNodeIsContainer = true;
                } else {
                    nd[$CONTENT_NODE_IDX] = 0;
                }
            }
        } else {
            nd[$CONTENT_NODE_IDX] = 0;
        }
    }

    createListeners(nd: XjsElement, parentIdx: number, iHolder: InstructionsHolder) {
        if (nd.listeners && nd.listeners.length) {
            let newIdx = 0;
            for (let listener of nd.listeners) {
                newIdx = ++this.nodeCount
                listener[$INDEX] = newIdx;
                this.createInstructions.push(new ListenerCreation(listener, newIdx, parentIdx, this, iHolder));
            }
        }
    }

    updateHandlers(nd: XjsElement, iHolder: InstructionsHolder) {
        if (nd.listeners && nd.listeners.length) {
            for (let listener of nd.listeners) {
                this.updateInstructions.push(new HandlerUpdate(listener, this, iHolder));
            }
        }
    }

    generateUpdateInstruction(nd: XjsContentNode, iHolder: InstructionsHolder, prevKind: string, nextKind: string) {
        let idx = nd[$INDEX];
        switch (nd.kind) {
            case "#textNode":
                if (nd.expressions && nd.expressions.length) {
                    this.updateInstructions.push(new TextUpdate(nd, idx, this, iHolder));
                }
                break;
            case "#component":
                if (!this.handleAsyncUpdate(nd as XjsComponent, iHolder, prevKind, nextKind)) {
                    this.updateInstructions.push(new CptUpdate(nd as XjsComponent, nd[$FRAGMENT_INDEX], nd[$PARENT_IDX], this, iHolder, nd[$STATIC_PARAMS_IDX]));
                    this.generateContentUpdate(nd, iHolder, false);
                    this.updateInstructions.push(new CptCallUpdate(nd[$FRAGMENT_INDEX], this, iHolder));
                }
                break;
            case "#fragment":
                if (!this.handleAsyncUpdate(nd as XjsFragment, iHolder, prevKind, nextKind)) {
                    this.generateContentUpdate(nd as XjsFragment, iHolder, false);
                }
                break;
            case "#element":
                if (!this.handleAsyncUpdate(nd as XjsElement, iHolder, prevKind, nextKind)) {
                    this.updateHandlers(nd as XjsElement, iHolder);
                    this.generateContentUpdate(nd as XjsElement, iHolder, true);
                }
                break;
            case "#paramNode":
                this.generateContentUpdate(nd as XjsParamNode, iHolder, false);
                break;
            case "#jsStatements":
                this.updateInstructions.push(new JsStatementsUpdate(nd, this, iHolder, prevKind));
                break;
            case "#jsBlock":
                let jsb = new JsBlockUpdate(nd, nd[$FRAGMENT_INDEX], this, iHolder);
                jsb.prevKind = prevKind;
                jsb.nextKind = nextKind;
                this.updateInstructions.push(jsb);
                jsb.scan();
                break;
        }
    }

    handleAsyncUpdate(nd: XjsElement | XjsFragment | XjsComponent, iHolder: InstructionsHolder, prevKind: string, nextKind: string): boolean {
        if (nd[$ASYNC]) {
            let jsb = new JsBlockUpdate(nd as XjsElement, nd[$FRAGMENT_INDEX], this, null);
            jsb.asyncInsHolder = nd[$FRAGMENT_INS_HOLDER];
            jsb.prevKind = prevKind;
            jsb.nextKind = nextKind;
            this.updateInstructions.push(jsb);
            jsb.scan();
            return true
        }
        return false;
    }

    generateContentUpdate(nd: XjsComponent | XjsElement | XjsFragment, iHolder: InstructionsHolder, useAttributes: boolean) {
        this.generateParamUpdate(nd, iHolder, useAttributes);
        this.generateBuiltInDecoratorsUpdate(nd, iHolder);

        if (nd.content) {
            if (nd.kind === "#component") {
                iHolder = nd as XjsComponent;
            } else if (nd.kind === "#paramNode") {
                iHolder = nd as XjsParamNode;
            }
            let len = nd.content!.length, pKind = "", nKind = "";
            for (let i = 0; len > i; i++) {
                nKind = (i < len - 1) ? nd.content![i + 1].kind : "";
                this.generateUpdateInstruction(nd.content![i], iHolder, pKind, nKind);
                pKind = nd.content![i].kind;
            }
        }
    }

    generateParamUpdate(f: XjsFragment, iHolder: InstructionsHolder, isAttribute: boolean) {
        if (f.kind === "#paramNode") {
            iHolder = iHolder ? iHolder[$PARENT_INS_HOLDER] : null;
        }

        // dynamic params / attributes
        if (f.params && f.params.length) {
            let len = f.params.length, p: XjsParam;
            for (let i = 0; len > i; i++) {
                p = f.params[i];
                if (p.value && p.value.kind === "#expression") {
                    this.updateInstructions.push(new ParamUpdate(p, f[$INDEX], this, iHolder, isAttribute));
                }
            }
        }
        // dynamic properties
        if (f.properties && f.properties.length) {
            let len = f.properties.length, p: XjsProperty;
            for (let i = 0; len > i; i++) {
                p = f.properties[i];
                if (p.value && p.value.kind === "#expression") {
                    this.updateInstructions.push(new ParamUpdate(p, f[$INDEX], this, iHolder, isAttribute));
                }
            }
        }
    }

    generateBuiltInDecoratorsUpdate(nd: XjsComponent | XjsElement | XjsFragment, iHolder: InstructionsHolder) {
        let d = nd.decorators;
        if (d) {
            let len = d.length, deco: XjsDecorator;
            for (let i = 0; len > i; i++) {
                deco = d[i];
                if (deco.ref && deco.ref.code === "content") {
                    this.updateInstructions.push(new ContentUpdate(deco, nd, nd[$INDEX], this, iHolder));
                }
            }
        }
    }

    registerStatics(params: XjsParam[] | XjsProperty[] | undefined): number {
        // return the index of the static resource or -1 if none
        if (!params || !params.length) return -1;
        let v: XjsNumber | XjsBoolean | XjsString | XjsExpression | undefined,
            sIdx = -1, val: string[] | undefined = undefined,
            p: XjsParam | XjsProperty,
            sVal = "",
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

    pushCode(body: BodyContent[]) {
        // e.g. 
        // let ζ1;
        // ζ1 = ζcc(ζ, 1, ++ζi1);
        // if (ζ1[0].cm) {
        //     ζtxt(ζ1, 1, 1, 0, " Hello World ");
        // }
        // ζend(ζ1);
        let isJsBlock = this.node.kind === "#jsBlock", _indent = this.indent, _indent2 = this.indent2;
        if (isJsBlock) {
            let p = this.parentBlock!;
            let nd = this.node as XjsJsBlock;
            _indent = this.indent = p.indent;
            _indent2 = this.indent2 = p.indent2;

            body.push((this.prevKind !== "#jsBlock" && this.prevKind !== "#jsStatements") ? this.indent : " ");
            body.push(nd);
            if (!nd.startCode.match(/\n$/)) {
                body.push("\n");
            }
            // increment indents
            this.indent = p.indent + this.gc.indentIncrement;
            this.indent2 = p.indent2 + this.gc.indentIncrement;
        } else if (this.asyncValue) {
            // async block
            let p = this.parentBlock!, ih = instructionsHolder(this.asyncInsHolder);
            body.push((this.prevKind !== "#jsBlock" && this.prevKind !== "#jsStatements") ? this.indent : " ");
            body.push(`ζasync(${this.parentBlock!.jsVarName}, ${this.idx}, `);
            if (typeof this.asyncValue === 'number') {
                body.push('' + this.asyncValue);
            } else {
                generateExpression(body, this.asyncValue as XjsExpression, this.parentBlock!, ih);
            }

            body.push(`, ${ih}, function () {\n`);
            this.indent = p.indent + this.gc.indentIncrement;
            this.indent2 = p.indent2 + this.gc.indentIncrement;
        }

        if (this.createInstructions.length) {
            // push cleanIndexes to statics
            let iHolderIdx = 0, containerArg = ""; // or e.g. ", ζs3"
            if (this.cleanIndexes.length) {
                let statics = this.gc.statics, csIdx = statics.length;
                statics.push("ζs" + csIdx + " = [" + this.cleanIndexes.join(", ") + "]");
                containerArg = ", ζs" + csIdx;
            }
            if (this.asyncValue) {
                if (!containerArg) {
                    containerArg = ", 0";
                }
                containerArg += ", 1"; // async block flag
            }

            let instanceArgs = "", parentBlockVarName = "ζ";
            if (!this.parentBlock) {
                // root block: insert local variables
                let arr: string[] = [], localVars = this.gc.localVars;
                for (let k in localVars) if (localVars.hasOwnProperty(k)) {
                    arr.push(k);
                }
                if (arr.length) {
                    body.push(`${this.indent}let ${arr.join(", ")};\n`);
                }
            } else {
                if (this.node[$FRAGMENT_INS_HOLDER]) {
                    if (this.asyncValue) {
                        // async blocks are not deferred as they won't be called if not needed
                        iHolderIdx = instructionsHolder(this.iHolder);
                    } else {
                        iHolderIdx = instructionsHolder(this.node[$FRAGMENT_INS_HOLDER]);
                    }
                }
                if (this.childBlockIndexes.length) {
                    body.push(`${this.indent}ζi${this.childBlockIndexes.join(" = ζi")} = 0;\n`);
                }
                parentBlockVarName = this.parentBlock.jsVarName;
                instanceArgs = ", ++" + this.instanceCounterVar;
                if (iHolderIdx) {
                    instanceArgs += ", " + iHolderIdx;
                }
            }
            if (this.blockIdx > 0) {
                // first block is initialized in the ζ1 definition
                body.push(`${this.indent}${this.jsVarName} = ζcc(${parentBlockVarName}, ${this.idx}${instanceArgs});\n`); // todo instruction flag ??
            }
            body.push(`${this.indent}if (${this.jsVarName}[0].cm) {\n`);

            for (let ci of this.createInstructions) {
                ci.pushCode(body);
            }
            body.push(`${this.indent}}\n`);

            for (let ui of this.updateInstructions) {
                ui.pushCode(body);
            }

            body.push(`${this.indent}ζend(${this.jsVarName}, ${iHolderIdx ? 1 : 0}${containerArg});\n`);
        }

        if (isJsBlock) {
            let nd = this.node as XjsJsBlock;
            this.indent = _indent;
            this.indent2 = _indent2;
            body.push(this.indent);
            body.push(nd.endCode);
            if (!nd.endCode.match(/\n$/) && this.nextKind !== "#jsBlock" && this.nextKind !== "#jsStatements") {
                body.push("\n");
            }
        } else if (this.asyncValue) {
            // end of async function
            this.indent = _indent;
            this.indent2 = _indent2;
            body.push(`${this.indent}});\n`);
        }
    }
}

enum ContainerType {
    Group = 0,
    Block = 1,
    Component = 2,
    Async = 3
}

class FragmentCreation implements UpdateInstruction {
    constructor(node: XjsFragment | null, public idx: number, public parentIdx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder, public type: ContainerType) {
        let gc = this.block.gc;
        if (node && node.params && node.params.length) {
            gc.error("Params cannot be used on fragments", node);
        }
        if (node && node.properties && node.properties.length) {
            gc.error("Properties cannot be used on fragments", node);
        }
        if (node && node.listeners && node.listeners.length) {
            gc.error("Event listeners cannot be used on fragments", node);
        }
        gc.imports['ζfrag'] = 1;
    }

    pushCode(body: BodyContent[]) {
        let b = this.block, ih = instructionsHolder(this.iHolder), lastArgs = (ih === 0) ? "" : ", " + ih;
        if (this.type !== ContainerType.Group) {
            lastArgs = ", " + ih + ", " + this.type;
        }
        body.push(`${b.indent2}ζfrag(${b.jsVarName}, ${this.idx}, ${this.parentIdx}${lastArgs});\n`);
    }
}

class TextCreation implements CreationInstruction {
    lastParam = "";
    constructor(public node: XjsText, public idx: number, public parentIdx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder) {
        let gc = this.block.gc;
        gc.imports['ζtxt'] = 1;

        let eLength = node.expressions ? node.expressions.length : 0;
        if (node.textFragments.length <= 1 && eLength === 0) {
            // static version
            this.lastParam = node.textFragments.length === 0 ? '""' : encodeText(node.textFragments[0]);
        } else {
            // create static resource
            let staticsIdx = gc.statics.length, pieces: string[] = [], fLength = node.textFragments.length, eCount = 0;
            for (let i = 0; fLength > i; i++) {
                // todo eLength
                pieces.push(encodeText(node.textFragments[i]));
                if (eCount < eLength) {
                    pieces.push('""');
                    eCount++;
                }
            }
            gc.statics.push("ζs" + staticsIdx + " = [" + pieces.join(", ") + "]");
            node["staticsRef"] = this.lastParam = 'ζs' + staticsIdx;
        }
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζtxt(ζ, 5, 3, 0, " Hello World ");
        // or ζtxt(ζ, 5, 3, 0, ζs0);
        let b = this.block;
        body.push(`${b.indent2}ζtxt(${b.jsVarName}, ${this.idx}, ${this.parentIdx}, ${instructionsHolder(this.iHolder)}, ${this.lastParam});\n`);
    }
}

class TextUpdate implements UpdateInstruction {
    lastParam = "";
    constructor(public node: XjsText, public idx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder) {
        this.block.gc.imports['ζtxtval'] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζtxtval(ζ1, 1, 0, ζs0, 1, ζe(ζ, 0, 1, name));
        let b = this.block, ih = instructionsHolder(this.iHolder);
        body.push(`${b.indent}ζtxtval(${b.jsVarName}, ${this.idx}, ${ih}, ${this.node["staticsRef"]}, ${this.node.expressions!.length}, `);
        let eLength = this.node.expressions!.length;
        for (let i = 0; eLength > i; i++) {
            generateExpression(body, this.node.expressions![i], this.block, ih);
            if (i < eLength - 1) {
                body.push(', ');
            }
        }
        body.push(');\n');
    }
}

class EltCreation implements CreationInstruction {
    lastParam = "";
    constructor(public node: XjsElement, public idx: number, public parentIdx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder, public staticArgs: string) {
        let gc = this.block.gc;
        gc.imports['ζelt'] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζelt(ζ1, 3, 1, 0, "span");
        let b = this.block;
        if (this.node.nameExpression) {
            b.gc.error("Name expressions are not yet supported", this.node);
        }
        body.push(`${b.indent2}ζelt(${b.jsVarName}, ${this.idx}, ${this.parentIdx}, ${instructionsHolder(this.iHolder)}, "${this.node.name}"${this.staticArgs});\n`);
    }
}

class ListenerCreation implements CreationInstruction {
    constructor(public node: XjsEvtListener, public idx: number, public parentIdx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder) {
        let gc = this.block.gc;
        gc.imports['ζlistener'] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζlistener(ζ, 2, 1, 0, "click");
        let b = this.block;
        body.push(`${b.indent2}ζlistener(${b.jsVarName}, ${this.idx}, ${this.parentIdx}, ${instructionsHolder(this.iHolder)}, "${this.node.name}");\n`);
    }
}

class HandlerUpdate implements UpdateInstruction {
    constructor(public listener: XjsEvtListener, public block: JsBlockUpdate, public iHolder: InstructionsHolder) {
        block.gc.imports['ζhandler'] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζhandler(ζ, 2, 0, function (e) { doSomething(e.name); });
        let b = this.block, listener = this.listener, idx = listener[$INDEX], ih = instructionsHolder(this.iHolder), args = "";
        if (listener.argumentNames) {
            args = listener.argumentNames.join(",");
        }
        body.push(`${b.indent}ζhandler(${b.jsVarName}, ${idx}, ${ih}, function (${args}) {`);
        body.push(listener);
        body.push(`});\n`);
    }
}

class CptUpdate implements UpdateInstruction {
    constructor(public node: XjsComponent, public idx: number, public parentIdx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder, public staticParamIdx: number) {
        let gc = this.block.gc;
        gc.imports['ζcpt'] = 1;
        if (node.properties && node.properties.length) {
            gc.error("Properties cannot be used on components", node);
        }
    }

    pushCode(body: BodyContent[]) {
        let b = this.block;

        let stParams = (this.staticParamIdx === -1) ? '' : ', ζs' + this.staticParamIdx, ih = instructionsHolder(this.iHolder);
        body.push(`${b.indent}ζcpt(${b.jsVarName}, ${this.idx}, ${ih}, `);
        generateExpression(body, this.node.ref as XjsExpression, this.block, ih);
        body.push(`, ${this.node[$CONTENT_NODE_IDX]}, 0${stParams});\n`);

    }
}

class CptCallUpdate implements UpdateInstruction {
    constructor(public idx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder) {
        block.gc.imports['ζcall'] = 1;
    }

    pushCode(body: BodyContent[]) {
        let b = this.block, ih = instructionsHolder(this.iHolder), lastArg = (ih === 0) ? "" : ", " + ih;
        body.push(`${b.indent}ζcall(${b.jsVarName}, ${this.idx}${lastArg});\n`);
    }
}

class ContentUpdate implements UpdateInstruction {
    constructor(public node: XjsDecorator, parent: XjsComponent | XjsElement | XjsFragment, public idx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder) {
        // manage @content built-in decorator
        let gc = this.block.gc;
        gc.imports['ζcont'] = 1;
        if (parent.kind !== "#element" && parent.kind !== "#fragment") {
            gc.error("@content can only be used on elements or fragments", node);
        }
        if (parent.content && parent.content.length) {
            gc.error("@content can only be used on empty elements or fragments", node);
        }
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζcont(ζ, 2, 0, ζe(ζ, 0, $content));
        let b = this.block, ih = instructionsHolder(this.iHolder), d = this.node, gc = this.block.gc;

        if (d.isOrphan || !d.defaultPropValue) {
            if (gc.templateArgs.indexOf("$content") < 0) {
                gc.error("$content must be defined as template argument to use @content without expressions", d);
            }
        } else if (this.node.defaultPropValue && this.node.defaultPropValue.kind !== "#expression") {
            gc.error("@content value cannot be a " + this.node.defaultPropValue.kind, d);
        } else if (this.node.defaultPropValue && this.node.defaultPropValue.kind === "#expression" && this.node.defaultPropValue.oneTime) {
            gc.error("@content expression cannot use one-time qualifier", d);
        }

        body.push(`${b.indent}ζcont(${b.jsVarName}, ${this.idx}, ${ih}, `);
        if (d.isOrphan || !d.defaultPropValue) {
            generateExpression(body, '$content', this.block, ih);
        } else {
            generateExpression(body, this.node.defaultPropValue as XjsExpression, this.block, ih);
        }
        body.push(`);\n`);
    }
}

class PNodeCreation implements CreationInstruction {
    constructor(public node: XjsParamNode, public idx: number, public parentIdx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder, public staticArgs: string) {
        block.gc.imports['ζpnode'] = 1;
    }
    pushCode(body: BodyContent[]) {
        let b = this.block;
        if (this.node.nameExpression) {
            b.gc.error("Name expressions are not yet supported", this.node);
        }
        let ih = 0;
        if (this.iHolder) {
            ih = instructionsHolder(this.iHolder[$PARENT_INS_HOLDER]);
        }
        body.push(`${b.indent2}ζpnode(${b.jsVarName}, ${this.idx}, ${this.parentIdx}, ${ih}, "${this.node.name}"${this.staticArgs});\n`);
    }
}

class ParamUpdate implements UpdateInstruction {
    funcName: "ζatt" | "ζparam" | "ζprop";

    constructor(public node: XjsParam | XjsProperty, public idx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder, public isAttribute: boolean) {
        this.funcName = isAttribute ? "ζatt" : "ζparam"
        if (node.kind === "#property") {
            this.funcName = "ζprop";
        }
        this.block.gc.imports[this.funcName] = 1;
    }

    pushCode(body: BodyContent[]) {
        // e.g. ζatt(ζ, 2, 0, "title", ζe(ζ, 0, 0, expr(x)));
        let b = this.block, ih = instructionsHolder(this.iHolder);
        body.push(`${b.indent}${this.funcName}(${b.jsVarName}, ${this.idx}, ${ih}, "${this.node.name}", `);
        generateExpression(body, this.node.value as XjsExpression, this.block, ih);
        body.push(');\n');
    }
}

class JsStatementsUpdate implements UpdateInstruction {
    constructor(public node: XjsJsStatements, public block: JsBlockUpdate, public iHolder: InstructionsHolder, public prevKind: string) { }

    pushCode(body: BodyContent[]) {
        let b = this.block;
        body.push((this.prevKind !== "#jsBlock") ? b.indent : " ");
        body.push(this.node);
        if (!this.node.code.match(/\n$/)) {
            body.push("\n");
        }
    }
}

class CleanUpdate implements UpdateInstruction {
    constructor(public idx: number, public block: JsBlockUpdate, public iHolder: InstructionsHolder) {
        let b = this.block;
        // b.gc.imports['ζclean'] = 1;
        b.cleanIndexes.push(idx);
        b.cleanIndexes.push(instructionsHolder(iHolder));
    }

    pushCode(body: BodyContent[]) {
        // let b = this.block;
        // body.push(`${b.indent}ζclean(${b.jsVar}, ${this.idx}, ${instructionsHolder(this.iHolder)});\n`);
    }
}

function encodeText(t: string) {
    // todo replace double \\ with single \
    return '"' + t.replace(RX_DOUBLE_QUOTE, '\\"') + '"';
}

function instructionsHolder(iHolder: InstructionsHolder) {
    if (!iHolder) return 0;
    if (iHolder.kind === "#jsBlock") return 1;
    return iHolder[$CONTENT_NODE_IDX] ? iHolder[$CONTENT_NODE_IDX] : 0;
}

function generateExpression(body: BodyContent[], exp: XjsExpression | string, block: JsBlockUpdate, instructionsHolder: number) {
    if (typeof (exp) !== "string" && exp.oneTime) {
        let ih = instructionsHolder ? ", " + instructionsHolder : "";
        // e.g. ζo(ζ1, 0, ζ1[0].cm? exp() : ζu, 2)
        body.push(`ζo(${block.jsVarName}, ${block.expr1Count++}, ${block.jsVarName}[0].cm? `);
        body.push(exp); // to generate source map
        body.push(` : ζu${ih})`);
        block.gc.imports['ζo'] = 1;
        block.gc.imports['ζu'] = 1;
    } else {
        // e.g. ζe(ζ1, 2, expr())
        if (instructionsHolder === 0) {
            body.push(`ζe(${block.jsVarName}, ${block.exprCount++}, `);
            body.push(exp); // to generate source map
            body.push(')');
        } else {
            // expression has to be deferred and cannot be immediately processed
            // so will be passed as an array: [0, getTitle()]
            // note: context nodes and instruction holder are already passed to the function
            // where the expression is used, this is why they don't need to be passed in the expression array
            if (block.dExpressions[instructionsHolder] === undefined) {
                block.dExpressions[instructionsHolder] = 0;
            } else {
                block.dExpressions[instructionsHolder]++;
            }
            body.push(`[${block.dExpressions[instructionsHolder]}, `);
            body.push(exp); // to generate source map
            body.push(`]`);
        }
        block.gc.imports['ζe'] = 1;
    }
}

function templateStart(indent: string, tf: XjsTplFunction, gc: GenerationCtxt) {
    let lines: string[] = [], argNames = "", classDef = "", args = tf.arguments, argClassName = "", argInit: string[] = [];
    indent = reduceIndent(indent);

    if (args && args.length) {
        let classProps: string[] = [], arg: XjsTplArgument;
        gc.imports["ζv"] = 1;
        argNames = ", $";
        for (let i = 0; args.length > i; i++) {
            arg = args[i];
            if (i === 0 && arg.name === "$") {
                argClassName = arg.typeRef!;
                if (!argClassName) {
                    gc.error("Undefined $ argument type", arg);
                }
            }
            if (arg.name === "$params") {
                argInit.push('$params = $');
            } else if (!argClassName) {
                argInit.push(arg.name + ' = $["' + arg.name + '"]')
                classProps.push((indent + gc.indentIncrement) + "@ζv " + arg.name + ";")
                gc.imports["ζv"] = 1;
            } else if (i > 0) {
                argInit.push(arg.name + ' = $["' + arg.name + '"]');
            }
        }
        if (!argClassName) {
            // default argument class definition
            argClassName = "ζParams";
            gc.imports["ζd"] = 1;
            // sample parameter class:
            // @ζd class ζParams { 
            //     @ζv options;
            // }
            classDef = [indent, "@ζd class ζParams {\n", classProps.join("\n"), "\n", indent, "}"].join("");
        }
    }

    tf["argClassName"] = argClassName;
    lines.push('(function () {');
    if (gc.statics.length) {
        lines.push(`${indent}const ${gc.statics.join(", ")};`);
    }
    if (classDef) {
        lines.push(classDef);
    }
    gc.imports["ζt"] = 1;
    lines.push(`${indent}return ζt(function (ζ${argNames}) {`);
    if (argInit.length) {
        lines.push(`${indent + gc.indentIncrement}let ${argInit.join(", ")};`);
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
