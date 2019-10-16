import * as assert from 'assert';
import { template, logViewNodes } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';

// Components with content
describe('Empty content', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    const panel = template(`(title:string, $content?:IvContent) => {
        <div class="panel" title={title}>
            if ($content && !$content.isEmpty()) {
                <div class="content" @content/>
            } else {
                # no content #
            }
        </>
    }`);

    const panel2 = template(`(title:string, footer?:IvContent) => {
        <div class="panel" title={title}>
            # This is the panel #
            if (footer && !footer.isEmpty()) {
                <div class="footer" @content={footer}/>
            } else {
                # no footer #
            }
        </>
    }`);

    const panel3 = template(`(title:string, $content:IvContent) => {
        if ($content && !$content.isEmpty()) {
            <div class="panel3 content" @content/>
        }
    }`);

    it("should be supported with no content", function () {
        let tpl = template(`(title, message) => {
            <*panel title={title}/>
        }`);
        let t = getTemplate(tpl, body).render({ title: "Info" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="Info">
                    #::T4 no content #
                </div>
                //::C2 template anchor
            </body>
        `, '1');
    });

    it("should be supported with $content", function () {
        let tpl = template(`(title, message) => {
            <*panel title='v2'> 
                if (message) {
                    # panel content: {message} #
                }
            </>
        }`);

        let t = getTemplate(tpl, body).render({ title: "Info" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T5 no content #
                </div>
                //::C2 template anchor
            </body>
        `, '1'); // no T4 as index 4 is used by the document fragment created by isEmpty()

        t.render({ title: "Info2", message: "Hello" });

        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    <div::E7 a:class="content">
                        #::T6 panel content: Hello #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should be supported with param node content", function () {
        let tpl = template(`(message) => {
            <*panel2 title='v2'> 
                if (message) {
                    <.footer>
                        # footer content: {message} #
                    </>
                }
            </>
        }`);

        let t = getTemplate(tpl, body).render({ message: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T4 This is the panel #
                    <div::E7 a:class="footer">
                        #::T6 footer content: Hello #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1'); // no T5 as index 5 is used by the document fragment created by isEmpty()

        t.render({ message: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T4 This is the panel #
                    #::T8 no footer #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ message: "Hello 3" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T4 This is the panel #
                    <div::E7 a:class="footer">
                        #::T6 footer content: Hello 3 # (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should be supported with param node content (condition in content)", function () {
        let tpl = template(`(message) => {
            <*panel2 title='v2'>
                <.footer>
                    if (message) {
                        # footer content: {message} #
                    }
                </>
            </>
        }`);

        let t = getTemplate(tpl, body).render({ message: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T4 This is the panel #
                    <div::E7 a:class="footer">
                        #::T6 footer content: Hello #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1'); // no T5 as index 5 is used by the document fragment created by isEmpty()

        t.render({ message: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T4 This is the panel #
                    #::T8 no footer #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ message: "Hello 3" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T4 This is the panel #
                    <div::E7 a:class="footer">
                        #::T6 footer content: Hello 3 # (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should be supported with param node content (condition + fragment in content)", function () {
        let tpl = template(`(message) => {
            <*panel2 title='v2'>
                <.footer>
                    if (message) {
                        <!>
                            # footer content: {message} #
                            <div> # !!! # </div>
                        </>
                    }
                </>
            </>
        }`);
        let t = getTemplate(tpl, body).render({ message: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T4 This is the panel #
                    #::T6 no footer #
                </div>
                //::C2 template anchor
            </body>
        `, '1'); // no T5 as index 5 is used by the document fragment created by isEmpty()

        t.render({ message: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T4 This is the panel #
                    <div::E10 a:class="footer">
                        #::T7 footer content: Hello #
                        <div::E8>
                            #::T9 !!! #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ message: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T4 This is the panel #
                    #::T6 no footer #
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ message: "Hello 4" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="v2">
                    #::T4 This is the panel #
                    <div::E10 a:class="footer">
                        #::T7 footer content: Hello 4 # (1)
                        <div::E8>
                            #::T9 !!! #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("should be supported with param node content (condition in component in content)", function () {
        let tpl = template(`(message) => {
            <*panel title='the-title'>
                <*panel3>
                    if (message) {
                        # Message: {message} #
                    }
                </>
            </>
        }`);

        let t = getTemplate(tpl, body).render({ message: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="the-title">
                    #::T6 no content #
                </div>
                //::C2 template anchor
            </body>
        `, '1'); // no T5 as index 5 is used by the document fragment created by isEmpty()

        t.render({ message: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="the-title">
                    <div::E9 a:class="content">
                        <div::E8 a:class="panel3 content">
                            #::T7 Message: Hello #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ message: "" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="the-title">
                    #::T6 no content #
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ message: "Hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="panel" a:title="the-title">
                    <div::E9 a:class="content">
                        <div::E8 a:class="panel3 content">
                            #::T7 Message: Hello #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });
});
