/**
 * Created by blaporte on 19/12/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {parse} from '../src/iv/parser';
import {compile} from '../src/iv/compiler';
import {diff} from './utils';

describe('Iv compiler', () => {

    function cpl(strings, ...values) {
        let r = parse(strings, values);
        if (r.error) {
            throw `(${r.error.line}:${r.error.column}) ${r.error.description}`;
        }
        return compile(r.nac, true, 3, r.lineNbrShift, r.fileName);
    }

    it('should compile an empty package', () => {
        let pkg = cpl`
        
        `;
        expect(diff(pkg.$data.fnContent, `\
            return {};`
        )).toBe("equal");
    });

    it('should compile an empty function', () => {
        let pkg = cpl`
            // @file:compiler.spec @line:32
            <function #foo>
            </function>
        `;

        expect(diff(pkg.$data.fnContent, `\
            var foo;
            // @file:compiler.spec @line:32
            foo = $c.fn(0, function($c) {
                $c.fs(0); // function start
                $c.fe(0); // function end
            },[
                [0, 2, 33, [], {}, 0, 0, 0, 0, "compiler.spec"]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should properly identify function arguments', () => {
        let r = cpl`
            <function #foo arg1:String="bar" arg2 arg3:Number arg4=123>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, arg1, arg2, arg3, arg4) {
                arg1 = (arg1 !== undefined)? arg1 : "bar";
                arg2 = (arg2 !== undefined)? arg2 : {};
                arg3 = (arg3 !== undefined)? arg3 : {};
                arg4 = (arg4 !== undefined)? arg4 : 123;
                $c.fs(0); // function start
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["arg1", "arg2", "arg3", "arg4"], {"arg1":0, "arg2":1, "arg3":2, "arg4":3}, ["arg1", String, "arg2", 0, "arg3", Number, "arg4", 0], 0, 0, 0, ""]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should properly generate type arguments in functions', () => {
        let r = cpl`
            <function #foo c:IvController(Blah) d:IvEvtHandler("value")>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, c, d) {
                d = (d !== undefined)? d : {};
                $c.fs(0); // function start
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["c", "d"], {"c":0, "d":1}, ["c", [$iv.IvController, Blah], "d", [$iv.IvEvtHandler, "value"]], 0, 0, 0, ""]
            ]);
            return {foo:foo};`
        )).toBe("equal");

        // todo support types and list
        r = cpl`
            <type #Panel onexpand:IvEvtHandler("closed")/>
        `;

        expect(diff(r.$data.fnContent, `\
            var Panel;
            Panel = $c.td(2, ["onexpand", [$iv.IvEvtHandler, "closed"]], 0, 0, 0);
            return {Panel:Panel};`
        )).toBe("equal");

        r = cpl`
            <type #Foo barList:SomeType(SomeClass,"hello")[]/>
        `;

        expect(diff(r.$data.fnContent, `\
            var Foo;
            Foo = $c.td(2, 0, ["barList", "bar", [SomeType, SomeClass, "hello"]], 0, 0);
            return {Foo:Foo};`
        )).toBe("equal");
    });

    it('should support list arguments', () => {
        let r = cpl`
            <function #foo nameList:String[] nbrList:Number[]=[1,2,3]>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, nameList, nbrList) {
                nameList = (nameList !== undefined)? nameList : [];
                nbrList = (nbrList !== undefined)? nbrList : [1,2,3];
                $c.fs(0); // function start
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["nameList", "nbrList"], {"nameList":0, "nbrList":1}, 0, ["nameList", "name", String, "nbrList", "nbr", Number], 0, 0, ""]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should properly identify template content name', () => {
        let r = cpl`
            <function #foo arg:String="bar" body:IvContent>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, arg, body) {
                arg = (arg !== undefined)? arg : "bar";
                $c.fs(0); // function start
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["arg", "body"], {"arg":0, "body":1}, ["arg", String], 0, "body", 0, ""]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should compile type nodes', () => {
        let r = cpl`
            <type #Basic simple:String active:Boolean nbr:Number title:IvNode selection/>
        `;

        expect(diff(r.$data.fnContent, `\
            var Basic;
            Basic = $c.td(2, ["simple", String, "active", Boolean, "nbr", Number, "title", $iv.IvNode, "selection", 0], 0, 0, 0);
            return {Basic:Basic};`
        )).toBe("equal");
    });

    it('should compile type nodes with content', () => {
        let r = cpl`
            <type #Basic body:IvContent/>
        `;

        expect(diff(r.$data.fnContent, `\
            var Basic;
            Basic = $c.td(2, 0, 0, "body", 0);
            return {Basic:Basic};`
        )).toBe("equal");
    });

    it('should compile type nodes with attribute lists', () => {
        let r = cpl`
            <type #Basic simpleList:String[] fooList:IvAny[] barList/>
        `;

        expect(diff(r.$data.fnContent, `\
            var Basic;
            Basic = $c.td(2, 0, ["simpleList", "simple", String, "fooList", "foo", $iv.IvAny, "barList", "bar", 0], 0, 0);
            return {Basic:Basic};`
        )).toBe("equal");
    });

    it('should compile type nodes with IvContentList', () => {
        // IvContentList is used when the caller needs to retrive all attribute nodes as a list
        let r = cpl`
            <type #Basic simpleList:String[] content:IvContentList/>
        `;

        expect(diff(r.$data.fnContent, `\
            var Basic;
            Basic = $c.td(2, 0, ["simpleList", "simple", String], 0, "content");
            return {Basic:Basic};`
        )).toBe("equal");
    });

    it('should compile element nodes', () => {
        let r = cpl`
            <function #foo bar:Number=123>
                <div class="main">
                    <span [title]=bar+3 ok=true foo=123+456></span>
                    <input type="text" [[value]]=bar/>
                </div>
                <br/>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, bar) {
                bar = (bar !== undefined)? bar : 123;
                $c.fs(0); // function start
                $c.ns(1, true, 0, 0); // div
                $c.ns(2, false, ["title", bar+3], ["foo", 123+456]); // span
                $c.ns(3, false, ["value", bar], 0); // input
                $c.ne(1);
                $c.ns(4, false, 0, 0); // br
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["bar"], {"bar":0}, ["bar", Number], 0, 0, 0, ""],
                [1, 1, 3, "div", ["class", "main"], 0],
                [2, 1, 4, "span", ["ok", "true"], 1],
                [3, 1, 5, "input", ["type", "text"], 1],
                [4, 1, 7, "br", 0, 0]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should compile text nodes', () => {
        let r = cpl`
            <function #foo>
                Hello World
                <div>
                    Here
                    and "here"
                    <span> and here as well </span>
                </div>
                Done !
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c) {
                $c.fs(0); // function start
                $c.t(1); // Hello World 
                $c.ns(2, true, 0, 0); // div
                $c.t(3); // Here            (...)
                $c.ns(4, true, 0, 0); // span
                $c.t(5); // and here as well(...)
                $c.ne(4);
                $c.ne(2);
                $c.t(6); // Done ! 
                $c.fe(0); // function end
            },[
                [0, 2, 2, [], {}, 0, 0, 0, 0, ""],
                [1, 3, 3, " Hello World "],
                [2, 1, 4, "div", 0, 0],
                [3, 3, 5, " Here\\n                    and \\"here\\" "],
                [4, 1, 7, "span", 0, 2],
                [5, 3, 7, " and here as well "],
                [6, 3, 9, " Done ! "]
            ]);
            return {foo:foo};`
        )).toBe("equal");

    });

    it('should compile single-line comments', () => {
        let r = cpl`
            <function #foo>
                Hello World
                // comment 1
                <div>
                    // comment 2
                </div>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c) {
                $c.fs(0); // function start
                $c.t(1); // Hello World 
                // comment 1
                $c.ns(2, true, 0, 0); // div
                // comment 2
                $c.ne(2);
                $c.fe(0); // function end
            },[
                [0, 2, 2, [], {}, 0, 0, 0, 0, ""],
                [1, 3, 3, " Hello World "],
                [2, 1, 5, "div", 0, 0]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should compile multi-line comments', () => {
        let r = cpl`
            <function #foo>
                Hello World
                /* comment 1 */
                <div>
                    /**
                     * comment 2
                     **/
                </div>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c) {
                $c.fs(0); // function start
                $c.t(1); // Hello World 
                /* comment 1 */
                $c.ns(2, true, 0, 0); // div
                /**
                 * comment 2
                 **/
                $c.ne(2);
                $c.fe(0); // function end
            },[
                [0, 2, 2, [], {}, 0, 0, 0, 0, ""],
                [1, 3, 3, " Hello World "],
                [2, 1, 5, "div", 0, 0]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should compile js expressions', () => {
        let r = cpl`
            <function #foo bar:Number=123>
                % let x = 1;
                <div class="main">
                    % x = 2+bar;
                </div>
                <br/>
                % x = 3;
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, bar) {
                bar = (bar !== undefined)? bar : 123;
                $c.fs(0); // function start
                let x = 1;
                $c.ns(1, true, 0, 0); // div
                x = 2+bar;
                $c.ne(1);
                $c.ns(2, false, 0, 0); // br
                x = 3;
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["bar"], {"bar":0}, ["bar", Number], 0, 0, 0, ""],
                [1, 1, 4, "div", ["class", "main"], 0],
                [2, 1, 7, "br", 0, 0]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should compile simple js blocks', () => {
        let r = cpl`
            <function #foo bar:Number=123>
                % if (bar % 2) {
                <div class="main">
                    % if (bar === 3) {
                        <span title="ok"></span>
                    % }
                </div>
                <br/>
                % }
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, bar) {
                bar = (bar !== undefined)? bar : 123;
                $c.fs(0); // function start
                if (bar % 2) {
                    $c.bs(1);
                    $c.ns(2, true, 0, 0); // div
                    if (bar === 3) {
                        $c.bs(3);
                        $c.ns(4, false, 0, 0); // span
                        $c.be(3);
                    }
                    $c.ne(2);
                    $c.ns(5, false, 0, 0); // br
                    $c.be(1);
                }
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["bar"], {"bar":0}, ["bar", Number], 0, 0, 0, ""],
                 1,
                [2, 1, 4, "div", ["class", "main"], 0],
                 3,
                [4, 1, 6, "span", ["title", "ok"], 2],
                [5, 1, 9, "br", 0, 0]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should compile complex js blocks', () => {
        let r = cpl`
            <function #foo bar:Number=123>
                % if (bar % 2) {
                <div class="main"></div>
                % } else if (bar % 3) {
                <div class="main2"></div>
                % } else {
                <div class="main3"></div>
                % }
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, bar) {
                bar = (bar !== undefined)? bar : 123;
                $c.fs(0); // function start
                if (bar % 2) {
                    $c.bs(1);
                    $c.ns(2, false, 0, 0); // div
                    $c.be(1);
                }
                else if (bar % 3) {
                    $c.bs(3);
                    $c.ns(4, false, 0, 0); // div
                    $c.be(3);
                }
                else {
                    $c.bs(5);
                    $c.ns(6, false, 0, 0); // div
                    $c.be(5);
                }
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["bar"], {"bar":0}, ["bar", Number], 0, 0, 0, ""],
                 1,
                [2, 1, 4, "div", ["class", "main"], 0],
                 3,
                [4, 1, 6, "div", ["class", "main2"], 0],
                 5,
                [6, 1, 8, "div", ["class", "main3"], 0]
            ]);
            return {foo:foo};`
        )).toBe("equal");

    });

    it('should compile sub-template calls', () => {
        let r = cpl`
            <function #foo v:Number=123>
                <div>
                    <span>first</span>
                    <bar [value]=v+1/>
                    <bar [value]=v+2/>
                    <span>last</span>
                </div>
            </function>
            
            <function #bar value>
                <span [title]=("Value: "+value)/>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo, bar;
            foo = $c.fn(0, function($c, v) {
                v = (v !== undefined)? v : 123;
                $c.fs(0); // function start
                $c.ns(1, true, 0, 0); // div
                $c.ns(2, true, 0, 0); // span
                $c.t(3); // first
                $c.ne(2);
                $c.cs(4, bar, false, ["value", v+1], 0); // bar
                $c.cs(5, bar, false, ["value", v+2], 0); // bar
                $c.ns(6, true, 0, 0); // span
                $c.t(7); // last
                $c.ne(6);
                $c.ne(1);
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["v"], {"v":0}, ["v", Number], 0, 0, 0, ""],
                [1, 1, 3, "div", 0, 0],
                [2, 1, 4, "span", 0, 1],
                [3, 3, 4, "first"],
                [4, 15, 5, "bar", 0, 1],
                [5, 15, 6, "bar", 0, 1],
                [6, 1, 7, "span", 0, 1],
                [7, 3, 7, "last"]
            ]);
            bar = $c.fn(1, function($c, value) {
                value = (value !== undefined)? value : {};
                $c.fs(0); // function start
                $c.ns(1, false, ["title", ("Value: "+value)], 0); // span
                $c.fe(0); // function end
            },[
                [0, 2, 11, ["value"], {"value":0}, ["value", 0], 0, 0, 0, ""],
                [1, 1, 12, "span", 0, 0]
            ]);
            return {foo:foo, bar:bar};`
        )).toBe("equal");
    });

    it('should compile text and node insert', () => {
        let r = cpl`
            <function #foo msg="hello">
                <div>
                    {{msg}}
                </div>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, msg) {
                msg = (msg !== undefined)? msg : "hello";
                $c.fs(0); // function start
                $c.ns(1, true, 0, 0); // div
                $c.ins(2, msg);
                $c.ne(1);
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["msg"], {"msg":0}, ["msg", 0], 0, 0, 0, ""],
                [1, 1, 3, "div", 0, 0],
                 2
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should compile function attributes', () => {
        let r = cpl`
            <function #foo msg="hello">
                <div>
                    <span onclick()=doSomething(msg)/>
                    <span foo=123+321 bar()={foo();baz()}/>
                    <span onswap()={ doThis(); doThat() }/>
                </div>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, msg) {
                msg = (msg !== undefined)? msg : "hello";
                $c.fs(0); // function start
                $c.ns(1, true, 0, 0); // div
                $c.ns(2, false, 0, ["onclick", function() {doSomething(msg)}]); // span
                $c.ns(3, false, 0, ["foo", 123+321, "bar", function() {foo();baz()}]); // span
                $c.ns(4, false, 0, ["onswap", function() {doThis(); doThat()}]); // span
                $c.ne(1);
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["msg"], {"msg":0}, ["msg", 0], 0, 0, 0, ""],
                [1, 1, 3, "div", 0, 0],
                [2, 1, 4, "span", 0, 1],
                [3, 1, 5, "span", 0, 1],
                [4, 1, 6, "span", 0, 1]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should compile function attributes with parameters', () => {
        let r = cpl`
            <function #foo msg="hello">
                <div>
                    <span onclick(a )=doSomething(msg)/>
                    <span foo=123+321 bar(p1, p2)={foo();baz()}/>
                </div>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c, msg) {
                msg = (msg !== undefined)? msg : "hello";
                $c.fs(0); // function start
                $c.ns(1, true, 0, 0); // div
                $c.ns(2, false, 0, ["onclick", function(a) {doSomething(msg)}]); // span
                $c.ns(3, false, 0, ["foo", 123+321, "bar", function(p1,p2) {foo();baz()}]); // span
                $c.ne(1);
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["msg"], {"msg":0}, ["msg", 0], 0, 0, 0, ""],
                [1, 1, 3, "div", 0, 0],
                [2, 1, 4, "span", 0, 1],
                [3, 1, 5, "span", 0, 1]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should load the package function', () => {
        let x = 123;
        let r = cpl`
            % var x=${x};
            
            /**
             * Comment function
             */
            <function #foo bar:Number=123>
                % if (bar % 2) {
                <div class="main"></div>
                % } else if (bar % 3) {
                <div class="main2" [title]=bar+3></div>
                % } else {
                <div class="main3"></div>
                % }
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            var x=$v[0];
            /**
             * Comment function
             */
            foo = $c.fn(0, function($c, bar) {
                bar = (bar !== undefined)? bar : 123;
                $c.fs(0); // function start
                if (bar % 2) {
                    $c.bs(1);
                    $c.ns(2, false, 0, 0); // div
                    $c.be(1);
                }
                else if (bar % 3) {
                    $c.bs(3);
                    $c.ns(4, false, ["title", bar+3], 0); // div
                    $c.be(3);
                }
                else {
                    $c.bs(5);
                    $c.ns(6, false, 0, 0); // div
                    $c.be(5);
                }
                $c.fe(0); // function end
            },[
                [0, 2, 7, ["bar"], {"bar":0}, ["bar", Number], 0, 0, 0, ""],
                 1,
                [2, 1, 9, "div", ["class", "main"], 0],
                 3,
                [4, 1, 11, "div", ["class", "main2"], 0],
                 5,
                [6, 1, 13, "div", ["class", "main3"], 0]
            ]);
            return {foo:foo};`
        )).toBe("equal");

        expect(r.$fn.constructor).toBe(Function);

        let c1 = {
            logs: [],
            fn: function (idx, func) {
                this.logs.push("fn" + idx + ";");
                return {templateFn: func};
            }
        };

        let pkg = r.$fn(c1, [123], {});
        expect(pkg.foo.templateFn.constructor).toBe(Function);

        let c2 = {
            logs: [],
            fs: function (idx) {
                this.logs.push("fs" + idx + ";");
            },
            fe: function (idx) {
                this.logs.push("fe" + idx + ";");
            },
            ns: function (idx, b, dynAtts) {
                dynAtts = (dynAtts !== 0) ? dynAtts.join(":") : 0;
                this.logs.push("ns" + idx + dynAtts + ";");
            },
            bs: function (idx) {
                this.logs.push("bs" + idx + ";");
            },
            ne: function (idx) {
                this.logs.push("ne" + idx + ";");
            },
            be: function (idx) {
                this.logs.push("be" + idx + ";");
            }
        };

        pkg.foo.templateFn(c2, 42);
        expect(c2.logs.join("")).toEqual("fs0;bs5;ns60;be5;fe0;");
        c2.logs = [];
        pkg.foo.templateFn(c2);
        expect(c2.logs.join("")).toEqual("fs0;bs1;ns20;be1;fe0;");
        c2.logs = [];
        pkg.foo.templateFn(c2, 2);
        expect(c2.logs.join("")).toEqual("fs0;bs3;ns4title:5;be3;fe0;");

    });

    it('should compile nodes with namespaces', () => {
        let b = {};
        let r = cpl`
            % var b=${b};
            <function #foo v:Number=123>
                <div>
                    <b:bar [value]=v+1 />
                    <b:bar value=v+2 />
                </div>
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo;
            var b=$v[0];
            foo = $c.fn(0, function($c, v) {
                v = (v !== undefined)? v : 123;
                $c.fs(0); // function start
                $c.ns(1, true, 0, 0); // div
                $c.cs(2, b.bar, false, ["value", v+1], 0); // b:bar
                $c.cs(3, b.bar, false, 0, ["value", v+2]); // b:bar
                $c.ne(1);
                $c.fe(0); // function end
            },[
                [0, 2, 3, ["v"], {"v":0}, ["v", Number], 0, 0, 0, ""],
                [1, 1, 4, "div", 0, 0],
                [2, 15, 5, "bar", 0, 1],
                [3, 15, 6, "bar", 0, 1]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should compile attribute nodes: IvNode', () => {
        let r = cpl`
            <function #foo v:Number=123>
                <div>
                    <bar [value]=v+1>
                        <:head>hello</:head>
                        % if (v===12) {
                            <:body>world</:body>
                        % }
                    </bar>
                </div>
            </function>

            <function #bar value head:IvNode body:IvNode>
                <span [title]=("Value: "+value) >
                    {{head}}
                </span>
                {{body}}
            </function>
        `;

        expect(diff(r.$data.fnContent, `\
            var foo, bar;
            foo = $c.fn(0, function($c, v) {
                v = (v !== undefined)? v : 123;
                $c.fs(0); // function start
                $c.ns(1, true, 0, 0); // div
                $c.cs(2, bar, true, ["value", v+1], 0); // bar
                $c.as(3, true, 0, 0); // :head
                $c.t(4); // hello
                $c.ae(3);
                if (v===12) {
                    $c.bs(5);
                    $c.as(6, true, 0, 0); // :body
                    $c.t(7); // world
                    $c.ae(6);
                    $c.be(5);
                }
                $c.ce(2);
                $c.ne(1);
                $c.fe(0); // function end
            },[
                [0, 2, 2, ["v"], {"v":0}, ["v", Number], 0, 0, 0, ""],
                [1, 1, 3, "div", 0, 0],
                [2, 15, 4, "bar", 0, 1],
                [3, 16, 5, "head", 0, 2],
                [4, 3, 5, "hello"],
                 5,
                [6, 16, 7, "body", 0, 2],
                [7, 3, 7, "world"]
            ]);
            bar = $c.fn(1, function($c, value, head, body) {
                value = (value !== undefined)? value : {};
                $c.fs(0); // function start
                $c.ns(1, true, ["title", ("Value: "+value)], 0); // span
                $c.ins(2, head);
                $c.ne(1);
                $c.ins(3, body);
                $c.fe(0); // function end
            },[
                [0, 2, 13, ["value", "head", "body"], {"value":0, "head":1, "body":2}, ["value", 0, "head", $iv.IvNode, "body", $iv.IvNode], 0, 0, 0, ""],
                [1, 1, 14, "span", 0, 0],
                 2,
                 3
            ]);
            return {foo:foo, bar:bar};`
        )).toBe("equal");
    });

    // TODO

    // it('should compile id and @ properties', () => {
    //     let r = cpl`
    //         <template #foo>
    //             <div #bar @baz/>
    //         </template>
    //     `;
    //     expect(r.foo.templateFnContent).toEqual(`\
    // $c.ts(0); // template
    // $c.as(1,false,0,0); // div@baz
    // $c.te(0);`);
    //
    //     expect(r.foo.templateStatics).toEqual([
    //         0,
    //         [1, 16, "baz", ["id", "bar"]]
    //     ]);
    // });


    // todo test missing id in type def
    // todo test error is contentList and no attribute list
    // todo test error if Iv type is passed as list attribute
    // todo raise error if default is passed in types?
    // todo subtemplate or component call through <insert>
    // todo subtemplates with content nodes, and with @name nodes
    // todo need for try catch in case of invalid expression?
    // todo raise error if template attributes defaults are dynamic expressions
    // todo raise error if attName is not used as child of a cpt or of another att node
});
