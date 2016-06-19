/**
 * Main iv library
 * Copyright Bertrand Laporte 2016
 */

/* global console */
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
    console.error(error.description());
}

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
     * @param templateData the result of the template compilation - cf. nac2js compiler
     * @param pkg package containing this template
     */
    constructor(templateData, pkg) {
        this.templateData = templateData;
        this.uid = "T" + (IvTemplate.templateCount++);
        this.pkg = pkg;
    }

    apply(argMap, context) {
        var p = new IvProcessor(this.templateData, this.pkg, this.uid),
            view = {
                vdom: null,
                refreshLog: null,
                // hide the processor in the function closure
                refresh: function (argMap, context) {
                    try {
                        this.vdom = p.refresh(argMap, context || {groupNode: this.vdom});
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
    templateUID;         // template unique identifier - generated
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

    constructor(templateData, pkg, templateUID) {
        this.pkg = pkg;
        this.templateUID = templateUID;
        this.fn = templateData.templateFn;
        this.statics = templateData.templateStatics;
        this.argIndexes = templateData.templateArgIdx;
        this.templateId = templateData.templateId;
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

        return this.rootNd;
    }

    advance(targetIdx) {
        var nextNode;
        if (this.srcNdDepth < this.targetDepth) {
            // we have to look for next node in the child list
            var nd = this.srcNd;
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
            var cptNd = this.srcNd;
            var contentGroup = new NacNode(NacNodeType.ELEMENT);
            contentGroup.nodeName = "#group";
            contentGroup.nodeValue = "content"; // debug help
            contentGroup.index = idx;
            contentGroup.firstChild = cptNd.firstChild;
            // todo: contentNd.firstChild.parentNode?
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
     * Attribute node start
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
                this.createGroupNode(idx, "js");
                this.creationMode = true;
                this.creationModeTarget = idx;
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
            throw "TODO invalid att node parent" // todo support attnode as parent
        }

        // parentNode should be a component or another att node
    }

    createTextNode(idx) {
        var nd = new NacNode(NacNodeType.TEXT, this.statics[idx][2]);
        nd.index = idx;
        this.appendNode(nd);
    }

    createGroupNode(idx, label) {
        var nd = new NacNode(NacNodeType.ELEMENT);
        nd.nodeName = "#group";
        nd.nodeValue = label; // debug help
        nd.index = idx;
        this.appendNode(nd);
    }

    createInsertNode(idx, content) {
        // create a group node
        var nd = new NacNode(NacNodeType.ELEMENT);
        content = this.checkInsertContent(content);
        nd.nodeName = "#group";
        nd.nodeValue = "insert"; // debug help
        nd.index = idx;
        this.appendNode(nd);

        // if content is a piece of text, create a text node
        if (!content.firstSibling) {
            // text node
            content = new NacNode(NacNodeType.TEXT, "" + content, nd);
            content.index = -1;
        }

        // set the content as group child nodes
        // todo set parentNode - is it really useful?
        nd.firstChild = content;
        content.parentNode = nd;
    }

    updateInsertNode(nd, content) {
        var content = this.checkInsertContent(content),
            textType = NacNodeType.TEXT,
            ch = nd.firstChild;

        if (ch.nodeType === textType) {
            if (ch.index === -1) {
                // update text
                ch.nodeValue = content;
            } else {
                throw "todo 2";
            }
        }
    }

    checkInsertContent(content) {
        if (content && content.firstSibling) {
            return content
        } else {
            if (!content) {
                return "";
            }
            return (typeof content === "object") ? "" : "" + content;
        }
    }

    createCptNode(idx, dAttributes, sAttributes) {
        // create a group node as container for the component
        var statics = this.statics[idx], nd = new NacNode(NacNodeType.ELEMENT);
        nd.nodeName = "#group";
        nd.nodeValue = statics[2];
        nd.index = idx;
        this.setNodeAttributes(nd, statics, dAttributes, sAttributes);

        var tpl = this.pkg[statics[2]];
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
        }
        this.appendNode(nd);
    }

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

    updateCptNode(cptNd, dAttributes, nodeAttributes) {
        if (!cptNd.data || !cptNd.data.view) {
            throw "Invalid component node"; // todo provide more details + test
        }
        var atts = cptNd.data.attributes;
        if (dAttributes) {
            // attributes are created in the same order as they are in the dAttributes list
            var att = cptNd.firstAttribute, val;
            for (var i = 0; dAttributes.length > i; i += 2) {
                val = dAttributes[i + 1];
                atts[dAttributes[i]] = val;
                att.value = val;
                att = att.nextSibling;
            }
            cptNd.data.attributes = atts;
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
        cptNd.data.viewDom = view.vdom.firstChild;
    }

    createEltNode(idx, dAttributes, sAttributes) {
        var statics = this.statics[idx], nd = new NacNode(statics[1]);
        nd.nodeName = statics[2];
        nd.index = idx;
        this.setNodeAttributes(nd, statics, dAttributes, sAttributes);
        this.appendNode(nd);
    }

    setNodeAttributes(nd, statics, dAttributes, sAttributes) {
        var i;
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
            this.rootNd = nd;
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

var INSTRUCTION_CREATE_GROUP = 1,
    INSTRUCTION_DELETE_GROUP = 2,
    INSTRUCTION_UPDATE_NODE = 3;

class IvUpdateInstruction {
    // parentRef: string; // used for create and delete, undefined for update
    // parentChildIndex: number = -1; // used for create and delete, -1 for update
    // changedAttributes: any[] = null; // used by update for element nodes
    //
    // constructor(public type: IvUpdateInstructionType, public node: IvNode) { };
}

class IvUpdateInstructionSet {
    finalized;      // true when all instructions have been added to the list
    hasCreations;   // true if contains create instructions
    hasUpdates;     // true if contains create instructions
    hasDeletions;   // true if contains delete instructions
    changes;        // list of changes
    unchangedRefs;  // list of node refs that haven't been changed and that must be kept (allows for delete optimization)

    constructor() {
        this.finalized = false;
        this.hasCreations = false;
        this.hasUpdates = false;
        this.hasDeletions = false;
        this.changes = [];
        this.unchangedRefs = [];
    }

    //
    // /**
    //  * Add a create instruction
    //  * @param node {NacNode}
    //  */
    // addCreate(node) {
    //     var ins = new IvUpdateInstruction(IvUpdateInstructionType.CREATE, node),
    //         pnd = node.parentNode;
    //     ins.parentRef = pnd.ref;
    //     ins.parentChildIndex = pnd.childCursor - 1; // childCursor has already been incremented
    //     this.changes.push(ins);
    //     this.hasCreations = true;
    // };
    //
    // /**
    //  * Add an update instruction
    //  */
    // addUpdate(node: IvNode, updateRes: any) {
    //     if (node.nodeType !== IvNodeType.MARKER_NODE) {
    //         var ins = new IvUpdateInstruction(IvUpdateInstructionType.UPDATE, node);
    //         if (updateRes !== true) {
    //             ins.changedAttributes = updateRes;
    //         }
    //         this.changes.push(ins);
    //         this.hasUpdates = true;
    //     }
    // };
    //
    // /**
    //  * Add a delete instruction
    //  */
    // addDelete(node: IvNode) {
    //     if (node.nodeType !== IvNodeType.MARKER_NODE) {
    //         var ins = new IvUpdateInstruction(IvUpdateInstructionType.DELETE, node),
    //             pnd = node.parentNode;
    //         ins.parentRef = pnd.ref;
    //         ins.parentChildIndex = pnd.childCursor;
    //         this.changes.push(ins);
    //         this.hasDeletions = true;
    //     }
    // };
    //
    // /**
    //  * Add a node to the unchanged list
    //  */
    // addUnchanged(nodeRef: string) {
    //     if (nodeRef) {
    //         this.unchangedRefs.push(nodeRef);
    //     }
    // }
}