import { process } from "../compiler/compiler";
import { createFilter } from 'rollup-pluginutils';

export default function ivy(opts: { include?: any; exclude?: any } = {}) {
    if (!opts.include) {
        opts.include = '**/*.ts'
    }

    const filter = createFilter(opts.include, opts.exclude);

    return {
        name: 'ivy',
        async transform(this: any, code: string, id: string): Promise<any> {
            if (!filter(id)) return null;
            let result: string;

            try {
                result = await process(code, id);
            } catch (e) {
                this.error(e.message || e);
                return null;
            }

            return result;
        }
    };
}
