import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';

describe('Labels', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    it("should be supported on elements", async function () {
        const tpl = template(`(condition=true) => {
            <div #main>
                # Hello #
                if (condition) {
                    <div #child> # World # </div>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh();

        assert.equal(t.query("#foo"), null, "no foo element");
        assert.equal(t.query("#main") !== null, true, "#main is found");
        assert.equal(t.query("#main").uid, "E3", "#main");
        assert.equal(t.query("#child").uid, "E5", "#child found");

        t.refresh({ condition: false });
        assert.equal(t.query("#main").uid, "E3", "#main found (2)");
        assert.equal(t.query("#child"), null, "#child not found");
    });

    // it("should be supported multiple times, including on collections", async function () {
    //     const tpl = template(`(condition=true) => {
    //         <div #main #divCol[] #root>
    //             # Hello #
    //             if (condition) {
    //                 <div #divCol #child> # World # </div>
    //             }
    //         </div>
    //     }`);

    //     let t = getTemplate(tpl, body).refresh();
    //     assert.equal(t.query("#main").uid, "E3", "#main");
    //     assert.equal(t.query("#root").uid, "E3", "#root");
    //     assert.equal(t.query("#child").uid, "E5", "#child found");

    //     let col = t.queryAll();

    //     t.refresh({ condition: false });
    //     assert.equal(t.query("#main").uid, "E3", "#main found (2)");
    //     assert.equal(t.query("#child"), null, "#child not found");
    // });

    interface IvQuery<T extends Array<string>> {
        (selector: string, firstOnly: boolean): any | null;
    }
    class Foo {
        $query: IvQuery<["#white", "#list"]>;
    }

    // label forwarding?
    // <*sub-cpt #foo/> -> means that a query on #foo should look in the sub-cpt template
    // <*sub-cpt ##foo="#bar"/> -> means that a query on #foo should look in the sub-cpt template and transform the query as query("#bar")
    // labels access-rights: public labels defined in the $api
    // query: IvQuery<["#white", "#list"]>;

    // assigning class to sub-elements
    // <*input @class($target="#foo" blue:{isBlue()} white:{isWhite()}) // default value for $target should be "#root"


    // query / queryAll
    //           -> dig in sub-templates that provide an explicit api? 
    //           -> $api should provide explicit valid labels?
    // $template injection
    // multiple labels
    // collections
    // parent template can query sub-template explicitly ->
    // no call during execution
    // labels on text elements
    // labels on components

});
