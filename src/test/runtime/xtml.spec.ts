import * as assert from 'assert';
import { createXtmlFragment, addElement, addText, XtmlFragment, addParam, addDecorator, addLabel, addComponent, addParamNode } from '../../iv/xtml-ast'
import { parse } from '../../iv/xtml-parser';

describe('XTML', () => {
    const shift = '                ';

    function str(xf: XtmlFragment) {
        let s = xf.toString();
        return s.replace(/\n/g, "\n" + shift);
    }

    describe('Tree', () => {
        it("should support element and text nodes", function () {
            let xf = createXtmlFragment(),
                e1 = addElement(xf, "div"),
                e2 = addElement(e1, "span");
            addText(e2, " AAA ");
            e2 = addElement(e1, "span");
            addText(e2, " BBB ");
            e1 = addElement(xf, "section");
            addText(e1, "Some 'text' in the section");
            addText(xf, "Some text at the end");

            assert.equal(str(xf), `
                <div>
                  <span> AAA </span>
                  <span> BBB </span>
                </>
                <section>Some 'text' in the section</section>
                Some text at the end
                `, "1");
        });

        it("should support attributes, properties, decorators and labels", function () {
            let xf = createXtmlFragment(),
                e1 = addElement(xf, "div"),
                e2 = addElement(e1, "input");

            addParam(e1, "title", "some 'title'");
            addParam(e1, "className", "main", true);
            addParam(e1, "type", "text");
            addParam(e2, "class", xf.ref("mainClass"));
            addParam(e2, "disabled");
            addParam(e2, "maxLength", 123, true);

            e2 = addElement(e1, "span");
            addDecorator(e2, xf.ref("foo"));
            addDecorator(e2, xf.ref("bar"), false);
            addDecorator(e2, xf.ref("baz"), xf.ref("decoRef"));
            addLabel(e2, "lblA");
            addLabel(e2, "lblB", "someLabel");
            addLabel(e2, "lblC", xf.ref("lblRef"));

            e2 = addElement(e1, "div");
            let d = addDecorator(e2, xf.ref("deco"));
            addParam(d, "p1", "text");
            addParam(d, "p2", xf.ref("p2Ref"));
            addParam(d, "p3");
            addLabel(d, "xyz");
            addDecorator(d, xf.ref("foo"));

            assert.equal(str(xf), `
                <div title='some \\'title\\'' [className]='main' type='text'>
                  <input class={mainClass} disabled [maxLength]=123/>
                  <span @foo @bar=false @baz={decoRef} #lblA #lblB='someLabel' #lblC={lblRef}/>
                  <div @deco(p1='text' p2={p2Ref} p3 #xyz @foo)/>
                </>
                `, "1");
        });

        it("should support components and param nodes", function () {
            let xf = createXtmlFragment(),
                e1 = addElement(xf, "div");

            let e2 = addComponent(e1, xf.ref("cpt"));
            addParam(e2, "p1", "someValue");
            addLabel(e2, "lbl");
            let e3 = addParamNode(e2, "header");
            addText(e3, " Header ");
            e3 = addParamNode(e2, "footer");
            addDecorator(e3, xf.ref("deco"));
            addParam(e3, "mode", xf.ref("displayMode"));
            let e4 = addElement(e3, "div");
            addText(e4, " Footer ");
            addText(e2, "Content");

            assert.equal(str(xf), `
                <div>
                  <*cpt p1='someValue' #lbl>
                    <.header> Header </.header>
                    <.footer @deco mode={displayMode}>
                      <div> Footer </div>
                    </>
                    Content
                  </>
                </>
                `, "1");
        });
    });

    describe('Parser', () => {
        it("should parse simple text nodes", function () {
            assert.equal(str(parse('Hello  World\n(!)')), `
                Hello  World
                (!)
                `, "1")

            // test \n and \ (non breaking space): note str adds some spaces at the beginning of each line
            // which results in a strange display
            assert.equal(str(parse(`\
                \\                     Special chars\\nNew line

                \\ 
                `)), `
                                       Special chars
                nNew line
                
                                  
                `, "2")
        });

        it("should parse elements", function () {
            assert.equal(str(parse(`
                <div>
                    <span> Hello World     </span>
                    <*foo>ABC DEF    G</*foo>

                    <*bar>
                        <.header  />
                        Hello again
                    </>
                </>
            `)), `
                <div>
                  <span> Hello World </span>
                  <*foo>ABC DEF    G</*foo>
                  <*bar>
                    <.header/>
                     Hello again 
                  </>
                </>
                `, "1")
        });

        it("should parse params, decorators and labels", function () {
            assert.equal(str(parse(`
                <div foo="bar" disabled baz='abc'>
                    <span baz='a b \\'c\\' d' x=true   
                        y  =  false/>
                    <span #foo   #bar = 'xxx'>
                        <div _foo=123  bar=12.345 ba_z = +123 blah=-42/>
                        <div #xyz = {blah}  @required/>
                        <div @foo={ xyz }  @bar(a="b" c=123) @blah(  a=123  @abc   )  @baz(   )   />
                    </span>
                </>
            `)), `
                <div foo='bar' disabled baz='abc'>
                  <span baz='a b \\'c\\' d' x=true y=false/>
                  <span #foo #bar='xxx'>
                    <div _foo=123 bar=12.345 ba_z=123 blah=-42/>
                    <div #xyz={blah}/>
                    <div @foo={xyz} @bar(a='b' c=123) @blah(a=123 @abc) @baz/>
                  </>
                </>
                `, "1")
        });
    });

    describe('Parser errors', () => {
        const padding = '                ';

        function error(xtml: string) {
            try {
                let xf = parse(xtml);
                // console.log("xf=",xf)
            } catch (err) {
                return "\n" + padding + err.replace(/\n/g, "\n" + padding) + "\n" + padding;
            }
            return "NO ERROR";
        }

        it("should be raised for invalid identifiers", function () {
            assert.equal(error(`
                <*cp-t foo&=123/>
            `), `
                XTML: Invalid character: '-'
                Line 2 / Col 21
                Extract: >> <*cp-t foo&=123/> <<
                `, "1");

            assert.equal(error(`
                <*cpt @foo+bar/>
            `), `
                XTML: Invalid character: '+'
                Line 2 / Col 27
                Extract: >> <*cpt @foo+bar/> <<
                `, "2");
        });

        it("should be raised for unexpected characters", function () {
            assert.equal(error(`
                <div>
                    <span / >
                </div>
            `), `
                XTML: '>' expected instead of ' '
                Line 3 / Col 28
                Extract: >> <span / > <<
                `, "1");

            assert.equal(error(`
                <div>
                    <span />
                <div>
            `), `
                XTML: '<' expected instead of End of Content
                Line 5 / Col 13
                Extract: >>  <<
                `, "2");
        });

        it("should be raised for invalid param value", function () {
            assert.equal(error(`
                <div foo=12. >
                    <span / >
                </div>
            `), `
                XTML: Invalid number
                Line 2 / Col 29
                Extract: >> <div foo=12. > <<
                `, "1");

            assert.equal(error(`
                <div foo=12.3.4 >
                    <span / >
                </div>
            `), `
                XTML: Invalid character: '.'
                Line 2 / Col 30
                Extract: >> <div foo=12.3.4 > <<
                `, "2");

            assert.equal(error(`
                <div foo=ABC >
                    <span / >
                </div>
            `), `
                XTML: Invalid parameter value: 'A'
                Line 2 / Col 26
                Extract: >> <div foo=ABC > <<
                `, "2");
        });

        it("should be raised for invalid end tags", function () {
            assert.equal(error(`
                <div foo=12>
                    <span />
                </dix>
            `), `
                XTML: End tag </dix> doesn't match <div>
                Line 4 / Col 19
                Extract: >> </dix> <<
                `, "1");
        });
    });

});
