
import { compile } from "./compiler";

export default function (options: { trace: boolean }) {
    return {
        transform: function (source, id) {
            // id corresponds to the file path
            let cc = compile(source, id); // return the new source
            let output = cc.getOutput();

            // todo manage errors
            if (options && options.trace) {
                console.log(output);
            }
            return output;
        }
    }
}
