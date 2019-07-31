import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';
import { Data, changeComplete } from '../../trax/trax';
import { IvContent } from '../../iv/types';

// Components with param nodes
describe('Param Nodes', () => {
    let body: ElementNode, count = 0;

    beforeEach(() => {
        resetVars();
    });

    function resetVars() {
        body = reset();
        count = 0;
    }

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

        let t = getTemplate(tpl, body).render({ panelType: "important", mainType: "abc" });
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

        t.render({ panelType: "warning", mainType: "abc" });
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

        t.render({ panelType: "warning", mainType: "def" });
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

    it("should set and update normal attributes (dynamic)", function () {
        const panel = template(`(type:string, $content) => {
            count++;
            type = type || "xx";
            <div class={"panel" + (type? " "+type : "")}>
                # Panel message #
            </div>
        }`);

        const tpl = template(`(panelType:string, mainType:string) => {
            <div class={"main " + mainType}>
                <*panel>
                    if (mainType !== "no") {
                        <.type $value={panelType}/>
                    }
                </>
            </div>
        }`);

        // cm: condition === true
        let t1 = getTemplate(tpl, body).render({ panelType: "important", mainType: "abc" });
        assert.equal(count, 1, "count: 1");
        assert.equal(stringify(t1), `
            <body::E1>
                <div::E3 a:class="main abc">
                    <div::E4 a:class="panel important">
                        #::T5 Panel message #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t1.render({ panelType: "important", mainType: "no" });
        assert.equal(count, 2, "count: 2");
        assert.equal(stringify(t1), `
            <body::E1>
                <div::E3 a:class="main no"(1)>
                    <div::E4 a:class="panel xx"(1)>
                        #::T5 Panel message #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t1.render({ panelType: "important3", mainType: "type3" });
        assert.equal(count, 3, "count: 3");
        assert.equal(stringify(t1), `
            <body::E1>
                <div::E3 a:class="main type3"(2)>
                    <div::E4 a:class="panel important3"(2)>
                        #::T5 Panel message #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        // cm: condition === false
        resetVars()
        let t2 = getTemplate(tpl, body).render({ panelType: "important", mainType: "no" });
        assert.equal(count, 1, "count: 1");
        assert.equal(stringify(t2), `
            <body::E1>
                <div::E3 a:class="main no">
                    <div::E4 a:class="panel xx">
                        #::T5 Panel message #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');

        t2.render({ panelType: "important5", mainType: "main5" });
        assert.equal(count, 2, "count: 2");
        assert.equal(stringify(t2), `
            <body::E1>
                <div::E3 a:class="main main5"(1)>
                    <div::E4 a:class="panel important5"(1)>
                        #::T5 Panel message #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '5');

        t2.render({ panelType: "important", mainType: "no" });
        assert.equal(count, 3, "count: 3");
        assert.equal(stringify(t2), `
            <body::E1>
                <div::E3 a:class="main no"(2)>
                    <div::E4 a:class="panel xx"(2)>
                        #::T5 Panel message #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '6');
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

        let t = getTemplate(tplA, body).render({ headerText: "HEADER", mainText: "CONTENT" });
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

        t.render({ headerText: "HEADER2", mainText: "CONTENT" });
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
        `, '2');
        assert.equal(count, 2, "count:2");

        resetVars();
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

        let t2 = getTemplate(tplB, body).render({ headerText: "HEADER", footerText: "FOOTER", mainText: "CONTENT" });
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

        t2.render({ headerText: "HEADER2", footerText: "FOOTER2", mainText: "CONTENT2" });
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

    it("should support content-only params (dynamic)", function () {
        const section = template(`(type:string, $content: IvContent, header?: IvContent) => {
            <section class="section">
                if (header) {
                    <div class="header" @content={header}/>
                }
                <! @content/>
            </section>
        }`);

        const tplA = template(`(headerText, mainText, showHeader) => {
            <div class="main">
                <*section>
                    if (showHeader) {
                        <.header> # {headerText} # </>
                    }
                    # {mainText} # 
                </>
            </div>
        }`);

        // init condition: true
        let t1 = getTemplate(tplA, body).render({ headerText: "HEADER", mainText: "CONTENT", showHeader: true });
        assert.equal(stringify(t1), `
            <body::E1>
                <div::E3 a:class="main">
                    <section::E4 a:class="section">
                        <div::E5 a:class="header">
                            #::T6 HEADER #
                        </div>
                        #::T7 CONTENT #
                    </section>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t1.render({ headerText: "HEADER2", mainText: "CONTENT2", showHeader: false });
        assert.equal(stringify(t1), `
            <body::E1>
                <div::E3 a:class="main">
                    <section::E4 a:class="section">
                        #::T7 CONTENT2 # (1)
                    </section>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t1.render({ headerText: "HEADER3", mainText: "CONTENT3", showHeader: true });
        assert.equal(stringify(t1), `
            <body::E1>
                <div::E3 a:class="main">
                    <section::E4 a:class="section">
                        <div::E5 a:class="header">
                            #::T6 HEADER3 # (1)
                        </div>
                        #::T7 CONTENT3 # (2)
                    </section>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        // init condition: false
        resetVars();
        let t2 = getTemplate(tplA, body).render({ headerText: "HEADER", mainText: "CONTENT", showHeader: false });
        assert.equal(stringify(t2), `
            <body::E1>
                <div::E3 a:class="main">
                    <section::E4 a:class="section">
                        #::T5 CONTENT #
                    </section>
                </div>
                //::C2 template anchor
            </body>
        `, '4');

        t2.render({ headerText: "HEADER2", mainText: "CONTENT2", showHeader: true });
        assert.equal(stringify(t2), `
            <body::E1>
                <div::E3 a:class="main">
                    <section::E4 a:class="section">
                        <div::E6 a:class="header">
                            #::T7 HEADER2 #
                        </div>
                        #::T5 CONTENT2 # (1)
                    </section>
                </div>
                //::C2 template anchor
            </body>
        `, '4');

        t2.render({ headerText: "HEADER3", mainText: "CONTENT3", showHeader: false });
        assert.equal(stringify(t2), `
            <body::E1>
                <div::E3 a:class="main">
                    <section::E4 a:class="section">
                        #::T5 CONTENT3 # (2)
                    </section>
                </div>
                //::C2 template anchor
            </body>
        `, '5');
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

        let t = getTemplate(tpl, body).render({ headerText: "HEADER", mainText: "CONTENT", type: "warning" });
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

        t.render({ headerText: "HEADER2", mainText: "CONTENT2", type: "info" });
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

    @Data class SectionHeader {
        type: string;
        size: number = 2;
        size2: number = 2;
        title: IvContent;
        subHeader?: SectionHeader;
        $content: IvContent;
    }

    it("should support a tree of param nodes (static)", function () {
        const section = template(`($content: IvContent, header: SectionHeader) => {
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

        let t = getTemplate(tpl, body).render({ idx: 1 });
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

        t.render({ idx: 2 });
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

    it("should support a tree of param nodes (dynamic)", function () {
        const section = template(`($content: IvContent, header?: SectionHeader) => {
            <section>
                if (header) {
                    <div class={"header "+header.type} title={"size = "+header.size} @content={header.$content}/>
                    if (header.subHeader) {
                        let sbh = header.subHeader;
                        # subHeader - type={sbh.type} size={sbh.size} size2={sbh.size2} #
                        <div class="sbh title" @content={sbh.title}/> 
                        <div class="sbh content" @content={sbh.$content}/>
                    }
                }
                <! @content/>
            </section>
        }`);

        const tpl = template(`(idx, condition1, condition2) => {
            <*section>
                if (condition1) {
                    <.header type={"type"+idx}>
                        <.title> # Header Title {idx} # </>
                        # Header Content {idx} # 
                        if (condition2) {
                            <.subHeader type={"sbh-type-"+idx} size=8 size2={8}>
                                <.title> # SubHeader Title {idx} # </>
                                # SubHeader Content {idx} # 
                            </>
                        }
                    </>
                }
                # Section Content {idx} # 
            </>
        }`);

        // init condition: false
        let t1 = getTemplate(tpl, body).render({ idx: 1, condition1: false, condition2: false });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    #::T4 Section Content 1 #
                </section>
                //::C2 template anchor
            </body>
        `, '1');

        t1.render({ idx: 2, condition1: true, condition2: true });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    <div::E5 a:class="header type2" a:title="size = 2">
                        #::T6 Header Content 2 #
                    </div>
                    #::T7 subHeader - type=sbh-type-2 size=8 size2=8 #
                    <div::E8 a:class="sbh title">
                        #::T9 SubHeader Title 2 #
                    </div>
                    <div::E10 a:class="sbh content">
                        #::T11 SubHeader Content 2 #
                    </div>
                    #::T4 Section Content 2 # (1)
                </section>
                //::C2 template anchor
            </body>
        `, '2');

        t1.render({ idx: 2, condition1: true, condition2: false });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    <div::E5 a:class="header type2" a:title="size = 2">
                        #::T6 Header Content 2 #
                    </div>
                    #::T4 Section Content 2 # (1)
                </section>
                //::C2 template anchor
            </body>
        `, '3');

        t1.render({ idx: 4, condition1: true, condition2: true });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    <div::E5 a:class="header type4"(1) a:title="size = 2">
                        #::T6 Header Content 4 # (1)
                    </div>
                    #::T7 subHeader - type=sbh-type-4 size=8 size2=8 # (1)
                    <div::E8 a:class="sbh title">
                        #::T9 SubHeader Title 4 # (1)
                    </div>
                    <div::E10 a:class="sbh content">
                        #::T11 SubHeader Content 4 # (1)
                    </div>
                    #::T4 Section Content 4 # (2)
                </section>
                //::C2 template anchor
            </body>
        `, '4');

        t1.render({ idx: 4, condition1: false, condition2: true });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    #::T4 Section Content 4 # (2)
                </section>
                //::C2 template anchor
            </body>
        `, '5');

        // init condition: true
        resetVars();
        let t2 = getTemplate(tpl, body).render({ idx: 1, condition1: true, condition2: true });
        assert.equal(stringify(t2), `
            <body::E1>
                <section::E3>
                    <div::E4 a:class="header type1" a:title="size = 2">
                        #::T5 Header Content 1 #
                    </div>
                    #::T6 subHeader - type=sbh-type-1 size=8 size2=8 #
                    <div::E7 a:class="sbh title">
                        #::T8 SubHeader Title 1 #
                    </div>
                    <div::E9 a:class="sbh content">
                        #::T10 SubHeader Content 1 #
                    </div>
                    #::T11 Section Content 1 #
                </section>
                //::C2 template anchor
            </body>
        `, '6');

        t2.render({ idx: 2, condition1: true, condition2: false });
        assert.equal(stringify(t2), `
            <body::E1>
                <section::E3>
                    <div::E4 a:class="header type2"(1) a:title="size = 2">
                        #::T5 Header Content 2 # (1)
                    </div>
                    #::T11 Section Content 2 # (1)
                </section>
                //::C2 template anchor
            </body>
        `, '6');

        t2.render({ idx: 3, condition1: false, condition2: false });
        assert.equal(stringify(t2), `
            <body::E1>
                <section::E3>
                    #::T11 Section Content 3 # (2)
                </section>
                //::C2 template anchor
            </body>
        `, '7');

        t2.render({ idx: 4, condition1: true, condition2: true });
        assert.equal(stringify(t2), `
            <body::E1>
                <section::E3>
                    <div::E4 a:class="header type4"(2) a:title="size = 2">
                        #::T5 Header Content 4 # (2)
                    </div>
                    #::T6 subHeader - type=sbh-type-4 size=8 size2=8 # (1)
                    <div::E7 a:class="sbh title">
                        #::T8 SubHeader Title 4 # (1)
                    </div>
                    <div::E9 a:class="sbh content">
                        #::T10 SubHeader Content 4 # (1)
                    </div>
                    #::T11 Section Content 4 # (3)
                </section>
                //::C2 template anchor
            </body>
        `, '8');
    });

    it("should support optional param nodes with static params only", function () {
        const section = template(`($content?: IvContent, header?: SectionHeader) => {
            <section>
                if (header) {
                    <div class={"header "+header.type} title={"size = "+header.size} @content={header.$content}/>
                    if (header.subHeader) {
                        let sbh = header.subHeader;
                        # subHeader - type={sbh.type} size={sbh.size} size2={sbh.size2} #
                    }
                }
                <! @content/>
            </section>
        }`);

        const tpl = template(`(idx, condition1, condition2) => {
            <*section>
                if (condition1) {
                    <.header type="abc" size=4>
                        <.title> # Header Title {idx} # </>
                        # Header Content {idx} # 
                        if (condition2) {
                            <.subHeader type="def" size=42 size2=1984/>
                        }
                    </>
                }
                # Section Content {idx} # 
            </>
        }`);

        // init condition: false
        let t1 = getTemplate(tpl, body).render({ idx: 1, condition1: false, condition2: false });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    #::T4 Section Content 1 #
                </section>
                //::C2 template anchor
            </body>
        `, '1');

        t1.render({ idx: 2, condition1: true, condition2: true });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    <div::E5 a:class="header abc" a:title="size = 4">
                        #::T6 Header Content 2 #
                    </div>
                    #::T7 subHeader - type=def size=42 size2=1984 #
                    #::T4 Section Content 2 # (1)
                </section>
                //::C2 template anchor
            </body>
        `, '2');

        t1.render({ idx: 3, condition1: true, condition2: false });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    <div::E5 a:class="header abc" a:title="size = 4">
                        #::T6 Header Content 3 # (1)
                    </div>
                    #::T4 Section Content 3 # (2)
                </section>
                //::C2 template anchor
            </body>
        `, '3');

        t1.render({ idx: 4, condition1: false, condition2: false });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    #::T4 Section Content 4 # (3)
                </section>
                //::C2 template anchor
            </body>
        `, '4');

        t1.render({ idx: 2, condition1: true, condition2: true });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    <div::E5 a:class="header abc" a:title="size = 4">
                        #::T6 Header Content 2 # (2)
                    </div>
                    #::T7 subHeader - type=def size=42 size2=1984 #
                    #::T4 Section Content 2 # (4)
                </section>
                //::C2 template anchor
            </body>
        `, '5');

        // init condition: true
        resetVars();
        let t2 = getTemplate(tpl, body).render({ idx: 1, condition1: true, condition2: true });
        assert.equal(stringify(t2), `
            <body::E1>
                <section::E3>
                    <div::E4 a:class="header abc" a:title="size = 4">
                        #::T5 Header Content 1 #
                    </div>
                    #::T6 subHeader - type=def size=42 size2=1984 #
                    #::T7 Section Content 1 #
                </section>
                //::C2 template anchor
            </body>
        `, '6');

        t2.render({ idx: 2, condition1: true, condition2: false });
        assert.equal(stringify(t2), `
            <body::E1>
                <section::E3>
                    <div::E4 a:class="header abc" a:title="size = 4">
                        #::T5 Header Content 2 # (1)
                    </div>
                    #::T7 Section Content 2 # (1)
                </section>
                //::C2 template anchor
            </body>
        `, '7');

        t2.render({ idx: 3, condition1: false, condition2: false });
        assert.equal(stringify(t2), `
            <body::E1>
                <section::E3>
                    #::T7 Section Content 3 # (2)
                </section>
                //::C2 template anchor
            </body>
        `, '7');

        t2.render({ idx: 1, condition1: true, condition2: true });
        assert.equal(stringify(t2), `
            <body::E1>
                <section::E3>
                    <div::E4 a:class="header abc" a:title="size = 4">
                        #::T5 Header Content 1 # (2)
                    </div>
                    #::T6 subHeader - type=def size=42 size2=1984 #
                    #::T7 Section Content 1 # (3)
                </section>
                //::C2 template anchor
            </body>
        `, '8');
    });

    @Data class MenuOption {
        id: string;
        text: string;
    }

    const menu = template(`(optionList: MenuOption[]) => {
        <menu title={"count:"+optionList.length}>
            optionList.forEach((item) => {
                <item data-id={item.id}> # {item.text} # </item>
            })
        </menu>
    }`);

    it("should support a lists of param nodes on component (static)", function () {
        const tpl = template(`(idx) => {
            <*menu>
                <.option id={"a"+idx} text={" Option A "+idx} />
                <.option id={"b"+idx} text={" Option B "+idx} />
            </>
        }`);

        let t = getTemplate(tpl, body).render({ idx: 1 });
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:2">
                    <item::E4 a:data-id="a1">
                        #::T5  Option A 1 #
                    </item>
                    <item::E6 a:data-id="b1">
                        #::T7  Option B 1 #
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ idx: 2 });
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:2">
                    <item::E4 a:data-id="a2"(1)>
                        #::T5  Option A 2 # (1)
                    </item>
                    <item::E6 a:data-id="b2"(1)>
                        #::T7  Option B 2 # (1)
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should support a lists of param nodes on component (dynamic)", function () {
        @Data class Action {
            name: string;
            ref: string;
        }
        const tpl = template(`(actionList:Action[]) => {
            <*menu>
                <.option id="first" text="First Option" />
                for (let i=0;actionList.length>i;i++) {
                    <.option id={actionList[i].ref} text={actionList[i].name} />
                }
                <.option id="last" text="Last Option" />
            </>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:2">
                    <item::E4 a:data-id="first">
                        #::T5 First Option #
                    </item>
                    <item::E6 a:data-id="last">
                        #::T7 Last Option #
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ actionList: [{ ref: "A", name: "Action A" }, { ref: "B", name: "Action B" }] });
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:4"(1)>
                    <item::E4 a:data-id="first">
                        #::T5 First Option #
                    </item>
                    <item::E6 a:data-id="A"(1)>
                        #::T7 Action A # (1)
                    </item>
                    <item::E8 a:data-id="B">
                        #::T9 Action B #
                    </item>
                    <item::E10 a:data-id="last">
                        #::T11 Last Option #
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ actionList: [{ ref: "A", name: "Action A" }, { ref: "C", name: "Action C" }] });
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:4"(1)>
                    <item::E4 a:data-id="first">
                        #::T5 First Option #
                    </item>
                    <item::E6 a:data-id="A"(1)>
                        #::T7 Action A # (1)
                    </item>
                    <item::E8 a:data-id="C"(1)>
                        #::T9 Action C # (1)
                    </item>
                    <item::E10 a:data-id="last">
                        #::T11 Last Option #
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ actionList: [{ ref: "C", name: "Action C" }] });
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:3"(2)>
                    <item::E4 a:data-id="first">
                        #::T5 First Option #
                    </item>
                    <item::E6 a:data-id="C"(2)>
                        #::T7 Action C # (2)
                    </item>
                    <item::E8 a:data-id="last"(2)>
                        #::T9 Last Option # (2)
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '4');

        t.render({ actionList: [{ ref: "C", name: "Action C" }, { ref: "D", name: "Action D" }, { ref: "E", name: "Action E" }] });
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:5"(3)>
                    <item::E4 a:data-id="first">
                        #::T5 First Option #
                    </item>
                    <item::E6 a:data-id="C"(2)>
                        #::T7 Action C # (2)
                    </item>
                    <item::E8 a:data-id="D"(3)>
                        #::T9 Action D # (3)
                    </item>
                    <item::E10 a:data-id="E"(1)>
                        #::T11 Action E # (1)
                    </item>
                    <item::E12 a:data-id="last">
                        #::T13 Last Option #
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '5');

        t.render({ actionList: [] });
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:2"(4)>
                    <item::E4 a:data-id="first">
                        #::T5 First Option #
                    </item>
                    <item::E6 a:data-id="last"(3)>
                        #::T7 Last Option # (3)
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '6');
    });

    it("should support a lists of param nodes on component (2) (dynamic)", function () {
        const tpl = template(`(condition=true, idx=1) => {
            <*menu>
                if (condition) {
                    <.option id={"a"+idx} text={"Option A"+idx} />
                }
                <.option id="last" text="Last Option" />
            </>
        }`);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:2">
                    <item::E4 a:data-id="a1">
                        #::T5 Option A1 #
                    </item>
                    <item::E6 a:data-id="last">
                        #::T7 Last Option #
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ condition: false });
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:1"(1)>
                    <item::E4 a:data-id="last"(1)>
                        #::T5 Last Option # (1)
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '2');

        t.render(); // unchanged
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:1"(1)>
                    <item::E4 a:data-id="last"(1)>
                        #::T5 Last Option # (1)
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ condition: true, idx: 4 });
        assert.equal(stringify(t), `
            <body::E1>
                <menu::E3 a:title="count:2"(2)>
                    <item::E4 a:data-id="a4"(2)>
                        #::T5 Option A4 # (2)
                    </item>
                    <item::E6 a:data-id="last">
                        #::T7 Last Option #
                    </item>
                </menu>
                //::C2 template anchor
            </body>
        `, '4');
    });

    @Data class GridCell {
        text: string;
    }

    @Data class GridRow {
        title: string;
        cellList: GridCell[];
    }

    const grid = template(`(rowList: GridRow[]) => {
        <ul>
            rowList.forEach(row => {
                <li title={row.title}>
                    row.cellList.forEach(cell => {
                        # [{cell.text}] #
                    })
                </li>
            });
        </ul>
    }`);

    it("should support a list of param nodes on param nodes (dynamic)", function () {
        @Data class Action {
            name: string;
            ref: string;
        }
        const tpl = template(`(nbrOfRows=0, nbrOfCells=1, prefix="") => {
            <*grid>
                for (let i=0;nbrOfRows>i;i++) {
                    <.row title={"ROW#"+i}>
                        for (let j=0;nbrOfCells>j;j++) {
                            <.cell text={prefix+"CELL("+i+":"+j+")"}/>
                        }
                    </>
                }
            </>
        }`);

        let t = getTemplate(tpl, body).render({ nbrOfRows: 2 });
        assert.equal(stringify(t), `
            <body::E1>
                <ul::E3>
                    <li::E4 a:title="ROW#0">
                        #::T5 [CELL(0:0)] #
                    </li>
                    <li::E6 a:title="ROW#1">
                        #::T7 [CELL(1:0)] #
                    </li>
                </ul>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ nbrOfRows: 3, nbrOfCells: 3 });
        assert.equal(stringify(t), `
            <body::E1>
                <ul::E3>
                    <li::E4 a:title="ROW#0">
                        #::T5 [CELL(0:0)] #
                        #::T8 [CELL(0:1)] #
                        #::T9 [CELL(0:2)] #
                    </li>
                    <li::E6 a:title="ROW#1">
                        #::T7 [CELL(1:0)] #
                        #::T10 [CELL(1:1)] #
                        #::T11 [CELL(1:2)] #
                    </li>
                    <li::E12 a:title="ROW#2">
                        #::T13 [CELL(2:0)] #
                        #::T14 [CELL(2:1)] #
                        #::T15 [CELL(2:2)] #
                    </li>
                </ul>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ nbrOfRows: 2, nbrOfCells: 2, prefix: "*" });
        assert.equal(stringify(t), `
            <body::E1>
                <ul::E3>
                    <li::E4 a:title="ROW#0">
                        #::T5 [*CELL(0:0)] # (1)
                        #::T8 [*CELL(0:1)] # (1)
                    </li>
                    <li::E6 a:title="ROW#1">
                        #::T7 [*CELL(1:0)] # (1)
                        #::T10 [*CELL(1:1)] # (1)
                    </li>
                </ul>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should work with components inside a control statement", function () {
        @Data class Row {
            id: any = "";
            summary: IvContent;
            $content: IvContent;
        }

        const grid = template(`(rowList:Row[]) => {
            for (let idx=0; rowList.length>idx; idx++) {
                let row = rowList[idx];
                # row {row.id} #
                <div title={row.id} @content={row.summary}/> 
            }
        }`);

        const tpl = template(`(nbrOfRows=0) => {
            if (nbrOfRows>0) {
                <*grid>
                    for (let i=0;nbrOfRows>i;i++) {
                        <.row id={i}>
                            <.summary> # Summary {i} # </>
                        </>
                    }
                </>
            }
        }`);

        let t = getTemplate(tpl, body).render({ nbrOfRows: 0 });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ nbrOfRows: 2 });
        assert.equal(stringify(t), `
            <body::E1>
                #::T3 row 0 #
                <div::E4 a:title="0">
                    #::T5 Summary 0 #
                </div>
                #::T6 row 1 #
                <div::E7 a:title="1">
                    #::T8 Summary 1 #
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should reset param nodes between each call", async function () {
        @Data class Row {
            id: any = "";
            summary: IvContent;
            $content: IvContent;
        }

        @Data class Team {
            id: number;
        }

        let arr: Team[] = [], team: Team;
        for (let i = 0; i < 3; i++) {
            team = new Team();
            team.id = i;
            arr.push(team);
        }

        const grid = template(`(rowList:Row[]) => {
            for (let idx=0; rowList.length>idx; idx++) {
                let row = rowList[idx];
                <div title={row.id} @content={row.summary}/>
            }
        }`);

        let api: any;
        const tpl = template(`($api, teamList:Team[]) => {
            api = $api;
            <*grid>
                for (let team of teamList) {
                    <.row id={team.id}>
                        <.summary> # Team {team.id} # </>
                    </.row>
                }
            </*grid>
        }`);

        let t1 = getTemplate(tpl, body).render();
        assert.equal(stringify(t1), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '1');

        api.teamList = arr;
        await changeComplete(api);
        assert.equal(stringify(t1), `
            <body::E1>
                <div::E3 a:title="0">
                    #::T4 Team 0 #
                </div>
                <div::E5 a:title="1">
                    #::T6 Team 1 #
                </div>
                <div::E7 a:title="2">
                    #::T8 Team 2 #
                </div>
                //::C2 template anchor
            </body>
        `, '2');

    });

    it("should work with components inside other components", function () {
        @Data class Row {
            id: any = "";
            summary: IvContent;
            $content: IvContent;
        }

        const grid = template(`(rowList:Row[]) => {
            // grid template
            for (let idx=0; rowList.length>idx; idx++) {
                let row = rowList[idx];
                <div title={row.id}>
                    <summary @content={row.summary}/>
                    <! @content={row.$content}/>
                </> 
            }
        }`);

        const tpl = template(`(nbrOfRows=0, nbrOfSubRows=2, txt="X") => {
            <*grid>
                for (let i=0;nbrOfRows>i;i++) {
                    <.row id={i}>
                        <.summary> # Summary {i} # </>
                        <*grid>
                            for (let j=0;nbrOfSubRows>j;j++) {
                                <.row id={i+"/"+j}>
                                    <.summary> # Row {i}/{j} {txt} # </>
                                    # Content {i}/{j} {txt} # 
                                </.row>
                            }
                        </*grid>
                    </>
                }
            </>
        }`);

        let t = getTemplate(tpl, body).render({ nbrOfRows: 0 });
        assert.equal(stringify(t), `
            <body::E1>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ nbrOfRows: 2 });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="0">
                    <summary::E4>
                        #::T5 Summary 0 #
                    </summary>
                    <div::E6 a:title="0/0">
                        <summary::E7>
                            #::T8 Row 0/0 X #
                        </summary>
                        #::T9 Content 0/0 X #
                    </div>
                    <div::E10 a:title="0/1">
                        <summary::E11>
                            #::T12 Row 0/1 X #
                        </summary>
                        #::T13 Content 0/1 X #
                    </div>
                </div>
                <div::E14 a:title="1">
                    <summary::E15>
                        #::T16 Summary 1 #
                    </summary>
                    <div::E17 a:title="1/0">
                        <summary::E18>
                            #::T19 Row 1/0 X #
                        </summary>
                        #::T20 Content 1/0 X #
                    </div>
                    <div::E21 a:title="1/1">
                        <summary::E22>
                            #::T23 Row 1/1 X #
                        </summary>
                        #::T24 Content 1/1 X #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ nbrOfRows: 1, nbrOfSubRows: 3, txt: "XX" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="0">
                    <summary::E4>
                        #::T5 Summary 0 #
                    </summary>
                    <div::E6 a:title="0/0">
                        <summary::E7>
                            #::T8 Row 0/0 XX # (1)
                        </summary>
                        #::T9 Content 0/0 XX # (1)
                    </div>
                    <div::E10 a:title="0/1">
                        <summary::E11>
                            #::T12 Row 0/1 XX # (1)
                        </summary>
                        #::T13 Content 0/1 XX # (1)
                    </div>
                    <div::E25 a:title="0/2">
                        <summary::E26>
                            #::T27 Row 0/2 XX #
                        </summary>
                        #::T28 Content 0/2 XX #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');

        t.render({ nbrOfRows: 3, nbrOfSubRows: 1, txt: "XXX" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:title="0">
                    <summary::E4>
                        #::T5 Summary 0 #
                    </summary>
                    <div::E6 a:title="0/0">
                        <summary::E7>
                            #::T8 Row 0/0 XXX # (2)
                        </summary>
                        #::T9 Content 0/0 XXX # (2)
                    </div>
                </div>
                <div::E14 a:title="1">
                    <summary::E15>
                        #::T16 Summary 1 #
                    </summary>
                    <div::E17 a:title="1/0">
                        <summary::E18>
                            #::T19 Row 1/0 XXX # (1)
                        </summary>
                        #::T20 Content 1/0 XXX # (1)
                    </div>
                </div>
                <div::E29 a:title="2">
                    <summary::E30>
                        #::T31 Summary 2 #
                    </summary>
                    <div::E32 a:title="2/0">
                        <summary::E33>
                            #::T34 Row 2/0 XXX #
                        </summary>
                        #::T35 Content 2/0 XXX #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    /**
     * TODO
     * Support deferred versions pnodeD
     * dynamic case switching nodes for the same pnode
     * $paramNodes // list of all param nodes -> at all level: on cpt node, but also on sub-param-nodes
     */

});
