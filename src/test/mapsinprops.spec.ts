
import { assert, doc } from "./common";
import { htmlRenderer } from "../htmlrenderer";
import { VdRenderer } from "../vdom";
import { $component } from "../iv";

describe('Maps in props', () => {
    let OPTIONS = { indent: "        ", isRoot: true, showUid: false },
        OPTIONS_UID = { indent: "        ", isRoot: true, showUid: true };

    let box = $component(class {
        props: {
            $content: any;
            style: {}
        }

        render(r: VdRenderer) {
            `---
            % let content = this.props.$content;
            <span [style]=this.props.style>
                <ins:content/>
            </span> 
            ---`
        }
    });

    it('should be supported on element style', () => {
        function test(r: VdRenderer, color, width) {
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

    it('should be supported on element class', () => {
        function test(r: VdRenderer, nbr) {
            `---
            <div class.foo=(nbr===1) [class.bar]=(nbr===2) class.baz=1> 
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

    // todo: will be supported in a future PR
    // it('should be supported on component style', () => {
    //     function test(r: VdRenderer, color, width) {
    //         `---
    //         <div> 
    //             <c:box style.borderColor=color [style.borderWidth]=width+"px"> Hello </c:box>
    //         </div>
    //          ---`
    //     }

    //     let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

    //     r.refresh({ color: "#FFFFFF", width: 1 });
    //     assert.equal(div.stringify(OPTIONS), `
    //         <div>
    //             <div>
    //                 <span style="borderColor:#FFFFFF;borderWidth:1px">
    //                     <#text> Hello </#text>
    //                 </span>
    //             </div>
    //         </div>
    //     `, "initial refresh");

    //     debugger
    //     r.refresh({ color: "#000000", width: 3 });
    //     assert.equal(div.stringify(OPTIONS), `
    //         <div>
    //             <div>
    //                 <span style="borderColor:#FFFFFF;borderWidth:3px">
    //                     <#text> Hello </#text>
    //                 </span>
    //             </div>
    //         </div>
    //     `, "update 1");
    // });
});
