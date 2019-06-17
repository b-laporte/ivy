import { parse } from './parser';
import { DataObject, TraxImport, DataProperty, ComputedProperty, DataType } from './types';

const DATA = "Data",
    DATA_DECO = "@" + DATA,
    RX_LOG = /\/\/\s*trax\:log/,
    RX_NULL_TYPE = /\|\s*null$/;

export function generate(src: string, filePath: string): string {
    let output = src,
        outputShift = 0,
        ast: null | (TraxImport | DataObject)[],
        traxImport: TraxImport,
        importList: string[] = [], // list of new imports
        importDict: { [key: string]: 1 };

    try {
        ast = parse(src, filePath);
        if (ast && ast.length) {
            initImports(ast);

            let len = ast.length;
            for (let i = 1; len > i; i++) {
                if (ast[i].kind === "import") {
                    error("Duplicate Data import", ast[i]);
                } else {
                    processDataObject(ast[i] as DataObject);
                }
            }
            updateImports();
        }
    } catch (ex) {
        error(ex);
    }

    if (src.match(RX_LOG)) {
        console.log("-----------------------------------------------------------------------------");
        console.log("Trax Ouput:");
        console.log(output);
    }

    return output;

    function error(msg: string, node: DataObject | TraxImport | null = null) {
        // todo
        throw new Error("[TRAX]" + msg + " - file: " + filePath);
    }

    function initImports(ast: (TraxImport | DataObject)[]) {
        if (ast[0].kind !== "import") {
            error("@Data import not found", null);
            return; // not reachable as error throws
        }
        traxImport = ast[0] as TraxImport;
        importDict = traxImport.values;
    }

    function addImport(symbol: string) {
        if (!importDict[symbol]) {
            importDict[symbol] = 1;
            importList.push(symbol);
        }
    }

    function updateImports() {
        // must be called at the end as it resets outputShift

        outputShift = 0; // to use insert() or replace() from the beginning
        replace(DATA, importList.join(", "), traxImport.insertPos - DATA.length);
    }

    // insert must be called in incremental order - i.e. n+1 calls must have a bigger position 
    // (otherwise will lead to unexpected result!)
    function insert(text: string, position: number) {
        // console.log("insert at", position, ": ", text);
        let pos = position + outputShift;
        if (output) {
            output = output.slice(0, pos) + text + output.slice(pos);
            outputShift += text.length;
        }
    }

    function replace(str1: string, str2: string, position: number) {
        let pos = position + outputShift;
        if (output) {
            output = output.slice(0, pos) + str2 + output.slice(pos + str1.length);
            outputShift += str2.length - str1.length;
        }
    }

    function endsWithSemiColon(position: number): boolean {
        let pos = position + outputShift;
        if (output && output.slice(0, pos).match(/\;\s*$/)) {
            return true;
        }
        return false
    }

    function processDataObject(n: DataObject) {

        // transform @Data decorator -> @ΔD()
        replace(DATA_DECO, "@ΔD", n.decoPos);
        addImport("ΔD");

        let len = n.members.length,
            prop: DataProperty,
            m: DataProperty | ComputedProperty,
            tp: DataType | undefined,
            separator: string,
            nullArg1: string;
        for (let i = 0; len > i; i++) {
            m = n.members[i]
            if (m.kind === "property") {
                prop = m as DataProperty;

                insert("ΔΔ", prop.namePos);

                tp = prop.type;
                if (tp) {
                    let { typeRef, factory } = getTypeInfo(tp, n);
                    if (tp.canBeNull) {
                        nullArg1 = ", 1";
                    } else {
                        nullArg1 = "";
                    }

                    if (factory) {
                        separator = endsWithSemiColon(prop.end) ? "" : ";";

                        // add new property definition
                        // e.g. @Δp(ΔfStr) street: string;
                        addImport("Δp");
                        insert(`${separator} @Δp(${factory}${nullArg1}) ${prop.name}: ${typeRef};`, prop.end);
                    }

                } else {
                    error("Untyped property are not supported", n);
                }

            }
        }

    }

    function getTypeInfo(tp: DataType, n: DataObject): { typeRef: string, factory: string } {
        let typeRef = "", factory = "";

        if (tp.kind === "string") {
            typeRef = "string";
            factory = "ΔfStr";
            addImport(factory);
        } else if (tp.kind === "number") {
            typeRef = "number";
            factory = "ΔfNbr";
            addImport(factory);
        } else if (tp.kind === "boolean") {
            typeRef = "boolean";
            factory = "ΔfBool";
            addImport(factory);
        } else if (tp.kind === "reference") {
            typeRef = tp.identifier;
            factory = "Δf(" + typeRef + ")";
            addImport("Δf");
        } else if (tp.kind === "array") {
            if (tp.itemType) {
                let info = getTypeInfo(tp.itemType, n);
                if (info.typeRef.match(RX_NULL_TYPE)) {
                    typeRef = "(" + info.typeRef + ")[]"
                } else {
                    typeRef = info.typeRef + "[]"
                }
                factory = "Δlf(" + info.factory + ")";
                addImport("Δlf");
            } else {
                error("Item type must be specified in Arrays", n);
            }
        } else {
            error("Generator doesn't support type " + tp.kind + " yet", n);
        }
        if (tp.canBeNull) {
            typeRef += " | null";
        }
        return { typeRef, factory };
    }
}