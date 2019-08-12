import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';

describe('Iv Fragments', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    it("should work as root nodes", function () {
        const tpl = template(`(condition, msg) => {
            <!>
                <!>
                    <!>
                        # m1: {msg} #
                        # m2: {msg} #
                    </>
                </>
            </>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 m1: Hello #
                #::T4 m2: Hello #
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ msg: "Hi" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 m1: Hi # (1)
                #::T4 m2: Hi # (1)
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should work with js blocks (init false)", function () {
        let tpl = template(`(condition, msg) => {
            <!>
                <!>
                    <!>
                        if (condition) {
                            <!>
                                <!>
                                    # m1: {msg} #
                                    # m2: {msg} #
                                </>
                            </>
                        }
                    </>
                </>
            </>
        }`);

        let t = getTemplate(tpl, body).render({ condition: false, msg: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ condition: true, msg: "Hi" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 m1: Hi #
                #::T4 m2: Hi #
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ condition: false, msg: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ condition: true, msg: "Hi" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 m1: Hi #
                #::T4 m2: Hi #
                //::C2 template anchor
            </body>
        `, '4');

        t.render({ condition: true, msg: "Greetings" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 m1: Greetings # (1)
                #::T4 m2: Greetings # (1)
                //::C2 template anchor
            </body>
        `, '5');
    });

    it("should work with js blocks (init true)", function () {
        let tpl = template(`(condition, msg) => {
            <!>
                <!>
                    <!>
                        if (condition) {
                            <!>
                                <!>
                                    # m1: {msg} #
                                    # m2: {msg} #
                                </>
                            </>
                        }
                    </>
                </>
            </>
        }`);

        let t = getTemplate(tpl, body).render({ condition: true, msg: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 m1: Hello #
                #::T4 m2: Hello #
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ condition: false, msg: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ condition: true, msg: "Hi" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 m1: Hi # (1)
                #::T4 m2: Hi # (1)
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ condition: false, msg: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '4');

        t.render({ condition: true, msg: "Greetings" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 m1: Greetings # (2)
                #::T4 m2: Greetings # (2)
                //::C2 template anchor
            </body>
        `, '5');
    });
});
