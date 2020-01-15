import { createSourceFile, ScriptTarget, forEachChild, SyntaxKind } from 'typescript';
import { readFile } from 'fs';
import { Registry, parseRawGrammar } from 'vscode-textmate';
import { createFilter } from 'rollup-pluginutils';

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

var A_NAME = "entity.other.attribute-name.js.xjs", ARROW = "storage.type.function.arrow.ts", ARROW_FUNCTION = "meta.arrow.ts", ASSIGNMENT = "keyword.operator.assignment.ts", ATT = "tag.attribute.assignment", ATT1 = "tag.attribute", ATT_EXPR = "entity.other.attribute.param.shortcut.js.xjs", ATT_SPREAD = "entity.other.attribute.param.spread.js.xjs", BLOCK = "meta.block.ts", BLOCK_ATT = "meta.block.attributes.ts", B_DEF = "punctuation.definition.block.ts", B_START = "punctuation.section.embedded.begin.js.xjs", B_END = "punctuation.section.embedded.end.js.xjs", BRACE_SQ = "meta.brace.square.ts", COMMENT = "comment.block.ts", COMMENT1 = "comment.line.double-slash.ts", CONTENT = "content", C_DEF = "punctuation.definition.comment.ts", C_WS = "punctuation.whitespace.comment.leading.ts", DECIMAL_PERIOD = "meta.delimiter.decimal.period.ts", DECO = "tag.attribute.decorator.assignment", DECO1 = "entity.other.attribute.decorator.js.xjs", D_DEF = "punctuation.section.embedded.decorator.js.xjs", D_END = "punctuation.section.embedded.decorator.end.js.xjs", D_START = "punctuation.section.embedded.decorator.begin.js.xjs", EQ = "keyword.operator.assignment.js.xjs", EXP_MOD = "punctuation.section.embedded.modifier.js.xjs", FALSE = "constant.language.boolean.false.ts", MOD = "entity.name.type.module.ts", V_ACC = "punctuation.accessor.ts", NUM = "constant.numeric.decimal.ts", PARAM = "meta.parameters.ts", PARAM_OPTIONAL = "keyword.operator.optional.ts", PR = "tag.attribute.property.assignment", P_START = "punctuation.definition.parameters.begin.ts", P_VAR = "variable.parameter.ts", P_END = "punctuation.definition.parameters.end.ts", PR_END = "punctuation.section.embedded.property.end.js.xjs", PR_START = "punctuation.section.embedded.property.begin.js.xjs", PR_EXPR = "entity.other.attribute.property.shortcut.js.xjs", PR_SPREAD = "entity.other.attribute.property.spread.js.xjs", LBL = "entity.other.attribute.label.js.xjs", LBL_DEF = "punctuation.section.embedded.label.js.xjs", SEP = "punctuation.separator.parameter.ts", STR_D = "string.quoted.double.ts", STR_S = "string.quoted.single.ts", S_START = "punctuation.definition.string.begin.ts", S_END = "punctuation.definition.string.end.ts", TAG = "meta.tag.js.xjs", T_CLOSE = "punctuation.definition.tag.close.js.xjs", T_END = "punctuation.definition.tag.end.js.xjs", T_NAME = "entity.name.tag.js.xjs", T_PREFIX = "entity.name.tag.prefix.js.xjs", T_START = "punctuation.definition.tag.begin.js.xjs", TRUE = "constant.language.boolean.true.ts", TUPLE = "meta.type.tuple.ts", TYPE_AN = "meta.type.annotation.ts", TYPE_ENTITY = "entity.name.type.ts", TYPE_PRIMITIVE = "support.type.primitive.ts", TYPE_SEP = "keyword.operator.type.annotation.ts", TXT = "string.xjs.text.node.ts", TXT_START = "punctuation.definition.string.begin.js.xjs", TXT_END = "punctuation.definition.string.end.js.xjs", V_RW = "variable.other.readwrite.ts";
var SCOPES = {
    "tag.attribute": "ATT1",
    "tag.attribute.assignment": "ATT",
    "entity.other.attribute-name.js.xjs": "A_NAME",
    "entity.other.attribute.param.shortcut.js.xjs": "ATT_EXPR",
    "entity.other.attribute.param.spread.js.xjs": "ATT_SPREAD",
    "keyword.operator.optional.ts": "PARAM_OPTIONAL",
    "keyword.operator.assignment.ts": "ASSIGNMENT",
    "meta.arrow.ts": "ARROW_FUNCTION",
    "meta.delimiter.decimal.period.ts": "DECIMAL_PERIOD",
    "meta.type.tuple.ts": "TUPLE",
    "meta.brace.square.ts": "BRACE_SQ",
    "storage.type.function.arrow.ts": "ARROW",
    "meta.block.ts": "BLOCK",
    "meta.block.attributes.ts": "BLOCK_ATT",
    "punctuation.definition.block.ts": "B_DEF",
    "punctuation.section.embedded.begin.js.xjs": "B_START",
    "punctuation.section.embedded.end.js.xjs": "B_END",
    "meta.brace.round.ts": "BRACE_R",
    "punctuation.separator.comma.ts": "COMMA",
    "comment.block.ts": "COMMENT",
    "comment.line.double-slash.ts": "COMMENT1",
    "punctuation.definition.comment.ts": "C_DEF",
    "punctuation.whitespace.comment.leading.ts": "C_WS",
    "content": "CONTENT",
    "entity.other.attribute.decorator.js.xjs": "DECO1",
    "tag.attribute.decorator.assignment": "DECO",
    "punctuation.section.embedded.decorator.js.xjs": "D_DEF",
    "punctuation.section.embedded.decorator.begin.js.xjs": "D_START",
    "punctuation.section.embedded.decorator.end.js.xjs": "D_END",
    "constant.character.escape.ts": "ESC",
    "constant.character.entity.js.xjs": "ENTITY",
    "punctuation.section.embedded.modifier.js.xjs": "EXP_MOD",
    "keyword.operator.assignment.js.xjs": "EQ",
    "meta.function-call.ts": "F_CALL",
    "entity.name.function.ts": "F_NAME",
    "constant.numeric.decimal.ts": "NUM",
    "entity.name.type.module.ts": "MOD",
    "keyword.operator.arithmetic.ts": "OP",
    "variable.other.property.ts": "PROP",
    "meta.parameters.ts": "PARAM",
    "punctuation.definition.parameters.begin.ts": "P_START",
    "punctuation.definition.parameters.end.ts": "P_END",
    "variable.parameter.ts": "P_VAR",
    "tag.attribute.property.assignment": "PR",
    "punctuation.section.embedded.property.begin.js.xjs": "PR_START",
    "punctuation.section.embedded.property.end.js.xjs": "PR_END",
    "entity.other.attribute.property.shortcut.js.xjs": "PR_EXPR",
    "entity.other.attribute.property.spread.js.xjs": "PR_SPREAD",
    "entity.other.attribute.label.js.xjs": "LBL",
    "punctuation.section.embedded.label.js.xjs": "LBL_DEF",
    "entity.other.attribute.ref.js.xjs": "REF",
    "punctuation.section.embedded.ref.js.xjs": "R_DEF",
    "punctuation.section.embedded.ref.collection.js.xjs": "R_COL",
    "punctuation.section.embedded.ref.collection.start.js.xjs": "R_COL_START",
    "punctuation.section.embedded.ref.collection.end.js.xjs": "R_COL_END",
    "source.ts": "S",
    "string.quoted.double.ts": "STR_D",
    "string.quoted.single.ts": "STR_S",
    "punctuation.definition.string.begin.ts": "S_START",
    "punctuation.definition.string.end.ts": "S_END",
    "punctuation.separator.parameter.ts": "SEP",
    "punctuation.terminator.statement.ts": "TERM",
    "meta.tag.js.xjs": "TAG",
    "entity.name.tag.js.xjs": "T_NAME",
    "entity.name.tag.prefix.js.xjs": "T_PREFIX",
    "punctuation.definition.tag.begin.js.xjs": "T_START",
    "punctuation.definition.tag.end.js.xjs": "T_END",
    "punctuation.definition.tag.close.js.xjs": "T_CLOSE",
    "string.xjs.text.node.ts": "TXT",
    "punctuation.definition.string.begin.js.xjs": "TXT_START",
    "punctuation.definition.string.end.js.xjs": "TXT_END",
    "constant.language.boolean.true.ts": "TRUE",
    "meta.type.annotation.ts": "TYPE_AN",
    "entity.name.type.ts": "TYPE_ENTITY",
    "keyword.operator.type.annotation.ts": "TYPE_SEP",
    "support.type.primitive.ts": "TYPE_PRIMITIVE",
    "variable.other.object.ts": "VAR",
    "variable.other.readwrite.ts": "V_RW",
    "punctuation.accessor.ts": "V_ACC"
};

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
var TmAstNode = /** @class */ (function () {
    function TmAstNode(scopeName, token, startLineIdx) {
        this.scopeName = scopeName;
        this.token = token;
        this.startLineIdx = startLineIdx;
        this.startPosition = -1;
        this.endPosition = -1;
        this.endLineIdx = -1;
        this.startPosition = token.startIndex;
        this.endLineIdx = startLineIdx; // may be temporary - cf. groupChildNodes
        this.endPosition = token.endIndex; // may be temporary - cf. groupChildNodes
    }
    TmAstNode.prototype.countChildren = function (childScope) {
        var ch = this.children, count = 0;
        if (!ch)
            return 0;
        for (var i = 0, ln = ch.length; ln > i; i++) {
            if (ch[i].scopeName === childScope)
                count += 1;
        }
        return count;
    };
    return TmAstNode;
}());
function parse(src) {
    return __awaiter(this, void 0, void 0, function () {
        var tokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tokenize(src)];
                case 1:
                    tokens = _a.sent();
                    return [2 /*return*/, groupChildNodes(0, 0, 0, tokens)];
            }
        });
    });
}
function groupChildNodes(lineIdx, tokenIdx, scopeIdx, tokens) {
    var lineTokens = tokens[lineIdx], token = lineTokens[tokenIdx];
    var scopeName = token.scopes[scopeIdx], nodes = [];
    var nd = new TmAstNode(scopeName, token, lineIdx), ndNExt = undefined;
    nd.children = nodes;
    token["$processed"] = true;
    if (token.scopes.length > scopeIdx + 1) {
        if (!isValidChild(tokens[lineIdx][tokenIdx].scopes[scopeIdx + 1])) {
            return finalize();
        }
        ndNExt = groupChildNodes(lineIdx, tokenIdx, scopeIdx + 1, tokens);
        nodes.push(ndNExt);
        if (isEndNode(ndNExt)) {
            return finalize();
        }
    }
    function nextSibling() {
        var lineTokens = tokens[lineIdx];
        if (tokenIdx + 1 < lineTokens.length) {
            tokenIdx++;
            return lineTokens[tokenIdx];
        }
        else if (lineIdx + 1 < tokens.length) {
            lineIdx++;
            tokenIdx = 0;
            return tokens[lineIdx][tokenIdx];
        }
        else {
            return null;
        }
    }
    var nextToken = nextSibling();
    while (nextToken) {
        if (nextToken.scopes.length > scopeIdx && nextToken.scopes[scopeIdx] === scopeName) {
            // next token has the same current scope (but could be a different instance!)
            if (!nextToken["$processed"]) {
                var tk = tokens[lineIdx][tokenIdx];
                if (!isValidChild(tk.scopes[scopeIdx + 1])) {
                    return finalize();
                }
                if (scopeIdx + 1 < tk.scopes.length) {
                    // there is a sub-scope
                    ndNExt = groupChildNodes(lineIdx, tokenIdx, scopeIdx + 1, tokens);
                    nodes.push(ndNExt);
                    if (isEndNode(ndNExt))
                        return finalize();
                }
                else {
                    if (!acceptsContent())
                        return finalize();
                    // this node corresponds to content
                    var c = new TmAstNode(scopeName, tk, lineIdx);
                    c.scopeName = "content";
                    tk["$processed"] = true;
                    nodes.push(c);
                }
            }
            nextToken = nextSibling();
        }
        else {
            nextToken = null;
        }
    }
    return finalize();
    function isEndNode(n) {
        var scope = nd.scopeName;
        if (scope === COMMENT) {
            if (n.scopeName === C_DEF) {
                return nd.countChildren(C_DEF) === 2;
            }
        }
        else {
            if (scope !== PR) {
                var nm = SCOPES[n.scopeName];
                return (nm !== undefined && nm.match(/END$/) !== null);
            }
        }
        return false;
    }
    function isValidChild(subScopeName) {
        var scope = nd.scopeName;
        if (scope === ATT || scope === ATT1) {
            if (subScopeName === A_NAME)
                return nd.countChildren(A_NAME) === 0;
        }
        if (scope === C_DEF)
            return false;
        if (scope === DECO || scope === DECO1) {
            if (subScopeName === D_DEF)
                return nd.countChildren(D_DEF) === 0;
        }
        if (scope === BLOCK) {
            if (subScopeName === B_DEF)
                return nd.countChildren(B_DEF) < 2;
        }
        if (scope === PR) {
            if (subScopeName === PR_START)
                return nd.countChildren(PR_START) === 0;
        }
        if (scope === LBL) {
            if (subScopeName === LBL_DEF)
                return nd.countChildren(LBL_DEF) === 0;
        }
        return true;
    }
    function acceptsContent() {
        var scope = nd.scopeName;
        if (scope === DECO1)
            return false;
        if (scope === B_DEF)
            return false;
        return true;
    }
    function finalize() {
        if (nodes.length) {
            var list = nodes, last = void 0;
            do {
                last = list[list.length - 1];
                list = last.children;
            } while (list && list.length);
            // override endLineIdx and endPosition
            nd.endLineIdx = last.endLineIdx;
            nd.endPosition = last.endPosition;
        }
        return nd;
    }
}

var RX_END_TAG = /^\s*\<\//, RX_OPENING_BLOCK = /^\s*\{/, RX_TRAILING_LINE = /\n\s*$/, RX_SIMPLE_JS_IDENTIFIER = /^[\$_a-zA-Z]\w*$/, RX_FRAGMENT_IDENTIFIER = /^\!$/, RX_JS_REF_IDENTIFIER = /^([\$_[a-zA-Z]\w*)(\.[\$_[a-zA-Z]\w*)*$/, RX_ELT_NAME = /^[\w\$\_][\w\-]*$/, RX_ATT_NAME = /^[\$_a-zA-Z][\w\-]*$/, RX_INDENT = /(^\s+)/, PREFIX_CPT = "*", PREFIX_DECORATOR = "@", PREFIX_PARAM_NODE = ".", FRAGMENT_NAME = "!", CR = "\n";
/**
 * Parse a template string and return an AST tree
 * @param tpl the template string
 * @param filePath file path - e.g. a/b/c/foo.ts
 * @param lineOffset line number of the first template line
 * @param columnOffset column offset of the first template character
 */
function parse$1(tpl, filePath, lineOffset, columnOffset) {
    if (filePath === void 0) { filePath = ""; }
    if (lineOffset === void 0) { lineOffset = 0; }
    if (columnOffset === void 0) { columnOffset = 0; }
    return __awaiter(this, void 0, void 0, function () {
        function error(msg) {
            var c = context[context.length - 1], lnNbr = cLine + lineOffset;
            throw {
                kind: "#Error",
                origin: "XJS",
                message: "Invalid " + c + " - " + msg,
                line: lnNbr,
                column: cCol,
                lineExtract: ("" + lines[cLine - 1]).trim(),
                file: filePath
            };
        }
        function checkName(nm, rx) {
            if (!nm.match(rx)) {
                error("Invalid name '" + nm + "'");
            }
        }
        // return the text string that corresponds to the current node
        function currentText(leafNodeOnly, trim) {
            if (leafNodeOnly === void 0) { leafNodeOnly = true; }
            if (trim === void 0) { trim = true; }
            if (!cNode)
                return "";
            var r = "", idx = cNode.startLineIdx, startPos = cNode.startPosition, endIdx = cNode.endLineIdx, endPos = cNode.endPosition;
            if (leafNodeOnly && cNode.children && cNode.children.length) {
                // return only the part that is not covered by the first child
                // this case occurs because of the grouping done in tmparser
                var c0 = cNode.children[0];
                endIdx = c0.startLineIdx;
                endPos = c0.startPosition;
            }
            if (idx === endIdx) {
                r = lines[idx].substring(startPos, endPos);
            }
            if (trim) {
                r = r.trim();
            }
            return r;
        }
        // move the current node to next position
        function moveCursor() {
            // first look into children, then next sibling
            if (!cNode)
                return;
            if (!cNodeValidated)
                return;
            cNodeValidated = false;
            if (cNode.children && cNode.children.length) {
                // move node to first child
                cursor.push(0);
                tNodes.push(cNode.children[0]);
                cNode = cNode.children[0];
            }
            else {
                // find next sibling
                var childIdx = 0, parent_1, found = false;
                while (!found) {
                    if (cursor.length > 1) {
                        // find next sibling
                        childIdx = cursor[cursor.length - 1];
                        parent_1 = tNodes[cursor.length - 2];
                        if (childIdx + 1 < parent_1.children.length) {
                            found = true;
                            cNode = parent_1.children[childIdx + 1];
                            cursor[cursor.length - 1] += 1;
                            tNodes[cursor.length - 1] = cNode;
                        }
                        else {
                            // move cursor to parent and look for next sibling
                            cursor.pop();
                            tNodes.pop();
                            cNode = tNodes[tNodes.length - 1];
                        }
                    }
                    else {
                        // cursor length = 1 -> we have only one root (aka S)
                        found = true;
                        cNode = null;
                    }
                }
            }
            if (cNode) {
                cLine = cNode.startLineIdx + 1; // startLineIdx is 0-based
                var ln = lines[cNode.startLineIdx].substring(cNode.startPosition), spaces = 0;
                if (ln.match(/^(\s+)/)) {
                    spaces = RegExp.$1.length;
                }
                cCol = 1 + cNode.startPosition + spaces + (cLine === 1 ? columnOffset : 0);
            }
        }
        // move cursor to next position and ignore white-space content
        function moveNext(ignoreWsContent) {
            if (ignoreWsContent === void 0) { ignoreWsContent = true; }
            moveCursor();
            if (ignoreWsContent) {
                while (cNode && cNode.scopeName === CONTENT && currentText() === "") {
                    cNodeValidated = true;
                    moveCursor();
                }
            }
        }
        // move cursor and check expected scope - throw error if not found
        function advance(expectedScope, ignoreContent, errMsg) {
            if (ignoreContent === void 0) { ignoreContent = true; }
            moveNext(ignoreContent);
            if (!cNode) {
                error(errMsg || "Unexpected end of template");
            }
            else if (cNode.scopeName !== expectedScope) {
                // console.log(cNode)
                error(errMsg || "Unexpected token '" + currentText() + "'");
            }
            cNodeValidated = true;
        }
        // same as advance but doesn't validate the token and doesn't raise errors
        // return true if the next (un-validated) token is of the expected scope
        function lookup(expectedScope, ignoreContent) {
            if (ignoreContent === void 0) { ignoreContent = true; }
            moveNext(ignoreContent);
            if (!cNode) {
                error("Unexpected end of template");
                return false; // unreachable
            }
            else {
                return cNode.scopeName === expectedScope;
            }
        }
        // return true if the next (un-validated) token is a fragment or one of its sub-types:
        // "#fragment" | "#element" | "#component" | "#propertyNode" | "#decoratorNode";
        function lookupFragment() {
            return lookup(TAG);
        }
        // template function
        function xjsTplFunction() {
            var nd = {
                kind: "#tplFunction",
                arguments: undefined,
                content: undefined,
                indent: "",
                lineNumber: cLine,
                colNumber: cCol
            };
            context.push("template function");
            if (!cNode) {
                error("Empty template");
            }
            if (cNode.scopeName !== ARROW_FUNCTION) {
                error("Invalid arrow function");
            }
            context.push("template params");
            if (lookup(P_VAR, false)) {
                // we have one single param - e.g. a => {}
                advance(P_VAR);
                nd.arguments = [{
                        kind: "#tplArgument",
                        name: currentText(),
                        typeRef: undefined,
                        lineNumber: cLine,
                        colNumber: cCol
                    }];
            }
            else if (lookup(PARAM)) {
                // parens mode - e.g. () => {}
                advance(PARAM); // parameter block
                advance(P_START); // (
                if (lookup(P_VAR)) { // there are arguments
                    var arg = xjsTplArgument(nd);
                    nd.arguments = [arg];
                    while (lookup(SEP)) { // ,
                        // next arguments
                        advance(SEP);
                        nd.arguments.push(xjsTplArgument(nd));
                    }
                }
                advance(P_END); // )
            }
            else {
                error("Invalid template param");
            }
            context.pop();
            advance(ARROW); // =>
            nd.content = xjsContentBlock("template content");
            context.pop();
            return nd;
        }
        // template function argument
        function xjsTplArgument(tplFunc) {
            advance(P_VAR); // argument name
            var nd = {
                kind: "#tplArgument",
                name: currentText(),
                typeRef: undefined,
                lineNumber: cLine,
                colNumber: cCol
            };
            if (lookup(PARAM_OPTIONAL)) {
                advance(PARAM_OPTIONAL); // ?
                nd.optional = true;
                tplFunc.hasOptionalArguments = true;
            }
            else if (tplFunc.hasOptionalArguments) {
                error("Optional arguments must be in last position");
            }
            if (lookup(TYPE_AN)) {
                advance(TYPE_AN); // type annotation
                advance(TYPE_SEP); // :
                var prefix = "";
                while (lookup(MOD)) {
                    // module prefix e.g. x.y.MyClass
                    advance(MOD); // x
                    prefix += currentText() + ".";
                    advance(V_ACC); // .
                }
                if (lookup(TYPE_ENTITY)) {
                    advance(TYPE_ENTITY);
                }
                else if (lookup(TYPE_PRIMITIVE)) {
                    advance(TYPE_PRIMITIVE); // argument type
                }
                nd.typeRef = prefix + currentText();
                if (lookup(TUPLE)) {
                    // array type - e.g. [] or [][]
                    advance(TUPLE);
                    advance(BRACE_SQ);
                    var c = currentText(true, false);
                    while (lookup(CONTENT, false)) {
                        advance(CONTENT, false);
                        c += currentText(true, false);
                    }
                    nd.typeRef += c;
                }
            }
            if (lookup(ASSIGNMENT)) {
                // default value
                advance(ASSIGNMENT); // = 
                moveNext(true);
                if (lookup(NUM)) {
                    // numeric constant
                    advance(NUM);
                    var num = currentText();
                    if (lookup(DECIMAL_PERIOD)) {
                        advance(DECIMAL_PERIOD);
                        moveNext(false);
                        num += "." + currentText();
                        cNodeValidated = true;
                    }
                    nd.defaultValue = num;
                }
                else if (lookup(STR_S) || lookup(STR_D)) {
                    // string with single or double quotes
                    lookup(STR_S) ? advance(STR_S) : advance(STR_D);
                    nd.defaultValue = currentText(false);
                    advance(S_START);
                    if (lookup(CONTENT)) {
                        advance(CONTENT, false);
                    }
                    advance(S_END);
                }
                else if (lookup(TRUE)) {
                    advance(TRUE);
                    nd.defaultValue = "true";
                }
                else if (lookup(FALSE)) {
                    advance(FALSE);
                    nd.defaultValue = "false";
                    // } else if (lookup(F_CALL)) {
                    //     lookup(F_CALL);
                    //     console.log(currentText());
                }
                else if (lookup(V_RW)) {
                    advance(V_RW);
                    nd.defaultValue = currentText();
                    console.log("TODO: support default value as variable: ", nd.defaultValue);
                }
                else {
                    // console.log(cNode)
                    error("Invalid parameter initialization");
                }
            }
            comment();
            return nd;
        }
        // block containing xjs nodes: e.g. { <div/> }
        function xjsContentBlock(ctxt) {
            if (ctxt === void 0) { ctxt = "content block"; }
            context.push(ctxt);
            advance(BLOCK, true, "Invalid JS Block");
            advance(B_DEF); // { -> block start
            if (ctxt === "template content") {
                // calculate first indent
                var c = "";
                while (lookup(CONTENT, false)) {
                    advance(CONTENT, false);
                    c = currentText(true, false);
                    if (c.match(RX_INDENT)) {
                        initIndent = RegExp.$1;
                    }
                }
            }
            var nodes = contentNodes(function () { return lookup(B_DEF); });
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var nd_1 = nodes_1[_i];
                // trim cannot be done inside scanJsCode to preserver white spaces when necessary
                if (nd_1.kind === "#jsStatements") {
                    nd_1.code = nd_1.code.trim();
                }
            }
            advance(B_DEF); // } -> block end
            context.pop();
            return (nodes && nodes.length) ? nodes : undefined;
        }
        function contentNodes(endFunction, startLineIdx) {
            if (startLineIdx === void 0) { startLineIdx = 0; }
            var nodes = [];
            while (!endFunction()) {
                if (lookup(TXT)) {
                    nodes.push(xjsText());
                }
                else if (lookupFragment()) {
                    nodes.push(xjsFragment());
                }
                else {
                    var jsc = scanJsCode(startLineIdx);
                    if ((jsc.kind === "#jsStatements" && jsc.code === "")
                        || (jsc.kind === "#jsBlock" && jsc.startCode === "")) {
                        break;
                    }
                    nodes.push(jsc);
                }
            }
            if (nodes.length > 1) {
                // trim js statements
                for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
                    var nd_2 = nodes_2[_i];
                    if (nd_2.kind === "#jsStatements") {
                        nd_2.code = nd_2.code.trim();
                    }
                }
            }
            return nodes;
        }
        function scanJsCode(startLineIdx) {
            if (startLineIdx === void 0) { startLineIdx = 0; }
            context.push("js-code");
            var code = [], stop = false, lineIdx = startLineIdx, isJsBlock = false, nodes = undefined;
            if (startLineIdx === 0 && cNode) {
                lineIdx = cNode.startLineIdx;
            }
            function captureCode() {
                cNodeValidated = true;
                var idx = cNode ? cNode.startLineIdx : startLineIdx;
                if (lineIdx !== idx) {
                    lineIdx = idx;
                    code.push("\n"); // keep line formatting
                }
                code.push(currentText(true, false));
            }
            if (lookup(B_DEF, false)) {
                stop = true;
            }
            else {
                captureCode(); // preserve white spaces
            }
            while (!stop) {
                if (lookup(TAG, false) || lookup(TXT, false)) {
                    stop = true;
                }
                else if (lookup(B_DEF, false)) {
                    var ct = currentText(false, false);
                    var isNewBlock = ct.match(RX_OPENING_BLOCK);
                    stop = true;
                    firstNodeFound = true;
                    if (isNewBlock) {
                        advance(B_DEF); // {
                        captureCode();
                        if (lookup(CONTENT, false)) {
                            // capture the next white spaces
                            captureCode();
                        }
                        // parse content
                        nodes = contentNodes(function () { return lookup(B_DEF, false); }, lineIdx);
                        if (nodes.length === 1 && nodes[0].kind === "#jsStatements") {
                            // this block can be considered as code
                            code.push(nodes[0].code);
                            lineIdx = cNode ? cNode.startLineIdx : 0;
                            advance(B_DEF);
                            captureCode();
                            stop = false;
                        }
                        else {
                            // this is a true js block
                            advance(B_DEF); // }
                            stop = true;
                            isJsBlock = true;
                        }
                    }
                }
                else {
                    captureCode();
                }
            }
            context.pop();
            var jss = {
                kind: "#jsStatements",
                code: code.join(""),
                lineNumber: cLine,
                colNumber: cCol
            };
            if (isJsBlock) {
                return {
                    kind: "#jsBlock",
                    startCode: jss.code.replace(RX_TRAILING_LINE, ""),
                    endCode: "}",
                    content: nodes
                };
            }
            else {
                return jss;
            }
        }
        // text node # Hello {expr()} #
        function xjsText() {
            context.push("text node");
            advance(TXT);
            checkInitIndent();
            advance(TXT_START); // # -> beginning of text node
            var nd = {
                kind: "#textNode",
                params: undefined,
                decorators: undefined,
                labels: undefined,
                textFragments: [],
                expressions: undefined,
                lineNumber: cLine,
                colNumber: cCol
            };
            var buffer = [];
            while (!lookup(TXT_END, false)) {
                if (lookup(BLOCK_ATT, false)) {
                    context.push("text param");
                    advance(BLOCK_ATT);
                    advance(B_START); // (
                    params(nd, false);
                    advance(B_END); // )
                    context.pop();
                }
                else if (lookup(BLOCK, false)) {
                    // expression block
                    nd.textFragments.push(buffer.join(""));
                    buffer = [];
                    if (!nd.expressions) {
                        nd.expressions = [];
                    }
                    nd.expressions.push(xjsExpression());
                }
                else {
                    buffer.push(currentText(true, false));
                    cNodeValidated = true;
                }
            }
            var s = buffer.join("");
            if (s.length)
                nd.textFragments.push(s);
            advance(TXT_END); // # -> end of text node
            context.pop();
            return nd;
        }
        // expression in a block (e.g. attributes or text nodes)
        function xjsExpression() {
            context.push("expression");
            advance(BLOCK);
            advance(B_START);
            var nd = {
                kind: "#expression",
                oneTime: false,
                isBinding: false,
                code: "",
                lineNumber: cLine,
                colNumber: cCol
            };
            var isFunctionShortcut = false;
            if (lookup(EXP_MOD, false)) {
                advance(EXP_MOD);
                var modText = currentText();
                if (modText === "::") {
                    nd.oneTime = true;
                }
                else if (modText === "=>") {
                    isFunctionShortcut = true;
                }
                else if (modText === "=") {
                    nd.isBinding = true;
                }
            }
            var code = xjsExpressionCode();
            if (isFunctionShortcut) {
                nd.code = "()=>" + code;
            }
            else {
                nd.code = code;
            }
            advance(B_END);
            context.pop();
            return nd;
        }
        function xjsExpressionCode() {
            var buffer = [], nm = "";
            while (!lookup(B_END, false)) {
                buffer.push(currentText(true, false));
                if (nm.length < 8) {
                    nm = buffer.join("").trim();
                    if (nm.length > 8) {
                        nm = nm.slice(0, 8);
                    }
                    context[context.length - 1] = "expression (" + nm + ")";
                }
                cNodeValidated = true;
            }
            return buffer.join("");
        }
        function checkInitIndent() {
            if (!firstNodeFound && cNode && cNode.children && cNode.children.length && cNode.startPosition !== cNode.children[0].startPosition) {
                var ch0 = cNode.children[0], idx = ch0.startLineIdx;
                initIndent = lines[idx].slice(cNode.startPosition, ch0.startPosition);
            }
            firstNodeFound = true;
        }
        // parse a fragment or one of its sub-type
        // "#fragment" | "#element" | "#component" | "#paramNode" | "#decoratorNode";
        function xjsFragment() {
            context.push("tag");
            var cPos = context.length - 1;
            var nm = "";
            advance(TAG);
            checkInitIndent();
            advance(T_START, false);
            var nd = {
                kind: "#fragment",
                params: undefined,
                properties: undefined,
                decorators: undefined,
                labels: undefined,
                content: undefined,
                lineNumber: cLine,
                colNumber: cCol
            };
            if (lookup(T_PREFIX)) {
                // paramNode with dynamic name - e.g. <.{expr()}/>
                advance(T_PREFIX);
                context[cPos] = "param node";
                nd.kind = "#paramNode";
                nd["name"] = "";
            }
            if (lookup(BLOCK)) {
                // paramNode or element with dynamic name e.g. <{expr()}/>
                var exp = nd["nameExpression"] = xjsExpression();
                nd["name"] = "";
                nm = "{" + (exp.oneTime ? '::' : '') + exp.code + "}";
                if (nd.kind !== "#paramNode") {
                    context[cPos] = "element (" + nm + ")";
                    nd.kind = "#element";
                }
                else {
                    context[cPos] = "param node (" + nm + ")";
                }
            }
            else {
                var rx = RX_SIMPLE_JS_IDENTIFIER, nm2 = void 0, char0 = '';
                advance(T_NAME, false);
                nm2 = nm = currentText();
                char0 = nm.charAt(0);
                if (char0 === PREFIX_PARAM_NODE) {
                    nm2 = nm.slice(1);
                    context[cPos] = "param node (" + nm2 + ")";
                    rx = RX_SIMPLE_JS_IDENTIFIER;
                    nd.kind = "#paramNode";
                    nd["name"] = nm2;
                    nd["nameExpression"] = undefined;
                }
                else if (char0 === PREFIX_CPT) {
                    nm2 = nm.slice(1);
                    context[cPos] = "component (" + nm2 + ")";
                    rx = RX_JS_REF_IDENTIFIER;
                    nd.kind = "#component";
                    nd["ref"] = {
                        kind: "#expression",
                        oneTime: false,
                        code: nm2
                    };
                }
                else if (char0 === PREFIX_DECORATOR) {
                    nm2 = nm.slice(1);
                    context[cPos] = "decorator node (" + nm2 + ")";
                    rx = RX_JS_REF_IDENTIFIER;
                    nd.kind = "#decoratorNode";
                    nd["ref"] = {
                        kind: "#expression",
                        oneTime: false,
                        code: nm2
                    };
                }
                else if (nm !== FRAGMENT_NAME) {
                    context[cPos] = "element (" + nm + ")";
                    rx = RX_ELT_NAME;
                    nd.kind = "#element";
                    nd["name"] = nm;
                    nd["nameExpression"] = undefined;
                }
                else {
                    context[cPos] = "fragment";
                    rx = RX_FRAGMENT_IDENTIFIER;
                }
                checkName(nm2, rx);
            }
            // extract params
            params(nd);
            if (lookup(T_CLOSE)) {
                advance(T_CLOSE);
                advance(T_END);
            }
            else if (lookup(T_END)) {
                // fragment start is not self-closed
                // look for child nodes
                advance(T_END);
                nd.content = contentNodes(function () {
                    if (lookup(TAG)) {
                        if (currentText(false).match(RX_END_TAG))
                            return true;
                    }
                    return false;
                });
                // end fragment / element - e.g. </div> or </> or </!>
                context.push("end of " + context[cPos]);
                advance(TAG);
                advance(T_START);
                advance(T_CLOSE);
                if (lookup(T_NAME)) {
                    advance(T_NAME);
                    var nm2 = currentText();
                    if (nm !== nm2)
                        error("Name mismatch: '" + nm2 + "' instead of '" + nm + "'");
                }
                advance(T_END);
                context.pop();
            }
            else {
                if (cNode) {
                    var ct = currentText();
                    if (ct.length) {
                        error("Invalid param content '" + currentText() + "'");
                    }
                    else {
                        error("Invalid param content");
                    }
                }
                else {
                    error('Unexpected end of template');
                }
            }
            context.pop();
            return nd;
        }
        function params(f, acceptProperties) {
            if (acceptProperties === void 0) { acceptProperties = true; }
            context.push("param");
            var stop = false;
            while (!stop) {
                if (!comment()) {
                    if (!attParam(f)) {
                        if (!lblParam(f)) {
                            if (!decoParam(f)) {
                                if (acceptProperties) {
                                    if (!propParam(f)) {
                                        stop = true;
                                    }
                                }
                                else {
                                    stop = true;
                                }
                            }
                        }
                    }
                }
            }
            context.pop();
        }
        function comment() {
            if (lookup(C_WS)) {
                // white space in front of comment
                advance(C_WS);
            }
            var isMultiLine = lookup(COMMENT);
            if (lookup(COMMENT1) || isMultiLine) {
                context.push("comment");
                cNodeValidated = true; // validate current token
                advance(C_DEF); // /* or //
                while (lookup(CONTENT) || lookup(C_WS)) {
                    cNodeValidated = true; // comment value or leading white spaces are ignored
                }
                if (isMultiLine) {
                    advance(C_DEF); // */
                }
                context.pop();
                return true;
            }
            return false;
        }
        function attParam(f) {
            if (lookup(ATT) || lookup(ATT1)) {
                // e.g. disabled or title={expr()}
                var nd_3 = createParamNode();
                if (lookup(ATT1)) {
                    // orphan attribute - e.g. disabled
                    nd_3.isOrphan = true;
                    advance(ATT1);
                    advance(A_NAME);
                    nd_3.name = currentText();
                }
                else {
                    // e.g. foo="bar"
                    advance(ATT);
                    advance(A_NAME); // attribute name
                    var nm = currentText();
                    advance(EQ); // =
                    nd_3.name = nm;
                    nd_3.value = expressionValue();
                }
                if (nd_3) {
                    checkName(nd_3.name, RX_ATT_NAME);
                }
                addParamNode(nd_3);
                return true;
            }
            else if (lookup(ATT_EXPR)) {
                // e.g. {title}
                context.push("param binding shortcut");
                advance(ATT_EXPR);
                var nd_4 = createParamNode(), varName = "", oneTime = false;
                advance(B_START); // {
                if (lookup(EXP_MOD)) {
                    // ::
                    advance(EXP_MOD);
                    oneTime = true;
                }
                advance(V_RW);
                nd_4.name = varName = currentText();
                var exp = {
                    kind: "#expression",
                    oneTime: oneTime,
                    isBinding: false,
                    code: varName,
                    lineNumber: cLine,
                    colNumber: cCol
                };
                nd_4.value = exp;
                advance(B_END); // }
                addParamNode(nd_4);
                context.pop();
                return true;
            }
            else if (lookup(ATT_SPREAD)) {
                context.push("param spread");
                advance(ATT_SPREAD);
                var nd_5 = createParamNode();
                nd_5.name = "#spread";
                nd_5.isSpread = true;
                advance(B_START); // {
                advance(EXP_MOD); // ...
                var exp = {
                    kind: "#expression",
                    oneTime: false,
                    isBinding: false,
                    lineNumber: cLine,
                    colNumber: cCol,
                    code: xjsExpressionCode()
                };
                nd_5.value = exp;
                advance(B_END); // }
                addParamNode(nd_5);
                context.pop();
                return true;
            }
            return false;
            function createParamNode() {
                return {
                    kind: "#param",
                    name: "",
                    isOrphan: false,
                    isSpread: false,
                    value: undefined,
                    lineNumber: cLine,
                    colNumber: cCol
                };
            }
            function addParamNode(nd) {
                if (!f.params)
                    f.params = [];
                f.params.push(nd);
            }
        }
        function propParam(f) {
            if (lookup(PR)) {
                context.push("property");
                advance(PR);
                var line1 = cLine, col1 = cCol;
                advance(PR_START); // [
                advance(A_NAME);
                var nm = currentText();
                checkName(nm, RX_SIMPLE_JS_IDENTIFIER);
                advance(PR_END); // ]
                advance(EQ); // =
                var v = expressionValue();
                if (v) {
                    var nd_6 = createPropNode(nm, v, line1, col1);
                    addProperty(nd_6);
                }
                context.pop();
                return true;
            }
            else if (lookup(PR_EXPR)) {
                // e.g. {[className]}
                advance(PR_EXPR);
                var oneTime = false, varName = "", line1 = cLine, col1 = cCol;
                context.push("property binding shortcut");
                advance(B_START);
                if (lookup(EXP_MOD)) {
                    // ::
                    advance(EXP_MOD);
                    oneTime = true;
                }
                advance(PR_START);
                advance(V_RW);
                varName = currentText();
                var exp = {
                    kind: "#expression",
                    oneTime: oneTime,
                    isBinding: false,
                    code: varName,
                    lineNumber: cLine,
                    colNumber: cCol
                };
                var nd_7 = createPropNode(varName, exp, line1, col1);
                advance(B_END);
                addProperty(nd_7);
                context.pop();
            }
            else if (lookup(PR_SPREAD)) {
                advance(PR_SPREAD);
                var line1 = cLine, col1 = cCol;
                context.push("property spread");
                advance(B_START); // {
                advance(EXP_MOD); // ...
                advance(PR_START); // [
                var exp = {
                    kind: "#expression",
                    oneTime: false,
                    isBinding: false,
                    lineNumber: cLine,
                    colNumber: cCol,
                    code: xjsExpressionCode()
                };
                var nd_8 = createPropNode("#spread", exp, line1, col1);
                nd_8.isSpread = true;
                advance(B_END); // ]}
                addProperty(nd_8);
                context.pop();
            }
            return false;
            function createPropNode(name, value, ln, col) {
                if (ln === void 0) { ln = 0; }
                if (col === void 0) { col = 0; }
                return {
                    kind: "#property",
                    name: name,
                    value: value,
                    isSpread: false,
                    lineNumber: ln ? ln : cLine,
                    colNumber: col ? col : cCol
                };
            }
            function addProperty(prop) {
                if (!f.properties)
                    f.properties = [];
                f.properties.push(prop);
            }
        }
        function lblParam(f) {
            if (lookup(LBL)) {
                context.push("label");
                // e.g. #foo or ##bar
                var nd_9 = {
                    kind: "#label",
                    name: "",
                    fwdLabel: false,
                    isOrphan: true,
                    value: undefined,
                    lineNumber: cLine,
                    colNumber: cCol
                };
                advance(LBL);
                advance(LBL_DEF); // # or ##
                if (currentText() === "##") {
                    nd_9.fwdLabel = true;
                }
                advance(A_NAME);
                nd_9.name = currentText();
                if (nd_9.fwdLabel && f.kind !== "#component") {
                    error("Forward labels (e.g. ##" + currentText() + ") can only be used on component calls");
                }
                if (lookup(CONTENT, false) && currentText() !== '') {
                    error("Invalid content '" + currentText() + "'");
                }
                if (lookup(EQ)) {
                    advance(EQ); // =
                    nd_9.isOrphan = false;
                    nd_9.value = expressionValue();
                }
                if (!f.labels)
                    f.labels = [];
                f.labels.push(nd_9);
                context.pop();
                return true;
            }
            return false;
        }
        function expr(code) {
            return {
                kind: "#expression",
                oneTime: false,
                code: code
            };
        }
        function decoParam(f) {
            if (lookup(DECO1) || lookup(DECO)) {
                context.push("decorator");
                var nd_10 = {
                    kind: "#decorator",
                    ref: expr(""),
                    hasDefaultPropValue: false,
                    isOrphan: false,
                    params: undefined,
                    decorators: undefined,
                    labels: undefined,
                    defaultPropValue: undefined,
                    lineNumber: cLine,
                    colNumber: cCol
                };
                if (lookup(DECO1)) {
                    // e.g. @important
                    nd_10.isOrphan = true;
                    advance(DECO1);
                    advance(D_DEF); // @
                    advance(A_NAME); // decorator ref
                    nd_10.ref = expr(currentText());
                    checkName(nd_10.ref.code, RX_JS_REF_IDENTIFIER);
                }
                else {
                    // normal decorator e.g. @foo=123 or @foo(p1=123 p2={expr()})
                    advance(DECO);
                    advance(D_DEF); // @
                    advance(A_NAME); // decorator ref
                    nd_10.ref = expr(currentText());
                    if (lookup(EQ)) {
                        nd_10.hasDefaultPropValue = true;
                        advance(EQ); // =
                        nd_10.defaultPropValue = expressionValue();
                    }
                    else if (lookup(D_START)) {
                        advance(D_START);
                        params(nd_10, false);
                        advance(D_END);
                    }
                    else {
                        error("Invalid decorator token: '=' or '(' expected");
                    }
                }
                context.pop();
                if (!f.decorators)
                    f.decorators = [];
                f.decorators.push(nd_10);
                return true;
            }
            return false;
        }
        // extract the value of a param / attribute / property
        function expressionValue() {
            if (lookup(NUM)) {
                advance(NUM);
                return {
                    kind: "#number",
                    value: parseInt(currentText(), 10)
                };
            }
            else if (lookup(TRUE)) {
                advance(TRUE);
                return {
                    kind: "#boolean",
                    value: true
                };
            }
            else if (lookup(FALSE)) {
                advance(FALSE);
                return {
                    kind: "#boolean",
                    value: false
                };
            }
            else if (lookup(STR_S) || lookup(STR_D)) {
                lookup(STR_D) ? advance(STR_D) : advance(STR_S);
                advance(S_START);
                advance(CONTENT, false);
                var nd_11 = {
                    kind: "#string",
                    value: currentText(),
                    lineNumber: cLine,
                    colNumber: cCol
                };
                advance(S_END);
                return nd_11;
            }
            else if (lookup(BLOCK)) {
                return xjsExpression();
            }
            else {
                error("Invalid param value '" + currentText() + "'");
            }
            return undefined;
        }
        var nd, lines, initIndent, firstNodeFound, cursor, tNodes, cNode, cLine, cCol, cNodeValidated, lastLine, context, root;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lines = tpl.split(CR);
                    return [4 /*yield*/, parse(tpl)];
                case 1:
                    nd = _a.sent();
                    initIndent = "", firstNodeFound = false, cursor = [0, 0], tNodes = [nd, nd.children[0]], cNode = nd.children[0], cLine = 1, cCol = 0, cNodeValidated = true, lastLine = nd.endLineIdx, context = [];
                    root = xjsTplFunction();
                    root.indent = initIndent;
                    return [2 /*return*/, root];
            }
        });
    });
}

var RX_DOUBLE_QUOTE = /\"/g, RX_START_CR = /^\n*/, RX_LOG = /\/\/\s*log\s*/, RX_EVT_HANDLER_DECORATOR = /^on(\w+)$/, PARAM_VALUE = "paramValue", // @paramValue reserved decorator
API_ARG = "$", FULL_API_ARG = "$api", TPL_ARG = "$template", ASYNC = "async", SVG = "svg", XMLNS = "xmlns", XMLNS_VALUES = {
    "xhtml": "http://www.w3.org/1999/xhtml",
    "html": "http://www.w3.org/1999/xhtml",
    "svg": "http://www.w3.org/2000/svg",
    "mathml": "http://www.w3.org/1998/mathml"
}, MD_PARAM_CLASS = "$apiClassName", NODE_NAMES = {
    "#tplFunction": "template function",
    "#tplArgument": "template argument",
    "#jsStatements": "javascript statements",
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
    "#number": "number",
    "#boolean": "boolean",
    "#string": "string",
    "#eventListener": "event listener",
    "#label": "label"
}, CR$1 = "\n";
// Generic validation
var NO = 0, YES = 1, LATER = 2, SOMETIMES = 3, VALIDATION_NAMES = {
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
    "#decorator": "Decorators"
}, SUPPORTED_NODE_ATTRIBUTES = {
    "#textNode": { "#param": NO, "#property": NO, "#label": YES, "##label": NO, "#decorator": LATER, "@onevent": 0 },
    "#element": { "#param": YES, "#property": YES, "#label": YES, "##label": NO, "#decorator": SOMETIMES, "@onevent": 1 },
    "#component": { "#param": YES, "#property": NO, "#label": YES, "##label": LATER, "#decorator": SOMETIMES, "@onevent": 1 },
    "#fragment": { "#param": NO, "#property": NO, "#label": NO, "##label": NO, "#decorator": SOMETIMES, "@onevent": 0 },
    "#paramNode": { "#param": YES, "#property": NO, "#label": NO, "##label": NO, "#decorator": SOMETIMES, "@onevent": 1 },
    "#decoratorNode": LATER,
    "#{element}": LATER,
    "#{paramNode}": LATER
}, SUPPORTED_BUILT_IN_DECORATORS = {
    "paramValue": { "#textNode": NO, "#element": NO, "#component": NO, "#fragment": NO, "#paramNode": YES, "#decoratorNode": NO, "#{element}": NO, "#{paramNode}": NO },
    "xmlns": { "#textNode": NO, "#element": YES, "#component": YES, "#fragment": YES, "#paramNode": NO, "#decoratorNode": NO, "#{element}": NO, "#{paramNode}": NO },
    "content": { "#textNode": NO, "#element": YES, "#component": NO, "#fragment": YES, "#paramNode": NO, "#decoratorNode": NO, "#{element}": NO, "#{paramNode}": NO }
    // async
};
function compileTemplate(template, options) {
    return __awaiter(this, void 0, void 0, function () {
        var log, root, res, importMap, imports, k, separator;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options.lineOffset = options.lineOffset || 0;
                    log = false;
                    if (template.match(RX_LOG)) {
                        log = true;
                        template = template.replace(RX_LOG, "");
                    }
                    return [4 /*yield*/, parse$1(template, options.filePath || "", options.lineOffset || 0, options.columnOffset || 0)];
                case 1:
                    root = _a.sent();
                    res = generate(root, template, options);
                    if (log) {
                        importMap = res.importMap || options.importMap, imports = [];
                        for (k in importMap) {
                            if (importMap.hasOwnProperty(k)) {
                                imports.push(k);
                            }
                        }
                        separator = "-------------------------------------------------------------------------------";
                        console.log(separator);
                        console.log("imports: ", imports.join(", "));
                        console.log("template: " + res.function);
                        console.log(separator);
                    }
                    return [2 /*return*/, res];
            }
        });
    });
}
function generate(tf, template, options) {
    var body = []; // parts composing the function body (generated strings + included expressions/statements)
    var root;
    return generateAll();
    function generateAll() {
        var gc = new GenerationCtxt(template, options), args = tf.arguments;
        if (args) {
            for (var i = 0; args.length > i; i++) {
                gc.templateArgs.push(args[i].name);
            }
        }
        if (tf.content) {
            root = new ViewInstruction("template", tf, 1, null, 0, gc, tf.indent);
            root.scan();
            root.pushCode(body);
        }
        var res = {};
        if (options.function || options.body) {
            res.body = generateBody();
        }
        if (options.statics) {
            res.statics = gc.statics;
        }
        if (options.function) {
            res.function = templateStart(tf.indent, tf, gc) + res.body + templateEnd(tf);
        }
        if (options.imports) {
            res.importMap = gc.imports;
        }
        return res;
    }
    function generateBody() {
        var parts = [];
        for (var _i = 0, body_1 = body; _i < body_1.length; _i++) {
            var part = body_1[_i];
            if (typeof part === 'string') {
                parts.push(part);
            }
            else if (part.kind === "#expression" || part.kind === "#jsStatements") {
                parts.push(part.code);
            }
            else if (part.kind === "#jsBlock") {
                parts.push(part.startCode.replace(RX_START_CR, ""));
            }
        }
        return "\n" + parts.join("") + reduceIndent(tf.indent);
    }
}
function reduceIndent(indent) {
    if (indent.length > 3) {
        return indent.slice(0, -4);
    }
    return indent;
}
var GenerationCtxt = /** @class */ (function () {
    function GenerationCtxt(template, options) {
        this.template = template;
        this.options = options;
        this.indentIncrement = "    ";
        this.templateName = "";
        this.filePath = "";
        this.statics = []; // list of static resources
        this.localVars = {}; // map of creation mode vars
        this.blockCount = 0; // number of js blocks - used to increment block variable suffixes
        this.templateArgs = []; // name of template arguments
        this.paramCounter = 0; // counter used to create param instance variables
        this.imports = options.importMap || {};
        this.templateName = options.templateName.replace(RX_DOUBLE_QUOTE, "");
        this.filePath = options.filePath.replace(RX_DOUBLE_QUOTE, "");
    }
    GenerationCtxt.prototype.error = function (msg, nd) {
        var fileInfo = this.options.filePath || "", lineOffset = this.options.lineOffset || 0, lines = this.template.split(CR$1);
        throw {
            kind: "#Error",
            origin: "IVY",
            message: "Invalid " + NODE_NAMES[nd.kind] + " - " + msg,
            line: nd.lineNumber + lineOffset,
            column: nd.colNumber,
            lineExtract: ("" + lines[nd.lineNumber - 1]).trim(),
            file: fileInfo
        };
    };
    GenerationCtxt.prototype.decreaseIndent = function (indent) {
        var incLength = this.indentIncrement.length;
        if (indent.length > incLength) {
            return indent.substring(0, indent.length - incLength);
        }
        else {
            return indent;
        }
    };
    return GenerationCtxt;
}());
var ContainerType;
(function (ContainerType) {
    ContainerType[ContainerType["Block"] = 1] = "Block";
    ContainerType[ContainerType["Component"] = 2] = "Component";
    ContainerType[ContainerType["Async"] = 3] = "Async";
})(ContainerType || (ContainerType = {}));
function encodeText(t) {
    // todo replace double \\ with single \
    return '"' + t.replace(RX_DOUBLE_QUOTE, '\\"') + '"';
}
function templateStart(indent, tf, gc) {
    var lines = [], argNames = "", classDef = "", args = tf.arguments, argClassName = "", argInit = [], argType, injectTpl = false;
    indent = reduceIndent(indent);
    function addImport(symbol) {
        gc.imports[symbol] = 1;
    }
    if (args && args.length) {
        var classProps = [], arg = void 0, defaultValue = "";
        argNames = ", $, $api";
        for (var i = 0; args.length > i; i++) {
            defaultValue = "";
            arg = args[i];
            if (i === 0 && arg.name === API_ARG) {
                argClassName = arg.typeRef || "";
            }
            if (arg.name === API_ARG) {
                if (i > 0 && arg.typeRef) {
                    gc.error("Template param class must be defined as first argument", arg);
                }
            }
            else if (arg.name === TPL_ARG) {
                injectTpl = true;
            }
            else if (arg.name === FULL_API_ARG) ;
            else if (!argClassName) {
                argInit.push(arg.name + ' = $api["' + arg.name + '"]');
                switch (arg.typeRef) {
                    case "string":
                    case "number":
                    case "boolean":
                        argType = arg.typeRef;
                        break;
                    case "IvContent":
                        argType = "any";
                        break;
                    default:
                        if (arg.typeRef) {
                            argType = arg.typeRef;
                        }
                        else {
                            argType = "any";
                        }
                        break;
                }
                if (arg.defaultValue) {
                    defaultValue = " = " + arg.defaultValue;
                }
                var optional = arg.optional ? "?" : "";
                classProps.push("" + (indent + gc.indentIncrement) + arg.name + optional + ": " + argType + defaultValue + ";");
                //classProps.push((indent + gc.indentIncrement) + getPropertyDefinition({ name: arg.name, type: argType }, "ζ", addImport));
            }
            else if (i > 0) {
                // argClassName is defined (always in 1st position)
                argInit.push(arg.name + ' = $api["' + arg.name + '"]');
            }
        }
        if (!argClassName && classProps.length) {
            // default argument class definition
            argClassName = "ζParams";
            addImport("ζΔD");
            classDef = [indent, "@ζΔD", " class ζParams {\n", classProps.join("\n"), "\n", indent, "}"].join("");
        }
    }
    tf[MD_PARAM_CLASS] = argClassName;
    lines.push('(function () {');
    if (gc.statics.length) {
        lines.push(indent + "const " + gc.statics.join(", ") + ";");
    }
    if (classDef) {
        lines.push(classDef);
    }
    gc.imports["ζt"] = 1;
    if ( injectTpl) {
        if (injectTpl) {
            argNames += ", $template";
        }
    }
    lines.push(indent + "return \u03B6t(\"" + gc.templateName + "\", \"" + gc.filePath + "\", \u03B6s0, function (\u03B6" + argNames + ") {");
    if (argInit.length) {
        lines.push(indent + gc.indentIncrement + "let " + argInit.join(", ") + ";");
    }
    return lines.join("\n");
}
function templateEnd(tf) {
    var argClassName = tf[MD_PARAM_CLASS];
    if (argClassName) {
        return "}, " + argClassName + ");\n" + reduceIndent(tf.indent) + "})()";
    }
    return '});\n' + reduceIndent(tf.indent) + '})()';
}
var ViewInstruction = /** @class */ (function () {
    function ViewInstruction(kind, node, idx, parentView, iFlag, generationCtxt, indent) {
        this.kind = kind;
        this.node = node;
        this.idx = idx;
        this.parentView = parentView;
        this.iFlag = iFlag;
        this.nodeCount = 0;
        this.instructions = [];
        this.indent = '';
        this.prevKind = ''; // kind of the previous sibling
        this.nextKind = ''; // kind of the next sibling
        this.instanceCounterVar = ''; // e.g. ζi2 -> used to count sub-block instances
        this.blockIdx = 0;
        this.jsVarName = "ζ"; // block variable name - e.g. ζ or ζ1
        this.cmVarName = "ζc"; // creation mode var name - e.g. ζc or ζc1
        this.childBlockCreated = []; // used to know if a block container has already been created
        this.childBlockIndexes = [];
        this.childViewIndexes = [];
        this.exprCount = 0; // binding expressions count
        this.expr1Count = 0; // one-time expressions count
        this.dExpressions = []; // list of counters for deferred expressions (cf. ζexp)
        this.hasChildNodes = false; // true if the view has Child nodes
        this.hasParamNodes = false;
        this.asyncValue = 0; // async priority
        this.cptIFlag = -1; // iFlag of the component associated with this view
        this.cpnParentLevel = -1; // component or pnode parent level
        this.paramInstanceVars = undefined; // map of the param node instance variables
        this.bindingsCount = 0; // counter used by ParamInstruction to count the number of bindings on a component / decorator
        if (parentView) {
            this.gc = parentView.gc;
            this.blockIdx = this.gc.blockCount++;
            if (this.kind === "cptContent" || this.kind === "paramContent") {
                // no instance var, no indent
                this.indent = parentView.indent;
                this.instanceCounterVar = '';
            }
            else if (this.kind === "asyncBlock") {
                this.gc.imports['ζasync'] = 1;
                this.indent = parentView.indent + this.gc.indentIncrement;
                this.instanceCounterVar = '';
            }
            else if (this.kind === "jsBlock") {
                this.indent = parentView.indent + this.gc.indentIncrement;
                this.instanceCounterVar = 'ζi' + this.blockIdx;
                this.gc.localVars[this.instanceCounterVar + " = 0"] = 1;
                parentView.childViewIndexes.push(this.blockIdx); // used to reset instanceVar counters
            }
        }
        else if (generationCtxt) {
            this.indent = indent || '';
            this.gc = generationCtxt;
            this.blockIdx = this.gc.blockCount++;
            this.gc.imports['ζinit'] = 1;
            this.gc.imports['ζend'] = 1;
            this.gc.statics[0] = "ζs0 = {}"; // static object to hold cached values
        }
        else {
            throw new Error("ViewInstruction: either parentBlock or generationCtxt must be provided");
        }
        if (this.blockIdx > 0) {
            this.jsVarName = "ζ" + this.blockIdx;
            this.cmVarName = "ζc" + this.blockIdx;
        }
        if (this.blockIdx > 0) {
            // root block (idx 1) is passed as function argument
            this.gc.localVars[this.jsVarName] = 1;
            this.gc.localVars[this.cmVarName] = 1;
        }
    }
    ViewInstruction.prototype.scan = function () {
        if (this.kind === "asyncBlock") {
            this.generateInstruction([this.node], 0, 0, this.iFlag, this.prevKind, this.nextKind);
        }
        else {
            var content = this.node.content, len = content ? content.length : 0;
            if (len === 0)
                return;
            var pLevel = 0;
            // creation mode
            if (len > 1) {
                // need container fragment if child nodes are not pnodes nor statements
                var count = 0, ch = void 0;
                for (var i = 0; len > i; i++) {
                    ch = content[i];
                    if (ch.kind !== "#jsStatements" && ch.kind !== "#paramNode") {
                        count++;
                        if (count > 1)
                            break;
                    }
                }
                if (count > 1) {
                    this.nodeCount = 1;
                    this.instructions.push(new FraInstruction(null, 0, this, this.iFlag, pLevel));
                    pLevel = 1;
                }
            }
            this.scanContent(content, pLevel, this.iFlag);
        }
        if (this.parentView && this.hasChildNodes) {
            this.gc.imports['ζview' + getIhSuffix(this.iFlag)] = 1;
            this.gc.imports['ζend' + getIhSuffix(this.iFlag)] = 1;
        }
    };
    ViewInstruction.prototype.scanContent = function (content, parentLevel, iFlag) {
        var pKind = "", nKind = "", len = content ? content.length : 0;
        for (var i = 0; len > i; i++) {
            nKind = (i < len - 1) ? content[i + 1].kind : "";
            this.generateInstruction(content, i, parentLevel, iFlag, pKind, nKind);
            pKind = content[i].kind;
        }
    };
    ViewInstruction.prototype.checkContentNode = function (nd) {
        var nk = getNodeKind(), attSupport = SUPPORTED_NODE_ATTRIBUTES[nk], gc = this.gc;
        if (attSupport) {
            if (attSupport === LATER) {
                gc.error(VALIDATION_NAMES[nk] + " are not supported yet", nd);
            }
            else {
                var f = nd;
                if (f.params) {
                    checkAttribute(f, "#param", f.params[0]);
                }
                if (f.properties) {
                    checkAttribute(f, "#property", f.properties[0]);
                }
                if (f.decorators) {
                    checkAttribute(f, "#decorator", f.decorators[0]);
                }
                if (f.labels) {
                    var l = void 0, fl = void 0;
                    for (var _i = 0, _a = f.labels; _i < _a.length; _i++) {
                        var lbl = _a[_i];
                        if (lbl.fwdLabel) {
                            if (!lbl.isOrphan && lbl.value.kind !== "#string" && lbl.value.kind !== "#expression") {
                                gc.error("Forward labels values must be strings or expressions", lbl);
                            }
                            fl = fl || lbl;
                        }
                        else {
                            if (!lbl.isOrphan && lbl.value.kind !== "#boolean" && lbl.value.kind !== "#expression") {
                                gc.error("Labels values must be expressions or booleans", lbl);
                            }
                            l = l || lbl;
                        }
                    }
                    if (l) {
                        checkAttribute(f, "#label", l);
                    }
                    if (fl) {
                        checkAttribute(f, "##label", fl);
                    }
                }
                if (f.decorators) {
                    var codeRef = void 0;
                    for (var _b = 0, _c = f.decorators; _b < _c.length; _b++) {
                        var d = _c[_b];
                        codeRef = d.ref.code;
                        var values = SUPPORTED_BUILT_IN_DECORATORS[d.ref.code];
                        if (nk === "#paramNode" && codeRef !== PARAM_VALUE && !codeRef.match(RX_EVT_HANDLER_DECORATOR)) {
                            gc.error("Only @paramValue and event listener decorators can be used on Parameter nodes", d);
                        }
                        else if (values && values[nk] === NO) {
                            gc.error("@" + d.ref.code + " is not supported on " + VALIDATION_NAMES[nk], d);
                        }
                        else if (codeRef.match(RX_EVT_HANDLER_DECORATOR)) {
                            if (!SUPPORTED_NODE_ATTRIBUTES[nk]["@onevent"]) {
                                gc.error("Event handlers are not supported on " + VALIDATION_NAMES[nk], d);
                            }
                        }
                    }
                }
            }
        }
        function getNodeKind() {
            var k = nd.kind;
            if (k === "#element" && nd.nameExpression)
                return "#{element}";
            if (k === "#paramNode" && nd.nameExpression)
                return "#{paramNode}";
            return k;
        }
        function checkAttribute(f, attKind, errNd) {
            if (errNd) {
                switch (attSupport[attKind]) {
                    case NO:
                        gc.error(VALIDATION_NAMES[attKind] + " are not supported on " + VALIDATION_NAMES[nk], errNd);
                    case LATER:
                        gc.error(VALIDATION_NAMES[attKind] + " are not yet supported on " + VALIDATION_NAMES[nk], errNd);
                }
            }
        }
    };
    ViewInstruction.prototype.generateInstruction = function (siblings, siblingIdx, parentLevel, iFlag, prevKind, nextKind) {
        var _a;
        var nd = siblings[siblingIdx], content = undefined, idx = this.nodeCount;
        if (nd.kind !== "#jsStatements" && nd.kind !== "#paramNode") {
            this.nodeCount++;
            this.hasChildNodes = true;
        }
        this.checkContentNode(nd);
        var stParams = "", i1 = -1, i2 = -1, containsParamExpr = false;
        if (nd.kind === "#element" || nd.kind === "#component" || nd.kind === "#paramNode") {
            _a = this.registerStatics(nd.params), i1 = _a[0], containsParamExpr = _a[1];
            i2 = this.registerStatics(nd.properties)[0];
            if (i1 > -1 && i2 > -1) {
                stParams = ", \u03B6s" + i1 + ", \u03B6s" + i2;
            }
            else if (i1 > -1) {
                stParams = ", \u03B6s" + i1;
            }
            else if (i2 > -1) {
                stParams = ", 0, \u03B6s" + i2;
            }
        }
        var xmlns = "";
        switch (nd.kind) {
            case "#textNode":
                this.rejectAsyncDecorator(nd);
                this.instructions.push(new TxtInstruction(nd, idx, this, iFlag, parentLevel, this.generateLabelStatics(nd)));
                this.generateDecoratorInstructions(nd, idx, iFlag);
                this.generateDynLabelInstructions(nd, idx, iFlag, this);
                break;
            case "#fragment":
                if (!this.processAsyncCase(nd, idx, parentLevel, prevKind, nextKind)) {
                    xmlns = this.retrieveXmlNs(nd);
                    if (xmlns) {
                        this.instructions.push(new XmlNsInstruction(this, iFlag, true, xmlns));
                    }
                    this.instructions.push(new FraInstruction(nd, idx, this, iFlag, parentLevel));
                    this.generateDecoratorInstructions(nd, idx, iFlag);
                    content = nd.content;
                }
                break;
            case "#element":
                if (!this.processAsyncCase(nd, idx, parentLevel, prevKind, nextKind)) {
                    xmlns = this.retrieveXmlNs(nd);
                    if (xmlns) {
                        this.instructions.push(new XmlNsInstruction(this, iFlag, true, xmlns));
                    }
                    this.instructions.push(new EltInstruction(nd, idx, this, iFlag, parentLevel, this.generateLabelStatics(nd), stParams));
                    this.generateParamInstructions(nd, idx, iFlag, true, this);
                    this.generateDynLabelInstructions(nd, idx, iFlag, this);
                    this.generateDecoratorInstructions(nd, idx, iFlag);
                    this.createListeners(nd, idx, iFlag, this);
                    content = nd.content;
                }
                break;
            case "#component":
                if (!this.processAsyncCase(nd, idx, parentLevel, prevKind, nextKind)) {
                    // create a container block
                    var callImmediately = !containsParamExpr && (!nd.content || !nd.content.length) && !nd.decorators;
                    var ci = new CptInstruction(nd, idx, this, iFlag, parentLevel, this.generateLabelStatics(nd), callImmediately, i1);
                    this.instructions.push(ci);
                    if (containsParamExpr) {
                        this.generateParamInstructions(nd, idx, iFlag, false, this);
                    }
                    this.generateDynLabelInstructions(nd, idx, iFlag, this);
                    if (nd.content && nd.content.length) {
                        var vi = new ViewInstruction("cptContent", nd, idx, this, 1);
                        vi.contentParentInstruction = ci;
                        vi.cptIFlag = iFlag; // used by sub param Nodes to have the same value
                        vi.cpnParentLevel = parentLevel;
                        this.instructions.push(vi);
                        this.hasParamNodes = false;
                        vi.scan(); // will update this.hasParamNodes
                        if (!vi.hasChildNodes && !this.hasParamNodes) {
                            ci.callImmediately = callImmediately = true;
                        }
                        this.hasParamNodes = false;
                    }
                    if (this.createListeners(nd, idx, iFlag, this)) {
                        ci.callImmediately = callImmediately = false;
                    }
                    if (!callImmediately) {
                        this.instructions.push(new CallInstruction(idx, this, iFlag, ci));
                    }
                    this.generateDecoratorInstructions(nd, idx, iFlag, false, true);
                }
                break;
            case "#paramNode":
                // e.g. ζpnode(ζ, 3, 1, 0, "header");
                // logic close to #component
                this.rejectAsyncDecorator(nd);
                // pickup the closest parent view that is not a js block
                if (!this.parentView) {
                    this.gc.error("Param nodes cannot be defined at root level", nd); // TODO: this could change
                }
                var v = this, cptIFlag = 0, cpnParentLevel = 0, name_1 = nd.name;
                while (v) {
                    if (v.cptIFlag > -1) {
                        cptIFlag = v.cptIFlag;
                    }
                    if (v.cpnParentLevel > -1) {
                        cpnParentLevel = v.cpnParentLevel;
                    }
                    if (v.kind === "asyncBlock") {
                        this.gc.error("Param nodes cannot be defined in @async blocks", nd);
                    }
                    else if (v.kind === "jsBlock") {
                        v = v.parentView;
                    }
                    else if (v.kind === "cptContent" || v.kind === "paramContent") {
                        v = v.parentView;
                        break;
                    }
                    else if (v.kind === "template") {
                        break;
                    }
                    else {
                        this.gc.error("Param nodes cannot be defined in " + v.kind + " views", nd);
                    }
                }
                var newIdx = v.nodeCount++;
                v.hasParamNodes = true;
                var v2 = this, inJsBlock = false, contentParentView = null;
                while (v2) {
                    if (v2.kind === "jsBlock") {
                        inJsBlock = true;
                        v2 = v2.parentView;
                    }
                    else if (v2.kind === "cptContent" || v2.kind === "paramContent") {
                        contentParentView = v2;
                        break;
                    }
                    else {
                        break;
                    }
                }
                // add param name to contentParentInstruction.dynamicPNodeNames if in Js block
                if (!contentParentView) {
                    this.gc.error("Internal error: contentParentView should be defined", nd);
                }
                if (inJsBlock) {
                    var names = contentParentView.contentParentInstruction.dynamicPNodeNames;
                    if (names.indexOf(name_1) < 0) {
                        names.push(name_1);
                    }
                }
                if (!v.paramInstanceVars) {
                    v.paramInstanceVars = {};
                }
                var instanceVarName = v.paramInstanceVars[name_1];
                if (!instanceVarName) {
                    instanceVarName = 'ζp' + this.gc.paramCounter++;
                    this.gc.localVars["" + instanceVarName] = 1;
                    v.paramInstanceVars[name_1] = instanceVarName;
                }
                var parentIdx = contentParentView.contentParentInstruction.idx, hasContent = nd.content !== undefined && nd.content.length > 0, pi = new PndInstruction(nd, newIdx, v, cptIFlag, cpnParentLevel + 1, "0", i1, this.indent, parentIdx, instanceVarName, hasContent);
                this.instructions.push(pi);
                this.generateParamInstructions(nd, newIdx, cptIFlag, false, v);
                this.createListeners(nd, newIdx, cptIFlag, v);
                if (hasContent) {
                    var vi = new ViewInstruction("paramContent", nd, newIdx, v, 1);
                    vi.indent = this.indent;
                    vi.contentParentInstruction = pi;
                    vi.cpnParentLevel = cpnParentLevel + 1;
                    this.instructions.push(vi);
                    vi.scan();
                    this.instructions.push(new PndEndInstruction(nd, newIdx, v, cptIFlag, this.indent, pi));
                }
                break;
            case "#jsStatements":
                this.instructions.push(new JsStatementsInstruction(nd, this, iFlag, prevKind));
                break;
            case "#jsBlock":
                if (!this.childBlockCreated[idx]) {
                    // create all adjacent block containers at once
                    var siblingNd = void 0, count = 0;
                    for (var i = siblingIdx; siblings.length > i; i++) {
                        siblingNd = siblings[i];
                        if (siblingNd.kind === "#jsBlock") {
                            this.instructions.push(new CntInstruction(idx + count, this, this.iFlag, parentLevel, ContainerType.Block));
                            this.childBlockCreated[idx + count] = true;
                        }
                        else {
                            break;
                        }
                        count++;
                    }
                }
                this.childBlockIndexes.push(idx);
                var jsb = new ViewInstruction("jsBlock", nd, idx, this, this.iFlag ? this.iFlag + 1 : 0);
                jsb.prevKind = prevKind;
                jsb.nextKind = nextKind;
                this.instructions.push(jsb);
                jsb.scan();
                break;
        }
        if (content) {
            this.scanContent(content, parentLevel + 1, iFlag);
            if (xmlns) {
                this.instructions.push(new XmlNsInstruction(this, iFlag, false, xmlns));
            }
        }
    };
    ViewInstruction.prototype.retrieveXmlNs = function (nd) {
        var xmlns = "", params = nd.params;
        if (params && params.length) {
            for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                var p = params_1[_i];
                if (p.kind === "#param" && p.name === XMLNS) {
                    if (xmlns) {
                        this.gc.error("xmlns cannot be defined twice", p);
                    }
                    else {
                        if (!p.value || p.value.kind !== "#string") {
                            this.gc.error("xmlns value must be a string", p);
                        }
                        else {
                            if (p.isOrphan || !p.value.value) {
                                this.gc.error("xmlns value cannot be empty", p);
                            }
                            xmlns = p.value.value;
                        }
                    }
                }
            }
        }
        var d = nd.decorators;
        if (d && d.length) {
            for (var _a = 0, d_1 = d; _a < d_1.length; _a++) {
                var deco = d_1[_a];
                if (deco.ref.code === XMLNS) {
                    if (xmlns) {
                        this.gc.error("xmlns cannot be defined twice", deco);
                    }
                    else {
                        if (!deco.defaultPropValue || deco.defaultPropValue.kind !== "#string") {
                            this.gc.error("@xmlns value must be a string", deco);
                        }
                        else {
                            var v = deco.defaultPropValue.value;
                            if (XMLNS_VALUES[v]) {
                                xmlns = XMLNS_VALUES[v];
                            }
                            else {
                                this.gc.error('Invalid @xmlns value: must be "html", "xhtml", "svg" or "mathml"', deco);
                            }
                        }
                    }
                }
            }
        }
        if (xmlns === "" && nd.kind === "#element" && nd.name.toLowerCase() === SVG) {
            xmlns = XMLNS_VALUES[SVG];
        }
        return xmlns;
    };
    ViewInstruction.prototype.registerStatics = function (params) {
        // return the index of the static resource or -1 if none
        // 2nd param is true if dynamic expressions are found
        if (!params || !params.length)
            return [-1, false];
        var v, sIdx = -1, val = undefined, p, sVal = "", containsExpr = false, statics = this.gc.statics;
        for (var i = 0; params.length > i; i++) {
            p = params[i];
            v = p.value;
            sVal = "";
            if (p.kind === "#param" && p.isOrphan) {
                sVal = "true";
            }
            else if (v && v.kind !== "#expression") {
                if (v.kind === "#string") {
                    sVal = encodeText(v.value);
                }
                else {
                    sVal = "" + v.value;
                }
            }
            else if (v && v.kind === "#expression") {
                containsExpr = true;
            }
            if (sVal) {
                if (sIdx < 0) {
                    sIdx = statics.length;
                    val = [];
                }
                val.push(encodeText(p.name));
                val.push(sVal);
            }
        }
        if (val) {
            statics[sIdx] = "ζs" + sIdx + " = [" + val.join(", ") + "]";
        }
        return [sIdx, containsExpr];
    };
    /**
     * Parse the XJS node to look for labels - e.g. #foo or #bar[] or #baz[{expr()}]
     * @param nd
     */
    ViewInstruction.prototype.generateLabelStatics = function (nd) {
        if (nd.labels && nd.labels.length) {
            var lbl = void 0, labels = nd.labels, len = labels.length, values = [];
            for (var i = 0; labels.length > i; i++) {
                lbl = labels[i];
                if (lbl.fwdLabel) {
                    this.gc.error("Forward labels (e.g. ##" + lbl.name + ") are not supported (yet)", lbl);
                }
                if (lbl.isOrphan) {
                    values.push(encodeText("#" + lbl.name));
                }
            }
            if (!values.length)
                return "0"; // no static labels
            var statics = this.gc.statics, sIdx = statics.length;
            statics[sIdx] = "ζs" + sIdx + " = [" + values.join(", ") + "]";
            return "ζs" + sIdx;
        }
        return "0"; // no labels
    };
    ViewInstruction.prototype.generateParamInstructions = function (nd, idx, iFlag, isAttribute, view) {
        // dynamic params / attributes
        if (nd.params && nd.params.length) {
            var len = nd.params.length, p = void 0, isParamNode = nd.kind === "#paramNode";
            for (var i = 0; len > i; i++) {
                p = nd.params[i];
                if (p.isSpread) {
                    this.gc.error("Spread operator is no supported yet", p);
                }
                if (p.value && p.value.kind === "#expression") {
                    this.instructions.push(new ParamInstruction(p, idx, view, iFlag, isAttribute, this.indent, isParamNode));
                }
            }
        }
        if (nd.kind === "#paramNode" && nd.decorators) {
            // look for @paramValue decorator
            for (var _i = 0, _a = nd.decorators; _i < _a.length; _i++) {
                var d = _a[_i];
                if (d.ref.code === PARAM_VALUE) {
                    if (nd.params) {
                        this.gc.error("@paramValue cannot be mixed with other parameters", d);
                    }
                    this.instructions.push(new ParamInstruction(d, idx, view, iFlag, false, this.indent, true));
                }
            }
        }
        // dynamic properties
        if (nd.kind !== "#decorator" && nd.properties && nd.properties.length) {
            var len = nd.properties.length, p = void 0;
            for (var i = 0; len > i; i++) {
                p = nd.properties[i];
                if (p.isSpread) {
                    this.gc.error("Spread operator is no supported yet", p);
                }
                if (p.name === "innerHTML") {
                    this.gc.error("innerHTML is not authorized (security restriction)", p);
                }
                if (p.value && p.value.kind === "#expression") {
                    this.instructions.push(new ParamInstruction(p, idx, view, iFlag, isAttribute, this.indent));
                }
            }
        }
    };
    ViewInstruction.prototype.generateDynLabelInstructions = function (nd, idx, iFlag, view) {
        // dynamic labels
        if (nd.labels && nd.labels.length) {
            var len = nd.labels.length, lbl = void 0;
            for (var i = 0; len > i; i++) {
                lbl = nd.labels[i];
                if (!lbl.isOrphan && lbl.value) {
                    if (!lbl.fwdLabel) {
                        this.instructions.push(new LblInstruction(lbl, idx, view, iFlag, this.indent));
                    }
                }
            }
        }
    };
    ViewInstruction.prototype.processAsyncCase = function (nd, idx, parentLevel, prevKind, nextKind) {
        // generate async block if @async decorator is used
        var asyncValue = 0;
        if (nd === this.node) {
            return false; // we are in the async block for this node
        }
        // determine if an async decorator is used
        var decorators = nd.decorators;
        if (decorators) {
            for (var _i = 0, decorators_1 = decorators; _i < decorators_1.length; _i++) {
                var d = decorators_1[_i];
                if (d.ref.code === ASYNC) {
                    if (!d.hasDefaultPropValue) {
                        if (d.params) {
                            this.gc.error("Async decorator doesn't accept multiple params", d);
                        }
                        asyncValue = 1;
                        break;
                    }
                    else {
                        var dv = d.defaultPropValue;
                        // value can be number or expression
                        if (dv.kind === "#number") {
                            asyncValue = dv.value;
                        }
                        else if (d.defaultPropValue.kind === "#expression") {
                            asyncValue = dv;
                        }
                        else {
                            this.gc.error("@async value must be either empty or a number or an expression", d);
                        }
                    }
                }
            }
        }
        if (asyncValue) {
            // create an async container
            this.instructions.push(new CntInstruction(idx, this, this.iFlag, parentLevel, ContainerType.Async));
            var av = new ViewInstruction("asyncBlock", nd, idx, this, this.iFlag ? this.iFlag + 1 : 0);
            av.setAsync(asyncValue);
            av.prevKind = prevKind;
            av.nextKind = nextKind;
            this.instructions.push(av);
            av.scan();
            return true;
        }
        return false;
    };
    ViewInstruction.prototype.setAsync = function (asyncValue) {
        this.asyncValue = asyncValue;
    };
    ViewInstruction.prototype.generateDecoratorInstructions = function (nd, idx, iFlag, includeBuiltIn, includeCustomDecorators) {
        var _a;
        if (includeBuiltIn === void 0) { includeBuiltIn = true; }
        if (includeCustomDecorators === void 0) { includeCustomDecorators = true; }
        var d = nd.decorators, len1 = this.instructions.length;
        if (d) {
            var len = d.length, deco = void 0, kind = nd.kind, decoRef = "";
            for (var i = 0; len > i; i++) {
                deco = d[i];
                decoRef = deco.ref ? deco.ref.code : "";
                if (decoRef === "content") {
                    if (includeBuiltIn) {
                        // todo: @content on components, param nodes and decorator nodes
                        if (kind === "#element" || kind === "#fragment") {
                            this.instructions.push(new InsInstruction(deco, nd, idx, this, iFlag));
                        }
                        else {
                            this.gc.error("@content can not be used on " + VALIDATION_NAMES[kind], nd);
                        }
                    }
                }
                else if (decoRef === "async" || decoRef === "key" || decoRef === PARAM_VALUE || decoRef === "xmlns" || decoRef.match(RX_EVT_HANDLER_DECORATOR)) {
                    // built-in decorators: @async, @key, @onXXX, @xmlns, @paramValue
                    continue;
                }
                else if (includeCustomDecorators) {
                    // custom decorator
                    var sIdx = -1, containsParamExpr = false;
                    _a = this.registerStatics(deco.params), sIdx = _a[0], containsParamExpr = _a[1];
                    var decoIdx = this.nodeCount++, decoInstr = new DecoInstruction(deco, decoIdx, idx, this, iFlag, this.indent, sIdx, this.generateLabelStatics(deco));
                    this.instructions.push(decoInstr);
                    if (containsParamExpr) {
                        this.generateParamInstructions(deco, decoIdx, iFlag, false, this);
                    }
                    this.generateDynLabelInstructions(deco, decoIdx, iFlag, this);
                    this.createListeners(deco, decoIdx, iFlag, this);
                    if (decoInstr.paramMode === 2) {
                        this.instructions.push(new DecoCallInstruction(decoInstr));
                    }
                }
            }
        }
    };
    // return true if some listeners have been created
    ViewInstruction.prototype.createListeners = function (nd, parentIdx, iFlag, view) {
        if (!nd.decorators)
            return false;
        var name, result = false;
        for (var _i = 0, _a = nd.decorators; _i < _a.length; _i++) {
            var d = _a[_i];
            name = d.ref.code;
            if (name.match(RX_EVT_HANDLER_DECORATOR)) {
                this.instructions.push(new EvtInstruction(d, RegExp.$1, view.nodeCount++, parentIdx, view, iFlag));
                result = true;
            }
        }
        return result;
    };
    ViewInstruction.prototype.rejectAsyncDecorator = function (nd) {
        var decorators = nd.decorators;
        if (decorators) {
            for (var _i = 0, decorators_2 = decorators; _i < decorators_2.length; _i++) {
                var d = decorators_2[_i];
                if (d.ref.code === "async") {
                    this.gc.error("@async cannot be used in this context", d);
                }
            }
        }
    };
    ViewInstruction.prototype.pushCode = function (body) {
        // e.g. 
        // let ζc = ζinit(ζ, ζs0, 3);
        // ...
        // ζend(ζ);
        var isJsBlock = this.node.kind === "#jsBlock";
        if (isJsBlock) {
            var p = this.parentView, nd = this.node;
            body.push((this.prevKind !== "#jsBlock" && this.prevKind !== "#jsStatements") ? this.gc.decreaseIndent(this.indent) : " ");
            body.push(nd);
            if (!nd.startCode.match(/\n$/)) {
                body.push("\n");
            }
        }
        else if (this.kind === "asyncBlock") {
            // async block
            var p = this.parentView;
            body.push((this.prevKind !== "#jsBlock" && this.prevKind !== "#jsStatements") ? this.gc.decreaseIndent(this.indent) : " ");
            body.push("" + funcStart("async", this.iFlag) + p.jsVarName + ", " + this.iFlag + ", " + this.idx + ", ");
            if (typeof this.asyncValue === 'number') {
                body.push('' + this.asyncValue);
            }
            else {
                generateExpression(body, this.asyncValue, p, this.iFlag);
            }
            body.push(", function () {\n");
        }
        if (this.instructions.length) {
            var endArg = "";
            if (this.childBlockIndexes.length) {
                // block indexes need to be passed to the end statement
                var statics = this.gc.statics, csIdx = statics.length;
                statics.push("ζs" + csIdx + " = [" + this.childBlockIndexes.join(", ") + "]");
                endArg = ", ζs" + csIdx;
            }
            if (this.hasChildNodes) {
                var lastArgs = "", parentViewVarName = "ζ";
                if (!this.parentView) {
                    // root block: insert local variables
                    var arr = [], localVars = this.gc.localVars;
                    for (var k in localVars)
                        if (localVars.hasOwnProperty(k)) {
                            arr.push(k);
                        }
                    arr.push("\u03B6c = \u03B6init(\u03B6, \u03B6s0, " + this.nodeCount + ")");
                    if (arr.length) {
                        body.push(this.indent + "let " + arr.join(", ") + ";\n");
                    }
                }
                else {
                    if (this.childViewIndexes.length) {
                        // reset child view indexes
                        body.push(this.indent + "\u03B6i" + this.childViewIndexes.join(" = ζi") + " = 0;\n");
                    }
                    parentViewVarName = this.parentView.jsVarName;
                    lastArgs = this.instanceCounterVar ? ", ++" + this.instanceCounterVar : ", 0";
                }
                if (this.blockIdx > 0) {
                    // root block is initialized with ζinit
                    body.push("" + this.indent + this.jsVarName + " = " + funcStart("view", this.iFlag) + parentViewVarName + ", " + this.iFlag + ", " + this.idx + ", " + this.nodeCount + lastArgs + ");\n");
                    body.push("" + this.indent + this.cmVarName + " = " + this.jsVarName + ".cm;\n");
                }
            }
            if (this.paramInstanceVars !== undefined) {
                // reset the parameter instance counters
                var arr = [];
                for (var k in this.paramInstanceVars) {
                    if (this.paramInstanceVars.hasOwnProperty(k)) {
                        arr.push(this.paramInstanceVars[k]);
                    }
                }
                body.push("" + this.indent + arr.join(" = ") + " = 0;\n");
            }
            for (var _i = 0, _a = this.instructions; _i < _a.length; _i++) {
                var ins = _a[_i];
                ins.pushCode(body);
            }
            if (this.hasChildNodes) {
                body.push("" + this.indent + funcStart("end", this.iFlag) + this.jsVarName + ", " + this.cmVarName + endArg + ");\n");
            }
        }
        if (isJsBlock) {
            var nd = this.node;
            body.push(this.gc.decreaseIndent(this.indent));
            body.push(nd.endCode);
            if (!nd.endCode.match(/\n$/) && this.nextKind !== "#jsBlock" && this.nextKind !== "#jsStatements") {
                body.push("\n");
            }
        }
        else if (this.kind === "asyncBlock") {
            // end of async function
            body.push(this.parentView.indent + "});\n");
        }
    };
    return ViewInstruction;
}());
function generateExpression(body, exp, view, iFlag) {
    if (typeof (exp) !== "string" && exp.oneTime) {
        var ih = iFlag ? ", 1" : "";
        // e.g. ζo(ζ1, 0, ζc1? exp() : ζu, 2)
        body.push("\u03B6o(" + view.jsVarName + ", " + view.expr1Count++ + ", " + view.cmVarName + "? ");
        body.push(exp); // to generate source map
        body.push(" : \u03B6u" + ih + ")");
        view.gc.imports['ζo'] = 1;
        view.gc.imports['ζu'] = 1;
    }
    else {
        // e.g. ζe(ζ1, 2, expr())
        if (iFlag === 0) {
            body.push("\u03B6e(" + view.jsVarName + ", " + view.exprCount++ + ", ");
            body.push(exp); // to generate source map
            body.push(')');
        }
        else {
            // expression has to be deferred and cannot be immediately processed
            // so will be passed as an array: [0, getTitle()]
            // note: context nodes and instruction holder are already passed to the function
            // where the expression is used, this is why they don't need to be passed in the expression array
            if (view.dExpressions[iFlag] === undefined) {
                view.dExpressions[iFlag] = 0;
            }
            else {
                view.dExpressions[iFlag]++;
            }
            body.push("[" + view.dExpressions[iFlag] + ", ");
            body.push(exp); // to generate source map
            body.push("]");
        }
        view.gc.imports['ζe'] = 1;
    }
}
function getIhSuffix(iFlag) {
    return iFlag ? "D" : "";
}
var TxtInstruction = /** @class */ (function () {
    function TxtInstruction(node, idx, view, iFlag, parentLevel, staticLabels) {
        this.node = node;
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        this.parentLevel = parentLevel;
        this.staticLabels = staticLabels;
        this.isStatic = true; // true when the text doesn't contain expressions
        this.staticsExpr = '""'; // '" static string "' or "ζs1"
        this.view.gc.imports['ζtxt' + getIhSuffix(iFlag)] = 1;
        var eLength = node.expressions ? node.expressions.length : 0;
        if (node.textFragments.length <= 1 && eLength === 0) {
            // static version
            this.staticsExpr = encodeText(node.textFragments[0]);
        }
        else {
            this.isStatic = false;
            // create static resource
            var gc = this.view.gc, staticsIdx = gc.statics.length, pieces = [], fLength = node.textFragments.length, eCount = 0;
            for (var i = 0; fLength > i; i++) {
                // todo eLength
                pieces.push(encodeText(node.textFragments[i]));
                if (eCount < eLength) {
                    pieces.push('""');
                    eCount++;
                }
            }
            gc.statics.push("ζs" + staticsIdx + " = [" + pieces.join(", ") + "]");
            this.staticsExpr = 'ζs' + staticsIdx;
        }
    }
    TxtInstruction.prototype.pushCode = function (body) {
        // e.g. ζtxt(ζ1, ζc1, 0, 2, 1, ζs0, 1, ζe(ζ, 0, 1, name));
        var v = this.view, eLength = this.node.expressions ? this.node.expressions.length : 0;
        body.push("" + v.indent + funcStart("txt", this.iFlag) + v.jsVarName + ", " + v.cmVarName + ", " + this.iFlag + ", " + this.idx + ", " + this.parentLevel + ", " + this.staticLabels + ", " + this.staticsExpr + ", " + eLength);
        for (var i = 0; eLength > i; i++) {
            body.push(', ');
            generateExpression(body, this.node.expressions[i], this.view, this.iFlag);
        }
        body.push(');\n');
    };
    return TxtInstruction;
}());
function funcStart(name, iFlag) {
    if (!iFlag) {
        return "ζ" + name + "(";
    }
    else {
        return "ζ" + name + "D(";
    }
}
var XmlNsInstruction = /** @class */ (function () {
    function XmlNsInstruction(view, iFlag, startInstruction, xmlns) {
        this.view = view;
        this.iFlag = iFlag;
        this.startInstruction = startInstruction;
        this.xmlns = xmlns;
        this.view.gc.imports['ζxmlns' + getIhSuffix(iFlag)] = 1;
    }
    XmlNsInstruction.prototype.pushCode = function (body) {
        // e.g. ζxmlns
        var v = this.view, lastArg = "";
        if (this.startInstruction) {
            lastArg = ', "' + this.xmlns + '"';
        }
        body.push("" + v.indent + funcStart("xmlns", this.iFlag) + v.jsVarName + ", " + this.iFlag + lastArg + ");\n");
    };
    return XmlNsInstruction;
}());
var EltInstruction = /** @class */ (function () {
    function EltInstruction(node, idx, view, iFlag, parentLevel, staticLabels, staticArgs) {
        this.node = node;
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        this.parentLevel = parentLevel;
        this.staticLabels = staticLabels;
        this.staticArgs = staticArgs;
        this.view.gc.imports['ζelt' + getIhSuffix(iFlag)] = 1;
    }
    EltInstruction.prototype.pushCode = function (body) {
        // e.g. ζelt(ζ1, ζc1, 0, 2, 1, "div", 0, ζs0, ζs1);
        var v = this.view;
        if (this.node.nameExpression) {
            v.gc.error("Name expressions are not yet supported", this.node);
        }
        var hasChildren = (this.node.content && this.node.content.length) ? 1 : 0, lastArgs = (this.staticLabels === "0" && !this.staticArgs) ? "" : ", " + this.staticLabels + this.staticArgs;
        body.push("" + v.indent + funcStart("elt", this.iFlag) + v.jsVarName + ", " + v.cmVarName + ", " + this.idx + ", " + this.parentLevel + ", \"" + this.node.name + "\", " + hasChildren + lastArgs + ");\n");
    };
    return EltInstruction;
}());
var FraInstruction = /** @class */ (function () {
    function FraInstruction(node, idx, view, iFlag, parentLevel) {
        this.node = node;
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        this.parentLevel = parentLevel;
        var gc = this.view.gc;
        gc.imports['ζfra' + getIhSuffix(iFlag)] = 1;
    }
    FraInstruction.prototype.pushCode = function (body) {
        var v = this.view;
        body.push("" + v.indent + funcStart("fra", this.iFlag) + v.jsVarName + ", " + v.cmVarName + ", " + this.idx + ", " + this.parentLevel + ");\n");
    };
    return FraInstruction;
}());
var ParamInstruction = /** @class */ (function () {
    function ParamInstruction(node, idx, view, iFlag, isAttribute, indent, targetParamNode) {
        if (targetParamNode === void 0) { targetParamNode = false; }
        this.node = node;
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        this.isAttribute = isAttribute;
        this.indent = indent;
        this.targetParamNode = targetParamNode;
        this.funcName = isAttribute ? "att" : "par";
        if (node && node.kind === "#property") {
            this.funcName = "pro";
        }
        this.view.gc.imports["ζ" + this.funcName + getIhSuffix(iFlag)] = 1;
    }
    ParamInstruction.prototype.pushCode = function (body) {
        // e.g. ζatt(ζ, 0, 1, "title", ζe(ζ, 0, exp()+123));
        var v = this.view, iSuffix = this.iFlag ? "D" : "", name = "0", generateLastExpressionArg = true;
        if (this.node.kind !== "#decorator") {
            name = '"' + this.node.name + '"';
        }
        var val = this.node.value;
        if (this.funcName === "par") {
            if (this.node.kind === "#decorator") {
                // @paramValue reserved decorator for param nodes
                var dfp = this.node.defaultPropValue;
                if (dfp) {
                    val = dfp;
                }
            }
            if (val && val.isBinding) {
                // binding expression - e.g. param={=someData.someProperty}
                generateBinding(body, val.code, this.node, v, this.indent, this.iFlag, this.idx, v.bindingsCount, name);
                v.bindingsCount++;
                generateLastExpressionArg = false;
            }
            else {
                // par defers from att and pro as it takes the cm argument to raise validation errors
                body.push(this.indent + "\u03B6par" + iSuffix + "(" + v.jsVarName + ", " + v.cmVarName + ", " + (this.iFlag ? 1 : 0) + ", " + this.idx + ", " + name + ", ");
            }
        }
        else {
            // attribute or property
            if (val && val.isBinding) {
                if (this.funcName === "att") {
                    v.gc.error("Binding expressions cannot be used on element attributes", this.node);
                }
                else {
                    v.gc.error("Binding expressions cannot be used on element properties", this.node);
                }
            }
            body.push(this.indent + "\u03B6" + this.funcName + iSuffix + "(" + v.jsVarName + ", " + (this.iFlag ? 1 : 0) + ", " + this.idx + ", " + name + ", ");
        }
        if (generateLastExpressionArg) {
            if (this.node.kind === "#decorator") {
                // @paramValue decorator - in this case targetParamNode is true
                var dfp = this.node.defaultPropValue;
                if (!dfp) {
                    v.gc.error("Incorrect value for @" + this.node.ref.code, this.node);
                }
                else {
                    pushExpressionValue(body, dfp);
                }
            }
            else if (this.targetParamNode) {
                // we don't use expressions in param nodes as we don't need them (trax objects will do the job)
                // besides expressions need to be re-evaluated when an object has been reset (so expression value cannot be cached)
                body.push(val);
            }
            else {
                generateExpression(body, val, this.view, this.iFlag);
            }
            body.push(');\n');
        }
    };
    return ParamInstruction;
}());
function generateBinding(body, expressionCode, node, v, indent, iFlag, idx, bindingIdx, name) {
    var iSuffix = iFlag ? "D" : "";
    var _a = parseBinding(expressionCode), hostExp = _a.hostExp, propExp = _a.propExp, errorMsg = _a.errorMsg;
    if (errorMsg) {
        v.gc.error(errorMsg, node);
    }
    else {
        // ζbind(ζ, ζc, 0, 1, "param", someData, "someProperty");
        v.gc.imports["ζbind" + getIhSuffix(iFlag)] = 1;
        body.push(indent + "\u03B6bind" + iSuffix + "(" + v.jsVarName + ", " + v.cmVarName + ", " + (iFlag ? 1 : 0) + ", " + idx + ", " + bindingIdx + ", " + name + ", " + hostExp + ", " + propExp + ");\n");
    }
}
var DecoInstruction = /** @class */ (function () {
    function DecoInstruction(node, idx, parentIdx, view, iFlag, indent, staticsIdx, staticLabels) {
        this.node = node;
        this.idx = idx;
        this.parentIdx = parentIdx;
        this.view = view;
        this.iFlag = iFlag;
        this.indent = indent;
        this.staticsIdx = staticsIdx;
        this.staticLabels = staticLabels;
        this.paramMode = 0; // 0=no params, 1=default param, 2=multiple params
        this.view.gc.imports["ζdeco" + getIhSuffix(iFlag)] = 1;
        if (node.defaultPropValue) {
            this.paramMode = 1; // default property value
        }
        else if (this.node.params && this.node.params.length) {
            this.paramMode = 2;
        }
    }
    DecoInstruction.prototype.pushCode = function (body) {
        // e.g. ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2);
        var v = this.view, iSuffix = this.iFlag ? "D" : "", dfp = this.node.defaultPropValue, hasStaticLabels = (this.staticLabels !== "0"), isDfpBinding = (dfp && dfp.kind === "#expression" && dfp.isBinding);
        body.push(this.indent + "\u03B6deco" + iSuffix + "(" + v.jsVarName + ", " + v.cmVarName + ", " + (this.iFlag ? 1 : 0) + ", " + this.idx + ", " + this.parentIdx + ", ");
        body.push(encodeText(this.node.ref.code) + ", "); // decorator name as string (error handling)
        pushExpressionValue(body, this.node.ref); // decorator reference
        if (isDfpBinding) {
            body.push(", 2"); // we have to consider the default parameter as an explicit parameter in this case
        }
        else {
            v.bindingsCount = 0; // reset bindings count - cf. ParamInstruction
            body.push(", " + this.paramMode);
        }
        if (!isDfpBinding && (dfp || this.staticsIdx > -1 || hasStaticLabels)) {
            body.push(', ');
            if (dfp) {
                pushExpressionValue(body, dfp);
            }
            else {
                body.push('0');
            }
            if (this.staticsIdx > -1) {
                body.push(', ζs' + this.staticsIdx);
            }
            else if (hasStaticLabels) {
                body.push(', 0');
            }
            if (hasStaticLabels) {
                body.push(', ' + this.staticLabels);
            }
        }
        body.push(');\n');
        if (isDfpBinding) {
            // binding idx is always 0 in this case as there is only one expression
            generateBinding(body, dfp.code, this.node, v, this.indent, this.iFlag, this.idx, 0, 0);
            var decoCall = new DecoCallInstruction(this);
            decoCall.pushCode(body);
        }
    };
    return DecoInstruction;
}());
var DecoCallInstruction = /** @class */ (function () {
    function DecoCallInstruction(di) {
        this.di = di;
        di.view.gc.imports["ζdecoEnd" + getIhSuffix(di.iFlag)] = 1;
    }
    DecoCallInstruction.prototype.pushCode = function (body) {
        // e.g. ζdecoEnd(ζ, ζc, 0, 1);
        var di = this.di, v = di.view, iSuffix = di.iFlag ? "D" : "";
        body.push(di.indent + "\u03B6decoEnd" + iSuffix + "(" + v.jsVarName + ", " + v.cmVarName + ", " + (di.iFlag ? 1 : 0) + ", " + di.idx + ");\n");
    };
    return DecoCallInstruction;
}());
function pushExpressionValue(body, value) {
    if (value.kind === "#expression") {
        body.push(value);
    }
    else {
        if (value.kind === "#string") {
            body.push(encodeText(value.value));
        }
        else {
            body.push("" + value.value);
        }
    }
}
var LblInstruction = /** @class */ (function () {
    function LblInstruction(node, idx, view, iFlag, indent) {
        this.node = node;
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        this.indent = indent;
        this.view.gc.imports["ζlbl" + getIhSuffix(iFlag)] = 1;
    }
    LblInstruction.prototype.pushCode = function (body) {
        // e.g. ζlbl(ζ, 0, 0, "divA", expr());
        var v = this.view, iSuffix = this.iFlag ? "D" : "", value = this.node.value;
        body.push(this.indent + "\u03B6lbl" + iSuffix + "(" + v.jsVarName + ", " + (this.iFlag ? 1 : 0) + ", " + this.idx + ", \"#" + this.node.name + "\", ");
        pushExpressionValue(body, value);
        body.push(');\n');
    };
    return LblInstruction;
}());
var JsStatementsInstruction = /** @class */ (function () {
    function JsStatementsInstruction(node, view, iFlag, prevKind) {
        this.node = node;
        this.view = view;
        this.iFlag = iFlag;
        this.prevKind = prevKind;
    }
    JsStatementsInstruction.prototype.pushCode = function (body) {
        var v = this.view;
        body.push((this.prevKind !== "#jsBlock") ? v.indent : " ");
        body.push(this.node);
        if (!this.node.code.match(/\n$/)) {
            body.push("\n");
        }
    };
    return JsStatementsInstruction;
}());
var CntInstruction = /** @class */ (function () {
    function CntInstruction(idx, view, iFlag, parentLevel, type) {
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        this.parentLevel = parentLevel;
        this.type = type;
        view.gc.imports['ζcnt' + getIhSuffix(iFlag)] = 1;
    }
    CntInstruction.prototype.pushCode = function (body) {
        var v = this.view;
        body.push("" + v.indent + funcStart("cnt", this.iFlag) + v.jsVarName + ", " + v.cmVarName + ", " + this.idx + ", " + this.parentLevel + ", " + this.type + ");\n");
    };
    return CntInstruction;
}());
var CptInstruction = /** @class */ (function () {
    function CptInstruction(node, idx, view, iFlag, parentLevel, staticLabels, callImmediately, staticParamIdx) {
        this.node = node;
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        this.parentLevel = parentLevel;
        this.staticLabels = staticLabels;
        this.callImmediately = callImmediately;
        this.staticParamIdx = staticParamIdx;
        this.dynamicPNodeNames = []; // name of child param nodes
        view.gc.imports['ζcpt' + getIhSuffix(iFlag)] = 1;
        if (node.properties && node.properties.length) {
            view.gc.error("Properties cannot be used on components", node);
        }
    }
    CptInstruction.prototype.pushCode = function (body) {
        // e.g. ζcpt(ζ, ζc, 2, 0, ζe(ζ, 0, alert), 1, ζs1);
        var v = this.view, lastArgs = processCptOptionalArgs(this.view, this, this.callImmediately ? this.staticLabels : "0");
        v.bindingsCount = 0; // reset bindings count - cf. ParamInstruction
        body.push("" + v.indent + funcStart("cpt", this.iFlag) + v.jsVarName + ", " + v.cmVarName + ", " + this.iFlag + ", " + this.idx + ", " + this.parentLevel + ", ");
        generateExpression(body, this.node.ref, this.view, this.iFlag);
        body.push(", " + (this.callImmediately ? 1 : 0) + lastArgs + ");\n");
    };
    return CptInstruction;
}());
var PndInstruction = /** @class */ (function () {
    function PndInstruction(node, idx, view, iFlag, parentLevel, staticLabels, staticParamIdx, indent, parentIndex, instanceVarName, hasEndInstruction) {
        this.node = node;
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        this.parentLevel = parentLevel;
        this.staticLabels = staticLabels;
        this.staticParamIdx = staticParamIdx;
        this.indent = indent;
        this.parentIndex = parentIndex;
        this.instanceVarName = instanceVarName;
        this.hasEndInstruction = hasEndInstruction;
        this.dynamicPNodeNames = []; // name of child param nodes
        view.gc.imports['ζpnode'] = 1;
        if (node.properties && node.properties.length) {
            view.gc.error("Properties cannot be used on param nodes", node);
        }
        if (node.nameExpression) {
            view.gc.error("Param nodes names cannot be defined through expressions (yet)", node);
        }
    }
    PndInstruction.prototype.pushCode = function (body) {
        // e.g. ζpnode(ζ, ζc, 2, 0, "header", ζs1);
        var v = this.view, lastArgs = processCptOptionalArgs(this.view, this, this.hasEndInstruction ? "0" : this.staticLabels);
        // unused: ${this.parentLevel}
        body.push(this.indent + "\u03B6pnode(" + v.jsVarName + ", " + v.cmVarName + ", " + this.iFlag + ", " + this.idx + ", " + this.parentIndex + ", \"" + this.node.name + "\", " + this.instanceVarName + "++" + lastArgs + ");\n");
    };
    return PndInstruction;
}());
var PndEndInstruction = /** @class */ (function () {
    function PndEndInstruction(node, idx, view, iFlag, indent, pi) {
        this.node = node;
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        this.indent = indent;
        this.pi = pi;
        view.gc.imports['ζpnEnd'] = 1;
    }
    PndEndInstruction.prototype.pushCode = function (body) {
        // ζpnEnd(v: IvView, cm: boolean, iFlag: number, idx: number, labels, dynParamNames: string[]) 
        // only create this instruction when there are dynamic parameter nodes
        var v = this.view, lastArg = "";
        if (this.pi.dynamicPNodeRef) {
            lastArg = ", " + this.pi.staticLabels + ", " + this.pi.dynamicPNodeRef;
        }
        else if (this.pi.staticLabels !== "0") {
            lastArg = ", " + this.pi.staticLabels;
        }
        body.push(this.indent + "\u03B6pnEnd(" + v.jsVarName + ", " + v.cmVarName + ", " + this.iFlag + ", " + this.idx + lastArg + ");\n");
    };
    return PndEndInstruction;
}());
function processCptOptionalArgs(view, ins, staticLabels) {
    if (ins.dynamicPNodeNames && ins.dynamicPNodeNames.length) {
        var idx = view.gc.statics.length;
        for (var i = 0; ins.dynamicPNodeNames.length > i; i++) {
            ins.dynamicPNodeNames[i] = encodeText(ins.dynamicPNodeNames[i]);
        }
        ins.dynamicPNodeRef = "ζs" + idx;
        view.gc.statics[idx] = ins.dynamicPNodeRef + " = [" + ins.dynamicPNodeNames.join(", ") + "]";
        return ", " + staticLabels + ", " + ((ins.staticParamIdx > -1) ? 'ζs' + ins.staticParamIdx : '0') + ", \u03B6s" + idx;
    }
    else if (ins.staticParamIdx > -1) {
        return ", " + staticLabels + ", \u03B6s" + ins.staticParamIdx;
    }
    else if (staticLabels !== "0") {
        return ", " + staticLabels;
    }
    return '';
}
var CallInstruction = /** @class */ (function () {
    function CallInstruction(idx, view, iFlag, ci) {
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        this.ci = ci;
        view.gc.imports['ζcall' + getIhSuffix(iFlag)] = 1;
    }
    CallInstruction.prototype.pushCode = function (body) {
        // e.g. ζcall(ζ, 2);
        var v = this.view, lastArgs = "";
        if (this.ci.dynamicPNodeRef) {
            lastArgs = ", 0, " + this.ci.staticLabels + ", " + this.ci.dynamicPNodeRef;
        }
        else if (this.ci.staticLabels !== "0") {
            lastArgs = ", 0, " + this.ci.staticLabels;
        }
        body.push("" + v.indent + funcStart("call", this.iFlag) + v.jsVarName + ", " + this.idx + lastArgs + ");\n");
    };
    return CallInstruction;
}());
var EvtInstruction = /** @class */ (function () {
    function EvtInstruction(decorator, name, idx, parentIdx, view, iFlag) {
        this.decorator = decorator;
        this.name = name;
        this.idx = idx;
        this.parentIdx = parentIdx;
        this.view = view;
        this.iFlag = iFlag;
        view.gc.imports['ζevt' + getIhSuffix(iFlag)] = 1;
        if (!decorator.hasDefaultPropValue && !decorator.params) {
            view.gc.error("Missing event handler value for @" + decorator.ref.code, decorator);
        }
    }
    EvtInstruction.prototype.pushCode = function (body) {
        // e.g. ζevt(ζ, ζc, 1, 0, function (e) {doSomething()});
        var v = this.view, d = this.decorator;
        var listener, options;
        if (d.defaultPropValue) {
            if (d.defaultPropValue.kind !== "#expression") {
                v.gc.error('Event listeners must be function expressions - e.g. @onclick={e=>doSomething(e)}', d);
            }
            else {
                listener = d.defaultPropValue;
            }
        }
        else {
            for (var _i = 0, _a = d.params; _i < _a.length; _i++) {
                var p = _a[_i];
                if (p.name === "listener") {
                    if (!p.value) {
                        v.gc.error("listener value cannot be empty", p);
                    }
                    else if (p.value.kind !== "#expression") {
                        v.gc.error('listeners must be function expressions - e.g. listener={e=>doSomething(e)}', p);
                    }
                    else {
                        listener = p.value;
                    }
                }
                else if (p.name === "options") {
                    if (!p.value) {
                        v.gc.error("options value cannot be empty", p);
                    }
                    else if (p.value.kind !== "#expression") {
                        v.gc.error('options value must be an expression - e.g. options={{passive:true, once:true}}', p);
                    }
                    else {
                        options = p.value;
                    }
                }
            }
        }
        if (!listener) {
            v.gc.error("Missing listener parameter", d);
        }
        else {
            var passiveArg = "", optionsArg = "";
            if (listener.code.match(/^\s*(\=\>)|(\(\s*\)\s*\=\>)/)) {
                passiveArg = ", 1";
            }
            if (options) {
                optionsArg = ", " + options.code;
                passiveArg = passiveArg || ", 0";
            }
            body.push("" + v.indent + funcStart("evt", this.iFlag) + v.jsVarName + ", " + v.cmVarName + ", " + this.idx + ", " + this.parentIdx + ", \"" + this.name + "\", ");
            pushExpressionValue(body, listener);
            body.push("" + passiveArg + optionsArg + ");\n");
        }
    };
    return EvtInstruction;
}());
var InsInstruction = /** @class */ (function () {
    function InsInstruction(node, parent, idx, view, iFlag) {
        this.node = node;
        this.idx = idx;
        this.view = view;
        this.iFlag = iFlag;
        // manage @content built-in decorator
        var gc = this.view.gc;
        gc.imports['ζins' + getIhSuffix(iFlag)] = 1;
        if (parent.kind !== "#element" && parent.kind !== "#fragment") {
            gc.error("@content can only be used on elements or fragments", node);
        }
        if (parent.content && parent.content.length) {
            gc.error("@content can only be used on empty elements or fragments", node);
        }
    }
    InsInstruction.prototype.pushCode = function (body) {
        // e.g. ζcont(ζ, 2, 0, ζe(ζ, 0, $content));
        var v = this.view, d = this.node, gc = this.view.gc;
        if (d.isOrphan || !d.defaultPropValue) {
            if (gc.templateArgs.indexOf("$") < 0 && gc.templateArgs.indexOf("$content") < 0) {
                gc.error("$ or $content must be defined as template arguments to use @content with no values", d);
            }
        }
        else if (this.node.defaultPropValue && this.node.defaultPropValue.kind !== "#expression") {
            gc.error("@content value cannot be a " + this.node.defaultPropValue.kind, d);
        }
        else if (this.node.defaultPropValue && this.node.defaultPropValue.kind === "#expression" && this.node.defaultPropValue.oneTime) {
            gc.error("@content expression cannot use one-time qualifier", d);
        }
        body.push("" + v.indent + funcStart("ins", this.iFlag) + v.jsVarName + ", " + this.iFlag + ", " + this.idx + ", ");
        if (d.isOrphan || !d.defaultPropValue) {
            body.push("$, 1);\n");
        }
        else {
            generateExpression(body, this.node.defaultPropValue, this.view, this.iFlag);
            body.push(");\n");
        }
    };
    return InsInstruction;
}());
function parseBinding(code) {
    var hostExp = "", propExp = "", errorMsg = "";
    // todo: proper parsing
    if (code.match(/(.*)\.([a-zA-Z_][a-zA-Z_0-9]*)$/)) {
        hostExp = RegExp.$1;
        propExp = '"' + RegExp.$2 + '"';
    }
    else {
        errorMsg = "Invalid binding expression: {=" + code + "}";
    }
    return { hostExp: hostExp, propExp: propExp, errorMsg: errorMsg };
}

var LOG = "log", RX_IGNORE_COMMENT = /\/\/\s*trax:\s*ignore/i, SK = SyntaxKind;
function getSymbols(symbols) {
    var Data = "Data", ref = "ref", computed = "computed";
    if (!symbols) {
        return { Data: Data, ref: ref, computed: computed };
    }
    else {
        return {
            Data: symbols.Data || Data,
            ref: symbols.ref || ref,
            computed: symbols.computed || computed
        };
    }
}
function parse$2(src, filePath, options) {
    var SYMBOLS = getSymbols(options ? options.symbols : undefined);
    if (!isTraxFile(src))
        return null;
    var srcFile = createSourceFile(filePath, src, ScriptTarget.Latest, /*setParentNodes */ true);
    var result = [];
    var diagnostics = srcFile['parseDiagnostics'];
    if (diagnostics && diagnostics.length) {
        var d = diagnostics[0];
        var info = getLineInfo(src, d.start || -1);
        throw {
            kind: "#Error",
            origin: "TS",
            message: d.messageText.toString(),
            line: info.lineNbr,
            column: info.columnNbr,
            lineExtract: info.lineContent.trim(),
            file: filePath
        };
    }
    else {
        // process all parts
        scan(srcFile);
    }
    return result;
    function error(message, node) {
        var info = getLineInfo(src, node.pos);
        throw {
            kind: "#Error",
            origin: "TRAX",
            message: message,
            line: info.lineNbr,
            column: info.columnNbr,
            lineExtract: info.lineContent.trim(),
            file: filePath
        };
    }
    function scan(node) {
        if (processNode(node)) {
            forEachChild(node, scan);
        }
    }
    function processNode(node) {
        if (!result)
            return false;
        if (node.kind === SK.ImportClause) {
            processImport(node);
            return false;
        }
        else if (node.kind === SK.ClassDeclaration) {
            processClass(node);
            return false;
        }
        return true;
    }
    function isTraxFile(source) {
        return (!source.match(RX_IGNORE_COMMENT) && source.indexOf("@" + SYMBOLS.Data) > -1);
    }
    function processImport(node) {
        if (node.namedBindings) {
            var nmi = node.namedBindings;
            if (nmi.elements) {
                var idx = nmi.elements.length, traxImport = void 0;
                while (idx--) {
                    if (nmi.elements[idx].name.text === SYMBOLS.Data) {
                        traxImport = {
                            kind: "import",
                            pos: nmi.elements[idx].pos,
                            insertPos: nmi.elements[idx].end,
                            values: {}
                        };
                        break;
                    }
                }
                if (traxImport) {
                    idx = nmi.elements.length;
                    while (idx--) {
                        traxImport.values[nmi.elements[idx].name.text] = 1;
                    }
                    result.push(traxImport);
                }
            }
        }
    }
    function processClass(node) {
        var isData = false, decoPos = 0, printLogs = false;
        if (node.decorators) {
            var decorators = node.decorators, idx = decorators.length, d = void 0;
            while (idx--) {
                d = decorators[idx];
                if (d.expression.kind === SK.Identifier) {
                    if (d.expression.getText() === SYMBOLS.Data) {
                        isData = true;
                        decoPos = d.expression.pos - 1;
                        // comment the dataset expression to remove it from generated code (and don't impact line numbers)
                        // this.insert("/* ", d.expression.pos - 1);
                        // this.insert(" */", d.expression.end);
                    }
                    else if (d.expression.getText() === LOG) {
                        printLogs = true;
                    }
                }
            }
        }
        if (!isData)
            return;
        if (!node.name) {
            error("Data class name must be defined", node);
        }
        var obj = {
            kind: "data",
            pos: node.pos,
            decoPos: decoPos,
            className: node.name.text,
            classNameEnd: node.name.end,
            log: printLogs,
            members: []
        };
        if (node.members) {
            var members = node.members, canBeUndefined_1;
            var _loop_1 = function (i, len) {
                canBeUndefined_1 = false;
                var m = members[i];
                // processedPropData = this.processProcessorDecorator(m);
                if (m.kind === SK.Constructor) {
                    error("Constructors are not authorized in Data objects", m["body"] || m);
                }
                else if (m.kind === SK.GetAccessor) {
                    // check @computed properties
                    if (m.decorators && m.decorators.length === 1) {
                        if (m.decorators[0].getText() === "@computed")
                            return "continue";
                    }
                    error("Unsupported Data accessor", m);
                }
                else if (m.kind === SK.MethodDeclaration) {
                    if (options && options.acceptMethods)
                        return "continue";
                    error("Methods cannot be defined in this object", m);
                }
                else if (m.kind !== SK.PropertyDeclaration) {
                    error("Invalid Data object member [kind: " + m.kind + "]", m);
                }
                // add $$ in front of the property name
                var prop = {
                    kind: "property",
                    name: "",
                    namePos: 0,
                    end: m.end,
                    shallowRef: hasRefDecorator(m),
                    type: undefined,
                    defaultValue: undefined
                };
                m.forEachChild(function (c) {
                    if (c.kind === SK.Identifier) {
                        prop.name = c.getText();
                        prop.namePos = c.end - prop.name.length;
                    }
                    else if (c.kind === SK.QuestionToken) {
                        canBeUndefined_1 = true;
                    }
                    else {
                        var tp = getTypeObject(c, false);
                        if (tp) {
                            prop.type = tp;
                        }
                        else if (!handleDefaultValue(c, prop) && c.kind !== SK.Decorator) {
                            if (c.kind === SK.CallExpression || c.kind === SK.NewExpression) {
                                prop.defaultValue = {
                                    pos: c.pos,
                                    end: c.end,
                                    text: c.getText(),
                                    fullText: c.getFullText(),
                                    isComplexExpression: true
                                };
                            }
                            else if (c.kind === SK.FunctionType) {
                                prop.type = { kind: "any" };
                            }
                            else if (c.kind !== SK.Parameter && c.getText() !== "any") {
                                // console.log(c.getText(), c);
                                error("Unsupported Syntax [" + c.kind + "]", c);
                            }
                        }
                    }
                });
                if (!prop.type) {
                    prop.type = { kind: "any" };
                }
                if (canBeUndefined_1) {
                    prop.type.canBeUndefined = true;
                }
                {
                    obj.members.push(prop);
                }
            };
            for (var i = 0, len = members.length; len > i; i++) {
                _loop_1(i, len);
            }
        }
        result.push(obj);
    }
    function hasRefDecorator(m) {
        if (m.decorators) {
            var decorators = m.decorators, idx = decorators.length, d = void 0;
            while (idx--) {
                d = decorators[idx];
                var e = d.expression;
                if (e.getText() === SYMBOLS.ref)
                    return true;
            }
        }
        return false;
    }
    function getTypeObject(n, raiseErrorIfInvalid, canBeUnion) {
        if (raiseErrorIfInvalid === void 0) { raiseErrorIfInvalid = false; }
        if (canBeUnion === void 0) { canBeUnion = true; }
        if (n) {
            if (n.kind === SK.ParenthesizedType) {
                var count_1 = 0, childNd_1;
                n.forEachChild(function (c) {
                    count_1++;
                    childNd_1 = c;
                });
                if (childNd_1 && count_1 === 1) {
                    n = childNd_1;
                }
                else {
                    error("Unsupported parenthesized type", n);
                }
            }
            if (n.kind === SK.AnyKeyword) {
                return { kind: "any" };
            }
            if (n.kind === SK.StringKeyword) {
                return { kind: "string" };
            }
            else if (n.kind === SK.BooleanKeyword) {
                return { kind: "boolean" };
            }
            else if (n.kind === SK.NumberKeyword) {
                return { kind: "number" };
            }
            else if (n.getText() === "Function") {
                return { kind: "any" };
            }
            else if (n.kind === SK.TypeReference) {
                if (options && options.interfaceTypes
                    && options.interfaceTypes.indexOf(n.getText()) > -1) {
                    return { kind: "any" };
                }
                return {
                    kind: "reference",
                    identifier: n.getText()
                };
            }
            else if (n.kind === SK.ArrayType) {
                return {
                    kind: "array",
                    itemType: getTypeObject(n["elementType"], true, true)
                };
            }
            else if (n.kind === SK.TypeLiteral) {
                // expected to be something like dict: { [key: string]: Address }
                var members = n.members;
                if (members && members.length === 1 && members[0].kind === SK.IndexSignature) {
                    var idxSignature = members[0], parameters = idxSignature.parameters;
                    if (parameters && parameters.length === 1) {
                        var tp = getTypeObject(parameters[0].type);
                        return {
                            kind: "dictionary",
                            itemType: tp
                        };
                    }
                }
            }
            else if (canBeUnion && n.kind === SK.UnionType) {
                // types should be either undefined or DataNode types
                var ut = n, canBeNull = false, canBeUndefined = false;
                if (ut.types) {
                    var idx = ut.types.length, dt = null;
                    while (idx--) {
                        var tp = ut.types[idx];
                        if (tp.kind === SK.NullKeyword) {
                            canBeNull = true;
                        }
                        else if (tp.kind === SK.UndefinedKeyword) {
                            canBeUndefined = true;
                        }
                        else {
                            dt = getTypeObject(tp, false, false);
                            if (!dt) {
                                error("Invalid value in union type", tp);
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
            // console.log("Unsupported type", n)
            error("Unsupported type", n);
        }
        return null;
    }
    function handleDefaultValue(n, prop) {
        if (n) {
            var kind = "", complexExpr = false;
            if (n.kind === SK.StringLiteral) {
                kind = "string";
            }
            else if (n.kind === SK.NumericLiteral) {
                kind = "number";
            }
            else if (n.kind === SK.PrefixUnaryExpression || n.kind === SK.PostfixUnaryExpression) {
                var operand = n.operand;
                if (operand.kind === SK.NumericLiteral) {
                    kind = "number";
                }
                else if (operand.kind === SK.Identifier) {
                    kind = "any";
                }
                complexExpr = true;
            }
            else if (n.kind === SK.TrueKeyword || n.kind === SK.FalseKeyword) {
                kind = "boolean";
            }
            else if (n.kind === SK.ArrayLiteralExpression) {
                kind = "any";
                complexExpr = true;
            }
            else if (n.kind === SK.NullKeyword || n.kind === SK.UndefinedKeyword) {
                if (prop.type && prop.type.kind) {
                    kind = prop.type.kind;
                }
                else {
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
                };
                if (!prop.type) {
                    prop.type = {
                        kind: kind
                    };
                }
                return true;
            }
        }
        return false;
    }
}
function getLineInfo(src, pos) {
    var lines = src.split("\n"), lineLen = 0, posCount = 0, idx = 0;
    if (pos > -1) {
        while (idx < lines.length) {
            lineLen = lines[idx].length;
            if (posCount + lineLen < pos) {
                // continue
                idx++;
                posCount += lineLen + 1; // +1 for carriage return
            }
            else {
                // stop
                return {
                    lineNbr: idx + 1,
                    lineContent: lines[idx],
                    columnNbr: 1 + pos - posCount
                };
            }
        }
    }
    return {
        lineNbr: 0,
        lineContent: "",
        columnNbr: 0
    };
}

var PRIVATE_PREFIX = "ΔΔ", CLASS_DECO = "ΔD", RX_LOG$1 = /\/\/\s*trax\:\s*log/, RX_NULL_TYPE = /\|\s*null$/, SEPARATOR = "----------------------------------------------------------------------------------------------------";
function generate$1(src, filePath, options) {
    var symbols = getSymbols(options ? options.symbols : undefined), libPrefix = options ? (options.libPrefix || "") : "", logErrors = options ? (options.logErrors !== false) : true;
    var output = src, outputShift = 0, ast, traxImport, importList = [], // list of new imports
    importDict, importDictForced = {};
    try {
        ast = parse$2(src, filePath, {
            symbols: symbols,
            acceptMethods: options ? options.acceptMethods : false,
            interfaceTypes: options ? options.interfaceTypes : undefined
        });
        if (ast && ast.length) {
            initImports(ast);
            var len = ast.length;
            for (var i = 1; len > i; i++) {
                if (ast[i].kind === "import") {
                    error("Duplicate Data import", ast[i]);
                }
                else {
                    processDataObject(ast[i]);
                }
            }
            updateImports();
        }
    }
    catch (e) {
        if (logErrors) {
            var err = e, msg = void 0;
            if (err.kind === "#Error") {
                var ls = "  >  ";
                msg = ls + " " + err.origin + ": " + e.message + "\n"
                    + (ls + " File: " + e.file + " - Line " + e.line + " / Col " + e.column + "\n")
                    + (ls + " Extract: >> " + e.lineExtract + " <<");
            }
            else {
                msg = e.message || e;
            }
            console.error("\n" + SEPARATOR + "\n" + msg + "\n" + SEPARATOR);
        }
        throw e;
    }
    if (src.match(RX_LOG$1)) {
        console.log(SEPARATOR);
        console.log("Trax Output:");
        console.log(output);
    }
    return output;
    function error(msg, node) {
        if (node === void 0) { node = null; }
        var info = getLineInfo(src, node ? node["pos"] || node["namePos"] || -1 : -1);
        throw {
            kind: "#Error",
            origin: "TRAX",
            message: msg,
            line: info.lineNbr,
            column: info.columnNbr,
            lineExtract: info.lineContent.trim(),
            file: filePath
        };
    }
    function initImports(ast) {
        if (ast[0].kind !== "import") {
            error("@" + symbols.Data + " import not found", null);
            return; // not reachable as error throws
        }
        traxImport = ast[0];
        importDict = traxImport.values;
    }
    function addImport(symbol, force) {
        if (force === void 0) { force = false; }
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
    function insert(text, position) {
        // console.log("insert at", position, ": ", text);
        var pos = position + outputShift;
        if (output) {
            output = output.slice(0, pos) + text + output.slice(pos);
            outputShift += text.length;
        }
    }
    function replace(str1, str2, position) {
        var pos = position + outputShift;
        if (output) {
            output = output.slice(0, pos) + str2 + output.slice(pos + str1.length);
            outputShift += str2.length - str1.length;
        }
    }
    function replaceRegExp(rx, str, position) {
        var pos = position + outputShift, output1 = output.slice(0, pos), len1 = output1.length, output2 = output1.replace(rx, str);
        // console.log("-----")
        // console.log("output1",output1+"<<")
        // console.log("output2",output2+"<<")
        // console.log("shift", output2.length - len1)
        outputShift += output2.length - len1;
        output = output2 + output.slice(pos);
    }
    function endsWithSemiColon(position) {
        var pos = position + outputShift;
        if (output && output.slice(0, pos).match(/\;\s*$/)) {
            return true;
        }
        return false;
    }
    function processDataObject(n) {
        // transform @Data decorator -> @ΔD()
        if (!options || options.replaceDataDecorator !== false) {
            replace("@" + symbols.Data, getClassDecorator(libPrefix), n.decoPos);
            addImport(libPrefix + CLASS_DECO, true);
        }
        else {
            addImport(symbols.Data, true);
        }
        var len = n.members.length, prop, m, tp, defaultValues = [], lastInsertPos = -1;
        for (var i = 0; len > i; i++) {
            m = n.members[i];
            if (m.kind === "property") {
                try {
                    prop = m;
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
                            defaultValues.push("case \"" + prop.name + "\": return " + prop.defaultValue.text);
                        }
                    }
                    else {
                        error("Untyped property are not supported", n);
                    }
                }
                catch (ex) {
                    error(ex.message, n);
                }
            }
            if (options && options.validator) {
                var errMsg = options.validator(m);
                if (errMsg) {
                    error(errMsg, m);
                }
            }
        }
        if (defaultValues.length && lastInsertPos > -1) {
            // build default value function
            addImport(libPrefix + "Δu");
            insert(" \u0394Default(n) {switch (n) {" + defaultValues.join("; ") + "}; return " + libPrefix + "\u0394u;};", lastInsertPos);
        }
    }
    function getClassDecorator(libPrefix) {
        if (libPrefix === void 0) { libPrefix = ""; }
        return "@" + libPrefix + CLASS_DECO;
    }
    function propertyDefinition(m, includePrivateDefinition) {
        if (includePrivateDefinition === void 0) { includePrivateDefinition = true; }
        var tp = m.type, _a = getTypeInfo(tp), typeRef = _a.typeRef, factory = _a.factory, privateDef = "", nullUndefinedArg = "", questionSymbol = "";
        if (tp && (tp.canBeNull || tp.canBeUndefined)) {
            if (tp.canBeNull && tp.canBeUndefined) {
                questionSymbol = "?";
                nullUndefinedArg = ", 3";
            }
            else if (tp.canBeUndefined) {
                questionSymbol = "?";
                nullUndefinedArg = ", 2";
            }
            else {
                nullUndefinedArg = ", 1";
            }
        }
        if (includePrivateDefinition) {
            privateDef = "" + PRIVATE_PREFIX + m.name + ": " + typeRef + "; ";
        }
        if (nullUndefinedArg) {
            factory = factory || "0"; // factory arg cannot be empty if second argument is passed
        }
        addImport(libPrefix + "Δp");
        var dv = '';
        if (m.defaultValue && m.defaultValue.isComplexExpression) {
            dv = " = " + m.defaultValue.text;
        }
        return privateDef + "@" + libPrefix + "\u0394p(" + factory + nullUndefinedArg + ") " + m.name + questionSymbol + ": " + typeRef + dv + ";";
    }
    function getTypeInfo(tp) {
        var typeRef = "", factory = "";
        if (!tp) {
            return { typeRef: "any", factory: "" };
        }
        if (tp.kind === "any") {
            typeRef = "any";
            factory = "";
        }
        else if (tp.kind === "string") {
            typeRef = "string";
            factory = libPrefix + "ΔfStr";
            addImport(factory);
        }
        else if (tp.kind === "number") {
            typeRef = "number";
            factory = libPrefix + "ΔfNbr";
            addImport(factory);
        }
        else if (tp.kind === "boolean") {
            typeRef = "boolean";
            factory = libPrefix + "ΔfBool";
            addImport(factory);
        }
        else if (tp.kind === "reference") {
            typeRef = tp.identifier;
            factory = libPrefix + "Δf(" + typeRef + ")";
            addImport(libPrefix + "Δf");
        }
        else if (tp.kind === "array") {
            if (tp.itemType) {
                var info = getTypeInfo(tp.itemType);
                if (info.typeRef.match(RX_NULL_TYPE)) {
                    typeRef = "(" + info.typeRef + ")[]";
                }
                else {
                    typeRef = info.typeRef + "[]";
                }
                factory = libPrefix + "Δlf(" + info.factory + ")";
                addImport(libPrefix + "Δlf");
            }
            else {
                throw new Error("Item type must be specified in Arrays");
            }
        }
        else {
            throw new Error("Generator doesn't support type " + tp.kind + " yet");
        }
        if (tp.canBeNull) {
            typeRef += " | null";
        }
        return { typeRef: typeRef, factory: factory };
    }
}

var U = undefined, NO_VALUE = { kind: "#ref", identifier: "" }, RX_TEXT_SPECIALS = /(\<|\!|\/)/g, RX_CDATA_SPECIALS = /\<\/\!cdata\>/g;
// -------------------------------------------------------------------------------------
// Tree API to dynamically create an XTR tree and bypass the XTR parser
function createXtrFragment(root, pos) {
    if (root === void 0) { root = true; }
    if (pos === void 0) { pos = -1; }
    return new XFragment(root, pos);
}
function createXtrElement(kind, name, nameRef, pos) {
    if (pos === void 0) { pos = -1; }
    return new XElement(kind, name, nameRef, pos);
}
function createXtrCData(content, pos) {
    if (pos === void 0) { pos = -1; }
    return new XCData(content, pos);
}
function createXtrText(text, pos) {
    if (pos === void 0) { pos = -1; }
    return new XText(text, pos);
}
function addElement(parent, name, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXtrElement("#element", name, U, pos));
}
function addComponent(parent, ref, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXtrElement("#component", U, ref.identifier, pos));
}
function addFragment(parent, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXtrFragment(false, pos));
}
function addCData(parent, content, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXtrCData(content, pos));
}
function addParamNode(parent, name, pos) {
    if (pos === void 0) { pos = -1; }
    return pushChild(parent, createXtrElement("#paramNode", name, U, pos));
}
function addText(parent, text, pos) {
    if (pos === void 0) { pos = -1; }
    pushChild(parent, createXtrText(text, pos));
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
                buf.push("='" + encodeText$1("" + p.value) + "'");
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
function encodeText$1(t) {
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

var U$1 = undefined, CDATA = "cdata", CDATA_LENGTH = CDATA.length, CDATA_END = "</!cdata>", CDATA_END_LENGTH = CDATA_END.length, CHAR_BOS = -1, // beginning of string
CHAR_EOS = -2, // end of string
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
ESCAPED_CHARS = {
    "33": CHAR_BANG,
    "47": CHAR_FSLA,
    "60": CHAR_LT,
    "110": CHAR_NL,
    "115": CHAR_NBSP // !s
}, RX_TRAILING_SPACES = /[ \t\r\f\n]+$/;
// parse generates an XtrFragment (XTR tree)
function parse$3(xtr, context) {
    return __awaiter(this, void 0, void 0, function () {
        function moveNext() {
            return shiftNext(1);
        }
        function shiftNext(length) {
            pos += length;
            pcc = cc; // pcc is used to manage escaped chars
            return cc = pos < posEOS ? xtr.charCodeAt(pos) : CHAR_EOS;
        }
        function nextCharCode() {
            return pos + 1 < posEOS ? xtr.charCodeAt(pos + 1) : CHAR_EOS;
        }
        function nextChars(length) {
            return pos + length < posEOS ? xtr.substr(pos, length) : "";
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
        function xtrContent(parent) {
            return __awaiter(this, void 0, void 0, function () {
                var keepGoing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            keepGoing = true;
                            _a.label = 1;
                        case 1:
                            if (!keepGoing) return [3 /*break*/, 3];
                            return [4 /*yield*/, xtrElement(parent)];
                        case 2:
                            if (!(_a.sent()) && !xtrText(parent)) {
                                keepGoing = false;
                            }
                            return [3 /*break*/, 1];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        function xtrText(parent) {
            // return true if blank spaces or text characters have been found
            if ((cc === CHAR_LT && pcc !== CHAR_BANG) || cc === CHAR_EOS)
                return false;
            var spacesFound = xtrSpaces(), startPos = pos;
            if (cc !== CHAR_LT && cc !== CHAR_EOS) {
                var charCodes = [];
                if (spacesFound) {
                    charCodes[0] = CHAR_SPACE; // leading spaces are transformed in a single space
                }
                var lastIsSpace = spacesFound;
                while (cc !== CHAR_LT && cc !== CHAR_EOS) {
                    eatComments();
                    // capture string
                    if (cc === CHAR_BANG) {
                        // escaped chars
                        var newPcc = pcc;
                        cc = eat(CHAR_BANG); // !
                        var escValue = ESCAPED_CHARS["" + cc];
                        if (escValue !== U$1) {
                            lastIsSpace = (cc === CHAR_s || cc === CHAR_n);
                            moveNext();
                            charCodes.push(escValue);
                            pcc = newPcc;
                        }
                        else {
                            charCodes.push(CHAR_BANG);
                            lastIsSpace = false;
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
        function xtrSpaces() {
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
        function xtrElement(parent) {
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
                            return [4 /*yield*/, xtrCData(parent)];
                        case 1:
                            if (_a.sent()) {
                                return [2 /*return*/, true];
                            }
                            eltOrFragment = addFragment(parent, pos);
                            return [3 /*break*/, 3];
                        case 2:
                            name = xtrIdentifier(true, prefix === 0);
                            eltOrFragment = createElement();
                            _a.label = 3;
                        case 3:
                            ppDataList = null;
                            if (!xtrSpaces()) return [3 /*break*/, 6];
                            return [4 /*yield*/, xtrParams(eltOrFragment, parent, endParamReached)];
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
                            return [4 /*yield*/, xtrContent(eltOrFragment)];
                        case 8:
                            // parse element content
                            _a.sent();
                            // parse end of element
                            eat(CHAR_LT); // <
                            eat(CHAR_FSLA); // /
                            endPos = pos;
                            p1 = prefix, p2 = eatPrefix(), name2 = xtrIdentifier(false);
                            if (name2 === "" && p2 === 0 && CHAR_BANG === cc) {
                                eat(CHAR_BANG); // end of fragment !
                            }
                            else if (name2 !== "" || p2 !== 0) {
                                // end tag name is provided
                                if (p1 !== p2 || (name2 !== "" && name2 !== name)) {
                                    error('End tag </' + eltName(p2, name2) + '> doesn\'t match <' + eltName(p1, name) + '>', endPos);
                                }
                            }
                            xtrSpaces();
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
                            if (msg.match(/^XTR\:/)) {
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
        function xtrCData(parent) {
            return __awaiter(this, void 0, void 0, function () {
                var startPos, cdata, ppDataList, charCodes, processing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(CDATA === nextChars(CDATA_LENGTH))) return [3 /*break*/, 6];
                            startPos = pos;
                            shiftNext(CDATA_LENGTH);
                            cdata = addCData(parent, "", pos), ppDataList = null;
                            if (!xtrSpaces()) return [3 /*break*/, 3];
                            return [4 /*yield*/, xtrParams(cdata, parent, endParamReached)];
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
                                else if (cc === CHAR_BANG) {
                                    // ! -> escape sequence
                                    moveNext();
                                    if (CDATA_END === nextChars(CDATA_END_LENGTH)) {
                                        // we escape end of cdata
                                        charCodes.push(cc);
                                        moveNext();
                                    }
                                    else {
                                        // push the backslash
                                        charCodes.push(CHAR_BANG);
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
        function xtrIdentifier(mandatory, acceptDashes) {
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
                error("Invalid XTR identifier");
            }
            if (charCodes.length === 0)
                return "";
            return String.fromCharCode.apply(null, charCodes);
        }
        function xtrParams(parent, grandParent, endReached) {
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
                                    error("Pre-processors cannot be used on pre-processors: check @@" + xtrIdentifier(true, false), errorPos);
                                }
                                ppData = {
                                    kind: "#preprocessorData",
                                    name: "",
                                    pos: pos - 2 // to be before the '@@' prefix
                                };
                            }
                            name_1 = xtrIdentifier(true, prefix === 0), isProperty = false;
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
                            spacesFound = xtrSpaces();
                            if (!(cc === CHAR_EQ)) return [3 /*break*/, 2];
                            // look for value
                            eat(CHAR_EQ);
                            xtrSpaces();
                            if (ppData !== null) {
                                registerParam("value", ppData, xtrParamValue());
                            }
                            else {
                                registerParam(name_1, ppData, xtrParamValue(), isProperty);
                            }
                            if (!xtrSpaces()) {
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
                            xtrSpaces();
                            return [4 /*yield*/, xtrParams(d, parent, endDecoParamReached)];
                        case 3:
                            r = _a.sent();
                            eat(CHAR_PARE); // ) parens end
                            if (!xtrSpaces()) {
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
        function xtrParamValue() {
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
                xtrSpaces();
                var refName = xtrIdentifier(true, false);
                xtrSpaces();
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
                    xtrSpaces();
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
            var lines = xtr.split("\n"), lineLen = 0, posCount = 0, idx = 0, lineNbr = lines.length, columnNbr = lines[lineNbr - 1].length;
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
            var lineNbrMsg = lineNbr;
            if (context) {
                lineNbrMsg += context.line1 !== undefined ? context.line1 - 1 : 0;
                if (lineNbr === 1) {
                    columnNbr += context.col1 !== undefined ? context.col1 - 1 : 0;
                }
            }
            if (msg === U$1) {
                msg = "Invalid character: " + charName(cc);
            }
            throw "XTR: " + msg + "\nLine " + lineNbrMsg + " / Col " + columnNbr + fileInfo + "\nExtract: >> " + lines[lineNbr - 1].trim() + " <<";
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
        var xf, posEOS, pos, cc, pcc, ppContext, currentPpName, currentPpPos, globalPreProcessors, ppFactories, preProcessors, ppDataList, _i, globalPreProcessors_1, pp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    xf = createXtrFragment(), posEOS = xtr.length, pos = 0, cc = CHAR_EOS, pcc = CHAR_BOS, currentPpName = "", currentPpPos = 0, globalPreProcessors = context ? context.globalPreProcessors : U$1, ppFactories = context ? context.preProcessors || {} : {}, preProcessors = {};
                    if (!(posEOS > 0)) return [3 /*break*/, 6];
                    cc = xtr.charCodeAt(0);
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
                case 2: return [4 /*yield*/, xtrContent(xf)];
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

var SK$1 = SyntaxKind, TEMPLATE = "template", RX_START_WS = /^(\s*)/, RX_IGNORE_FILE = /[\n\s]*\/\/\s*iv:ignore/, RX_LOG_ALL = /\/\/\s*ivy?\:\s*log[\-\s]?all/, RX_LOG$2 = /\/\/\s*ivy?\:\s*log/, RX_BACK_TICK = /\`/g, RX_LIST = /List$/, IV_INTERFACES = ["IvContent", "IvTemplate", "IvLogger", "IvElement", "IvDocument"], CR$2 = "\n", XTR_NAME = "xtr", SEPARATOR$1 = "----------------------------------------------------------------------------------------------------";
function process(source, options) {
    return __awaiter(this, void 0, void 0, function () {
        function log(title, forceLog) {
            if (forceLog === void 0) { forceLog = false; }
            if (logAll || forceLog) {
                console.log(SEPARATOR$1);
                console.log(title);
                console.log(result);
            }
        }
        var ivyResult, result, logAll, resourcePath, e_1, err, msg, ls;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = "", logAll = !!source.match(RX_LOG_ALL);
                    resourcePath = options.filePath;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, compile(source, { filePath: resourcePath, preProcessors: options.preProcessors })];
                case 2:
                    // ivy processing
                    ivyResult = _a.sent();
                    result = ivyResult.fileContent;
                    log("Ivy: Template Processing");
                    // trax processing for ivy api classes
                    result = generate$1(result, resourcePath, {
                        symbols: { Data: "ζΔD", },
                        libPrefix: "ζ",
                        interfaceTypes: IV_INTERFACES,
                        validator: listValidator,
                        logErrors: false
                    });
                    log("Ivy: Generated Param Classes Processing");
                    // trax processing for ivy template API classes
                    result = generate$1(result, resourcePath, {
                        symbols: { Data: "API" },
                        acceptMethods: true,
                        replaceDataDecorator: false,
                        interfaceTypes: IV_INTERFACES,
                        libPrefix: "ζ",
                        logErrors: false
                    });
                    log("Ivy: API Classes Processing");
                    // trax processing for ivy template controller classes
                    result = generate$1(result, resourcePath, {
                        symbols: { Data: "Controller" },
                        acceptMethods: true,
                        replaceDataDecorator: false,
                        interfaceTypes: IV_INTERFACES,
                        libPrefix: "ζ",
                        logErrors: false
                    });
                    log("Ivy: Controller Classes Processing");
                    // trax processing for normal Data Objects
                    result = generate$1(result, resourcePath, {
                        interfaceTypes: IV_INTERFACES,
                        logErrors: false
                    });
                    log("Ivy: Generated Code", !!source.match(RX_LOG$2));
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    if (ivyResult && e_1.kind === "#Error") {
                        // shift line numbers
                        e_1.line = ivyResult.convertLineNbr(e_1.line);
                    }
                    if (options.logErrors !== false) {
                        err = e_1, msg = void 0;
                        if (err.kind === "#Error") {
                            ls = "  >  ";
                            msg = ls + " " + err.origin + ": " + e_1.message + "\n"
                                + (ls + " File: " + e_1.file + " - Line " + e_1.line + " / Col " + e_1.column + "\n")
                                + (ls + " Extract: >> " + e_1.lineExtract + " <<");
                        }
                        else {
                            msg = e_1.message || e_1;
                        }
                        console.error("\n" + SEPARATOR$1 + "\n" + msg + "\n" + SEPARATOR$1);
                        // if (result) {
                        //     console.log(`\n${SEPARATOR}`);
                        //     console.log("// Last code generation: " + resourcePath);
                        //     console.log(result)
                        //     console.log(`${SEPARATOR}`);
                        // }
                    }
                    throw e_1;
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
function listValidator(m) {
    if (m && m.type && m.type.kind === "array") {
        if (!m.name.match(RX_LIST)) {
            return "Array properties should use the List suffix, e.g. " + m.name + "List";
        }
    }
    return null;
}
function compile(source, pathOrOptions) {
    return __awaiter(this, void 0, void 0, function () {
        function error(msg) {
            throw {
                kind: "#Error",
                origin: "IVY",
                message: msg,
                line: 0,
                column: 0,
                lineExtract: "",
                file: filePath
            };
        }
        function scan(node) {
            checkNode(node);
            forEachChild(node, scan);
        }
        function checkNode(node) {
            if (node.kind === SK$1.ImportDeclaration) {
                // check for template import 
                var id = node, 
                // modulePath = id.moduleSpecifier.getText(),
                isTemplateImport_1 = false;
                if (id.importClause && id.importClause.namedBindings) {
                    id.importClause.namedBindings.forEachChild(function (nd) {
                        if (nd.kind === SK$1.ImportSpecifier && nd.name.getText() === TEMPLATE) {
                            isTemplateImport_1 = true;
                        }
                    });
                    if (isTemplateImport_1) {
                        id.importClause.namedBindings.forEachChild(function (nd) {
                            importIds[nd.getText()] = 1;
                        });
                    }
                }
                if (isTemplateImport_1) {
                    var txt = id.importClause.getFullText(), offset = 0;
                    if (txt.match(RX_START_WS)) {
                        offset = RegExp.$1.length;
                    }
                    importStart = id.importClause.pos + offset;
                    importEnd = id.importClause.end;
                }
            }
            else if (node.kind === SK$1.CallExpression) {
                // check if function is named template and if its argument is a template string
                var ce = node;
                if (ce.expression.getText() === TEMPLATE && ce.arguments.length >= 1 && ce.arguments[0].kind === SK$1.NoSubstitutionTemplateLiteral) {
                    var tpl = ce.arguments[0], txt = tpl.getText();
                    changes.push({
                        start: getNodePos(node),
                        end: node.end,
                        src: txt.substring(1, txt.length - 1),
                        type: 1 /* TEMPLATE */
                    });
                }
            }
            else if (node.kind === SK$1.TaggedTemplateExpression) {
                var tt = node, nbrOfArgs = 0;
                if (tt.tag.getText() === XTR_NAME) {
                    if (tt.template.getChildCount() > 1) {
                        nbrOfArgs = tt.template.getChildAt(1).getChildCount();
                    }
                    if (nbrOfArgs === 0) {
                        // this template has no arguments and can be statically analysed
                        changes.push({
                            start: getNodePos(node),
                            end: node.end,
                            src: tt.getText(),
                            type: 2 /* XTR */
                        });
                    }
                }
            }
        }
        function getNodePos(node) {
            return (node.getFullText().match(/^\s/)) ? node.pos + 1 : node.pos; // +1 to keep the first white space in the generated code
        }
        function generateNewFile(filePath) {
            return __awaiter(this, void 0, void 0, function () {
                function addSlice(newFragment, oldFragment) {
                    slices.push(newFragment);
                    var crs = newFragment.split(CR$2).length - 1;
                    carriageReturns.push(crs);
                    if (oldFragment === undefined) {
                        carriageReturns.push(crs);
                    }
                    else {
                        carriageReturns.push(oldFragment.split(CR$2).length - 1);
                    }
                }
                function getLineNbr(newLineNbr) {
                    var idx = 0, oldCRs = 0, newCRs = 0, newCount = 0, oldCount = 0, target = newLineNbr - 1;
                    while (idx < carriageReturns.length) {
                        newCRs = carriageReturns[idx];
                        oldCRs = carriageReturns[idx + 1];
                        if (newCount + newCRs < target) {
                            newCount += newCRs;
                            oldCount += oldCRs;
                        }
                        else {
                            return 1 + oldCount + target - newCount;
                        }
                        idx += 2;
                    }
                    return newLineNbr;
                }
                var slices, pos, carriageReturns, paths, len, chg, lastSlice, colOffset, tplName, i, r, li, _a, imp, k;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!changes.length) {
                                return [2 /*return*/, { fileContent: source, convertLineNbr: sameLineNbr }];
                            }
                            slices = [], pos = 0, carriageReturns = [];
                            // part before import
                            addSlice(source.substring(0, importStart));
                            // import section
                            addSlice("", source.substring(importStart, importEnd)); // "" will be replaced after the template processing
                            pos = importEnd;
                            paths = filePath.split(/\/|\\/);
                            if (paths.length > 2) {
                                filePath = paths[paths.length - 2] + "/" + paths[paths.length - 1];
                            }
                            len = changes.length, tplName = "";
                            i = 0;
                            _b.label = 1;
                        case 1:
                            if (!(len > i)) return [3 /*break*/, 7];
                            chg = changes[i];
                            addSlice(source.substring(pos, chg.start)); //+ 1
                            lastSlice = slices[slices.length - 1];
                            colOffset = lastSlice.length - lastSlice.lastIndexOf(CR$2);
                            if (!(chg.type === 1 /* TEMPLATE */)) return [3 /*break*/, 3];
                            if (importStart < 0) {
                                error("Missing 'template' import statement");
                            }
                            colOffset += 9; // 9 = length of "template("
                            if (lastSlice.match(/(\$?\w+)[\s\n]*\=[\s\n]*$/)) {
                                tplName = RegExp.$1;
                            }
                            else {
                                tplName = "";
                            }
                            return [4 /*yield*/, compileTemplate(chg.src, { templateName: tplName, function: true, importMap: importIds, filePath: filePath, lineOffset: getLineNumber(chg.start + 1) - 1, columnOffset: colOffset })];
                        case 2:
                            r = _b.sent();
                            addSlice(r.function, chg.src);
                            return [3 /*break*/, 5];
                        case 3:
                            li = getLineInfo$1(source, chg.start);
                            // try {
                            _a = addSlice;
                            return [4 /*yield*/, processXtrString(chg.src, filePath, li.lineNbr, li.columnNbr, preProcessors)];
                        case 4:
                            // try {
                            _a.apply(void 0, [_b.sent(), chg.src]);
                            _b.label = 5;
                        case 5:
                            pos = chg.end;
                            _b.label = 6;
                        case 6:
                            i++;
                            return [3 /*break*/, 1];
                        case 7:
                            // last part
                            addSlice(source.substring(pos));
                            // import insertion
                            if (importStart > -1) {
                                imp = [];
                                for (k in importIds)
                                    if (importIds.hasOwnProperty(k)) {
                                        imp.push(k);
                                    }
                                slices[1] = '{ ' + imp.join(", ") + ' }'; // new import
                            }
                            return [2 /*return*/, { fileContent: slices.join(""), convertLineNbr: getLineNbr }];
                    }
                });
            });
        }
        function getLineNumber(pos) {
            var src2 = source.substring(0, pos);
            return src2.split("\n").length;
        }
        function sameLineNbr(newLineNbr) {
            return newLineNbr;
        }
        var filePath, preProcessors, srcFile, importStart, importEnd, importIds, changes, diagnostics, d, info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // ignore files starting with iv:ignore comment
                    if (source.match(RX_IGNORE_FILE))
                        return [2 /*return*/, { fileContent: source, convertLineNbr: sameLineNbr }];
                    filePath = (typeof pathOrOptions === "string") ? pathOrOptions : pathOrOptions.filePath;
                    preProcessors = (typeof pathOrOptions === "string") ? undefined : pathOrOptions.preProcessors;
                    srcFile = createSourceFile(filePath, source, ScriptTarget.ES2015, /*setParentNodes */ true);
                    importStart = -1, importEnd = 0, importIds = {}, changes = [];
                    diagnostics = srcFile['parseDiagnostics'];
                    if (diagnostics && diagnostics.length) {
                        d = diagnostics[0];
                        info = getLineInfo$1(source, d.start || -1);
                        throw {
                            kind: "#Error",
                            origin: "TS",
                            message: d.messageText.toString(),
                            line: info.lineNbr,
                            column: info.columnNbr,
                            lineExtract: info.lineContent.trim(),
                            file: filePath
                        };
                    }
                    scan(srcFile);
                    return [4 /*yield*/, generateNewFile(filePath)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
/**
 * Return the new template string = e.g. '`<foo bar="blah"/>`'
 * @param src template string - e.g. 'xtr `<foo bar="blah" @@xyz/>`'
 */
function processXtrString(src, filePath, lineNbr, colNbr, preProcessors) {
    return __awaiter(this, void 0, void 0, function () {
        var xtr, ctxt, root;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    xtr = src.replace(/(^xtr\s*\`)|(\s*\`\s*$)/g, ""), ctxt = {
                        fileId: filePath,
                        preProcessors: preProcessors,
                        line1: lineNbr,
                        col1: colNbr
                    };
                    return [4 /*yield*/, parse$3(xtr, ctxt)];
                case 1:
                    root = _a.sent();
                    return [2 /*return*/, "`" + root.toString("", "", true, false).replace(RX_BACK_TICK, "\\`") + "`"];
            }
        });
    });
}
function getLineInfo$1(src, pos) {
    var lines = src.split("\n"), lineLen = 0, posCount = 0, idx = 0;
    if (pos > -1) {
        while (idx < lines.length) {
            lineLen = lines[idx].length;
            if (posCount + lineLen < pos) {
                // continue
                idx++;
                posCount += lineLen + 1; // +1 for carriage return
            }
            else {
                // stop
                return {
                    lineNbr: idx + 1,
                    lineContent: lines[idx],
                    columnNbr: 1 + pos - posCount
                };
            }
        }
    }
    return {
        lineNbr: 0,
        lineContent: "",
        columnNbr: 0
    };
}

function ivy(opts) {
    if (opts === void 0) { opts = {}; }
    if (!opts.include) {
        opts.include = '**/*.ts';
    }
    var filter = createFilter(opts.include, opts.exclude), preProcessors = opts.preProcessors;
    return {
        name: 'ivy',
        transform: function (code, fileId) {
            return __awaiter(this, void 0, void 0, function () {
                var result, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!filter(fileId))
                                return [2 /*return*/, null];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, process(code, { filePath: fileId, preProcessors: preProcessors })];
                        case 2:
                            result = _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            this.error(e_1.message || e_1);
                            return [2 /*return*/, null];
                        case 4: return [2 /*return*/, result];
                    }
                });
            });
        }
    };
}

export default ivy;
