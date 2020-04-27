import { XjsPreProcessor, XjsText, XjsCData, XjsNode, XjsElement, XjsFragment, XjsParam, XjsProperty, XjsDecorator, XjsLabel, XjsJsStatement, XjsComponent, XjsParamNode, XjsExpression, XjsTplFunction, XjsJsBlock } from '../../xjs/types';

export interface IvError {
    kind: "#Error";
    origin: "IVY" | "TS" | "XJS";
    message: string;        // formatted version
    description: string;
    line: number;
    column: number;
    lineExtract: string;
    file: string;
}

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
    preProcessors?: PreProcessorFactories;
}

export type PreProcessorFactories = { [name: string]: () => XjsPreProcessor };

export interface CompilationResult {
    body?: string;                      // template function body
    statics?: any[];                    // statics outside function body
    function?: string;                  // full result function as a string
    importMap?: { [key: string]: 1 },   // imports as a map
}

// Instructions

export enum ContainerType {
    Block = 1,
    Component = 2,
    Async = 3
}

export type ViewKind = "template" | "cptContent" | "paramContent" | "jsBlock" | "asyncBlock";

export interface ViewInstruction {
    gc: GenerationCtxt;
    instructions: any[];
    indent: string;
    nodeCount: number;
    jsVarName: string;         // block variable name - e.g. ζ or ζ1
    cmVarName: string;         // creation mode var name - e.g. ζc or ζc1
    exprCount: number;         // binding expressions count
    expr1Count: number;        // one-time expressions count
    dExpressions: number[];    // list of counters for deferred expressions (cf. ζexp)
    bindingsCount: number;     // counter used by ParamInstruction to count the number of bindings on a component / decorator
    hasChildNodes: boolean;
    childBlockIndexes: number[];
    childViewIndexes: number[];
    paramInstanceVars?: { [paramName: string]: string };    // map of the param node instance variables
    asyncValue: number | XjsExpression;  // async priority;
    update?(indent: string, nodeCount: number, hasChildNodes: boolean, asyncValue: number | XjsExpression, exprCount: number, expr1Count: number, bindingsCount: number, paramInstanceVars?: { [paramName: string]: string });
}

export interface GenerationCtxt {
    init(template:string, options: CompilationOptions): void;
    process(tf: XjsTplFunction): any;
    template: string;
    options: CompilationOptions;
    indentIncrement: string;
    templateName: string;
    filePath: string;
    errorPath: string;
    imports: { [key: string]: 1 };      // map of required imports
    statics: string[];                  // list of static resources
    localVars: { [name: string]: 1 };   // map of creation mode vars
    blockCount: number;                 // number of js blocks - used to increment block variable suffixes
    eachCount: number;                  // number of $each blocks
    templateArgs: string[];             // name of template arguments
    paramCounter: number;               // counter used to create param instance variables
    acceptPreProcessors: boolean;
    error(msg: string, nd: XjsNode): void;
    decreaseIndent(indent: string): string;

    addTxtInstruction(node: XjsText | XjsCData, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string): void;
    addXmlNsInstruction(view: ViewInstruction, iFlag: number, startInstruction: boolean, xmlns: string): void;
    addEltInstruction(node: XjsElement, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string, staticArgs: string): void;
    addFraInstruction(node: XjsFragment | null, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number): void;
    addParamInstruction(parentView: ViewInstruction, node: XjsParam | XjsProperty | XjsDecorator, idx: number, view: ViewInstruction, iFlag: number, isAttribute: boolean, indent: string, targetParamNode: boolean): void;
    addDecoInstruction(node: XjsDecorator, idx: number, parentIdx: number, view: ViewInstruction, iFlag: number, indent: string, staticsIdx: number, staticLabels: string): DecoInstruction;
    addLblInstruction(node: XjsLabel, idx: number, view: ViewInstruction, iFlag: number, indent: string): void;
    addJsStatementsInstruction(node: XjsJsStatement, view: ViewInstruction, iFlag: number, prevKind: string): void;
    addCntInstruction(idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, type: ContainerType): void;
    addCptInstruction(node: XjsComponent, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string, callImmediately: boolean, staticParamIdx: number): CptInstruction;
    addPndInstruction(parentView: ViewInstruction, node: XjsParamNode, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string, staticParamIdx: number, indent: string, parentIndex: number, instanceVarName: string, hasEndInstruction: boolean): PndInstruction;
    addEvtInstruction(decorator: XjsDecorator, name: string, idx: number, parentIdx, view: ViewInstruction, iFlag: number): void;
    addInsInstruction(node: XjsDecorator, parent: XjsComponent | XjsElement | XjsFragment, idx: number, view: ViewInstruction, iFlag: number): void;
    addViewInstruction(instructionsView: ViewInstruction | null, kind: ViewKind, node: XjsTplFunction | XjsJsBlock | XjsElement | XjsFragment | XjsComponent, idx: number, parentView: ViewInstruction | null, iFlag: number, generationCtxt?: GenerationCtxt, indent?: string): ViewInstruction;
}

export interface CptInstruction {
    idx: number;
    dynamicPNodeNames: string[];
    callImmediately: boolean;
    addEndInstruction(): void;
}

export interface PndInstruction {
    idx: number;
    dynamicPNodeNames: string[];
    addEndInstruction(): void;
}

export interface DecoInstruction {
    addEndInstruction(): void;
}
