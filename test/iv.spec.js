/**
 * IV tests
 * Copyright Bertrand Laporte 2016
 * Created on 30/04/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {iv} from '../src/iv/iv';
import {compare, diff} from './utils';

describe('IV runtime', () => {
    var OPTIONS = {indent: "            "}, OPTIONS2 = {indent: OPTIONS.indent, showRef: true};

    it('should generate simple nodes', () => {
        var pkg = iv `
            <template #test nbr>
                <div class="hello">
                    // some comment
                    <span class="one" title="blah" foo=nbr+4> Hello </span>
                    <span class="two" [baz]=nbr+3 [bar]=nbr*2> World </span>
                </div>
            </template>
        `;
        pkg.test.uid = "XX";
        var view = pkg.test.apply({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 template>
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

        var vdom1 = view.vdom;
        view.refresh({nbr: 5});
        expect(view.vdom).toBe(vdom1);
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 template ref="XX:0:0">
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
        var pkg = iv `
            <template #test nbr msg>
                <div>
                    <span> {{nbr+10}} </span>
                    <span> A {{msg}} B </span>
                </div>
            </template>
        `;
        pkg.test.uid = "XX";
        var view = pkg.test.apply({nbr: 42, msg: "Hello!"}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS2), vdom1 = `\
            <#group 0 template ref="XX:0:0">
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
            <#group 0 template>
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
        var pkg = iv `
            <template #test nbr>
                <div>
                    ABC
                    % if (nbr===42) {
                        <span> Hello </span>
                        <span> World </span>
                    % }
                    <span> DEF </span>
                </div>
            </template>
        `;
        pkg.test.uid = "XX"; // for test only to get a reproducible id value

        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS2), vdom1 = `\
            <#group 0 template ref="XX:0:0">
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
            <#group 0 template ref="XX:0:0">
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
        expect(diff(view.vdom.toString(OPTIONS2), vdom1)).toBe("equal");
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:3`
        )).toBe("equal");

        // create again
        view.refresh({nbr: 42, msg: "Hello!"});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 template ref="XX:0:0">
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

        // test that template instance ref is increasing for view count (2nd part)
        var view2 = pkg.test.apply({nbr: 9});
        expect(diff(view2.vdom.toString({indent: OPTIONS.indent, showRef: true}), `\
            <#group 0 template ref="XX:1:0">
                <div 1 ref="XX:1:1">
                    <#text 2 " ABC "/>
                    <span 8 ref="XX:1:2">
                        <#text 9 " DEF "/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");
    });

    it('should support if blocks at template start', () => {
        var pkg = iv `
            <template #test nbr>
                % if (nbr===42) {
                    <span> Hello World </span>
                % }
                <div>
                    ABC
                    <span> DEF </span>
                </div>
            </template>
        `;
        pkg.test.uid = "XX";
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS), vdom1 = `\
            <#group 0 template>
                <div 4>
                    <#text 5 " ABC "/>
                    <span 6>
                        <#text 7 " DEF "/>
                    </span>
                </div>
            </#group>`
        )).toBe("equal");

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 template ref="XX:0:0">
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
        expect(compare(view.vdom, vdom1)).toEqual('');
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:3`
        )).toBe("equal");
    });

    it('should support if blocks at template end', () => {
        var pkg = iv `
            <template #test nbr>
                <div>
                    ABC
                    <span> DEF </span>
                </div>
                % if (nbr===42) {
                    <span> Hello World </span>
                % }
            </template>
        `;
        pkg.test.uid = "XX";
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS), vdom1 = `\
            <#group 0 template>
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
            <#group 0 template ref="XX:0:0">
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
        view.refresh({nbr: 9});
        expect(diff(view.vdom.toString(OPTIONS), vdom1)).toBe('equal');
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:3`
        )).toBe("equal");
    });

    it('should support if blocks as full template', () => {
        var pkg = iv `
            <template #test nbr>
                % if (nbr===42) {
                    <span> Hello </span>
                    <span> World </span>
                % }
            </template>
        `;
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS), vdom1 = `\
            <#group 0 template/>`
        )).toBe("equal");

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 template>
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
        view.refresh({nbr: 9});
        expect(compare(view.vdom, vdom1)).toEqual('');
    });

    it('should support if blocks as full node content', () => {
        var pkg = iv `
            <template #test nbr>
                foo
                <div>
                % if (nbr===42) {
                    <span> Hello </span>
                    <span> World </span>
                % }
                </div>
                bar
            </template>
        `;
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS), vdom1 = `\
            <#group 0 template>
                <#text 1 " foo "/>
                <div 2/>
                <#text 8 " bar "/>
            </#group>`
        )).toBe("equal");

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 template>
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
        view.refresh({nbr: 9});
        expect(compare(view.vdom, vdom1)).toEqual('');
    });


    it('should support if blocks at node start', () => {
        var pkg = iv `
            <template #test nbr>
                <div>
                    % if (nbr===42) {
                        <span> Hello World </span>
                    % }
                    <div>
                        ABC
                        <span> DEF </span>
                    </div>
                </div>
            </template>
        `;
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS), vdom1 = `\
            <#group 0 template>
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
            <#group 0 template>
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
        view.refresh({nbr: 9});
        expect(compare(view.vdom, vdom1)).toEqual('');
    });

    it('should support if+else blocks', () => {
        var pkg = iv `
            <template #test nbr>
                <div>
                    foo
                    % if (nbr===42) {
                        <span> Case 42 </span>
                    % } else {
                        <span> Case != 42 </span>
                    % }
                    bar
                </div>
            </template>
        `;
        pkg.test.uid = "XX";
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS2), vdom1 = `\
            <#group 0 template ref="XX:0:0">
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
            <#group 0 template ref="XX:0:0">
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
        expect(compare(view.vdom, vdom1)).toEqual('');
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:4
            CREATE_GROUP: XX:0:6 in XX:0:1`
        )).toBe("equal"); // note: could be improved through object pooling
    });

    it('should support if+else blocks for full template', () => {
        var pkg = iv `
            <template #test nbr>
                % if (nbr===42) {
                    <span> Case 42 </span>
                % } else {
                    <span> Case != 42 </span>
                % }
            </template>
        `;
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS), vdom1 = `\
            <#group 0 template>
                <#group 4 js>
                    <span 5>
                        <#text 6 " Case != 42 "/>
                    </span>
                </#group>
            </#group>`
        )).toBe("equal");

        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(OPTIONS), `\
            <#group 0 template>
                <#group 1 js>
                    <span 2>
                        <#text 3 " Case 42 "/>
                    </span>
                </#group>
            </#group>`
        )).toBe("equal");

        view.refresh({nbr: 9});
        expect(compare(view.vdom, vdom1)).toEqual('');
    });

    it('should support for loops', () => {
        var pkg = iv `
            <template #test list=[]>
                <div>
                    // % debugger
                    <div title="first"/>
                    % for (var i=0;list.length>i;i++) {
                        <div [title]=("Hello " + list[i].name)/>
                    % }
                    <div title="last"/>
                </div>
            </template>
        `;
        pkg.test.uid = "XX";
        var view = pkg.test.apply(), vdom1;
        expect(diff(view.vdom.toString(OPTIONS2), vdom1 = `\
            <#group 0 template ref="XX:0:0">
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
            <#group 0 template ref="XX:0:0">
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
            <#group 0 template ref="XX:0:0">
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
        expect(compare(view.vdom, vdom1)).toEqual('');
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            DELETE_GROUP: XX:0:2
            DELETE_GROUP: XX:0:4
            DELETE_GROUP: XX:0:6`
        )).toBe("equal");
    });

    it('should support for loops with if statements', () => {
        var pkg = iv `
            <template #test list=[] condition=false>
                <div>
                    <div title="first"/>
                    % for (var i=0;list.length>i;i++) {
                        <div [title]=("item " + i + ": " + list[i])/>
                        % if (condition) {
                        <div> OK </div>
                        % }
                    % }
                    <div title="last"/>
                </div>
            </template>
        `;
        pkg.test.uid = "XX";
        var view = pkg.test.apply({list: ["Omer", "Marge"], condition: true}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS2), vdom1 = `\
            <#group 0 template ref="XX:0:0">
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
            <#group 0 template>
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
        expect(compare(view.vdom, vdom1)).toEqual('');
    });

    it('should support sub-templates', () => {
        var pkg = iv`
            <template #foo v:number=123>
                <div>
                    <span>first</span>
                    <bar [value]=v+1 msg=("m1:"+v)/>
                    <bar [value]=v+3 msg=("m2:"+v)/>
                    <span>last</span>
                </div>
            </template>
            
            <template #bar value msg="">
                <span [title]=(value+' '+msg)/>
                % if (value === 45) {
                    <span> Hello 45! </span>
                % }
            </template>
        `;

        pkg.foo.uid = "XX";
        pkg.bar.uid = "YY";
        var view = pkg.foo.apply({v: 9}), vdom1;
        expect(diff(view.vdom.toString(OPTIONS2), vdom1 = `\
            <#group 0 template ref="XX:0:0">
                <div 1 ref="XX:0:1">
                    <span 2 ref="XX:0:2">
                        <#text 3 "first"/>
                    </span>
                    <#group 4 bar ref="XX:0:3" data-msg="m1:9" data-value=10>
                        <span 1 ref="YY:0:0" title="10 m1:9"/>
                    </#group>
                    <#group 5 bar ref="XX:0:4" data-msg="m2:9" data-value=12>
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
            <#group 0 template ref="XX:0:0">
                <div 1 ref="XX:0:1">
                    <span 2 ref="XX:0:2">
                        <#text 3 "first"/>
                    </span>
                    <#group 4 bar ref="XX:0:3" data-msg="m1:9" data-value=43>
                        <span 1 ref="YY:0:0" title="43 m1:9"/>
                    </#group>
                    <#group 5 bar ref="XX:0:4" data-msg="m2:9" data-value=45>
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
        expect(compare(view.vdom, vdom1)).toEqual('');
        expect(diff(view.refreshLog.toString(OPTIONS), `\
            UPDATE_GROUP: XX:0:3
            UPDATE_ELEMENT: YY:0:0
            UPDATE_GROUP: XX:0:4
            UPDATE_ELEMENT: YY:1:0
            DELETE_GROUP: YY:1:1`
        )).toBe("equal");
    });

    it('should support sub-templates with content', () => {
        var pkg = iv`
            <template #foo v:number=1 msg="hello">
                <div>
                    AAA
                    <bar [value]=v>
                        <span>content {{v+100}}</span>
                    </bar>
                    BBB
                </div>
            </template>
    
            <template #bar value=1 content:IvNode="">
                <span [title]=value> first </span>
                % if (value !== 42) {
                    <span>Z {{content}} Z</span>
                % }
                <span> last </span>
            </template>
        `;

        pkg.foo.uid = "XX";
        pkg.bar.uid = "YY";
        var view = pkg.foo.apply({v: 9});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 template ref="XX:0:0">
                <div 1 ref="XX:0:1">
                    <#text 2 " AAA "/>
                    <#group 3 bar ref="XX:0:2" data-content=IvNode data-value=9>
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
            <#group 0 template ref="XX:0:0">
                <div 1 ref="XX:0:1">
                    <#text 2 " AAA "/>
                    <#group 3 bar ref="XX:0:2" data-content=IvNode data-value=42>
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
            <#group 0 template ref="XX:0:0">
                <div 1 ref="XX:0:1">
                    <#text 2 " AAA "/>
                    <#group 3 bar ref="XX:0:2" data-content=IvNode data-value=9>
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
            <#group 0 template ref="XX:0:0">
                <div 1 ref="XX:0:1">
                    <#text 2 " AAA "/>
                    <#group 3 bar ref="XX:0:2" data-content=IvNode data-value=31>
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

    it('should support sub-templates with multiple content', () => {
        var pkg = iv`
            <template #test testCase=1>
                Case #{{testCase}}
                % if (testCase === 1) {
                    <panel>
                        <div @title> Hello <img src="smile.png"/></div>
                        <div @body> 
                            <p>Some content</p>
                        </div>
                    </panel>
                % }
            </template>
    
            <template #panel title:IvObject="" body:IvNode="">
                % if (body) {
                    <div class="panel">
                        % if (title) {
                            <div class="title">{{title.content}}</div>
                        % }
                        <div class="body">{{body}}</div>
                    </div>
                % }
            </template>
        `;

        pkg.test.uid = "XX";
        pkg.panel.uid = "YY";
        var view = pkg.test.apply({testCase: 1});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 template ref="XX:0:0">
                <#text 1 " Case #"/>
                <#group 2 insert ref="XX:0:1">
                    <#text -1 ref="XX:0:2" "1"/>
                </#group>
                <#group 3 js ref="XX:0:3">
                    <#group 4 panel ref="XX:0:4" data-body=IvNode data-content=IvNode data-title=Object>
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
                                        <p 9 ref="XX:0:7">
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

    it('should support sub-templates with for loops', () => {
        var pkg = iv`
            <template #test list>
               <div #main>
                  % for (var i=0;list.length>i;i++) {
                      <sub [data]=list[i]/>
                  % }
               </div>
            </template>
    
            <template #sub data>
                <div [title]=data.title>{{data.content}}</div>
            </template>
        `;

        pkg.test.uid = "XX";
        pkg.sub.uid = "YY";
        var list = [
            {title: "ta0", content: "ca0"},
            {title: "tb0", content: "cb0"}
        ];

        var view = pkg.test.apply({list: list});
        expect(diff(view.vdom.toString(OPTIONS2), `\
            <#group 0 template ref="XX:0:0">
                <div 1 ref="XX:0:1" id="main">
                    <#group 2 js ref="XX:0:2">
                        <#group 3 sub ref="XX:0:3" data-data=Object>
                            <div 1 ref="YY:0:0" title="ta0">
                                <#group 2 insert ref="YY:0:1">
                                    <#text -1 ref="YY:0:2" "ca0"/>
                                </#group>
                            </div>
                        </#group>
                    </#group>
                    <#group 2 js ref="XX:0:4">
                        <#group 3 sub ref="XX:0:5" data-data=Object>
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
            <#group 0 template ref="XX:0:0">
                <div 1 ref="XX:0:1" id="main">
                    <#group 2 js ref="XX:0:2">
                        <#group 3 sub ref="XX:0:3" data-data=Object>
                            <div 1 ref="YY:0:0" title="ta1">
                                <#group 2 insert ref="YY:0:1">
                                    <#text -1 ref="YY:0:2" "ca1"/>
                                </#group>
                            </div>
                        </#group>
                    </#group>
                    <#group 2 js ref="XX:0:4">
                        <#group 3 sub ref="XX:0:5" data-data=Object>
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


    // todo subtemplate in for loop
    // todo subtemplate with if at root level
    // todo template with content list  content:IvNode[]
    // todo dynamic content in template
    // todo support @name content
    // todo component call in another component's content
    // todo check support of import
    // todo support value+' '+msg as attribute value
    // todo raise error if id or @name are bound

});

