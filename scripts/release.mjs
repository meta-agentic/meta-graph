// Lockstep release: set one version on the parent and the four packages (and their
// internal pins), commit and tag. Publishing is a separate, deliberate step.
// Usage: node scripts/release.mjs 0.2.0
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const version = process.argv[2]
if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version ?? '')) { console.error('usage: node scripts/release.mjs <semver>'); process.exit(2) }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const files = ['package.json', ...['model', 'react', 'query', 'meta-graph'].map((p) => `packages/${p}/package.json`)]
for (const f of files) {
  const full = path.join(root, f)
  const pkg = JSON.parse(fs.readFileSync(full, 'utf8'))
  pkg.version = version
  for (const d of Object.keys(pkg.dependencies ?? {})) if (d.startsWith('@meta-agentic/')) pkg.dependencies[d] = version
  fs.writeFileSync(full, JSON.stringify(pkg, null, 2) + '\n')
}
execSync('node scripts/check-deps.mjs', { cwd: root, stdio: 'inherit' })
execSync(`git add ${files.join(' ')}`, { cwd: root })
execSync(`git commit -q -m "release: v${version}"`, { cwd: root })
execSync(`git tag -a v${version} -m "meta-graph v${version}"`, { cwd: root })
console.log(`v${version}: committed and tagged; push with: git push origin main --follow-tags`)
