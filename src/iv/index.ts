
interface XjsContext {
    exprs: any[];      // expression list
    nodes: any[];      // node list
}

export function template(template: string) { };

export let iv = {
    template: template
}

/**
 * Template factory
 * @param refreshFn 
 */
export function ζt(refreshFn: (ζ, ζa?: any) => void, hasHost?: number, argumentClass?) {

}

/**
 * Class decorator for the parameter class
 */
export function ζd(c: any) {

}

/**
 * Class property decorator for the parameter class
 */
export function ζv(proto, key: string) {

}

/**
 * Unchanged symbol
 * Used as a return value for expressions (cf. ζe) to notify that a value hasn't changed
 */
export const ζu = []; // must be an array to be used for undefined statics

// TODO: start idx at 1 to keep 0 for special cases:
// TODO: detached could be done with 0 parentIdx
// TODO: delayed: if instIdx 0, not delayed

/**
 * Fragment creation
 * @param c the xjs context
 * @param idx the index in c.nodes 
 * @param parentIdx the parent index in c.nodes
 */
export function ζfrag(c: XjsContext, idx: number, parentIdx: number, instIdx: number, isPlaceholder: number = 0) {

}

/**
 * Tells if a node needs to be created or deleted
 * @param c 
 * @param idx 
 */
export function ζcheck(c: XjsContext, idx: number, pos: number, keyExpr?: any): number {
    return 1;
}

/**
 * Second check to delete element if not previously checked (cf. if {...} block)
 */
export function ζclean(c: XjsContext, idx: number, instIdx: number): number {
    return 1;
}

/**
 * End of creation mode
 * @param c 
 * @param idx 
 */
export function ζend(c: XjsContext, idx: number) {

}

/**
 * Element node creation
 */
export function ζelt(c: XjsContext, idx: number, parentIdx: number, instIdx: number, name: string, staticAttributes?: any[], staticProperties?: any[]) {
    return { cm: 1 } as any;
}

/**
 * Text node creation
 */
export function ζtxt(c: XjsContext, idx: number, parentIdx: number, instIdx: number, staticValue?: string) {

}

/**
 * Expression diffing
 */
export function ζe(c: XjsContext, idx: number, blockIdx: number, value: any) {

}

/**
 * Dynamic attribute update
 */
export function ζatt(c: XjsContext, eltIdx: number, instIdx: number, name: string, value: any) {

}

/**
 * Dynamic property update
 */
export function ζprop(c: XjsContext, eltIdx: number, instIdx: number, name: string, value: any) {

}

/**
 * Dynamic param update
 */
export function ζparam(c: XjsContext, nodeIdx: number, instIdx: number, name: string, value: any) {

}

/**
 * Dynamic text values update
 */
export function ζtxtval(c: XjsContext, textIdx: number, instIdx: number, statics: string[], nbrOfValues: number, ...values: any[]) {

}

/**
 * Set index/key for container fragments used in js blocks
 */
export function ζkey(c: XjsContext, fragmentIdx: number, colIndex: number, key?: any) {

}

/**
 * Dynamic component creation / update
 */
export function ζcpt(c: XjsContext, fragIdx: number, instIdx: number, refExpr, contentIdx?: number, hasParamNodes?: number, staticParams?: any[]) {
    // contentIdx = 0 if no content
}

/**
 * Call a component or a decorator once all params & content are set
 */
export function ζcall(c: XjsContext, idx: number, instIdx: number) {

}

/**
 * Param node
 */
export function ζpnode(c: XjsContext, idx: number, parentIdx: number, instIdx: number, refExpr, staticParams?: any[]) {

}

/**
 * Dynamic decorator creation / update
 */
export function ζdeco(c: XjsContext, idx: number, parentIdx: number, instIdx: number, refExpr, contentIdx?: number, hasParamNodes?: number, staticParams?: any[]) {

}

/**
 * Asynchronous block definition
 */
export function ζasync(c: XjsContext, priority: number, fn: () => any) {

}

/**
 * Define and event listener node
 * e.g. ζlsnr(ζ, 2, 1, "click");
 */
export function ζhandler(c: XjsContext, idx: number, parentIdx: number, instIdx: number, eventName: string) {

}

/**
 * Update an event handler function
 * e.g. ζevt(ζ, 2, 0, function (e) { doSomething(e.name); });
 */
export function ζlistener(c: XjsContext, idx: number, instIdx: number, handler: Function) {

}
