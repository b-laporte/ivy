import { unsafeInnerHTML } from './../../iv/innerHTML';
import * as assert from 'assert';
import { logger, $template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify } from '../utils';

describe('@unsafeInnerHTML', () => {
    let body: ElementNode, defaultLog = logger.error, error = "";

    function logError(msg: string) {
        if (error) {
            error += "\n";
        }
        error += "            " + msg.replace(/\n/g, "\n            ");
    }

    beforeEach(() => {
        logger.error = logError;
        body = reset();
    });

    afterEach(() => {
        if (error) {
            console.log("Unchecked error:\n", error);
        }
        logger.error = defaultLog;
    });

    it("can be set on elements", function () {
        const tpl = $template`(tip:string) => {
            <div @unsafeInnerHTML={tip}/>
        }`;

        let t = getTemplate(tpl, body).render({ tip: " hi there " });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    #::T4 hi there #
                </div>
                //::C2 template anchor
            </body>
        `, '1');
    });
});
