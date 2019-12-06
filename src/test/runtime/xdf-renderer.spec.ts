import { IvContent, IvTemplate } from '../../iv/types';
import * as assert from 'assert';
import { ElementNode, reset, getTemplate, stringify, doc } from '../utils';
import { renderXdf, xdfContent } from '../../iv/xdf-renderer';
import { parse } from '../../xdf/parser';
import { template, API, required, defaultParam, decorator, IvElement, logger } from '../../iv';
import { Data } from '../../trax';

describe('Renderer', () => {
    let body: ElementNode, error = "";

    beforeEach(() => {
        error = "";
        body = reset();
    });

    afterEach(() => {
        if (error) {
            console.log("[afterEach] Unchecked error:\n", error);
        }
    });

    let xdfA = `
        <div class="the_div">
            <*section>
                <.header type={min}>
                    Main section header
                </>
                Main section content
                <.footer type={max}>
                    Footer content
                </>
            </>
        </>
        Some text after the_div
    `;

    let xdfB = `
        <*section>
            <.header type={min}>
                Main section header
            </>
            Main section content
        </>
    `;

    async function resolver(ref: string): Promise<any> {
        if (ref === "the_title") return "THE TITLE";
        if (ref === "info") return info;
        if (ref === "section") return section;
        if (ref === "list") return list;
        if (ref === "msg") return "MESSAGE";
        if (ref === "min") return "MIN";
        if (ref === "max") return "MAX";
        if (ref === "some_number") return 42;
        if (ref === "doubleSection") return doubleSection;
        if (ref === "title") return title;
        console.log("UNRESOLVED REF: " + ref);
        return null;
    }

    async function renderTest(xdf: string) {
        try {
            await renderXdf(xdf, body, resolver, { doc: doc });
        } catch (ex) {
            error = ex;
            return "ERROR";
        }
        return body.stringify({ indent: '        ', showUid: true, isRoot: true });
    }

    const info = template(`(msg1:string, msg2:string, nbr:number) => {
        # Info widget #
        <span class="info" data-value={nbr}>
            # msg1='{msg1}' #
            if (msg2) {
                # msg2='{msg2}' #
            }
        </>
    }`);

    @Data class SectionPart {
        type: string;
        $content?: IvContent;
        data?: SectionPart;
    }

    const section = template(`(title:string, $content:IvContent, header?:SectionPart, footer?:SectionPart) => {
        <div class="section" #main>
            if (title) {
                <div class="title"> # {title} # </div>
            }
            if (header) {
                <h1 class="header" data-type={header.type} @content={header.$content}/>
            }
            <! @content/>
            if (footer) {
                <h1 class="footer" data-type={footer.type} @content={footer.$content}/>
                if (footer.data) {
                    <div class="data" data-type={footer.data.type} @content={footer.data.$content}/>
                }
            }
        </>
    }`);

    const doubleSection = template(`(sectionA:IvContent, sectionB:IvContent)=>{
        <div class="a" @content={sectionA}/>
        <div class="b" @content={sectionB}/>
    }`);

    @Data class ListItem {
        key: any;
        value?: string;
        $content?: IvContent;
    }
    const list = template(`(itemList: ListItem[]) => {
        <ul>
            let len=itemList.length;
            for (let i=0; len>i; i++) {
                let itm = itemList[i];
                <li data-key={itm.key}> 
                    if (itm.value) {
                        # \#{i+1}. {itm.value} #
                    } else if (itm.$content) {
                        <div class="nbr"> # \#{i+1}. # </div>
                        <div class="content" @content={itm.$content}/>
                    }
                </>
            }
        </>
    }`);

    @API class Title {
        @defaultParam text: string = "";
        suffix: string = "";
        $targetApi?: Object;
        @required $targetElt: IvElement;
    }
    const title = decorator(Title, ($api: Title) => {
        let isEltDefinedAtInit = false;
        return {
            $render() {
                let txt = "";
                if ($api.$targetApi && $api.$targetElt) {
                    // target is a component
                    txt = "CPT:";
                }
                if ($api.text === "") {
                    $api.$targetElt.setAttribute("title", txt + "[NO TITLE]" + $api.suffix);
                } else {
                    $api.$targetElt.setAttribute("title", txt + $api.text + $api.suffix);
                }
            }
        }
    });

    it("should render root html elements, text nodes, attributes and properties", async function () {
        assert.equal(await renderTest(`
            <div> Hello World </div>
            <div class='second'>
                <span [className]="xyz" title={the_title}> The SPAN </span>
            </>
        `), `
            <body::E1>
                <div::E2>
                    #::T3 Hello World #
                </div>
                <div::E4 a:class="second">
                    <span::E5 className="xyz" a:title="THE TITLE">
                        #::T6 The SPAN #
                    </span>
                </div>
            </body>
        `, "1");
    });

    it("should render components w/o content", async function () {
        assert.equal(await renderTest(`
            AAA
            <div class="main">
                <*info msg1={msg} msg2="hello world" nbr=123/>
                <*info msg1="hello again" nbr={some_number}/>
            </>
            BBB
        `), `
            <body::E1>
                #::T2 AAA #
                <div::E3 a:class="main">
                    #::T5 Info widget #
                    <span::E6 a:class="info" a:data-value="123">
                        #::T7 msg1='MESSAGE' #
                        #::T8 msg2='hello world' #
                    </span>
                    //::C4 template anchor
                    #::T10 Info widget #
                    <span::E11 a:class="info" a:data-value="42">
                        #::T12 msg1='hello again' #
                    </span>
                    //::C9 template anchor
                </div>
                #::T13 BBB #
            </body>
        `, "1");
    });

    it("should render components w/ content (elt + text)", async function () {
        assert.equal(await renderTest(`
            <div class="main">
                AAA
                <*section title="some title">
                    <div class='content'>
                        <span [title]={the_title}> Hello </>
                        World
                    </>
                </>
                BBB
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    #::T3 AAA #
                    <div::E5 a:class="section">
                        <div::E6 a:class="title">
                            #::T7 some title #
                        </div>
                        <div::E8 a:class="content">
                            <span::E9 title="THE TITLE">
                                #::T10 Hello #
                            </span>
                            #::T11 World #
                        </div>
                    </div>
                    //::C4 template anchor
                    #::T12 BBB #
                </div>
            </body>
        `, "1");
    });

    it("should render components w/ content (param nodes at root level)", async function () {
        assert.equal(await renderTest(`
            <div class="main">
                <*section>
                    <.header type={min}/>
                    Some great content...
                    <.footer type={max}>
                        Footer content
                        <.data type="xyz">
                            <span> Footer </span> data content!
                        </>
                    </>
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="section">
                        <h1::E5 a:class="header" a:data-type="MIN"/>
                        #::T6 Some great content... #
                        <h1::E7 a:class="footer" a:data-type="MAX">
                            #::T8 Footer content #
                        </h1>
                        <div::E9 a:class="data" a:data-type="xyz">
                            <span::E10>
                                #::T11 Footer #
                            </span>
                            #::T12 data content! #
                        </div>
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "1");
    });

    it("should render components w/ components in content (no sub-content)", async function () {
        assert.equal(await renderTest(`
            <div class="main">
                <*section>
                    <.header>
                        ABC
                        <*info msg1='hello world'/>
                    </>
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="section">
                        <h1::E5 a:class="header" a:data-type="">
                            #::T6 ABC #
                            #::T7 Info widget #
                            <span::E8 a:class="info" a:data-value="0">
                                #::T9 msg1='hello world' #
                            </span>
                        </h1>
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "1");
    });

    it("should render components w/ components in content (simple sub-content)", async function () {
        assert.equal(await renderTest(`
            <div class="main">
                <*section>
                    <.header>
                        ABC
                        <*section title="some title">
                            <div class='content'>
                                <span [title]={the_title}> Hello </>
                                World (sub section content)
                            </>
                        </>
                    </>
                    Main section content
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="section">
                        <h1::E5 a:class="header" a:data-type="">
                            #::T6 ABC #
                            <div::E7 a:class="section">
                                <div::E8 a:class="title">
                                    #::T9 some title #
                                </div>
                                <div::E10 a:class="content">
                                    <span::E11 title="THE TITLE">
                                        #::T12 Hello #
                                    </span>
                                    #::T13 World (sub section content) #
                                </div>
                            </div>
                        </h1>
                        #::T14 Main section content #
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "1");
    });

    it("should render components w/ components in content (sub-content + param nodes)", async function () {
        assert.equal(await renderTest(`
            <div class="main">
                <*section>
                    <.header>
                        <*section title="some title">
                            <.header type={min}>
                                # Header # <span> # Content # </span>
                            </>
                            <div class='sub section content'>
                                # Sub section content #
                            </>
                            <.footer type="max">
                                Footer Content
                                <.data type="max">
                                    <div class="data"> # Data Content # </div>
                                </>
                            </>
                        </>
                        Main section header
                    </>
                    Main section content
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="section">
                        <h1::E5 a:class="header" a:data-type="">
                            <div::E6 a:class="section">
                                <div::E7 a:class="title">
                                    #::T8 some title #
                                </div>
                                <h1::E9 a:class="header" a:data-type="MIN">
                                    #::T10 # Header # #
                                    <span::E11>
                                        #::T12 # Content # #
                                    </span>
                                </h1>
                                <div::E13 a:class="sub section content">
                                    #::T14 # Sub section content # #
                                </div>
                                <h1::E15 a:class="footer" a:data-type="max">
                                    #::T16 Footer Content #
                                </h1>
                                <div::E17 a:class="data" a:data-type="max">
                                    <div::E18 a:class="data">
                                        #::T19 # Data Content # #
                                    </div>
                                </div>
                            </div>
                            #::T20 Main section header #
                        </h1>
                        #::T21 Main section content #
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "1");
    });

    it("should render components w/ components in content (sub-content + param nodes as IvContent)", async function () {
        assert.equal(await renderTest(`
            <div class="main">
                <*doubleSection>
                    <.sectionA>
                        <div> Section A </div>
                    </>
                    <.sectionB>
                        <div> Section B </div>
                    </>
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="a">
                        <div::E5>
                            #::T6 Section A #
                        </div>
                    </div>
                    <div::E7 a:class="b">
                        <div::E8>
                            #::T9 Section B #
                        </div>
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "1");
    });

    it("should render components w/ param node lists", async function () {
        assert.equal(await renderTest(`
            <div class="main">
                <*list>
                    <.item key="A" value="First item"/>
                    <.item key="B" value="Second item"/>
                    <.item key="C">
                        Third <span class="important"> item </span>
                    </>
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <ul::E4>
                        <li::E5 a:data-key="A">
                            #::T6 #1. First item #
                        </li>
                        <li::E7 a:data-key="B">
                            #::T8 #2. Second item #
                        </li>
                        <li::E9 a:data-key="C">
                            <div::E10 a:class="nbr">
                                #::T11 #3. #
                            </div>
                            <div::E12 a:class="content">
                                #::T13 Third #
                                <span::E14 a:class="important">
                                    #::T15 item #
                                </span>
                            </div>
                        </li>
                    </ul>
                    //::C3 template anchor
                </div>
            </body>
        `, "1");

        body = reset();
        assert.equal(await renderTest(`
            <div class="main">
                <*list>
                    <.item key="A">
                        <*list>
                            <.item key="AA" value="Item AA"/>
                            <.item key="BB"> Item BB </>
                        </>
                    </>
                    <.item key="B">
                        Item B
                    </>
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <ul::E4>
                        <li::E5 a:data-key="A">
                            <div::E6 a:class="nbr">
                                #::T7 #1. #
                            </div>
                            <div::E8 a:class="content">
                                <ul::E9>
                                    <li::E10 a:data-key="AA">
                                        #::T11 #1. Item AA #
                                    </li>
                                    <li::E12 a:data-key="BB">
                                        <div::E13 a:class="nbr">
                                            #::T14 #2. #
                                        </div>
                                        <div::E15 a:class="content">
                                            #::T16 Item BB #
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li::E17 a:data-key="B">
                            <div::E18 a:class="nbr">
                                #::T19 #2. #
                            </div>
                            <div::E20 a:class="content">
                                #::T21 Item B #
                            </div>
                        </li>
                    </ul>
                    //::C3 template anchor
                </div>
            </body>
        `, "2");
    });

    it("should allow rendering XDF through @xdfContent (xdf)", async function () {
        let resolve: (() => void) | undefined;
        function done() {
            if (resolve) {
                resolve()
            } else {
                throw "DONE";
            }
        }
        const tpl = template(`(xdfValue) => {
            <div class="main" @xdfContent(xdf={xdfValue} resolver={resolver} doc={doc} @oncomplete={done})/>
        }`, xdfContent, done);

        let t = getTemplate(tpl, body).render({ xdfValue: xdfA });

        // @xdfContent is async, so we need to wait for its completion
        await new Promise((r: () => void) => {
            resolve = r; // will be called by done()
        });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="the_div">
                        <div::E6 a:class="section">
                            <h1::E7 a:class="header" a:data-type="MIN">
                                #::T8 Main section header #
                            </h1>
                            #::T9 Main section content #
                            <h1::E10 a:class="footer" a:data-type="MAX">
                                #::T11 Footer content #
                            </h1>
                        </div>
                        //::C5 template anchor
                    </div>
                    #::T12 Some text after the_div #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ xdfValue: xdfB });
        // @xdfContent is async, so we need to wait for its completion
        await new Promise((r: () => void) => {
            resolve = r; // will be called by done()
        });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E14 a:class="section">
                        <h1::E15 a:class="header" a:data-type="MIN">
                            #::T16 Main section header #
                        </h1>
                        #::T17 Main section content #
                    </div>
                    //::C13 template anchor
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should allow rendering XDF through @xdfContent (fragment)", async function () {
        let resolve: (() => void) | undefined;
        function done() {
            if (resolve) {
                resolve()
            } else {
                throw "DONE";
            }
        }
        const tpl = template(`(xdfValue) => {
            <div class="main" @xdfContent(fragment={parse(xdfValue)} resolver={resolver} doc={doc} @oncomplete={done})/>
        }`, xdfContent, done);

        let t = getTemplate(tpl, body).render({ xdfValue: xdfA });

        // @xdfContent is async, so we need to wait for its completion
        await new Promise((r: () => void) => {
            resolve = r; // will be called by done()
        });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="the_div">
                        <div::E6 a:class="section">
                            <h1::E7 a:class="header" a:data-type="MIN">
                                #::T8 Main section header #
                            </h1>
                            #::T9 Main section content #
                            <h1::E10 a:class="footer" a:data-type="MAX">
                                #::T11 Footer content #
                            </h1>
                        </div>
                        //::C5 template anchor
                    </div>
                    #::T12 Some text after the_div #
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ xdfValue: xdfB });
        // @xdfContent is async, so we need to wait for its completion
        await new Promise((r: () => void) => {
            resolve = r; // will be called by done()
        });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E14 a:class="section">
                        <h1::E15 a:class="header" a:data-type="MIN">
                            #::T16 Main section header #
                        </h1>
                        #::T17 Main section content #
                    </div>
                    //::C13 template anchor
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should accept comments", async function () {
        assert.equal(await renderTest(`
            <div class="main" /* title="abc" */ >
                <*doubleSection>
                    // <.sectionA>
                    //     <div> Section A </div>
                    // </>
                    <.sectionB>
                        <div> Section B </div>
                    </>
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="a"/>
                    <div::E5 a:class="b">
                        <div::E6>
                            #::T7 Section B #
                        </div>
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "1");
    });

    it("should render cdata as text nodes", async function () {
        assert.equal(await renderTest(`
            <div> 
                Hello World 
                <!cdata>
                    Some <text> ! </foo !{}
                </!cdata>
            </div>
            <div class='second'> 2 </div>
        `), `
            <body::E1>
                <div::E2>
                    #::T3 Hello World #
                    #::T4
                    Some <text> ! </foo !{}
                #
                </div>
                <div::E5 a:class="second">
                    #::T6 2 #
                </div>
            </body>
        `, "1");

        body = reset();
        assert.equal(await renderTest(`
            <div class="main">
                <*section>
                    <*section title="some content">
                        <div class='content'>
                            <!cdata>
                                CDATA <content>
                            </!cdata>
                        </>
                    </>
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="section">
                        <div::E5 a:class="section">
                            <div::E6 a:class="title">
                                #::T7 some content #
                            </div>
                            <div::E8 a:class="content">
                                #::T9
                                CDATA <content>
                            #
                            </div>
                        </div>
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "2");
    });

    it("should support decorators (root)", async function () {
        // deco: no params, 1 param, multiple params
        assert.equal(await renderTest(`
            <div>
                <span @title> Hello </span> // no params
            </div>
            <div @title="abc"> World </div> // default param
            <div @title(text="abc" suffix="def")> ! </div>
        `), `
            <body::E1>
                <div::E2>
                    <span::E3 a:title="[NO TITLE]">
                        #::T4 Hello #
                    </span>
                </div>
                <div::E5 a:title="abc">
                    #::T6 World #
                </div>
                <div::E7 a:title="abcdef">
                    #::T8 ! #
                </div>
            </body>
        `, "1");

        body = reset();
        assert.equal(await renderTest(`
            <div class="main">
                <*section @title="abc">
                    Section content
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="section" a:title="CPT:abc">
                        #::T5 Section content #
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "2");
    });

    it("should support decorators (cpt content)", async function () {
        assert.equal(await renderTest(`
            <div class="main">
                <*section>
                    <div @title> Orphan </div>
                    <div @title="abc"> Default param </div>
                    <div @title(text="abc" suffix="def")> Multiple params </div>
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="section">
                        <div::E5 a:title="[NO TITLE]">
                            #::T6 Orphan #
                        </div>
                        <div::E7 a:title="abc">
                            #::T8 Default param #
                        </div>
                        <div::E9 a:title="abcdef">
                            #::T10 Multiple params #
                        </div>
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "1");

        body = reset();
        assert.equal(await renderTest(`
            <div class="main">
                <*section>
                    Section 1 content
                    <*section @title="section in section">
                        Section 2 content
                    </>
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 Section 1 content #
                        <div::E6 a:class="section" a:title="CPT:section in section">
                            #::T7 Section 2 content #
                        </div>
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "2");
    });

    it("should raise errors for invalid decorators", async function () {
        await renderTest(`
            <div class="main" @title(text="abc" @title)>
                Hello
            </>
        `);
        assert.equal(error, 'XDF Renderer: Decorators are not support in decorators - check @title', "1");

        await renderTest(`
            <*section>
                <div class="main" @title(text="abc" @title)>
                    Hello
                </>
            </>
        `);
        assert.equal(error, 'XDF Renderer: Decorators are not support in decorators - check @title', "2");

        await renderTest(`
            <div>
                <*section>
                    <.header @title="abc"> ABC </>
                </>
            </>
        `);
        assert.equal(error, 'XDF Renderer: Decorators are not supported on param nodes - check @title', "3");

        await renderTest(`
            <div>
                <!cdata @title="abc"> ABC </!cdata>
            </>
        `);
        assert.equal(error, 'XDF Renderer: Params, properties, decorators or labels are not supported on cdata sections - check @title', "4");
        error = "";

        await renderTest(`
            <*section>
                <!cdata @title="abc"> ABC </!cdata>
            </>
        `);
        assert.equal(error, 'XDF Renderer: Params, properties, decorators or labels are not supported on cdata sections - check @title', "5");
        error = "";
    });

    it("should support fragments", async function () {
        assert.equal(await renderTest(`
            <div>
                ABC
                <!>
                    <span @title> Hello </span>
                    DEF
                </>
            </div>
        `), `
            <body::E1>
                <div::E2>
                    #::T3 ABC #
                    <span::E4 a:title="[NO TITLE]">
                        #::T5 Hello #
                    </span>
                    #::T6 DEF #
                </div>
            </body>
        `, "1");

        body = reset();
        assert.equal(await renderTest(`
            <div class="main">
                <*section>
                    Section 1
                    <!>
                        <span> content </span>
                        (end)
                    </>
                </>
            </>
        `), `
            <body::E1>
                <div::E2 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 Section 1 #
                        <span::E6>
                            #::T7 content #
                        </span>
                        #::T8 (end) #
                    </div>
                    //::C3 template anchor
                </div>
            </body>
        `, "2");
    });

    it("should raise errors for invalid decorators", async function () {
        await renderTest(`
            <*section>
                <! @title="abc">
                    ABC
                </>
            </>
        `);
        assert.equal(error, 'XDF Renderer: Params, properties, decorators or labels are not supported on fragments - check @title', "1");
        error = "";

        await renderTest(`
            <! @title="abc">
                ABC
            </>
        `);
        assert.equal(error, 'XDF Renderer: Params, properties, decorators or labels are not supported on fragments - check @title', "2");
        error = "";
    });

    // todo: better error context

    // sub-fragments root / in component
    // XdfContext with query() -> ??

    // labels on elements
    // labels on components & content
    // error for invalid labels (fragments, cdata, etc.)

    // support elements with param nodes?

    // todo: disposal
});
