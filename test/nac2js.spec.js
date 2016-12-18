/**
 * NAC JS compiler tests
 * Copyright Bertrand Laporte 2016
 * Created on 22/04/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {parse} from '../src/iv/parser';
import {compile} from '../src/iv/nac2js';
import {diff} from './utils';

describe('NAC compiler', () => {

    function cpl(strings, ...values) {
        let r = parse(strings, values);
        if (r.error) {
            throw `(${r.error.line}:${r.error.column}) ${r.error.description}`;
        }
        return compile(r.nac, true);
    }

    it('should compile an empty template', () => {
        let r = cpl`
            <template #foo>
            </template>
        `;
        expect(r.foo.templateId).toBe("foo");
        expect(r.foo.templateFnContent).toEqual(`\
    $c.ts(0); // template
    $c.te(0);`);
        expect(r.foo.templateStatics).toEqual([
            0
        ]);
    });

    it('should properly identify template arguments', () => {
        let r = cpl`
            <template #foo arg1:string="bar" arg2 arg3:number arg4=123>
            </template>
        `;
        expect(r.foo.templateArgs).toEqual(["arg1", "arg2", "arg3", "arg4"]);
        expect(r.foo.templateArgIdx["arg1"]).toBe(0);
        expect(r.foo.templateArgIdx["arg2"]).toBe(1);
        expect(r.foo.templateArgIdx["arg3"]).toBe(2);
        expect(r.foo.templateArgIdx["arg4"]).toBe(3);
    });

    it('should compile element nodes', () => {
        let r = cpl`
            <template #foo bar:number=123>
                <div class="main">
                    <span [title]=bar+3 ok=true foo=123+456></span>
                    <input type="text" [[value]]=bar/>
                </div>
                <br/>
            </template>
        `;
        expect(r.foo.templateFnContent).toEqual(`\
    bar=(bar!==undefined)?bar:123;
    $c.ts(0); // template
    $c.ns(1,true,0,0); // div
    $c.ns(2,false,["title",bar+3],["foo",123+456]); // span
    $c.ns(3,false,["value",bar],0); // input
    $c.ne(1);
    $c.ns(4,false,0,0); // br
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            [1, 1, "div", ["class", "main"]],
            [2, 1, "span", ["ok", true]],
            [3, 1, "input", ["type", "text"]],
            [4, 1, "br", 0]
        ]);
    });

    it('should compile id and @ properties', () => {
        let r = cpl`
            <template #foo>
                <div #bar @baz/>
            </template>
        `;
        expect(r.foo.templateFnContent).toEqual(`\
    $c.ts(0); // template
    $c.as(1,false,0,0); // div@baz
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            [1, 16, "baz", ["id", "bar"]]
        ]);
    });

    it('should compile text nodes', () => {
        let r = cpl`
            <template #foo>
                Hello World
                <div>
                    Here
                    and here
                    <span> and here as well </span>
                </div>
                Done !
            </template>
        `;
        expect(r.foo.templateFnContent).toEqual(`\
    $c.ts(0); // template
    $c.t(1); // Hello World 
    $c.ns(2,true,0,0); // div
    $c.t(3); // Here            (...)
    $c.ns(4,true,0,0); // span
    $c.t(5); // and here as well(...)
    $c.ne(4);
    $c.ne(2);
    $c.t(6); // Done ! 
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            [1, 3, ` Hello World `],
            [2, 1, "div", 0],
            [3, 3, ` Here
                    and here `],
            [4, 1, "span", 0],
            [5, 3, ` and here as well `],
            [6, 3, ` Done ! `]
        ]);
    });

    it('should compile single-line comments', () => {
        let r = cpl`
            <template #foo>
                Hello World
                // comment 1
                <div>
                    // comment 2
                </div>
            </template>
        `;
        expect(r.foo.templateFnContent).toEqual(`\
    $c.ts(0); // template
    $c.t(1); // Hello World 
    // comment 1
    $c.ns(2,true,0,0); // div
    // comment 2
    $c.ne(2);
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            [1, 3, ` Hello World `],
            [2, 1, "div", 0],
        ]);
    });

    it('should compile multi-line comments', () => {
        let r = cpl`
            <template #foo>
                Hello World
                /* comment 1 */
                <div>
                    /**
                     * comment 2
                     **/
                </div>
            </template>
        `;
        expect(diff (r.foo.templateFnContent, `\
    $c.ts(0); // template
    $c.t(1); // Hello World 
    /* comment 1 */
    $c.ns(2,true,0,0); // div
    /**
     * comment 2
     **/
    $c.ne(2);
    $c.te(0);`)).toBe("equal");

        expect(r.foo.templateStatics).toEqual([
            0,
            [1, 3, ` Hello World `],
            [2, 1, "div", 0],
        ]);
    });

    it('should compile js expressions', () => {
        let r = cpl`
            <template #foo bar:number=123>
                % let x = 1;
                <div class="main">
                    % x = 2+bar;
                </div>
                <br/>
                % x = 3;
            </template>
        `;

        expect(r.foo.templateFnContent).toEqual(`\
    bar=(bar!==undefined)?bar:123;
    $c.ts(0); // template
    let x = 1;
    $c.ns(1,true,0,0); // div
    x = 2+bar;
    $c.ne(1);
    $c.ns(2,false,0,0); // br
    x = 3;
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            [1, 1, "div", ["class", "main"]],
            [2, 1, "br", 0]
        ]);
    });

    it('should compile simple js blocks', () => {
        let r = cpl`
            <template #foo bar:number=123>
                % if (bar % 2) {
                <div class="main">
                    % if (bar === 3) {
                        <span title="ok"></span>
                    % }
                </div>
                <br/>
                % }
            </template>
        `;

        expect(r.foo.templateFnContent).toEqual(`\
    bar=(bar!==undefined)?bar:123;
    $c.ts(0); // template
    if (bar % 2) {
        $c.bs(1);
        $c.ns(2,true,0,0); // div
        if (bar === 3) {
            $c.bs(3);
            $c.ns(4,false,0,0); // span
            $c.be(3);
        }
        $c.ne(2);
        $c.ns(5,false,0,0); // br
        $c.be(1);
    }
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            0,
            [2, 1, "div", ["class", "main"]],
            0,
            [4, 1, "span", ["title", "ok"]],
            [5, 1, "br", 0]
        ]);
    });

    it('should compile complex js blocks', () => {
        let r = cpl`
            <template #foo bar:number=123>
                % if (bar % 2) {
                <div class="main"></div>
                % } else if (bar % 3) {
                <div class="main2"></div>
                % } else {
                <div class="main3"></div>
                % }
            </template>
        `;

        expect(r.foo.templateFnContent).toEqual(`\
    bar=(bar!==undefined)?bar:123;
    $c.ts(0); // template
    if (bar % 2) {
        $c.bs(1);
        $c.ns(2,false,0,0); // div
        $c.be(1);
    }
    else if (bar % 3) {
        $c.bs(3);
        $c.ns(4,false,0,0); // div
        $c.be(3);
    }
    else {
        $c.bs(5);
        $c.ns(6,false,0,0); // div
        $c.be(5);
    }
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            0,
            [2, 1, "div", ["class", "main"]],
            0,
            [4, 1, "div", ["class", "main2"]],
            0,
            [6, 1, "div", ["class", "main3"]]
        ]);
    });

    it('should load the template function', () => {
        let r = cpl`
            <template #foo bar:number=123>
                % if (bar % 2) {
                <div class="main"></div>
                % } else if (bar % 3) {
                <div class="main2" [title]=bar+3></div>
                % } else {
                <div class="main3"></div>
                % }
            </template>
        `;

        let c = {
            logs: [],
            ts: function (idx) {
                this.logs.push("ts" + idx + ";");
            },
            te: function (idx) {
                this.logs.push("te" + idx + ";");
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
        r.foo.templateFn(c, 42);
        expect(c.logs.join("")).toEqual("ts0;bs5;ns60;be5;te0;");
        c.logs = [];
        r.foo.templateFn(c);
        expect(c.logs.join("")).toEqual("ts0;bs1;ns20;be1;te0;");
        c.logs = [];
        r.foo.templateFn(c, 2);
        expect(c.logs.join("")).toEqual("ts0;bs3;ns4title:5;be3;te0;");
    });

    it('should compile sub-template calls', () => {
        let r = cpl`
            <template #foo v:number=123>
                <div>
                    <span>first</span>
                    <bar [value]=v+1/>
                    <bar [value]=v+2/>
                    <span>last</span>
                </div>
            </template>
            
            <template #bar value>
                <span [title]=("Value: "+value)/>
            </template>
        `;

        expect(r.foo.templateFnContent).toEqual(`\
    v=(v!==undefined)?v:123;
    $c.ts(0); // template
    $c.ns(1,true,0,0); // div
    $c.ns(2,true,0,0); // span
    $c.t(3); // first
    $c.ne(2);
    $c.cs(4,false,["value",v+1],0); // bar
    $c.cs(5,false,["value",v+2],0); // bar
    $c.ns(6,true,0,0); // span
    $c.t(7); // last
    $c.ne(6);
    $c.ne(1);
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            [1, 1, "div", 0],
            [2, 1, "span", 0],
            [3, 3, "first"],
            [4, 15, "bar", 0],
            [5, 15, "bar", 0],
            [6, 1, "span", 0],
            [7, 3, "last"]
        ]);
    });

    it('should compile nodes with @name attributes', () => {
        let r = cpl`
            <template #foo v:number=123>
                <div>
                    <bar [value]=v+1>
                        <div @baz>hello</div>
                        <div @blah sth="argh"/>
                    </bar>
                </div>
            </template>
            
            <template #bar value baz>
                <span [title]=("Value: "+value)/>
            </template>
        `;

        expect(r.foo.templateFnContent).toEqual(`\
    v=(v!==undefined)?v:123;
    $c.ts(0); // template
    $c.ns(1,true,0,0); // div
    $c.cs(2,true,["value",v+1],0); // bar
    $c.as(3,true,0,0); // div@baz
    $c.t(4); // hello
    $c.ae(3);
    $c.as(5,false,0,0); // div@blah
    $c.ce(2);
    $c.ne(1);
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            [1, 1, "div", 0],
            [2, 15, "bar", 0],
            [3, 16, "baz", 0],
            [4, 3, "hello"],
            [5, 16, "blah", ['sth', 'argh']]
        ]);
    });

    it('should compile text and node insert', () => {
        let r = cpl`
            <template #foo msg="hello">
                <div>
                    {{msg}}
                </div>
            </template>
        `;

        expect(r.foo.templateFnContent).toEqual(`\
    msg=(msg!==undefined)?msg:"hello";
    $c.ts(0); // template
    $c.ns(1,true,0,0); // div
    $c.ins(2,msg);
    $c.ne(1);
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            [1, 1, "div", 0],
            0
        ]);
    });


    it('should compile function attributes', () => {
        let r = cpl`
            <template #foo msg="hello">
                <div>
                    <span onclick()=doSomething(msg)/>
                    <span foo=123+321 bar()={foo();baz()}/>
                    <span onswap()={ doThis(); doThat() }/>
                </div>
            </template>
        `;

        expect(r.foo.templateFnContent).toEqual(`\
    msg=(msg!==undefined)?msg:"hello";
    $c.ts(0); // template
    $c.ns(1,true,0,0); // div
    $c.ns(2,false,0,["onclick",function(){doSomething(msg)}]); // span
    $c.ns(3,false,0,["foo",123+321,"bar",function(){foo();baz()}]); // span
    $c.ns(4,false,0,["onswap",function(){doThis(); doThat()}]); // span
    $c.ne(1);
    $c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            0,
            [1, 1, "div", 0],
            [ 2, 1, "span", 0 ],
            [ 3, 1, "span", 0 ],
            [ 4, 1, "span", 0 ]
        ]);
    });

    it('should compile function attributes with parameters', () => {
        let r = cpl`
            <template #foo msg="hello">
                <div>
                    <span onclick(a )=doSomething(msg)/>
                    <span foo=123+321 bar(p1, p2)={foo();baz()}/>
                </div>
            </template>
        `;

        expect(r.foo.templateFnContent).toEqual(`\
    msg=(msg!==undefined)?msg:"hello";
    $c.ts(0); // template
    $c.ns(1,true,0,0); // div
    $c.ns(2,false,0,["onclick",function(a){doSomething(msg)}]); // span
    $c.ns(3,false,0,["foo",123+321,"bar",function(p1,p2){foo();baz()}]); // span
    $c.ne(1);
    $c.te(0);`);
    });


    // todo subtemplate or component call through <insert>
    // todo subtemplates with content nodes, and with @name nodes
    // todo event handlers
    // todo support $v
    // todo need for try catch in case of invalid expression?
    // todo raise error if template attributes are not a static values
    // todo raise error if attName is not used as child of a cpt or of another att node

});
