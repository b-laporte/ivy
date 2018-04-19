
const DATASET = "DATASET", ARRAY = "ARRAY", MAP = "MAP";

let DS_REFRESH_QUEUE: DataNode[] = [], MIN_DEPTH = 0;

export const DsEmptyParents = [];

export interface DataNode {
    $kind: "DATASET" | "ARRAY" | "MAP";
    $pristine: boolean;                // true if all data in in sync and no change is under way
    $parents: DataNode[];              // nodes that reference this node as direct child (graph must be a DAC)
    $depth: number;
    $next: DataNode | null;            // linked list towards the last version
    $onPristine: ((value) => any)[] | null; // list of callbakcs that will be called if objects wait for new pristine version (cf. processChanges)
    $createNewVersion: () => void;    // create a new (clone) version of the current node. Current node will be reset to its original state and next version will be reference through $next
}

export interface DsArray<T> extends Array<T> {
    newItem(): T;
}

export interface DsProcessor {

}

export function setProp(item: DataNode, propName: string, newValue: any, isDataSet?: boolean) {
    if (item.$next) {
        console.error("DStore error: cannot update property '" + propName + "' on a sealed item");
        return;
    }
    let v = item["$_" + propName];

    // todo if value is dataset, remove parent / add parent from collection
    if (v !== newValue) {
        touch(item);
        if (isDataSet && newValue["$parents"]) {
            (<DataSet>newValue).$parents.push(item);
        }
        item["$_" + propName] = newValue;
    }
}

export function updateRef(item: DataNode, newItem: DataNode, currentRefProp: string, oldRefProp: string, newRefValue: any, oldRefValue: any) {
    // update a sub data node reference during the $createNewVersion process
    // note: newRefValue === item[currentRefProp]  and   oldRefValue === item[oldRefProp]
    // possible changes
    // null -> null       : nothing to do
    // null -> sth        : reference latest version of sth, add item to sth parents
    // sth -> sth         : no change, still reference the same item
    // sth -> null        : reference null, clean sth (remove current item from sth parents)
    // sth -> sthElse     : reference sthElse, clean sth, add item to sthElse parents
    // sth -> sthV2       : reference sthV2, clean sth, add item to sthV2 parents

    // set new value in new item
    let last = lastVersion(newRefValue);
    newItem[currentRefProp] = newItem[oldRefProp] = last;

    if (oldRefValue === null) {
        if (newRefValue !== null) {
            newRefValue.$parents.push(newItem);
        }
    } else {
        if (newRefValue !== oldRefValue || newRefValue !== last) {
            // remove item from oldRefValue as item will be sealed
            if (oldRefValue.$parents && oldRefValue.$parents !== DsEmptyParents) {
                oldRefValue.$parents = oldRefValue.$parents.filter(p => p !== item);
            }

            if (newRefValue !== null) {
                // add newItem as parent if not already in the list
                let found = false, parents = newRefValue.$parents;
                for (let i = 0; parents.length > i; i++) {
                    if (parents[i] === newItem) {
                        found = true;
                        break;
                    }
                    if (!found) {
                        parents.push(newItem);
                    }
                }
            }
        }
    }
    // item will be sealed, back to old value on current ref and remove unnecessary old value ref
    item[currentRefProp] = oldRefValue;
    item[oldRefProp] = null;
}

function touch(d: DataNode): boolean {
    // return true if the node was touched, false if it was already touched (i.e. marked as modified in the current update round)

    if (!d.$pristine) {
        return false; // node already modified
    }
    d.$pristine = false;
    d.$depth = MIN_DEPTH; // reset depth
    // TODO - if dependencySrc, markRootNode dependency // dependencySrc is known at compilation time

    // recursively touch on parent nodes
    for (let p of d.$parents) {
        touch(p);
        if (p.$depth >= d.$depth) {
            d.$depth = p.$depth + 1; // ensure child node will be processed before parent
        }
    }

    // add to refresh queue
    if (DS_REFRESH_QUEUE.length === 0) {
        // todo: use RAF when appropriate
        setTimeout(processRefreshQueue, 0);
    }
    DS_REFRESH_QUEUE.push(d);
    return true;
}

function processRefreshQueue() {
    let rQueue = DS_REFRESH_QUEUE;
    if (!rQueue.length) return;
    debugger
    DS_REFRESH_QUEUE = [];
    // sort queue in reverse $depth order
    // we reverse it first as by construction children are added after their parent
    // so reversing the array brings it closer to its final state
    rQueue.reverse().sort((a: DataNode, b: DataNode) => b.$depth - a.$depth);

    // call processors

    // create new versions
    let next;
    for (let d of rQueue) {
        // add a new version at the end of the $next linked list
        next = d.$next;
        while (next !== null) {
            d = next;
            next = d.$next;
        }
        if (d.$parents === DsEmptyParents) {
            console.error("DStore error: new version cannot be created on sealed dataset")
        } else {
            d.$createNewVersion();
            d.$pristine = true; // processors have already been run
        }
    }

    // notify all pristine watchers
    let last, cbList;
    for (let d of rQueue) {
        if (d.$onPristine) {
            cbList = d.$onPristine;
            d.$onPristine = null; // callback may re-register new callback so we need to remove current callbacks before processing them
            last = lastVersion(d);
            for (let cb of cbList) {
                cb(last);
            }
        }
    }
}

let DEBUG_ID_COUNT = 1;

export abstract class DataSet implements DataNode {
    $kind: "DATASET" = "DATASET";
    $debugId: number;    // internal unique id to ease debugging (should be removed)
    $parents: DataNode[] = [];
    $pristine = true;
    $processors: DsProcessor[] | null;
    $onPristine: ((value) => any)[] | null = null;
    $depth = 0;                                       // to calculate the refresh priority
    $next: DataSet | null = null;                     // linked list towards the last version

    constructor(processors: DsProcessor[] | null = null, forcePristine = false) {
        this.$debugId = DEBUG_ID_COUNT++;
        this.$processors = processors;
        if (!forcePristine && processors && processors.length) {
            this.$pristine = false; // dataset is not pristine at creation time as processors have not been run yet
        }
    }

    abstract $createNewVersion();
}

export function isPristine(d: any) {
    // can't use d:DsDataNode signature as it is used on Data objects
    return d.$pristine !== false;
}

let MAX_ITERATION = 10000;
export function lastVersion(d: any) {
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
}

/**
 * Return a promise that will be resolved when all mutation are processed and the object is pristine again
 * The function will return the new version of the data object (previous version will)
 * @param d {DataSet} the data object to process
 */
export async function processChanges(d: any) {
    // this function returns when the dataset is pristine
    if (!d || !d.$kind || d.$kind !== DATASET) return d;
    if (d && d.$next) {
        console.error("DStore Error: changes cannot be processed on a sealed object");
        return;
    }
    if (d.$pristine) return d; // already ok

    return new Promise(function (resolve, reject) {
        if (d.$onPristine === null) {
            d.$onPristine = [resolve];
        } else {
            d.$onPristine.push(resolve);
        }
    });
}
