import { loader } from "webpack";
import { compile } from "../compiler/compiler";
import { generate } from '../../trax/trax/compiler/generator';

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

    // trax processing 
    try {
        result = generate(result, this.resourcePath);
    } catch (e) {
        callback(new Error(e.message));
        return;
    }

    callback(null, result);
}