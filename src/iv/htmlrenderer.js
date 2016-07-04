import {INSTRUCTIONS} from './iv';

/* global document, DocumentFragment */

/**
 * Render an iv template into an HTML DOM element
 * sample usage: render(pkg.myTemplate, myDiv, {msg: "hello});
 * @param template the template object returned by the iv processor
 * @param domContainer a DOM element (e.g. div)
 * @param args the template arguments (as JSON object)
 * @returns a template view (wrapper to template instance)
 */
export function render(template, domContainer, args) {
    var hr = new HtmlRenderer(domContainer);
    var view = template.apply(args);
    hr.connect(view);
    return view;
}

class HtmlRenderer {
    nodeMap;        // list of nodes being rendered (key=node.ref). Only node that have the possibility to change are stored
    domContainer;   // reference to the root DOM element where the DOM view should be appended
    connected;      // boolean indicating that the renderer has been connected to a view

    constructor(domContainer) {
        this.nodeMap = {};
        this.domContainer = domContainer;
        this.connected = false;
    }

    /**
     * Init the renderer with a view - if a view has been set, it will be replaced with the new view
     */
    connect(view) {
        if (!this.connected) {
            this.connected = true;
            this.nodeMap = {};
            view.renderer = this;
            this.processRefreshLog(view.refreshLog);
        }
    }

    /**
     * Process refresh instructions after each view refresh
     */
    processRefreshLog(log) {
        if (!log || !log.changes || log.changes.length === 0) {
            return;
        }

        var ins=log.changes, type, node, domNd;
        while (ins) {
            type = ins.type;
            node = ins.node;
            if (type === INSTRUCTIONS.UPDATE_TEXT) {
                domNd = this.nodeMap[node.ref];
                if (domNd) {
                    domNd.textContent = node.value;
                }
            } else if (type === INSTRUCTIONS.UPDATE_ELEMENT) {
                var dynAtts = node.dynAttributes, domNd = this.nodeMap[node.ref], atts = node.attributes;
                if (domNd) {
                    var nm;
                    for (var j = 0; dynAtts.length > j; j++) {
                        nm = dynAtts[j];
                        if (nm === "class" || nm === "className") {
                            domNd.className = atts[nm];
                        } else {
                            domNd.setAttribute(nm, atts[nm]);
                        }
                    }
                }
            } else if (type === INSTRUCTIONS.UPDATE_GROUP) {
                // nothing to do in this case
            } else if (type === INSTRUCTIONS.CREATE_GROUP) {
                var groupData;
                if (!ins.parent) {
                    // root node
                    var df = new DocumentFragment();
                    groupData = this.createGroup(node, df);
                    this.domContainer.appendChild(df);
                    groupData.domParent = this.domContainer;
                } else {
                    var df = new DocumentFragment(), parent = ins.parent, found = false;
                    groupData = this.createGroup(node, df);

                    // calculate node index
                    var ch = parent.firstChild, domParent = this.nodeMap[parent.ref], domCh;
                    if (domParent.domParent) {
                        // the object stored in nodeMap can be a group structure
                        domParent = domParent.domParent;
                    }

                    if (parent.isGroupNode) {
                        domCh = domParent.nextSibling;
                    } else {
                        domCh = domParent.firstChild;
                    }
                    while (ch) {
                        if (ch === node) {
                            // we found the node!
                            found = true;
                            ch = null;
                        } else {
                            if (ch.isGroupNode) {
                                var comment2 = this.nodeMap[ch.ref].endComment;
                                domCh = comment2.nextSibling;
                            } else {
                                domCh = domCh.nextSibling;
                            }
                            ch = ch.nextSibling;
                        }
                    }
                    if (found) {
                        if (domCh) {
                            // next sibling found: insert before
                            domParent.insertBefore(df, domCh);
                        } else {
                            // next sibling not found: append
                            domParent.appendChild(df);
                        }
                        groupData.domParent = domParent;
                    } else {
                        // should not occur
                        console.error("[iv html renderer] Invalid create instruction");
                    }
                }
            } else if (type === INSTRUCTIONS.DELETE_GROUP) {
                var data = this.nodeMap[node.ref],
                    domComment1 = data.startComment,
                    domComment2 = data.endComment,
                    domParent = data.domParent;
                if (data) {
                    // delete all DOM nodes between start and end comments
                    if (!domParent) {
                        domParent = this.domContainer;
                    }
                    var ch = domComment1, ch2;
                    while (ch) {
                        ch2 = (ch === domComment2) ? null : ch.nextSibling;
                        domParent.removeChild(ch);
                        ch = ch2;
                    }
                    for (var j = 0; ins.deletedRefNodes.length > j; j++) {
                        delete this.nodeMap[ins.deletedRefNodes[j].ref];
                    }
                }
            } else {
                console.error("[iv html renderer] Invalid instruction type: " + type);
            }
            ins = ins.next;
        }
    }

    processNode(node, domParent) {
        if (node.isElementNode) {
            this.createElement(node, domParent)
        } else if (node.isTextNode) {
            this.createText(node, domParent);
        } else if (node.isGroupNode) {
            this.createGroup(node, domParent);
        } else {
            console.error("[iv html renderer] Invalid node");
        }
    }

    createGroup(node, domParent) {
        var ndref = node.ref,
            startComment = document.createComment(["start: ", node.groupType, " ", ndref].join("")),
            endComment = document.createComment(["end: ", node.groupType, " ", ndref].join(""));

        var nodeData = {
            startComment: startComment,
            endComment: endComment,
            domParent: domParent
        };
        domParent.appendChild(startComment);

        var ch = node.firstChild;
        while (ch) {
            this.processNode(ch, domParent);
            ch = ch.nextSibling;
        }
        domParent.appendChild(endComment);

        return this.nodeMap[node.ref] = nodeData;
    }

    createText(node, domParent) {
        var domNd = document.createTextNode(node.value);
        if (node.ref) {
            this.nodeMap[node.ref] = domNd;
        }
        domParent.appendChild(domNd);
    }

    createElement(node, domParent) {
        var domNd = document.createElement(node.name), atts = node.attributes;

        for (var k in atts) {
            if (!atts.hasOwnProperty(k)) continue;
            // TODO support complex attributes such as class.foo
            if (k === "class" || k === "className") {
                domNd.className = atts[k];
            } else {
                domNd.setAttribute(k, atts[k]);
            }
        }
        if (node.ref) {
            this.nodeMap[node.ref] = domNd;
        }
        domParent.appendChild(domNd);

        var ch = node.firstChild;
        while (ch) {
            this.processNode(ch, domNd);
            ch = ch.nextSibling;
        }
    }
}