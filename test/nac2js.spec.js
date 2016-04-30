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
$c.n(0,0,0); // template
$c.e(0);`);
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
        expect(r.foo.templateArgsIdx["arg1"]).toBe(0);
        expect(r.foo.templateArgsIdx["arg2"]).toBe(1);
        expect(r.foo.templateArgsIdx["arg3"]).toBe(2);
        expect(r.foo.templateArgsIdx["arg4"]).toBe(3);
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
$c.n(0,0,0); // template
$c.n(1,0,0); // div
$c.n(2,["title",bar+3],["foo",123+456]); // span
$c.e(2);
$c.n(3,["value",bar],0); // input
$c.e(3);
$c.e(1);
$c.n(4,0,0); // br
$c.e(4);
$c.e(0);`);

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
$c.n(0,0,0); // template
$c.t(1); // Hello World 
$c.n(2,0,0); // div
$c.t(3); // Here            (...)
$c.n(4,0,0); // span
$c.t(5); // and here as well(...)
$c.e(4);
$c.e(2);
$c.t(6); // Done ! 
$c.e(0);`);

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
$c.n(0,0,0); // template
var x = 1;
$c.n(1,0,0); // div
x = 2+bar;
$c.e(1);
$c.n(2,0,0); // br
$c.e(2);
x = 3;
$c.e(0);`);

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
$c.n(0,0,0); // template
if (bar % 2) {
$c.b(1);
$c.n(2,0,0); // div
if (bar === 3) {
$c.b(3);
$c.n(4,0,0); // span
$c.e(4);
$c.e(3);
}
$c.e(2);
$c.n(5,0,0); // br
$c.e(5);
$c.e(1);
}
$c.e(0);`);

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
$c.n(0,0,0); // template
if (bar % 2) {
$c.b(1);
$c.n(2,0,0); // div
$c.e(2);
$c.e(1);
}
else if (bar % 3) {
$c.b(3);
$c.n(4,0,0); // div
$c.e(4);
$c.e(3);
}
else {
$c.b(5);
$c.n(6,0,0); // div
$c.e(6);
$c.e(5);
}
$c.e(0);`);

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
            n: function (idx,dynAtts) {
                dynAtts=(dynAtts!==0)? dynAtts.join(":") : 0;
                this.logs.push("n"+idx+dynAtts+";");
            },
            b: function (idx) {
                this.logs.push("b"+idx+";");
            },
            e: function (idx) {
                this.logs.push("e"+idx+";");
            }
        }
        r.foo.templateFn(c,42);
        expect(c.logs.join("")).toEqual("n00;b5;n60;e6;e5;e0;");
        c.logs=[];
        r.foo.templateFn(c);
        expect(c.logs.join("")).toEqual("n00;b1;n20;e2;e1;e0;");
        c.logs=[];
        r.foo.templateFn(c,2);
        expect(c.logs.join("")).toEqual("n00;b3;n4title:5;e4;e3;e0;");
    });

    // todo support indentation - ease debugging
    // todo event handlers
    // todo support $v
    // todo need for try catch in case of invalid expression?

});
