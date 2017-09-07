import { assert, doc } from "./common";
import { htmlRenderer } from "../htmlrenderer";
import { VdRenderer } from "../vdom";
import { $component, $refreshSync } from "../iv";

describe('Class Components', () => {
    let OPTIONS = { indent: "        ", isRoot: true, showUid: false },
        OPTIONS_UID = { indent: "        ", isRoot: true, showUid: true };

    class Label {
        props: {
            value: string
        }
        initValue = "";

        render(r: VdRenderer) {
            `---
            <span class="label">
                {{this.props.value || this.initValue}}
            </span> 
            ---`
        }
    }
    let label = $component(Label);

    class Label2 extends Label {
        init() {
            // props have already been set at this point
            this.initValue = this.props.value;
        }
    }
    let label2 = $component(Label2);

    let box = $component(class {
        props: {
            size: number,
            text: string
        }
        lastSize = -1;
        txt = "";

        shouldUpdate() {
            // only update if the size changed since last display
            return (this.lastSize !== this.props.size);
        }

        render(r: VdRenderer) {
            `---
            % this.lastSize = this.props.size;
            % let sz = this.props.size || 100;
            <span [a:class]=("box"+sz) onclick()=this.update()>
                {{this.props.text}}{{this.txt}}
            </span> 
            ---`
        }

        update() {
            this.txt = (this.txt === "") ? "1" : "" + (parseInt(this.txt, 10) + 1);
            $refreshSync(this);
        }
    });

    it('should support no init()', () => {

        function test(r: VdRenderer, txt1, txt2) {
            `---
            <div>
                Label 1: <c:label [value]=txt1/>
            </div>
            <div>
                Label 2: <c:label [value]=txt2/>
            </div> 
             ---`
        }

        doc.resetUid();
        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        r.refresh({ txt1: "a", txt2: 123 });
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <div::E3>
                    <#text::T4> Label 1: </#text>
                    <span::E5 class="label">
                        <#text::T6>a</#text>
                    </span>
                </div>
                <div::E7>
                    <#text::T8> Label 2: </#text>
                    <span::E9 class="label">
                        <#text::T10>123</#text>
                    </span>
                </div>
            </div>
        `, "initial refresh");

        r.refresh({ txt1: "b", txt2: 456 });
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <div::E3>
                    <#text::T4> Label 1: </#text>
                    <span::E5 class="label">
                        <#text::T6>b</#text>
                    </span>
                </div>
                <div::E7>
                    <#text::T8> Label 2: </#text>
                    <span::E9 class="label">
                        <#text::T10>456</#text>
                    </span>
                </div>
            </div>
        `, "update 1");
    });

    it('should support init()', () => {

        function test(r: VdRenderer, txt1, txt2, txt3) {
            `---
            <c:label2 [value]=txt1/>
            <c:label2 [value]=txt2/>
            <c:label2 [value]=txt3/>
             ---`
        }

        doc.resetUid();
        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        r.refresh({ txt1: "i1", txt3: "i3" });
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <span::E3 class="label">
                    <#text::T4>i1</#text>
                </span>
                <span::E5 class="label">
                    <#text::T6></#text>
                </span>
                <span::E7 class="label">
                    <#text::T8>i3</#text>
                </span>
            </div>
        `, "initial refresh");

        r.refresh({ txt1: "b" });
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <span::E3 class="label">
                    <#text::T4>b</#text>
                </span>
                <span::E5 class="label">
                    <#text::T6></#text>
                </span>
                <span::E7 class="label">
                    <#text::T8>i3</#text>
                </span>
            </div>
        `, "update 1");

    });

    it('should support shouldUpdate()', () => {

        function test(r: VdRenderer, sz1, txt1, sz2, txt2) {
            `---
            <c:box [size]=sz1 [text]=txt1/>
            <c:box [size]=sz2 [text]=txt2/>
             ---`
        }

        doc.resetUid();
        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        r.refresh({ sz1: 10, txt1: "init1", sz2: 20, txt2: "init2" });
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <span::E3 CLASS="box10" onclick=[function]>
                    <#text::T4>init1</#text>
                </span>
                <span::E5 CLASS="box20" onclick=[function]>
                    <#text::T6>init2</#text>
                </span>
            </div>
        `, "initial refresh");

        r.refresh({ sz1: 10, txt1: "update11", sz2: 30, txt2: "update12" });
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <span::E3 CLASS="box10" onclick=[function]>
                    <#text::T4>init1</#text>
                </span>
                <span::E5 CLASS="box30" onclick=[function]>
                    <#text::T6>update12</#text>
                </span>
            </div>
        `, "update 1");

    });

    it('should support event handlers and $refreshSync()', () => {

        function test(r: VdRenderer, sz1, txt1, sz2, txt2) {
            `---
            <c:box [size]=sz1 [text]=txt1/>
            <c:box [size]=sz2 [text]=txt2/>
             ---`
        }

        doc.resetUid();
        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        r.refresh({ sz1: 10, txt1: "init1", sz2: 20, txt2: "init2" });
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <span::E3 CLASS="box10" onclick=[function]>
                    <#text::T4>init1</#text>
                </span>
                <span::E5 CLASS="box20" onclick=[function]>
                    <#text::T6>init2</#text>
                </span>
            </div>
        `, "initial refresh");

        (<any>r).vdom.domNode.childNodes[0].click();
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <span::E3 CLASS="box10" onclick=[function]>
                    <#text::T4>init11</#text>
                </span>
                <span::E5 CLASS="box20" onclick=[function]>
                    <#text::T6>init2</#text>
                </span>
            </div>
        `, "update 1");

        (<any>r).vdom.domNode.childNodes[0].click();
        assert.equal(div.stringify(OPTIONS_UID), `
            <div::E1>
                <span::E3 CLASS="box10" onclick=[function]>
                    <#text::T4>init12</#text>
                </span>
                <span::E5 CLASS="box20" onclick=[function]>
                    <#text::T6>init2</#text>
                </span>
            </div>
        `, "update 2");

    });


});