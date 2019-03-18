import * as assert from 'assert';
import { template, ζd, ζv, ζt, ζcheck, ζelt, ζtxt, ζe, ζtxtval, ζend } from '../../iv';
import { ElementNode, doc, resetIdCount } from '../utils';
import { IvTemplate } from '../../iv/types';

describe('Iv Runtime', () => {
    let o = { indent: '        ', showUid: true, isRoot: true }, body: ElementNode;

    beforeEach(() => {
        reset();
    });

    function reset() {
        resetIdCount();
        body = doc.createElement("body");
    }

    function getTemplate(f: () => IvTemplate) {
        let t = f().attach(body);
        t.document = doc;
        return t;
    }

    function stringify(t: IvTemplate, log = false) {
        let r = t["context"].domNode.stringify(o)
        if (log) {
            let sep = "-------------------------------------------------------------------------------";
            console.log(sep);
            console.log(r);
            console.log(sep);
        }
        return r;
    }

    it("should support text and elements", function () {
        let foo = template(`() => {
            <div>
                # Hello World #
            </div>
        }`);

        let t = getTemplate(foo).refresh();

        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    #::T3 Hello World #
                </div>
            </body>
        `, '1');

        let bar = template(`() => {
            <div>
                <span> # abc # </>
                # Hello #
                # World
                  (!) #
                <span/>
                <div/>
            </div>
        }`);

        reset();
        let t2 = getTemplate(bar).refresh();

        assert.equal(stringify(t2), `
            <body::E1>
                <div::E2>
                    <span::E3>
                        #::T4 abc #
                    </span>
                    #::T5 Hello #
                    #::T6 World                  (!) #
                    <span::E7/>
                    <div::E8/>
                </div>
            </body>
        `, '2');
    });

    it("should support simple dynamic text nodes", function () {
        let foo = template(`(name) => {
            <div>
                # Hello {name} #
            </div>
        }`);

        let t = getTemplate(foo).refresh({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    #::T3 Hello Homer #
                </div>
            </body>
        `, '1');

        t.refresh({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    #::T3 Hello World # (1)
                </div>
            </body>
        `, '2');

        t.refresh({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    #::T3 Hello World # (1)
                </div>
            </body>
        `, '3 - no changes');
    });

    it("should support multiple dynamic text nodes and one-time expressions", function () {
        let tpl = template(`(name) => {
            <div>
                # 1-time: {::name} #
                <span> # name:{name}, name+123:{name+123}# </span>
            </div>
        }`);

        let t = getTemplate(tpl).refresh({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    #::T4 1-time: Homer #
                    <span::E3>
                        #::T5 name:Homer, name+123:Homer123#
                    </span>
                </div>
            </body>
        `, '1');

        t.refresh({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    #::T4 1-time: Homer #
                    <span::E3>
                        #::T5 name:World, name+123:World123# (1)
                    </span>
                </div>
            </body>
        `, '2');

        t.refresh({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    #::T4 1-time: Homer #
                    <span::E3>
                        #::T5 name:World, name+123:World123# (1)
                    </span>
                </div>
            </body>
        `, '3 - no changes');
    });

    it("should support content fragments", function () {
        let tpl = template(`(name) => {
            <div>
                <!> 
                    # Hello #
                    <span> # {name} # </span>
                </!>
            </div>
        }`);

        let t = getTemplate(tpl).refresh({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    #::T3 Hello #
                    <span::E4>
                        #::T5 Homer #
                    </span>
                </div>
            </body>
        `, '1');

        t.refresh({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    #::T3 Hello #
                    <span::E4>
                        #::T5 World # (1)
                    </span>
                </div>
            </body>
        `, '2');

        t.refresh({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    #::T3 Hello #
                    <span::E4>
                        #::T5 World # (1)
                    </span>
                </div>
            </body>
        `, '3');
    });

    it("should generate fragments when template contains multiple root nodes", function () {
        let tpl = template(`(name) => {
            <div>
                <span> #{name}# </span>
            </div>
            # Hello {name} #
        }`);

        let t = getTemplate(tpl).refresh({ name: "Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    <span::E3>
                        #::T4Marge#
                    </span>
                </div>
                #::T5 Hello Marge #
            </body>
        `, '1');

        t.refresh({ name: "Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2>
                    <span::E3>
                        #::T4Homer# (1)
                    </span>
                </div>
                #::T5 Hello Homer # (1)
            </body>
        `, '2');
    });

    it("should support element attributes", function () {
        let tpl = template(`(msg) => {
            <div class="main" title={::msg}>
                <span class="sub" title={msg}> # ... # </span>
            </div>
        }`);

        let t = getTemplate(tpl).refresh({ msg: "hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2 a:class="main" a:title="hello">
                    <span::E3 a:class="sub" a:title="hello">
                        #::T4 ... #
                    </span>
                </div>
            </body>
        `, '1');

        t.refresh({ msg: "hi" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2 a:class="main" a:title="hello">
                    <span::E3 a:class="sub" a:title="hi"(1)>
                        #::T4 ... #
                    </span>
                </div>
            </body>
        `, '2');
    });

    it("should support element properties", function () {
        let tpl = template(`(msg) => {
            <div [className]="main" [title]={::msg}>
                <span [className]={msg} [title]="sub"> # ... # </span>
            </div>
        }`);

        let t = getTemplate(tpl).refresh({ msg: "hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2 className="main" title="hello">
                    <span::E3 title="sub" className="hello">
                        #::T4 ... #
                    </span>
                </div>
            </body>
        `, '1');

        t.refresh({ msg: "hi" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E2 className="main" title="hello">
                    <span::E3 title="sub" className="hi"(1)>
                        #::T4 ... #
                    </span>
                </div>
            </body>
        `, '2');
    });

    // post mail!!!

    // js statements
    // js blocks
    // cpt
    // properties
    // todo error if refresh before attach
    // todo validate argument names
});
