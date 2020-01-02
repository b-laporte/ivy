import { NavController, Route, RouteDef, NavControllerFactory } from './../../iv/router';
import * as assert from 'assert';
import { Router, newRouter } from '../../iv/router';

describe('Router', () => {
    let router: Router;

    interface TestNavState {
        logs: string[];
    }

    beforeEach(() => {
        lastParentRoute = "";
        ctrlCount = 0;
        navState.logs = [];
        authorizeFromB = true;
        authorizeToB = true;
        router = newRouter();
    });

    let ctrlCount = 0;
    const ctrlAFactory: NavControllerFactory = {
        createController(): NavController {
            let current = "", id = ctrlCount++;
            return {
                async load(dest: Route, navState: any) {
                    (navState as TestNavState).logs.push(`[navCtrlA ${id}] load: ${dest.path}(${dest.pattern})${current}`);
                    current = "<-" + dest.path;
                },
                canNavigateTo(dest: Route, navState: any) {
                    (navState as TestNavState).logs.push(`[navCtrlA ${id}] canNavigateTo: ${dest.path}(${dest.pattern})${current}`);
                    return true;
                }
            }
        }
    }

    let authorizeFromB = true, authorizeToB = true;

    const ctrlBFactory: NavControllerFactory = {
        createController(): NavController {
            let current = "", id = ctrlCount++;
            return {
                async load(dest: Route, navState: any) {
                    (navState as TestNavState).logs.push(`[navCtrlB ${id}] load: ${dest.path}(${dest.pattern})${current}`);
                    current = "<-" + dest.path;
                },
                unload(dest: Route, navState: any) {
                    (navState as TestNavState).logs.push(`[navCtrlB ${id}] unload: ${dest.path}(${dest.pattern})${current}`);
                    current = "";
                },
                canNavigateTo(dest: Route, navState: any) {
                    (navState as TestNavState).logs.push(`[navCtrlB ${id}] canNavigateTo: ${dest.path}(${dest.pattern})${current}`);
                    return authorizeToB;
                },
                canNavigateFrom(dest: Route, navState: any) {
                    (navState as TestNavState).logs.push(`[navCtrlB ${id}] canNavigateFrom: ${dest.path}(${dest.pattern})${current}`);
                    return authorizeFromB;
                }
            }
        }
    }

    const ctrlC: NavController = {
        async load(dest: Route, navState: any) {
            (navState as TestNavState).logs.push(`[navCtrlC] load: ${dest.path}(${dest.pattern})`);
        }
    }

    let lastParentRoute = "";
    async function getRouteLoader() {
        return {
            loadRoutes(r: Router, parentRoute: RouteDef) {
                lastParentRoute = parentRoute.pattern;
                if (router["routeDefs"][parentRoute.routeId]) {
                    throw "parentRoute must be unloaded before calling loadRoutes";
                }
                r.add({
                    "/:x/bar?#": ctrlBFactory,
                    "/:x/a/b": ctrlC
                });
            }
        }
    }

    const navState: TestNavState = {
        logs: []
    };

    const ri1 = {
        pattern: "/a/b/c",
        isDefault: false,
        containsHashParam: false,
        containsParams: false,
        normalizedPath: ["a", "b", "c"],
        routeId: "/a/b/c",
        pathVariables: null,
        controllerFactory: ctrlAFactory
    }, ri2 = {
        pattern: "/:x/*",
        isDefault: true,
        containsHashParam: false,
        containsParams: false,
        normalizedPath: [" ", "*"],
        routeId: "/ /*",
        pathVariables: ["x", "*"],
        controllerFactory: ctrlAFactory
    }, ri3 = {
        pattern: "/a/:b",
        isDefault: false,
        containsHashParam: false,
        containsParams: false,
        normalizedPath: ["a", " "],
        routeId: "/a/ ",
        pathVariables: ["", "b"],
        controllerFactory: ctrlAFactory
    }, ri4 = {
        pattern: "/*",
        isDefault: false,
        containsHashParam: false,
        containsParams: false,
        normalizedPath: ["*"],
        routeId: "/*",
        pathVariables: ["*"],
        controllerFactory: ctrlAFactory
    };

    function getUrlAccessor(href: string) {
        return {
            addEventListener(type: string, cb: (e: any) => void) {
                //console.log("addEventListener");
            },
            location: {
                href: href
            },
            history: {
                _state: [],
                pushState(state: any, title: string, url: string) {
                    let st = this._state as any[];
                    st.push(state);
                    st.push("title");
                    st.push(url);
                },
                replaceState(state: any, title: string, url: string) {
                    let st = this._state as any[];
                    if (st.length > 2) {
                        st[st.length - 3] = state;
                        st[st.length - 2] = title;
                        st[st.length - 1] = url;
                    }
                }
            }
        }
    }

    function assertContent(o: Object, c: Object, msg) {
        for (let p in c) {
            if (c.hasOwnProperty(p)) {
                assert.deepEqual(o["p"], c["p"], msg + "/" + p);
            }
        }
    }

    it("should parse routes", function () {
        assert.deepEqual(router.parseRoute("/a/bbb/c"), {
            pattern: "/a/bbb/c",
            isDefault: false,
            containsHashParam: false,
            containsParams: false,
            normalizedPath: ["a", "bbb", "c"],
            routeId: "/a/bbb/c",
            pathVariables: null
        }, "1");

        assert.deepEqual(router.parseRoute("/"), {
            pattern: "/",
            isDefault: false,
            containsHashParam: false,
            containsParams: false,
            normalizedPath: [],
            routeId: "/",
            pathVariables: null
        }, "2");

        assert.deepEqual(router.parseRoute("/:foo/blah/:bar?"), {
            pattern: "/:foo/blah/:bar?",
            isDefault: false,
            containsHashParam: false,
            containsParams: true,
            normalizedPath: [" ", "blah", " "],
            routeId: "/ /blah/ ?",
            pathVariables: ["foo", "", "bar"]
        }, "3");

        assert.deepEqual(router.parseRoute("/hello/:bar?#"), {
            pattern: "/hello/:bar?#",
            isDefault: false,
            containsHashParam: true,
            containsParams: true,
            normalizedPath: ["hello", " "],
            routeId: "/hello/ ?#",
            pathVariables: ["", "bar"]
        }, "4");

        assert.deepEqual(router.parseRoute("/:v1/xyz#"), {
            pattern: "/:v1/xyz#",
            isDefault: false,
            containsHashParam: true,
            containsParams: false,
            normalizedPath: [" ", "xyz"],
            routeId: "/ /xyz#",
            pathVariables: ["v1", ""]
        }, "5");

        assert.deepEqual(router.parseRoute("/*"), {
            pattern: "/*",
            isDefault: true,
            containsHashParam: false,
            containsParams: false,
            normalizedPath: ["*"],
            routeId: "/*",
            pathVariables: ["*"]
        }, "6");

        assert.deepEqual(router.parseRoute("/records/*?#"), {
            pattern: "/records/*?#",
            isDefault: true,
            containsHashParam: true,
            containsParams: true,
            normalizedPath: ["records", "*"],
            routeId: "/records/*?#",
            pathVariables: ["", "*"]
        }, "7");

        assert.deepEqual(router.parseRoute("/a/:var/b"), {
            pattern: "/a/:var/b",
            isDefault: false,
            containsHashParam: false,
            containsParams: false,
            normalizedPath: ["a", " ", "b"],
            routeId: "/a/ /b",
            pathVariables: ["", "var", ""]
        }, "8");
    });

    it("should support adding and removing routes dynamically", function () {
        router.add({
            "/a/b/c": ctrlAFactory,
            "/:x/*": ctrlAFactory
        });

        assert.deepEqual(router["routeTree"], {
            "a": {
                "b": {
                    "c": ri1
                }
            },
            " ": {
                "*": ri2
            }
        }, "1");

        router.add({
            "/a/:b": ctrlAFactory
        });

        assert.deepEqual(router["routeTree"], {
            "a": {
                "b": {
                    "c": ri1
                },
                " ": ri3
            },
            " ": {
                "*": ri2
            }
        }, "2");

        let res = router.remove("/a/b/c");
        assert.equal(res, true, "3.1");
        assert.deepEqual(router["routeTree"], {
            "a": {
                "b": undefined,
                " ": ri3
            },
            " ": {
                "*": ri2
            }
        }, "3.2");

        res = router.remove("/:x/*");
        assert.equal(res, true, "4.1");
        assert.deepEqual(router["routeTree"], {
            "a": {
                "b": undefined,
                " ": ri3
            },
            " ": undefined
        }, "4.2");

        res = router.remove("/a/:b");
        assert.equal(res, true, "5.1");
        assert.deepEqual(router["routeTree"], {
            "a": undefined,
            " ": undefined
        }, "5.2");

    });

    it("should be able to find routes for a given url", async function () {
        router.add({
            "/a/b/c": ctrlAFactory,
            "/:x/+": ctrlAFactory,
            "/a/:b": ctrlAFactory,
            "/*": ctrlAFactory
        });

        let r = await (router as any).getRoute("/a/b/c");
        assert.notEqual(r, null, "1.1");
        assert.deepEqual(r.routeId, "/a/b/c", "1.2");

        r = await (router as any).getRoute("/foo");
        assert.notEqual(r, null, "2.1");
        assert.deepEqual(r.routeId, "/*", "2.2");

        r = await (router as any).getRoute("/foo/bar/baz#123");
        assert.notEqual(r, null, "3.1");
        assert.deepEqual(r.routeId, "/ /+", "3.2");

        r = await (router as any).getRoute("/a/bar");
        assert.notEqual(r, null, "4.1");
        assert.deepEqual(r.routeId, "/a/ ", "4.2");
        assert.deepEqual(r.pathParams, { b: 'bar' }, "4.3");

        r = await (router as any).getRoute("/foo/x");
        assert.notEqual(r, null, "5.1");
        assert.deepEqual(r.routeId, "/ /+", "5.2");

        r = await (router as any).getRoute("/42/2");
        assert.notEqual(r, null, "6.1");
        assert.deepEqual(r.routeId, "/ /+", "6.2");
        assert.deepEqual(r.pathParams, { x: '42', '+': '2' }, "6.3");
    });

    it("should perform simple navigation and check guards (hash route - default)", async function () {
        router.add({
            "/*": ctrlAFactory,
            "/:x/+": ctrlBFactory
        });

        assert.equal(router.currentRoute.routeId, "", "0");
        const w = getUrlAccessor("https://foo.bar.com:8080");
        await router.init(navState, w, "#"); // baseURL = "#" for hash urls

        assert.deepEqual(navState.logs, [
            "[navCtrlA 0] canNavigateTo: /(/*)",
            "[navCtrlA 0] load: /(/*)"
        ], "1.1");
        assertContent(router.currentRoute, {
            path: "/",
            pathList: [""],
            hashParam: null,
            params: null,
            pathParams: { "*": "" },
            pattern: "/*",
            routeId: "/*"
        }, "1.2");
        assert.equal(w.history["_state"].length, 0, "1.3");

        navState.logs = [];
        await router.navigate("/foo/bar");
        assert.deepEqual(navState.logs, [
            "[navCtrlB 1] canNavigateTo: /foo/bar(/:x/+)",
            "[navCtrlB 1] load: /foo/bar(/:x/+)"
        ], "2.1");
        assertContent(router.currentRoute, {
            path: "/foo/bar",
            pathList: ["foo", "bar"],
            hashParam: null,
            params: null,
            pathParams: { x: "foo", "+": "bar" },
            pattern: "/:x/+",
            routeId: "/ /+"
        }, "2.2");
        assert.equal(w.history["_state"].length, 3, "2.3");
        assert.equal(w.history["_state"][2], "#/foo/bar", "2.4");

        navState.logs = [];
        await router.navigate("/aa/bb/cc#foo");
        assert.deepEqual(navState.logs, [
            "[navCtrlB 1] canNavigateFrom: /aa/bb/cc#foo(/:x/+)<-/foo/bar",
            "[navCtrlB 1] canNavigateTo: /aa/bb/cc#foo(/:x/+)<-/foo/bar",
            "[navCtrlB 1] unload: /aa/bb/cc#foo(/:x/+)<-/foo/bar",
            "[navCtrlB 1] load: /aa/bb/cc#foo(/:x/+)"
        ], "3.1");
        let currentRoute = {
            path: "/aa/bb/cc#foo",
            pathList: ["aa", "bb", "cc"],
            hashParam: "foo",
            params: null,
            pathParams: { x: "aa", "+": "bb/cc" },
            pattern: "/:x/+",
            routeId: "/ /+"
        }
        assertContent(router.currentRoute, currentRoute, "3.2");

        navState.logs = [];
        authorizeFromB = false;
        await router.navigate("/hello/world");
        assert.deepEqual(navState.logs, [
            "[navCtrlB 1] canNavigateFrom: /hello/world(/:x/+)<-/aa/bb/cc#foo"
        ], "4.1");
        assertContent(router.currentRoute, currentRoute, "4.2");

        navState.logs = [];
        authorizeFromB = true;
        authorizeToB = false;
        await router.navigate("/hello/world2");
        assert.deepEqual(navState.logs, [
            "[navCtrlB 1] canNavigateFrom: /hello/world2(/:x/+)<-/aa/bb/cc#foo",
            "[navCtrlB 1] canNavigateTo: /hello/world2(/:x/+)<-/aa/bb/cc#foo"
        ], "5.1");
        assertContent(router.currentRoute, currentRoute, "5.2");

        navState.logs = [];
        authorizeToB = true;
        await router.navigate("/hello-world");
        assert.deepEqual(navState.logs, [
            "[navCtrlB 1] canNavigateFrom: /hello-world(/*)<-/aa/bb/cc#foo",
            "[navCtrlA 0] canNavigateTo: /hello-world(/*)<-/",
            "[navCtrlB 1] unload: /hello-world(/*)<-/aa/bb/cc#foo",
            "[navCtrlA 0] load: /hello-world(/*)<-/"
        ], "6.1");
        assertContent(router.currentRoute, {
            path: "/hello-world",
            pathList: ["hello-world"],
            hashParam: null,
            params: null,
            pathParams: { "*": "hello-world" },
            pattern: "/*",
            routeId: "/*"
        }, "6.2");

    });

    it("should perform simple navigation and check guards (hash route)", async function () {
        router.add({
            "/*": ctrlAFactory,
            "/:x/+": ctrlBFactory,
            "/a/*": (r: Route, ns: TestNavState) => {
                ns.logs.push("[Inline Load] " + r.path);
            }
        });

        assert.equal(router.currentRoute.routeId, "", "0");
        await router.init(navState, getUrlAccessor("https://foo.bar.com:8080/#foo/bar"), "#"); // baseURL = "#" for hash urls

        assert.deepEqual(navState.logs, [
            "[navCtrlB 0] canNavigateTo: /foo/bar(/:x/+)",
            "[navCtrlB 0] load: /foo/bar(/:x/+)"
        ], "1.1");
        assertContent(router.currentRoute, {
            path: "/foo/bar",
            pathList: ["foo", "bar"],
            hashParam: null,
            params: null,
            pathParams: { x: "foo", "+": "bar" },
            pattern: "/:x/+",
            routeId: "/ /+"
        }, "1.2");

        navState.logs = [];
        await router.navigate("/a");
        assert.deepEqual(navState.logs, [
            "[navCtrlB 0] canNavigateFrom: /a(/a/*)<-/foo/bar",
            "[navCtrlB 0] unload: /a(/a/*)<-/foo/bar",
            "[Inline Load] /a"
        ], "2.1");
        assertContent(router.currentRoute, {
            path: "/a",
            pathList: ["a"],
            hashParam: null,
            params: null,
            pathParams: { "*": "" },
            pattern: "/a/*",
            routeId: "/a/*"
        }, "2.2");
    });

    it("should perform simple navigation and check guards (html5 route)", async function () {
        router.add({
            "/*": ctrlAFactory,
            "/:x/+?#": ctrlBFactory
        });

        assert.equal(router.currentRoute.routeId, "", "0");
        await router.init(navState, getUrlAccessor("https://foo.bar.com:8080/the/base/foo/bar?x=123;yyy=abc&z=#baz"), "/the/base");

        assert.deepEqual(navState.logs, [
            "[navCtrlB 0] canNavigateTo: /foo/bar(/:x/+?#)",
            "[navCtrlB 0] load: /foo/bar(/:x/+?#)"
        ], "1.1");
        assertContent(router.currentRoute, {
            path: "/foo/bar",
            pathList: ["foo", "bar"],
            hashParam: "baz",
            params: { x: "123", yyy: "abc", z: "" },
            pathParams: { "x": "foo", "+": "bar" },
            pattern: "/:x/+?#",
            routeId: "/ /+?#"
        }, "1.2");
    });

    it("should support to load sub-routes asynchronously (code-splitting)", async function () {
        router.add({
            "/*": ctrlC,
            "/:x/+?#": router.deferLoad(getRouteLoader)
        });

        assert.equal(router.currentRoute.path, "", "0.1");
        assert.notEqual(router["routeDefs"]["/ /+?#"], undefined, "0.2");
        assert.equal(router["routeDefs"]["/ /bar?#"], undefined, "0.3");    // new route not loaded yet
        assert.equal(router["routeDefs"]["/ /a/b"], undefined, "0.4");      // idem
        await router.init(navState, getUrlAccessor("https://foo.bar.com:8080/the/base/foo/bar?x=123;yyy=abc&z=#baz"), "/the/base");

        assert.equal(lastParentRoute, "/:x/+?#", "1.0");
        assert.deepEqual(navState.logs, [
            "[navCtrlB 0] canNavigateTo: /foo/bar(/:x/bar?#)",
            "[navCtrlB 0] load: /foo/bar(/:x/bar?#)"
        ], "1.1");
        assertContent(router.currentRoute, {
            path: "/foo/bar",
            pathList: ["foo", "bar"],
            hashParam: "baz",
            params: { x: "123", yyy: "abc", z: "" },
            pathParams: { "x": "foo" },
            pattern: "/:x/bar?#",
            routeId: "/ /bar?#"
        }, "1.2");
        assert.equal(router["routeDefs"]["/ /+?#"], undefined, "1.3"); // previous generic route has been removed
        assert.notEqual(router["routeDefs"]["/ /bar?#"], undefined, "1.4");
        assert.notEqual(router["routeDefs"]["/ /a/b"], undefined, "1.5");

        navState.logs = [];
        await router.navigate("/xyz");
        assert.deepEqual(navState.logs, [
            "[navCtrlB 0] canNavigateFrom: /xyz(/*)<-/foo/bar",
            "[navCtrlB 0] unload: /xyz(/*)<-/foo/bar",
            "[navCtrlC] load: /xyz(/*)"
        ], "2.1");
        assertContent(router.currentRoute, {
            path: "/xyz",
            pathList: ["xyz"],
            hashParam: null,
            params: null,
            pathParams: { "*": "xyz" },
            pattern: "/*",
            routeId: "/*"
        }, "2.2");

        navState.logs = [];
        await router.navigate("/firstVar/a/b");
        assert.deepEqual(navState.logs, [
            "[navCtrlC] load: /firstVar/a/b(/:x/a/b)"
        ], "3.1");
        assertContent(router.currentRoute, {
            path: "/firstVar/a/b",
            pathList: ["firstVar", "a", "b"],
            hashParam: null,
            params: null,
            pathParams: { x: "firstVar" },
            pattern: "/:x/a/b",
            routeId: "/ /a/b"
        }, "3.2");
    });

    it("should be able to tell if a route is active", async function () {
        router.add({
            "/*": ctrlAFactory,
            "/a/:x/+": ctrlBFactory
        });

        const w = getUrlAccessor("https://foo.bar.com:8080/#a/foo/bar");
        await router.init(navState, w, "#");

        const rd0 = router.parseRoute("/*"),
            rd1 = router.parseRoute("/foo"),
            rd2 = router.parseRoute("/foo/bar"),
            rd3 = router.parseRoute("/a/foo/bar"),
            rd4 = router.parseRoute("/:x/foo/bar"),
            rd5 = router.parseRoute("/:x/:y"),
            rd6 = router.parseRoute("/foo#"),
            rd7 = router.parseRoute("/a/foo/bar/*"),
            rd8 = router.parseRoute("/+");

        assert.equal(router.currentRoute!.pattern, '/a/:x/+', "");
        assert.equal(router.matchActive(rd0), true, "0.1");
        assert.equal(router.matchActive(rd1), false, "1.1");
        assert.equal(router.matchActive(rd2), false, "2.1");
        assert.equal(router.matchActive(rd3), true, "3.1");
        assert.equal(router.matchActive(rd4), true, "4.1");
        assert.equal(router.matchActive(rd5), true, "5.1");
        assert.equal(router.matchActive(rd6), false, "6.1");
        assert.equal(router.matchActive(rd7), true, "7.1");
        assert.equal(router.matchActive(rd8), true, "8.1");

        await router.navigate("/");
        assert.equal(router.matchActive(rd0), true, "0.2");
        assert.equal(router.matchActive(rd1), false, "1.2");
        assert.equal(router.matchActive(rd2), false, "2.2");
        assert.equal(router.matchActive(rd3), false, "3.2");
        assert.equal(router.matchActive(rd4), false, "4.2");
        assert.equal(router.matchActive(rd5), false, "5.2");
        assert.equal(router.matchActive(rd6), false, "6.2");
        assert.equal(router.matchActive(rd7), false, "7.2");
        assert.equal(router.matchActive(rd8), false, "8.2");

        await router.navigate("/foo");
        assert.equal(router.matchActive(rd0), true, "0.2");
        assert.equal(router.matchActive(rd1), true, "1.2");
        assert.equal(router.matchActive(rd2), false, "2.2");
        assert.equal(router.matchActive(rd3), false, "3.2");
        assert.equal(router.matchActive(rd4), false, "4.2");
        assert.equal(router.matchActive(rd5), false, "5.2");
        assert.equal(router.matchActive(rd6), true, "6.2");
        assert.equal(router.matchActive(rd7), false, "7.2");
        assert.equal(router.matchActive(rd8), true, "8.2");

        // TODO hash param validation
    });

    // TODO: test @link and history-related use cases
    // navigate must change URL / navigate back
    // navigation triggered by url change
    // isActive
    // notification when navigation is performed -> watch?
    // @link
    // @activeLink

    // parseRoute -> returns data, including a normalized route -> goal is to be easily compared and find best match
    // router.isActive(route)

    // hashRoutes vs html5Routes
    // @link
    // @activeLink
    // TODO: errors and warning validation

    // TODO: support #value in route definition
    // TODO: dispose()
    // TODO: nested routers: router.add("/foo/bar/*", router2);
    // TODO: possibility to update a route?
    // TODO: support RegExps in route def - e.g. /:abc{\d+}/foo/bar

})