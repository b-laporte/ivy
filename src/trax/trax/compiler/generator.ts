import { parse } from './parser';
import { DataObject, TraxImport, DataProperty, ComputedProperty, DataType, DataMember } from './types';

const DATA = "Data",
    DATA_DECO = "@" + DATA,
    CLASS_DECO = "ΔD",
    PRIVATE_PREFIX = "ΔΔ",
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
        replace(DATA_DECO, getClassDecorator(), n.decoPos);
        addImport(CLASS_DECO);

        let len = n.members.length,
            prop: DataProperty,
            m: DataProperty | ComputedProperty,
            tp: DataType | undefined;
        for (let i = 0; len > i; i++) {
            m = n.members[i]
            if (m.kind === "property") {
                try {
                    prop = m as DataProperty;
                    insert(PRIVATE_PREFIX, prop.namePos);

                    tp = prop.type;
                    if (tp) {
                        if (!endsWithSemiColon(prop.end)) {
                            insert(";", prop.end);
                        }
                        // add new property definition
                        // e.g. @Δp(ΔfStr) street: string;
                        insert(" " + propertyDefinition(prop, false, addImport), prop.end);
                        // insert(` @Δp(${factory}${nullArg1}) ${prop.name}: ${typeRef};`, prop.end);
                    } else {
                        throw new Error("Untyped property are not supported");
                    }
                } catch (ex) {
                    error(ex.message, n);
                }
            }
        }
    }
}

export function getClassDecorator(libPrefix = "", addImport?: (symbol: string) => void) {
    if (addImport) {
        addImport(libPrefix + CLASS_DECO);
    }
    return "@" + libPrefix + CLASS_DECO;
}

export function getPropertyDefinition(m: DataMember, libPrefix = "", addImport?: (symbol: string) => void) {
    return propertyDefinition(m, true, addImport, libPrefix);
}

function propertyDefinition(m: DataMember, includePrivateDefinition = true, addImport?: (symbol: string) => void, libPrefix = ""): string {
    addImport = addImport || function () { };

    let tp = m.type, { typeRef, factory } = getTypeInfo(tp, addImport, libPrefix), privateDef = "", nullArg1 = "";
    if (tp && tp.canBeNull) {
        nullArg1 = ", 1";
    }

    if (includePrivateDefinition) {
        privateDef = `${PRIVATE_PREFIX}${m.name}: ${typeRef}; `
    }

    addImport(libPrefix + "Δp");
    return `${privateDef}@${libPrefix}Δp(${factory}${nullArg1}) ${m.name}: ${typeRef};`;
}


function getTypeInfo(tp: DataType | undefined, addImport: (symbol: string) => void, libPrefix = ""): { typeRef: string, factory: string } {
    let typeRef = "", factory = "";
    if (!tp) {
        return { typeRef: "any", factory: "" };
    }

    if (tp.kind === "any") {
        typeRef = "any";
        factory = "";
    } else if (tp.kind === "string") {
        typeRef = "string";
        factory = libPrefix + "ΔfStr";
        addImport(factory);
    } else if (tp.kind === "number") {
        typeRef = "number";
        factory = libPrefix + "ΔfNbr";
        addImport(factory);
    } else if (tp.kind === "boolean") {
        typeRef = "boolean";
        factory = libPrefix + "ΔfBool";
        addImport(factory);
    } else if (tp.kind === "reference") {
        typeRef = tp.identifier;
        factory = libPrefix + "Δf(" + typeRef + ")";
        addImport(libPrefix + "Δf");
    } else if (tp.kind === "array") {
        if (tp.itemType) {
            let info = getTypeInfo(tp.itemType, addImport, libPrefix);
            if (info.typeRef.match(RX_NULL_TYPE)) {
                typeRef = "(" + info.typeRef + ")[]"
            } else {
                typeRef = info.typeRef + "[]"
            }
            factory = libPrefix + "Δlf(" + info.factory + ")";
            addImport(libPrefix + "Δlf");
        } else {
            throw new Error("Item type must be specified in Arrays");
        }
    } else {
        throw new Error("Generator doesn't support type " + tp.kind + " yet");
    }
    if (tp.canBeNull) {
        typeRef += " | null";
    }
    return { typeRef, factory };
}