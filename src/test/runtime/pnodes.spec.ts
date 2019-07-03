import * as assert from 'assert';
import { template, IvContent } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';
import { Data } from '../../trax/trax';

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
        let t1 = getTemplate(tpl, body).refresh({ panelType: "important", mainType: "abc" });
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

        t1.refresh({ panelType: "important", mainType: "no" });
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

        t1.refresh({ panelType: "important3", mainType: "type3" });
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
        let t2 = getTemplate(tpl, body).refresh({ panelType: "important", mainType: "no" });
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

        t2.refresh({ panelType: "important5", mainType: "main5" });
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

        t2.refresh({ panelType: "important", mainType: "no" });
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
        let t1 = getTemplate(tplA, body).refresh({ headerText: "HEADER", mainText: "CONTENT", showHeader: true });
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

        t1.refresh({ headerText: "HEADER2", mainText: "CONTENT2", showHeader: false });
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

        t1.refresh({ headerText: "HEADER3", mainText: "CONTENT3", showHeader: true });
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
        let t2 = getTemplate(tplA, body).refresh({ headerText: "HEADER", mainText: "CONTENT", showHeader: false });
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

        t2.refresh({ headerText: "HEADER2", mainText: "CONTENT2", showHeader: true });
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

        t2.refresh({ headerText: "HEADER3", mainText: "CONTENT3", showHeader: false });
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
        let t1 = getTemplate(tpl, body).refresh({ idx: 1, condition1: false, condition2: false });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    #::T4 Section Content 1 #
                </section>
                //::C2 template anchor
            </body>
        `, '1');

        t1.refresh({ idx: 2, condition1: true, condition2: true });
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

        t1.refresh({ idx: 2, condition1: true, condition2: false });
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

        t1.refresh({ idx: 4, condition1: true, condition2: true });
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

        t1.refresh({ idx: 4, condition1: false, condition2: true });
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
        let t2 = getTemplate(tpl, body).refresh({ idx: 1, condition1: true, condition2: true });
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

        t2.refresh({ idx: 2, condition1: true, condition2: false });
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

        t2.refresh({ idx: 3, condition1: false, condition2: false });
        assert.equal(stringify(t2), `
            <body::E1>
                <section::E3>
                    #::T11 Section Content 3 # (2)
                </section>
                //::C2 template anchor
            </body>
        `, '7');

        t2.refresh({ idx: 4, condition1: true, condition2: true });
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
        let t1 = getTemplate(tpl, body).refresh({ idx: 1, condition1: false, condition2: false });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    #::T4 Section Content 1 #
                </section>
                //::C2 template anchor
            </body>
        `, '1');

        t1.refresh({ idx: 2, condition1: true, condition2: true });
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

        t1.refresh({ idx: 3, condition1: true, condition2: false });
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

        t1.refresh({ idx: 4, condition1: false, condition2: false });
        assert.equal(stringify(t1), `
            <body::E1>
                <section::E3>
                    #::T4 Section Content 4 # (3)
                </section>
                //::C2 template anchor
            </body>
        `, '4');

        t1.refresh({ idx: 2, condition1: true, condition2: true });
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
        let t2 = getTemplate(tpl, body).refresh({ idx: 1, condition1: true, condition2: true });
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

        t2.refresh({ idx: 2, condition1: true, condition2: false });
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

        t2.refresh({ idx: 3, condition1: false, condition2: false });
        assert.equal(stringify(t2), `
            <body::E1>
                <section::E3>
                    #::T7 Section Content 3 # (2)
                </section>
                //::C2 template anchor
            </body>
        `, '7');

        t2.refresh({ idx: 1, condition1: true, condition2: true });
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

    /**
     * TODO
     * Support default values in params
     * List of param nodes
     * Support deferred versions pnodeD
     * dynamic case switching nodes for the same pnode
     * $paramNodes // list of all param nodes -> at all level: on cpt node, but also on sub-param-nodes
     */


});
