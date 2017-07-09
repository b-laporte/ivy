
import { assert, doc } from "./common";
import { htmlRenderer } from "../htmlrenderer";
import { VdRenderer } from "../vdom";

describe('HTML renderer', () => {

    it('should render a simple function', () => {
        function test(r: VdRenderer, nbr) {
            `---
            <div [foo]=nbr>
                ABC
                % if (nbr>42) {
                    <span [title]=nbr/>
                    % if (nbr>142) {
                        <span [title]=nbr+10/>
                    % }
                    <span [title]=nbr+20/>
                % } 
                DEF
            </div> 
             ---`
        }

        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        r.refresh({ nbr: 9 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <div foo="9">
                    <#text> ABC </#text>
                    <#text> DEF </#text>
                </div>
            </div>
        `, "initial refresh");

        r.refresh({ nbr: 145 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <div foo="145">
                    <#text> ABC </#text>
                    <span title="145"/>
                    <span title="155"/>
                    <span title="165"/>
                    <#text> DEF </#text>
                </div>
            </div>
        `, "refresh 145");

        r.refresh({ nbr: 45 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <div foo="45">
                    <#text> ABC </#text>
                    <span title="45"/>
                    <span title="65"/>
                    <#text> DEF </#text>
                </div>
            </div>
        `, "refresh 145");

        r.refresh({ nbr: 245 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <div foo="245">
                    <#text> ABC </#text>
                    <span title="245"/>
                    <span title="255"/>
                    <span title="265"/>
                    <#text> DEF </#text>
                </div>
            </div>
        `, "refresh 245");

        r.refresh({ nbr: 12 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <div foo="12">
                    <#text> ABC </#text>
                    <#text> DEF </#text>
                </div>
            </div>
        `, "refresh 12");

        r.refresh({ nbr: 50 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <div foo="50">
                    <#text> ABC </#text>
                    <span title="50"/>
                    <span title="70"/>
                    <#text> DEF </#text>
                </div>
            </div>
        `, "refresh 50");

    });

    it('should support event handlers', () => {
        let count = 0;
        function incrementCount(nbr) {
            count += nbr;
        }

        function test(r: VdRenderer, nbr) {
            `--- 
            <div [foo]=nbr>
                <span onclick()=incrementCount(nbr)> x </span>
            </div> 
             ---`
        }

        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        r.refresh({ nbr: 9 });
        assert.equal(count, 0, "value 0");
        div.childNodes[0].childNodes[0].click();
        assert.equal(count, 9, "value 9");
    });

});
