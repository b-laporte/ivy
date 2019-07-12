import * as assert from 'assert';
import { template, Controller } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';
import { changeComplete } from '../../trax/trax';

describe('Controller', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    @Controller class ControllerA {
        text: string = "Hello";
    }

    it("should be supported on template with no params", async function () {
        let ctl: any = null;

        const tpl = template(`($ctl: ControllerA) => {
            ctl = $ctl;
            <div>
                # Text = {$ctl.text} #
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

        assert.equal(ctl!.text, "Hello", "ctl.text==='Hello'");
        ctl!.text = "Hello again!";

        await changeComplete(ctl);
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
        let ctl: any = null, params: any = null;

        const tpl = template(`(count:number=0, $ctl: ControllerA, $params) => {
            ctl = $ctl;
            params = $params;
            <div>
                # {$ctl.text}/{count} #
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


        ctl!.text = "Hello 2";

        await changeComplete(ctl);
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
        ctl!.text = "Hello 3";

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
