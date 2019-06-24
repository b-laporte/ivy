import * as assert from 'assert';
import { template, logViewNodes } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';

// Components with content
describe('Param Nodes', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    // const panel = template(`(type:string, $content) => {
    //     <div class={"panel" + (type? " "+type : "")}>
    //         <! @content/>
    //     </div>
    // }`);

    // it.only("should be supported to set normal attributes", function () {
    //     let tpl = template(`(message, panelType) => {
    //         // log
    //         <div class="main">
    //             <*panel>
    //                 <.type $value={panelType}/>
    //                 # Panel message: {message} #
    //             </>
    //         </div>
    //     }`);

    //     let t = getTemplate(tpl, body).refresh({ message: "Hello!", panelType: "important" });
    //     assert.equal(stringify(t), `
    //         <body::E1>
    //             <div::E3 a:class="main">

    //             </div>
    //             //::C2 template anchor
    //         </body>
    //     `, '1');
    // });

    /**
     * TODO
     * Param node for simple attribute ($value)
     * Simple param node with content only
     * Param node with attributes & content
     * List of param nodes
     * Tree of param nodes
     * Delete value of a param node (if statement)
     * $paramNodes // list of all param nodes
     */


});
