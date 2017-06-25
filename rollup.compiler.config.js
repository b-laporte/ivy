
import typescript2 from 'rollup-plugin-typescript2';

export default {
  entry: 'src/compiler/rollup-plugin-iv.ts',
  format: 'es',
  plugins: [typescript2()],
  dest: 'dist/rollup-plugin-iv.js'
};
