import * as assert from 'assert';
import { compile, process } from '../iv/compiler/compiler';
import { IvError } from '../iv/compiler/generator';
import { formatError } from './utils';

describe('Template compiler', () => {

    it("should compile a single function with no params", async function () {
        let src1 = `\// start
            import { template } from "../iv";

            const x = template(\`() => {
                # hello world #
            }\`);

            // end`;

        let r = await compile(src1, "test1")

        assert.equal(r.fileContent, `\// start
            import { template, ζinit, ζend, ζtxt, ζt } from "../iv";

            const x = (function () {
            const ζs0 = {};
            return ζt(function (ζ) {
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " hello world ", 0);
                ζend(ζ, ζc);
            });
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

        let r = await compile(src2, "test2")

        assert.equal(r.fileContent, `\
            import{ template, ζtxt, ζinit, ζend, ζΔD, ζt } from "../iv";

            let t1 = (function () {
            const ζs0 = {};
            @ζΔD class ζParams {
                a: any;
            }
            return ζt(function (ζ, $) {
                let a = $["a"];
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " T1 ", 0);
                ζend(ζ, ζc);
            }, 0, ζParams);
            })();
            let x = 123, t2 = (function () {
            const ζs0 = {};
            @ζΔD class ζParams {
                p1: string;
                p2: number;
            }
            return ζt(function (ζ, $) {
                let p1 = $["p1"], p2 = $["p2"];
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " T1 ", 0);
                ζend(ζ, ζc);
            }, 0, ζParams);
            })();
            let z = "ABCD";
            `, "test 2");
    });

    it("should process $api classes", async function () {
        let src = `\
            import{ template, API } from "../iv";

            @API class FooApi {
                p1:string;
                p2:number;

                doSth:()=>void;
            }
            let tpl = template(\`($api:FooApi) => {
                # tpl #
            }\`);
            `;

        let r = await process(src, "test2")

        assert.equal(r, `\
            import{ template, API, ζΔfStr, ζΔp, ζΔfNbr, ζinit, ζend, ζtxt, ζt } from "../iv";

            @API class FooApi {
                ΔΔp1:string; @ζΔp(ζΔfStr) p1: string;
                ΔΔp2:number; @ζΔp(ζΔfNbr) p2: number;

                doSth:()=>void;
            }
            let tpl = (function () {
            const ζs0 = {};
            return ζt(function (ζ, $) {
                let $api = $;
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, 0, " tpl ", 0);
                ζend(ζ, ζc);
            }, 0, FooApi);
            })();
            `, "1");
    });

    it("should skipped files marked with iv:ignore comment", async function () {
        let src = `
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
        let r = await compile(src, "test3")
        assert.equal(r.fileContent, src, "test 3");
    });

    it("should not change files that don't contain templates", async function () {
        let src = `let x=123;`;
        let r = await compile(src, "test3")
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
                `, "file-name.ts")
        } catch (e) {
            err = e as IvError;
        }
        assert.equal(formatError(err, 2), `
            XJS: Invalid text node - Unexpected end of template
            File: file-name.ts - Line 7 / Col 17
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
                `, "file-name.ts")
        } catch (e) {
            err = e as IvError;
        }
        assert.equal(formatError(err, 2), `
            IVY: Invalid fragment - Params cannot be used on fragments
            File: file-name.ts - Line 5 / Col 21
            Extract: >> <! foo="bar"> <<
        `, '2');
    });

});