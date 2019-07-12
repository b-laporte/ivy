import { loader } from "webpack";
import { compile } from "../compiler/compiler";
import { generate } from '../../trax/trax/compiler/generator';
import { DataMember } from '../../trax/trax/compiler/types';

const RX_LOG_ALL = /\/\/\s*ivy?\:\s*log[\-\s]?all/,
    RX_LOG = /\/\/\s*ivy?\:\s*log/,
    RX_LIST = /List$/,
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
        result = generate(result, this.resourcePath, { symbols: { Data: "ζΔD", /* todo: ref, computed */ }, libPrefix: "ζ", validator: listValidator });
    } catch (e) {
        callback(new Error(e.message));
        return;
    }

    // trax processing for ivy template controller classes
    try {
        result = generate(result, this.resourcePath, { symbols: { Data: "Controller" }, acceptMethods:true, replaceDataDecorator:false, libPrefix: "ζ" });
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

function listValidator(m: DataMember) {
    if (m && m.type && m.type.kind === "array") {
        if (!m.name.match(RX_LIST)) {
            return "Array properties should use the List suffix, e.g. " + m.name + "List";
        }
    }
    return null;
}
