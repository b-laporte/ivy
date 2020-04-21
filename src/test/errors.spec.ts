// iv:ignore
import { error, compilationError } from './utils';
import * as assert from 'assert';

describe('Code generation errors', () => {
    const tplFile5 = `\
        import{ $template, API } from "../iv";

        const hello = $template\`(name) => {
            Hello {name}
        }\`;
    `;

    it("should be raised for invalid typescript content", async function () {
        assert.equal(await compilationError(`
            import{ template } from "../iv";
            a.
            const t = template(\`() => { # Hello # }\`);
        `), `
            TS: Identifier expected.
            File: file.ts - Line 3 / Col 15
            Extract: >> a. <<
        `);
    });

    it("should be raised for missing template import", async function () {
        assert.equal(await compilationError(`
            import{ foo } from "../iv";
            const t = $template\` Hello \`;
        `), `
            IVY: Missing '$template' import statement
            File: file.ts - Line 1 / Col 1
            Extract: >>  <<
        `);
    });

    it("should be raised for TRAX errors following IVY compilation", async function () {
        assert.equal(await compilationError(tplFile5 + `\
            @API class GreetingsAPI {
                name: string
                constructor() {
                    this.name = "foo";
                }
            }
            
            const hello = $template\`($:GreetingsAPI) => {
                Hi {$.name}
            }\`;
        `), `
            TRAX: Constructors are not authorized in Data objects
            File: file.ts - Line 8 / Col 31
            Extract: >> constructor() { <<
        `);
    });

    it("should be raised for nodes that are not yet supported", async function () {
        assert.equal(await error.$template`(someVar) => {
            <{someVar} foo="bar"/>
        }`, `
            XJS: Invalid element: Invalid character '{'
            File: file.ts - Line 2 / Col 14
            Extract: >> <{someVar} foo="bar"/> <<
        `);
    });

    it("should be raised when params are not supported on some node types", async function () {
        assert.equal(await error.$template`(someVar) => {
            <! foo="bar"/>
        }`, `
            IVY: Invalid param - Parameters are not supported on Fragment nodes
            File: file.ts - Line 2 / Col 16
            Extract: >> <! foo="bar"/> <<
        `);
    });

    it("should be raised if properties are used on fragments", async function () {
        assert.equal(await error.$template`(someVar) => {
            <! [foo]="bar"/>
        }`, `
            IVY: Invalid property - Properties are not supported on Fragment nodes
            File: file.ts - Line 2 / Col 16
            Extract: >> <! [foo]="bar"/> <<
        `);
    });

    it("should be raised on invalid label usage", async function () {
        assert.equal(await error.$template`(someVar) => {
            <*cpt>
                <.foo #bar> # Hello # </>
            </>
        }`, `
            IVY: Invalid label - Labels are not supported on Parameter nodes
            File: file.ts - Line 3 / Col 23
            Extract: >> <.foo #bar> # Hello # </> <<
        `);

        assert.equal(await error.$template`(someVar) => {
            <div ##foo> Hello </>
        }`, `
            XJS: Invalid label: Forward label 'foo' can only be used on components
            File: file.ts - Line 2 / Col 18
            Extract: >> <div ##foo> Hello </> <<
        `);
    });

    it("should be raised on invalid label values", async function () {
        assert.equal(await error.$template`(someVar) => {
            <*cpt #bar=123/>
        }`, `
            IVY: Invalid label - Labels values must be expressions or booleans
            File: file.ts - Line 2 / Col 19
            Extract: >> <*cpt #bar=123/> <<
        `);

        assert.equal(await error.$template`(someVar) => {
            <*cpt ##bar=123/>
        }`, `
            IVY: Invalid label - Forward labels are not yet supported on Component nodes
            File: file.ts - Line 2 / Col 19
            Extract: >> <*cpt ##bar=123/> <<
        `); // IVY: Invalid label - Forward labels values must be strings or expressions
    });

    it("should be properly raised on 1st template line", async function () {
        assert.equal(await compilationError(tplFile5 + `\
            // here
            const hello = $template\`(someVar:ABC) ) => {
                <div/>
            }\`;
        `), `
            XJS: Invalid template function: Unexpected characters ') ' instead of '=>'
            File: file.ts - Line 7 / Col 52
            Extract: >> (someVar:ABC) ) => { <<
        `);
    });

    it("should be raised if built-in decorators are improperly used", async function () {
        assert.equal(await error.$template`(someVar) => {
            <div @paramValue={someVar}/>
        }`, `
            IVY: Invalid decorator - @paramValue is not supported on Element nodes
            File: file.ts - Line 2 / Col 18
            Extract: >> <div @paramValue={someVar}/> <<
        `);
    });

    it("should be raised when decorators are improperly used on param nodes", async function () {
        assert.equal(await error.$template`(someVar) => {
            <*cpt>
                <.paramA @paramValue=123 text="abc"/>
            </>
        }`, `
            IVY: Invalid decorator - @paramValue cannot be mixed with other parameters
            File: file.ts - Line 3 / Col 26
            Extract: >> <.paramA @paramValue=123 text="abc"/> <<
        `);

        assert.equal(await error.$template`(someVar) => {
            <*cpt>
                <.paramA @text="abc"/>
            </>
        }`, `
            IVY: Invalid decorator - Only @paramValue and event listener decorators can be used on Parameter nodes
            File: file.ts - Line 3 / Col 26
            Extract: >> <.paramA @text="abc"/> <<
        `);

        assert.equal(await error.$template`(someVar) => {
            <*cpt>
                <.paramA @paramValue/>
            </>
        }`, `
            IVY: Invalid decorator - Incorrect value for @paramValue
            File: file.ts - Line 3 / Col 26
            Extract: >> <.paramA @paramValue/> <<
        `);
    });

    it("should be raised if event listeners are improperly used", async function () {
        assert.equal(await error.$template`(someVar) => {
            <! @onclick={someFun}/>
        }`, `
            IVY: Invalid decorator - Event handlers are not supported on Fragment nodes
            File: file.ts - Line 2 / Col 16
            Extract: >> <! @onclick={someFun}/> <<
        `);

        assert.equal(await error.$template`(someVar) => {
            <div @onclick/>
        }`, `
            IVY: Invalid decorator - Missing event handler value for @onclick
            File: file.ts - Line 2 / Col 18
            Extract: >> <div @onclick/> <<
        `);
    });

    it("should be raised for spread operators", async function () {
        assert.equal(await error.$template`(someVar) => {
            <div {...exp()}/>
        }`, `
            XJS: Invalid binding shortcut: '}' expected instead of '.'
            File: file.ts - Line 2 / Col 19
            Extract: >> <div {...exp()}/> <<
        `, "1");
    });

    it("should be raised for [innerHTML]", async function () {
        assert.equal(await error.$template`(someVar) => {
            <div [innerHTML]={expr()}/>
        }`, `
            IVY: Invalid property - innerHTML is not authorized (security restriction)
            File: file.ts - Line 2 / Col 18
            Extract: >> <div [innerHTML]={expr()}/> <<
        `, "1");
    });

    it("should be raised for invalid event handlers", async function () {
        assert.equal(await error.$template`(someVar) => {
            <div @onclick=true/>
        }`, `
            IVY: Invalid decorator - Event listeners must be function expressions - e.g. @onclick={e=>doSomething(e)}
            File: file.ts - Line 2 / Col 18
            Extract: >> <div @onclick=true/> <<
        `, "1");

        assert.equal(await error.$template`(someVar) => {
            <div @onclick(listener options={{}})/>
        }`, `
            IVY: Invalid param - listener value cannot be empty
            File: file.ts - Line 2 / Col 27
            Extract: >> <div @onclick(listener options={{}})/> <<
        `, "2");

        assert.equal(await error.$template`(someVar) => {
            <div @onclick(listener=123 options={{}})/>
        }`, `
            IVY: Invalid param - listeners must be function expressions - e.g. listener={e=>doSomething(e)}
            File: file.ts - Line 2 / Col 27
            Extract: >> <div @onclick(listener=123 options={{}})/> <<
        `, "3");

        assert.equal(await error.$template`(someVar) => {
            <div @onclick(listener={=>foo()} options)/>
        }`, `
            IVY: Invalid param - options value cannot be empty
            File: file.ts - Line 2 / Col 46
            Extract: >> <div @onclick(listener={=>foo()} options)/> <<
        `, "4");

        assert.equal(await error.$template`(someVar) => {
            <div @onclick(listener={=>foo()} options=123)/>
        }`, `
            IVY: Invalid param - options value must be an expression - e.g. options={{passive:true, once:true}}
            File: file.ts - Line 2 / Col 46
            Extract: >> <div @onclick(listener={=>foo()} options=123)/> <<
        `, "5");

        assert.equal(await error.$template`(someVar) => {
            <div @onclick/>
        }`, `
            IVY: Invalid decorator - Missing event handler value for @onclick
            File: file.ts - Line 2 / Col 18
            Extract: >> <div @onclick/> <<
        `, "6");

        assert.equal(await error.$template`(someVar) => {
            <div @onclick(options={{passive:true}})/>
        }`, `
            IVY: Invalid decorator - Missing listener parameter
            File: file.ts - Line 2 / Col 18
            Extract: >> <div @onclick(options={{passive:true}})/> <<
        `, "7");
    });

    it("should be raised for invalid 2-way binding expressions", async function () {
        // invalid binding expression
        assert.equal(await error.$template`(someVar) => {
            <div @foo={=abcd}/>
        }`, `
            IVY: Invalid decorator - Invalid binding expression: {=abcd}
            File: file.ts - Line 2 / Col 18
            Extract: >> <div @foo={=abcd}/> <<
        `, "1");

        // binding on an element attribute
        assert.equal(await error.$template`(someVar) => {
            <div title={=a.b}/>
        }`, `
            IVY: Invalid param - Binding expressions cannot be used on element param
            File: file.ts - Line 2 / Col 18
            Extract: >> <div title={=a.b}/> <<
        `, "2");

        // binding on an element property
        assert.equal(await error.$template`(someVar) => {
            <div [title]={=a.b}/>
        }`, `
            IVY: Invalid property - Binding expressions cannot be used on element property
            File: file.ts - Line 2 / Col 18
            Extract: >> <div [title]={=a.b}/> <<
        `, "3");
    });

    it("should be raised for invalid properties", async function () {
        assert.equal(await error.$template`() => {
            <*cpt [className]="foo"/>
        }`, `
            IVY: Invalid property - Properties are not supported on Component nodes
            File: file.ts - Line 2 / Col 19
            Extract: >> <*cpt [className]="foo"/> <<
        `, "1");
    });

    it("should be raised for templates in templates", async function () {
        assert.equal(await error.$template`(a:number) => {
            <*cpt prop="x"/>
            $template foo (b:string) {
                a: {a} b: {b}
            }
        }`, `
            IVY: Invalid $template function - $template statements are not supported yet
            File: file.ts - Line 3 / Col 13
            Extract: >> $template foo (b:string) { <<
        `, "1");
    });

    it("should be raised for invalid @content", async function () {
        assert.equal(await error.$template`() => {
            <div @content/>
        }`, `
            IVY: Invalid decorator - $ or $content must be defined as template arguments to use @content with no values
            File: file.ts - Line 2 / Col 18
            Extract: >> <div @content/> <<
        `, "1");

        assert.equal(await error.$template`($content) => {
            <div @content>
                some text
            </div>
        }`, `
            IVY: Invalid decorator - @content can only be used on empty elements or fragments
            File: file.ts - Line 2 / Col 18
            Extract: >> <div @content> <<
        `, "2");

        assert.equal(await error.$template`($content) => {
            <*cpt @content={$content}/>
        }`, `
            IVY: Invalid decorator - @content is not supported on Component nodes
            File: file.ts - Line 2 / Col 19
            Extract: >> <*cpt @content={$content}/> <<
        `, "3");

        assert.equal(await error.$template`($content) => {
            <div @content="abcd"/>
        }`, `
            IVY: Invalid decorator - @content value cannot be a string
            File: file.ts - Line 2 / Col 18
            Extract: >> <div @content="abcd"/> <<
        `, "4");

        assert.equal(await error.$template`($content) => {
            <div @content={::$content}/>
        }`, `
            IVY: Invalid decorator - @content expression cannot use one-time qualifier
            File: file.ts - Line 2 / Col 18
            Extract: >> <div @content={::$content}/> <<
        `, "5");
    });

    // it("should be raised for invalid @async", async function () {
    //     // @async is only valid on fragments, elements and components and only accepts number or expressions

    //     assert.equal(await error.$template`() => {
    //         <div @async=true/>
    //     }`, 'Invalid decorator - @async value must be either empty or a number or an expression (line #2)', '1');

    //     assert.equal(await error.$template`() => {
    //         <div @async="abc"/>
    //     }`, 'Invalid decorator - @async value must be either empty or a number or an expression (line #2)', '1');

    //     assert.equal(await error.$template`() => {
    //         # (@async) Some text #
    //     }`, 'Invalid decorator - @async cannot be used in this context (line #2)', '1');

    //     assert.equal(await error.$template`() => {
    //         <*section title="foo">
    //             <.header @async> # Header # </>
    //             # Content #
    //         </>
    //     }`, 'Invalid decorator - @async cannot be used in this context (line #3)', '1');
    // });
});
