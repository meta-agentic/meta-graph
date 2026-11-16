// The package as a consumer gets it: packed, installed into a clean folder, and imported
// by plain Node. 0.1.0 shipped raw JSX and failed exactly here; this keeps it from
// happening again.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const root = path.resolve(pkg, '..', '..')

test('the packed graph-react imports in plain Node, with React and the model resolved from the consumer', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'graph-react-pack-'))
  const tarball = execFileSync('npm', ['pack', '--silent', '--pack-destination', tmp], { cwd: pkg, encoding: 'utf8' }).trim().split('\n').pop()
  const listing = execFileSync('tar', ['-tzf', path.join(tmp, tarball)], { encoding: 'utf8' })
  assert.match(listing, /package\/dist\/index\.js/)
  const app = path.join(tmp, 'app')
  fs.mkdirSync(path.join(app, 'node_modules', '@meta-agentic'), { recursive: true })
  execFileSync('tar', ['-xzf', path.join(tmp, tarball), '-C', tmp])
  fs.renameSync(path.join(tmp, 'package'), path.join(app, 'node_modules', '@meta-agentic', 'graph-react'))
  // The consumer's own copies of the externals, taken from this repository's install.
  for (const dep of ['react', 'react-dom', 'd3-force', 'd3-dispatch', 'd3-quadtree', 'd3-timer', 'scheduler', 'loose-envify', 'js-tokens']) {
    const from = path.join(root, 'node_modules', dep)
    if (fs.existsSync(from)) fs.cpSync(from, path.join(app, 'node_modules', dep), { recursive: true, dereference: true })
  }
  fs.cpSync(path.join(root, 'packages', 'model'), path.join(app, 'node_modules', '@meta-agentic', 'graph-model'), { recursive: true })
  const out = execFileSync('node', ['--input-type=module', '-e',
    "import * as r from '@meta-agentic/graph-react'; console.log(Object.keys(r).sort().join(','))"], { cwd: app, encoding: 'utf8' })
  for (const name of ['GraphCanvas', 'GraphList', 'forceLayout', 'resolveStyle', 'validateModel']) assert.ok(out.includes(name), `${name} is exported`)
})
