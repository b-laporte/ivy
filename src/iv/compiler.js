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
     * @param ndlist {NacNode} the node list to scan
     * @param scanContext a context object with 2 properties: foundEntities (Map) and entityList (array of ids)
     */
    scanEntities(ndlist, scanContext) {
        let nd = ndlist, m, id;
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
     */
    compileNodeList(ndList) {
        let nd = ndList;
        while (nd) {
            if (!this.compileCommonNode(nd)) {
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
     * @return Boolean true if a child node has been found
     */
    compileCommonNode(nd) {
        let ndt = nd.nodeType;

        if (ndt === NacNodeType.ELEMENT && nd.nodeName === "function") {
            this.compileFunctionNode(nd);
        } else if (ndt === NacNodeType.JS_EXPRESSION) {
            this.compileJsExpression(nd);
        } else if (ndt === NacNodeType.JS_BLOCK) {
            this.compileJsBlock(nd);
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

        let atts = sortEltNodeAttributes(nd.firstAttribute), ls = atts[ATT_STANDARD];

        if (atts && (atts[ATT_BOUND1WAY] !== null || atts[ATT_BOUND2WAYS] !== null)) {
            throw "Bound attributes cannot be used on function definitions"; // TODO check
        }
        if (atts && (atts[ATT_DEFERRED_EXPRESSION] !== null )) {
            throw "Deferred expressions cannot be used on function definitions"; // TODO check
        }

        let fnName = "", argNames = [], argIndexes = {}, argTypes = [], argInitInstructions = [], nm, val, argIdx = 0;

        if (ls) {
            for (let i = 0; ls.length > i; i++) {
                nm = ls[i].name;
                if (nm === "id") {
                    fnName = getIdValue(nd);
                    continue;
                } else if (argIndexes[nm]) {
                    // an argument with the same name already exists
                    throw "Function definition cannot contain 2 arguments with the same name"; // TODO check
                }

                // define default argument value
                val = ls[i].value || "{}"; // todo choose val according to type
                argInitInstructions.push(nm);
                argInitInstructions.push([nm, ' = (', nm, ' !== undefined)? ', nm, ' : ', val, ';'].join(''));

                argNames[argIdx] = nm;
                argIndexes[nm] = true;
                argTypes[argIdx] = ls[i].typeRef;
                argIdx++;
            }
        }

        // TODO support optional function id
        if (fnName === "") {
            throw "Missing function id";
        }

        let argListJs = "";
        if (argNames.length) {
            argListJs = ", " + argNames.join(", ");
        }

        // generate the function start instruction
        this.fnContent.push([this.indent, fnName, ' = $c.fn(', idx, ', function($c', argListJs, ') {'].join(''));

        let fc = new FunctionCompiler(this.parentScope);
        fc.compile(nd, this.exposeInternals, this.indent + INDENT_SPACE, argNames, argTypes, argInitInstructions);

        this.fnContent.push(fc.jsContent);

        this.fnContent.push([this.indent, '},[\n', fc.jsStatics, '\n', this.indent, ']);'].join(''));

    }

    /**
     * Compile a JS block (e.g. if / else if / else)
     * @param nd the js block node
     */
    compileJsBlock(nd) {
        let idx = this.nodeIdx,
            bStart = nd.nodeValue.startBlockExpression.replace(REGEXP_FIRST_SPACES, ""),
            bEnd = nd.nodeValue.endBlockExpression.replace(REGEXP_FIRST_SPACES, "");
        this.statics.push([this.baseIndent, " ", this.nodeIdx].join(''));
        this.nodeIdx++;

        this.fnContent.push([this.indent, bStart].join(''));
        this.increaseIndentation();
        this.fnContent.push([this.indent, '$c.bs(', idx, ');'].join(''));

        this.compileNodeList(nd.firstChild);

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

        this.compileNodeList(nd);

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
     * @param argInitInstructions Array list of js instructions to include at function start
     * to initialize arguments with default values
     */
    compile(nd, exposeInternals, initIndent, argNames, argTypes, argInitInstructions) {
        this.rootNode = nd;
        this.init(nd.firstChild, exposeInternals, initIndent);

        let idx = this.nodeIdx;
        this.nodeIdx++;

        let argNamesJs = "[]", argIdxJs = "{}", argTypesJs = "[]", contentName = "", typeMap = {};
        if (argNames.length) {
            argNamesJs = '["' + argNames.join('", "') + '"]';
            let tmp = [], tmp2 = [], tp;
            for (let i = 0; argNames.length > i; i++) {
                tmp.push('"' + argNames[i] + '":' + i);
                tp = argTypes[i];
                if (tp === null) {
                    // type is not defined
                    tmp2.push("0");
                    typeMap[argNames[i]] = "0";
                } else {
                    // TODO check type!!!
                    switch (tp) {
                        case "Number":
                        case "Boolean":
                        case "Function":
                        case "String":
                            tmp2.push(tp);
                            break;
                        case "IvNode":
                            tmp2.push("$iv." + tp);
                            break;
                        case "IvContent":
                            if (contentName.length) {
                                throw "Function can only support one content argument";
                            }
                            contentName = argNames[i];
                            tmp2.push("$iv." + tp);
                            break;
                        default:
                            throw "Invalid argument type: " + tp;
                    }
                    typeMap[argNames[i]] = tp;
                }
            }
            argIdxJs = "{" + tmp.join(", ") + "}";
            argTypesJs = "[" + tmp2.join(", ") + "]";
        }

        if (this.entities.length) {
            this.fnContent.push([this.indent, "var ", this.entities.join(", "), ";"].join(''));
        }

        let argType;
        for (let i = 0; argInitInstructions.length > i; i += 2) {
            argType=typeMap[argInitInstructions[i]]
            if (argType !== "IvContent" && argType !== "IvNode") {
                // we don't create default value for IvContent and IvNode nodes
                this.fnContent.push([this.indent, argInitInstructions[i + 1]].join(''));
            }
        }

        this.fnContent.push([this.indent, '$c.fs(', idx, '); // function start'].join(''));

        this.statics.push([this.baseIndent, '[', idx, ', ', NacNodeType.FUNCTION, ', ',
            argNamesJs, ', ', argIdxJs, ', ', argTypesJs, ', "', contentName, '"]'].join(''));

        // recursively compile content elements
        this.compileNodeList(nd.firstChild);

        // generate end node line
        this.fnContent.push([this.indent, '$c.fe(', idx, '); // function end'].join(''));

        this.jsContent = this.fnContent.join("\n");
        this.jsStatics = this.statics.join(",\n");
    }

    /**
     * Recursively compile the child nodes of a given node
     * @param ndList the first element of the list
     */
    compileNodeList(ndList) {
        let nd = ndList, ndt;
        while (nd) {
            if (!this.compileCommonNode(nd)) {
                ndt = nd.nodeType;
                if (ndt === NacNodeType.ELEMENT) {
                    this.compileEltNode(nd);
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
     */
    compileEltNode(nd) {
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

            this.statics.push([this.baseIndent, '[', idx, ', ', ndType, ', "',
                argName, '", ', staticArgsJs, ']'].join(''));

        } else {
            this.statics.push([this.baseIndent, '[', idx, ', ', ndType, ', "',
                argName, '", 0]'].join(''));
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
            this.compileNodeList(nd.firstChild);

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
        this.statics.push([this.baseIndent, '[', idx, ', ', nd.nodeType, ', "', sv, '"]'].join(''));
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
