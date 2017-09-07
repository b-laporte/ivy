
import { assert, createTestRenderer } from "./common";
import { VdRenderer, $el, $tx, $up, $cg, $dg, $cc, $uc, $rc, $iv } from "../iv";
import { VdChangeContainer } from "../vdom";

describe('IV runtime', () => {

    let OPTIONS = { baseIndent: "        " }

    it('should create and update simple nodes', () => {
        // function test(r: VdRenderer, nbr) {
        //     `<div class="hello">
        //         // some comment
        //         <span class="one" title="blah" foo=nbr+4> Hello </span>
        //         <span class="two" [baz]=nbr+3 [bar]=nbr*2> World </span>
        //      </div>`
        // }

        // runtime code as it should be roughly generated
        function test(r: VdRenderer, $d: any) {
            let $a0: any = r.node, $a1, $a2;
            let nbr = $d["nbr"];

            if ($a0.cm) {
                $a1 = $el($a0, 1, "div");
                $a1.props = { "class": "hello" };
                // some comment
                $a2 = $el($a1, 2, "span");
                $a2.props = { "class": "one", "title": "blah", "foo": nbr + 4 };
                $tx($a2, 3, " Hello ");
                $a2 = $el($a1, 4, "span", 1);
                $a2.props = { "class": "two", "baz": nbr + 3, "bar": nbr * 2 };
                $tx($a2, 5, " World ");
                $a0.cm = 0;
            } else {
                // some comment
                $a2 = $a0.children[0].children[1]; $up("baz", nbr + 3, $a2, $a0); $up("bar", nbr * 2, $a2, $a0);
            }
        }

        let r = createTestRenderer(test, OPTIONS), refreshCount1 = $iv.refreshCount;

        // initial display
        r.refresh({ nbr: 42 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 class="hello">
                    <span 2 class="one" foo=46 title="blah">
                        <#text 3 " Hello ">
                    </span>
                    <span 4 ref="1" bar=84 baz=45 class="two">
                        <#text 5 " World ">
                    </span>
                </div>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "update changes");
        assert.equal((<VdChangeContainer>r.node).$lastRefresh, refreshCount1 + 1, "refresh count 1");

        // update
        r.refresh({ nbr: 5 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 class="hello">
                    <span 2 class="one" foo=46 title="blah">
                        <#text 3 " Hello ">
                    </span>
                    <span 4 ref="1" bar=10 baz=8 class="two">
                        <#text 5 " World ">
                    </span>
                </div>
            </#group>
        `, "update with nbr=5");

        assert.equal(r.changes(), `
            UpdateProp "baz"=8 in #1
            UpdateProp "bar"=10 in #1
        `, "update changes");

        assert.equal((<VdChangeContainer>r.node).$lastRefresh, refreshCount1 + 2, "refresh count 2");
    });

    it('should support simple if blocks', () => {
        // function test(r: VdRenderer, nbr) {
        //     <div>
        //         ABC
        //         % if (nbr===42) {
        //             <span> Hello </span>
        //             <span> World </span>
        //         % }
        //         <span [title]=nbr> DEF </span>
        //     </div>
        // }

        // runtime code as it should be roughly generated
        function test(r: VdRenderer, $d: any) {
            let $a0: any = r.node, $a1, $a2, $a3, $i1 = 0;
            let nbr = $d["nbr"];
            if ($a0.cm) {
                $a1 = $el($a0, 1, "div", 1);
                $tx($a1, 2, " ABC ");
            } else {
                $a1 = $a0.children[0];
            }
            $i1 = 1;
            if (nbr === 42) { // parent elt: $a1, parent group: $a0
                $a2 = $cg($i1, $a1, $a0, $a0, 3);
                $i1++;
                if ($a2.cm) {
                    $a3 = $el($a2, 4, "span");
                    $tx($a3, 5, " Hello ");
                    $a3 = $el($a2, 6, "span");
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
                $a2 = $a1.children[$i1]; $up("title", nbr, $a2, $a0);
            }
        }

        let r = createTestRenderer(test, OPTIONS);
        // initial display
        r.refresh({ nbr: 3 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <span 8 ref="2" title=3>
                        <#text 9 " DEF ">
                    </span>
                </div>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "update changes");

        // update 1
        r.refresh({ nbr: 42 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <#group 3 ref="3">
                        <span 4>
                            <#text 5 " Hello ">
                        </span>
                        <span 6>
                            <#text 7 " World ">
                        </span>
                    </#group>
                    <span 8 ref="2" title=42>
                        <#text 9 " DEF ">
                    </span>
                </div>
            </#group>
        `, "update with nbr=42");
        assert.equal(r.changes(), `
            CreateGroup #3 in #1 at position 1
            UpdateProp "title"=42 in #2
        `, "update changes 42");

        // update 2
        r.refresh({ nbr: 123 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <span 8 ref="2" title=123>
                        <#text 9 " DEF ">
                    </span>
                </div>
            </#group>
        `, "update with nbr=123");
        assert.equal(r.changes(), `
            DeleteGroup #3 in #1 at position 1
            UpdateProp "title"=123 in #2
        `, "update changes 123");

        // update 3
        r.refresh({ nbr: 12 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <span 8 ref="2" title=12>
                        <#text 9 " DEF ">
                    </span>
                </div>
            </#group>
        `, "update with nbr=12");
        assert.equal(r.changes(), `
            UpdateProp "title"=12 in #2
        `, "update changes 12");

        // update back to 42
        r.refresh({ nbr: 42 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <#group 3 ref="4">
                        <span 4>
                            <#text 5 " Hello ">
                        </span>
                        <span 6>
                            <#text 7 " World ">
                        </span>
                    </#group>
                    <span 8 ref="2" title=42>
                        <#text 9 " DEF ">
                    </span>
                </div>
            </#group>
        `, "update with nbr=42");
        assert.equal(r.changes(), `
            CreateGroup #4 in #1 at position 1
            UpdateProp "title"=42 in #2
        `, "update changes 2x");
    });

    it('should support if+else blocks and consecutive blocks', () => {
        // function test(r: VdRenderer, nbr) {
        //     <div>
        //         % if (nbr===42) {
        //             Case 42
        //         % } else if (nbr===142) {
        //             Case 142
        //         % }
        //     </div>
        // }

        // runtime code as it should be roughly generated
        function test(r: VdRenderer, $d: any) {
            let $a0: any = r.node, $a1, $a2, $a3, $i1 = 0;
            let nbr = $d["nbr"];
            if ($a0.cm) {
                $a1 = $el($a0, 1, "div", 1);
            } else {
                $a1 = $a0.children[0];
            }
            $i1 = 0;
            if (nbr === 42) { // parent elt: $a1, parent group: $a0
                $a2 = $cg($i1, $a1, $a0, $a0, 2);
                $i1++;
                if ($a2.cm) {
                    $tx($a2, 3, " Case 42 ");
                    $a2.cm = 0;
                }
            } else if (nbr === 142) { // parent elt: $a1, parent group: $a0
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

        let r = createTestRenderer(test, OPTIONS);
        // initial display
        r.refresh({ nbr: 3 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1"/>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "update changes");

        // update 1
        r.refresh({ nbr: 42 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#group 2 ref="2">
                        <#text 3 " Case 42 ">
                    </#group>
                </div>
            </#group>
        `, "update with nbr=42");
        assert.equal(r.changes(), `
            CreateGroup #2 in #1 at position 0
        `, "update changes 42");

        // update 2
        r.refresh({ nbr: 142 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#group 4 ref="3">
                        <#text 5 " Case 142 ">
                    </#group>
                </div>
            </#group>
        `, "update with nbr=142");
        assert.equal(r.changes(), `
            DeleteGroup #2 in #1 at position 0
            CreateGroup #3 in #1 at position 0
        `, "update changes 142");

        // update 3.1
        r.refresh({ nbr: 42 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#group 2 ref="4">
                        <#text 3 " Case 42 ">
                    </#group>
                </div>
            </#group>
        `, "update with nbr=42 x2");
        assert.equal(r.changes(), `
            CreateGroup #4 in #1 at position 0
            DeleteGroup #3 in #1 at position 1
        `, "update without changes");

        r.refresh({ nbr: 42 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#group 2 ref="4">
                        <#text 3 " Case 42 ">
                    </#group>
                </div>
            </#group>
        `, "update with nbr=42 x2");
        assert.equal(r.changes(), `
        `, "update without changes");

        // update 4
        r.refresh({ nbr: 9 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1"/>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            DeleteGroup #4 in #1 at position 0
        `, "update changes");
    });

    it('should support non consecutive blocks', () => {
        // function test(r: VdRenderer, nbr) {
        //     <div>
        //         ABC
        //         % if (nbr>42) {
        //             ++
        //         % } 
        //         <span [title]=nbr/>
        //         % if (nbr>142) {
        //             ++++
        //         % }
        //         DEF
        //     </div>
        // }

        // runtime code as it should be roughly generated
        function test(r: VdRenderer, $d: any) {
            let $a0: any = r.node, $a1, $a2, $a3, $i1 = 0;
            let nbr = $d["nbr"];
            if ($a0.cm) {
                $a1 = $el($a0, 1, "div", 1);
                $tx($a1, 2, " ABC ");
            } else {
                $a1 = $a0.children[0];
            }
            $i1 = 1;
            if (nbr > 42) { // parent elt: $a1, parent group: $a0
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
                $a2 = $a1.children[$i1]; $up("title", nbr, $a2, $a0);
            }
            $i1 += 1; // because we created one element in the previous section
            if (nbr > 142) { // parent elt: $a1, parent group: $a0
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

        let r = createTestRenderer(test, OPTIONS);
        // initial display
        r.refresh({ nbr: 3 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <span 5 ref="2" title=3/>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "update changes");

        // update 1
        r.refresh({ nbr: 50 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <#group 3 ref="3">
                        <#text 4 " ++ ">
                    </#group>
                    <span 5 ref="2" title=50/>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 50");
        assert.equal(r.changes(), `
            CreateGroup #3 in #1 at position 1
            UpdateProp "title"=50 in #2
        `, "update changes 50");

        // update 2
        r.refresh({ nbr: 150 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <#group 3 ref="3">
                        <#text 4 " ++ ">
                    </#group>
                    <span 5 ref="2" title=150/>
                    <#group 6 ref="4">
                        <#text 7 " ++++ ">
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 150");
        assert.equal(r.changes(), `
            UpdateProp "title"=150 in #2
            CreateGroup #4 in #1 at position 3
        `, "update changes 150");

        // update 3
        r.refresh({ nbr: 9 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <span 5 ref="2" title=9/>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 9");
        assert.equal(r.changes(), `
            DeleteGroup #3 in #1 at position 1
            UpdateProp "title"=9 in #2
            DeleteGroup #4 in #1 at position 2
        `, "update changes 9");
    });

    it('should support nested blocks', () => {
        // function test(r: VdRenderer, nbr) {
        //     <div>
        //         ABC
        //         % if (nbr>42) {
        //             <span [title]=nbr/>
        //             % if (nbr>142) {
        //                 <span [title]=nbr+10/>
        //             % }
        //             <span [title]=nbr+20/>
        //         % } 
        //         DEF
        //     </div>
        // }

        // runtime code as it should be roughly generated
        function test(r: VdRenderer, $d: any) {
            let $a0: any = r.node, $a1, $a2, $a3, $a4, $i1 = 0, $i2 = 0;
            let nbr = $d["nbr"];
            if ($a0.cm) {
                $a1 = $el($a0, 1, "div", 1);
                $tx($a1, 2, " ABC ");
            } else {
                $a1 = $a0.children[0];
            }
            $i1 = 1;   // shift for the ABC node
            if (nbr > 42) { // parent elt: $a1, parent group: $a0
                $a2 = $cg($i1, $a1, $a0, $a0, 3);
                $i1++;
                if ($a2.cm) {
                    $a3 = $el($a2, 4, "span", 1);
                    $a3.props = { "title": nbr };
                } else {
                    $a3 = $a2.children[0]; $up("title", nbr, $a3, $a0);
                }
                $i2 = 1;
                if (nbr > 142) {
                    $a3 = $cg($i2, $a2, $a0, $a2, 5);
                    $i2++;
                    if ($a3.cm) {
                        $a4 = $el($a3, 6, "span", 1);
                        $a4.props = { "title": nbr + 10 };
                        $a3.cm = 0;
                    } else {
                        $a4 = $a3.children[0]; $up("title", nbr + 10, $a4, $a0);
                    }
                }
                if ($a2.cm) {
                    $a3 = $el($a2, 7, "span", 1);
                    $a3.props = { "title": nbr + 20 };
                    $a2.cm = 0;
                } else {
                    $dg($i2, $a2, $a0, 7);
                    $a3 = $a2.children[$i2]; $up("title", nbr + 20, $a3, $a0);
                }
            }
            if ($a0.cm) {
                $tx($a1, 8, " DEF ");
                $a0.cm = 0;
            } else {
                $dg($i1, $a1, $a0, 8);
            }
        }

        let r = createTestRenderer(test, OPTIONS);
        // initial display
        r.refresh({ nbr: 3 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "update changes");

        // update 1
        r.refresh({ nbr: 45 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <#group 3 ref="2">
                        <span 4 ref="3" title=45/>
                        <span 7 ref="4" title=65/>
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update with nbr=45");
        assert.equal(r.changes(), `
            CreateGroup #2 in #1 at position 1
        `, "update changes 45");

        // update 2
        r.refresh({ nbr: 145 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <#group 3 ref="2">
                        <span 4 ref="3" title=145/>
                        <#group 5 ref="5">
                            <span 6 ref="6" title=155/>
                        </#group>
                        <span 7 ref="4" title=165/>
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 145");
        assert.equal(r.changes(), `
            UpdateProp "title"=145 in #3
            CreateGroup #5 in #2 at position 1
            UpdateProp "title"=165 in #4
        `, "update changes 145");

        // update 2
        r.refresh({ nbr: 200 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <#group 3 ref="2">
                        <span 4 ref="3" title=200/>
                        <#group 5 ref="5">
                            <span 6 ref="6" title=210/>
                        </#group>
                        <span 7 ref="4" title=220/>
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 200");
        assert.equal(r.changes(), `
            UpdateProp "title"=200 in #3
            UpdateProp "title"=210 in #6
            UpdateProp "title"=220 in #4
        `, "update changes 200");

        // update 3
        r.refresh({ nbr: 50 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <#group 3 ref="2">
                        <span 4 ref="3" title=50/>
                        <span 7 ref="4" title=70/>
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 50");
        assert.equal(r.changes(), `
            UpdateProp "title"=50 in #3
            DeleteGroup #5 in #2 at position 1
            UpdateProp "title"=70 in #4
        `, "update changes 50");

        // initial display with 145
        r = createTestRenderer(test, OPTIONS);
        r.refresh({ nbr: 145 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 ref="1">
                    <#text 2 " ABC ">
                    <#group 3 ref="2">
                        <span 4 ref="3" title=145/>
                        <#group 5 ref="4">
                            <span 6 ref="5" title=155/>
                        </#group>
                        <span 7 ref="6" title=165/>
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "initial dom 150");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "update changes 150");
    });

    it('should support sub-function calls', () => {
        // function foo (r: VdRenderer, v:number=123) {
        //     <div>
        //         <span> first </span>
        //         <c:bar [value]=v+1 msg=("m1:"+v)/>
        //         <c:bar [value]=v+3 msg=("m2:"+v)/>
        //         <span> last </span>
        //     </div>
        // }

        // function bar (r: VdRenderer, value, msg="") {
        //     <span [title]=(value+' '+msg)/>
        //     % if (value === 45) {
        //         <span> Hello 45! </span>
        //     % }
        // }

        function foo(r: VdRenderer, $d: any) {
            let $a0: any = r.node, $a1, $a2;
            let v = $d["v"];
            if ($a0.cm) {
                $a1 = $el($a0, 1, "div");
                $a2 = $el($a1, 2, "span");
                $tx($a2, 3, " first ");
                $a2 = $cc($a1, 4, { "value": v + 1, "msg": ("m1:" + v) }, r, bar, 0, 1);
                $a2 = $cc($a1, 5, { "value": v + 3, "msg": ("m2:" + v) }, r, bar, 0, 1);
                $a2 = $el($a1, 6, "span");
                $tx($a2, 7, " last ");
                $a0.cm = 0;
            } else {
                $a1 = $a0.children[0]
                $a2 = $a1.children[1];
                $uc("value", v + 1, $a2);
                $rc(r, $a2, $a0);
                $a2 = $a1.children[2];
                $uc("value", v + 3, $a2);
                $rc(r, $a2, $a0);
            }
        }

        function bar(r: VdRenderer, $d: { value?: any, msg?: any }) {
            let value = $d.value || "", msg = $d.msg || "", $a0: any = r.node, $a1, $a2, $i1;

            if ($a0.cm) {
                $a1 = $el($a0, 1, "span", 1);
                $a1.props = { "title": (value + ' ' + msg) };
            } else {
                $a1 = $a0.children[0]; $up("title", (value + ' ' + msg), $a1, $a0);
            }
            $i1 = 1;
            if (value === 45) {
                $a1 = $cg($i1, $a0, $a0, $a0, 2);
                $i1++;
                if ($a1.cm) {
                    $a2 = $el($a1, 3, "span");
                    $tx($a2, 4, " Hello 45! ");
                    $a1.cm = 0;
                }
            }
            if ($a0.cm) {
                $a0.cm = 0;
            } else {
                $dg($i1, $a0, $a0, 5);
            }
        }

        let r = createTestRenderer(foo, OPTIONS), refreshCount1 = $iv.refreshCount;

        // cpt getter
        function cpt(idx): VdChangeContainer {
            return <VdChangeContainer>((<any>r.node).children[0].children[idx]);
        }

        // initial display
        r.refresh({ v: 9 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1>
                    <span 2>
                        <#text 3 " first ">
                    </span>
                    <#group 4 ref="1" msg="m1:9" value=10>
                        <span 1 ref="2" title="10 m1:9"/>
                    </#group>
                    <#group 5 ref="3" msg="m2:9" value=12>
                        <span 1 ref="4" title="12 m2:9"/>
                    </#group>
                    <span 6>
                        <#text 7 " last ">
                    </span>
                </div>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "update changes");
        assert.equal((<VdChangeContainer>r.node).$lastRefresh, refreshCount1 + 1, "refresh count 1");
        assert.equal(cpt(1).$lastRefresh, refreshCount1+1, "cpt1 refresh 1");
        assert.equal(cpt(1).$lastChange, refreshCount1+1, "cpt1 change 1");

        // update 1
        r.refresh({ v: 42 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1>
                    <span 2>
                        <#text 3 " first ">
                    </span>
                    <#group 4 ref="1" msg="m1:9" value=43>
                        <span 1 ref="2" title="43 m1:9"/>
                    </#group>
                    <#group 5 ref="3" msg="m2:9" value=45>
                        <span 1 ref="4" title="45 m2:9"/>
                        <#group 2 ref="5">
                            <span 3>
                                <#text 4 " Hello 45! ">
                            </span>
                        </#group>
                    </#group>
                    <span 6>
                        <#text 7 " last ">
                    </span>
                </div>
            </#group>
        `, "update 42");
        assert.equal(r.changes(), `
            UpdateProp "title"="43 m1:9" in #2
            UpdateProp "title"="45 m2:9" in #4
            CreateGroup #5 in #3 at position 1
        `, "update changes 42");
        assert.equal(cpt(1).$lastRefresh, refreshCount1+2, "cpt1 refresh 2");
        assert.equal(cpt(1).$lastChange, refreshCount1+2, "cpt1 change 2");

        // update 2
        r.refresh({ v: 9 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1>
                    <span 2>
                        <#text 3 " first ">
                    </span>
                    <#group 4 ref="1" msg="m1:9" value=10>
                        <span 1 ref="2" title="10 m1:9"/>
                    </#group>
                    <#group 5 ref="3" msg="m2:9" value=12>
                        <span 1 ref="4" title="12 m2:9"/>
                    </#group>
                    <span 6>
                        <#text 7 " last ">
                    </span>
                </div>
            </#group>
        `, "update 9");
        assert.equal(r.changes(), `
            UpdateProp "title"="10 m1:9" in #2
            UpdateProp "title"="12 m2:9" in #4
            DeleteGroup #5 in #3 at position 1
        `, "update changes 9");
        assert.equal(cpt(1).$lastRefresh, refreshCount1+3, "cpt1 refresh 3");
        assert.equal(cpt(1).$lastChange, refreshCount1+3, "cpt1 change 3");

        // update 3
        r.refresh({ v: 9 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1>
                    <span 2>
                        <#text 3 " first ">
                    </span>
                    <#group 4 ref="1" msg="m1:9" value=10>
                        <span 1 ref="2" title="10 m1:9"/>
                    </#group>
                    <#group 5 ref="3" msg="m2:9" value=12>
                        <span 1 ref="4" title="12 m2:9"/>
                    </#group>
                    <span 6>
                        <#text 7 " last ">
                    </span>
                </div>
            </#group>
        `, "update 9 bis");
        assert.equal(r.changes(), `
        `, "update changes 9 bis");
        assert.equal(cpt(1).$lastRefresh, refreshCount1+4, "cpt1 refresh 4");
        assert.equal((<any>r.node).$lastChange, refreshCount1+3, "root node change 4");
        assert.equal(cpt(1).$lastChange, refreshCount1+3, "cpt1 change 4");
    });

    it('should support loops with no keys', () => {
        // function test(r:VdRenderer, list=[]) {
        //     <div title="first"/>
        //     % for (let i=0;list.length>i;i++) {
        //         <div [title]=("Hello " + list[i].name)/>
        //     % }
        //     <div [title]=list.length/>
        // }

        function test(r: VdRenderer, $d: any) {
            let $a0: any = r.node, $a1, $a2, $i0;
            let list = $d["list"];
            if ($a0.cm) {
                $a1 = $el($a0, 1, "div", 0);
                $a1.props = { "title": "first" };
            }
            $i0 = 1;
            for (let i = 0; list.length > i; i++) {
                $a1 = $cg($i0, $a0, $a0, $a0, 2);
                $i0++;
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

        let r = createTestRenderer(test, OPTIONS);
        // initial display
        r.refresh({ list: [{ name: "Arthur" }, { name: "Douglas" }] });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 title="first"/>
                <#group 2 ref="1">
                    <div 3 ref="2" title="Hello Arthur"/>
                </#group>
                <#group 2 ref="3">
                    <div 3 ref="4" title="Hello Douglas"/>
                </#group>
                <div 4 ref="5" title=2/>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "update changes");

        // update 1 
        r.refresh({ list: [{ name: "Arthur" }, { name: "Slartibartfast" }, { name: "Douglas" }] });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 title="first"/>
                <#group 2 ref="1">
                    <div 3 ref="2" title="Hello Arthur"/>
                </#group>
                <#group 2 ref="3">
                    <div 3 ref="4" title="Hello Slartibartfast"/>
                </#group>
                <#group 2 ref="6">
                    <div 3 ref="7" title="Hello Douglas"/>
                </#group>
                <div 4 ref="5" title=3/>
            </#group>
        `, "update 3 items");
        assert.equal(r.changes(), `
            UpdateProp "title"="Hello Slartibartfast" in #4
            CreateGroup #6 in #-1 at position 3
            UpdateProp "title"=3 in #5
        `, "update changes 3 items");

        // update 2
        r.refresh({ list: [] });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1 title="first"/>
                <div 4 ref="5" title=0/>
            </#group>
        `, "empty list");
        assert.equal(r.changes(), `
            DeleteGroup #1 in #-1 at position 1
            DeleteGroup #3 in #-1 at position 1
            DeleteGroup #6 in #-1 at position 1
            UpdateProp "title"=0 in #5
        `, "update changes empty list");
    });
});
