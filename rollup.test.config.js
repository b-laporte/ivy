
import iv from './dist/rollup-plugin-iv';
import typescript2 from 'rollup-plugin-typescript2';

export default {
  entry: 'src/test/main.ts',
  format: 'cjs',
  plugins: [typescript2()],
  external: ['mocha','typescript'],
  sourceMap: true,
  dest: 'dist/test.js' // equivalent to --output
};
