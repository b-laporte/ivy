import typescript from 'rollup-plugin-typescript2';

export default [
// {
//     input: 'src/xtr/extract.ts',
//     output: {
//         file: 'bin/rollup-plugin-ivy-extract.js',
//         format: 'es'
//     },
//     external: [
//         'typescript',
//         'fs',
//         'path',
//         'vscode-textmate'
//     ],
//     plugins: [
//         typescript({
//             tsconfig: "tsconfig.rollup.json"
//         })
//     ]
// },
{
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