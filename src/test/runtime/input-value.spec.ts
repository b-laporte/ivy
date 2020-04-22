import * as assert from 'assert';
import { $template, logger } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, editElt } from '../utils';
import { Data, changeComplete } from '../../trax';
import { value } from '../../iv/inputs';

describe('@value', () => {
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
        error = "";
    });

    afterEach(() => {
        if (error) {
            console.log("Unchecked error:\n", error);
        }
        logger.error = defaultLog;
    });

    @Data class User {
        firstName: string;
        lastName: string;
        gender: string;
        checked: boolean;
        age: number;
    }

    @Data class Range {
        min: number;
        max: number;
        value: number;
    }

    it("should work on text inputs", async function () {
        const tpl = $template`(user:User) => {
            <input #field type="text" @value={=user.firstName}/>
        }`;

        const usr = new User();
        usr.firstName = "Homer";

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" a:value="Homer"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.firstName = "Marge";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" a:value="Marge"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the field
        const field = t.query("#field") as ElementNode;
        editElt(field, "Bart", false, true);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" a:value="Bart"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.firstName, "Bart", "4");
    });

    it("should work on text inputs with input events", async function () {
        const tpl = $template`(user:User) => {
            <input #field type="text" @value={=user.firstName}/>
        }`;

        const usr = new User();
        usr.firstName = "Homer";

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" a:value="Homer"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.firstName = "Marge";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" a:value="Marge"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the field
        const field = t.query("#field") as ElementNode;
        editElt(field, "!!!", true, false);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" a:value="Marge!!!"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.firstName, "Marge!!!", "4");
    });

    it("should support input2data and data2input", async function () {
        function input2data(v: any) {
            return ("" + v).replace(/^\:\:/i, "");
        }
        function data2input(d: any) {
            return "::" + d;
        }
        const tpl = $template`(user:User) => {
            <input #field type="text" @value(data={=user.firstName} {input2data} {data2input})/>
        }`;

        const usr = new User();
        usr.firstName = "Homer";

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" a:value="::Homer"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.firstName = "Marge";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" a:value="::Marge"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the field
        const field = t.query("#field") as ElementNode;
        editElt(field, "::Bart", false, true);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" a:value="::Bart"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.firstName, "Bart", "4");
    });

    it("should work on textareas", async function () {
        const tpl = $template`(user:User) => {
            <textarea #ta @value={=user.firstName}/>
        }`;

        const usr = new User();
        usr.firstName = "Homer";

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <textarea::E3 a:value="Homer"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.firstName = "Marge";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <textarea::E3 a:value="Marge"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the field
        const ta = t.query("#ta") as ElementNode;
        editElt(ta, "!!!", true, false);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <textarea::E3 a:value="Marge!!!"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.firstName, "Marge!!!", "4");
    });

    it("should work on select elements", async function () {
        @Data class FormData {
            color: string;
        }
        const tpl = $template`(data:FormData) => {
            <select #sel @value={=data.color}>
                <option value="R"> Red </>
                <option value="G"> Green </>
                <option value="B"> Blue </>
                <option value="W"> White </>
            </>
        }`;

        const d = new FormData();
        d.color = "B";

        const t = getTemplate(tpl, body).render({ data: d });
        assert.equal(stringify(t), `
            <body::E1>
                <select::E3 a:value="B">
                    <option::E4 a:value="R">
                        #::T5 Red #
                    </option>
                    <option::E6 a:value="G">
                        #::T7 Green #
                    </option>
                    <option::E8 a:value="B">
                        #::T9 Blue #
                    </option>
                    <option::E10 a:value="W">
                        #::T11 White #
                    </option>
                </select>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(d);

        // change the data
        d.color = "G";
        await changeComplete(d);
        assert.equal(stringify(t), `
            <body::E1>
                <select::E3 a:value="G">
                    <option::E4 a:value="R">
                        #::T5 Red #
                    </option>
                    <option::E6 a:value="G">
                        #::T7 Green #
                    </option>
                    <option::E8 a:value="B">
                        #::T9 Blue #
                    </option>
                    <option::E10 a:value="W">
                        #::T11 White #
                    </option>
                </select>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the field
        const sel = t.query("#sel") as ElementNode;
        editElt(sel, "W", true, false);
        await changeComplete(d);
        assert.equal(stringify(t), `
            <body::E1>
                <select::E3 a:value="W">
                    <option::E4 a:value="R">
                        #::T5 Red #
                    </option>
                    <option::E6 a:value="G">
                        #::T7 Green #
                    </option>
                    <option::E8 a:value="B">
                        #::T9 Blue #
                    </option>
                    <option::E10 a:value="W">
                        #::T11 White #
                    </option>
                </select>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(d.color, "W", "4");
    });

    it("should work on checkboxes", async function () {
        const tpl = $template`(user:User) => {
            <input #cb type="checkbox" @value={=user.checked}/>
        }`;

        const usr = new User();
        usr.firstName = "Homer";
        usr.checked = true;

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="checkbox" checked="true"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.checked = false;
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="checkbox" checked="false"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the checkbox
        const cb = t.query("#cb") as ElementNode;
        editElt(cb, true, false, true);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="checkbox" checked="true"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.checked, true, "4");
    });

    it("should work on numbers", async function () {
        const tpl = $template`(user:User) => {
            <input #field type="number" @value={=user.age}/>
        }`;

        const usr = new User();
        usr.firstName = "Homer";
        usr.age = 42;

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="number" a:value="42"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.age = 43;
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="number" a:value="43"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the checkbox
        const field = t.query("#field") as ElementNode;
        editElt(field, 44, false, true);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="number" a:value="44"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.age, 44, "4");
    });

    it("should work on radio buttons", async function () {
        const tpl = $template`(user:User) => {
            $for (let g of ["M", "F", "N"]) {
                <input #rb type="radio" name="gender" value={g} @value={=user.gender}/>
            }
        }`;

        const usr = new User();
        usr.firstName = "Homer";
        usr.gender = "M";

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="radio" a:name="gender" a:value="M" checked="true"/>
                <input::E4 a:type="radio" a:name="gender" a:value="F" checked="false"/>
                <input::E5 a:type="radio" a:name="gender" a:value="N" checked="false"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.gender = "F";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="radio" a:name="gender" a:value="M" checked="false"/>
                <input::E4 a:type="radio" a:name="gender" a:value="F" checked="true"/>
                <input::E5 a:type="radio" a:name="gender" a:value="N" checked="false"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the checkbox
        const rbs = t.query("#rb", true) as ElementNode[];
        editElt(rbs[2], true, false, true);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="radio" a:name="gender" a:value="M" checked="false"/>
                <input::E4 a:type="radio" a:name="gender" a:value="F" checked="false"/>
                <input::E5 a:type="radio" a:name="gender" a:value="N" checked="true"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.gender, "N", "4");
    });

    it("will raise an error if @value is used on an invalid element", function () {
        const usr = new User();
        usr.firstName = "Homer";

        const tpl1 = $template`(user:User) => {
            <div @value={=user.firstName}>
                Hello
            </div>
        }`;

        getTemplate(tpl1, body).render({ user: usr });

        assert.equal(error, `\
            IVY: @value $init hook execution error
            @value can only be used on input, textarea and select elements
            >> Template: "tpl1" - File: ".../runtime/input-value.spec.ts"`
            , "1");

        error = "";
    });

    it("will raise an error if @value is used with an unsupported input type", function () {
        const usr = new User();
        usr.firstName = "Homer";

        const tpl1 = $template`(user:User) => {
        <input type="button" @value={=user.firstName}/>
    }`;

        getTemplate(tpl1, body).render({ user: usr });

        assert.equal(error, `\
            IVY: @value $init hook execution error
            Invalid input type 'button': @value can only be used on types 'text', 'radio', 'checkbox', 'number', 'range'
            >> Template: "tpl1" - File: ".../runtime/input-value.spec.ts"`
            , "1");

        error = "";
    });

    it("will raise an error if the data property is invalid", function () {
        const usr = new User();
        usr.firstName = "Homer";

        const tpl1 = $template`(user:User) => {
        <input type="button" @value(data={=user.foobar})/>
    }`;

        getTemplate(tpl1, body).render({ user: usr });

        assert.equal(error, `\
            IVY: Invalid property: 'foobar'
            >> Template: "tpl1" - File: ".../runtime/input-value.spec.ts"
            IVY: data property is required for @value
            >> Template: "tpl1" - File: ".../runtime/input-value.spec.ts"`
            , "1");

        error = "";
    });

    it("should work on range", async function () {
        let range = new Range();
        range.min = 0;
        range.max = 100;
        range.value = 42;

        const tpl = $template`(range: Range) => {
            <input #field type="range"
                min={range.min}
                max={range.max}
                @value={=range.value}/>
        }`;

        await changeComplete(range);
        const t = getTemplate(tpl, body).render({ range });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="range" a:min="0" a:max="100" a:value="42"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(range);

        // change the data
        range.value = 43;
        await changeComplete(range);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="range" a:min="0" a:max="100" a:value="43"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the checkbox
        const field = t.query("#field") as ElementNode;
        editElt(field, 44, false, true);

        await changeComplete(range);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="range" a:min="0" a:max="100" a:value="44"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(range.value, 44, "4");

        // interpret '' as 0
        editElt(field, '', false, true);
        await changeComplete(range);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="range" a:min="0" a:max="100" a:value="0"/>
                //::C2 template anchor
            </body>
        `, '5');
        assert.equal(range.value, 0, "6");
    });

    it("will raise an error if the range value is not a number", function () {
        const data = {
            value: 'a'
        };
        const tpl1 = $template`() => {
            <input type="range" @value={=data.value}/>
        }`;

        getTemplate(tpl1, body).render({});

        assert.equal(error, `\
            IVY: @value $render hook execution error
            Invalid input value 'a': value of input type range shall be an integer
            >> Template: "tpl1" - File: ".../runtime/input-value.spec.ts"`
            , "1");

        error = "";
    });

});
