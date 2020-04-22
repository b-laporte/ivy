import { PreProcessorFactories } from '../compiler/types';
import { process } from "../compiler/compiler";
import { createFilter } from 'rollup-pluginutils';

export default function ivy(opts: { include?: any; exclude?: any; preProcessors?: PreProcessorFactories } = {}) {
    if (!opts.include) {
        opts.include = '**/*.ts'
    }

    const filter = createFilter(opts.include, opts.exclude),
        preProcessors = opts.preProcessors

    return {
        name: 'ivy',
        async transform(this: any, code: string, fileId: string): Promise<any> {
            if (!filter(fileId)) return null;
            let result: string;

            try {
                result = await process(code, { filePath: fileId, preProcessors: preProcessors });
            } catch (e) {
                this.error(e.message || e);
                return null;
            }

            return result;
        }
    };
}
