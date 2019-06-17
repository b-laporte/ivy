import { loader } from "webpack";
import { compile } from "../compiler/compiler";

export default async function (this: loader.LoaderContext, source: string) {
    const callback = this.async()!;

    let result: string;
    try {
        result = await compile(source, this.resourcePath);
    } catch (e) {
        callback(new Error(e.message));
        return;
    }
    callback(null, result);
}