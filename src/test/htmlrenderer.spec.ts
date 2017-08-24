
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
        let svg = div.childNodes[0].childNodes[0], circle = svg.childNodes[0].childNodes[0];
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

    it('should use textContent to empty groups that are the only child of an element', () => {
        // same test as in compiler.spec and runtime.spec

        function foo(r: VdRenderer, nbr: number) {
            `---
            <section>
                % if (nbr > 0) {
                    <:foo> blah </:foo>
                    <section> main </section>
                    <div> some content </div>
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
                    <div>
                        <#text> some content </#text>
                    </div>
                </section>
            </div>
        `, "initial refresh");

        doc.traces.reset();
        assert.equal(doc.traces.wentThroughTextContentDelete, false, "trace reset");
        r.refresh({ visible: true, nbr: 0 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section/>
            </div>
        `, "update 1");
        assert.equal(doc.traces.wentThroughTextContentDelete, true, "deletion through textContent");

        r.refresh({ visible: true, nbr: 1 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <section>
                        <#text> main </#text>
                    </section>
                    <div>
                        <#text> some content </#text>
                    </div>
                </section>
            </div>
        `, "update 2");

    });

    it('should support data nodes', () => {
        // same test as in compiler.spec and runtime.spec

        function test(r: VdRenderer, selectedCard: string, content1: string, list: any[]) {
            `---
            % list = list || [];
            <section>
                <c:cardSet [selection]=selectedCard>
                    <:card ref="first">
                        <:title> <b> First Card </b> </:title>
                        <b> {{ content1 }} </b>
                    </:card>
                    % for (let c of list) {
                        <:card ref=c.ref>
                            % if (c.ref !== "c1") {
                                <:title> Card {{c.ref}} </:title>
                            % }
                            <span class="cn"> {{ c.content }} </span>
                        </:card>
                    % }
                </c:cardSet>
            </section>
             ---`
        }

        function cardSet(r: VdRenderer, selection: string) {
            `---
            % let cards = r.getDataNodes("card");
            % for (let card of cards) {
                % if (card.props["ref"] === selection) {
                    % let title = r.getDataNode("title", card);
                    <div class="card">
                        % if (title) {
                            <div class="title"> title: <ins:title/></div>
                        % }
                        <ins:card/>
                    </div>
                % }
            % }
             ---`
        }

        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        // initial display
        r.refresh({ selectedCard: "first", content1: "First Card content" });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <div class="card">
                        <div class="title">
                            <#text> title: </#text>
                            <b>
                                <#text> First Card </#text>
                            </b>
                        </div>
                        <b>
                            <#text>First Card content</#text>
                        </b>
                    </div>
                </section>
            </div>
        `, "initial refresh");

        r.refresh({ selectedCard: "first", content1: "New First Card content" });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <div class="card">
                        <div class="title">
                            <#text> title: </#text>
                            <b>
                                <#text> First Card </#text>
                            </b>
                        </div>
                        <b>
                            <#text>New First Card content</#text>
                        </b>
                    </div>
                </section>
            </div>
        `, "update 1");

        let list = [{ ref: "c1", content: "content #1" }, { ref: "c2", content: "content #2" }];
        r.refresh({ selectedCard: "c2", content1: "New First Card content", list: list });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <div class="card">
                        <div class="title">
                            <#text> title: </#text>
                            <#text> Card c2</#text>
                        </div>
                        <span class="cn">
                            <#text>content #2</#text>
                        </span>
                    </div>
                </section>
            </div>
        `, "update 2");

        r.refresh({ selectedCard: "c1", content1: "New First Card content", list: list });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <div class="card">
                        <span class="cn">
                            <#text>content #1</#text>
                        </span>
                    </div>
                </section>
            </div>
        `, "update 3");

        r.refresh({ selectedCard: "unknown", content1: "New First Card content", list: list });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section/>
            </div>
        `, "update 4");

        r.refresh({ selectedCard: "first", content1: "Hello World!", list: list });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <div class="card">
                        <div class="title">
                            <#text> title: </#text>
                            <b>
                                <#text> First Card </#text>
                            </b>
                        </div>
                        <b>
                            <#text>Hello World!</#text>
                        </b>
                    </div>
                </section>
            </div>
        `, "update 5");
    });

    it('should gracefully handle null and undefined values in dynamic text nodes', () => {
        // same test as in compiler.spec and runtime.spec

        function test(r: VdRenderer, v1, v2, v3) {
            `---
            <span> v1 {{v1}} {{v1+1}} {{v3}} </span>
            <span> v2 {{v2}} {{v2+2}} </span>
             ---`
        }

        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        // initial display
        r.refresh({ v1: null, v2: undefined, v3: 0 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <span>
                    <#text> v1 10</#text>
                </span>
                <span>
                    <#text> v2 </#text>
                </span>
            </div>
        `, "initial refresh");

        r.refresh({ v1: 'a', v2: 123 });
        assert.equal(div.stringify("        ", true), `
            <div>
                <span>
                    <#text> v1 aa1</#text>
                </span>
                <span>
                    <#text> v2 123125</#text>
                </span>
            </div>
        `, "update 1");

        r.refresh({ v1: undefined, v2: null });
        assert.equal(div.stringify("        ", true), `
            <div>
                <span>
                    <#text> v1 </#text>
                </span>
                <span>
                    <#text> v2 2</#text>
                </span>
            </div>
        `, "update 2");

    });

    it('should support data nodes from props for single nodes', () => {
        // same test as in compiler.spec and runtime.spec

        function test(r: VdRenderer, selectedCard: string, firstCardTitle: string) {
            `---
            <section>
                <c:cardSet [selection]=selectedCard>
                    <:card ref="r1" [title]=firstCardTitle>
                        <b> Card 1 </b>
                    </:card>
                    <:card ref="r2" title="Second Card">
                        <b> Card 2 </b>
                    </:card>
                </c:cardSet>
            </section>
             ---`
        }

        function cardSet(r: VdRenderer, selection: string) {
            `---
            % let cards = r.getDataNodes("card");
            % for (let card of cards) {
                % if (card.props["ref"] === selection) {
                    % let title = r.getDataNode("title", card);
                    <div class="card">
                        % if (title) {
                            <div class="title"> title: <ins:title/></div>
                        % }
                        <ins:card/>
                    </div>
                % }
            % }
            % let sel = r.getDataNode("selection");
            Selection: <ins:sel/>
             ---`
        }

        let div = doc.createElement("div"), r = htmlRenderer(div, test, doc);

        // initial display
        r.refresh({ selectedCard: "r1", firstCardTitle: "First Card" });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <div class="card">
                        <div class="title">
                            <#text> title: </#text>
                            <#text>First Card</#text>
                        </div>
                        <b>
                            <#text> Card 1 </#text>
                        </b>
                    </div>
                    <#text> Selection: </#text>
                    <#text>r1</#text>
                </section>
            </div>
        `, "initial refresh");
        
        r.refresh({ selectedCard: "r1", firstCardTitle: "First Card Bis" });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <div class="card">
                        <div class="title">
                            <#text> title: </#text>
                            <#text>First Card Bis</#text>
                        </div>
                        <b>
                            <#text> Card 1 </#text>
                        </b>
                    </div>
                    <#text> Selection: </#text>
                    <#text>r1</#text>
                </section>
            </div>
        `, "update 1");

        r.refresh({ selectedCard: "r2", firstCardTitle: "First Card" });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <div class="card">
                        <div class="title">
                            <#text> title: </#text>
                            <#text>Second Card</#text>
                        </div>
                        <b>
                            <#text> Card 2 </#text>
                        </b>
                    </div>
                    <#text> Selection: </#text>
                    <#text>r2</#text>
                </section>
            </div>
        `, "update 2");

        r.refresh({ selectedCard: "unknown" });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <#text> Selection: </#text>
                    <#text>unknown</#text>
                </section>
            </div>
        `, "unpdate 3");

        r.refresh({ selectedCard: "r1", firstCardTitle: "First CARD" });
        assert.equal(div.stringify("        ", true), `
            <div>
                <section>
                    <div class="card">
                        <div class="title">
                            <#text> title: </#text>
                            <#text>First CARD</#text>
                        </div>
                        <b>
                            <#text> Card 1 </#text>
                        </b>
                    </div>
                    <#text> Selection: </#text>
                    <#text>r1</#text>
                </section>
            </div>
        `, "update 4");
    });
});
