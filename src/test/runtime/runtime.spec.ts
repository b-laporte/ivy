import * as assert from 'assert';
import { $template, ζΔD, ζΔp, API } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';
import { IvView, IvTemplate } from '../../iv/types';
import { isMutating, commitChanges, changeComplete } from '../../trax';

describe('Iv Runtime', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    it("should support text and elements", function () {
        const foo = $template`() => {
            <div>
                Hello World
            </div>
        }`;

        let t = getTemplate(foo, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello World #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        const bar = $template`() => {
            <div>
                <span> abc </>
                    Hello
                    World
                      (!)
                <span/>
                <div/>
            </div>
        }`;

        body = reset();
        const t2 = getTemplate(bar, body).render();
        assert.equal(stringify(t2), `
            <body::E1>
                <div::E3>
                    <span::E4>
                        #::T5 abc #
                    </span>
                    #::T6 Hello World (!) #
                    <span::E7/>
                    <div::E8/>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should support simple dynamic text nodes", function () {
        const foo = $template`(name) => {
            <div>
                Hello {name}
            </div>
        }`;

        const t = getTemplate(foo, body).render({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello Homer #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello World # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello World # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '3 - no changes');
    });

    it("should support multiple dynamic text nodes and one-time expressions", function () {
        const tpl = $template`(name) => {
            <div>
                1-time: {::name}
                <span> name:{name}, name+123:{name+123}</span>
            </div>
        }`;

        const t = getTemplate(tpl, body).render({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 1-time: Homer #
                    <span::E5>
                        #::T6 name:Homer, name+123:Homer123#
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 1-time: Homer #
                    <span::E5>
                        #::T6 name:World, name+123:World123# (1)
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 1-time: Homer #
                    <span::E5>
                        #::T6 name:World, name+123:World123# (1)
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '3 - no changes');
    });

    it("should support content fragments", function () {
        const tpl = $template`(name) => {
            <div>
                <!> 
                    Hello
                    <span> {name} </span>
                </!>
            </div>
        }`;

        const t = getTemplate(tpl, body).render({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello #
                    <span::E5>
                        #::T6 Homer #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello #
                    <span::E5>
                        #::T6 World # (1)
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello #
                    <span::E5>
                        #::T6 World # (1)
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should support default values for template params", function () {
        const tpl = $template`(a:string="abc", b=false, c=123.45, d=12, e='hello') => {
            a:{a} b:{b} c:{c} d:{d} e:{e}
        }`;

        const t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 a:abc b:false c:123.45 d:12 e:hello #
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ a: "ABC", b: true, e: "HEY" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 a:ABC b:true c:123.45 d:12 e:HEY # (1)
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should generate fragments when template contains multiple root nodes", function () {
        const tpl = $template`(name) => {
            <div>
                <span>{name}</span>
            </div>
            Hello {name}
        }`;

        const t = getTemplate(tpl, body).render({ name: "Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <span::E4>
                        #::T5Marge#
                    </span>
                </div>
                #::T6 Hello Marge #
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <span::E4>
                        #::T5Homer# (1)
                    </span>
                </div>
                #::T6 Hello Homer # (1)
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should support element attributes", function () {
        const tpl = $template`(msg) => {
            <div class="main" title={::msg}>
                <span class="sub" title={msg}> ... </span>
            </div>
        }`;

        const t = getTemplate(tpl, body).render({ msg: "hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main" a:title="hello">
                    <span::E4 a:class="sub" a:title="hello">
                        #::T5 ... #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ msg: "hi" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main" a:title="hello">
                    <span::E4 a:class="sub" a:title="hi"(1)>
                        #::T5 ... #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should support single quote strings as param value", function () {
        const tpl = $template`(msg) => {
            <div class='main' title={::msg}>
                <span [className]='sub' title={msg}> ... </span>
            </div>
        }`;

        const t = getTemplate(tpl, body).render({ msg: "hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main" a:title="hello">
                    <span::E4 className="sub" a:title="hello">
                        #::T5 ... #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
    });

    it("should support element properties", function () {
        const tpl = $template`(msg) => {
            <div [className]="main" [title]={::msg}>
                <span [className]={msg} [title]="sub"> ... </span>
            </div>
        }`;

        const t = getTemplate(tpl, body).render({ msg: "hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="main" title="hello">
                    <span::E4 title="sub" className="hello">
                        #::T5 ... #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ msg: "hi" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="main" title="hello">
                    <span::E4 title="sub" className="hi"(1)>
                        #::T5 ... #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should support js statements", function () {
        const tpl = $template`(msg) => {
            $let m2 = msg + "!";
            <div>
                $exec m2 += "!";
                Hello {m2}
            </div>
        }`;

        const t = getTemplate(tpl, body).render({ msg: "Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello Bart!! #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ msg: "Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello Marge!! # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should not refresh if params don't change", function () {
        const tpl = $template`(name1, name2) => {
            {name1}
            {name2}
        }`;

        const t = getTemplate(tpl, body).render({ name1: "Bart", name2: "Lisa" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Bart Lisa #
                //::C2 template anchor
            </body>
        `, '1');

        assert.equal((t["view"] as IvView).lastRefresh, 1, "refreshed #1");

        t.render({ name1: "Bart", name2: "Lisa" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Bart Lisa #
                //::C2 template anchor
            </body>
        `, '2');
        assert.equal((t["view"] as IvView).lastRefresh, 1, "no second refresh");
    });

    it("should allow to expose simple template $", async function () {
        @API class HelloAPI {
            name: string;
            changeName: () => void;
        }

        let count = 0, lastApi: HelloAPI;
        const hello = $template`($:HelloAPI, name) => { // /* name = shortcut to $.name */
            $if (!$.changeName) {
                // initialize the API
                $exec $.changeName = () => {
                    $.name += ++count;
                };
            }
            $exec lastApi = $;
            <div>
                Hello {name}
            </div>
        }`;

        const greetings = $template`(names, suffix="") => {
            $for (let name of names) {
                <*hello name={name+suffix}/>
            }
        }`;

        const t = getTemplate(greetings, body).render({ names: ["Bart", "Lisa"], suffix: "X" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello BartX #
                </div>
                <div::E5>
                    #::T6 Hello LisaX #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        (t.api as any).suffix = "Y";

        await changeComplete(t.api);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello BartY # (1)
                </div>
                <div::E5>
                    #::T6 Hello LisaY # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        lastApi!.changeName();
        await changeComplete(lastApi!);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello BartY # (1)
                </div>
                <div::E5>
                    #::T6 Hello LisaY1 # (2)
                </div>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should allow to inject $template", async function () {
        const greetings = $template`(names, $template:IvTemplate) => {
            Nbr of names: {$template.api.names.length}
            $for (let name of names) {
                Hello {name}
            }
        }`;

        let t = getTemplate(greetings, body).render({ names: ["Bart", "Lisa"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Nbr of names: 2 #
                #::T4 Hello Bart #
                #::T5 Hello Lisa #
                //::C2 template anchor
            </body>
        `, '1');
    });

    // todo error if refresh before attach
    // todo validate argument names
});
