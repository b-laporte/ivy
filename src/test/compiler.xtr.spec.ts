import * as assert from 'assert';
import { compile } from '../iv/compiler/compiler';
import { XtrParamHost, XtrParamDictionary, addParam } from '../xtr/ast';
import { IvError } from '../iv/compiler/generator';
import { formatError } from './utils';

describe('XTR compiler', () => {
    it("should compile a simple xtr string", async function () {
        const src1 = `\// start
            import { xtr } from "../iv";

            const x = xtr\`
                <div>
                    Message: <*hello name="world"/>
                </>
            \`;

            // end`;

        const r = await compile(src1, "a/b/c.ts")

        assert.equal(r.fileContent, `\// start
            import { xtr } from "../iv";

            const x = \`<div> Message: <*hello name='world'/></>\`;

            // end`, "1");
    });

    it("should ignore dynamic xtr strings", async function () {
        const src1 = `\// start
            import { xtr } from "../iv";

            const x = xtr\`
                <div> Message: \${123} </>
            \`;

            // end`;

        let r = await compile(src1, "a/b/c.ts")

        assert.equal(r.fileContent, `\// start
            import { xtr } from "../iv";

            const x = xtr\`
                <div> Message: \${123} </>
            \`;

            // end`, "1");

        const src2 = `\// start
            import { xtr } from "../iv";

            const x = xtr\`
                <div> Message: \${123} </>
            \`;
            const y = xtr\`
                <div> Message: <*hi @deco(foo={bar})/> </>
            \`
            const z = xtr\`
                <div> {blah} <*hi @deco(foo={bar})/> </>
            \`;

            // end`

        r = await compile(src2, "a/b/c.ts")

        assert.equal(r.fileContent, `\// start
            import { xtr } from "../iv";

            const x = xtr\`
                <div> Message: \${123} </>
            \`;
            const y = \`<div> Message: <*hi @deco(foo={bar})/></>\`
            const z = \`<div> {blah} <*hi @deco(foo={bar})/></>\`;

            // end`, "2");
    });

    it("should compile multiple xtr strings with xjs templates", async function () {
        const src1 = `\// start
            import { template } from "../iv";

            const a=xtr\`
                ABC <def
                    g={xxx}
                />
            \`;
            const x = template(\`() => {
                # hello world #
            }\`);
            const b = xtr\`
                <*hello name={name}/>
            \`;//here

            // end`;

        const r = await compile(src1, "a/b/c.ts")

        assert.equal(r.fileContent, `\// start
            import { template, ζinit, ζend, ζtxt, ζt } from "../iv";

            const a=\` ABC <def g={xxx}/>\`;
            const x = (function () {
            const ζs0 = {};
            return ζt("x", "b/c.ts", ζs0, function (ζ) {
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " hello world ", 0);
                ζend(ζ, ζc);
            });
            })();
            const b = \`<*hello name={name}/>\`;//here

            // end`, "1");
    });

    // simple pre-processor to add a new param
    // supports 2 parameters: name and value: @@newParam(name="x" value="y")
    function newParam() {
        return {
            process(target: XtrParamHost, params: XtrParamDictionary) {
                let value = params.value ? params.value.value || "" : "";
                addParam(target, "the_param", value);
            }
        }
    }

    it("should support xtr pre-processors", async function () {
        const src1 = `\// start
            import { xtr } from "../iv";

            const x = xtr\`
                <div @@newParam="a"> <*hello @@newParam={abc}/> </div>
            \`;

            // end`;

        const r = await compile(src1, { filePath: "a/b/c.ts", preProcessors: { "@@newParam": newParam } });

        assert.equal(r.fileContent, `\// start
            import { xtr } from "../iv";

            const x = \`<div the_param='a'><*hello the_param={abc}/></>\`;

            // end`, "1");
    });

    it("should raise errors with file name and line numbers", async function () {
        let err: any;
        try {
            await compile(`
                import{ template } from "../iv";

                const x = xtr\`
                    <*cpt-x> Message: <*hello> </>
                \`;

                `, "file-name.ts")
        } catch (e) {
            err = e;
        }
        assert.equal(formatError(err, 3), `
            XTR: Invalid character: '-'
            Line 5 / Col 26
            File: file-name.ts
            Extract: >> <*cpt-x> Message: <*hello> </> <<
            `, '1');

        try {
            await compile(`
                import{ template } from "../iv";

                const x = xtr\`
                    <*cpt> Message: <*hello/> </>
                \`); // JS error here

                `, "file-name.ts")
        } catch (e) {
            err = e;
        }
        assert.equal(formatError(err, 3), `
                TS: ',' expected.
                File: file-name.ts - Line 6 / Col 18
                Extract: >> \`); // JS error here <<
            `, '2');
    });
});
