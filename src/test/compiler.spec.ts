
import { assert } from "./common";
import { compile } from "../compiler/compiler";

describe('Iv compiler', () => {
    const OPTIONS = { ivImports: false };
    let ivPath = "../iv";

    it('should compile a single function with no params', () => {
        let src = `\
            import { bar } from "../baz";

            function foo() {
                \` hello world \`
            }
        `;
        let cc = compile(src, "test1", ivPath); // return the new source

        assert.equal(cc.fileName, "test1", "fileName");
        assert.equal(cc.tplFunctions.length, 1, "one function found");
        let tf = cc.tplFunctions[0];
        assert.equal(tf.pos, 41, "original pos");
        assert.equal(tf.end, 117, "original end");
        assert.equal(tf.params.length, 0, "no params");
        assert.equal(tf.rootIndent, "                ", "root indentation");
        assert.equal(tf.tplString, " hello world ", "template string content");

        tf.fnHead = tf.rootIndent + "HEAD";
        tf.fnBody = tf.rootIndent + "BODY";

        assert.equal(cc.getOutput(), `\
            import { $iv, $tx } from "../iv";
            import { bar } from "../baz";

            function foo() {
                HEAD
                BODY
            }
        `, "output generation");
    });

    it('should not include $iv twice', () => {
        let src = `\
            import { $iv } from "../iv";

            function foo() {
                \` hello world \`
            }
        `;
        let cc = compile(src, "test1", ivPath); // return the new source

        assert.equal(cc.getOutput(), `\
            import { $tx } from "../iv";
            import { $iv } from "../iv";

            function foo() {
                let $a0: any = $iv.node;
                if ($a0.cm) {
                    $tx($a0, 1, " hello world ");
                    $a0.cm = 0;
                }
            }
        `, "output generation");
    });

    it('should compile multiple functions with params', () => {
        let src = `
            import { bar } from "../baz";

            function hello(foo:string, bar) {
                \` hello world \`
            }

            class Blah {
                render() {\`
                    hello 
                    brave 
                    new world
                \`}
            }
        `;
        let cc = compile(src, "test2", ivPath); // return the new source
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

        assert.equal(cc.getOutput(OPTIONS), `
            import { bar } from "../baz";

            function hello($d: any) {
                FUNC 0
            }

            class Blah {
                render() {
                    FUNC 1
                }
            }
        `, "output generation");
    });

    it('should compile functions with simple nodes without bindings', function () {
        let src = `
            function hello(foo:string, bar) {
                \`<div class="hello">
                     <span class="one" title="blah" foo=nbr+4> Hello </span>
                     <span class="two" baz=nbr+3 bar=nbr*2> World </span>
                 </div> \`
            }
        `;
        let cc = compile(src, "test3", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2;
                let foo = $d["foo"], bar = $d["bar"];
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
            function hello(foo:string, bar) {
                \`<div class="hello">
                     <span class="one" title="blah" [foo]=nbr+4> Hello </span>
                     <span class="two" [baz]=nbr+3 [bar]=nbr*2> World </span>
                 </div> \`
            }
        `;
        let cc = compile(src, "test4", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2;
                let foo = $d["foo"], bar = $d["bar"];
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

    it('should compile functions with attribute properties', () => {
        let src = `
            function hello(foo:string, bar) {
                \`---
                <div class="hello" [a:aria-disabled]=foo>
                     <span a:aria-expanded=false > Hello </span>
                </div> 
                 ---\`
            }
        `;
        let cc = compile(src, "att test", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2;
                let foo = $d["foo"], bar = $d["bar"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                    $a1.props = { "class": "hello" };
                    $a1.atts = { "aria-disabled": foo };
                    $a2 = $el($a1, 2, "span", 0);
                    $a2.atts = { "aria-expanded": false };
                    $tx($a2, 3, " Hello ");
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $ua("aria-disabled", foo, $a1, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile simple if blocks', () => {
        let src = `
            function hello(nbr) {
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
        let cc = compile(src, "test5", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $i0 = 0, $i1, $i2;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                    $tx($a1, 2, " ABC ");
                } else {
                    $a1 = $a0.children[0];
                }
                $i0 = 1; $i1 = 1;
                if (nbr===42) {
                    $a2 = $cg($i1, $a1, $a0, 3);
                    $i1++;
                    $i2 = 0;
                    if ($a2.cm) {
                        $a3 = $el($a2, 4, "span", 0);
                        $tx($a3, 5, " Hello ");
                        $a3 = $el($a2, 6, "span", 0);
                        $tx($a3, 7, " World ");
                        $a2.cm = 0;
                    }
                    $lg($a2, $a0);
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
            function hello(nbr) {
                \`<div>
                    % if (nbr===42) {
                        Case 42
                    % } else if (nbr===142) {
                        Case 142
                    % }
                 </div> \`
            }
        `;
        let cc = compile(src, "test6", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $i0 = 0, $i1, $i2;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                } else {
                    $a1 = $a0.children[0];
                }
                $i0 = 1; $i1 = 0;
                if (nbr===42) {
                    $a2 = $cg($i1, $a1, $a0, 2);
                    $i1++;
                    $i2 = 0;
                    if ($a2.cm) {
                        $tx($a2, 3, " Case 42 ");
                        $a2.cm = 0;
                    }
                    $lg($a2, $a0);
                }
                else if (nbr===142) {
                    $dg($i1, $a1, $a0, 4);
                    $a2 = $cg($i1, $a1, $a0, 4);
                    $i1++;
                    $i2 = 0;
                    if ($a2.cm) {
                        $tx($a2, 5, " Case 142 ");
                        $a2.cm = 0;
                    }
                    $lg($a2, $a0);
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
            function hello(nbr) {
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
        let cc = compile(src, "test7", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $i0 = 0, $i1, $i2;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                    $tx($a1, 2, " ABC ");
                } else {
                    $a1 = $a0.children[0];
                }
                $i0 = 1; $i1 = 1;
                if (nbr>42) {
                    $a2 = $cg($i1, $a1, $a0, 3);
                    $i1++;
                    $i2 = 0;
                    if ($a2.cm) {
                        $tx($a2, 4, " ++ ");
                        $a2.cm = 0;
                    }
                    $lg($a2, $a0);
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
                    $a2 = $cg($i1, $a1, $a0, 6);
                    $i1++;
                    $i2 = 0;
                    if ($a2.cm) {
                        $tx($a2, 7, " ++++ ");
                        $a2.cm = 0;
                    }
                    $lg($a2, $a0);
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

    it('should compile loops with no keys', () => {
        let src = `
            function hello(nbr) {
                \`<div title="first"/>
                  % for (let i=0;list.length>i;i++) {
                      <div [title]=("Hello " + list[i].name)/>
                  % }
                  <div [title]=list.length/> \`
            }
        `;
        let cc = compile(src, "test7 bis", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $i0 = 0, $i1;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a1.props = { "title": "first" };
                }
                $i0 = 1;
                for (let i=0;list.length>i;i++) {
                    $a1 = $cg($i0, $a0, $a0, 2);
                    $i0++;
                    $i1 = 0;
                    if ($a1.cm) {
                        $a2 = $el($a1, 3, "div", 1);
                        $a2.props = { "title": ("Hello " + list[i].name) };
                        $a1.cm = 0;
                    } else {
                        $a2 = $a1.children[0];
                        $up("title", ("Hello " + list[i].name), $a2, $a1);
                    }
                    $lg($a1, $a0);
                }
                if ($a0.cm) {
                    $a1 = $el($a0, 4, "div", 1);
                    $a1.props = { "title": list.length };
                    $a0.cm = 0;
                } else {
                    $dg($i0, $a0, $a0, 4);
                    $a1 = $a0.children[$i0];
                    $up("title", list.length, $a1, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile nested blocks', () => {
        let src = `
            function hello(nbr) {
                \`<div>
                    ABC
                    % if (nbr>42) {
                        <span [title]=nbr/>
                        % if (nbr>142) {
                            <span [title]=nbr+10/>
                        % }
                        <div>
                            <span [title]=nbr+20/>
                        </div>
                    % } 
                    DEF
                  </div> \`
            }
        `;
        let cc = compile(src, "test8", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $a4, $i0 = 0, $i1, $i2, $i3;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                    $tx($a1, 2, " ABC ");
                } else {
                    $a1 = $a0.children[0];
                }
                $i0 = 1; $i1 = 1;
                if (nbr>42) {
                    $a2 = $cg($i1, $a1, $a0, 3);
                    $i1++;
                    $i2 = 0;
                    if ($a2.cm) {
                        $a3 = $el($a2, 4, "span", 1);
                        $a3.props = { "title": nbr };
                    } else {
                        $a3 = $a2.children[0];
                        $up("title", nbr, $a3, $a2);
                    }
                    $i2 = 1;
                    if (nbr>142) {
                        $a3 = $cg($i2, $a2, $a2, 5);
                        $i2++;
                        $i3 = 0;
                        if ($a3.cm) {
                            $a4 = $el($a3, 6, "span", 1);
                            $a4.props = { "title": nbr+10 };
                            $a3.cm = 0;
                        } else {
                            $a4 = $a3.children[0];
                            $up("title", nbr+10, $a4, $a3);
                        }
                        $lg($a3, $a2);
                    }
                    if ($a2.cm) {
                        $a3 = $el($a2, 7, "div", 0);
                        $a4 = $el($a3, 8, "span", 1);
                        $a4.props = { "title": nbr+20 };
                        $a2.cm = 0;
                    } else {
                        $dg($i2, $a2, $a2, 7);
                        $a3 = $a2.children[$i2];
                        $a4 = $a3.children[0];
                        $up("title", nbr+20, $a4, $a2);
                    }
                    $lg($a2, $a0);
                }
                if ($a0.cm) {
                    $tx($a1, 9, " DEF ");
                    $a0.cm = 0;
                } else {
                    $dg($i1, $a1, $a0, 9);
                }
            }
        `, "output generation");
    });

    it('should compile js expressions at the beginning of a block', () => {
        let src = `
            function hello(nbr) {
                \`  % let x=123;
                    % let y="abc";
                    ABC
                    % if (nbr===42) {
                        % nbr += 3;
                        <span> Hello </span>
                    % }
                    % let w=9;
                    <span [title]=nbr> DEF </span> \`
            }
        `;
        let cc = compile(src, "test9", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $i0 = 0, $i1;
                let nbr = $d["nbr"];
                let x=123;
                let y="abc";
                if ($a0.cm) {
                    $tx($a0, 1, " ABC ");
                }
                $i0 = 1;
                if (nbr===42) {
                    $a1 = $cg($i0, $a0, $a0, 2);
                    $i0++;
                    $i1 = 0;
                    nbr += 3;
                    if ($a1.cm) {
                        $a2 = $el($a1, 3, "span", 0);
                        $tx($a2, 4, " Hello ");
                        $a1.cm = 0;
                    }
                    $lg($a1, $a0);
                }
                let w=9;
                if ($a0.cm) {
                    $a1 = $el($a0, 5, "span", 1);
                    $a1.props = { "title": nbr };
                    $tx($a1, 6, " DEF ");
                    $a0.cm = 0;
                } else {
                    $dg($i0, $a0, $a0, 5);
                    $a1 = $a0.children[$i0];
                    $up("title", nbr, $a1, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile sub-function calls and comments', () => {
        let src = `
            function hello(nbr) {
                \` <div>
                        <span> first </span>
                        // first call
                        <c:bar [value]=v+1 msg=("m1:"+v)/>
                        <c:bar [value]=v+3 msg=("m2:"+v)/>
                        /*
                         * Multi-line comment
                         */
                        <span> last </span>
                   </div> \`
            }
        `;
        let cc = compile(src, "test10", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a2 = $el($a1, 2, "span", 0);
                    $tx($a2, 3, " first ");
                    $a2 = $cc($a1, 4, { "value": v+1, "msg": ("m1:"+v) }, bar, 0, 1);
                    $a2 = $cc($a1, 5, { "value": v+3, "msg": ("m2:"+v) }, bar, 0, 1);
                    $a2 = $el($a1, 6, "span", 0);
                    $tx($a2, 7, " last ");
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[1];
                    $uc("value", v+1, $a2);
                    $rc($a2, $a0);
                    $a2 = $a1.children[2];
                    $uc("value", v+3, $a2);
                    $rc($a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile dynamic text nodes', () => {
        let src = `
            function hello(nbr) {
                \` <div>
                        "nbr {{nbr+1}}!"
                        !!!
                   </div> \`
            }
        `;
        let cc = compile(src, "test10 bis", ivPath);

        // todo dynamic part + concatenation of tx and dt instructions

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2;
                const $t0 = " \\"nbr ", $t1 = "!\\"\\n                        !!! ";
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $dt($a1, 2, $t0 + $ct(nbr+1) + $t1);
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                    $ut($t0 + $ct(nbr+1) + $t1, $a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile functions with main js blocks', () => {
        // same test as in compiler.spec and runtime.spec

        // function foo (visible, nbr:number) {
        //     `% visibile = visible || true;
        //      % if (visible) {
        //         <span>{{nbr}}</span>
        //      % }`
        // }

        let src = `
            function hello(visible, nbr) {
                \` % visibile = visible || true;
                   % if (visible) {
                      <span>{{nbr}}</span>
                   % } \`
            }
        `;
        let cc = compile(src, "test11", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $i0 = 0, $i1;
                let visible = $d["visible"], nbr = $d["nbr"];
                visibile = visible || true;
                if (visible) {
                    $a1 = $cg($i0, $a0, $a0, 1);
                    $i0++;
                    $i1 = 0;
                    if ($a1.cm) {
                        $a2 = $el($a1, 2, "span", 0);
                        $dt($a2, 3, "" + $ct(nbr));
                        $a1.cm = 0;
                    } else {
                        $a2 = $a1.children[0];
                        $a3 = $a2.children[0];
                        $ut("" + $ct(nbr), $a3, $a1);
                    }
                    $lg($a1, $a0);
                }
                if ($a0.cm) {
                    $a0.cm = 0;
                } else {
                    $dg($i0, $a0, $a0, 4);
                }
            }
        `, "output generation");

    });

    it('should compile functions with 2 nested full js blocks', () => {
        // same test as in compiler.spec and runtime.spec

        // function foo (visible, nbr:number) {
        //     `% visibile = visible || true;
        //      % if (visible) {
        //         <span>{{nbr}}</span>
        //      % }`
        // }

        let src = `
            function hello(visible, nbr) {
                \` <div>
                   % if (visible) {
                       % if (nbr === 42) {
                           <span>{{nbr}}</span>
                       % }
                   % } 
                   </div>\`
            }
        `;
        let cc = compile(src, "test11 bis", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $a4, $a5, $i0 = 0, $i1, $i2, $i3;
                let visible = $d["visible"], nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                } else {
                    $a1 = $a0.children[0];
                }
                $i0 = 1; $i1 = 0;
                if (visible) {
                    $a2 = $cg($i1, $a1, $a0, 2);
                    $i1++;
                    $i2 = 0;
                    if (nbr === 42) {
                        $a3 = $cg($i2, $a2, $a2, 3);
                        $i2++;
                        $i3 = 0;
                        if ($a3.cm) {
                            $a4 = $el($a3, 4, "span", 0);
                            $dt($a4, 5, "" + $ct(nbr));
                            $a3.cm = 0;
                        } else {
                            $a4 = $a3.children[0];
                            $a5 = $a4.children[0];
                            $ut("" + $ct(nbr), $a5, $a3);
                        }
                        $lg($a3, $a2);
                    }
                    if ($a2.cm) {
                        $a2.cm = 0;
                    } else {
                        $dg($i2, $a2, $a2, 6);
                    }
                    $lg($a2, $a0);
                }
                if ($a0.cm) {
                    $a0.cm = 0;
                } else {
                    $dg($i1, $a1, $a0, 6);
                }
            }
        `, "output generation");

    });

    it('should compile functions with function props', () => {
        let src = `
            function hello(foo:string, bar) {\`
                <div class="hello">
                    <span class="one" title="blah" onclick()=doSomething(foo,bar+2)> Hello </span>
                    % if (bar === 42) {
                        <span onmouseover(evt)=console.log(evt.srcElement)> hello </span>
                    % }
                    <span class="two" [baz]=nbr+3 feez()=blah(123)> World </span>
                </div> 
            \`}
        `;
        let cc = compile(src, "test15", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $i0 = 0, $i1, $i2, $f0, $f1, $f2;
                let foo = $d["foo"], bar = $d["bar"];
                $f0=function() {doSomething(foo,bar+2)};
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                    $a1.props = { "class": "hello" };
                    $a2 = $el($a1, 2, "span", 0);
                    $a2.props = { "class": "one", "title": "blah", "onclick": $f0 };
                    $tx($a2, 3, " Hello ");
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                    $up("onclick", $f0, $a2, $a0);
                }
                $i0 = 1; $i1 = 1;
                if (bar === 42) {
                    $a2 = $cg($i1, $a1, $a0, 4);
                    $i1++;
                    $i2 = 0;
                    $f1=function(evt) {console.log(evt.srcElement)};
                    if ($a2.cm) {
                        $a3 = $el($a2, 5, "span", 0);
                        $a3.props = { "onmouseover": $f1 };
                        $tx($a3, 6, " hello ");
                        $a2.cm = 0;
                    } else {
                        $a3 = $a2.children[0];
                        $up("onmouseover", $f1, $a3, $a2);
                    }
                    $lg($a2, $a0);
                }
                $f2=function() {blah(123)};
                if ($a0.cm) {
                    $a2 = $el($a1, 7, "span", 1);
                    $a2.props = { "class": "two", "baz": nbr+3, "feez": $f2 };
                    $tx($a2, 8, " World ");
                    $a0.cm = 0;
                } else {
                    $dg($i1, $a1, $a0, 7);
                    $a2 = $a1.children[$i1];
                    $up("baz", nbr+3, $a2, $a0);
                    $up("feez", $f2, $a2, $a0);
                } 
            }
        `, "output generation");
    });

    it('should compile functions with svg nodes', () => {
        let src = `
            function hello(radius) {
                \`<div>
                     <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(50,50)">
                            <circle class="clock-face" [r]=radius/>
                        </g>
                     </svg>
                 </div> \`
            }
        `;
        let cc = compile(src, "test svg", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $a4;
                let radius = $d["radius"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a2 = $el($a1, 2, "svg", 0);
                    $a2.atts = { "viewBox": "0 0 100 100", "xmlns": "http://www.w3.org/2000/svg" };
                    $a3 = $el($a2, 3, "g", 0);
                    $a3.atts = { "transform": "translate(50,50)" };
                    $a4 = $el($a3, 4, "circle", 1);
                    $a4.atts = { "class": "clock-face", "r": radius };
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                    $a3 = $a2.children[0];
                    $a4 = $a3.children[0];
                    $ua("r", radius, $a4, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile sub-function calls with content node and dynamic prop', () => {
        let src = `
            function hello(nbr) {
                \` <div>
                        <c:bar [value]=nbr>
                            <span> {{nbr+1}} </span>
                            <span> {{nbr+2}} </span>
                        </c:bar>
                   </div> \`
            }
        `;
        let cc = compile(src, "test10 ter", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $a4;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a2 = $cc($a1, 2, { "value": nbr }, bar, 1, 1);
                    $a3 = $el($a2, 3, "span", 0);
                    $dt($a3, 4, "" + $ct(nbr+1));
                    $a3 = $el($a2, 5, "span", 0);
                    $dt($a3, 6, "" + $ct(nbr+2));
                    $rc($a2, $a0);
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                    $uc("value", nbr, $a2);
                    $a2 = $ec($a2);
                    $a3 = $a2.children[0];
                    $a4 = $a3.children[0];
                    $ut("" + $ct(nbr+1), $a4, $a2);
                    $a3 = $a2.children[1];
                    $a4 = $a3.children[0];
                    $ut("" + $ct(nbr+2), $a4, $a2);
                    $rc($a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile sub-function calls with js block content', () => {
        let src = `
            function hello(nbr) {
                \` <div>
                        <c:bar [value]=nbr>
                            {{nbr+1}}
                            % if (nbr===42) {
                                {{nbr+2}}
                            % }
                            {{nbr+3}}
                        </c:bar>
                        Hello
                   </div> \`
            }
        `;
        let cc = compile(src, "test10.4", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $a4, $i0 = 0, $i1, $i2, $i3;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a2 = $cc($a1, 2, { "value": nbr }, bar, 1, 1);
                    $dt($a2, 3, "" + $ct(nbr+1));
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                    $uc("value", nbr, $a2);
                    $a2 = $ec($a2);
                    $a3 = $a2.children[0];
                    $ut("" + $ct(nbr+1), $a3, $a2);
                }
                $i0 = 1; $i1 = 1; $i2 = 1;
                if (nbr===42) {
                    $a3 = $cg($i2, $a2, $a0, 4);
                    $i2++;
                    $i3 = 0;
                    if ($a3.cm) {
                        $dt($a3, 5, "" + $ct(nbr+2));
                        $a3.cm = 0;
                    } else {
                        $a4 = $a3.children[0];
                        $ut("" + $ct(nbr+2), $a4, $a3);
                    }
                    $lg($a3, $a2);
                }
                if ($a0.cm) {
                    $dt($a2, 6, "" + $ct(nbr+3));
                    $rc($a2, $a0);
                    $tx($a1, 7, " Hello ");
                    $a0.cm = 0;
                } else {
                    $dg($i2, $a2, $a2, 6);
                    $a3 = $a2.children[$i2];
                    $ut("" + $ct(nbr+3), $a3, $a2);
                    $rc($a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile sub-function calls with js block as full content', () => {
        let src = `
            function hello(nbr) {
                \` <div>
                        <c:bar [value]=nbr>
                            % if (nbr===42) {
                                {{nbr+2}}
                            % }
                        </c:bar>
                   </div> \`
            }
        `;
        let cc = compile(src, "test10.5", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $a4, $i0 = 0, $i1, $i2, $i3;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a2 = $cc($a1, 2, { "value": nbr }, bar, 1, 1);
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                    $uc("value", nbr, $a2);
                    $a2 = $ec($a2);
                }
                $i0 = 1; $i1 = 1; $i2 = 0;
                if (nbr===42) {
                    $a3 = $cg($i2, $a2, $a0, 3);
                    $i2++;
                    $i3 = 0;
                    if ($a3.cm) {
                        $dt($a3, 4, "" + $ct(nbr+2));
                        $a3.cm = 0;
                    } else {
                        $a4 = $a3.children[0];
                        $ut("" + $ct(nbr+2), $a4, $a3);
                    }
                    $lg($a3, $a2);
                }
                if ($a0.cm) {
                    $rc($a2, $a0);
                    $a0.cm = 0;
                } else {
                    $dg($i2, $a2, $a2, 5);
                    $rc($a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile sub-function calls with content node and no dynamic props', () => {
        let src = `
            function hello(nbr) {
                \` <div>
                        <c:bar>
                            <span> {{nbr+1}} </span>
                        </c:bar>
                   </div> \`
            }
        `;
        let cc = compile(src, "test10.6", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $a4;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a2 = $cc($a1, 2, {  }, bar, 1, 0);
                    $a3 = $el($a2, 3, "span", 0);
                    $dt($a3, 4, "" + $ct(nbr+1));
                    $rc($a2, $a0);
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                    $a2 = $ec($a2);
                    $a3 = $a2.children[0];
                    $a4 = $a3.children[0];
                    $ut("" + $ct(nbr+1), $a4, $a2);
                    $rc($a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile insert statements', () => {
        let src = `
            function hello(body) {
                \` <div>
                        <ins:body/>
                   </div> \`
            }
        `;
        let cc = compile(src, "test10.7", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2;
                let body = $d["body"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                    $a2 = $in($a1, 2, body, $a0);
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $ri($a1, 0, body, $a0);
                }
            }
        `, "output generation");
    });

    it('should properly handle index reset', () => {
        let src = `
            function hello(nbr) {
                \`  <div>
                        <div>
                        % if (true) {
                            OK
                        % }
                        </div>
                    </div>
                    <div>
                        % if (nbr>0) {
                        Clear
                        % }
                    </div> \`
            }
        `;
        let cc = compile(src, "index reset", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $i0 = 0, $i1, $i2, $i3;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a2 = $el($a1, 2, "div", 1);
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                }
                $i0 = 1; $i1 = 1; $i2 = 0;
                if (true) {
                    $a3 = $cg($i2, $a2, $a0, 3);
                    $i2++;
                    $i3 = 0;
                    if ($a3.cm) {
                        $tx($a3, 4, " OK ");
                        $a3.cm = 0;
                    }
                    $lg($a3, $a0);
                }
                if ($a0.cm) {
                    $a1 = $el($a0, 5, "div", 1);
                } else {
                    $dg($i2, $a2, $a0, 5);
                    $a1 = $a0.children[$i0];
                }
                $i0 += 1; $i1 = 0;
                if (nbr>0) {
                    $a2 = $cg($i1, $a1, $a0, 6);
                    $i1++;
                    $i2 = 0;
                    if ($a2.cm) {
                        $tx($a2, 7, " Clear ");
                        $a2.cm = 0;
                    }
                    $lg($a2, $a0);
                }
                if ($a0.cm) {
                    $a0.cm = 0;
                } else {
                    $dg($i1, $a1, $a0, 8);
                }
            }
        `, "output generation");
    });

    it('should compile data nodes with bindings', () => {
        let src = `
            function hello(foo:string, bar) {
                \`<div class="hello">
                     <:title [type]=foo> Greeting {{bar}} </:title>
                     Hello World ! {{bar+"..."}}
                     <:footer> Have a nice day </:footer>
                 </div> \`
            }
        `;
        let cc = compile(src, "test4.1", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function hello($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3;
                const $t0 = " Greeting ", $t1 = " Hello World ! ";
                let foo = $d["foo"], bar = $d["bar"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a1.props = { "class": "hello" };
                    $a2 = $dn($a1, 2, "title", 1);
                    $a2.props = { "type": foo };
                    $dt($a2, 3, $t0 + $ct(bar));
                    $dt($a1, 4, $t1 + $ct(bar+"..."));
                    $a2 = $dn($a1, 5, "footer", 0);
                    $tx($a2, 6, " Have a nice day ");
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                    $ed($a2);
                    $up("type", foo, $a2, $a2);
                    $a3 = $a2.children[0];
                    $ut($t0 + $ct(bar), $a3, $a2);
                    $rd($a2, $a0);
                    $a2 = $a1.children[1];
                    $ut($t1 + $ct(bar+"..."), $a2, $a0);
                    $a2 = $a1.children[2];
                    $ed($a2);
                    $rd($a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile data nodes mixed with if blocks in components', () => {
        let src = `
            function test(showFirst, showLast) {
                \`<c:menu>
                    {{showFirst && showLast}}
                    % if (showFirst) {
                        <:item key="F"> First item </:item>
                    % }
                    % if (showLast) {
                        <:item key="L"> Last item {{showFirst}} </:item>
                    % }
                </c:menu> \`
            }
        `;

        let cc = compile(src, "data nodes in components", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            function test($d: any) {
                let $a0: any = $iv.node, $a1, $a2, $a3, $a4, $i0 = 0, $i1, $i2;
                const $t0 = " Last item ";
                let showFirst = $d["showFirst"], showLast = $d["showLast"];
                if ($a0.cm) {
                    $a1 = $cc($a0, 1, {  }, menu, 1, 0);
                    $dt($a1, 2, "" + $ct(showFirst && showLast));
                } else {
                    $a1 = $a0.children[0];
                    $a1 = $ec($a1);
                    $a2 = $a1.children[0];
                    $ut("" + $ct(showFirst && showLast), $a2, $a1);
                }
                $i0 = 1; $i1 = 1;
                if (showFirst) {
                    $a2 = $cg($i1, $a1, $a0, 3);
                    $i1++;
                    $i2 = 0;
                    if ($a2.cm) {
                        $a3 = $dn($a2, 4, "item", 0);
                        $a3.props = { "key": "F" };
                        $tx($a3, 5, " First item ");
                        $a2.cm = 0;
                    } else {
                        $a3 = $a2.children[0];
                        $ed($a3);
                        $rd($a3, $a2);
                    }
                    $lg($a2, $a1);
                }
                if (showLast) {
                    $dg($i1, $a1, $a1, 6);
                    $a2 = $cg($i1, $a1, $a0, 6);
                    $i1++;
                    $i2 = 0;
                    if ($a2.cm) {
                        $a3 = $dn($a2, 7, "item", 0);
                        $a3.props = { "key": "L" };
                        $dt($a3, 8, $t0 + $ct(showFirst));
                        $a2.cm = 0;
                    } else {
                        $a3 = $a2.children[0];
                        $ed($a3);
                        $a4 = $a3.children[0];
                        $ut($t0 + $ct(showFirst), $a4, $a3);
                        $rd($a3, $a2);
                    }
                    $lg($a2, $a1);
                }
                if ($a0.cm) {
                    $rc($a1, $a0);
                    $a0.cm = 0;
                } else {
                    $dg($i1, $a1, $a1, 9);
                    $rc($a1, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile class components with event handlers', () => {
        let src = `
            let box = $component( class {
                props: { size: number, text: string };
                count = 0;

                increment() {
                    this.count++;
                }

                render() {
                    \`---
                    % let sz = this.props.size || 100;
                    <span [a:class]=("box"+sz) onmouseenter()=this.increment() onmouseleave(e)=this.increment(e) >
                        {{this.props.text}}
                    </span> 
                    ---\`
                }
            });
        `;

        let cc = compile(src, "data nodes in components", ivPath);

        assert.equal(cc.getOutput(OPTIONS), `
            let box = $component( class {
                props: { size: number, text: string };
                count = 0;

                increment() {
                    this.count++;
                }

                render() {
                    let $a0: any = $iv.node, $a1, $a2, $f0, $f1;
                    let sz = this.props.size || 100;
                    $f0=() => {this.increment()};
                    $f1=(e) => {this.increment(e)};
                    if ($a0.cm) {
                        $a1 = $el($a0, 1, "span", 1);
                        $a1.props = { "onmouseenter": $f0, "onmouseleave": $f1 };
                        $a1.atts = { "class": ("box"+sz) };
                        $dt($a1, 2, "" + $ct(this.props.text));
                        $a0.cm = 0;
                    } else {
                        $a1 = $a0.children[0];
                        $ua("class", ("box"+sz), $a1, $a0);
                        $up("onmouseenter", $f0, $a1, $a0);
                        $up("onmouseleave", $f1, $a1, $a0);
                        $a2 = $a1.children[0];
                        $ut("" + $ct(this.props.text), $a2, $a0);
                    }
                }
            });
        `, "output generation");
    });

    it('should compile props maps using paths', () => {
        let src = `
            function hello(highlight) {
                \`<div [class.important]=(highlight===true)> hello </div> \`
            }
        `;
        let cc = compile(src, "test4.1", ivPath);

        assert.equal(cc.getOutput(), `\
            import { $iv, $el, $cm, $tx, $um } from "../iv";

            function hello($d: any) {
                let $a0: any = $iv.node, $a1;
                let highlight = $d["highlight"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                    $cm("class", "important", 0, 0, (highlight===true), $a1);
                    $tx($a1, 2, " hello ");
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $um("class", "important", 0, 0, (highlight===true), $a1, $a0);
                }
            }
        `, "output generation");
    });
});
