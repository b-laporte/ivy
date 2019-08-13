import * as assert from 'assert';
import { template, logger, Controller } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';
import { Data } from '../../trax/trax';
import { IvLogger } from '../../iv/types';

describe('Errors', () => {
    let body: ElementNode, defaultLog = logger.error, error = "";

    function logError(msg: string) {
        error = "            " + msg.replace(/\n/g, "\n            ");
    }

    beforeEach(() => {
        error = "";
        logger.error = logError;
        body = reset();
    });

    afterEach(() => {
        logger.error = defaultLog;
    });


    it("should be properly caught in template code", function () {
        const err1 = template(`(a) => {
            <div>
                if (a.b) {
                    <span/>
                }
            </div>
        }`);

        let t = getTemplate(err1, body).render();
        assert.equal(error, `\
            IVY: Template execution error
            Cannot read property 'b' of undefined
            >> Template: "err1" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should display the whole template call stack", function () {
        const err2 = template(`(a) => {
            <div>
                if (a.b) {
                    <span/>
                }
            </div>
        }`);

        const err1 = template(`(a) => {
            <*err2/>
        }`);

        let t = getTemplate(err1, body).render();
        assert.equal(error, `\
            IVY: Template execution error
            Cannot read property 'b' of undefined
            >> Template: "err2" - File: "runtime/errors.spec.ts"
            >> Template: "err1" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in case of invalid query argument", function () {
        const err3 = template(`(a) => {
            <div #foo/>
        }`);

        let t = getTemplate(err3, body).render();
        t.query("foo")
        assert.equal(error, `\
            IVY: [$template.query()] Invalid label argument: 'foo' (labels must start with #)
            >> Template: "err3" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in case of invalid template controller", function () {
        class Foo {
            blah: string;
        }

        const err = template(`($ctl:Foo) => {
            <div #foo/>
        }`);

        let t = getTemplate(err, body).render();
        assert.equal(error, `\
            IVY: Template controller must be a @Controller Object - please check: Foo
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in case of error in template hook", function () {
        @Controller class ErrCtl {
            someProp: any;
            $afterRender() {
                if (this.someProp.foo) {
                    console.log("this code will not be reached");
                }
            }
        }

        const err = template(`($ctl:ErrCtl) => {
            <div #foo/>
        }`);

        let t = getTemplate(err, body).render();
        assert.equal(error, `\
            IVY: $afterRender hook execution error
            Cannot read property 'foo' of undefined
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in when invalid parameter nodes are used", function () {
        const hello = template(`(msg:string) => {
            # Hello {msg} #
        }`);

        const test = template(`() => {
            <*hello>
                <.txt @value="World"/>
            </>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(error, `\
            IVY: Invalid parameter node: <.txt>
            >> Template: "test" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in when invalid parameter nodes are used (2)", function () {
        const hello = template(`() => {
            # Hello #
        }`);

        const test = template(`() => {
            <*hello>
                <.txt @value="World"/>
            </>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(error, `\
            IVY: Invalid parameter node <.txt/>: no param node can be used in this context
            >> Template: "test" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in when invalid parameter nodes are used (3)", function () {
        const hello = template(`(msg:string) => {
            # Hello {msg} #
        }`);

        const test = template(`() => {
            <*hello>
                <.msg text="ABC"/>
            </>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(error, `\
            IVY: Invalid param node parameter: text
            >> Template: "test" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in when invalid parameter nodes are used (4)", function () {
        @Data class Msg {
            value: string;
        }
        const hello = template(`(msg: Msg) => {
            # Hello {msg} #
        }`);

        const test = template(`() => {
            <*hello>
                <.msg valueZ={"World"}/>
            </>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(error, `\
            IVY: Invalid param node parameter: valueZ
            >> Template: "test" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in when invalid parameter nodes are used (5)", function () {
        @Data class Msg {
            value: string;
        }
        const hello = template(`(msg: Msg) => {
            # Hello {msg} #
        }`);

        const test = template(`() => {
            <*hello>
                <.msg valueZ="World"/>
            </>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(error, `\
            IVY: Invalid param node parameter: valueZ
            >> Template: "test" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in when invalid parameters are used", function () {
        const hello = template(`() => {
            # Hello #
        }`);

        const test = template(`() => {
            <*hello txt="World"/>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(error, `\
            IVY: Invalid parameter: txt
            >> Template: "test" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in when invalid parameters are used (2)", function () {
        const hello = template(`() => {
            # Hello #
        }`);

        const test = template(`() => {
            <*hello txt={"World"}/>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(error, `\
            IVY: Invalid parameter: txt
            >> Template: "test" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in when invalid parameters are used (3)", function () {
        const hello = template(`(name) => {
            # Hello {name} #
        }`);

        const test = template(`() => {
            <*hello txt="Homer"/>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(error, `\
            IVY: Invalid parameter: txt
            >> Template: "test" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in when invalid parameters are used (4)", function () {
        const hello = template(`(name) => {
            # Hello {name} #
        }`);

        const test = template(`() => {
            <*hello txt={"Homer"}/>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(error, `\
            IVY: Invalid parameter: txt
            >> Template: "test" - File: "runtime/errors.spec.ts"`
            , "1");
    });
});
