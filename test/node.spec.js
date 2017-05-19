/**
 * Created by b-laporte on 19/06/16.
 */

/* global describe, it, beforeEach, afterEach, expect, console */

import {IvTextNode, IvEltNode, IvGroupNode} from '../src/iv/node';
import {diff} from './utils';

describe('IvNode', () => {

    it('should stringify node content', function () {
        var gn = new IvGroupNode(0, "template"),
            ch = new IvTextNode(2, "some text");
        gn.firstChild = ch;

        var div = new IvEltNode(3, "div");
        ch = ch.nextSibling = div;
        div.firstChild = new IvTextNode(4, " div content ");

        ch = ch.nextSibling = new IvGroupNode(5, "js");

        div = new IvEltNode(6, "div");
        ch.nextSibling = div;
        div.attributes["foo"] = "hello";
        div.attributes["b.bar"] = 123;
        div.firstChild = new IvTextNode(7, " div content 2 ");

        expect(diff(gn.toString({indent:"            "}), `\
            <#group 0 template>
                <#text 2 "some text"/>
                <div 3>
                    <#text 4 " div content "/>
                </div>
                <#group 5 js/>
                <div 6 b.bar=123 foo="hello">
                    <#text 7 " div content 2 "/>
                </div>
            </#group>`)).toBe("equal");

    });
});
