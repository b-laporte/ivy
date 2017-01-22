/**
 * Main iv library
 * Copyright Bertrand Laporte 2016
 */

/* global console */
import {NacNodeType} from './nac';
import {parse} from './parser';
import {compile} from './compiler';
import {IvNode, IvContent, IvFunctionNode, IvGroupNode, IvDataNode, IvEltNode, IvTextNode} from './node';
import {IvInstructionPool, INSTRUCTIONS, IvInstructionSet} from './instructions';
import {IvTypeMap, IvController} from './typedef';

const MAX_INDEX = Number.MAX_VALUE;
let instructionPool = new IvInstructionPool();

const INSTRUCTION_CREATE_GROUP = INSTRUCTIONS.CREATE_GROUP,
    INSTRUCTION_DELETE_GROUP = INSTRUCTIONS.DELETE_GROUP,
    INSTRUCTION_REPLACE_GROUP = INSTRUCTIONS.REPLACE_GROUP,
    INSTRUCTION_UPDATE_GROUP = INSTRUCTIONS.UPDATE_GROUP,
    INSTRUCTION_UPDATE_ELEMENT = INSTRUCTIONS.UPDATE_ELEMENT,
    INSTRUCTION_UPDATE_TEXT = INSTRUCTIONS.UPDATE_TEXT,
    ST_IDX_NODE_TYPE = 1,
    ST_IDX_LINE_NBR = 2,
    ST_IDX_NODE_NAME = 3,
    ST_IDX_STATIC_ATTRIBUTES = 4,
    ST_IDX_CONTEXT_IDX = 5,
    ST_IDX_TYPE_REF = 6;

/**
 * Compile an iv package
 * @param strings the iv templates contained in the package
 * @param values the external values to be integrated in the package
 * @returns Object a Map of the different templates included the package - template ids are used as keys
 */
export function iv(strings, ...values) {
    // parse and compile
    let r = parse(strings, values);
    if (r.error) {
        let err = new IvError(r.error.description);
        err.lineNbr = r.error.lineNbr;
        err.columnNbr = r.error.columnNbr;
        err.fileName = r.error.fileName;
        iv.log(err);
        return null;
    }

    let p;
    try {
        p = compile(r.nac, true, 1, r.lineNbrShift, r.fileName);
    } catch (e) {
        if (e.description) {
            let err = new IvError(e.description);
            err.contextInfo = e.contextInfo;
            err.lineNbr = e.lineNbr;
            err.fileName = e.fileName;
            iv.log(err);
        } else {
            iv.log(e);
        }
        return null;
    }
    // load the package
    return p.$fn(ivPkgProcessor, values, iv);
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
 * Processor object passed to the package function
 */
let ivPkgProcessor = {
    // function node
    fn(idx, func, statics) {
        return new IvFunctionNode(idx, func, statics);
    },

    // type definition
    // e.g. $c.td(123, ["name", String], ["optionList", "option", String], "contentName", "contentList")
    td (lineNbr, simpleAtts, listAtts, contentName, contentListName) {
        let def = new IvTypeMap();
        def.loadDefinition(lineNbr, simpleAtts, listAtts, contentName, contentListName);
        return def;
    }
};

/**
 * Inject view creation function on the IvFunctionNode
 * @param funcNode
 * @param argMap
 * @param context
 * @returns {{vdom: null, refreshLog: null, renderer: null, refresh: view.refresh, log: (function(*=))}}
 */
IvFunctionNode.createViewFn = function (funcNode, argMap, context) {
    let p = new IvProcessor(funcNode, funcNode.uid + ":" + (funcNode.templateData.instanceCount++)),
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
};

class IvError {
    message;        // error message
    lineNbr;        // line number
    columnNbr;      // column number
    contextInfo;    // short additional context information (e.g. node name)
    fileName;       // file name / optional

    constructor(msg) {
        this.message = msg;
        this.contextInfo = ""; // e.g. "div" or ":title"
        this.lineNbr = -1;
        this.columnNbr = -1;
        this.fileName = "";
    }

    /**
     * Merge all information in one description
     */
    description() {
        let fn = this.fileName ? this.fileName + "," : "",
            sep = this.contextInfo ? "@" : "";
        return ["[", this.contextInfo, sep, fn, "line:", this.lineNbr, "] ", this.message].join("");
    }

    toString() {
        return this.description();
    }
}

class IvProcessor {
    ref;                 // template instance unique identifier - generated
    fn;                  // template function
    statics;             // template statics data
    argIndexes;          // template argument indexes - i.e. map of "argName":argIndex (e.g. "msg":0)
    currentNd;           // current node - last node processed during the refresh process
    currentNdDepth;      // current node depth = index of currentNd in ancestorNodes - equivalent to ancestorNodes length-1
    currentParentNd;     // parent of the current node
    rootNd;              // rootNode - equivalent to ancestorNodes[0]
    ancestorNodes;       // array of the nodes in the current path
    dataNodeParents;     // current stack of data node parents - can be null for invalid data node parents
    targetDepth;         // tells at which depth next node should be (0 = root)
    creationMode;        // fast track for node creation - activated when we create a new group
    creationModeTarget;  // force creation mode until a certain target is reached, then move creationMode back to false
    ignoreTemplateNode;  // true when the template is called from another template that has already created the template node
    nodeCount;           // internal counter used to create unique references
    controller;          // controller associated to the template function (optional)
    controllerArgIx;     // argument name of the function controller (if any)
    fnType;              // function type definition
    fileName;            // file name - for error reporting
    rootAttributes;      // root node attributes

    constructor(funcNode, uid) {
        let templateData = funcNode.templateData, fnStatics = templateData.templateStatics;
        this.ref = uid;
        this.fn = templateData.templateFn;
        this.statics = fnStatics;
        this.argIndexes = templateData.templateArgIdx;
        this.nodeCount = 0;
        this.fileName = fnStatics[0][9] || "";
        let tm = funcNode.typeMap;
        this.fnType = tm;
        if (tm.$controllerClass) {
            this.controllerArgIx = this.argIndexes[tm.$controllerName] + 1;
        }
    }

    refresh(argMap, context) {
        argMap = argMap || {};
        let groupNode = context.groupNode, rootNd = this.rootNd;

        // fake a node to bootstrap the chain
        this.currentNd = null;
        this.currentParentNd = null;
        this.currentNdDepth = -1;
        this.targetDepth = 0;
        this.ancestorNodes = [];
        this.dataNodeParents = [];

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

        let args = [this], argsIdx = this.argIndexes;
        for (let k in argMap) {
            if (argMap.hasOwnProperty(k)) {
                args[argsIdx[k] + 1] = argMap[k];
            }
        }

        if (this.controllerArgIx) {
            if (!this.controller) {
                this.controller = new this.fnType.$controllerClass();
            }
            argMap[this.fnType.$controllerName] = args[this.controllerArgIx] = this.controller;
        }
        this.rootAttributes = argMap;

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
        let nextNode;
        if (this.currentNdDepth < this.targetDepth) {
            // we have to look for next node in the child list
            let nd = this.currentNd;
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
        let nd = this.currentNd, nextNode = nd.nextSibling, ns;
        if (!nextNode) {
            return false;
        }
        while (nextNode && nextNode.index < targetIdx) {
            ns = nextNode.nextSibling;
            this.deleteNextNode(nd);
            nextNode = ns;
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
        let ans = this.ancestorNodes, prev = this.currentNd, depth = --this.currentNdDepth;
        this.currentNd = ans[this.currentNdDepth];
        this.moveChanges(prev, this.currentNd);
        if (depth > 0) {
            this.currentParentNd = ans[depth - 1];
        } else {
            this.currentParentNd = null;
        }
    }

    /**
     * Function template start
     * @param idx
     */
    fs(idx) {
        if (this.fnType.$error) {
            this.throwError(idx, this.fnType.$error);
        }

        if (!this.ignoreTemplateNode) {
            if (this.creationMode) {
                // creation fast track
                this.createGroupNode(idx, "function");
            } else {
                if (!this.advance(idx)) {
                    this.createGroupNode(idx, "function");
                }
            }
        }
        this.currentNd.attributes = this.rootAttributes;
        if (this.controller) {
            this.controller.$attributes = this.currentNd.attributes;
        }
        this.targetDepth++;
    }

    /**
     * Function template end
     * @param idx
     */
    fe(idx) {
        this.ne(idx);
        if (this.creationMode) {
            if (idx === this.creationModeTarget) {
                // reset forced creation flags
                this.creationMode = false;
                this.creationModeTarget = -1;
            }
        }
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
            // creation fast track`
            this.createEltNode(idx, hasChildren, dAttributes, sAttributes);
        } else {
            if (this.advance(idx)) {
                // update
                updateEltNode(this.currentNd, dAttributes);
            } else {
                this.throwError(idx, "Invalid case 1"); // force creation should have been activated and we should not get here
            }
        }

        // tell how next nodes should be handled
        if (hasChildren) {
            this.targetDepth++;
            this.dataNodeParents.push(null); // standard nodes cannot be data node parents
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
        if (this.currentNdDepth < this.targetDepth) {
            this.deleteChildNodes(idx, this.currentNd);
        } else if (this.currentNdDepth === this.targetDepth) {
            this.removeLastAncestor();
        }
        this.targetDepth--;
        this.dataNodeParents.pop();
    }

    /**
     * Component start
     * @param idx
     * @param fnRef IvFunction node
     * @param hasChildren
     * @param dAttributes
     * @param sAttributes
     */
    cs(idx, fnRef, hasChildren, dAttributes, sAttributes) {
        if (!hasChildren) {
            if (this.creationMode) {
                this.createCptNode(idx, fnRef, dAttributes, sAttributes);
                generateSubView(idx, this.currentNd);
            } else {
                if (this.advance(idx)) {
                    this.updateNodeAttributes(this.currentNd, dAttributes);
                } else {
                    this.throwError(idx, "Invalid case 2"); // force creation should have been activated and we should not get here
                }
            }
        } else {
            // node has child nodes
            if (this.creationMode) {
                this.createCptNode(idx, fnRef, dAttributes, sAttributes);
                this.initTypeRefInStatics(idx, fnRef);
            } else {
                if (this.advance(idx)) {
                    // swap content node / view node
                    let cptNd = this.currentNd;
                    cptNd.data.viewDom = cptNd.firstChild;
                    cptNd.data.dAttributes = dAttributes;
                    cptNd.firstChild = cptNd.data.contentDom.firstChild;

                    // remove unprocessed changes from previous refresh (e.g. changes associated
                    // to a content node that wasn't inserted
                    let ch = cptNd.firstChild;
                    while (ch) {
                        ch.firstChange = ch.lastChange = null;
                        ch = ch.nextSibling;
                    }

                    // then trigger update of the view node in ce()
                } else {
                    this.throwError(idx, "Invalid case 3"); // force creation should have been activated and we should not get here
                }
            }
            this.targetDepth++;
            this.dataNodeParents.push(this.currentNd);
            this.resetListAttributes(idx);
        }
    }

    /**
     * Component end
     * @param idx
     */
    ce(idx) {
        // we are in the case where the component has children
        this.ne(idx);

        let nd = this.currentNd, contentName, contentFound = true, data = nd.data;
        if (nd.isDataNode) {
            let typeRef = this.statics[idx][ST_IDX_TYPE_REF];
            if (typeRef) {
                while (typeRef.$isListItem) {
                    typeRef = typeRef.itemType;
                }
                contentName = typeRef.$contentName;
            }
        } else {
            contentName = data.funcNode.typeMap.$contentName;
        }
        if (!contentName) {
            contentFound = false;
            contentName = "$content";
        }
        if (this.creationMode) {
            if (!nd.isDataNode) {
                // nd is a function call, we need to swap content group and view dom
                let contentGroup = new IvGroupNode(idx, contentName);
                contentGroup.firstChild = nd.firstChild;
                nd.data.contentDom = contentGroup;
                nd.firstChild = null;

                // generate view nodes
                if (contentFound) {
                    nd.attributes[contentName] = contentGroup.firstChild;
                }
                generateSubView(idx, nd);
            } else if (contentFound) {
                // nd is data node
                nd.attributes[contentName] = nd.firstChild;
            }
        } else {
            let contentNd = nd.firstChild;
            if (!nd.isDataNode) {
                nd.firstChild = nd.data.viewDom;
                nd.data.contentDom.firstChild = contentNd;
            }

            // update view nodes
            if (contentFound) {
                this.updateNodeAttributes(nd, nd.data.dAttributes, contentName, contentNd);
            } else {
                this.updateNodeAttributes(nd, nd.data.dAttributes);
            }

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
            let nd = new IvDataNode(idx);
            nd.propagateChanges = false;
            this.appendNode(nd);
            setNodeAttributes(nd, this.statics[idx], dAttributes, sAttributes);
        } else {
            if (this.advance(idx)) {
                if (!hasChildren) {
                    this.updateNodeAttributes(this.currentNd, dAttributes);
                } else {
                    // swap content node / view node
                    let nd = this.currentNd;
                    nd.data.dAttributes = dAttributes;

                    // remove unprocessed changes from previous refresh (e.g. changes associated
                    // to a content node that wasn't inserted
                    let ch = nd.firstChild;
                    while (ch) {
                        ch.firstChange = ch.lastChange = null;
                        ch = ch.nextSibling;
                    }
                    // then trigger update of the view node in ce()
                }
            } else {
                this.throwError(idx, "Invalid case 4"); // force creation should have been activated and we should not get here
            }

        }

        if (hasChildren) {
            this.targetDepth++;
            this.dataNodeParents.push(this.currentNd);
            this.resetListAttributes(idx);
        } else {
            this.setCurrentDataNodeAsParentAttribute(idx);
        }
    }

    /**
     * Attribute node end
     * @param idx
     */
    ae(idx) {
        this.ce(idx);
        this.setCurrentDataNodeAsParentAttribute(idx);
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
        let dnp = this.dataNodeParents, last = dnp[dnp.length - 1];
        dnp.push(last); // blocks don't change the data node parent
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
                this.throwError(idx, "Invalid case 5"); // force creation should have been activated and we should not get here
            }
        }
    }

    /**
     * Delete the first child of a node
     * @param idx the node index
     * @param nd
     */
    deleteFirstChild(idx, nd) {
        let ch = nd.firstChild;
        if (ch) {
            let ns = ch.nextSibling;
            if (ns) {
                nd.firstChild = ns;
                let ns2 = ns.nextSibling;
                while (ns2) {
                    //ns2.firstSibling = ns;
                    ns2 = ns2.nextSibling;
                }
            } else {
                nd.firstChild = null;
            }
            if (ch.isGroupNode) {
                addInstruction(INSTRUCTION_DELETE_GROUP, ch);
                this.moveChanges(ch, this.currentNd);
            }
        }
    }

    /**
     * Delete the next sibling of a node
     * @param nd
     */
    deleteNextNode(nd) {
        let nextNode = nd.nextSibling;
        if (nextNode) {
            nd.nextSibling = nextNode.nextSibling || null;
            if (nextNode.isGroupNode) {
                addInstruction(INSTRUCTION_DELETE_GROUP, nextNode);
                this.moveChanges(nextNode, this.currentNd); // no need here  -> sub groups could be automatically deleted?
            }
        }
    }

    /**
     * Delete all child nodes for a given node
     * @param idx
     * @param nd
     */
    deleteChildNodes(idx, nd) {
        let ch = nd.firstChild;
        while (ch) {
            if (ch.isGroupNode) {
                addInstruction(INSTRUCTION_DELETE_GROUP, ch);
                this.moveChanges(ch, nd); // no need here -> sub groups could be automatically deleted?
            }
            ch = ch.nextSibling;
        }
        nd.firstChild = null;
    }

    /**
     * Project current node into data node parent attributes
     * @param idx the index being processed
     */
    setCurrentDataNodeAsParentAttribute(idx) {
        let dataNode = this.currentNd,
            dnp = this.dataNodeParents,
            parent = dnp[dnp.length - 1];

        // parent is a component or another data node
        if (parent && parent.data) {
            let dataNodeName = this.statics[idx][ST_IDX_NODE_NAME], dataNodeType;
            if (parent.data.funcNode) {
                // parent is a component
                dataNodeType = parent.data.funcNode.typeMap[dataNodeName];
            } else {
                // parent is another data node
                dataNodeType = this.statics[idx][ST_IDX_TYPE_REF];
            }
            if (!dataNodeType) {
                this.throwError(idx, "Type description not found");
            }
            if (dataNodeType === IvNode) {
                parent.attributes[dataNodeName] = dataNode.firstChild;
            } else if (dataNodeType.$isListItem) {
                parent.attributes[dataNodeType.listName].push(dataNode.attributes);
            } else if (dataNodeType.$isTypeDef) {
                parent.attributes[dataNodeName] = dataNode.attributes;
            } else {
                this.throwError(idx, "Type mismatch");
            }
        } else {
            this.throwError(idx, "Invalid data node context");
        }

    }

    /**
     * Reset all list attributes on the current node
     * @param idx
     */
    resetListAttributes(idx) {
        // reset list attributes
        let typeRef = this.statics[idx][ST_IDX_TYPE_REF], nd = this.currentNd, atts = nd.attributes;
        if (typeRef && typeRef.$listAttNames) {
            for (let i = 0; typeRef.$listAttNames.length > i; i++) {
                atts[typeRef.$listAttNames[i]] = [];
            }
        }
    }

    /**
     * Create a text node and append it to the current vdom
     * @param idx
     */
    createTextNode(idx) {
        this.appendNode(new IvTextNode(idx, this.statics[idx][ST_IDX_NODE_NAME]));
    }

    /**
     * Create a group node and append it to the current vdom
     * @param idx
     * @param label {String} the group type (e.g. "insert", "template", etc.)
     * @param propagateChanges
     * @returns {IvGroupNode}
     */
    createGroupNode(idx, label, propagateChanges = true) {
        let parentNd = null;
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

        let gn = new IvGroupNode(idx, label);
        gn.ref = this.getNewNodeRef();
        gn.propagateChanges = propagateChanges;
        this.appendNode(gn);
        if (idx === this.creationModeTarget) {
            // we are in creation mode and the current group is the root of the new nodes
            addInstruction(INSTRUCTION_CREATE_GROUP, gn, parentNd);
        }
        return gn;
    }

    createInsertNode(idx, content) {
        // create a group node
        let nd = this.createGroupNode(idx, "insert");
        content = checkInsertContent(content);

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
        let ch = nd.firstChild;
        content = checkInsertContent(content);
        if (ch.isTextNode && ch.index === -1) {
            // this node was created to host dynamic text
            // update text
            if (content !== ch.value) {
                ch.value = content;
                addInstruction(INSTRUCTION_UPDATE_TEXT, ch);
                this.moveChanges(ch, nd);
            }
        } else {
            nd.firstChild = content;

            // find last sibling and move changes to nd
            let n = content;
            while (n.nextSibling) {
                n = n.nextSibling;
            }
            this.moveChanges(n, nd);
        }
    }

    /**
     * Create and initialize the group node associated to a component / sub-template
     * @param idx
     * @param funcRef component reference
     * @param dAttributes
     * @param sAttributes
     */
    createCptNode(idx, funcRef, dAttributes, sAttributes) {
        // create a group node as container for the component
        let statics = this.statics[idx],
            nd = this.createGroupNode(idx, statics[ST_IDX_NODE_NAME], false);
        if (!funcRef || !funcRef.isFunctionNode) {
            // we should not get there as template has already been identified earlier
            // unless dynamic injection is used to change the package reference
            this.throwError(idx, "Invalid function reference");
        }
        nd.data = {
            funcNode: funcRef,
            view: null,          // view object generated by the funcNode
            contentDom: null,    // content vdom - generated by the current funcNode
            viewDom: null        // view vdom firstChild
        };
        setNodeAttributes(nd, statics, dAttributes, sAttributes);
    }

    /**
     * Update an attribute node - i.e. update its arguments and refresh its view if it is not a data node
     * @param nd
     * @param dAttributes
     * @param contentName (optional)
     * @param contentNode (optional)
     */
    updateNodeAttributes(nd, dAttributes, contentName, contentNode) {
        let atts = nd.attributes;
        if (dAttributes) {
            let nm, val, changed = false;
            for (let i = 0; dAttributes.length > i; i += 2) {
                nm = dAttributes[i];
                val = dAttributes[i + 1];
                if (atts[nm] !== val) {
                    atts[nm] = val;
                    changed = true;
                }
            }
            if (changed && !nd.isDataNode) {
                addInstruction(INSTRUCTION_UPDATE_GROUP, nd);
                this.moveChanges(nd);
            }
        }
        if (contentName) {
            atts[contentName] = contentNode;
        }
        if (!nd.isDataNode) {
            let view = nd.data.view;
            nd.propagateChanges = true;
            view.refresh(atts, {creationMode: false, groupNode: nd});
            nd.propagateChanges = false;
            nd.data.viewDom = view.vdom.firstChild;
        }
    }

    /**
     * Create a new element node and append it to the vdom
     * @param idx
     * @param hasChildren tell if this element node may contain children
     * @param dAttributes dynamic attributes
     * @param sAttributes static attributes defined through a dynamic js expression
     */
    createEltNode(idx, hasChildren, dAttributes, sAttributes) {
        let statics = this.statics[idx], nd = new IvEltNode(idx, statics[ST_IDX_NODE_NAME]);
        setNodeAttributes(nd, statics, dAttributes, sAttributes);
        this.appendNode(nd);
        if (hasChildren || dAttributes) {
            nd.ref = this.getNewNodeRef();
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
            let prev = this.currentNd;
            if (this.targetDepth > this.currentNdDepth) {
                // insert as first child
                let currentFirstChild = prev.firstChild;
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

    /**
     * Update the static structure to contain a direct reference to the type definition
     * of a given function call and its child nodes
     * @param idx
     * @param fnRef
     */
    initTypeRefInStatics(idx, fnRef) {
        if (!this.statics[idx][ST_IDX_TYPE_REF]) {
            let st = this.statics[idx];
            st[ST_IDX_TYPE_REF] = fnRef.typeMap;

            this.updateChildTypeRefInStatics(idx, fnRef.typeMap);
        }
    }

    updateChildTypeRefInStatics(idx, ivType) {
        let statics = this.statics, stItem;
        for (let i = idx + 1; statics.length > i; i++) {
            stItem = statics[i];
            if (stItem[ST_IDX_NODE_TYPE] === NacNodeType.ATT_NODE && stItem[ST_IDX_CONTEXT_IDX] === idx) {
                // i is the index of a data node referring to the current node
                let tp = ivType[stItem[ST_IDX_NODE_NAME]];
                stItem[ST_IDX_TYPE_REF] = tp;
                if (tp && tp.$isTypeDef) {
                    // recursive calls
                    if (tp.$isListItem) {
                        this.updateChildTypeRefInStatics(i, tp.itemType);
                    } else if (tp.$isMap) {
                        this.updateChildTypeRefInStatics(i, tp);
                    }
                }
            }
        }
    }

    throwError(idx, msg) {
        let err = new IvError(msg), statics = this.statics[idx], ndType = statics[ST_IDX_NODE_TYPE], nm = "";
        if (ndType === NacNodeType.ELEMENT || ndType === NacNodeType.COMPONENT) {
            nm = statics[ST_IDX_NODE_NAME];
        } else if (ndType === NacNodeType.ATT_NODE) {
            nm = ":" + statics[ST_IDX_NODE_NAME];
        } else {
            nm = NacNodeType.getName(ndType);
        }
        err.contextInfo = nm;
        err.lineNbr = statics[ST_IDX_LINE_NBR];
        err.fileName = this.fileName;
        throw err;
    }
}

function checkInsertContent(content) {
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
 * Get all the nodes that have a reference in a tree of nodes
 * @param node the root node
 * @param result {Array} the array where the nodes will be pushed
 */
function getRefNodes(node, result) {
    if (node.ref) {
        result.push(node);
    }
    let ch = node.firstChild;
    while (ch) {
        getRefNodes(ch, result);
        ch = ch.nextSibling;
    }
}

/**
 * Set all attributes on a given element or group node
 * @param nd
 * @param statics
 * @param dAttributes
 * @param sAttributes
 */
function setNodeAttributes(nd, statics, dAttributes, sAttributes) {
    let i, atts = nd.attributes;

    // dynamic attributes first
    if (dAttributes) {
        let initDynAttributes = (nd.isElementNode && !nd.dynAttributes);
        if (initDynAttributes) {
            // store the name of dynamic attributes to ease renderer processing
            nd.dynAttributes = [];
        }
        for (i = 0; dAttributes.length > i; i += 2) {
            atts[dAttributes[i]] = dAttributes[i + 1];
            if (initDynAttributes) {
                nd.dynAttributes.push(dAttributes[i]);
            }
        }
    }
    // static attributes from statics array
    let sAtts = statics[ST_IDX_STATIC_ATTRIBUTES];
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
 * Generate the view instance associated to a sub-component / sub-template
 * This view with then be stored as meta-data of the component's group node
 * @param idx the node index
 * @param nd the function node
 */
function generateSubView(idx, nd) {
    let atts = nd.attributes, att = nd.firstAttribute, view;
    // update attributes
    while (att) {
        if (!atts[att.name]) {
            atts[att.name] = att.value;
        }
        att = att.nextSibling;
    }
    nd.attributes = atts;
    nd.propagateChanges = true;
    view = nd.data.funcNode.createView(atts, {creationMode: true, groupNode: nd});
    nd.propagateChanges = false;
    nd.data.view = view;
    nd.data.viewDom = view.vdom.firstChild;
}

/**
 * Update the dynamic attributes of an element node
 * @param nd
 * @param dAttributes
 */
function updateEltNode(nd, dAttributes) {
    if (dAttributes) {
        let atts = nd.attributes, v1, v2, createInstruction = false;
        for (let i = 0; dAttributes.length > i; i += 2) {
            v1 = atts[dAttributes[i]];
            v2 = dAttributes[i + 1];
            if (v1 !== v2) {
                createInstruction = true;
                atts[dAttributes[i]] = v2;
            }
        }
        if (createInstruction) {
            addInstruction(INSTRUCTION_UPDATE_ELEMENT, nd);
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
function addInstruction(type, node, parentNode = null) {
    let ins = instructionPool.getInstruction(type, node, parentNode);
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
 * Export common iv types on the iv object
 * @type {IvNode}
 */
iv.IvNode = IvNode;
iv.IvContent = IvContent;
iv.IvController = IvController;
iv.IvAny = 0; // to flag an attribute as any type
