import { createFilter } from 'rollup-pluginutils';
import { generate } from '../compiler/generator';

export default function ivy(opts: { include?: any; exclude?: any;} = {}) {
    if (!opts.include) {
        opts.include = '**/*.ts'
    }

    const filter = createFilter(opts.include, opts.exclude);

    return {
        name: 'trax',
        async transform(this: any, code: string, fileId: string): Promise<any> {
            if (!filter(fileId)) return null;
            let result: string;

            try {
                result = generate(code, fileId);
            } catch (e) {
                this.error(e.message || e);
                return null;
            }

            return result;
        }
    };
}
