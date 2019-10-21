import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, editElt } from '../utils';
import { Data, changeComplete } from '../../trax';
import { value } from '../../iv/inputs';

describe('@value', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    @Data class User {
        firstName: string;
    }

    it("should work on text inputs - no debounce", async function () {
        let tpl = template(`(user:User) => {
            <input #field type="text" @value(data={=user.firstName} debounce=0)/>
        }`);

        let usr = new User();
        usr.firstName = "Homer";

        let t = getTemplate(tpl, body).render({ user: usr });
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
                <input::E3 a:type="text" a:value="Marge"(1)/>
                //::C2 template anchor
            </body>
        `, '2');

        // edit the field
        let field = t.query("#field") as ElementNode;
        editElt(field, "Bart", false, true);

        await changeComplete(usr);
        assert.equal(stringify(t), `
            <body::E1>
                <input::E3 a:type="text" a:value="Bart"(7)/>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(usr.firstName, "Bart", "4");
    });

    // events, debounce, input2data, data2input
    // todo: errors
    // types: "text", "radio", "checkbox", "number"

});
