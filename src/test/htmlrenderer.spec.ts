
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

    it('should support nodes with attributes', () => {
        function hello(r: VdRenderer, nbr: number) {
            `---
            <div class="hello" [attr:aria-disabled]=nbr>
                    <span attr:aria-expanded="false" > Hello </span>
            </div> 
             ---`
        }
        let div = doc.createElement("div"), r = htmlRenderer(div, hello, doc);

        r.refresh({ nbr: 9 });
        assert.equal(div.childNodes[0]["ARIA-DISABLED"], 9, "aria-disabled 1");
        assert.equal(div.childNodes[0].childNodes[0]["ARIA-EXPANDED"], "false", "aria-expanded 2");

        r.refresh({ nbr: 42 });
        assert.equal(div.childNodes[0]["ARIA-DISABLED"], 42, "aria-disabled 3");
        assert.equal(div.childNodes[0].childNodes[0]["ARIA-EXPANDED"], "false", "aria-expanded 4");
    })

    it('should support svg nodes', () => {
        function hello(r: VdRenderer, radius) {
            `---
            <div>
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(50,50)">
                        <circle class="clock-face" [r]=radius/>
                    </g>
                </svg>
            </div> 
             ---`
        }
        let div = doc.createElement("div"), r = htmlRenderer(div, hello, doc);

        r.refresh({ radius: 9 });
        let svg=div.childNodes[0].childNodes[0], circle=svg.childNodes[0].childNodes[0];
        assert.equal(svg["VIEWBOX"], "0 0 100 100", "viewbox");
        assert.equal(svg["namespaceURI"], "http://www.w3.org/2000/svg", "ns");
        assert.equal(circle["namespaceURI"], "http://www.w3.org/2000/svg", "ns");
        assert.equal(circle["R"], 9, "radius 9");

        r.refresh({ radius: 42 });
        assert.equal(circle["R"], 42, "radius 42");
    })

    it('should support updates at the end of a block', () => {
        // same test as in compiler.spec and runtime.spec

        function foo(r: VdRenderer, nbr: number) {
            `---
            <section>
                % if (nbr > 0) {
                    <section> main </section>
                    % if (nbr > 1) {
                        <button class="clear-completed">BUTTON</button>
                    % }
                % }
            </section>
             ---`
        }

        let div = doc.createElement("div"), r = htmlRenderer(div, foo, doc);

        // initial display
        r.refresh({ visible: true, nbr: 1 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <section>
                        <#text> main </#text>
                    </section>
                </section>
            </div>
        `, "initial refresh");
        
        r.refresh({ visible: true, nbr: 2 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <section>
                        <#text> main </#text>
                    </section>
                    <button class="clear-completed">
                        <#text>BUTTON</#text>
                    </button>
                </section>
            </div>
        `, "update 1");
        
        r.refresh({ visible: true, nbr: 1 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <section>
                        <#text> main </#text>
                    </section>
                </section>
            </div>
        `, "update 2");
        
    });
});
