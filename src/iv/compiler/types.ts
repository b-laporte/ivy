import { XjsPreProcessor } from '../../xjs/types';

export interface IvError {
    kind: "#Error";
    origin: "IVY" | "TS" | "XJS";
    message: string;        // formatted version
    description: string;
    line: number;
    column: number;
    lineExtract: string;
    file: string;
}

export interface CompilationOptions {
    templateName: string;
    filePath: string;                   // file name - used for error reporting
    body?: boolean;                     // if true, will output the template function body in the result
    statics?: boolean;                  // if true, the statics array will be in the result
    function?: boolean;                 // if true the js function will be in the result
    imports?: boolean;                  // if true the imports will be added as comment to the js function
    importMap?: { [key: string]: 1 };   // imports as a map to re-use the map from a previous compilation
    lineOffset?: number;                // shift error line count to report the line number of the file instead of the template
    columnOffset?: number;              // shift error column number on the first template line
    preProcessors?: { [name: string]: () => XjsPreProcessor };
}

export interface CompilationResult {
    body?: string;                      // template function body
    statics?: any[];                    // statics outside function body
    function?: string;                  // full result function as a string
    importMap?: { [key: string]: 1 },   // imports as a map
}
