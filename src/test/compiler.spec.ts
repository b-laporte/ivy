
import { assert } from "./common";
import { compile } from "../compiler/compiler";

describe('Iv compiler', () => {

    it('should compile a single function with no params', () => {
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

    it('should compile multiple functions with params', () => {
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

        tf0.fnHead = tf1.fnHead = "";
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

    it('should compile functions with simple nodes without bindings', function () {
        let src = `
            function hello(x:VdRenderer, foo:string, bar) {
                \`<div class="hello">
                     <span class="one" title="blah" foo=nbr+4> Hello </span>
                     <span class="two" baz=nbr+3 bar=nbr*2> World </span>
                 </div> \`
            }
        `;
        let cc = compile(src, "test3");

        assert.equal(cc.getOutput(), `
            function hello(x:VdRenderer, foo:string, bar) {
                let $a0: any = x.parent, $a1, $a2;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode;
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a1.props = { "class": "hello" };
                    $a2 = $el($a1, 2, "span", 0);
                    $a2.props = { "class": "one", "title": "blah", "foo": nbr+4 };
                    $tx($a2, 3, " Hello ");
                    $a2 = $el($a1, 4, "span", 0);
                    $a2.props = { "class": "two", "baz": nbr+3, "bar": nbr*2 };
                    $tx($a2, 5, " World ");
                    $a0.cm = 0;
                }
            }
        `, "output generation");
    });

    it('should compile functions with simple nodes with bindings', () => {
        let src = `
            function hello(r:VdRenderer, foo:string, bar) {
                \`<div class="hello">
                     <span class="one" title="blah" [foo]=nbr+4> Hello </span>
                     <span class="two" [baz]=nbr+3 [bar]=nbr*2> World </span>
                 </div> \`
            }
        `;
        let cc = compile(src, "test4");

        assert.equal(cc.getOutput(), `
            function hello(r:VdRenderer, foo:string, bar) {
                let $a0: any = r.parent, $a1, $a2;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp;
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a1.props = { "class": "hello" };
                    $a2 = $el($a1, 2, "span", 1);
                    $a2.props = { "class": "one", "title": "blah", "foo": nbr+4 };
                    $tx($a2, 3, " Hello ");
                    $a2 = $el($a1, 4, "span", 1);
                    $a2.props = { "class": "two", "baz": nbr+3, "bar": nbr*2 };
                    $tx($a2, 5, " World ");
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                    $up("foo", nbr+4, $a2, $a0);
                    $a2 = $a1.children[1];
                    $up("baz", nbr+3, $a2, $a0);
                    $up("bar", nbr*2, $a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile simple if blocks', () => {
        let src = `
            function hello(r:VdRenderer, nbr) {
                \`<div>
                    ABC
                    % if (nbr===42) {
                        <span> Hello </span>
                        <span> World </span>
                    % }
                    <span [title]=nbr> DEF </span>
                 </div> \`
            }
        `;
        let cc = compile(src, "test5");

        assert.equal(cc.getOutput(), `
            function hello(r:VdRenderer, nbr) {
                let $a0: any = r.parent, $a1, $a2, $a3, $i0, $i1;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp;
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                    $tx($a1, 2, " ABC ");
                } else {
                    $a1 = $a0.children[0];
                }
                $i0 = 1; $i1 = 1;
                if (nbr===42) {
                    $a2 = $cg($i1, $a1, $a0, $a0, 3);
                    $i1++;
                    if ($a2.cm) {
                        $a3 = $el($a2, 4, "span", 0);
                        $tx($a3, 5, " Hello ");
                        $a3 = $el($a2, 6, "span", 0);
                        $tx($a3, 7, " World ");
                        $a2.cm = 0;
                    }
                }
                if ($a0.cm) {
                    $a2 = $el($a1, 8, "span", 1);
                    $a2.props = { "title": nbr };
                    $tx($a2, 9, " DEF ");
                    $a0.cm = 0;
                } else {
                    $dg($i1, $a1, $a0, 8);
                    $a2 = $a1.children[$i1];
                    $up("title", nbr, $a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile if+else blocks and consecutive blocks', () => {
        let src = `
            function hello(r:VdRenderer, nbr) {
                \`<div>
                    % if (nbr===42) {
                        Case 42
                    % } else if (nbr===142) {
                        Case 142
                    % }
                 </div> \`
            }
        `;
        let cc = compile(src, "test6");

        assert.equal(cc.getOutput(), `
            function hello(r:VdRenderer, nbr) {
                let $a0: any = r.parent, $a1, $i0, $i1;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode;
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                } else {
                    $a1 = $a0.children[0];
                }
                $i0 = 1; $i1 = 0;
                if (nbr===42) {
                    $a2 = $cg($i1, $a1, $a0, $a0, 2);
                    $i1++;
                    if ($a2.cm) {
                        $tx($a2, 3, " Case 42 ");
                        $a2.cm = 0;
                    }
                }
                else if (nbr===142) {
                    $dg($i1, $a1, $a0, 4);
                    $a2 = $cg($i1, $a1, $a0, $a0, 4);
                    $i1++;
                    if ($a2.cm) {
                        $tx($a2, 5, " Case 142 ");
                        $a2.cm = 0;
                    }
                }
                if ($a0.cm) {
                    $a0.cm = 0;
                } else {
                    $dg($i1, $a1, $a0, 6);
                }
            }
        `, "output generation");

    });

    it('should compile non consecutive blocks', () => {
        let src = `
            function hello(r:VdRenderer, nbr) {
                \`<div>
                    ABC
                    % if (nbr>42) {
                        ++
                    % } 
                    <span [title]=nbr/>
                    % if (nbr>142) {
                        ++++
                    % }
                    DEF
                 </div> \`
            }
        `;
        let cc = compile(src, "test7");

        assert.equal(cc.getOutput(), `
            function hello(r:VdRenderer, nbr) {
                let $a0: any = r.parent, $a1, $a2, $i0, $i1;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp;
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                    $tx($a1, 2, " ABC ");
                } else {
                    $a1 = $a0.children[0];
                }
                $i0 = 1; $i1 = 1;
                if (nbr>42) {
                    $a2 = $cg($i1, $a1, $a0, $a0, 3);
                    $i1++;
                    if ($a2.cm) {
                        $tx($a2, 4, " ++ ");
                        $a2.cm = 0;
                    }
                }
                if ($a0.cm) {
                    $a2 = $el($a1, 5, "span", 1);
                    $a2.props = { "title": nbr };
                } else {
                    $dg($i1, $a1, $a0, 5);
                    $a2 = $a1.children[$i1];
                    $up("title", nbr, $a2, $a0);
                }
                $i1 += 1;
                if (nbr>142) {
                    $a2 = $cg($i1, $a1, $a0, $a0, 6);
                    $i1++;
                    if ($a2.cm) {
                        $tx($a2, 7, " ++++ ");
                        $a2.cm = 0;
                    }
                }
                if ($a0.cm) {
                    $tx($a1, 8, " DEF ");
                    $a0.cm = 0;
                } else {
                    $dg($i1, $a1, $a0, 8);
                }
            }
        `, "output generation");

    });

});
