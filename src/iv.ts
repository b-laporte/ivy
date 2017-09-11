
import {
    VdNodeKind, VdFunctionCpt, VdNode, VdContainer, VdElementNode, VdTextNode, VdCptNode,
    VdElementWithProps, VdGroupNode, VdChangeKind, VdChangeInstruction, VdUpdateProp, VdCreateGroup, VdDeleteGroup, VdUpdateText, VdUpdateAtt, VdElementWithAtts, VdDataNode, VdChangeContainer, VdParent, VdReplaceGroup, VdClassCpt, VdClassCptInstance, VdFuncCptNode, VdUpdatePropMap
} from "./vdom";

const EMPTY_PROPS = {}, NO_PROPS = undefined, ALL_DN = "*";

let refreshCount = 0,   // Refresh count - used to know when change occured
    refreshQueue: { cpt: VdClassCptInstance, tStamp: number }[] = [],
    refCount = 0;       // Reference count - used to track node reference in unit tests

export let $iv = {
    node: null,         // current node being processed
    renderer: null,     // current renderer

    /**
     * Reset internal counters
     * For test only
     */
    reset(counterId) {
        if (counterId === 1) {
            refCount = 0;
        } else if (counterId === 2) {
            refreshCount = 0
        }
    },

    get refreshCount() {
        return refreshCount;
    }
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
        domNode: null,
        $lastChange: refreshCount,
        $lastRefresh: refreshCount
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
        parent: parent,
        $lastChange: refreshCount,
        $lastRefresh: refreshCount
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
        // contentB instructions will reference parent node that are in the light dom
        let chge;
        if (contentB.changes) {
            for (let i = 0; contentB.changes.length > i; i++) {
                chge = contentB.changes[i];
                if (chge.parent && !chge.parent.domNode) {
                    // chge.parent was the lightDom group associated to the component
                    chge.parent = parent;
                }
            }
            // push back changes
            moveChangeInstructions(contentB, changeCtn);
        }
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
export function $cc(parent: VdContainer, index: number, props: {}, cpt: VdFunctionCpt | VdClassCpt, hasLightDom: 0 | 1, needRef: 0 | 1): VdGroupNode {
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
        parent: parent,
        $lastChange: refreshCount,
        $lastRefresh: refreshCount
    };
    parent.children[parent.children.length] = g;

    if (g.cpt) {
        let c = <VdClassCptInstance>g.cpt;
        c.$node = g;
        c.$renderer = <any>$iv.renderer;
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
            props: g.props,
            changes: null,
            ref: 0,
            children: [],
            domNode: null,
            sdGroup: g,
            ltGroup: null,
            parent: null,
            $lastChange: refreshCount,
            $lastRefresh: refreshCount
        }
    } else {
        // no light dom
        // call the sub-function with the supplied parameters
        renderCpt(g);
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
            parent: parent,
            $lastChange: refreshCount,
            $lastRefresh: refreshCount
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
 * Create Property in Map
 * Create a map property to hold sub-maps or other properties (up to 4 levels: style.foo.bar.baz)
 * e.g. $cm("class", "important", 0, 0, (highlight===true), $a1);
 * Used in creation mode only
 */
export function $cm(name1: string, name2: string, name3: string | 0, name4: string | 0, value: any, element: VdElementWithProps | VdDataNode): void {
    if (!element.props) {
        element.props = {};
    }
    let propParent = element.props[name1];
    if (!propParent) {
        propParent = element.props[name1] = { $isMap: true, $lastChange: refreshCount };
    }
    if (name3) {
        if (propParent[name2]) {
            propParent = propParent[name2];
        } else {
            propParent = propParent[name2] = { $isMap: true, $lastChange: refreshCount };
        }
        if (name4) {
            if (!propParent[name3]) {
                propParent = propParent[name3];
            } else {
                propParent = propParent[name3] = { $isMap: true, $lastChange: refreshCount };
            }
            propParent[name4] = value;
        } else {
            propParent[name3] = value;
        }
    } else {
        propParent[name2] = value;
    }
}

/**
 * Update property in map
 * Used in update mode only
 */
export function $um(name1: string, name2: string, name3: string | 0, name4: string | 0, value: any, element: VdElementWithProps | VdDataNode, changeCtn: VdChangeContainer): void {
    let propParent = element.props[name1], propName = name2;
    if (name3) {
        propParent = propParent[name2];
        propName = name3;
        if (name4) {
            propParent = propParent[name3];
            propName = name4;
        }
    }
    // same logic as for Update Property
    if (propParent[propName] !== value) {
        propParent[propName] = value;
        if (!value || !value.call) {
            // change the $refreshCount of each container object (to avoid using immutable objects)
            propParent = element.props[name1];
            propParent.$lastChange = refreshCount;
            if (name3) {
                propParent = propParent[name2];
                propParent.$lastChange = refreshCount;
                if (name4) {
                    propParent[name3].$lastChange = refreshCount;
                }
            }

            if (element.kind !== VdNodeKind.Group || !(<any>element).cpt) {
                // no need to create update instruction for components
                addChangeInstruction(changeCtn, <VdUpdatePropMap>{
                    kind: VdChangeKind.UpdatePropMap,
                    name: null,
                    names: [name1, name2, name3, name4],
                    value: value,
                    node: element
                });
            }
        }
    }
}

/**
 * Update Property
 * Update the given property on the element passed as argument
 * Update instructions will be stored on changeGroup
 * Used in update mode only
 */
export function $up(name: string, value: any, element: VdElementWithProps | VdDataNode, changeCtn: VdChangeContainer): void {
    let v1 = element.props[name]
    if (v1 !== value) {
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
    } else if (v1 && v1.$isMap && v1.$lastChange > changeCtn.$lastRefresh) {
        // v1 is a prop map and changed

        if (element.kind !== VdNodeKind.Group || (<any>element).cpt) {
            // no need to create update instruction for components
            addChangeInstruction(changeCtn, <VdUpdatePropMap>{
                kind: VdChangeKind.UpdatePropMap,
                name: name,
                names: null,
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
export function $rc(cptGroup: VdGroupNode, changeCtn: VdChangeContainer): void {
    let c = cptGroup as VdCptNode;

    if (c.sdGroup !== null) {
        // there is a light dom - swap back to the shadow dom group
        let ltGroup = c;
        c = c.sdGroup;

        if (!c.props) {
            c.props = {};
        }
        c.props["$content"] = ltGroup;
    }
    renderCpt(c);

    // move changes from cptGroup to change container
    moveChangeInstructions(c, changeCtn);
}

/**
 * Refresh Data node
 * Used in update mode only to update $lastRefresh
 */
export function $rd(cptGroup: VdGroupNode, changeCtn: VdChangeContainer): void {
    if (cptGroup.$lastChange > changeCtn.$lastChange) {
        changeCtn.$lastChange = cptGroup.$lastChange;
    }
}

/**
 * Return all the data nodes that are direct descendents of the parent container / or direct descendents of sub-groups
 * attached to the parent container (in other words: this function will recursively look in sub-groups - such as js blocks - but not in sub-elements)
 */
export function $dataNodes(nodeName: string, parent?: VdContainer): VdDataNode[] {
    let res = [], pnd = parent;
    if (!pnd) {
        let nd = <any>($iv.node);
        if (nd && nd.props) {
            pnd = nd.props["$content"];
        }
    }
    if (pnd) {
        grabDataNodes((<VdContainer>pnd).children, nodeName, res);
    }
    return res;
}

/**
 * Same as $dataNodes() but will only return the first element (faster method when only one data node is expected)
 */
export function $dataNode(nodeName: string, parent?: VdContainer): VdDataNode | null {
    let res: VdDataNode | null = null, pnd = parent;

    if (!pnd) {
        let nd = <any>($iv.node);
        if (nd && nd.props) {
            let p = nd.props;
            if (p && p[nodeName]) {
                // create a data node with a sub-textNode from the prop value
                return res = getDataNodeWrapper(p, nodeName, p[nodeName]);
            }
            pnd = nd.props["$content"];
        }
    }
    if (pnd) {
        let p = (<VdContainer>pnd).props;
        if (p && p[nodeName]) {
            // create a data node with a sub-textNode from the prop value
            res = getDataNodeWrapper(p, nodeName, p[nodeName]);
        } else {
            res = grabFirstDataNode((<VdContainer>pnd).children, nodeName);
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


function renderCpt(g: VdCptNode) {
    let n1 = $iv.node;
    $iv.node = <any>g;
    if (g.cpt) {
        let c: VdClassCptInstance = <VdClassCptInstance>g.cpt, nd = c.$node;
        let isFirstRefresh = (<any>nd).$lastRefresh === refreshCount;
        if (!isFirstRefresh && c.shouldUpdate) {
            if (!c.shouldUpdate()) {
                return;
            }
        }
        c.render();
        (<any>c.$node).$lastRefresh = refreshCount;
    } else {
        (<VdFuncCptNode>g).render(g.props);
        (<VdFuncCptNode>g).$lastRefresh = refreshCount;
    }
    $iv.node = n1;
}

export function $refreshTemplate(renderer, func: Function, rootNode, data, autoProcessChanges = true) {
    let n1 = $iv.node, r1 = $iv.renderer;

    refreshCount++;
    $iv.node = rootNode;
    $iv.renderer = renderer;
    func(data);
    rootNode.$lastRefresh = refreshCount;
    $iv.node = n1;
    $iv.renderer = r1;
    if (autoProcessChanges) {
        renderer.processChanges(rootNode);
    }
}

export function $refreshSync(cpt: VdClassCptInstance) {
    if (cpt.$node && cpt.$renderer) {
        let n1 = $iv.node, n2 = cpt.$node;
        $iv.node = <any>n2;
        refreshCount++;
        cpt.render();
        n2.$lastRefresh = refreshCount;
        cpt.$renderer.processChanges(n2);
        $iv.node = n1;
    }
}

function processRefreshQueue() {
    let rr;
    while (rr = refreshQueue.pop()) {
        let cpt = rr.cpt;
        if (cpt.$node.$lastRefresh <= rr.tStamp) {
            $refreshSync(cpt);
        }
    }
}

/**
 * Add a component to the refresh queue and return a promise that will be resolved
 * when the refresh queue is flushed
 * If not component is passed, this will simply return a promise resolved when the refresh
 * queue is flushed
 * @param cpt the component instance [optional]
 */
export async function $refresh(cpt?: VdClassCptInstance) {
    if (cpt) {
        let newTStamp = refreshCount, found = false;
        // check if there is no request already in the queue
        for (let rr of refreshQueue) {
            if (rr.cpt === cpt) {
                // override the time stamp
                rr.tStamp = newTStamp;
                found = true;
            }
        }
        if (!found) {
            refreshQueue.push({ cpt: cpt, tStamp: newTStamp });
        }
    }
    return new Promise((resolve, reject) => {
        if (typeof requestAnimationFrame !== "undefined") {
            requestAnimationFrame(() => {
                processRefreshQueue();
                resolve();
            })
        } else {
            setTimeout(() => {
                processRefreshQueue();
                resolve();
            }, 0);
        }
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
    if (list) {
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
}

function grabFirstDataNode(list: VdNode[], nodeName): VdDataNode | null {
    if (list) {
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
    }
    return null;
}

function addChangeInstruction(changeCtn: VdChangeContainer, instruction: VdChangeInstruction) {
    if (changeCtn.changes) {
        changeCtn.changes.splice(changeCtn.changes.length, 0, instruction);
    } else {
        changeCtn.changes = [instruction];
    }
    changeCtn.$lastChange = refreshCount;
}

function moveChangeInstructions(changeCtn1: VdChangeContainer, changeCtn2: VdChangeContainer) {
    if (changeCtn1.changes) {
        if (changeCtn2.changes) {
            changeCtn2.changes = changeCtn2.changes.concat(changeCtn1.changes);
        } else {
            changeCtn2.changes = changeCtn1.changes;
        }
        changeCtn2.$lastChange = refreshCount;
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