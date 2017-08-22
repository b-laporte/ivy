import iv from '../../../dist/rollup-plugin-iv.es';
import typescript2 from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';
import gzip from "rollup-plugin-gzip";

export default {
  entry: 'src/samples/triangle/triangle.ts',
  format: 'es',
  plugins: [iv({ trace: false }), typescript2(), uglify(), gzip()],
  external: [],
  sourceMap: false,    // not supported by iv plugin
  dest: 'dist/triangle/triangle.js'
};
