import { logger, decorator, API, defaultParam, IvElement, required } from '.';
import { Data, watch, unwatch } from '../trax';

export interface Router {
    currentRoute: Route;
    add(routeDict: { [routePattern: string]: NavControllerLoadFunction | NavController | NavControllerFactory | RouteRetriever }): void;
    remove(routePattern: string): boolean;
    navigate(path: string): Promise<void>;
    parseRoute(routePattern: string): RouteDef;
    init(navState: any, win: UrlAccessor, baseUrl: string, parent?: Router): Promise<void>;
    getRoute(url: string): Route | null;
    deferLoad(retriever: () => Promise<RouteLoader>): RouteRetriever;
    matchActive(rd: RouteDef): boolean;
}

export interface NavController {
    load(r?: Route, navState?: any): void | Promise<void>;
    unload?(r: Route, navState: any): void;
    canNavigateFrom?(dest: Route, navState: any): boolean;
    canNavigateTo?(dest: Route, navState: any): boolean;
    dispose?(): void;
}

export interface NavControllerLoadFunction {
    (r?: Route, navState?: any): void | Promise<void>;
}

export interface RouteLoader {
    loadRoutes(r: Router, parentRoute: RouteDef): void; // load routes in the parent router - if true is returned the parent route will be removed
}

interface RouteRetriever {
    retrieveRoute(parentRouteDef?: RouteDef, path?: string): Promise<Route | null>;
}

export interface NavControllerFactory {
    createController(parentRouteDef?: RouteDef, path?: string): NavController | Promise<NavController>;
}

export interface Route {
    path: string;                                     // the route path, as in the url e.g. "/foo/bar/baz"
    pathList: any;                                    // e.g. ["foo","bar","baz"]
    pathParams: null | { [name: string]: string };    // the value of the identifier in the url path
    params: null | { [name: string]: string };        // the params after the ?
    hashParam: null | string;                         // the value after #
    routeId: string;                                  // corresponds to the routeId value of the associated RouteInfo
    pattern: string;                                  // corresponds to the pattern of the associated RouteInfo
}

export interface RouteDef {
    pattern: string;                                            // e.g. "/records/:genreId/:bandId?#"
    containsParams: boolean;                                    // true in "/records/jazz/coltrane?title=spiral#start"
    containsHashParam: boolean;                                 // true "/records/jazz/coltrane?title=spiral#start"
    routeId: string;                                            // unique string to compare routes and get best match (doesn't compare params) - e.g. "/records/ / ?"
    normalizedPath: string[];                                   // e.g. ["records"," "," "] - item can be either a name or a space (for variables) or "*" for anything else
    pathVariables: string[] | null;                             // e.g. [ "", "genreId", "bandId" ]
    isDefault: boolean;                                         // true if last path element is '*'
    controllerFactory?: NavControllerFactory | RouteRetriever;  // navigation controller associated to this route
    controller?: NavController;                                 // current nav controller instance (if running)
}

interface UrlData {
    path: string[];
    containsParams: boolean;
    containsHashParam: boolean;
    hashParam: string;
    params: { [name: string]: string } | null;
}

interface RouteTree {
    [pathElt: string]: RouteTree | RouteDef | undefined;
}

interface UrlAccessor {
    location: { href: string };
    history: {
        pushState(state: any, title: string, url: string): void;
        replaceState(state: any, title: string, url: string): void;
    };
    addEventListener(type: string, listener: (e: any) => void): void;
}

export function newRouter(): Router {
    return new RouterImpl();
}

function error(msg: string, route?: RouteDef) {
    throw "[IVY ROUTER] " + msg;
}

function warn(msg: string, route?: RouteDef) {
    logger.log("[IVY ROUTER] " + msg);
}

const U = undefined,
    DATASET = "dataset",
    DATASET_ROUTER_LINK_URL = "routerLinkUrl",
    RX_PATH_VAR = /^\:([a-zA-Z_\$]\w*)$/i,    // e.g. :index in /records/:index
    RX_PATH_ELT = /^([^\/\*\+\s]+)$/i,        // e.g.foo in /foo/bar
    RX_HASH_START = /^([^\#]*)\#?/,             // e.g. /# or # or /foo/bar/#
    RX_PARAM_SEPARATOR = /\;|\&/,             // i.e. ; or &
    RX_PARAM_KV = /^([^\=]*)\=(.*)$/i,        // e.g. foo=123
    RX_URL_ARGS = /(\?|\#).+$/gi,             // e.g. #foo or ?a=b#bar
    RX_HREF_START = /^[^\/]*\/\/[^\/]*/;      // e.g. https://foo.bar.org:8080

// temporary solution to retrieve the root router
// should be retrieved through @context di when available
let rootRouter: Router | undefined = undefined;

@Data class RouteData implements Route {
    path = "";
    pathList: string[] = [];
    pathParams: any;
    params: any;
    hashParam: string | null = null;
    routeId = "";
    pattern = "";
}

class RouterImpl implements Router {
    parent: Router | null = null;
    routeDefs: { [pattern: string]: RouteDef | undefined } = {};
    routeTree: RouteTree = {};
    initialized = false;
    navState: any;
    pageUrl = "";
    baseUrl = "";
    _win: UrlAccessor | undefined;
    _currentRoute: Route;

    constructor() {
        this._currentRoute = new RouteData();
    }

    get currentRoute(): Route {
        return this._currentRoute;
    }

    add(routeDict: { [routePattern: string]: NavControllerLoadFunction | NavController | NavControllerFactory | RouteRetriever }) {
        for (let k in routeDict) {
            if (routeDict.hasOwnProperty(k)) {
                this.addRoute(this.parseRoute(k), routeDict[k]);
            }
        }
    }

    remove(routePattern: string): boolean {
        let ri = this.parseRoute(routePattern);
        const r = this.routeDefs[ri.routeId] as RouteDef;
        if (r === U) return false; // route was never added
        let p = ri.normalizedPath, stack: RouteTree[] = [this.routeTree], t = this.routeTree;
        for (let i = 0; p.length > i; i++) {
            if (i < p.length - 1) {
                t = t[p[i]] as RouteTree;
                stack.push(t);
            } else {
                // last elt
                t[p[i]] = undefined;
            }
        }
        if (stack.length > 1) {
            for (let i = stack.length - 1; i > 0; i--) {
                t = stack[i]!;
                if (isEmpty(t)) {
                    stack[i - 1][p[i - 1]] = U;
                } else {
                    break;
                }
            }
        }
        this.routeDefs[ri.routeId] = U;
        if (r.controller !== U && r.controller !== null && r.controller.dispose) {
            r.controller.dispose();
            r.controller = U;
        }
        return true;

        function isEmpty(t: RouteTree): boolean {
            for (let k in t) {
                if (t.hasOwnProperty(k) && t[k] !== U) return false;
            }
            return true;
        }
    }

    addRoute(ri: RouteDef, cf: NavControllerLoadFunction | NavController | NavControllerFactory | RouteRetriever) {
        if (this.routeDefs[ri.routeId] !== U) {
            error("Route cannot be defined twice: '" + ri.pattern + "'", this.routeDefs[ri.routeId]);
        }
        // register in route dictionary
        this.routeDefs[ri.routeId] = ri;
        // register in route tree
        let p = ri.normalizedPath, t = this.routeTree, pe: string, len = p.length;
        for (let i = 0; len > i; i++) {
            pe = p[i]; // path elt
            if (t[pe] === U) {
                if (i === len - 1) {
                    t[pe] = ri;
                } else {
                    t = t[pe] = {}; // new tree
                }
            } else {
                if (t[pe]!.pattern !== U) {
                    // this route is already defined
                    error("Route cannot be defined twice: '" + ri.pattern + "'", t[pe] as RouteDef);
                } else {
                    t = t[pe] as RouteTree;
                }
            }
        }

        if (typeof cf === "function") {
            ri.controller = {
                load: cf
            }
        } else {
            if (cf["load"] !== U) {
                ri.controller = cf as NavController;
            } else {
                ri.controllerFactory = cf as NavControllerFactory | RouteRetriever;
            }
        }
    }

    parseRoute(pattern: string): RouteDef {
        const normalizedPath: string[] = [], pathVariables: string[] = [];
        let routeId = "", hasPathVariable = false, acceptsParams = false, acceptsHashParam = false, varDict: { [name: string]: 1 } = {}, isDefault = false;

        const p = pattern.split("/"), len = p.length;
        if (len === 0 || p[0] !== "") {
            err("Invalid syntax: route pattern must start with '/'");
        } else {
            let pathElt: string, lastElt = p[len - 1], idx = 0;
            idx = lastElt.indexOf("?");
            if (idx > -1) {
                p[len - 1] = lastElt.slice(0, idx);
                acceptsParams = true;
                lastElt = lastElt.slice(idx + 1);
                if (lastElt === "#") {
                    acceptsHashParam = true;
                } else if (lastElt !== "") {
                    err("Invalid syntax: route cannot end with '?" + lastElt + "'");
                }
            } else {
                idx = lastElt.indexOf("#");
                if (idx > -1) {
                    p[len - 1] = lastElt.slice(0, idx);
                    acceptsHashParam = true;
                    lastElt = lastElt.slice(idx + 1);
                    if (lastElt !== "") {
                        err("Invalid syntax: route cannot end with '#" + lastElt + "'");
                    }
                }
            }

            let nm = "";
            for (let i = 1; len > i; i++) {
                pathElt = p[i];
                if (pathElt.match(RX_PATH_VAR)) {
                    // path element is a variable - e.g. ":varName"
                    hasPathVariable = true;
                    nm = RegExp.$1;
                    if (varDict[nm] === 1) {
                        err("Duplicate variable name: '" + nm + "'");
                    }
                    varDict[nm] = 1;
                    pathVariables[i - 1] = nm;
                    normalizedPath[i - 1] = " ";
                } else if (pathElt.match(RX_PATH_ELT)) {
                    pathVariables[i - 1] = "";
                    normalizedPath[i - 1] = pathElt;
                } else if (pathElt === "*" || pathElt === "+") {
                    isDefault = true;
                    normalizedPath[i - 1] = pathElt;
                    hasPathVariable = true;
                    pathVariables[i - 1] = pathElt;
                    if (i !== len - 1) {
                        err("Invalid route: '" + pathElt + "' can only be used on last path element");
                    }
                } else if (i !== len - 1 || pathElt !== "") {
                    err("Invalid path element: '" + pathElt + "'");
                }
            }
            routeId = "/" + normalizedPath.join("/") + (acceptsParams ? "?" : "") + (acceptsHashParam ? "#" : "");
        }

        return {
            pattern: pattern,
            containsParams: acceptsParams,
            containsHashParam: acceptsHashParam,
            routeId: routeId,
            normalizedPath: normalizedPath,
            pathVariables: hasPathVariable ? pathVariables : null,
            isDefault: isDefault
        }

        function err(msg: string) {
            error(msg + "\nRoute: '" + pattern + "'");
        }
    }

    async init(navState: any, win: UrlAccessor, baseUrl: string, parent?: Router) {
        // read and split url according to baseUrl
        if (this.initialized) return;
        this.initialized = true;
        this.navState = navState;
        this.baseUrl = baseUrl;
        this._win = win;
        if (parent !== U) {
            this.parent = parent;
        } else {
            rootRouter = this; // change when @context is available
        }

        // get route url
        let url = win.location.href.replace(RX_HREF_START, "");
        if (win.location.href.match(RX_HASH_START)) {
            this.pageUrl = RegExp.$1;
        }
        if (baseUrl === "#") {
            if (url.indexOf("#") > -1) {
                url = url.replace(RX_HASH_START, "");
            } else {
                url = "";
            }
            checkUrlStart();
        } else {
            let bl = baseUrl.length;
            if (url.slice(0, bl) !== baseUrl) {
                error(`Url doesn't match baseUrl\nbaseUrl: ${baseUrl}\nUrl: ${url}`);
            } else {
                url = url.slice(bl);
                checkUrlStart();
            }
        }
        let r = this.navigate(url, 2);

        if (this.parent === null) {
            this._win.addEventListener("popstate", (e: any) => {
                if (e.state && e.state.url !== U) {
                    this.navigate(e.state.url, 0);
                }
            });
            this._win.addEventListener("click", (e: any) => {
                handleLinkClick(e.target, this);
            });

        }

        return await r;

        function checkUrlStart() {
            if (url.charAt(0) !== "/") {
                url = "/" + url;
            }
        }
    }

    async navigate(path: string, pushState: 0 | 1 | 2 = 1, scrollUp = true) {
        // pushState 0=no push 1=push 2=replace
        if (!this._win) error("Router not initialized: navigation is not possible");
        if (path.indexOf("#") === 0) {
            // authorize paths starting with a #
            path = path.substr(1);
        }
        // path: the part of the url after the baseUrl
        let r = this.getRoute(path), crc: NavController | undefined;
        if (r === null) return;

        // check if navigation is authorized
        if (this._currentRoute.routeId !== "") {
            crc = this.routeDefs[this._currentRoute.routeId]!.controller!;
            if (crc.canNavigateFrom !== U && !crc.canNavigateFrom(r, this.navState)) return;
        }

        let rDef: RouteDef | null = this.routeDefs[r.routeId]!;
        while (rDef !== null && rDef.controller === U) {
            let res: NavController | Route | null;
            // retrieve NavController (if sync load) or Route | null (if async load)
            if ((rDef.controllerFactory! as NavControllerFactory).createController !== U) {
                res = await (rDef.controllerFactory! as NavControllerFactory).createController(rDef, path);
            } else {
                res = await (rDef.controllerFactory! as RouteRetriever).retrieveRoute(rDef, path);
            }
            if (res !== null && typeof res["load"] === "function") {
                // res is a NavController
                rDef.controller = res as NavController;
            } else {
                if (res === null) {
                    rDef === null; // route not found
                }
                r = res as Route;
                rDef = this.routeDefs[r.routeId]!;
            }
        }
        if (!rDef) return;
        const newRouteCtrl = rDef.controller!;

        if (newRouteCtrl.canNavigateTo !== U && !newRouteCtrl.canNavigateTo(r, this.navState)) return;
        // unload previous view and load new one in parallel
        if (crc !== U && crc.unload !== U) {
            crc.unload(r, this.navState);
        }

        const cr = this._currentRoute;
        cr.hashParam = r.hashParam;
        cr.params = r.params;
        cr.path = r.path;
        cr.pathList = r.pathList;
        cr.pathParams = r.pathParams;
        cr.pattern = r.pattern;
        cr.routeId = r.routeId;
        await newRouteCtrl.load(r, this.navState);

        if (pushState !== 0) {
            let url = this.baseUrl === "#" ? "#" + r.path : r.path;

            if (pushState === 1) {
                // console.log("history.pushState", r.path)
                this._win!.history.pushState({ url: r.path }, "", url);
            } else {
                // console.log("history.replaceState", r.path)
                this._win!.history.replaceState({ url: r.path }, "", url);
            }
        }
        if (scrollUp) {
            let doc = this._win!["document"] as any;
            if (doc) {
                doc.body.scrollIntoView();
            }
        }
    }

    getRoute(path: string): Route | null {
        // path: the part of the url after the baseUrl
        const urlInfo = splitPath(path, err), p = urlInfo.path, len = p.length, pathParams: (string | number)[] = [];
        let t = this.routeTree, v: any, defaultSymbol = "*", stack: any[] = [t];
        for (let i = 0; len > i; i++) {
            v = t[p[i]];
            if (v === U) {
                // not found: check for route with variable if path is not empty
                if (p[i] !== "") {
                    v = t[" "];
                    if (v !== U) {
                        pathParams.push(i);
                        pathParams.push(p[i]);
                    }
                }
                if (v === U) {
                    // check for default route
                    if (checkDefaultRoute(t["*"], t["+"], p[i])) {
                        return buildRoute(true, i, 1); // found
                    }
                }
            }
            if (v === U) {
                return buildDefaultRoute();
            }
            if (i === len - 1) {
                if (v.normalizedPath !== U) {
                    return buildRoute(false, i, 2); // found
                } else {
                    // v is a RouteTree: check for a default handler otherwise no match
                    if (checkDefaultRoute(v["*"], v["+"], "")) {
                        return buildRoute(true, i + 1, 3); // found
                    }
                    let r = buildDefaultRoute();
                    if (r !== null) {
                        return r;
                    }
                    err("Incomplete URL");
                }
            } else {
                if (v.normalizedPath === U) {
                    // v is a RouteTree: expected case
                    t = v as RouteTree;
                    stack.push(t);
                } else {
                    // v is a route but we are not ot the end of the path
                    err("Unsupported URL");
                }
            }
        }

        return null;

        function findParentDefault() {
            let j = stack.length - 1;
            while (j > -1) {
                let t = stack[j];
                if (t["*"]) {
                    return j;
                } else {
                    j--;
                }
            }
            return -1;
        }

        function buildDefaultRoute() {
            let idx = findParentDefault();
            if (idx > -1) {
                v = stack[idx]["*"];
                return buildRoute(true, idx, 4);
            }
            return null;
        }

        function buildRoute(isDefault: boolean, idx: number, src: number): Route {
            const ri = v as RouteDef;
            let pp: any = null, pathString = "/" + p.join("/");
            if (pathParams.length > 0 && ri.pathVariables !== null) {
                pp = {};
                for (let i = 0; pathParams.length > i; i += 2) {
                    let idx = pathParams[i];
                    if (ri.pathVariables[idx] !== U) {
                        pp[ri.pathVariables[idx]] = pathParams[i + 1];
                    }
                }
            }
            if (isDefault) {
                if (pp === null) pp = {};
                let p2 = p.slice(idx);
                pp[defaultSymbol] = p2.join("/").replace(RX_URL_ARGS, "");
            }
            if (pp !== null || urlInfo.containsHashParam) {
                p[p.length - 1] = p[p.length - 1].replace(RX_URL_ARGS, "");
            }
            return {
                path: pathString,
                pathList: p,
                pathParams: pp,
                params: urlInfo.params,
                hashParam: urlInfo.containsHashParam ? urlInfo.hashParam : null,
                routeId: ri.routeId,
                pattern: ri.pattern
            }
        }

        function checkDefaultRoute(starValue: any, plusValue: any, pathElt: string) {
            if (pathElt === "") {
                v = starValue;
            } else {
                v = plusValue || starValue;
                defaultSymbol = plusValue ? "+" : "*";
            }
            if (v !== U && v.normalizedPath !== U) {
                return true;
            }

            return false;
        }

        function err(msg: string) {
            error(msg + "\nURL: '" + path + "'");
        }
    }

    deferLoad(retriever: () => Promise<RouteLoader>) {
        return {
            retrieveRoute: async (parentRouteDef: RouteDef, path: string) => {
                let mod = await retriever();
                // remove parentRouteDef to avoid potential infinite loops
                this.remove(parentRouteDef.pattern);
                // load new routes
                mod.loadRoutes(this, parentRouteDef);
                // getRoute again
                return this.getRoute(path);
            }
        }
    }

    matchActive(rd: RouteDef): boolean {
        if (this.currentRoute === null) return false;

        const np = rd.normalizedPath, len = np.length, pl = this.currentRoute.pathList, len2 = pl.length;
        for (let i = 0; len > i; i++) {
            if (i < len2) {
                if (np[i] !== pl[i]) {
                    if (pl[i] === "") {
                        if (np[i] === "*") continue;
                    } else {
                        if (np[i] === " " || np[i] === "*" || np[i] === "+") continue;
                    }
                    return false;
                }
            } else {
                return (np[i] === "*");
            }
        }

        return true;
    }
}

/**
 * Scan a url to get a normalized structure
 * @param url the url without the domain and protocol information (e.g. "/" or "/foo/bar?x=123#blah")
 */
function splitPath(url: string, err: (msg: string) => void): UrlData {
    let containsParams = false, containsHashParam = false, hashParam: string = "", p = "";

    const path = url.split("/"), len = path.length, params: { [name: string]: string } = {};
    if (len === 0 || path[0] !== "") {
        err("Invalid syntax: url must start with '/'");
    } else {
        let lastElt = path[len - 1], idx = 0;
        idx = lastElt.indexOf("?");
        if (idx > -1) {
            path[len - 1] = lastElt.slice(0, idx);
            containsParams = true;
            p = lastElt.slice(idx + 1); // e.g. "foo=123;bar=234#blah"
        } else {
            p = lastElt; // e.g. "foo#blah"
        }
        if (p !== "") {
            idx = p.indexOf("#");
            if (idx > -1) {
                containsHashParam = true;
                hashParam = p.slice(idx + 1);
                p = p.slice(0, idx);
            }
        }
        if (containsParams) {
            // parse params
            let ps = p.split(RX_PARAM_SEPARATOR);
            for (let chunk of ps) {
                if (chunk.match(RX_PARAM_KV)) {
                    params[RegExp.$1] = RegExp.$2;
                } else {
                    warn("Invalid parameter: " + chunk);
                }
            }
        }
    }
    if (path.length > 1) {
        // remove the first empty path element (unless path is actually empty, in which case we keep it)
        path.splice(0, 1);
    }

    return {
        path: path,
        containsParams: containsParams,
        containsHashParam: containsHashParam,
        hashParam: hashParam,
        params: containsParams ? params : null
    }
}

@API export class Link {
    @defaultParam url: string = "";
    @required $targetElt: IvElement;
}

function linkDecorator(active = false) {
    return decorator(Link, ($api: Link) => {
        let url: string | undefined, wf: any = undefined;

        const d = {
            $render() {
                if ($api.url !== url) {
                    $api.$targetElt[DATASET][DATASET_ROUTER_LINK_URL] = url = $api.url;
                }
                if (active && rootRouter !== U) {
                    let cl = $api.$targetElt["classList"];
                    if (isChildURL(url, rootRouter.currentRoute.path)) {
                        // console.log("@activeLink: match", url)
                        cl.add("active");
                    } else {
                        // console.log("@activeLink: no match", url, rootRouter.currentRoute)
                        cl.remove("active");
                    }
                    if (wf === U) {
                        wf = watch(rootRouter.currentRoute, () => {
                            // console.log("@activeLink watch", url)
                            d.$render();
                        });
                    }
                }
            },
            $dispose() {
                if (wf !== U) {
                    unwatch(d, wf);
                }
            }
        }
        return d;
    });
}

function isChildURL(child: string, parent: string): boolean {
    if (child === parent) return true;
    if (child.length < parent.length && parent.slice(0, child.length) === child) return true;
    return false;
}

export const link = linkDecorator();
export const activeLink = linkDecorator(true);

function handleLinkClick(elt: any, router: RouterImpl) {
    let path = findRouterUrl(elt, DATASET_ROUTER_LINK_URL, router.pageUrl);
    if (path !== null) {
        // console.log("link navigation: ", path);
        router.navigate(path);
    }
}

function findRouterUrl(elt: any, datasetName: string, pageUrl: string): string | null {
    if (elt === U || elt === null || elt.tagName === "HTML") return null;
    if (elt[DATASET] !== U && elt[DATASET][datasetName] !== U) {
        return elt[DATASET][DATASET_ROUTER_LINK_URL];
    } else if (elt.tagName === "A" && pageUrl !== "") {
        const href: string = elt.href;
        if (href.substr(0, pageUrl.length) === pageUrl) {
            return href.substr(pageUrl.length);
        }
    }
    return findRouterUrl(elt.parentElement, datasetName, pageUrl);
}

@API export class ActiveRoute {
    @defaultParam pattern: string = "";
    @required $targetElt: IvElement;
}
export const activeRoute = decorator(ActiveRoute, ($api: ActiveRoute) => {
    let pattern: string | undefined;
    return {
        $render() {
            if ($api.pattern !== pattern) {
                //$api.$targetElt[DATASET][DATASET_ROUTER_LINK_URL] = pattern = $api.url;
            }
        }
    }
});