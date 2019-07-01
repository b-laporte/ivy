import { loader } from "webpack";
import { compile } from "../compiler/compiler";
import { generate } from '../../trax/trax/compiler/generator';

const RX_LOG_ALL = /\/\/\s*ivy?\:\s*log[\-\s]?all/,
    RX_LOG = /\/\/\s*ivy?\:\s*log/,
    SEPARATOR = "-----------------------------------------------------------------------------";

export default async function (this: loader.LoaderContext, source: string) {
    const callback = this.async()!;

    let result: string;
    // ivy processing
    try {
        result = await compile(source, this.resourcePath);
    } catch (e) {
        callback(new Error(e.message));
        return;
    }

    if (source.match(RX_LOG_ALL)) {
        console.log();
        console.log("Ivy: Intermediary Output");
        console.log(result);
    }

    // trax processing for ivy param classes
    try {
        result = generate(result, this.resourcePath, { symbols: { Data: "ζΔD", /* todo: ref, computed */ }, libPrefix: "ζ" });
    } catch (e) {
        callback(new Error(e.message));
        return;
    }

    if (source.match(RX_LOG)) {
        console.log();
        console.log("Ivy: Generated Code");
        console.log(result);
    }

    // trax processing for normal Data Objects
    try {
        result = generate(result, this.resourcePath);
    } catch (e) {
        callback(new Error(e.message));
        return;
    }
    callback(null, result);
}
