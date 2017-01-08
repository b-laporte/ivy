/**
 * Created by blaporte on 19/12/16.
 */

import {NacAttributeNature, NacNodeType} from './nac';


export function compile(nacNode, exposeInternals = false, initIndentLevel = 1) {
    let pkg = new PkgCompiler();
    return pkg.compile(nacNode, exposeInternals, initIndentLevel);
}

const INDENT_SPACE = "    ", // 4 spaces
    ATT_STANDARD = NacAttributeNature.STANDARD,                         // 0 - e.g. foo="bar"
    ATT_BOUND1WAY = NacAttributeNature.BOUND1WAY,                       // 1 - e.g. [foo]=c.bar+3
    ATT_BOUND2WAYS = NacAttributeNature.BOUND2WAYS,                     // 2 - e.g. [[foo]]=c.bar
    ATT_DEFERRED_EXPRESSION = NacAttributeNature.DEFERRED_EXPRESSION,   // 3 - e.g. onclick()=c.doSomething()
    REGEXP_JS_LITERAL = /(^".*"$)|(^'.*'$)|(^true$)|(^false$)|(^\d+$)|(^\d+\.\d+$)/,
    REGEXP_FIRST_SPACES = /^\s+/,
    REGEXP_FIRST_SPACES_AFTER_NEW_LINE = /\n\s*/g,
    REGEXP_LIST_ATT = /.+List$/g,
    REGEXP_LIST_TYPE = /.+\[]$/g,
    REGEXP_IV_TYPE = /^Iv/,
    REGEXP_NEWLINES = /\n/g,
    REGEXP_DOUBLE_QUOTES = /"/g,
    REGEXP_QUOTED_STRING = /^"(.*)"$/;

/**
 * Common base to the Package and Function compilers
 */
class CompilerBase {
    indent;         // current indentation (e.g. "    ")
    baseIndent;     // current function indentation (used for statics)
    indentArray;    // current list of indents - used to calculate new indent - e.g. ["    ", "    "]
    nodeIdx;        // unique number associated to each node
    fnContent;      // array fragments of the JS function being generated
    statics;        // array of static data fragments (strings)
    entities;       // array of all the identifiers found in the current function scope
    exposeInternals;// boolean - true is internal data should be exposed (test purpose)
    entityScope;    // context object inheriting from parent context and containing properties for each entity in the current scope
    parentScope;    // parent entityScope
    lineNbrShift;   // shift to apply to all line numbers

    /**
     * Initialize common properties at the beginning of the compilation
     * and scan all entities associated to the node passed as argument
     */
    init(nd, exposeInternals, initIndent = INDENT_SPACE) {
        this.nodeIdx = 0;
        this.fnContent = [];
        this.statics = [];
        this.indent = initIndent;
        this.baseIndent = initIndent;
        this.indentArray = [initIndent];
        this.exposeInternals = exposeInternals;
        this.lineNbrShift = 0;

        let sc = {foundEntities: {}, entityList: []};
        this.scanEntities(nd, sc);

        this.entities = sc.entityList;
        let scope;
        if (!this.parentScope) {
            scope = this.entityScope = this.parentScope = {};
        } else {
            scope = this.entityScope = Object.create(this.parentScope, {});
        }
        for (let i = 0; this.entities.length > i; i++) {
            scope[this.entities[i]] = true;
        }
    }

    /**
     * Recursively scan all entities in the node list passed as argument
     * (i.e. nodes with an id associated to the current function scope)
     * @param ndList {NacNode} the node list to scan
     * @param scanContext a context object with 2 properties: foundEntities (Map) and entityList (array of ids)
     */
    scanEntities(ndList, scanContext) {
        let nd = ndList, m, id;
        while (nd) {

            // remove extra double-quote on id (
            if (nd.id) {
                nd.id = id = getIdValue(nd);
                if (scanContext.foundEntities[id]) {
                    throw "Same id cannot be used twice in the same function context";
                }
                scanContext.foundEntities[id] = true;
                scanContext.entityList.push(id);
            }

            // recursively scan child nodes if node is not a function
            if (nd.nodeName !== "function" && nd.firstChild) {
                this.scanEntities(nd.firstChild, scanContext);
            }

            nd = nd.nextSibling;
        }
    }

    /**
     * Recursively compile the child nodes of a given node
     * @param ndList the first element of the list
     * @param contextIdx the index of the parent element or data node
     */
    compileNodeList(ndList, contextIdx) {
        let nd = ndList;
        while (nd) {
            if (!this.compileCommonNode(nd, contextIdx)) {
                let errMsg = "[IvCompilerBase] Invalid node type: " + nd.nodeType;
                if (nd.nodeType === 1) {
                    errMsg = "[IvCompilerBase] Invalid node: " + nd.nodeName;
                }
                throw errMsg;
            }
            nd = nd.nextSibling;
        }
    }

    /**
     * Recursively compile the child nodes of a given node
     * @param nd the container node
     * @param contextIdx the index of the parent element or data node
     * @return Boolean true if a child node has been found
     */
    compileCommonNode(nd, contextIdx) {
        let ndt = nd.nodeType;

        if (ndt === NacNodeType.ELEMENT) {
            let nm = nd.nodeName;
            if (nm === "function") {
                this.compileFunctionNode(nd);
            } else if (nm === "type") {
                this.compileTypeNode(nd);
            } else {
                return false;
            }
        } else if (ndt === NacNodeType.JS_EXPRESSION) {
            this.compileJsExpression(nd);
        } else if (ndt === NacNodeType.JS_BLOCK) {
            this.compileJsBlock(nd, contextIdx);
        } else if (ndt === NacNodeType.COMMENT) {
            this.compileComment(nd);
        } else if (ndt === NacNodeType.COMMENT_ML) {
            this.compileCommentMl(nd);
        } else {
            return false;
        }
        return true;
    }

    /**
     * Compile the function nodes - can be at package root level or nested in another function
     * @param nd
     */
    compileFunctionNode(nd) {
        let idx = this.nodeIdx;
        this.nodeIdx++;

        let atts = sortEltNodeAttributes(nd.firstAttribute),
            ls = atts[ATT_STANDARD],
            fnName = "", argNames = [], argTypes = [], nm, argIdx = 0;

        if (ls) {
            for (let i = 0; ls.length > i; i++) {
                nm = ls[i].name;
                if (nm === "id") {
                    fnName = getIdValue(nd);
                    continue;
                }
                argNames[argIdx] = nm;
                argTypes[argIdx] = ls[i].typeRef;
                argIdx++;
            }
        }

        // TODO support optional function id
        if (fnName === "") {
            this.throwError(nd, "Missing function id"); // todo
        }

        let argListJs = "";
        if (argNames.length) {
            argListJs = ", " + argNames.join(", ");
        }

        // generate the function start instruction
        this.fnContent.push([this.indent, fnName, ' = $c.fn(', idx, ', function($c', argListJs, ') {'].join(''));

        let fc = new FunctionCompiler(this.parentScope);
        fc.compile(nd, this.exposeInternals, this.indent + INDENT_SPACE, argNames, argTypes);

        this.fnContent.push(fc.jsContent);

        this.fnContent.push([this.indent, '},[\n', fc.jsStatics, '\n', this.indent, ']);'].join(''));

    }

    /**
     * Compile a type definition node
     * @param nd
     */
    compileTypeNode(nd) {
        let id = nd.id;
        if (!id) {
            this.throwError(nd, "Missing type id"); // todo
        }

        let typeArgs = this.scanAttributes(nd).typeArgs;

        // e.g. Foo = $c.td(123, ["name", String], ["optionList", "option", String], "contentName", "contentList")
        this.fnContent.push([this.indent, id, ' = $c.td(', nd.lineNbr, ', ', typeArgs, ');'].join(''));
    }

    /**
     * Scan attributes and types and calculate the Js arguments corresponding to a type definition
     * e.g. '["name", String], ["optionList", "option", String], "contentName", "contentList"'
     * @param nd the node containing the type information (could be a type or a function node)
     * @returns Object with 2 properties: typeArgs (the Js arguments to put in the generated code)
     * and initInstructions (the initialization instructions)
     */
    scanAttributes(nd) {
        let nodeName = nd.nodeName;

        // scan attributes
        let atts = sortEltNodeAttributes(nd.firstAttribute), ls = atts[ATT_STANDARD];
        if (!atts) {
            this.throwError(nd, "Empty definition"); // we should not get here as "id" should be in the list
        }
        if (atts[ATT_BOUND1WAY] !== null || atts[ATT_BOUND2WAYS] !== null) {
            this.throwError(nd, "Bound attributes cannot be used on " + nodeName + " definitions"); // todo
        }
        if (atts && (atts[ATT_DEFERRED_EXPRESSION] !== null )) {
            this.throwError(nd, "Deferred expressions cannot be used on " + nodeName + " definitions"); // TODO check
        }

        let simpleAtts = [], listAtts = [], contentName = 0, contentList = 0, attName, attIndexes = {}, argInitInstructions = [];

        if (ls) {
            let att, tr, value;
            for (let i = 0; ls.length > i; i++) {
                att = ls[i];
                attName = att.name;
                tr = att.typeRef;
                value = att.value;
                if (attName === "id") {
                    continue;
                } else if (attIndexes[attName]) {
                    throw "Definition cannot contain multiple attributes with the same name"; // TODO check
                }
                if (value !== undefined && nodeName === "type") {
                    this.throwError(nd, "Type definition cannot contain default values");
                }
                attIndexes[attName] = true;
                if (attName.match(REGEXP_LIST_ATT)) {
                    // this is a list attribute
                    let itemName = attName.slice(0, -4);
                    listAtts.push('"' + attName + '"');
                    listAtts.push('"' + itemName + '"');

                    if (attIndexes[itemName]) {
                        this.throwError(nd, "Definition cannot contain list items and attributes with the same name"); // TODO check
                    } else {
                        attIndexes[itemName] = true;
                    }

                    // type must end with "[]"
                    if (tr) {
                        if (tr.match(REGEXP_LIST_TYPE)) {
                            listAtts.push(getJsTypeRef(tr.slice(0, -2)));
                        } else {
                            this.throwError(nd, "List types must end with '[]'"); // todo
                        }
                    } else {
                        listAtts.push("0");
                    }
                    if (value === undefined) {
                        value = "[]";
                    }
                } else {
                    if (!tr) {
                        tr = "0";
                    } else if (tr === "IvContent") {
                        contentName = '"' + attName + '"';
                        continue;
                    } else if (tr === "IvContentList") {
                        contentList = '"' + attName + '"';
                        continue;
                    } else {
                        tr = getJsTypeRef(tr);
                    }
                    simpleAtts.push('"' + attName + '"');
                    simpleAtts.push(tr);
                }
                if (tr !== "$iv.IvNode") {
                    if (value === undefined) {
                        value = "{}";
                    }
                    argInitInstructions.push(attName);
                    argInitInstructions.push([attName, ' = (', attName, ' !== undefined)? ', attName, ' : ', value, ';'].join(''));
                }
            }
        }

        if (nodeName === "type" && !simpleAtts.length && !listAtts.length && !contentName && !contentList) {
            this.throwError(nd, "Empty type definition"); // todo
        }

        let jsSimpleAtts = "0", jsListAtts = "0";
        if (simpleAtts.length) {
            jsSimpleAtts = "[" + simpleAtts.join(", ") + "]";
        }
        if (listAtts.length) {
            jsListAtts = "[" + listAtts.join(", ") + "]";
        }

        return {
            typeArgs: [jsSimpleAtts, ', ', jsListAtts, ', ', contentName, ', ', contentList].join(''),
            initInstructions: argInitInstructions
        };
    }

    /**
     * Compile a JS block (e.g. if / else if / else)
     * @param nd the js block node
     * @param contextIdx the index of the parent element or data node
     */
    compileJsBlock(nd, contextIdx) {
        let idx = this.nodeIdx,
            bStart = nd.nodeValue.startBlockExpression.replace(REGEXP_FIRST_SPACES, ""),
            bEnd = nd.nodeValue.endBlockExpression.replace(REGEXP_FIRST_SPACES, "");
        this.statics.push([this.baseIndent, " ", this.nodeIdx].join(''));
        this.nodeIdx++;

        this.fnContent.push([this.indent, bStart].join(''));
        this.increaseIndentation();
        this.fnContent.push([this.indent, '$c.bs(', idx, ');'].join(''));

        this.compileNodeList(nd.firstChild, contextIdx);

        this.fnContent.push([this.indent, '$c.be(', idx, ');'].join(''));
        this.decreaseIndentation();
        this.fnContent.push([this.indent, bEnd].join(''));
    }

    /**
     * Compile a JS Expression
     * @param nd the expresssion node
     */
    compileJsExpression(nd) {
        this.fnContent.push([this.indent, nd.nodeValue.replace(REGEXP_FIRST_SPACES, "")].join(''));
    }

    /**
     * Compile comments
     * @param nd
     */
    compileComment(nd) {
        this.fnContent.push([this.indent, "// ", nd.nodeValue.replace(REGEXP_FIRST_SPACES, "")].join(''));
    }

    /**
     * Compile multi-line comments
     * @param nd
     */
    compileCommentMl(nd) {
        let s = nd.nodeValue.replace(REGEXP_FIRST_SPACES, " ");
        s = s.replace(REGEXP_FIRST_SPACES_AFTER_NEW_LINE, "\n" + this.indent + " ");

        this.fnContent.push([this.indent, "/*", s, "*/"].join(''));
    }

    /**
     * Increase current indentation by one level
     */
    increaseIndentation() {
        this.indentArray.push(INDENT_SPACE);
        this.indent = this.indentArray.join("");
    }

    /**
     * Decrease current indentation by one level
     */
    decreaseIndentation() {
        this.indentArray.pop();
        this.indent = this.indentArray.join("");
    }

    /**
     * Return the line number to put in the statics description
     * @param nd
     * @returns {*}
     */
    getLineNbr(nd) {
        return this.lineNbrShift + nd.lineNbr;
    }

    /**
     * Throw a generic error with all context information
     * @param nd the node where the error was detected
     * @param msg the error message
     */
    throwError(nd, msg) {
        // let err = new IvError(msg);
        throw msg;
    }
}

/**
 * Transform iv types (such as IvNode) into a js reference (e.g. $iv.IvNode)
 * Non iv types remain unchanged
 * @param typeName {String}
 * @returns {String}
 */
function getJsTypeRef(typeName) {
    if (typeName.match(REGEXP_IV_TYPE)) {
        return "$iv." + typeName;
    } else {
        return typeName;
    }
}

class PkgCompiler extends CompilerBase {

    compile(nd, exposeInternals, initIndentLevel) {
        let pkg = {};
        this.init(nd, exposeInternals);
        if (initIndentLevel > 1) {
            for (let i = 1; initIndentLevel > i; i++) {
                this.increaseIndentation();
            }
        }

        // declare all entities - e.g.
        // var func1, func2;
        if (this.entities.length) {
            this.fnContent.push([this.indent, "var ", this.entities.join(", "), ";"].join(''));
        }

        this.compileNodeList(nd, 0);

        // return statement - e.g.
        // return {func1:func1, func2:func2};
        let returnData = [];
        for (let i = 0; this.entities.length > i; i++) {
            returnData.push(this.entities[i] + ":" + this.entities[i]);
        }
        this.fnContent.push([this.indent, "return {", returnData.join(", "), "};"].join(''));

        // load the package function
        let fnContent = this.fnContent.join("\n"), fn = new Function("$c", "$v", "$iv", fnContent);

        pkg.$fn = fn;
        if (exposeInternals) {
            pkg.$data = {
                fn: fn,
                fnContent: fnContent
            }
        }

        return pkg;
    }
}

class FunctionCompiler extends CompilerBase {
    rootNode;
    jsContent;  // JavaScript content resulting from them compilation process
    jsStatics;  // JavaScript statics calculated during the compilation process

    constructor(parentScope) {
        super();
        this.parentScope = parentScope;
    }

    /**
     * Compile a function node
     * @param nd the function node
     * @param exposeInternals Boolean true to get internals data (test mode)
     * @param initIndent String indent to use in the generated function
     * @param argNames Array list of function argument names
     * @param argTypes Array list of function argument types
     * to initialize arguments with default values
     */
    compile(nd, exposeInternals, initIndent, argNames, argTypes) {
        this.rootNode = nd;
        this.init(nd.firstChild, exposeInternals, initIndent);
        let idx = this.nodeIdx;
        this.nodeIdx++;

        let argNamesJs = "[]", argIdxJs = "{}", contentName = "";
        if (argNames.length) {
            argNamesJs = '["' + argNames.join('", "') + '"]';
            let tmp = [];
            for (let i = 0; argNames.length > i; i++) {
                tmp.push('"' + argNames[i] + '":' + i);
            }
            argIdxJs = "{" + tmp.join(", ") + "}";
        }

        // declare all entities at the function start (not really needed since hoisting
        // will make variable visible in the full function scope - but better for readability)
        if (this.entities.length) {
            this.fnContent.push([this.indent, "var ", this.entities.join(", "), ";"].join(''));
        }

        let attData = this.scanAttributes(nd);

        // inject default init instructions
        for (let i = 0; attData.initInstructions.length > i; i += 2) {
            this.fnContent.push([this.indent, attData.initInstructions[i + 1]].join(''));
        }

        this.fnContent.push([this.indent, '$c.fs(', idx, '); // function start'].join(''));

        this.statics.push([this.baseIndent, '[', idx, ', ', NacNodeType.FUNCTION, ', ', this.getLineNbr(nd), ', ',
            argNamesJs, ', ', argIdxJs, ', ', attData.typeArgs, ']'].join(''));

        // recursively compile content elements
        this.compileNodeList(nd.firstChild, idx);

        // generate end node line
        this.fnContent.push([this.indent, '$c.fe(', idx, '); // function end'].join(''));

        this.jsContent = this.fnContent.join("\n");
        this.jsStatics = this.statics.join(",\n");
    }

    /**
     * Recursively compile the child nodes of a given node
     * @param ndList the first element of the list
     * @param contextIdx the index of the parent element or data node
     */
    compileNodeList(ndList, contextIdx) {
        let nd = ndList, ndt;
        while (nd) {
            if (!this.compileCommonNode(nd, contextIdx)) {
                ndt = nd.nodeType;
                if (ndt === NacNodeType.ELEMENT) {
                    this.compileEltNode(nd, contextIdx);
                } else if (ndt === NacNodeType.INSERT) {
                    this.compileInsert(nd);
                } else if (ndt === NacNodeType.TEXT) {
                    this.compileTextNode(nd);
                } else {
                    throw "Invalid node type: " + ndt;
                }
            }
            nd = nd.nextSibling;
        }
    }

    /**
     * Compile an element, a component node or an att node
     * @param nd the Nac node corresponding to the element
     * @param contextIdx the index of the parent element or data node
     */
    compileEltNode(nd, contextIdx) {
        let idx = this.nodeIdx;
        this.nodeIdx++;
        // determine if this is a component or a standard node

        let isFunctionCall = (nd.nodeNameSpace || this.entityScope[nd.nodeName] === true),
            isAttNode = (nd.nodeNameSpace === ""),
            methodPrefix = "$c.n",
            ndType = NacNodeType.ELEMENT,
            argName = nd.nodeName;

        if (isFunctionCall) {
            methodPrefix = "$c.c";
            ndType = NacNodeType.COMPONENT;
        } else if (isAttNode) {
            let m;
            methodPrefix = "$c.a";
            ndType = NacNodeType.ATT_NODE;

        }
        // calculate attributes
        let atts = sortEltNodeAttributes(nd.firstAttribute), dynArgs = "0", staticFnArgs = "0", staticArgs = 0;
        let isDynamic = atts && (atts[ATT_BOUND1WAY] !== null || atts[ATT_BOUND2WAYS] !== null);

        if (atts) {
            // process non-bound attributes
            let ls = atts[ATT_STANDARD], attVal, statFnAtts = [];
            if (ls) {
                let statAtts = [];
                for (let i = 0; ls.length > i; i++) {
                    attVal = ls[i].value;
                    if (ls[i].name === "@name") {
                        continue;
                    }
                    if (attVal && attVal.match(REGEXP_JS_LITERAL)) {
                        // js literal - push to statics
                        statAtts.push(ls[i].name);
                        statAtts.push(eval(ls[i].value));
                    } else {
                        statFnAtts.push('"' + ls[i].name + '"');
                        statFnAtts.push(ls[i].value);
                    }
                }
                if (statAtts.length) {
                    staticArgs = statAtts;
                }
            }

            // process function attributes
            ls = atts[ATT_DEFERRED_EXPRESSION];
            if (ls) {
                let params;
                for (let i = 0; ls.length > i; i++) {
                    attVal = ls[i].value;
                    params = ls[i].parameters ? ls[i].parameters.join(",") : "";
                    statFnAtts.push('"' + ls[i].name + '"');
                    statFnAtts.push(["function(", params, ") {", ls[i].value, "}"].join(""));
                }
            }
            if (statFnAtts.length) {
                staticFnArgs = "[" + statFnAtts.join(", ") + "]";
            }

            if (isDynamic) {
                let dynAtts = [];
                ls = atts[ATT_BOUND1WAY];
                if (ls) {
                    for (let i = 0; ls.length > i; i++) {
                        dynAtts.push('"' + ls[i].name + '"');
                        dynAtts.push(ls[i].value);
                    }
                }
                ls = atts[ATT_BOUND2WAYS];
                if (ls) {
                    for (let i = 0; ls.length > i; i++) {
                        dynAtts.push('"' + ls[i].name + '"');
                        dynAtts.push(ls[i].value);
                    }
                }
                dynArgs = "[" + dynAtts.join(", ") + "]";

            }
            let staticArgsJs = "0";
            if (staticArgs.length) {
                staticArgsJs = '["' + staticArgs.join('", "') + '"]';
            }

            this.statics.push([this.baseIndent, '[', idx, ', ', ndType, ', ', this.getLineNbr(nd), ', "',
                argName, '", ', staticArgsJs, ', ',contextIdx, ']'].join(''));

        } else {
            this.statics.push([this.baseIndent, '[', idx, ', ', ndType, ', ', this.getLineNbr(nd), ', "',
                argName, '", 0, ', contextIdx,']'].join(''));
        }

        let fnRef = "", nm = (nd.nodeNameSpace !== undefined) ? nd.nodeNameSpace + ":" + nd.nodeName : nd.nodeName;
        if (isFunctionCall) {
            if (nd.nodeNameSpace) {
                fnRef = ", " + nd.nodeNameSpace + "." + nd.nodeName;
            } else {
                fnRef = ", " + nd.nodeName;
            }
        }

        if (nd.firstChild) {
            // this node has child nodes

            // generate start node line
            this.fnContent.push([this.indent, methodPrefix, 's(', idx, fnRef, ', true, ', dynArgs, ', ', staticFnArgs, '); // ', nm].join(''));

            // recursively compile content elements
            this.compileNodeList(nd.firstChild, idx);

            // generate end node line
            this.fnContent.push([this.indent, methodPrefix, 'e(', idx, ');'].join(''));
        } else {
            // single node, no content
            this.fnContent.push([this.indent, methodPrefix, 's(', idx, fnRef, ', false, ', dynArgs, ', ', staticFnArgs, '); // ', nm].join(''));
        }
    }

    /**
     * Compile insert node
     * @param nd
     */
    compileInsert(nd) {
        let idx = this.nodeIdx;
        this.nodeIdx++;
        this.fnContent.push([this.indent, '$c.ins(', idx, ', ', nd.nodeValue, ');'].join(''));
        this.statics.push([this.baseIndent, " ", idx].join(""));
    }

    /**
     * Compile a text node (static by nature)
     * @param nd
     */
    compileTextNode(nd) {
        let idx = this.nodeIdx;
        this.nodeIdx++;

        let v = nd.nodeValue.replace(REGEXP_NEWLINES, " ").replace(REGEXP_FIRST_SPACES, "");
        if (v.length > 16) {
            v = v.slice(0, 16) + "(...)";
        }

        this.fnContent.push([this.indent, '$c.t(', idx, '); // ', v].join(''));
        let sv = nd.nodeValue.replace(REGEXP_NEWLINES, "\\n").replace(REGEXP_DOUBLE_QUOTES, "\\\"");
        this.statics.push([this.baseIndent, '[', idx, ', ', nd.nodeType, ', ', this.getLineNbr(nd), ', "', sv, '"]'].join(''));
    }
}


/**
 * Parse the list of attributes and segregates attributes per nature - e.g. STANDARD, BOUND1WAY, etc.
 * cf. NacAttributeNature
 */
function sortEltNodeAttributes(attList) {
    if (!attList) return null;
    let attNature, res = [null, null, null, null]; // cf. ATT_XXX values

    let elt = attList.firstSibling;
    while (elt) {
        attNature = elt.nature;
        if (!res[attNature]) {
            res[attNature] = [];
        }
        res[attNature].push(elt);
        elt = elt.nextSibling;
    }
    return res;
}

/**
 * As id is passed as a JS expression, it will contain extra double-quotes
 * This function removes the quotes and return the id value if the node has an id
 * @param nd
 * @returns {String} the id value
 */
function getIdValue(nd) {
    if (!nd.id) {
        return null;
    } else {
        let m = nd.id.match(REGEXP_QUOTED_STRING);
        if (m) {
            return m[1];
        } else {
            return nd.id;
        }
    }
}
