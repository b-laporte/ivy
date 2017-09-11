import { assert, doc } from "./common";
import { htmlRenderer } from "../htmlrenderer";
import { $component, $refresh, $iv } from "../iv";
import { VdGroupNode } from "../vdom";

describe('Async $refresh', () => {
    let OPTIONS = { indent: "        ", isRoot: true, showUid: false },
        OPTIONS_UID = { indent: "        ", isRoot: true, showUid: true };

    let box = $component(class {
        props: {
            size: number,
            text: string
        }
        lastSize = -1;

        shouldUpdate() {
            // never refresh, except through internal $refresh()
            return false;
        }

        render() {
            `---
            % let sz = this.props.size || 100;
            <span [a:class]=("box"+sz) onclick()=this.update()>
                {{this.props.text}}
            </span> 
            ---`
        }

        async update() {
            this.props.text += "+";
            return $refresh(this);
        }
    });

    it('should only refresh once and should bypass shouldRefresh()', async function () {
        function test(txt) {
            `---
            <c:box size=100 [text]=txt/>
             ---`
        }

        doc.resetUid();
        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        r.refresh({ txt: "ABC" });
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <span::E3 CLASS="box100" onclick=[function]>
                    <#text::T4>ABC</#text>
                </span>
            </div>
        `, "initial refresh");

        let boxCpt = (<any>r).vdom.children[0].cpt,
            txt1 = boxCpt.props.text,
            rc1 = $iv.refreshCount,
            lr1 = boxCpt.$node.$lastRefresh;

        assert.equal(txt1, "ABC", "text before update");

        // update twice
        boxCpt.update();        // refresh requested, but no actual refresh
        boxCpt.update();
        await boxCpt.update();  // 2nd refresh request + wait for actual refresh completion

        let txt2 = boxCpt.props.text,
            rc2 = $iv.refreshCount,
            lr2 = boxCpt.$node.$lastRefresh;

        assert.equal(txt2, "ABC+++", "text after the 3 updates");
        assert.equal(lr2, lr1 + 1, "only one refresh");

        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <span::E3 CLASS="box100" onclick=[function]>
                    <#text::T4>ABC+++</#text>
                </span>
            </div>
        `, "initial refresh");

    });

    let container = $component(class {
        props: {
            size: number
        }

        render() {
            `---
            % let sz = this.props.size || 100
            <div [a:class]=("container"+sz)>
                <c:child [name]=("Arthur"+sz)/>
                <c:child [name]=("Slartibartfast"+sz)/>
            </div> 
            ---`
        }

        update() {
            this.props.size++;
            $refresh(this);
        }
    });

    let child = $component(class {
        props: {
            name: string
        }
        text = "";

        render() {
            `---
            <div a:class="child">
                {{this.props.name}}{{this.text}}
            </div> 
            ---`
        }

        update() {
            this.text += "+";
            $refresh(this);
        }
    });

    it('should not refresh child components multiple times if already refreshed by their parents', async function () {
        function test() {
            `---
            <c:container size=900/>
             ---`
        }

        doc.resetUid();
        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);
        r.refresh();
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <div::E3 CLASS="container900">
                    <div::E4 CLASS="child">
                        <#text::T5>Arthur900</#text>
                    </div>
                    <div::E6 CLASS="child">
                        <#text::T7>Slartibartfast900</#text>
                    </div>
                </div>
            </div>
        `, "initial refresh");

        let rc = $iv.refreshCount;
        await $refresh(); // flush the refresh queue, should do nohting here
        assert.equal($iv.refreshCount, rc, "no refresh");

        let containerCpt = (<any>r).vdom.children[0].cpt,
            childCpt1 = (<any>r).vdom.children[0].children[0].children[0].cpt,
            childCpt2 = (<any>r).vdom.children[0].children[0].children[1].cpt;
        
        childCpt1.update();
        containerCpt.update();
        childCpt1.update();
        await $refresh();
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <div::E3 CLASS="container901">
                    <div::E4 CLASS="child">
                        <#text::T5>Arthur901++</#text>
                    </div>
                    <div::E6 CLASS="child">
                        <#text::T7>Slartibartfast901</#text>
                    </div>
                </div>
            </div>
        `, "update 1");

        assert.equal(containerCpt.$node.$lastRefresh, rc + 1, "one component refresh");
        assert.equal(childCpt1.$node.$lastRefresh, rc + 1, "one child refresh");
        assert.equal(childCpt2.$node.$lastRefresh, rc + 1, "one child refresh");
    });

});