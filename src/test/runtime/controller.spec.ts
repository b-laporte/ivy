import * as assert from 'assert';
import { template, Controller, API } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';
import { changeComplete, computed } from '../../trax/trax';
import { IvTemplate } from '../../iv/types';

describe('Controller', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    @API class TestAPI {
        count: number = 0;
        msg = "";

        @computed get description() {
            return "msg = " + this.msg + " / count = " + this.count;
        }
    }

    @Controller class TestController {
        $api: TestAPI;
        text: string = "Hello";
        $template: IvTemplate;

        @computed get description() {
            return "text = " + this.text + " / count = " + this.$api.count;
        }
    }

    it("should be supported on template with no params", async function () {
        let ctl: any = null;

        const tpl = template(`($ctl: TestController) => {
            ctl = $ctl;
            <div>
                # Text = {$ctl.text} #
            </div>
        }`);

        let t = getTemplate(tpl, body).render();
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

        let t = getTemplate(tpl, body).render();
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

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello/[Message]/42 #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ count: 123, msg: "Welcome" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 Hello/Welcome/123 # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should support @computed properties", async function () {
        let ctl: any = null, api: any = null;

        const widget = template(`($ctl: TestController) => {
            # {$ctl.description} / {$ctl.$api.description} #
        }`);

        const tpl = template(`(msg="[Message]", count=42) => {
            <*widget count={count} msg={msg}/>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 text = Hello / count = 42 / msg = [Message] / count = 42 #
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ count: 123 });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 text = Hello / count = 123 / msg = [Message] / count = 123 # (1)
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ count: 123 });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 text = Hello / count = 123 / msg = [Message] / count = 123 # (1)
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should be able to retrieve $template", async function () {
        const tpl = template(`($ctl: TestController) => {
            let api = $ctl.$template.$api;
            <div>
                # $template.$ctl is $ctl: {$ctl === $ctl.$template.$ctl} #
                # count: {api.count} #
            </div>
        }`);

        let t = getTemplate(tpl, body).render({ count: 42 });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 $template.$ctl is $ctl: true #
                    #::T5 count: 42 #
                </div>
                //::C2 template anchor
            </body>
        `, '1');
    });

    it("should support $init / $beforeRender / $afterRender", async function () {

        @Controller class TestController2 extends TestController {
            logs: string[] = [];

            $init() {
                this.logs.push("$init " + this.$api.count);
            }
            $beforeRender() {
                this.logs.push("$beforeRender");
            }
            $afterRender() {
                this.logs.push("$afterRender");
            }
        }

        const cpt = template(`($ctl: TestController2) => {
            let api = $ctl.$template.$api;
            <div class="cpt">
                # api count: {api.count} #
                for (let log of $ctl.logs) {
                    # > {log} #
                }
            </div>
        }`);

        const tpl = template(`(count=123) => {
            <*cpt count={count}/>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="cpt">
                    #::T4 api count: 123 #
                    #::T5 > $init 123 #
                    #::T6 > $beforeRender #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ count: 42 });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="cpt">
                    #::T4 api count: 42 # (1)
                    #::T5 > $init 123 #
                    #::T6 > $beforeRender #
                    #::T7 > $afterRender #
                    #::T8 > $beforeRender #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ count: 42 });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="cpt">
                    #::T4 api count: 42 # (1)
                    #::T5 > $init 123 #
                    #::T6 > $beforeRender #
                    #::T7 > $afterRender #
                    #::T8 > $beforeRender #
                </div>
                //::C2 template anchor
            </body>
        `, '3'); // no new render
    });

    it("should define $api functions through $init", async function () {
        @API class Counter {
            count: number = 0;
            increment: (value?: number) => number; // increment the count
        }

        @Controller class CounterCtl {
            $api: Counter;
            logs: string[] = [];

            $init() {
                let $api = this.$api;
                $api.increment = (value = 1) => {
                    $api.count += value;
                    return $api.count;
                }
            }
        }

        const counter = template(`($ctl: CounterCtl) => {
            let $api = $ctl.$api;
            <div class="cpt">
                # count: {$api.count} #
            </div>
        }`);

        const tpl = template(`(count=123, $template:IvTemplate) => {
            <button #btn click()={$template.query("#cnt")!.increment(10)}/>
            <*counter #cnt count={count}/>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <button::E3/>
                <div::E4 a:class="cpt">
                    #::T5 count: 123 #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.query("#btn")!.click();
        await changeComplete(t.query("#cnt")!.$api);
        assert.equal(stringify(t), `
            <body::E1>
                <button::E3/>
                <div::E4 a:class="cpt">
                    #::T5 count: 133 # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

});