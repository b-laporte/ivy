
import { assert, doc } from "./common";
import { htmlRenderer } from "../htmlrenderer";
import { $component } from "../iv";

describe('Maps in props', () => {
    let OPTIONS = { indent: "        ", isRoot: true, showUid: false },
        OPTIONS_UID = { indent: "        ", isRoot: true, showUid: true };

    let box = $component(class {
        props: {
            $content: any;
            style: {}
        }

        render() {
            `---
            % let content = this.props.$content;
            <span [style]=this.props.style>
                <ins:content/>
            </span> 
            ---`
        }
    });

    let box2 = $component(class {
        props: {
            $content: any;
            className: {}
        }

        render() {
            `---
            % let content = this.props.$content;
            <span [className]=this.props.className>
                <ins:content/>
            </span> 
            ---`
        }
    });

    it('should be supported on element style', () => {
        function test(color, width) {
            `---
            <div style.borderColor=color [style.borderWidth]=width+"px"> 
                hello
            </div>
             ---`
        }

        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        r.refresh({ color: "#FFFFFF", width: 1 });
        assert.equal(div.stringify(OPTIONS), `
            <div>
                <div style="borderColor:#FFFFFF;borderWidth:1px">
                    <#text> hello </#text>
                </div>
            </div>
        `, "initial refresh");

        let vnd = (<any>r).vdom.children[0];
        assert.equal(vnd.props.style.$isMap, true, "$isMap");
        assert.equal(vnd.props.style.borderColor, "#FFFFFF", "borderColor 1");
        assert.equal(vnd.props.style.borderWidth, "1px", "borderWidth 1");

        r.refresh({ color: "#000000", width: 3 });
        assert.equal(div.stringify(OPTIONS), `
            <div>
                <div style="borderColor:#FFFFFF;borderWidth:3px">
                    <#text> hello </#text>
                </div>
            </div>
        `, "update 1");
    });

    it('should be supported on element className', () => {
        function test(nbr) {
            `---
            <div className.foo=(nbr===1) [className.bar]=(nbr===2) className.baz=1> 
                hello
            </div>
             ---`
        }

        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        r.refresh({ nbr: 1 });
        assert.equal(div.stringify(OPTIONS), `
            <div>
                <div class="foo baz">
                    <#text> hello </#text>
                </div>
            </div>
        `, "initial refresh");

        r.refresh({ nbr: 2 });
        assert.equal(div.stringify(OPTIONS), `
            <div>
                <div class="foo baz bar">
                    <#text> hello </#text>
                </div>
            </div>
        `, "update 1");

        r.refresh({ nbr: 3 });
        assert.equal(div.stringify(OPTIONS), `
            <div>
                <div class="foo baz">
                    <#text> hello </#text>
                </div>
            </div>
        `, "update 2");

    });

    it('should be supported on component style', () => {
        function test(color, width) {
            `---
            <section> 
                <c:box style.borderColor=color [style.borderWidth]=width+"px"> Hello </c:box>
            </section>
             ---`
        }

        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        r.refresh({ color: "#FFFFFF", width: 1 });
        assert.equal(div.stringify(OPTIONS), `
            <div>
                <section>
                    <span style="borderColor:#FFFFFF;borderWidth:1px">
                        <#text> Hello </#text>
                    </span>
                </section>
            </div>
        `, "initial refresh");

        r.refresh({ color: "#000000", width: 3 });
        assert.equal(div.stringify(OPTIONS), `
            <div>
                <section>
                    <span style="borderColor:#FFFFFF;borderWidth:3px">
                        <#text> Hello </#text>
                    </span>
                </section>
            </div>
        `, "update 1");
    });

    it('should be supported on component className', () => {
        function test(isFoo, val) {
            `---
            <section> 
                <c:box> Hello </c:box>
                <c:box2 className.foo=isFoo [className.bar]=(val==="ok")> Hello 2 </c:box2>
            </section>
             ---`
        }

        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        debugger
        r.refresh({ isFoo: true, val:"ko" });
        assert.equal(div.stringify(OPTIONS), `
            <div>
                <section>
                    <span>
                        <#text> Hello </#text>
                    </span>
                    <span class="foo">
                        <#text> Hello 2 </#text>
                    </span>
                </section>
            </div>
        `, "initial refresh");

        r.refresh({ isFoo: true, val:"ok" });
        assert.equal(div.stringify(OPTIONS), `
            <div>
                <section>
                    <span>
                        <#text> Hello </#text>
                    </span>
                    <span class="foo bar">
                        <#text> Hello 2 </#text>
                    </span>
                </section>
            </div>
        `, "update 1");
    });
});
