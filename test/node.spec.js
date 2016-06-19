/**
 * Created by b-laporte on 19/06/16.
 */

/* global describe, it, beforeEach, afterEach, expect, console */

import {IvTextNode, IvEltNode, IvGroupNode} from '../src/iv/node';
import {diff} from './utils';

describe('IvNode', () => {

    it('should stringify node content', function () {
        var gn = new IvGroupNode(0, null, "template");
        gn.children.push(new IvTextNode(2, "some text"));

        var div = new IvEltNode(3, "div");
        gn.children.push(div);
        div.children.push(new IvTextNode(4, " div content "));

        gn.children.push(new IvGroupNode(5, gn, "js"));

        div = new IvEltNode(6, "div");
        gn.children.push(div);
        div.attributes["foo"] = "hello";
        div.attributes["b.bar"] = 123;
        div.children.push(new IvTextNode(7, " div content 2 "));

        expect(diff(gn.toString("            "), `\
            <#group 0 template>
                <#text 2 "some text"/>
                <div 3>
                    <#text 4 " div content "/>
                </div>
                <#group 5 js/>
                <div 6 foo="hello" b.bar=123>
                    <#text 7 " div content 2 "/>
                </div>
            </#group>`)).toEqual(null);
        
    });
});
