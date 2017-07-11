
import { assert, createTestRenderer } from "./common";
import { VdRenderer } from "../iv";

describe('Rollup plugin', () => {

    let OPTIONS = { baseIndent: "        " };

    it('should generate functions with nested blocks', () => {
        // same test as in compiler.spec and runtime.spec

        function test(r: VdRenderer, nbr) {
            `---
            <div>
                ABC
                % if (nbr>42) {
                    <span [title]=nbr/>
                    % if (nbr>142) {
                        <span [title]=nbr+10/>
                    % }
                    <span [title]=nbr+20/>
                % } 
                DEF
            </div>
             ---`
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

    it('should generate functions with sub-function calls', () => {
        // same test as in compiler.spec and runtime.spec

        function foo(r: VdRenderer, v: number = 123) {
            `---
            <div>
                <span> first </span>
                <c:bar [value]=v+1 msg=("m1:"+v)/>
                <c:bar [value]=v+3 msg=("m2:"+v)/>
                <span> last </span>
            </div>
             ---`
        }

        function bar(r: VdRenderer, value, msg = "") {
            `
            <span [title]=(value+' '+msg)/>
             % if (value === 45) {
                <span> Hello 45! </span>
             % }
        `}

        let r = createTestRenderer(foo, OPTIONS);
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

        // update 1
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
    });

    it('should generate functions with dynamic text nodes', () => {
        // same test as in compiler.spec and runtime.spec

        function foo(r: VdRenderer, nbr: number) {
            `---
            <div>
                <span>{{nbr+1}}</span>
                ABC {{nbr}}{{nbr}} DEF
                <span>{{nbr+"a"}} Z </span>
            </div>
             ---`
        }

        debugger

        let r = createTestRenderer(foo, OPTIONS);
        // initial display
        r.refresh({ nbr: 9 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1>
                    <span 2>
                        <#text 3 ref="1" "10">
                    </span>
                    <#text 4 ref="2" " ABC 99 DEF ">
                    <span 5>
                        <#text 6 ref="3" "9a Z ">
                    </span>
                </div>
            </#group>
        `, "init");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "init");

        // update
        r.refresh({ nbr: 42 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <div 1>
                    <span 2>
                        <#text 3 ref="1" "43">
                    </span>
                    <#text 4 ref="2" " ABC 4242 DEF ">
                    <span 5>
                        <#text 6 ref="3" "42a Z ">
                    </span>
                </div>
            </#group>
        `, "update");
        assert.equal(r.changes(), `
            UpdateText "43" in #1
            UpdateText " ABC 4242 DEF " in #2
            UpdateText "42a Z " in #3
        `, "update");
    });

    it('should generate functions with main js blocks', () => {
        // same test as in compiler.spec and runtime.spec

        function foo(r: VdRenderer, visible, nbr: number) {
            `---
            % nbr+=3;
            % if (visible) {
                <span>{{nbr}}</span>
            % }
             ---`
        }

        let r = createTestRenderer(foo, OPTIONS);
        // initial display
        r.refresh({ visible: true, nbr: 9 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <#group 1 ref="1">
                    <span 2>
                        <#text 3 ref="2" "12">
                    </span>
                </#group>
            </#group>
        `, "init");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "init");

        // refresh with no changes
        r.refresh({ visible: true, nbr: 9 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <#group 1 ref="1">
                    <span 2>
                        <#text 3 ref="2" "12">
                    </span>
                </#group>
            </#group>
        `, "no changes");
        assert.equal(r.changes(), `
        `, "no changes");

        // refresh with no changes
        r.refresh({ visible: false, nbr: 42 });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1"/>
        `, "invisible");
        assert.equal(r.changes(), `
            DeleteGroup #1 in #-1 at position 0
        `, "invisible");
    });
});