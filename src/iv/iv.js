/**
 * Main iv library
 * Copyright Bertrand Laporte 2016
 */

/* global console */
import {NacNodeType} from './nac';
import {parse} from './parser';
import {compile} from './nac2js';
import {IvGroupNode, IvEltNode, IvTextNode} from './node';
import {IvInstructionPool, INSTRUCTIONS, IvInstructionSet} from './instructions';

var MAX_INDEX = Number.MAX_VALUE;
var instructionPool = new IvInstructionPool();

const INSTRUCTION_CREATE_GROUP = INSTRUCTIONS.CREATE_GROUP,
    INSTRUCTION_DELETE_GROUP = INSTRUCTIONS.DELETE_GROUP,
    INSTRUCTION_REPLACE_GROUP = INSTRUCTIONS.REPLACE_GROUP,
    INSTRUCTION_UPDATE_GROUP = INSTRUCTIONS.UPDATE_GROUP,
    INSTRUCTION_UPDATE_ELEMENT = INSTRUCTIONS.UPDATE_ELEMENT,
    INSTRUCTION_UPDATE_TEXT = INSTRUCTIONS.UPDATE_TEXT;

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
        throw `(${r.error.line}:${r.error.column}) ${r.error.description}`;
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
                renderer: null,

                // hide the processor in the function closure
                refresh: function (argMap, context) {
                    this.refreshLog = new IvInstructionSet();
                    try {
                        this.vdom = p.refresh(argMap, context || {groupNode: this.vdom});
                        this.refreshLog.setChanges(this.vdom.firstChange);
                        if (this.renderer) {
                            this.renderer.processRefreshLog(this.refreshLog);
                        }
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
    fn;                  // template function
    statics;             // template statics data
    argIndexes;          // template argument indexes - i.e. map of "argName":argIndex (e.g. "msg":0)
    currentNd;           // current node - last node processed during the refresh process
    currentNdDepth;      // current node depth = index of currentNd in ancestorNodes - equivalent to ancestorNodes length-1
    currentParentNd;     // parent of the current node
    rootNd;              // rootNode - equivalent to ancestorNodes[0]
    ancestorNodes;       // array of the nodes in the current path
    targetDepth;         // tells at which depth next node should be (0 = root)
    creationMode;        // fast track for node creation - activated when we create a new group
    creationModeTarget;  // force creation mode until a certain target is reached, then move creationMode back to false
    ignoreTemplateNode;  // true when the template is called from another template that has already created the template node
    nodeCount;           // internal counter used to create unique references

    constructor(templateData, pkg, templateRef) {
        this.pkg = pkg;
        this.ref = templateRef;
        this.fn = templateData.templateFn;
        this.statics = templateData.templateStatics;
        this.argIndexes = templateData.templateArgIdx;
        this.templateId = templateData.templateId;
        this.nodeCount = 0;
    }

    refresh(argMap, context) {
        var groupNode = context.groupNode, rootNd = this.rootNd;

        // fake a node to bootstrap the chain
        this.currentNd = null;
        this.currentParentNd = null;
        this.currentNdDepth = -1;
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
            this.addAncestor(groupNode);
            this.rootNd = groupNode;
        } else {
            this.ignoreTemplateNode = false;
        }
        if (rootNd) {
            instructionPool.addInstructionList(rootNd.firstChange, rootNd.lastChange);
            rootNd.firstChange = rootNd.lastChange = null;
        }

        var args = [this], argsIdx = this.argIndexes;
        for (var k in argMap) {
            if (argMap.hasOwnProperty(k)) {
                args[argsIdx[k] + 1] = argMap[k];
            }
        }

        // call the template function
        this.fn.apply(null, args); // this will call the marker methods ns(), ne(), t(), bs()...
        this.ancestorNodes = null;

        return this.rootNd;
    }

    /**
     * Moves the current node cursor and deletes useless nodes until the target node index (or a higher index)
     * is reached
     * @param targetIdx {number} the index of the targeted node
     * @returns {Boolean} true the the node corresponding to targetIdx has been found (and is the new currentNd)
     */
    advance(targetIdx) {
        var nextNode;
        if (this.currentNdDepth < this.targetDepth) {
            // we have to look for next node in the child list
            var nd = this.currentNd;
            nextNode = nd.firstChild;
            while (nextNode && nextNode.index < targetIdx) {
                this.deleteFirstChild(targetIdx, nd);
                nextNode = nd.firstChild;
            }

            if (!nextNode) {
                return false;
            }

            if (nextNode.index === targetIdx) {
                this.addAncestor(nextNode);
                return true;
            } else {
                // next node is after the target
                return false;
            }
        } else {
            // next nodes are siblings
            nextNode = this.currentNd.nextSibling;
            if (!nextNode) {
                return false;
            } else {
                if (nextNode.index === targetIdx) {
                    if (this.currentNdDepth === -1) {
                        // we may fall in this case at bootstrap on the very first node
                        this.addAncestor(nextNode);
                    } else {
                        // replace last ancestor node with new node
                        this.replaceLastAncestor(nextNode);
                    }
                    return true;
                } else if (nextNode.index > targetIdx) {
                    // next node is after the target
                    return false;
                }
            }
        }

        // delete all coming elements until the node is found or no more sibling are available
        return this.deleteSiblingsUntil(targetIdx);
    }

    deleteSiblingsUntil(targetIdx) {
        // return true if found
        var nd = this.currentNd, nextNode = nd.nextSibling;
        if (!nextNode) {
            return false;
        }
        while (nextNode && nextNode.index < targetIdx) {
            this.deleteNextNode(targetIdx, nd);
            nd = nextNode;
            nextNode = nd.nextSibling;
        }
        if (nextNode && nextNode.index === targetIdx) {
            this.replaceLastAncestor(nextNode);
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
     * Add a new node to the ancestorNodes stack with keeps the list of current parent nodes
     * This is called when we enter a new element or group node
     * @param node
     */
    addAncestor(node) {
        this.currentParentNd = this.currentNd;
        this.currentNd = node;
        this.currentNdDepth++;
        this.ancestorNodes[this.currentNdDepth] = node;
    }

    /**
     * Replace last node in the ancestorNodes stack
     * @param node
     */
    replaceLastAncestor(node) {
        this.moveChanges(this.currentNd);
        this.ancestorNodes[this.currentNdDepth] = node;
        this.currentNd = node;
    }

    /**
     * Remove last node from the ancestorNodes stack
     * This must be called when we leave a container
     */
    removeLastAncestor() {
        var ans = this.ancestorNodes, prev = this.currentNd;
        var depth = --this.currentNdDepth;
        this.currentNd = ans[this.currentNdDepth];
        this.moveChanges(prev, this.currentNd);
        if (depth > 0) {
            this.currentParentNd = ans[depth - 1];
        } else {
            this.currentParentNd = null;
        }
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
            this.createEltNode(idx, hasChildren, dAttributes, sAttributes);
        } else {
            if (this.advance(idx)) {
                // update
                this.updateEltNode(this.currentNd, dAttributes);
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
            this.deleteSiblingsUntil(MAX_INDEX);
        }
        if (this.currentNdDepth === this.targetDepth) {
            this.removeLastAncestor();
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
                this.generateCptView(idx, this.currentNd);
            } else {
                if (this.advance(idx)) {
                    this.updateCptNode(this.currentNd, dAttributes);
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
                    var cptNd = this.currentNd;
                    cptNd.data.viewDom = cptNd.firstChild;
                    cptNd.data.dAttributes = dAttributes;
                    cptNd.firstChild = cptNd.data.contentDom.firstChild; // todo is it necessary to keep the parent group?

                    // remove unprocessed changes from previous refresh (e.g. changes associated
                    // to a content node that wasn't inserted
                    var ch = cptNd.firstChild;
                    while (ch) {
                        ch.firstChange = ch.lastChange = null;
                        ch = ch.nextSibling;
                    }

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

        var cptNd = this.currentNd;
        if (this.creationMode) {
            var contentGroup = new IvGroupNode(idx, "content");
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
                this.updateInsertNode(this.currentNd, content);
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
                this.addInstruction(INSTRUCTION_DELETE_GROUP, ch);
                this.moveChanges(ch, this.currentNd);
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
                this.addInstruction(INSTRUCTION_DELETE_GROUP, nextNode);
                this.moveChanges(nextNode, this.currentNd);
            }
        }
    }

    setCurrentAttNodeAsParentAttribute(idx) {
        // todo create attribute wrapper and add it to the parent's node
        var attNode = this.currentNd;
        var parentNode = this.ancestorNodes[this.currentNdDepth - 1];

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
    createGroupNode(idx, label, propagateChanges = true) {
        var parentNd = null;
        if (this.targetDepth > this.currentNdDepth) {
            // group will be created as a child of current node
            // group will be created as a child of current node
            parentNd = this.currentNd;
        } else {
            // group will be created as a sibling of current node
            if (this.currentNdDepth > 0) {
                parentNd = this.ancestorNodes[this.currentNdDepth - 1];
            }
        }
        if (parentNd && !parentNd.ref) {
            parentNd.ref = this.getNewNodeRef();
        }

        var gn = new IvGroupNode(idx, label);
        gn.ref = this.getNewNodeRef();
        gn.propagateChanges = propagateChanges;
        this.appendNode(gn);
        if (idx === this.creationModeTarget) {
            // we are in creation mode and the current group is the root of the new nodes
            this.addInstruction(INSTRUCTION_CREATE_GROUP, gn, parentNd);
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
            content.ref = this.getNewNodeRef();
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
                this.addInstruction(INSTRUCTION_UPDATE_TEXT, ch);
                this.moveChanges(ch, nd);
            } else {
                throw "todo 2";
                // this.addInstruction(INSTRUCTION_REPLACE_GROUP, nd);
            }
        } else {
            nd.firstChild = content;
            this.moveChanges(content, nd);
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
            nd = this.createGroupNode(idx, statics[2], false);
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
        cptNd.propagateChanges = true;
        view = cptNd.data.template.apply(atts, {creationMode: true, groupNode: cptNd});
        cptNd.propagateChanges = false;
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
                this.addInstruction(INSTRUCTION_UPDATE_GROUP, cptNd);
                this.moveChanges(cptNd);
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
        cptNd.propagateChanges = true;
        view.refresh(atts, {creationMode: false, groupNode: cptNd});
        cptNd.propagateChanges = false;

        cptNd.data.viewDom = view.vdom.firstChild;
    }

    /**
     * Create a new element node and append it to the vdom
     * @param idx
     * @param hasChidren tell if this element node may contain children
     * @param dAttributes dynamic attributes
     * @param sAttributes static attributes defined through a dynamic js expression
     */
    createEltNode(idx, hasChildren, dAttributes, sAttributes) {
        var statics = this.statics[idx], nd = new IvEltNode(idx, statics[2]);
        this.setNodeAttributes(nd, statics, dAttributes, sAttributes);
        this.appendNode(nd);
        if (hasChildren || dAttributes) {
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
                this.addInstruction(INSTRUCTION_UPDATE_ELEMENT, nd);
            }
        }
    }

    /**
     * Append a node to the last node that has been processed
     * Depending on the targetDepth value, the node will be added as a first child or has a sibling
     * of the last processed node
     * @param nd
     */
    appendNode(nd) {
        if (this.currentNdDepth === -1) {
            // root node - currentNd not initialized yet
            this.addAncestor(nd);
            this.rootNd = nd;
        } else {
            var prev = this.currentNd;
            if (this.targetDepth > this.currentNdDepth) {
                // insert as first child
                var currentFirstChild = prev.firstChild;
                prev.firstChild = nd;
                if (currentFirstChild) {
                    nd.nextSibling = currentFirstChild;
                }
                this.addAncestor(nd);
            } else {
                // add as sibling
                nd.nextSibling = prev.nextSibling;
                prev.nextSibling = nd;
                this.replaceLastAncestor(nd);
            }
        }
    }

    /**
     * Add a new instruction to the instruction log
     * The node associated to this instruction should be part of the child node tree (i.e. no necessarily a direct child)
     * @param type {number} an instruction set - cf INSTRUCTIONS
     * @param node {IvNode} the node associated to the instruction
     * @param parentNode {IvNode} parent node where the instruction applies (only for create)
     */
    addInstruction(type, node, parentNode = null) {
        var ins = instructionPool.getInstruction(type, node, parentNode);
        if (type === INSTRUCTION_DELETE_GROUP) {
            ins.deletedRefNodes = [];
            getRefNodes(ins.node, ins.deletedRefNodes);
        }
        if (!node.firstChange) {
            node.firstChange = node.lastChange = ins;
        } else {
            node.lastChange.next = ins;
            node.lastChange = ins;
        }
    }

    /**
     * Move change instructions from node1 to node2
     * node1 changes will be concatenated to node2, and node1 changes will be emptied afterwards
     * if node2 is null, it will be defaulted to currentParentNd or rootNd
     * @param node1
     * @param node2
     */
    moveChanges(node1, node2 = null) {
        if (node1.lastChange) {
            if (!node2) {
                node2 = this.currentParentNd || this.rootNd;
            }
            if (node2 && node2.propagateChanges) {
                if (!node2.firstChange) {
                    node2.firstChange = node1.firstChange;
                    node2.lastChange = node1.lastChange;
                } else {
                    node2.lastChange.next = node1.firstChange;
                    node2.lastChange = node1.lastChange;
                }
                node1.firstChange = node1.lastChange = null;
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


/**
 * Get all the nodes that have a reference in a tree of nodes
 * @param node the root node
 * @param result {Array} the array where the nodes will be pushed
 */
function getRefNodes(node, result) {
    if (node.ref) {
        result.push(node);
    }
    var ch = node.firstChild;
    while (ch) {
        getRefNodes(ch, result);
        ch = ch.nextSibling;
    }
}
