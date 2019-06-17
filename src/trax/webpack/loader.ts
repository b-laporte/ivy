import { loader } from "webpack";
import { generate } from '../compiler/generator';

export default async function (this: loader.LoaderContext, source: string) {
    const callback = this.async()!;

    let result: string;
    try {
        result = generate(source, this.resourcePath);
    } catch (e) {
        callback(new Error(e.message));
        return;
    }
    callback(null, result);
}