/**
 * IV tests
 * Copyright Bertrand Laporte 2016
 * Created on 30/04/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {iv} from '../src/iv/iv';
import {compare, diff} from './utils';

describe('IV runtime', () => {
    var INDENT="            ";

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
        var view = pkg.test.apply({nbr: 42});
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <div 1 class="hello">
                    <span 2 class="one" foo=46 title="blah">
                        <#text 3 " Hello "/>
                    </span>
                    <span 4 bar=84 baz=45 class="two">
                        <#text 5 " World "/>
                    </span>
                </div>
            </#group>`)).toEqual(null);

        var vdom1 = view.vdom;
        expect(view.vdom.isGroupNode).toBe(true);
        view.refresh({nbr: 5});
        expect(view.vdom).toBe(vdom1);
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <div 1 class="hello">
                    <span 2 class="one" foo=46 title="blah">
                        <#text 3 " Hello "/>
                    </span>
                    <span 4 bar=10 baz=8 class="two">
                        <#text 5 " World "/>
                    </span>
                </div>
            </#group>`)).toEqual(null);
        // todo instructions

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
        var view = pkg.test.apply({nbr: 42, msg: "Hello!"}), vdom1;
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <div 1>
                    <span 2>
                        <#group 3 insert>
                            <#text -1 "52"/>
                        </#group>
                    </span>
                    <span 4>
                        <#text 5 " A "/>
                        <#group 6 insert>
                            <#text -1 "Hello!"/>
                        </#group>
                        <#text 7 " B "/>
                    </span>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({nbr: 9});
        expect(diff(view.vdom.toString(INDENT), `\
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
            </#group>`)).toEqual(null);

        view.refresh({nbr: 42, msg: "Hello!"});
        expect(diff(view.vdom.toString(INDENT), vdom1)).toEqual(null);
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
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <div 1>
                    <#text 2 " ABC "/>
                    <span 8>
                        <#text 9 " DEF "/>
                    </span>
                </div>
            </#group>`)).toEqual(null);

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <div 1>
                    <#text 2 " ABC "/>
                    <#group 3 js>
                        <span 4>
                            <#text 5 " Hello "/>
                        </span>
                        <span 6>
                            <#text 7 " World "/>
                        </span>
                    </#group>
                    <span 8>
                        <#text 9 " DEF "/>
                    </span>
                </div>
            </#group>`)).toEqual(null);

        // remove nodes
        view.refresh({nbr: 3, msg: "Hello!"});
        expect(diff(view.vdom.toString(INDENT), vdom1)).toEqual(null);
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
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <div 4>
                    <#text 5 " ABC "/>
                    <span 6>
                        <#text 7 " DEF "/>
                    </span>
                </div>
            </#group>`)).toEqual(null);

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <#group 1 js>
                    <span 2>
                        <#text 3 " Hello World "/>
                    </span>
                </#group>
                <div 4>
                    <#text 5 " ABC "/>
                    <span 6>
                        <#text 7 " DEF "/>
                    </span>
                </div>
            </#group>`)).toEqual(null);

        // remove nodes
        view.refresh({nbr: 9});
        expect(compare(view.vdom, vdom1)).toEqual('');
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
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <div 1>
                    <#text 2 " ABC "/>
                    <span 3>
                        <#text 4 " DEF "/>
                    </span>
                </div>
            </#group>`)).toEqual(null);

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <div 1>
                    <#text 2 " ABC "/>
                    <span 3>
                        <#text 4 " DEF "/>
                    </span>
                </div>
                <#group 5 js>
                    <span 6>
                        <#text 7 " Hello World "/>
                    </span>
                </#group>
            </#group>`)).toEqual(null);

        // remove nodes
        view.refresh({nbr: 9});
        expect(compare(view.vdom, vdom1)).toEqual('');
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
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template/>`)).toEqual(null);

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <#group 1 js>
                    <span 2>
                        <#text 3 " Hello "/>
                    </span>
                    <span 4>
                        <#text 5 " World "/>
                    </span>
                </#group>
            </#group>`)).toEqual(null);

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
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <#text 1 " foo "/>
                <div 2/>
                <#text 8 " bar "/>
            </#group>`)).toEqual(null);

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(INDENT), `\
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
            </#group>`)).toEqual(null);

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
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <div 1>
                    <div 5>
                        <#text 6 " ABC "/>
                        <span 7>
                            <#text 8 " DEF "/>
                        </span>
                    </div>
                </div>
            </#group>`)).toEqual(null);

        // create new nodes
        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(INDENT), `\
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
            </#group>`)).toEqual(null);

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
        var view = pkg.test.apply({nbr: 3}), vdom1;
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <div 1>
                    <#text 2 " foo "/>
                    <#group 6 js>
                        <span 7>
                            <#text 8 " Case != 42 "/>
                        </span>
                    </#group>
                    <#text 9 " bar "/>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <div 1>
                    <#text 2 " foo "/>
                    <#group 3 js>
                        <span 4>
                            <#text 5 " Case 42 "/>
                        </span>
                    </#group>
                    <#text 9 " bar "/>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({nbr: 9});
        expect(compare(view.vdom, vdom1)).toEqual('');
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
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <#group 4 js>
                    <span 5>
                        <#text 6 " Case != 42 "/>
                    </span>
                </#group>
            </#group>`)).toEqual(null);

        view.refresh({nbr: 42});
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <#group 1 js>
                    <span 2>
                        <#text 3 " Case 42 "/>
                    </span>
                </#group>
            </#group>`)).toEqual(null);

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
        var view = pkg.test.apply(), vdom1;
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <div 1>
                    <div 2 title="first"/>
                    <div 5 title="last"/>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({
            list: [
                {name: "Arthur"},
                {name: "Douglas"}
            ]
        });
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <div 1>
                    <div 2 title="first"/>
                    <#group 3 js>
                        <div 4 title="Hello Arthur"/>
                    </#group>
                    <#group 3 js>
                        <div 4 title="Hello Douglas"/>
                    </#group>
                    <div 5 title="last"/>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({
            list: [
                {name: "Arthur"},
                {name: "Slartibartfast"},
                {name: "Douglas"}
            ]
        });
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <div 1>
                    <div 2 title="first"/>
                    <#group 3 js>
                        <div 4 title="Hello Arthur"/>
                    </#group>
                    <#group 3 js>
                        <div 4 title="Hello Slartibartfast"/>
                    </#group>
                    <#group 3 js>
                        <div 4 title="Hello Douglas"/>
                    </#group>
                    <div 5 title="last"/>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({list: []});
        expect(compare(view.vdom, vdom1)).toEqual('');
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
        var view = pkg.test.apply({list: ["Omer", "Marge"], condition: true}), vdom1;
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <div 1>
                    <div 2 title="first"/>
                    <#group 3 js>
                        <div 4 title="item 0: Omer"/>
                        <#group 5 js>
                            <div 6>
                                <#text 7 " OK "/>
                            </div>
                        </#group>
                    </#group>
                    <#group 3 js>
                        <div 4 title="item 1: Marge"/>
                        <#group 5 js>
                            <div 6>
                                <#text 7 " OK "/>
                            </div>
                        </#group>
                    </#group>
                    <div 8 title="last"/>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({list: ["Omer", "Marge"], condition: false});
        expect(diff(view.vdom.toString(INDENT), `\
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
            </#group>`)).toEqual(null);

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

        var view = pkg.foo.apply({v: 9}), vdom1;
        expect(diff(view.vdom.toString(INDENT), vdom1 = `\
            <#group 0 template>
                <div 1>
                    <span 2>
                        <#text 3 "first"/>
                    </span>
                    <#group 4 bar data-msg="m1:9" data-value=10>
                        <span 1 title="10 m1:9"/>
                    </#group>
                    <#group 5 bar data-msg="m2:9" data-value=12>
                        <span 1 title="12 m2:9"/>
                    </#group>
                    <span 6>
                        <#text 7 "last"/>
                    </span>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({v: 42});
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <div 1>
                    <span 2>
                        <#text 3 "first"/>
                    </span>
                    <#group 4 bar data-msg="m1:9" data-value=43>
                        <span 1 title="43 m1:9"/>
                    </#group>
                    <#group 5 bar data-msg="m2:9" data-value=45>
                        <span 1 title="45 m2:9"/>
                        <#group 2 js>
                            <span 3>
                                <#text 4 " Hello 45! "/>
                            </span>
                        </#group>
                    </#group>
                    <span 6>
                        <#text 7 "last"/>
                    </span>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({v: 9});
        expect(compare(view.vdom, vdom1)).toEqual('');
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

        var view = pkg.foo.apply({v: 9}), vdom1 = view.vdom;
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <div 1>
                    <#text 2 " AAA "/>
                    <#group 3 bar data-content=IvNode data-value=9>
                        <span 1 title=9>
                            <#text 2 " first "/>
                        </span>
                        <#group 3 js>
                            <span 4>
                                <#text 5 "Z "/>
                                <#group 6 insert>
                                    <span 4>
                                        <#text 5 "content "/>
                                        <#group 6 insert>
                                            <#text -1 "109"/>
                                        </#group>
                                    </span>
                                </#group>
                                <#text 7 " Z"/>
                            </span>
                        </#group>
                        <span 8>
                            <#text 9 " last "/>
                        </span>
                    </#group>
                    <#text 7 " BBB "/>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({v: 42});
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <div 1>
                    <#text 2 " AAA "/>
                    <#group 3 bar data-content=IvNode data-value=42>
                        <span 1 title=42>
                            <#text 2 " first "/>
                        </span>
                        <span 8>
                            <#text 9 " last "/>
                        </span>
                    </#group>
                    <#text 7 " BBB "/>
                </div>
            </#group>`)).toEqual(null);

        view.refresh({v: 9});
        expect(compare(view.vdom, vdom1)).toEqual('');
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

        var view = pkg.test.apply({testCase: 1});
        expect(diff(view.vdom.toString(INDENT), `\
            <#group 0 template>
                <#text 1 " Case #"/>
                <#group 2 insert>
                    <#text -1 "1"/>
                </#group>
                <#group 3 js>
                    <#group 4 panel data-body=IvNode data-content=IvNode data-title=Object>
                        <#group 1 js>
                            <div 2 class="panel">
                                <#group 3 js>
                                    <div 4 class="title">
                                        <#group 5 insert>
                                            <#text 6 " Hello "/>
                                            <img 7 src="smile.png"/>
                                        </#group>
                                    </div>
                                </#group>
                                <div 6 class="body">
                                    <#group 7 insert>
                                        <p 9>
                                            <#text 10 "Some content"/>
                                        </p>
                                    </#group>
                                </div>
                            </div>
                        </#group>
                    </#group>
                </#group>
            </#group>`)).toEqual(null);
    });

    // todo subtemplate with if at root level
    // todo template with content list  content:IvNode[]
    // todo dynamic content in template
    // todo support @name content
    // todo component call in another component's content
    // todo check support of import
    // todo support value+' '+msg as attribute value
    // todo raise error if id or @name are bound

});

