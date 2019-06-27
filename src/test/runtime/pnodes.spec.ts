import * as assert from 'assert';
import { template, logViewNodes, IvContent } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';
import { Data } from '../../trax/trax';

// Components with param nodes
describe('Param Nodes', () => {
    let body: ElementNode, count = 0;

    beforeEach(() => {
        body = reset();
        count = 0;
    });

    it("should set and update normal attributes (static)", function () {
        const panel = template(`(type:string, $content) => {
            count++;
            <div class={"panel" + (type? " "+type : "")}>
                # Panel message #
            </div>
        }`);

        const tpl = template(`(panelType, mainType) => {
            <div class={"main " + mainType}>
                <*panel>
                    <.type $value={panelType}/>
                </>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ panelType: "important", mainType: "abc" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main abc">
                    <div::E4 a:class="panel important">
                        #::T5 Panel message #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        assert.equal(count, 1, "panelCount is 1");

        t.refresh({ panelType: "warning", mainType: "abc" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main abc">
                    <div::E4 a:class="panel warning"(1)>
                        #::T5 Panel message #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
        assert.equal(count, 2, "panel count is 2");

        t.refresh({ panelType: "warning", mainType: "def" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main def"(1)>
                    <div::E4 a:class="panel warning"(1)>
                        #::T5 Panel message #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(count, 2, "panel count is still 2");
    });

    it("should support content-only params (static)", function () {
        const section = template(`(type:string, header: IvContent, footer: IvContent, $content: IvContent) => {
            count++;
            <div class="section">
                if (header) {
                    <div class="header" @content={header}/>
                }
                <! @content/>
                if (footer) {
                    <div class="footer" @content={footer}/>
                }
            </div>
        }`);

        const tplA = template(`(headerText, mainText) => {
            <div class="main">
                <*section>
                    <.header> # {headerText} # </>
                    # {mainText} # 
                </>
            </div>
        }`);

        let t = getTemplate(tplA, body).refresh({ headerText: "HEADER", mainText: "CONTENT" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        <div::E5 a:class="header">
                            #::T6 HEADER #
                        </div>
                        #::T7 CONTENT #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        assert.equal(count, 1, "count:1");

        t.refresh({ headerText: "HEADER2", mainText: "CONTENT" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        <div::E5 a:class="header">
                            #::T6 HEADER2 # (1)
                        </div>
                        #::T7 CONTENT #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        assert.equal(count, 2, "count:2");

        body = reset();
        let tplB = template(`(headerText, mainText, footerText) => {
            <div class="main">
                <*section>
                    <.header> # {headerText} # </> // will be ignored
                    <.header> # Second header: {headerText} # </> // second should win
                    # content: {mainText} # 
                    <.footer> # {footerText} # </>
                </>
            </div>
        }`);

        let t2 = getTemplate(tplB, body).refresh({ headerText: "HEADER", footerText: "FOOTER", mainText: "CONTENT" });
        assert.equal(stringify(t2), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        <div::E5 a:class="header">
                            #::T6 Second header: HEADER #
                        </div>
                        #::T7 content: CONTENT #
                        <div::E8 a:class="footer">
                            #::T9 FOOTER #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t2.refresh({ headerText: "HEADER2", footerText: "FOOTER2", mainText: "CONTENT2" });
        assert.equal(stringify(t2), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        <div::E5 a:class="header">
                            #::T6 Second header: HEADER2 # (1)
                        </div>
                        #::T7 content: CONTENT2 # (1)
                        <div::E8 a:class="footer">
                            #::T9 FOOTER2 # (1)
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("should support params with attributes and content (static)", function () {
        @Data class SectionHeader {
            type: string;
            size: number = 2;
            $content: IvContent;
        }

        const section = template(`(header: SectionHeader, $content: IvContent) => {
            <div class="section">
                if (header) {
                    <div class={"header "+header.type} title={"size = "+header.size} @content={header.$content}/>
                }
                <! @content/>
            </div>
        }`);

        const tpl = template(`(headerText, mainText, type) => {
            <div class="main">
                <*section>
                    <.header type={type} size=3> # Header: {headerText} # </>
                    # {mainText} # 
                </>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh({ headerText: "HEADER", mainText: "CONTENT", type: "warning" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        <div::E5 a:class="header warning" a:title="size = 3">
                            #::T6 Header: HEADER #
                        </div>
                        #::T7 CONTENT #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ headerText: "HEADER2", mainText: "CONTENT2", type: "info" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        <div::E5 a:class="header info"(1) a:title="size = 3">
                            #::T6 Header: HEADER2 # (1)
                        </div>
                        #::T7 CONTENT2 # (1)
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should support a tree of param nodes (static)", function () {
        @Data class SectionHeader {
            type: string;
            size: number = 2;
            title: IvContent;
            subHeader: SectionHeader;
            $content: IvContent;
        }

        const section = template(`(header: SectionHeader, $content: IvContent) => {
            <div class="section">
                if (header) {
                    <div class={"header "+header.type} title={"size = "+header.size} @content={header.$content}/>
                    if (header.subHeader) {
                        let sbh = header.subHeader;
                        # subHeader - type={sbh.type} size={sbh.size} #
                        <div class="sbh title" @content={sbh.title}/> 
                        <div class="sbh content" @content={sbh.$content}/>
                    }
                }
                <! @content/>
            </div>
        }`);

        const tpl = template(`(idx) => {
            <*section>
                <.header type={"type"+idx}>
                    <.title> # Header Title {idx} # </>
                    # Header Content {idx} # 
                    <.subHeader type={"sbh-type-"+idx} size=8>
                        <.title> # SubHeader Title {idx} # </>
                        # SubHeader Content {idx} # 
                    </>
                </>
                # Section Content {idx} # 
            </>
        }`);

        let t = getTemplate(tpl, body).refresh({ idx: 1 });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:class="header type1" a:title="size = 2">
                        #::T5 Header Content 1 #
                    </div>
                    #::T6 subHeader - type=sbh-type-1 size=8 #
                    <div::E7 a:class="sbh title">
                        #::T8 SubHeader Title 1 #
                    </div>
                    <div::E9 a:class="sbh content">
                        #::T10 SubHeader Content 1 #
                    </div>
                    #::T11 Section Content 1 #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.refresh({ idx: 2 });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="section">
                    <div::E4 a:class="header type2"(1) a:title="size = 2">
                        #::T5 Header Content 2 # (1)
                    </div>
                    #::T6 subHeader - type=sbh-type-2 size=8 # (1)
                    <div::E7 a:class="sbh title">
                        #::T8 SubHeader Title 2 # (1)
                    </div>
                    <div::E9 a:class="sbh content">
                        #::T10 SubHeader Content 2 # (1)
                    </div>
                    #::T11 Section Content 2 # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    /**
     * TODO
     * Support dynamic params (in blocks) -> support reset()
     * Make params optional -> be able to call factory
     * Support default values in params
     * List of param nodes
     * Delete value of a param node (if statement)
     * Support deferred versions pnodeD
     * dynamic case switching nodes for the same pnode
     * $paramNodes // list of all param nodes -> at all level: on cpt node, but also on sub-param-nodes
     */


});
