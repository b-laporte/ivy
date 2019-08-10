// iv:ignore
import { error, compilationError } from './utils';
import * as assert from 'assert';

describe('Code generation errors', () => {

    const tplFile5 = `\
        import{ template, API } from "../iv";

        const hello = template(\`(name) => {
            # Hello {name} # 
        }\`);
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
            const t = template(\` # Hello # \`);
        `), `
            IVY: Missing 'template' import statement
            File: file.ts - Line 0 / Col 0
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
            
            const hello = template(\`($api:GreetingsAPI) => {
                # Hi {$api.name} # 
            }\`);
        `), `
            TRAX: Constructors are not authorized in Data objects
            File: file.ts - Line 8 / Col 30
            Extract: >> constructor() { <<
        `);
    });

    it("should be raised for nodes that are not yet supported", async function () {
        assert.equal(await error.template(`(someVar) => {
            <{someVar} foo="bar"/>
        }`), `
            IVY: Invalid element - Dynamic element nodes are not supported yet
            File: file.ts - Line 2 / Col 13
            Extract: >> <{someVar} foo="bar"/> <<
        `);
    });

    it("should be raised when params are not supported on some node types", async function () {
        assert.equal(await error.template(`(someVar) => {
            <! foo="bar"/>
        }`), `
            IVY: Invalid param - Parameters are not supported on Fragment nodes
            File: file.ts - Line 2 / Col 16
            Extract: >> <! foo="bar"/> <<
        `);
    });

    it("should be raised when decorators are not supported on some node types", async function () {
        assert.equal(await error.template(`(someVar) => {
            # (@foo) Hello #
        }`), `
            IVY: Invalid decorator - Decorators are not yet supported on Text nodes
            File: file.ts - Line 2 / Col 16
            Extract: >> # (@foo) Hello # <<
        `);
    });

    it("should be raised if properties are used on fragments", async function () {
        assert.equal(await error.template(`(someVar) => {
            <! [foo]="bar"/>
        }`), `
            IVY: Invalid property - Properties are not supported on Fragment nodes
            File: file.ts - Line 2 / Col 26
            Extract: >> <! [foo]="bar"/> <<
        `);
    });

    it("should be raised on invalid label usage", async function () {
        assert.equal(await error.template(`(someVar) => {
            <*cpt>
                <.foo #bar> # Hello # </>
            </>
        }`), `
            IVY: Invalid label - Labels are not supported on Parameter nodes
            File: file.ts - Line 3 / Col 23
            Extract: >> <.foo #bar> # Hello # </> <<
        `);

        assert.equal(await error.template(`(someVar) => {
            # (##foo) Hello #
        }`), `
            XJS: Invalid label - Forward labels (e.g. ##foo) can only be used on component calls
            File: file.ts - Line 2 / Col 18
            Extract: >> # (##foo) Hello # <<
        `);
    });

    it("should be raised on invalid label values", async function () {
        assert.equal(await error.template(`(someVar) => {
            <*cpt #bar=123/>
        }`), `
            IVY: Invalid label - Labels values must be expressions or booleans
            File: file.ts - Line 2 / Col 19
            Extract: >> <*cpt #bar=123/> <<
        `);

        assert.equal(await error.template(`(someVar) => {
            <*cpt ##bar=123/>
        }`), `
            IVY: Invalid label - Forward labels values must be strings or expressions
            File: file.ts - Line 2 / Col 19
            Extract: >> <*cpt ##bar=123/> <<
        `);
    });

    it("should be properly raised on 1st template line", async function () {
        assert.equal(await compilationError(tplFile5 + `\
            // here
            const hello = template(\`(someVar:ABC()) => {
                <div/>
            }\`);
        `), `
            XJS: Invalid template params - Unexpected token ''
            File: file.ts - Line 7 / Col 49
            Extract: >> (someVar:ABC()) => { <<
        `);
    });

    // it("should be raised for invalid @content", async function () {
    //     assert.equal(await error.template(`() => {
    //         <div @content/>
    //     }`), 'Invalid decorator - $content must be defined as template argument to use @content without expressions (line #2)', '1');

    //     assert.equal(await error.template(`($content) => {
    //         <div @content>
    //             # some text #
    //         </div>
    //     }`), 'Invalid decorator - @content can only be used on empty elements or fragments (line #2)', '2');

    //     assert.equal(await error.template(`($content) => {
    //         <*cpt @content={$content}/>
    //     }`), 'Invalid decorator - @content can only be used on elements or fragments (line #2)', '3');

    //     assert.equal(await error.template(`($content) => {
    //         <div @content="abcd"/>
    //     }`), 'Invalid decorator - @content value cannot be a #string (line #2)', '4');

    //     assert.equal(await error.template(`($content) => {
    //         <div @content={::$content}/>
    //     }`), 'Invalid decorator - @content expression cannot use one-time qualifier (line #2)', '5');
    // });

    // it("should be raised for invalid @async", async function () {
    //     // @async is only valid on fragments, elements and components and only accepts number or expressions

    //     assert.equal(await error.template(`() => {
    //         <div @async=true/>
    //     }`), 'Invalid decorator - @async value must be either empty or a number or an expression (line #2)', '1');

    //     assert.equal(await error.template(`() => {
    //         <div @async="abc"/>
    //     }`), 'Invalid decorator - @async value must be either empty or a number or an expression (line #2)', '1');

    //     assert.equal(await error.template(`() => {
    //         # (@async) Some text #
    //     }`), 'Invalid decorator - @async cannot be used in this context (line #2)', '1');

    //     assert.equal(await error.template(`() => {
    //         <*section title="foo">
    //             <.header @async> # Header # </>
    //             # Content #
    //         </>
    //     }`), 'Invalid decorator - @async cannot be used in this context (line #3)', '1');
    // });

});
