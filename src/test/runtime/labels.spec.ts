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
                    <span #elt/>
                }
                <div #elt/>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh();
        assert.equal(t.query("#foo"), null, "no foo element");
        assert.equal(t.query("#main") !== null, true, "#main is found");
        assert.equal(t.query("#main").uid, "E3", "#main");
        assert.equal(t.query("#child").uid, "E5", "#child found");

        let col = t.query("#elt", true)!;
        assert.equal(col.length, 2, "2 elts");
        assert.equal(col[0].uid, "E7", "col[0]");
        assert.equal(col[1].uid, "E8", "col[1]");

        t.refresh({ condition: false });
        assert.equal(t.query("#main").uid, "E3", "#main found (2)");
        assert.equal(t.query("#child"), null, "#child not found");

        col = t.query("#elt", true) as any[];
        assert.equal(col.length, 1, "1 elt");
        assert.equal(col[0].uid, "E8", "col[0] (2)");

        t.refresh({ condition: true });
        assert.equal(t.query("#main").uid, "E3", "#main (3)");
        assert.equal(t.query("#child").uid, "E5", "#child (3)");

        col = t.query("#elt", true) as any[];
        assert.equal(col.length, 2, "2 elts (3)");
        assert.equal(col[0].uid, "E7", "col[0] (3)");
        assert.equal(col[1].uid, "E8", "col[1] (3)");
    });

    it("should be supported on text nodes", async function () {
        const tpl = template(`(condition=true) => {
            <div #main>
                # (#txt #txt1) Hello #
                if (condition) {
                    <div #child> # (#txt #txt2) World {42} # </div>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh();

        assert.equal(t.query("#txt1").innerText, " Hello ", "#txt1");
        assert.equal(t.query("#txt2").innerText, " World 42 ", "#txt2");

        let col = t.query("#txt", true)!;
        assert.equal(col.length, 2, "2 items");
        assert.equal(col[0].innerText, " Hello ", "col[0]");
        assert.equal(col[1].innerText, " World 42 ", "col[1]");

        t.refresh({ condition: false });
        assert.equal(t.query("#txt1").innerText, " Hello ", "#txt1 (2)");
        assert.equal(t.query("#txt2"), null, "#txt2 (2)");

        col = t.query("#txt", true)!;
        assert.equal(col.length, 1, "col.length is 1");
        assert.equal(col[0].innerText, " Hello ", "col[0] (2)");

        t.refresh({ condition: true });
        assert.equal(t.query("#txt1").innerText, " Hello ", "#txt1 (3)");
        assert.equal(t.query("#txt2").innerText, " World 42 ", "#txt2 (3)");
        col = t.query("#txt", true) as any[];
        assert.equal(col.length, 2, "2 items (3)");
        assert.equal(col[0].innerText, " Hello ", "col[0] (3)");
        assert.equal(col[1].innerText, " World 42 ", "col[1] (3)");
    });

    // it.only("should be supported on components with no $api", async function () {
    //     const cpt = template(`(text:string = "") => {
    //         # cpt {text} #
    //     }`);

    //     const tpl = template(`(condition=true) => {
    //         <div>
    //             <*cpt #comp1 #comp text="AAA"/>
    //             if (condition) {
    //                 <*cpt #comp2 #comp text="BBB"/>
    //             }
    //         </div>
    //     }`);

    //     let t = getTemplate(tpl, body).refresh();
    //     assert.equal(stringify(t), `
    //         <body::E1>
    //             <div::E3>
    //                 #::T4 cpt AAA #
    //                 #::T5 cpt BBB #
    //             </div>
    //             //::C2 template anchor
    //         </body>
    //     `, '1');

    //     assert.equal(t.query("#comp1").text, "AAA" , "comp1.text=AAA");
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
