import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';
import { Data, changeComplete } from '../../trax';
import { IvContent } from '../../iv/types';
import { tabs } from '../../doc/examples/tabs/tabset';


describe('Examples', () => {
    let body: ElementNode, count = 0;

    beforeEach(() => {
        resetVars();
    });

    function resetVars() {
        body = reset();
        count = 0;
    }

    it("should work for tabs", function () {
        let log = "";

        const heavyComponent = template(`(id:string) => {
            log += "+"+id;
            <div class="heavy">
                # heavy component '{id}' #
            </>
        }`);

        const tpl = template(`(tabSelection:string, $api) => {
            <*tabs selection={=$api.tabSelection}>
                <.tab id="tabA">
                    <.title> # title # <b> # A # </></>
                    <*heavyComponent id="cptA"/>
                </>
                <.tab id="tabB">
                    <.title> # title # <b> # B # </></>
                    <*heavyComponent id="cptB"/>
                </>
            </>
        }`, tabs, heavyComponent);

        let t = getTemplate(tpl, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="tabs">
                    <ul::E4 a:class="header">
                        <li::E5 a:class="tab selected">
                            #::T6 title #
                            <b::E7>
                                #::T8 A #
                            </b>
                        </li>
                        <li::E9 a:class="tab ">
                            #::T10 title #
                            <b::E11>
                                #::T12 B #
                            </b>
                        </li>
                    </ul>
                    <div::E13 a:class="content">
                        <div::E14 a:class="heavy">
                            #::T15 heavy component 'cptA' #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
        assert.equal(log, "+cptA" , "2");

        // select 2nd tab
        t.render({ tabSelection: "tabB" });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="tabs">
                    <ul::E4 a:class="header">
                        <li::E5 a:class="tab "(1)>
                            #::T6 title #
                            <b::E7>
                                #::T8 A #
                            </b>
                        </li>
                        <li::E9 a:class="tab selected"(1)>
                            #::T10 title #
                            <b::E11>
                                #::T12 B #
                            </b>
                        </li>
                    </ul>
                    <div::E13 a:class="content">
                        <div::E16 a:class="heavy">
                            #::T17 heavy component 'cptB' #
                        </div>
                    </div>
                </div>
                //::C2 template anchor
            </body>
        `, '3');
        assert.equal(log, "+cptA+cptB" , "4");
    });

});
