/**
 * NAC JS compiler tests
 * Copyright Bertrand Laporte 2016
 * Created on 22/04/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {parse} from '../src/iv/parser';
import {compile} from '../src/iv/nac2js';

describe('NAC compiler', () => {

    function cpl(strings, ...values) {
        var r = parse(strings, values);
        if (r.error) {
            throw `(${r.error.line}:${r.error.column}) ${r.error.description}`;
        }
        return compile(r.nac, true);
    }

    it('should compile an empty template', () => {
        var r = cpl`
            <template #foo>
            </template>
        `;
        expect(r.foo.templateId).toBe("foo");
        expect(r.foo.templateFnContent).toEqual(`\
$c.ts(0); // template
$c.te(0);`);
        expect(r.foo.templateStatics).toEqual([
            [0]
        ]);
    });

    it('should properly identify template arguments', () => {
        var r = cpl`
            <template #foo arg1:string="bar" arg2 arg3:number arg4=123>
            </template>
        `;
        expect(r.foo.templateArgs).toEqual(["arg1","arg2","arg3","arg4"]);
        expect(r.foo.templateArgIdx["arg1"]).toBe(0);
        expect(r.foo.templateArgIdx["arg2"]).toBe(1);
        expect(r.foo.templateArgIdx["arg3"]).toBe(2);
        expect(r.foo.templateArgIdx["arg4"]).toBe(3);
    });

    it('should compile element nodes', () => {
        var r = cpl`
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
            [0],
            [1, 1, "div", ["class", "main"]],
            [2, 1, "span", ["ok", true]],
            [3, 1, "input", ["type", "text"]],
            [4, 1, "br", 0]
        ]);
    });

    it('should compile text nodes', () => {
        var r = cpl`
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
            [0],
            [1, 3, ` Hello World `],
            [2, 1, "div", 0],
            [3, 3, ` Here
                    and here `],
            [4, 1, "span", 0],
            [5, 3, ` and here as well `],
            [6, 3, ` Done ! `]
        ]);
    });

    it('should compile comment nodes', () => {
        var r = cpl`
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
            [0],
            [1, 3, ` Hello World `],
            [2, 1, "div", 0],
        ]);
    });

    it('should compile js expressions', () => {
        var r = cpl`
            <template #foo bar:number=123>
                % var x = 1;
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
var x = 1;
$c.ns(1,true,0,0); // div
x = 2+bar;
$c.ne(1);
$c.ns(2,false,0,0); // br
x = 3;
$c.te(0);`);

        expect(r.foo.templateStatics).toEqual([
            [0],
            [1, 1, "div", ["class", "main"]],
            [2, 1, "br", 0]
        ]);
    });

    it('should compile simple js blocks', () => {
        var r = cpl`
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
            [0],
            [1],
            [2, 1, "div", ["class", "main"]],
            [3],
            [4, 1, "span", ["title", "ok"]],
            [5, 1, "br", 0]
        ]);
    });

    it('should compile complex js blocks', () => {
        var r = cpl`
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
            [0],
            [1],
            [2, 1, "div", ["class", "main"]],
            [3],
            [4, 1, "div", ["class", "main2"]],
            [5],
            [6, 1, "div", ["class", "main3"]]
        ]);
    });

    it('should load the template function', () => {
        var r = cpl`
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

        var c = {
            logs:[],
            ts: function (idx) {
                this.logs.push("ts"+idx+";");
            },
            te: function (idx) {
                this.logs.push("te"+idx+";");
            },
            ns: function (idx,b,dynAtts) {
                dynAtts=(dynAtts!==0)? dynAtts.join(":") : 0;
                this.logs.push("ns"+idx+dynAtts+";");
            },
            bs: function (idx) {
                this.logs.push("bs"+idx+";");
            },
            ne: function (idx) {
                this.logs.push("ne"+idx+";");
            },
            be: function (idx) {
                this.logs.push("be"+idx+";");
            }
        };
        r.foo.templateFn(c,42);
        expect(c.logs.join("")).toEqual("ts0;bs5;ns60;be5;te0;");
        c.logs=[];
        r.foo.templateFn(c);
        expect(c.logs.join("")).toEqual("ts0;bs1;ns20;be1;te0;");
        c.logs=[];
        r.foo.templateFn(c,2);
        expect(c.logs.join("")).toEqual("ts0;bs3;ns4title:5;be3;te0;");
    });

    // todo support indentation - ease debugging
    // todo event handlers
    // todo support $v
    // todo need for try catch in case of invalid expression?
    // todo raise error if template attributes are not a static values

});
