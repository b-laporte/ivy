import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';

describe('Loops', () => {
    let body: ElementNode,
        names1 = ["Marge", "Homer"];

    beforeEach(() => {
        body = reset();
    });

    xit("should work for simple elements / no keys", function () {
        let tpl = template(`(names) => {
            // log
            <div>
                for (let name of names) {
                    <div> # Hello {name} # </div>
                }
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ names: names1 });
        logNodes(t, "A");
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                
                //::C2 template anchor
            </body>
        `, '1');
    });


    // for of / for let i
    // on root
    // with multiple content (implicit fragment)
    // explicit fragment
});
