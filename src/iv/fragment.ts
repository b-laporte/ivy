import { IvDocument, IvFragment, IvTemplate } from './types';
import { compileTemplate } from './compiler/processor';
import { CodeGenerator } from './compiler/generator';
import { runtime, IvElement, required, API, decorator, defaultParam } from '.';
import { IvEventEmitter } from './events';
import { Data, version, watch } from '../trax';
import { PreProcessorFactories } from './compiler/types';

const U = undefined, KIND_FRAGMENT = "$fragment", COMPILE_TEMPLATE = "ζtemplate";


@Data class Fragment {
    kind: string = KIND_FRAGMENT;
    template: string = "";
}

/**
 * Create an IvFragment out of a $fragment template string
 * e.g. const foo = `Some Text ${v}...` where v can be a string or another IvFragment
 * @param strings the static part of the template string
 * @param keys the values in the template string - can be IvFragment or anything that can be converted to a string
 */
export function $fragment(strings: TemplateStringsArray, ...keys: any[]): IvFragment {
    const f = new Fragment();
    if (keys.length === 0) {
        f.template = strings[0];
        return f as IvFragment;
    }
    const buf: string[] = [], len1 = strings.length, len2 = keys.length;
    for (let i = 0; len1 > i; i++) {
        buf.push(strings[i]);
        if (i < len2) {
            buf.push(keys[i].kind === KIND_FRAGMENT ? keys[i].template : keys[i]);
        }
    }
    f.template = buf.join("");
    return f as IvFragment;
}

interface RenderOptions {
    doc?: IvDocument;
    // timeout?: number;
    preProcessors?: PreProcessorFactories;
}

export async function renderFragment(f: IvFragment, htmlElement: any, context?: { [ref: string]: any }, options?: RenderOptions): Promise<IvTemplate> {
    // note: another CodeGenerator (e.g. Interpreter implementing GenerationCtxt) 
    //       could be developed to avoid using new Function
    if (f.kind !== "$fragment") {
        throw "Invalid $fragment template";
    }
    if (f.createInstance === U || f[COMPILE_TEMPLATE] !== f.template) {
        const r = await compileTemplate(f.template, new CodeGenerator(), {
            templateName: "testTpl",
            filePath: "[$fragment string]",
            statics: true,
            function: true,
            templateType: "$fragment",
            preProcessors: options ? options.preProcessors : undefined
        });
        const mainFn = new Function("ζr", r.function || ""); // ζr is ivy runtime
        f.createInstance = mainFn(runtime);
        f[COMPILE_TEMPLATE] = f.template;
    }

    const instance = f.createInstance!();
    if (options && options.doc) {
        instance["document"] = options.doc; // inject document object (test)
    }
    instance.attach(htmlElement);
    instance.render(context !== U ? { context: context } : U);
    return instance;
}


@API class FragmentAPI {
    @defaultParam @required value: any; //IvFragment;
    // fragment?: any; // XtrFragment; -> non trax interfaces cannot be used in @API and @Data
    // todo: support timeout;
    context?: { [key: string]: any };
    doc?: IvDocument;
    @required $targetElt: IvElement;
    completeEmitter: IvEventEmitter;
}
export const fragment = decorator(FragmentAPI, ($api: FragmentAPI) => {
    let frgMode = false, firstRender = true, currentIvFrg: IvFragment, instance: IvTemplate | undefined, lastFragmentTpl = "";

    return {
        async $render() {
            if (firstRender) {
                firstRender = false;
                if ($api.value !== undefined) {
                    frgMode = true;
                    await render($api.value);
                } else {
                    throw "Missing value param";
                }
            } else {
                if (frgMode) {
                    if ($api.value === currentIvFrg && $api.value.template === lastFragmentTpl) {
                        // update context
                        if (instance !== U) {
                            instance.render({ context: $api.context });
                        }
                    } else {
                        if (instance) {
                            instance.dispose();
                        }
                        await render($api.value);
                    }
                }
            }
        }
    }

    async function render(f: IvFragment) {
        currentIvFrg = f;
        if (f === U || f.kind !== "$fragment") {
            throw "@fragment value must be a $fragment object";
        }
        instance = await renderFragment(f, $api.$targetElt, $api.context, { doc: $api.doc });
        lastFragmentTpl = f.template; // template may be changed
        $api.completeEmitter.emit();
    }
});


// class Interpreter implements GenerationCtxt {
//     template: string;
//     options: CompilationOptions;
//     indentIncrement: string;
//     templateName: string;
//     filePath: string;
//     errorPath: string;
//     imports: { [key: string]: 1 };      // map of required imports
//     statics: string[];                  // list of static resources
//     localVars: { [name: string]: 1 };   // map of creation mode vars
//     blockCount: number;                 // number of js blocks - used to increment block variable suffixes
//     eachCount: number;                  // number of $each blocks
//     templateArgs: string[];             // name of template arguments
//     paramCounter: number;               // counter used to create param instance variables
//     acceptPreProcessors: boolean;

//     init(template: string, options: CompilationOptions) {
//         this.template = template;
//         this.options = options;
//     }

//     process(root: XjsTplFunction | XjsFragment) {
//         if (root.kind === "#tplFunction") {
//             this.error("Invalid $fragment string", root);
//             return;
//         }

//         console.log("todo: process fragment")
//     }

//     error(msg: string, nd: XjsNode) {
//         console.log("[$fragment] error", msg);
//     }

//     decreaseIndent(indent: string) {
//         return ""
//     }

//     addTxtInstruction(node: XjsText | XjsCData, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string) { }
//     addXmlNsInstruction(view: ViewInstruction, iFlag: number, startInstruction: boolean, xmlns: string) { }
//     addEltInstruction(node: XjsElement, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string, staticArgs: string) { }
//     addFraInstruction(node: XjsFragment | null, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number) { }
//     addParamInstruction(parentView: ViewInstruction, node: XjsParam | XjsProperty | XjsDecorator, idx: number, view: ViewInstruction, iFlag: number, isAttribute: boolean, indent: string, targetParamNode: boolean) { }
//     addDecoInstruction(node: XjsDecorator, idx: number, parentIdx: number, view: ViewInstruction, iFlag: number, indent: string, staticsIdx: number, staticLabels: string): DecoInstruction {
//         return {
//             addEndInstruction: noop
//         }
//     }
//     addLblInstruction(node: XjsLabel, idx: number, view: ViewInstruction, iFlag: number, indent: string) { }
//     addJsStatementsInstruction(node: XjsJsStatement, view: ViewInstruction, iFlag: number, prevKind: string) { }
//     addCntInstruction(idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, type: ContainerType) { }
//     addCptInstruction(node: XjsComponent, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string, callImmediately: boolean, staticParamIdx: number): CptInstruction {
//         return {
//             idx: 0,
//             dynamicPNodeNames: [],
//             callImmediately: true,
//             addEndInstruction: noop
//         }
//     }
//     addPndInstruction(parentView: ViewInstruction, node: XjsParamNode, idx: number, view: ViewInstruction, iFlag: number, parentLevel: number, staticLabels: string, staticParamIdx: number, indent: string, parentIndex: number, instanceVarName: string, hasEndInstruction: boolean): PndInstruction {
//         return {
//             idx: 0,
//             dynamicPNodeNames: [],
//             addEndInstruction: noop
//         }
//     }
//     addEvtInstruction(decorator: XjsDecorator, name: string, idx: number, parentIdx, view: ViewInstruction, iFlag: number) { }
//     addInsInstruction(node: XjsDecorator, parent: XjsComponent | XjsElement | XjsFragment, idx: number, view: ViewInstruction, iFlag: number) { }
//     addViewInstruction(instructionsView: ViewInstruction | null, kind: ViewKind, node: XjsTplFunction | XjsJsBlock | XjsElement | XjsFragment | XjsComponent, idx: number, parentView: ViewInstruction | null, iFlag: number, generationCtxt?: GenerationCtxt, indent?: string): ViewInstruction {
//         return {
//             gc: this,
//             instructions: [],
//             indent: indent || "",
//             nodeCount: 0,
//             jsVarName: "",        // block variable name - e.g. ζ or ζ1
//             cmVarName: "",        // creation mode var name - e.g. ζc or ζc1
//             exprCount: 0,         // binding expressions count
//             expr1Count: 0,        // one-time expressions count
//             dExpressions: [],     // list of counters for deferred expressions (cf. ζexp)
//             bindingsCount: 0,     // counter used by ParamInstruction to count the number of bindings on a component / decorator
//             hasChildNodes: false,
//             childBlockIndexes: [],
//             childViewIndexes: [],
//             asyncValue: 0
//         }
//     }
// }
