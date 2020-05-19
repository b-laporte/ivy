import * as assert from 'assert';
import { compile, process } from '../iv/compiler/compiler';
import { IvError } from '../iv/compiler/types';
import { formatError } from './utils';
import { XjsParamHost, XjsParamDictionary } from '../xjs/types';
import { createParam, addParam } from '../xjs/parser';

describe('Template compiler', () => {
    const options = { filePath: "a/b/c.ts" }

    it("should compile a single function with no params", async function () {
        let r = await compile(`\// start
            import { $template } from "../iv";

            const x = $template\`() => {
                hello world
            }\`;

            // end`, options)

        assert.equal(r.fileContent, `\// start
            import { $template, ζinit, ζend, ζtxt, ζt } from "../iv";

            const x = (function () {
            const ζs0 = {};
            return ζt("x", ".../b/c.ts", ζs0, function (ζ) {
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " hello world ", 0);
                ζend(ζ, ζc);
            });
            })();

            // end`, "1");

        // test with import at position 0
        r = await compile(`import { $template } from "../iv";

            const x = $template\`() => {
                hello world }\`;

            // end`, options)

        assert.equal(r.fileContent, `import { $template, ζinit, ζend, ζtxt, ζt } from "../iv";

            const x = (function () {
            const ζs0 = {};
            return ζt("x", ".../b/c.ts", ζs0, function (ζ) {
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " hello world ", 0);
                ζend(ζ, ζc);
            });
            })();

            // end`, "2");
    });

    it("should compile a template with arguments", async function () {
        let src1 = `\// start
            import { $template } from "../iv";
            const abc=123;

            const x = $template\`(name) => {
                hello world {name}
            }\`;

            // end`;

        let r = await compile(src1, options);

        assert.equal(r.fileContent, `\// start
            import { $template, ζinit, ζend, ζtxt, ζe, ζΔD, ζt } from "../iv";
            const abc=123;

            const x = (function () {
            const ζs0 = {}, ζs1 = [" hello world ", "", " "];
            @ζΔD class ζParams {
                name: any;
            }
            return ζt("x", ".../b/c.ts", ζs0, function (ζ, $, $api) {
                let name = $api["name"];
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, ζs1, 1, ζe(ζ, 0, name));
                ζend(ζ, ζc);
            }, ζParams);
            })();

            // end`, "test 1");
    });

    it("should compile multiple functions with params and partial imports", async function () {
        let src2 = `\
            import{ $template, ζtxt } from "../iv";

            let t1 = $template\`(a) => {
                T1
            }\`;
            let x = 123, t2 = $template\`(p1:string, p2:number) => {
                T1
            }\`;
            let z = "ABCD";
            `;

        let r = await compile(src2, { filePath: "test2.ts" });

        assert.equal(r.fileContent, `\
            import{ $template, ζtxt, ζinit, ζend, ζΔD, ζt } from "../iv";

            let t1 = (function () {
            const ζs0 = {};
            @ζΔD class ζParams {
                a: any;
            }
            return ζt("t1", "test2.ts", ζs0, function (ζ, $, $api) {
                let a = $api["a"];
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " T1 ", 0);
                ζend(ζ, ζc);
            }, ζParams);
            })();
            let x = 123, t2 = (function () {
            const ζs0 = {};
            @ζΔD class ζParams {
                p1: string;
                p2: number;
            }
            return ζt("t2", "test2.ts", ζs0, function (ζ, $, $api) {
                let p1 = $api["p1"], p2 = $api["p2"];
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " T1 ", 0);
                ζend(ζ, ζc);
            }, ζParams);
            })();
            let z = "ABCD";
            `, "test 2");
    });

    it("should process api classes", async function () {
        const src = `\
            import{ $template, API } from "../iv";

            @API class FooApi {
                p1:string;
                p2:number;

                doSth:()=>void;
            }
            let tpl = $template\`($:FooApi) => {
                tpl
            }\`;
            `;

        const r = await process(src, { filePath: "test2.ts" });

        assert.equal(r, `\
            import{ $template, API, ζΔfStr, ζΔp, ζΔfNbr, ζinit, ζend, ζtxt, ζt } from "../iv";

            @API class FooApi {
                ΔΔp1:string; @ζΔp(ζΔfStr) p1: string;
                ΔΔp2:number; @ζΔp(ζΔfNbr) p2: number;

                ΔΔdoSth:()=>void; @ζΔp() doSth: any;
            }
            let tpl = (function () {
            const ζs0 = {};
            return ζt("tpl", "test2.ts", ζs0, function (ζ, $, $api) {
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " tpl ", 0);
                ζend(ζ, ζc);
            }, FooApi);
            })();
            `, "1");
    });

    it("should skipped files marked with iv:ignore comment", async function () {
        const src = `
            // iv:ignore
            import{ $template, ζtxt } from "../iv";

            let t1 = $template\`(a) => {
                T1
            }\`;
            let x = 123, t2 = $template\`(p1:string, p2:number) => {
                T1
            }\`;
            let z = "ABCD";
            `;
        const r = await compile(src, options);
        assert.equal(r.fileContent, src, "test 3");
    });

    it("should not change files that don't contain templates", async function () {
        const src = `let x=123;`;
        const r = await compile(src, options)
        assert.equal(r.fileContent, src, "test 3");
    });

    it("should raise errors with file name and line numbers", async function () {
        let err: IvError | undefined;
        try {
            await compile(`\
                import{ $template } from "../iv";

                let t = $template\`(a) => {
                    <div> T1
                };\`;
                `, options)
        } catch (e) {
            err = e as IvError;
        }
        assert.equal(formatError(err, 2), `
            XJS: Invalid element: Unexpected characters '};' instead of '</'
            File: a/b/c.ts - Line 5 / Col 17
            Extract: >> }; <<
        `, '1');

        err = undefined;
        try {
            await compile(` 
                import{ $template } from "../iv";

                let t = $template\`(a) => {
                    <! foo="bar">
                        Hello
                    </>
                }\`;
                `, options)
        } catch (e) {
            err = e as IvError;
        }
        assert.equal(formatError(err, 2), `
            IVY: Invalid param - Parameters are not supported on Fragment nodes
            File: .../b/c.ts - Line 5 / Col 24
            Extract: >> <! foo="bar"> <<
        `, '2');
    });

    it("should compile a simple $fragment string", async function () {
        const src1 = `\// start
            import { $fragment } from "../iv/fragment";

            const x = $fragment\`
                <div>
                    Message: <*hello name="world"/>
                </>
            \`;

            // end`;
        const r = await compile(src1, "a/b/c.ts");

        assert.equal(r.fileContent, `\// start
            import { $fragment } from "../iv/fragment";

            const x = $fragment\`<!><div> Message: <*hello name='world'/></></>\`;

            // end`, "1");
    });

    it("should ignore dynamic $fragment strings", async function () {
        const src1 = `\// start
            import { $fragment } from "../iv/fragment";

            const x = $fragment \`
                <div> Message: \${123} </>
            \`;

            // end`;

        let r = await compile(src1, "a/b/c.ts")

        assert.equal(r.fileContent, `\// start
            import { $fragment } from "../iv/fragment";

            const x = $fragment \`
                <div> Message: \${123} </>
            \`;

            // end`, "1");

        const src2 = `\// start
            import { $fragment } from "../iv/fragment";

            const x = $fragment\`
                <div> Message: \${123} </>
            \`;
            const y = $fragment   \`
                <div> Message: <*hi @deco(foo={bar})/> </>
            \`
            const z = $fragment\`
                <div> {blah} <*hi @deco(foo={bar})/> </>
            \`;

            // end`

        r = await compile(src2, "a/b/c.ts")

        assert.equal(r.fileContent, `\// start
            import { $fragment } from "../iv/fragment";

            const x = $fragment\`
                <div> Message: \${123} </>
            \`;
            const y = $fragment\`<!><div> Message: <*hi @deco( foo={bar})/></></>\`
            const z = $fragment\`<!><div> {blah} <*hi @deco( foo={bar})/></></>\`;

            // end`, "2");
    });

    it("should compile multiple $fragment strings with xjs $templates", async function () {
        const src1 = `\// start
            import { $template } from "../iv";
            import { $fragment } from "../iv/fragment";

            const a=$fragment\`
                ABC <def
                    g={xxx}
                />
            \`;
            const x = $template\`() => {
                hello world
            }\`;
            const b = $fragment\`
                <*hello name={name}/>
            \`;//here

            // end`;

        const r = await compile(src1, "a/b/c.ts")

        assert.equal(r.fileContent, `\// start
            import { $template, ζinit, ζend, ζtxt, ζt } from "../iv";
            import { $fragment } from "../iv/fragment";

            const a=$fragment\`<!> ABC <def g={xxx}/></>\`;
            const x = (function () {
            const ζs0 = {};
            return ζt("x", ".../b/c.ts", ζs0, function (ζ) {
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " hello world ", 0);
                ζend(ζ, ζc);
            });
            })();
            const b = $fragment\`<!><*hello name={name}/></>\`;//here

            // end`, "1");
    });

    // simple pre-processor to add a new param
    // supports 2 parameters: name and value: @@newParam(name="x" value="y")
    function newParam() {
        return {
            process(target: XjsParamHost, params: XjsParamDictionary) {
                let value = params["$$default"] ? params["$$default"].value || "" : "";
                addParam(createParam("the_param", value), target);
            }
        }
    }

    it("should support $fragment pre-processors", async function () {
        const src1 = `\// start
            import { $fragment } from "../iv/fragment";

            const x = $fragment\`
                <div @@newParam="a"> <*hello @@newParam={abc}/> </div>
            \`;

            // end`;

        const r = await compile(src1, { filePath: "a/b/c.ts", preProcessors: { "@@newParam": newParam } });

        assert.equal(r.fileContent, `\// start
            import { $fragment } from "../iv/fragment";

            const x = $fragment\`<!><div the_param='a'><*hello the_param={abc}/></></>\`;

            // end`, "1");
    });

    it("should support $template pre-processors", async function () {
        const src1 = `\// start
            import { $template } from "../iv";

            const x = $template\`() => {
                <div @@newParam="a"> 
                    <*hello @@newParam={abc}/> 
                </div>
            }\`;

            // end`;

        const r = await compile(src1, { filePath: "a/b/c.ts", preProcessors: { "@@newParam": newParam } });

        assert.equal(r.fileContent, `\// start
            import { $template, ζinit, ζend, ζelt, ζcpt, ζpar, ζcall, ζe, ζt } from "../iv";

            const x = (function () {
            const ζs0 = {}, ζs1 = ["the_param", "a"];
            return ζt("x", ".../b/c.ts", ζs0, function (ζ) {
                let ζc = ζinit(ζ, ζs0, 2);
                ζelt(ζ, ζc, 0, 0, "div", 1, 0, ζs1);
                ζcpt(ζ, ζc, 0, 1, 1, ζe(ζ, 0, hello), 0);
                ζpar(ζ, ζc, 0, 1, "the_param", ζe(ζ, 1, abc));
                ζcall(ζ, 1);
                ζend(ζ, ζc);
            });
            })();

            // end`, "1");
    });

    it("should support $template with internal backtick strings", async function () {
        const src1 = `\// start
            import { $template } from "../iv";

            const x = $template\`() => {
                <!cdata>
                    \\\`hello\\\`
                </!cdata>
            }\`;

            // end`;

        const r = await compile(src1, { filePath: "a/b/c.ts", preProcessors: { "@@newParam": newParam } });

        assert.equal(r.fileContent, `\// start
            import { $template, ζinit, ζend, ζtxt, ζt } from "../iv";

            const x = (function () {
            const ζs0 = {};
            return ζt("x", ".../b/c.ts", ζs0, function (ζ) {
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, "\\n                    \`hello\`\\n                ", 0);
                ζend(ζ, ζc);
            });
            })();

            // end`, "1");
    });

    it("should ignore undefined $fragment pre-processors", async function () {
        const src1 = `\// start
            import { $fragment } from "../iv/fragment";

            const x = $fragment\`
                <div @@newParam="a" @@foo> <*hello/> \\\` </div>
            \`;

            // end`;

        const r = await compile(src1, { filePath: "a/b/c.ts", preProcessors: { "@@newParam": newParam } });

        assert.equal(r.fileContent, `\// start
            import { $fragment } from "../iv/fragment";

            const x = $fragment\`
                <div @@newParam="a" @@foo> <*hello/> \\\` </div>
            \`;

            // end`, "1");
    });

    it("should raise errors with file name and line numbers", async function () {
        let err: any;
        try {
            await compile(`
                import{ $fragment } from "../iv/fragment";

                const x = $fragment\`
                    <*cpt-x> Message: <*hello> </>
                \`;

                `, "file-name.ts")
        } catch (e) {
            err = e;
        }
        assert.equal(formatError(err, 3), `
                XJS: Invalid component: Invalid character in component identifier: '-'
                File: file-name.ts - Line 5 / Col 26
                Extract: >> <*cpt-x> Message: <*hello> </> <<
            `, '1');

        try {
            await compile(`
                import{ $fragment } from "../iv/fragment";

                const x = $fragment\`
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
