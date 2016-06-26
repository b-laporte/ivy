/**
 * Main iv library
 * Copyright Bertrand Laporte 2016
 */

/* global console */
import {NacNodeType} from './nac';
import {parse} from './parser';
import {compile} from './nac2js';
import {IvGroupNode, IvEltNode, IvTextNode} from './node';

var MAX_INDEX = Number.MAX_VALUE;

/**
 * Compile an iv package
 * @param strings the iv templates contained in the package
 * @param values the external values to be integrated in the package
 * @returns Object a Map of the different templates included the package - template ids are used as keys
 */
export function iv(strings, ...values) {
    // parse and compile
    var r = parse(strings, values);
    if (r.error) {
        //throw `(${r.error.line}:${r.error.column}) ${r.error.description}`;
        //iv.log`(${r.error.line}:${r.error.column}) ${r.error.description}`); // todo match IvError
        return;
    }
    var pkgEntities = compile(r.nac, true);

    // create a template wrapper for each template in the package
    var pkg = {};
    for (var k in pkgEntities) {
        if (pkgEntities.hasOwnProperty(k)) {
            pkg[k] = new IvTemplate(pkgEntities[k], pkg);
        }
    }
    return pkg;
}

/**
 * Log function that will receive all error caught during iv parsing and dynamic refresh
 * Default behavior is to output error in the console.
 * Should be overridden by the user
 * @param error {IvError}
 */
iv.log = function (error) {
    if (error.description) {
        console.error(error.description());
    } else {
        console.error(error);
    }
};

/**
 * Factory class to generate template instances (aka. IvViews)
 */
class IvTemplate {
    static templateCount = 0;
    templateData;
    pkg;            // package associated to this template
    uid;            // unique identifier

    /**
     * Template factory constructor
     * There is one IvTemplate per template kind - as such all templates of the same kind (i.e. associated
     * to the sample template function) are genereated by the same IvTemplate instance
     * @param templateData the result of the template compilation - cf. nac2js compiler
     * @param pkg package containing this template
     */
    constructor(templateData, pkg) {
        this.templateData = templateData;
        this.uid = "T" + (IvTemplate.templateCount++);
        this.pkg = pkg;
    }

    apply(argMap, context) {
        var p = new IvProcessor(this.templateData, this.pkg, this.uid + ":" + (this.templateData.instanceCount++)),
            view = {
                vdom: null,
                refreshLog: null,
                // hide the processor in the function closure
                refresh: function (argMap, context) {
                    this.refreshLog = null;
                    try {
                        this.vdom = p.refresh(argMap, context || {groupNode: this.vdom});
                        this.refreshLog = p.refreshLog;
                    } catch (err) {
                        iv.log(err);
                        this.vdom = null;
                    }
                },
                // log the current vdom in the console
                log(indent) {
                    if (!this.vdom) {
                        console.log("[no virtual dom]")
                    } else {
                        console.log(this.vdom.toString(indent));
                    }
                }
            };
        view.refresh(argMap, context);
        return view;
    }
}

class IvError {
    message;    // error message
    templateId;
    line;
    column;
    nodeIdx;    // optional - node index where the error was found
    pkg;        // optional - reference to the package where the error was found
    statics;    // optional - reference to the statics structure associated to the template where the error was found
    // fileName ? Could be added to package info with pre-compilation?

    constructor(msg) {
        this.message = msg;
        this.templateId = "";
        this.line = null;
        this.column = null;
        this.nodeIdx = null;
    }

    /**
     * Merge all information in one description
     */
    description() {
        var tid = "", nm = "";
        if (this.statics && this.nodeIdx) {
            var ndType = this.statics[this.nodeIdx][1];
            if (ndType === NacNodeType.ELEMENT || ndType === NacNodeType.COMPONENT) {
                nm = this.statics[this.nodeIdx][2];
            } else if (ndType === NacNodeType.ATT_NODE) {
                nm = "@" + this.statics[this.nodeIdx][2];
            } else {
                nm = NacNodeType.getName(ndType);
            }
        }
        if (this.templateId) {
            tid = ["[template#", this.templateId, "/", nm, "] "].join("");
        }

        return [tid, this.message].join("");
    }
}

class IvProcessor {
    pkg;                 // template package
    ref;                 // template instance unique identifier - generated
    templateId;          // template id
    fn;
    statics;
    argIndexes;
    refreshLog;          // instruction set generated during last refresh call
    srcNd;               // current node - node used as reference during the refresh process
    srcNdDepth;          // current node depth
    rootNd;              // rootNode
    ancestorNodes;       // array of the nodes in the current path
    targetDepth;         // tells at which depth next node should be (0 = root)
    creationMode;        // fast track for node creation
    creationModeTarget;  // force creation mode until a certain target is reached
    ignoreTemplateNode;  // true when the template is called from another template that has already created the template node
    nodeCount;           // internal counter used to create unique references

    constructor(templateData, pkg, instanceUID) {
        this.pkg = pkg;
        this.ref = instanceUID;
        this.fn = templateData.templateFn;
        this.statics = templateData.templateStatics;
        this.argIndexes = templateData.templateArgIdx;
        this.templateId = templateData.templateId;
        this.nodeCount = 0;
    }

    refresh(argMap, context) {
        var groupNode = context.groupNode;
        this.refreshLog = new IvUpdateInstructionSet();
        // fake a node to bootstrap the chain
        this.srcNd = null;
        this.srcNdDepth = 0;
        this.targetDepth = 0;
        this.ancestorNodes = [];


        if (context.creationMode || !groupNode) {
            this.creationMode = true;
            this.creationModeTarget = 0;
        } else {
            this.creationMode = false;
            this.creationModeTarget = -1;
        }
        if (groupNode) {
            this.ignoreTemplateNode = true;
            this.srcNd = groupNode;
            this.ancestorNodes.push(groupNode);
            this.rootNd = groupNode;
        } else {
            this.ignoreTemplateNode = false;
        }

        var args = [this], argsIdx = this.argIndexes;
        for (var k in argMap) {
            if (argMap.hasOwnProperty(k)) {
                args[argsIdx[k] + 1] = argMap[k];
            }
        }

        // call the template function
        this.fn.apply(null, args); // this will call the marker methods ns(), ne(), t(), bs()...

        this.refreshLog.finalized = true;
        return this.rootNd;
    }

    advance(targetIdx) {
        var nextNode;
        if (this.srcNdDepth < this.targetDepth) {
            // we have to look for next node in the child list
            var nd = this.srcNd;
            nextNode = nd.firstChild;
            while (nextNode && nextNode.index < targetIdx) {
                this.deleteFirstChild(targetIdx, nd);
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
            this.deleteNextNode(targetIdx, nd);
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
     * Return a new unique node reference
     */
    getNewNodeRef() {
        return `${this.ref}:${this.nodeCount++}`;
    }

    /**
     * Template start
     * @param idx
     */
    ts(idx) {
        if (!this.ignoreTemplateNode) {
            if (this.creationMode) {
                // creation fast track
                this.createGroupNode(idx, "template");
            } else {
                if (!this.advance(idx)) {
                    this.createGroupNode(idx, "template");
                }
            }
        }
        this.targetDepth++;
    }

    /**
     * Template end
     * @param idx
     */
    te(idx) {
        if (this.creationMode) {
            if (idx === this.creationModeTarget) {
                // reset forced creation flags
                this.creationMode = false;
                this.creationModeTarget = -1;
            }
        }
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
        if (this.creationMode) {
            // creation fast track
            this.createEltNode(idx, dAttributes, sAttributes);
        } else {
            if (this.advance(idx)) {
                // update
                this.updateEltNode(this.srcNd, dAttributes);
            } else {
                this.throwError(idx, "Invalid case"); // force creation should have been activated and we should not get here
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
        if (!this.creationMode) {
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
     * Component start
     * @param idx
     * @param hasChildren
     * @param dAttributes
     * @param sAttributes
     */
    cs(idx, hasChildren, dAttributes, sAttributes) {
        if (!hasChildren) {
            if (this.creationMode) {
                this.createCptNode(idx, dAttributes, sAttributes);
                this.generateCptView(idx, this.srcNd);
            } else {
                if (this.advance(idx)) {
                    this.updateCptNode(this.srcNd, dAttributes);
                } else {
                    this.throwError(idx, "Invalid case"); // force creation should have been activated and we should not get here
                }
            }
        } else {
            // node has child nodes
            if (this.creationMode) {
                this.createCptNode(idx, dAttributes, sAttributes);
            } else {
                if (this.advance(idx)) {
                    // swap content node / view node
                    var cptNd = this.srcNd;
                    cptNd.data.viewDom = cptNd.firstChild;
                    cptNd.data.dAttributes = dAttributes;
                    cptNd.firstChild = cptNd.data.contentDom.firstChild; // todo is it necessary to keep the parent group?

                    // then trigger update of the view node in ce()
                } else {
                    this.throwError(idx, "Invalid case"); // force creation should have been activated and we should not get here
                }
            }
            this.targetDepth++;
        }
    }

    /**
     * Component end
     * @param idx
     */
    ce(idx) {
        // we are in the case where the component has children
        this.ne(idx);

        var cptNd = this.srcNd;
        if (this.creationMode) {
            var contentGroup = new IvGroupNode(idx, null, "content"); // TODO parent?
            contentGroup.firstChild = cptNd.firstChild;
            cptNd.data.contentDom = contentGroup;
            cptNd.firstChild = null;

            // generate view nodes
            cptNd.data.attributes["content"] = contentGroup.firstChild;
            this.generateCptView(idx, cptNd);
        } else {
            var contentNd = cptNd.firstChild;
            cptNd.firstChild = cptNd.data.viewDom;
            cptNd.data.contentDom.firstChild = contentNd;

            // update view nodes
            this.updateCptNode(cptNd, cptNd.data.dAttributes, ["content", contentNd]);
        }
    }

    /**
     * Attribute node start - e.g. <div @tab idx=3>
     * @param idx
     * @param hasChildren
     * @param dAttributes
     * @param sAttributes
     */
    as(idx, hasChildren, dAttributes, sAttributes) {
        if (this.creationMode) {
            this.createGroupNode(idx, "@node");
            // todo update attributes
        } else {
            if (this.advance(idx)) {
                // todo update dynamic attributes
            } else {
                this.throwError(idx, "Invalid case"); // force creation should have been activated and we should not get here
            }
        }

        if (hasChildren) {
            this.targetDepth++;
        } else {
            this.setCurrentAttNodeAsParentAttribute(idx);
        }
    }

    /**
     * Attribute node end
     * @param idx
     */
    ae(idx) {
        this.ne(idx);
        this.setCurrentAttNodeAsParentAttribute(idx);
    }

    /**
     * Mark the beginning of a js block (Block Start)
     * @param idx the node index
     */
    bs(idx) {
        if (this.creationMode) {
            // creation fast track
            this.createGroupNode(idx, "js");
        } else {
            if (!this.advance(idx)) {
                this.creationMode = true;
                this.creationModeTarget = idx;
                this.createGroupNode(idx, "js");
            }
        }
        this.targetDepth++;
    }

    /**
     * Mark the end of a js block (Block End)
     * @param idx the node index
     */
    be(idx) {
        if (this.creationMode) {
            if (idx === this.creationModeTarget) {
                // reset forced creation flags
                this.creationMode = false;
                this.creationModeTarget = -1;
            }
        }
        this.ne(idx);
    }

    /**
     * Mark a static text node
     * @param idx the node index
     */
    t(idx) {
        if (this.creationMode) {
            this.createTextNode(idx);
        } else {
            if (!this.advance(idx)) {
                this.createTextNode(idx);
            }
            // text nodes are static - so no update needed
        }
    }

    /**
     * Insert statement
     * @param idx
     * @param content
     */
    ins(idx, content) {
        if (this.creationMode) {
            this.createInsertNode(idx, content);
        } else {
            if (this.advance(idx)) {
                this.updateInsertNode(this.srcNd, content);
            } else {
                this.throwError(idx, "Invalid case"); // force creation should have been activated and we should not get here
            }
        }
    }

    /**
     * Delete the first child of a node
     * @param nd
     */
    deleteFirstChild(idx, nd) {
        var ch = nd.firstChild;
        if (ch) {
            var ns = ch.nextSibling;
            if (ns) {
                nd.firstChild = ns;
                var ns2 = ns.nextSibling;
                while (ns2) {
                    //ns2.firstSibling = ns;
                    ns2 = ns2.nextSibling;
                }
            } else {
                nd.firstChild = null;
            }
            if (ch.isGroupNode) {
                this.refreshLog.addInstruction(INSTRUCTION_DELETE_GROUP, ch);
            }
        }
    }

    /**
     * Delete the next sibling of a node
     * @param nd
     */
    deleteNextNode(idx, nd) {
        var nextNode = nd.nextSibling;
        if (nextNode) {
            nd.nextSibling = nextNode.nextSibling || null;
            if (nextNode.isGroupNode) {
                this.refreshLog.addInstruction(INSTRUCTION_DELETE_GROUP, nextNode);
            }
        }
    }

    setCurrentAttNodeAsParentAttribute(idx) {
        // todo create attribute wrapper and add it to the parent's node
        var attNode = this.srcNd;
        var parentNode = this.ancestorNodes[this.ancestorNodes.length - 2];

        // todo create different kind of wrappers depending on content type

        if (parentNode.data && parentNode.data.template) {
            // parentNode is a component
            var ivTemplate = parentNode.data.template, // template factory
                attName = this.statics[idx][2],
                attType = ivTemplate.templateData.templateArgTypes[attName];

            var attWrapper;
            if (!attType) {
                this.throwError(idx, "Type description not found for the '" + attName + "' attribute -  IvNode or IvObject expected");
            }
            if (attType === "IvNode") {
                attWrapper = attNode.firstChild;
            } else if (attType === "IvObject") {
                attWrapper = {content: attNode.firstChild};
            } else {
                this.throwError(idx, "Invalid type for the '" + attName + "' attribute: " + attType);
            }

            parentNode.data.attributes[this.statics[idx][2]] = attWrapper;
        } else {
            throw "TODO invalid att node parent"; // todo support attnode as parent
        }

        // parentNode should be a component or another att node
    }

    /**
     * Create a text node and append it to the current vdom
     * @param idx
     */
    createTextNode(idx) {
        this.appendNode(new IvTextNode(idx, this.statics[idx][2]));
    }

    /**
     * Create a group node and append it to the current vdom
     * @param idx
     * @param label {String} the group type (e.g. "insert", "template", etc.)
     * @returns {IvGroupNode}
     */
    createGroupNode(idx, label) {
        var gn = new IvGroupNode(idx, null, label);
        gn.ref = this.getNewNodeRef();
        this.appendNode(gn);
        if (idx === this.creationModeTarget) {
            // we are in creation mode and the current group is the root of the new nodes
            this.refreshLog.addInstruction(INSTRUCTION_CREATE_GROUP, gn);
        }
        return gn;
    }

    createInsertNode(idx, content) {
        // create a group node
        var nd = this.createGroupNode(idx, "insert");
        content = this.checkInsertContent(content);

        // if content is a piece of text, create a text node
        if (!content.isNode) {
            // text node
            content = new IvTextNode(-1, "" + content);
        }

        // set the content as group child nodes
        nd.firstChild = content;
    }

    updateInsertNode(nd, content) {
        var ch = nd.firstChild;
        content = this.checkInsertContent(content);
        if (ch.isTextNode) {
            if (ch.index === -1) {
                // update text
                ch.value = content;
                this.refreshLog.addInstruction(INSTRUCTION_REPLACE_GROUP, nd);
            } else {
                throw "todo 2";
            }
        }
    }

    checkInsertContent(content) {
        if (content && content.isNode) {
            return content
        } else {
            if (!content) {
                return "";
            }
            return (typeof content === "object") ? "" : "" + content;
        }
    }

    /**
     * Create and initialize the group node associated to a component / sub-template
     * @param idx
     * @param dAttributes
     * @param sAttributes
     */
    createCptNode(idx, dAttributes, sAttributes) {
        // create a group node as container for the component
        var statics = this.statics[idx],
            tpl = this.pkg[statics[2]],
            nd = this.createGroupNode(idx, statics[2]);
        if (!tpl) {
            // we should not get there as template has already been identified earlier
            // unless dynamic injection is used to change the package reference
            this.throwError(idx, "Invalid component reference: " + statics[2]); // todo test
        }
        nd.data = {
            template: tpl,
            attributes: {},      // attribute map
            view: null,          // view object generated by the cpt template
            contentDom: null,    // content vdom - generated by the current template
            viewDom: null        // view vdom firstChild
        };
        this.setNodeAttributes(nd, statics, dAttributes, sAttributes);
    }

    /**
     * Generate the view instance associated to a sub-component / sub-template
     * This view with then be stored as meta-data of the component's group node
     * @param idx
     * @param cptNd
     */
    generateCptView(idx, cptNd) {
        var atts = cptNd.data.attributes, att = cptNd.firstAttribute, view;
        // update attributes
        while (att) {
            if (!atts[att.name]) {
                atts[att.name] = att.value;
            }
            att = att.nextSibling;
        }
        view = cptNd.data.template.apply(atts, {creationMode: true, groupNode: cptNd});
        cptNd.data.view = view;
        cptNd.data.attributes = atts;
        cptNd.data.viewDom = view.vdom.firstChild;
    }

    /**
     * Update a component node - i.e. update its arguments and refresh its view
     * @param cptNd
     * @param dAttributes
     * @param nodeAttributes
     */
    updateCptNode(cptNd, dAttributes, nodeAttributes) {
        if (!cptNd.data || !cptNd.data.view) {
            throw "Invalid component node"; // todo provide more details + test
        }
        var atts = cptNd.data.attributes;
        if (dAttributes) {
            var nm, val, changed = false;
            for (var i = 0; dAttributes.length > i; i += 2) {
                nm = dAttributes[i];
                val = dAttributes[i + 1];
                if (atts[nm] !== val) {
                    atts[nm] = val;
                    changed = true;
                }
            }
            if (changed) {
                this.refreshLog.addInstruction(INSTRUCTION_UPDATE_GROUP, cptNd);
            }
        }
        if (nodeAttributes) {
            // node attributes are attribute of type IvNode - e.g. content
            for (var j = 0; dAttributes.length > j; j += 2) {
                atts[nodeAttributes[j]] = nodeAttributes[j + 1];
            }
        }
        // todo check if template is pure function and skip refresh
        var view = cptNd.data.view;
        view.refresh(atts, {creationMode: false, groupNode: cptNd});
        this.refreshLog.concat(view.refreshLog);
        cptNd.data.viewDom = view.vdom.firstChild;
    }

    /**
     * Create a new element node and append it to the vdom
     * @param idx
     * @param dAttributes dynamic attributes
     * @param sAttributes static attributes defined through a dynamic js expression
     */
    createEltNode(idx, dAttributes, sAttributes) {
        var statics = this.statics[idx], nd = new IvEltNode(idx, statics[2]);
        this.setNodeAttributes(nd, statics, dAttributes, sAttributes);
        this.appendNode(nd);
        if (dAttributes) {
            nd.ref = this.getNewNodeRef();
        }
    }

    /**
     * Set all attributes on a given element or group node
     * @param nd
     * @param statics
     * @param dAttributes
     * @param sAttributes
     */
    setNodeAttributes(nd, statics, dAttributes, sAttributes) {
        var i, atts = (nd.isGroupNode) ? nd.data.attributes : nd.attributes;

        // dynamic attributes first
        if (dAttributes) {
            var initDynAtts = nd.isElementNode && nd.dynAttributes === null;
            if (initDynAtts) {
                nd.dynAttributes = [];
            }
            for (i = 0; dAttributes.length > i; i += 2) {
                atts[dAttributes[i]] = dAttributes[i + 1];
                if (initDynAtts) {
                    nd.dynAttributes.push(dAttributes[i]);
                }
            }
        }
        // static attributes from statics array
        var sAtts = statics[3];
        if (sAtts) {
            for (i = 0; sAtts.length > i; i += 2) {
                atts[sAtts[i]] = sAtts[i + 1];
            }
        }
        // static attributes from arguments (i.e. using js expressions)
        if (sAttributes) {
            for (i = 0; sAttributes.length > i; i += 2) {
                atts[sAttributes[i]] = sAttributes[i + 1];
            }
        }
    }

    /**
     * Update the dynamic attributes of an element node
     * @param nd
     * @param dAttributes
     */
    updateEltNode(nd, dAttributes) {
        if (dAttributes) {
            var atts = nd.attributes, v1, v2, createInstruction = false;
            for (var i = 0; dAttributes.length > i; i += 2) {
                v1 = atts[dAttributes[i]];
                v2 = dAttributes[i + 1];
                if (v1 !== v2) {
                    createInstruction = true;
                    atts[dAttributes[i]] = v2;
                }
            }
            if (createInstruction) {
                this.refreshLog.addInstruction(INSTRUCTION_UPDATE_ELEMENT, nd);
            }
        }
    }

    /**
     * Append a node to the last node that has been processed
     * Depending on the targetDepth value the node will be added as a first child or has a sibling of the last
     * processed node
     * @param nd
     */
    appendNode(nd) {
        var anNodes = this.ancestorNodes, anLength = anNodes.length;
        if (anLength === 0) {
            // root node
            anNodes[0] = nd;
            this.srcNd = nd;
            this.rootNd = nd;
        } else {
            var prev = anNodes[anLength - 1];
            if (this.targetDepth >= anLength) {
                // insert as first child
                var currentFirstChild = prev.firstChild;
                prev.firstChild = nd;
                if (currentFirstChild) {
                    nd.nextSibling = currentFirstChild;
                }
                this.srcNd = nd;
                this.srcNdDepth++;
                anNodes.push(nd);
            } else {
                // add as sibling
                nd.nextSibling = prev.nextSibling;
                prev.nextSibling = nd;
                anNodes[anLength - 1] = nd;
                this.srcNd = nd;
            }
        }
    }

    throwError(idx, msg) {
        var err = new IvError(msg);
        err.nodeIdx = idx;
        err.statics = this.statics;
        err.pkg = this.pkg;
        err.templateId = this.templateId;
        throw err;
    }
}

/**
 * Expose the $template function for template pre-compilation
 * @type Function
 */
iv.$template = function (templateData) {
    return new IvTemplate(templateData);
};

const INSTRUCTION_CREATE_GROUP = 1,
    INSTRUCTION_DELETE_GROUP = 2,
    INSTRUCTION_REPLACE_GROUP = 3,
    INSTRUCTION_UPDATE_GROUP = 4,
    INSTRUCTION_UPDATE_ELEMENT = 5;

export const INSTRUCTIONS = {
    "CREATE_GROUP": INSTRUCTION_CREATE_GROUP,
    "DELETE_GROUP": INSTRUCTION_DELETE_GROUP,
    "REPLACE_GROUP": INSTRUCTION_REPLACE_GROUP,
    "UPDATE_GROUP": INSTRUCTION_UPDATE_GROUP,
    "UPDATE_ELEMENT": INSTRUCTION_UPDATE_ELEMENT
}

class IvUpdateInstructionSet {
    finalized;      // true when all instructions have been added to the list\
    changes;        // list of changes
    unchangedRefs;  // list of node refs that haven't been changed and that must be kept (allows for delete optimization)

    constructor() {
        this.finalized = false;
        this.changes = [];
        this.unchangedRefs = [];
    }

    /**
     * Add a new instruction to the instruction set
     * @param type {number} an instruction set - cf INSTRUCTIONS
     * @param node {IvNode} the node associated to the instruction
     */
    addInstruction(type, node) {
        this.changes.push({
            type: type,
            node: node
        });
    }

    /**
     * Tells that a node is still referenced even though it may not require any update
     * Allows to discard unused reference in the VDOM renderer
     * @param node
     */
    addUnchangedNode(node) {
        // todo
    }

    /**
     * Concat a 2nd set of instructions with the current set
     * Used to concat sub-template / sub-component instructions in the parent set
     * @param instructionSet2
     */
    concat(instructionSet2) {
        if (instructionSet2.changes.length > 0) {
            this.hasCreations = this.hasCreations || instructionSet2.hasCreations;
            this.hasUpdates = this.hasUpdates || instructionSet2.hasUpdates;
            this.hasDeletions = this.hasDeletions || instructionSet2.hasDeletions;
            this.changes = this.changes.concat(instructionSet2.changes);
            this.unchangedRefs = this.unchangedRefs.concat(instructionSet2.unchangedRefs);
        }
    }

    toString(options = {indent: ""}) {
        var lines = [], TYPES = [], instr;
        TYPES[INSTRUCTION_CREATE_GROUP] = "CREATE_GROUP";
        TYPES[INSTRUCTION_DELETE_GROUP] = "DELETE_GROUP";
        TYPES[INSTRUCTION_REPLACE_GROUP] = "REPLACE_GROUP";
        TYPES[INSTRUCTION_UPDATE_GROUP] = "UPDATE_GROUP";
        TYPES[INSTRUCTION_UPDATE_ELEMENT] = "UPDATE_ELEMENT";

        for (var i = 0; this.changes.length > i; i++) {
            instr = this.changes[i];
            lines.push([options.indent, TYPES[instr.type], ": ", instr.node.ref].join(""));
        }
        return lines.join("\n");
    }
}