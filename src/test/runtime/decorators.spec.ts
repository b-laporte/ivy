import * as assert from 'assert';
import { template, API, defaultValue, IvElement, decorator, required, logger } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';
import { IvEventEmitter, IvEvent } from '../../iv/events';

describe('Decorators', () => {
    let body: ElementNode, defaultLog = logger.error, error = "";

    function logError(msg: string) {
        if (error) {
            error += "\n";
        }
        error += "            " + msg.replace(/\n/g, "\n            ");
    }

    beforeEach(() => {
        logger.error = logError;
        body = reset();
    });

    afterEach(() => {
        if (error) {
            console.log("Unchecked error:\n", error);
        }
        logger.error = defaultLog;
    });

    @API class Title {
        @defaultValue text: string = "";
        prefix = "";
        suffix = "";
        clickEmitter: IvEventEmitter;
        $targetApi?: Object;
        @required $targetElt: IvElement;
    }
    const title = decorator(Title, (api: Title) => {
        let isEltDefinedAtInit = false;
        return {
            $init() {
                if (api.$targetElt) {
                    isEltDefinedAtInit = true;
                }
                if (api.text === "ERROR_INIT") {
                    throw "Error in Init";
                }
            },
            $render() {
                let info = "";
                if (api.text === "ERROR_RENDER") {
                    throw "Error in Render";
                } else if (api.text === "ERROR2_RENDER") {
                    throw new Error("Error2 in Render");
                }
                if (api.$targetApi && api.$targetElt) {
                    // target is a component
                    info = "CPT";
                    if (isEltDefinedAtInit) {
                        info += "OK";
                    }
                    info += ": ";
                }
                if (api.text === "") {
                    api.$targetElt.setAttribute("title", "[NO TITLE]");
                } else {
                    api.$targetElt.setAttribute("title", info + api.prefix + api.text + api.suffix);
                }
            }
        }
    });

    @API class Deco1 {
        @defaultValue text: string = "";
        @required $targetApi: Object;    // cannot be used on a component
    }
    const deco1 = decorator(Deco1, (api: Deco1) => {
        return {
            $render() {
                throw "Error in Render";
            }
        }
    });

    @API class Deco2 {
        @defaultValue text: string = "";
        @required $targetElt: Object;    // cannot be used on a component
    }
    const deco2 = decorator(Deco2, (api: Deco2) => {
        return {
            $render() {
                throw "Error in Render";
            }
        }
    });

    const greeting = template(`(name:string) => {
        <div class="greeting" #main>
            # Hello {name} #
        </div>
    }`);

    const section = template(`(title:string, $content) => {
        <div class="section" #main>
            <div class="header"> # {title} # </>
            <! @content/>
        </>
    }`);

    it("can be set on elements - no values", function () {
        const tpl = template(`() => {
            <div @title>
                # Hello #
            </div>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="[NO TITLE]">
                    #::T4 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '1');
    });

    it("can be set on elements - with default value", function () {
        const tpl = template(`(msg:string) => {
            <div @title={msg}>
                # Hello #
            </div>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "hi there" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="hi there">
                    #::T4 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ msg: "hi again" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="hi again"(1)>
                    #::T4 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("can be set on elements - with multiple params (w/o statics)", function () {
        const tpl = template(`(msg:string, pr:string, sf:string) => {
            <div @title(text={msg} prefix={pr} suffix={sf})>
                # Hello #
            </div>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "hi there", pr: ">>>", sf: "<<<" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title=">>>hi there<<<">
                    #::T4 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ msg: "hello", pr: "-", sf: "-" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="-hello-"(1)>
                    #::T4 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("can be set on elements - with multiple params (w/ statics)", function () {
        const tpl = template(`(msg:string) => {
            <div @title(text={msg} prefix=">>>" suffix="<<<")>
                # Hello #
            </div>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "hi there", pr: ">>>", sf: "<<<" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title=">>>hi there<<<">
                    #::T4 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ msg: "hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title=">>>hello<<<"(1)>
                    #::T4 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("can be set on elements - with static label", function () {
        const tpl = template(`(msg:string) => {
            <div @title(text={msg} #theTitle)>
                # Hello #
            </div>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "hi there" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="hi there">
                    #::T4 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        let theTitle = t.query("#theTitle") as Title;
        assert.equal(theTitle.text, "hi there", "2");
        assert.equal(theTitle.$targetElt!.tagName, "DIV", "3");
    });

    it("can be set on elements - with dynamic label", function () {
        const tpl = template(`(msg:string) => {
            <div @title(text={msg} #theTitle={msg==="hello"})>
                # Hello #
            </div>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "hello" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="hello">
                    #::T4 Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        let theTitle = t.query("#theTitle") as Title;
        assert.equal(theTitle.text, "hello", "2");
        assert.equal(theTitle.$targetElt!.tagName, "DIV", "3");

        t.render({ msg: "hello2" });
        assert.equal(t.query("#theTitle"), null, "4");
    });

    it("can emit events", function () {
        let lastEvent: IvEvent | null = null;
        function processEvent(e: IvEvent) {
            lastEvent = e;
        }
        const tpl = template(`(msg:string) => {
            <div @title(text={msg} #theTitle @onclick={processEvent})>
                # Hello #
            </div>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "hello" });
        let theTitle = t.query("#theTitle") as Title;
        theTitle.clickEmitter.emit("DATA");

        assert.equal(lastEvent!.data, "DATA", "1");
        assert.equal(lastEvent!.type, "click", "2");
    });

    it("can be set on components - no content + $init", function () {
        const tpl = template(`(name:string) => {
            <*greeting {name} @title={"name is '"+name+"'"}/>
        }`);

        let t = getTemplate(tpl, body).render({ name: "World" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="greeting" a:title="CPTOK: name is 'World'">
                    #::T4 Hello World #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ name: "Sunshine" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="greeting" a:title="CPTOK: name is 'Sunshine'"(1)>
                    #::T4 Hello Sunshine # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("can be set on components - content + $init", function () {
        const tpl = template(`(msg:string, tip:string) => {
            <div class="root">
                <*section title={msg} @title={tip}>
                    # Section content - msg: {msg} #
                </>
            </>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "Hello World", tip: "hi" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="root">
                    <div::E4 a:class="section" a:title="CPTOK: hi">
                        <div::E5 a:class="header">
                            #::T6 Hello World #
                        </div>
                        #::T7 Section content - msg: Hello World #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ msg: "Hello World", tip: "hi again" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="root">
                    <div::E4 a:class="section" a:title="CPTOK: hi again"(1)>
                        <div::E5 a:class="header">
                            #::T6 Hello World #
                        </div>
                        #::T7 Section content - msg: Hello World #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("can be used in component content - default param", function () {
        const tpl = template(`(msg:string, tip:string) => {
            <div class="root">
                <*section title={msg}>
                    <div @title={tip}>
                        # Section content - msg: {msg} #
                    </>
                </>
            </>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "Hello World", tip: "hi" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="root">
                    <div::E4 a:class="section">
                        <div::E5 a:class="header">
                            #::T6 Hello World #
                        </div>
                        <div::E7 a:title="hi">
                            #::T8 Section content - msg: Hello World #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ msg: "Hello World2", tip: "hi again" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="root">
                    <div::E4 a:class="section">
                        <div::E5 a:class="header">
                            #::T6 Hello World2 # (1)
                        </div>
                        <div::E7 a:title="hi again"(1)>
                            #::T8 Section content - msg: Hello World2 # (1)
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("can be used in component content - multiple params", function () {
        const tpl = template(`(msg:string, tip:string) => {
            <div class="root">
                <*section title={msg}>
                    <div @title(text={tip} suffix={"!"})>
                        # Section content - msg: {msg} #
                    </>
                </>
            </>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "Hello World", tip: "hi" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="root">
                    <div::E4 a:class="section">
                        <div::E5 a:class="header">
                            #::T6 Hello World #
                        </div>
                        <div::E7 a:title="hi!">
                            #::T8 Section content - msg: Hello World #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ msg: "Hello Earth", tip: "hi again" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="root">
                    <div::E4 a:class="section">
                        <div::E5 a:class="header">
                            #::T6 Hello Earth # (1)
                        </div>
                        <div::E7 a:title="hi again!"(1)>
                            #::T8 Section content - msg: Hello Earth # (1)
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
    });

    it("should be able to throw errors", function () {
        const tpl = template(`(msg:string) => {
            <div @title={msg}>
                # Hello #
            </div>
        }`);

        let t = getTemplate(tpl, body).render({ msg: "ERROR_INIT" });

        assert.equal(error, `\
            IVY: @title $init hook execution error
            Error in Init
            >> Template: "tpl" - File: "runtime/decorators.spec.ts"`
            , "1");

        error = "";

        t.render({ msg: "ERROR_RENDER" });
        assert.equal(error, `\
            IVY: @title $render hook execution error
            Error in Render
            >> Template: "tpl" - File: "runtime/decorators.spec.ts"`
            , "2");

        error = "";

        t.render({ msg: "ERROR2_RENDER" });
        assert.equal(error, `\
            IVY: @title $render hook execution error
            Error2 in Render
            >> Template: "tpl" - File: "runtime/decorators.spec.ts"`
            , "2");

        error = "";
    });

    it("will raise errors if @required constraint is not met", function () {
        const tpl1 = template(`(msg:string) => {
            <div @deco1={msg}>
                # Hello #
            </div>
        }`);

        getTemplate(tpl1, body).render({ msg: "x" });

        assert.equal(error, `\
            IVY: @deco1 cannot be used on DOM nodes
            >> Template: "tpl1" - File: "runtime/decorators.spec.ts"`
            , "1");

        error = "";

        const tpl2 = template(`(msg:string) => {
            <*tpl1 @deco2={msg}/>
        }`);

        getTemplate(tpl2, body).render({ msg: "x" });

        assert.equal(error, `\
            IVY: @deco1 cannot be used on DOM nodes
            >> Template: "tpl1" - File: "runtime/decorators.spec.ts"
            >> Template: "tpl2" - File: "runtime/decorators.spec.ts"
            IVY: @deco2 cannot be used on components that don't define #main elements
            >> Template: "tpl2" - File: "runtime/decorators.spec.ts"`
            , "2");

        error = "";
    });

    // refresh triggered by decorator change -> render -> is it necessary?
    // render only if $target re-rendered or param changed -> requires dictionaries to be implemented in trax / or object with proxy
    // todo: $dispose (!)
});