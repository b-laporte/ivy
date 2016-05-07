/**
 * Main iv library
 * Copyright Bertrand Laporte 2016
 */

import {NacNode, NacNodeType} from './nac';
import {parse} from './parser';
import {compile} from './nac2js';

var MAX_INDEX = Number.MAX_VALUE;

/**
 * Compile an iv package
 * @param strings the iv templates contained in the package
 * @param values the external values to be integrated in the package
 * @returns {} a Map of the different templates included the package - template ids are used as keys
 */
export function iv(strings, ...values) {
    // parse and compile
    var r = parse(strings, values);
    if (r.error) {
        throw `(${r.error.line}:${r.error.column}) ${r.error.description}`;
    }
    var pkgEntities = compile(r.nac, true);

    // create a template wrapper for each template in the package
    var pkg = {};
    for (var k in pkgEntities) {
        if (pkgEntities.hasOwnProperty(k)) {
            pkg[k] = new IvTemplate(pkgEntities[k]);
        }
    }
    return pkg;
}

/**
 * Factory class to generate template instances (aka. IvViews)
 */
class IvTemplate {
    static templateCount = 0;
    templateData;
    uid;            // unique identifier

    constructor(templateData) {
        this.templateData = templateData;
        this.uid = "T" + (IvTemplate.templateCount++);
    }

    apply(argMap) {
        var p = new IvProcessor(this.templateData, this.uid),
            view = {
                vdom: null,
                // hide the processor in the function closure
                refresh: function (argMap, vdom) {
                    this.vdom = p.refresh(argMap, vdom || this.vdom);
                }
            };
        view.refresh(argMap);
        return view;
    }
}

class IvProcessor {
    templateUID;        // template unique identifier
    fn;
    statics;
    argIndexes;
    refreshLog;         // instruction set generated during last refresh call
    srcNd;              // current node - node used as reference during the refresh process
    srcNdDepth;         // current node depth
    ancestorNodes;      // array of the nodes in the current path
    targetDepth;        // tells at which depth next node should be (0 = root)
    forceCreate;        // fast track for node creation
    forceCreateTarget;  // force creation mode until a certain target is reached

    constructor(templateData, templateUID) {
        this.templateUID = templateUID;
        this.fn = templateData.templateFn;
        this.statics = templateData.templateStatics;
        this.argIndexes = templateData.templateArgIdx;
    }

    refresh(argMap, previousNode) {
        this.refreshLog = null;
        // fake a node to bootstrap the chain
        this.srcNd = {nextSibling: previousNode || null};
        this.srcNdDepth = 0;

        if (previousNode) {
            this.forceCreate = false;
            this.forceCreateTarget = -1;
        } else {
            this.forceCreate = true;
            this.forceCreateTarget = 0;
        }

        var args = [this], argsIdx = this.argIndexes;

        for (var k in argMap) {
            if (argMap.hasOwnProperty(k)) {
                args[argsIdx[k] + 1] = argMap[k];
            }
        }

        this.targetDepth = 0;
        this.ancestorNodes = [];

        // call the template function
        this.fn.apply(null, args); // this will call the marker methods ns(), ne(), t(), bs()...

        if (this.ancestorNodes.length) {
            return this.ancestorNodes[0].firstSibling;
        } else {
            return null;
        }
    }

    advance(targetIdx) {
        var nextNode;
        if (this.srcNdDepth < this.targetDepth) {
            // we have to look for next node in the child list
            var nd=this.srcNd;
            nextNode = nd.firstChild;
            while (nextNode && nextNode.index < targetIdx) {
                this.deleteFirstChild(nd);
                nextNode = nd.firstChild;
            }

            if (!nextNode) {
                return false;
            }

            if (nextNode.index === targetIdx) {
                this.srcNdDepth++;
                this.srcNd = nextNode;
                this.ancestorNodes.push(nextNode);
                return true;
            } else {
                // next node is after the target
                return false;
            }
        } else {
            // next nodes are siblings
            nextNode = this.srcNd.nextSibling;
            if (!nextNode) {
                return false;
            } else {
                if (nextNode.index === targetIdx) {
                    this.srcNd = nextNode;
                    if (this.ancestorNodes.length === 0) {
                        // we may fall in this case at bootstrap on the very first node
                        this.ancestorNodes[0] = nextNode;
                    } else {
                        this.ancestorNodes[this.ancestorNodes.length - 1] = nextNode;
                    }
                    return true;
                } else if (nextNode.index > targetIdx) {
                    // next node is after the target
                    return false;
                }
            }
        }

        // delete all coming elements until the node is found or no more sibling are available
        return this.deleteSrcSiblingsUntil(targetIdx);
    }

    deleteSrcSiblingsUntil(targetIdx) {
        // return true if found
        if (!this.srcNd.nextSibling) {
            return false;
        }
        var nd = this.srcNd, nextNode = nd.nextSibling;
        while (nextNode && nextNode.index < targetIdx) {
            this.deleteNextNode(nd);
            nd = nextNode;
            nextNode = nd.nextSibling;
        }
        if (nextNode && nextNode.index === targetIdx) {
            this.srcNd = nextNode;
            this.ancestorNodes[this.ancestorNodes.length - 1] = nextNode;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Template start
     * @param idx
     */
    ts(idx) {
        if (this.forceCreate) {
            // creation fast track
            this.createGroupNode(idx);
        } else {
            if (!this.advance(idx)) {
                this.createGroupNode(idx);
            }
        }
        this.targetDepth++;
    }

    /**
     * Template end
     * @param idx
     */
    te(idx) {
        this.ne(idx);
    }

    /**
     * Mark an element node start
     * @param idx the node index
     * @param hasChildren true if the node is expected to contain child nodes
     * @param dAttributes Array of dynamic attributes or 0 - e.g. ["title",bar+3]
     * @param sAttributes Array of static attributes that need be evaluated through an expression - e.g. ["title",bar+3]
     */
    ns(idx, hasChildren, dAttributes, sAttributes) {
        if (this.forceCreate) {
            // creation fast track
            this.createEltNode(idx, dAttributes, sAttributes);
        } else {
            if (this.advance(idx)) {
                // update
                this.updateEltNode(this.srcNd, dAttributes);
            } else {
                throw "invalid case"; // force creation should have been activated and we should not get here
            }
        }

        // tell how next nodes should be handled
        if (hasChildren) {
            this.targetDepth++;
        }
    }

    /**
     * Mark a node end - only for element or js block nodes
     * @param idx the node index
     */
    ne(idx) {
        if (this.forceCreate) {
            if (idx === this.forceCreateTarget) {
                // reset forced creation flags
                this.forceCreate = false;
                this.forceCreateTarget = -1;
            }
        } else {
            // delete last nodes
            this.deleteSrcSiblingsUntil(MAX_INDEX);
        }
        var anNodes = this.ancestorNodes;
        if (anNodes.length > this.targetDepth) {
            anNodes.pop(); // remove last content node
            this.srcNd = anNodes[anNodes.length - 1];
            this.srcNdDepth--;
        }
        this.targetDepth--;
    }

    /**
     * Mark the beginning of a js block (Block Start)
     * @param idx the node index
     */
    bs(idx) {
        if (this.forceCreate) {
            // creation fast track
            this.createGroupNode(idx);
        } else {
            if (!this.advance(idx)) {
                this.createGroupNode(idx);
                this.forceCreate = true;
                this.forceCreateTarget = idx;
            }
        }
        this.targetDepth++;
    }

    /**
     * Mark the end of a js block (Block End)
     * @param idx the node index
     */
    be(idx) {
        this.ne(idx);
    }

    /**
     * Mark a static text node
     * @param idx the node index
     */
    t(idx) {
        if (this.forceCreate) {
            this.createTextNode(idx);
        } else {
            if (!this.advance(idx)) {
                this.createTextNode(idx);
            }
            // text nodes are static - so no update needed
        }
    }

    deleteFirstChild(nd) {
        var ch = nd.firstChild;
        if (ch) {
            var ns = ch.nextSibling;
            if (ns) {
                nd.firstChild = ns;
                var ns2 = ns.nextSibling;
                while (ns2) {
                    ns2.firstSibling = ns;
                    ns2 = ns2.nextSibling;
                }
            } else {
                nd.firstChild = null;
            }
        }
    }

    deleteNextNode(nd) {
        var nextNode = nd.nextSibling;
        if (nextNode) {
            nd.nextSibling = nextNode.nextSibling || null;
        }
    }

    createTextNode(idx) {
        var nd = new NacNode(NacNodeType.TEXT, this.statics[idx][2]);
        nd.index = idx;
        this.appendNode(nd);
    }

    createGroupNode(idx) {
        var nd = new NacNode(NacNodeType.ELEMENT);
        nd.nodeName = "#group";
        nd.index = idx;
        this.appendNode(nd);
    }

    createEltNode(idx, dAttributes, sAttributes) {
        var statics = this.statics[idx], nd = new NacNode(statics[1]), i;
        nd.nodeName = statics[2];
        nd.index = idx;
        // dynamic attributes first
        if (dAttributes) {
            for (i = 0; dAttributes.length > i; i += 2) {
                nd.addAttribute(dAttributes[i], dAttributes[i + 1]);
            }
        }
        // static attributes from statics array
        var sAtts = statics[3];
        if (sAtts) {
            for (i = 0; sAtts.length > i; i += 2) {
                nd.addAttribute(sAtts[i], sAtts[i + 1]);
            }
        }
        // static attributes from arguments (i.e. using js expressions)
        if (sAttributes) {
            for (i = 0; sAttributes.length > i; i += 2) {
                nd.addAttribute(sAttributes[i], sAttributes[i + 1]);
            }
        }

        this.appendNode(nd);
    }

    updateEltNode(nd, dAttributes) {
        if (dAttributes) {
            // attributes are created in the same order as they are in the dAttributes list
            var att = nd.firstAttribute;
            for (var i = 0; dAttributes.length > i; i += 2) {
                att.value = dAttributes[i + 1];
                att = att.nextSibling;
            }
        }
    }

    appendNode(nd) {
        var anNodes = this.ancestorNodes, anLength = anNodes.length;
        if (anLength === 0) {
            // root node
            anNodes[0] = nd;
            this.srcNd = nd;
        } else {
            var prev = anNodes[anLength - 1];
            if (this.targetDepth >= anLength) {
                // insert as first child
                var currentFirstChild = prev.firstChild;
                prev.firstChild = nd;
                nd.parentNode = prev;
                nd.firstSibling = nd;
                if (currentFirstChild) {
                    nd.nextSibling = currentFirstChild;
                    currentFirstChild.firstSibling = nd;
                }
                this.srcNd = nd;
                this.srcNdDepth++;
                anNodes.push(nd);
            } else {
                // add as sibling
                prev.addSibling(nd);
                anNodes[anLength - 1] = nd;
                this.srcNd = nd;
            }
        }
    }
}

/**
 * Expose the $template function for template pre-compilation
 * @type Function
 */
iv.$template = function (templateData) {
    return new IvTemplate(templateData);
};
