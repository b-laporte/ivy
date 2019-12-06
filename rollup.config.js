import typescript from 'rollup-plugin-typescript2';

export default [{
    input: 'src/iv/rollup/rollup-plugin-xdf.ts',
    output: {
        file: 'bin/rollup-plugin-xdf.js',
        format: 'es'
    },
    external: [
        'rollup-pluginutils',
        'fs',
        'util',
        'path'
    ],
    plugins: [
        typescript({
            tsconfig: "tsconfig.rollup.json"
        })
    ]
}, {
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