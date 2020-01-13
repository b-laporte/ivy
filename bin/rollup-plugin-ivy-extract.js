import { join, isAbsolute } from 'path';
import { readFile, promises } from 'fs';
import { Registry, parseRawGrammar } from 'vscode-textmate';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var U = undefined, NO_VALUE = { kind: "#ref", identifier: "" }, RX_TEXT_SPECIALS = /(\<|\!|\/)/g, RX_CDATA_SPECIALS = /\<\/\!cdata\>/g;
function createXtrElement(kind, name, nameRef, pos) {
    if (pos === void 0) { pos = -1; }
    return new XElement(kind, name, nameRef, pos);
}
function createXtrText(text, pos) {
    if (pos === void 0) { pos = -1; }
    return new XText(text, pos);
}
function addElement(parent, name, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXtrElement("#element", name, U, pos));
}
function addText(parent, text, pos) {
    if (pos === void 0) { pos = -1; }
    pushChild(parent, createXtrText(text, pos));
}
function addParam(parent, name, value, isProperty, pos) {
    if (pos === void 0) { pos = -1; }
    return pushParam(parent, new XParam(isProperty === true ? "#property" : "#param", name, value, pos));
}
var INVALID_REF = {
    kind: "#ref",
    identifier: "#invalid"
};
var XFragment = /** @class */ (function () {
    function XFragment(_isRoot, pos) {
        if (_isRoot === void 0) { _isRoot = true; }
        if (pos === void 0) { pos = -1; }
        this._isRoot = _isRoot;
        this.pos = pos;
        this.kind = "#fragment";
        this._refs = {};
        this.children = [];
    }
    XFragment.prototype.ref = function (name) {
        if (this._isRoot) {
            var ref = {
                kind: "#ref",
                identifier: name
            };
            this._refs[name] = ref;
            return ref;
        }
        else {
            console.log("[XTR AST] references can only be created on root fragments - please check '" + name + "'");
            return INVALID_REF;
        }
    };
    Object.defineProperty(XFragment.prototype, "refs", {
        get: function () {
            var r = [], refs = this._refs;
            for (var k in refs) {
                if (refs.hasOwnProperty(k)) {
                    r.push(refs[k]);
                }
            }
            return r;
        },
        enumerable: true,
        configurable: true
    });
    XFragment.prototype.toString = function (startIndent, indent, minimal, multiline) {
        if (startIndent === void 0) { startIndent = ""; }
        if (indent === void 0) { indent = "  "; }
        if (minimal === void 0) { minimal = false; }
        if (multiline === void 0) { multiline = true; }
        if (this._isRoot) {
            if (minimal)
                multiline = false;
            return serializeChildren(this.children, startIndent, indent, multiline, minimal) + (multiline ? "\n" : "");
        }
        else {
            return serializeContainer(this, startIndent, indent, minimal);
        }
    };
    return XFragment;
}());
var PREFIXES = {
    "#component": "*",
    "#decoratorNode": "@",
    "#element": "",
    "#fragment": "",
    "#paramNode": ".",
    "#param": "",
    "#property": "[",
    "#decorator": "@",
    "#label": "#"
}, SUFFIXES = {
    "#param": "",
    "#property": "]",
    "#decorator": "",
    "#label": ""
};
function serializeChildren(nodes, startIndent, indent, multiline, minimal) {
    if (minimal === void 0) { minimal = false; }
    if (nodes === U || !nodes.length)
        return "";
    var buf = [];
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        var k = node.kind;
        if (multiline) {
            buf.push("\n" + startIndent);
        }
        if (k === "#text") {
            buf.push(node.toString());
        }
        else {
            buf.push(serializeContainer(node, startIndent, indent, minimal));
        }
    }
    return buf.join("");
}
function serializeContainer(node, startIndent, indent, minimal) {
    if (startIndent === void 0) { startIndent = ""; }
    if (indent === void 0) { indent = ""; }
    if (minimal === void 0) { minimal = false; }
    var k = node.kind, buf = [], start = "";
    if (k === "#fragment") {
        start = "<!" + serializeParams(node.params);
        if (minimal && start === "<!") {
            start = "";
        }
    }
    else if (k === "#cdata") {
        start = "<!cdata" + serializeParams(node.params);
    }
    else {
        start = "<" + PREFIXES[k] + (node.name || node.nameRef) + serializeParams(node.params);
    }
    buf.push(start);
    if (k !== "#cdata" && node.children && node.children.length > 0) {
        var n = node;
        if (start !== "") {
            buf.push(">");
        }
        var mLine = !minimal && (n.children.length > 1 || start.length > 25 || (n.children.length === 1 && n.children[0].kind !== "#text")); // multi line
        buf.push(serializeChildren(n.children, startIndent + indent, indent, mLine, minimal));
        if (mLine) {
            buf.push("\n" + startIndent + "</>"); // no need for name as we have indentation
        }
        else {
            if (k === "#fragment") {
                if (start !== "") {
                    buf.push("</!>");
                }
            }
            else {
                buf.push(minimal ? "</>" : "</" + PREFIXES[k] + (n.name || n.nameRef) + ">");
            }
        }
    }
    else if (k === "#cdata") {
        buf.push(">" + node.content.replace(RX_CDATA_SPECIALS, "!</!cdata>") + "</!cdata>");
    }
    else {
        if (minimal && start === "")
            return "";
        buf.push("/>");
    }
    return buf.join("");
}
function serializeParams(params, firstSeparator) {
    if (firstSeparator === void 0) { firstSeparator = " "; }
    if (params === U || params.length === 0)
        return "";
    var buf = [];
    for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
        var p = params_1[_i];
        buf.push((buf.length === 0) ? firstSeparator : " ");
        buf.push(PREFIXES[p.kind] + p.name + SUFFIXES[p.kind]);
        if (p.holdsValue) {
            if (p.valueRef !== U) {
                buf.push("={" + p.valueRef + "}");
            }
            else if (typeof p.value === "boolean" || typeof p.value === "number") {
                buf.push("=" + p.value);
            }
            else {
                // string
                buf.push("='" + encodeText("" + p.value) + "'");
            }
        }
        else if (p.kind === "#decorator" && p.params) {
            var s = serializeParams(p.params, "");
            if (s.length) {
                buf.push("(" + s + ")");
            }
        }
    }
    return buf.join("");
}
function encodeText(t) {
    return t.replace(/\'/g, "\\'");
}
var XElement = /** @class */ (function () {
    function XElement(kind, name, nameRef, pos) {
        if (pos === void 0) { pos = -1; }
        this.kind = kind;
        this.name = name;
        this.nameRef = nameRef;
        this.pos = pos;
    }
    XElement.prototype.toString = function (startIndent, indent, minimal) {
        if (startIndent === void 0) { startIndent = ""; }
        if (indent === void 0) { indent = ""; }
        if (minimal === void 0) { minimal = false; }
        return serializeContainer(this, startIndent, indent, minimal);
    };
    return XElement;
}());
function pushChild(parent, child) {
    if (!parent.children) {
        parent.children = [child];
    }
    else {
        parent.children.push(child);
    }
    return child;
}
var XText = /** @class */ (function () {
    function XText(value, pos) {
        if (pos === void 0) { pos = -1; }
        this.value = value;
        this.pos = pos;
        this.kind = "#text";
    }
    XText.prototype.toString = function () {
        return this.value.replace(RX_TEXT_SPECIALS, "!$1");
    };
    return XText;
}());
var XParam = /** @class */ (function () {
    function XParam(kind, name, value, pos) {
        if (pos === void 0) { pos = -1; }
        this.kind = kind;
        this.name = name;
        this.value = value;
        this.pos = pos;
        this.holdsValue = true;
        if (value === U || value === NO_VALUE) {
            this.holdsValue = false;
            this.value = U;
        }
        else if (value.kind === "#ref") {
            this.valueRef = value.identifier;
        }
    }
    return XParam;
}());
function pushParam(elt, param) {
    if (!elt.params) {
        elt.params = [param];
    }
    else {
        elt.params.push(param);
    }
    return param;
}

var XJS_TM_GRAMMAR = 'syntaxes/xjs.tmLanguage.json';
var XJS_REGISTRY = new Registry({
    loadGrammar: function () {
        return new Promise(function (c, e) {
            readFile(XJS_TM_GRAMMAR, function (error, content) {
                if (error) {
                    e(error);
                }
                else {
                    var rawGrammar = parseRawGrammar(content.toString(), XJS_TM_GRAMMAR);
                    c(rawGrammar);
                }
            });
        });
    }
});
var xjsGrammar;
function tokenize(src) {
    return __awaiter(this, void 0, void 0, function () {
        var ruleStack, lines, result, i, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!xjsGrammar) return [3 /*break*/, 2];
                    return [4 /*yield*/, XJS_REGISTRY.loadGrammar("source.ts")];
                case 1:
                    xjsGrammar = _a.sent();
                    _a.label = 2;
                case 2:
                    lines = src.split("\n"), result = [];
                    for (i = 0; i < lines.length; i++) {
                        r = xjsGrammar.tokenizeLine(lines[i], ruleStack);
                        result.push(r.tokens);
                        ruleStack = r.ruleStack;
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}

var U$1 = undefined, RX_CR = /\n/, RX_FILE_NAME = /[^\/]+$/, RX_SECTION_DEF = /^\s*\/\/\s*@@extract\:\s*(\w[\w\$\-]*)( .*)?$/, RX_SECTION_NAME = /^\w[\w\$\-]*$/, RX_FILE_EXT = /\.([^\.]+)$/, RX_EMPTY_LINE = /^\s*$/, STR_NBSP = '\u00A0'; // non-breaking space
function extract() {
    var cache = {};
    return {
        process: function (target, params, ctxt) {
            return __awaiter(this, void 0, void 0, function () {
                var value, sectionDict, sectionName, fileExtension, relPath, idx, p, fileContent, f, ex_1, msg, lines, len, section_1, ln, i, sName, _a, section, k, host;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            value = params.value;
                            sectionName = "", fileExtension = "";
                            if (value === U$1) {
                                return [2 /*return*/, ctxt.error("Invalid usage: file path must be provided")];
                            }
                            relPath = value.value, idx = relPath.indexOf('#');
                            if (idx < 0) {
                                return [2 /*return*/, ctxt.error("Invalid file path: no section name provided", value.pos)];
                            }
                            sectionName = relPath.slice(idx + 1);
                            relPath = relPath.slice(0, idx);
                            if (relPath.match(RX_FILE_EXT)) {
                                fileExtension = RegExp.$1;
                            }
                            sectionDict = cache[relPath];
                            if (!(sectionDict === U$1)) return [3 /*break*/, 7];
                            cache[relPath] = sectionDict = { lines: [], sections: [] };
                            if (relPath.charAt(0) === "/") {
                                ctxt.error("Invalid path: file path must be relative", value.pos);
                            }
                            p = join(ctxt.fileId.replace(RX_FILE_NAME, ""), relPath);
                            fileContent = "";
                            if (!isAbsolute(p)) {
                                p = join(__dirname, p);
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, promises.open(p, "r")];
                        case 2:
                            f = _b.sent();
                            return [4 /*yield*/, f.readFile({ encoding: 'utf8' })];
                        case 3:
                            fileContent = _b.sent();
                            f.close();
                            return [3 /*break*/, 5];
                        case 4:
                            ex_1 = _b.sent();
                            msg = ex_1.message || "" + ex_1;
                            if (msg.match(/no such file/i)) {
                                msg = "File not found: " + p;
                            }
                            return [2 /*return*/, ctxt.error(msg)];
                        case 5:
                            lines = sectionDict.lines = fileContent.split(RX_CR), len = lines.length;
                            ln = void 0;
                            for (i = 0; len > i; i++) {
                                ln = lines[i];
                                if (ln.match(RX_SECTION_DEF)) {
                                    sName = RegExp.$1;
                                    if (sectionDict.sections[sName] !== U$1) {
                                        ctxt.error("Invalid file content: '" + sName + "' is defined twice");
                                    }
                                    section_1 = sectionDict.sections[sName] = { lineIdx: i + 1, nbrOfLines: 0 };
                                }
                                else if (section_1 !== U$1) {
                                    section_1.nbrOfLines++;
                                }
                            }
                            if (!(fileExtension === "ts")) return [3 /*break*/, 7];
                            _a = sectionDict;
                            return [4 /*yield*/, tokenize(fileContent)];
                        case 6:
                            _a.tokens = _b.sent();
                            _b.label = 7;
                        case 7:
                            section = sectionDict.sections[sectionName];
                            if (section === U$1) {
                                if (!sectionName.match(RX_SECTION_NAME)) {
                                    ctxt.error("Invalid section name: '" + sectionName + "'");
                                }
                                else {
                                    ctxt.error("Section not found: '" + sectionName + "'");
                                }
                            }
                            k = target.kind;
                            if (k !== "#element" && k !== "#fragment" && k !== "#component" && k !== "#paramNode") {
                                return [2 /*return*/, ctxt.error("Only elements, fragments, components or param nodes can be used as host", target.pos)];
                            }
                            host = target;
                            if (host.children !== U$1 && host.children.length > 0) {
                                return [2 /*return*/, ctxt.error("Host cannot contain child elements", target.pos)];
                            }
                            createContentNodes(host, section, sectionDict, fileExtension.toLowerCase());
                            return [2 /*return*/];
                    }
                });
            });
        }
    };
    function createContentNodes(host, section, sectionDict, fileExtension) {
        var lines = sectionDict.lines, len = lines.length;
        if (len === 0 || section.nbrOfLines === 0)
            return;
        var main = addElement(host, "div"), idx0 = section.lineIdx, tokens = sectionDict.tokens;
        addParam(main, "class", "extract " + fileExtension);
        for (var i = 0; section.nbrOfLines > i; i++) {
            var lineDiv = addElement(main, "div");
            if (tokens !== U$1) {
                processTokens(lineDiv, tokens[idx0 + i], lines[idx0 + i]);
            }
            else {
                addText(lineDiv, lines[idx0 + i] || STR_NBSP);
            }
        }
        removeLastEmptyLines(main);
    }
}
function removeLastEmptyLines(mainDiv) {
    var ch = mainDiv.children;
    if (ch === U$1)
        return;
    var len = ch.length;
    var removeIdx = -1;
    if (len > 1) {
        for (var i = len - 1; i > 0; i--) {
            var lineDiv = ch[i];
            if (lineDiv.children.length === 1) {
                var c = lineDiv.children[0];
                if (c.kind === "#text") {
                    if (c.value.match(RX_EMPTY_LINE)) {
                        removeIdx = i;
                    }
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }
    }
    if (removeIdx > -1) {
        ch.splice(removeIdx);
    }
}
function processTokens(host, tokens, line) {
    var len = tokens.length;
    var scopes, rootScope = createTkScope("#root", host, ""), currentTk = rootScope, len2;
    for (var i = 0; len > i; i++) {
        var t = tokens[i], text = formatTsText(line.substring(t.startIndex, t.endIndex));
        scopes = t.scopes;
        len2 = scopes.length;
        currentTk = rootScope;
        // process current token
        for (var j = 0; len2 > j; j++) {
            var sName = scopes[j];
            if (currentTk.next === null || currentTk.next.name !== sName) {
                // create a new token
                currentTk.next = createTkScope(sName, currentTk.container, currentTk.className);
                // determine if a new span container must be created
                var sClass = getScopeClass(sName);
                if (sClass !== "" && sClass !== currentTk.className) {
                    var cn = currentTk.next.container = addElement(currentTk.container, "span");
                    addParam(cn, "class", sClass);
                    currentTk.next.className = sClass;
                }
            }
            currentTk = currentTk.next;
        }
        // console.log("token: ", text, scopes.join(" / "));
        updateText(currentTk.container, text);
    }
    if (host.children === U$1 || host.children.length === 0) {
        addText(host, STR_NBSP);
    }
    function updateText(host, text) {
        if (text !== "") {
            var ch = host.children;
            if (ch === U$1 || ch.length === 0 || ch[ch.length - 1].kind !== "#text") {
                // create new text elt
                addText(host, text);
            }
            else {
                var txtNode = ch[ch.length - 1];
                txtNode.value += text;
            }
        }
    }
    function createTkScope(name, container, className) {
        return {
            name: name,
            container: container,
            next: null,
            className: className
        };
    }
}
function formatTsText(txt) {
    return txt.replace(/ /g, STR_NBSP);
}
var SCOPE_CLASSES = [
    /^variable/, "hv",
    /^keyword/, "hk",
    /^storage/, "hr",
    /^string/, "hs",
    /^entity.name.function/, "hf",
    /^entity.name.type/, "ht",
    /^entity.name.tag/, "hg",
    /^entity.other/, "ho",
    /^entity/, "he",
    /^comment/, "hc",
    /^constant/, "hn",
    /^support.type/, "hy",
    /^punctuation.definition.tag/, "hp",
    /^punctuation.section.embedded/, "hd"
];
function getScopeClass(nm) {
    var len = SCOPE_CLASSES.length;
    for (var i = 0; len > i; i += 2) {
        if (nm.match(SCOPE_CLASSES[i])) {
            return SCOPE_CLASSES[i + 1];
        }
    }
    return "";
}
// comment { "foreground": "#6A9955" } // comments
// string { "foreground": "#ce9178" } // string literals
// constant.numeric { "foreground": "#b5cea8" } // numeric literals e.g. 123
// constant.language  // built-in constants - e.g. *
// constant.character
// constant.character.escape { "foreground": "#d7ba7d" }
// constant.other
// variable { "foreground": "#9CDCFE" } // var identifier
// variable.parameter
// keyword
// keyword.operator { "foreground": "#d4d4d4" } // =
// keyword.control { "foreground": "#C586C0" } // else / import
// storage
// storage.type { "foreground": "#569cd6" } // function/const/=>
// entity.name.class
// entity.name.type { "foreground": "#4EC9B0" } // Promise
// entity.name.function { "foreground": "#DCDCAA" } // function identifier
// entity.name.tag
// entity.other
// entity.other.attribute { "foreground": "#4EC9B0" }
// entity.other.attribute-name
// support.function // library function
// support.constant // library constant
// support.type
// support.class
// support.other.variable
// punctuation.definition.tag { "foreground": "#808080" }
// punctuation.section.embedded { "foreground": "#569cd6" }

export { extract };
