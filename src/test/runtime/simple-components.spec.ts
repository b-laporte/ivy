import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';

// Components with no content
describe('Simple Components', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    let helloWorld = template(`() => {
        <div>
            # Hello World #
        </div>
    }`);

    let hello = template(`(name, className) => {
        <div [className]={className}>
            # Hello {name} #
        </div>
    }`);

    let contactDetails = template(`(firstName, lastName) => {
        <div class="fn"> #{firstName}# </>
        <div class="ln"> #{lastName}# </>
    }`);

    let greetings = template(`(name) => {
        if (name) {
            # Hello {name} ! #
        }
    }`);

    it("can project static nodes", function () {
        let tpl = template(`(names) => {
            <div class="main">
                <*helloWorld/>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4>
                        #::T5 Hello World #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
    });

    it("should support static and dynamic params", function () {
        let tpl = template(`(name) => {
            <div class="main">
                <*hello name={name} className="message"/>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ name: "Lisa" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Lisa #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ name: "Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Marge # (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ name: undefined });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello  # (2)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("can be combined with conditional blocks (lastChild - init false)", function () {
        let tpl = template(`(name) => {
            <div class="main">
                if (name) {
                    <*hello name={name} className="message"/>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main"/>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ name: "Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Bart #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ name: "Lisa" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Lisa # (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main"/>
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Homer # (2)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '5');
    });

    it("can be combined with conditional blocks (lastChild - init true)", function () {
        let tpl = template(`(name) => {
            <div class="main">
                if (name) {
                    <*hello name={name} className="message"/>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ name: "Maggie" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Maggie #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ name: "Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Bart # (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main"/>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ name: "Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Bart # (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be combined with conditional blocks (beforeChild - init false)", function () {
        let tpl = template(`(name) => {
            <div class="main">
                if (name) {
                    <*hello name={name} className="message"/>
                }
                # last #
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ name: "Lisa" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 className="message">
                        #::T6 Hello Lisa #
                    </div>
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ name: "Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 className="message">
                        #::T6 Hello Bart # (1)
                    </div>
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ name: "Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 className="message">
                        #::T6 Hello Bart # (1)
                    </div>
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '5');
    });

    it("can be combined with conditional blocks (beforeChild - init true)", function () {
        let tpl = template(`(name) => {
            <div class="main">
                if (name) {
                    <*hello name={name} className="message"/>
                }
                # last #
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ name: "Lisa" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 className="message">
                        #::T6 Hello Lisa #
                    </div>
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ name: "Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 className="message">
                        #::T6 Hello Bart # (1)
                    </div>
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 className="message">
                        #::T6 Hello Homer # (2)
                    </div>
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be combined with conditional blocks (lastOnRoot - init false)", function () {
        let tpl = template(`(name) => {
            if (name) {
                <*hello name={name} className="message"/>
            }
        }`);

        let t = getTemplate(tpl, body).refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="message">
                    #::T4 Hello Homer #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ name: "Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="message">
                    #::T4 Hello Marge # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ name: "Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="message">
                    #::T4 Hello Marge # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '5');
    });

    it("can be combined with conditional blocks (lastOnRoot - init true)", function () {
        let tpl = template(`(name) => {
            if (name) {
                <*hello name={name} className="message"/>
            }
        }`);

        let t = getTemplate(tpl, body).refresh({ name: "Hal" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="message">
                    #::T4 Hello Hal #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ name: "Dave" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="message">
                    #::T4 Hello Dave # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ name: "Hal" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="message">
                    #::T4 Hello Hal # (2)
                </div>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should support multiple root elements", function () {
        let tpl = template(`(fn, ln) => {
            <div>
                if (fn) {
                    <*contactDetails firstName={fn} lastName={ln}/>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ fn: " Homer", ln: " Simpson" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4 a:class="fn">
                        #::T6 Homer#
                    </div>
                    <div::E5 a:class="ln">
                        #::T7 Simpson#
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ fn: " Mickey", ln: " Mouse" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4 a:class="fn">
                        #::T6 Mickey# (1)
                    </div>
                    <div::E5 a:class="ln">
                        #::T7 Mouse# (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ fn: "", ln: " Duck" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3/>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ fn: " Donald", ln: " Duck" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4 a:class="fn">
                        #::T6 Donald# (2)
                    </div>
                    <div::E5 a:class="ln">
                        #::T7 Duck# (2)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("should support conditional blocks in cpt (init false)", function () {
        let tpl = template(`(name) => {
            <*greetings name={name}/>
        }`);

        let t = getTemplate(tpl, body).refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ name: "Hal" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Hal ! #
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ name: "Dave" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Dave ! # (1)
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ name: "Dave" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Dave ! # (1)
                //::C2 template anchor
            </body>
        `, '5');
    });

    it("should support conditional blocks in cpt (init true)", function () {
        let tpl = template(`(name) => {
            <*greetings name={name}/>
        }`);

        let t = getTemplate(tpl, body).refresh({ name: "Hal" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Hal ! #
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ name: undefined });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ name: "Dave" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Dave ! # (1)
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should support multiple instances", function () {
        let tpl = template(`(name1, name2) => {
            <*greetings name={name1}/>
            <*greetings name={name2}/>
        }`);

        let t = getTemplate(tpl, body).refresh({ name1: "Marge", name2: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Marge ! #
                #::T4 Hello Homer ! #
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ name1: "", name2: "Hal" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T4 Hello Hal ! # (1)
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ name1: "Marge", name2: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Marge ! #
                #::T4 Hello Homer ! # (2)
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("can be combined with loops (init: empty)", function () {
        let tpl = template(`(names) => {
            # first #
            for (let name of names || []) {
                <*greetings name={name}/>
            }
        }`);

        let t = getTemplate(tpl, body).refresh({ names: [] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ names: ["Marge", "Lisa"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Marge ! #
                #::T5 Hello Lisa ! #
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ names: ["Homer"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Homer ! # (1)
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ names: ["Homer", "Marge", "Lisa"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Homer ! # (1)
                #::T5 Hello Marge ! # (1)
                #::T6 Hello Lisa ! #
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ names: undefined });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                //::C2 template anchor
            </body>
        `, '5');

        t.refresh({ names: ["Homer", "Marge", "Lisa", "Bart", "Maggie"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Homer ! # (1)
                #::T5 Hello Marge ! # (1)
                #::T6 Hello Lisa ! #
                #::T7 Hello Bart ! #
                #::T8 Hello Maggie ! #
                //::C2 template anchor
            </body>
        `, '6');
    });

    it("can be combined with loops (init: not empty)", function () {
        let tpl = template(`(names) => {
            # first #
            for (let name of names || []) {
                <*greetings name={name}/>
            }
        }`);

        let t = getTemplate(tpl, body).refresh({ names: ["Bart", "Lisa"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Bart ! #
                #::T5 Hello Lisa ! #
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ names: [] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ names: ["Bart", "Homer", "Maggie"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Bart ! #
                #::T5 Hello Homer ! # (1)
                #::T6 Hello Maggie ! #
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ names: ["Bart", "Homer"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Bart ! #
                #::T5 Hello Homer ! # (1)
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ names: ["Bart", "Homer", "Maggie"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Bart ! #
                #::T5 Hello Homer ! # (1)
                #::T6 Hello Maggie ! #
                //::C2 template anchor
            </body>
        `, '5');
    });
});