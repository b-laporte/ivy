import * as assert from 'assert';
import { template, Controller, API } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';
import { changeComplete } from '../../trax/trax';

describe('Controller', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    @API class TestAPI {
        count: number = 0;
        msg = "";
    }

    @Controller class TestController {
        $api: TestAPI;
        text: string = "Hello";
    }

    it("should be supported on template with no params", async function () {
        let ctl: any = null;

        const tpl = template(`($ctl: TestController) => {
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

    it("may expose an api (1)", async function () {
        let ctl: any = null, api: any = null;

        const tpl = template(`($ctl: TestController) => {
            ctl = $ctl;
            api = $ctl.$api;
            <div>
                # {$ctl.text}/{api.count} #
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

        api!.count++;

        await changeComplete(api);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello 2/1 # (2)
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        api!.count++;
        ctl!.text = "Hello 3";

        await changeComplete(api);
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello 3/2 # (3)
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("may expose an api (2)", async function () {
        let ctl: any = null, api: any = null;

        const widget = template(`($ctl: TestController) => {
            let api = $ctl.$api;
            <div>
                # {$ctl.text}/{api.msg}/{api.count} #
            </div>
        }`);

        const tpl = template(`(msg="[Message]", count=42) => {
            <*widget count={count} msg={msg}/>
        }`);

        let t = getTemplate(tpl, body).refresh();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello/[Message]/42 #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ count: 123, msg: "Welcome" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello/Welcome/123 # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });
});