import * as assert from 'assert';
import { template, API, defaultValue, required, IvElement, decorator, io, Controller } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes, testData } from '../utils';
import { Data, changeComplete } from '../../trax';

describe('Bindings', () => {
    let body: ElementNode, changeTitle: undefined | ((newTitle: string) => Title);

    beforeEach(() => {
        body = reset();
        changeTitle = undefined;
    });

    @Data class Name {
        firstName: string;
        lastName: string;
    }

    @Data class User {
        alias: string;
        name: Name;
    }

    @API class Title {
        @io @defaultValue text: string = "";
        prefix = "";
        suffix = "";
        $targetApi?: Object;
        @required $targetElt: IvElement;
        changeTitle: (newTitle: string) => void;
    }
    const title = decorator(Title, (api: Title) => {
        return {
            $init() {
                // changeTitle needs to be global as we cannot set a label on a decorator
                // when defaultValue property is used (e.g. @title={=a.b})
                changeTitle = api.changeTitle = (newTitle: string) => {
                    // push the change for potential bindings
                    api.text = newTitle + "!";
                    return api;
                }
            },
            $render() {
                if (api.text === "") {
                    api.$targetElt.setAttribute("title", "[NO TITLE]");
                } else {
                    api.$targetElt.setAttribute("title", api.prefix + api.text + api.suffix);
                }
            }
        }
    });

    @Data class EditorInput {
        @io inputValue: string;
    }
    @API class Editor {
        @io text: string;
        input?: EditorInput;
        changeText: (newTitle: string) => void;
        getText: () => string;
    }
    @Controller class EditorCtl {
        $api: Editor;

        $init() {
            let api = this.$api;
            api.changeText = (newText: string) => {
                if (api.input) {
                    api.input.inputValue = newText + "!";
                } else {
                    api.text = newText + "!";
                }
            }

            api.getText = () => {
                if (api.input) {
                    return api.input.inputValue;
                }
                return api.text;
            }
        }
    }
    const editor = template(`($ctl: EditorCtl) => {
        <div class="editor">
            #>> {$ctl.$api.getText()} <<#
        </>
    }`);

    const section = template(`($content:IvContent, visible=true) => {
        if (visible) {
            <div class="section" @content/>
        }
    }`);

    it("can be set on decorators with default value", async function () {
        const tpl = template(`(user:User) => {
            <div @title={=user.alias}>
                # Hello {user.alias} #
            </div>
        }`);

        let usr = new User();
        usr.alias = "Alan";
        let t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="Alan">
                    #::T4 Hello Alan #
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr); // should be marked as done when render is finished

        // change data
        usr.alias = "Laurence";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="Laurence"(1)>
                    #::T4 Hello Laurence # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        // change title
        let api = changeTitle!("Alexandre");
        await changeComplete(api);
        assert.equal(usr.alias, "Alexandre!", "3");
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="Alexandre!"(2)>
                    #::T4 Hello Alexandre! # (2)
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be set on decorators with default value (long data path)", async function () {
        const tpl = template(`(user:User) => {
            <div @title={=user.name.firstName}>
                # Hello {user.name.firstName} #
            </div>
        }`);

        let usr = new User();
        usr.alias = "Al";
        usr.name.firstName = "Alan";
        usr.name.lastName = "T";

        let t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="Alan">
                    #::T4 Hello Alan #
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr); // should be marked as done when render is finished

        // change property holder (here: usr.name)
        usr.name = new Name();
        usr.name.firstName = "Laurence";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="Laurence"(1)>
                    #::T4 Hello Laurence # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        // change title
        let api = changeTitle!("Alexandre");
        await changeComplete(api);
        assert.equal(usr.name.firstName, "Alexandre!", "3");
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="Alexandre!"(2)>
                    #::T4 Hello Alexandre! # (2)
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be set on decorators with multiple params", async function () {
        const tpl = template(`(user:User) => {
            <div @title(text={=user.alias} prefix=">>")>
                # Hello {user.alias} #
            </div>
        }`);

        let usr = new User();
        usr.alias = "Alan";
        let t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title=">>Alan">
                    #::T4 Hello Alan #
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr); // should be marked as done when render is finished

        // change data
        usr.alias = "Laurence";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title=">>Laurence"(1)>
                    #::T4 Hello Laurence # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        // change title
        let api = changeTitle!("Alexandre");
        await changeComplete(api);
        assert.equal(usr.alias, "Alexandre!", "3");
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title=">>Alexandre!"(2)>
                    #::T4 Hello Alexandre! # (2)
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be set on components", async function () {
        const tpl = template(`(user:User) => {
            <*editor #edi text={=user.alias} />
        }`);

        let usr = new User();
        usr.alias = "Alan";
        let t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="editor">
                    #::T4>> Alan <<#
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr); // should be marked as done when render is finished

        // change data
        usr.alias = "Laurence";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="editor">
                    #::T4>> Laurence <<# (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');
        await changeComplete(usr);

        // change text
        let edi = t.query("#edi") as Editor;
        edi.changeText("Alexandre");
        await changeComplete(edi);
        assert.equal(usr.alias, "Alexandre!", "3");
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="editor">
                    #::T4>> Alexandre! <<# (2)
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be set on components w/ param nodes (@paramValue)", async function () {
        const tpl = template(`(user:User) => {
            <*editor #edi>
                <.text @paramValue={=user.alias}/>
            </>
        }`);

        let usr = new User();
        usr.alias = "Alan";
        let t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="editor">
                    #::T4>> Alan <<#
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr); // should be marked as done when render is finished

        // change data
        usr.alias = "Laurence";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="editor">
                    #::T4>> Laurence <<# (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');
        await changeComplete(usr);

        // change text
        let edi = t.query("#edi") as Editor;
        edi.changeText("Alexandre");
        await changeComplete(edi);
        assert.equal(usr.alias, "Alexandre!", "3");
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="editor">
                    #::T4>> Alexandre! <<# (2)
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be set on components w/ param nodes (param)", async function () {
        const tpl = template(`(user:User) => {
            <*editor #edi>
                <.input inputValue={=user.alias}/>
            </>
        }`);

        let usr = new User();
        usr.alias = "Alan";
        let t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="editor">
                    #::T4>> Alan <<#
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr); // should be marked as done when render is finished

        // change data
        usr.alias = "Laurence";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="editor">
                    #::T4>> Laurence <<# (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');
        await changeComplete(usr);

        // change text
        let edi = t.query("#edi") as Editor;
        edi.changeText("Alexandre");
        await changeComplete(edi);
        assert.equal(usr.alias, "Alexandre!", "3");
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="editor">
                    #::T4>> Alexandre! <<# (2)
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be set on deferred decorators with default value", async function () {
        const tpl = template(`(user:User, visible=true) => {
            <*section {visible}>
                <div @title={=user.alias}>
                    # Hello {user.alias} #
                </>
            </>
        }`);

        let usr = new User();
        usr.alias = "Alan";
        let t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:title="Alan">
                        #::T5 Hello Alan #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr); // should be marked as done when render is finished

        // change data
        usr.alias = "Laurence";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:title="Laurence"(1)>
                        #::T5 Hello Laurence # (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        // change title
        let api = changeTitle!("Alexandre");
        await changeComplete(api);
        assert.equal(usr.alias, "Alexandre!", "3");
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:title="Alexandre!"(2)>
                        #::T5 Hello Alexandre! # (2)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be set on deferred components", async function () {
        const tpl = template(`(user:User) => {
            <*section>
                <*editor #edi text={=user.alias} />
            </>
        }`);

        let usr = new User();
        usr.alias = "Alan";
        let t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:class="editor">
                        #::T5>> Alan <<#
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr); // should be marked as done when render is finished

        // change data
        usr.alias = "Laurence";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:class="editor">
                        #::T5>> Laurence <<# (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
        await changeComplete(usr);

        // change text
        let edi = t.query("#edi") as Editor;
        edi.changeText("Alexandre");
        await changeComplete(edi);
        assert.equal(usr.alias, "Alexandre!", "3");
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:class="editor">
                        #::T5>> Alexandre! <<# (2)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("can be set on deferred components w/ param nodes (param)", async function () {
        const tpl = template(`(user:User) => {
            <*section>
                <*editor #edi>
                    <.input inputValue={=user.alias}/>
                </>
            </>
        }`);

        let usr = new User();
        usr.alias = "Alan";
        let t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:class="editor">
                        #::T5>> Alan <<#
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr); // should be marked as done when render is finished

        // change data
        usr.alias = "Laurence";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:class="editor">
                        #::T5>> Laurence <<# (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
        await changeComplete(usr);

        // change text
        let edi = t.query("#edi") as Editor;
        edi.changeText("Alexandre");
        await changeComplete(edi);
        assert.equal(usr.alias, "Alexandre!", "3");
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:class="editor">
                        #::T5>> Alexandre! <<# (2)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    // error: binding expression on a non @io param

});
