import * as assert from 'assert';
import { ζd, ζv, changeComplete } from '../../iv';

describe('Data', () => {
    it("should identify changes", function () {
        @ζd class ζParams {
            @ζv name1;
            @ζv name2;
        }

        let d = new ζParams();

        assert.equal(d["$changed"], false, "d unchanged after creation");
        d.name1 = "";
        assert.equal(d["$changed"], true, "change 1");
        d["$reset"]();
        assert.equal(d["$changed"], false, "reset 1");
        d.name2 = "abc";
        assert.equal(d["$changed"], true, "change 2");
    });

    it("should support main observer", async function () {
        @ζd class ζParams {
            @ζv name1;
            @ζv name2;
        }

        let changeCount = 0, changeParam: any, o = {
            notifyChange(d: any) {
                changeCount++;
                changeParam = d;
            }
        }

        let d = new ζParams();
        d["$observer"] = o;

        assert.equal(changeCount, 0, "no changes notified at init");
        assert.equal(d["$changed"], false, "d unchanged after creation");

        d.name1 = "N1";
        d.name2 = "N2";

        assert.equal(d["$changed"], true, "d changed");

        await changeComplete();
        assert.equal(changeCount, 1, "change notified");
        assert.equal(changeParam, d, "d passed as notification parameter");
        assert.equal(d["$changed"], false, "d back to unchanged");
    });

    it("should not notify when main observer is disconnected", async function () {
        @ζd class ζParams {
            @ζv name1;
            @ζv name2;
        }

        let changeCount = 0, changeParam: any, o = {
            notifyChange(d: any) {
                changeCount++;
                changeParam = d;
            }
        }

        let d = new ζParams();
        d["$observer"] = o;

        assert.equal(changeCount, 0, "no changes notified at init");
        assert.equal(d["$changed"], false, "d unchanged after creation");

        d["$observer"] = null;
        d.name1 = "N1";
        d.name2 = "N2";
        d["$observer"] = o;

        assert.equal(d["$changed"], true, "d changed");

        await changeComplete();
        assert.equal(changeCount, 0, "no changes notified");
        assert.equal(d["$changed"], true, "d still changed");
    });
});
