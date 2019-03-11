import { CompilationResult } from '../compiler/generator';
import { compileTemplate } from '../compiler/generator';


export let body = {
    async template(tpl: string, log = false) {
        let r = await compileTemplate(tpl, { body: true });
        if (log) {
            console.log(`body: '${r.body}'`)
        }
        return r.body;
    }
}

export let statics = {
    async template(tpl: string, log = false) {
        let r = await compileTemplate(tpl, { statics: true });
        if (log) {
            console.log(`statics: '${r.statics}'`)
        }
        return r.statics;
    }
}

export let test = {
    async template(tpl: string, importMap?: { [key: string]: 1 }): Promise<CompilationResult> {
        let r = await compileTemplate(tpl, { body: true, statics: true, function: true, imports: true, importMap: importMap });

        return r;
    }
}
