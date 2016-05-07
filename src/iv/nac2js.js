/**
 * NAC JS compiler
 * Copyright Bertrand Laporte 2016
 * Created on 22/04/16.
 */

import {NacAttributeNature, NacNodeType} from './nac';

const ATT_STANDARD = NacAttributeNature.STANDARD,                       // 0 - e.g. foo="bar"
    ATT_BOUND1WAY = NacAttributeNature.BOUND1WAY,                       // 1 - e.g. [foo]=c.bar+3
    ATT_BOUND2WAYS = NacAttributeNature.BOUND2WAYS,                     // 2 - e.g. [[foo]]=c.bar
    ATT_DEFERRED_EXPRESSION = NacAttributeNature.DEFERRED_EXPRESSION;   // 3 - e.g. (onclick)=c.doSomething()

var REGEXP_JS_LITERAL = /(^".*"$)|(^'.*'$)|(^true$)|(^false$)|(^\d+$)|(^\d+\.\d+$)/,
    REGEXP_FIRST_SPACES = /^\s+/,
    REGEXP_NEWLINES = /\n/g;

export function compile(nacNode, exposeInternals = false) {
    var pkg = new PkgContainer(), templates = pkg.load(nacNode), c;

    for (var i = 0; i < templates.length; i++) {
        c = new TemplateCompiler(templates[i], pkg);
        c.compile(pkg, exposeInternals);
    }

    return pkg.entities;
}

class PkgContainer {
    entities;   // hashmap of all templates and components accessible in this package

    constructor() {
        this.entities = {};
    }

    load(nacNode) {
        // we assume that the node is well formed and that errors have already been caught by the parser
        var nd = nacNode, templates = [];
        while (nd) {
            if (nd.nodeName === "import") {
                throw "todo";
            } else if (nd.nodeName === "template") {
                // todo scan template attributes and validate that they don't have dynamic values + remove extra quotes
                if (!nd.id) {
                    throw "Missing template id"; // todo provide line nbr
                }
                this.entities[nd.id] = {};
                templates.push(nd);
            } else {
                throw "Unexpected element"; // todo
            }
            nd = nd.nextSibling;
        }
        return templates;
    }

    update(name, value) {
        this.entities[name] = value;
    }
}

class TemplateCompiler {
    rootNode;
    pkg;
    nodeIdx;
    fnContent;
    statics;
    templateArgs;
    templateArgIdx;
    templateFnContent;
    templateFn;

    constructor(templateNode, pkg) {
        this.rootNode = templateNode;
        this.pkg = pkg;
    }

    compile(exposeInternals) {
        var templateId = this.rootNode.id;
        this.nodeIdx = 0;
        this.fnContent = [];
        this.statics = [];
        this.templateArgs = [];
        this.templateArgIdx = {};

        this.compileTemplateNode(this.rootNode);
        this.templateFnContent = this.fnContent.join("\n");
        this.loadFunction();

        var templateData = {
            templateId: templateId,
            templateFn: this.templateFn,
            templateStatics: this.statics,
            templateFnContent: exposeInternals ? this.templateFnContent : undefined,
            templateArgs: exposeInternals ? this.templateArgs : undefined,
            templateArgIdx: this.templateArgIdx
        };

        this.pkg.update(templateId, templateData);
    }

    /**
     * Instantiate the template function
     */
    loadFunction() {
        if (this.templateFnContent) {
            // clone args
            var args2 = this.templateArgs.slice(0);
            // TODO support more than 10 args
            if (args2.length > 10) {
                throw "Template cannot support more than 10 arguments"; // todo check
            } else {
                var i = args2.length;
                while (i < 10) {
                    args2[i] = "$arg" + i;
                    i++;
                }
                // cannot use apply() in this context...
                this.templateFn = new Function(
                    "$c",
                    args2[0], args2[1], args2[2], args2[3], args2[4],
                    args2[5], args2[6], args2[7], args2[8], args2[9],
                    this.templateFnContent
                );
            }
        }
    };

    /**
     * Compile the root template node
     * @param nd
     */
    compileTemplateNode(nd) {
        // this is the template node
        // generate the argument default values
        var idx = this.nodeIdx;
        this.nodeIdx++;

        var atts = this.parseEltNodeAttributes(nd.firstAttribute), ls = atts[ATT_STANDARD], nm, val, argIdx = 0,
            isDynamic = atts && (atts[ATT_BOUND1WAY] !== null || atts[ATT_BOUND2WAYS] !== null);
        ;
        if (ls) {
            for (var i = 0; ls.length > i; i++) {
                nm = ls[i].name;
                if (nm === "id") {
                    continue;
                }
                val = ls[i].value || "{}"; // todo choose val according to type
                this.fnContent.push(nm + '=(' + nm + '!==undefined)?' + nm + ':' + val + ';');

                this.templateArgs[argIdx] = nm;
                this.templateArgIdx[nm] = argIdx;
                argIdx++;
            }
        }
        if (isDynamic) {
            throw "Bound attributes cannot be used on template definitions"; // todo
        }
        this.statics.push([0]);

        // generate the template start instruction
        this.fnContent.push('$c.ts(' + idx + '); // template');

        // recursively compile content elements
        this.compileChildNodes(nd);

        // generate end node line
        this.fnContent.push('$c.te(' + idx + ');');
    }

    /**
     * Compile an element or a template node
     * @param nd the Nac node corresponding to the element
     */
    compileEltNode(nd) {
        var idx = this.nodeIdx;
        this.nodeIdx++;


        // calculate attributes
        var atts = this.parseEltNodeAttributes(nd.firstAttribute), dynArgs = "0", staticFnArgs = "0", staticArgs = 0;
        var isDynamic = atts && (atts[ATT_BOUND1WAY] !== null || atts[ATT_BOUND2WAYS] !== null);

        if (atts) {
            // sort non-bound attributes
            var ls = atts[ATT_STANDARD], attVal;
            if (ls) {
                var statFnAtts = [], statAtts = [];
                for (var i = 0; ls.length > i; i++) {
                    attVal = ls[i].value;
                    if (attVal.match(REGEXP_JS_LITERAL)) {
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
                if (statFnAtts.length) {
                    staticFnArgs = "[" + statFnAtts.join(",") + "]";
                }
            }
            if (isDynamic) {
                var dynAtts = [];
                ls = atts[ATT_BOUND1WAY];
                if (ls) {
                    for (var i = 0; ls.length > i; i++) {
                        dynAtts.push('"' + ls[i].name + '"');
                        dynAtts.push(ls[i].value);
                    }
                }
                ls = atts[ATT_BOUND2WAYS];
                if (ls) {
                    for (var i = 0; ls.length > i; i++) {
                        dynAtts.push('"' + ls[i].name + '"');
                        dynAtts.push(ls[i].value);
                    }
                }
                dynArgs = "[" + dynAtts.join(",") + "]";

            }
            this.statics.push([idx, nd.nodeType, nd.nodeName, staticArgs]);
        } else {
            this.statics.push([idx, nd.nodeType, nd.nodeName, 0]);
        }

        if (nd.firstChild) {
            // this node has child nodes

            // generate start node line
            this.fnContent.push('$c.ns(' + idx + ',true,' + dynArgs + ',' + staticFnArgs + '); // ' + nd.nodeName);

            // recursively compile content elements
            this.compileChildNodes(nd);

            // generate end node line
            this.fnContent.push('$c.ne(' + idx + ');');
        } else {
            // single node, no content
            this.fnContent.push('$c.ns(' + idx + ',false,' + dynArgs + ',' + staticFnArgs + '); // ' + nd.nodeName);
        }
    }

    /**
     * Recursively compile the child nodes of a given node
     * @param nd the container node
     */
    compileChildNodes(nd) {
        var ch = nd.firstChild, ndt;
        while (ch) {
            ndt = ch.nodeType;
            if (ndt === NacNodeType.ELEMENT) {
                this.compileEltNode(ch);
            } else if (ndt === NacNodeType.JS_EXPRESSION) {
                this.compileJsExpression(ch);
            } else if (ndt === NacNodeType.JS_BLOCK) {
                this.compileJsBlock(ch);
            } else if (ndt === NacNodeType.TEXT) {
                this.compileTextNode(ch);
            } else if (ndt === NacNodeType.COMMENT) {
                this.compileComment(ch);
            } else {
                throw "Invalid node type: " + ndt;
            }

            ch = ch.nextSibling;
        }
    }

    /**
     * Compile a JS Expression
     * @param nd the expresssion node
     */
    compileJsExpression(nd) {
        this.fnContent.push(nd.nodeValue.replace(REGEXP_FIRST_SPACES, ""));
    }

    /**
     * Compile comments
     * @param nd
     */
    compileComment(nd) {
        this.fnContent.push("// " + nd.nodeValue.replace(REGEXP_FIRST_SPACES, ""));
    }

    /**
     * Compile a JS block (e.g. if / else if / else)
     * @param nd the js block node
     */
    compileJsBlock(nd) {
        var idx = this.nodeIdx,
            bStart = nd.nodeValue.startBlockExpression.replace(REGEXP_FIRST_SPACES, ""),
            bEnd = nd.nodeValue.endBlockExpression.replace(REGEXP_FIRST_SPACES, "");
        this.nodeIdx++;
        this.statics.push([idx]);

        this.fnContent.push(bStart);
        this.fnContent.push('$c.bs(' + idx + ');');

        this.compileChildNodes(nd);

        this.fnContent.push('$c.be(' + idx + ');');
        this.fnContent.push(bEnd);
    }

    /**
     * Compile a text node (static by nature)
     * @param nd
     */
    compileTextNode(nd) {
        var idx = this.nodeIdx;
        this.nodeIdx++;

        var v = nd.nodeValue.replace(REGEXP_NEWLINES, " ").replace(REGEXP_FIRST_SPACES, "");
        if (v.length > 16) {
            v = v.slice(0, 16) + "(...)";
        }

        this.fnContent.push('$c.t(' + idx + '); // ' + v);

        this.statics.push([idx, nd.nodeType, nd.nodeValue]);
    }

    /**
     * Parse the list of attributes and segregates attributes per nature (cf. NacAttributeNature)
     */
    parseEltNodeAttributes(attList) {
        if (!attList) return null;
        var attNature, res = [null, null, null, null]; // cf. ATT_XXX values

        var elt = attList.firstSibling;
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

}

