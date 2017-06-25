
import {
    VdNodeKind, VdRenderer, VdRuntime, VdNode, VdContainer, VdElementNode, VdTextNode,
    VdElementWithProps, VdGroupNode, VdChangeKind, VdChangeInstruction, VdUpdateProp, VdCreateGroup, VdDeleteGroup
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
            children: []
        };
        if (needRef) {
            nd.ref = "E" + (++ivRuntime.refCount);
        }
        parent.children.push(nd);
        return nd;
    },

    createGroupNode(parent: VdContainer, index: number, props: {}, needRef?: 0 | 1): VdGroupNode {
        let g: VdGroupNode = {
            kind: VdNodeKind.Group,
            index: index,
            cm: 1,
            props: props,
            changes: null,
            ref: needRef ? "G" + (++ivRuntime.refCount) : undefined,
            children: []
        };
        parent.children.push(g);
        return g;
    },

    checkGroupNode(childPosition: number, parent: VdContainer, changeGroup: VdGroupNode, parentGroup: VdGroupNode, index: number): VdGroupNode {
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
                ref: "G" + (++ivRuntime.refCount),
                children: []
            };
            parent.children.splice(childPosition, 0, g);
            if (!parentGroup.cm) {
                let chge: VdCreateGroup = {
                    kind: VdChangeKind.CreateGroup,
                    node: g,
                    parent: parent,
                    position: childPosition
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

    createTxtNode(parent: VdContainer, index: number, value: string): VdTextNode {
        let nd: VdTextNode = {
            kind: VdNodeKind.Text,
            index: index,
            value: value
        };
        parent.children.push(nd);
        return nd;
    },

    updateProp(name: string, value: any, element: VdElementWithProps, changeGroup: VdGroupNode): void {
        if (element.props[name] !== value) {
            // value has changed
            element.props[name] = value;
            addChangeInstruction(changeGroup, <VdUpdateProp>{
                kind: VdChangeKind.UpdateProp,
                name: name,
                value: value,
                node: element
            });
        }
    },

    updateCptProp(name:string, value:any, element: VdElementWithProps): void {
        element.props[name] = value;
    },

    moveChanges(group1: VdGroupNode, group2: VdGroupNode): void {
        if (group1.changes) {
            if (group2.changes) {
                group2.changes = group2.changes.concat(group1.changes);
            } else {
                group2.changes = group1.changes;
            }
            group1.changes = null;
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
