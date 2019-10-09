import * as assert from 'assert';
import { template, logger, Controller } from '../../iv';
import { ElementNode, reset, getTemplate } from '../utils';
import { IvLogger } from '../../iv/types';

describe('Logger', () => {
    let body: ElementNode,
        defaultLogLog = logger.log,
        defaultLogError = logger.error,
        msg = "",
        error = "";

    function logMsg(m: string, ...optionalParams: any[]) {
        msg = m + " / " + optionalParams.join(" ");
    }

    function logError(msg: string) {
        error = "            " + msg.replace(/\n/g, "\n            ");
    }

    beforeEach(() => {
        msg = "";
        error = "";
        logger.log = logMsg;
        logger.error = logError;
        body = reset();
    });

    afterEach(() => {
        logger.log = defaultLogLog;
        logger.error = defaultLogError;
    });

    it("should be injectable in template controllers (log)", function () {
        @Controller class HelloCtl {
            name: string;
            $logger: IvLogger;

            $init() {
                this.$logger.log("ABC", 123, "DEF");
            }
        }
        const hello = template(`($:HelloCtl) => {
            # Hello {$.name} #
        }`);

        const test = template(`() => {
            <*hello/>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(error, "", "empty error");
        assert.equal(msg, "ABC / 123 DEF" , "1");
    });

    it("should be injectable in template controllers (error)", function () {
        @Controller class HelloCtl {
            name: string;
            $logger: IvLogger;

            $init() {
                this.$logger.error("Sample error from the $init function");
            }
        }
        const hello = template(`($:HelloCtl) => {
            # Hello {$.name} #
        }`);

        const test = template(`() => {
            <*hello/>
        }`);

        let t = getTemplate(test, body).render();
        assert.equal(msg, "", "empty msg");
        assert.equal(error, `\
            IVY: Sample error from the $init function
            >> Template: "hello" - File: "runtime/logger.spec.ts"
            >> Template: "test" - File: "runtime/logger.spec.ts"`
            , "1");
    });
});