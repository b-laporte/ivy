import iv from '../../../dist/rollup-plugin-iv.es';
import typescript2 from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';
import {minify} from 'uglify-es';
import gzip from "rollup-plugin-gzip";

export default {
  entry: 'src/samples/webcomponent/webcomponent.ts',
  format: 'es',
  plugins: [
    iv({ trace: false, runtime: 'src/iv' }),
    typescript2({
      tsconfig: "tsconfig-es6.json"
    }),
    uglify({}, minify),
    gzip()
  ],
  external: [],
  sourceMap: false,    // not supported by iv plugin
  dest: 'dist/webcomponent/webcomponent.js'
};
