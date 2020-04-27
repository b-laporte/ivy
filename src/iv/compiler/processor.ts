import { CodeGenerator } from './generator';
import { XjsTplFunction, XjsContentNode, XjsNodeParam, XjsExpression, XjsElement, XjsParam, XjsCData, XjsProperty, XjsFragment, XjsJsStatement, XjsJsBlock, XjsComponent, XjsParamNode, XjsNode, XjsTplArgument, XjsText, XjsDecorator, XjsLabel } from '../../xjs/types';
import { parse, XjsParserContext } from '../../xjs/parser';
import { validator } from './validator';
import { CompilationOptions, CompilationResult, GenerationCtxt, ContainerType, DecoInstruction, CptInstruction, PndInstruction, ViewKind, ViewInstruction } from './types';

const U = undefined,
    RX_DOUBLE_QUOTE = /\"/g,
    RX_BACKSLASH = /\\/g,
    RX_CR = /\n/g,
    RX_LOG = /\/\/\s*log\s*/,
    RX_EVT_HANDLER_DECORATOR = /^on(\w+)$/,
    PARAM_VALUE = "paramValue", // @paramValue reserved decorator
    ASYNC = "async",
    SVG = "svg",
    XMLNS = "xmlns",
    XMLNS_VALUES = {
        "xhtml": "http://www.w3.org/1999/xhtml",
        "html": "http://www.w3.org/1999/xhtml",
        "svg": "http://www.w3.org/2000/svg",
        "mathml": "http://www.w3.org/1998/mathml"
    };

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
        console.log("TODO: $fragment root")
        throw "todo"
    }
    let gc = new CodeGenerator();
    gc.init(template, options);
    let res = gc.process(root);

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

function encodeText(t: string) {
    return '"' + t.replace(RX_BACKSLASH, "\\\\").replace(RX_DOUBLE_QUOTE, '\\"').replace(RX_CR, "\\n") + '"';
}


// ---------------------------------------------------------------------------------

export class ViewBlock {
    gc: GenerationCtxt;
    vi: ViewInstruction;
    nodeCount = 0;
    instructions: any[] = [];
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

    constructor(instructionsBlock: ViewBlock | null, public kind: ViewKind, public node: XjsTplFunction | XjsJsBlock | XjsElement | XjsFragment | XjsComponent, public idx: number, public parentView: ViewBlock | null, public iFlag: number, generationCtxt: GenerationCtxt, indent?: string) {
        let vi = generationCtxt.addViewInstruction(instructionsBlock, kind, node, idx, parentView, iFlag, generationCtxt, indent);
        this.vi = vi;
        this.gc = vi.gc as any;
        this.instructions = vi.instructions;
        this.indent = vi.indent;
        this.nodeCount = vi.nodeCount;
        this.jsVarName = vi.jsVarName;
        this.cmVarName = vi.cmVarName;
        this.hasChildNodes = vi.hasChildNodes;
        this.childBlockIndexes = vi.childBlockIndexes;
        this.childViewIndexes = vi.childViewIndexes;
        this.paramInstanceVars = vi.paramInstanceVars;
        this.asyncValue = vi.asyncValue;
        this.exprCount = vi.exprCount;
        this.expr1Count = vi.expr1Count;
        this.dExpressions = vi.dExpressions;
        this.bindingsCount = vi.bindingsCount;
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
                    this.gc.addFraInstruction(null, 0, this, this.iFlag, pLevel);
                    pLevel = 1;
                }
            }

            this.scanContent(content, pLevel, this.iFlag);
        }

        if (this.vi.update) {
            this.vi.update(this.indent, this.nodeCount, this.hasChildNodes, this.asyncValue, this.exprCount, this.expr1Count, this.bindingsCount, this.paramInstanceVars);
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
                this.gc.addTxtInstruction(nd as XjsText | XjsCData, idx, this, iFlag, parentLevel, "0");
                break;
            case "#fragment":
                if (!this.processAsyncCase(nd as XjsFragment, idx, parentLevel, prevKind, nextKind)) {
                    xmlns = this.retrieveXmlNs(nd as XjsFragment);
                    if (xmlns) {
                        this.gc.addXmlNsInstruction(this, iFlag, true, xmlns);
                    }
                    this.gc.addFraInstruction(nd, idx, this, iFlag, parentLevel);
                    const dis = this.generateDecoratorInstructions(nd, idx, iFlag);
                    processContent(this, nd.content);
                    processDecoInstructions(this, dis);
                }
                break;
            case "#element":
                if (!this.processAsyncCase(nd as XjsElement, idx, parentLevel, prevKind, nextKind)) {
                    xmlns = this.retrieveXmlNs(nd as XjsElement);
                    if (xmlns) {
                        this.gc.addXmlNsInstruction(this, iFlag, true, xmlns);
                    }
                    this.gc.addEltInstruction(nd as XjsElement, idx, this, iFlag, parentLevel, this.generateLabelStatics(nd as XjsElement), stParams);
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
                    let ci = this.gc.addCptInstruction(nd as XjsComponent, idx, this, iFlag, parentLevel, this.generateLabelStatics(nd as XjsComponent), callImmediately, i1);
                    if (containsParamExprOrDecorators) {
                        this.generateParamInstructions(nd as XjsComponent, idx, iFlag, false, this);
                    }
                    const dis = this.generateDecoratorInstructions(nd, idx, iFlag, false, true);
                    this.generateDynLabelInstructions(nd as XjsComponent, idx, iFlag, this);
                    if (nd.content && nd.content.length) {
                        let vi = new ViewBlock(this, "cptContent", nd as XjsComponent, idx, this, 1, this.gc);
                        vi.contentParentInstruction = ci;
                        vi.cptIFlag = iFlag; // used by sub param Nodes to have the same value
                        vi.cpnParentLevel = parentLevel;
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
                        ci.addEndInstruction();
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
                let v: ViewBlock = this, cptIFlag = 0, cpnParentLevel = 0, name = (nd as XjsParamNode).name;
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

                let v2: ViewBlock | null = this, inJsBlock = false, contentParentView: ViewBlock | null = null;
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
                    pi = this.gc.addPndInstruction(this, nd as XjsParamNode, newIdx, v, cptIFlag, cpnParentLevel + 1, "0", i1, this.indent, parentIdx, instanceVarName, hasContent);
                this.generateParamInstructions(nd as XjsParamNode, newIdx, cptIFlag, false, v);
                this.createListeners(nd as XjsParamNode, newIdx, cptIFlag, v);

                if (hasContent) {
                    let vi = new ViewBlock(this, "paramContent", nd as XjsParamNode, newIdx, v, 1, this.gc);
                    vi.indent = this.indent;
                    vi.contentParentInstruction = pi;
                    vi.cpnParentLevel = cpnParentLevel + 1;
                    vi.scan();
                    pi.addEndInstruction();
                }
                break;
            case "#jsStatement":
                this.gc.addJsStatementsInstruction(nd, this, iFlag, prevKind);
                break;
            case "#jsBlock":
                if (!this.childBlockCreated[idx]) {
                    // create all adjacent block containers at once
                    let siblingNd: XjsContentNode, count = 0;
                    for (let i = siblingIdx; siblings.length > i; i++) {
                        siblingNd = siblings[i];
                        if (siblingNd.kind === "#jsBlock") {
                            this.gc.addCntInstruction(idx + count, this, this.iFlag, parentLevel, ContainerType.Block);
                            this.childBlockCreated[idx + count] = true;
                        } else {
                            break;
                        }
                        count++;
                    }
                }
                this.childBlockIndexes.push(idx);
                let jsb = new ViewBlock(this, "jsBlock", nd, idx, this, this.iFlag ? this.iFlag + 1 : 0, this.gc);
                jsb.prevKind = prevKind;
                jsb.nextKind = nextKind;
                jsb.scan();
                break;
            case "#tplFunction":
                this.gc.error("$template statements are not supported yet", nd);
                break;
        }

        function processContent(vi: ViewBlock, content?: XjsContentNode[]) {
            if (content) {
                vi.scanContent(content, parentLevel + 1, iFlag);
                if (xmlns) {
                    vi.gc.addXmlNsInstruction(vi, iFlag, false, xmlns);
                }
            }
        }

        function processDecoInstructions(vi: ViewBlock, dis?: DecoInstruction[]) {
            if (dis) for (let i = 0; dis.length > i; i++) {
                dis[i].addEndInstruction();
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

    generateParamInstructions(nd: XjsFragment | XjsDecorator, idx: number, iFlag: number, isAttribute: boolean, view: ViewBlock) {
        // dynamic params / attributes
        const params = nd.params;
        if (params === U) return;
        const isParamNode = nd.kind === "#paramNode";
        for (let p of params) {
            if (p.kind === "#param" || p.kind === "#property") {
                if (p.value && (p.value as XjsExpression).kind === "#expression") {
                    this.gc.addParamInstruction(this, p, idx, view, iFlag, isAttribute, this.indent, isParamNode);
                }
            } else if (isParamNode && p.kind === "#decorator") {
                let d = p as XjsDecorator;
                if (d.ref.code === PARAM_VALUE) {
                    this.gc.addParamInstruction(this, d, idx, view, iFlag, false, this.indent, true);
                }
            }
        }
    }

    generateDynLabelInstructions(nd: XjsFragment | XjsComponent | XjsDecorator, idx: number, iFlag: number, view: ViewBlock) {
        // dynamic labels
        if (nd.params !== U) {
            for (let lbl of nd.params) if (lbl.kind === "#label" && !lbl.isOrphan && lbl.value && !lbl.fwdLabel) {
                this.gc.addLblInstruction(lbl, idx, view, iFlag, this.indent);
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
            this.gc.addCntInstruction(idx, this, this.iFlag, parentLevel, ContainerType.Async);
            let av = new ViewBlock(this, "asyncBlock", nd, idx, this, this.iFlag ? this.iFlag + 1 : 0, this.gc);
            av.setAsync(asyncValue);
            av.prevKind = prevKind;
            av.nextKind = nextKind;
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
                            this.gc.addInsInstruction(p, nd as XjsElement | XjsFragment, idx, this, iFlag);
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
                        decoInstr = this.gc.addDecoInstruction(p, decoIdx, idx, this, iFlag, this.indent, sIdx, this.generateLabelStatics(p));
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
    createListeners(nd: XjsElement | XjsComponent | XjsParamNode | XjsDecorator, parentIdx: number, iFlag: number, view: ViewBlock): boolean {
        if (nd.params === U) return false;
        let name: string, result = false;
        for (let p of nd.params) if (p.kind === "#decorator") {
            name = p.ref.code;
            if (name.match(RX_EVT_HANDLER_DECORATOR)) {
                this.gc.addEvtInstruction(p, RegExp.$1, view.nodeCount++, parentIdx, view, iFlag);
                result = true;
            }
        }
        return result;
    }
}
