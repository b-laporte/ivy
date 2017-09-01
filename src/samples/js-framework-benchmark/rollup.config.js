import iv from '../../../dist/rollup-plugin-iv.es';
import typescript2 from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';
import gzip from "rollup-plugin-gzip";

export default {
  entry: 'src/samples/js-framework-benchmark/jfb.ts',
  format: 'es',
  plugins: [iv({ trace: false, runtime: 'src/iv' }), typescript2(), uglify(), gzip()],
  external: [],
  sourceMap: false,    // not supported by iv plugin
  dest: 'dist/js-framework-benchmark/jfb.js'
};
