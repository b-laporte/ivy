
import iv from './dist/rollup-plugin-iv.es';
import typescript2 from 'rollup-plugin-typescript2';

export default {
  entry: 'src/test/main.ts',
  format: 'cjs',
  plugins: [iv({ trace: false }), typescript2()],
  external: ['mocha','typescript'],
  sourceMap: false,    // not supported by iv plugin
  dest: 'dist/test.js' // equivalent to --output
};
