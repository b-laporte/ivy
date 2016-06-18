/**
 * IV tests
 * Copyright Bertrand Laporte 2016
 * Created on 30/04/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {n, NacNodeType} from '../src/iv/nac';
import {iv} from '../src/iv/iv';
import {compare, diff} from './utils';

describe('IV runtime', () => {

    it('should generate simple nodes', () => {
        var pkg = iv `
            <template #hello nbr>
                <div class="hello">
                    // some comment
                    <span class="one" title="blah" foo=nbr+4> Hello </span>
                    <span class="two" [baz]=nbr+3 [bar]=nbr*2> World </span>
                </div>
            </template>
        `;
        var view = pkg.hello.apply({nbr: 42});
        expect(compare(view.vdom,
            n("#group").c(
                n("div").a({"class": "hello"}).c(
                    n("span").a({"class": "one", "title": "blah", "foo": 46}).c(n("#text", " Hello ")),
                    n("span").a({"baz": 45, "bar": 84, "class": "two"}).c(n("#text", " World ")),
                )
            )
        )).toEqual('');

        var vdom1 = view.vdom;
        expect(view.vdom.nodeType).toBe(NacNodeType.ELEMENT);
        view.refresh({nbr: 5});
        expect(view.vdom).toBe(vdom1);
        expect(compare(view.vdom,
            n("#group").c(
                n("div").a({"class": "hello"}).c(
                    n("span").a({"class": "one", "title": "blah", "foo": 46}).c(n("#text", " Hello ")),
                    n("span").a({"baz": 8, "bar": 10, "class": "two"}).c(n("#text", " World ")),
                )
            )
        )).toEqual('');


        // nd.data.index
        // nd.data.uid
        // nd.data.view
        // nd.data.instructions

    });

    it('should support text inserts', () => {
        var pkg = iv `
            <template #hello nbr msg>
                <div>
                    <span> {{nbr+10}} </span>
                    <span> A {{msg}} B </span>
                </div>
            </template>
        `;
        var view = pkg.hello.apply({nbr: 42, msg: "Hello!"}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("span").c(
                        n("#group").c(n("#text", "52"))
                    ),
                    n("span").c(
                        n("#text", " A "),
                        n("#group").c(n("#text", "Hello!")),
                        n("#text", " B ")
                    )
                )
            )
        )).toEqual('');

        view.refresh({nbr: 9});
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("span").c(
                        n("#group").c(n("#text", "19"))
                    ),
                    n("span").c(
                        n("#text", " A "),
                        n("#group").c(n("#text", "")),
                        n("#text", " B ")
                    )
                )
            )
        )).toEqual('');

        view.refresh({nbr: 42, msg: "Hello!"});
        expect(compare(view.vdom, vdom1)).toEqual('');
    });

    it('should support if blocks', () => {
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
        var view = pkg.test.apply({nbr: 3}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("#text", " ABC "),
                    n("span").c(n("#text", " DEF "))
                )
            )
        )).toEqual('');

        // create new nodes
        view.refresh({nbr: 42});
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("#text", " ABC "),
                    n("#group").c(
                        n("span").c(n("#text", " Hello ")),
                        n("span").c(n("#text", " World "))
                    ),
                    n("span").c(n("#text", " DEF "))
                )
            )
        )).toEqual('');

        // remove nodes
        view.refresh({nbr: 9});
        expect(compare(view.vdom, vdom1)).toEqual('');
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
        var view = pkg.test.apply({nbr: 3}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("#text", " ABC "),
                    n("span").c(n("#text", " DEF "))
                )
            )
        )).toEqual('');

        // create new nodes
        view.refresh({nbr: 42});
        expect(compare(view.vdom,
            n("#group").c(
                n("#group").c(
                    n("span").c(n("#text", " Hello World "))
                ),
                n("div").c(
                    n("#text", " ABC "),
                    n("span").c(n("#text", " DEF "))
                )
            )
        )).toEqual('');

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
        var view = pkg.test.apply({nbr: 3}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("#text", " ABC "),
                    n("span").c(n("#text", " DEF "))
                )
            )
        )).toEqual('');

        // create new nodes
        view.refresh({nbr: 42});
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("#text", " ABC "),
                    n("span").c(n("#text", " DEF "))
                ),
                n("#group").c(
                    n("span").c(n("#text", " Hello World "))
                )
            )
        )).toEqual('');

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
        var view = pkg.test.apply({nbr: 3}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group")
        )).toEqual('');

        // create new nodes
        view.refresh({nbr: 42});
        expect(compare(view.vdom,
            n("#group").c(
                n("#group").c(
                    n("span").c(n("#text", " Hello ")),
                    n("span").c(n("#text", " World "))
                )
            )
        )).toEqual('');

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
        var view = pkg.test.apply({nbr: 3}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("#text", " foo "),
                n("div"),
                n("#text", " bar ")
            )
        )).toEqual('');

        // create new nodes
        view.refresh({nbr: 42});
        expect(compare(view.vdom,
            n("#group").c(
                n("#text", " foo "),
                n("div").c(
                    n("#group").c(
                        n("span").c(n("#text", " Hello ")),
                        n("span").c(n("#text", " World "))
                    )
                ),
                n("#text", " bar ")
            )
        )).toEqual('');


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
        var view = pkg.test.apply({nbr: 3}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("div").c(
                        n("#text", " ABC "),
                        n("span").c(n("#text", " DEF "))
                    )
                )
            )
        )).toEqual('');

        // create new nodes
        view.refresh({nbr: 42});
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("#group").c(
                        n("span").c(n("#text", " Hello World "))
                    ),
                    n("div").c(
                        n("#text", " ABC "),
                        n("span").c(n("#text", " DEF "))
                    )
                )
            )
        )).toEqual('');

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
        var view = pkg.test.apply({nbr: 3}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("#text", " foo "),
                    n("#group").c(
                        n("span").c(n("#text", " Case != 42 "))
                    ),
                    n("#text", " bar ")
                )
            )
        )).toEqual('');

        view.refresh({nbr: 42});
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("#text", " foo "),
                    n("#group").c(
                        n("span").c(n("#text", " Case 42 "))
                    ),
                    n("#text", " bar ")
                )
            )
        )).toEqual('');

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
        var view = pkg.test.apply({nbr: 3}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("#group").c(
                    n("span").c(n("#text", " Case != 42 "))
                )
            )
        )).toEqual('');

        view.refresh({nbr: 42});
        expect(compare(view.vdom,
            n("#group").c(
                n("#group").c(
                    n("span").c(n("#text", " Case 42 "))
                )
            )
        )).toEqual('');

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
        var view = pkg.test.apply(), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("div").a({"title": "first"}),
                    n("div").a({"title": "last"})
                )
            )
        )).toEqual('');

        view.refresh({
            list: [
                {name: "Arthur"},
                {name: "Douglas"}
            ]
        });
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("div").a({"title": "first"}),
                    n("#group").c(
                        n("div").a({"title": "Hello Arthur"})
                    ),
                    n("#group").c(
                        n("div").a({"title": "Hello Douglas"})
                    ),
                    n("div").a({"title": "last"})
                )
            )
        )).toEqual('');

        view.refresh({
            list: [
                {name: "Arthur"},
                {name: "Slartibartfast"},
                {name: "Douglas"}
            ]
        });
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("div").a({"title": "first"}),
                    n("#group").c(
                        n("div").a({"title": "Hello Arthur"})
                    ),
                    n("#group").c(
                        n("div").a({"title": "Hello Slartibartfast"})
                    ),
                    n("#group").c(
                        n("div").a({"title": "Hello Douglas"})
                    ),
                    n("div").a({"title": "last"})
                )
            )
        )).toEqual('');

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
        var view = pkg.test.apply({list: ["Omer", "Marge"], condition: true}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("div").a({"title": "first"}),
                    n("#group").c(
                        n("div").a({"title": "item 0: Omer"}),
                        n("#group").c(
                            n("div").c(n("#text", " OK "))
                        )
                    ),
                    n("#group").c(
                        n("div").a({"title": "item 1: Marge"}),
                        n("#group").c(
                            n("div").c(n("#text", " OK "))
                        )
                    ),
                    n("div").a({"title": "last"})
                )
            )
        )).toEqual('');

        view.refresh({list: ["Omer", "Marge"], condition: false});
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("div").a({"title": "first"}),
                    n("#group").c(
                        n("div").a({"title": "item 0: Omer"})
                    ),
                    n("#group").c(
                        n("div").a({"title": "item 1: Marge"})
                    ),
                    n("div").a({"title": "last"})
                )
            )
        )).toEqual('');

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

        var view = pkg.foo.apply({v: 9}), vdom1 = view.vdom;
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("span").c(n("#text", "first")),
                    n("#group").a({"value": 10, "msg": "m1:9"}).c(
                        n("span").a({"title": "10 m1:9"}),
                    ),
                    n("#group").a({"value": 12, "msg": "m2:9"}).c(
                        n("span").a({"title": "12 m2:9"}),
                    ),
                    n("span").c(n("#text", "last"))
                )
            )
        )).toEqual('');

        view.refresh({v: 42});
        expect(compare(view.vdom,
            n("#group").c(
                n("div").c(
                    n("span").c(n("#text", "first")),
                    n("#group").a({"value": 43, "msg": "m1:9"}).c(
                        n("span").a({"title": "43 m1:9"}),
                    ),
                    n("#group").a({"value": 45, "msg": "m2:9"}).c(
                        n("span").a({"title": "45 m2:9"}),
                        n("#group").c(
                            n("span").c(n("#text", " Hello 45! "))
                        )
                    ),
                    n("span").c(n("#text", "last"))
                )
            )
        )).toEqual('');

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
        expect(diff(view.vdom.toString("            ", true), `\
            <#group 0 template>
                <div 1>
                    <#text 2 " AAA "/>
                    <#group 3 bar value=9>
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
        expect(diff(view.vdom.toString("            ", true), `\
            <#group 0 template>
                <div 1>
                    <#text 2 " AAA "/>
                    <#group 3 bar value=42>
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
        expect(diff(view.vdom.toString("            ", true), `\
            <#group 0 template>
                <#text 1 " Case #"/>
                <#group 2 insert>
                    <#text -1 "1"/>
                </#group>
                <#group 3 js>
                    <#group 4 panel>
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

