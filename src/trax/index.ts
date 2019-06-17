import { createVariableDeclaration } from 'typescript';

const MP_TRACKABLE = "ΔTrackable",
    MP_CHANGE_VERSION = "ΔChangeVersion", // last changed meta property
    MP_META_DATA = "ΔMd",
    MP_DATA_FACTORY = "ΔDataFactory",
    MP_FACTORY = "ΔFactory",
    MP_IS_FACTORY = "ΔIsFactory",
    MP_IS_PROXY = "ΔIsProxy",
    MP_CREATE_PROXY = "ΔCreateProxy";

let TRAX_COUNTER = 1;

export interface TraxObject {
    ΔTrackable: true;
    ΔChangeVersion: number;
    ΔMd: TraxMetaData | undefined;
}

export interface TraxMetaData {
    parents: FlexArray<TraxObject>;
    refreshCtxt?: RefreshContext;
    watchers?: FlexArray<WatchFunction>;      // list of watchers associated to a DataNode instance
}

export interface Constructor<T> {
    ΔFactory?: Factory<T>;
    new(): T;
}

export interface Factory<T> {
    ΔIsFactory: true;
    ΔCreateProxy?: (v: any) => TraxObject | null;
    (json?: Object): T;
}

function initMetaData(o: TraxObject): TraxMetaData | null {
    if (!o.ΔTrackable) return null;
    if (!o.ΔMd) {
        return o.ΔMd = {
            parents: undefined,
            refreshCtxt: undefined,
            watchers: undefined
        }
    }
    return o.ΔMd;
}
// -----------------------------------------------------------------------------------------------------------------------------
// Soft Array functions

// The purpose of FlexArray is to avoid the creation of an Array in cases where we don't need it (here in 95% of cases)
type FlexArray<T> = T | T[] | undefined;

const $isArray = Array.isArray;

function FA_forEach<T>(a: FlexArray<T>, fn: (item: T) => void) {
    if (a) {
        if ($isArray(a) && !a[MP_IS_PROXY]) {
            (a as Array<T>).forEach(fn);
        } else {
            fn(a as any);
        }
    }
}

function FA_removeItem<T>(a: FlexArray<T>, item: T | undefined): FlexArray<T> {
    if (a && item) {
        if (a === item) {
            return undefined;
        } else if ($isArray(a)) {
            let arr = a as Array<T>;
            if (arr.length === 1) {
                if (arr[0] === item) return undefined
            } else {
                let idx = arr.indexOf(item);
                if (idx > -1) {
                    arr.splice(idx, 1);
                    if (arr.length === 1) return arr[0];
                    return arr;
                }
            }
        }
    }
    return a;
}

function FA_addItem<T>(a: FlexArray<T>, item: T): FlexArray<T> {
    if (!a) {
        return item;
    } else {
        if ($isArray(a) && !a[MP_IS_PROXY]) {
            (a as Array<T>).push(item);
            return a
        } else {
            return [a, item] as any;
        }
    }
}

// -----------------------------------------------------------------------------------------------------------------------------
// trax public apis

/** 
 * Data object decorator
 */
export function Data(c: any) { } // empty: will be replaced at compilation time

/** 
 * Debug utility to print the generated class on the standard output
 * e.g. @Data @log MyData {}
 */
export function log(c: any) { }

// TODO
export function ref(proto, key: string) {

}

// TODO
export function computed(proto, propName: string, descriptor: PropertyDescriptor) {

}

export function version(o: any /*DataObject*/): number {
    return (o && o[MP_TRACKABLE] === true) ? o[MP_CHANGE_VERSION] : -1;
}

// export function touch(o: any /*DataObject*/): number {
//     // necessary to touch param nodes if $content changes (= contains instructions)
//     return 0; // return new version if DataObject or 0 if not
// }

export function hasProperty(o: any /*TraxObject*/, property: string): boolean {
    return false; // TODO
}

export function isDataObject(o: any /*TraxObject*/): boolean {
    return !!(o && o[MP_TRACKABLE] === true);
}

export function isBeingChanged(o: any /*TraxObject*/): boolean {
    return o[MP_CHANGE_VERSION] === TRAX_COUNTER;
}

/**
 * Return a promise that will be resolved when the current context has refreshed
 */
export async function changeComplete() {
    return new Promise(function (resolve) {
        refreshContext.addWatcher(resolve);
    }) as any;
}

type WatchFunction = (o: TraxObject) => void;

/**
 * Watch all changes associated to a data node instance
 * @param o  the data node to watch
 * @param fn the function to call when the data node changes (the new data node version will be passed as argument)
 * @return the watch function that can be used as identifier to un-watch the object (cf. unwatch)
 */
export function watch(o: any, fn: WatchFunction): WatchFunction {
    let md = initMetaData(o);
    if (md) {
        // console.log("FA_addItem: watch")
        md.watchers = FA_addItem(md.watchers, fn);
        if (isBeingChanged(o)) {
            refreshContext.checkObject(o);
        }
    }
    return fn;
}

/**
 * Stop watching a data node
 * @param d the targeted data node
 * @param watchFn the watch function that should not be called any longer (returned by watch(...))
 */
export function unwatch(o: any, watchFn: WatchFunction) {
    let md = initMetaData(o);
    if (md) {
        md.watchers = FA_removeItem(md.watchers, watchFn);
    }
}

// -----------------------------------------------------------------------------------------------------------------------------
// trax private apis (generated code)

/**
 * Data Object class decorator
 * @param c the data object constructor
 */
export function ΔD(c: any) {
    let proto = c.prototype;

    proto[MP_TRACKABLE] = true;
    proto[MP_CHANGE_VERSION] = 0;
}

/**
 * Property decorator
 * Adds getter / setter 
 * @param factory 
 */
export function Δp<T>(factory: Factory<T>, canBeNull?: 1) {
    return function (proto, key: string) {
        // proto = object prototype
        // key = the property name (e.g. "value")
        let ΔΔKey = "ΔΔ" + key, cbn = canBeNull === 1;
        addPropertyInfo(proto, key, false, {
            get: function () { return ΔGet(<any>this, ΔΔKey, key, factory, cbn); },
            set: function (v) { ΔSet(<any>this, ΔΔKey, v, factory, <any>this); },
            enumerable: true,
            configurable: true
        });
    }
}

/**
 * Generate a factory function for a given Data class reference
 */
export function Δf<T>(dataObjectClassRef: Constructor<T>): Factory<T> {
    let f = dataObjectClassRef.ΔFactory;
    if (f) return f;

    function factory(json: Object) {
        return new dataObjectClassRef();
    }
    factory[MP_IS_FACTORY] = true;
    dataObjectClassRef[MP_FACTORY] = factory as Factory<T>;
    return factory as Factory<T>;
}

/**
 * Factory function for a new string
 */
function $fStr() { return "" }
$fStr[MP_IS_FACTORY] = true;
export let ΔfStr: Factory<string> = $fStr as Factory<string>;

/**
 * Factory function for numbers
 */
function $fNbr() { return 0 }
$fNbr[MP_IS_FACTORY] = true;
export let ΔfNbr: Factory<number> = $fNbr as Factory<number>;

/**
 * Factory function for booleans
 */
function $fBool() { return false }
$fBool[MP_IS_FACTORY] = true;
export let ΔfBool: Factory<boolean> = $fBool as Factory<boolean>;

/**
 * Fills a proto info structure with some more property description
 * @param proto the proto info structure
 * @param propName name of the property
 * @param isDataNode true if the property is a datanode
 */
function addPropertyInfo(proto: any, propName: string, isDataNode: boolean, desc: PropertyDescriptor | undefined) {
    // let nm1 = isDataNode ? "$dProps" : "$vProps",
    //     nm2 = isDataNode ? "$dProps2" : "$vProps2";
    // if (!proto[nm1]) {
    //     proto[nm1] = [];
    //     proto[nm2] = [];
    //     proto["$pMap"] = {}; // property map
    // } else if (!proto.hasOwnProperty(nm1)) {
    //     // we are in a sub-class of a dataset -> copy the proto arrays
    //     proto[nm1] = proto[nm1].slice(0);
    //     proto[nm2] = proto[nm2].slice(0);
    // }
    // no: proto[nm1].push(propName);
    // no: proto[nm2].push("$$" + propName);
    // proto["$pMap"][propName] = 1;
    // proto["$$" + propName] = defaultValue;
    if (desc && delete proto[propName]) {
        Object.defineProperty(proto, propName, desc);
    }
}

/**
 * Internal property getter function
 * @param o the Data object on which to get the property
 * @param ΔΔPropName the property name (should start with "$$" - e.g. "$$value")
 * @param propName [optional] the json data node property name - should only be set for data node properties. Same value as propName but without the $$ prefix
 * @param cf [optional] the constructor or factory associated with the property Object
 */
function ΔGet<T>(o: TraxObject, ΔΔPropName: string, propName: string, factory: Factory<T>, canBeNull: boolean): any {
    // if (o.$computeDependencies) {
    //     o.$computeDependencies[propName] = true;
    // }
    // if (propName && cf && o["$json"]) {
    //     // init object from json structure
    //     let json = o["$json"];
    //     if (json.data) {
    //         let target = o, $$value: any = undefined;
    //         if (o.$next) {
    //             // object is now immutable
    //             if (o[$$propName] !== undefined) {
    //                 // prop has already been set
    //                 return o[$$propName];
    //             }
    //             // as object is immutable and as value has never been set on this object
    //             // we get the value from the last version
    //             target = latestVersion(target);
    //         }
    //         target = target.$mn || target;

    //         if (target[$$propName] === undefined) {
    //             // first time this property is retrieved
    //             let newCount = (--json.count), // a new property is read
    //                 jsonValue = json.data[propName];
    //             if (newCount === 0) {
    //                 // delete $json.data reference as all dn props have been read
    //                 json.data = undefined;
    //                 target["$json"] = undefined;
    //             }
    //             if ((jsonValue === undefined || jsonValue === null) && !createDefault) {
    //                 $$value = null;
    //             } else {
    //                 $$value = create(<any>cf, jsonValue);
    //                 // connect to parent
    //                 connectChildToParent(target, $$value);
    //             }
    //             target[$$propName] = $$value;
    //         }

    //         if ($$value !== undefined) {
    //             if (o.$next) {
    //                 // push new value to all next versions
    //                 let nd = o, c = 0;
    //                 while (o.$next && c < MAX_ITERATION) {
    //                     o[$$propName] = $$value;
    //                     o = o.$next;
    //                     c++;
    //                 }
    //                 if (c === MAX_ITERATION) {
    //                     console.error("Hibe error: Max Iteration reached on dataset get");
    //                 }
    //                 if (o.$mn) {
    //                     o.$mn[$$propName] = $$value;
    //                 }
    //             }
    //             return $$value
    //         }
    //     }
    // }
    let value = o[ΔΔPropName];
    if (value === undefined) {
        value = o[ΔΔPropName] = canBeNull ? null : factory();
        ΔConnectChildToParent(o, value);
    }
    return value;
}

/**
 * Internal property setter function
 * @param obj the DataNode on which to set the property
 * @param $$propName the name or index of the property (should start with "$$" - e.g. "$$value")
 * @param newValue the new property value (will be compared to current value)
 * @param cf [optional] the constructor or factory associated with the property Object
 * @param propHolder the name of the property holding all properties (e.g. for DatList) - optional
 */
export function ΔSet<T>(obj: TraxObject, ΔΔPropName: string | number, newValue: any, factory: Factory<T>, propHolder: any) {
    let isTraxValue = isDataObject(newValue);

    if (newValue && !isTraxValue && factory.ΔCreateProxy) {
        newValue = factory.ΔCreateProxy(newValue) || newValue;
        isTraxValue = isDataObject(newValue);
    }

    let updateVal = false, currentValue = propHolder[ΔΔPropName];
    if (obj.ΔChangeVersion === TRAX_COUNTER) {
        // object has already been changed
        updateVal = true;
    } else {
        if (currentValue !== newValue) {
            touch(obj);
            updateVal = true;
        }
    }
    if (updateVal) {
        if (isTraxValue && newValue === undefined) {
            // undefined is used to determine when the property has never been set (cf. get when a json object is set for lazy load)
            newValue = null;
        }

        if (isTraxValue || (currentValue && isDataObject(currentValue))) {
            updateSubDataRefs(obj, currentValue, newValue as TraxObject);
        }
        propHolder[ΔΔPropName] = newValue;
    }
}

/**
 * Recursively mark a node and its parent as changed (i.e. create a mutable next object on them)
 * @param o the data node to mark as changed
 * @param selfChange true if the call is triggered by a change of a direct property, false otherwise (i.e. when in recursive call)
 */
export function touch(o: TraxObject) {
    // return true if the node was touched, false if it was already touched (i.e. marked as modified in the current update round)
    let firstTimeTouch = true;

    if (o.ΔChangeVersion === TRAX_COUNTER) {
        // node already modified
        firstTimeTouch = false;
    } else {
        o.ΔChangeVersion = TRAX_COUNTER;
    }

    refreshContext.checkObject(o);

    if (firstTimeTouch) {
        // recursively touch on parent nodes
        let md = o.ΔMd;
        if (md && md.parents) {
            FA_forEach(md.parents, function (p) {
                touch(p);
            });
        }
    }
}

/**
 * Update the child references of a data node when a child reference changes
 * (i.e. add/remove dataNode from child parents collection)
 * @param o 
 * @param currentChild 
 * @param newChild 
 */
function updateSubDataRefs(o: TraxObject, currentChild: TraxObject | null, newChild: TraxObject | null) {
    // remove parent ref from old ref
    ΔDisconnectChildFromParent(o, currentChild);
    // add parent ref to new ref
    ΔConnectChildToParent(o, newChild);
}

/**
 * Disconnect a child node from its parent
 * (i.e. remove the parent from the child parents collection)
 * @param parent 
 * @param child 
 */
export function ΔDisconnectChildFromParent(parent: TraxObject, child: TraxObject | null) {
    if (child) {
        // if child is immutable, it last version still holds the reference to the current parent
        let md = child.ΔMd;
        if (md && md.parents) {
            // console.log("FA_removeItem:ΔDisconnectChildFromParent")
            md.parents = FA_removeItem(md.parents, parent);
        }
    }
}

/**
 * Connect a child node to a new parent
 * (i.e. add the parent from the child parents collection)
 * @param parent 
 * @param child 
 */
export function ΔConnectChildToParent(parent: TraxObject, child: TraxObject | null) {
    if (child) {
        let md = initMetaData(child);
        if (md) {
            // console.log("FA_addItem:ΔConnectChildToParent", md.parents)
            md.parents = FA_addItem(md.parents, parent);
        }
    }
}

// -----------------------------------------------------------------------------------------------------------------------------
// Refresh classes

/**
 * Data Node watcher
 */
interface DnWatcher {
    dataNode: TraxObject;
    watchers: FlexArray<(o: TraxObject) => void>;
}

/**
 * Context holding a linked list of nodes that need to be refreshed
 */
class RefreshContext {
    objects: TraxObject[] = [];
    refreshWatchers: FlexArray<() => void> = undefined;
    mtTriggered = false; // true when the refresh micro task has been triggered

    constructor() {
        TRAX_COUNTER++;
    }

    addWatcher(fn: () => void) {
        // console.log("FA_addItem:addWatcher");
        this.refreshWatchers = FA_addItem(this.refreshWatchers, fn);
        this.triggerRefreshTask();
    }

    /**
     * Check if a data object needs to be refreshed (i.e. if it has a watcher)
     * If refresh is needed, its md.refreshContext will be set
     * @param o 
     */
    checkObject(o: TraxObject) {
        let md = o.ΔMd;
        if (md && md.watchers && !md.refreshCtxt) {
            this.objects.push(o);
            md.refreshCtxt = this;
            this.triggerRefreshTask();
        }
    }

    triggerRefreshTask() {
        if (!this.mtTriggered) {
            Promise.resolve().then(() => { this.refresh() });
            this.mtTriggered = true;
        }
    }

    /**
     * Refresh all the data nodes associated to the current context
     * @param syncWatchers flag indicating if watch callbacks should be called synchronously (default: true)
     */
    refresh(syncWatchers = true) {
        let objects = this.objects, len = objects.length;
        if (!len && !this.refreshWatchers) return;

        // create a new refresh context (may be filled while we are executing watcher callbacks on current context)
        refreshContext = new RefreshContext();

        let o: TraxObject,
            md: TraxMetaData,
            instanceWatchers: DnWatcher[] = [];

        for (let i = 0; len > i; i++) {
            o = objects[i]
            md = o.ΔMd!;
            if (md.watchers) {
                // instanceWatchers = watchers callbacks (for all instances)
                instanceWatchers.push({ dataNode: o, watchers: md.watchers });
            }
            md.refreshCtxt = undefined;
        }

        let nbrOfCallbacks = instanceWatchers.length;
        if (nbrOfCallbacks) {
            if (syncWatchers) {
                // notify all instance watchers (generated through calls to watch(...))
                callWatchers(instanceWatchers);
            } else {
                // run watches in a micro task
                Promise.resolve().then(() => {
                    callWatchers(instanceWatchers);
                });
            }
        }
        if (this.refreshWatchers) {
            // notify all temporary watchers (generated through calls to changeComplete())
            FA_forEach(this.refreshWatchers, function (cb) {
                cb();
            });
            this.refreshWatchers = undefined;
        }
    }
}

function callWatchers(watchers: DnWatcher[]) {
    for (let w of watchers) {
        FA_forEach(w.watchers, function (cb) {
            cb(w.dataNode);
        })
    }
}

// list of all nodes that need to be refreshed
let refreshContext: RefreshContext = new RefreshContext();

export function createFactory<T>(cf: Constructor<T> | Factory<T>): Factory<T> {
    if ((cf as Factory<T>).ΔIsFactory) return (cf as Factory<T>);
    if ((cf as Constructor<T>).ΔFactory) return (cf as Constructor<T>).ΔFactory!;
    function factory() {
        // console.log("NEW", cf)
        return new (cf as Constructor<T>)();
    }
    factory[MP_IS_FACTORY] = true;
    (cf as Constructor<T>).ΔFactory = factory as Factory<T>;
    return factory as Factory<T>;
}


// -----------------------------------------------------------------------------------------------------------------------------
// List classes

const ARRAY_MUTATION_METHODS = ["push", "pop", "shift", "unshift", "splice"],
    RX_INT = /^\d+$/,
    RX_TRAX_PROP = /^\Δ/;

class TraxList<T> implements TraxObject {
    ΔTrackable: true = true;
    ΔDataFactory: true = true;
    ΔChangeVersion = 0;
    ΔMd: TraxMetaData | undefined = undefined;
    ΔΔList: any[];            // the actual Array that is behind the Proxy
    ΔΔSelf = this;
    ΔIsProxy = false;
    ΔItemFactory: Factory<T>;
    // $computeDependencies: any;           // object set during the processing of a computed property - undefined otherwise
    // $acceptsJson = true;

    constructor(itemFactory: Factory<T>) {
        this.ΔItemFactory = itemFactory;
    }

    static ΔNewProxy<T>(itemFactory: Factory<T>) {
        return new Proxy([], new TraxList(itemFactory));
    }

    /**
     * Create a proxy around an existing array
     */
    static ΔCreateProxy<T>(arr: any, itemFactory: Factory<T>): TraxObject | null {
        if ($isArray(arr)) {
            let p = new Proxy(arr, new TraxList(itemFactory));
            let idx = arr.length;
            touch(p);
            while (idx--) {
                ΔConnectChildToParent(p, arr[idx]);
            }
            return p;
        }
        return null;
    }

    /**
     * Create a new Item and store it in the list
     * @param index [optional] the index where to store the item - default = list length. If negative, the item will be created but not stored in the list
     */
    $newItem(index?: number): T {
        let itm = (<any>this).ΔItemFactory();
        if (index === undefined) {
            index = this.ΔΔList.length;
        }
        if (index > -1) {
            ΔSet(this.ΔΔSelf, index, itm, this.ΔItemFactory, this.ΔΔList);
        }
        return itm;
    }

    /**
     * Dispose the current TraxList so that all items don't have any backward reference to it
     * The TraxList shall not be used after calling this function
     * @return the array of list items
     */
    $dispose(): any[] {
        let ls = this.ΔΔList, idx = ls.length;
        while (idx--) {
            ΔDisconnectChildFromParent(this.ΔΔSelf, ls[idx]);
        }
        return ls;
    }

    ΔToString() {
        return "Trax List [" + this.ΔΔList.join(", ") + "]";
    }

    /**
     * Proxy handler method called on each property set
     * @param target the list array (cf. listProxy() factory)
     * @param prop the property name
     * @param value the value
     */
    set(target, prop: string, value: any) {
        if (!this.ΔΔList) {
            this.ΔΔList = target;
        }
        if (prop.match(RX_INT)) {
            // prop is an integer
            ΔSet(this.ΔΔSelf, parseInt(prop, 10), value, this.ΔItemFactory, this.ΔΔList);
        } else if (prop.match(RX_TRAX_PROP)) {
            // prop starts with a $
            this[prop] = value;
        }
        return true;
    }

    /**
     * Proxy handler method called on each property get
     * @param target the list array (cf. listProxy() factory)
     * @param prop the property name
     */
    get(target, prop) {
        if (!this.ΔΔList) {
            this.ΔΔList = target;
        }
        if (prop === MP_IS_PROXY) {
            return true;
        }
        let tp = typeof prop;
        if (tp === "string") {
            if (prop.match(RX_TRAX_PROP)) {
                return this[prop];
            } else if (prop.match(RX_INT)) {
                // prop is an integer
                return this.ΔΔList[parseInt(prop, 10)];
            } else if (prop === "length") {
                return this.ΔΔList.length;
            } else if (prop === "push") {
                // optimized implementation of push
                return function push(this: any, ...items: any[]) {
                    const self = this; // this will be the proxy object
                    let sz = items.length, ln = self.ΔΔList.length; // cf. get length
                    for (let i = 0; sz > i; i++) {
                        self.set(target, (ln + i) + "", items[i]);
                    }
                }
            } else if (prop === "toString") {
                return this.ΔToString;
            } else if (typeof target[prop] === "function") {
                // default implementation for any all functions
                // more optimized methods can be implemented on a case by case - cf. push
                return function (this: any) {
                    const self = this; // this will be the proxy object
                    let isMutationFn = ARRAY_MUTATION_METHODS.indexOf(prop) > -1;
                    if (isMutationFn) {
                        touch(self);
                        let items = self.ΔΔList;
                        // detach old children
                        for (let i = 0; items.length > i; i++) {
                            ΔDisconnectChildFromParent(self, items[i]);
                        }
                    }
                    let ls = self.ΔΔList, result = ls[prop].apply(ls, arguments);
                    if (isMutationFn) {
                        let items = self.ΔΔList;
                        // attach new children
                        for (let i = 0; items.length > i; i++) {
                            ΔConnectChildToParent(self, items[i]);
                        }
                    }
                    return result;
                }
            }
        }
        if (prop === Symbol.iterator) {
            return this.ΔΔList[Symbol.iterator];
        }
        return this[prop];
    }
}

export interface ArrayProxy<T> extends Array<T> {
    $newItem(index?: number): T;
    $dispose(): T[];
}

/**
 * Return a new list of cf items that is also a factory to create new lists of cf items
 * @param cf list item Constructor or Factory object
 */
export function list<T>(cf: Constructor<T> | Factory<T>): ArrayProxy<T> {
    return TraxList.ΔNewProxy(createFactory(cf));
}

export let Δls = list;

// Creates a list factory for a specific ItemFactory
function $lf<T>(itemFactory: Factory<T>): Factory<ArrayProxy<T>> {
    function listFactory() { return TraxList.ΔNewProxy(itemFactory) }
    listFactory[MP_IS_FACTORY] = true;
    listFactory[MP_CREATE_PROXY] = function (arr) {
        return TraxList.ΔCreateProxy(arr, itemFactory);
    }
    return listFactory as Factory<ArrayProxy<T>>;
};
export let Δlf = $lf as <T>(itemFactory: Factory<T>) => Factory<ArrayProxy<T>>;
