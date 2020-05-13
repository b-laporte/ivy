import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy'
import ivy from '../../../bin/rollup-plugin-ivy';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';

const production = !process.env.ROLLUP_WATCH,
    config = [],
    names = [
        'range',
        'gsearch',
        'triangles',
        'dbmon',
        'innerHTML',
        'fragment1',
        'fragment2'
    ];

for (let name of names) {
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
            ivy(),
            typescript({
                clean: production,
                objectHashIgnoreUnknownHack: true,
                typescript: require('typescript'),
                tsconfig: "src/doc/examples/tsconfig.json"
            }),
            copy({
                targets: [{ src: [`src/doc/examples/${name}/index.html`], dest: `public/examples/${name}` }] // warning: those files are not watched!
            }),
            production && terser() // minify, but only in production
        ]
    });
}

export default config;