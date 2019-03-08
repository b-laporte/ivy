import { CompilationResult } from './../compiler/compiler';
import { compile } from '../compiler/compiler';


export let body = {
    async template(tpl: string, log = false) {
        let r = await compile(tpl, { body: true });
        if (log) {
            console.log(`body: '${r.body}'`)
        }
        return r.body;
    }
}

export let statics = {
    async template(tpl: string, log = false) {
        let r = await compile(tpl, { statics: true });
        if (log) {
            console.log(`statics: '${r.statics}'`)
        }
        return r.statics;
    }
}

export let test = {
    async template(tpl: string, importMap?: { [key: string]: 1 }): Promise<CompilationResult> {
        let r = await compile(tpl, { body: true, statics: true, function: true, imports: true, importMap: importMap });

        return r;
    }
}
