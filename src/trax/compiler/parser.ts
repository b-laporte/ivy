import { TraxImport, DataObject, DataProperty, DataType, TraxError } from './types';
import ts from "typescript";

const RX_LOG = /\/\/\s*log[\s$]/,
    RX_IGNORE_COMMENT = /\/\/\s*trax:\s*ignore/i,
    RX_LIST_PATTERN = /Array\s*\</,
    RX_DICT_PATTERN = /(Map\s*\<)|(Set\s*\<)/,
    RX_REF_DEPTH = /^ref\.depth\(\s*(\d+)\s*\)$/,
    RX_LEAD_SPACE = /^(\s+)/,
    UNSUPPORTED_TYPE = 'Unsupported type',
    SK = ts.SyntaxKind;

export interface ParserSymbols {
    Data?: string;
    ref?: string;
    computed?: string;
}

export interface ParserOptions {
    symbols?: ParserSymbols;
    acceptMethods?: boolean; // default: false
    interfaceTypes?: string[];
}

export function getSymbols(symbols?: ParserSymbols) {
    const Data = "Data", ref = "ref", computed = "computed";
    if (!symbols) {
        return { Data, ref, computed };
    } else {
        return {
            Data: symbols.Data || Data,
            ref: symbols.ref || ref,
            computed: symbols.computed || computed
        };
    }
}

export function parse(src: string, filePath: string, options?: ParserOptions): (TraxImport | DataObject)[] | null {
    const SYMBOLS = getSymbols(options ? options.symbols : undefined);
    if (!isTraxFile(src)) return null;

    let srcFile = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, /*setParentNodes */ true);
    let result: (TraxImport | DataObject)[] | null = [];

    let diagnostics = srcFile['parseDiagnostics'];
    if (diagnostics && diagnostics.length) {
        let d: ts.Diagnostic = diagnostics[0] as any;
        let info = getLineInfo(src, d.start || -1);
        throw {
            kind: "#Error",
            origin: "TS",
            message: d.messageText.toString(),
            line: info.lineNbr,
            column: info.columnNbr,
            lineExtract: info.lineContent.trim(),
            file: filePath
        } as TraxError;
    } else {
        // process all parts
        scan(srcFile);
    }

    return result;

    function error(message: string, node: ts.Node) {
        const txt = node.getFullText() || "";
        let shift = 0;
        if (txt.match(/^(\s+)/)) {
            shift = RegExp.$1.length;
        }
        const info = getLineInfo(src, node.pos + shift);

        throw {
            kind: "#Error",
            origin: "TRAX",
            message: message,
            line: info.lineNbr,
            column: info.columnNbr,
            lineExtract: info.lineContent.trim(),
            file: filePath
        } as TraxError;
    }

    function scan(node: ts.Node) {
        if (processNode(node)) {
            ts.forEachChild(node, scan);
        }
    }

    function processNode(node: ts.Node): boolean {
        if (!result) return false;

        if (node.kind === SK.ImportClause) {
            processImport(node as ts.ImportClause);
            return false;
        } else if (node.kind === SK.ClassDeclaration) {
            processClass(node as ts.ClassDeclaration);
            return false;
        } else {
            //console.log("Node: ", node.kind)
            //debugger
        }

        return true;
    }

    function isTraxFile(source: string): boolean {
        return (!source.match(RX_IGNORE_COMMENT) && source.indexOf("@" + SYMBOLS.Data) > -1);
    }

    function processImport(node: ts.ImportClause) {
        if (node.namedBindings) {
            let nmi = <ts.NamedImports>node.namedBindings;
            if (nmi.elements) {
                let idx = nmi.elements.length, traxImport: TraxImport | undefined;
                while (idx--) {
                    if (nmi.elements[idx].name.text === SYMBOLS.Data) {
                        traxImport = {
                            kind: "import",
                            pos: nmi.elements[idx].pos,
                            insertPos: nmi.elements[idx].end,
                            values: {}
                        } as TraxImport
                        break;
                    }
                }
                if (traxImport) {
                    idx = nmi.elements.length;
                    while (idx--) {
                        traxImport.values[nmi.elements[idx].name.text] = 1
                    }
                    result!.push(traxImport);
                }
            }
        }
    }

    function processClass(node: ts.ClassDeclaration) {
        let isData = false, decoPos = 0, printLogs = false, decoNode;
        if (node.decorators) {
            let decorators = node.decorators, idx = decorators.length, d: ts.Decorator;
            while (idx--) {
                d = decorators[idx];
                if (d.expression.kind === SK.Identifier) {
                    if (d.expression.getText() === SYMBOLS.Data) {
                        isData = true;
                        decoPos = d.expression.pos - 1;
                        decoNode = d;
                        // comment the dataset expression to remove it from generated code (and don't impact line numbers)
                        // this.insert("/* ", d.expression.pos - 1);
                        // this.insert(" */", d.expression.end);
                        if (node.getFullText().match(RX_LOG)) {
                            printLogs = true;
                        }
                    }
                }
            }
        }
        if (!isData) return;

        if (!node.name) {
            error("Data class name must be defined", decoNode);
        }

        let obj: DataObject = {
            kind: "data",
            pos: node.pos,
            decoPos: decoPos,
            className: node.name!.text,
            classNameEnd: node.name!.end,
            log: printLogs,
            members: []
        }

        if (node.members) {
            let members = node.members, canBeUndefined: boolean;
            for (let i = 0, len = members.length; len > i; i++) {
                canBeUndefined = false;
                let m = members[i];
                // processedPropData = this.processProcessorDecorator(m);

                if (m.kind === SK.Constructor) {
                    error("Constructors are not authorized in Data objects", m["body"] || m);
                } else if (m.kind === SK.GetAccessor) {
                    // getter
                    // check @computed properties
                    if (m.decorators && m.decorators.length === 1) {
                        if (m.decorators[0].getText() === "@computed") continue;
                    }
                    continue; // ok
                } else if (m.kind === SK.SetAccessor) {
                    // setter
                    continue; // ok
                } else if (m.kind === SK.MethodDeclaration) {
                    if (options && options.acceptMethods) continue;
                    error("Methods cannot be defined in this object", m);
                } else if (m.kind !== SK.PropertyDeclaration) {
                    error("Invalid class member in trax object", m);
                }

                // add $$ in front of the property name
                let prop: DataProperty = {
                    kind: "property",
                    name: "",
                    namePos: 0,
                    end: m.end,
                    shallowRef: 0,
                    shallowRefPos: 0,
                    type: undefined,
                    defaultValue: undefined
                }, skipProperty = false;

                updateShallowRef(m, prop);

                m.forEachChild((c) => {
                    if (c.kind === SK.Identifier && !prop.name) {
                        prop.name = c.getText();
                        prop.namePos = c.end - prop.name.length;
                    } else if (c.kind === SK.QuestionToken) {
                        canBeUndefined = true;
                    } else {
                        let tp: any;
                        try {
                            tp = getTypeObject(c, false);
                        } catch (ex) {
                            if (prop.shallowRef > 0 && ex.message === UNSUPPORTED_TYPE) {
                                prop.type = { kind: "any" };
                                return;
                            } else throw ex;
                        }
                        if (tp) {
                            prop.type = tp;
                        } else if (!handleDefaultValue(c, prop) && c.kind !== SK.Decorator) {
                            if (c.kind === SK.CallExpression || c.kind === SK.NewExpression || c.kind === SK.Identifier) {
                                prop.defaultValue = {
                                    pos: c.pos,
                                    end: c.end,
                                    text: c.getText(),
                                    fullText: c.getFullText(),
                                    isComplexExpression: true
                                }
                            } else if (c.kind === SK.FunctionType) {
                                prop.type = { kind: "any" };
                            } else if (c.kind !== SK.Parameter && c.getText() !== "any") {
                                // console.log(c.getText(), c);
                                error("Unsupported use case [" + c.kind + "]", c);
                            }
                        }
                    }
                });
                if (!prop.type) {
                    prop.type = { kind: "any" };
                }
                if (canBeUndefined) {
                    prop.type.canBeUndefined = true;
                }
                if (!skipProperty) {
                    obj.members.push(prop);
                }
            }
        }

        result!.push(obj);
    }

    function updateShallowRef(m: ts.ClassElement, prop: DataProperty): number {
        if (m.decorators) {
            let decorators = m.decorators, idx = decorators.length, d: ts.Decorator;
            while (idx--) {
                d = decorators[idx];
                const e = d.expression.getText();

                if (e === SYMBOLS.ref) {
                    prop.shallowRef = 1;
                } else if (e.match(RX_REF_DEPTH)) {
                    prop.shallowRef = parseInt(RegExp.$1, 10);
                }
                if (prop.shallowRef) {
                    prop.shallowRefPos = d.pos;
                    if (d.getFullText().match(RX_LEAD_SPACE)) {
                        prop.shallowRefPos += RegExp.$1.length;
                    }
                }
            }
        }
        return 0;
    }

    function getTypeObject(n: ts.Node, raiseErrorIfInvalid = false, canBeUnion = true): DataType | null {
        if (n) {
            if (n.kind === SK.ParenthesizedType) {
                let count = 0, childNd: ts.Node | undefined;
                (n as ts.ParenthesizedTypeNode).forEachChild((c) => {
                    count++;
                    childNd = c;
                });
                if (childNd && count === 1) {
                    n = childNd;
                } else {
                    error("Unsupported case", n);
                }
            }
            if (n.kind === SK.AnyKeyword) {
                return { kind: "any" };
            } if (n.kind === SK.StringKeyword) {
                return { kind: "string" };
            } else if (n.kind === SK.BooleanKeyword) {
                return { kind: "boolean" };
            } else if (n.kind === SK.NumberKeyword) {
                return { kind: "number" };
            } else if (n.getText() === "Function") {
                return { kind: "any" };
            } else if (n.kind === SK.TypeReference) {
                if (options && options.interfaceTypes
                    && options.interfaceTypes.indexOf(n.getText()) > -1) {
                    return { kind: "any" };
                }
                const ref = n.getText();
                if (ref.match(RX_LIST_PATTERN)) {
                    error("Array collections must be defined through the xxx[] notation", n);
                } else if (ref.match(RX_DICT_PATTERN)) {
                    error("Maps and Sets are not supported. Please use Dictionary Objects instead", n);
                }

                return {
                    kind: "reference",
                    identifier: ref
                };
            } else if (n.kind === SK.ArrayType) {
                return {
                    kind: "array",
                    itemType: getTypeObject(n["elementType"], true, true) as any
                };
            } else if (n.kind === SK.TypeLiteral) {
                // expected to be something like dict: { [key: string]: Address }
                let members = (n as ts.TypeLiteralNode).members;
                if (members && members.length === 1 && members[0].kind === SK.IndexSignature) {
                    let idxSignature = members[0] as ts.IndexSignatureDeclaration, parameters = idxSignature.parameters;
                    if (parameters && parameters.length === 1) {
                        const idxType = getTypeObject(parameters[0].type!, true, true);
                        const itmType = getTypeObject(idxSignature.type!, true, true);
                        if (!idxType || idxType.kind !== "string") {
                            error("Dictionaries can only be indexed by strings", n);
                        }
                        return {
                            kind: "dictionary",
                            indexName: parameters[0].name.getText(),
                            indexType: idxType!,
                            itemType: itmType!
                        }
                    }
                }
            } else if (canBeUnion && n.kind === SK.UnionType) {
                // types should be either undefined or DataNode types
                let ut = <ts.UnionTypeNode>n, canBeNull = false, canBeUndefined = false;
                if (ut.types) {
                    let idx = ut.types.length, dt: DataType | null = null;
                    while (idx--) {
                        let tp = ut.types[idx];
                        if (tp.kind === SK.NullKeyword) {
                            canBeNull = true;
                        } else if (tp.kind === SK.UndefinedKeyword) {
                            canBeUndefined = true;
                        } else {
                            if (dt !== null) {
                                error("Multiple data types are not supported", tp);
                            }
                            dt = getTypeObject(tp, false, false);
                            if (!dt) {
                                error(UNSUPPORTED_TYPE, tp);
                                return null;
                            }
                        }
                    }
                    if (dt && (canBeNull || canBeUndefined)) {
                        dt.canBeNull = dt.canBeNull || canBeNull;
                        dt.canBeUndefined = dt.canBeUndefined || canBeUndefined;
                        return dt;
                    }
                }
            }
        }
        if (raiseErrorIfInvalid && n.kind !== SK.Decorator) {
            // console.log(UNSUPPORTED_TYPE, n)
            error(UNSUPPORTED_TYPE, n);
        }
        return null;
    }

    function handleDefaultValue(n: ts.Node, prop: DataProperty): boolean {
        if (n) {
            let v: string = "", kind = "", complexExpr = false;
            if (n.kind === SK.StringLiteral) {
                kind = "string";
            } else if (n.kind === SK.NumericLiteral) {
                kind = "number";
            } else if (n.kind === SK.PrefixUnaryExpression || n.kind === SK.PostfixUnaryExpression) {
                let operand = (n as ts.PrefixUnaryExpression | ts.PostfixUnaryExpression).operand;
                if (operand.kind === SK.NumericLiteral) {
                    kind = "number";
                } else if (operand.kind === SK.Identifier) {
                    kind = "any";
                }
                complexExpr = true;
            } else if (n.kind === SK.TrueKeyword || n.kind === SK.FalseKeyword) {
                kind = "boolean";
            } else if (n.kind === SK.ArrayLiteralExpression) {
                kind = "any";
                complexExpr = true;
            } else if (n.kind === SK.NullKeyword || n.kind === SK.UndefinedKeyword) {
                if (prop.type && prop.type.kind) {
                    kind = prop.type.kind;
                } else {
                    kind = "any";
                }
            }
            if (kind !== "") {
                prop.defaultValue = {
                    pos: n.pos,
                    end: n.end,
                    text: n.getText(),
                    fullText: n.getFullText(),
                    isComplexExpression: complexExpr
                }
                if (!prop.type) {
                    prop.type = {
                        kind: kind as any
                    }
                }
                return true;
            }
        }
        return false;
    }
}

export function getLineInfo(src: string, pos: number): { lineNbr: number, lineContent: string, columnNbr: number } {
    let lines = src.split("\n"), lineLen = 0, posCount = 0, idx = 0;
    if (pos > -1) {
        while (idx < lines.length) {
            lineLen = lines[idx].length;
            if (posCount + lineLen < pos) {
                // continue
                idx++;
                posCount += lineLen + 1; // +1 for carriage return
            } else {
                // stop
                return {
                    lineNbr: idx + 1,
                    lineContent: lines[idx],
                    columnNbr: 1 + pos - posCount
                }
            }
        }
    }
    return {
        lineNbr: 0,
        lineContent: "",
        columnNbr: 0
    }
}
