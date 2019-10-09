import * as assert from 'assert';
import { template, logger, Controller, API, defaultValue, decorator, required, IvElement } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';
import { Data } from '../../trax';
import { IvLogger } from '../../iv/types';
import { IvEventEmitter } from '../../iv/events';

describe('Errors', () => {
    let body: ElementNode, defaultLog = logger.error, error = "";

    function logError(msg: string) {
        if (error) {
            error += "\n";
        }
        error += "            " + msg.replace(/\n/g, "\n            ");
    }

    beforeEach(() => {
        error = "";
        logger.error = logError;
        body = reset();
    });

    afterEach(() => {
        logger.error = defaultLog;
    });

    @Data class User {
        alias: string;
    }

    @Data class EditorInput {
        inputValue: string;
    }
    @API class Editor {
        text: string;
        input: EditorInput;
    }
    const editor = template(`($api: Editor) => {
        <div class="editor">
            #>> {$api.text} <<#
        </>
    }`);

    @API class Title {
        @defaultValue text: string = "";
        @required $targetElt: IvElement;
    }
    const title = decorator(Title, (api: Title) => {
        return {
            $render() {
                api.$targetElt.setAttribute("title", api.text);
            }
        }
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
            IVY: controller $afterRender hook execution error
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
                <.txt @paramValue="World"/>
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
                <.txt @paramValue="World"/>
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
            IVY: Invalid parameter 'txt' on <*hello/>
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
            IVY: Invalid parameter 'txt' on <*hello/>
            >> Template: "test" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in case of invalid event handler (1)", function () {
        function doSomething() { }

        const cpt = template(`() => {
            # Hello #
        }`);

        const err = template(`() => {
            <*cpt @onclick={=>doSomething()} />
        }`);

        getTemplate(err, body).render();
        assert.equal(error, `\
            IVY: Unsupported event: click
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in case of invalid event handler (2)", function () {
        function doSomething() { }

        @API class CptAPI {
            fooEmitter: IvEventEmitter;
        }
        const cpt = template(`($api:CptAPI) => {
            # Hello #
        }`);

        const err = template(`() => {
            <*cpt @onclick={=>doSomething()} />
        }`);

        getTemplate(err, body).render();
        assert.equal(error, `\
            IVY: Unsupported event: click
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in case of invalid event handler (3)", function () {
        class Foo {
            bar = 123;
        }

        @API class CptAPI {
            clickEmitter: Foo;
        }
        const cpt = template(`($api:CptAPI) => {
            # Hello #
        }`);

        const err = template(`() => {
            <*cpt @onclick={=>123} />
        }`);

        getTemplate(err, body).render();
        assert.equal(error, `\
            IVY: Invalid EventEmitter: clickEmitter
            >> Template: "cpt" - File: "runtime/errors.spec.ts"
            >> Template: "err" - File: "runtime/errors.spec.ts"
            IVY: Invalid event emitter for: click
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in case of invalid event handler (4)", function () {
        class Foo {
            init() { }
        }

        @API class CptAPI {
            clickEmitter: Foo;
        }
        const cpt = template(`($api:CptAPI) => {
            # Hello #
        }`);

        const err = template(`() => {
            <*cpt @onclick={=>123} />
        }`);

        getTemplate(err, body).render();
        assert.equal(error, `\
            IVY: Invalid event emitter for: click
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised in case of invalid event handler (5)", function () {
        @Data class HelloHeader {
            title: string;
            clickEmitter: IvEventEmitter;
        }
        @API class HelloAPI {
            name: string = "";
            header: HelloHeader;
            clickOnHeader: () => boolean;
        }
        @Controller class HelloCtl {
            $api: HelloAPI;
            $init() {
                this.$api.clickOnHeader = () => {
                    return this.$api.header.clickEmitter.emit("HEADER CLICKED");
                }
            }
        }
        const hello = template(`($ctl:HelloCtl) => {
            let api = $ctl.$api
            # Hello {api.name} #
        }`);
        const err = template(`() => {
            <*hello #hello name="World">
                <.header title={"Header"} @onfoobar={=>123} />
            </*hello>
        }`);

        getTemplate(err, body).render();
        assert.equal(error, `\
            IVY: Unsupported event: foobar
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised for I/O binding expressions used on non @io params (component)", function () {
        const err = template(`(user:User) => {
            <*editor text={=user.alias} />
        }`);

        let usr = new User();
        usr.alias = "Alan";

        getTemplate(err, body).render({ user: usr });
        assert.equal(error, `\
            IVY: Invalid I/O binding expression on 'text' (not an @io param)
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised for I/O binding expressions used on non @io params (decorator/default param)", function () {
        const err = template(`(user:User) => {
            <div @title={=user.alias}>
                # Hello {user.alias} #
            </div>
        }`);

        let usr = new User();
        usr.alias = "Alan";

        getTemplate(err, body).render({ user: usr });
        assert.equal(error, `\
            IVY: Invalid I/O binding expression on @title (@defaultValue is not an @io param)
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised for I/O binding expressions used on non @io params (decorator/multiple params)", function () {
        const err = template(`(user:User) => {
            <div @title(text={=user.alias})>
                # Hello {user.alias} #
            </div>
        }`);

        let usr = new User();
        usr.alias = "Alan";

        getTemplate(err, body).render({ user: usr });
        assert.equal(error, `\
            IVY: Invalid I/O binding expression on @title.text (not an @io param)
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised for I/O binding expressions used on non @io params (param node/@paramValue param)", function () {
        const err = template(`(user:User) => {
            <*editor>
                <.text @paramValue={=user.alias}/>
            </>
        }`);

        let usr = new User();
        usr.alias = "Alan";

        getTemplate(err, body).render({ user: usr });
        assert.equal(error, `\
            IVY: Invalid I/O binding expression on .text@paramValue (not an @io param)
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

    it("should be raised for I/O binding expressions used on non @io params (param node/multiple params)", function () {
        const err = template(`(user:User) => {
            <*editor>
                <.input inputValue={=user.alias}/>
            </>
        }`);

        let usr = new User();
        usr.alias = "Alan";

        getTemplate(err, body).render({ user: usr });
        assert.equal(error, `\
            IVY: Invalid I/O binding expression on .input.inputValue (not an @io param)
            >> Template: "err" - File: "runtime/errors.spec.ts"`
            , "1");
    });

});
