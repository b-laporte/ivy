/**
 * NAC JS compiler tests
 * Copyright Bertrand Laporte 2016
 * Created on 30/04/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {n, NacNodeType} from '../src/iv/nac';
import {iv} from '../src/iv/iv';
import {compare} from './utils';

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
                    // % debugger
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

    // todo check support of import
    // todo support #foo as element attribute (ref error)

});

