import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';
import { Data, changeComplete } from '../../trax/trax';

describe('State', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    @Data class MyState {
        text: string = "Hello";
    }

    it("should be supported on template with no params", async function () {
        let state: any = null;

        const tpl = template(`($state: MyState) => {
            state = $state;
            <div>
                # Text = {$state.text} #
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Text = Hello #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        assert.equal(state!.text, "Hello", "state.text==='Hello'");
        state!.text = "Hello again!";

        await changeComplete(state);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Text = Hello again! # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should be supported on template with params", async function () {
        let state: any = null, params: any = null;

        const tpl = template(`(count:number=0, $state: MyState, $params) => {
            state = $state;
            params = $params;
            <div>
                # {$state.text}/{count} #
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello/0 #
                </div>
                //::C2 template anchor
            </body>
        `, '1');


        state!.text = "Hello 2";

        await changeComplete(state);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello 2/0 # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        params!.count++;

        await changeComplete(params);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello 2/1 # (2)
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        params!.count++;
        state!.text = "Hello 3";

        await changeComplete(params);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello 3/2 # (3)
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });
});
