import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy'
import ivy from '../../../bin/rollup-plugin-ivy';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import { md } from '../../../bin/rollup-plugin-ivy-md';

const production = !process.env.ROLLUP_WATCH,
    config = [],
    names = [
        'range',
        'gsearch',
        'triangles',
        'dbmon',
        'innerHTML',
        'fragment1',
        'fragment2',
        'preprocessors'
    ];

for (let name of names) {
    // @@extract: config
    config.push({
        input: `src/doc/examples/${name}/${name}.ts`,
        output: {
            name: name,
            dir: `public/examples/${name}`,
            format: 'iife', // immediately-invoked function expression
            sourcemap: false
        },
        plugins: [
            postcss({
                extract: `public/examples/${name}/styles.css`,
                minimize: production
            }),
            ivy({
                preProcessors: { "@@md": md }
            }),
            typescript({
                clean: production,
                objectHashIgnoreUnknownHack: true,
                typescript: require('typescript'),
                tsconfig: "src/doc/examples/tsconfig.json"
            }),
            copy({
                targets: [{
                    // warning: those files are not watched!
                    src: [`src/doc/examples/${name}/index.html`],
                    dest: `public/examples/${name}`
                }]
            }),
            production && terser() // minify, but only in production
        ]
    });
    // @@extract: config-end
}

export default config;