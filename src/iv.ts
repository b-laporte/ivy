
import {
    VdNodeKind, VdRenderer, VdFunctionCpt, VdNode, VdContainer, VdElementNode, VdTextNode, VdCptNode,
    VdElementWithProps, VdGroupNode, VdChangeKind, VdChangeInstruction, VdUpdateProp, VdCreateGroup, VdDeleteGroup, VdUpdateText, VdUpdateAtt, VdElementWithAtts, VdDataNode, VdChangeContainer, VdParent, VdReplaceGroup, VdClassCpt, VdClassCptInstance, VdFuncCptNode
} from "./vdom";

export { VdRenderer as VdRenderer };

const EMPTY_PROPS = {}, NO_PROPS = undefined, ALL_DN = "*";

/**
 * Reference count
 * Used to track node reference in unit tests
 */
let refCount = 0;

/**
 * Reset the reference counter
 * For test only
 */
export function $resetRefCount() {
    refCount = 0;
}

/**
 * Return the next available reference
 */
export function $nextRef() {
    return ++refCount;
}

/**
 * Element
 * Create a VdElementNode node and append it to the parent children list 
 * Used in creation mode only
 */
export function $el(parent: VdParent, index: number, name: string, needRef?: 0 | 1): VdElementNode {
    let nd: VdElementNode = {
        kind: VdNodeKind.Element,
        index: index,
        name: name,
        ref: needRef ? ++refCount : 0,
        children: [],
        props: NO_PROPS,
        domNode: null
    };
    parent.children[parent.children.length] = nd;
    return nd;
}

/**
 * Data Node
 * Create a VdDataNode and append it to the parent children list (similar to createEltNode)
 * Used in creation mode only 
 */
export function $dn(parent: VdParent | null = null, index: number, name: string, needRef?: 0 | 1): VdDataNode {
    let nd: VdDataNode = {
        kind: VdNodeKind.Data,
        index: index,
        name: name,
        ref: needRef ? ++refCount : 0,
        children: [],
        props: EMPTY_PROPS,
        changes: null,
        domNode: null
    };
    if (parent) {
        parent.children[parent.children.length] = nd;
    }
    return nd;
}

/**
 * Insert
 * Create an insert group and insert the content node or text passed as argument
 */
export function $in(parent: VdContainer, index: number, content: any, changeCtn: VdChangeContainer, append = true): VdGroupNode {
    let g: VdGroupNode = {
        kind: VdNodeKind.Group,
        index: index,
        cm: 0,
        props: { $content_ref: content },
        changes: null,
        ref: ++refCount,
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
        $dt(g, -1, content);
    }
    if (append) {
        parent.children[parent.children.length] = g;
    }
    return g;
}

/**
 * Refresh Insert
 * Refresh the content nodes associated to an insert group
 */
export function $ri(parent: VdContainer, childPosition: number, content: any, changeCtn: VdChangeContainer): void {
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
                $ut(content, <VdTextNode>insertGroup.children[0], changeCtn);
            } else if (typeB === "nodelist") {
                // delete text node and create new content
                replaceGroup = true;
            }
        } else if (typeA === "nodelist") {
            replaceGroup = true; // if (typeB === "nodelist"), node lists are different (cf. first test)
        }

        if (replaceGroup) {
            let newInsertGroup = $in(parent, insertGroup.index, contentB, changeCtn, false);
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
}

/**
 * Create Component
 * Create a VdGroupNode associated to component, append it to the parent children list 
 * and call the component function
 * Use in creation mode only
 */
export function $cc(parent: VdContainer, index: number, props: {}, r: VdRenderer, cpt: VdFunctionCpt | VdClassCpt, hasLightDom: 0 | 1, needRef: 0 | 1): VdGroupNode {
    let isClassCpt = cpt.$isClassCpt === true;
    let g: VdCptNode = {
        kind: VdNodeKind.Group,
        index: index,
        cm: 1,
        cpt: isClassCpt ? new (<VdClassCpt>cpt)() : null,
        render: isClassCpt ? null : <VdFunctionCpt>cpt,
        props: props,
        changes: null,
        ref: needRef ? ++refCount : 0,
        children: [],
        domNode: null,
        sdGroup: null,
        ltGroup: null,
        parent: parent
    }, p = r.node;
    parent.children[parent.children.length] = g;
    r.node = g;

    if (g.cpt) {
        let c = <VdClassCptInstance>g.cpt;
        c.$vdNode = g;
        c.$renderer = r;
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
        r.node = p;
        return g;
    }
}

/**
 * Check Group
 * Check that a group with the right index exists in the parent children at childPosition and create it if not
 * Used in creation and update mode
 */
export function $cg(childPosition: number, parent: VdContainer, changeCtn: VdChangeContainer, parentGroup: VdGroupNode, index: number): VdGroupNode {
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
            ref: ++refCount,
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
}

/**
 * Delete Groups
 * Delete group nodes in the parent children list at childPosition until group index becomes greater or equal to the targetIndex
 * Used in upadte mode only
 */
export function $dg(childPosition: number, parent: VdContainer, changeCtn: VdChangeContainer, targetIndex: number) {
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
}

/**
 * Text
 * Create a VdTextNode node and append it to the parent children list
 * Used in creation mode only
 */
export function $tx(parent: VdContainer, index: number, value: string): void {
    let nd: VdTextNode = {
        kind: VdNodeKind.Text,
        index: index,
        value: value,
        ref: 0,
        domNode: null
    };
    parent.children[parent.children.length] = nd;
}

/**
 * Dynamic Text
 * Create a dynamic text node and append it to the parent children list
 */
export function $dt(parent: VdContainer, index: number, value: string): VdTextNode {
    let nd: VdTextNode = {
        kind: VdNodeKind.Text,
        index: index,
        value: value,
        ref: ++refCount,
        domNode: null
    };
    return parent.children[parent.children.length] = nd;
}

/**
 * Clean a text expression: return '' for null or undefined expression
 */
export function $ct(e: any): any {
    return e === 0 ? '0' : e || '';
}

/**
 * Update Property
 * Update the given property on the element passed as argument
 * Update instructions will be stored on changeGroup
 * Used in update mode only
 */
export function $up(name: string, value: any, element: VdElementWithProps | VdDataNode, changeCtn: VdChangeContainer): void {
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
}

/**
 * Update Attribute
 * Update the given attribute on the element passed as argument
 * An Update attribute instruction will be created and stored on changeGroup if the att value has changed
 */
export function $ua(name: string, value: any, element: VdElementWithAtts, changeCtn: VdChangeContainer): void {
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
}

/**
 * Update dynamic Text
 * Update a text node with a new value
 * Used in update mode only
 */
export function $ut(value: string, textNode: VdTextNode, changeCtn: VdChangeContainer): void {
    if (textNode.value !== value) {
        textNode.value = value;
        addChangeInstruction(changeCtn, <VdUpdateText>{
            kind: VdChangeKind.UpdateText,
            value: value,
            node: textNode
        });
    }
}

/**
 * Update component property
 * Used in update mode only
 */
export function $uc(name: string, value: any, cpt: VdElementWithProps): void {
    cpt.props[name] = value;
}

/**
 * Refresh component
 * Used in update mode only for component with no $content - otherwise used in update and creation mode
 */
export function $rc(r: VdRenderer, cptGroup: VdGroupNode, changeCtn: VdChangeContainer): void {
    let p = r.node, c = cptGroup as VdCptNode;

    if (c.sdGroup !== null) {
        // there is a light dom - swap back to the shadow dom group
        let ltGroup = c;
        c = c.sdGroup;
        if (!c.props) {
            c.props = {};
        }
        c.props["$content"] = ltGroup;
    }
    r.node = c;
    renderCpt(r, c);
    r.node = p;

    // move changes from cptGroup to change container
    moveChangeInstructions(c, changeCtn);
}

/**
 * Return all the data nodes that are direct descendents of the parent container / or direct descendents of sub-groups
 * attached to the parent container (in other words: this function will recursively look in sub-groups - such as js blocks - but not in sub-elements)
 */
export function $dataNodes(nodeName: string, parent: VdRenderer | VdContainer): VdDataNode[] {
    let res = [];
    if (parent["node"]) {
        let nd = (<VdRenderer>parent).node;
        if (nd.props) {
            parent = nd.props["$content"];
        }
    }
    if (parent) {
        grabDataNodes((<VdContainer>parent).children, nodeName, res);
    }
    return res;
}

/**
 * Same as $dataNodes() but will only return the first element (faster method when only one data node is expected)
 */
export function $dataNode(nodeName: string, parent: VdRenderer | VdContainer): VdDataNode | null {
    let res: VdDataNode | null = null;
    if (parent["node"]) {
        let nd = (<VdRenderer>parent).node;
        if (nd.props) {
            let p = nd.props;
            if (p && p[nodeName]) {
                // create a data node with a sub-textNode from the prop value
                return res = getDataNodeWrapper(p, nodeName, p[nodeName]);
            }
            parent = nd.props["$content"];
        }
    }
    if (parent) {
        let p = (<VdContainer>parent).props;
        if (p && p[nodeName]) {
            // create a data node with a sub-textNode from the prop value
            res = getDataNodeWrapper(p, nodeName, p[nodeName]);
        } else {
            res = grabFirstDataNode((<VdContainer>parent).children, nodeName);
        }
    }
    return res;
}

/**
 * Decorate a class component constructor to identify it as a component
 * @param CptClass 
 */
export function $component(CptClass: Function): VdClassCpt {
    CptClass["$isClassCpt"] = true;
    return <VdClassCpt>CptClass;
}

export function $refreshSync(cpt: VdClassCptInstance) {
    if (cpt.$vdNode && cpt.$renderer) {
        let r = cpt.$renderer, n1 = r.node, n2 = cpt.$vdNode;
        r.node = n2;
        cpt.render(r);
        r.processChanges(n2);
        r.node = n1;
    }
}

export async function $refresh(cpt: VdClassCptInstance) {
    return new Promise((resolve, reject) => {
        requestAnimationFrame(() => {
            $refreshSync(cpt);
            resolve();
        })
    });
}


function createEltOrDataNode(parent, kind: VdNodeKind, index: number, name: string, props, needRef?: 0 | 1) {
    let nd: VdElementNode = {
        kind: kind,
        index: index,
        name: name,
        ref: needRef ? ++refCount : 0,
        children: [],
        props: props,
        domNode: null
    };
    parent.children[parent.children.length] = nd;
    return nd;
}

function renderCpt(r: VdRenderer, g: VdCptNode) {
    if (g.cpt) {
        let c: VdClassCptInstance = <VdClassCptInstance>g.cpt;
        if (c.shouldUpdate) {
            if (!c.shouldUpdate()) {
                return;
            }
        }
        c.render(r);
    } else {
        (<VdFuncCptNode>g).render(r, g.props);
    }
}

function getDataNodeWrapper(props, nodeName, textValue) {
    // create a wrapper if doesn't exist - and cache it in the props object
    // note: we have to avoid creating the wrapper everytime as the <ins:dataNode/> instruction
    // would delete and recreate all the times
    let dnPropName = "$dn_" + nodeName, dnw = props[dnPropName];
    if (!dnw) {
        dnw = $dn(null, -1, nodeName, 0);
        let tx = $dt(dnw, -1, textValue);
        props[dnPropName] = dnw;
    } else {
        // node is the same but text may have changed
        $ut(textValue, dnw.children[0], dnw);
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