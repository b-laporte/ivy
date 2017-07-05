
import typescript2 from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

export default {
  entry: 'src/compiler/rollup-plugin-iv.ts',
  plugins: [typescript2()],
  external: ['typescript'],
  targets: [{
    format: 'cjs',
    dest: pkg.main
  }, {
    format: 'es',
    dest: pkg.module
  }]
};
