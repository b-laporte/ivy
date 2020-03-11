import { parse, ParserSymbols, getSymbols, getLineInfo } from './parser';
import { DataObject, TraxImport, DataProperty, DataType, DataMember, TraxError } from './types';

const PRIVATE_PREFIX = "ΔΔ",
    CLASS_DECO = "ΔD",
    RX_NULL_TYPE = /\|\s*null$/,
    SEPARATOR = "----------------------------------------------------------------------------------------------------";


interface GeneratorOptions {
    acceptMethods?: boolean;           // default:true
    replaceDataDecorator?: boolean;    // default:true
    interfaceTypes?: string[];         // list of type names that should be considered as interfaces (-> any type)
    symbols?: ParserSymbols,           // redefine the symbols used to identify Data objects
    libPrefix?: string;                // define a prefix to use in the generated code
    logErrors?: boolean;               // default:true
    validator?: (member: DataMember) => string | null;  // validation function
}

export function generate(src: string, filePath: string, options?: GeneratorOptions): string {
    const symbols = getSymbols(options ? options.symbols : undefined),
        libPrefix = options ? (options.libPrefix || "") : "",
        logErrors = options ? (options.logErrors !== false) : true;

    let output = src,
        outputShift = 0,
        ast: null | (TraxImport | DataObject)[],
        traxImport: TraxImport,
        importList: string[] = [], // list of new imports
        importDict: { [key: string]: 1 },
        logOutput = false,
        importDictForced: { [key: string]: 1 } = {};

    try {
        ast = parse(src, filePath, {
            symbols,
            acceptMethods: options ? options.acceptMethods : true,
            interfaceTypes: options ? options.interfaceTypes : undefined
        });
        if (ast && ast.length) {
            initImports(ast);

            let len = ast.length, d:DataObject;
            for (let i = 1; len > i; i++) {
                if (ast[i].kind === "import") {
                    error("Duplicate Data import", ast[i]);
                } else {
                    d = ast[i] as DataObject;
                    processDataObject(d);
                    if (d.log) {
                        logOutput = true;
                    }
                }
            }
            updateImports();
        }
    } catch (e) {
        if (logErrors) {
            let err = e as TraxError, msg: string;
            if (err.kind === "#Error") {
                let ls = "  >  ";
                msg = `${ls} ${err.origin}: ${e.message}\n`
                    + `${ls} File: ${e.file} - Line ${e.line} / Col ${e.column}\n`
                    + `${ls} Extract: >> ${e.lineExtract} <<`;
            } else {
                msg = e.message || e;
            }
            console.error(`\n${SEPARATOR}\n${msg}\n${SEPARATOR}`);
        }
        throw e;
    }

    if (logOutput) {
        console.log(SEPARATOR);
        console.log("Trax Output:");
        console.log(output);
    }

    return output;

    function error(msg: string, node: DataObject | TraxImport | DataProperty | null = null) {
        let info = getLineInfo(src, node ? node["pos"] || node["namePos"] || -1 : -1);
        throw {
            kind: "#Error",
            origin: "TRAX",
            message: msg,
            line: info.lineNbr,
            column: info.columnNbr,
            lineExtract: info.lineContent.trim(),
            file: filePath
        } as TraxError;
    }

    function initImports(ast: (TraxImport | DataObject)[]) {
        if (ast[0].kind !== "import") {
            error("@" + symbols.Data + " import not found", null);
            return; // not reachable as error throws
        }
        traxImport = ast[0] as TraxImport;
        importDict = traxImport.values;
    }

    function addImport(symbol: string, force = false) {
        if ((force && !importDictForced[symbol]) || !importDict[symbol]) {
            importDict[symbol] = 1;
            importList.push(symbol);
            if (force) {
                importDictForced[symbol] = 1;
            }
        }
    }

    function updateImports() {
        // must be called at the end as it resets outputShift

        outputShift = 0; // to use insert() or replace() from the beginning
        replace(symbols.Data, importList.join(", "), traxImport.insertPos - symbols.Data.length);
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

    function replaceRegExp(rx: RegExp, str: string, position: number) {
        let pos = position + outputShift, output1 = output.slice(0, pos), len1 = output1.length, output2 = output1.replace(rx, str);
        // console.log("-----")
        // console.log("output1",output1+"<<")
        // console.log("output2",output2+"<<")
        // console.log("shift", output2.length - len1)

        outputShift += output2.length - len1;
        output = output2 + output.slice(pos);
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
        if (!options || options.replaceDataDecorator !== false) {
            replace("@" + symbols.Data, getClassDecorator(libPrefix), n.decoPos);
            addImport(libPrefix + CLASS_DECO, true);
        } else {
            addImport(symbols.Data, true);
        }

        let len = n.members.length,
            prop: DataProperty,
            m: DataProperty,
            tp: DataType | undefined,
            defaultValues: string[] = [],
            lastInsertPos = -1;
        for (let i = 0; len > i; i++) {
            m = n.members[i]
            if (m.kind === "property") {
                try {
                    prop = m as DataProperty;
                    if (m.shallowRef > 0) {
                        // remove @ref reference
                        replaceRegExp(/\@ref(\.depth\(\s*\d+\s*\))?\s*$/, "", prop.namePos);
                    }
                    insert(PRIVATE_PREFIX, prop.namePos);

                    tp = prop.type;
                    if (tp) {
                        if (m.defaultValue && m.defaultValue.isComplexExpression) {
                            replaceRegExp(/\s*\=\s*$/, "", m.defaultValue.pos);
                            replace(m.defaultValue.fullText, "", m.defaultValue.pos);
                        }
                        if (!endsWithSemiColon(prop.end)) {
                            insert(";", prop.end);
                        }
                        // add new property definition
                        // e.g. @Δp(ΔfStr) street: string;
                        insert(" " + propertyDefinition(prop, false), prop.end);
                        lastInsertPos = prop.end;
                        // insert(` @Δp(${factory}${nullArg1}) ${prop.name}: ${typeRef};`, prop.end);

                        if (prop.defaultValue) {
                            defaultValues.push(`case "${prop.name}": return ${prop.defaultValue.text}`);
                        }
                    } else {
                        // this case should not be reachable
                        error("Invalid case", n);
                    }
                } catch (ex) {
                    error(ex.message, n);
                }
            }
            if (options && options.validator) {
                let errMsg = options.validator(m);
                if (errMsg) {
                    error(errMsg, m);
                }
            }
        }
        if (defaultValues.length && lastInsertPos > -1) {
            // build default value function
            addImport(libPrefix + "Δu");
            insert(` ΔDefault(n) {switch (n) {${defaultValues.join("; ")}}; return ${libPrefix}Δu;};`, lastInsertPos);
        }
    }


    function getClassDecorator(libPrefix = "") {
        return "@" + libPrefix + CLASS_DECO;
    }

    function propertyDefinition(m: DataMember, includePrivateDefinition = true): string {
        let tp = m.type, { typeRef, factory } = getTypeInfo(tp, m.shallowRef || 1000), privateDef = "", nullUndefinedArg = "", questionSymbol = "";
        if (tp && (tp.canBeNull || tp.canBeUndefined)) {
            if (tp.canBeNull && tp.canBeUndefined) {
                questionSymbol = "?";
                nullUndefinedArg = ", 3";
            } else if (tp.canBeUndefined) {
                questionSymbol = "?";
                nullUndefinedArg = ", 2";
            } else {
                nullUndefinedArg = ", 1";
            }
        }

        if (includePrivateDefinition) {
            privateDef = `${PRIVATE_PREFIX}${m.name}: ${typeRef}; `
        }
        if (nullUndefinedArg) {
            factory = factory || "0"; // factory arg cannot be empty if second argument is passed
        }
        addImport(libPrefix + "Δp");
        let dv = '';
        if (m.defaultValue && m.defaultValue.isComplexExpression) {
            dv = ` = ${m.defaultValue.text}`;
        }
        return `${privateDef}@${libPrefix}Δp(${factory}${nullUndefinedArg}) ${m.name}${questionSymbol}: ${typeRef}${dv};`;
    }


    function getTypeInfo(tp: DataType | undefined, refDepth: number): { typeRef: string, factory: string } {
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
        } else if (tp.kind === "number") {
            typeRef = "number";
            factory = libPrefix + "ΔfNbr";
        } else if (tp.kind === "boolean") {
            typeRef = "boolean";
            factory = libPrefix + "ΔfBool";
        } else if (tp.kind === "reference") {
            typeRef = tp.identifier;
            factory = libPrefix + "Δf(" + typeRef + ")";
        } else if (tp.kind === "array") {
            if (tp.itemType) {
                let info = getTypeInfo(tp.itemType, refDepth - 1);
                if (info.typeRef.match(RX_NULL_TYPE)) {
                    typeRef = "(" + info.typeRef + ")[]";
                } else {
                    typeRef = info.typeRef + "[]";
                }
                factory = libPrefix + "Δlf(" + info.factory + ")";
            } else {
                // this case should not occur (caught by parser)
                throw "Item type must be specified in Arrays";
            }
        } else if (tp.kind === "dictionary") {
            if (tp.itemType) {
                let info = getTypeInfo(tp.itemType, refDepth - 1);
                typeRef = "{ [" + tp.indexName! + ": string]: " + info.typeRef + " }";
                factory = libPrefix + "Δdf(" + info.factory + ")";
            } else {
                // this case should not occur (caught by parser)
                throw "Invalid Dictionary type";
            }
        } else {
            // this case will only occur when a new type kind is introduced
            throw "TODO: support type " + tp.kind;
        }
        if (tp.canBeNull) {
            typeRef += " | null";
        }

        if (refDepth <= 1) {
            factory = "ΔfRef";
            addImport("ΔfRef");
        } else if (factory !== "" && factory.match(/^([^\(]+)/)) {
            addImport(RegExp.$1);
        }
        return { typeRef, factory };
    }
}
