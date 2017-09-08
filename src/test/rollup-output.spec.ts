
import { assert, createTestRenderer } from "./common";
import { $dataNodes } from "../iv";

describe('Rollup output', () => {

    let OPTIONS = { baseIndent: "        " };

    it('should generate functions with nested blocks', () => {
        // same test as in compiler.spec and runtime.spec

        function test(nbr) {
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

        function foo(v: number = 123) {
            `---
            <div>
                <span> first </span>
                <c:bar [value]=v+1 msg=("m1:"+v)/>
                <c:bar [value]=v+3 msg=("m2:"+v)/>
                <span> last </span>
            </div>
             ---`
        }

        function bar(value, msg = "") {
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

        function foo(nbr: number) {
            `---
            <div>
                <span>{{nbr+1}}</span>
                ABC {{nbr}}{{nbr}} DEF
                <span>{{nbr+"a"}} Z </span>
            </div>
             ---`
        }

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

        function foo(visible, nbr: number) {
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

    it('should generate functions with node re-projection (insert blocks)', () => {

        function main(useText: boolean, msg) {
            `---
            % if (useText) {
                <c:section title="hello" [$content]=msg/>
            % } else {
                <c:section title="hello2">
                    Hello
                    <span class="mycontent"> {{msg}} ! </span>
                </c:section>
            % }
             ---`
        }

        function section(title, $content) {
            `---
            <div class="section">
                <span class="title"> {{title}} </span>
                <ins:$content/>
            </div>
             ---`
        }

        let r = createTestRenderer(main, OPTIONS);
        // initial display
        r.refresh({ msg: "Slartibartfast" });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <#group 3 ref="1">
                    <#group 4 $content=IvNode title="hello2">
                        <div 1 ref="3" class="section">
                            <span 2 class="title">
                                <#text 3 ref="4" "hello2">
                            </span>
                            <#group 4 ref="5" $content_ref=IvNode>
                                <#text 5 " Hello ">
                                <span 6 class="mycontent">
                                    <#text 7 ref="2" "Slartibartfast ! ">
                                </span>
                            </#group>
                        </div>
                    </#group>
                </#group>
            </#group>
        `, "init");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "init");

        r.refresh({ useText: false, msg: "Arthur" });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <#group 3 ref="1">
                    <#group 4 $content=IvNode title="hello2">
                        <div 1 ref="3" class="section">
                            <span 2 class="title">
                                <#text 3 ref="4" "hello2">
                            </span>
                            <#group 4 ref="5" $content_ref=IvNode>
                                <#text 5 " Hello ">
                                <span 6 class="mycontent">
                                    <#text 7 ref="2" "Arthur ! ">
                                </span>
                            </#group>
                        </div>
                    </#group>
                </#group>
            </#group>
        `, "init 2");
        assert.equal(r.changes(), `
            UpdateText "Arthur ! " in #2
        `, "init 2b");

        r.refresh({ useText: true, msg: "Arthur" });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <#group 1 ref="6">
                    <#group 2 ref="7" $content="Arthur" title="hello">
                        <div 1 ref="8" class="section">
                            <span 2 class="title">
                                <#text 3 ref="9" "hello">
                            </span>
                            <#group 4 ref="10" $content_ref="Arthur">
                                <#text -1 ref="11" "Arthur">
                            </#group>
                        </div>
                    </#group>
                </#group>
            </#group>
        `, "update");
        assert.equal(r.changes(), `
            CreateGroup #6 in #-1 at position 0
            DeleteGroup #1 in #-1 at position 1
        `, "update b");

        r.refresh({ useText: true, msg: "Bart" });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <#group 1 ref="6">
                    <#group 2 ref="7" $content="Bart" title="hello">
                        <div 1 ref="8" class="section">
                            <span 2 class="title">
                                <#text 3 ref="9" "hello">
                            </span>
                            <#group 4 ref="10" $content_ref="Bart">
                                <#text -1 ref="11" "Bart">
                            </#group>
                        </div>
                    </#group>
                </#group>
            </#group>
        `, "update 2");
        assert.equal(r.changes(), `
            UpdateText "Bart" in #11
        `, "update 2b");

    });

    it('should support insert content nature change and ReplaceGroupContent instructions', () => {
        function test(showFirst: boolean, showLast: boolean) {
            `---
            <c:menu>
                % if (showFirst) {
                    <:item key="F"> First item </:item>
                    <:separator/>
                % }
                % for (let k of ["A", "B", "C"]) {
                    <:item key=k> <b> Item {{k}} </b> </:item>
                % }
                % if (showLast) {
                    <:separator/>
                    <:item key="L"> Last item </:item>
                % }
            </c:menu>
             ---`
        }

        function menu(selection: string) {
            `---
            % let dataNodes = $dataNodes("*");
            <ul>
                % for (let dn of dataNodes) {
                    % if (dn.name === "item") {
                        <li> [{{dn.props["key"]}}] <ins:dn/> </li>
                    % } else if (dn.name === "separator") {
                        <hr/>
                    % }
                % }
            </ul>
             ---`
        }
        
        let r = createTestRenderer(test, OPTIONS);
        // initial display
        r.refresh({ showFirst:true, showLast:true });
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <#group 1 $content=IvNode>
                    <ul 1 ref="9">
                        <#group 2 ref="10">
                            <#group 3 ref="11">
                                <li 4 ref="12">
                                    <#text 5 ref="13" " [F] ">
                                    <#group 6 ref="14" $content_ref=IvNode>
                                        <#text 4 " First item ">
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                        <#group 2 ref="15">
                            <#group 7 ref="16">
                                <hr 8/>
                            </#group>
                        </#group>
                        <#group 2 ref="17">
                            <#group 3 ref="18">
                                <li 4 ref="19">
                                    <#text 5 ref="20" " [A] ">
                                    <#group 6 ref="21" $content_ref=IvNode>
                                        <b 8>
                                            <#text 9 ref="3" " Item A">
                                        </b>
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                        <#group 2 ref="22">
                            <#group 3 ref="23">
                                <li 4 ref="24">
                                    <#text 5 ref="25" " [B] ">
                                    <#group 6 ref="26" $content_ref=IvNode>
                                        <b 8>
                                            <#text 9 ref="5" " Item B">
                                        </b>
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                        <#group 2 ref="27">
                            <#group 3 ref="28">
                                <li 4 ref="29">
                                    <#text 5 ref="30" " [C] ">
                                    <#group 6 ref="31" $content_ref=IvNode>
                                        <b 8>
                                            <#text 9 ref="7" " Item C">
                                        </b>
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                        <#group 2 ref="32">
                            <#group 7 ref="33">
                                <hr 8/>
                            </#group>
                        </#group>
                        <#group 2 ref="34">
                            <#group 3 ref="35">
                                <li 4 ref="36">
                                    <#text 5 ref="37" " [L] ">
                                    <#group 6 ref="38" $content_ref=IvNode>
                                        <#text 13 " Last item ">
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                    </ul>
                </#group>
            </#group>
        `, "init");
        assert.equal(r.changes(), `
            CreateGroup #-1
        `, "init b");

        r.refresh({ showFirst:false, showLast:false });
        // as the for loop is not keyed, the first group will be reused (group 2 ref="10")
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <#group 1 $content=IvNode>
                    <ul 1 ref="9">
                        <#group 2 ref="10">
                            <#group 3 ref="11">
                                <li 4 ref="12">
                                    <#text 5 ref="13" " [A] ">
                                    <#group 6 ref="39" $content_ref=IvNode>
                                        <b 8>
                                            <#text 9 ref="3" " Item A">
                                        </b>
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                        <#group 2 ref="15">
                            <#group 3 ref="40">
                                <li 4 ref="41">
                                    <#text 5 ref="42" " [B] ">
                                    <#group 6 ref="43" $content_ref=IvNode>
                                        <b 8>
                                            <#text 9 ref="5" " Item B">
                                        </b>
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                        <#group 2 ref="17">
                            <#group 3 ref="18">
                                <li 4 ref="19">
                                    <#text 5 ref="20" " [C] ">
                                    <#group 6 ref="44" $content_ref=IvNode>
                                        <b 8>
                                            <#text 9 ref="7" " Item C">
                                        </b>
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                    </ul>
                </#group>
            </#group>
        `, "update");
        
        // as the for loop is not keyed, the first group will be reused (group 2 ref="10")
        assert.equal(r.changes(), `
            UpdateText " [A] " in #13
            ReplaceGroupContent #14 in #12 at position 1
            CreateGroup #40 in #15 at position 0
            DeleteGroup #16 in #15 at position 1
            UpdateText " [C] " in #20
            ReplaceGroupContent #21 in #19 at position 1
            DeleteGroup #22 in #9 at position 3
            DeleteGroup #27 in #9 at position 3
            DeleteGroup #32 in #9 at position 3
            DeleteGroup #34 in #9 at position 3
        `, "update b");

        r.refresh({ showFirst:true, showLast:false });
        // as the for loop is not keyed, the first group will be reused (group 2 ref="10")
        assert.equal(r.vdom(), `
            <#group 0 ref="-1">
                <#group 1 $content=IvNode>
                    <ul 1 ref="9">
                        <#group 2 ref="10">
                            <#group 3 ref="11">
                                <li 4 ref="12">
                                    <#text 5 ref="13" " [F] ">
                                    <#group 6 ref="46" $content_ref=IvNode>
                                        <#text 4 " First item ">
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                        <#group 2 ref="15">
                            <#group 7 ref="47">
                                <hr 8/>
                            </#group>
                        </#group>
                        <#group 2 ref="17">
                            <#group 3 ref="18">
                                <li 4 ref="19">
                                    <#text 5 ref="20" " [A] ">
                                    <#group 6 ref="48" $content_ref=IvNode>
                                        <b 8>
                                            <#text 9 ref="3" " Item A">
                                        </b>
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                        <#group 2 ref="49">
                            <#group 3 ref="50">
                                <li 4 ref="51">
                                    <#text 5 ref="52" " [B] ">
                                    <#group 6 ref="53" $content_ref=IvNode>
                                        <b 8>
                                            <#text 9 ref="5" " Item B">
                                        </b>
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                        <#group 2 ref="54">
                            <#group 3 ref="55">
                                <li 4 ref="56">
                                    <#text 5 ref="57" " [C] ">
                                    <#group 6 ref="58" $content_ref=IvNode>
                                        <b 8>
                                            <#text 9 ref="7" " Item C">
                                        </b>
                                    </#group>
                                </li>
                            </#group>
                        </#group>
                    </ul>
                </#group>
            </#group>
        `, "update 2");
        
        // as the for loop is not keyed, the first group will be reused (group 2 ref="10")
        assert.equal(r.changes(), `
            UpdateText " [F] " in #13
            ReplaceGroupContent #39 in #12 at position 1
            DeleteGroup #40 in #15 at position 0
            CreateGroup #47 in #15 at position 0
            UpdateText " [A] " in #20
            ReplaceGroupContent #44 in #19 at position 1
            CreateGroup #49 in #9 at position 3
            CreateGroup #54 in #9 at position 4
        `, "update 2b");
    });

});