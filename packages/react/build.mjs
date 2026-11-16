// Compile the package to plain ESM JavaScript in dist/, so it loads in Node and in any
// bundler without a JSX transform. React, the model and d3-force stay external: they are
// the consumer's copies, not bundled ones. Runs on `npm pack` and `npm publish` (prepack).
import { build } from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pkg = path.dirname(fileURLToPath(import.meta.url))
fs.rmSync(path.join(pkg, 'dist'), { recursive: true, force: true })
await build({
  entryPoints: [path.join(pkg, 'src/index.js')],
  outfile: path.join(pkg, 'dist/index.js'),
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2020',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  external: ['react', 'react/jsx-runtime', 'react-dom', 'd3-force', '@meta-agentic/graph-model'],
  sourcemap: true,
  legalComments: 'none',
})
console.log('graph-react: dist/index.js built')
