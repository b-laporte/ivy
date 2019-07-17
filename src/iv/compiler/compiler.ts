import * as ts from "typescript";
import { compileTemplate } from './generator';
import { generate } from '../../trax/trax/compiler/generator';
import { DataMember } from '../../trax/trax/compiler/types';

const SK = ts.SyntaxKind,
    TEMPLATE = "template",
    RX_START_WS = /^(\s*)/,
    RX_IGNORE_FILE = /[\n\s]*\/\/\s*iv:ignore/,
    RX_LOG_ALL = /\/\/\s*ivy?\:\s*log[\-\s]?all/,
    RX_LOG = /\/\/\s*ivy?\:\s*log/,
    RX_LIST = /List$/,
    SEPARATOR = "---------------------------------------------------------------";

export async function process(source: string, resourcePath: string) {
    let result: string;
    // ivy processing
    try {
        result = await compile(source, resourcePath);
    } catch (e) {
        throw new Error(e.message);
    }

    let logAll = source.match(RX_LOG_ALL) !== null;

    if (logAll) {
        console.log(SEPARATOR);
        console.log("Ivy: Template Processing");
        console.log(result);
    }

    // trax processing for ivy api classes
    try {
        result = generate(result, resourcePath, { symbols: { Data: "ζΔD", /* todo: ref, computed */ }, libPrefix: "ζ", validator: listValidator });
    } catch (e) {
        throw new Error(e.message);
    }

    if (logAll) {
        console.log(SEPARATOR);
        console.log("Ivy: Generated Param Classes Processing");
        console.log(result);
    }

    // trax processing for ivy template API classes
    let r1 = result
    try {
        result = generate(result, resourcePath, { symbols: { Data: "API" }, ignoreFunctionProperties: true, acceptMethods: true, replaceDataDecorator: false, libPrefix: "ζ" });
    } catch (e) {
        throw new Error(e.message);
    }

    if (logAll) {
        console.log(SEPARATOR);
        console.log("Ivy: API Classes Processing");
        console.log(result);
    }

    // trax processing for ivy template controller classes
    try {
        result = generate(result, resourcePath, { symbols: { Data: "Controller" }, acceptMethods: true, replaceDataDecorator: false, libPrefix: "ζ" });
    } catch (e) {
        throw new Error(e.message);
    }

    if (logAll) {
        console.log(SEPARATOR);
        console.log("Ivy: Controller Classes Processing");
        console.log(result);
    }

    // trax processing for normal Data Objects
    try {
        result = generate(result, resourcePath);
    } catch (e) {
        throw new Error(e.message);
    }

    if (logAll || source.match(RX_LOG)) {
        console.log(SEPARATOR);
        console.log("Ivy: Generated Code");
        console.log(result);
    }

    return result;
}

function listValidator(m: DataMember) {
    if (m && m.type && m.type.kind === "array") {
        if (!m.name.match(RX_LIST)) {
            return "Array properties should use the List suffix, e.g. " + m.name + "List";
        }
    }
    return null;
}

export async function compile(source: string, filePath: string): Promise<string> {
    // ignore files starting with iv:ignore comment
    if (source.match(RX_IGNORE_FILE)) return source;

    let srcFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.ES2015, /*setParentNodes */ true);

    let importStart = 0,                        // start of import clause - i.e. { template, xx, yy } in the import declaration
        importEnd = 0,                          // end of import clause
        importIds: { [key: string]: 1 } = {},   // map or import identifiers - e.g. { template:1, xx:1, yy:1 }
        templates: { start: number, end: number, src: string }[] = [];

    scan(srcFile);

    return await generateNewFile(filePath);

    function error(msg) {
        throw new Error("IV compilation error: " + msg);
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
                    if (nd.kind === SK.ImportSpecifier && (nd as ts.ImportSpecifier).name.getText() === TEMPLATE) {
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

        } else if (node.kind === SK.CallExpression) {
            // check if function is named template and if its argument is a template string
            let ce = node as ts.CallExpression;

            if (ce.expression.getText() === TEMPLATE && ce.arguments.length === 1 && ce.arguments[0].kind === SK.NoSubstitutionTemplateLiteral) {
                let tpl = ce.arguments[0], txt = tpl.getText();

                templates.push({
                    start: node.pos,
                    end: node.end,
                    src: txt.substring(1, txt.length - 1)
                })
            }
        }
    }

    async function generateNewFile(filePath: string): Promise<string> {
        if (!templates.length) {
            return source;
        }
        if (!importStart) {
            error("Missing 'template' import statement");
        }
        let slices: string[] = [], importPos = 1, pos = 0;

        // import up
        slices[0] = source.substring(0, importStart);
        slices[importPos] = ""; // will be replaced after the template processing
        pos = importEnd;

        // manage templates
        let len = templates.length;
        for (let i = 0; len > i; i++) {
            let tpl = templates[i];

            slices.push(source.substring(pos, tpl.start + 1));
            let r = await compileTemplate(tpl.src, { function: true, importMap: importIds, filePath: filePath, lineOffset: getLineNumber(tpl.start + 1) - 1 });
            slices.push(r.function!);
            pos = tpl.end;
        }

        // last part
        slices.push(source.substring(pos));

        // import insertion
        let imp: string[] = [];
        for (let k in importIds) if (importIds.hasOwnProperty(k)) {
            imp.push(k);
        }
        slices[1] = '{ ' + imp.join(", ") + ' }';

        return slices.join("");
    }

    function getLineNumber(pos: number) {
        let src2 = source.substring(0, pos);
        return src2.split("\n").length;
    }
}

