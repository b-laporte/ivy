import { assert } from "./common";
import plugin from "../compiler/rollup-plugin-iv";

describe('Rollup plugin', () => {
    let transformCtxt = {
        warn: function (msg) { },
        error: function (msg) { }
    }

    it('should calculate iv path from ivPath with folder ', () => {
        let p = plugin({ runtime: "src/iv.ts" }); // get a processor

        p.options({ entry: "src/test/main.ts" });

        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/src/test/main.ts"), "../iv", "path 1");
        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/misc/foo/bar/baz.ts"), "../../../src/iv", "path 2"); 
        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/src/hello"), "./iv", "path 3");
        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/hello"), "./src/iv", "path 4");
    });

    it('should calculate iv path from ivPath with no folder ', () => {
        let p = plugin({ runtime: "iv.ts" }); // get a processor

        p.options({ entry: "src/test/main.ts" });

        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/src/test/main.ts"), "../../iv", "path 1");
        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/misc/foo/bar/baz.ts"), "../../../iv", "path 2"); 
        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/src/hello"), "../iv", "path 3");
        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/hello"), "./iv", "path 4");
    });

    it('should calculate iv path from entry and ivPath with no folder ', () => {
        let p = plugin({ runtime: "iv" }); // get a processor

        p.options({ entry: "main.ts" });

        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/main.ts"), "./iv", "path 1");
        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/misc/foo/bar/baz.ts"), "../../../iv", "path 2"); 
        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/src/hello"), "../iv", "path 3");
        assert.equal(p.getIvPath.call(transformCtxt, "/Users/blaporte/Dev/iv/hello"), "./iv", "path 4");
    });

    // todo: plugin cfg error, windows paths, etc...
});