import { createFilter } from 'rollup-pluginutils';
import { promises } from 'fs';
import { relative, dirname, join } from 'path';

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

var U = undefined, NO_VALUE = { kind: "#ref", identifier: "" };
// -------------------------------------------------------------------------------------
// Tree API to dynamically create an XDF tree and bypass the XDF parser
function createXdfFragment(root, pos) {
    if (root === void 0) { root = true; }
    if (pos === void 0) { pos = -1; }
    return new XFragment(root, pos);
}
function createXdfElement(kind, name, nameRef, pos) {
    if (pos === void 0) { pos = -1; }
    return new XElement(kind, name, nameRef, pos);
}
function createXdfCData(content, pos) {
    if (pos === void 0) { pos = -1; }
    return new XCData(content, pos);
}
function createXdfText(text, pos) {
    if (pos === void 0) { pos = -1; }
    return new XText(text, pos);
}
function addElement(parent, name, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXdfElement("#element", name, U, pos));
}
function addComponent(parent, ref, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXdfElement("#component", U, ref.identifier, pos));
}
function addFragment(parent, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXdfFragment(false, pos));
}
function addCData(parent, content, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXdfCData(content, pos));
}
function addParamNode(parent, name, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXdfElement("#paramNode", name, U, pos));
}
function addText(parent, text, pos) {
    if (pos === void 0) { pos = -1; }
    pushChild(parent, createXdfText(text, pos));
}
function addParam(parent, name, value, isProperty, pos) {
    if (pos === void 0) { pos = -1; }
    return pushParam(parent, new XParam(isProperty === true ? "#property" : "#param", name, value, pos));
}
function addDecorator(parent, nameRef, value, pos) {
    if (value === void 0) { value = NO_VALUE; }
    if (pos === void 0) { pos = -1; }
    return pushParam(parent, new XParam("#decorator", nameRef.identifier, value, pos));
}
function addLabel(parent, name, value, pos) {
    if (pos === void 0) { pos = -1; }
    return pushParam(parent, new XParam("#label", name, value, pos));
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
            console.log("[XDF AST] references can only be created on root fragments - please check '" + name + "'");
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
        buf.push(">" + node.content + "</!cdata>");
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
        return this.value;
    };
    return XText;
}());
var XCData = /** @class */ (function () {
    function XCData(content, pos) {
        if (pos === void 0) { pos = -1; }
        this.content = content;
        this.pos = pos;
        this.kind = "#cdata";
    }
    XCData.prototype.toString = function (startIndent, indent) {
        if (startIndent === void 0) { startIndent = ""; }
        if (indent === void 0) { indent = ""; }
        return serializeContainer(this, startIndent, indent);
    };
    return XCData;
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

var U$1 = undefined, CDATA = "cdata", CDATA_LENGTH = CDATA.length, CDATA_END = "</!cdata>", CDATA_END_LENGTH = CDATA_END.length, CHAR_EOS = -1, // end of string
CHAR_NL = 10, // \n new line
CHAR_SPACE = 32, // space
CHAR_BANG = 33, // !
CHAR_DQUO = 34, // "
CHAR_HASH = 35, // #
CHAR_SQUO = 39, // '
CHAR_PARS = 40, // (
CHAR_PARE = 41, // )
CHAR_STAR = 42, // *
CHAR_PLUS = 43, // +
CHAR_MINUS = 45, // -
CHAR_DOT = 46, // .
CHAR_AT = 64, // @
CHAR_FSLA = 47, // forward slash: /
CHAR_BSLA = 92, // back slash: \
CHAR_SBRS = 91, // [
CHAR_SBRE = 93, // ]
CHAR_UNDER = 95, // _
CHAR_LT = 60, // <
CHAR_EQ = 61, // =
CHAR_GT = 62, // >
CHAR_CS = 123, // {
CHAR_CE = 125, // }
CHAR_n = 110, CHAR_t = 116, CHAR_r = 114, CHAR_u = 117, CHAR_e = 101, CHAR_f = 102, CHAR_a = 97, CHAR_l = 108, CHAR_s = 115, CHAR_NBSP = '\u00A0'.charCodeAt(0), // non breaking space
RX_TRAILING_SPACES = /[ \t\r\f\n]+$/;
// parse generates an XdfFragment (XDF tree)
function parse(xdf, context) {
    return __awaiter(this, void 0, void 0, function () {
        function moveNext() {
            return shiftNext(1);
        }
        function shiftNext(length) {
            pos += length;
            return cc = pos < posEOS ? xdf.charCodeAt(pos) : CHAR_EOS;
        }
        function nextCharCode() {
            return pos + 1 < posEOS ? xdf.charCodeAt(pos + 1) : CHAR_EOS;
        }
        function nextChars(length) {
            return pos + length < posEOS ? xdf.substr(pos, length) : "";
        }
        function eat(charCode, errMsg) {
            if (cc !== charCode) {
                if (errMsg === undefined) {
                    error(charName(charCode) + " expected instead of " + charName(cc));
                }
                else {
                    error(errMsg);
                }
            }
            return moveNext();
        }
        function xdfContent(parent) {
            return __awaiter(this, void 0, void 0, function () {
                var keepGoing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            keepGoing = true;
                            _a.label = 1;
                        case 1:
                            if (!keepGoing) return [3 /*break*/, 3];
                            return [4 /*yield*/, xdfElement(parent)];
                        case 2:
                            if (!(_a.sent()) && !xdfText(parent)) {
                                keepGoing = false;
                            }
                            return [3 /*break*/, 1];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        function xdfText(parent) {
            // return true if blank spaces or text characters have been found
            if (cc === CHAR_LT || cc === CHAR_EOS)
                return false;
            var spacesFound = xdfSpaces(), startPos = pos;
            if (cc !== CHAR_LT && cc !== CHAR_EOS) {
                var charCodes = [];
                if (spacesFound) {
                    charCodes[0] = CHAR_SPACE; // leading spaces are transformed in a single space
                }
                var lastIsSpace = spacesFound;
                while (cc !== CHAR_LT && cc !== CHAR_EOS) {
                    eatComments();
                    // capture string
                    if (cc === CHAR_BSLA) {
                        cc = eat(CHAR_BSLA); // \
                        if (cc === CHAR_SPACE || cc === CHAR_s) {
                            // transform into non-breaking space
                            moveNext();
                            charCodes.push(CHAR_NBSP);
                            lastIsSpace = true;
                        }
                        else if (cc == CHAR_n) {
                            // \n new line
                            moveNext();
                            charCodes.push(CHAR_NL);
                            lastIsSpace = true;
                        }
                    }
                    else {
                        if (lastIsSpace && isSpace(cc) && cc !== CHAR_NL) {
                            moveNext(); // keep only one space but keep new lines
                        }
                        else {
                            lastIsSpace = isSpace(cc);
                            charCodes.push(cc);
                            moveNext();
                        }
                    }
                }
                addText(parent, String.fromCharCode.apply(null, charCodes).replace(RX_TRAILING_SPACES, " "), startPos);
            }
            return true;
        }
        function xdfSpaces() {
            // eat spaces (white spaces or carriage return, tabs, etc.) 
            // return true if spaces have been found
            if (cc === CHAR_EOS)
                return false;
            var startPos = pos, processing = true;
            while (processing) {
                if (isSpace(cc)) {
                    // white spaces
                    moveNext();
                    eatComments();
                }
                else if (!eatComments()) {
                    processing = false;
                }
            }
            return pos !== startPos;
        }
        function isSpace(c) {
            // CHAR_BACK = 8,   // \b backspace
            // CHAR_TAB = 9,    // \t tab
            // CHAR_NL = 10,    // \n new line
            // CHAR_VTAB = 11,  // \v vertical tab
            // CHAR_FEED = 12,  // \f form feed
            // CHAR_CR = 13,    // \r carriage return
            return c === CHAR_SPACE || (c > 7 && c < 14);
        }
        function eatComments() {
            if (cc !== CHAR_FSLA)
                return false;
            var nc = nextCharCode();
            if (nc === CHAR_FSLA) {
                // double-slash comment
                eat(CHAR_FSLA);
                eat(CHAR_FSLA);
                while (CHAR_NL !== cc && CHAR_EOS !== cc) {
                    moveNext();
                }
                moveNext(); // to eat last new line
                return true;
            }
            else if (nc === CHAR_STAR) {
                eat(CHAR_FSLA);
                eat(CHAR_STAR);
                var processing = true;
                while (processing) {
                    if (CHAR_EOS === cc || (CHAR_STAR === cc && nextCharCode() === CHAR_FSLA)) {
                        moveNext();
                        processing = false;
                    }
                    moveNext();
                }
                return true;
            }
            return false;
        }
        function xdfElement(parent) {
            return __awaiter(this, void 0, void 0, function () {
                function eatPrefix() {
                    if (cc === CHAR_STAR || cc === CHAR_DOT || cc === CHAR_AT) { // * . @
                        prefix = cc;
                        cc = moveNext(); // eat prefix
                        return prefix;
                    }
                    return 0;
                }
                function createElement() {
                    if (prefix === CHAR_STAR) { // *
                        return addComponent(parent, xf.ref(name), pos);
                    }
                    else if (prefix === CHAR_DOT) { // .
                        return addParamNode(parent, name, pos);
                    }
                    else if (prefix === CHAR_AT) { // @
                        // decorator node
                        error("Decorator node are not supported yet");
                    }
                    return addElement(parent, name, pos);
                }
                function eltName(prefix, nm) {
                    return (prefix === 0 ? "" : String.fromCharCode(prefix)) + nm;
                }
                var prefix, name, eltOrFragment, ppDataList, endPos, p1, p2, name2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // return true if an element, a fragment or a cdata section has been found
                            if (cc !== CHAR_LT || nextCharCode() === CHAR_FSLA)
                                return [2 /*return*/, false];
                            cc = eat(CHAR_LT); // <
                            prefix = 0;
                            eatPrefix();
                            name = "";
                            if (!(cc === CHAR_BANG)) return [3 /*break*/, 2];
                            eat(CHAR_BANG);
                            return [4 /*yield*/, xdfCData(parent)];
                        case 1:
                            if (_a.sent()) {
                                return [2 /*return*/, true];
                            }
                            eltOrFragment = addFragment(parent, pos);
                            return [3 /*break*/, 3];
                        case 2:
                            name = xdfIdentifier(true, prefix === 0);
                            eltOrFragment = createElement();
                            _a.label = 3;
                        case 3:
                            ppDataList = null;
                            if (!xdfSpaces()) return [3 /*break*/, 6];
                            return [4 /*yield*/, xdfParams(eltOrFragment, parent, endParamReached)];
                        case 4:
                            // spaces have been found: parse params
                            ppDataList = _a.sent();
                            if (!(ppDataList !== null)) return [3 /*break*/, 6];
                            return [4 /*yield*/, callPreProcessors(ppDataList, eltOrFragment, parent, "setup")];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            if (!(cc === CHAR_FSLA)) return [3 /*break*/, 7];
                            // end of element
                            eat(CHAR_FSLA); // /
                            eat(CHAR_GT); // >
                            return [3 /*break*/, 10];
                        case 7:
                            if (!(cc === CHAR_GT)) return [3 /*break*/, 9];
                            eat(CHAR_GT); // >
                            // parse element content
                            return [4 /*yield*/, xdfContent(eltOrFragment)];
                        case 8:
                            // parse element content
                            _a.sent();
                            // parse end of element
                            eat(CHAR_LT); // <
                            eat(CHAR_FSLA); // /
                            endPos = pos;
                            p1 = prefix, p2 = eatPrefix(), name2 = xdfIdentifier(false);
                            if (name2 === "" && p2 === 0 && CHAR_BANG === cc) {
                                eat(CHAR_BANG); // end of fragment !
                            }
                            else if (name2 !== "" || p2 !== 0) {
                                // end tag name is provided
                                if (p1 !== p2 || (name2 !== "" && name2 !== name)) {
                                    error('End tag </' + eltName(p2, name2) + '> doesn\'t match <' + eltName(p1, name) + '>', endPos);
                                }
                            }
                            xdfSpaces();
                            eat(CHAR_GT); // >
                            return [3 /*break*/, 10];
                        case 9:
                            error();
                            _a.label = 10;
                        case 10:
                            if (!(ppDataList !== null)) return [3 /*break*/, 12];
                            return [4 /*yield*/, callPreProcessors(ppDataList, eltOrFragment, parent, "process")];
                        case 11:
                            _a.sent();
                            _a.label = 12;
                        case 12: return [2 /*return*/, true];
                    }
                });
            });
        }
        function callPreProcessors(ppDataList, target, parent, hookName, src) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, ppDataList_1, ppData, pp, ppParams, _a, _b, p, ex_1, msg;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _i = 0, ppDataList_1 = ppDataList;
                            _c.label = 1;
                        case 1:
                            if (!(_i < ppDataList_1.length)) return [3 /*break*/, 6];
                            ppData = ppDataList_1[_i];
                            if (ppFactories === U$1 || ppFactories[ppData.name] === U$1) {
                                error("Undefined pre-processor '" + ppData.name + "'", ppData.pos);
                                return [2 /*return*/];
                            }
                            pp = preProcessors[ppData.name];
                            if (pp === U$1) {
                                pp = preProcessors[ppData.name] = ppFactories[ppData.name]();
                            }
                            if (pp[hookName] === U$1)
                                return [3 /*break*/, 5];
                            if (ppData.paramsDict === U$1) {
                                ppParams = {};
                                if (ppData.params) {
                                    for (_a = 0, _b = ppData.params; _a < _b.length; _a++) {
                                        p = _b[_a];
                                        ppParams[p.name] = p;
                                    }
                                }
                                ppData.paramsDict = ppParams;
                            }
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, pp[hookName](target, ppData.paramsDict, getPreProcessorContext(ppData.name, parent, ppData.pos))];
                        case 3:
                            _c.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            ex_1 = _c.sent();
                            msg = ex_1.message || ex_1;
                            if (msg.match(/^XDF\:/)) {
                                // error was triggered through context.error()
                                throw ex_1;
                            }
                            else {
                                error("Error in " + ppData.name + " " + hookName + "() execution: " + msg, ppData.pos);
                            }
                            return [3 /*break*/, 5];
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }
        function getPreProcessorContext(ppName, parent, processorPos) {
            currentPpName = ppName;
            currentPpPos = processorPos;
            if (ppContext === U$1) {
                ppContext = {
                    parent: parent,
                    fileId: context ? context.fileId || "" : "",
                    rootFragment: xf,
                    error: function (msg, pos) {
                        if (pos === void 0) { pos = -1; }
                        error(currentPpName + ": " + msg, pos > -1 ? pos : currentPpPos);
                    },
                    preProcessors: ppFactories
                };
            }
            else {
                ppContext.parent = parent;
            }
            return ppContext;
        }
        function endParamReached() {
            return (cc === CHAR_FSLA || cc === CHAR_GT); // / or >
        }
        function xdfCData(parent) {
            return __awaiter(this, void 0, void 0, function () {
                var startPos, cdata, ppDataList, charCodes, processing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(CDATA === nextChars(CDATA_LENGTH))) return [3 /*break*/, 6];
                            startPos = pos;
                            shiftNext(CDATA_LENGTH);
                            cdata = addCData(parent, "", pos), ppDataList = null;
                            if (!xdfSpaces()) return [3 /*break*/, 3];
                            return [4 /*yield*/, xdfParams(cdata, parent, endParamReached)];
                        case 1:
                            // spaces have been found: parse params
                            ppDataList = _a.sent();
                            if (!(ppDataList !== null)) return [3 /*break*/, 3];
                            return [4 /*yield*/, callPreProcessors(ppDataList, cdata, parent, "setup")];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            eat(CHAR_GT); // >
                            charCodes = [], processing = true;
                            while (processing) {
                                if (cc === CHAR_EOS) {
                                    processing = false;
                                    error("Invalid cdata section: end marker '</!cdata>' not found", startPos - 2);
                                }
                                else if (cc === CHAR_BSLA) {
                                    // backslash
                                    moveNext();
                                    if (CDATA_END === nextChars(CDATA_END_LENGTH)) {
                                        // we escape end of cdata
                                        charCodes.push(cc);
                                        moveNext();
                                    }
                                    else {
                                        // push the backslash
                                        charCodes.push(CHAR_BSLA);
                                    }
                                }
                                else {
                                    if (cc === CHAR_LT && CDATA_END === nextChars(CDATA_END_LENGTH)) {
                                        shiftNext(CDATA_END_LENGTH);
                                        processing = false;
                                    }
                                    else {
                                        charCodes.push(cc);
                                        moveNext();
                                    }
                                }
                            }
                            cdata.content = String.fromCharCode.apply(null, charCodes);
                            if (!(ppDataList !== null)) return [3 /*break*/, 5];
                            return [4 /*yield*/, callPreProcessors(ppDataList, cdata, parent, "process")];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/, true];
                        case 6: return [2 /*return*/, false];
                    }
                });
            });
        }
        function xdfIdentifier(mandatory, acceptDashes) {
            if (acceptDashes === void 0) { acceptDashes = false; }
            // identifier is used for references and component/decorators names (which area also references)
            // they cannot start with $ on the contrary to JS identifiers
            var charCodes = [];
            // first char cannot be a number
            if (ccIsChar() || cc === CHAR_UNDER) {
                charCodes.push(cc);
                moveNext();
                while (ccIsChar() || ccIsNumber() || cc === CHAR_UNDER || (acceptDashes && cc === CHAR_MINUS)) {
                    charCodes.push(cc);
                    moveNext();
                }
            }
            else if (mandatory) {
                error("Invalid XDF identifier");
            }
            if (charCodes.length === 0)
                return "";
            return String.fromCharCode.apply(null, charCodes);
        }
        function xdfParams(parent, grandParent, endReached) {
            return __awaiter(this, void 0, void 0, function () {
                function endDecoParamReached() {
                    return (cc === CHAR_PARE); // )
                }
                function registerParam(name, ppData, value, isProperty) {
                    if (isProperty === void 0) { isProperty = false; }
                    var p = parent;
                    if (ppData !== null) {
                        p = ppData;
                    }
                    if (prefix === CHAR_AT) {
                        return addDecorator(p, xf.ref(name), value, startPos);
                    }
                    else if (prefix === CHAR_HASH) {
                        // todo error if ppData
                        return addLabel(p, name, value, startPos);
                    }
                    return addParam(p, name, value, isProperty, startPos);
                }
                function eatPrefix() {
                    // [ @ or #
                    if (cc === CHAR_SBRS || cc === CHAR_AT || cc === CHAR_HASH) {
                        var res = cc;
                        moveNext();
                        return res;
                    }
                    return 0;
                }
                var prefix, keepGoing, result, startPos, ppData, errorPos, name_1, isProperty, spacesFound, d, r;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            prefix = 0, keepGoing = true, result = null, startPos = -1;
                            _a.label = 1;
                        case 1:
                            if (!(keepGoing && !endReached())) return [3 /*break*/, 8];
                            // param name: prefix + name
                            startPos = pos;
                            prefix = eatPrefix();
                            ppData = null;
                            if (prefix === CHAR_AT && cc === CHAR_AT) {
                                // this is a pre-processor
                                eat(CHAR_AT); // 2nd @
                                if (parent.kind === "#preprocessorData") {
                                    errorPos = pos - 2;
                                    error("Pre-processors cannot be used on pre-processors: check @@" + xdfIdentifier(true, false), errorPos);
                                }
                                ppData = {
                                    kind: "#preprocessorData",
                                    name: "",
                                    pos: pos - 2 // to be before the '@@' prefix
                                };
                            }
                            name_1 = xdfIdentifier(true, prefix === 0), isProperty = false;
                            if (prefix === CHAR_SBRS) { // [
                                eat(CHAR_SBRE); // ]
                                isProperty = true;
                            }
                            if (ppData !== null) {
                                ppData.name = "@@" + name_1;
                            }
                            if (prefix === CHAR_HASH && parent.kind === "#preprocessorData") {
                                error("Labels cannot be used on pre-processors", parent.pos);
                            }
                            spacesFound = xdfSpaces();
                            if (!(cc === CHAR_EQ)) return [3 /*break*/, 2];
                            // look for value
                            eat(CHAR_EQ);
                            xdfSpaces();
                            if (ppData !== null) {
                                registerParam("value", ppData, xdfParamValue());
                            }
                            else {
                                registerParam(name_1, ppData, xdfParamValue(), isProperty);
                            }
                            if (!xdfSpaces()) {
                                // no spaces found -> we have reached the end of the param list
                                keepGoing = false;
                            }
                            return [3 /*break*/, 7];
                        case 2:
                            if (!(prefix === CHAR_AT && cc === CHAR_PARS)) return [3 /*break*/, 6];
                            d = void 0;
                            if (ppData !== null) {
                                d = ppData;
                            }
                            else {
                                d = registerParam(name_1, ppData);
                            }
                            // look for attribute params for decorators
                            eat(CHAR_PARS); // ( parens start
                            xdfSpaces();
                            return [4 /*yield*/, xdfParams(d, parent, endDecoParamReached)];
                        case 3:
                            r = _a.sent();
                            eat(CHAR_PARE); // ) parens end
                            if (!xdfSpaces()) {
                                // no spaces found -> we have reached the end of the param list
                                keepGoing = false;
                            }
                            if (!(r != null && ppData === null)) return [3 /*break*/, 5];
                            return [4 /*yield*/, callPreProcessors(r, d, grandParent, "process")];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            if (spacesFound || cc === CHAR_GT || cc === CHAR_FSLA || cc === CHAR_PARE) { // > or / or )
                                // orphan attribute
                                if (ppData === null) {
                                    registerParam(name_1, ppData);
                                }
                            }
                            else {
                                keepGoing = false;
                            }
                            _a.label = 7;
                        case 7:
                            if (ppData !== null) {
                                if (result === null) {
                                    result = [];
                                }
                                result.push(ppData);
                            }
                            return [3 /*break*/, 1];
                        case 8:
                            if (!endReached()) {
                                error();
                            }
                            return [2 /*return*/, result];
                    }
                });
            });
        }
        function xdfParamValue() {
            // return the param value
            if (cc === CHAR_SQUO) {
                return stringContent(CHAR_SQUO); // single quote string
            }
            else if (cc === CHAR_DQUO) {
                return stringContent(CHAR_DQUO); // double quote string
            }
            else if (cc === CHAR_CS) { // {
                // reference
                eat(CHAR_CS);
                xdfSpaces();
                var refName = xdfIdentifier(true, false);
                xdfSpaces();
                eat(CHAR_CE);
                return xf.ref(refName);
            }
            else if (cc === CHAR_t) {
                // true
                eat(CHAR_t);
                eat(CHAR_r);
                eat(CHAR_u);
                eat(CHAR_e);
                return true;
            }
            else if (cc === CHAR_f) {
                // false
                eat(CHAR_f);
                eat(CHAR_a);
                eat(CHAR_l);
                eat(CHAR_s);
                eat(CHAR_e);
                return false;
            }
            else if (ccIsNumber() || ccIsSign()) {
                // number: 123 or 12.34
                var charCodes = [];
                if (ccIsSign()) {
                    charCodes.push(cc);
                    moveNext();
                    xdfSpaces();
                }
                while (ccIsNumber()) {
                    charCodes.push(cc);
                    moveNext();
                }
                if (cc === CHAR_DOT) {
                    charCodes.push(CHAR_DOT);
                    moveNext();
                    if (!ccIsNumber()) {
                        error("Invalid number");
                    }
                    while (ccIsNumber()) {
                        charCodes.push(cc);
                        moveNext();
                    }
                }
                return parseFloat(String.fromCharCode.apply(null, charCodes));
            }
            error("Invalid parameter value: " + charName(cc));
            return 0;
        }
        function error(msg, errorPos) {
            var lines = xdf.split("\n"), lineLen = 0, posCount = 0, idx = 0, lineNbr = lines.length, columnNbr = lines[lineNbr - 1].length;
            errorPos = errorPos || pos;
            if (errorPos > -1) {
                while (idx < lines.length) {
                    lineLen = lines[idx].length;
                    if (posCount + lineLen < errorPos) {
                        // continue
                        idx++;
                        posCount += lineLen + 1; // +1 for carriage return
                    }
                    else {
                        // stop
                        lineNbr = idx + 1;
                        columnNbr = 1 + errorPos - posCount;
                        break;
                    }
                }
            }
            var fileInfo = "";
            if (context !== U$1 && context.fileId !== U$1) {
                fileInfo = "\nFile: " + context.fileId;
            }
            if (msg === U$1) {
                msg = "Invalid character: " + charName(cc);
            }
            throw "XDF: " + msg + "\nLine " + lineNbr + " / Col " + columnNbr + fileInfo + "\nExtract: >> " + lines[lineNbr - 1].trim() + " <<";
        }
        function charName(c) {
            if (c === CHAR_EOS)
                return "End of Content";
            return "'" + String.fromCharCode(c) + "'";
        }
        function stringContent(delimiter) {
            var charCodes = [];
            eat(delimiter);
            while (cc !== delimiter && cc !== CHAR_EOS) {
                if (cc === CHAR_BSLA) { // \
                    moveNext();
                }
                charCodes.push(cc);
                moveNext();
            }
            eat(delimiter);
            return String.fromCharCode.apply(null, charCodes);
        }
        function ccIsChar() {
            // a:97 z:122 A:65 Z:90
            return (cc > 96 && cc < 123) || (cc > 64 && cc < 91);
        }
        function ccIsNumber() {
            // 0:48 9:57
            return cc > 47 && cc < 58;
        }
        function ccIsSign() {
            return cc === CHAR_PLUS || cc === CHAR_MINUS;
        }
        var xf, posEOS, pos, cc, ppContext, currentPpName, currentPpPos, globalPreProcessors, ppFactories, preProcessors, ppDataList, _i, globalPreProcessors_1, pp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    xf = createXdfFragment(), posEOS = xdf.length, pos = 0, cc = CHAR_EOS, currentPpName = "", currentPpPos = 0, globalPreProcessors = context ? context.globalPreProcessors : U$1, ppFactories = context ? context.preProcessors || {} : {}, preProcessors = {};
                    if (!(posEOS > 0)) return [3 /*break*/, 6];
                    cc = xdf.charCodeAt(0);
                    ppDataList = void 0;
                    if (!(globalPreProcessors !== U$1)) return [3 /*break*/, 2];
                    ppDataList = [];
                    for (_i = 0, globalPreProcessors_1 = globalPreProcessors; _i < globalPreProcessors_1.length; _i++) {
                        pp = globalPreProcessors_1[_i];
                        ppDataList.push({
                            kind: "#preprocessorData",
                            name: pp,
                            pos: 0
                        });
                    }
                    return [4 /*yield*/, callPreProcessors(ppDataList, xf, null, "setup")];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [4 /*yield*/, xdfContent(xf)];
                case 3:
                    _a.sent();
                    if (!(ppDataList !== U$1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, callPreProcessors(ppDataList, xf, null, "process")];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (cc !== CHAR_EOS) {
                        error();
                    }
                    _a.label = 6;
                case 6: return [2 /*return*/, xf];
            }
        });
    });
}

var U$2 = undefined, RX_TARGET = /^(\.?[\?a-zA-Z_]\w*)+(\.|\[\]\.?)?$/, RX_EXPORT = /^[\?a-zA-Z_]\w*$/, RX_ARRAY_TARGET = /\[\](\.)?$/;
// Process an xdf string and return a JSON string
function stringify(xdf, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, processXdf(xdf, "string", context)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function processXdf(xdf, output, context) {
    return __awaiter(this, void 0, void 0, function () {
        function json() {
            function isRootNode(target, root) {
                return (target === root) || (root.children.length === 1 && target === root.children[0]);
            }
            return {
                setup: function (target, params, ctxt) {
                    var pTarget = null;
                    if (params.value !== U$2) {
                        pTarget = params.value.value || null;
                    }
                    else if (params.target !== U$2) {
                        pTarget = params.target.value || null;
                    }
                    if (pTarget !== null) {
                        var r = pTarget.match(RX_TARGET), pos = params.value ? params.value.pos : params.target.pos;
                        if (r === null) {
                            ctxt.error("Invalid target value '" + pTarget + "'", pos);
                        }
                        var isArrayTarget = (pTarget.match(RX_ARRAY_TARGET) !== null);
                        var isArrayItem = false;
                        if (isArrayTarget) {
                            if (RegExp.$1 === '.') {
                                pTarget = pTarget.slice(0, -3); // remove '[].'
                                isArrayItem = true;
                            }
                            else {
                                pTarget = pTarget.slice(0, -2); // remove '[]'
                            }
                        }
                        var path = pTarget.split(".");
                        var ref = jsonRoot, startIdx = 0, p = "";
                        if (path[0] === "") {
                            // relative path: .foo.bar
                            startIdx = 1;
                            if (stack.length > 0) {
                                var previousCtxt = stack[stack.length - 1];
                                if (previousCtxt.isArray) {
                                    ctxt.error("Relative paths ('" + pTarget + "') cannot be used in array string items", pos);
                                }
                                else {
                                    ref = stack[stack.length - 1].holder;
                                }
                            }
                        }
                        var contentName = "content";
                        for (var i = startIdx; path.length > i; i++) {
                            p = path[i];
                            if (i === path.length - 1) {
                                if (isArrayTarget) {
                                    contentName = "";
                                    if (ref[p] === U$2) {
                                        ref = ref[p] = [];
                                    }
                                    else {
                                        ref = ref[p];
                                    }
                                    if (isArrayItem) {
                                        var item = {};
                                        ref.push(item);
                                        ref = item;
                                    }
                                }
                                else if (p !== "") {
                                    contentName = p;
                                }
                            }
                            else {
                                if (ref[p] === U$2) {
                                    ref = ref[p] = {};
                                }
                                else {
                                    ref = ref[p];
                                }
                            }
                        }
                        stack.push({ holder: ref, propName: contentName, isArray: isArrayTarget && !isArrayItem, target: pTarget, pos: pos });
                    }
                    else if (target === ctxt.rootFragment) {
                        // pTarget = "content";
                        var len = stack.length;
                        if (len === 0) {
                            stack[0] = { holder: jsonRoot, propName: "content", isArray: false, target: "content", pos: 0 };
                        }
                        else {
                            var current = stack[stack.length - 1];
                            if (current.propName === "content") {
                                stack.push(current);
                            }
                            else {
                                stack.push({ holder: jsonRoot, propName: "content", isArray: false, target: "content", pos: 0 });
                            }
                        }
                    }
                },
                process: function (target, params, ctxt) {
                    // 2 possible params: export and target(default)
                    // target: path that defines where to store the string corresponding to this node - e.g. "a.b.c."
                    // export: 
                    var pExport = params.export ? params.export.value || "" : "", kind = target.kind, isFirst = isRootNode(target, ctxt.rootFragment);
                    if (pExport !== "") {
                        var pos = params.export.pos;
                        if (!isFirst) {
                            ctxt.error("'export' can only be used on root container", pos);
                        }
                        else {
                            if (pExport.match(RX_EXPORT) === null) {
                                ctxt.error("Invalid export value: '" + pExport + "'", pos);
                            }
                            if (pExport === "default") {
                                // e.g. export default {...};
                                outputPrefix = "export default ";
                            }
                            else {
                                // e.g. export const foo = {...};
                                outputPrefix = "export const " + pExport + "=";
                            }
                            outputSuffix = ";";
                        }
                    }
                    var content = "";
                    if (kind === "#element" || kind === "#fragment" || kind === "#component") {
                        content = target.toString("", "", true).trim();
                        // remove target from its parent so that it is not serialized twice
                        removeTargetFromParent(target, ctxt.parent, ctxt.rootFragment);
                    }
                    else if (kind === "#cdata") {
                        content = target.toString("", "");
                        removeTargetFromParent(target, ctxt.parent, ctxt.rootFragment);
                    }
                    else {
                        ctxt.error("Pre-processor cannot be used in " + kind, target.pos);
                    }
                    var jsonCtxt = stack.pop();
                    if (content !== "") {
                        if (jsonCtxt.isArray) {
                            jsonCtxt.holder.push(content);
                        }
                        else {
                            var val = jsonCtxt.holder[jsonCtxt.propName];
                            if (val === "" || val === U$2) {
                                jsonCtxt.holder[jsonCtxt.propName] = content;
                            }
                            else {
                                ctxt.error("Value cannot be set twice in '" + jsonCtxt.target + "'", jsonCtxt.pos);
                            }
                        }
                    }
                }
            };
        }
        function removeTargetFromParent(target, parent, root) {
            if (target !== root && parent !== null) {
                if (parent.kind === "#element" || parent.kind === "#fragment" || parent.kind === "#component") {
                    var idx = parent.children.indexOf(target);
                    if (idx > -1) {
                        parent.children.splice(idx, 1);
                    }
                }
            }
        }
        var outputPrefix, outputSuffix, jsIdx, jsonRoot, stack;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (xdf === "")
                        return [2 /*return*/, {}];
                    outputPrefix = "", outputSuffix = "";
                    context = context || { fileId: '' };
                    if (context.preProcessors === U$2) {
                        context.preProcessors = { "@@json": json };
                    }
                    else {
                        context.preProcessors["@@json"] = json;
                    }
                    if (context.globalPreProcessors === U$2) {
                        context.globalPreProcessors = [];
                    }
                    jsIdx = context.globalPreProcessors.findIndex(function (v) { return v === "@@json"; });
                    if (jsIdx < 0) {
                        context.globalPreProcessors.push("@@json"); // to have @@json called even if not explicitly mentioned in the file
                    }
                    jsonRoot = {};
                    stack = [];
                    return [4 /*yield*/, parse(xdf, context)];
                case 1:
                    _a.sent();
                    // return object or string depending on output argument
                    if (output === "object") {
                        return [2 /*return*/, jsonRoot];
                    }
                    else {
                        return [2 /*return*/, outputPrefix + JSON.stringify(jsonRoot) + outputSuffix];
                    }
            }
        });
    });
}

var RX_EXPORT$1 = /^\s*export\s+/, RX_XDF_EXTENSION = /\.xdf$/i, JSON_EXTENSION = ".json";
function xdf(opts) {
    if (opts === void 0) { opts = {}; }
    if (!opts.include) {
        opts.include = '**/*.xdf';
    }
    var filter = createFilter(opts.include, opts.exclude), trace = opts.trace === true;
    var fileQueue = []; // list of name, content - e.g. ["a/fileA.xdf", "content A", "b/fileB.xdf", "content B"];
    return {
        name: 'xdf',
        transform: function (code, id) {
            return __awaiter(this, void 0, void 0, function () {
                var jsonString;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!filter(id)) return [3 /*break*/, 2];
                            return [4 /*yield*/, stringify(code, { fileId: id })];
                        case 1:
                            jsonString = _a.sent();
                            console.log("id", id);
                            if (jsonString.match(RX_EXPORT$1)) {
                                // this file was generated as an ES export - so let's return its content (will be part of the bundle)
                                if (trace) {
                                    console.log("[rollup-plugin-xdf] export xdf file: ", id);
                                }
                                return [2 /*return*/, jsonString];
                            }
                            else {
                                // this file must be written separately on the disk
                                // id: e.g. Users/blaporte/Dev/iv/src/doc/samples.xdf
                                fileQueue.push(relative(__dirname, id.replace(RX_XDF_EXTENSION, JSON_EXTENSION)));
                                fileQueue.push(jsonString);
                                return [2 /*return*/, ""]; // return '' so that the file is considered as processed
                            }
                        case 2: return [2 /*return*/, null];
                    }
                });
            });
        },
        generateBundle: function (opts) {
            return __awaiter(this, void 0, void 0, function () {
                var dir, queue, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(fileQueue.length > 0)) return [3 /*break*/, 2];
                            dir = opts.dir;
                            if (!dir) {
                                dir = dirname(opts.file);
                            }
                            queue = [];
                            for (i = 0; fileQueue.length > i; i += 2) {
                                queue.push(writeXdfFile(join(dir, fileQueue[i]), fileQueue[i + 1]));
                            }
                            fileQueue = [];
                            return [4 /*yield*/, Promise.all(queue)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        },
    };
    function writeXdfFile(path, content) {
        return __awaiter(this, void 0, void 0, function () {
            var dir, fh;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dir = dirname(path), fh = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 6, 9]);
                        // the plugin is launched from the project root - so dir simply needs to be relative
                        return [4 /*yield*/, promises.mkdir(dir, { recursive: true })];
                    case 2:
                        // the plugin is launched from the project root - so dir simply needs to be relative
                        _a.sent();
                        return [4 /*yield*/, promises.open(path, 'w')];
                    case 3:
                        fh = _a.sent();
                        return [4 /*yield*/, fh.truncate(0)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, promises.writeFile(path, content)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 6:
                        if (!(fh !== null)) return [3 /*break*/, 8];
                        // Close the file if still open
                        return [4 /*yield*/, fh.close()];
                    case 7:
                        // Close the file if still open
                        _a.sent();
                        _a.label = 8;
                    case 8: return [7 /*endfinally*/];
                    case 9:
                        if (trace) {
                            console.log("[rollup-plugin-xdf] write complete:", path);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
}

export default xdf;
