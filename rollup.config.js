import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    },
    {
      file: pkg.module,
      format: 'es'
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      // picomatch >= 2.3.2 no longer matches the plugin's default '*.ts+(|x)' include glob
      include: ['*.ts?(x)', '**/*.ts?(x)']
    })
  ]
}
