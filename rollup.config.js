import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import analyzer from 'rollup-plugin-analyzer'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'esm',
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    analyzer(),
  ],
}
