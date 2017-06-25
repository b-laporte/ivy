/**
 * NAC library test file
 */

import { expect } from "./common";
import { n, NacNode, NacNodeType } from '../compiler/nac';

describe('Nac nodes', () => {
    var consoleOutput = "";

    beforeEach(function () {
        NacNode.logger = {
            error: (msg) => {
                consoleOutput += (consoleOutput === "") ? msg : "\n" + msg;
            }
        }
    });

    afterEach(function () {
        expect(consoleOutput).toEqual("");
        NacNode.logger = NacNode.defaultLogger;
    });

    it('should create a simple node', function () {
        var nd = n("div");
        expect(nd.nodeName).toEqual("div");
    });

    it('should create a node chain', function () {
        var nd = n("div")
            .n("foo")
            .n("bar");
        expect(nd.nodeName).toEqual("bar");
        expect(nd.firstSibling.nodeName).toEqual("div");
        expect(nd.firstSibling.nextSibling.nodeName).toEqual("foo");
        expect(nd.firstSibling.nextSibling.nextSibling).toEqual(nd);
    });

    it('should insert a node in a chain', function () {
        var nd = n("div").n("foo");
        nd.n("bar");
        nd.n("bar2");
        var n1 = nd.firstSibling;

        expect(n1.nodeName).toEqual("div");
        expect(n1.nextSibling.nodeName).toEqual("foo");
        expect(n1.nextSibling.nextSibling.nodeName).toEqual("bar2");
        expect(n1.nextSibling.nextSibling.nextSibling.nodeName).toEqual("bar");
        expect(n1.nextSibling.nextSibling.nextSibling.nextSibling).toEqual(undefined);
        expect(n1.nextSibling.nextSibling.nextSibling.firstSibling).toEqual(n1);
    });

    it('should add attributes to a node', function () {
        var nd = n("div");
        expect(nd.attributes()).toEqual(null);

        nd = nd.a({"foo": 1, "bar": "hello"});
        var na = nd.attributes();
        expect(na.name).toEqual("foo");
        expect(na.value).toEqual(1);
        expect(na.nextSibling.name).toEqual("bar");
        expect(na.nextSibling.value).toEqual("hello");
        expect(na.nextSibling.nextSibling).toEqual(undefined);

        var x = {foo: 123};
        nd.a({"third": x});
        expect(na.nextSibling.name).toEqual("bar");
        expect(na.nextSibling.nextSibling.name).toEqual("third");
        expect(na.nextSibling.nextSibling.value).toEqual(x);
        expect(na.nextSibling.nextSibling.nextSibling).toEqual(undefined);
    });

    it('should create child nodes', function () {
        var nd = n("div");
        expect(nd.childNodes()).toEqual(null);

        nd.c(
            n("first")
                .n("second")
                .n("third")
        );
        var cn = nd.childNodes();
        expect(cn.nodeName).toEqual("first");
        expect(cn.nextSibling.nodeName).toEqual("second");
        expect(cn.nextSibling.nextSibling.nodeName).toEqual("third");
        expect(cn.nextSibling.nextSibling.nextSibling).toEqual(undefined);
        expect(cn.firstSibling).toEqual(cn);
        expect(cn.nextSibling.firstSibling).toEqual(cn);
        expect(cn.nextSibling.nextSibling.firstSibling).toEqual(cn);

        nd.c(
            n("fourth")
        ).c(
            n("fifth")
        );
        expect(cn.nodeName).toEqual("first");
        expect(cn.nextSibling.nodeName).toEqual("second");
        expect(cn.nextSibling.nextSibling.nodeName).toEqual("third");
        expect(cn.nextSibling.nextSibling.nextSibling.nodeName).toEqual("fourth");
        expect(cn.nextSibling.nextSibling.nextSibling.nextSibling.nodeName).toEqual("fifth");
        expect(cn.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling).toEqual(undefined);
        expect(cn.nextSibling.nextSibling.nextSibling.firstSibling).toEqual(cn);
    });

    it('should create child nodes through function arguments', function () {
        var nd = n("div");
        expect(nd.childNodes()).toEqual(null);

        nd.c(
            n("first"),
            n("second"),
            n("third")
        );
        var cn = nd.childNodes();
        expect(cn.nodeName).toEqual("first");
        expect(cn.nextSibling.nodeName).toEqual("second");
        expect(cn.nextSibling.nextSibling.nodeName).toEqual("third");
        expect(cn.nextSibling.nextSibling.nextSibling).toEqual(undefined);
        expect(cn.firstSibling).toEqual(cn);
        expect(cn.nextSibling.firstSibling).toEqual(cn);
        expect(cn.nextSibling.nextSibling.firstSibling).toEqual(cn);

        nd.c(
            n("fourth"),
            n("fifth")
        );
        expect(cn.nodeName).toEqual("first");
        expect(cn.nextSibling.nodeName).toEqual("second");
        expect(cn.nextSibling.nextSibling.nodeName).toEqual("third");
        expect(cn.nextSibling.nextSibling.nextSibling.nodeName).toEqual("fourth");
        expect(cn.nextSibling.nextSibling.nextSibling.nextSibling.nodeName).toEqual("fifth");
        expect(cn.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling).toEqual(undefined);
        expect(cn.nextSibling.nextSibling.nextSibling.firstSibling).toEqual(cn);
    });

    it('should support #text nodes', function () {
        var nd = n("#text", "hello world!")
            .n("#text", "some more text")
            .firstSibling;

        expect(nd.nodeType).toEqual(NacNodeType.TEXT);
        expect(nd.nodeValue).toEqual("hello world!");
        expect(nd.nextSibling.nodeType).toEqual(NacNodeType.TEXT);
        expect(nd.nextSibling.nodeValue).toEqual("some more text");
    });

    it('should support #js expression nodes', function () {
        var nd = n("#js", "let foo = 3;")
            .n("#js", "foo++;")
            .firstSibling;

        expect(nd.nodeType).toEqual(NacNodeType.JS_EXPRESSION);
        expect(nd.nodeValue).toEqual("let foo = 3;");
        expect(nd.nextSibling.nodeType).toEqual(NacNodeType.JS_EXPRESSION);
        expect(nd.nextSibling.nodeValue).toEqual("foo++;");
    });

    it('should support #comment nodes', function () {
        var nd = n("#comment", "comment 1")
            .n("#comment", "comment 2")
            .firstSibling;

        expect(nd.nodeType).toEqual(NacNodeType.COMMENT);
        expect(nd.nodeValue).toEqual("comment 1");
        expect(nd.nextSibling.nodeType).toEqual(NacNodeType.COMMENT);
        expect(nd.nextSibling.nodeValue).toEqual("comment 2");
    });

    it('should support #insert nodes', function () {
        var nd = n("#insert", "foo.bar")
            .n("#insert", "bar.baz")
            .firstSibling;

        expect(nd.nodeType).toEqual(NacNodeType.INSERT);
        expect(nd.nodeValue).toEqual("foo.bar");
        expect(nd.nextSibling.nodeType).toEqual(NacNodeType.INSERT);
        expect(nd.nextSibling.nodeValue).toEqual("bar.baz");
    });

    it("should log an error in case of invalid node type", function () {
        var nd = n("#foo", "blah");
        expect(consoleOutput).toEqual("Invalid node type: #foo");
        expect(nd.nodeValue).toEqual("#error - invalid type: #foo");
        expect(nd.nodeType).toEqual(NacNodeType.ELEMENT);
        consoleOutput = "";
    });

    it("should log an error when child nodes are created outside element and js blocks", function () {
        n("div").c(
            n("#text", "foo").c(
                n("#text", "bar")
            )
        );

        expect(consoleOutput).toEqual("Child nodes are not authorized in nodes of type 3");
        consoleOutput = "";

        n("div").c(
            n("#comment", "foo").c(
                n("#text", "bar")
            )
        );

        expect(consoleOutput).toEqual("Child nodes are not authorized in nodes of type 8");
        consoleOutput = "";

        n("#jsblock", "if (foo) {").c(
            n("#insert", "foo").c(
                n("#text", "bar")
            )
        );

        expect(consoleOutput).toEqual("Child nodes are not authorized in nodes of type 12");
        consoleOutput = "";

        n("#jsblock", "if (foo) {").c(
            n("#js", "foo = 3;").c(
                n("#text", "bar")
            )
        );

        expect(consoleOutput).toEqual("Child nodes are not authorized in nodes of type 13");
        consoleOutput = "";
    });

    it("should generate debug info with toString()", () => {
        var nd = n("div").a({"att1": 1, "att2": "2"}).c(
            n("#text", "foo")
        );

        expect(nd.toString("           ")).toEqual(`\
           <div att1=1 att2="2">
               <#text "foo"/>
           </div>`
        );

        nd = n("div").c(
            n("#text", "foo"),
            n("div").c(
                n("#text", "bar"),
                n("#group").a({"id": "zzz"}).c(
                    n("#text", "baz")
                )
            )
        );
        expect(nd.toString("           ")).toEqual(`\
           <div>
               <#text "foo"/>
               <div>
                   <#text "bar"/>
                   <#group id="zzz">
                       <#text "baz"/>
                   </#group>
               </div>
           </div>`
        );
    });
});
