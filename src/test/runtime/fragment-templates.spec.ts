import { ElementNode, reset, doc, getTemplate, stringify } from "../utils";
import * as assert from 'assert';
import { $template, API, defaultParam, required, IvElement, decorator, io, logger } from '../../iv';
import { renderFragment, $fragment, fragment } from '../../iv/fragment';
import { IvFragment, IvContent } from '../../iv/types';
import { createDictionary, changeComplete, Data } from '../../trax';
import { XjsParamHost, XjsParamDictionary, XjsPreProcessorCtxt } from '../../xjs/types';
import { addParam, createParam } from '../../xjs/parser';
import { PreProcessorFactories } from '../../iv/compiler/types';

describe('Fragment templates', () => {
    let body: ElementNode, error = "", originalError: any;

    beforeEach(() => {
        error = "";
        body = reset();
        originalError = logger.error;
        logger.error = (msg) => {
            error += "[RUNTIME] " + msg.replace(/\n/g, "\\n");
        }
    });

    afterEach(() => {
        logger.error = originalError;
    })

    async function renderTest(f: IvFragment, context?: { [name: string]: any }, preProcessors?: PreProcessorFactories) {
        try {
            await renderFragment(f, body, context, { doc: doc, preProcessors: preProcessors });
        } catch (ex) {
            if (ex.kind === "#Error") {
                error = ex.description.replace(/\n/g, "\\n");
            } else {
                error = "" + ex;
                console.log("renderTest error:", ex);
            }
            return "ERROR";
        }
        return bodyContent();
    }

    function bodyContent() {
        return body.stringify({ indent: '        ', showUid: true, isRoot: true });
    }

    const info = $template`(msg1:string, msg2:string, nbr:number) => {
        Info widget
        <span class="info" data-value={nbr}>
            msg1='{msg1}'
            $if (msg2) {
                msg2='{msg2}'
            }
        </>
    }`;

    @Data class SectionPart {
        type: string;
        $content?: IvContent;
        data?: SectionPart;
    }

    const section = $template`(title:string, $content:IvContent, header?:SectionPart, footer?:SectionPart) => {
        <div class="section" #main>
            $if (title) {
                <div class="title"> {title} </div>
            }
            $if (header) {
                <h1 class="header" data-type={header.type} @content={header.$content}/>
            }
            <! @content/>
            $if (footer) {
                <h1 class="footer" data-type={footer.type} @content={footer.$content}/>
                $if (footer.data) {
                    <div class="data" data-type={footer.data.type} @content={footer.data.$content}/>
                }
            }
        </>
    }`;

    const doubleSection = $template`(sectionA:IvContent, sectionB:IvContent)=>{
        <div class="a" @content={sectionA}/>
        <div class="b" @content={sectionB}/>
    }`;

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

    @Data class ListItem {
        key: any;
        value?: string;
        $content?: IvContent;
    }
    const list = $template`(itemList: ListItem[]) => {
        <ul>
            $let len=itemList.length;
            $for (let i=0; len>i; i++) {
                $let itm = itemList[i];
                <li data-key={itm.key}> 
                    $if (itm.value) {
                        #{i+1}. {itm.value}
                    } else if (itm.$content) {
                        <div class="nbr"> #{i+1}. </div>
                        <div class="content" @content={itm.$content}/>
                    }
                </>
            }
        </>
    }`;

    const fragmentA = $fragment`
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

    let fragmentB = $fragment`
        <*section>
            <.header type={min}>
                Main section header
            </>
            Main section content
        </>
    `;

    const ctxtA = {
        name: "World",
        the: {
            className: "THE-CLASS-NAME",
            title: "THE-TITLE"
        }
    }

    const ctxtB = {
        "the_title": "THE TITLE",
        "info": info,
        "section": section,
        "list": list,
        "msg": "MESSAGE",
        "min": "MIN",
        "max": "MAX",
        "some_number": 42,
        "doubleSection": doubleSection,
        "title": title
    }

    it("should support concatenation with other fragment templates and other values", function () {
        const f1 = $fragment`
            Hello 
            World
            <span> ! </>
        `;

        assert.equal(f1.kind, "$fragment", "1");
        assert.equal(f1.template, '<!> Hello World <span> ! </></>', "2");

        const val = "abc", val2 = 123, val3 = true;
        const f2 = $fragment`
            <div class="f2"> ${f1} </>
            ${val} - ${val2} - ${val3}
        `;

        assert.equal(f2.template, `
            <div class="f2"> <!> Hello World <span> ! </></> </>
            abc - 123 - true
        `, "3");
    });

    it("should render root html elements, text nodes, attributes and properties", async function () {
        assert.equal(await renderTest($fragment`
            <div> Hello World </div>
            <div class='second'>
                <span [className]="xyz" title="the_title"> The SPAN </span>
            </>
        `), `
            <body::E1>
                <div::E3>
                    #::T4 Hello World #
                </div>
                <div::E5 a:class="second">
                    <span::E6 a:title="the_title" className="xyz">
                        #::T7 The SPAN #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, "1");

        body = reset();
        assert.equal(await renderTest($fragment`
            <div> Hello {name} </div>
            <div class='second'>
                <span [className]={the.className} title={the.title}> The SPAN </span>
            </>
        `, ctxtA), `
            <body::E1>
                <div::E3>
                    #::T4 Hello World #
                </div>
                <div::E5 a:class="second">
                    <span::E6 className="THE-CLASS-NAME" a:title="THE-TITLE">
                        #::T7 The SPAN #
                    </span>
                </div>
                //::C2 template anchor
            </body>
        `, "2");
    });

    it("should render $if blocks", async function () {
        let ctxt = createDictionary();
        ctxt["condition1"] = true;
        ctxt["b"] = { condition2: true };

        const f = $fragment`
            $if (condition1) {
                <div> case 1 </>
            } else if (b.condition2) {
                case 2
            } else {
                case <span> 3 </>
            }
        `;

        assert.equal(await renderTest(f, ctxt), `
            <body::E1>
                <div::E3>
                    #::T4 case 1 #
                </div>
                //::C2 template anchor
            </body>
        `, "1");

        ctxt["condition1"] = false;
        await changeComplete(ctxt);

        assert.equal(bodyContent(), `
            <body::E1>
                #::T5 case 2 #
                //::C2 template anchor
            </body>
        ` , "2");

        ctxt["b"] = { condition2: false };
        await changeComplete(ctxt);

        assert.equal(bodyContent(), `
            <body::E1>
                #::T6 case #
                <span::E7>
                    #::T8 3 #
                </span>
                //::C2 template anchor
            </body>
        ` , "3");

        ctxt["condition1"] = true;
        await changeComplete(ctxt);

        assert.equal(bodyContent(), `
            <body::E1>
                <div::E3>
                    #::T4 case 1 #
                </div>
                //::C2 template anchor
            </body>
        `, "4");
    });

    it("should render $each loops", async function () {
        let ctxt = createDictionary();
        ctxt["name"] = "Homer";
        ctxt["names"] = ['Marge', 'Lisa'];
        ctxt["list"] = { items: ["belt", "umbrella", "gloves"] };

        const f = $fragment`
            <div>
                $each(names, (name) => {
                    {name}
                });
                {name}
                <hr/>
                $each(list.items, (item, idx, isLast) => {
                    <span> {idx} {item} {isLast} </>
                });
                {name}
            </>
        `;

        assert.equal(await renderTest(f, ctxt), `
            <body::E1>
                <div::E3>
                    #::T4 Marge #
                    #::T5 Lisa #
                    #::T6 Homer #
                    <hr::E7/>
                    <span::E8>
                        #::T9 0 belt false #
                    </span>
                    <span::E10>
                        #::T11 1 umbrella false #
                    </span>
                    <span::E12>
                        #::T13 2 gloves true #
                    </span>
                    #::T14 Homer #
                </div>
                //::C2 template anchor
            </body>
        `, "1");

        ctxt["names"] = ['Marge', 'Lisa', 'Maggie'];
        ctxt["list"] = { items: ["gloves"] };
        await changeComplete(ctxt);

        assert.equal(bodyContent(), `
            <body::E1>
                <div::E3>
                    #::T4 Marge #
                    #::T5 Lisa #
                    #::T15 Maggie #
                    #::T6 Homer #
                    <hr::E7/>
                    <span::E8>
                        #::T9 0 gloves true # (1)
                    </span>
                    #::T14 Homer #
                </div>
                //::C2 template anchor
            </body>
        ` , "2");
    });

    it("should render components w/o content", async function () {
        assert.equal(await renderTest($fragment`
            AAA
            <div class="main">
                <*info msg1={msg} msg2="hello world" nbr=123/>
                <*info msg1="hello again" nbr={some_number}/>
            </>
            BBB
        `, ctxtB), `
            <body::E1>
                #::T3 AAA #
                <div::E4 a:class="main">
                    #::T5 Info widget #
                    <span::E6 a:class="info" a:data-value="123">
                        #::T7 msg1='MESSAGE' #
                        #::T8 msg2='hello world' #
                    </span>
                    #::T9 Info widget #
                    <span::E10 a:class="info" a:data-value="42">
                        #::T11 msg1='hello again' #
                    </span>
                </div>
                #::T12 BBB #
                //::C2 template anchor
            </body>
        `, "1");
    });

    it("should render components w/ content (elt + text)", async function () {
        assert.equal(await renderTest($fragment`
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
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
                    #::T4 AAA #
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
                    #::T12 BBB #
                </div>
                //::C2 template anchor
            </body>
        `, "1");
    });

    it("should render components w/ content (param nodes at root level)", async function () {
        assert.equal(await renderTest($fragment`
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
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
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
                </div>
                //::C2 template anchor
            </body>
        `, "1");
    });

    it("should render components w/ components in content (no sub-content)", async function () {
        assert.equal(await renderTest($fragment`
            <div class="main">
                <*section>
                    <.header>
                        ABC
                        <*info msg1='hello world'/>
                    </>
                </>
            </>
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        <h1::E5 a:class="header" a:data-type="">
                            #::T6 ABC #
                            #::T7 Info widget #
                            <span::E8 a:class="info" a:data-value="0">
                                #::T9 msg1='hello world' #
                            </span>
                        </h1>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, "1");
    });

    it("should render components w/ components in content (simple sub-content)", async function () {
        assert.equal(await renderTest($fragment`
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
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
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
                </div>
                //::C2 template anchor
            </body>
        `, "1");
    });

    it("should render components w/ components in content (sub-content + param nodes)", async function () {
        assert.equal(await renderTest($fragment`
            <div class="main">
                <*section>
                    <.header>
                        <*section title="some title">
                            <.header type={min}>
                                Header <span> Content </span>
                            </>
                            <div class='sub section content'>
                                Sub section content
                            </>
                            <.footer type="max">
                                Footer Content
                                <.data type="max">
                                    <div class="data"> Data Content </div>
                                </>
                            </>
                        </>
                        Main section header
                    </>
                    Main section content
                </>
            </>
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        <h1::E5 a:class="header" a:data-type="">
                            <div::E6 a:class="section">
                                <div::E7 a:class="title">
                                    #::T8 some title #
                                </div>
                                <h1::E9 a:class="header" a:data-type="MIN">
                                    #::T10 Header #
                                    <span::E11>
                                        #::T12 Content #
                                    </span>
                                </h1>
                                <div::E13 a:class="sub section content">
                                    #::T14 Sub section content #
                                </div>
                                <h1::E15 a:class="footer" a:data-type="max">
                                    #::T16 Footer Content #
                                </h1>
                                <div::E17 a:class="data" a:data-type="max">
                                    <div::E18 a:class="data">
                                        #::T19 Data Content #
                                    </div>
                                </div>
                            </div>
                            #::T20 Main section header #
                        </h1>
                        #::T21 Main section content #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, "1");
    });

    it("should render components w/ components in content (sub-content + param nodes as IvContent)", async function () {
        assert.equal(await renderTest($fragment`
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
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
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
                </div>
                //::C2 template anchor
            </body>
        `, "1");
    });

    it("should render components w/ param node lists", async function () {
        assert.equal(await renderTest($fragment`
            <div class="main">
                <*list>
                    <.item key="A" value="First item"/>
                    <.item key="B" value="Second item"/>
                    <.item key="C">
                        Third <span class="important"> item </span>
                    </>
                </>
            </>
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
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
                </div>
                //::C2 template anchor
            </body>
        `, "1");

        body = reset();
        assert.equal(await renderTest($fragment`
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
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
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
                </div>
                //::C2 template anchor
            </body>
        `, "2");
    });

    it("should allow rendering $fragment through @fragment", async function () {
        let resolve: (() => void) | undefined;
        function done() {
            if (resolve) {
                resolve()
            } else {
                throw "DONE";
            }
        }
        const tpl = $template`(f) => {
            <div class="main" @fragment(value={f} context={ctxtB} doc={doc} @oncomplete={done})/>
        }`;

        let t = getTemplate(tpl, body).render({ f: fragmentA });

        // @fragment is async, so we need to wait for its completion
        await new Promise((r: () => void) => {
            resolve = r; // will be called by done()
        });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 a:class="the_div">
                        <div::E6 a:class="section">
                            <h1::E7 a:class="header" a:data-type="MIN">
                                #::T8 Main section header #
                            </h1>
                            #::T9 Main section content #
                            <h1::E10 a:class="footer" a:data-type="MAX">
                                #::T11 Footer content #
                            </h1>
                        </div>
                    </div>
                    #::T12 Some text after the_div #
                    //::C4 template anchor
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ f: fragmentB });
        // @fragment is async, so we need to wait for its completion
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

    it("should allow rendering $fragment through @fragment w/o context (xtr)", async function () {
        let resolve: (() => void) | undefined;
        function done() {
            if (resolve) {
                resolve()
            } else {
                throw "DONE";
            }
        }
        const tpl = $template`(f) => {
            <div class="main" @fragment(value={f} doc={doc} @oncomplete={done})/>
        }`;

        let t = getTemplate(tpl, body).render({ f: $fragment`<div class="hello"> Hello World </>` });

        // @fragment is async, so we need to wait for its completion
        await new Promise((r: () => void) => {
            resolve = r; // will be called by done()
        });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E5 a:class="hello">
                        #::T6 Hello World #
                    </div>
                    //::C4 template anchor
                </div>
                //::C2 template anchor
            </body>
        `, '1');

    });

    it("should render cdata as text nodes", async function () {
        assert.equal(await renderTest($fragment`
            <div> 
                Hello World 
                <!cdata>
                    Some <text> ! </foo !{}
                </!cdata>
            </div>
            <div class='second'> 2 </div>
        `, ctxtB), `
            <body::E1>
                <div::E3>
                    #::T4 Hello World #
                    #::T5
                    Some <text> ! </foo !{}
                #
                </div>
                <div::E6 a:class="second">
                    #::T7 2 #
                </div>
                //::C2 template anchor
            </body>
        `, "1");

        body = reset();
        assert.equal(await renderTest($fragment`
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
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
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
                </div>
                //::C2 template anchor
            </body>
        `, "2");
    });

    it("should support decorators (root)", async function () {
        // deco: no params, 1 param, multiple params
        assert.equal(await renderTest($fragment`
            <div>
                <span @title> Hello </span> // no params
            </div>
            <div @title="abc"> World </div> // default param
            <div @title(text="abc" suffix="def")> ! </div>
        `, ctxtB), `
            <body::E1>
                <div::E3>
                    <span::E4 a:title="[NO TITLE]">
                        #::T5 Hello #
                    </span>
                </div>
                <div::E6 a:title="abc">
                    #::T7 World #
                </div>
                <div::E8 a:title="abcdef">
                    #::T9 ! #
                </div>
                //::C2 template anchor
            </body>
        `, "1");

        body = reset();
        assert.equal(await renderTest($fragment`
            <div class="main">
                <*section @title="abc">
                    Section content
                </>
            </>
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section" a:title="CPT:abc">
                        #::T5 Section content #
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, "2");
    });

    it("should support decorators (cpt content)", async function () {
        assert.equal(await renderTest($fragment`
            <div class="main">
                <*section>
                    <div @title> Orphan </div>
                    <div @title="abc"> Default param </div>
                    <div @title(text="abc" suffix="def")> Multiple params </div>
                </>
            </>
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
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
                </div>
                //::C2 template anchor
            </body>
        `, "1");

        body = reset();
        assert.equal(await renderTest($fragment`
            <div class="main">
                <*section>
                    Section 1 content
                    <*section @title="section in section">
                        Section 2 content
                    </>
                </>
            </>
        `, ctxtB), `
            <body::E1>
                <div::E3 a:class="main">
                    <div::E4 a:class="section">
                        #::T5 Section 1 content #
                        <div::E6 a:class="section" a:title="CPT:section in section">
                            #::T7 Section 2 content #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, "2");
    });

    it("should cache template factory", async function () {
        const hello = $fragment`
            <div> Hello {name} </div>
        `;
        assert.equal(hello.createInstance, undefined, "1");
        assert.equal(await renderTest(hello, { name: "World" }), `
            <body::E1>
                <div::E3>
                    #::T4 Hello World #
                </div>
                //::C2 template anchor
            </body>
        `, "2");
        const f1 = hello.createInstance;
        assert.equal(f1 !== undefined, true, "3");


        body = reset();
        assert.equal(await renderTest(hello, { name: "Bro" }), `
            <body::E1>
                <div::E3>
                    #::T4 Hello Bro #
                </div>
                //::C2 template anchor
            </body>
        `, "4");
        assert.equal(hello.createInstance === f1, true, "4");

    });

    // @@newParam pre-processor
    function newParam() {
        return {
            process(target: XjsParamHost, params: XjsParamDictionary, ctxt: XjsPreProcessorCtxt) {
                const name = params.name ? "" + params.name.value || "" : "", value: any = params.value ? params.value.value : undefined;

                if (name === "") {
                    ctxt.error("name is mandatory");
                } else if (value === undefined) {
                    throw "value is mandatory";
                }
                addParam(createParam(name, value), target);
            }
        }
    }

    it("should support pre-processors", async function () {
        const hello = $fragment`
            <div @@newParam(name="class" value="hw")> Hello {name} </div>
        `;

        assert.equal(await renderTest(hello, { name: "World" }, { "@@newParam": newParam }), `
            <body::E1>
                <div::E3 a:class="hw">
                    #::T4 Hello World #
                </div>
                //::C2 template anchor
            </body>
        `, "2");
    });


    @Data class User {
        alias: string;
    }

    @API class Title2 {
        @io @defaultParam text: string = "";
        prefix = "";
        suffix = "";
        $targetApi?: Object;
        @required $targetElt: IvElement;
        changeTitle: (newTitle: string) => void;
    }
    let changeTitle: undefined | ((newTitle: string) => Title2)
    const title2 = decorator(Title2, ($api: Title2) => {
        return {
            $init() {
                // changeTitle needs to be global as we cannot set a label on a decorator
                // when defaultValue property is used (e.g. @title={=a.b})
                changeTitle = $api.changeTitle = (newTitle: string) => {
                    // push the change for potential bindings
                    $api.text = newTitle + "!";
                    return $api;
                }
            },
            $render() {
                if ($api.text === "") {
                    $api.$targetElt.setAttribute("title", "[NO TITLE]");
                } else {
                    $api.$targetElt.setAttribute("title", $api.prefix + $api.text + $api.suffix);
                }
            }
        }
    });

    it("support 2-way bindings", async function () {
        const f = $fragment`
            <div @title2={=user.alias}>
                Hello {user.alias}
            </div>
        `;

        let usr = new User();
        usr.alias = "Alan";
        assert.equal(await renderTest(f, { title2: title2, user: usr }), `
            <body::E1>
                <div::E3 a:title="Alan">
                    #::T4 Hello Alan #
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        await changeComplete(usr); // should be marked as done when render is finished

        // change data
        usr.alias = "Laurence";
        await changeComplete(usr);
        assert.equal(bodyContent(), `
            <body::E1>
                <div::E3 a:title="Laurence"(1)>
                    #::T4 Hello Laurence # (1)
                </div>
                //::C2 template anchor
            </body>
        `, '2');

        // change title
        let api = changeTitle!("Alexandre");
        await changeComplete(api);
        assert.equal(usr.alias, "Alexandre!", "3");
        assert.equal(bodyContent(), `
            <body::E1>
                <div::E3 a:title="Alexandre!"(2)>
                    #::T4 Hello Alexandre! # (2)
                </div>
                //::C2 template anchor
            </body>
        `, '4');
    });

    it("should raise errors for invalid cases", async function () {
        // await renderTest($fragment`
        //     <div class="main" @title(text="abc" @title)>
        //         Hello</>
        //     </div>${""}
        // `, ctxtB);
        // assert.equal(error, 'XTR Renderer: Decorators are not support in decorators - check @title', "1");

        // await renderTest($fragment`
        //     <*section>
        //         <div class="main" @title(text="abc" @title)>
        //             Hello
        //         </>
        //     </>
        // `);
        // assert.equal(error, 'XTR Renderer: Decorators are not support in decorators - check @title', "2");

        // await renderTest($fragment`
        //     <div>
        //         <*section>
        //             <.header @title="abc"> ABC </>
        //         </>
        //     </>
        // `);
        // assert.equal(error, 'XTR Renderer: Decorators are not supported on param nodes - check @title', "3");

        await renderTest($fragment`
            <div>
                <!cdata @title="abc"> ABC </!cdata>
            </>
        `);
        assert.equal(error, 'Invalid decorator - Params, properties, decorators or labels are not supported on cdata sections', "4");
        error = "";

        await renderTest($fragment`
            <*section>
                <!cdata @title="abc"> ABC </!cdata>
            </>
        `);
        assert.equal(error, 'Invalid decorator - Params, properties, decorators or labels are not supported on cdata sections', "5");
        error = "";

        await renderTest($fragment`() => {
            ${"Hello World"} // dynamic text is required to bypass compile-time validation
        }`);
        assert.equal(error, 'Invalid expression: Invalid reference path \'Hello World\'', "6");
        error = "";

        await renderTest($fragment`
            Hello {name}
        `);
        assert.equal(error, '[RUNTIME] IVY: Missing $fragment context\\n>> Template: "testTpl" - File: "[$fragment string]"', "7");
        error = "";

        await renderTest($fragment`
            Hello {name}
        `);
        assert.equal(error, '[RUNTIME] IVY: Missing $fragment context\\n>> Template: "testTpl" - File: "[$fragment string]"', "8");
        error = "";
    });

    it("should raise @fragment errors", async function () {
        let resolve: (() => void) | undefined;
        function done() {
            if (resolve) {
                resolve()
            } else {
                throw "DONE";
            }
        }
        const tpl = $template`(f) => {
            <! @fragment(value={f} context={ctxtB} doc={doc} @oncomplete={done})/>
        }`;

        getTemplate(tpl, body).render({ f: fragmentA });

        assert.equal(error, `[RUNTIME] IVY: Invalid decorator target for @fragment\\n>> Template: "tpl" - File: ".../runtime/fragment-templates.spec.ts"[RUNTIME] IVY: @fragment cannot be used on components that don't define #main elements\\n>> Template: "tpl" - File: ".../runtime/fragment-templates.spec.ts"`, "1");
    });

    // todo: $log
});
