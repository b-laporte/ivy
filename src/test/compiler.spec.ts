
import { assert } from "./common";
import { compile } from "../compiler/compiler";

describe('Iv compiler', () => {

    it('should compile a single function with no params', function () {
        let src = `
            import { VdomRenderer } from "../iv";

            function foo(r:VdRenderer) {
                \` hello world \`
            }
        `;
        let cc = compile(src, "test1"); // return the new source

        assert.equal(cc.fileName, "test1", "fileName");
        assert.equal(cc.tplFunctions.length, 1, "one function found");
        let tf = cc.tplFunctions[0];
        assert.equal(tf.pos, 92, "original pos");
        assert.equal(tf.end, 124, "original end");
        assert.equal(tf.params.length, 0, "no params");
        assert.equal(tf.rendererNm, "r", "VdRenderer name");
        assert.equal(tf.rootIndent, "                ", "root indentation");
        assert.equal(tf.tplString, " hello world ", "template string content");

        tf.fnHead = tf.rootIndent + "HEAD";
        tf.fnBody = tf.rootIndent + "BODY";

        assert.equal(cc.getOutput(), `
            import { VdomRenderer } from "../iv";

            function foo(r:VdRenderer) {
                HEAD
                BODY
            }
        `, "output generation");
    });

    it('should compile multiple functions with params', function () {
        let src = `
            import { VdomRenderer } from "../iv";

            function hello(r:VdRenderer, foo:string, bar) {
                \` hello world \`
            }

            class Blah {
                render(r:VdRenderer) {
                    \` hello 
                    brave 
                    new world \`
                }
            }
        `;
        let cc = compile(src, "test2"); // return the new source
        assert.equal(cc.tplFunctions.length, 2, "nbr of template functions");
        let tf0 = cc.tplFunctions[0], tf1 = cc.tplFunctions[1];
        assert.equal(tf0.params.length, 2, "2 params in first template");
        assert.equal(tf0.params[0].name, "foo", "foo name");
        assert.equal(tf0.params[0].type, "string", "foo type");
        assert.equal(tf0.params[1].name, "bar", "bar name");
        assert.equal(tf0.params[1].type, "", "bar type");

        tf0.fnBody = tf0.rootIndent + "FUNC 0";
        tf1.fnBody = tf1.rootIndent + "FUNC 1";

        assert.equal(cc.getOutput(), `
            import { VdomRenderer } from "../iv";

            function hello(r:VdRenderer, foo:string, bar) {
                FUNC 0
            }

            class Blah {
                render(r:VdRenderer) {
                    FUNC 1
                }
            }
        `, "output generation");
    });

    it('should compile functions with simple code', function () {
        let src = `
            function hello(r:VdRenderer, foo:string, bar) {
                \`<div class="hello">
                     <span class="one" title="blah" foo=nbr+4> Hello </span>
                     <span class="two" [baz]=nbr+3 [bar]=nbr*2> World </span>
                 </div> \`
            }
        `;

        let cc = compile(src, "test3");

        assert.equal(cc.getOutput(), `
            function hello(r:VdRenderer, foo:string, bar) {
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a2 = $el($a1, 2, "span", 0);
                    $tx($a2, 3, " Hello ");
                    $a2 = $el($a1, 4, "span", 0);
                    $tx($a2, 5, " World ");
                }
                $i0 = 2;$i1 = 1;
            }
        `, "output generation");
    });

});
