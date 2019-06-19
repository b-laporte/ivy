import * as assert from 'assert';
import { compile } from '../iv/compiler/compiler';

describe('Template compiler', () => {

    it("should compile a single function with no params", async function () {
        let src1 = `\// start
            import { template } from "../iv";

            const x = template(\`() => {
                # hello world #
            }\`);

            // end`;

        let r = await compile(src1, "test1")

        assert.equal(r, `\// start
            import { template, ζinit, ζend, ζtxt, ζt } from "../iv";

            const x = (function () {
            const ζs0 = {};
            return ζt(function (ζ) {
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, " hello world ", 0);
                ζend(ζ, ζc);
            });
            })();

            // end`, "test 1");
    });

    it("should compile a multiple functions with params and partial imports", async function () {
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

        assert.equal(r, `\
            import{ template, ζtxt, ζinit, ζend, ζΔp, ζΔD, ζt } from "../iv";

            let t1 = (function () {
            const ζs0 = {};
            @ζΔD class ζParams {
                ΔΔa: any; @ζΔp() a: any;
            }
            return ζt(function (ζ, $) {
                let a = $["a"];
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, " T1 ", 0);
                ζend(ζ, ζc);
            }, 0, ζParams);
            })();
            let x = 123, t2 = (function () {
            const ζs0 = {};
            @ζΔD class ζParams {
                ΔΔp1: any; @ζΔp() p1: any;
                ΔΔp2: any; @ζΔp() p2: any;
            }
            return ζt(function (ζ, $) {
                let p1 = $["p1"], p2 = $["p2"];
                let ζc = ζinit(ζ, ζs0, 1);
                ζtxt(ζ, ζc, 0, 0, 0, " T1 ", 0);
                ζend(ζ, ζc);
            }, 0, ζParams);
            })();
            let z = "ABCD";
            `, "test 2");
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
        assert.equal(r, src, "test 3");
    });

    it("should not change files that don't contain templates", async function () {
        let src = `let x=123;`;
        let r = await compile(src, "test3")
        assert.equal(r, src, "test 3");
    });

    it("should raise errors with file name and line numbers", async function () {
        let errMsg = "";
        try {
            await compile(` import{ template } from "../iv";
    
                            let t = template(\`(a) => {
                                # T1 
                            }\`);
                            `, "file-name.ts")
        } catch (e) {
            errMsg = e.message
        }
        assert.equal(errMsg, 'Invalid text node - Unexpected end of template at line #5 in file-name.ts', "error 1"); // XJS error

        try {
            await compile(` import{ template } from "../iv";
    
                            let t = template(\`(a) => {
                                <! foo="bar">
                                    # Hello #
                                </>
                            }\`);
                            `, "file-name.ts")
        } catch (e) {
            errMsg = e.message
        }
        assert.equal(errMsg, 'Invalid fragment - Params cannot be used on fragments (line #4 in file-name.ts)', "error 2");
    });

});