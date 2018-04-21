import { DataNode } from './dstore';
import { unescapeIdentifier } from "typescript";

const DATASET = "DATASET", LIST = "LIST", MAP = "MAP";

/**
 * DataNode objects
 */
export interface DataNode {
    $kind: "DATASET" | "LIST" | "MAP";
    $dmd: DataNodeMetaData | null;       // meta-data used to track changes on last version
    $next: DataNode | null;              // linked list towards the last version
    $createNewVersion: () => void;       // create a new (clone) version of the current node. Current node will be reset to its original state and next version will be reference through $next
}

/**
 * DataNode configuration singleton 
 * Used to store common configuration data associated to given DataNode class (i.e. T)
 * Also provide a instance factory (cf. create())
 */
export interface DataNodeCfg<T> {
    create: () => T;
    setProcessor(path: string, processor: ((...any) => any) | null): void;
}

/**
 * Internal static configuration shared by the same class of data nodes
 * Contains cross-instance info such as processors, validators, subLroot retriever, etc.
 */
interface DataNodeMdCfg {
    processors: any[];
    getSubLrNodes: ((DataNode) => (DataNode | null)[]) | null;
    getDependencies: ((DataNode) => (DataNode | string | null)[][]) | null;
}

/**
 * Meta data object stored through $dmd reference on active (non frozen) DataNodes
 */
interface DataNodeMetaData {
    changed: boolean;                    // true if all data are not synced and some changes are under way
    parents: DataNode[];                 // nodes that reference this node as direct child (graph must be a DAC)
    dependencies: DataNode[] | null;     // nodes that depend on this node (like virtual parents)
    refreshNode: RefreshNode | null;     // link to the refresh node associated to this node (will be set when the node is changed and needs to be refreshed, will be removed when refreshed
    // or when one of its child node will be changed and added to the refresh list
    refreshPriority: number;             // number of child nodes that need to be refreshed before this node - priority 0 means that the node has to be refreshed first
    onFreeze: ((value) => any)[] | null; // list of callbacks that will be called when the object becomes frozen (cf. processChanges)
    cfg: DataNodeMdCfg;
    processorArgs: any[][] | null;
    watchers: ((any) => void)[] | null;    // list of watchers associated to a DataNode instance
    processDependencies: (DataNode) => void;
    runProcessors: (DataNode) => void;
}



/**
 * Class to generate each DataNodeDef instance
 */
export class DataNodeCfgImpl<T> implements DataNodeCfg<T>, DataNodeMdCfg {
    processors: any; // todo
    create: () => T;
    getDependencies: ((T) => (DataNode | string | null)[][]) | null = null;
    getSubLrNodes: ((T) => (DataNode | null)[]) | null = null; x

    constructor(createFunction: () => T, getDependencies?: ((T) => (DataNode | string | null)[][]), getSubLrNodes?: ((T) => (DataNode | null)[])) {
        this.create = createFunction;
        this.getDependencies = getDependencies ? getDependencies : null;
        this.getSubLrNodes = getSubLrNodes ? getSubLrNodes : null;
    }
    setProcessor(path: string, processor: ((...any) => any) | null): void {
        if (!this.processors) {
            this.processors = {};
        }
        this.processors[path] = processor;
    }
}

export function initChildRef(d: DataNode, child: DataNode, childName: string) {
    d["$_" + childName] = d["$__" + childName] = child;
    child.$dmd!.parents.push(d);
}

export function setProp(dataNode: DataNode, propName: string, newValue: any, isDataNode = false) {
    if (dataNode.$next) {
        console.error("DStore error: cannot update property '" + propName + "' on a frozen item");
        return;
    }
    let v = dataNode["$_" + propName];

    if (v !== newValue) {
        if (touch(dataNode, true)) {
            // store old value
            dataNode["$__" + propName] = v;
        };

        if (isDataNode) {
            updateSubDataNodeRef(dataNode, v as DataSet, newValue as DataSet);
        }
        dataNode["$_" + propName] = newValue;
    }
}

function updateSubDataNodeRef(dataNode: DataNode, currentValue: DataSet | null, newValue: DataSet | null) {
    // if value is dataset, remove parent / add parent from collection

    // remove parent ref from old ref
    disconnectChildFromParent(dataNode, currentValue);
    // add parent ref to new ref
    connectChildToParent(dataNode, newValue);
}

function disconnectChildFromParent(parent: DataNode, child: DataNode | null) {
    if (child) {
        // if child is frozen, it last version still holds the reference to the current parent
        child = lastVersion(child);
        let p = child.$dmd!.parents, idx = p.indexOf(parent);
        if (idx > -1) {
            p.splice(idx, 1);
        }
        if (child.$dmd!.changed) {
            decreaseRefreshPriority(parent);
        }
        if (!p.length) {
            // no more parent -> we have a new global root
            refreshList.addGlobalRoot(child);
            // todo if changed, make sure it will be refreshed
        }
    }
}

function connectChildToParent(parent: DataNode, child: DataNode | null) {
    if (child) {
        child = lastVersion(child);
        child.$dmd!.parents.push(parent);
        // if d was a global root, it needs to be removed from the list
        refreshList.removeGlobalRoot(child);

        if (child.$dmd!.changed) {
            // will already be refreshed
            increaseRefreshPriority(parent, refreshList);
        }
    }
}

export function setNewVersionRef(newValue: DataNode | null, currentParent: DataNode, newParent: DataNode) {
    if (!newValue) {
        return null;
    } else {
        newValue = newValue.$next || newValue;
        if (newValue) {
            // replace one parent ref with new ref
            let p = newValue.$dmd!.parents, idx = p.indexOf(currentParent);
            if (idx > -1) {
                p.splice(idx, 1, newParent);
            }
        }
        return newValue;
    }
}

function touch(d: DataNode, selfChange: boolean): boolean {
    // return true if the node was touched, false if it was already touched (i.e. marked as modified in the current update round)
    let dmd = d.$dmd, firstTimeTouch = true;
    if (!dmd) {
        console.error("DStore error: cannot touch an object that is already frozen");
        return false;
    }
    if (dmd.changed) {
        // node already modified
        firstTimeTouch = false;
    }
    dmd.changed = true;

    if (selfChange) {
        ensureRefresh(d);
    } else {
        // change is triggered by a child reference that will hold the refreshNode
        increaseRefreshPriority(d, refreshList);
    }
    if (firstTimeTouch) {
        // recursively touch on parent nodes
        if (dmd.parents.length) {
            for (let p of dmd.parents) {
                touch(p, false);
            }
        } else {
            // add node to the global roots
            refreshList.addGlobalRoot(d);
        }
    }
    return firstTimeTouch;
}

let DEBUG_ID_COUNT = 1;

class DnMetaData implements DataNodeMetaData {
    changed = false;                            // true if all data are not synced and some changes are under way
    parents: DataNode[] = [];                   // nodes that reference this node as direct child (graph must be a DAC)
    dependencies: DataNode[] | null = null;     // nodes that depend on this node (like virtual parents)    
    refreshNode: RefreshNode | null = null;
    refreshPriority = 0;
    onFreeze: ((value) => any)[] | null = null;
    processorArgs: any[][] | null = null;
    cfg: DataNodeMdCfg;
    watchers: ((any) => void)[] | null = null;

    constructor(cfg: DataNodeMdCfg) {
        this.cfg = cfg;
    }

    runProcessors(dmdOwner: DataNode): void {
        if (this.processorArgs) {
            let pArgs: any[], path: string, processor, result: any;
            for (let i = 0; this.processorArgs.length > i; i++) {
                pArgs = this.processorArgs[i];
                path = pArgs[0];
                processor = this.cfg.processors ? this.cfg.processors[path] : null;
                if (processor) {
                    let args = pArgs.slice(2).map((item) => lastVersion(item));
                    result = processor.apply(null, args);
                    if (typeof pArgs[1] === "string") {
                        // the target is a direct property of the dmdOwner
                        result = result ? result.$next || result : result;
                        setProp(dmdOwner, pArgs[1], result, result.$dmd !== undefined && result.$dmd !== null);
                    }
                }
            }
        }
    }

    processDependencies(dmdOwner: DataNode) {
        // process sub local root nodes
        if (this.cfg.getSubLrNodes) {
            let subLr = this.cfg.getSubLrNodes(dmdOwner);
            for (let lr of subLr) {
                if (lr) {
                    lr = lr.$next || lr;
                    lr.$dmd!.processDependencies(lr);
                }
            }
        }

        // process own dependencies
        // if one of the dependency has changed, log target in $dmd.dependencies list and increment refreshPriority
        if (this.cfg.getDependencies) {
            let dependencies = this.cfg.getDependencies(dmdOwner), target: DataNode | null, d: DataNode | null, dmd: DataNodeMetaData,
                changed = false,
                isDataStore = false,
                dep: (string | DataNode | null)[],
                newVal: any;
            if (dependencies) {
                let pArgs: any[];
                this.processorArgs = this.processorArgs || [];

                for (let idx = 0; dependencies.length > idx; idx++) {
                    dep = dependencies[idx];
                    // dep is an Array of string | DataNode | null
                    // e.g. ["/node2", "node2", (nd.node ? nd.node.node : null)]
                    // dep[0] is the path from the local root associated to this node - it is also the processor identifier
                    // dep[1] is the dependency target 
                    //    - if it is a string, it refers to a primitive type value stored as a direct property of dmdOwner
                    //    - if it is a DataNode, it is a sub-DataNode that can be a direct or a farther child node
                    // dep[i>1] are the processor arguments (i.e. the data that the dependencies rely on) 
                    //    - if one these data has changed, the processor needs to be called again -> so the target needs to be freshed
                    // previous dependency values are stored in the dmd.
                    if (!dep || !dep[0] || !dep[1]) {
                        // target could be null if it refers to a sub-node that has been deleted
                        this.processorArgs[idx] = [];
                        continue;
                    }
                    if (!this.processorArgs[idx]) {
                        this.processorArgs[idx] = [];
                    }
                    pArgs = this.processorArgs[idx]; // current processor Args
                    pArgs[0] = dep[0]; // path
                    pArgs[1] = dep[1];

                    if (typeof dep[1] === "string") {
                        target = dmdOwner;
                    } else {
                        target = dep[1] as DataNode;
                    }
                    target = target.$next || target; // $next should be null, just in case

                    if (!target) {
                        // todo: create target placeholder to still be able to call the processor to generate a new target if need be
                        console.log("Null targets cannot be processed [under construction]");
                        continue;
                    }

                    changed = false;
                    for (let i = 2; dep.length > i; i++) {
                        if (!dep[i]) {
                            if (pArgs[i] !== dep[i]) {
                                changed = true;
                                pArgs[i] = dep[i];
                            }
                            continue;
                        }
                        newVal = null;
                        isDataStore = false

                        if (typeof dep[i] === "string") {
                            newVal = dmdOwner["$_" + dep[i]];
                        } else {
                            newVal = dep[i];
                            isDataStore = true;
                        }

                        if (pArgs[i] !== newVal) {
                            changed = true;
                            pArgs[i] = newVal;
                        }

                        if (isDataStore) {
                            d = dep[i] as DataNode;
                            d = d.$next || d; // $next should be null, just in case
                            if (d && (!d.$dmd || d.$dmd.changed)) {
                                // dependency has changed
                                ensureRefresh(d);
                                changed = true;

                                dmd = d.$dmd!;
                                if (d !== target) {
                                    // ensure that target is refreshed after d
                                    if (dmd.dependencies) {
                                        dmd.dependencies!.push(target);
                                    } else {
                                        dmd.dependencies = [target];
                                    }
                                    increaseRefreshPriority(target, refreshList);
                                }
                            }
                        }
                    }
                    // if changed, make sure target will be updated
                    if (changed) {
                        ensureRefresh(target);
                    }
                }
            }
        }
    }
}

export abstract class DataSet implements DataNode {
    $kind: "DATASET" = "DATASET";
    $debugId: number;    // internal unique id to ease debugging (should be removed)
    $dmd: DataNodeMetaData | null = null;
    $next: DataSet | null = null;                     // linked list towards the last version

    constructor(cfg: DataNodeMdCfg, initDmd = true) {
        this.$debugId = DEBUG_ID_COUNT++;
        if (initDmd) {
            initializeDmd(this, cfg);
        }
    }

    abstract $createNewVersion();
}

function initializeDmd(dn: DataNode, cfg: DataNodeMdCfg) {
    dn.$dmd = new DnMetaData(cfg);
}

export function transferDmd(currentVersion: DataNode, nextVersion: DataNode) {
    let dmd: DataNodeMetaData = nextVersion.$dmd = currentVersion.$dmd!;
    currentVersion.$dmd = null;
    dmd.refreshNode = null;
    dmd.refreshPriority = 0;
    dmd.changed = dmd.cfg.processors ? dmd.cfg.processors.length > 0 : false;
    if (dmd.changed) {
        dmd.refreshNode = refreshList.add(nextVersion);
    }
}

export interface DataList<T> {
    length: number;
    newItem(index?: number): T;
    set(index: number, item: T | null): T | null;
    get(index: number): T | null;
    push(...items: T[]);
    splice(start: number, deleteCount?: number, ...items: T[]);
    forEach: (cb: (item: T, index?: number, dataList?: DataList<T>) => void, cbThis?) => void;
    filter: (cb: (item: T, index?: number, dataList?: DataList<T>) => boolean, cbThis?) => DataList<T>;
    indexOf: (searchElement: any, fromIndex?: number) => number;
    toString: () => string;
}

function preventChangeOnFrozenObject(d: DataNode, location: string = ""): boolean {
    if (!d.$dmd) {
        console.error("DStore error: frozen objects cannot be updated [" + location + "]");
        return true;
    }
    return false;
}

export abstract class DataListImpl<T extends DataNode> implements DataNode, DataList<T> {
    $kind: "LIST" = "LIST";
    $debugId: number;    // internal unique id to ease debugging (should be removed)
    $dmd: DataNodeMetaData | null = null;
    $next: DataListImpl<T> | null = null;
    $containsDataSets = true;
    $_list: (T | null)[] = [];
    $__list: (T | null)[] | null = null;

    constructor(cfg: DataNodeMdCfg, initDmd = true) {
        this.$debugId = DEBUG_ID_COUNT++;
        if (initDmd) {
            initializeDmd(this, cfg);
        }
    }

    abstract $newInstance(initDmd: boolean): DataListImpl<T>;

    abstract $newItem(): T;

    get length() {
        return this.$_list.length;
    }

    newItem(index?: number): T {
        let itm = this.$newItem();
        if (index === undefined) {
            index = this.$_list.length;
        }
        if (index > -1) {
            if (preventChangeOnFrozenObject(this, "DataList.newItem")) return itm;
            this.set(index, itm);
        }
        return itm;
    }

    set(index: number, item: T | null): T | null {
        // same logic as setProp
        if (preventChangeOnFrozenObject(this, "DataList.set")) return item;
        let currentValue = this.$_list[index];

        if (currentValue !== item) {
            this.markAsChanged();
            if (this.$containsDataSets) {
                updateSubDataNodeRef(this, (currentValue as any) as DataSet, (item as any) as DataSet);
            }
            this.$_list[index] = item;
        }
        return item;
    }

    get(index: number): T | null {
        return this.$_list[index];
    }

    push(...items: T[]) {
        if (preventChangeOnFrozenObject(this, "DataList.push")) return;
        let sz = items.length, ln = this.$_list.length;
        for (let i = 0; sz > i; i++) {
            this.set(ln + i, items[i]);
        }
    }

    markAsChanged() {
        if (touch(this, true)) {
            // store old value
            this.$__list = this.$_list;
            this.$_list = this.$_list.slice(0); // shallow clone array
        };
    }

    forEach(cb: (item: T, index?: number, dataList?: DataList<T>) => void, cbThis?) {
        this.$_list.forEach((item, index) => {
            cb.call(cbThis, item, index, this);
        });
    }

    filter(cb: (item: T, index?: number, dataList?: DataList<T>) => boolean, cbThis?): DataList<T> {
        let res = this.$newInstance(true), item,
            lsFiltered = this.$_list.filter((item, index, arr) => {
                return cb.call(cbThis, item, index, this);
            }, cbThis);
        (res as any).$_list = (res as any).$__list = lsFiltered;
        for (let i=0, sz=lsFiltered.length; sz>i;i++) {
            item=lsFiltered[i];
            if (item.$dmd) {
                item.$dmd.parents.push(res);
            }
        }
        return res;
    }

    indexOf(searchElement: any, fromIndex?: number): number {
        return this.$_list.indexOf(searchElement, fromIndex);
    }

    splice(start: number, deleteCount: number | undefined = undefined, ...items: T[]) {
        if (preventChangeOnFrozenObject(this, "DataList.splice")) return;
        // adapt inputs according to array specs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
        let len = this.$_list.length;
        if (start > len) {
            start = len;
            deleteCount = 0;
        } else if (start < 0) {
            start = len + start;
            if (start < 0) {
                start = 0;
            }
        }
        if (deleteCount === undefined || deleteCount > len - start) {
            deleteCount = len - start;
        } else if (deleteCount < 0) {
            deleteCount = 0;
        }

        if (deleteCount > 0 || items.length > 0) {
            this.markAsChanged();
        }

        let item, list = this.$_list;
        // disconnect children
        for (let i = 0; deleteCount > i; i++) {
            item = list[start + i];
            if (item) {
                disconnectChildFromParent(this, item);
            }
        }
        // connect new children
        for (let i = 0; items.length > i; i++) {
            item = items[i];
            if (item) {
                connectChildToParent(this, item);
            }
        }
        // update list
        list.splice(start, deleteCount, ...items);
    }

    $createNewVersion() {
        let ds: DataListImpl<T> = this.$newInstance(false);
        this.$next = ds;
        transferDmd(this, ds);

        if (this.$containsDataSets) {
            // loop over all indices that have been changed
            // and update parent refs
            let ls = this.$_list, len = ls.length, dsLs = ds.$_list;
            for (let i = 0; len > i; i++) {
                dsLs[i] = setNewVersionRef((ls[i] as any), this, ds) as T;
            }
        } else {
            ds.$_list = this.$_list;
        }

        if (this.$__list) {
            this.$_list = this.$__list!;
            this.$__list = null;
        }
    }

    toString() {
        return (this.$_list) ? this.$_list.join(",") : "";
    }
}

export function isBeingChanged(d: any) {
    // can't use d:DsDataNode signature as it is used on Data objects
    if (d.$dmd === null) {
        return false;
    } else {
        return d.$dmd.changed;
    }
}

let MAX_ITERATION = 10000;
export function lastVersion<T>(dataNode: T): T {
    let d: any = dataNode;
    // fast case first
    if (!d || !d.$next) return d;
    if (!d.$next.$next) return d.$next;
    let c = 0;
    do {
        d = d.$next;
        if (!d.$next) return d;
        c++;
    } while (c < MAX_ITERATION);
    // we should never get here
    console.error("DStore error: Max iteration reached in lastVersion");
    return d;
}

/**
 * Return a promise that will be resolved when all mutation are processed and the object is pristine again
 * The function will return the new version of the data object (previous version will)
 * @param d {DataSet} the data object to process
 */
export async function processingDone(d: any) {
    // this function returns when the dataset is processed (and becomes frozen)
    if (!d || !d.$kind || d.$kind !== DATASET) return d;
    if (d && (d.$next || !d.$dmd)) {
        console.error("DStore Error: changes cannot be processed on a frozen object");
        return;
    }
    let dmd = d.$dmd as DataNodeMetaData;
    if (!dmd.changed) return d; // already ok

    return new Promise(function (resolve, reject) {
        if (dmd.onFreeze === null) {
            dmd.onFreeze = [resolve];
        } else {
            dmd.onFreeze.push(resolve);
        }
    });
}

/**
 * Watch all changes associated to a data node instance
 * @param d  the data node to watch
 * @param fn the function to call when the data node changes (the new data node version will be passed as argument)
 * @return the watch function that can be used as identifier to un-watch the object (cf. unwatch)
 */
export function watch(d: any, fn: (any) => void): ((any) => void) | null {
    d = lastVersion(d);
    if (d.$dmd) {
        let dmd = d.$dmd!;
        if (!dmd.watchers) {
            dmd.watchers = [fn];
        } else {
            dmd.watchers.push(fn);
        }
        return fn;
    }
    return null;
}

/**
 * Stop watching a data node
 * @param d the targeted data node
 * @param watchFn the watch function that should not be called any longer (returned by watch(...))
 */
export function unwatch(d: any, watchFn: ((any) => void) | null) {
    d = lastVersion(d);
    if (d.$dmd && watchFn) {
        let w = d.$dmd.watchers;
        if (w) {
            d.$dmd.watchers = w.filter((f) => f !== watchFn);
        }
    }
}

// ###############################################################################################################
// Refresh section

/*

Dependency management:
- each node with a dependency will have a function in its local root to retrieve the list of dependencies

- local roots = nodes exposed through hashed fragments -> $dmd.isLocalRoot=true
- local roots will host dependencies for their children (compilation time) as dependencies can only be expressed in the same local tree
- local roots have a way to iterate over their sub-local roots (from code generator) -> $getSubLocalRoots -> array of null | DataNode
- the root node of a tree is always dirty and can be set in a specific 'refresh list' - it is also a local root node
    - a root node can be created when a node is touched or when a link is cut
    - a root node can be removed from the root node list when it is attached to another node

when refresh starts, for each root node
- root node will be a local root
- scan sub-local root dependencies -> $dmd.lrDependencies
- then scan own local root dependency:
    - if one of the dependency has changed, log target in $dependencies list and increment refreshPriority
    - when one node is refreshed, decrement refreshPriority of its $dependency node list and empty this list
-> dependencies need to be walked through before actual refresh to refresh nodes in the right order

- when a node is refreshed:
    - run processors and validators
    - then if changed create new version
- when dependency is refreshed (i.e. its processors and validators have run) -> decrement parent and $dependencies refreshDependencies

 */

/**
 * Refresh linked list: contains all 'start' nodes that need to be processed/refreshed
 */
class RefreshNode {
    next: RefreshNode | null = null;
    prev: RefreshNode | null = null;
    dataNode: DataNode | null = null;
    list: RefreshList | null = null;

    constructor(dn: DataNode) {
        this.dataNode = dn;
    }
}

/**
 * Context holding a linked list of nodes that need to be refreshed
 */
class RefreshList {
    private roots: DataNode[] = []; // global roots that need to be refreshed
    first: RefreshNode | null = null;
    last: RefreshNode | null = null;

    addGlobalRoot(dn: DataNode) {
        let idx = this.roots.indexOf(dn);
        if (idx < 0) {
            this.roots.push(dn);
        }
    }

    removeGlobalRoot(dn: DataNode) {
        let idx = this.roots.indexOf(dn);
        if (idx > -1) {
            this.roots.splice(idx, 1);
        }
    }

    /**
     * Recursively go over global and local roots to ensure nodes are refreshed 
     * in the right order according to their dependencies
     */
    processDependencies() {
        for (let r of this.roots) {
            r.$dmd!.processDependencies(r);
        }
        this.roots = [];
    }

    /**
     * Get a refresh node from the pool (or create a new one) and initialize it
     * @param dn the DataNode to associate to the refresh node
     */
    add(dn: DataNode): RefreshNode {
        let rn = refreshPool.pop();
        if (!rn) {
            rn = new RefreshNode(dn);
        } else {
            rn.dataNode = dn;
        }

        rn.prev = rn.next = null;
        rn.list = this;
        if (!this.first) {
            this.first = this.last = rn;
            setTimeout(processRefreshList, 0); // todo: use RAF when possible
        } else {
            // add last
            let last = this.last!;
            last.next = rn;
            rn.prev = last;
            this.last = rn;
        }
        return rn;
    }


    /**
     * Release and reset a refresh node. Set it back to the refresh node pool
     * @param rn the RefreshNode to release
     */
    release(rn: RefreshNode) {
        if (rn.list !== this) {
            return;
        }
        let dn = rn.dataNode!.$next || rn.dataNode, dmd = dn!.$dmd!; // lastVersion(rn.dataNode)
        dmd.refreshNode = null;
        // warning: refreshDependencies may be > 0 when node is removed from list when a child takes precedence
        rn.dataNode = null;
        if (rn.prev) {
            if (rn.next) {
                rn.prev.next = rn.next;
                rn.next.prev = rn.prev;
            } else {
                // rn is last
                rn.prev.next = null;
                this.last = rn.prev;
            }
        } else if (rn.next) {
            // the node should be first
            if (this.first === rn) {
                this.first = rn.next;
            }
            rn.next.prev = null;
        } else {
            // both prev and next are null: this node should be the only node in the list
            if (this.first === rn) {
                this.first = this.last = null;
            }
        }
        rn.list = rn.prev = rn.next = null; // release all references
        refreshPool.push(rn);
    }
}

// list of all nodes that need to be refreshed
let refreshList: RefreshList = new RefreshList(),
    refreshPool: RefreshNode[] = [];

interface DnWatcher {
    dataNode: DataNode;
    cbList: ((DataNode) => void)[];
}

function processRefreshList() {
    let rList = refreshList;
    // scan global root to process dependencies
    rList.processDependencies();

    if (!rList.first) {
        console.error("DStore error: refresh list should not be empty");
        return;
    }
    refreshList = new RefreshList();

    let d: DataNode, parents: DataNode[], rd, nextNext, keepGoing = true, next = rList.first, instanceWatchers: DnWatcher[] = [], tempWatchers: DnWatcher[] = [];

    // create new versions
    while (keepGoing) {
        if (!next) {
            keepGoing = false;
        } else {
            d = next.dataNode!;
            d = d.$next || d;
            processNode(d, instanceWatchers, tempWatchers);
            d = d.$next!;
            decreaseListRefreshPriority(d.$dmd!.parents, rList);
            decreaseListRefreshPriority(d.$dmd!.dependencies, rList);
            d.$dmd!.dependencies = null;
            nextNext = next.next;
            rList.release(next);
            if (nextNext) {
                next = nextNext;
            } else {
                if (next === rList.first) {
                    keepGoing = false;
                } else {
                    next = rList.first;
                }
            }
        }
    }
    if (rList.first) {
        // some node could not be refreshed: we have a circular dependency
        console.error("DStore error: some node could not be properly refreshed because of a circular dependency");
    }

    // notify all instance watchers (generated through calls to watch(...))
    callWatchers(instanceWatchers);
    // notify all temporary watchers (generated through calls to processingDone(...))
    callWatchers(tempWatchers);
}

function callWatchers(watchers: DnWatcher[]) {
    let cbList;
    for (let w of watchers) {
        cbList = w.cbList;
        for (let cb of cbList) {
            cb(w.dataNode);
        }
    }
}

function decreaseRefreshPriority(d: DataNode, rList?: RefreshList) {
    let dmd = d.$dmd;
    if (dmd) {
        let rd = --dmd.refreshPriority;
        if (rd == 0) {
            // add to refresh list
            rList = rList || refreshList;
            dmd.refreshNode = rList.add(d);

            if (dmd.parents.length === 0) {
                // this is a new global root
                rList.addGlobalRoot(d);
            }
        }
    }
}

function increaseRefreshPriority(d: DataNode, rList?: RefreshList) {
    let dmd = d.$dmd;
    if (dmd) {
        if (dmd.refreshPriority === 0 && dmd.parents.length === 0) {
            rList = rList || refreshList;
            rList.removeGlobalRoot(d);
        }
        dmd.refreshPriority++;
        if (dmd.refreshNode) {
            // priority is no more 0 so if node was in the refresh list we should remove it
            dmd.refreshNode.list!.release(dmd.refreshNode);
            dmd.refreshNode = null;
        }
    }
}

function ensureRefresh(d: DataNode, rList?: RefreshList) {
    let dmd = d.$dmd;
    if (dmd && dmd.refreshPriority === 0 && !dmd.refreshNode) {
        rList = rList || refreshList;
        dmd.refreshNode = rList.add(d);
    }
}

function decreaseListRefreshPriority(list: DataNode[] | null, rList: RefreshList) {
    if (list) {
        for (let d of list) {
            decreaseRefreshPriority(d, rList);
        }
    }
}

function processNode(d: DataNode, instanceWatchers: DnWatcher[], tempWatchers: DnWatcher[]) {
    // add a new version at the end of the $next linked list
    let dmd = d.$dmd!, cbList = dmd.onFreeze;
    dmd.onFreeze = null; // remove current callbacks

    // call processors
    dmd.runProcessors(d);

    // create new version
    d.$createNewVersion();

    d = d.$next!;
    dmd.changed = false; // processors have already been run
    if (dmd.watchers) {
        instanceWatchers.push({ dataNode: d, cbList: dmd.watchers });
    }
    if (cbList) {
        tempWatchers.push({ dataNode: d, cbList: cbList });
    }
}