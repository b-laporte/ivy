import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';

export default [{
    input: 'src/pre-processors/ts.ts',
    output: {
        file: 'bin/rollup-plugin-ivy-ts.js',
        format: 'es'
    },
    external: [
        'typescript',
        'fs',
        'path',
        'vscode-textmate'
    ],
    plugins: [
        json(),
        typescript({
            tsconfig: "tsconfig.rollup.json"
        })
    ]
}, {
    input: 'src/pre-processors/extract.ts',
    output: {
        file: 'bin/rollup-plugin-ivy-extract.js',
        format: 'es'
    },
    external: [
        'typescript',
        'fs',
        'path',
        'vscode-textmate'
    ],
    plugins: [
        json(),
        typescript({
            tsconfig: "tsconfig.rollup.json"
        })
    ]
}, {
    input: 'src/pre-processors/md.ts',
    output: {
        file: 'bin/rollup-plugin-ivy-md.js',
        format: 'es'
    },
    external: [
        'typescript',
        'marked'
    ],
    plugins: [
        json(),
        typescript({
            tsconfig: "tsconfig.rollup.json"
        })
    ]
},{
    input: 'src/iv/rollup/rollup-plugin-ivy.ts',
    output: {
        file: 'bin/rollup-plugin-ivy.js',
        format: 'es'
    },
    external: [
        'typescript',
        'vscode-textmate',
        'rollup-pluginutils',
        'fs',
    ],
    plugins: [
        typescript({
            tsconfig: "tsconfig.rollup.json"
        })
    ]
}];