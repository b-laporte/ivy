
import { assert, createTestRenderer } from "./common";
import { VdRenderer } from "../iv";

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
        function test(r: VdRenderer, nbr) {
            let $a0: any = r.parent, $a1, $a2;
            const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp;

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

        let r = createTestRenderer(OPTIONS);

        // initial display
        test(r, 42);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 class="hello">
                    <span 2 class="one" foo=46 title="blah">
                        <#text 3 " Hello ">
                    </span>
                    <span 4 ref="E1" bar=84 baz=45 class="two">
                        <#text 5 " World ">
                    </span>
                </div>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup ROOT
        `, "update changes");

        // update
        r.root.changes = null;
        test(r, 5);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 class="hello">
                    <span 2 class="one" foo=46 title="blah">
                        <#text 3 " Hello ">
                    </span>
                    <span 4 ref="E1" bar=10 baz=8 class="two">
                        <#text 5 " World ">
                    </span>
                </div>
            </#group>
        `, "update with nbr=5");

        assert.equal(r.changes(), `
            UpdateProp "baz"=8 in E1
            UpdateProp "bar"=10 in E1
        `, "update changes");

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
        function test(r: VdRenderer, nbr) {
            let $a0: any = r.parent, $a1, $a2, $a3, $i1 = 0;
            const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp, $cg = $.checkGroupNode, $dg = $.deleteGroups;

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

        let r = createTestRenderer(OPTIONS);
        // initial display
        test(r, 3);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <span 8 ref="E2" title=3>
                        <#text 9 " DEF ">
                    </span>
                </div>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup ROOT
        `, "update changes");

        // update 1
        r.root.changes = null;
        test(r, 42);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <#group 3 ref="G3">
                        <span 4>
                            <#text 5 " Hello ">
                        </span>
                        <span 6>
                            <#text 7 " World ">
                        </span>
                    </#group>
                    <span 8 ref="E2" title=42>
                        <#text 9 " DEF ">
                    </span>
                </div>
            </#group>
        `, "update with nbr=42");
        assert.equal(r.changes(), `
            CreateGroup G3 in E1 at position 1
            UpdateProp "title"=42 in E2
        `, "update changes 42");

        // update 2
        r.root.changes = null;
        test(r, 123);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <span 8 ref="E2" title=123>
                        <#text 9 " DEF ">
                    </span>
                </div>
            </#group>
        `, "update with nbr=123");
        assert.equal(r.changes(), `
            DeleteGroup G3 in E1 at position 1
            UpdateProp "title"=123 in E2
        `, "update changes 123");

        // update 3
        r.root.changes = null;
        test(r, 12);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <span 8 ref="E2" title=12>
                        <#text 9 " DEF ">
                    </span>
                </div>
            </#group>
        `, "update with nbr=12");
        assert.equal(r.changes(), `
            UpdateProp "title"=12 in E2
        `, "update changes 12");

        // update back to 42
        r.root.changes = null;
        test(r, 42);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <#group 3 ref="G4">
                        <span 4>
                            <#text 5 " Hello ">
                        </span>
                        <span 6>
                            <#text 7 " World ">
                        </span>
                    </#group>
                    <span 8 ref="E2" title=42>
                        <#text 9 " DEF ">
                    </span>
                </div>
            </#group>
        `, "update with nbr=42");
        assert.equal(r.changes(), `
            CreateGroup G4 in E1 at position 1
            UpdateProp "title"=42 in E2
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
        function test(r: VdRenderer, nbr) {
            let $a0: any = r.parent, $a1, $a2, $a3, $i2 = 0;
            const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $cg = $.checkGroupNode, $dg = $.deleteGroups;

            if ($a0.cm) {
                $a1 = $el($a0, 1, "div", 1);
            } else {
                $a1 = $a0.children[0];
            }
            $i2 = 0;
            if (nbr === 42) { // parent elt: $a1, parent group: $a0
                $a2 = $cg($i2, $a1, $a0, $a0, 2);
                $i2++;
                if ($a2.cm) {
                    $tx($a2, 3, " Case 42 ");
                    $a2.cm = 0;
                }
            } else if (nbr === 142) { // parent elt: $a1, parent group: $a0
                $dg($i2, $a1, $a0, 4);
                $a2 = $cg($i2, $a1, $a0, $a0, 4);
                $i2++;
                if ($a2.cm) {
                    $tx($a2, 5, " Case 142 ");
                    $a2.cm = 0;
                }
            }
            if ($a0.cm) {
                $a0.cm = 0;
            } else {
                $dg($i2, $a1, $a0, 6);
            }
        }

        let r = createTestRenderer(OPTIONS);
        // initial display
        test(r, 3);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1"/>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup ROOT
        `, "update changes");

        // update 1
        r.root.changes = null;
        test(r, 42);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#group 2 ref="G2">
                        <#text 3 " Case 42 ">
                    </#group>
                </div>
            </#group>
        `, "update with nbr=42");
        assert.equal(r.changes(), `
            CreateGroup G2 in E1 at position 0
        `, "update changes 42");

        // update 2
        r.root.changes = null;
        test(r, 142);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#group 4 ref="G3">
                        <#text 5 " Case 142 ">
                    </#group>
                </div>
            </#group>
        `, "update with nbr=142");
        assert.equal(r.changes(), `
            DeleteGroup G2 in E1 at position 0
            CreateGroup G3 in E1 at position 0
        `, "update changes 142");

        // update 3
        r.root.changes = null;
        test(r, 42);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#group 2 ref="G4">
                        <#text 3 " Case 42 ">
                    </#group>
                </div>
            </#group>
        `, "update with nbr=42 x2");
        assert.equal(r.changes(), `
            CreateGroup G4 in E1 at position 0
            DeleteGroup G3 in E1 at position 1
        `, "update changes 42 x2");

        // update 4
        r.root.changes = null;
        test(r, 9);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1"/>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            DeleteGroup G4 in E1 at position 0
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
        function test(r: VdRenderer, nbr) {
            let $a0: any = r.parent, $a1, $a2, $a3, $i2 = 0;
            const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp, $cg = $.checkGroupNode, $dg = $.deleteGroups;

            if ($a0.cm) {
                $a1 = $el($a0, 1, "div", 1);
                $tx($a1, 2, " ABC ");
            } else {
                $a1 = $a0.children[0];
            }
            $i2 = 1;
            if (nbr > 42) { // parent elt: $a1, parent group: $a0
                $a2 = $cg($i2, $a1, $a0, $a0, 3);
                $i2++;
                if ($a2.cm) {
                    $tx($a2, 4, " ++ ");
                    $a2.cm = 0;
                }
            }
            if ($a0.cm) {
                $a2 = $el($a1, 5, "span", 1);
                $a2.props = { "title": nbr };
            } else {
                $dg($i2, $a1, $a0, 5);
                $a2 = $a1.children[$i2]; $up("title", nbr, $a2, $a0);
            }
            $i2 += 1; // because we created one element in the previous section
            if (nbr > 142) { // parent elt: $a1, parent group: $a0
                $a2 = $cg($i2, $a1, $a0, $a0, 6);
                $i2++;
                if ($a2.cm) {
                    $tx($a2, 7, " ++++ ");
                    $a2.cm = 0;
                }
            }
            if ($a0.cm) {
                $tx($a1, 8, " DEF ");
                $a0.cm = 0;
            } else {
                $dg($i2, $a1, $a0, 8);
            }
        }

        let r = createTestRenderer(OPTIONS);
        // initial display
        test(r, 3);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <span 5 ref="E2" title=3/>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup ROOT
        `, "update changes");

        // update 1
        r.root.changes = null;
        test(r, 50);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <#group 3 ref="G3">
                        <#text 4 " ++ ">
                    </#group>
                    <span 5 ref="E2" title=50/>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 50");
        assert.equal(r.changes(), `
            CreateGroup G3 in E1 at position 1
            UpdateProp "title"=50 in E2
        `, "update changes 50");

        // update 2
        r.root.changes = null;
        test(r, 150);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <#group 3 ref="G3">
                        <#text 4 " ++ ">
                    </#group>
                    <span 5 ref="E2" title=150/>
                    <#group 6 ref="G4">
                        <#text 7 " ++++ ">
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 150");
        assert.equal(r.changes(), `
            UpdateProp "title"=150 in E2
            CreateGroup G4 in E1 at position 3
        `, "update changes 150");

        // update 3
        r.root.changes = null;
        test(r, 9);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <span 5 ref="E2" title=9/>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 9");
        assert.equal(r.changes(), `
            DeleteGroup G3 in E1 at position 1
            UpdateProp "title"=9 in E2
            DeleteGroup G4 in E1 at position 2
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
        function test(r: VdRenderer, nbr) {
            let $a0: any = r.parent, $a1, $a2, $a3, $a4, $i2 = 0, $i3 = 0;
            const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp, $cg = $.checkGroupNode, $dg = $.deleteGroups;

            if ($a0.cm) {
                $a1 = $el($a0, 1, "div", 1);
                $tx($a1, 2, " ABC ");
            } else {
                $a1 = $a0.children[0];
            }
            $i2 = 1;   // shift for the ABC node
            if (nbr > 42) { // parent elt: $a1, parent group: $a0
                $a2 = $cg($i2, $a1, $a0, $a0, 3);
                $i2++;
                if ($a2.cm) {
                    $a3 = $el($a2, 4, "span", 1);
                    $a3.props = { "title": nbr };
                } else {
                    $a3 = $a2.children[0]; $up("title", nbr, $a3, $a0);
                }
                $i3 = 1;
                if (nbr > 142) {
                    $a3 = $cg($i3, $a2, $a0, $a2, 5);
                    $i3++;
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
                    $dg($i3, $a2, $a0, 7);
                    $a3 = $a2.children[$i3]; $up("title", nbr + 20, $a3, $a0);
                }
            }
            if ($a0.cm) {
                $tx($a1, 8, " DEF ");
                $a0.cm = 0;
            } else {
                $dg($i2, $a1, $a0, 7);
            }
        }

        let r = createTestRenderer(OPTIONS);
        // initial display
        test(r, 3);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup ROOT
        `, "update changes");

        // update 1
        r.root.changes = null;
        test(r, 45);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <#group 3 ref="G2">
                        <span 4 ref="E3" title=45/>
                        <span 7 ref="E4" title=65/>
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update with nbr=45");
        assert.equal(r.changes(), `
            CreateGroup G2 in E1 at position 1
        `, "update changes 45");

        // update 2
        r.root.changes = null;
        test(r, 145);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <#group 3 ref="G2">
                        <span 4 ref="E3" title=145/>
                        <#group 5 ref="G5">
                            <span 6 ref="E6" title=155/>
                        </#group>
                        <span 7 ref="E4" title=165/>
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 145");
        assert.equal(r.changes(), `
            UpdateProp "title"=145 in E3
            CreateGroup G5 in G2 at position 1
            UpdateProp "title"=165 in E4
        `, "update changes 145");

        // update 2
        r.root.changes = null;
        test(r, 200);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <#group 3 ref="G2">
                        <span 4 ref="E3" title=200/>
                        <#group 5 ref="G5">
                            <span 6 ref="E6" title=210/>
                        </#group>
                        <span 7 ref="E4" title=220/>
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 200");
        assert.equal(r.changes(), `
            UpdateProp "title"=200 in E3
            UpdateProp "title"=210 in E6
            UpdateProp "title"=220 in E4
        `, "update changes 200");

        // update 3
        r.root.changes = null;
        test(r, 50);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <#group 3 ref="G2">
                        <span 4 ref="E3" title=50/>
                        <span 7 ref="E4" title=70/>
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "update 50");
        assert.equal(r.changes(), `
            UpdateProp "title"=50 in E3
            DeleteGroup G5 in G2 at position 1
            UpdateProp "title"=70 in E4
        `, "update changes 50");

        // initial display with 150
        r = createTestRenderer(OPTIONS);
        test(r, 145);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1">
                    <#text 2 " ABC ">
                    <#group 3 ref="G2">
                        <span 4 ref="E3" title=145/>
                        <#group 5 ref="G4">
                            <span 6 ref="E5" title=155/>
                        </#group>
                        <span 7 ref="E6" title=165/>
                    </#group>
                    <#text 8 " DEF ">
                </div>
            </#group>
        `, "initial dom 150");
        assert.equal(r.changes(), `
            CreateGroup ROOT
        `, "update changes 150");
    });

    it('should support sub-templates', () => {
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

        function foo(r: VdRenderer, v: number = 123) {
            let $a0: any = r.parent, $a1, $a2;
            const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $uc = $.updateCptProp,
                $gp = $.createGroupNode, $mc = $.moveChanges;

            if ($a0.cm) {
                $a1 = $el($a0, 1, "div");
                $a2 = $el($a1, 2, "span");
                $tx($a2, 3, " first ");
                $a2 = $gp($a1, 4, { "value": v + 1, "msg": ("m1:" + v) }, 1);
                r.parent = $a2;
                bar(r, $a2.props);
                $a2 = $gp($a1, 5, { "value": v + 3, "msg": ("m2:" + v) }, 1);
                r.parent = $a2;
                bar(r, $a2.props);
                $a2 = $el($a1, 6, "span");
                $tx($a2, 7, " last ");
                $a0.cm = 0;
            } else {
                $a1 = $a0.children[0]
                $a2 = $a1.children[1];
                $uc("value", v + 1, $a2);
                r.parent = $a2;
                bar(r, $a2.props);
                $mc($a2, $a0);
                $a2 = $a1.children[2];
                r.parent = $a2;
                $uc("value", v + 3, $a2);
                bar(r, $a2.props);
                $mc($a2, $a0);
            }

            r.parent = $a0;
        }

        function bar(r: VdRenderer, $a: { value?: any, msg?: any }) {
            let value = $a.value || "", msg = $a.msg || "", $a0: any = r.parent, $a1, $a2, $i1;
            const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp, $cg = $.checkGroupNode, $dg = $.deleteGroups;

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

        let r = createTestRenderer(OPTIONS);
        // initial display
        foo(r, 9);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1>
                    <span 2>
                        <#text 3 " first ">
                    </span>
                    <#group 4 ref="G1" msg="m1:9" value=10>
                        <span 1 ref="E2" title="10 m1:9"/>
                    </#group>
                    <#group 5 ref="G3" msg="m2:9" value=12>
                        <span 1 ref="E4" title="12 m2:9"/>
                    </#group>
                    <span 6>
                        <#text 7 " last ">
                    </span>
                </div>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup ROOT
        `, "update changes");

        // update 1
        r.root.changes = null;
        foo(r, 42);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1>
                    <span 2>
                        <#text 3 " first ">
                    </span>
                    <#group 4 ref="G1" msg="m1:9" value=43>
                        <span 1 ref="E2" title="43 m1:9"/>
                    </#group>
                    <#group 5 ref="G3" msg="m2:9" value=45>
                        <span 1 ref="E4" title="45 m2:9"/>
                        <#group 2 ref="G5">
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
            UpdateProp "title"="43 m1:9" in E2
            UpdateProp "title"="45 m2:9" in E4
            CreateGroup G5 in G3 at position 1
        `, "update changes 42");

        // update 1
        r.root.changes = null;
        foo(r, 9);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1>
                    <span 2>
                        <#text 3 " first ">
                    </span>
                    <#group 4 ref="G1" msg="m1:9" value=10>
                        <span 1 ref="E2" title="10 m1:9"/>
                    </#group>
                    <#group 5 ref="G3" msg="m2:9" value=12>
                        <span 1 ref="E4" title="12 m2:9"/>
                    </#group>
                    <span 6>
                        <#text 7 " last ">
                    </span>
                </div>
            </#group>
        `, "update 9");
        assert.equal(r.changes(), `
            UpdateProp "title"="10 m1:9" in E2
            UpdateProp "title"="12 m2:9" in E4
            DeleteGroup G5 in G3 at position 1
        `, "update changes 9");
    });

    it('should support for loops with no keys', () => {
        // function test(r:VdRenderer, list=[]) {
        //     <div title="first"/>
        //     % for (let i=0;list.length>i;i++) {
        //         <div [title]=("Hello " + list[i].name)/>
        //     % }
        //     <div [title]=list.length/>
        // }

        function test(r: VdRenderer, list: any[] = []) {
            let $a0: any = r.parent, $a1, $a2, $i1;
            const $ = r.rt, $el = $.createEltNode, $tx = $.createTxtNode, $up = $.updateProp, $cg = $.checkGroupNode, $dg = $.deleteGroups;

            if ($a0.cm) {
                $a1 = $el($a0, 1, "div", 1);
                $a1.props = { "title": "first" };
            }
            $i1 = 1;
            for (let i = 0; list.length > i; i++) {
                $a1 = $cg($i1, $a0, $a0, $a0, 2);
                $i1++;
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
                $dg($i1, $a0, $a0, 4);
                $a1 = $a0.children[$i1];
                $up("title", list.length, $a1, $a0);
            }
        }

        let r = createTestRenderer(OPTIONS);
        // initial display
        test(r, [{ name: "Arthur" }, { name: "Douglas" }]);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1" title="first"/>
                <#group 2 ref="G2">
                    <div 3 ref="E3" title="Hello Arthur"/>
                </#group>
                <#group 2 ref="G4">
                    <div 3 ref="E5" title="Hello Douglas"/>
                </#group>
                <div 4 ref="E6" title=2/>
            </#group>
        `, "initial dom");
        assert.equal(r.changes(), `
            CreateGroup ROOT
        `, "update changes");

        // update 1 
        r.root.changes = null;
        test(r, [{ name: "Arthur" }, { name: "Slartibartfast" }, { name: "Douglas" }]);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1" title="first"/>
                <#group 2 ref="G2">
                    <div 3 ref="E3" title="Hello Arthur"/>
                </#group>
                <#group 2 ref="G4">
                    <div 3 ref="E5" title="Hello Slartibartfast"/>
                </#group>
                <#group 2 ref="G7">
                    <div 3 ref="E8" title="Hello Douglas"/>
                </#group>
                <div 4 ref="E6" title=3/>
            </#group>
        `, "update 3 items");
        assert.equal(r.changes(), `
            UpdateProp "title"="Hello Slartibartfast" in E5
            CreateGroup G7 in ROOT at position 3
            UpdateProp "title"=3 in E6
        `, "update changes 3 items");

        // update 2
        r.root.changes = null;
        test(r, []);
        assert.equal(r.vdom(), `
            <#group 0 ref="ROOT">
                <div 1 ref="E1" title="first"/>
                <div 4 ref="E6" title=0/>
            </#group>
        `, "empty list");
        assert.equal(r.changes(), `
            DeleteGroup G2 in ROOT at position 1
            DeleteGroup G4 in ROOT at position 1
            DeleteGroup G7 in ROOT at position 1
            UpdateProp "title"=0 in E6
        `, "update changes empty list");
    });

});
