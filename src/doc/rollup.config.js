import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy'
import ivy from '../../bin/rollup-plugin-ivy';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';

const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/doc/main.ts',
    output: {
        file: 'public/main.js',
        format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: false
    },
    plugins: [
        css({ // must be 1st to remove css imports - those files are watched
            output: 'public/styles.css'
        }),
        ivy(),
        typescript({
            clean: production,
            objectHashIgnoreUnknownHack: true,
            typescript: require('typescript'),
            tsconfig: "tsconfig.rollup.json"
        }),
        copy({
            targets: [{ src: ['src/doc/index.html'], dest: 'public' }] // warning: those files are not watched!
        }),
        production && terser() // minify, but only in production
    ]
};
