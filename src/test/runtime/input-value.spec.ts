import * as assert from 'assert';
import { template, logger } from '../../iv';
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

    it("should work on text inputs", async function () {
        const tpl = template(`(user:User) => {
            <input #field type="text" @value={=user.firstName}/>
        }`, value);

        const usr = new User();
        usr.firstName = "Homer";

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" value="Homer"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.firstName = "Marge";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" value="Marge"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the field
        const field = t.query("#field") as ElementNode;
        editElt(field, "Bart", false, true);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" value="Bart"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.firstName, "Bart", "4");
    });

    it("should work on text inputs with input events", async function () {
        const tpl = template(`(user:User) => {
            <input #field type="text" @value(data={=user.firstName} events="input")/>
        }`, value);

        const usr = new User();
        usr.firstName = "Homer";

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" value="Homer"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.firstName = "Marge";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" value="Marge"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the field
        const field = t.query("#field") as ElementNode;
        editElt(field, "!!!", true, false);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" value="Marge!!!"/>
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
        const tpl = template(`(user:User) => {
            <input #field type="text" @value(data={=user.firstName} {input2data} {data2input})/>
        }`, value);

        const usr = new User();
        usr.firstName = "Homer";

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" value="::Homer"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.firstName = "Marge";
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" value="::Marge"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the field
        const field = t.query("#field") as ElementNode;
        editElt(field, "::Bart", false, true);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" value="::Bart"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.firstName, "Bart", "4");
    });

    it("should work on checkboxes", async function () {
        const tpl = template(`(user:User) => {
            <input #cb type="checkbox" @value={=user.checked}/>
        }`, value);

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
        const tpl = template(`(user:User) => {
            <input #field type="number" @value={=user.age}/>
        }`, value);

        const usr = new User();
        usr.firstName = "Homer";
        usr.age = 42;

        const t = getTemplate(tpl, body).render({ user: usr });
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="number" value="42"/>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr);

        // change the data
        usr.age = 43;
        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="number" value="43"/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the checkbox
        const field = t.query("#field") as ElementNode;
        editElt(field, 44, false, true);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="number" value="44"/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.age, 44, "4");
    });

    it("should work on radio buttons", async function () {
        const tpl = template(`(user:User) => {
            for (let g of ["M", "F", "N"]) {
                <input #rb type="radio" name="gender" value={g} @value={=user.gender}/>
            }
        }`, value);

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

    it("will raise an error if @value is not used on an input element", function () {
        const usr = new User();
        usr.firstName = "Homer";

        const tpl1 = template(`(user:User) => {
            <div @value={=user.firstName}>
                # Hello #
            </div>
        }`);

        getTemplate(tpl1, body).render({ user: usr });

        assert.equal(error, `\
            IVY: @value $init hook execution error
            @value can only be used on input elements
            >> Template: "tpl1" - File: "runtime/input-value.spec.ts"`
            , "1");

        error = "";
    });

    it("will raise an error if @value is used with an unsupported input type", function () {
        const usr = new User();
        usr.firstName = "Homer";

        const tpl1 = template(`(user:User) => {
            <input type="button" @value={=user.firstName}/>
        }`);

        getTemplate(tpl1, body).render({ user: usr });

        assert.equal(error, `\
            IVY: @value $init hook execution error
            Invalid input type 'button': @value can only be used on types 'text', 'radio', 'checkbox', 'number'
            >> Template: "tpl1" - File: "runtime/input-value.spec.ts"`
            , "1");

        error = "";
    });

    it("will raise an error if the data property is invalid", function () {
        const usr = new User();
        usr.firstName = "Homer";

        const tpl1 = template(`(user:User) => {
            <input type="button" @value(data={=user.foobar})/>
        }`);

        getTemplate(tpl1, body).render({ user: usr });

        assert.equal(error, `\
            IVY: Invalid property: 'foobar'
            >> Template: "tpl1" - File: "runtime/input-value.spec.ts"
            IVY: data property is required for @value
            >> Template: "tpl1" - File: "runtime/input-value.spec.ts"`
            , "1");

        error = "";
    });

});
