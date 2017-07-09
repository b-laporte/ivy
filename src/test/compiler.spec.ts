
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
        assert.equal(tf.pos, 50, "original pos");
        assert.equal(tf.end, 138, "original end");
        assert.equal(tf.params.length, 0, "no params");
        assert.equal(tf.rendererNm, "r", "VdRenderer name");
        assert.equal(tf.rootIndent, "                ", "root indentation");
        assert.equal(tf.tplString, " hello world ", "template string content");

        tf.fnHead = tf.rootIndent + "HEAD";
        tf.fnBody = tf.rootIndent + "BODY";

        assert.equal(cc.getOutput(), `
            import { VdomRenderer } from "../iv";

            function foo(r: VdRenderer) {
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
                render(r:VdRenderer) {\`
                    hello 
                    brave 
                    new world
                \`}
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

            function hello(r: VdRenderer, $d: any) {
                FUNC 0
            }

            class Blah {
                render(r: VdRenderer) {
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
            function hello(x: VdRenderer, $d: any) {
                let $a0: any = x.parent, $a1, $a2;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode;
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
            function hello(r:VdRenderer, foo:string, bar) {
                \`<div class="hello">
                     <span class="one" title="blah" [foo]=nbr+4> Hello </span>
                     <span class="two" [baz]=nbr+3 [bar]=nbr*2> World </span>
                 </div> \`
            }
        `;
        let cc = compile(src, "test4");

        assert.equal(cc.getOutput(), `
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp;
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
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2, $a3, $i0 = 0, $i1, $i2;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $cg = $.checkGroup, $dg = $.deleteGroups, $up = $.updateProp;
                let nbr = $d["nbr"];
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
                    $i2 = 0;
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
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2, $i0 = 0, $i1, $i2;
                const $ = r.rt, $el = $.createEltNode, $cg = $.checkGroup, $tx = $.createTxtNode, $dg = $.deleteGroups;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                } else {
                    $a1 = $a0.children[0];
                }
                $i0 = 1; $i1 = 0;
                if (nbr===42) {
                    $a2 = $cg($i1, $a1, $a0, $a0, 2);
                    $i1++;
                    $i2 = 0;
                    if ($a2.cm) {
                        $tx($a2, 3, " Case 42 ");
                        $a2.cm = 0;
                    }
                }
                else if (nbr===142) {
                    $dg($i1, $a1, $a0, 4);
                    $a2 = $cg($i1, $a1, $a0, $a0, 4);
                    $i1++;
                    $i2 = 0;
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
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2, $i0 = 0, $i1, $i2;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $cg = $.checkGroup, $dg = $.deleteGroups, $up = $.updateProp;
                let nbr = $d["nbr"];
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
                    $i2 = 0;
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
                    $i2 = 0;
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

    it('should compile loops with no keys', () => {
        let src = `
            function hello(r:VdRenderer, nbr) {
                \`<div title="first"/>
                  % for (let i=0;list.length>i;i++) {
                      <div [title]=("Hello " + list[i].name)/>
                  % }
                  <div [title]=list.length/> \`
            }
        `;
        let cc = compile(src, "test7");

        assert.equal(cc.getOutput(), `
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2, $i0 = 0, $i1;
                const $ = r.rt, $el = $.createEltNode, $cg = $.checkGroup, $up = $.updateProp, $dg = $.deleteGroups;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a1.props = { "title": "first" };
                }
                $i0 = 1;
                for (let i=0;list.length>i;i++) {
                    $a1 = $cg($i0, $a0, $a0, $a0, 2);
                    $i0++;
                    $i1 = 0;
                    if ($a1.cm) {
                        $a2 = $el($a1, 3, "div", 1);
                        $a2.props = { "title": ("Hello " + list[i].name) };
                        $a1.cm = 0;
                    } else {
                        $a2 = $a1.children[0];
                        $up("title", ("Hello " + list[i].name), $a2, $a0);
                    }
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
            function hello(r:VdRenderer, nbr) {
                \`<div>
                    ABC
                    % if (nbr>42) {
                        <span [title]=nbr/>
                        % if (nbr>142) {
                            <span [title]=nbr+10/>
                        % }
                        <span [title]=nbr+20/>
                    % } 
                    DEF
                  </div> \`
            }
        `;
        let cc = compile(src, "test8");

        assert.equal(cc.getOutput(), `
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2, $a3, $a4, $i0 = 0, $i1, $i2, $i3;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $cg = $.checkGroup, $up = $.updateProp, $dg = $.deleteGroups;
                let nbr = $d["nbr"];
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
                    $i2 = 0;
                    if ($a2.cm) {
                        $a3 = $el($a2, 4, "span", 1);
                        $a3.props = { "title": nbr };
                    } else {
                        $a3 = $a2.children[0];
                        $up("title", nbr, $a3, $a0);
                    }
                    $i2 = 1;
                    if (nbr>142) {
                        $a3 = $cg($i2, $a2, $a0, $a2, 5);
                        $i2++;
                        $i3 = 0;
                        if ($a3.cm) {
                            $a4 = $el($a3, 6, "span", 1);
                            $a4.props = { "title": nbr+10 };
                            $a3.cm = 0;
                        } else {
                            $a4 = $a3.children[0];
                            $up("title", nbr+10, $a4, $a0);
                        }
                    }
                    if ($a2.cm) {
                        $a3 = $el($a2, 7, "span", 1);
                        $a3.props = { "title": nbr+20 };
                        $a2.cm = 0;
                    } else {
                        $dg($i2, $a2, $a0, 7);
                        $a3 = $a2.children[$i2];
                        $up("title", nbr+20, $a3, $a0);
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

    it('should compile js expressions at the beginning of a block', () => {
        let src = `
            function hello(r:VdRenderer, nbr) {
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
        let cc = compile(src, "test9");

        assert.equal(cc.getOutput(), `
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2, $i0 = 0, $i1;
                const $ = r.rt, $tx = $.createTxtNode, $cg = $.checkGroup, $el = $.createEltNode, $dg = $.deleteGroups, $up = $.updateProp;
                let nbr = $d["nbr"];
                let x=123;
                let y="abc";
                if ($a0.cm) {
                    $tx($a0, 1, " ABC ");
                }
                $i0 = 1;
                if (nbr===42) {
                    $a1 = $cg($i0, $a0, $a0, $a0, 2);
                    $i0++;
                    $i1 = 0;
                    nbr += 3;
                    if ($a1.cm) {
                        $a2 = $el($a1, 3, "span", 0);
                        $tx($a2, 4, " Hello ");
                        $a1.cm = 0;
                    }
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
            function hello(r:VdRenderer, nbr) {
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
        let cc = compile(src, "test10");

        assert.equal(cc.getOutput(), `
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $cc = $.createCpt, $uc = $.updateCptProp, $rc = $.refreshCpt;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $a2 = $el($a1, 2, "span", 0);
                    $tx($a2, 3, " first ");
                    $a2 = $cc($a1, 4, { "value": v+1, "msg": ("m1:"+v) }, 1, r, bar);
                    $a2 = $cc($a1, 5, { "value": v+3, "msg": ("m2:"+v) }, 1, r, bar);
                    $a2 = $el($a1, 6, "span", 0);
                    $tx($a2, 7, " last ");
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[1];
                    $uc("value", v+1, $a2);
                    $rc(r, $a2, $a0);
                    $a2 = $a1.children[2];
                    $uc("value", v+3, $a2);
                    $rc(r, $a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile dynamic text nodes', () => {
        let src = `
            function hello(r:VdRenderer, nbr) {
                \` <div>
                        "nbr {{nbr+1}}!"
                        !!!
                   </div> \`
            }
        `;
        let cc = compile(src, "test10");

        // todo dynamic part + concatenation of tx and dt instructions

        assert.equal(cc.getOutput(), `
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2;
                const $ = r.rt, $t0 = " \\"nbr ", $t1 = "!\\"\\n                        !!! ", $el = $.createEltNode, $dt = $.dynTxtNode, $ut = $.updateText;
                let nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 0);
                    $dt($a1, 2, $t0 + (nbr+1) + $t1);
                    $a0.cm = 0;
                } else {
                    $a1 = $a0.children[0];
                    $a2 = $a1.children[0];
                    $ut($t0 + (nbr+1) + $t1, $a2, $a0);
                }
            }
        `, "output generation");
    });

    it('should compile functions with main js blocks', () => {
        // same test as in compiler.spec and runtime.spec

        // function foo (r: VdRenderer, visible, nbr:number) {
        //     `% visibile = visible || true;
        //      % if (visible) {
        //         <span>{{nbr}}</span>
        //      % }`
        // }

        let src = `
            function hello(r:VdRenderer, visible, nbr) {
                \` % visibile = visible || true;
                   % if (visible) {
                      <span>{{nbr}}</span>
                   % } \`
            }
        `;
        let cc = compile(src, "test11");

        assert.equal(cc.getOutput(), `
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2, $a3, $i0 = 0, $i1;
                const $ = r.rt, $cg = $.checkGroup, $el = $.createEltNode, $dt = $.dynTxtNode, $ut = $.updateText, $dg = $.deleteGroups;
                let visible = $d["visible"], nbr = $d["nbr"];
                visibile = visible || true;
                if (visible) {
                    $a1 = $cg($i0, $a0, $a0, $a0, 1);
                    $i0++;
                    $i1 = 0;
                    if ($a1.cm) {
                        $a2 = $el($a1, 2, "span", 0);
                        $dt($a2, 3, "" + (nbr));
                        $a1.cm = 0;
                    } else {
                        $a2 = $a1.children[0];
                        $a3 = $a2.children[0];
                        $ut("" + (nbr), $a3, $a0);
                    }
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

        // function foo (r: VdRenderer, visible, nbr:number) {
        //     `% visibile = visible || true;
        //      % if (visible) {
        //         <span>{{nbr}}</span>
        //      % }`
        // }

        let src = `
            function hello(r:VdRenderer, visible, nbr) {
                \` <div>
                   % if (visible) {
                       % if (nbr === 42) {
                           <span>{{nbr}}</span>
                       % }
                   % } 
                   </div>\`
            }
        `;
        let cc = compile(src, "test11");

        assert.equal(cc.getOutput(), `
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2, $a3, $a4, $a5, $i0 = 0, $i1, $i2, $i3;
                const $ = r.rt, $el = $.createEltNode, $cg = $.checkGroup, $dt = $.dynTxtNode, $ut = $.updateText, $dg = $.deleteGroups;
                let visible = $d["visible"], nbr = $d["nbr"];
                if ($a0.cm) {
                    $a1 = $el($a0, 1, "div", 1);
                } else {
                    $a1 = $a0.children[0];
                }
                $i0 = 1; $i1 = 0;
                if (visible) {
                    $a2 = $cg($i1, $a1, $a0, $a0, 2);
                    $i1++;
                    $i2 = 0;
                    if (nbr === 42) {
                        $a3 = $cg($i2, $a2, $a0, $a2, 3);
                        $i2++;
                        $i3 = 0;
                        if ($a3.cm) {
                            $a4 = $el($a3, 4, "span", 0);
                            $dt($a4, 5, "" + (nbr));
                            $a3.cm = 0;
                        } else {
                            $a4 = $a3.children[0];
                            $a5 = $a4.children[0];
                            $ut("" + (nbr), $a5, $a0);
                        }
                    }
                    if ($a2.cm) {
                        $a2.cm = 0;
                    } else {
                        $dg($i2, $a2, $a0, 6);
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

    it('should compile functions with function props', () => {
        let src = `
            function hello(r:VdRenderer, foo:string, bar) {\`
                <div class="hello">
                    <span class="one" title="blah" onclick()=doSomething(foo,bar+2)> Hello </span>
                    % if (bar === 42) {
                        <span onmouseover(evt)=console.log(evt.srcElement)> hello </span>
                    % }
                    <span class="two" [baz]=nbr+3 feez()=blah(123)> World </span>
                </div> 
            \`}
        `;
        let cc = compile(src, "test15");

        assert.equal(cc.getOutput(), `
            function hello(r: VdRenderer, $d: any) {
                let $a0: any = r.parent, $a1, $a2, $a3, $i0 = 0, $i1, $i2, $f0, $f1, $f2;
                const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp, $cg = $.checkGroup, $dg = $.deleteGroups;
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
                    $a2 = $cg($i1, $a1, $a0, $a0, 4);
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
                        $up("onmouseover", $f1, $a3, $a0);
                    }
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

});
