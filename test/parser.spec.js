/**
 * IV Parser library test file
 * Created by b-laporte on 02/04/16.
 * Copyright Bertrand Laporte 2016
 */

/* global describe, it, beforeEach, afterEach, expect */

import {n, NacAttributeNature} from '../src/iv/nac';
import {parse} from '../src/iv/parser';
import {compare} from './utils';

describe('IV parser', () => {

    function nac(strings, ...values) {
        let r = parse(strings, values);
        if (r.error) {
            throw `(${r.error.lineNbr}:${r.error.columnNbr}) ${r.error.description}`;
        }
        return r.nac;
    }

    function error(strings, ...values) {
        let r = parse(strings, values);
        return (r.error) ? `(${r.error.lineNbr}:${r.error.columnNbr}) ${r.error.description}` : "[expected error not found]";
    }

    it('should parse an empty string', () => {
        expect(nac``).toBe(null);
    });

    it('should parse a blank string', () => {
        expect(nac`
           \n\t
        `).toBe(null);
    });

    it('should raise an error for unexpected char in start or end nodes', () => {
        expect(error`
          <div <></div>
        `).toBe("(2:16) Unexpected '<' was found instead of '>'");

        expect(error`
          <div>   </di<v>
        `).toBe("(2:23) Unexpected '<' was found instead of '>'");
    });

    it('should raise an error for invalid node names', () => {
        expect(error`
          <Hello/>
          <2div/>
        `).toBe("(3:12) Invalid character in node name: '2'");

        expect(error`
          <Hello> </Helloo>
        `).toBe("(2:21) End element 'Helloo' doesn't match start element name");
    });

    it('should raise an error for an unexpected end of file', () => {
        expect(error`
          <Hello>
        `).toBe("(3:9) Unexpected end of package: < expected instead");
    });

    it('should parse a simple node', () => {
        let nc = nac`
            <div></div>
            <Hello/>
            <$yes/>
        `;
        expect(compare(nc, n("div").n("Hello").n("$yes"))).toEqual('');
        expect(nc.nodeNameSpace).toBe(undefined);
    });

    it('should parse a simple node with namespace', () => {
        let nc = nac`
            <foo:div> </foo:div>
            <Hello/>
            <$yes/>
        `;
        expect(compare(nc, n("div").n("Hello").n("$yes"))).toEqual('');
        expect(nc.nodeNameSpace).toBe("foo");

        nc = nac`
            <:div> </:div>
            <Hello/>
            <$yes/>
        `;
        expect(compare(nc, n("div").n("Hello").n("$yes"))).toEqual('');
        expect(nc.nodeNameSpace).toBe("");
    });

    it('should raise an error for invalid end prefix', () => {
        expect(error`
          <foo:bar> blah </fo:bar>
        `).toBe("(2:34) End element namespace 'fo' doesn't match start element namespace");
    });

    it('should parse nested nodes', () => {
        expect(compare(nac`
            <div>
                <span></span>
                <section></section>
            </div>
            <foo/>
        `, n("div").c(
            n("span").n("section")
            ).n("foo")
        )).toEqual('');
    });

    it('should raise an error for non-node entities at root level', () => {
        expect(error`
          <Hello/>
          bar
          <div/>
        `).toBe("(3:11) Invalid root-level character: 'b'");
    });

    it('should parse text nodes', () => {
        expect(compare(nac`
            <div>   
                foo
                <span>bar</span>
                baz
            </div>
        `, n("div").c(
            n("#text", " foo "),
            n("span").c(n("#text", "bar")),
            n("#text", " baz ")
            )
        )).toEqual('');
    });

    it('should support escape for { < / and % in text nodes', () => {
        expect(compare(nac`
            <div>   
                foo \\{{ and \\% and \\// and \\<\\/ and \\\\ bar 
            </div>
        `, n("div").c(
            n("#text", " foo {{ and % and // and </ and \\ bar ")
            )
        )).toEqual('');
    });

    it('should parse insert nodes', () => {
        expect(compare(nac`
            <div>   
                foo {{foo.bar + f( x=> { return x+42 })}}
                <span>{{}}{{  }}</span>
                {{baz}}
            </div>
        `, n("div").c(
            n("#text", " foo "),
            n("#insert", "foo.bar + f( x=> { return x+42 })"),
            n("span"),
            n("#insert", "baz")
            )
        )).toEqual('');
    });

    it('should raise an error for an unexpected end of file in insert node', () => {
        expect(error`
          <div> {{foo.bar`).toBe("(2:26) Unexpected end of package: } expected instead");
    });

    it('should parse js expressions', () => {
        expect(compare(nac`
            <div>   
                % var x = 2;
                %        
                <span>
                    % x = 3;
                </span>
            </div>
        `, n("div").c(
            n("#js", " var x = 2;"),
            n("span").c(
                n("#js", " x = 3;")
            ))
        )).toEqual('');
    });

    it('should parse simple js blocks', () => {
        expect(compare(nac`
            <div>   
                % if (foo) {  
                <span>
                    blah
                    % if (bar) { 
                        baz
                    % }
                </span>
                % }
            </div>
        `, n("div").c(
            n("#jsblock", " if (foo) {  ", " }").c(
                n("span").c(
                    n("#text", " blah "),
                    n("#jsblock", " if (bar) { ", " }").c(
                        n("#text", " baz "),
                    )
                )
            ))
        )).toEqual('');
    });

    it('should raise an error for invalid js block nesting', () => {
        expect(error`
          <div>
            % if (foo) {
            <span>
                % }
            </span>
          </div>
        `).toBe("(6:13) End of 'span' node is incompatible with JS block structure");
    });

    it('should raise an error for missing js block end', () => {
        expect(error`
          <div>
            % if (foo) {
            <span></span>
          </div>
        `).toBe("(5:11) End of 'div' node is incompatible with JS block structure");
    });

    it('should raise an error for missing js block start', () => {
        expect(error`
          <div>
            % }
            <span></span>
          </div>
        `).toBe("(3:13) Unexpected end of JS block");
    });

    it('should parse complex js blocks', () => {
        expect(compare(nac`
            <div>   
                % if (foo) {
                    content1
                % } else if (bar) {
                    content2
                % x=2;} else {
                    content3
                % } 
            </div>
        `, n("div").c(
            n("#jsblock", " if (foo) {", " }").c(
                n("#text", " content1 ")
            ),
            n("#jsblock", " else if (bar) {", " x=2;}").c(
                n("#text", " content2 ")
            ),
            n("#jsblock", " else {", " } ").c(
                n("#text", " content3 ")
            )
            )
        )).toEqual('');
    });

    it('should parse comment blocks', () => {
        expect(compare(nac`
            // comment 0 
            <div>   
                // comment 1 
                <span>
                    blah // comment 2
                    baz
                </span>
            </div>
            
            // comment 3 
        `, n("#comment", " comment 0 ").n("div").c(
            n("#comment", " comment 1 "),
            n("span").c(
                n("#text", " blah "),
                n("#comment", " comment 2"),
                n("#text", " baz ")
            )).n("#comment", " comment 3 ")
        )).toEqual('');
    });

    it('should parse multi-line comment blocks', () => {
        expect(compare(nac`
            /* comment 0 */
            <div>   
                /**
                 *  comment 1 
                 **/
                <span>
                    blah 
                    \\/*
                      not a comment
                    */
                    baz
                </span>
            </div>
            /*
             comment 2 */
        `, n("#commentML", " comment 0 ").n("div").c(
            n("#commentML", `*
                 *  comment 1 
                 *`),
            n("span").c(
                n("#text", ` blah 
                    /*
                      not a comment
                    */
                    baz `)
            )).n("#commentML", `
             comment 2 `)
        )).toEqual('');
    });

    it('should shift error line numbers when multi-line comments are used before', () => {
        expect(error`
          /*
           A comment
          */
          <div <></div>
        `).toBe("(5:16) Unexpected '<' was found instead of '>'");
    });

    it('should parse no-value attributes', () => {
        expect(compare(nac`
            <div #foo bar  baz> blah </div>
        `, n("div").a({
            "id": '"foo"',
            "bar": undefined,
            "baz": undefined
        }).c(
            n("#text", " blah ")
        ))).toEqual('');

        expect(compare(nac`
            <div @foo      
            bar     > blah </div>
        `, n("div").a({
            "@name": '"foo"',
            "bar": undefined
        }).c(
            n("#text", " blah ")
        ))).toEqual('');
    });

    it('should parse attributes with values', () => {
        expect(compare(nac`
            <div foo="b a r" bar = 123+4 baz =   ( 1 + (2 + 3)) boo = 'b l  a   h' bah = c.getSomething(3 + x)> blah </div>
        `, n("div").a({
            "foo": '"b a r"',
            "bar": "123+4",
            "baz": "( 1 + (2 + 3))",
            "boo": "'b l  a   h'",
            "bah": "c.getSomething(3 + x)"
        }).c(
            n("#text", " blah ")
        ))).toEqual('');
    });

    it('should raise an error for invalid attribute values', () => {
        expect(error`
          <div foo = " rewr wrew> Hello </div>
          <span> bar </span>
        `).toBe("(3:0) Unexpected '\\n' was found instead of '\"'");

        expect(error`
          <div foo = 123+4> Hello </div>
          <br bar = a+b+c/>
          <span baz = (rew (rwe) + rwe> bar </span>
        `).toBe("(4:23) Missing closing paren in this expression");

        expect(error`
            <div foo = 1 + 23 />
        `).toBe("(2:26) Unexpected '+' was found instead of '>'");

        expect(error`
            <div foo = 1+func(3 + g(43) +)) />
        `).toBe("(2:43) Unexpected closing paren");
    });

    it('should parse bound and function attributes', () => {
        expect(compare(nac`
            <div [foo]=c.getValue() [[bar]]=c.attName onclick()=c.doSomething($event,123) > blah </div>
        `, n("div")
            .addAttribute("foo", "c.getValue()", NacAttributeNature.BOUND1WAY)
            .addAttribute("bar", "c.attName", NacAttributeNature.BOUND2WAYS)
            .addAttribute("onclick", "c.doSomething($event,123)", NacAttributeNature.DEFERRED_EXPRESSION)
            .c(
                n("#text", " blah ")
            ))).toEqual('');
    });

    it('should parse function attributes with parameters', () => {
        expect(compare(nac`
            <div onclick1(param1)=c.doSomething(param1)
                 onclick2( $param2 )=c.doSomething($param2)
                 onclick3( p1, p2,p3)=c.doSomething(p1+p2+p3)
            > blah </div>
        `, n("div") // todo test param1
            .addAttribute("onclick1", "c.doSomething(param1)", NacAttributeNature.DEFERRED_EXPRESSION, null, ["param1"])
            .addAttribute("onclick2", "c.doSomething($param2)", NacAttributeNature.DEFERRED_EXPRESSION, null, ["$param2"])
            .addAttribute("onclick3", "c.doSomething(p1+p2+p3)", NacAttributeNature.DEFERRED_EXPRESSION, null, ["p1", "p2", "p3"])
            .c(
                n("#text", " blah ")
            ))).toEqual('');
    });

    it('should parse function attributes with surrounding parens and spaces', () => {
        expect(compare(nac`
            <div onclick()={ doThis(); return 123 } > blah </div>
        `, n("div")
            .addAttribute("onclick", "doThis(); return 123", NacAttributeNature.DEFERRED_EXPRESSION)
            .c(
                n("#text", " blah ")
            ))).toEqual('');
    });

    it('should raise an error for invalid binding on function attributes', () => {
        expect(error`
          <div [onclick()]=foo()> x </div>
        `).toBe("(2:16) Function attributes cannot be bound");
    });

    it('should parse attributes with mixed parens and curly brackets', () => {
        expect(compare(nac`
            <div foo = doThis({a:123, b : 444}) baz = { aa:1, bb:(2) }> blah </div>
        `, n("div")
            .addAttribute("foo", "doThis({a:123, b : 444})", NacAttributeNature.STANDARD)
            .addAttribute("baz", "{ aa:1, bb:(2) }", NacAttributeNature.STANDARD)
            .c(
                n("#text", " blah ")
            ))).toEqual('');
    });

    it('should parse attribute types', () => {
        expect(compare(nac`
            <div foo:number=123 bar:string> blah </div>
        `, n("div")
            .addAttribute("foo", "123", null, "number")
            .addAttribute("bar", undefined, null, "string")
            .c(
                n("#text", " blah ")
            )
        )).toEqual('');
    });

    it('should raise an error for empty attribute types', () => {
        expect(error`
          <div foo:string="" bar:="2"> Hello </div>
        `).toBe("(2:34) Attribute type cannot be empty");
    });

    it('should raise an error for empty attribute names that use special modifiers', () => {
        expect(error`
          <div #  bar="2"> Hello </div>
        `).toBe("(2:17) Attribute name cannot be empty");

        expect(error`
          <div @  bar="2"> Hello </div>
        `).toBe("(2:17) Attribute name cannot be empty");

        expect(error`
          <div [  bar="2"> Hello </div>
        `).toBe("(2:17) Attribute name cannot be empty");

        expect(error`
          <div []  bar="2"> Hello </div>
        `).toBe("(2:17) Attribute name cannot be empty");

        expect(error`
          <div (  bar="2"> Hello </div>
        `).toBe("(2:16) Unexpected '(' was found instead of '>'");

        expect(error`
          <div ()  bar="2"> Hello </div>
        `).toBe("(2:16) Unexpected '(' was found instead of '>'");
    });

    it('should raise an error for no-value attributes used with modifiers', () => {
        expect(error`
          <div [foo] > Hello </div>
        `).toBe("(2:22) Attribute value is mandatory for bound attributes and deferred expressions");

        expect(error`
          <div foo()  > Hello </div>
        `).toBe("(2:23) Attribute value is mandatory for bound attributes and deferred expressions");

        expect(error`
          <div [[foo]] > Hello </div>
        `).toBe("(2:24) Attribute value is mandatory for bound attributes and deferred expressions");
    });

    it('should raise an error in case of duplicate attributes', () => {
        expect(error`
          <div #foo #bar > Hello </div>
        `).toBe("(2:25) Duplicate attribute: 'id'");

        expect(error`
          <div @foo @bar > Hello </div>
        `).toBe("(2:25) Duplicate attribute: '@name'");

        expect(error`
          <div foo [foo]="bar" > Hello </div>
        `).toBe("(2:24) Duplicate attribute: 'foo'");

        let foo = 1, bar = 2;
        expect(error`
          <div ${foo} ${bar} > Hello </div>
        `).toBe("(2:-1) Duplicate attribute: '@default'");
    });

    it('should support ${expression} in attribute values', () => {
        let text2 = "text2";
        expect(compare(nac`
            <div foo=${123} bar=c.attName baz="text ${text2}" blah=c.getSomething(1,${text2}) foo2='${text2}'> blah </div>
        `, n("div")
            .addAttribute("foo", "$v[0]")
            .addAttribute("bar", "c.attName")
            .addAttribute("baz", '"text "+$v[1]+""')
            .addAttribute("blah", "c.getSomething(1,$v[2])")
            .addAttribute("foo2", "''+$v[3]+''")
            .c(
                n("#text", " blah ")
            ))).toEqual('');
    });

    it('should support ${expression} in text nodes', () => {
        let bar = "BAR";
        expect(compare(nac`
            <div> foo ${bar} baz </div>
        `, n("div").c(
            n("#text", " foo BAR baz ")
        ))).toEqual('');
    });

    it('should support ${expression} in js expressions', () => {
        let bar = "BAR";
        expect(compare(nac`
            <div>   
                % var x = ${bar};
                %        
                <span>
                    % x += 'BAZ';
                </span>
            </div>
        `, n("div").c(
            n("#js", " var x = $v[0];"),
            n("span").c(
                n("#js", " x += 'BAZ';")
            ))
        )).toEqual('');
    });

    it('should support ${expression} in js blocks', () => {
        let foo = true, bar = false, baz = 123;
        expect(compare(nac`
            <div>   
                % if (${foo}) {
                    content1
                % } else if (${bar}) {
                    content2
                % x=${baz};} else {
                    content3
                % } 
            </div>
        `, n("div").c(
            n("#jsblock", " if ($v[0]) {", " }").c(
                n("#text", " content1 ")
            ),
            n("#jsblock", " else if ($v[1]) {", " x=$v[2];}").c(
                n("#text", " content2 ")
            ),
            n("#jsblock", " else {", " } ").c(
                n("#text", " content3 ")
            )
            )
        )).toEqual('');
    });

    it('should support ${expression} in insert nodes', () => {
        let foo = 42, bar = "hello";
        expect(compare(nac`
            <div>   
                foo {{foo[${bar}] + f( x=> { return x+${foo} })}}
            </div>
        `, n("div").c(
            n("#text", " foo "),
            n("#insert", "foo[$v[0]] + f( x=> { return x+$v[1] })")
            )
        )).toEqual('');
    });

    it('should support ${expression} in comment blocks', () => {
        let foo = 42, bar = "hello";
        expect(compare(nac`
            // comment ${foo}
            <div> // comment ${bar} 
            </div>
        `, n("#comment", " comment 42").n("div").c(
            n("#comment", " comment hello ")
        ))).toEqual('');
    });

    it('should support ${expression} as single attribute', () => {
        let bar = 42;
        expect(compare(nac`
            <div foo=123 ${bar}> blah </div>
            <div ${bar}/>
        `, n("div")
            .addAttribute("foo", "123")
            .addAttribute("@default", "$v[0]")
            .c(
                n("#text", " blah ")
            )
            .n("div")
            .addAttribute("@default", "$v[1]")
        )).toEqual('');
    });

    it('should support ${expression} in attribute types', () => {
        let obj = Object;
        expect(compare(nac`
            <div foo:${obj}={foo:"bar"} > blah </div>
        `, n("div")
            .addAttribute("foo", '{foo:"bar"}', 0, "$v[0]")
            .c(
                n("#text", " blah ")
            )
        )).toEqual('');
    });


    // TODO script at root level
    // todo accept spaces for JSON or Array attribute values - e.g. {a:"a", b:"b"} or [123, 456]
    // todo support '.' in attribute names - e.g. [style.color] = myvar -> support JSON attributes?
    // todo check that id and @name cannot be bound
});
