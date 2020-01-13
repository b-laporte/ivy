import * as assert from 'assert';
import { compile, process } from '../iv/compiler/compiler';
import { IvError } from '../iv/compiler/generator';
import { formatError } from './utils';

describe('Template compiler', () => {
    const options = { filePath: "a/b/c.ts" }

    it("should compile a single function with no params", async function () {
        let r = await compile(`\// start
            import { template } from "../iv";

            const x = template(\`() => {
                # hello world #
            }\`);

            // end`, options)

        assert.equal(r.fileContent, `\// start
            import { template, ζinit, ζend, ζtxt, ζt } from "../iv";

            const x = (function () {
            const ζs0 = {};
            return ζt("x", "b/c.ts", ζs0, function (ζ) {
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " hello world ", 0);
                ζend(ζ, ζc);
            });
            })();

            // end`, "1");

        // test with import at position 0
        r = await compile(`import { template } from "../iv";

            const x = template(\`() => {
                # hello world #}\`
            );

            // end`, options)

        assert.equal(r.fileContent, `import { template, ζinit, ζend, ζtxt, ζt } from "../iv";

            const x = (function () {
            const ζs0 = {};
            return ζt("x", "b/c.ts", ζs0, function (ζ) {
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " hello world ", 0);
                ζend(ζ, ζc);
            });
            })();

            // end`, "2");
    });

    it("should compile a template with dependency arguments", async function () {
        let src1 = `\// start
            import { template } from "../iv";
            const abc=123;

            const x = template(\`(name) => {
                # hello world {name} #
            }\`, abc);

            // end`;

        let r = await compile(src1, options);

        assert.equal(r.fileContent, `\// start
            import { template, ζinit, ζend, ζtxt, ζe, ζΔD, ζt } from "../iv";
            const abc=123;

            const x = (function () {
            const ζs0 = {}, ζs1 = [" hello world ", "", " "];
            @ζΔD class ζParams {
                name: any;
            }
            return ζt("x", "b/c.ts", ζs0, function (ζ, $, $api) {
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
            import{ template, ζtxt } from "../iv";

            let t1 = template(\`(a) => {
                # T1 #
            }\`);
            let x = 123, t2 = template(\`(p1:string, p2:number) => {
                # T1 #
            }\`);
            let z = "ABCD";
            `;

        let r = await compile(src2, { filePath: "test2.ts" });

        assert.equal(r.fileContent, `\
            import{ template, ζtxt, ζinit, ζend, ζΔD, ζt } from "../iv";

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
            import{ template, API } from "../iv";

            @API class FooApi {
                p1:string;
                p2:number;

                doSth:()=>void;
            }
            let tpl = template(\`($:FooApi) => {
                # tpl #
            }\`);
            `;

        const r = await process(src, { filePath: "test2.ts" });

        assert.equal(r, `\
            import{ template, API, ζΔfStr, ζΔp, ζΔfNbr, ζinit, ζend, ζtxt, ζt } from "../iv";

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
            import{ template, ζtxt } from "../iv";

            let t1 = template(\`(a) => {
                # T1 #
            }\`);
            let x = 123, t2 = template(\`(p1:string, p2:number) => {
                # T1 #
            }\`);
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
            await compile(` 
                import{ template } from "../iv";

                let t = template(\`(a) => {
                    # T1 

                }\`);
                `, options)
        } catch (e) {
            err = e as IvError;
        }
        assert.equal(formatError(err, 2), `
            XJS: Invalid text node - Unexpected end of template
            File: b/c.ts - Line 7 / Col 17
            Extract: >> } <<
        `, '1');

        try {
            await compile(` 
                import{ template } from "../iv";

                let t = template(\`(a) => {
                    <! foo="bar">
                        # Hello #
                    </>
                }\`);
                `, options)
        } catch (e) {
            err = e as IvError;
        }
        assert.equal(formatError(err, 2), `
            IVY: Invalid param - Parameters are not supported on Fragment nodes
            File: b/c.ts - Line 5 / Col 24
            Extract: >> <! foo="bar"> <<
        `, '2');
    });

});