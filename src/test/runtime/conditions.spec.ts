import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';

describe('Conditional Blocks', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    it("should work on root (init false)", function () {
        let tpl = template(`(condition, msg) => {
            if (condition) {
                <div> # {msg} # </div>
            }
            # end #
        }`);

        let t = getTemplate(tpl, body).refresh({ condition: false, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 end #
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ condition: true, msg: "Hello Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E4>
                    #::T5 Hello Homer #
                </div>
                #::T3 end #
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ condition: true, msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E4>
                    #::T5 Hello Bart # (1)
                </div>
                #::T3 end #
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ condition: false, msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 end #
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ condition: true, msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E4>
                    #::T5 Hello Bart # (1)
                </div>
                #::T3 end #
                //::C2 template anchor
            </body>
        `, '5');

        t.refresh({ condition: true, msg: "Hello Maggie" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E4>
                    #::T5 Hello Maggie # (2)
                </div>
                #::T3 end #
                //::C2 template anchor
            </body>
        `, '6');
    });

    it("should work on root (init true)", function () {
        let tpl = template(`(condition, msg) => {
            if (condition) {
                <div> # {msg} # </div>
            }
            # end #
        }`);

        let t = getTemplate(tpl, body).refresh({ condition: true, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E4>
                    #::T5 Hello Marge #
                </div>
                #::T3 end #
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ condition: false, msg: "Hello Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 end #
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ condition: true, msg: "Hello Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E4>
                    #::T5 Hello Homer # (1)
                </div>
                #::T3 end #
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ condition: true, msg: "Hello Maggie" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E4>
                    #::T5 Hello Maggie # (2)
                </div>
                #::T3 end #
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("should work as single root + multiple content (init false)", function () {
        let tpl = template(`(condition, msg) => {
            if (condition) {
                # {msg} #
                <span title={msg}> # ! # </span>
                <div/>
            }
        }`);

        let t = getTemplate(tpl, body).refresh({ condition: false, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ condition: true, msg: "Hello Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T6 Hello Homer #
                <span::E3 a:title="Hello Homer">
                    #::T4 ! #
                </span>
                <div::E5/>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ condition: true, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T6 Hello Marge # (1)
                <span::E3 a:title="Hello Marge"(1)>
                    #::T4 ! #
                </span>
                <div::E5/>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ condition: false, msg: "Hello Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ condition: true, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T6 Hello Marge # (1)
                <span::E3 a:title="Hello Marge"(1)>
                    #::T4 ! #
                </span>
                <div::E5/>
                //::C2 template anchor
            </body>
        `, '5');

        t.refresh({ condition: false, msg: "Hello Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '6');

        t.refresh({ condition: true, msg: "Hello Maggie" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T6 Hello Maggie # (2)
                <span::E3 a:title="Hello Maggie"(2)>
                    #::T4 ! #
                </span>
                <div::E5/>
                //::C2 template anchor
            </body>
        `, '7');
    });

    it("should work as single root + multiple content (init true)", function () {
        let tpl = template(`(condition, msg) => {
            if (condition) {
                # {msg} #
                <span title={msg}> # ! # </span>
                <div/>
            }
        }`);

        let t = getTemplate(tpl, body).refresh({ condition: true, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T6 Hello Marge #
                <span::E3 a:title="Hello Marge">
                    #::T4 ! #
                </span>
                <div::E5/>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ condition: false, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ condition: true, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T6 Hello Marge #
                <span::E3 a:title="Hello Marge">
                    #::T4 ! #
                </span>
                <div::E5/>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ condition: true, msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T6 Hello Bart # (1)
                <span::E3 a:title="Hello Bart"(1)>
                    #::T4 ! #
                </span>
                <div::E5/>
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ condition: false, msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '5');

        t.refresh({ condition: true, msg: "Hello Maggie" });
        assert.equal(stringify(t), `
            <body::E1>
                #::T6 Hello Maggie # (2)
                <span::E3 a:title="Hello Maggie"(2)>
                    #::T4 ! #
                </span>
                <div::E5/>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("should work as last child + multiple content (init false)", function () {
        let tpl = template(`(condition, msg) => {
            <div>
                # first #
                if (condition) {
                    # {msg} #
                    <span title={msg}> # ! # </span>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ condition: false, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 first #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ condition: true, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 first #
                    #::T7 Hello Marge #
                    <span::E5 a:title="Hello Marge">
                        #::T6 ! #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ condition: true, msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 first #
                    #::T7 Hello Bart # (1)
                    <span::E5 a:title="Hello Bart"(1)>
                        #::T6 ! #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ condition: false, msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 first #
                </div>
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ condition: true, msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 first #
                    #::T7 Hello Bart # (1)
                    <span::E5 a:title="Hello Bart"(1)>
                        #::T6 ! #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '5');

        t.refresh({ condition: true, msg: "Hello Maggie" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 first #
                    #::T7 Hello Maggie # (2)
                    <span::E5 a:title="Hello Maggie"(2)>
                        #::T6 ! #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '6');
    });

    it("should work as last child + multiple content (init true)", function () {
        let tpl = template(`(condition, msg) => {
            <div>
                # first #
                if (condition) {
                    # {msg} #
                    <span title={msg}> # ! # </span>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ condition: true, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 first #
                    #::T7 Hello Marge #
                    <span::E5 a:title="Hello Marge">
                        #::T6 ! #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ condition: false, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 first #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ condition: true, msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 first #
                    #::T7 Hello Marge #
                    <span::E5 a:title="Hello Marge">
                        #::T6 ! #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ condition: true, msg: "Hello Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 first #
                    #::T7 Hello Homer # (1)
                    <span::E5 a:title="Hello Homer"(1)>
                        #::T6 ! #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("should work for if/else statements (init false)", function () {
        let tpl = template(`(condition, msg) => {
            <div>
                <div>
                    if (condition) {
                        <div class="c1">
                            # msg1: {msg} #
                        </div>
                    } else {
                        <span class="c2">
                            # msg2: {msg} #
                        </span>
                    }
                # last #
                </div>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ condition: false, msg: "Always look on the bright side of life" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4>
                        <span::E6 a:class="c2">
                            #::T7 msg2: Always look on the bright side of life #
                        </span>
                        #::T5 last #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ condition: true, msg: "Always look on the bright side of life" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4>
                        <div::E8 a:class="c1">
                            #::T9 msg1: Always look on the bright side of life #
                        </div>
                        #::T5 last #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ condition: false, msg: "Nobody expects the Spanish Inquisition!" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4>
                        <span::E6 a:class="c2">
                            #::T7 msg2: Nobody expects the Spanish Inquisition! # (1)
                        </span>
                        #::T5 last #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ condition: true, msg: "Nobody expects the Spanish Inquisition!" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4>
                        <div::E8 a:class="c1">
                            #::T9 msg1: Nobody expects the Spanish Inquisition! # (1)
                        </div>
                        #::T5 last #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("should work for if/else statements (init true)", function () {
        let tpl = template(`(condition, msg) => {
            <div>
                <div>
                    if (condition) {
                        <div class="c1">
                            # msg1: {msg} #
                        </div>
                    } else {
                        <span class="c2">
                            # msg2: {msg} #
                        </span>
                    }
                # last #
                </div>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ condition: true, msg: "Always look on the bright side of life" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4>
                        <div::E6 a:class="c1">
                            #::T7 msg1: Always look on the bright side of life #
                        </div>
                        #::T5 last #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ condition: false, msg: "Always look on the bright side of life" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4>
                        <span::E8 a:class="c2">
                            #::T9 msg2: Always look on the bright side of life #
                        </span>
                        #::T5 last #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ condition: true, msg: "It's just a flesh wound" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4>
                        <div::E6 a:class="c1">
                            #::T7 msg1: It's just a flesh wound # (1)
                        </div>
                        #::T5 last #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ condition: false, msg: "It's just a flesh wound" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E4>
                        <span::E8 a:class="c2">
                            #::T9 msg2: It's just a flesh wound # (1)
                        </span>
                        #::T5 last #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("should work for if/else statements + fragments", function () {
        let tpl = template(`(condition, msg) => {
            <div>
                if (condition) {
                    <!>
                        <div class="c1">
                            <!>
                                # msg1: {msg} #
                            </>
                        </div>
                    </>
                } else {
                    <!>
                        <span class="c2">
                            <!>
                                # msg2: {msg} #
                            </>
                        </span>
                    </>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ condition: false, msg: "Always look on the bright side of life" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <span::E4 a:class="c2">
                        #::T5 msg2: Always look on the bright side of life #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ condition: true, msg: "Always look on the bright side of life" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E6 a:class="c1">
                        #::T7 msg1: Always look on the bright side of life #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ condition: false, msg: "Nobody expects the Spanish Inquisition!" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <span::E4 a:class="c2">
                        #::T5 msg2: Nobody expects the Spanish Inquisition! # (1)
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.refresh({ condition: true, msg: "Nobody expects the Spanish Inquisition!" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <div::E6 a:class="c1">
                        #::T7 msg1: Nobody expects the Spanish Inquisition! # (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });
});