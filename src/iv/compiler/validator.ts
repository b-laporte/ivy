import { XjsDecorator, XjsContentHost, XjsExpression, XjsParam } from './../../xjs/types';
import { XjsContentNode, XjsFragment, XjsNode, XjsParamHost, XjsLabel } from '../../xjs/types';
import { GenerationCtxt } from './generator';
import { IvError } from './types';

// Generic validation
const U = undefined,
    NO = 0,
    YES = 1,
    LATER = 2,
    SOMETIMES = 3,
    RX_EVT_HANDLER_DECORATOR = /^on(\w+)$/,
    PARAM_VALUE = "paramValue",
    VALIDATION_NAMES = {
        "#textNode": "Text nodes",
        "#element": "Element nodes",
        "#component": "Component nodes",
        "#fragment": "Fragment nodes",
        "#paramNode": "Parameter nodes",
        "#decoratorNode": "Decorator nodes",
        "#{element}": "Dynamic element nodes",
        "#{paramNode}": "Dynamic parameter nodes",
        "#param": "Parameters",
        "#property": "Properties",
        "#label": "Labels",
        "##label": "Forward labels",
        "#decorator": "Decorators",
    },
    NODE_NAMES = {
        "#tplFunction": "$template function",
        "#tplArgument": "$template argument",
        "#jsStatement": "javascript statement",
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
        "#eventListener": "event listener",
        "#label": "label"
    },
    SUPPORTED_NODE_ATTRIBUTES: {
        [type: string]: 2 | {
            "#param": 0 | 1 | 2, "#property": 0 | 1 | 2, "#label": 0 | 1 | 2, "##label": 0 | 1 | 2, "#decorator": 0 | 1 | 2 | 3 | 4, "@onevent": 0 | 1
        }
    } = {
        "#textNode": { "#param": NO, "#property": NO, "#label": NO, "##label": NO, "#decorator": NO, "@onevent": NO },
        "#element": { "#param": YES, "#property": YES, "#label": YES, "##label": NO, "#decorator": SOMETIMES, "@onevent": YES },
        "#component": { "#param": YES, "#property": NO, "#label": YES, "##label": LATER, "#decorator": SOMETIMES, "@onevent": YES },
        "#fragment": { "#param": NO, "#property": NO, "#label": NO, "##label": NO, "#decorator": SOMETIMES, "@onevent": NO },
        "#paramNode": { "#param": YES, "#property": NO, "#label": NO, "##label": NO, "#decorator": SOMETIMES, "@onevent": YES },
        "#decorator": { "#param": YES, "#property": NO, "#label": YES, "##label": NO, "#decorator": NO, "@onevent": YES },
        "#decoratorNode": LATER
    }, SUPPORTED_BUILT_IN_DECORATORS = {
        "paramValue": { "#textNode": NO, "#element": NO, "#component": NO, "#fragment": NO, "#paramNode": YES, "#decoratorNode": NO, "#{element}": NO, "#{paramNode}": NO },
        "xmlns": { "#textNode": NO, "#element": YES, "#component": YES, "#fragment": YES, "#paramNode": NO, "#decoratorNode": NO, "#{element}": NO, "#{paramNode}": NO },
        "content": { "#textNode": NO, "#element": YES, "#component": NO, "#fragment": YES, "#paramNode": NO, "#decoratorNode": NO, "#{element}": NO, "#{paramNode}": NO }
        // async
    };

export const validator = {
    validateXjsNode(nd: XjsNode, gc: GenerationCtxt) {
        let nk = nd.kind, attSupport = SUPPORTED_NODE_ATTRIBUTES[nk];
        if (attSupport === LATER) {
            gc.error(`${VALIDATION_NAMES[nk]} are not supported yet`, nd);
        } else if (nk === "#cdata" || nk === "#component" || nk === "#decoratorNode"
            || nk === "#element" || nk === "#fragment" || nk === "#paramNode" || nk === "#decorator") {
            let n = nd as XjsParamHost, attKind: "#decoratorNode" | "#param" | "#property" | "#decorator" | "#preprocessor" | "#label";

            if (n.params !== U) {
                for (let p of n.params!) {
                    attKind = p.kind;
                    if (attKind === "#decoratorNode") {
                        notSupported(nk, attKind, p);
                    } else if (attKind === "#param" || attKind === "#property") {
                        checkAttribute(nk, attKind, p);
                        if (p.kind === "#property") {
                            if (p.name === "innerHTML") {
                                gc.error("innerHTML is not authorized (security restriction)", p);
                            }
                            if (n.kind !== "#element") {
                                gc.error("Properties can only be used on element nodes", p);
                            }
                        }
                    } else if (attKind === "#preprocessor") {
                        if (!gc.acceptPreProcessors) {
                            gc.error(`Pre-processors are not accepted in this context`, p);
                        }
                    } else if (attKind === "#label") {
                        let lbl = p as XjsLabel;
                        if (lbl.fwdLabel) {
                            checkAttribute(nk, "##label", lbl);
                            if (!lbl.isOrphan && typeof lbl.value !== "string" && typeof lbl.value !== "object") {
                                gc.error(`Forward labels values must be strings or expressions`, lbl);
                            }
                        } else {
                            checkAttribute(nk, "#label", p);
                            if (!lbl.isOrphan && typeof lbl.value !== "boolean" && typeof lbl.value !== "object") {
                                gc.error(`Labels values must be expressions or booleans`, lbl);
                            }
                        }
                    } else if (attKind === "#decorator") {
                        const d = p as XjsDecorator, codeRef = d.ref.code, values = SUPPORTED_BUILT_IN_DECORATORS[codeRef];
                        if (nk === "#paramNode" && codeRef !== PARAM_VALUE && !codeRef.match(RX_EVT_HANDLER_DECORATOR)) {
                            gc.error(`Only @paramValue and event listener decorators can be used on Parameter nodes`, d);
                        } else if (values !== U && values[nk] === NO) {
                            gc.error(`@${codeRef} is not supported on ${VALIDATION_NAMES[nk]}`, d);
                        } else if (codeRef.match(RX_EVT_HANDLER_DECORATOR)) {
                            if (!SUPPORTED_NODE_ATTRIBUTES[nk]["@onevent"]) {
                                gc.error(`Event handlers are not supported on ${VALIDATION_NAMES[nk]}`, d);
                            }
                        }
                        if (codeRef === "content") {
                            // @content validation
                            const parent = n as XjsContentHost;

                            if (parent.content && parent.content.length) {
                                gc.error("@content can only be used on empty elements or fragments", d);
                            } else if (d.defaultPropValue && (d.defaultPropValue as XjsExpression).kind !== "#expression") {
                                gc.error("@content value cannot be a " + (typeof d.defaultPropValue), d);
                            } else if (d.defaultPropValue && (d.defaultPropValue as XjsExpression).kind === "#expression"
                                && (d.defaultPropValue as XjsExpression).oneTime) {
                                gc.error("@content expression cannot use one-time qualifier", d);
                            }
                        } else if (codeRef === "paramValue") {
                            // @paramValue : for param nodes only
                            if (n.params!.length > 1) {
                                gc.error("@paramValue cannot be mixed with other parameters", d);
                            }
                            if (d.defaultPropValue === U) {
                                gc.error(`Incorrect value for @paramValue`, d);
                            }
                        } else if (codeRef === "async") {
                            // @async
                            if (nk !== "#fragment" && nk !== "#element" && nk !== "#component") {
                                gc.error(`@async cannot be used on ${VALIDATION_NAMES[nk]}`, d);
                            }
                        }
                    }
                    if ((p as XjsParam).value !== U && typeof (p as XjsParam).value === "object") {
                        // validate expressions
                        const exp = (p as XjsParam).value as XjsExpression;
                        if (exp.isBinding && nk !== "#decorator" && nk !== "#decoratorNode" && nk !== "#component" && nk !== "#paramNode") {
                            gc.error(`Binding expressions cannot be used on ${NODE_NAMES[nk]} ${NODE_NAMES[p.kind]}`, p);
                        }
                    }
                }
            }
        }

        function checkAttribute(nodeKind: string, attKind: string, errNd: XjsNode) {
            if (errNd) {
                switch (attSupport![attKind]) {
                    case NO:
                        notSupported(nodeKind, attKind, errNd);
                    case LATER:
                        gc.error(`${VALIDATION_NAMES[attKind]} are not yet supported on ${VALIDATION_NAMES[nodeKind]}`, errNd);
                }
            }
        }

        function notSupported(nodeKind: string, attKind: string, errNd: XjsNode) {
            gc.error(`${VALIDATION_NAMES[attKind]} are not supported on ${VALIDATION_NAMES[nodeKind]}`, errNd);
        }

    },

    throwError(msg: string, pos: number, source: string, filePath: string, origin = "IVY", lineOffset = 0, colOffset = 0) {
        const info = this.getLineInfo(source, pos),
            e = {
                kind: "#Error",
                origin: origin,
                message: "", // cf. below
                description: msg,
                line: info.lineNbr + lineOffset,
                column: (info.lineNbr === 1) ? info.columnNbr + colOffset : info.columnNbr,
                lineExtract: info.lineContent.trim(),
                file: filePath
            } as IvError;
        e.message = this.getErrorMessage(e.origin, e.description, e.file, e.line, e.column, e.lineExtract);
        throw e;
    },

    getErrorMessage(origin: string, description: string, file: string, line: number, column: number, lineExtract: string) {
        return `${origin}:${description}\nFile: ${file} - Line ${line} / Col ${column}\nExtract: >> ${lineExtract} <<`;
    },

    getLineInfo(src: string, pos: number): { lineNbr: number, lineContent: string, columnNbr: number } {
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
    },

    nodeName(kind:string) {
        return NODE_NAMES[kind] || kind;
    }
}