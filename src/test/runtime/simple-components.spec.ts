import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';
import { Data } from '../../trax';
import { IvContent } from '../../iv/types';

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

        let t = getTemplate(tpl, body).render();
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

        let t = getTemplate(tpl, body).render({ name: "Lisa" });
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

        t.render({ name: "Marge" });
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

        t.render({ name: undefined });
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

        let t = getTemplate(tpl, body).render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main"/>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "Bart" });
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

        t.render({ name: "Lisa" });
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

        t.render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main"/>
                //::C2 template anchor
            </body>
        `, '4');

        t.render({ name: "Homer" });
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

        let t = getTemplate(tpl, body).render({ name: "Maggie" });
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

        t.render({ name: "Bart" });
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

        t.render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main"/>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ name: "Bart" });
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

        let t = getTemplate(tpl, body).render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "Lisa" });
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

        t.render({ name: "Bart" });
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

        t.render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T4 last #
                </div>
                //::C2 template anchor
            </body>
        `, '4');

        t.render({ name: "Bart" });
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

        let t = getTemplate(tpl, body).render({ name: "Lisa" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Lisa #
                    </div>
                    #::T6 last #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Bart # (1)
                    </div>
                    #::T6 last #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T6 last #
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 className="message">
                        #::T5 Hello Homer # (2)
                    </div>
                    #::T6 last #
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

        let t = getTemplate(tpl, body).render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="message">
                    #::T4 Hello Homer #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ name: "Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="message">
                    #::T4 Hello Marge # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '4');

        t.render({ name: "Marge" });
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

        let t = getTemplate(tpl, body).render({ name: "Hal" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="message">
                    #::T4 Hello Hal #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "Dave" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 className="message">
                    #::T4 Hello Dave # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ name: "Hal" });
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

        let t = getTemplate(tpl, body).render({ fn: " Homer", ln: " Simpson" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4 a:class="fn">
                        #::T5 Homer#
                    </div>
                    <div::E6 a:class="ln">
                        #::T7 Simpson#
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ fn: " Mickey", ln: " Mouse" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4 a:class="fn">
                        #::T5 Mickey# (1)
                    </div>
                    <div::E6 a:class="ln">
                        #::T7 Mouse# (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ fn: "", ln: " Duck" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3/>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ fn: " Donald", ln: " Duck" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4 a:class="fn">
                        #::T5 Donald# (2)
                    </div>
                    <div::E6 a:class="ln">
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

        let t = getTemplate(tpl, body).render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "Hal" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Hal ! #
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ name: "Dave" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Dave ! # (1)
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ name: "" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '4');

        t.render({ name: "Dave" });
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

        let t = getTemplate(tpl, body).render({ name: "Hal" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Hal ! #
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: undefined });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ name: "Dave" });
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

        let t = getTemplate(tpl, body).render({ name1: "Marge", name2: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 Hello Marge ! #
                #::T4 Hello Homer ! #
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name1: "", name2: "Hal" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T4 Hello Hal ! # (1)
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ name1: "Marge", name2: "Homer" });
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

        let t = getTemplate(tpl, body).render({ names: [] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ names: ["Marge", "Lisa"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Marge ! #
                #::T5 Hello Lisa ! #
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ names: ["Homer"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Homer ! # (1)
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ names: ["Homer", "Marge", "Lisa"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Homer ! # (1)
                #::T5 Hello Marge ! # (1)
                #::T6 Hello Lisa ! #
                //::C2 template anchor
            </body>
        `, '4');

        t.render({ names: undefined });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                //::C2 template anchor
            </body>
        `, '5');

        t.render({ names: ["Homer", "Marge", "Lisa", "Bart", "Maggie"] });
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

        let t = getTemplate(tpl, body).render({ names: ["Bart", "Lisa"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Bart ! #
                #::T5 Hello Lisa ! #
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ names: [] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ names: ["Bart", "Homer", "Maggie"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Bart ! #
                #::T5 Hello Homer ! # (1)
                #::T6 Hello Maggie ! #
                //::C2 template anchor
            </body>
        `, '3');


        t.render({ names: ["Bart", "Homer"] });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 first #
                #::T4 Hello Bart ! #
                #::T5 Hello Homer ! # (1)
                //::C2 template anchor
            </body>
        `, '4');

        t.render({ names: ["Bart", "Homer", "Maggie"] });
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

    it("should support dynamic references (no params, no content)", function () {
        const tpl = template(`(cpt) => {
            <div class="main">
                <*cpt/>
            </>
        }`);

        const cptA = template(`() => {
            <span> # This is cptA # </>
        }`);

        const cptB = template(`() => {
            # Begin #
            <div> # This is cptB # </>
            # End #
        }`);

        const t = getTemplate(tpl, body).render({ cpt: cptA });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <span::E4>
                        #::T5 This is cptA #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ cpt: cptB });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T6 Begin #
                    <div::E7>
                        #::T8 This is cptB #
                    </div>
                    #::T9 End #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ cpt: cptA });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <span::E10>
                        #::T11 This is cptA #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should support dynamic references (params and content)", function () {
        const tpl = template(`(cpt, name, message) => {
            <div class="main">
                <*cpt {name} type="abc">
                    # Some content #
                    <div> # {message} # </>
                </>
            </>
        }`);

        const cptA = template(`(name, type, $content) => {
            <span class={type}> # This is cptA: name={name} # </>
            <! @content/>
        }`);

        const cptB = template(`(name, $content, type) => {
            # Begin #
            <div> # This is cptB: name={name} # </>
            <div class={type} @content/>
            # End #
        }`);

        const t = getTemplate(tpl, body).render({ cpt: cptA, name: "Homer", message: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <span::E4 a:class="abc">
                        #::T5 This is cptA: name=Homer #
                    </span>
                    #::T6 Some content #
                    <div::E7>
                        #::T8 Hello #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ cpt: cptB, name: "Homer", message: "Hello2" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T9 Begin #
                    <div::E10>
                        #::T11 This is cptB: name=Homer #
                    </div>
                    <div::E12 a:class="abc">
                        #::T6 Some content #
                        <div::E7>
                            #::T8 Hello2 # (1)
                        </div>
                    </div>
                    #::T13 End #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ cpt: cptA, name: "Homer2", message: "Hello2" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <span::E14 a:class="abc">
                        #::T15 This is cptA: name=Homer2 #
                    </span>
                    #::T6 Some content #
                    <div::E7>
                        #::T8 Hello2 # (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should support dynamic references (params nodes)", function () {
        const tpl = template(`(cpt, name, message) => {
            <div class="main">
                <*cpt {name} type="abc">
                    <.header> # {message} # </>
                    <div> # content {message} # </>
                    <.option code="a"> # A: {message} # </>
                    <.option code="b"> # B: {name} # </>
                </>
            </>
        }`);

        @Data class Option {
            code: string;
            $content: IvContent;
        }

        const cptA = template(`(name, type, $content, optionList:Option[], header:IvContent) => {
            <div class="headerA" @content={header}/>
            <span class={type}> # This is cptA: name={name} # </>
            <! @content/>
            <div class="options">
                for (let option of optionList) {
                    <div title={option.code} @content={option.$content} />
                }
            </>
        }`, Option);

        const cptB = template(`(name, $content, optionList:Option[], header:IvContent, type) => {
            # Begin #
            <div> # This is cptB: name={name} # </>
            <div class={type} @content/>
            <ul>
                for (let option of optionList) {
                    <li title={option.code} @content={option.$content} />
                }
            </>
            # End #
        }`);

        const t = getTemplate(tpl, body).render({ cpt: cptA, name: "Homer", message: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="headerA">
                        #::T5 Hello #
                    </div>
                    <span::E6 a:class="abc">
                        #::T7 This is cptA: name=Homer #
                    </span>
                    <div::E8>
                        #::T9 content Hello #
                    </div>
                    <div::E10 a:class="options">
                        <div::E11 a:title="a">
                            #::T12 A: Hello #
                        </div>
                        <div::E13 a:title="b">
                            #::T14 B: Homer #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ cpt: cptB, name: "Homer2", message: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T15 Begin #
                    <div::E16>
                        #::T17 This is cptB: name=Homer2 #
                    </div>
                    <div::E18 a:class="abc">
                        <div::E8>
                            #::T9 content Hello #
                        </div>
                    </div>
                    <ul::E19>
                        <li::E20 a:title="a">
                            #::T12 A: Hello #
                        </li>
                        <li::E21 a:title="b">
                            #::T14 B: Homer2 # (1)
                        </li>
                    </ul>
                    #::T22 End #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ cpt: cptA, name: "Homer2", message: "Hello2" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E23 a:class="headerA">
                        #::T5 Hello2 # (1)
                    </div>
                    <span::E24 a:class="abc">
                        #::T25 This is cptA: name=Homer2 #
                    </span>
                    <div::E8>
                        #::T9 content Hello2 # (1)
                    </div>
                    <div::E26 a:class="options">
                        <div::E27 a:title="a">
                            #::T12 A: Hello2 # (1)
                        </div>
                        <div::E28 a:title="b">
                            #::T14 B: Homer2 # (1)
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');
    });
});