import * as assert from 'assert';
import { template, API, Controller } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';
import { changeComplete } from '../../trax/trax';
import { IvTemplate } from '../../iv/types';

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

        let t = getTemplate(tpl, body).render();
        assert.equal(t.query("#foo"), null, "no foo element");
        assert.equal(t.query("#main") !== null, true, "#main is found");
        assert.equal(t.query("#main").uid, "E3", "#main");
        assert.equal(t.query("#child").uid, "E5", "#child found");

        let col = t.query("#elt", true)!;
        assert.equal(col.length, 2, "2 elts");
        assert.equal(col[0].uid, "E7", "col[0]");
        assert.equal(col[1].uid, "E8", "col[1]");

        t.render({ condition: false });
        assert.equal(t.query("#main").uid, "E3", "#main found (2)");
        assert.equal(t.query("#child"), null, "#child not found");

        col = t.query("#elt", true) as any[];
        assert.equal(col.length, 1, "1 elt");
        assert.equal(col[0].uid, "E8", "col[0] (2)");

        t.render({ condition: true });
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

        let t = getTemplate(tpl, body).render();

        assert.equal(t.query("#txt1").innerText, " Hello ", "#txt1");
        assert.equal(t.query("#txt2").innerText, " World 42 ", "#txt2");

        let col = t.query("#txt", true)!;
        assert.equal(col.length, 2, "2 items");
        assert.equal(col[0].innerText, " Hello ", "col[0]");
        assert.equal(col[1].innerText, " World 42 ", "col[1]");

        t.render({ condition: false });
        assert.equal(t.query("#txt1").innerText, " Hello ", "#txt1 (2)");
        assert.equal(t.query("#txt2"), null, "#txt2 (2)");

        col = t.query("#txt", true)!;
        assert.equal(col.length, 1, "col.length is 1");
        assert.equal(col[0].innerText, " Hello ", "col[0] (2)");

        t.render({ condition: true });
        assert.equal(t.query("#txt1").innerText, " Hello ", "#txt1 (3)");
        assert.equal(t.query("#txt2").innerText, " World 42 ", "#txt2 (3)");
        col = t.query("#txt", true) as any[];
        assert.equal(col.length, 2, "2 items (3)");
        assert.equal(col[0].innerText, " Hello ", "col[0] (3)");
        assert.equal(col[1].innerText, " World 42 ", "col[1] (3)");
    });

    it("should be supported on components with no content", async function () {
        const cpt = template(`(text:string = "") => {
            # cpt {text} #
        }`);

        const tpl = template(`(condition=true) => {
            <div>
                <*cpt #comp1 #comp text={"AAA"}/>
                if (condition) {
                    <*cpt #comp2 #comp text="BBB"/>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt AAA #
                    #::T5 cpt BBB #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        assert.equal(t.query("#comp1").text, "AAA", "comp1.text=AAA");
        assert.equal(t.query("#comp2").text, "BBB", "comp2.text=BBB");
        let col = t.query("#comp", true)!;
        assert.equal(col.length, 2, "2 comps");
        assert.equal(col[0].text, "AAA", "col[0] / AAA");
        assert.equal(col[1].text, "BBB", "col[1] / BBB");

        let cpt1 = t.query("#comp1");
        cpt1.text = "CCC";
        await changeComplete(cpt1);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                    #::T5 cpt BBB #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ condition: false });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(t.query("#comp1"), cpt1, "comp1 is cpt1");
        assert.equal(t.query("#comp2"), null, "no comp2");
        col = t.query("#comp", true)!;
        assert.equal(col.length, 1, "1 comp in col");
        assert.equal(col[0], cpt1, "col[0] is cpt1");

        t.render({ condition: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                    #::T5 cpt BBB #
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        assert.equal(t.query("#comp1").text, "CCC", "comp1.text=CCC (3)");
        assert.equal(t.query("#comp2").text, "BBB", "comp2.text=BBB (3)");
        col = t.query("#comp", true)!;
        assert.equal(col.length, 2, "2 comps (3)");
        assert.equal(col[0].text, "CCC", "col[0] / CCC (3)");
        assert.equal(col[1].text, "BBB", "col[1] / BBB (3)");
    });

    it("should be supported on components with content", async function () {
        const cpt = template(`(text:string = "", $content:IvContent) => {\
            # cpt {text} #
            <! @content/>
        }`);

        const tpl = template(`(condition=true) => {
            <div>
                <*cpt #comp1 #comp text={"AAA"}>
                    if (condition) {
                        <*cpt #comp2 #comp text="BBB">
                            # Hello #
                        </>
                    }
                </>
            </div>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt AAA #
                    #::T5 cpt BBB #
                    #::T6 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        assert.equal(t.query("#comp1").text, "AAA", "comp1.text=AAA");
        assert.equal(t.query("#comp2").text, "BBB", "comp2.text=BBB");
        let col = t.query("#comp", true)!;
        assert.equal(col.length, 2, "2 comps");
        assert.equal(col[0].text, "AAA", "col[0] / AAA");
        assert.equal(col[1].text, "BBB", "col[1] / BBB");

        let cpt1 = t.query("#comp1");
        cpt1.text = "CCC";
        await changeComplete(cpt1);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                    #::T5 cpt BBB #
                    #::T6 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ condition: false });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(t.query("#comp1"), cpt1, "comp1 is cpt1");
        assert.equal(t.query("#comp2"), null, "no comp2");
        col = t.query("#comp", true)!;
        assert.equal(col.length, 1, "1 comp in col");
        assert.equal(col[0], cpt1, "col[0] is cpt1");

        t.render({ condition: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                    #::T5 cpt BBB #
                    #::T6 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '4');

        assert.equal(t.query("#comp1").text, "CCC", "comp1.text=CCC (3)");
        assert.equal(t.query("#comp2").text, "BBB", "comp2.text=BBB (3)");
        col = t.query("#comp", true)!;
        assert.equal(col.length, 2, "2 comps (3)");
        assert.equal(col[0].text, "CCC", "col[0] / CCC (3)");
        assert.equal(col[1].text, "BBB", "col[1] / BBB (3)");
    });

    it("should be supported on components with $api", async function () {
        @API class CptApi {
            text: string = "";
            changeText: () => void;
        }

        const cpt = template(`($api:CptApi) => {
            if (!$api.changeText) {
                $api.changeText = () => {
                    $api.text = "CCC";
                }
            }
            # cpt {$api.text} #
        }`);

        const tpl = template(`(condition=true) => {
            <div>
                <*cpt #comp1 #comp text={"AAA"}/>
                if (condition) {
                    <*cpt #comp2 #comp text="BBB"/>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt AAA #
                    #::T5 cpt BBB #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        assert.equal(t.query("#comp1").text, "AAA", "comp1.text=AAA");
        assert.equal(t.query("#comp2").text, "BBB", "comp2.text=BBB");
        let col = t.query("#comp", true)!;
        assert.equal(col.length, 2, "2 comps");
        assert.equal(col[0].text, "AAA", "col[0] / AAA");
        assert.equal(col[1].text, "BBB", "col[1] / BBB");

        let cpt1 = t.query("#comp1") as CptApi;
        cpt1.changeText();
        await changeComplete(cpt1);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                    #::T5 cpt BBB #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ condition: false });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(t.query("#comp1"), cpt1, "comp1 is cpt1");
        assert.equal(t.query("#comp2"), null, "no comp2");
        col = t.query("#comp", true)!;
        assert.equal(col.length, 1, "1 comp in col");
        assert.equal(col[0], cpt1, "col[0] is cpt1");

        t.render({ condition: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                    #::T5 cpt BBB #
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        assert.equal(t.query("#comp1").text, "CCC", "comp1.text=CCC (3)");
        assert.equal(t.query("#comp2").text, "BBB", "comp2.text=BBB (3)");
        col = t.query("#comp", true)!;
        assert.equal(col.length, 2, "2 comps (3)");
        assert.equal(col[0].text, "CCC", "col[0] / CCC (3)");
        assert.equal(col[1].text, "BBB", "col[1] / BBB (3)");
    });

    it("should be supported on components with $ctl", async function () {
        @API class CptApi {
            text: string = "";
        }

        @Controller class CptCtl {
            $api: CptApi;

            getText() {
                return this.$api.text;
            }
        }

        const cpt = template(`($ctl:CptCtl) => {
            # cpt {$ctl.getText()} #
        }`);

        const tpl = template(`(condition=true) => {
            <div>
                <*cpt #comp1 #comp text={"AAA"}/>
                if (condition) {
                    <*cpt #comp2 #comp text="BBB"/>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt AAA #
                    #::T5 cpt BBB #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        assert.equal(t.query("#comp1").text, "AAA", "comp1.text=AAA");
        assert.equal(t.query("#comp2").text, "BBB", "comp2.text=BBB");
        let col = t.query("#comp", true)!;
        assert.equal(col.length, 2, "2 comps");
        assert.equal(col[0].text, "AAA", "col[0] / AAA");
        assert.equal(col[1].text, "BBB", "col[1] / BBB");

        let cpt1 = t.query("#comp1") as CptApi;
        cpt1.text = "CCC";
        await changeComplete(cpt1);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                    #::T5 cpt BBB #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ condition: false });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(t.query("#comp1"), cpt1, "comp1 is cpt1");
        assert.equal(t.query("#comp2"), null, "no comp2");
        col = t.query("#comp", true)!;
        assert.equal(col.length, 1, "1 comp in col");
        assert.equal(col[0], cpt1, "col[0] is cpt1");

        t.render({ condition: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 cpt CCC # (1)
                    #::T5 cpt BBB #
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        assert.equal(t.query("#comp1").text, "CCC", "comp1.text=CCC (3)");
        assert.equal(t.query("#comp2").text, "BBB", "comp2.text=BBB (3)");
        col = t.query("#comp", true)!;
        assert.equal(col.length, 2, "2 comps (3)");
        assert.equal(col[0].text, "CCC", "col[0] / CCC (3)");
        assert.equal(col[1].text, "BBB", "col[1] / BBB (3)");
    });

    it("cannot be queried during refresh", function () {
        let $tpl: IvTemplate;
        const tpl = template(`($template:IvTemplate) => {
            $tpl = $template;
            <div #div1>
                # div1 can be queried: {$template.query("#div1") !== null} #
            </div>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 div1 can be queried: false #
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        assert.equal($tpl!.query("#div1").uid, "E3" , "div1 retrieved after refresh");
    });

    // interface IvQuery<T extends Array<string>> {
    //     (selector: string, firstOnly: boolean): any | null;
    // }
    // class Foo {
    //     $query: IvQuery<["#white", "#list"]>;
    // }
    // label forwarding?
    // <*sub-cpt #foo/> -> means that a query on #foo should look in the sub-cpt template
    // <*sub-cpt ##foo="#bar"/> -> means that a query on #foo should look in the sub-cpt template and transform the query as query("#bar")
    // labels access-rights: public labels defined in the $api
    // query: IvQuery<["#white", "#list"]>;

    // assigning class to sub-elements
    // <*input @class($target="#foo" blue:{isBlue()} white:{isWhite()}) // default value for $target should be "#root"
});
