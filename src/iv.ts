
import {
    VdNodeKind, VdRenderer, VdRuntime, VdFunctionCpt, VdNode, VdContainer, VdElementNode, VdTextNode, VdCptNode,
    VdElementWithProps, VdGroupNode, VdChangeKind, VdChangeInstruction, VdUpdateProp, VdCreateGroup, VdDeleteGroup, VdUpdateText, VdUpdateAtt, VdElementWithAtts, VdDataNode, VdChangeContainer, VdParent, VdReplaceGroup, VdClassCpt, VdClassCptInstance
} from "./vdom";

export { VdRenderer as VdRenderer };

const EMPTY_PROPS = {}, NO_PROPS = undefined, ALL_DN = "*";

interface IvRuntime extends VdRuntime {
    refCount: number;
}

function createEltOrDataNode(parent, kind: VdNodeKind, index: number, name: string, props, needRef?: 0 | 1) {
    let nd: VdElementNode = {
        kind: kind,
        index: index,
        name: name,
        ref: needRef ? ++ivRuntime.refCount : 0,
        children: [],
        props: props,
        domNode: null
    };
    parent.children[parent.children.length] = nd;
    return nd;
}

export const ivRuntime: IvRuntime = {
    refCount: 0,

    createEltNode(parent: VdParent, index: number, name: string, needRef?: 0 | 1): VdElementNode {
        let nd: VdElementNode = {
            kind: VdNodeKind.Element,
            index: index,
            name: name,
            ref: needRef ? ++ivRuntime.refCount : 0,
            children: [],
            props: NO_PROPS,
            domNode: null
        };
        parent.children[parent.children.length] = nd;
        return nd;
    },

    createDtNode(parent: VdParent | null = null, index: number, name: string, needRef?: 0 | 1): VdDataNode {
        let nd: VdDataNode = {
            kind: VdNodeKind.Data,
            index: index,
            name: name,
            ref: needRef ? ++ivRuntime.refCount : 0,
            children: [],
            props: EMPTY_PROPS,
            changes: null,
            domNode: null
        };
        if (parent) {
            parent.children[parent.children.length] = nd;
        }
        return nd;
    },

    insert(parent: VdContainer, index: number, content: any, changeCtn: VdChangeContainer, append = true): VdGroupNode {
        let g: VdGroupNode = {
            kind: VdNodeKind.Group,
            index: index,
            cm: 0,
            props: { $content_ref: content },
            changes: null,
            ref: ++ivRuntime.refCount,
            children: [],
            domNode: null,
            parent: parent
        };
        if (content && (content.kind === VdNodeKind.Group || content.kind === VdNodeKind.Data)) {
            // content is a node list
            g.children = content.children
            moveChangeInstructions(content, changeCtn);
        } else if (typeof content === "string") {
            // create a text node
            ivRuntime.dynTxtNode(g, -1, content);
        }
        if (append) {
            parent.children[parent.children.length] = g;
        }
        return g;
    },

    refreshInsert(parent: VdContainer, childPosition: number, content: any, changeCtn: VdChangeContainer): void {
        // result depends on content nature change
        let insertGroup = <VdGroupNode>parent.children[childPosition],
            contentA: any = insertGroup.props ? insertGroup.props["$content_ref"] : "",
            contentB = content;

        if (contentA === contentB) {
            // push back changes
            moveChangeInstructions(contentB, changeCtn);
        } else {
            let typeA = getInsertContentType(contentA),
                typeB = getInsertContentType(contentB),
                replaceGroup = false;
            if (typeA === "text") {
                if (typeB === "text") {
                    // update the text node
                    ivRuntime.updateText(content, <VdTextNode>insertGroup.children[0], changeCtn);
                } else if (typeB === "nodelist") {
                    // delete text node and create new content
                    replaceGroup = true;
                }
            } else if (typeA === "nodelist") {
                replaceGroup = true; // if (typeB === "nodelist"), node lists are different (cf. first test)
            }

            if (replaceGroup) {
                let newInsertGroup = ivRuntime.insert(parent, insertGroup.index, contentB, changeCtn, false);
                let rg: VdReplaceGroup = {
                    kind: VdChangeKind.ReplaceGroup,
                    oldNode: insertGroup,
                    newNode: newInsertGroup,
                    parent: parent,
                    position: childPosition,
                    nextSibling: findNextDomSibling(parent, childPosition)
                }
                parent.children[childPosition] = newInsertGroup;
                newInsertGroup.changes = null;
                addChangeInstruction(changeCtn, rg);
            } else {
                if (insertGroup.props) {
                    insertGroup.props["$content_ref"] = contentB;
                } else {
                    insertGroup.props = { $content_ref: contentB };
                }
            }
            moveChangeInstructions(contentB, changeCtn);
        }
        // todo handle error cases where typeA or typeB are "invalid"
    },

    createCpt(parent: VdContainer, index: number, props: {}, r: VdRenderer, cpt: VdFunctionCpt | VdClassCpt, hasLightDom: 0 | 1, needRef: 0 | 1): VdGroupNode {
        let isClassCpt = cpt.$isClassCpt === true;
        let g: VdCptNode = {
            kind: VdNodeKind.Group,
            index: index,
            cm: 1,
            cpt: isClassCpt ? new (<VdClassCpt>cpt)() : null,
            render: isClassCpt ? null : <VdFunctionCpt>cpt,
            props: props,
            changes: null,
            ref: needRef ? ++ivRuntime.refCount : 0,
            children: [],
            domNode: null,
            sdGroup: null,
            ltGroup: null,
            parent: parent
        }, p = r.parent;
        parent.children[parent.children.length] = g;
        r.parent = g;

        if (g.cpt) {
            let c = g.cpt;
            c["props"] = g.props
            if (c.init) {
                c.init();
            }
        }

        // add sg to parent children, return lg
        if (hasLightDom) {
            // create the light dom and return it
            return g.ltGroup = {
                kind: VdNodeKind.Group,
                index: index,
                cm: 1,
                cpt: g.cpt,
                render: g.render,
                changes: null,
                ref: 0,
                children: [],
                domNode: null,
                sdGroup: g,
                ltGroup: null,
                parent: null
            }
        } else {
            // no light dom
            // call the sub-function with the supplied parameters
            renderCpt(r, g);
            r.parent = p;
            return g;
        }
    },

    checkGroup(childPosition: number, parent: VdContainer, changeCtn: VdChangeContainer, parentGroup: VdGroupNode, index: number): VdGroupNode {
        let nd: VdNode | undefined = parent.children[childPosition];
        if (nd && nd.index === index) {
            return <VdGroupNode>nd;
        } else {
            // create and insert the new group
            let g: VdGroupNode = {
                kind: VdNodeKind.Group,
                index: index,
                cm: 1,
                props: {},
                changes: null,
                ref: ++ivRuntime.refCount,
                children: [],
                domNode: null,
                parent: parent
            };
            if (parentGroup.cm) {
                parent.children[parent.children.length] = g;
            } else {
                parent.children.splice(childPosition, 0, g);
                let chge: VdCreateGroup = {
                    kind: VdChangeKind.CreateGroup,
                    node: g,
                    parent: parent,
                    position: childPosition,
                    nextSibling: findNextDomSibling(parent, childPosition)
                }
                addChangeInstruction(changeCtn, chge);
            }
            return g;
        }
    },

    deleteGroups(childPosition: number, parent: VdContainer, changeCtn: VdChangeContainer, targetIndex: number) {
        let nd: VdNode | undefined = parent.children[childPosition];
        while (nd && nd.index < targetIndex) {
            // delete this group
            let chge: VdDeleteGroup = {
                kind: VdChangeKind.DeleteGroup,
                node: <VdGroupNode>nd,
                parent: parent,
                position: childPosition,
                nbrOfNextSiblings: (parent.children.length - 1 - childPosition)
            }
            // mutate the children collection in order to keep the same array reference
            parent.children.splice(childPosition, 1);

            addChangeInstruction(changeCtn, chge);
            nd = parent.children[childPosition];
        }
    },

    createTxtNode(parent: VdContainer, index: number, value: string): void {
        let nd: VdTextNode = {
            kind: VdNodeKind.Text,
            index: index,
            value: value,
            ref: 0,
            domNode: null
        };
        parent.children[parent.children.length] = nd;
    },

    dynTxtNode(parent: VdContainer, index: number, value: string): VdTextNode {
        let nd: VdTextNode = {
            kind: VdNodeKind.Text,
            index: index,
            value: value,
            ref: ++ivRuntime.refCount,
            domNode: null
        };
        return parent.children[parent.children.length] = nd;
    },

    updateProp(name: string, value: any, element: VdElementWithProps | VdDataNode, changeCtn: VdChangeContainer): void {
        if (element.props[name] !== value) {
            // value has changed
            element.props[name] = value;
            if (!value || !value.call) {
                // we don't create change instructions for function values as the event handler will use
                // the function stored in the node property at the time of the event - so no new handler needs to be create
                addChangeInstruction(changeCtn, <VdUpdateProp>{
                    kind: VdChangeKind.UpdateProp,
                    name: name,
                    value: value,
                    node: element
                });
            }
        }
    },

    updateAtt(name: string, value: any, element: VdElementWithAtts, changeCtn: VdChangeContainer): void {
        if (element.atts[name] !== value) {
            // value has changed
            element.atts[name] = value;
            if (!value || !value.call) {
                // we don't create change instructions for function values as the event handler will use
                // the function stored in the node property at the time of the event - so no new handler needs to be create
                addChangeInstruction(changeCtn, <VdUpdateAtt>{
                    kind: VdChangeKind.UpdateAtt,
                    name: name,
                    value: value,
                    node: element
                });
            }
        }
    },

    updateText(value: string, textNode: VdTextNode, changeCtn: VdChangeContainer): void {
        if (textNode.value !== value) {
            textNode.value = value;
            addChangeInstruction(changeCtn, <VdUpdateText>{
                kind: VdChangeKind.UpdateText,
                value: value,
                node: textNode
            });
        }
    },

    updateCptProp(name: string, value: any, element: VdElementWithProps): void {
        element.props[name] = value;
    },

    refreshCpt(r: VdRenderer, cptGroup: VdGroupNode, changeCtn: VdChangeContainer): void {
        let p = r.parent, c = cptGroup as VdCptNode;

        if (c.sdGroup !== null) {
            // there is a light dom - swap back to the shadow dom group
            let ltGroup = c;
            c = c.sdGroup;
            if (!c.props) {
                c.props = {};
            }
            c.props["$content"] = ltGroup;
        }
        r.parent = c;
        renderCpt(r, c);
        r.parent = p;

        // move changes from cptGroup to change container
        moveChangeInstructions(c, changeCtn);
    },

    cleanTxt(e: any): any {
        return e === 0 ? '0' : e || '';
    },

    getDataNodes(fnGroup: VdGroupNode, nodeName: string, parent?: VdContainer): VdDataNode[] {
        let r = [];
        if (!parent && fnGroup.props) {
            parent = fnGroup.props["$content"];
        }
        if (parent) {
            grabDataNodes(parent.children, nodeName, r);
        }
        return r;
    },

    getDataNode(fnGroup: VdGroupNode, nodeName: string, parent?: VdContainer): VdDataNode | null {
        let r: VdDataNode | null = null;
        if (!parent && fnGroup.props) {
            let p = fnGroup.props;
            if (p && p[nodeName]) {
                // create a data node with a sub-textNode from the prop value
                return r = getDataNodeWrapper(p, nodeName, p[nodeName]);
            }
            parent = fnGroup.props["$content"];
        }
        if (parent) {
            let p = parent.props;
            if (p && p[nodeName]) {
                // create a data node with a sub-textNode from the prop value
                r = getDataNodeWrapper(p, nodeName, p[nodeName]);
            } else {
                r = grabFirstDataNode(parent.children, nodeName);
            }
        }
        return r;
    }
}

/**
 * Decorate a class component constructor to identify it as a component
 * @param CptClass 
 */
export function $component(CptClass: Function): VdClassCpt {
    CptClass["$isClassCpt"] = true;
    return <VdClassCpt>CptClass;
}

function renderCpt(r: VdRenderer, g) {
    if (g.cpt) {
        let c:VdClassCptInstance = <VdClassCptInstance>g.cpt;
        if (c.shouldUpdate) {
            if (!c.shouldUpdate()) {
                return;
            }
        }
        c.render(r);
    } else {
        g.render(r, g.props);
    }
}

function getDataNodeWrapper(props, nodeName, textValue) {
    // create a wrapper if doesn't exist - and cache it in the props object
    // note: we have to avoid creating the wrapper everytime as the <ins:dataNode/> instruction
    // would delete and recreate all the times
    let dnPropName = "$dn_" + nodeName, dnw = props[dnPropName];
    if (!dnw) {
        dnw = ivRuntime.createDtNode(null, -1, nodeName, 0);
        let tx = ivRuntime.dynTxtNode(dnw, -1, textValue);
        props[dnPropName] = dnw;
    } else {
        // node is the same but text may have changed
        ivRuntime.updateText(textValue, dnw.children[0], dnw);
    }
    return dnw;
}

function grabDataNodes(list: VdNode[], nodeName, resultsList) {
    let len = list.length, nd;
    for (let i = 0; len > i; i++) {
        nd = list[i];
        if (nd.kind === VdNodeKind.Data) {
            if (nodeName === ALL_DN || (<VdDataNode>nd).name === nodeName) {
                resultsList[resultsList.length] = nd;
            }
        } else if (nd.kind === VdNodeKind.Group && nd.children.length) {
            grabDataNodes(nd.children, nodeName, resultsList);
        }
    }
}

function grabFirstDataNode(list: VdNode[], nodeName): VdDataNode | null {
    let len = list.length, nd;
    for (let i = 0; len > i; i++) {
        nd = list[i];
        if (nd.kind === VdNodeKind.Data) {
            return nd;
        } else if (nd.kind === VdNodeKind.Group && nd.children.length) {
            nd = grabFirstDataNode(nd.children, nodeName);
            if (nd) {
                return nd;
            }
        }
    }
    return null;
}

function addChangeInstruction(changeCtn: VdChangeContainer, instruction: VdChangeInstruction) {
    if (changeCtn.changes) {
        changeCtn.changes.splice(changeCtn.changes.length, 0, instruction);
    } else {
        changeCtn.changes = [instruction];
    }
}

function moveChangeInstructions(changeCtn1: VdChangeContainer, changeCtn2: VdChangeContainer) {
    if (changeCtn1.changes) {
        if (changeCtn2.changes) {
            changeCtn2.changes = changeCtn2.changes.concat(changeCtn1.changes);
        } else {
            changeCtn2.changes = changeCtn1.changes;
        }
        changeCtn1.changes = null;
    }
}

// Find next sibling that is not a Group nor a Data node as those VdNodes are not projected in the real DOM
function findNextDomSibling(parent: VdContainer, nodePosition: number, childrenOnly = false): VdTextNode | VdElementNode | null {
    let ch = parent.children, nd;
    if (nodePosition + 1 < ch.length) {
        // there is a next element in the children list
        nd = ch[nodePosition + 1];
        if (nd.kind === VdNodeKind.Element) {
            return <VdElementNode>nd;
        } else if (nd.kind === VdNodeKind.Text) {
            return <VdTextNode>nd;
        } else if (nd.kind === VdNodeKind.Group) {
            return findNextDomSibling(nd, -1, true);
        } else {
            // data node
            return findNextDomSibling(parent, nodePosition + 1);
        }
    } else {
        // there is no more element in this list
        if (parent.kind === VdNodeKind.Element) {
            return null;
        } else if (parent.kind === VdNodeKind.Group) {
            // parent is a group, let's look in the grand parent
            let p = (<VdGroupNode>parent).parent;
            if (p && p !== parent) {
                // find parent position
                for (let i = 0; p.children.length > i; i++) {
                    if (p.children[i] === parent) {
                        return findNextDomSibling(p, i);
                    }
                }
            }
        }
        return null;
    }
}

function getInsertContentType(content): "nodelist" | "text" | "invalid" {
    if (content && (content.kind === VdNodeKind.Group || content.kind === VdNodeKind.Data)) {
        return "nodelist";
    } else if (typeof content === "string") {
        return "text";
    }
    return "invalid";
}