import { createFilter } from 'rollup-pluginutils';
import { promises } from 'fs';
import { dirname, join, relative } from 'path';
import { stringify } from '../../xdf/json';

const RX_EXPORT = /^\s*export\s+/,
    RX_XDF_EXTENSION = /\.xdf$/i,
    JSON_EXTENSION = ".json";

export default function xdf(opts: { include?: any; exclude?: any, trace?: boolean } = {}) {
    if (!opts.include) {
        opts.include = '**/*.xdf'
    }

    const filter = createFilter(opts.include, opts.exclude),
        trace = opts.trace === true;
    let fileQueue: string[] = []; // list of name, content - e.g. ["a/fileA.xdf", "content A", "b/fileB.xdf", "content B"];

    return {
        name: 'xdf',

        transform(this: any, code: string, id: string) {
            if (filter(id)) {
                let jsonString = stringify(code, { fileId: id });
                if (jsonString.match(RX_EXPORT)) {
                    // this file was generated as an ES export - so let's return its content (will be part of the bundle)
                    if (trace) {
                        console.log("[rollup-plugin-xdf] export xdf file: ", id);
                    }
                    return jsonString;
                } else {
                    // this file must be written separately on the disk
                    // id: e.g. Users/blaporte/Dev/iv/src/doc/samples.xdf
                    fileQueue.push(relative(__dirname, id.replace(RX_XDF_EXTENSION, JSON_EXTENSION)));
                    fileQueue.push(jsonString);
                    return ""; // return '' so that the file is considered as processed
                }
            }
            return null;
        },

        async generateBundle(opts: any) {
            if (fileQueue.length > 0) {
                // opts.file: e.g. "public/main.js"
                let dir = opts.dir;
                if (!dir) {
                    dir = dirname(opts.file);
                }
                let queue: Promise<any>[] = [];
                for (let i = 0; fileQueue.length > i; i += 2) {
                    queue.push(writeXdfFile(join(dir, fileQueue[i]), fileQueue[i + 1]));
                }
                fileQueue = [];
                await Promise.all(queue);
            }
        },
    };

    async function writeXdfFile(path: string, content: string) {
        let dir = dirname(path), fh: promises.FileHandle | null = null;
        try {
            // the plugin is launched from the project root - so dir simply needs to be relative
            await promises.mkdir(dir, { recursive: true });

            fh = await promises.open(path, 'w');
            await fh.truncate(0);
            await promises.writeFile(path, content);
        } finally {
            if (fh !== null) {
                // Close the file if still open
                await fh.close();
            }
        }
        if (trace) {
            console.log("[rollup-plugin-xdf] write complete:", path);
        }
    }
};
