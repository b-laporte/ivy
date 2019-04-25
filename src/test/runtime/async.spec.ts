import * as assert from 'assert';
import { template, asyncComplete } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';

describe('Async decorator', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    const section = template(`(title, open, $content) => {
        <div class="section">
            # ::: {title} ::: #
            if (open) {
                <div @async @content/>
            }
        </div>
    }`);

    const section2 = template(`(title, open, $content) => {
        <div class="section">
            # ::: {title} ::: #
            if (open) {
                <div @content/>
            }
        </div>
    }`);

    it("can be used on elements (@async)", async function () {
        const tpl = template(`(msg) => {
            <div class="main">
                <div @async class="child">
                    # Child content - message: {msg} #
                </div>
            </div>
            # end #
        }`);

        let t = getTemplate(tpl, body).refresh({ msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main"/>
                #::T4 end #
                //::C2 template anchor
            </body>
        `, '1');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 a:class="child">
                        #::T6 Child content - message: Hello Marge #
                    </div>
                </div>
                #::T4 end #
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 a:class="child">
                        #::T6 Child content - message: Hello Marge #
                    </div>
                </div>
                #::T4 end #
                //::C2 template anchor
            </body>
        `, '3');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 a:class="child">
                        #::T6 Child content - message: Hello Bart # (1)
                    </div>
                </div>
                #::T4 end #
                //::C2 template anchor
            </body>
        `, '4');

    });

    it("can work synchronoulsy (@async=0)", async function () {
        const tpl = template(`(msg) => {
            <div class="main">
                <div @async=0 class="child">
                    # Child content - message: {msg} #
                </div>
            </div>
            # end #
        }`);

        let t = getTemplate(tpl, body).refresh({ msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="child">
                        #::T6 Child content - message: Hello Marge #
                    </div>
                </div>
                #::T5 end #
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="child">
                        #::T6 Child content - message: Hello Bart # (1)
                    </div>
                </div>
                #::T5 end #
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("can work with expressions (@async={expr()}) - init 1", async function () {
        let asyncMode = true;

        const tpl = template(`(msg) => {
            <div @async={asyncMode? 1 : 0} class="msg">
                # Child content - message: {msg} #
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '1');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="msg">
                    #::T4 Child content - message: Hello Marge #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ msg: "Hello Homer" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="msg">
                    #::T4 Child content - message: Hello Marge #
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="msg">
                    #::T4 Child content - message: Hello Homer # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '4');

        asyncMode = false;
        t.refresh({ msg: "Hello Bart" }); // priority expression will be changed
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="msg">
                    #::T4 Child content - message: Hello Bart # (2)
                </div>
                //::C2 template anchor
            </body>
        `, '5');

        t.refresh({ msg: "Hello Maggie" }); // priority expression will be unchanged
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="msg">
                    #::T4 Child content - message: Hello Maggie # (3)
                </div>
                //::C2 template anchor
            </body>
        `, '6');
    });

    it("can be used on fragments (@async)", async function () {
        const tpl = template(`(msg) => {
            <div class="main">
                <! @async>
                    # Child content - message: {msg} #
                </>
            </div>
            # end #
        }`);

        let t = getTemplate(tpl, body).refresh({ msg: "Hello Marge" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main"/>
                #::T4 end #
                //::C2 template anchor
            </body>
        `, '1');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T5 Child content - message: Hello Marge #
                </div>
                #::T4 end #
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T5 Child content - message: Hello Marge #
                </div>
                #::T4 end #
                //::C2 template anchor
            </body>
        `, '3');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T5 Child content - message: Hello Bart # (1)
                </div>
                #::T4 end #
                //::C2 template anchor
            </body>
        `, '4');

    });

    it("can be used on sub-components w/ @content", async function () {
        const tpl = template(`(msg, open) => {
            <div class="main">
                <$section title="Section" open={open}>
                    # Message: {msg} #
                </>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ msg: "Hello Marge", open: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                        <div::E6>
                            #::T7 Message: Hello Marge #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ msg: "Hello Bart" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                        <div::E6>
                            #::T7 Message: Hello Marge #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                        <div::E6>
                            #::T7 Message: Hello Bart # (1)
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ msg: "Hello Bart", open: false });
        await asyncComplete(); // not necessary here
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '5');

        t.refresh({ msg: "Hello Homer", open: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '6');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                        <div::E6>
                            #::T7 Message: Hello Homer # (2)
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '7');
    });

    it("can be used in light-dom content", async function () {
        const tpl = template(`(msg, open) => {
            <div class="main">
                <$section2 title="Section" open={open}>
                    <div @async>
                        # Message: {msg} #
                    </div>
                </>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ msg: "Hello Marge", open: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                        <div::E6/>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                        <div::E6>
                            <div::E7>
                                #::T8 Message: Hello Marge #
                            </div>
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ msg: "Hello Maggie", open: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                        <div::E6>
                            <div::E7>
                                #::T8 Message: Hello Marge #
                            </div>
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 ::: Section ::: #
                        <div::E6>
                            <div::E7>
                                #::T8 Message: Hello Maggie # (1)
                            </div>
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be used on components (@async)", async function () {
        const tpl = template(`(msg, open) => {
            <div class="main">
                <$section2 @async title="Section" open={open}>
                    <div>
                        # Message: {msg} #
                    </div>
                </>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ msg: "Hello Marge", open: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main"/>
                //::C2 template anchor
            </body>
        `, '1');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 a:class="section">
                        #::T6 ::: Section ::: #
                        <div::E7>
                            <div::E4>
                                #::T8 Message: Hello Marge #
                            </div>
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.refresh({ msg: "Hello Bart", open: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 a:class="section">
                        #::T6 ::: Section ::: #
                        <div::E7>
                            <div::E4>
                                #::T8 Message: Hello Marge #
                            </div>
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 a:class="section">
                        #::T6 ::: Section ::: #
                        <div::E7>
                            <div::E4>
                                #::T8 Message: Hello Bart # (1)
                            </div>
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');

        t.refresh({ msg: "Hello Maggie", open: false });
        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 a:class="section">
                        #::T6 ::: Section ::: #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '5');

        t.refresh({ msg: "Hello Lisa", open: true });
        await asyncComplete();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 a:class="section">
                        #::T6 ::: Section ::: #
                        <div::E7>
                            <div::E4>
                                #::T8 Message: Hello Lisa # (2)
                            </div>
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

});
