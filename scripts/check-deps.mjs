// The dependency rule of ADR-MOS-19, checked on every test run: the model depends on
// nothing, react and query depend on the model only, the aggregator on the three; all
// four carry the same version; and no source file imports across packages except
// through the package name (a relative path into a sibling package is a boundary leak).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkgs = ['model', 'react', 'query', 'meta-graph']
const ALLOWED = {
  '@meta-agentic/graph-model': [],
  '@meta-agentic/graph-react': ['@meta-agentic/graph-model'],
  '@meta-agentic/graph-query': ['@meta-agentic/graph-model'],
  '@meta-agentic/meta-graph': ['@meta-agentic/graph-model', '@meta-agentic/graph-react', '@meta-agentic/graph-query'],
}
const faults = []
const versions = new Set()
for (const p of pkgs) {
  const dir = path.join(root, 'packages', p)
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
  versions.add(pkg.version)
  const internal = Object.keys(pkg.dependencies ?? {}).filter((d) => d.startsWith('@meta-agentic/'))
  for (const d of internal) {
    if (!ALLOWED[pkg.name].includes(d)) faults.push(`${pkg.name} depends on ${d}, which the dependency rule forbids`)
    if (pkg.dependencies[d] !== pkg.version) faults.push(`${pkg.name} pins ${d}@${pkg.dependencies[d]} but the lockstep version is ${pkg.version}`)
  }
  if (pkg.name !== '@meta-agentic/graph-model' && pkg.name !== '@meta-agentic/meta-graph' && !internal.includes('@meta-agentic/graph-model')) {
    faults.push(`${pkg.name} must depend on @meta-agentic/graph-model`)
  }
  for (const f of walk(path.join(dir, 'src'))) {
    const text = fs.readFileSync(f, 'utf8')
    for (const m of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const spec = m[1]
      if (spec.startsWith('.') && path.resolve(path.dirname(f), spec).startsWith(path.join(root, 'packages')) && !path.resolve(path.dirname(f), spec).startsWith(dir)) {
        faults.push(`${path.relative(root, f)} imports ${spec}: a relative path into another package`)
      }
      if (spec.startsWith('@meta-agentic/') && !ALLOWED[pkg.name].includes(spec)) faults.push(`${path.relative(root, f)} imports ${spec}, which the dependency rule forbids`)
    }
  }
}
if (versions.size !== 1) faults.push(`the packages carry ${versions.size} versions (${[...versions].join(', ')}); the release train is lockstep`)
const parent = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
if (!versions.has(parent.version)) faults.push(`the parent is ${parent.version}, the packages ${[...versions].join(', ')}`)

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : /\.(m?js|jsx)$/.test(e.name) ? [path.join(dir, e.name)] : []))
}

if (faults.length) { console.error('dependency rule:\n  ' + faults.join('\n  ')); process.exit(1) }
console.log(`dependency rule holds across ${pkgs.length} packages at ${[...versions][0]}`)
