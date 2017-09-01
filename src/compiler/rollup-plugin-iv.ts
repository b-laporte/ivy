import { compile } from "./compiler";

interface TransformCtxt {
    warn: (msg: string) => void;
    error: (msg: string) => void;
}

const RX_FILE = /[\/\\]?[^\/\\]*$/, RX_EXTENSION = /\.\w*$/, RX_FOLDER_SEPARATOR = /[\/\\]/, RX_TS_FILE= /\.ts$/i;

export default function (pluginOptions?: { trace?: boolean, runtime?: string }) {
    let entryFilePath = "",     // e.g. "src/test/main.ts" on MacOS
        cfgFolderPath = "",     // e.g. "/Users/blaporte/Dev/iv/" on MacOS
        ivPath = "",            // e.g. "src/foo/iv.ts" or "src/foo/iv"
        ivFolderPath = "",      // e.g. "src/foo"
        ivFileName = "",        // e.g. "iv"
        logOutput = false,
        initialized = false;

    if (pluginOptions) {
        logOutput = pluginOptions.trace || false;
        ivPath = pluginOptions.runtime || "";
    }

    let processor = {
        options: function (rollupCfg) {
            // retrieve rollupCfg.entry to determine the relative path to the iv runtime file - cf. getIvPath()
            entryFilePath = rollupCfg.entry; // e.g. "src/test/main.ts" on MacOS
        },

        transform: function (this: TransformCtxt, source, filePath) {
            // id corresponds to the file path
            // e.g "/Users/blaporte/Dev/iv/src/test/main.ts" on MacOS
            // note: the options() method will always be called before transform()

            if (filePath.match(RX_TS_FILE)) {
                let cc = compile(source, filePath, processor.getIvPath.call(this, filePath)); // return the new source
                let output = cc.getOutput();
    
                // todo manage errors
                if (logOutput) {
                    console.log(output);
                }
                return output;
            }
            return source;
        },

        getIvPath: function (this: TransformCtxt, filePath) {
            let fl = filePath.length;
            if (!initialized) {
                // we expect first call to correspond to the entry file
                let efl = entryFilePath.length;
                if (entryFilePath === "") {
                    this.error("[iv] Missing entry file path in rollup configuration");
                    return "";
                }
                if (fl < efl || filePath.substring(fl - efl) !== entryFilePath) {
                    this.error("[iv] Entry file must be the first file to process");
                    return "";
                }
                if (ivPath === "") {
                    this.error("[iv] Missing iv runtime path in plugin configuration");
                    return "";
                }
                ivFolderPath = ivPath.replace(RX_FILE, "");
                ivFileName = (ivFolderPath!==""? ivPath.substring(ivFolderPath.length + 1) : ivPath).replace(RX_EXTENSION, "");
                cfgFolderPath = filePath.substring(0, fl - efl);

                initialized = true;
            }
            if (fl < cfgFolderPath.length) {
                this.error("[iv] Invalid file path: " + filePath);
                return "";
            }
            let fileFolder = filePath.substring(cfgFolderPath.length).replace(RX_FILE, ""),
                ivFolder = ivFolderPath,
                buf: string[] = [];

            // remove common parts betwen fileFolder and ivFolder
            let fif: string[] = fileFolder === "" ? [] : fileFolder.split(RX_FOLDER_SEPARATOR),
                ivf: string[] = ivFolder === "" ? [] : ivFolder.split(RX_FOLDER_SEPARATOR);

            while (fif.length && ivf.length && fif[0] === ivf[0]) {
                fif.shift();
                ivf.shift();
            }

            // todo: support windows !
            for (let i = 0; fif.length > i; i++) {
                buf.push("..");
            }
            return (buf.length ? buf.join("/") + "/" : "./")
                + (ivf.length ? (ivf.join("/") + "/") : "")
                + ivFileName;
        }
    };
    return processor;
}
