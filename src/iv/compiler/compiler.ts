import { XjsFragment, XjsPreProcessor } from './../../xjs/types';
import * as ts from "typescript";
import { compileTemplate } from './generator';
import { generate } from '../../trax/compiler/generator';
import { DataMember } from '../../trax/compiler/types';
import { validator } from './validator';
import { IvError } from './types';
import { parse, XjsParserContext, toString } from '../../xjs/parser';

const enum CHANGES {
    TEMPLATE = 1,
    CONTENT = 2
}

const SK = ts.SyntaxKind,
    RX_START_WS = /^(\s*)/,
    RX_IGNORE_FILE = /[\n\s]*\/\/\s*iv:ignore/,
    RX_LOG_ALL = /\/\/\s*ivy?\:\s*log[\-\s]?all/,
    RX_LOG = /\/\/\s*ivy?\:\s*log/,
    RX_BACK_TICK = /\`/g,
    RX_DOLLAR = /\$/g,
    RX_LIST = /List$/,
    IV_INTERFACES = ["IvContent", "IvTemplate", "IvLogger", "IvElement", "IvDocument"],
    CR = "\n",
    TEMPLATE_TAG = "$template",
    CONTENT_TAG = "$content",
    SEPARATOR = "----------------------------------------------------------------------------------------------------";

export interface ProcessOptions {
    filePath: string;
    // preProcessors?: XtrPreProcessorDictionary;
    logErrors?: boolean;
}

export async function process(source: string, options: ProcessOptions) {
    let ivyResult: CompilationResult | undefined, result: string = "", logAll = !!source.match(RX_LOG_ALL);
    const resourcePath = options.filePath;

    try {
        // ivy processing
        ivyResult = await compile(source, { filePath: resourcePath }); // , preProcessors: options.preProcessors
        result = ivyResult.fileContent;
        log("Ivy: Template Processing");

        // trax processing for ivy api classes
        result = generate(result, resourcePath, {
            symbols: { Data: "ζΔD", /* todo: ref, computed */ },
            libPrefix: "ζ",
            interfaceTypes: IV_INTERFACES,
            validator: listValidator,
            logErrors: false
        });
        log("Ivy: Generated Param Classes Processing");

        // trax processing for ivy template API classes
        result = generate(result, resourcePath, {
            symbols: { Data: "API" },
            acceptMethods: true,
            replaceDataDecorator: false,
            interfaceTypes: IV_INTERFACES,
            libPrefix: "ζ",
            logErrors: false
        });
        log("Ivy: API Classes Processing");

        // trax processing for ivy template controller classes
        result = generate(result, resourcePath, {
            symbols: { Data: "Controller" },
            acceptMethods: true,
            replaceDataDecorator: false,
            interfaceTypes: IV_INTERFACES,
            libPrefix: "ζ",
            logErrors: false
        });
        log("Ivy: Controller Classes Processing");

        // trax processing for normal Data Objects
        result = generate(result, resourcePath, {
            interfaceTypes: IV_INTERFACES,
            logErrors: false
        });
        log("Ivy: Generated Code", !!source.match(RX_LOG));
    } catch (e) {
        if (ivyResult && e.kind === "#Error") {
            let err = e as IvError;
            // shift line numbers
            err.line = ivyResult.convertLineNbr(e.line);
            if (!err.description) {
                err.description = err.message;
                err.message = validator.getErrorMessage(err.origin, err.description, err.file, err.line, err.column, err.lineExtract);
            }
        }
        if (options.logErrors !== false) {
            let err = e as IvError, msg: string;
            if (err.kind === "#Error") {
                let ls = "  >  ";
                msg = `${ls} ${err.origin}: ${e.description}\n`
                    + `${ls} File: ${e.file} - Line ${e.line} / Col ${e.column}\n`
                    + `${ls} Extract: >> ${e.lineExtract} <<`;
            } else {
                msg = e.message || e;
            }
            console.error(`\n${SEPARATOR}\n${msg}\n${SEPARATOR}`);

            // if (result) {
            //     console.log(`\n${SEPARATOR}`);
            //     console.log("// Last code generation: " + resourcePath);
            //     console.log(result)
            //     console.log(`${SEPARATOR}`);
            // }
        }
        throw e;
    }

    return result;

    function log(title: string, forceLog = false) {
        if (logAll || forceLog) {
            console.log(SEPARATOR);
            console.log(title);
            console.log(result);
        }
    }
}

function listValidator(m: DataMember) {
    if (m && m.type && m.type.kind === "array") {
        if (!m.name.match(RX_LIST)) {
            return "Array properties should use the List suffix, e.g. " + m.name + "List";
        }
    }
    return null;
}

export interface CompilationResult {
    fileContent: string;
    convertLineNbr: (newLineNbr: number) => number;
}

export interface CompilationOptions {
    filePath: string;
    preProcessors?: { [name: string]: () => XjsPreProcessor };
}

export async function compile(source: string, pathOrOptions: string | CompilationOptions): Promise<CompilationResult> {
    // ignore files starting with iv:ignore comment
    if (source.match(RX_IGNORE_FILE)) return { fileContent: source, convertLineNbr: sameLineNbr };

    const filePath = (typeof pathOrOptions === "string") ? pathOrOptions : pathOrOptions.filePath;
    const preProcessors = (typeof pathOrOptions === "string") ? undefined : pathOrOptions.preProcessors;

    let srcFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.ES2015, /*setParentNodes */ true);

    let importStart = -1,                       // start of import clause - i.e. { template, xx, yy } in the import declaration
        importEnd = 0,                          // end of import clause
        importIds: { [key: string]: 1 } = {},   // map or import identifiers - e.g. { template:1, xx:1, yy:1 }
        changes: { start: number, end: number, src: string, type: CHANGES }[] = [];

    let diagnostics = srcFile['parseDiagnostics'];
    if (diagnostics && diagnostics.length) {
        let d: ts.Diagnostic = diagnostics[0] as any;
        validator.throwError(d.messageText.toString(), d.start || -1, source, filePath, "TS");
    }

    scan(srcFile);

    return await generateNewFile(filePath);

    function error(msg: string, pos: number) {
        validator.throwError(msg, pos, source, filePath, "IVY");
    }

    function scan(node: ts.Node) {
        checkNode(node);
        ts.forEachChild(node, scan);
    }

    function checkNode(node: ts.Node) {
        if (node.kind === SK.ImportDeclaration) {
            // check for template import 
            let id = node as ts.ImportDeclaration,
                // modulePath = id.moduleSpecifier.getText(),
                isTemplateImport = false;

            if (id.importClause && id.importClause.namedBindings) {
                id.importClause.namedBindings!.forEachChild((nd: ts.Node) => {
                    if (nd.kind === SK.ImportSpecifier && (nd as ts.ImportSpecifier).name.getText() === TEMPLATE_TAG) {
                        isTemplateImport = true;
                    }
                });
                if (isTemplateImport) {
                    id.importClause.namedBindings!.forEachChild((nd: ts.Node) => {
                        importIds[nd.getText()] = 1;
                    });
                }
            }
            if (isTemplateImport) {
                let txt = id.importClause!.getFullText(), offset = 0;;
                if (txt.match(RX_START_WS)) {
                    offset = RegExp.$1.length;
                }
                importStart = id.importClause!.pos + offset;
                importEnd = id.importClause!.end;
            }

        } else if (node.kind === SK.TaggedTemplateExpression) {
            const tt = node as ts.TaggedTemplateExpression, name = tt.tag.getText();
            let nbrOfArgs = 0;
            if (name === TEMPLATE_TAG) {
                if (tt.template.getChildCount() > 1) {
                    nbrOfArgs = tt.template.getChildAt(1).getChildCount();
                    if (nbrOfArgs > 0) {
                        error("$template strings don't accept dynamic values", node.pos); // todo: line number?
                    }
                }
                changes.push({
                    start: getNodePos(node),
                    end: node.end,
                    src: tt.template.getText().slice(1, -1),
                    type: CHANGES.TEMPLATE
                });
            } else if (name === CONTENT_TAG) {
                let nbrOfArgs = 0;
                if (tt.template.getChildCount() > 1) {
                    nbrOfArgs = tt.template.getChildAt(1).getChildCount();
                }

                if (nbrOfArgs === 0) {
                    // this template has no arguments and can be statically analysed
                    changes.push({
                        start: getNodePos(node),
                        end: node.end,
                        src: tt.template.getText().slice(1, -1),
                        type: CHANGES.CONTENT
                    });
                }
            }
        }
    }

    function getNodePos(node: ts.Node) {
        return (node.getFullText().match(/^\s/)) ? node.pos + 1 : node.pos; // +1 to keep the first white space in the generated code
    }

    async function generateNewFile(filePath: string): Promise<CompilationResult> {
        if (!changes.length) {
            return { fileContent: source, convertLineNbr: sameLineNbr };
        }
        let slices: string[] = [], pos = 0, carriageReturns: number[] = [];

        // part before import
        addSlice(source.substring(0, importStart));

        // import section
        addSlice("", source.substring(importStart, importEnd)); // "" will be replaced after the template processing
        pos = importEnd;

        let paths = filePath.split(/\/|\\/);
        if (paths.length > 2) {
            filePath = ".../" + paths[paths.length - 2] + "/" + paths[paths.length - 1];
        }

        // manage templates
        let len = changes.length, chg: any, lastSlice: string, colOffset: number, tplName = "";

        for (let i = 0; len > i; i++) {
            chg = changes[i];

            addSlice(source.substring(pos, chg.start)); //+ 1
            lastSlice = slices[slices.length - 1]!;
            colOffset = lastSlice.length - lastSlice.lastIndexOf(CR);
            if (chg.type === CHANGES.TEMPLATE) {
                if (importStart < 0) {
                    error("Missing '$template' import statement", 0);
                }
                colOffset += 10; // 10 = length of "$template`"

                if (lastSlice.match(/(\$?\w+)[\s\n]*\=[\s\n]*$/)) {
                    tplName = RegExp.$1;
                } else {
                    tplName = "";
                }
                let r = await compileTemplate(chg.src, {
                    templateName: tplName,
                    function: true,
                    importMap: importIds,
                    filePath: filePath,
                    lineOffset: getLineNumber(chg.start + 1) - 1,
                    columnOffset: colOffset,
                    preProcessors: preProcessors
                });
                addSlice(r.function!, chg.src);
            } else {
                // $content template
                const li = validator.getLineInfo(source, chg.start);
                addSlice(await processContentString(chg.src, filePath, li.lineNbr, li.columnNbr, preProcessors), chg.src);
            }
            pos = chg.end;
        }

        // last part
        addSlice(source.substring(pos));

        // import insertion
        if (importStart > -1) {
            let imp: string[] = [];
            for (let k in importIds) if (importIds.hasOwnProperty(k)) {
                imp.push(k);
            }
            slices[1] = '{ ' + imp.join(", ") + ' }'; // new import
        }

        return { fileContent: slices.join(""), convertLineNbr: getLineNbr };


        function addSlice(newFragment: string, oldFragment?: string) {
            slices.push(newFragment);
            let crs = newFragment.split(CR).length - 1;
            carriageReturns.push(crs);
            if (oldFragment === undefined) {
                carriageReturns.push(crs);
            } else {
                carriageReturns.push(oldFragment.split(CR).length - 1);
            }
        }

        function getLineNbr(newLineNbr: number): number {
            let idx = 0, oldCRs = 0, newCRs = 0, newCount = 0, oldCount = 0, target = newLineNbr - 1;
            while (idx < carriageReturns.length) {
                newCRs = carriageReturns[idx];
                oldCRs = carriageReturns[idx + 1];
                if (newCount + newCRs < target) {
                    newCount += newCRs;
                    oldCount += oldCRs;
                } else {
                    return 1 + oldCount + target - newCount;
                }
                idx += 2;
            }
            return newLineNbr;
        }
    }

    function getLineNumber(pos: number) {
        let src2 = source.substring(0, pos);
        return src2.split("\n").length;
    }

    function sameLineNbr(newLineNbr: number): number {
        return newLineNbr;
    }

    async function processContentString(src: string, filePath: string, lineNbr: number, colNbr: number, preProcessors?: { [name: string]: () => XjsPreProcessor }): Promise<string> {
        const ctxt: XjsParserContext = {
            fileId: filePath,
            preProcessors: preProcessors,
            line1: lineNbr,
            col1: colNbr,
            templateType: "$content"
        };

        const root = await parse(src, ctxt) as XjsFragment;
        return "`" + toString(root, "").replace(RX_BACK_TICK, "\\`").replace(RX_DOLLAR, "\\$") + "`";
    }
}