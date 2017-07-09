
import {
    VdNodeKind, VdRenderer, VdRuntime, VdFunction, VdNode, VdContainer, VdElementNode, VdTextNode, VdCptNode,
    VdElementWithProps, VdGroupNode, VdChangeKind, VdChangeInstruction, VdUpdateProp, VdCreateGroup, VdDeleteGroup, VdUpdateText
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

    createCpt(parent: VdContainer, index: number, props: {}, needRef: 0 | 1, r: VdRenderer, vdFunction: VdFunction): VdGroupNode {
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
            parent: parent
        }, p = r.parent;
        parent.children[parent.children.length] = g;
        r.parent = g;
        // call the sub-function with the supplied parameters
        vdFunction(r, props);
        r.parent = p;
        return g;
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
        r.parent = c;
        c.vdFunction(r, c.props);
        r.parent = p;
        // move changes from cptGroup to changeGroup
        if (c.changes) {
            if (changeGroup.changes) {
                changeGroup.changes = changeGroup.changes.concat(c.changes);
            } else {
                changeGroup.changes = c.changes;
            }
            c.changes = null;
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