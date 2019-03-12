import * as assert from 'assert';
import { template } from '../iv';

describe('Runtime', () => {
    it("should test something", function () {

        let foo = template(`() => {
            <div>
                # Hello World #
            </div>
        }`)

        assert.equal(12, 12, "12");
    });
});
