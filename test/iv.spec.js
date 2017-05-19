/**
 * IV tests
 * Copyright Bertrand Laporte 2016
 * Created on 30/04/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {iv} from '../src/iv/iv';
import {diff} from './utils';

describe('IV runtime', () => {
    let OPTIONS = {indent: "            "}, OPTIONS2 = {indent: OPTIONS.indent, showRef: true};

    it('should generate simple nodes', () => {
        let pkg = iv `
            <function #test nbr>
                <div class="hello">
                    // some comment
                    <span class="one" title="blah" foo=nbr+4> Hello </span>
                    <span class="two" [baz]=nbr+3 [bar]=nbr*2> World </span>
                </div>
            </function>
        `;
        pkg.test.uid = "XX";
        let view = pkg.test.createView({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-nbr=42>
                <div 1 class="hello">
                    <span 2 class="one" foo=46 title="blah">
                        <#text 3 " Hello "/>
                    </span>
                    <span 4 bar=84 baz=45 class="two">
                        <#text 5 " World "/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");

        expect(view.vdom.isGroupNode).toBe(true);
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            CREATE_GROUP: XX:0:0`
        )).toBe("equal");

        let vdom1 = view.vdom;
        view.refresh({nbr: 5});
        expect(view.vdom).toBe(vdom1);
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-nbr=5>
                <div 1 ref="XX:0:1" class="hello">
                    <span 2 ref="XX:0:2" class="one" foo=46 title="blah">
                        <#text 3 " Hello "/>
                    </span>
                    <span 4 ref="XX:0:3" bar=10 baz=8 class="two">
                        <#text 5 " World "/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");

        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_ELEMENT: XX:0:3`
        )).toBe("equal");
    });

    it('should support text inserts', () => {
        let pkg = iv `
            <function #test nbr msg>
                <div>
                    <span> {{nbr+10}} </span>
                    <span> A {{msg}} B </span>
                </div>
            </function>
        `;
        pkg.test.uid = "XX";
        let view = pkg.test.createView({nbr: 42, msg: "Hello!"}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS2), vdom1 = `\
            <#group 0 function ref="XX:0:0" att-msg="Hello!" att-nbr=42>
                <div 1 ref="XX:0:1">
                    <span 2 ref="XX:0:2">
                        <#group 3 insert ref="XX:0:3">
                            <#text -1 ref="XX:0:4" "52"/>
                        </#group>
                    </span>
                    <span 4 ref="XX:0:5">
                        <#text 5 " A "/>
                        <#group 6 insert ref="XX:0:6">
                            <#text -1 ref="XX:0:7" "Hello!"/>
                        </#group>
                        <#text 7 " B "/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            CREATE_GROUP: XX:0:0`
        )).toBe("equal");

        view.refresh({nbr: 9});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-nbr=9>
                <div 1>
                    <span 2>
                        <#group 3 insert>
                            <#text -1 "19"/>
                        </#group>
                    </span>
                    <span 4>
                        <#text 5 " A "/>
                        <#group 6 insert>
                            <#text -1 ""/>
                        </#group>
                        <#text 7 " B "/>
                    </span>
                </div>
            </#group>`)).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_TEXT: XX:0:4
            UPDATE_TEXT: XX:0:7`
        )).toBe("equal");

        view.refresh({nbr: 42, msg: "Hello!"});
        expect(diff(view.vdom.toString(OPTIONS2), vdom1)).toBe("equal");
    });


    it('should support simple if blocks', () => {
        let pkg = iv `
            <function #test nbr>
                <div>
                    ABC
                    % if (nbr===42) {
                        <span> Hello </span>
                        <span> World </span>
                    % }
                    <span> DEF </span>
                </div>
            </function>
        `;
        pkg.test.uid = "XX"; // for test only to get a reproducible id value

        let view = pkg.test.createView({nbr: 3});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-nbr=3>
                <div 1 ref="XX:0:1">
                    <#text 2 " ABC "/>
                    <span 8 ref="XX:0:2">
                        <#text 9 " DEF "/>
                    </span>
                </div>
            </#group>`)).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            CREATE_GROUP: XX:0:0`
        )).toBe("equal");

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-nbr=42>
                <div 1 ref="XX:0:1">
                    <#text 2 " ABC "/>
                    <#group 3 js ref="XX:0:3">
                        <span 4 ref="XX:0:4">
                            <#text 5 " Hello "/>
                        </span>
                        <span 6 ref="XX:0:5">
                            <#text 7 " World "/>
                        </span>
                    </#group>
                    <span 8 ref="XX:0:2">
                        <#text 9 " DEF "/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            CREATE_GROUP: XX:0:3 in XX:0:1`
        )).toBe("equal");

        // remove nodes
        view.refresh({nbr: 3, msg: "Hello!"});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-msg="Hello!" att-nbr=3>
                <div 1 ref="XX:0:1">
                    <#text 2 " ABC "/>
                    <span 8 ref="XX:0:2">
                        <#text 9 " DEF "/>
                    </span>
                </div>
            </#group>`)).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:3`
        )).toBe("equal");

        // create again
        view.refresh({nbr: 42, msg: "Hello!"});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-msg="Hello!" att-nbr=42>
                <div 1 ref="XX:0:1">
                    <#text 2 " ABC "/>
                    <#group 3 js ref="XX:0:6">
                        <span 4 ref="XX:0:7">
                            <#text 5 " Hello "/>
                        </span>
                        <span 6 ref="XX:0:8">
                            <#text 7 " World "/>
                        </span>
                    </#group>
                    <span 8 ref="XX:0:2">
                        <#text 9 " DEF "/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            CREATE_GROUP: XX:0:6 in XX:0:1`
        )).toBe("equal");

        // test that function instance ref is increasing for view count (2nd part)
        let view2 = pkg.test.createView({nbr: 9});
        expect(diff(view2.vdom.toString({indent: OPTIONS.indent, showRef: true}), `\
            <#group 0 function ref="XX:1:0" att-nbr=9>
                <div 1 ref="XX:1:1">
                    <#text 2 " ABC "/>
                    <span 8 ref="XX:1:2">
                        <#text 9 " DEF "/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");
    });


    it('should support if blocks at function start', () => {
        let pkg = iv `
            <function #test nbr>
                % if (nbr===42) {
                    <span> Hello World </span>
                % }
                <div>
                    ABC
                    <span> DEF </span>
                </div>
            </function>
        `;
        pkg.test.uid = "XX";
        let view = pkg.test.createView({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-nbr=3>
                <div 4 ref="XX:0:1">
                    <#text 5 " ABC "/>
                    <span 6 ref="XX:0:2">
                        <#text 7 " DEF "/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-nbr=42>
                <#group 1 js ref="XX:0:3">
                    <span 2 ref="XX:0:4">
                        <#text 3 " Hello World "/>
                    </span>
                </#group>
                <div 4 ref="XX:0:1">
                    <#text 5 " ABC "/>
                    <span 6 ref="XX:0:2">
                        <#text 7 " DEF "/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            CREATE_GROUP: XX:0:3 in XX:0:0`
        )).toBe("equal");

        // remove nodes
        view.refresh({nbr: 9});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-nbr=9>
                <div 4 ref="XX:0:1">
                    <#text 5 " ABC "/>
                    <span 6 ref="XX:0:2">
                        <#text 7 " DEF "/>
                    </span>
                </div>
            </#group>`)).toBe('equal');
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:3`
        )).toBe("equal");
    });

    it('should support if blocks at function end', () => {
        let pkg = iv `
            <function #test nbr>
                <div>
                    ABC
                    <span> DEF </span>
                </div>
                % if (nbr===42) {
                    <span> Hello World </span>
                % }
            </function>
        `;
        pkg.test.uid = "XX";
        let view = pkg.test.createView({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS), vdom1 = `\
            <#group 0 function att-nbr=3>
                <div 1>
                    <#text 2 " ABC "/>
                    <span 3>
                        <#text 4 " DEF "/>
                    </span>
                </div>
            </#group>`)).toBe("equal");

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-nbr=42>
                <div 1 ref="XX:0:1">
                    <#text 2 " ABC "/>
                    <span 3 ref="XX:0:2">
                        <#text 4 " DEF "/>
                    </span>
                </div>
                <#group 5 js ref="XX:0:3">
                    <span 6 ref="XX:0:4">
                        <#text 7 " Hello World "/>
                    </span>
                </#group>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            CREATE_GROUP: XX:0:3 in XX:0:0`
        )).toBe("equal");

        // remove nodes
        view.refresh({nbr: 3});
        expect(diff(view.vdom.toString(OPTIONS), vdom1)).toBe('equal');
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:3`
        )).toBe("equal");
    });

    it('should support if blocks as full function', () => {
        let pkg = iv `
            <function #test nbr>
                % if (nbr===42) {
                    <span> Hello </span>
                    <span> World </span>
                % }
            </function>
        `;
        let view = pkg.test.createView({nbr: 3});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-nbr=3/>`
        )).toBe("equal");

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-nbr=42>
                <#group 1 js>
                    <span 2>
                        <#text 3 " Hello "/>
                    </span>
                    <span 4>
                        <#text 5 " World "/>
                    </span>
                </#group>
            </#group>`
        )).toBe("equal");

        // remove nodes
        view.refresh({nbr: 3});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-nbr=3/>`
        )).toBe('equal');
    });


    it('should support if blocks as full node content', () => {
        let pkg = iv `
            <function #test nbr>
                foo
                <div>
                % if (nbr===42) {
                    <span> Hello </span>
                    <span> World </span>
                % }
                </div>
                bar
            </function>
        `;
        let view = pkg.test.createView({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS), vdom1 = `\
            <#group 0 function att-nbr=3>
                <#text 1 " foo "/>
                <div 2/>
                <#text 8 " bar "/>
            </#group>`
        )).toBe("equal");

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-nbr=42>
                <#text 1 " foo "/>
                <div 2>
                    <#group 3 js>
                        <span 4>
                            <#text 5 " Hello "/>
                        </span>
                        <span 6>
                            <#text 7 " World "/>
                        </span>
                    </#group>
                </div>
                <#text 8 " bar "/>
            </#group>`
        )).toBe("equal");

        // remove nodes
        view.refresh({nbr: 3});
        expect(diff(view.vdom.toString(OPTIONS), vdom1)).toBe('equal');
    });

    it('should support if blocks at node start', () => {
        let pkg = iv `
            <function #test nbr>
                <div>
                    % if (nbr===42) {
                        <span> Hello World </span>
                    % }
                    <div>
                        ABC
                        <span> DEF </span>
                    </div>
                </div>
            </function>
        `;
        let view = pkg.test.createView({nbr: 3});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-nbr=3>
                <div 1>
                    <div 5>
                        <#text 6 " ABC "/>
                        <span 7>
                            <#text 8 " DEF "/>
                        </span>
                    </div>
                </div>
            </#group>`
        )).toBe("equal");

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-nbr=42>
                <div 1>
                    <#group 2 js>
                        <span 3>
                            <#text 4 " Hello World "/>
                        </span>
                    </#group>
                    <div 5>
                        <#text 6 " ABC "/>
                        <span 7>
                            <#text 8 " DEF "/>
                        </span>
                    </div>
                </div>
            </#group>`
        )).toBe("equal");

        // remove nodes
        view.refresh({nbr: 3});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-nbr=3>
                <div 1>
                    <div 5>
                        <#text 6 " ABC "/>
                        <span 7>
                            <#text 8 " DEF "/>
                        </span>
                    </div>
                </div>
            </#group>`
        )).toBe("equal");
    });

    it('should support if+else blocks', () => {
        let pkg = iv `
            <function #test nbr>
                <div>
                    foo
                    % if (nbr===42) {
                        <span> Case 42 </span>
                    % } else {
                        <span> Case != 42 </span>
                    % }
                    bar
                </div>
            </function>
        `;
        pkg.test.uid = "XX";
        let view = pkg.test.createView({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-nbr=3>
                <div 1 ref="XX:0:1">
                    <#text 2 " foo "/>
                    <#group 6 js ref="XX:0:2">
                        <span 7 ref="XX:0:3">
                            <#text 8 " Case != 42 "/>
                        </span>
                    </#group>
                    <#text 9 " bar "/>
                </div>
            </#group>`
        )).toBe("equal");

        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-nbr=42>
                <div 1 ref="XX:0:1">
                    <#text 2 " foo "/>
                    <#group 3 js ref="XX:0:4">
                        <span 4 ref="XX:0:5">
                            <#text 5 " Case 42 "/>
                        </span>
                    </#group>
                    <#text 9 " bar "/>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            CREATE_GROUP: XX:0:4 in XX:0:1
            DELETE_GROUP: XX:0:2`
        )).toBe("equal");

        view.refresh({nbr: 9});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-nbr=9>
                <div 1 ref="XX:0:1">
                    <#text 2 " foo "/>
                    <#group 6 js ref="XX:0:6">
                        <span 7 ref="XX:0:7">
                            <#text 8 " Case != 42 "/>
                        </span>
                    </#group>
                    <#text 9 " bar "/>
                </div>
            </#group>`
        )).toBe("equal");

        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:4
            CREATE_GROUP: XX:0:6 in XX:0:1`
        )).toBe("equal"); // note: could be improved through object pooling
    });

    it('should support if+else blocks for full function', () => {
        let pkg = iv `
            <function #test nbr>
                % if (nbr===42) {
                    <span> Case 42 </span>
                % } else {
                    <span> Case != 42 </span>
                % }
            </function>
        `;
        let view = pkg.test.createView({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS), vdom1 = `\
            <#group 0 function att-nbr=3>
                <#group 4 js>
                    <span 5>
                        <#text 6 " Case != 42 "/>
                    </span>
                </#group>
            </#group>`
        )).toBe("equal");

        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-nbr=42>
                <#group 1 js>
                    <span 2>
                        <#text 3 " Case 42 "/>
                    </span>
                </#group>
            </#group>`
        )).toBe("equal");

        view.refresh({nbr: 3});
        expect(diff(view.vdom.toString(OPTIONS), vdom1)).toBe("equal");
    });

    it('should support for loops', () => {
        let pkg = iv `
            <function #test list=[]>
                <div>
                    <div title="first"/>
                    % for (let i=0;list.length>i;i++) {
                        <div [title]=("Hello " + list[i].name)/>
                    % }
                    <div title="last"/>
                </div>
            </function>
        `;
        pkg.test.uid = "XX";
        let view = pkg.test.createView();
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0">
                <div 1 ref="XX:0:1">
                    <div 2 title="first"/>
                    <div 5 title="last"/>
                </div>
            </#group>`
        )).toBe("equal");

        view.refresh({
            list: [
                {name: "Arthur"},
                {name: "Douglas"}
            ]
        });
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-list=Object>
                <div 1 ref="XX:0:1">
                    <div 2 title="first"/>
                    <#group 3 js ref="XX:0:2">
                        <div 4 ref="XX:0:3" title="Hello Arthur"/>
                    </#group>
                    <#group 3 js ref="XX:0:4">
                        <div 4 ref="XX:0:5" title="Hello Douglas"/>
                    </#group>
                    <div 5 title="last"/>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            CREATE_GROUP: XX:0:2 in XX:0:1
            CREATE_GROUP: XX:0:4 in XX:0:1`
        )).toBe("equal");

        view.refresh({
            list: [
                {name: "Arthur"},
                {name: "Slartibartfast"},
                {name: "Douglas"}
            ]
        });
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-list=Object>
                <div 1 ref="XX:0:1">
                    <div 2 title="first"/>
                    <#group 3 js ref="XX:0:2">
                        <div 4 ref="XX:0:3" title="Hello Arthur"/>
                    </#group>
                    <#group 3 js ref="XX:0:4">
                        <div 4 ref="XX:0:5" title="Hello Slartibartfast"/>
                    </#group>
                    <#group 3 js ref="XX:0:6">
                        <div 4 ref="XX:0:7" title="Hello Douglas"/>
                    </#group>
                    <div 5 title="last"/>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_ELEMENT: XX:0:5
            CREATE_GROUP: XX:0:6 in XX:0:1`
        )).toBe("equal");

        view.refresh({list: []});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-list=Object>
                <div 1 ref="XX:0:1">
                    <div 2 title="first"/>
                    <div 5 title="last"/>
                </div>
            </#group>`
        )).toBe("equal");

        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:2
            DELETE_GROUP: XX:0:4
            DELETE_GROUP: XX:0:6`
        )).toBe("equal");
    });

    it('should support for loops with if statements', () => {
        let pkg = iv `
            <function #test list=[] condition=false>
                <div>
                    <div title="first"/>
                    % for (let i=0;list.length>i;i++) {
                        <div [title]=("item " + i + ": " + list[i])/>
                        % if (condition) {
                        <div> OK </div>
                        % }
                    % }
                    <div title="last"/>
                </div>
            </function>
        `;
        pkg.test.uid = "XX";
        let view = pkg.test.createView({list: ["Omer", "Marge"], condition: true});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-condition=true att-list=Object>
                <div 1 ref="XX:0:1">
                    <div 2 title="first"/>
                    <#group 3 js ref="XX:0:2">
                        <div 4 ref="XX:0:3" title="item 0: Omer"/>
                        <#group 5 js ref="XX:0:4">
                            <div 6 ref="XX:0:5">
                                <#text 7 " OK "/>
                            </div>
                        </#group>
                    </#group>
                    <#group 3 js ref="XX:0:6">
                        <div 4 ref="XX:0:7" title="item 1: Marge"/>
                        <#group 5 js ref="XX:0:8">
                            <div 6 ref="XX:0:9">
                                <#text 7 " OK "/>
                            </div>
                        </#group>
                    </#group>
                    <div 8 title="last"/>
                </div>
            </#group>`
        )).toBe("equal");

        view.refresh({list: ["Omer", "Marge"], condition: false});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function att-condition=false att-list=Object>
                <div 1>
                    <div 2 title="first"/>
                    <#group 3 js>
                        <div 4 title="item 0: Omer"/>
                    </#group>
                    <#group 3 js>
                        <div 4 title="item 1: Marge"/>
                    </#group>
                    <div 8 title="last"/>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:4
            DELETE_GROUP: XX:0:8`
        )).toBe("equal");

        view.refresh({list: ["Omer", "Marge"], condition: true});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-condition=true att-list=Object>
                <div 1 ref="XX:0:1">
                    <div 2 title="first"/>
                    <#group 3 js ref="XX:0:2">
                        <div 4 ref="XX:0:3" title="item 0: Omer"/>
                        <#group 5 js ref="XX:0:10">
                            <div 6 ref="XX:0:11">
                                <#text 7 " OK "/>
                            </div>
                        </#group>
                    </#group>
                    <#group 3 js ref="XX:0:6">
                        <div 4 ref="XX:0:7" title="item 1: Marge"/>
                        <#group 5 js ref="XX:0:12">
                            <div 6 ref="XX:0:13">
                                <#text 7 " OK "/>
                            </div>
                        </#group>
                    </#group>
                    <div 8 title="last"/>
                </div>
            </#group>`)).toBe('equal');
    });


    it('should support sub-templates', () => {
        let pkg = iv`
            <function #foo v:Number=123>
                <div>
                    <span>first</span>
                    <bar [value]=v+1 msg=("m1:"+v)/>
                    <bar [value]=v+3 msg=("m2:"+v)/>
                    <span>last</span>
                </div>
            </function>
            
            <function #bar value msg="">
                <span [title]=(value+' '+msg)/>
                % if (value === 45) {
                    <span> Hello 45! </span>
                % }
            </function>
        `;

        pkg.foo.uid = "XX";
        pkg.bar.uid = "YY";
        let view = pkg.foo.createView({v: 9}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS2), vdom1 = `\
            <#group 0 function ref="XX:0:0" att-v=9>
                <div 1 ref="XX:0:1">
                    <span 2 ref="XX:0:2">
                        <#text 3 "first"/>
                    </span>
                    <#group 4 bar ref="XX:0:3" att-msg="m1:9" att-value=10>
                        <span 1 ref="YY:0:0" title="10 m1:9"/>
                    </#group>
                    <#group 5 bar ref="XX:0:4" att-msg="m2:9" att-value=12>
                        <span 1 ref="YY:1:0" title="12 m2:9"/>
                    </#group>
                    <span 6 ref="XX:0:5">
                        <#text 7 "last"/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");

        view.refresh({v: 42});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-v=42>
                <div 1 ref="XX:0:1">
                    <span 2 ref="XX:0:2">
                        <#text 3 "first"/>
                    </span>
                    <#group 4 bar ref="XX:0:3" att-msg="m1:9" att-value=43>
                        <span 1 ref="YY:0:0" title="43 m1:9"/>
                    </#group>
                    <#group 5 bar ref="XX:0:4" att-msg="m2:9" att-value=45>
                        <span 1 ref="YY:1:0" title="45 m2:9"/>
                        <#group 2 js ref="YY:1:1">
                            <span 3 ref="YY:1:2">
                                <#text 4 " Hello 45! "/>
                            </span>
                        </#group>
                    </#group>
                    <span 6 ref="XX:0:5">
                        <#text 7 "last"/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_GROUP: XX:0:3
            UPDATE_ELEMENT: YY:0:0
            UPDATE_GROUP: XX:0:4
            UPDATE_ELEMENT: YY:1:0
            CREATE_GROUP: YY:1:1 in XX:0:4`
        )).toBe("equal");

        view.refresh({v: 9});
        expect(diff(view.vdom.toString(OPTIONS2), vdom1)).toBe("equal");

        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_GROUP: XX:0:3
            UPDATE_ELEMENT: YY:0:0
            UPDATE_GROUP: XX:0:4
            UPDATE_ELEMENT: YY:1:0
            DELETE_GROUP: YY:1:1`
        )).toBe("equal");
    });

    it('should support sub-templates with content', () => {
        let pkg = iv`
            <function #foo v:Number=1 msg="hello">
                <div>
                    AAA
                    <bar [value]=v>
                        <span>content {{v+100}}</span>
                    </bar>
                    BBB
                </div>
            </function>
    
            <function #bar value=1 body:IvContent>
                <span [title]=value> first </span>
                % if (value !== 42) {
                    <span>Z {{body}} Z</span>
                % }
                <span> last </span>
            </function>
        `;

        pkg.foo.uid = "XX";
        pkg.bar.uid = "YY";
        let view = pkg.foo.createView({v: 9});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-v=9>
                <div 1 ref="XX:0:1">
                    <#text 2 " AAA "/>
                    <#group 3 bar ref="XX:0:2" att-body=IvNode att-value=9>
                        <span 1 ref="YY:0:0" title=9>
                            <#text 2 " first "/>
                        </span>
                        <#group 3 js ref="YY:0:1">
                            <span 4 ref="YY:0:2">
                                <#text 5 "Z "/>
                                <#group 6 insert ref="YY:0:3">
                                    <span 4 ref="XX:0:3">
                                        <#text 5 "content "/>
                                        <#group 6 insert ref="XX:0:4">
                                            <#text -1 ref="XX:0:5" "109"/>
                                        </#group>
                                    </span>
                                </#group>
                                <#text 7 " Z"/>
                            </span>
                        </#group>
                        <span 8 ref="YY:0:4">
                            <#text 9 " last "/>
                        </span>
                    </#group>
                    <#text 7 " BBB "/>
                </div>
            </#group>`
        )).toBe("equal");

        view.refresh({v: 42});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-v=42>
                <div 1 ref="XX:0:1">
                    <#text 2 " AAA "/>
                    <#group 3 bar ref="XX:0:2" att-body=IvNode att-value=42>
                        <span 1 ref="YY:0:0" title=42>
                            <#text 2 " first "/>
                        </span>
                        <span 8 ref="YY:0:4">
                            <#text 9 " last "/>
                        </span>
                    </#group>
                    <#text 7 " BBB "/>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_GROUP: XX:0:2
            UPDATE_ELEMENT: YY:0:0
            DELETE_GROUP: YY:0:1`
        )).toBe("equal");

        view.refresh({v: 9});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-v=9>
                <div 1 ref="XX:0:1">
                    <#text 2 " AAA "/>
                    <#group 3 bar ref="XX:0:2" att-body=IvNode att-value=9>
                        <span 1 ref="YY:0:0" title=9>
                            <#text 2 " first "/>
                        </span>
                        <#group 3 js ref="YY:0:5">
                            <span 4 ref="YY:0:6">
                                <#text 5 "Z "/>
                                <#group 6 insert ref="YY:0:7">
                                    <span 4 ref="XX:0:3">
                                        <#text 5 "content "/>
                                        <#group 6 insert ref="XX:0:4">
                                            <#text -1 ref="XX:0:5" "109"/>
                                        </#group>
                                    </span>
                                </#group>
                                <#text 7 " Z"/>
                            </span>
                        </#group>
                        <span 8 ref="YY:0:4">
                            <#text 9 " last "/>
                        </span>
                    </#group>
                    <#text 7 " BBB "/>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_GROUP: XX:0:2
            UPDATE_ELEMENT: YY:0:0
            CREATE_GROUP: YY:0:5 in XX:0:2`
        )).toBe("equal");

        view.refresh({v: 31});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-v=31>
                <div 1 ref="XX:0:1">
                    <#text 2 " AAA "/>
                    <#group 3 bar ref="XX:0:2" att-body=IvNode att-value=31>
                        <span 1 ref="YY:0:0" title=31>
                            <#text 2 " first "/>
                        </span>
                        <#group 3 js ref="YY:0:5">
                            <span 4 ref="YY:0:6">
                                <#text 5 "Z "/>
                                <#group 6 insert ref="YY:0:7">
                                    <span 4 ref="XX:0:3">
                                        <#text 5 "content "/>
                                        <#group 6 insert ref="XX:0:4">
                                            <#text -1 ref="XX:0:5" "131"/>
                                        </#group>
                                    </span>
                                </#group>
                                <#text 7 " Z"/>
                            </span>
                        </#group>
                        <span 8 ref="YY:0:4">
                            <#text 9 " last "/>
                        </span>
                    </#group>
                    <#text 7 " BBB "/>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_GROUP: XX:0:2
            UPDATE_ELEMENT: YY:0:0
            UPDATE_TEXT: XX:0:5`
        )).toBe("equal");
    });

    it('should support sub-templates with for loops', () => {
        let pkg = iv`
            <function #test list>
               <div #main>
                  % for (let i=0;list.length>i;i++) {
                      <sub [data]=list[i]/>
                  % }
               </div>
            </function>
    
            <function #sub data>
                <div [title]=data.title>{{data.content}}</div>
            </function>
        `;

        pkg.test.uid = "XX";
        pkg.sub.uid = "YY";
        let list = [
            {title: "ta0", content: "ca0"},
            {title: "tb0", content: "cb0"}
        ];

        let view = pkg.test.createView({list: list});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-list=Object>
                <div 1 ref="XX:0:1" id="main">
                    <#group 2 js ref="XX:0:2">
                        <#group 3 sub ref="XX:0:3" att-data=Object>
                            <div 1 ref="YY:0:0" title="ta0">
                                <#group 2 insert ref="YY:0:1">
                                    <#text -1 ref="YY:0:2" "ca0"/>
                                </#group>
                            </div>
                        </#group>
                    </#group>
                    <#group 2 js ref="XX:0:4">
                        <#group 3 sub ref="XX:0:5" att-data=Object>
                            <div 1 ref="YY:1:0" title="tb0">
                                <#group 2 insert ref="YY:1:1">
                                    <#text -1 ref="YY:1:2" "cb0"/>
                                </#group>
                            </div>
                        </#group>
                    </#group>
                </div>
            </#group>`
        )).toBe("equal");

        list = [
            {title: "ta1", content: "ca1"},
            {title: "tb1", content: "cb1"}
        ];
        view.refresh({list: list});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-list=Object>
                <div 1 ref="XX:0:1" id="main">
                    <#group 2 js ref="XX:0:2">
                        <#group 3 sub ref="XX:0:3" att-data=Object>
                            <div 1 ref="YY:0:0" title="ta1">
                                <#group 2 insert ref="YY:0:1">
                                    <#text -1 ref="YY:0:2" "ca1"/>
                                </#group>
                            </div>
                        </#group>
                    </#group>
                    <#group 2 js ref="XX:0:4">
                        <#group 3 sub ref="XX:0:5" att-data=Object>
                            <div 1 ref="YY:1:0" title="tb1">
                                <#group 2 insert ref="YY:1:1">
                                    <#text -1 ref="YY:1:2" "cb1"/>
                                </#group>
                            </div>
                        </#group>
                    </#group>
                </div>
            </#group>`
        )).toBe("equal");

    });

    it('should support sub-templates with multiple content', () => {
        let pkg = iv`
            <function #test testCase=1>
                Case #{{testCase}}
                % if (testCase === 1) {
                    <panel>
                        <:title> Hello <img src="smile.png"/></:title>
                        <:body>
                            <p>Some content</p>
                        </:body>
                    </panel>
                % }
            </function>

            <function #panel title:IvNode body:IvNode>
                % if (body) {
                    <div class="panel">
                        % if (title) {
                            <div class="title">{{title}}</div>
                        % }
                        <div class="body">{{body}}</div>
                    </div>
                % }
            </function>
        `;

        pkg.test.uid = "XX";
        pkg.panel.uid = "YY";
        let view = pkg.test.createView({testCase: 1});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-testCase=1>
                <#text 1 " Case #"/>
                <#group 2 insert ref="XX:0:1">
                    <#text -1 ref="XX:0:2" "1"/>
                </#group>
                <#group 3 js ref="XX:0:3">
                    <#group 4 panel ref="XX:0:4" att-body=IvNode att-title=IvNode>
                        <#group 1 js ref="YY:0:0">
                            <div 2 ref="YY:0:1" class="panel">
                                <#group 3 js ref="YY:0:2">
                                    <div 4 ref="YY:0:3" class="title">
                                        <#group 5 insert ref="YY:0:4">
                                            <#text 6 " Hello "/>
                                            <img 7 src="smile.png"/>
                                        </#group>
                                    </div>
                                </#group>
                                <div 6 ref="YY:0:5" class="body">
                                    <#group 7 insert ref="YY:0:6">
                                        <p 9 ref="XX:0:5">
                                            <#text 10 "Some content"/>
                                        </p>
                                    </#group>
                                </div>
                            </div>
                        </#group>
                    </#group>
                </#group>
            </#group>`
        )).toBe("equal");
    });

    it('should support type definitions', () => {
        let pkg = iv`
            <type #Tab name:String body:IvContent misc:String/>

            <function #tabbar tabList:Tab[]>
                Number of tabs: {{tabList.length}}
                % for (var i=0;tabList.length>i;i++) {
                    % var tab = tabList[i];
                    <div class="title">{{tab.name}}</div>
                    <div class="content" title=tab.misc>{{tab.body}}</div>
                % }
            </function>

            <function #test list>
                <tabbar>
                    % for (var i=0;list.length>i;i++) {
                        % var item=list[i];
                        <:tab [name]=item misc="foo">
                            <b> Content {{item+"X"}} </b>
                        </:tab>
                    % }
                </tabbar>
            </function>
        `;

        pkg.test.uid = "XX";
        pkg.tabbar.uid = "YY";
        let view = pkg.test.createView({list: ["A", "B"]});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-list=Object>
                <#group 1 tabbar ref="XX:0:1" att-tabList=Object>
                    <#text 1 " Number of tabs: "/>
                    <#group 2 insert ref="YY:0:0">
                        <#text -1 ref="YY:0:1" "2"/>
                    </#group>
                    <#group 3 js ref="YY:0:2">
                        <div 4 ref="YY:0:3" class="title">
                            <#group 5 insert ref="YY:0:4">
                                <#text -1 ref="YY:0:5" "A"/>
                            </#group>
                        </div>
                        <div 6 ref="YY:0:6" class="content" title="foo">
                            <#group 7 insert ref="YY:0:7">
                                <b 4 ref="XX:0:3">
                                    <#text 5 " Content "/>
                                    <#group 6 insert ref="XX:0:4">
                                        <#text -1 ref="XX:0:5" "AX"/>
                                    </#group>
                                </b>
                            </#group>
                        </div>
                    </#group>
                    <#group 3 js ref="YY:0:8">
                        <div 4 ref="YY:0:9" class="title">
                            <#group 5 insert ref="YY:0:10">
                                <#text -1 ref="YY:0:11" "B"/>
                            </#group>
                        </div>
                        <div 6 ref="YY:0:12" class="content" title="foo">
                            <#group 7 insert ref="YY:0:13">
                                <b 4 ref="XX:0:7">
                                    <#text 5 " Content "/>
                                    <#group 6 insert ref="XX:0:8">
                                        <#text -1 ref="XX:0:9" "BX"/>
                                    </#group>
                                </b>
                            </#group>
                        </div>
                    </#group>
                </#group>
            </#group>`
        )).toBe("equal");

        view.refresh({list: ["A2", "B", "C"]});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-list=Object>
                <#group 1 tabbar ref="XX:0:1" att-tabList=Object>
                    <#text 1 " Number of tabs: "/>
                    <#group 2 insert ref="YY:0:0">
                        <#text -1 ref="YY:0:1" "3"/>
                    </#group>
                    <#group 3 js ref="YY:0:2">
                        <div 4 ref="YY:0:3" class="title">
                            <#group 5 insert ref="YY:0:4">
                                <#text -1 ref="YY:0:5" "A2"/>
                            </#group>
                        </div>
                        <div 6 ref="YY:0:6" class="content" title="foo">
                            <#group 7 insert ref="YY:0:7">
                                <b 4 ref="XX:0:3">
                                    <#text 5 " Content "/>
                                    <#group 6 insert ref="XX:0:4">
                                        <#text -1 ref="XX:0:5" "A2X"/>
                                    </#group>
                                </b>
                            </#group>
                        </div>
                    </#group>
                    <#group 3 js ref="YY:0:8">
                        <div 4 ref="YY:0:9" class="title">
                            <#group 5 insert ref="YY:0:10">
                                <#text -1 ref="YY:0:11" "B"/>
                            </#group>
                        </div>
                        <div 6 ref="YY:0:12" class="content" title="foo">
                            <#group 7 insert ref="YY:0:13">
                                <b 4 ref="XX:0:7">
                                    <#text 5 " Content "/>
                                    <#group 6 insert ref="XX:0:8">
                                        <#text -1 ref="XX:0:9" "BX"/>
                                    </#group>
                                </b>
                            </#group>
                        </div>
                    </#group>
                    <#group 3 js ref="YY:0:14">
                        <div 4 ref="YY:0:15" class="title">
                            <#group 5 insert ref="YY:0:16">
                                <#text -1 ref="YY:0:17" "C"/>
                            </#group>
                        </div>
                        <div 6 ref="YY:0:18" class="content" title="foo">
                            <#group 7 insert ref="YY:0:19">
                                <b 4 ref="XX:0:11">
                                    <#text 5 " Content "/>
                                    <#group 6 insert ref="XX:0:12">
                                        <#text -1 ref="XX:0:13" "CX"/>
                                    </#group>
                                </b>
                            </#group>
                        </div>
                    </#group>
                </#group>
            </#group>`
        )).toBe("equal");

        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_TEXT: YY:0:1
            UPDATE_TEXT: YY:0:5
            UPDATE_TEXT: XX:0:5
            CREATE_GROUP: YY:0:14 in XX:0:1`
        )).toBe("equal");
    });

    it('should support multiple levels of node attributes', () => {
        let pkg = iv`
            <type #TabLabel showWarning:Boolean value:IvContent/>
            <type #Tab name:String label:TabLabel body:IvContent/>

            <function #tabbar tabList:Tab[] selection:String>
                Number of tabs: {{tabList.length}}
                % for (var i=0;tabList.length>i;i++) {
                    % var tab = tabList[i];
                    % if (tab.label.showWarning) {
                        WARNING!
                    % }
                    <div class="title" [name]=tab.name>{{tab.label.value}}</div>
                    <div class="content">{{tab.body}}</div>
                % }
            </function>

            <function #test list>
                <tabbar>
                    <:tab name="1" >
                        <:label showWarning=true>
                            <b> First label </b>
                        </:label>
                        First content
                    </:tab>
                    % for (var i=0;list.length>i;i++) {
                        % var item=list[i];
                        <:tab [name]=item>
                            <:label> Label {{i+2}}</:label>
                            {{"content_"+item}}
                        </:tab>
                    % }
                </tabbar>
            </function>
        `;

        pkg.test.uid = "XX";
        pkg.tabbar.uid = "YY";
        let view = pkg.test.createView({list: ["A", "B"]});

        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-list=Object>
                <#group 1 tabbar ref="XX:0:1" att-tabList=Object>
                    <#text 1 " Number of tabs: "/>
                    <#group 2 insert ref="YY:0:0">
                        <#text -1 ref="YY:0:1" "3"/>
                    </#group>
                    <#group 3 js ref="YY:0:2">
                        <#group 4 js ref="YY:0:3">
                            <#text 5 " WARNING! "/>
                        </#group>
                        <div 6 ref="YY:0:4" class="title" name="1">
                            <#group 7 insert ref="YY:0:5">
                                <b 4 ref="XX:0:2">
                                    <#text 5 " First label "/>
                                </b>
                            </#group>
                        </div>
                        <div 8 ref="YY:0:6" class="content">
                            <#group 9 insert ref="YY:0:7">
                                <#data 3 >
                                    <b 4 ref="XX:0:2">
                                        <#text 5 " First label "/>
                                    </b>
                                </#data>
                                <#text 6 " First content "/>
                            </#group>
                        </div>
                    </#group>
                    <#group 3 js ref="YY:0:8">
                        <div 6 ref="YY:0:9" class="title" name="A">
                            <#group 7 insert ref="YY:0:10">
                                <#text 10 " Label "/>
                                <#group 11 insert ref="XX:0:5">
                                    <#text -1 ref="XX:0:6" "2"/>
                                </#group>
                            </#group>
                        </div>
                        <div 8 ref="YY:0:11" class="content">
                            <#group 9 insert ref="YY:0:12">
                                <#data 9 >
                                    <#text 10 " Label "/>
                                    <#group 11 insert ref="XX:0:5">
                                        <#text -1 ref="XX:0:6" "2"/>
                                    </#group>
                                </#data>
                                <#group 12 insert ref="XX:0:8">
                                    <#text -1 ref="XX:0:9" "content_A"/>
                                </#group>
                            </#group>
                        </div>
                    </#group>
                    <#group 3 js ref="YY:0:13">
                        <div 6 ref="YY:0:14" class="title" name="B">
                            <#group 7 insert ref="YY:0:15">
                                <#text 10 " Label "/>
                                <#group 11 insert ref="XX:0:12">
                                    <#text -1 ref="XX:0:13" "3"/>
                                </#group>
                            </#group>
                        </div>
                        <div 8 ref="YY:0:16" class="content">
                            <#group 9 insert ref="YY:0:17">
                                <#data 9 >
                                    <#text 10 " Label "/>
                                    <#group 11 insert ref="XX:0:12">
                                        <#text -1 ref="XX:0:13" "3"/>
                                    </#group>
                                </#data>
                                <#group 12 insert ref="XX:0:15">
                                    <#text -1 ref="XX:0:16" "content_B"/>
                                </#group>
                            </#group>
                        </div>
                    </#group>
                </#group>
            </#group>`
        )).toBe("equal");


        view.refresh({list: ["A2", "B", "C"]});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-list=Object>
                <#group 1 tabbar ref="XX:0:1" att-tabList=Object>
                    <#text 1 " Number of tabs: "/>
                    <#group 2 insert ref="YY:0:0">
                        <#text -1 ref="YY:0:1" "4"/>
                    </#group>
                    <#group 3 js ref="YY:0:2">
                        <#group 4 js ref="YY:0:3">
                            <#text 5 " WARNING! "/>
                        </#group>
                        <div 6 ref="YY:0:4" class="title" name="1">
                            <#group 7 insert ref="YY:0:5">
                                <b 4 ref="XX:0:2">
                                    <#text 5 " First label "/>
                                </b>
                            </#group>
                        </div>
                        <div 8 ref="YY:0:6" class="content">
                            <#group 9 insert ref="YY:0:7">
                                <#data 3 >
                                    <b 4 ref="XX:0:2">
                                        <#text 5 " First label "/>
                                    </b>
                                </#data>
                                <#text 6 " First content "/>
                            </#group>
                        </div>
                    </#group>
                    <#group 3 js ref="YY:0:8">
                        <div 6 ref="YY:0:9" class="title" name="A2">
                            <#group 7 insert ref="YY:0:10">
                                <#text 10 " Label "/>
                                <#group 11 insert ref="XX:0:5">
                                    <#text -1 ref="XX:0:6" "2"/>
                                </#group>
                            </#group>
                        </div>
                        <div 8 ref="YY:0:11" class="content">
                            <#group 9 insert ref="YY:0:12">
                                <#data 9 >
                                    <#text 10 " Label "/>
                                    <#group 11 insert ref="XX:0:5">
                                        <#text -1 ref="XX:0:6" "2"/>
                                    </#group>
                                </#data>
                                <#group 12 insert ref="XX:0:8">
                                    <#text -1 ref="XX:0:9" "content_A2"/>
                                </#group>
                            </#group>
                        </div>
                    </#group>
                    <#group 3 js ref="YY:0:13">
                        <div 6 ref="YY:0:14" class="title" name="B">
                            <#group 7 insert ref="YY:0:15">
                                <#text 10 " Label "/>
                                <#group 11 insert ref="XX:0:12">
                                    <#text -1 ref="XX:0:13" "3"/>
                                </#group>
                            </#group>
                        </div>
                        <div 8 ref="YY:0:16" class="content">
                            <#group 9 insert ref="YY:0:17">
                                <#data 9 >
                                    <#text 10 " Label "/>
                                    <#group 11 insert ref="XX:0:12">
                                        <#text -1 ref="XX:0:13" "3"/>
                                    </#group>
                                </#data>
                                <#group 12 insert ref="XX:0:15">
                                    <#text -1 ref="XX:0:16" "content_B"/>
                                </#group>
                            </#group>
                        </div>
                    </#group>
                    <#group 3 js ref="YY:0:18">
                        <div 6 ref="YY:0:19" class="title" name="C">
                            <#group 7 insert ref="YY:0:20">
                                <#text 10 " Label "/>
                                <#group 11 insert ref="XX:0:19">
                                    <#text -1 ref="XX:0:20" "4"/>
                                </#group>
                            </#group>
                        </div>
                        <div 8 ref="YY:0:21" class="content">
                            <#group 9 insert ref="YY:0:22">
                                <#data 9 >
                                    <#text 10 " Label "/>
                                    <#group 11 insert ref="XX:0:19">
                                        <#text -1 ref="XX:0:20" "4"/>
                                    </#group>
                                </#data>
                                <#group 12 insert ref="XX:0:22">
                                    <#text -1 ref="XX:0:23" "content_C"/>
                                </#group>
                            </#group>
                        </div>
                    </#group>
                </#group>
            </#group>`
        )).toBe("equal");

        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_TEXT: YY:0:1
            UPDATE_ELEMENT: YY:0:9
            UPDATE_TEXT: XX:0:9
            CREATE_GROUP: YY:0:18 in XX:0:1`
        )).toBe("equal");
    });

    it('should support IvController on root functions', () => {
        class FooController {
            $attributes;

            showValue() {
                return (this.$attributes["value"] !== "HIDE");
            }
        }

        let pkg = iv`
            <function #test value:String c:IvController(${FooController})>
                % if (c.showValue()) {
                    Value: {{value}}
                % }
            </function>
        `;

        pkg.test.uid = "XX";
        let view = pkg.test.createView({value: "VALUE1"});

        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-c=Object att-value="VALUE1">
                <#group 1 js ref="XX:0:1">
                    <#text 2 " Value: "/>
                    <#group 3 insert ref="XX:0:2">
                        <#text -1 ref="XX:0:3" "VALUE1"/>
                    </#group>
                </#group>
            </#group>`)).toBe("equal");

        view.refresh({value: "VALUE2"});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-c=Object att-value="VALUE2">
                <#group 1 js ref="XX:0:1">
                    <#text 2 " Value: "/>
                    <#group 3 insert ref="XX:0:2">
                        <#text -1 ref="XX:0:3" "VALUE2"/>
                    </#group>
                </#group>
            </#group>`)).toBe("equal");

        view.refresh({value: "HIDE"});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-c=Object att-value="HIDE"/>`
        )).toBe("equal");
    });


    it('should support IvController on sub functions', () => {
        class FooController {
            $attributes;

            showValue() {
                return (this.$attributes["value"] !== 42);
            }
        }

        let pkg = iv`
            <function #test v=12>
                <div class="blah">
                    <foo [value]=v+9/>
                </div>
            </function>
            
            <function #foo value:Number c:IvController(${FooController})>
                % if (c.showValue()) {
                    Value: {{value}}
                % }
            </function>
        `;

        pkg.test.uid = "XX";
        pkg.foo.uid = "YY";
        let view = pkg.test.createView(); // v=12

        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 function>
                <div 1 class="blah">
                    <#group 2 foo att-c=Object att-value=21>
                        <#group 1 js>
                            <#text 2 " Value: "/>
                            <#group 3 insert>
                                <#text -1 "21"/>
                            </#group>
                        </#group>
                    </#group>
                </div>
            </#group>`)).toBe("equal");

        view.refresh({v: 30});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-v=30>
                <div 1 ref="XX:0:1" class="blah">
                    <#group 2 foo ref="XX:0:2" att-c=Object att-value=39>
                        <#group 1 js ref="YY:0:0">
                            <#text 2 " Value: "/>
                            <#group 3 insert ref="YY:0:1">
                                <#text -1 ref="YY:0:2" "39"/>
                            </#group>
                        </#group>
                    </#group>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_GROUP: XX:0:2
            UPDATE_TEXT: YY:0:2`
        )).toBe("equal");

        view.refresh({v: 33});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-v=33>
                <div 1 ref="XX:0:1" class="blah">
                    <#group 2 foo ref="XX:0:2" att-c=Object att-value=42/>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_GROUP: XX:0:2
            DELETE_GROUP: YY:0:0`
        )).toBe("equal");

        view.refresh({v: 17});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 function ref="XX:0:0" att-v=17>
                <div 1 ref="XX:0:1" class="blah">
                    <#group 2 foo ref="XX:0:2" att-c=Object att-value=26>
                        <#group 1 js ref="YY:0:3">
                            <#text 2 " Value: "/>
                            <#group 3 insert ref="YY:0:4">
                                <#text -1 ref="YY:0:5" "26"/>
                            </#group>
                        </#group>
                    </#group>
                </div>
            </#group>`
        )).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_GROUP: XX:0:2
            CREATE_GROUP: YY:0:3 in XX:0:2`
        )).toBe("equal");
    });

    // todo error if IvController, no default values

    // todo functions in functions
    // todo $v test
    // todo subtemplate in for loop
    // todo subtemplate with if at root level
    // todo function with content list  content:IvNode[]
    // todo dynamic content in function
    // todo support @name content
    // todo component call in another component's content
    // todo check support of import
    // todo support value+' '+msg as attribute value
    // todo raise error if id or @name are bound

});

