
import {
    VdNodeKind, VdRenderer, VdRuntime, VdFunction, VdNode, VdContainer, VdElementNode, VdTextNode, VdCptNode,
    VdElementWithProps, VdGroupNode, VdChangeKind, VdChangeInstruction, VdUpdateProp, VdCreateGroup, VdDeleteGroup, VdUpdateText, VdUpdateAtt, VdElementWithAtts
} from "./vdom";

export { VdRenderer as VdRenderer };

interface IvRuntime extends VdRuntime {
    refCount: number;
}

export const ivRuntime: IvRuntime = {
    refCount: 0,

    createEltNode(parent: VdContainer, index: number, name: string, needRef?: 0 | 1): VdElementNode {
        let nd: VdElementNode = {
            kind: VdNodeKind.Element,
            index: index,
            name: name,
            ref: needRef ? ++ivRuntime.refCount : 0,
            children: [],
            domNode: null
        };
        parent.children[parent.children.length] = nd;
        return nd;
    },

    insert(parent: VdContainer, index: number, content: any): VdGroupNode {
        let g: VdGroupNode = {
            kind: VdNodeKind.Group,
            index: index,
            cm: 0,
            props: {},
            changes: null,
            ref: ++ivRuntime.refCount,
            children: [],
            domNode: null,
            parent: parent
        };
        if (content && content.kind === VdNodeKind.Group) {
            // content is a node list
            g.children = content.children
        } else if (typeof content === "string") {
            // create a text node
            ivRuntime.dynTxtNode(g, -1, content);
        }
        parent.children[parent.children.length] = g;
        return g;
    },

    createCpt(parent: VdContainer, index: number, props: {}, r: VdRenderer, vdFunction: VdFunction, hasLightDom: 0 | 1, needRef: 0 | 1): VdGroupNode {
        let g: VdCptNode = {
            kind: VdNodeKind.Group,
            index: index,
            cm: 1,
            vdFunction: vdFunction,
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

        // add sg to parent children, return lg
        if (hasLightDom) {
            // create the light dom and return it
            return g.ltGroup = {
                kind: VdNodeKind.Group,
                index: index,
                cm: 1,
                vdFunction: vdFunction,
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
            vdFunction(r, props);
            r.parent = p;
            return g;
        }
    },

    checkGroup(childPosition: number, parent: VdContainer, changeGroup: VdGroupNode, parentGroup: VdGroupNode, index: number): VdGroupNode {
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
                    nextSibling: findNextSibling(parent, childPosition)
                }
                addChangeInstruction(changeGroup, chge);
            }
            return g;
        }
    },

    deleteGroups(childPosition: number, parent: VdContainer, changeGroup: VdGroupNode, targetIndex: number) {
        let nd: VdNode | undefined = parent.children[childPosition];
        while (nd && nd.index < targetIndex) {
            // delete this group
            // mutate the children collection in order to keep the same array reference
            parent.children.splice(childPosition, 1);
            let chge: VdDeleteGroup = {
                kind: VdChangeKind.DeleteGroup,
                node: <VdGroupNode>nd,
                parent: parent,
                position: childPosition
            }
            addChangeInstruction(changeGroup, chge);
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

    dynTxtNode(parent: VdContainer, index: number, value: string): void {
        let nd: VdTextNode = {
            kind: VdNodeKind.Text,
            index: index,
            value: value,
            ref: ++ivRuntime.refCount,
            domNode: null
        };
        parent.children[parent.children.length] = nd;
    },

    updateProp(name: string, value: any, element: VdElementWithProps, changeGroup: VdGroupNode): void {
        if (element.props[name] !== value) {
            // value has changed
            element.props[name] = value;
            if (!value.call) {
                // we don't create change instructions for function values as the event handler will use
                // the function stored in the node property at the time of the event - so no new handler needs to be create
                addChangeInstruction(changeGroup, <VdUpdateProp>{
                    kind: VdChangeKind.UpdateProp,
                    name: name,
                    value: value,
                    node: element
                });
            }
        }
    },

    updateAtt(name: string, value: any, element: VdElementWithAtts, changeGroup: VdGroupNode): void {
        if (element.atts[name] !== value) {
            // value has changed
            element.atts[name] = value;
            if (!value.call) {
                // we don't create change instructions for function values as the event handler will use
                // the function stored in the node property at the time of the event - so no new handler needs to be create
                addChangeInstruction(changeGroup, <VdUpdateAtt>{
                    kind: VdChangeKind.UpdateAtt,
                    name: name,
                    value: value,
                    node: element
                });
            }
        }
    },

    updateText(value: string, textNode: VdTextNode, changeGroup: VdGroupNode): void {
        if (textNode.value !== value) {
            textNode.value = value;
            addChangeInstruction(changeGroup, <VdUpdateText>{
                kind: VdChangeKind.UpdateText,
                value: value,
                node: textNode
            });
        }
    },

    updateCptProp(name: string, value: any, element: VdElementWithProps): void {
        element.props[name] = value;
    },

    refreshCpt(r: VdRenderer, cptGroup: VdGroupNode, changeGroup: VdGroupNode): void {
        let p = r.parent, c = cptGroup as VdCptNode;

        if (c.sdGroup !== null) {
            // there is a light dom - swap back to the shadow dom group
            let ltGroup = c;
            c = c.sdGroup;
            if (!c.props) {
                c.props = {};
            }
            c.props["content"] = ltGroup;
        }
        r.parent = c;
        c.vdFunction(r, c.props);
        r.parent = p;

        // move changes from cptGroup to changeGroup
        moveChangeInstructions(c, changeGroup);
    },

    refreshInsert(insertGroup: VdGroupNode, content: any, changeGroup: VdGroupNode): void {
        // todo check if content nature has changed
        if (content && content.kind === VdNodeKind.Group) {
            // push back changes
            moveChangeInstructions(content, changeGroup);
        } else if (typeof content === "string") {
            ivRuntime.updateText(content, <VdTextNode>insertGroup.children[0], changeGroup);
        }
    }
}

function addChangeInstruction(changeGroup: VdGroupNode, instruction: VdChangeInstruction) {
    if (changeGroup.changes) {
        changeGroup.changes.splice(changeGroup.changes.length, 0, instruction);
    } else {
        changeGroup.changes = [instruction];
    }
}

function moveChangeInstructions(changeGroup1: VdGroupNode, changeGroup2: VdGroupNode) {
    if (changeGroup1.changes) {
        if (changeGroup2.changes) {
            changeGroup2.changes = changeGroup2.changes.concat(changeGroup1.changes);
        } else {
            changeGroup2.changes = changeGroup1.changes;
        }
        changeGroup1.changes = null;
    }
}

function findNextSibling(parent: VdContainer, nodePosition: number, childrenOnly = false): VdTextNode | VdElementNode | null {
    let ch = parent.children, nd;
    if (nodePosition + 1 < ch.length) {
        // there is a next element in the children list
        nd = ch[nodePosition + 1];
        if (nd.kind === VdNodeKind.Element) {
            return <VdElementNode>nd;
        } else if (nd.kind === VdNodeKind.Text) {
            return <VdTextNode>nd;
        } else if (nd.kind === VdNodeKind.Group) {
            return findNextSibling(nd, -1, true);
        } else {
            // data node
            return findNextSibling(parent, nodePosition + 1);
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
                        return findNextSibling(p, i);
                    }
                }
            }
        }
        return null;
    }
}