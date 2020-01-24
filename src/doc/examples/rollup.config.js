import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy'
import ivy from '../../../bin/rollup-plugin-ivy';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';

const production = !process.env.ROLLUP_WATCH,
    config = [],
    names = [
        'hello',
        'clock',
        'expressions',
        'subtemplates',
        'loops',
        'events',
        'section',
        'trax1',
        'trax2',
        'menu1',
        'menu2',
        'controller1',
        'controller2',
        'photos',
        'tabs',
        'labels1',
        'labels2',
        'labels3'
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
            css({ // must be 1st to remove css imports - those files are watched
                output: `public/examples/${name}/styles.css`
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