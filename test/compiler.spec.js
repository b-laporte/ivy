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
        return compile(r.nac, true, 3);
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
            <function #foo>
            </function>
        `;

        expect(diff(pkg.$data.fnContent, `\
            var foo;
            foo = $c.fn(0, function($c) {
                $c.fs(0); // function start
                $c.fe(0); // function end
            },[
                [0, 2, [], {}, [], ""]
            ]);
            return {foo:foo};`
        )).toBe("equal");
    });

    it('should properly identify template arguments', () => {
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
                [0, 2, ["arg1", "arg2", "arg3", "arg4"], {"arg1":0, "arg2":1, "arg3":2, "arg4":3}, [String, 0, Number, 0], ""]
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
                [0, 2, ["arg", "body"], {"arg":0, "body":1}, [String, $iv.IvContent], "body"]
            ]);
            return {foo:foo};`
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
                [0, 2, ["bar"], {"bar":0}, [Number], ""],
                [1, 1, "div", ["class", "main"]],
                [2, 1, "span", ["ok", "true"]],
                [3, 1, "input", ["type", "text"]],
                [4, 1, "br", 0]
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
                [0, 2, [], {}, [], ""],
                [1, 3, " Hello World "],
                [2, 1, "div", 0],
                [3, 3, " Here\\n                    and \\"here\\" "],
                [4, 1, "span", 0],
                [5, 3, " and here as well "],
                [6, 3, " Done ! "]
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
                [0, 2, [], {}, [], ""],
                [1, 3, " Hello World "],
                [2, 1, "div", 0]
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
                [0, 2, [], {}, [], ""],
                [1, 3, " Hello World "],
                [2, 1, "div", 0]
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
                [0, 2, ["bar"], {"bar":0}, [Number], ""],
                [1, 1, "div", ["class", "main"]],
                [2, 1, "br", 0]
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
                [0, 2, ["bar"], {"bar":0}, [Number], ""],
                 1,
                [2, 1, "div", ["class", "main"]],
                 3,
                [4, 1, "span", ["title", "ok"]],
                [5, 1, "br", 0]
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
                [0, 2, ["bar"], {"bar":0}, [Number], ""],
                 1,
                [2, 1, "div", ["class", "main"]],
                 3,
                [4, 1, "div", ["class", "main2"]],
                 5,
                [6, 1, "div", ["class", "main3"]]
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
                [0, 2, ["v"], {"v":0}, [Number], ""],
                [1, 1, "div", 0],
                [2, 1, "span", 0],
                [3, 3, "first"],
                [4, 15, "bar", 0],
                [5, 15, "bar", 0],
                [6, 1, "span", 0],
                [7, 3, "last"]
            ]);
            bar = $c.fn(1, function($c, value) {
                value = (value !== undefined)? value : {};
                $c.fs(0); // function start
                $c.ns(1, false, ["title", ("Value: "+value)], 0); // span
                $c.fe(0); // function end
            },[
                [0, 2, ["value"], {"value":0}, [0], ""],
                [1, 1, "span", 0]
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
                [0, 2, ["msg"], {"msg":0}, [0], ""],
                [1, 1, "div", 0],
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
                [0, 2, ["msg"], {"msg":0}, [0], ""],
                [1, 1, "div", 0],
                [2, 1, "span", 0],
                [3, 1, "span", 0],
                [4, 1, "span", 0]
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
                [0, 2, ["msg"], {"msg":0}, [0], ""],
                [1, 1, "div", 0],
                [2, 1, "span", 0],
                [3, 1, "span", 0]
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
                [0, 2, ["bar"], {"bar":0}, [Number], ""],
                 1,
                [2, 1, "div", ["class", "main"]],
                 3,
                [4, 1, "div", ["class", "main2"]],
                 5,
                [6, 1, "div", ["class", "main3"]]
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
                [0, 2, ["v"], {"v":0}, [Number], ""],
                [1, 1, "div", 0],
                [2, 15, "bar", 0],
                [3, 15, "bar", 0]
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
                        <:body>world</:body>
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
                $c.as(5, true, 0, 0); // :body
                $c.t(6); // world
                $c.ae(5);
                $c.ce(2);
                $c.ne(1);
                $c.fe(0); // function end
            },[
                [0, 2, ["v"], {"v":0}, [Number], ""],
                [1, 1, "div", 0],
                [2, 15, "bar", 0],
                [3, 16, "head", 0],
                [4, 3, "hello"],
                [5, 16, "body", 0],
                [6, 3, "world"]
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
                [0, 2, ["value", "head", "body"], {"value":0, "head":1, "body":2}, [0, $iv.IvNode, $iv.IvNode], ""],
                [1, 1, "span", 0],
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


    // todo subtemplate or component call through <insert>
    // todo subtemplates with content nodes, and with @name nodes
    // todo need for try catch in case of invalid expression?
    // todo raise error if template attributes defaults are dynamic expressions
    // todo raise error if attName is not used as child of a cpt or of another att node
});
